"use client";
import { useState, type ComponentType } from "react";
import { Database, PlugZap, RefreshCw } from "lucide-react";
import { useT } from "@/components/I18n";
import {
  Badge, BarChart, Button, ControlPanel, DataTable, Donut, Fields, KpiRow, LineChart, Money, Panel, type Column, type Tone,
} from "@/components/ui";
import {
  agentMonths, agents, bookSummary, claims, employees, fundResult, interFundTransfers, investmentReturns, kpis, outletById, outlets, payrollRuns,
  productById, products, recoveries, round3, surplusRun,
} from "@/data/seed";
import type { ProductCode } from "@/data/seed";

/* ---------------------------------------------------------------- shared figures (company book, Jan–Oct 2026) */
const PRODS = products.map((p) => p.id) as ProductCode[];
const LAST = kpis[kpis.length - 1];
const sumK = (f: (k: (typeof kpis)[number]) => number) => round3(kpis.reduce((s, k) => s + f(k), 0));
const GWP = sumK((k) => k.gwpTotal);
const COLLECTED = sumK((k) => k.collectedTotal);
const CLAIMS_PAID = sumK((k) => k.claimsPaidTotal);
const gwpBy = (p: ProductCode) => sumK((k) => k.gwp[p]);
const paidBy = (p: ProductCode) => sumK((k) => k.claimsPaid[p]);
const salesByOutlet = Object.fromEntries(outlets.map((o) => [o.id, sumK((k) => k.salesByOutlet[o.id] ?? 0)]));
const paidSample = claims.filter((c) => c.stageDates.paid);
const WITHIN5 = Math.round((paidSample.filter((c) => c.slaWorkingDays <= 5).length / Math.max(1, paidSample.length)) * 100);
const openSample = claims.filter((c) => !c.rejected && !c.stageDates.paid);
const OUTSTANDING = round3(openSample.reduce((s, c) => s + c.reserve, 0));
const RECOVERABLE = round3(recoveries.filter((r) => r.status === "receivable").reduce((s, r) => s + r.amount, 0));
const PTF_RESULT = fundResult("PTF").result;
const WAKALA = round3(interFundTransfers.filter((i) => i.type === "WAKALA_FEE").reduce((s, i) => s + i.amount, 0));
const OPEX = round3(bookSummary.reduce((s, b) => s + b.opex, 0));
const COMMISSION = round3(bookSummary.reduce((s, b) => s + b.commission, 0));
const INV_PTF = round3(investmentReturns.filter((r) => r.fund === "PTF").reduce((s, r) => s + r.netToFund, 0));
const PAYROLL = payrollRuns[payrollRuns.length - 1];
const MONTH_LABELS = kpis.map((k) => k.month.slice(5));
const PRODUCT_COLORS = ["var(--color-brand)", "var(--color-brand-deep)", "var(--color-navy)", "var(--color-ok)", "var(--color-accent)", "var(--color-warn)", "var(--color-danger)"];
const lrTone = (v: number): Tone => (v > 60 ? "danger" : v > 45 ? "warn" : "ok");

function useL() {
  const { t, pick, lang } = useT();
  const mill = (n: number) => t("m28.unit.m", { v: (n / 1e6).toFixed(2) });
  const thou = (n: number) => t("m28.unit.k", { v: Math.round(n / 1000).toLocaleString("en-US") });
  const prod = (p: ProductCode) => pick(productById[p].nameAr, productById[p].nameEn);
  const outlet = (id: string) => pick(outletById[id].nameAr, outletById[id].nameEn);
  return { t, pick, lang, mill, thou, prod, outlet };
}

function RefreshBar() {
  const { t } = useT();
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-line bg-surface px-4 py-2 text-[12px] text-muted">
      <Badge tone="ok"><RefreshCw size={11} aria-hidden />{t("m28.live")}</Badge>
      <span>{t("m28.refresh", { last: "2026-11-02 10:00", next: "11:00" })}</span>
      <span className="ms-auto">{t("m28.scope")}</span>
    </div>
  );
}

