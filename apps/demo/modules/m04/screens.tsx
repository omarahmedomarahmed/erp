"use client";
import { useState, type ComponentType } from "react";
import { ArrowRight, Eye } from "lucide-react";
import { useT } from "@/components/I18n";
import { personaById } from "@/content/personas";
import {
  Badge, BarChart, Button, ControlPanel, DataTable, DateText, Fields, KpiRow, LockedNote, Money, Panel, money, useFilter,
  type Column, type Tone,
} from "@/components/ui";
import {
  addDays, agentById, agentMonthsOf, agents, commissionLinesOfAgent, commissionTiers, COMPULSORY_COMMISSION_PCT, customerById, expiringPolicies,
  outletById, policiesOfAgent, policyById, productById, round3, STORY, TODAY,
} from "@/data/seed";
import type { Agent, AgentMonth, CommissionLine, Policy } from "@/data/seed";

const MONTHS_YTD = 10; // Jan–Oct 2026
const ytdTarget = (a: Agent) => (a.targetAnnual * MONTHS_YTD) / 12;
const achievement = (a: Agent) => Math.round((a.collectedYtd / ytdTarget(a)) * 100);
const ranked = [...agents].filter((a) => a.status === "active").sort((a, b) => achievement(b) - achievement(a));
const licenceTone = (a: Agent): Tone => (a.licenceExpiry < TODAY ? "danger" : a.licenceExpiry <= addDays(TODAY, 60) ? "warn" : "ok");
const kindTone: Record<Agent["kind"], Tone> = { agent: "info", broker: "brand", border_agent: "warn" };

function useL() {
  const { t, pick, lang } = useT();
  const name = (a: Agent) => pick(a.nameAr, a.nameEn);
  const outlet = (id: string) => pick(outletById[id].nameAr, outletById[id].nameEn);
  const prod = (p: Policy["productId"]) => pick(productById[p].nameAr, productById[p].nameEn);
  const persona = (id: string) => { const p = personaById(id); return p ? pick(p.nameAr, p.nameEn) : id; };
  return { t, pick, lang, name, outlet, prod, persona };
}

function AgentPicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const L = useL();
  return (
    <select aria-label={L.t("m04.pickAgent")} value={value} onChange={(e) => onChange(e.target.value)}
      className="rounded-md border border-line bg-surface px-2 py-1 text-[13px]">
      {agents.map((a) => <option key={a.id} value={a.id}>{a.id} · {L.name(a)}</option>)}
    </select>
  );
}

function Progress({ pct }: { pct: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-canvas">
      <div className={`h-full ${pct >= 100 ? "bg-ok" : pct >= 80 ? "bg-brand" : "bg-accent"}`} style={{ width: `${Math.min(100, pct)}%` }} />
    </div>
  );
}

/* ---------------------------------------------------------------- s1: agents list */
function AgentsList() {
  const L = useL();
  const { t, pick } = L;
  const [open, setOpen] = useState<string | null>(null);
  const [f, setF] = useState<"all" | "border" | "licence">("all");
  const base = agents.filter((a) => f === "all" || (f === "border" ? a.kind === "border_agent" : licenceTone(a) !== "ok"));
  const { rows, setQ } = useFilter(base, (a) => `${a.id} ${a.nameAr} ${a.nameEn} ${a.licenceNo}`);
  if (open)
    return (
      <div>
        <div className="border-b border-line bg-surface px-4 py-2">
          <Button variant="ghost" onClick={() => setOpen(null)}><ArrowRight size={14} className="ltr:rotate-180" aria-hidden />{t("m04.back")}</Button>
        </div>
        <AgentDashboard id={open} />
      </div>
    );
  const cols: Column<Agent>[] = [
    { key: "id", label: t("m04.col.agent"), render: (a) => <div><div className="font-bold text-navy">{L.name(a)}</div><div className="num text-[11px] text-muted">{a.id}</div></div> },
    { key: "kind", label: t("m04.col.kind"), render: (a) => <Badge tone={kindTone[a.kind]}>{t(`m04.kind.${a.kind}`)}</Badge> },
    { key: "outlet", label: t("m04.col.outlet"), render: (a) => L.outlet(a.outletId) },
    { key: "lic", label: t("m04.col.licence"), render: (a) => <span className="num">{a.licenceNo}</span> },
    { key: "exp", label: t("m04.col.expiry"), render: (a) => <Badge tone={licenceTone(a)}><span className="num">{a.licenceExpiry}</span></Badge> },
    { key: "prod", label: t("m04.col.products"), render: (a) => <span className="text-[12px]">{a.products.map((p) => pick(productById[p].nameAr, productById[p].nameEn)).join(" · ")}</span> },
    { key: "coll", label: t("m04.col.collected"), align: "end", render: (a) => <Money value={a.collectedYtd} /> },
    { key: "ach", label: t("m04.col.achievement"), width: "120px", render: (a) => <div className="grid gap-1"><span className="num text-[12px]">{achievement(a)}%</span><Progress pct={achievement(a)} /></div> },
    { key: "st", label: t("common.status"), render: (a) => <Badge tone={a.status === "active" ? "ok" : "danger"}>{t(`m04.status.${a.status}`)}</Badge> },
  ];
  return (
    <div>
      <ControlPanel title={t("m04.list.title")} onSearch={setQ} actions={<Button variant="primary">{t("m04.list.new")}</Button>}
        filters={[
          { id: "all", label: t("common.all"), active: f === "all", onClick: () => setF("all") },
          { id: "border", label: t("m04.list.border"), active: f === "border", onClick: () => setF("border") },
          { id: "licence", label: t("m04.list.licence"), active: f === "licence", onClick: () => setF("licence") },
        ]} />
      <DataTable columns={cols} rows={rows} onRowClick={(a) => setOpen(a.id)} />
      <p className="px-4 py-3 text-[12px] text-muted">{t("m04.list.note")}</p>
    </div>
  );
}

