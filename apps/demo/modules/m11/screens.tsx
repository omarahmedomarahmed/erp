"use client";
import { useMemo, useState, type ComponentType } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import {
  Badge, BarChart, Button, ControlPanel, DataTable, Donut, Fields, GuardButton, KpiRow, LineChart, LockedNote, Money, DateText, Panel, Sheet,
  Timeline, money, type Column, type Tone,
} from "@/components/ui";
import { useT } from "@/components/I18n";
import {
  accountById, iftById, investmentById, investmentContracts, investmentReturns, journalById, murabahaSchedule, MONTHS_2026, OPERATOR_MUDARIB_PCT,
  portfolios, returnsOfContract, round3, ssbResolutions, TODAY,
} from "@/data/seed";
import type { FundCode, InvestmentContract, InvestmentReturn, InvestmentType, ShariaStatus } from "@/data/seed";

const FUND_TONE: Record<FundCode, Tone> = { PTF: "info", SHF: "warn", PIF: "neutral" };
function FundBadge({ fund }: { fund: FundCode }) {
  const { t } = useT();
  return <Badge tone={FUND_TONE[fund]}>{t(`fund.${fund}`)}</Badge>;
}
const SH_TONE: Record<ShariaStatus, Tone> = { compliant: "ok", pending_review: "warn", non_compliant: "danger", purified: "info" };
function ShariaBadge({ status }: { status: ShariaStatus }) {
  const { t } = useT();
  return <Badge tone={SH_TONE[status]}>{t(`sharia.${status}`)}</Badge>;
}
const TYPES: InvestmentType[] = ["murabaha", "mudaraba", "ijara", "islamic_deposit", "sukuk"];
const TYPE_COLOR: Record<InvestmentType, string> = { murabaha: "var(--color-brand)", mudaraba: "var(--color-navy)", ijara: "var(--color-accent)", islamic_deposit: "var(--color-ok)", sukuk: "var(--color-warn)" };
const sum = (xs: number[]) => round3(xs.reduce((a, b) => a + b, 0));

