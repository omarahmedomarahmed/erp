"use client";
import { useMemo, useState, type ComponentType } from "react";
import { CheckCircle2, Download, Lock } from "lucide-react";
import { useT } from "@/components/I18n";
import {
  Badge, Button, ControlPanel, DataTable, DateText, Fields, GuardButton, KpiRow, LockedNote, Money, Panel, Sheet, StatusBar, Timeline,
  money, useFilter, type Column,
} from "@/components/ui";
import {
  TODAY, accountById, employeeById, employeeOfPersona, employees, journalById, payrollLinesOf, payrollRates, payrollRuns,
} from "@/data/seed";
import type { PayrollLine } from "@/data/types";
import { dict as M34 } from "@/content/dict/m34";
import { STAGES, useOctRun } from "./store";

const OCT = "PR-2026-10";
const SEP = "PR-2026-09";
const r3 = (n: number) => Math.round(n * 1000) / 1000;
const deductions = (l: PayrollLine) => r3(l.ssEmployee + l.solidarity + l.incomeTax + l.stamp + l.advanceDeduction);
const BANKS = ["b1", "b2", "b3", "b4"] as const;
const bankOf = (empId: string) => BANKS[Number(empId.slice(4)) % BANKS.length];
const ibanOf = (empId: string) => {
  const n = Number(empId.slice(4));
  return `LY${String(10 + ((n * 37) % 89)).padStart(2, "0")} 00${BANKS.indexOf(bankOf(empId)) + 1} ${String(100000 + n * 7919).slice(-6)} ${String(4000 + n * 131).padStart(4, "0").slice(-4)}`;
};

function useNames() {
  const { pick } = useT();
  return {
    emp: (id: string) => { const e = employeeById[id]; return e ? pick(e.nameAr, e.nameEn) : id; },
    persona: (pid?: string) => { const e = pid ? employeeOfPersona(pid) : undefined; return e ? pick(e.nameAr, e.nameEn) : "—"; },
  };
}

/** Run status for display: the October run follows the shared demo store. */
function useRunStatus(runId: string): "draft" | "approved" | "locked" {
  const oct = useOctRun();
  if (runId === OCT) return oct.locked ? "locked" : oct.step >= 5 ? "approved" : "draft";
  return payrollRuns.find((r) => r.id === runId)!.status;
}
const STATUS_TONE = { draft: "warn", approved: "info", locked: "ok" } as const;

function RatesNote() {
  const { t, pick } = useT();
  return (
    <div className="flex flex-wrap items-center gap-2 bg-warn-soft px-4 py-1.5 text-[12px] text-warn">
      <Badge tone="warn">{t("m34.illustrative")}</Badge><span>{pick(payrollRates.noteAr, payrollRates.noteEn)}</span>
    </div>
  );
}

