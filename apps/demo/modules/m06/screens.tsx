"use client";
import { useEffect, useMemo, useState, type ComponentType, type ReactNode } from "react";
import { QrCode, Stamp, PenLine, Timer, CheckCircle2 } from "lucide-react";
import {
  money, Badge, Button, ControlPanel, DataTable, DateText, Donut, Fields, KpiRow, Modal, Money, Panel, Sheet, StatusBar, Timeline, useFilter,
  type Column, type Tone,
} from "@/components/ui";
import { useT } from "@/components/I18n";
import { personaById } from "@/content/personas";
import {
  policies, policyById, customerById, productById, products, splitRules, outletById, agentById, quoteById, receiptsOfPolicy,
  instalmentsOfPolicy, claimsOfPolicy, expiringPolicies, kpis, CLASSES, CLAIM_DOC_LABELS, STORY, TODAY, addDays, round3,
} from "@/data/seed";
import type { Policy, ProductCode, ShariaStatus } from "@/data/types";

/* ---------------- helpers ---------------- */
const SHARIA_TONE: Record<ShariaStatus, Tone> = { compliant: "ok", pending_review: "warn", non_compliant: "danger", purified: "info" };
function ShariaBadge({ s }: { s: ShariaStatus }) {
  const { t } = useT();
  return <Badge tone={SHARIA_TONE[s]}>{t(`sharia.${s}`)}</Badge>;
}
const STATUS_TONE: Record<Policy["status"], Tone> = { active: "ok", expired: "neutral", cancelled: "danger" };
/** Illustrative renewal mode per product until the company answers M06-01. */
const RENEWAL_MODE: Record<ProductCode, "manual" | "offer" | "auto"> = { CMP: "offer", MTR: "offer", ORC: "manual", TRV: "manual", FIR: "offer", MAR: "manual", HAJ: "manual" };
const daysBetween = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 86400000);
function useNames() {
  const { pick } = useT();
  return {
    customer: (id: string) => { const c = customerById[id]; return c ? pick(c.nameAr, c.nameEn) : id; },
    product: (id: ProductCode) => pick(productById[id].nameAr, productById[id].nameEn),
    outlet: (id: string) => { const o = outletById[id]; return o ? pick(o.nameAr, o.nameEn) : id; },
    persona: (id?: string) => { const p = personaById(id); return p ? pick(p.nameAr, p.nameEn) : ""; },
  };
}

/* ---------------- s1: certificates list + record ---------------- */
type PFilter = "all" | Policy["status"] | "motor";
const polText = (p: Policy) => `${p.certNo} ${p.id} ${customerById[p.customerId]?.nameAr ?? ""} ${customerById[p.customerId]?.nameEn ?? ""} ${p.riskAr} ${p.riskEn}`;
function Certificates() {
  const { t } = useT();
  const n = useNames();
  const [filter, setFilter] = useState<PFilter>("all");
  const [open, setOpen] = useState<string | null>(null);
  const base = useMemo(() => {
    const list = policies.filter((p) => filter === "all" ? true : filter === "motor" ? ["CMP", "MTR", "ORC"].includes(p.productId) : p.status === filter);
    return [...list].sort((a, b) => (a.id === STORY.policyId ? -1 : b.id === STORY.policyId ? 1 : b.issuedAt.localeCompare(a.issuedAt)));
  }, [filter]);
  const { rows, setQ } = useFilter(base, polText);
  if (open) return <PolicyRecord id={open} onBack={() => setOpen(null)} />;
  const cols: Column<Policy>[] = [
    { key: "cert", label: t("m06.col.cert"), render: (p) => <span className="num font-bold text-brand-deep">{p.certNo}</span> },
    { key: "cust", label: t("m06.col.customer"), render: (p) => <span>{n.customer(p.customerId)}{p.id === STORY.policyId && <span className="ms-2"><Badge tone="info">{t("m06.hero")}</Badge></span>}</span> },
    { key: "prod", label: t("m06.col.product"), render: (p) => n.product(p.productId) },
    { key: "outlet", label: t("m06.col.outlet"), render: (p) => n.outlet(p.outletId) },
    { key: "period", label: t("m06.col.period"), render: (p) => <span className="num whitespace-nowrap">{p.start} → {p.end}</span> },
    { key: "amt", label: t("m06.col.contribution"), align: "end", render: (p) => <Money value={p.contribution} /> },
    { key: "st", label: t("common.status"), render: (p) => <Badge tone={STATUS_TONE[p.status]}>{t(`m06.status.${p.status}`)}</Badge> },
    { key: "sh", label: t("sharia.label"), render: (p) => <ShariaBadge s={p.sharia_status} /> },
  ];
  const f = (id: PFilter, label: string) => ({ id, label, active: filter === id, onClick: () => setFilter(id) });
  return (
    <div>
      <ControlPanel title={t("m06.s1.title")} onSearch={setQ}
        filters={[f("all", t("common.all")), f("active", t("m06.status.active")), f("expired", t("m06.status.expired")), f("cancelled", t("m06.status.cancelled")), f("motor", t("m06.f.motor"))]} />
      <DataTable columns={cols} rows={rows} onRowClick={(p) => setOpen(p.id)} />
    </div>
  );
}