/* ---------------------------------------------------------------- contract record */
function ContractRecord({ id, onBack }: { id: string; onBack?: () => void }) {
  const { t, pick, lang } = useT();
  const c = investmentById[id];
  const rets = returnsOfContract(id);
  const res = c.ssbResolutionId ? ssbResolutions.find((r) => r.id === c.ssbResolutionId) : undefined;
  const sched = murabahaSchedule.filter((r) => r.contractId === id);
  const recognised = sum(sched.filter((r) => r.status === "received").map((r) => r.profit));
  const deferred = round3((c.markup ?? 0) - recognised);
  const gross = sum(rets.map((r) => r.gross)), mud = sum(rets.map((r) => r.mudaribShare));
  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;
  return (
    <Sheet
      title={pick(c.nameAr, c.nameEn)}
      subtitle={<span className="num">{c.id}</span>}
      status={<div className="flex gap-2"><Badge tone={c.status === "active" ? "ok" : c.status === "proposed" ? "warn" : "neutral"}>{t(`m11.status.${c.status}`)}</Badge><ShariaBadge status={c.sharia_status} /></div>}
      actions={<>
        {onBack && <Button variant="ghost" onClick={onBack}>{t("m11.back")}</Button>}
        <GuardButton tryLabel={t("m11.guard.riba.try")} blockedText={t("m11.guard.riba.blocked")} />
      </>}
      side={<Timeline title={t("common.activity")} items={[
        ...(res ? [{ at: res.date, who: t("m11.who.ssb"), text: t("m11.tl.ssb", { id: res.id }), tone: "ok" as Tone }] : [{ at: "2026-10-26", who: t("m11.who.invest"), text: t("m11.tl.submitted") }]),
        { at: c.start, who: t("m11.who.invest"), text: t("m11.tl.start") },
        ...rets.slice(-3).reverse().map((r) => ({ at: r.date, who: t("m11.who.system"), text: t("m11.tl.return", { a: money(r.gross, lang) }) })),
      ]} />}
    >
      <Fields items={[
        { label: t("m11.f.type"), value: <Badge tone="info">{t(`m11.type.${c.type}`)}</Badge> },
        { label: t("m11.f.fund"), value: <FundBadge fund={c.fund} /> },
        { label: t("m11.f.counterparty"), value: pick(c.counterpartyAr, c.counterpartyEn) },
        { label: t("m11.f.principal"), value: <Money value={c.principal} strong /> },
        { label: t("m11.f.term"), value: <span className="num">{c.start} → {c.end}</span> },
        { label: t("m11.f.expected"), value: <span className="num">{c.expectedPct}%</span> },
        { label: t("m11.f.ssb"), value: res ? <span><span className="num">{res.id}</span> · {pick(res.titleAr, res.titleEn)}</span> : <Badge tone="warn">{t("m11.f.ssbPending")}</Badge> },
        { label: t("sharia.label"), value: <ShariaBadge status={c.sharia_status} /> },
      ]} />

      {c.type === "murabaha" && (
        <div className="mt-5">
          <h4 className="mb-2 text-[14px] font-extrabold text-navy">{t("m11.mur.title")}</h4>
          <div className="mb-3 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-line p-2 text-[12px]"><div className="text-muted">{t("m11.mur.cost")}</div><Money value={c.principal} strong /></div>
            <div className="rounded-lg border border-line p-2 text-[12px]"><div className="text-muted">{t("m11.mur.recognised")}</div><span className="text-ok"><Money value={recognised} strong /></span></div>
            <div className="rounded-lg border border-line p-2 text-[12px]"><div className="text-muted">{t("m11.mur.deferred")}</div><Money value={deferred} strong /></div>
          </div>
          <div className="rounded-lg border border-line">
            <DataTable rows={sched.map((r) => ({ ...r, id: String(r.seq) }))} columns={[
              { key: "seq", label: "#", render: (r) => <span className="num">{r.seq}</span> },
              { key: "d", label: t("m11.col.due"), render: (r) => <DateText value={r.dueDate} /> },
              { key: "p", label: t("m11.col.principal"), align: "end", render: (r) => <Money value={r.principal} /> },
              { key: "pr", label: t("m11.col.profit"), align: "end", render: (r) => <Money value={r.profit} /> },
              { key: "i", label: t("m11.col.instalment"), align: "end", render: (r) => <Money value={r.instalment} strong /> },
              { key: "s", label: t("common.status"), render: (r) => <Badge tone={r.status === "received" ? "ok" : "neutral"}>{t(`m11.sched.${r.status}`)}</Badge> },
            ]} footer={<tr><td className="px-3 py-2" colSpan={2}>{t("common.total")}</td><td className="px-3 py-2 text-end"><Money value={c.principal} /></td><td className="px-3 py-2 text-end"><Money value={c.markup} /></td><td className="px-3 py-2 text-end"><Money value={round3(c.principal + (c.markup ?? 0))} /></td><td /></tr>} />
          </div>
          <p className="mt-2 text-[12px] text-muted">{t("m11.mur.note")}</p>
        </div>
      )}

      {c.type === "mudaraba" && (
        <div className="mt-5">
          <h4 className="mb-2 text-[14px] font-extrabold text-navy">{t("m11.mud.title")}</h4>
          <div className="flex flex-wrap items-center gap-2 text-[13px]">
            <Badge tone="neutral">{t("m11.mud.profit")}</Badge><Arrow size={14} aria-hidden />
            <Badge tone="info">{t("m11.mud.fundPart", { p: c.profitRatioFundPct ?? 0 })}</Badge>
            <span className="text-muted">+</span>
            <Badge tone="neutral">{t("m11.mud.bankPart", { p: 100 - (c.profitRatioFundPct ?? 0) })}</Badge>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[13px]">
            <Badge tone="info">{t("m11.mud.fundPartShort")}</Badge><Arrow size={14} aria-hidden />
            <Badge tone="warn">{t("m11.mud.operator", { p: OPERATOR_MUDARIB_PCT })}</Badge>
            <span className="text-muted">+</span>
            <Badge tone="ok">{t("m11.mud.ptf", { p: 100 - OPERATOR_MUDARIB_PCT })}</Badge>
          </div>
          <p className="mt-2 text-[12px] text-muted">{t("m11.mud.loss")}</p>
        </div>
      )}
      {c.type === "ijara" && (
        <div className="mt-5">
          <h4 className="mb-2 text-[14px] font-extrabold text-navy">{t("m11.ijr.title")}</h4>
          <Fields items={[
            { label: t("m11.ijr.rental"), value: <Money value={c.monthlyRental} strong /> },
            { label: t("m11.ijr.annual"), value: <Money value={round3((c.monthlyRental ?? 0) * 12)} /> },
            { label: t("m11.ijr.owner"), value: <FundBadge fund={c.fund} /> },
          ]} />
          <p className="mt-2 text-[12px] text-muted">{t("m11.ijr.note")}</p>
        </div>
      )}
      {c.type === "islamic_deposit" && <p className="mt-5 rounded-md bg-soft p-3 text-[13px] text-brand-deep">{t("m11.dep.note")}</p>}
      {c.type === "sukuk" && <div className="mt-5"><LockedNote text={t("m11.suk.locked")} /></div>}

      {rets.length > 0 && (
        <div className="mt-5">
          <h4 className="mb-2 text-[14px] font-extrabold text-navy">{t("m11.rets.title")}</h4>
          <div className="mb-2 flex flex-wrap gap-2 text-[12px]">
            <Badge tone="neutral">{t("m11.col.gross")}: {money(gross, lang)}</Badge>
            {mud > 0 && <Badge tone="warn">{t("m11.col.mudarib")}: {money(mud, lang)}</Badge>}
            <Badge tone="ok">{t("m11.col.net")}: {money(round3(gross - mud), lang)}</Badge>
          </div>
          <ReturnsTable rows={rets} />
        </div>
      )}
    </Sheet>
  );
}