/* ---------------------------------------------------------------- s2: agent dashboard */
function AgentDashboard({ id }: { id: string }) {
  const L = useL();
  const { t, pick } = L;
  const a = agentById[id];
  const months = agentMonthsOf(id);
  const pols = policiesOfAgent(id);
  const renewals = expiringPolicies(30).filter((p) => p.agentId === id);
  const pendingComm = round3(months.filter((m) => m.status !== "paid").reduce((s, m) => s + m.commission, 0));
  const paidComm = round3(months.filter((m) => m.status === "paid").reduce((s, m) => s + m.commission, 0));
  const ach = achievement(a);
  const rank = ranked.findIndex((x) => x.id === id) + 1;
  const pCols: Column<Policy>[] = [
    { key: "cert", label: t("m04.col.cert"), render: (p) => <span className={`num ${p.id === STORY.policyId ? "font-bold text-brand-deep" : ""}`}>{p.certNo}</span> },
    { key: "cust", label: t("m04.col.participant"), render: (p) => { const c = customerById[p.customerId]; return pick(c.nameAr, c.nameEn); } },
    { key: "prod", label: t("m04.col.product"), render: (p) => L.prod(p.productId) },
    { key: "start", label: t("m04.col.start"), render: (p) => <DateText value={p.start} /> },
    { key: "contr", label: t("m04.col.contribution"), align: "end", render: (p) => <Money value={p.contribution} /> },
    { key: "st", label: t("common.status"), render: (p) => <Badge tone={p.status === "active" ? "ok" : p.status === "cancelled" ? "danger" : "neutral"}>{t(`m04.pstatus.${p.status}`)}</Badge> },
  ];
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 bg-canvas px-4 pt-3 text-[12px] text-muted">
        <Eye size={14} aria-hidden />{t("m04.dash.rls", { name: L.name(a) })}
      </div>
      <KpiRow items={[
        { label: t("m04.kpi.certs"), value: <span className="num">{pols.length}</span>, hint: t("m04.kpi.renewals", { n: renewals.length }) },
        { label: t("m04.kpi.collected"), value: <Money value={a.collectedYtd} />, hint: t("m04.kpi.collectedHint") },
        { label: t("m04.kpi.due"), value: <Money value={pendingComm} />, hint: t("m04.kpi.paid", { v: money(paidComm, L.lang) }) },
        { label: t("m04.kpi.target"), value: <span className="num">{ach}%</span>, tone: ach >= 100 ? "ok" : undefined, hint: rank ? t("m04.kpi.rank", { r: rank, n: ranked.length }) : t("m04.status.suspended") },
      ]} />
      <div className="grid gap-3 px-4 pb-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <div className="grid content-start gap-3">
          <Panel title={t("m04.dash.monthly")}>
            <BarChart data={months.map((m) => ({ label: m.month, value: m.collected, tone: (m.collected >= m.target ? "ok" : "warn") as Tone }))} />
            <p className="mt-1 text-[11px] text-muted">{t("m04.dash.monthlyNote", { v: money(months[0]?.target ?? 0, L.lang) })}</p>
          </Panel>
          <Panel title={t("m04.dash.annual")}>
            <div className="mb-1 flex text-[13px]"><Money value={a.collectedYtd} strong /><span className="ms-auto text-muted"><Money value={a.targetAnnual} /></span></div>
            <Progress pct={(a.collectedYtd / a.targetAnnual) * 100} />
            <Fields cols={1} items={[
              { label: t("m04.col.licence"), value: <span className="num">{a.licenceNo}</span> },
              { label: t("m04.col.expiry"), value: <Badge tone={licenceTone(a)}><span className="num">{a.licenceExpiry}</span></Badge> },
              { label: t("m04.col.outlet"), value: L.outlet(a.outletId) },
            ]} />
          </Panel>
        </div>
        <Panel title={t("m04.dash.certs")}>
          <div className="-m-3"><DataTable columns={pCols} rows={pols} /></div>
        </Panel>
      </div>
    </div>
  );
}