function PolicyRecord({ id, onBack }: { id: string; onBack: () => void }) {
  const { t, pick } = useT();
  const n = useNames();
  const p = policyById[id];
  const prod = productById[p.productId];
  const q = p.quoteId ? quoteById[p.quoteId] : undefined;
  const rcs = receiptsOfPolicy(p.id);
  const ins = instalmentsOfPolicy(p.id);
  const cls = claimsOfPolicy(p.id);
  const agent = p.agentId ? agentById[p.agentId] : undefined;
  const stages = [
    { id: "quote", label: t("m06.st.quote") }, { id: "issued", label: t("m06.st.issued") },
    { id: "active", label: t("m06.st.active") }, { id: "ended", label: p.status === "cancelled" ? t("m06.status.cancelled") : t("m06.st.ended") },
  ];
  const tl: { at: string; who?: string; text: ReactNode; tone?: Tone }[] = [];
  if (q) tl.push({ at: q.date, who: agent ? pick(agent.nameAr, agent.nameEn) : undefined, text: t("m06.tl.quote", { id: q.id }) });
  tl.push({ at: `${p.issuedAt} 11:00`, who: n.persona(p.issuedByPersonaId), text: t("m06.tl.issued", { cert: p.certNo }) });
  tl.push({ at: `${p.issuedAt} 11:00`, text: t("m06.tl.pdf"), tone: "ok" });
  rcs.forEach((r) => tl.push({ at: r.date, text: t("m06.tl.receipt", { id: r.id }) }));
  cls.forEach((c) => tl.push({ at: c.registeredAt, text: t("m06.tl.claim", { id: c.id }), tone: "warn" }));
  if (p.status === "active" && addDays(p.end, -30) <= TODAY) tl.push({ at: addDays(p.end, -30), text: t("m06.tl.alert") });
  if (p.cancelledAt) tl.push({ at: p.cancelledAt, text: pick(p.cancelReasonAr ?? "", p.cancelReasonEn), tone: "danger" });
  tl.sort((a, b) => b.at.localeCompare(a.at));
  return (
    <Sheet
      title={<span className="num">{p.certNo}</span>}
      subtitle={`${n.product(p.productId)} · ${n.customer(p.customerId)}`}
      status={<span className="flex flex-wrap gap-1"><Badge tone={STATUS_TONE[p.status]}>{t(`m06.status.${p.status}`)}</Badge><ShariaBadge s={p.sharia_status} /></span>}
      actions={<><Button variant="ghost" onClick={onBack}>{t("m06.back")}</Button><Button>{t("m06.pdf")}</Button><Button>{t("m06.endorse")}</Button></>}
      side={<Timeline title={t("common.activity")} items={tl} />}
    >
      <div className="mb-4"><StatusBar stages={stages} current={p.status === "active" ? "active" : "ended"} /></div>
      <Fields items={[
        { label: t("m06.col.customer"), value: <span>{n.customer(p.customerId)} <span className="num text-muted">({p.customerId})</span></span> },
        { label: t("m06.f.risk"), value: pick(p.riskAr, p.riskEn) },
        { label: t("m06.f.sumInsured"), value: <Money value={p.sumInsured} /> },
        { label: t("m06.col.period"), value: <span className="num">{p.start} → {p.end}</span> },
        { label: t("m06.col.outlet"), value: n.outlet(p.outletId) },
        { label: t("m06.f.agent"), value: agent ? pick(agent.nameAr, agent.nameEn) : t("m06.f.direct") },
        { label: t("m06.f.quote"), value: <span className="num">{p.quoteId ?? "—"}</span> },
        { label: t("m06.f.renewalOf"), value: <span className="num">{p.renewalOfId ? policyById[p.renewalOfId].certNo : "—"}</span> },
        { label: t("m06.f.plan"), value: t(`m06.plan.${p.billingPlan}`) },
        { label: t("m06.f.splitRule"), value: <span className="num">{p.splitRuleId}</span> },
        { label: t("m06.f.ssb"), value: <span className="num">{prod.ssbResolutionId}</span> },
        { label: t("m06.f.issuedBy"), value: n.persona(p.issuedByPersonaId) },
      ]} />
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <Panel title={t("m06.split.title")}>
          <Fields cols={1} items={[
            { label: t("m06.split.gross"), value: <Money value={p.contribution} /> },
            { label: t("m06.split.surplus"), value: <Money value={-p.surplusCredit} /> },
            { label: t("m06.split.net"), value: <Money value={p.netPayable} strong /> },
            { label: `${t("m06.split.tabarru")} ${100 - p.wakalaPct}%`, value: <span className="flex flex-wrap items-center gap-2"><Money value={p.tabarru} /><Badge tone="ok">{t("fund.PTF")}</Badge></span> },
            { label: `${t("m06.split.wakala")} ${p.wakalaPct}%`, value: <span className="flex flex-wrap items-center gap-2"><Money value={p.wakala} /><Badge tone="info">{t("fund.SHF")}</Badge></span> },
          ]} />
        </Panel>
        <Panel title={t("m06.ins.title")}>
          <DataTable rows={ins} columns={[
            { key: "seq", label: "#", render: (i) => <span className="num">{i.seq}</span> },
            { key: "due", label: t("m06.ins.due"), render: (i) => <DateText value={i.dueDate} /> },
            { key: "amt", label: t("common.amount"), align: "end", render: (i) => <Money value={i.amount} /> },
            { key: "st", label: t("common.status"), render: (i) => <Badge tone={i.status === "paid" ? "ok" : i.status === "overdue" ? "danger" : "neutral"}>{t(`m06.ins.${i.status}`)}</Badge> },
          ]} />
        </Panel>
      </div>
    </Sheet>
  );
}