function ReturnsTable({ rows, onRowClick, showContract }: { rows: InvestmentReturn[]; onRowClick?: (r: InvestmentReturn) => void; showContract?: boolean }) {
  const { t } = useT();
  const cols: Column<InvestmentReturn>[] = [
    { key: "id", label: t("m11.col.return"), render: (r) => <span className="num font-bold">{r.id}</span> },
    { key: "d", label: t("common.date"), render: (r) => <DateText value={r.date} /> },
    ...(showContract ? [{ key: "c", label: t("m11.col.contract"), render: (r: InvestmentReturn) => { const c = investmentById[r.contractId]; return <span>{t(`m11.type.${c.type}`)} · <span className="num text-[12px] text-muted">{c.id}</span></span>; } }] : []),
    { key: "f", label: t("m11.f.fund"), render: (r) => <FundBadge fund={r.fund} /> },
    { key: "g", label: t("m11.col.gross"), align: "end", render: (r) => <Money value={r.gross} /> },
    { key: "m", label: t("m11.col.mudarib"), align: "end", render: (r) => (r.mudaribShare ? <span className="text-warn"><Money value={r.mudaribShare} /></span> : <span className="text-muted">—</span>) },
    { key: "n", label: t("m11.col.net"), align: "end", render: (r) => <Money value={r.netToFund} strong /> },
    { key: "j", label: t("m11.col.journal"), render: (r) => <span className="num text-[12px]">{r.journalId ?? "—"}</span> },
    { key: "x", label: t("m11.col.ift"), render: (r) => (r.iftId ? <span className="num text-[12px]">{r.iftId}</span> : <span className="text-muted">—</span>) },
  ];
  return (
    <div className="rounded-lg border border-line">
      <DataTable columns={cols} rows={rows} onRowClick={onRowClick}
        footer={<tr><td className="px-3 py-2" colSpan={showContract ? 4 : 3}>{t("common.total")}</td>
          <td className="px-3 py-2 text-end"><Money value={sum(rows.map((r) => r.gross))} /></td>
          <td className="px-3 py-2 text-end"><Money value={sum(rows.map((r) => r.mudaribShare))} /></td>
          <td className="px-3 py-2 text-end"><Money value={sum(rows.map((r) => r.netToFund))} /></td><td colSpan={2} /></tr>} />
    </div>
  );
}

