"use client";
import { useMemo, useState, type ComponentType } from "react";
import { CheckCircle2, Star } from "lucide-react";
import { Badge, Button, ControlPanel, DataTable, KpiRow, LockedNote, Money, DateText, Panel, StatusBar, useFilter, type Column } from "@/components/ui";
import { useT } from "@/components/I18n";
import {
  accountBalance, accountById, cessions, commissionLines, fundResult, isPeriodClosed, journalById, journals, periods, recoveries,
  round3, STORY, TODAY, trialBalance,
} from "@/data/seed";
import type { FundCode, Journal, JournalSource, TrialBalanceRow } from "@/data/seed";
import { FundBadge, JournalRecord, ShariaBadge, jFunds, jTotal, useWho } from "./parts";

/* ---------------------------------------------------------------- hero journals */
const HERO_JOURNALS: string[] = [
  ...STORY.receiptJournalIds,
  STORY.surplusCreditJournalId,
  ...commissionLines.filter((l) => (STORY.commissionLineIds as readonly string[]).includes(l.id) && l.journalId).map((l) => l.journalId!),
  ...(cessions.find((c) => c.id === STORY.cessionId)?.journalId ? [cessions.find((c) => c.id === STORY.cessionId)!.journalId!] : []),
  STORY.claimPaymentJournalId,
  ...(recoveries.find((r) => r.id === STORY.recoveryId)?.journalIds ?? []),
].filter((id, i, a) => journalById[id] && a.indexOf(id) === i);
const HERO_SET = new Set(HERO_JOURNALS);

const SOURCES: JournalSource[] = ["receipt", "surplus_credit", "claim_payment", "cession", "recovery", "ri_settlement", "commission", "commission_payment",
  "investment", "payroll", "payroll_remittance", "staff_advance", "surplus", "fund_settlement", "purification", "book_summary", "opex", "opening"];

/* ---------------------------------------------------------------- s1: journals list */
function JournalsList() {
  const { t, pick } = useT();
  const [fund, setFund] = useState<"all" | FundCode | "cross" | "hero">("all");
  const [src, setSrc] = useState<"all" | JournalSource>("all");
  const [sel, setSel] = useState<string | null>(null);
  const base = useMemo(() => {
    const r = journals.filter((j) => {
      if (src !== "all" && j.source !== src) return false;
      if (fund === "hero") return HERO_SET.has(j.id);
      if (fund === "cross") return !!j.iftId;
      if (fund !== "all") return j.lines.some((l) => l.fund === fund);
      return true;
    });
    return [...r].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  }, [fund, src]);
  const fields = useMemo(() => (j: Journal) => `${j.id} ${j.memoAr} ${j.memoEn} ${j.sourceId ?? ""} ${j.iftId ?? ""}`, []);
  const { rows, setQ } = useFilter(base, fields);
  if (sel) return <JournalRecord id={sel} onBack={() => setSel(null)} />;
  const shown = rows.slice(0, 120);
  const cols: Column<Journal>[] = [
    { key: "id", label: t("m12.col.journal"), render: (j) => <span className="num flex items-center gap-1 font-bold text-brand-deep">{HERO_SET.has(j.id) && <Star size={12} className="text-accent" aria-label={t("m12.hero")} />}{j.id}</span> },
    { key: "date", label: t("common.date"), render: (j) => <DateText value={j.date} /> },
    { key: "src", label: t("m12.col.source"), render: (j) => <Badge tone="info">{t(`m12.src.${j.source}`)}</Badge> },
    { key: "memo", label: t("m12.col.memo"), render: (j) => <span className="line-clamp-1 max-w-[340px]">{pick(j.memoAr, j.memoEn)}</span> },
    { key: "fund", label: t("m12.col.funds"), render: (j) => <span className="flex gap-1">{jFunds(j).map((f) => <FundBadge key={f} fund={f} />)}</span> },
    { key: "amt", label: t("common.amount"), align: "end", render: (j) => <Money value={jTotal(j)} /> },
    { key: "ift", label: t("m12.col.ift"), render: (j) => (j.iftId ? <span className="num text-[12px]">{j.iftId}</span> : <span className="text-muted">—</span>) },
    { key: "per", label: t("m12.col.period"), render: (j) => (isPeriodClosed(j.date) ? <Badge tone="neutral">{t("m12.period.locked")}</Badge> : <Badge tone="ok">{t("m12.period.openShort")}</Badge>) },
    { key: "sh", label: t("sharia.label"), render: (j) => <ShariaBadge status={j.sharia_status} /> },
  ];
  const f = (id: typeof fund, label: string) => ({ id, label, active: fund === id, onClick: () => setFund(id) });
  return (
    <div>
      <ControlPanel
        title={t("m12.s1.title")}
        actions={<>
          <select aria-label={t("m12.col.source")} value={src} onChange={(e) => setSrc(e.target.value as typeof src)}
            className="rounded-md border border-line bg-surface px-2 py-1 text-[13px]">
            <option value="all">{t("m12.src.all")}</option>
            {SOURCES.map((s) => <option key={s} value={s}>{t(`m12.src.${s}`)}</option>)}
          </select>
        </>}
        filters={[f("all", t("common.all")), f("PTF", t("fund.PTF")), f("SHF", t("fund.SHF")), f("cross", t("m12.filter.cross")), f("hero", t("m12.filter.hero"))]}
        onSearch={setQ}
      />
      <DataTable columns={cols} rows={shown} onRowClick={(j) => setSel(j.id)} />
      <p className="px-4 py-2 text-[12px] text-muted">{t("m12.list.count", { shown: shown.length, total: rows.length })}</p>
    </div>
  );
}