/* ---------------- s2: 60-second issue wizard ---------------- */
type Veh = "car_small" | "car_large" | "bus" | "truck";
const VEH_TARIFF: Record<Veh, number> = { car_small: 165, car_large: 210, bus: 380, truck: 420 };
const CMP_DEMO_CERT = "TK-CMP-2026-091447";
const AUTO_ACCEPT_LIMIT = 150000;

function Bi({ k, value }: { k: string; value: ReactNode }) {
  const { t } = useT();
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-baseline gap-2 border-b border-line/60 py-1 text-[12px]">
      <span dir="rtl" className="text-start font-bold text-muted">{t(`${k}.ar`)}</span>
      <span className="text-center font-bold text-ink">{value}</span>
      <span dir="ltr" className="text-start font-bold text-muted">{t(`${k}.en`)}</span>
    </div>
  );
}

function IssueWizard() {
  const { t, pick } = useT();
  const hero = customerById[STORY.customerId];
  const heroPol = policyById[STORY.policyId];
  const [step, setStep] = useState(0);
  const [prod, setProd] = useState<"MTR" | "CMP">("MTR");
  const [veh, setVeh] = useState<Veh>("car_small");
  const [value, setValue] = useState(heroPol.sumInsured);
  const [plan, setPlan] = useState<"single" | "2_instalments">("2_instalments");
  const [secs, setSecs] = useState(0);
  const [issued, setIssued] = useState(false);
  useEffect(() => {
    if (issued) return;
    const h = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(h);
  }, [issued]);

  const p = productById[prod];
  const contribution = prod === "MTR" ? round3(Math.max(900, value * 0.035)) : VEH_TARIFF[veh];
  const discount = prod === "MTR" ? STORY.surplusShare : 0;
  const net = round3(contribution - discount);
  const wakala = round3((contribution * p.wakalaPct) / 100);
  const tabarru = round3(contribution - wakala);
  const referred = prod === "MTR" && value > AUTO_ACCEPT_LIMIT;
  const certNo = prod === "MTR" ? STORY.certNo : CMP_DEMO_CERT;
  const steps = [t("m06.wz.s1"), t("m06.wz.s2"), t("m06.wz.s3"), t("m06.wz.s4")];
  const dl = hero.docs.find((d) => d.type === "driving_licence");
  const restart = () => { setStep(0); setIssued(false); setSecs(0); };

  return (
    <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="min-w-0 rounded-lg border border-line bg-surface p-4">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <StatusBar stages={steps.map((s, i) => ({ id: String(i), label: s }))} current={String(step)} />
          <span className={`ms-auto flex items-center gap-1 rounded-full px-3 py-1 text-[13px] font-extrabold ${secs <= 60 ? "bg-ok-soft text-ok" : "bg-warn-soft text-warn"}`}>
            <Timer size={14} aria-hidden /><span className="num">{secs}</span> {t("m06.wz.sec")}
          </span>
        </div>

        {step === 0 && (
          <div className="grid gap-3">
            <Fields items={[
              { label: t("m06.wz.customer"), value: <span className="font-bold">{pick(hero.nameAr, hero.nameEn)} <span className="num text-muted">({hero.id})</span></span> },
              { label: t("m06.wz.nid"), value: <span className="num">{hero.nationalNo}</span> },
              { label: t("m06.wz.phone"), value: <span className="num">{hero.phone}</span> },
              { label: t("m06.wz.licence"), value: <span className="num">{dl?.expiry}</span> },
            ]} />
            <div className="flex flex-wrap gap-2"><Badge tone="ok">{t("m06.wz.noDup")}</Badge><Badge tone="ok">{t("m06.wz.idValid")}</Badge><Badge tone="info">{t("m06.wz.surplus", { n: STORY.surplusShare })}</Badge></div>
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-3">
            <div className="grid gap-2 sm:grid-cols-2">
              {(["CMP", "MTR"] as const).map((x) => (
                <button key={x} type="button" onClick={() => setProd(x)}
                  className={`rounded-lg border p-3 text-start ${prod === x ? "border-brand bg-soft" : "border-line bg-surface"}`}>
                  <div className="font-extrabold text-navy">{pick(productById[x].nameAr, productById[x].nameEn)}</div>
                  <div className="text-[12px] text-muted">{pick(productById[x].ratingAr, productById[x].ratingEn)}</div>
                </button>
              ))}
            </div>
            <Fields cols={1} items={[
              { label: t("m06.wz.vehicle"), value: pick(heroPol.riskAr, heroPol.riskEn) },
              prod === "CMP"
                ? { label: t("m06.wz.class"), value: (
                    <select aria-label={t("m06.wz.class")} value={veh} onChange={(e) => setVeh(e.target.value as Veh)} className="rounded-md border border-line bg-canvas px-2 py-1 text-[13px]">
                      {(Object.keys(VEH_TARIFF) as Veh[]).map((v) => <option key={v} value={v}>{t(`m06.veh.${v}`)}</option>)}
                    </select>) }
                : { label: t("m06.wz.value"), value: (
                    <input type="number" aria-label={t("m06.wz.value")} value={value} min={5000} step={1000} onChange={(e) => setValue(Number(e.target.value) || 0)}
                      className="num w-40 rounded-md border border-line bg-canvas px-2 py-1 text-[13px]" />) },
            ]} />
            {prod === "MTR" && (referred
              ? <p className="rounded-md bg-warn-soft p-2 text-[12px] text-warn">{t("m06.wz.refer")}</p>
              : <p className="rounded-md bg-ok-soft p-2 text-[12px] text-ok">{t("m06.wz.accept")}</p>)}
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-3">
            <Fields cols={1} items={[
              { label: t("m06.split.gross"), value: <Money value={contribution} /> },
              { label: t("m06.split.surplus"), value: <Money value={-discount} /> },
              { label: t("m06.split.net"), value: <Money value={net} strong /> },
              { label: `${t("m06.split.tabarru")} ${p.tabarruPct}%`, value: <span className="flex flex-wrap items-center gap-2"><Money value={tabarru} /><Badge tone="ok">{t("fund.PTF")}</Badge></span> },
              { label: `${t("m06.split.wakala")} ${p.wakalaPct}%`, value: <span className="flex flex-wrap items-center gap-2"><Money value={wakala} /><Badge tone="info">{t("fund.SHF")}</Badge></span> },
              { label: t("m06.f.splitRule"), value: <span className="num">{p.splitRuleId} · {p.ssbResolutionId}</span> },
              { label: t("m06.f.plan"), value: (
                <select aria-label={t("m06.f.plan")} value={plan} onChange={(e) => setPlan(e.target.value as typeof plan)} className="rounded-md border border-line bg-canvas px-2 py-1 text-[13px]">
                  <option value="single">{t("m06.plan.single")}</option><option value="2_instalments">{t("m06.plan.2_instalments")}</option>
                </select>) },
              { label: t("sharia.label"), value: <ShariaBadge s="compliant" /> },
            ]} />
            <p className="text-[12px] text-muted">{t("m06.wz.illustrative")}</p>
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-3">
            <article className="mx-auto w-full max-w-[640px] rounded-lg border-2 border-navy/30 bg-surface p-4 shadow-sm">
              <header className="mb-2 flex flex-wrap items-center justify-between gap-2 border-b border-line pb-2">
                <div dir="rtl" className="text-start"><div className="text-[15px] font-extrabold text-navy">{t("m06.cert.company.ar")}</div><div className="text-[12px] text-muted">{t("m06.cert.title.ar")}</div></div>
                <div dir="ltr" className="text-start"><div className="text-[15px] font-extrabold text-navy">{t("m06.cert.company.en")}</div><div className="text-[12px] text-muted">{t("m06.cert.title.en")}</div></div>
              </header>
              <Bi k="m06.cert.no" value={<span className="num">{certNo}</span>} />
              <Bi k="m06.cert.participant" value={<span>{hero.nameAr}<br /><span dir="ltr">{hero.nameEn}</span></span>} />
              <Bi k="m06.cert.nid" value={<span className="num">{hero.nationalNo}</span>} />
              <Bi k="m06.cert.product" value={<span>{p.nameAr}<br /><span dir="ltr">{p.nameEn}</span></span>} />
              <Bi k="m06.cert.vehicle" value={<span dir="ltr" className="num">{heroPol.riskEn}</span>} />
              <Bi k="m06.cert.period" value={<span dir="ltr" className="num">{heroPol.start} → {heroPol.end}</span>} />
              {prod === "MTR" && <Bi k="m06.cert.sum" value={<span dir="ltr" className="num">{money(value, "en")}</span>} />}
              <Bi k="m06.cert.contribution" value={<span dir="ltr" className="num">{money(net, "en")}</span>} />
              <Bi k="m06.cert.split" value={<span dir="ltr" className="num">{p.tabarruPct}% / {p.wakalaPct}% · {p.splitRuleId}</span>} />
              <Bi k="m06.cert.sharia" value={<Badge tone="ok">{t("m06.cert.compliant")}</Badge>} />
              <p className="mt-2 text-[11px] text-muted">{t("m06.cert.clause")}</p>
              <footer className="mt-3 flex flex-wrap items-end justify-between gap-3">
                <div className="grid justify-items-center gap-1 text-[11px] text-muted"><QrCode size={72} className="text-navy" aria-hidden /><span>{t("m06.cert.qr")}</span></div>
                <div className="grid justify-items-center gap-1 text-[11px] text-muted"><PenLine size={36} className="text-brand-deep" aria-hidden /><span>{t("m06.cert.signature")}</span></div>
                <div className="grid size-20 place-items-center rounded-full border-2 border-dashed border-brand text-brand"><Stamp size={30} aria-hidden /></div>
              </footer>
            </article>
            {issued
              ? <p className="flex items-center gap-2 rounded-md bg-ok-soft p-3 text-[13px] text-ok"><CheckCircle2 size={16} aria-hidden />{t("m06.wz.done", { s: secs, cert: certNo })}</p>
              : null}
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {step > 0 && !issued && <Button onClick={() => setStep(step - 1)}>{t("m06.wz.prev")}</Button>}
          {step < 3 && <Button variant="primary" disabled={step === 1 && referred} onClick={() => setStep(step + 1)}>{t("m06.wz.next")}</Button>}
          {step === 3 && !issued && <Button variant="primary" onClick={() => setIssued(true)}>{t("m06.wz.issue")}</Button>}
          {issued && <Button onClick={restart}>{t("m06.wz.again")}</Button>}
        </div>
      </div>
      <aside className="grid content-start gap-3">
        <Panel title={t("m06.wz.side")}>
          <ul className="grid gap-1.5 text-[12px]">
            {["1", "2", "3", "4", "5"].map((k) => <li key={k} className="flex gap-2"><CheckCircle2 size={14} className="mt-0.5 shrink-0 text-ok" aria-hidden />{t(`m06.wz.point.${k}`)}</li>)}
          </ul>
        </Panel>
      </aside>
    </div>
  );
}

/* ---------------- s3: renewals ---------------- */
type RenewRow = Policy & { daysLeft: number; firstAlert: string };
function Renewals() {
  const { t, pick } = useT();
  const n = useNames();
  const [second, setSecond] = useState<Record<string, string>>({});
  const [scan, setScan] = useState<string | null>(null);
  const rows: RenewRow[] = useMemo(() => expiringPolicies(30).map((p) => ({ ...p, daysLeft: daysBetween(TODAY, p.end), firstAlert: addDays(p.end, -30) })).sort((a, b) => a.end.localeCompare(b.end)), []);
  const channels = (p: Policy) => customerById[p.customerId]?.type === "company" ? ["sms", "email"] : ["sms"];
  const dueSecond = rows.filter((r) => r.daysLeft <= 7 && !second[r.id]).length;
  const last = kpis[kpis.length - 1];
  const runScan = () => {
    const target = addDays(TODAY, 30);
    const found = policies.filter((p) => p.status === "active" && p.end === target).length;
    setScan(t("m06.rn.scanResult", { date: target, n: found, m: rows.length }));
  };
  const log = [
    ...Object.entries(second).map(([id, at]) => ({ at, id, kind: "second" as const })),
    ...rows.map((r) => ({ at: `${r.firstAlert} 06:00`, id: r.id, kind: "first" as const })),
  ].sort((a, b) => b.at.localeCompare(a.at));
  return (
    <div>
      <KpiRow items={[
        { label: t("m06.rn.k.due"), value: rows.length },
        { label: t("m06.rn.k.sent"), value: rows.length, tone: "ok", hint: t("m06.rn.k.sentH") },
        { label: t("m06.rn.k.second"), value: dueSecond, tone: dueSecond ? "danger" : "ok" },
        { label: t("m06.rn.k.rate"), value: `${last.renewalRatePct}%`, hint: last.month },
      ]} />
      <div className="grid gap-4 px-4 pb-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 overflow-hidden rounded-lg border border-line">
          <ControlPanel title={t("m06.rn.title")} actions={<Button variant="primary" onClick={runScan}>{t("m06.rn.scan")}</Button>} />
          {scan && <p className="bg-ok-soft px-4 py-2 text-[12px] text-ok">{scan}</p>}
          <DataTable rows={rows} columns={[
            { key: "cert", label: t("m06.col.cert"), render: (r) => <span className="num font-bold">{r.certNo}</span> },
            { key: "cust", label: t("m06.col.customer"), render: (r) => n.customer(r.customerId) },
            { key: "prod", label: t("m06.col.product"), render: (r) => n.product(r.productId) },
            { key: "end", label: t("m06.rn.end"), render: (r) => <DateText value={r.end} /> },
            { key: "left", label: t("m06.rn.left"), align: "center", render: (r) => <Badge tone={r.daysLeft <= 7 ? "danger" : r.daysLeft <= 14 ? "warn" : "neutral"}>{t("m06.rn.days", { n: r.daysLeft })}</Badge> },
            { key: "mode", label: t("m06.rn.mode"), render: (r) => t(`m06.mode.${RENEWAL_MODE[r.productId]}`) },
            { key: "ch", label: t("m06.rn.channel"), render: (r) => <span className="flex gap-1">{channels(r).map((c) => <Badge key={c} tone="info">{t(`m06.ch.${c}`)}</Badge>)}</span> },
            { key: "first", label: t("m06.rn.first"), render: (r) => <Badge tone="ok">{t("m06.rn.sentOn", { d: r.firstAlert })}</Badge> },
            { key: "second", label: t("m06.rn.second"), render: (r) => second[r.id]
              ? <Badge tone="ok">{t("m06.rn.sentNow")}</Badge>
              : r.daysLeft <= 7 ? <Button onClick={() => setSecond((s) => ({ ...s, [r.id]: `${TODAY} 09:30` }))}>{t("m06.rn.send")}</Button>
              : <span className="text-[12px] text-muted">{t("m06.rn.scheduled", { d: addDays(r.end, -7) })}</span> },
          ]} />
        </div>
        <Timeline title={t("m06.rn.log")} items={log.map((l) => {
          const p = policyById[l.id];
          const c = customerById[p.customerId];
          return { at: l.at, who: t("m06.rn.scheduler"), tone: l.kind === "second" ? "info" : "ok",
            text: t(l.kind === "first" ? "m06.rn.logFirst" : "m06.rn.logSecond", { phone: c.phone, cert: p.certNo, name: pick(c.nameAr, c.nameEn) }) };
        })} />
      </div>
    </div>
  );
}

/* ---------------- s4: products & split rules ---------------- */
function Products() {
  const { t, pick } = useT();
  const [sel, setSel] = useState<ProductCode>("MTR");
  const [editOpen, setEditOpen] = useState(false);
  const p = productById[sel];
  const versions = splitRules.filter((r) => r.productId === sel).sort((a, b) => b.version - a.version);
  return (
    <div>
      <ControlPanel title={t("m06.s4.title")} actions={<Button onClick={() => setEditOpen(true)}>{t("m06.pr.edit")}</Button>} />
      <p className="bg-warn-soft px-4 py-2 text-[12px] text-warn">{t("m06.pr.note")}</p>
      <DataTable rows={products} onRowClick={(x) => setSel(x.id)} columns={[
        { key: "name", label: t("m06.col.product"), render: (x) => <span className={`font-bold ${x.id === sel ? "text-brand-deep" : ""}`}>{pick(x.nameAr, x.nameEn)}</span> },
        { key: "class", label: t("m06.pr.class"), render: (x) => pick(...CLASSES[x.classCode]) },
        { key: "comp", label: t("m06.pr.type"), render: (x) => x.compulsory ? <Badge tone="warn">{t("m06.pr.compulsory")}</Badge> : <Badge tone="neutral">{t("m06.pr.optional")}</Badge> },
        { key: "rating", label: t("m06.pr.rating"), render: (x) => <span className="text-[12px]">{pick(x.ratingAr, x.ratingEn)}</span> },
        { key: "tab", label: t("m06.split.tabarru"), align: "center", render: (x) => <span className="num">{x.tabarruPct}%</span> },
        { key: "wak", label: t("m06.split.wakala"), align: "center", render: (x) => <span className="num font-bold">{x.wakalaPct}%</span> },
        { key: "rule", label: t("m06.f.splitRule"), render: (x) => <span className="num">{x.splitRuleId}</span> },
        { key: "mode", label: t("m06.rn.mode"), render: (x) => t(`m06.mode.${RENEWAL_MODE[x.id]}`) },
        { key: "badges", label: t("common.status"), render: (x) => <span className="flex flex-wrap gap-1"><Badge tone="ok">{t("m06.pr.ssb")}</Badge>{x.illustrative && <Badge tone="warn">{t("m06.pr.illustrative")}</Badge>}</span> },
      ]} />
      <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_260px]">
        <Panel title={t("m06.pr.versions", { p: pick(p.nameAr, p.nameEn) })}>
          <DataTable rows={versions} columns={[
            { key: "id", label: t("m06.f.splitRule"), render: (r) => <span className="num">{r.id}</span> },
            { key: "v", label: t("m06.pr.version"), align: "center", render: (r) => <span className="num">v{r.version}</span> },
            { key: "w", label: t("m06.split.wakala"), align: "center", render: (r) => <span className="num">{r.wakalaPct}%</span> },
            { key: "f", label: t("m06.pr.from"), render: (r) => <DateText value={r.effectiveFrom} /> },
            { key: "ssb", label: t("m06.f.ssb"), render: (r) => <span className="num">{r.ssbResolutionId}</span> },
            { key: "st", label: t("common.status"), render: (r) => <Badge tone={r.status === "approved" ? "ok" : r.status === "draft" ? "warn" : "neutral"}>{t(`m06.pr.st.${r.status}`)}</Badge> },
          ]} />
          <p className="mt-2 text-[12px] text-muted">{t("m06.pr.keep")}</p>
        </Panel>
        <Panel title={t("m06.pr.setup")}>
          <Fields cols={1} items={[
            { label: t("m06.pr.prefix"), value: <span className="num">{p.certPrefix}-2026-000000</span> },
            { label: t("m06.pr.treaties"), value: <span className="num">{p.treatyIds.join(" · ") || t("m06.pr.noTreaty")}</span> },
            { label: t("m06.f.ssb"), value: <span className="num">{p.ssbResolutionId}</span> },
            { label: t("sharia.label"), value: <ShariaBadge s={p.sharia_status} /> },
            { label: t("m06.pr.docs"), value: <span className="flex flex-wrap gap-1">{p.claimDocs.map((d) => <Badge key={d} tone="neutral">{pick(...CLAIM_DOC_LABELS[d])}</Badge>)}</span> },
          ]} />
        </Panel>
        <Panel title={t("m06.pr.donut")}>
          <Donut data={[
            { label: `${t("m06.split.tabarru")} → ${t("fund.PTF")}`, value: p.tabarruPct, color: "var(--color-brand)" },
            { label: `${t("m06.split.wakala")} → ${t("fund.SHF")}`, value: p.wakalaPct, color: "var(--color-accent)" },
          ]} />
        </Panel>
      </div>
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title={t("m06.pr.edit")}>
        <ol className="grid list-decimal gap-1 ps-5 text-[13px]">
          {["1", "2", "3", "4"].map((k) => <li key={k}>{t(`m06.pr.path.${k}`)}</li>)}
        </ol>
      </Modal>
    </div>
  );
}

export const screens: Record<string, ComponentType> = {
  s1: Certificates,
  s2: IssueWizard,
  s3: Renewals,
  s4: Products,
};
