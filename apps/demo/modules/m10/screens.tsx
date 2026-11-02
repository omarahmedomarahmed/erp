"use client";
import { useState, type ComponentType } from "react";
import { ArrowRight, Calculator, Send } from "lucide-react";
import { useT } from "@/components/I18n";
import {
  Badge, Button, ControlPanel, DataTable, DateText, Fields, KpiRow, LockedNote, Money, Panel, Sheet, money, type Column, type Tone,
} from "@/components/ui";
import {
  cessions, cessionsOfTreaty, claimById, counterparties, counterpartyById, customerById, policyById, productById, recoveries, riStatements,
  round3, STORY, treaties, treatyById,
} from "@/data/seed";
import type { Cession, Counterparty, Recovery, RiStatementRow, Treaty } from "@/data/seed";

const SSB_OF: Record<string, string> = { "TR-2026-QS": "SSB-2026-02", "TR-2026-XL": "SSB-2026-02", "TR-2026-FAC-MAR-01": "SSB-2026-05" };
const n0 = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 3 });
const typeTone: Record<Treaty["type"], Tone> = { quota_share: "info", excess_of_loss: "brand", facultative: "warn" };

function useL() {
  const { t, pick, lang } = useT();
  const cp = (id: string) => { const c = counterpartyById[id]; return c ? pick(c.nameAr, c.nameEn) : id; };
  const tr = (x: Treaty) => pick(x.nameAr, x.nameEn);
  const terms = (x: Treaty) =>
    x.type === "excess_of_loss" ? `${n0(x.limit ?? 0)} xs ${n0(x.retention ?? 0)}` : `${x.cededPct}%`;
  return { t, pick, lang, cp, tr, terms };
}

function BackBar({ onBack }: { onBack: () => void }) {
  const { t } = useT();
  return (
    <div className="border-b border-line bg-surface px-4 py-2">
      <Button variant="ghost" onClick={onBack}><ArrowRight size={14} className="ltr:rotate-180" aria-hidden />{t("m10.back")}</Button>
    </div>
  );
}