/* ---------------------------------------------------------------- s2: journal record (hero) */
function JournalScreen() {
  const { t } = useT();
  const [id, setId] = useState(HERO_JOURNALS[0]);
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 border-b border-line bg-surface px-4 py-2">
        <span className="text-[12px] font-bold text-muted">{t("m12.s2.pick")}</span>
        {HERO_JOURNALS.map((jid) => {
          const j = journalById[jid];
          return (
            <button key={jid} type="button" onClick={() => setId(jid)}
              className={`rounded-full border px-2.5 py-0.5 text-[12px] ${id === jid ? "border-brand bg-soft font-bold text-brand-deep" : "border-line bg-surface text-muted"}`}>
              {t(`m12.src.${j.source}`)} · <span className="num">{j.date.slice(5)}</span>
            </button>
          );
        })}
      </div>
      <JournalRecord key={id} id={id} />
    </div>
  );
}

/* ---------------------------------------------------------------- s3: trial balance per fund */
const ELIM: Record<string, true> = { "PTF-2110": true, "SHF-1120": true, "PTF-2150": true, "SHF-1130": true };
type View = FundCode | "ALL";
function TrialBalance() {
  const { t, pick } = useT();
  const [view, setView] = useState<View>("PTF");
  const [asOf, setAsOf] = useState<string>(TODAY);
  const rows = useMemo(() => trialBalance(view === "ALL" ? undefined : view, asOf), [view, asOf]);
  const tot = (fn: (r: TrialBalanceRow) => number) => round3(rows.reduce((s, r) => s + fn(r), 0));
  const dr = tot((r) => (r.balance > 0 ? r.balance : 0)), cr = tot((r) => (r.balance < 0 ? -r.balance : 0));
  const elimTotal = tot((r) => (ELIM[r.accountId] ? r.balance : 0));
  const ptfDue = accountBalance("PTF-2110", asOf), shfDue = accountBalance("SHF-1120", asOf);
  const fundCheck = (["PTF", "SHF", "PIF"] as FundCode[]).map((f) => {
    const r = trialBalance(f, asOf);
    const s = round3(r.reduce((a, x) => a + x.balance, 0));
    return { f, n: r.length, ok: Math.abs(s) < 0.0005 };
  });
  const cols: Column<TrialBalanceRow & { id: string }>[] = [
    { key: "code", label: t("m12.col.account"), render: (r) => <span className="num font-bold">{r.accountId}</span> },
    { key: "name", label: t("m12.col.accountName"), render: (r) => pick(r.nameAr, r.nameEn) },
    { key: "fund", label: t("m12.col.fund"), render: (r) => <FundBadge fund={accountById[r.accountId].fund} /> },
    { key: "type", label: t("m12.col.type"), render: (r) => <span className="text-[12px] text-muted">{t(`m12.type.${r.type}`)}</span> },
    { key: "dr", label: t("m12.col.debitBal"), align: "end", render: (r) => (r.balance > 0 ? <Money value={r.balance} /> : "") },
    { key: "cr", label: t("m12.col.creditBal"), align: "end", render: (r) => (r.balance < 0 ? <Money value={-r.balance} /> : "") },
    ...(view === "ALL" ? [{ key: "elim", label: t("m12.tb.elim"), align: "end" as const, render: (r: TrialBalanceRow) => (ELIM[r.accountId] && r.balance ? <span className="text-warn"><Money value={-r.balance} /></span> : "") }] : []),
  ];
  const v = (id: View, label: string) => ({ id, label, active: view === id, onClick: () => setView(id) });
  return (
    <div>
      <ControlPanel
        title={t("m12.s3.title")}
        actions={<>
          {[TODAY, "2026-09-30", "2026-06-30"].map((d) => (
            <Button key={d} variant={asOf === d ? "primary" : "secondary"} onClick={() => setAsOf(d)}>{t("m12.tb.asOf")} <span className="num">{d}</span></Button>
          ))}
          <Button>{t("common.export")}</Button>
        </>}
        filters={[v("PTF", t("fund.PTF")), v("SHF", t("fund.SHF")), v("PIF", t("fund.PIF")), v("ALL", t("m12.tb.combined"))]}
      />
      <div className="grid gap-3 p-4 md:grid-cols-4">
        {fundCheck.map((c) => (
          <div key={c.f} className="rounded-lg border border-line bg-surface p-3">
            <FundBadge fund={c.f} />
            <div className="mt-2 flex items-center gap-1 text-[13px] font-bold">
              {c.n === 0 ? <span className="text-muted">{t("m12.tb.noPostings")}</span>
                : c.ok ? <><CheckCircle2 size={14} className="text-ok" aria-hidden /><span className="text-ok">{t("m12.tb.balanced")}</span></>
                  : <span className="text-danger">{t("m12.tb.unbalanced")}</span>}
            </div>
          </div>
        ))}
        <div className="rounded-lg border border-line bg-surface p-3">
          <div className="text-[12px] font-bold text-muted">{t("m12.tb.mirror")}</div>
          <div className="mt-1 text-[12px]">{t("m12.tb.mirrorPtf")}: <Money value={-ptfDue} /></div>
          <div className="text-[12px]">{t("m12.tb.mirrorShf")}: <Money value={shfDue} /></div>
          {Math.abs(ptfDue + shfDue) < 0.0005 && <Badge tone="ok">{t("m12.tb.mirrorOk")}</Badge>}
        </div>
      </div>
      <DataTable
        columns={cols}
        rows={rows.map((r) => ({ ...r, id: r.accountId }))}
        footer={<>
          <tr>
            <td className="px-3 py-2" colSpan={4}>{t("common.total")}</td>
            <td className="px-3 py-2 text-end"><Money value={dr} /></td>
            <td className="px-3 py-2 text-end"><Money value={cr} /></td>
            {view === "ALL" && <td className="px-3 py-2 text-end"><Money value={-elimTotal} /></td>}
          </tr>
          <tr><td className="px-3 py-2" colSpan={view === "ALL" ? 7 : 6}>
            {Math.abs(dr - cr) < 0.0005 ? <Badge tone="ok">{t("m12.tb.balancedFoot")}</Badge> : <Badge tone="danger">{t("m12.tb.unbalanced")}</Badge>}
            {view === "ALL" && <span className="ms-2 text-[12px] font-normal text-muted">{t("m12.tb.elimNote")}</span>}
          </td></tr>
        </>}
      />
    </div>
  );
}