function DashboardScreen() {
  const L = useL();
  const [id, setId] = useState<string>(STORY.agentId);
  return (
    <div>
      <ControlPanel title={L.t("m04.dash.title")} actions={<AgentPicker value={id} onChange={setId} />} />
      <AgentDashboard key={id} id={id} />
    </div>
  );
}

/* ---------------------------------------------------------------- s3: commission scheme */
const KPI_RULES = [
  { k: "renewal", mult: 1.05 },
  { k: "collection", mult: 1.05 },
  { k: "newCustomers", mult: 1.03 },
  { k: "lossRatio", mult: 0.9 },
];
function Scheme() {
  const L = useL();
  const { t, pick, lang } = L;
  const ag = agentById[STORY.agentId];
  const oct = agentMonthsOf(STORY.agentId).find((m) => m.month === "2026-10")!;
  const [amount, setAmount] = useState(oct.collected);
  const [method, setMethod] = useState<"whole" | "marginal">("whole");
  const [compulsory, setCompulsory] = useState(false);
  const [on, setOn] = useState<string[]>(["renewal", "collection"]);
  const tier = commissionTiers.find((x) => amount >= x.from && (x.to === null || amount < x.to))!;
  const marginalParts = commissionTiers.map((x) => {
    const part = Math.max(0, Math.min(amount, x.to ?? Infinity) - x.from);
    return { x, part, value: round3((part * x.ratePct) / 100) };
  }).filter((p) => p.part > 0);
  const whole = round3((amount * tier.ratePct) / 100);
  const marginal = round3(marginalParts.reduce((s, p) => s + p.value, 0));
  const base = compulsory ? round3((amount * COMPULSORY_COMMISSION_PCT) / 100) : method === "whole" ? whole : marginal;
  const mult = compulsory ? 1 : KPI_RULES.filter((r) => on.includes(r.k)).reduce((s, r) => s * r.mult, 1);
  const final = round3(base * mult);
  const m = (n: number) => money(n, lang);
  return (
    <div className="grid gap-3 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="grid content-start gap-3">
        <Panel title={t("m04.sch.tiers")} actions={<Badge tone="info">{t("m04.sch.version")}</Badge>}>
          <table className="w-full text-[13px]">
            <thead><tr className="text-muted"><th className="py-1 text-start">{t("m04.sch.tier")}</th><th className="py-1 text-start">{t("m04.sch.band")}</th><th className="py-1 text-end">{t("m04.sch.rate")}</th></tr></thead>
            <tbody>
              {commissionTiers.map((x) => (
                <tr key={x.id} className={`border-t border-line/60 ${!compulsory && x.id === tier.id ? "bg-soft font-bold" : ""}`}>
                  <td className="py-1.5">{pick(x.nameAr, x.nameEn)}</td>
                  <td className="num py-1.5" dir="ltr">{x.from.toLocaleString("en-US")} – {x.to ? x.to.toLocaleString("en-US") : "∞"}</td>
                  <td className="num py-1.5 text-end">{x.ratePct}%</td>
                </tr>
              ))}
              <tr className={`border-t border-line/60 ${compulsory ? "bg-soft font-bold" : ""}`}>
                <td className="py-1.5">{t("m04.sch.compulsory")}</td><td className="py-1.5 text-muted">{t("m04.sch.flat")}</td><td className="num py-1.5 text-end">{COMPULSORY_COMMISSION_PCT}%</td>
              </tr>
            </tbody>
          </table>
          <div className="mt-2"><LockedNote text={t("m04.sch.locked")} /></div>
        </Panel>
        <Panel title={t("m04.sch.kpis")}>
          <ul className="grid gap-1.5 text-[13px]">
            {KPI_RULES.map((r) => (
              <li key={r.k}>
                <label className={`flex items-center gap-2 ${compulsory ? "opacity-50" : ""}`}>
                  <input type="checkbox" disabled={compulsory} checked={on.includes(r.k)} onChange={() => setOn((s) => (s.includes(r.k) ? s.filter((x) => x !== r.k) : [...s, r.k]))} />
                  <span>{t(`m04.kpi.rule.${r.k}`)}</span>
                  <span className={`num ms-auto font-bold ${r.mult < 1 ? "text-danger" : "text-ok"}`}>×{r.mult.toFixed(2)}</span>
                </label>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[12px] text-muted">{t("m04.sch.kpiNote")}</p>
        </Panel>
      </div>
      <div className="grid content-start gap-3">
        <Panel title={t("m04.sch.try", { name: L.name(ag) })}>
          <div className="flex flex-wrap items-end gap-3 text-[13px]">
            <label className="grid gap-1"><span className="text-[12px] font-bold text-muted">{t("m04.sch.collected")}</span>
              <input type="number" min={0} step={1000} value={amount} onChange={(e) => setAmount(Math.max(0, +e.target.value || 0))}
                className="num w-36 rounded-md border border-line bg-canvas px-2 py-1" /></label>
            <div className="flex overflow-hidden rounded-md border border-line">
              {(["whole", "marginal"] as const).map((k) => (
                <button key={k} type="button" disabled={compulsory} onClick={() => setMethod(k)}
                  className={`px-3 py-1 text-[12px] font-bold ${method === k && !compulsory ? "bg-brand text-white" : "bg-surface text-muted"}`}>{t(`m04.sch.${k}`)}</button>
              ))}
            </div>
            <label className="flex items-center gap-2"><input type="checkbox" checked={compulsory} onChange={(e) => setCompulsory(e.target.checked)} />{t("m04.sch.compulsoryToggle")}</label>
          </div>
        </Panel>
        <Panel title={t("m04.sch.math")}>
          <table className="w-full text-[13px]">
            <tbody>
              {compulsory ? (
                <tr className="border-b border-line/60"><td className="py-1">{t("m04.sch.compulsory")}</td><td className="num py-1 text-end" dir="ltr">{amount.toLocaleString("en-US")} × {COMPULSORY_COMMISSION_PCT}%</td><td className="py-1 text-end"><Money value={base} /></td></tr>
              ) : method === "whole" ? (
                <tr className="border-b border-line/60"><td className="py-1">{t("m04.sch.wholeLine", { tier: pick(tier.nameAr, tier.nameEn) })}</td><td className="num py-1 text-end" dir="ltr">{amount.toLocaleString("en-US")} × {tier.ratePct}%</td><td className="py-1 text-end"><Money value={whole} /></td></tr>
              ) : marginalParts.map((p) => (
                <tr key={p.x.id} className="border-b border-line/60"><td className="py-1">{pick(p.x.nameAr, p.x.nameEn)}</td><td className="num py-1 text-end" dir="ltr">{p.part.toLocaleString("en-US")} × {p.x.ratePct}%</td><td className="py-1 text-end"><Money value={p.value} /></td></tr>
              ))}
              <tr className="border-b border-line/60"><td className="py-1">{t("m04.sch.multiplier")}</td><td className="num py-1 text-end" dir="ltr">×{mult.toFixed(4)}</td><td /></tr>
              <tr><td className="py-1.5 font-bold" colSpan={2}>{t("m04.sch.final")}</td><td className="py-1.5 text-end"><Money value={final} strong /></td></tr>
            </tbody>
          </table>
          {!compulsory && <p className="mt-2 rounded-md bg-canvas px-2 py-1.5 text-[12px]">{t("m04.sch.compare", { w: m(whole), m: m(marginal) })}</p>}
          <p className="mt-2 text-[12px] text-muted">{t("m04.sch.fundNote")}</p>
        </Panel>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- s4: commission statement */
function Statement() {
  const L = useL();
  const { t } = L;
  const [id, setId] = useState<string>(STORY.agentId);
  const [approved, setApproved] = useState(false);
  const months = agentMonthsOf(id).map((m) => ({ ...m, id: m.month, status: (approved && m.status === "pending" ? "approved" : m.status) as AgentMonth["status"] }));
  const lines = commissionLinesOfAgent(id);
  const total = round3(lines.reduce((s, l) => s + l.amount, 0));
  const hasClawback = lines.some((l) => l.kind === "clawback");
  const mCols: Column<(typeof months)[number]>[] = [
    { key: "m", label: t("m04.st.month"), render: (m) => <span className="num font-bold">{m.month}</span> },
    { key: "tg", label: t("m04.st.target"), align: "end", render: (m) => <Money value={m.target} /> },
    { key: "c", label: t("m04.st.collected"), align: "end", render: (m) => <Money value={m.collected} /> },
    { key: "tier", label: t("m04.sch.tier"), render: (m) => <span className="num">{m.tierId} · {m.ratePct}%</span> },
    { key: "comm", label: t("m04.st.commission"), align: "end", render: (m) => <Money value={m.commission} strong /> },
    { key: "fund", label: t("m04.fund"), render: () => <Badge tone="info">{t("fund.SHF")}</Badge> },
    { key: "st", label: t("common.status"), render: (m) => <Badge tone={m.status === "paid" ? "ok" : m.status === "approved" ? "info" : "warn"}>{t(`m04.cstatus.${m.status}`)}</Badge> },
  ];
  const lCols: Column<CommissionLine>[] = [
    { key: "id", label: t("m04.st.line"), render: (l) => <span className="num">{l.id}</span> },
    { key: "d", label: t("common.date"), render: (l) => <DateText value={l.date} /> },
    { key: "cert", label: t("m04.col.cert"), render: (l) => <span className={`num ${l.policyId === STORY.policyId ? "font-bold text-brand-deep" : ""}`}>{policyById[l.policyId].certNo}</span> },
    { key: "rc", label: t("m04.st.receipt"), render: (l) => <span className="num">{l.receiptId}</span> },
    { key: "base", label: t("m04.st.base"), align: "end", render: (l) => <Money value={l.base} /> },
    { key: "rate", label: t("m04.sch.rate"), align: "center", render: (l) => <span className="num">{l.ratePct}%</span> },
    { key: "amt", label: t("common.amount"), align: "end", render: (l) => <span className={l.amount < 0 ? "text-danger" : ""}><Money value={l.amount} /></span> },
    { key: "kind", label: t("m04.st.kind"), render: (l) => <Badge tone={l.kind === "clawback" ? "danger" : "ok"}>{t(`m04.st.${l.kind}`)}</Badge> },
    { key: "fund", label: t("m04.fund"), render: () => <Badge tone="info">{t("fund.SHF")}</Badge> },
    { key: "sh", label: t("sharia.label"), render: (l) => <Badge tone="ok">{t(`sharia.${l.sharia_status}`)}</Badge> },
  ];
  return (
    <div>
      <ControlPanel title={t("m04.st.title")}
        actions={<><AgentPicker value={id} onChange={(v) => { setId(v); setApproved(false); }} />{!hasClawback && <Button variant="ghost" onClick={() => setId("AG-03")}>{t("m04.st.showClawback")}</Button>}</>} />
      <div className="grid gap-3 p-4">
        <Panel title={t("m04.st.months")}
          actions={!approved && months.some((m) => m.status === "pending") ? <Button variant="primary" onClick={() => setApproved(true)}>{t("m04.st.approveRun")}</Button> : undefined}>
          <div className="-m-3"><DataTable columns={mCols} rows={months} /></div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Fields cols={1} items={[
              { label: t("m04.st.prepared"), value: `${L.persona("dist")} · ${t("role.distribution")}` },
              { label: t("m04.st.approved"), value: approved || months.every((m) => m.status === "paid") ? `${L.persona("cfo")} · ${t("role.cfo")}` : <span className="text-muted">{t("m04.st.awaiting")}</span> },
            ]} />
          </div>
        </Panel>
        <Panel title={t("m04.st.lines")}>
          <div className="-m-3">
            <DataTable columns={lCols} rows={lines}
              footer={<tr><td className="px-3 py-2" colSpan={6}>{t("common.total")}</td><td className="px-3 py-2 text-end"><Money value={total} strong /></td><td colSpan={3} /></tr>} />
          </div>
          <div className="mt-4 grid gap-2">
            <p className="text-[12px] text-muted">{t("m04.st.rules")}</p>
            {hasClawback && <p className="rounded-md bg-danger-soft px-3 py-2 text-[12px] text-danger">{t("m04.st.clawbackNote")}</p>}
            <LockedNote text={t("common.locked")} />
          </div>
        </Panel>
      </div>
    </div>
  );
}

export const screens: Record<string, ComponentType> = {
  s1: AgentsList,
  s2: DashboardScreen,
  s3: Scheme,
  s4: Statement,
};