/* ---------------------------------------------------------------- s1: register */
function Register() {
  const L = useL();
  const { t, pick } = L;
  const [open, setOpen] = useState<string | null>(null);
  if (open) return <><BackBar onBack={() => setOpen(null)} /><TreatyRecord id={open} /></>;
  const cols: Column<Treaty>[] = [
    { key: "id", label: t("m10.col.treaty"), render: (x) => <span className="num font-bold">{x.id}</span> },
    { key: "name", label: t("m10.col.name"), render: (x) => L.tr(x) },
    { key: "type", label: t("m10.col.type"), render: (x) => <Badge tone={typeTone[x.type]}>{t(`m10.type.${x.type}`)}</Badge> },
    { key: "terms", label: t("m10.col.terms"), render: (x) => <span className="num" dir="ltr">{L.terms(x)}</span> },
    { key: "prod", label: t("m10.col.products"), render: (x) => x.productIds.map((p) => pick(productById[p].nameAr, productById[p].nameEn)).join(" · ") },
    { key: "period", label: t("m10.col.period"), render: (x) => <span className="num">{x.start} → {x.end}</span> },
    { key: "shares", label: t("m10.col.shares"), render: (x) => x.shares.map((s) => `${L.cp(s.counterpartyId)} ${s.pct}%`).join(" · ") },
    { key: "status", label: t("common.status"), render: (x) => <Badge tone={x.status === "active" ? "ok" : "neutral"}>{t(`m10.status.${x.status}`)}</Badge> },
    { key: "sharia", label: t("sharia.label"), render: (x) => <Badge tone="ok">{t(`sharia.${x.sharia_status}`)}</Badge> },
  ];
  const cpCols: Column<Counterparty>[] = [
    { key: "name", label: t("m10.col.counterparty"), render: (c) => pick(c.nameAr, c.nameEn) },
    { key: "country", label: t("m10.col.country"), render: (c) => pick(c.countryAr, c.countryEn) },
    { key: "kind", label: t("m10.col.kind"), render: (c) => <Badge tone={c.kind === "retakaful" ? "ok" : "warn"}>{t(`m10.kind.${c.kind}`)}</Badge> },
    { key: "rating", label: t("m10.col.rating"), render: (c) => <span className="num">{c.rating}</span> },
    { key: "isa", label: t("m10.col.isa"), render: (c) => <Badge tone={c.isaRegistration === "registered" ? "ok" : "warn"}>{t(`m10.isa.${c.isaRegistration}`)}</Badge> },
    { key: "sharia", label: t("sharia.label"), render: (c) => <span className="flex flex-wrap items-center gap-1"><Badge tone="ok">{t(`sharia.${c.sharia_status}`)}</Badge>{c.ssbResolutionId && <span className="num text-[11px] text-muted">{c.ssbResolutionId}</span>}</span> },
  ];
  return (
    <div>
      <ControlPanel title={t("m10.reg.title")} actions={<Button variant="primary">{t("m10.reg.new")}</Button>} />
      <DataTable columns={cols} rows={treaties} onRowClick={(x) => setOpen(x.id)} />
      <div className="p-4">
        <Panel title={t("m10.reg.cps")}>
          <div className="-m-3"><DataTable columns={cpCols} rows={counterparties} /></div>
          <p className="mt-4 text-[12px] text-muted">{t("m10.reg.cpNote")}</p>
        </Panel>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- s2: treaty record */
function Layers({ x }: { x: Treaty }) {
  const L = useL();
  const { t } = L;
  if (x.type === "excess_of_loss") {
    const top = (x.retention ?? 0) + (x.limit ?? 0);
    const rows = [
      { label: t("m10.layer.above", { a: n0(top) }), who: t("m10.layer.company"), cls: "bg-canvas text-muted" },
      { label: t("m10.layer.l1", { l: n0(x.limit ?? 0), r: n0(x.retention ?? 0) }), who: x.shares.map((s) => `${L.cp(s.counterpartyId)} ${s.pct}%`).join(" · "), cls: "bg-brand text-white" },
      { label: t("m10.layer.retention", { r: n0(x.retention ?? 0) }), who: t("m10.layer.company"), cls: "bg-soft text-brand-deep" },
    ];
    return (
      <div className="grid gap-1">
        {rows.map((r, i) => (
          <div key={i} className={`flex flex-wrap items-center gap-2 rounded-md px-3 ${i === 1 ? "py-6" : "py-2.5"} text-[13px] ${r.cls}`}>
            <b className="num" dir="ltr">{r.label}</b><span className="ms-auto">{r.who}</span>
          </div>
        ))}
        <p className="mt-1 text-[12px] text-muted">{t("m10.layer.mdp", { m: money(x.minDepositPremium ?? 0, L.lang), r: x.reinstatements ?? 0 })}</p>
      </div>
    );
  }
  const ceded = x.cededPct ?? 0;
  return (
    <div className="grid gap-2">
      <div className="flex h-10 overflow-hidden rounded-md text-[12px] font-bold">
        <div className="flex items-center justify-center bg-soft text-brand-deep" style={{ width: `${100 - ceded}%` }}>{t("m10.layer.retained", { p: 100 - ceded })}</div>
        <div className="flex items-center justify-center bg-brand text-white" style={{ width: `${ceded}%` }}>{t("m10.layer.ceded", { p: ceded })}</div>
      </div>
      <ul className="grid gap-1 text-[13px]">
        {x.shares.map((s) => (
          <li key={s.counterpartyId} className="flex items-center gap-2">
            <span>{L.cp(s.counterpartyId)}</span>
            <span className="num ms-auto text-muted" dir="ltr">{s.pct}% × {ceded}% = {round3((s.pct * ceded) / 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TreatyRecord({ id }: { id: string }) {
  const L = useL();
  const { t, pick } = L;
  const x = treatyById[id];
  const ces = cessionsOfTreaty(id);
  const sumOf = (f: (c: Cession) => number) => round3(ces.reduce((s, c) => s + f(c), 0));
  const recs = recoveries.filter((r) => r.treatyId === id);
  const pol = x.policyId ? policyById[x.policyId] : undefined;
  const cesCols: Column<Cession>[] = [
    { key: "id", label: t("m10.col.cession"), render: (c) => <span className="num">{c.id}</span> },
    { key: "date", label: t("common.date"), render: (c) => <DateText value={c.date} /> },
    { key: "cert", label: t("m10.col.cert"), render: (c) => c.policyId ? <span className={`num ${c.policyId === STORY.policyId ? "font-bold text-brand-deep" : ""}`}>{policyById[c.policyId].certNo}</span> : <span className="text-muted">{t("m10.ces.deposit")}</span> },
    { key: "base", label: t("m10.col.base"), align: "end", render: (c) => <Money value={c.base} /> },
    { key: "ceded", label: t("m10.col.ceded"), align: "end", render: (c) => <Money value={c.ceded} /> },
    { key: "comm", label: t("m10.col.commission"), align: "end", render: (c) => <Money value={c.commission} /> },
  ];
  return (
    <Sheet
      title={L.tr(x)}
      subtitle={<span className="num">{x.id}</span>}
      status={<Badge tone={x.status === "active" ? "ok" : "neutral"}>{t(`m10.status.${x.status}`)}</Badge>}
      actions={<Badge tone={typeTone[x.type]}>{t(`m10.type.${x.type}`)}</Badge>}
      side={
        <div className="grid gap-3">
          <Panel title={t("m10.tr.totals")}>
            <Fields cols={1} items={[
              { label: t("m10.tr.cessions"), value: <span className="num">{ces.length}</span> },
              { label: t("m10.col.ceded"), value: <Money value={sumOf((c) => c.ceded)} strong /> },
              { label: t("m10.col.commission"), value: <Money value={sumOf((c) => c.commission)} /> },
              { label: t("m10.tr.recovered"), value: <Money value={round3(recs.reduce((s, r) => s + r.amount, 0))} /> },
              { label: t("m10.fund"), value: <Badge tone="info">{t("fund.PTF")}</Badge> },
            ]} />
          </Panel>
          <LockedNote text={t("m10.tr.locked")} />
        </div>
      }
    >
      <Fields items={[
        { label: t("m10.col.terms"), value: <span className="num" dir="ltr">{L.terms(x)}</span> },
        { label: t("m10.col.period"), value: <span className="num">{x.start} → {x.end}</span> },
        { label: t("m10.col.products"), value: x.productIds.map((p) => pick(productById[p].nameAr, productById[p].nameEn)).join(" · ") },
        { label: t("m10.tr.cedingComm"), value: <span className="num">{x.cedingCommissionPct}%</span> },
        ...(pol ? [{ label: t("m10.col.cert"), value: <span className="num">{pol.certNo}</span> }] : []),
        { label: t("sharia.label"), value: <Badge tone="ok">{t(`sharia.${x.sharia_status}`)}</Badge> },
        { label: t("m10.tr.ssb"), value: <span className="num">{SSB_OF[x.id]}</span> },
        { label: t("m10.fund"), value: <Badge tone="info">{t("fund.PTF")}</Badge> },
      ]} />
      <div className="mt-4 grid gap-3">
        <Panel title={t("m10.tr.layers")}><Layers x={x} /></Panel>
        <Panel title={t("m10.tr.cesList")}>
          <div className="-m-3"><DataTable columns={cesCols} rows={ces.slice(-10)} /></div>
        </Panel>
      </div>
    </Sheet>
  );
}

function TreatyScreen() {
  const L = useL();
  const [id, setId] = useState<string>(STORY.treatyId);
  return (
    <div>
      <ControlPanel title={L.t("m10.tr.title")}
        filters={treaties.map((x) => ({ id: x.id, label: `${L.t(`m10.type.${x.type}`)} · ${L.terms(x)}`, active: x.id === id, onClick: () => setId(x.id) }))} />
      <TreatyRecord key={id} id={id} />
    </div>
  );
}

/* ---------------------------------------------------------------- s3: recoveries */
interface Step { label: string; value: string }
function calcSteps(x: Treaty, amount: number, L: ReturnType<typeof useL>): { steps: Step[]; total: number } {
  const { t, lang } = L;
  const m = (n: number) => money(n, lang);
  if (x.type === "excess_of_loss") {
    const r = x.retention ?? 0, lim = x.limit ?? 0;
    const excess = Math.max(0, amount - r);
    const rec = Math.min(excess, lim);
    return {
      total: rec,
      steps: [
        { label: t("m10.calc.claim"), value: m(amount) },
        { label: t("m10.calc.retention"), value: `− ${m(r)}` },
        { label: t("m10.calc.excess"), value: m(excess) },
        { label: t("m10.calc.limit", { l: n0(lim) }), value: `min(${n0(excess)}, ${n0(lim)})` },
        ...(amount > r + lim ? [{ label: t("m10.calc.overLimit"), value: m(amount - r - lim) }] : []),
      ],
    };
  }
  const p = x.cededPct ?? 0;
  const rec = round3((amount * p) / 100);
  return { total: rec, steps: [{ label: t("m10.calc.claim"), value: m(amount) }, { label: t("m10.calc.pct"), value: `× ${p}%` }] };
}

function MathPanel({ x, amount, title }: { x: Treaty; amount: number; title: string }) {
  const L = useL();
  const { t } = L;
  const { steps, total } = calcSteps(x, amount, L);
  return (
    <Panel title={title}>
      <div className="mb-2 text-[12px] text-muted">{L.tr(x)}</div>
      <table className="w-full text-[13px]">
        <tbody>
          {steps.map((s, i) => (
            <tr key={i} className="border-b border-line/60"><td className="py-1">{s.label}</td><td className="num py-1 text-end" dir="ltr">{s.value}</td></tr>
          ))}
          <tr><td className="py-1.5 font-bold">{t("m10.calc.recoverable")}</td><td className="py-1.5 text-end"><Money value={total} strong /></td></tr>
        </tbody>
      </table>
      <div className="mt-2 grid gap-1 rounded-md bg-canvas p-2 text-[12px]">
        {x.shares.map((s) => (
          <div key={s.counterpartyId} className="flex gap-2"><span>{L.cp(s.counterpartyId)} ({s.pct}%)</span><span className="ms-auto"><Money value={round3((total * s.pct) / 100)} /></span></div>
        ))}
      </div>
    </Panel>
  );
}

function Recoveries() {
  const L = useL();
  const { t, pick } = L;
  const [sel, setSel] = useState<string>(STORY.recoveryId);
  const [calls, setCalls] = useState<string[]>([]);
  const [simTreaty, setSimTreaty] = useState("TR-2026-XL");
  const [simAmt, setSimAmt] = useState(250000);
  const r = recoveries.find((x) => x.id === sel)!;
  const c = claimById[r.claimId];
  const x = treatyById[r.treatyId];
  const total = round3(recoveries.reduce((s, z) => s + z.amount, 0));
  const due = round3(recoveries.filter((z) => z.status === "receivable").reduce((s, z) => s + z.amount, 0));
  const cols: Column<Recovery>[] = [
    { key: "id", label: t("m10.col.recovery"), render: (z) => <span className="num font-bold">{z.id}</span> },
    { key: "claim", label: t("m10.col.claim"), render: (z) => <span className="num">{z.claimId}</span> },
    { key: "cust", label: t("m10.col.participant"), render: (z) => { const cu = customerById[claimById[z.claimId].customerId]; return pick(cu.nameAr, cu.nameEn); } },
    { key: "treaty", label: t("m10.col.type"), render: (z) => <Badge tone={typeTone[treatyById[z.treatyId].type]}>{t(`m10.type.${treatyById[z.treatyId].type}`)}</Badge> },
    { key: "approved", label: t("m10.col.approved"), align: "end", render: (z) => <Money value={claimById[z.claimId].approved} /> },
    { key: "amount", label: t("m10.col.recoverable"), align: "end", render: (z) => <Money value={z.amount} strong /> },
    { key: "booked", label: t("m10.col.booked"), render: (z) => <DateText value={z.bookedAt} /> },
    { key: "status", label: t("common.status"), render: (z) => <Badge tone={z.status === "received" ? "ok" : "warn"}>{t(`m10.rec.${z.status}`)}</Badge> },
  ];
  return (
    <div>
      <KpiRow items={[
        { label: t("m10.kpi.recTotal"), value: <Money value={total} /> },
        { label: t("m10.kpi.recDue"), value: <Money value={due} />, tone: "danger" },
        { label: t("m10.kpi.recCount"), value: <span className="num">{recoveries.length}</span> },
        { label: t("m10.kpi.auto"), value: <span className="num">100%</span>, tone: "ok", hint: t("m10.kpi.autoHint") },
      ]} />
      <div className="px-4"><Panel title={t("m10.rec.title")}><div className="-m-3"><DataTable columns={cols} rows={recoveries} onRowClick={(z) => setSel(z.id)} /></div></Panel></div>
      <div className="grid gap-3 p-4 lg:grid-cols-2">
        <div className="grid content-start gap-3">
          <MathPanel x={x} amount={c.approved ?? 0} title={t("m10.rec.math", { id: r.id, claim: c.id })} />
          <Panel title={t("m10.rec.posting")}>
            <Fields cols={1} items={[
              { label: t("m10.fund"), value: <Badge tone="info">{t("fund.PTF")}</Badge> },
              { label: t("m10.rec.journals"), value: <span className="num">{r.journalIds.join(" · ")}</span> },
              { label: t("m10.col.booked"), value: <DateText value={r.bookedAt} /> },
              { label: t("m10.rec.receivedAt"), value: <DateText value={r.receivedAt} /> },
            ]} />
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {r.status === "receivable" && (calls.includes(r.id)
                ? <Badge tone="ok">{t("m10.rec.callSent")}</Badge>
                : <Button variant="primary" onClick={() => setCalls((a) => [...a, r.id])}><Send size={14} aria-hidden />{t(x.type === "excess_of_loss" ? "m10.rec.cashCall" : "m10.rec.advice")}</Button>)}
              <LockedNote text={t("common.locked")} />
            </div>
          </Panel>
        </div>
        <div className="grid content-start gap-3">
          <Panel title={t("m10.sim.title")} actions={<Calculator size={14} className="text-muted" aria-hidden />}>
            <div className="flex flex-wrap items-end gap-2 text-[13px]">
              <label className="grid gap-1"><span className="text-[12px] font-bold text-muted">{t("m10.sim.treaty")}</span>
                <select value={simTreaty} onChange={(e) => setSimTreaty(e.target.value)} className="rounded-md border border-line bg-surface px-2 py-1">
                  {treaties.map((z) => <option key={z.id} value={z.id}>{L.tr(z)}</option>)}
                </select></label>
              <label className="grid gap-1"><span className="text-[12px] font-bold text-muted">{t("m10.sim.amount")}</span>
                <input type="number" min={0} step={1000} value={simAmt} onChange={(e) => setSimAmt(Math.max(0, +e.target.value || 0))}
                  className="num w-36 rounded-md border border-line bg-canvas px-2 py-1" /></label>
            </div>
            <p className="mt-2 text-[12px] text-muted">{t("m10.sim.note")}</p>
          </Panel>
          <MathPanel x={treatyById[simTreaty]} amount={simAmt} title={t("m10.sim.result")} />
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- s4: statement */
const MONTHS = ["2026-07", "2026-08", "2026-09", "2026-10"];
const recTone: Record<RiStatementRow["reconciliation"], Tone> = { confirmed: "ok", difference: "danger", pending: "warn" };

function Statement() {
  const L = useL();
  const { t, pick } = L;
  const [cp, setCp] = useState("RC-01");
  const [month, setMonth] = useState("2026-10");
  const [sent, setSent] = useState<string[]>([]);
  const rows = riStatements.filter((r) => r.counterpartyId === cp).map((r) => ({ ...r, id: `${r.counterpartyId}:${r.month}` }));
  const cur = rows.find((r) => r.month === month);
  const share = (treatyId: string) => (treatyById[treatyId].shares.find((s) => s.counterpartyId === cp)?.pct ?? 0) / 100;
  const lines = cessions.filter((c) => c.date.slice(0, 7) === month && c.policyId && share(c.treatyId) > 0)
    .map((c) => ({ ...c, cpCeded: round3(c.ceded * share(c.treatyId)), cpComm: round3(c.commission * share(c.treatyId)) }));
  const xolLines = cessions.filter((c) => c.date.slice(0, 7) === month && !c.policyId && share(c.treatyId) > 0);
  const sampleCeded = round3(lines.reduce((s, l) => s + l.cpCeded, 0) + xolLines.reduce((s, l) => s + l.ceded * share(l.treatyId), 0));
  const bookCeded = cur ? round3(cur.contributionsCeded - sampleCeded) : 0;
  const cols: Column<RiStatementRow & { id: string }>[] = [
    { key: "m", label: t("m10.st.month"), render: (r) => <span className="num font-bold">{r.month}</span> },
    { key: "o", label: t("m10.st.opening"), align: "end", render: (r) => <Money value={r.opening} /> },
    { key: "c", label: t("m10.st.ceded"), align: "end", render: (r) => <Money value={r.contributionsCeded} /> },
    { key: "k", label: t("m10.st.commission"), align: "end", render: (r) => <Money value={-r.commission} /> },
    { key: "r", label: t("m10.st.recoveries"), align: "end", render: (r) => <Money value={-r.recoveriesBooked} /> },
    { key: "p", label: t("m10.st.cashPaid"), align: "end", render: (r) => <Money value={-r.cashPaid} /> },
    { key: "x", label: t("m10.st.cashReceived"), align: "end", render: (r) => <Money value={r.cashReceived} /> },
    { key: "cl", label: t("m10.st.closing"), align: "end", render: (r) => <Money value={r.closing} strong /> },
    { key: "s", label: t("m10.st.recon"), render: (r) => <Badge tone={sent.includes(r.id) ? "info" : recTone[r.reconciliation]}>{t(sent.includes(r.id) ? "m10.st.sent" : `m10.recon.${r.reconciliation}`)}</Badge> },
  ];
  type BLine = (typeof lines)[number];
  const bCols: Column<BLine>[] = [
    { key: "cert", label: t("m10.col.cert"), render: (l) => <span className={`num ${l.policyId === STORY.policyId ? "font-bold text-brand-deep" : ""}`}>{policyById[l.policyId!].certNo}</span> },
    { key: "date", label: t("common.date"), render: (l) => <DateText value={l.date} /> },
    { key: "tr", label: t("m10.col.treaty"), render: (l) => <span className="num">{l.treatyId}</span> },
    { key: "base", label: t("m10.col.base"), align: "end", render: (l) => <Money value={l.base} /> },
    { key: "ceded", label: t("m10.st.cpCeded"), align: "end", render: (l) => <Money value={l.cpCeded} /> },
    { key: "comm", label: t("m10.st.cpComm"), align: "end", render: (l) => <Money value={l.cpComm} /> },
  ];
  return (
    <div>
      <ControlPanel title={t("m10.st.title")}
        filters={counterparties.map((c) => ({ id: c.id, label: pick(c.nameAr, c.nameEn), active: c.id === cp, onClick: () => setCp(c.id) }))} />
      <DataTable columns={cols} rows={rows} onRowClick={(r) => setMonth(r.month)} />
      {cur && (
        <div className="grid gap-3 p-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <Panel title={t("m10.st.bordereau", { m: month })}>
            <div className="-m-3">
              <DataTable columns={bCols} rows={lines} empty={t("m10.st.noLines")}
                footer={
                  <>
                    {xolLines.map((l) => (
                      <tr key={l.id}><td className="px-3 py-1.5" colSpan={4}>{t("m10.st.xolDeposit")}</td><td className="px-3 py-1.5 text-end"><Money value={round3(l.ceded * share(l.treatyId))} /></td><td /></tr>
                    ))}
                    <tr><td className="px-3 py-1.5" colSpan={4}>{t("m10.st.book")}</td><td className="px-3 py-1.5 text-end"><Money value={bookCeded} /></td><td /></tr>
                    <tr><td className="px-3 py-1.5" colSpan={4}>{t("common.total")}</td><td className="px-3 py-1.5 text-end"><Money value={cur.contributionsCeded} strong /></td><td /></tr>
                  </>
                } />
            </div>
          </Panel>
          <Panel title={t("m10.st.summary", { m: month })}>
            <Fields cols={1} items={[
              { label: t("m10.st.opening"), value: <Money value={cur.opening} /> },
              { label: t("m10.st.ceded"), value: <Money value={cur.contributionsCeded} /> },
              { label: t("m10.st.commission"), value: <Money value={-cur.commission} /> },
              { label: t("m10.st.recoveries"), value: <Money value={-cur.recoveriesBooked} /> },
              { label: t("m10.st.cashPaid"), value: <Money value={-cur.cashPaid} /> },
              { label: t("m10.st.cashReceived"), value: <Money value={cur.cashReceived} /> },
              { label: t("m10.st.closing"), value: <Money value={cur.closing} strong /> },
              { label: t("m10.fund"), value: <Badge tone="info">{t("fund.PTF")}</Badge> },
            ]} />
            <p className="mt-2 text-[12px] text-muted">{t(cur.closing >= 0 ? "m10.st.weOwe" : "m10.st.theyOwe")}</p>
            {cur.differenceNoteAr && <div className="mt-2 rounded-md bg-danger-soft px-3 py-2 text-[13px] text-danger">{pick(cur.differenceNoteAr, cur.differenceNoteEn)}</div>}
            <div className="mt-3 flex flex-wrap gap-2">
              {sent.includes(cur.id) ? <Badge tone="info">{t("m10.st.sent")}</Badge> : (
                <Button variant="primary" onClick={() => setSent((s) => [...s, cur.id])}><Send size={14} aria-hidden />{t("m10.st.send")}</Button>
              )}
              <Button>{t("common.export")}</Button>
            </div>
            <p className="mt-2 text-[12px] text-muted">{t("m10.st.note")}</p>
          </Panel>
        </div>
      )}
      <p className="px-4 pb-4 text-[12px] text-muted">{t("m10.st.months", { a: MONTHS[0], b: MONTHS[MONTHS.length - 1] })}</p>
    </div>
  );
}

export const screens: Record<string, ComponentType> = {
  s1: Register,
  s2: TreatyScreen,
  s3: Recoveries,
  s4: Statement,
};