/* ---------- s1: October payroll run ---------- */
function PayrollRun() {
  const { t, lang } = useT();
  const n = useNames();
  const run = useOctRun();
  const lines = payrollLinesOf(OCT);
  const sep = useMemo(() => Object.fromEntries(payrollLinesOf(SEP).map((l) => [l.employeeId, l])), []);
  const tot = payrollRuns.find((r) => r.id === OCT)!.totals;
  const fields = useMemo(() => (l: PayrollLine) => { const e = employeeById[l.employeeId]; return `${e.id} ${e.nameAr} ${e.nameEn}`; }, []);
  const { rows, setQ } = useFilter(lines, fields);
  const flagged = lines.filter((l) => sep[l.employeeId] && Math.abs(l.net - sep[l.employeeId].net) / sep[l.employeeId].net > 0.05).length;

  // who does the next step
  const ACTOR: Record<string, string> = { review: "hr", maker: "hr", checker: "accountant", cfo: "cfo", lock: "cfo" };
  const done = (i: number) => run.step > i;
  const history = [
    { at: "2026-10-28", who: n.persona("hr"), text: t("m34.tl.calc", { n: tot.headcount }) },
    ...STAGES.slice(1).flatMap((s, k) => (done(k + 1) ? [{ at: TODAY, who: n.persona(ACTOR[s]), text: t(`m34.tl.${s}`), tone: s === "lock" ? ("ok" as const) : undefined }] : [])),
  ].reverse();

  const cols: Column<PayrollLine & { id: string }>[] = [
    { key: "emp", label: t("m34.col.employee"), render: (l) => <span className="font-bold text-navy">{n.emp(l.employeeId)}</span> },
    { key: "gross", label: t("m34.col.gross"), align: "end", render: (l) => <Money value={l.gross} /> },
    { key: "ss", label: t("m34.col.ss"), align: "end", render: (l) => <Money value={l.ssEmployee} /> },
    { key: "tax", label: t("m34.col.tax"), align: "end", render: (l) => <Money value={l.incomeTax} /> },
    { key: "other", label: t("m34.col.otherDed"), align: "end", render: (l) => <Money value={r3(l.solidarity + l.stamp + l.advanceDeduction)} /> },
    { key: "net", label: t("m34.col.net"), align: "end", render: (l) => <Money value={l.net} strong /> },
    { key: "var", label: t("m34.col.vsSep"), align: "end", render: (l) => {
      const p = sep[l.employeeId];
      if (!p) return "—";
      const d = r3(l.net - p.net);
      const big = Math.abs(d) / p.net > 0.05;
      return <span className={`num ${big ? "font-bold text-warn" : "text-muted"}`}>{d > 0 ? "+" : ""}{d.toFixed(3)}</span>;
    } },
  ];
  return (
    <div>
      <RatesNote />
      <Sheet
        title={t("m34.run.title")}
        subtitle={`${OCT} · ${t("m34.run.month")}`}
        status={<StatusBar stages={STAGES.map((s) => ({ id: s, label: t(`m34.stage.${s}`) }))} current={run.current} />}
        actions={<>
          {!run.locked ? (
            <Button variant="primary" onClick={run.advance}>
              {run.current === "lock" ? <Lock size={14} aria-hidden /> : <CheckCircle2 size={14} aria-hidden />}
              {t(`m34.act.${run.current}`, { name: n.persona(ACTOR[run.current]) })}
            </Button>
          ) : <Badge tone="ok"><Lock size={11} aria-hidden />{t("m34.run.locked")}</Badge>}
          {run.current === "checker" && !run.locked && <GuardButton tryLabel={t("m34.guard.approveOwn.try")} blockedText={t("m34.guard.approveOwn.blocked")} />}
        </>}
        side={<Timeline title={t("common.activity")} items={history} />}
      >
        <Fields items={[
          { label: t("m34.f.preparedBy"), value: n.persona("hr") },
          { label: t("m34.f.checkedBy"), value: done(3) ? n.persona("accountant") : <span className="text-muted">{t("m34.f.waiting")}</span> },
          { label: t("m34.f.approvedBy"), value: done(4) ? n.persona("cfo") : <span className="text-muted">{t("m34.f.waiting")}</span> },
          { label: t("m34.f.lockedAt"), value: run.locked ? <DateText value={TODAY} /> : <span className="text-muted">—</span> },
          { label: t("m34.f.fund"), value: <Badge tone="brand">{t("fund.SHF")}</Badge> },
          { label: t("sharia.label"), value: <Badge tone="ok">{t("sharia.compliant")}</Badge> },
        ]} />
        {run.locked && <div className="mt-3"><LockedNote text={t("m34.run.lockedNote")} /></div>}
      </Sheet>
      <KpiRow items={[
        { label: t("m34.kpi.gross"), value: money(tot.gross, lang), hint: t("m34.kpi.headcount", { n: tot.headcount }) },
        { label: t("m34.kpi.deductions"), value: money(r3(tot.ssEmployee + tot.solidarity + tot.incomeTax + tot.stamp + tot.advances), lang) },
        { label: t("m34.kpi.net"), value: money(tot.net, lang), tone: "ok" },
        { label: t("m34.kpi.employerSs"), value: money(tot.ssEmployer, lang), hint: t("m34.kpi.employerSsHint") },
      ]} />
      <ControlPanel title={t("m34.run.lines")} onSearch={setQ}
        actions={flagged ? <Badge tone="warn">{t("m34.run.flagged", { n: flagged })}</Badge> : null} />
      <DataTable columns={cols} rows={rows.map((l) => ({ ...l, id: l.employeeId }))}
        footer={<tr>
          <td className="px-3 py-2">{t("common.total")}</td>
          <td className="px-3 py-2 text-end"><Money value={tot.gross} /></td>
          <td className="px-3 py-2 text-end"><Money value={tot.ssEmployee} /></td>
          <td className="px-3 py-2 text-end"><Money value={tot.incomeTax} /></td>
          <td className="px-3 py-2 text-end"><Money value={r3(tot.solidarity + tot.stamp + tot.advances)} /></td>
          <td className="px-3 py-2 text-end"><Money value={tot.net} strong /></td>
          <td />
        </tr>} />
    </div>
  );
}