/* ---------------------------------------------------------------- s1: executive */
const DASHBOARDS = Array.from({ length: 12 }, (_, i) => i + 1);
function Executive() {
  const L = useL();
  const { t } = L;
  const [db, setDb] = useState(1);
  const lrMonths = kpis.map((k) => ({ label: k.month.slice(5), value: k.lossRatioTotal, tone: (k.lossRatioTotal > 50 ? "warn" : "ok") as Tone }));
  const alerts = PRODS.filter((p) => LAST.lossRatio[p] > 60);
  return (
    <div>
      <RefreshBar />
      <div className="flex gap-1.5 overflow-x-auto border-b border-line bg-surface px-4 py-2">
        {DASHBOARDS.map((n) => (
          <button key={n} type="button" onClick={() => setDb(n)}
            className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[12px] ${n === db ? "border-brand bg-soft font-bold text-brand-deep" : "border-line text-muted"}`}>
            <span className="num">{n}.</span> {t(`m28.db.${n}`)}
          </button>
        ))}
      </div>
      <KpiRow items={[
        { label: t("m28.k.2"), value: L.mill(GWP), hint: t("m28.ytd") },
        { label: t("m28.k.3"), value: L.mill(COLLECTED), hint: t("m28.pctOf", { p: Math.round((COLLECTED / GWP) * 100) }) },
        { label: t("m28.k.1"), value: <span className="num">{sumK((k) => k.policiesIssuedTotal).toLocaleString("en-US")}</span>, hint: t("m28.ytd") },
        { label: t("m28.k.11"), value: <span className="num">{((CLAIMS_PAID / GWP) * 100).toFixed(1)}%</span>, hint: t("m28.ytd") },
        { label: t("m28.k.7"), value: <span className="num">{LAST.renewalRatePct.toFixed(1)}%</span>, hint: LAST.month },
        { label: t("m28.k.13"), value: <span className="num">{LAST.avgSettlementDays.toFixed(1)}</span>, hint: t("m28.target5"), tone: LAST.avgSettlementDays < 5 ? "ok" : "danger" },
        { label: t("m28.liq.ptf"), value: L.mill(LAST.liquidity.PTF), hint: t("fund.PTF") },
        { label: t("m28.liq.shf"), value: L.mill(LAST.liquidity.SHF), hint: t("fund.SHF") },
      ]} />
      <div className="grid gap-3 px-4 pb-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Panel title={t("m28.exec.trend")}>
          <LineChart labels={MONTH_LABELS} series={[{ name: "gwp", values: kpis.map((k) => k.gwpTotal) }, { name: "col", values: kpis.map((k) => k.collectedTotal) }]} />
          <div className="mt-1 flex gap-4 text-[12px]">
            <span className="flex items-center gap-1"><span className="size-2.5 rounded-sm bg-brand" />{t("m28.k.2")}</span>
            <span className="flex items-center gap-1"><span className="size-2.5 rounded-sm bg-accent" />{t("m28.k.3")}</span>
          </div>
        </Panel>
        <Panel title={t("m28.exec.mix")}>
          <Donut data={PRODS.map((p, i) => ({ label: L.prod(p), value: gwpBy(p), color: PRODUCT_COLORS[i] }))} />
        </Panel>
        <Panel title={t("m28.exec.lr")}>
          <BarChart data={lrMonths} format={(n) => `${n.toFixed(0)}%`} />
        </Panel>
        <Panel title={t("m28.exec.alerts")}>
          <ul className="grid gap-2 text-[13px]">
            {alerts.map((p) => (
              <li key={p} className="rounded-md bg-danger-soft px-3 py-2 text-danger">{t("m28.alert.lr", { p: L.prod(p), v: LAST.lossRatio[p].toFixed(1) })}</li>
            ))}
            <li className="rounded-md bg-warn-soft px-3 py-2 text-warn">{t("m28.alert.recoverable", { v: L.thou(RECOVERABLE) })}</li>
            <li className="rounded-md bg-ok-soft px-3 py-2 text-ok">{t("m28.alert.sla", { v: LAST.avgSettlementDays.toFixed(1) })}</li>
          </ul>
        </Panel>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- s2: sales & production */
type Dim = "branch" | "product" | "agent";
interface Row { id: string; label: string; value: number; extra?: string }
function Sales() {
  const L = useL();
  const { t } = L;
  const [dim, setDim] = useState<Dim>("branch");
  const [period, setPeriod] = useState<"ytd" | "oct">("ytd");
  const k = (f: (x: (typeof kpis)[number]) => number) => (period === "ytd" ? sumK(f) : f(LAST));
  let rows: Row[];
  if (dim === "branch") rows = outlets.map((o) => ({ id: o.id, label: L.outlet(o.id), value: period === "ytd" ? salesByOutlet[o.id] : LAST.salesByOutlet[o.id] ?? 0, extra: t(`m28.outlet.${o.kind}`) }));
  else if (dim === "product") rows = PRODS.map((p) => ({ id: p, label: L.prod(p), value: k((x) => x.gwp[p]), extra: t("m28.sales.certs", { n: k((x) => x.policiesIssued[p]).toLocaleString("en-US") }) }));
  else rows = agents.map((a) => ({ id: a.id, label: L.pick(a.nameAr, a.nameEn), value: period === "ytd" ? a.collectedYtd : agentMonths.find((m) => m.agentId === a.id && m.month === "2026-10")?.collected ?? 0, extra: a.id }));
  rows.sort((a, b) => b.value - a.value);
  const total = rows.reduce((s, r) => s + r.value, 0);
  const cols: Column<Row>[] = [
    { key: "label", label: t(`m28.dim.${dim}`), render: (r) => <span className="font-bold text-navy">{r.label}</span> },
    { key: "extra", label: t("m28.sales.detail"), render: (r) => <span className="text-[12px] text-muted">{r.extra}</span> },
    { key: "value", label: t(dim === "agent" ? "m28.sales.collected" : "m28.k.2"), align: "end", render: (r) => <Money value={r.value} /> },
    { key: "share", label: t("m28.sales.share"), align: "end", render: (r) => <span className="num">{((r.value / Math.max(1, total)) * 100).toFixed(1)}%</span> },
  ];
  return (
    <div>
      <RefreshBar />
      <ControlPanel title={t("m28.sales.title")}
        actions={<Button>{t("common.export")}</Button>}
        filters={[
          ...(["branch", "product", "agent"] as Dim[]).map((d) => ({ id: d, label: t(`m28.dim.${d}`), active: dim === d, onClick: () => setDim(d) })),
          { id: "ytd", label: t("m28.ytd"), active: period === "ytd", onClick: () => setPeriod("ytd") },
          { id: "oct", label: t("m28.oct"), active: period === "oct", onClick: () => setPeriod("oct") },
        ]} />
      <KpiRow items={[
        { label: t("m28.k.2"), value: L.mill(k((x) => x.gwpTotal)) },
        { label: t("m28.k.1"), value: <span className="num">{k((x) => x.policiesIssuedTotal).toLocaleString("en-US")}</span> },
        { label: t("m28.k.8"), value: <span className="num">{k((x) => x.newCustomers).toLocaleString("en-US")}</span> },
        { label: t("m28.k.10"), value: <span className="num">{((k((x) => x.collectedTotal) / k((x) => x.gwpTotal)) * 100).toFixed(1)}%</span> },
      ]} />
      <div className="grid gap-3 px-4 pb-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Panel title={t("m28.sales.chart", { d: t(`m28.dim.${dim}`) })}>
          <BarChart height={200} data={rows.slice(0, 8).map((r) => ({ label: r.label, value: r.value }))} format={(n) => L.thou(n)} />
        </Panel>
        <Panel title={t("m28.sales.table")}>
          <div className="-m-3"><DataTable columns={cols} rows={rows} /></div>
        </Panel>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- s3: claims & loss ratio */
interface LrRow { id: ProductCode; gwp: number; paid: number; lr: number; last: number }
function ClaimsLr() {
  const L = useL();
  const { t } = L;
  const rows: LrRow[] = PRODS.map((p) => ({ id: p, gwp: gwpBy(p), paid: paidBy(p), lr: (paidBy(p) / gwpBy(p)) * 100, last: LAST.lossRatio[p] })).sort((a, b) => b.lr - a.lr);
  const cols: Column<LrRow>[] = [
    { key: "p", label: t("m28.lr.line"), render: (r) => <span className="font-bold text-navy">{L.prod(r.id)}</span> },
    { key: "g", label: t("m28.k.2"), align: "end", render: (r) => <Money value={r.gwp} /> },
    { key: "c", label: t("m28.lr.paid"), align: "end", render: (r) => <Money value={r.paid} /> },
    { key: "lr", label: t("m28.lr.ytd"), align: "center", render: (r) => <Badge tone={lrTone(r.lr)}>{r.lr.toFixed(1)}%</Badge> },
    { key: "last", label: t("m28.lr.last"), align: "center", render: (r) => <span className="num">{r.last.toFixed(1)}%</span> },
  ];
  return (
    <div>
      <RefreshBar />
      <KpiRow items={[
        { label: t("m28.k.12"), value: <span className="num">{sumK((k) => k.claimsRegistered).toLocaleString("en-US")}</span>, hint: t("m28.ytd") },
        { label: t("m28.k.14"), value: <span className="num">{WITHIN5}%</span>, hint: t("m28.sampleHint") },
        { label: t("m28.k.15"), value: <Money value={OUTSTANDING} />, hint: t("m28.openCount", { n: openSample.length }) },
        { label: t("m28.k.16"), value: <Money value={RECOVERABLE} />, hint: t("fund.PTF") },
      ]} />
      <div className="grid gap-3 px-4 pb-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <Panel title={t("m28.lr.table")}>
          <div className="-m-3"><DataTable columns={cols} rows={rows}
            footer={<tr><td className="px-3 py-2">{t("common.total")}</td><td className="px-3 py-2 text-end"><Money value={GWP} /></td><td className="px-3 py-2 text-end"><Money value={CLAIMS_PAID} /></td><td className="px-3 py-2 text-center"><span className="num">{((CLAIMS_PAID / GWP) * 100).toFixed(1)}%</span></td><td /></tr>} /></div>
          <p className="mt-4 text-[12px] text-muted">{t("m28.lr.def")}</p>
        </Panel>
        <div className="grid content-start gap-3">
          <Panel title={t("m28.lr.trend")}>
            <LineChart labels={MONTH_LABELS} series={[{ name: "all", values: kpis.map((k) => k.lossRatioTotal) }, { name: "cmp", values: kpis.map((k) => k.lossRatio.CMP) }]} />
            <div className="mt-1 flex gap-4 text-[12px]">
              <span className="flex items-center gap-1"><span className="size-2.5 rounded-sm bg-brand" />{t("m28.lr.all")}</span>
              <span className="flex items-center gap-1"><span className="size-2.5 rounded-sm bg-accent" />{L.prod("CMP")}</span>
            </div>
          </Panel>
          <Panel title={t("m28.lr.days")}>
            <BarChart data={kpis.map((k) => ({ label: k.month.slice(5), value: k.avgSettlementDays, tone: (k.avgSettlementDays < 5 ? "ok" : "warn") as Tone }))} format={(n) => n.toFixed(1)} />
          </Panel>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- s4: funds, BI link, KPI catalogue */
const CATALOGUE: { n: number; mod: string; value: (L: ReturnType<typeof useL>) => string }[] = [
  { n: 1, mod: "M06", value: () => sumK((k) => k.policiesIssuedTotal).toLocaleString("en-US") },
  { n: 2, mod: "M06", value: (L) => L.mill(GWP) },
  { n: 3, mod: "M07", value: (L) => L.mill(COLLECTED) },
  { n: 4, mod: "M06", value: (L) => { const top = Object.entries(salesByOutlet).sort((a, b) => b[1] - a[1])[0]; return L.outlet(top[0]); } },
  { n: 5, mod: "M06", value: (L) => L.prod([...PRODS].sort((a, b) => gwpBy(b) - gwpBy(a))[0]) },
  { n: 6, mod: "M04", value: (L) => { const a = [...agents].sort((x, y) => y.collectedYtd - x.collectedYtd)[0]; return L.pick(a.nameAr, a.nameEn); } },
  { n: 7, mod: "M06", value: () => `${LAST.renewalRatePct.toFixed(1)}%` },
  { n: 8, mod: "M02", value: () => sumK((k) => k.newCustomers).toLocaleString("en-US") },
  { n: 9, mod: "M07", value: (L) => L.mill(GWP - COLLECTED) },
  { n: 10, mod: "M07", value: () => `${((COLLECTED / GWP) * 100).toFixed(1)}%` },
  { n: 11, mod: "M09", value: () => `${((CLAIMS_PAID / GWP) * 100).toFixed(1)}%` },
  { n: 12, mod: "M09", value: () => sumK((k) => k.claimsRegistered).toLocaleString("en-US") },
  { n: 13, mod: "M09", value: () => LAST.avgSettlementDays.toFixed(1) },
  { n: 14, mod: "M09", value: () => `${WITHIN5}%` },
  { n: 15, mod: "M09", value: (L) => L.thou(OUTSTANDING) },
  { n: 16, mod: "M10", value: (L) => L.thou(RECOVERABLE) },
  { n: 17, mod: "M12", value: (L) => `${L.mill(LAST.liquidity.PTF)} / ${L.mill(LAST.liquidity.SHF)}` },
  { n: 18, mod: "M12", value: (L) => L.mill(PTF_RESULT) },
  { n: 19, mod: "M08", value: (L) => L.mill(WAKALA) },
  { n: 20, mod: "M12", value: () => `${((OPEX / GWP) * 100).toFixed(1)}%` },
  { n: 21, mod: "M11", value: (L) => L.thou(INV_PTF) },
  { n: 22, mod: "M04", value: () => `${((COMMISSION / COLLECTED) * 100).toFixed(1)}%` },
  { n: 23, mod: "M13", value: () => `${surplusRun.solvencyAfter}%` },
  { n: 24, mod: "M34", value: (L) => `${employees.length} · ${L.thou(PAYROLL.totals.gross)}` },
];
const VIEWS = ["rpt_kpi_monthly", "rpt_sales", "rpt_claims", "rpt_funds", "rpt_agents", "rpt_retakaful"];

function Funds() {
  const L = useL();
  const { t } = L;
  const [tool, setTool] = useState<"metabase" | "powerbi">("metabase");
  const [tested, setTested] = useState(false);
  return (
    <div>
      <RefreshBar />
      <KpiRow items={[
        { label: t("m28.liq.ptf"), value: L.mill(LAST.liquidity.PTF), hint: LAST.month },
        { label: t("m28.liq.shf"), value: L.mill(LAST.liquidity.SHF), hint: LAST.month },
        { label: t("m28.k.18"), value: L.mill(PTF_RESULT), tone: PTF_RESULT >= 0 ? "ok" : "danger", hint: t("m28.ytd") },
        { label: t("m28.k.19"), value: L.mill(WAKALA), hint: t("fund.SHF") },
      ]} />
      <div className="grid gap-3 px-4 pb-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <Panel title={t("m28.fund.trend")}>
          <LineChart labels={MONTH_LABELS} series={[{ name: "PTF", values: kpis.map((k) => k.liquidity.PTF) }, { name: "SHF", values: kpis.map((k) => k.liquidity.SHF) }]} />
          <div className="mt-1 flex flex-wrap gap-4 text-[12px]">
            <span className="flex items-center gap-1"><span className="size-2.5 rounded-sm bg-brand" />{t("fund.PTF")}</span>
            <span className="flex items-center gap-1"><span className="size-2.5 rounded-sm bg-accent" />{t("fund.SHF")}</span>
          </div>
          <p className="mt-2 text-[12px] text-muted">{t("m28.fund.note")}</p>
        </Panel>
        <Panel title={t("m28.bi.title")} actions={<Database size={14} className="text-muted" aria-hidden />}>
          <div className="mb-3 flex overflow-hidden rounded-md border border-line">
            {(["metabase", "powerbi"] as const).map((k) => (
              <button key={k} type="button" onClick={() => { setTool(k); setTested(false); }}
                className={`flex-1 px-3 py-1 text-[12px] font-bold ${tool === k ? "bg-brand text-white" : "bg-surface text-muted"}`}>{t(`m28.bi.${k}`)}</button>
            ))}
          </div>
          <Fields cols={1} items={[
            { label: t("m28.bi.host"), value: <span className="num" dir="ltr">db-replica.internal:5432</span> },
            { label: t("m28.bi.db"), value: <span className="num" dir="ltr">takaful_reporting</span> },
            { label: t("m28.bi.role"), value: <span className="num" dir="ltr">rpt_readonly</span> },
            { label: t("m28.bi.rights"), value: <Badge tone="info">{t("m28.bi.select")}</Badge> },
            { label: t("m28.bi.refresh"), value: t("m28.bi.hourly") },
            { label: t("m28.bi.views"), value: <span className="num flex flex-wrap gap-1" dir="ltr">{VIEWS.map((v) => <Badge key={v}>{v}</Badge>)}</span> },
          ]} />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {tested ? <Badge tone="ok"><PlugZap size={11} aria-hidden />{t("m28.bi.ok", { n: VIEWS.length })}</Badge>
              : <Button variant="primary" onClick={() => setTested(true)}><PlugZap size={14} aria-hidden />{t("m28.bi.test")}</Button>}
          </div>
        </Panel>
      </div>
      <div className="px-4 pb-4">
        <Panel title={t("m28.cat.title")} actions={<Badge tone="ok">{t("m28.cat.count", { n: CATALOGUE.length })}</Badge>}>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {CATALOGUE.map((c) => (
              <div key={c.n} className="rounded-md border border-line bg-canvas p-2.5">
                <div className="flex items-center gap-2 text-[11px] text-muted"><span className="num font-bold text-brand-deep">#{c.n}</span><span className="ms-auto num">{c.mod}</span></div>
                <div className="mt-0.5 text-[12px] font-bold text-navy">{t(`m28.k.${c.n}`)}</div>
                <div className="num mt-1 truncate text-[15px] font-extrabold text-navy">{c.value(L)}</div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

export const screens: Record<string, ComponentType> = {
  s1: Executive,
  s2: Sales,
  s3: ClaimsLr,
  s4: Funds,
};