/* ---------------------------------------------------------------- s4: statements per fund + period close */
type Line = { id: string; label: string; value: number; strong?: boolean; indent?: boolean };
function StatementTable({ lines }: { lines: Line[] }) {
  return (
    <table className="w-full text-[13px]">
      <tbody>
        {lines.map((l) => (
          <tr key={l.id} className={`border-b border-line/60 ${l.strong ? "bg-canvas font-extrabold text-navy" : ""}`}>
            <td className={`px-3 py-1.5 ${l.indent ? "ps-6 text-muted" : ""}`}>{l.label}</td>
            <td className="px-3 py-1.5 text-end"><Money value={l.value} strong={l.strong} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
function Statements() {
  const { t, pick } = useT();
  const who = useWho();
  const [tab, setTab] = useState<"position" | "ptf" | "shf" | "close">("position");
  const [asOf, setAsOf] = useState<string>(TODAY);
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [octClosed, setOctClosed] = useState(false);
  const bal = (fund: FundCode) => trialBalance(fund, asOf);
  const name = (id: string) => { const a = accountById[id]; return a ? pick(a.nameAr, a.nameEn) : id; };
  const sumOf = (rows: TrialBalanceRow[], pred: (r: TrialBalanceRow) => boolean, sign = 1) => round3(rows.filter(pred).reduce((s, r) => s + sign * r.balance, 0));
  const ptfR = fundResult("PTF", undefined, asOf), shfR = fundResult("SHF", undefined, asOf);

  const position = (fund: FundCode) => {
    const rows = bal(fund);
    const res = fund === "PTF" ? ptfR.result : shfR.result;
    const assets = rows.filter((r) => r.type === "asset" && Math.abs(r.balance) > 0.0005);
    const liabs = rows.filter((r) => r.type === "liability" && Math.abs(r.balance) > 0.0005);
    const eq = rows.filter((r) => r.type === "equity" && Math.abs(r.balance) > 0.0005);
    const tA = sumOf(rows, (r) => r.type === "asset"), tL = sumOf(rows, (r) => r.type === "liability", -1), tE = round3(sumOf(rows, (r) => r.type === "equity", -1) + res);
    const lines: Line[] = [
      { id: "ha", label: t("m12.fs.assets"), value: tA, strong: true },
      ...assets.map((r) => ({ id: r.accountId, label: name(r.accountId), value: r.balance, indent: true })),
      { id: "hl", label: t("m12.fs.liabilities"), value: tL, strong: true },
      ...liabs.map((r) => ({ id: r.accountId, label: name(r.accountId), value: -r.balance, indent: true })),
      { id: "he", label: fund === "PTF" ? t("m12.fs.ptfFund") : t("m12.fs.equity"), value: tE, strong: true },
      ...eq.map((r) => ({ id: r.accountId, label: name(r.accountId), value: -r.balance, indent: true })),
      { id: "res", label: fund === "PTF" ? t("m12.fs.periodSurplus") : t("m12.fs.periodProfit"), value: res, indent: true },
    ];
    return { lines, tA, tL, tE, ok: Math.abs(tA - tL - tE) < 0.0005 };
  };

  const ptfRev = (): Line[] => {
    const r = bal("PTF");
    const inc = (p: string) => sumOf(r, (x) => x.accountId.startsWith(p), -1);
    const exp = (p: string) => sumOf(r, (x) => x.accountId.startsWith(p));
    const contrib = inc("PTF-4100"), ceded = exp("PTF-5200"), comm = inc("PTF-4300"), wak = exp("PTF-5300");
    const claims = exp("PTF-5100"), rec = inc("PTF-4200"), resv = exp("PTF-5500"), invInc = inc("PTF-4400"), mud = exp("PTF-5400");
    const netContrib = round3(contrib - ceded + comm - wak), netClaims = round3(claims - rec + resv), netInv = round3(invInc - mud);
    return [
      { id: "c", label: t("m12.fs.grossContrib"), value: contrib, strong: true },
      ...r.filter((x) => x.accountId.startsWith("PTF-4100")).map((x) => ({ id: x.accountId, label: name(x.accountId), value: -x.balance, indent: true })),
      { id: "ced", label: t("m12.fs.ceded"), value: -ceded, indent: true },
      { id: "com", label: t("m12.fs.riComm"), value: comm, indent: true },
      { id: "wak", label: t("m12.fs.wakala"), value: -wak, indent: true },
      { id: "nc", label: t("m12.fs.netContrib"), value: netContrib, strong: true },
      { id: "cl", label: t("m12.fs.claimsPaid"), value: -claims, indent: true },
      { id: "rec", label: t("m12.fs.recoveries"), value: rec, indent: true },
      { id: "res", label: t("m12.fs.reserves"), value: -resv, indent: true },
      { id: "ncl", label: t("m12.fs.netClaims"), value: -netClaims, strong: true },
      { id: "inv", label: t("m12.fs.invIncome"), value: invInc, indent: true },
      { id: "mud", label: t("m12.fs.mudarib"), value: -mud, indent: true },
      { id: "ninv", label: t("m12.fs.netInv"), value: netInv, strong: true },
      { id: "sur", label: t("m12.fs.periodSurplus"), value: ptfR.result, strong: true },
    ];
  };
  const shfInc = (): Line[] => {
    const r = bal("SHF");
    const row = (id: string, sign: number) => ({ id, label: name(id), value: sumOf(r, (x) => x.accountId === id, sign), indent: true });
    const rev = sumOf(r, (x) => x.type === "income", -1), exp = sumOf(r, (x) => x.type === "expense");
    return [
      { id: "rev", label: t("m12.fs.shfRevenue"), value: rev, strong: true },
      row("SHF-4100", -1), row("SHF-4200", -1), row("SHF-4300", -1), row("SHF-4400", -1),
      { id: "exp", label: t("m12.fs.shfExpenses"), value: -exp, strong: true },
      ...["SHF-5100", "SHF-5200", "SHF-5210", "SHF-5300"].map((id) => { const x = row(id, 1); return { ...x, value: -x.value }; }),
      { id: "np", label: t("m12.fs.periodProfit"), value: shfR.result, strong: true },
    ];
  };

  const tabBtn = (id: typeof tab, label: string) => ({ id, label, active: tab === id, onClick: () => setTab(id) });
  const ptfPos = position("PTF"), shfPos = position("SHF");
  const elim = round3(accountBalance("SHF-1120", asOf) + accountBalance("SHF-1130", asOf));
  const CHECK = ["bank", "mirror", "tb", "sharia"];
  const allChecked = CHECK.every((c) => checks[c]);
  return (
    <div>
      <ControlPanel
        title={t("m12.s4.title")}
        actions={tab !== "close" ? <>
          {[TODAY, "2026-09-30"].map((d) => <Button key={d} variant={asOf === d ? "primary" : "secondary"} onClick={() => setAsOf(d)}>{t("m12.tb.asOf")} <span className="num">{d}</span></Button>)}
          <Button>{t("common.print")}</Button>
        </> : undefined}
        filters={[tabBtn("position", t("m12.fs.tab.position")), tabBtn("ptf", t("m12.fs.tab.ptf")), tabBtn("shf", t("m12.fs.tab.shf")), tabBtn("close", t("m12.fs.tab.close"))]}
      />
      {tab !== "close" && (
        <KpiRow items={[
          { label: t("m12.kpi.ptfSurplus"), value: <Money value={ptfR.result} />, hint: t("m12.kpi.ytd"), tone: ptfR.result >= 0 ? "ok" : "danger" },
          { label: t("m12.kpi.shfProfit"), value: <Money value={shfR.result} />, hint: t("m12.kpi.ytd") },
          { label: t("m12.kpi.ptfCash"), value: <Money value={round3(accountBalance("PTF-1110", asOf) + accountBalance("PTF-1120", asOf) + accountBalance("PTF-1130", asOf))} /> },
          { label: t("m12.kpi.shfCash"), value: <Money value={accountBalance("SHF-1110", asOf)} /> },
        ]} />
      )}
      {tab === "position" && (
        <div className="grid gap-4 px-4 pb-4 lg:grid-cols-3">
          {([["PTF", ptfPos], ["SHF", shfPos]] as const).map(([f, p]) => (
            <Panel key={f} title={`${t("m12.fs.position")} – ${t(`fund.${f}`)}`} actions={p.ok ? <Badge tone="ok">{t("m12.fs.balances")}</Badge> : <Badge tone="danger">{t("m12.tb.unbalanced")}</Badge>}>
              <StatementTable lines={p.lines} />
            </Panel>
          ))}
          <Panel title={t("m12.fs.combined")}>
            <StatementTable lines={[
              { id: "a", label: t("m12.fs.assets"), value: round3(ptfPos.tA + shfPos.tA - elim), strong: true },
              { id: "ea", label: t("m12.fs.elimInter"), value: -elim, indent: true },
              { id: "l", label: t("m12.fs.liabilities"), value: round3(ptfPos.tL + shfPos.tL - elim), strong: true },
              { id: "p", label: t("m12.fs.ptfFund"), value: ptfPos.tE, strong: true },
              { id: "s", label: t("m12.fs.equity"), value: shfPos.tE, strong: true },
            ]} />
            <p className="mt-2 text-[12px] text-muted">{t("m12.fs.combinedNote")}</p>
          </Panel>
        </div>
      )}
      {tab === "ptf" && (
        <div className="px-4 pb-4"><Panel title={t("m12.fs.ptfTitle")} actions={<FundBadge fund="PTF" />}><StatementTable lines={ptfRev()} /><p className="mt-2 text-[12px] text-muted">{t("m12.fs.ptfNote")}</p></Panel></div>
      )}
      {tab === "shf" && (
        <div className="px-4 pb-4"><Panel title={t("m12.fs.shfTitle")} actions={<FundBadge fund="SHF" />}><StatementTable lines={shfInc()} /><p className="mt-2 text-[12px] text-muted">{t("m12.fs.shfNote")}</p></Panel></div>
      )}
      {tab === "close" && (
        <div className="grid gap-4 p-4 lg:grid-cols-2">
          <Panel title={t("m12.close.periods")}>
            <DataTable
              rows={periods.map((p) => ({ ...p, status: p.id === "2026-10" && octClosed ? ("closed" as const) : p.status }))}
              columns={[
                { key: "id", label: t("m12.col.period"), render: (p) => <span className="num font-bold">{p.id}</span> },
                { key: "st", label: t("common.status"), render: (p) => (p.status === "closed" ? <Badge tone="neutral">{t("m12.period.locked")}</Badge> : <Badge tone="ok">{t("m12.period.openShort")}</Badge>) },
                { key: "at", label: t("m12.close.closedAt"), render: (p) => <DateText value={p.id === "2026-10" && octClosed ? TODAY : p.closedAt} /> },
                { key: "by", label: t("m12.close.closedBy"), render: (p) => (p.closedByPersonaId ? who(p.closedByPersonaId) : p.id === "2026-10" && octClosed ? who("cfo") : "—") },
              ]}
            />
          </Panel>
          <Panel title={t("m12.close.checklist")}>
            <StatusBar stages={[{ id: "o", label: t("m12.close.st.open") }, { id: "c", label: t("m12.close.st.check") }, { id: "l", label: t("m12.close.st.locked") }]}
              current={octClosed ? "l" : allChecked ? "c" : "o"} />
            <ul className="mt-3 grid gap-2">
              {CHECK.map((c) => (
                <li key={c}>
                  <label className="flex items-center gap-2 text-[13px]">
                    <input type="checkbox" disabled={octClosed} checked={!!checks[c]} onChange={(e) => setChecks({ ...checks, [c]: e.target.checked })} />
                    {t(`m12.close.chk.${c}`)}
                  </label>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button variant="primary" disabled={!allChecked || octClosed} onClick={() => setOctClosed(true)}>{t("m12.close.do")}</Button>
              <span className="text-[12px] text-muted">{t("m12.close.makerChecker")}</span>
            </div>
            {octClosed && <div className="mt-3"><LockedNote text={t("m12.close.done")} /></div>}
          </Panel>
        </div>
      )}
    </div>
  );
}

export const screens: Record<string, ComponentType> = {
  s1: JournalsList,
  s2: JournalScreen,
  s3: TrialBalance,
  s4: Statements,
};