/* ---------- s2: bilingual payslip ---------- */
function Payslip() {
  const { t, lang, pick } = useT();
  const other = lang === "ar" ? "en" : "ar";
  const alt = (key: string) => M34[key]?.[other] ?? "";
  const [emp, setEmp] = useState("EMP-014");
  const [runId, setRunId] = useState(OCT);
  const status = useRunStatus(runId);
  const l = payrollLinesOf(runId).find((x) => x.employeeId === emp)!;
  const e = employeeById[emp];
  const run = payrollRuns.find((r) => r.id === runId)!;
  const row = (key: string, value: number, opts?: { strong?: boolean; neg?: boolean }) => (
    <tr key={key} className={`border-b border-line/60 ${opts?.strong ? "bg-canvas font-bold" : ""}`}>
      <td className="px-3 py-1.5">{t(key)}</td>
      <td className="px-3 py-1.5 text-end num">{opts?.neg && value ? "−" : ""}{money(value, lang)}</td>
      <td className="px-3 py-1.5 text-end text-[12px] text-muted" dir={other === "ar" ? "rtl" : "ltr"}>{alt(key)}</td>
    </tr>
  );
  const totalDed = deductions(l);
  return (
    <div>
      <ControlPanel title={t("m34.s2.title")}
        actions={<>
          <select value={emp} onChange={(x) => setEmp(x.target.value)} aria-label={t("m34.col.employee")}
            className="max-w-[220px] rounded-md border border-line bg-canvas px-2 py-1 text-[13px]">
            {employees.map((x) => <option key={x.id} value={x.id}>{`${x.id} · ${pick(x.nameAr, x.nameEn)}`}</option>)}
          </select>
          <select value={runId} onChange={(x) => setRunId(x.target.value)} aria-label={t("m34.f.month")}
            className="rounded-md border border-line bg-canvas px-2 py-1 text-[13px] num">
            {payrollRuns.map((r) => <option key={r.id} value={r.id}>{r.month}</option>)}
          </select>
          <Button onClick={() => window.print()}>{t("m34.slip.pdf")}</Button>
        </>} />
      <RatesNote />
      <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <article className="min-w-0 rounded-lg border border-line bg-surface shadow-sm">
          <header className="flex flex-wrap items-start gap-3 border-b-2 border-brand px-4 py-3">
            <img src="/brand/logo.png" alt="" className="h-8 w-auto rounded bg-navy p-1" />
            <div>
              <div className="font-extrabold text-navy">{t("app.company")}</div>
              <div className="text-[12px] text-muted">{t("m34.slip.title")} · <span dir={other === "ar" ? "rtl" : "ltr"}>{alt("m34.slip.title")}</span></div>
            </div>
            <div className="ms-auto text-end text-[12px]">
              <div className="num font-bold">{run.month}</div>
              <Badge tone={STATUS_TONE[status]}>{t(`m34.runStatus.${status}`)}</Badge>
            </div>
          </header>
          <div className="px-4 py-3">
            <Fields items={[
              { label: t("m34.col.employee"), value: `${pick(e.nameAr, e.nameEn)} · ${e.id}` },
              { label: t("m34.slip.position"), value: pick(e.positionAr, e.positionEn) },
              { label: t("m34.slip.grade"), value: e.grade },
              { label: t("m34.slip.account"), value: <span className="num" dir="ltr">{ibanOf(e.id)}</span> },
            ]} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[13px]">
              <thead><tr className="border-y border-line bg-canvas text-muted">
                <th className="px-3 py-1.5 text-start">{t("m34.slip.earnings")}</th><th className="px-3 py-1.5 text-end">{t("common.amount")}</th>
                <th className="px-3 py-1.5 text-end" dir={other === "ar" ? "rtl" : "ltr"}>{alt("m34.slip.earnings")}</th>
              </tr></thead>
              <tbody>
                {row("m34.slip.basic", l.basic)}
                {row("m34.slip.housing", l.housing)}
                {row("m34.slip.transport", l.transport)}
                {row("m34.slip.family", l.family)}
                {row("m34.slip.overtime", l.overtime)}
                {row("m34.slip.gross", l.gross, { strong: true })}
              </tbody>
              <thead><tr className="border-y border-line bg-canvas text-muted">
                <th className="px-3 py-1.5 text-start">{t("m34.slip.deductions")}</th><th />
                <th className="px-3 py-1.5 text-end" dir={other === "ar" ? "rtl" : "ltr"}>{alt("m34.slip.deductions")}</th>
              </tr></thead>
              <tbody>
                {row("m34.slip.ss", l.ssEmployee, { neg: true })}
                {row("m34.slip.solidarity", l.solidarity, { neg: true })}
                {row("m34.slip.tax", l.incomeTax, { neg: true })}
                {row("m34.slip.stamp", l.stamp, { neg: true })}
                {row("m34.slip.advance", l.advanceDeduction, { neg: true })}
                {row("m34.slip.totalDed", totalDed, { strong: true, neg: true })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-brand bg-soft text-[15px] font-extrabold text-navy">
                  <td className="px-3 py-2">{t("m34.slip.net")}</td>
                  <td className="px-3 py-2 text-end num">{money(l.net, lang)}</td>
                  <td className="px-3 py-2 text-end text-[12px]" dir={other === "ar" ? "rtl" : "ltr"}>{alt("m34.slip.net")}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <p className="px-4 py-2 text-[11px] text-muted">{t("m34.slip.employerNote", { amount: money(l.ssEmployer, lang) })}</p>
        </article>
        <aside className="grid content-start gap-3">
          <Panel title={t("m34.slip.rates")}>
            <Fields cols={1} items={[
              { label: t("m34.slip.ss"), value: <span className="num">{payrollRates.ssEmployeePct}%</span> },
              { label: t("m34.slip.ssEmployer"), value: <span className="num">{payrollRates.ssEmployerPct}%</span> },
              { label: t("m34.slip.solidarity"), value: <span className="num">{payrollRates.solidarityPct}%</span> },
              { label: t("m34.slip.stamp"), value: <span className="num">{payrollRates.stampPct}%</span> },
              { label: t("m34.slip.tax"), value: <span className="num">{payrollRates.taxBands.map((b) => `${b.pct}%`).join(" / ")}</span> },
              { label: t("m34.slip.exemption"), value: <Money value={payrollRates.taxMonthlyExemption} /> },
            ]} />
            <p className="mt-2 text-[11px] text-warn">{t("m34.illustrativeLong")}</p>
          </Panel>
          <Panel title={t("m34.slip.privacy")}><p className="text-[12px] text-muted">{t("m34.slip.privacyText")}</p></Panel>
        </aside>
      </div>
    </div>
  );
}

/* ---------- s3: payroll journal (SHF only) ---------- */
type JLine = { id: string; accountId: string; debit: number; credit: number };
function PayrollJournal() {
  const { t, pick } = useT();
  const [runId, setRunId] = useState(OCT);
  const status = useRunStatus(runId);
  const run = payrollRuns.find((r) => r.id === runId)!;
  const posted = run.journalId ? journalById[run.journalId] : undefined;
  const tt = run.totals;
  const preview: [string, number, number][] = [
    ["SHF-5200", tt.gross, 0], ["SHF-5210", tt.ssEmployer, 0], ["SHF-2130", 0, r3(tt.ssEmployee + tt.ssEmployer)], ["SHF-2140", 0, tt.incomeTax],
    ["SHF-2150", 0, r3(tt.stamp + tt.solidarity)], ["SHF-1140", 0, tt.advances], ["SHF-1110", 0, tt.net],
  ];
  const lines: JLine[] = (posted ? posted.lines.map((l) => [l.accountId, l.debit, l.credit] as [string, number, number]) : preview)
    .filter(([, d, c]) => d || c).map(([a, d, c], i) => ({ id: `${i}`, accountId: a, debit: d, credit: c }));
  const dr = r3(lines.reduce((s, l) => s + l.debit, 0));
  const cr = r3(lines.reduce((s, l) => s + l.credit, 0));
  const isPosted = status === "locked" || !!posted;
  const jId = posted?.id ?? (isPosted ? `JV-${run.month}-PAY` : t("m34.j.preview"));
  return (
    <div>
      <ControlPanel title={t("m34.s3.title")}
        actions={<select value={runId} onChange={(x) => setRunId(x.target.value)} aria-label={t("m34.f.month")}
          className="rounded-md border border-line bg-canvas px-2 py-1 text-[13px] num">
          {payrollRuns.map((r) => <option key={r.id} value={r.id}>{r.month}</option>)}
        </select>} />
      <Sheet
        title={posted ? pick(posted.memoAr, posted.memoEn) : t("m34.j.memo", { month: run.month })}
        subtitle={<span className="num">{jId} · {posted?.date ?? `${run.month}-27`}</span>}
        status={<Badge tone={isPosted ? "ok" : "warn"}>{t(isPosted ? "m34.j.posted" : "m34.j.draft")}</Badge>}
        actions={<GuardButton tryLabel={t("m34.guard.ptf.try")} blockedText={t("m34.guard.ptf.blocked")} />}
        side={<Panel title={t("m34.j.checks")}>
          <ul className="grid gap-2 text-[12px]">
            {(["onlyShf", "balanced", "byCostCentre", "noInterest"] as const).map((k) => (
              <li key={k} className="flex items-start gap-2"><CheckCircle2 size={14} className="mt-0.5 shrink-0 text-ok" aria-hidden />{t(`m34.j.check.${k}`)}</li>
            ))}
          </ul>
        </Panel>}
      >
        <DataTable<JLine>
          columns={[
            { key: "acc", label: t("m34.j.account"), render: (l) => { const a = accountById[l.accountId]; return <span><span className="num text-muted">{l.accountId}</span> {a ? pick(a.nameAr, a.nameEn) : ""}</span>; } },
            { key: "fund", label: t("m34.f.fund"), render: () => <Badge tone="brand">{t("fund.SHF")}</Badge> },
            { key: "dr", label: t("m34.j.debit"), align: "end", render: (l) => (l.debit ? <Money value={l.debit} /> : "") },
            { key: "cr", label: t("m34.j.credit"), align: "end", render: (l) => (l.credit ? <Money value={l.credit} /> : "") },
          ]}
          rows={lines}
          footer={<tr><td className="px-3 py-2">{t("common.total")}</td><td />
            <td className="px-3 py-2 text-end"><Money value={dr} /></td><td className="px-3 py-2 text-end"><Money value={cr} /></td></tr>} />
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge tone={dr === cr ? "ok" : "danger"}>{t(dr === cr ? "m34.j.isBalanced" : "m34.j.notBalanced")}</Badge>
          <Badge tone="ok">{t("m34.j.noPtf")}</Badge>
          <Badge tone="ok">{t("sharia.label")}: {t("sharia.compliant")}</Badge>
        </div>
        <div className="mt-3">
          {isPosted ? <LockedNote text={t("common.locked")} /> : <p className="text-[12px] text-muted">{t("m34.j.draftNote")}</p>}
        </div>
      </Sheet>
    </div>
  );
}

/* ---------- s4: bank transfer file ---------- */
function BankFile() {
  const { t, lang } = useT();
  const n = useNames();
  const run = useOctRun();
  const [sent, setSent] = useState(false);
  const lines = payrollLinesOf(OCT).filter((l) => l.net > 0);
  const byBank = BANKS.map((b) => {
    const ls = lines.filter((l) => bankOf(l.employeeId) === b);
    return { id: b, count: ls.length, total: r3(ls.reduce((s, l) => s + l.net, 0)) };
  });
  const total = r3(lines.reduce((s, l) => s + l.net, 0));
  const ref = (id: string) => `SAL-2026-10-${id.slice(4)}`;
  const csv = [
    [t("m34.bank.col.ref"), t("m34.bank.col.account"), t("m34.bank.col.name"), t("m34.bank.col.amount")].join(","),
    ...lines.slice(0, 8).map((l) => [ref(l.employeeId), ibanOf(l.employeeId).replace(/ /g, ""), n.emp(l.employeeId), l.net.toFixed(3)].join(",")),
    "…",
  ].join("\n");
  return (
    <div>
      <ControlPanel title={t("m34.s4.title")}
        actions={run.locked
          ? <Button variant="primary" onClick={() => setSent(true)} disabled={sent}><Download size={14} aria-hidden />{t(sent ? "m34.bank.sent" : "m34.bank.download")}</Button>
          : <Badge tone="warn">{t("m34.bank.waitLock")}</Badge>} />
      <KpiRow items={[
        { label: t("m34.bank.kpi.transfers"), value: <span className="num">{lines.length}</span> },
        { label: t("m34.bank.kpi.total"), value: money(total, lang), tone: "ok" },
        { label: t("m34.bank.kpi.banks"), value: <span className="num">{BANKS.length}</span> },
        { label: t("common.status"), value: t(sent ? "m34.bank.st.sent" : run.locked ? "m34.bank.st.ready" : "m34.bank.st.waiting"), tone: sent ? "ok" : undefined },
      ]} />
      <div className="grid gap-4 px-4 pb-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 rounded-lg border border-line">
          <DataTable<PayrollLine & { id: string }>
            columns={[
              { key: "ref", label: t("m34.bank.col.ref"), render: (l) => <span className="num text-muted">{ref(l.employeeId)}</span> },
              { key: "name", label: t("m34.bank.col.name"), render: (l) => n.emp(l.employeeId) },
              { key: "bank", label: t("m34.bank.col.bank"), render: (l) => t(`m34.bank.${bankOf(l.employeeId)}`) },
              { key: "acc", label: t("m34.bank.col.account"), render: (l) => <span className="num" dir="ltr">{ibanOf(l.employeeId)}</span> },
              { key: "amt", label: t("m34.bank.col.amount"), align: "end", render: (l) => <Money value={l.net} /> },
            ]}
            rows={lines.map((l) => ({ ...l, id: l.employeeId }))}
            footer={<tr><td className="px-3 py-2" colSpan={4}>{t("common.total")}</td><td className="px-3 py-2 text-end"><Money value={total} strong /></td></tr>} />
        </div>
        <aside className="grid content-start gap-3">
          <Panel title={t("m34.bank.byBank")}>
            <ul className="grid gap-1.5 text-[12px]">
              {byBank.map((b) => (
                <li key={b.id} className="flex items-center gap-2"><span>{t(`m34.bank.${b.id}`)}</span><Badge>{b.count}</Badge><span className="ms-auto"><Money value={b.total} /></span></li>
              ))}
            </ul>
          </Panel>
          <Panel title={t("m34.bank.preview")}>
            <pre dir="ltr" className="overflow-x-auto rounded bg-canvas p-2 text-[10px] leading-4 text-ink">{csv}</pre>
            <p className="mt-2 text-[11px] text-muted">{t("m34.bank.formatNote")}</p>
          </Panel>
          {!run.locked && <LockedNote text={t("m34.bank.lockFirst")} />}
        </aside>
      </div>
    </div>
  );
}

// Screens for m34, keyed by ScreenDef.id in meta.ts.
export const screens: Record<string, ComponentType> = {
  s1: PayrollRun,
  s2: Payslip,
  s3: PayrollJournal,
  s4: BankFile,
};