/* ---------------------------------------------------------------- s1: portfolios */
function Portfolios() {
  const { t, pick } = useT();
  const [sel, setSel] = useState<string | null>(null);
  if (sel) return <ContractRecord id={sel} onBack={() => setSel(null)} />;
  const active = investmentContracts.filter((c) => c.status === "active");
  const inv = (f: FundCode) => sum(active.filter((c) => c.fund === f).map((c) => c.principal));
  const cols: Column<InvestmentContract>[] = [
    { key: "id", label: t("m11.col.contract"), render: (c) => <span className="num font-bold text-brand-deep">{c.id}</span> },
    { key: "n", label: t("m11.col.name"), render: (c) => pick(c.nameAr, c.nameEn) },
    { key: "t", label: t("m11.f.type"), render: (c) => <Badge tone="info">{t(`m11.type.${c.type}`)}</Badge> },
    { key: "cp", label: t("m11.f.counterparty"), render: (c) => pick(c.counterpartyAr, c.counterpartyEn) },
    { key: "p", label: t("m11.f.principal"), align: "end", render: (c) => <Money value={c.principal} /> },
    { key: "e", label: t("m11.f.expected"), align: "end", render: (c) => <span className="num">{c.expectedPct}%</span> },
    { key: "end", label: t("m11.col.maturity"), render: (c) => <DateText value={c.end} /> },
    { key: "st", label: t("common.status"), render: (c) => <Badge tone={c.status === "active" ? "ok" : "warn"}>{t(`m11.status.${c.status}`)}</Badge> },
    { key: "sh", label: t("sharia.label"), render: (c) => <ShariaBadge status={c.sharia_status} /> },
  ];
  return (
    <div>
      <ControlPanel title={t("m11.s1.title")} actions={<GuardButton tryLabel={t("m11.guard.pool.try")} blockedText={t("m11.guard.pool.blocked")} />} />
      <KpiRow items={[
        { label: t("m11.kpi.ptfInvested"), value: <Money value={inv("PTF")} /> },
        { label: t("m11.kpi.shfInvested"), value: <Money value={inv("SHF")} /> },
        { label: t("m11.kpi.pifInvested"), value: <Money value={inv("PIF")} />, hint: t("m11.kpi.pifHint") },
        { label: t("m11.kpi.pending"), value: investmentContracts.filter((c) => c.sharia_status === "pending_review").length, hint: t("m11.kpi.pendingHint") },
      ]} />
      <div className="grid gap-4 px-4 pb-4">
        {portfolios.map((p) => {
          const rows = investmentContracts.filter((c) => c.portfolioId === p.id);
          return (
            <Panel key={p.id} title={pick(p.nameAr, p.nameEn)} actions={<FundBadge fund={p.fund} />}>
              {rows.length ? (
                <DataTable columns={cols} rows={rows} onRowClick={(c) => setSel(c.id)}
                  footer={<tr><td className="px-3 py-2" colSpan={4}>{t("common.total")}</td><td className="px-3 py-2 text-end"><Money value={sum(rows.map((c) => c.principal))} /></td><td colSpan={4} /></tr>} />
              ) : <p className="text-[13px] text-muted">{t("m11.pf.empty")}</p>}
            </Panel>
          );
        })}
        <LockedNote text={t("m11.pf.separate")} />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- s2: contract record */
function ContractScreen() {
  const { t } = useT();
  const [id, setId] = useState("INV-PTF-MUR-01");
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 border-b border-line bg-surface px-4 py-2">
        <span className="text-[12px] font-bold text-muted">{t("m11.s2.pick")}</span>
        {investmentContracts.map((c) => (
          <button key={c.id} type="button" onClick={() => setId(c.id)}
            className={`rounded-full border px-2.5 py-0.5 text-[12px] ${id === c.id ? "border-brand bg-soft font-bold text-brand-deep" : "border-line bg-surface text-muted"}`}>
            {t(`m11.type.${c.type}`)} · <span className="num">{c.fund}</span>
          </button>
        ))}
      </div>
      <ContractRecord key={id} id={id} />
    </div>
  );
}

/* ---------------------------------------------------------------- s3: returns distribution */
function Returns() {
  const { t, pick } = useT();
  const [fund, setFund] = useState<"all" | FundCode>("all");
  const [sel, setSel] = useState<string>(investmentReturns.filter((r) => r.mudaribShare > 0).slice(-1)[0]?.id ?? "");
  const rows = useMemo(() => [...investmentReturns].filter((r) => fund === "all" || r.fund === fund).sort((a, b) => b.date.localeCompare(a.date)), [fund]);
  const ptf = investmentReturns.filter((r) => r.fund === "PTF");
  const r = investmentReturns.find((x) => x.id === sel);
  const j = r?.journalId ? journalById[r.journalId] : undefined;
  const x = r?.iftId ? iftById[r.iftId] : undefined;
  const f = (id: typeof fund, label: string) => ({ id, label, active: fund === id, onClick: () => setFund(id) });
  return (
    <div>
      <ControlPanel title={t("m11.s3.title")} filters={[f("all", t("m11.filter.all")), f("PTF", t("fund.PTF")), f("SHF", t("fund.SHF"))]} />
      <KpiRow items={[
        { label: t("m11.kpi.ptfGross"), value: <Money value={sum(ptf.map((x) => x.gross))} />, hint: t("m11.kpi.ytd") },
        { label: t("m11.kpi.mudarib", { p: OPERATOR_MUDARIB_PCT }), value: <Money value={sum(ptf.map((x) => x.mudaribShare))} />, hint: t("m11.kpi.toShf") },
        { label: t("m11.kpi.ptfNet"), value: <Money value={sum(ptf.map((x) => x.netToFund))} />, tone: "ok" },
        { label: t("m11.kpi.shfOwn"), value: <Money value={sum(investmentReturns.filter((x) => x.fund === "SHF").map((x) => x.gross))} />, hint: t("m11.kpi.shfOwnHint") },
      ]} />
      <div className="grid gap-4 px-4 pb-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0">
          <ReturnsTable rows={rows} showContract onRowClick={(x) => setSel(x.id)} />
        </div>
        <div className="grid content-start gap-4">
          <Panel title={t("m11.flow.title")}>
            <ol className="grid gap-2 text-[12px]">
              <li className="rounded-md bg-canvas p-2">{t("m11.flow.1")}</li>
              <li className="rounded-md bg-soft p-2 text-brand-deep">{t("m11.flow.2", { p: 100 - OPERATOR_MUDARIB_PCT })}</li>
              <li className="rounded-md bg-warn-soft p-2 text-warn">{t("m11.flow.3", { p: OPERATOR_MUDARIB_PCT })}</li>
              <li className="rounded-md bg-canvas p-2">{t("m11.flow.4")}</li>
            </ol>
          </Panel>
          {r && j && (
            <Panel title={t("m11.sel.title", { id: r.id })}>
              <p className="mb-2 text-[12px]">{pick(j.memoAr, j.memoEn)}</p>
              {(["PTF", "SHF"] as FundCode[]).filter((fd) => j.lines.some((l) => l.fund === fd)).map((fd) => {
                const ls = j.lines.filter((l) => l.fund === fd);
                const ok = Math.abs(sum(ls.map((l) => l.debit)) - sum(ls.map((l) => l.credit))) < 0.0005;
                return (
                  <div key={fd} className="mb-2 rounded-md border border-line p-2">
                    <div className="mb-1 flex items-center gap-2"><FundBadge fund={fd} />{ok && <span className="ms-auto flex items-center gap-1 text-[11px] font-bold text-ok"><CheckCircle2 size={12} aria-hidden />{t("m11.sel.balanced")}</span>}</div>
                    <table className="w-full text-[12px]"><tbody>
                      {ls.map((l, i) => (
                        <tr key={i} className="border-t border-line/60">
                          <td className="py-1">{pick(accountById[l.accountId].nameAr, accountById[l.accountId].nameEn)}</td>
                          <td className="py-1 text-end">{l.debit ? <Money value={l.debit} /> : ""}</td>
                          <td className="py-1 text-end">{l.credit ? <Money value={l.credit} /> : ""}</td>
                        </tr>
                      ))}
                    </tbody></table>
                  </div>
                );
              })}
              {x && <Badge tone="brand">{t("m11.sel.ift", { id: x.id })}</Badge>}
              <div className="mt-2"><LockedNote text={t("common.locked")} /></div>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- s4: performance */
function Performance() {
  const { t, pick } = useT();
  const active = investmentContracts.filter((c) => c.status === "active");
  const byMonth = (f: FundCode) => MONTHS_2026.map((m) => sum(investmentReturns.filter((r) => r.fund === f && r.month === m).map((r) => r.netToFund)));
  const ytdNet = sum(investmentReturns.map((r) => r.netToFund));
  const principal = sum(active.map((c) => c.principal));
  const months = MONTHS_2026.length;
  const yieldPct = principal ? ((sum(investmentReturns.map((r) => r.gross)) / principal) * (12 / months) * 100).toFixed(2) : "0";
  const byType = TYPES.map((ty) => ({ ty, gross: sum(investmentReturns.filter((r) => investmentById[r.contractId].type === ty).map((r) => r.gross)), principal: sum(active.filter((c) => c.type === ty).map((c) => c.principal)) }));
  const ladder = [...investmentContracts].sort((a, b) => a.end.localeCompare(b.end));
  const perf = (c: InvestmentContract) => {
    const g = sum(returnsOfContract(c.id).map((r) => r.gross));
    const start = c.start > "2026-01-01" ? c.start : "2026-01-01";
    const m = Math.max(1, (Number(TODAY.slice(0, 4)) - Number(start.slice(0, 4))) * 12 + Number(TODAY.slice(5, 7)) - Number(start.slice(5, 7)));
    return c.status === "active" ? ((g / c.principal) * (12 / m) * 100).toFixed(2) : "—";
  };
  return (
    <div>
      <ControlPanel title={t("m11.s4.title")} actions={<><Button>{t("common.export")}</Button><Button>{t("common.print")}</Button></>} />
      <KpiRow items={[
        { label: t("m11.kpi.invested"), value: <Money value={principal} /> },
        { label: t("m11.kpi.ytdNet"), value: <Money value={ytdNet} />, hint: t("m11.kpi.ytd") },
        { label: t("m11.kpi.yield"), value: <span className="num">{yieldPct}%</span>, hint: t("m11.kpi.yieldHint") },
        { label: t("m11.kpi.riba"), value: <span className="num">0.000</span>, tone: "ok", hint: t("m11.kpi.ribaHint") },
      ]} />
      <div className="grid gap-4 px-4 pb-4 lg:grid-cols-2">
        <Panel title={t("m11.chart.monthly")}>
          <LineChart labels={MONTHS_2026.map((m) => m.slice(5))} series={[{ name: t("fund.PTF"), values: byMonth("PTF") }, { name: t("fund.SHF"), values: byMonth("SHF") }]} />
          <div className="mt-1 flex gap-3 text-[11px] text-muted">
            <span className="flex items-center gap-1"><span className="size-2.5 rounded-sm bg-brand" />{t("fund.PTF")}</span>
            <span className="flex items-center gap-1"><span className="size-2.5 rounded-sm bg-accent" />{t("fund.SHF")}</span>
          </div>
        </Panel>
        <Panel title={t("m11.chart.byType")}>
          <BarChart data={byType.filter((x) => x.gross > 0).map((x) => ({ label: t(`m11.type.${x.ty}`), value: x.gross }))} format={(n) => `${Math.round(n / 1000)}k`} />
        </Panel>
        <Panel title={t("m11.chart.alloc")}>
          <Donut data={byType.filter((x) => x.principal > 0).map((x) => ({ label: t(`m11.type.${x.ty}`), value: x.principal, color: TYPE_COLOR[x.ty] }))} />
        </Panel>
        <Panel title={t("m11.ladder.title")}>
          <DataTable rows={ladder} columns={[
            { key: "end", label: t("m11.col.maturity"), render: (c) => <DateText value={c.end} /> },
            { key: "n", label: t("m11.col.contract"), render: (c) => <span>{pick(c.nameAr, c.nameEn)}</span> },
            { key: "f", label: t("m11.f.fund"), render: (c) => <FundBadge fund={c.fund} /> },
            { key: "p", label: t("m11.f.principal"), align: "end", render: (c) => <Money value={c.principal} /> },
            { key: "y", label: t("m11.col.yield"), align: "end", render: (c) => <span className="num">{perf(c)}{perf(c) !== "—" ? "%" : ""}</span> },
          ]} />
        </Panel>
      </div>
    </div>
  );
}

export const screens: Record<string, ComponentType> = {
  s1: Portfolios,
  s2: ContractScreen,
  s3: Returns,
  s4: Performance,
};
