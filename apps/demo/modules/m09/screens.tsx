"use client";
import { useState, type ComponentType } from "react";
import { ArrowRight, Camera, CheckCircle2, Circle, MapPin, Plus, Send } from "lucide-react";
import { useT } from "@/components/I18n";
import { personaById } from "@/content/personas";
import {
  Badge, BarChart, Button, ControlPanel, DataTable, DateText, Fields, GuardButton, Kanban, KpiRow, LockedNote, Money, Panel, Sheet,
  StatusBar, Timeline, type Column, type Tone,
} from "@/components/ui";
import {
  approvalMatrix, claimById, claims, CLAIM_DOC_LABELS, CLAIM_STAGE_LABELS, CLAIM_STAGES, customerById, isWorkingDay, kpis, outletById,
  policyById, productById, recoveriesOfClaim, STORY, surveyorById, treatyById, TODAY, addDays,
} from "@/data/seed";
import type { Claim, ClaimDocKey, ClaimStage } from "@/data/seed";

/* ---------------------------------------------------------------- helpers */
const isOpen = (c: Claim) => !c.rejected && !c.stageDates.paid;
const amountOf = (c: Claim) => c.paid ?? c.approved ?? (c.assessed !== undefined ? c.assessed - c.deductible : c.reserve);
function slaTone(c: Claim): Tone {
  if (c.rejected) return "neutral";
  if (c.slaWorkingDays > c.slaTarget) return "danger";
  if (isOpen(c) && c.slaWorkingDays >= 3) return "warn";
  return "ok";
}
/** Hero assessment lines (SV-01): sums to the assessed 18,400. */
const HERO_LINES = [
  { k: "bumper", qty: 1, price: 3900 },
  { k: "bootLid", qty: 1, price: 5200 },
  { k: "tailLights", qty: 2, price: 1450 },
  { k: "labour", qty: 1, price: 4000 },
  { k: "paint", qty: 1, price: 2400 },
];
const linesOf = (c: Claim) =>
  c.id === STORY.claimId ? HERO_LINES : [{ k: "survey", qty: 1, price: c.assessed ?? c.reserve }];

function useL() {
  const { t, pick, lang } = useT();
  const stageLabel = (s: ClaimStage | "rejected") => pick(...CLAIM_STAGE_LABELS[s]);
  const cust = (c: Claim) => { const x = customerById[c.customerId]; return x ? pick(x.nameAr, x.nameEn) : c.customerId; };
  const prod = (c: Claim) => pick(productById[c.productId].nameAr, productById[c.productId].nameEn);
  const persona = (id?: string) => { const p = personaById(id); return p ? pick(p.nameAr, p.nameEn) : ""; };
  const stages = CLAIM_STAGES.map((id) => ({ id, label: stageLabel(id) }));
  return { t, pick, lang, stageLabel, cust, prod, persona, stages };
}

function SlaBadge({ c }: { c: Claim }) {
  const { t } = useT();
  return <Badge tone={slaTone(c)}>{t("m09.sla.days", { n: c.slaWorkingDays })}</Badge>;
}

/* ---------------------------------------------------------------- s1: board */
function Board() {
  const L = useL();
  const [open, setOpen] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [onlyRisk, setOnlyRisk] = useState(false);
  if (open)
    return (
      <div>
        <div className="border-b border-line bg-surface px-4 py-2">
          <Button variant="ghost" onClick={() => setOpen(null)}><ArrowRight size={14} className="ltr:rotate-180" aria-hidden />{L.t("m09.board.back")}</Button>
        </div>
        <ClaimRecord key={open} id={open} />
      </div>
    );
  const n = q.trim().toLowerCase();
  const list = claims.filter((c) => (!n || `${c.id} ${L.cust(c)} ${L.prod(c)}`.toLowerCase().includes(n)) && (!onlyRisk || (isOpen(c) && c.slaWorkingDays >= 3)));
  const columns = [
    ...CLAIM_STAGES.map((s) => ({ id: s, label: L.stageLabel(s), tone: (s === "closed" ? "ok" : "info") as Tone })),
    { id: "rejected", label: L.stageLabel("rejected"), tone: "danger" as Tone },
  ];
  return (
    <div>
      <ControlPanel title={L.t("m09.board.title")} onSearch={setQ}
        filters={[
          { id: "all", label: L.t("common.all"), active: !onlyRisk, onClick: () => setOnlyRisk(false) },
          { id: "risk", label: L.t("m09.board.atRisk"), active: onlyRisk, onClick: () => setOnlyRisk(true) },
        ]} />
      <Kanban columns={columns} cards={list.map((c) => ({ ...c, column: c.rejected ? "rejected" : c.stage }))} onCardClick={(c) => setOpen(c.id)}
        renderCard={(c) => (
          <div className="grid gap-1">
            <div className="flex items-center gap-1"><span className="num font-bold text-navy">{c.id}</span>
              {c.id === STORY.claimId && <span className="ms-auto"><Badge tone="brand">{L.t("m09.story")}</Badge></span>}</div>
            <div className="truncate">{L.cust(c)}</div>
            <div className="truncate text-muted">{L.prod(c)}</div>
            <div className="flex items-center justify-between gap-1"><Money value={amountOf(c)} /><SlaBadge c={c} /></div>
          </div>
        )} />
    </div>
  );
}

/* ---------------------------------------------------------------- s2: record */
function ClaimRecord({ id }: { id: string }) {
  const L = useL();
  const { t, pick } = L;
  const c = claimById[id];
  const pol = policyById[c.policyId];
  const [stage, setStage] = useState<ClaimStage>(c.stage);
  const [rejected, setRejected] = useState(c.rejected);
  const [docs, setDocs] = useState(c.docs);
  const [msg, setMsg] = useState<{ tone: Tone; text: string } | null>(null);
  const [events, setEvents] = useState<{ at: string; text: string }[]>([]);
  const idx = CLAIM_STAGES.indexOf(stage);
  const missing = docs.filter((d) => !d.received);
  const recs = recoveriesOfClaim(c.id);
  const lines = linesOf(c);
  const linesTotal = lines.reduce((s, l) => s + l.qty * l.price, 0);
  const net = linesTotal - c.deductible;
  const approver = approvalMatrix.find((a) => a.area === "claims" && a.level === c.approverLevel);
  const reserveNow = rejected || idx >= 4 ? 0 : idx >= 2 ? net : c.reserve;
  const paidNow = idx >= 4 && !rejected;
  const payJournal = c.journalIds[c.journalIds.length - 1];

  const log = (text: string) => setEvents((e) => [...e, { at: `${TODAY} ${String(9 + e.length).padStart(2, "0")}:00`, text }]);
  const advance = () => {
    if (rejected || idx >= CLAIM_STAGES.length - 1) return;
    if (stage === "review" && missing.length) { setMsg({ tone: "warn", text: t("m09.rec.msg.docs", { n: missing.length }) }); return; }
    const next = CLAIM_STAGES[idx + 1];
    setStage(next);
    const text = next === "approved" ? t("m09.rec.msg.approved", { level: approver ? pick(approver.levelAr, approver.levelEn) : "" })
      : next === "paid" ? t("m09.rec.msg.paid") : next === "closed" ? t("m09.rec.msg.closed") : t("m09.rec.msg.moved", { stage: L.stageLabel(next) });
    setMsg({ tone: "ok", text });
    log(text);
  };
  const reject = () => { setRejected(true); setMsg({ tone: "danger", text: t("m09.rec.msg.rejected") }); log(t("m09.rec.msg.rejected")); };

  const tl = [
    ...c.timeline.map((e) => ({ at: e.at.replace("T", " "), who: L.persona(e.byPersonaId), text: <><b>{L.stageLabel(e.stage)}</b> · {pick(e.noteAr, e.noteEn)}</>, tone: undefined })),
    ...events.map((e) => ({ at: e.at, who: t("m09.rec.demoUser"), text: e.text })),
  ];
  const sv = c.surveyorId ? surveyorById[c.surveyorId] : undefined;

  return (
    <Sheet
      title={<span className="num">{c.id}</span>}
      subtitle={`${L.cust(c)} · ${L.prod(c)} · ${pol.certNo}`}
      status={rejected ? <Badge tone="danger">{L.stageLabel("rejected")}</Badge> : <StatusBar stages={L.stages} current={stage} />}
      actions={
        <>
          <Button variant="primary" onClick={advance} disabled={rejected || idx >= CLAIM_STAGES.length - 1}>
            {idx < CLAIM_STAGES.length - 1 ? t("m09.rec.advance", { stage: L.stageLabel(CLAIM_STAGES[idx + 1]) }) : L.stageLabel("closed")}
          </Button>
          {!rejected && idx >= 1 && idx <= 3 && <Button variant="danger" onClick={reject}>{t("common.reject")}</Button>}
        </>
      }
      side={
        <div className="grid gap-3">
          <Panel title={t("m09.sla.title")}>
            <div className="flex items-center gap-2"><SlaBadge c={c} /><span className="text-[12px] text-muted">{t("m09.sla.target")}</span></div>
            <p className="mt-2 text-[12px] text-muted">{t("m09.sla.calendar")}</p>
          </Panel>
          <Timeline title={t("common.activity")} items={tl} />
        </div>
      }
    >
      {msg && <div className={`mb-3 rounded-md px-3 py-2 text-[13px] ${msg.tone === "ok" ? "bg-ok-soft text-ok" : msg.tone === "warn" ? "bg-warn-soft text-warn" : "bg-danger-soft text-danger"}`}>{msg.text}</div>}
      {rejected && c.rejectReasonAr && <div className="mb-3 rounded-md bg-danger-soft px-3 py-2 text-[13px] text-danger">{t("m09.rec.rejectReason")}: {pick(c.rejectReasonAr, c.rejectReasonEn)}</div>}
      <Fields items={[
        { label: t("m09.f.cert"), value: <span className="num">{pol.certNo}</span> },
        { label: t("m09.f.customer"), value: L.cust(c) },
        { label: t("m09.f.lossDate"), value: <DateText value={c.lossDate} /> },
        { label: t("m09.f.registered"), value: <DateText value={c.registeredAt} /> },
        { label: t("common.branch"), value: pick(outletById[c.outletId].nameAr, outletById[c.outletId].nameEn) },
        { label: t("m09.f.location"), value: pick(c.locationAr, c.locationEn) },
        { label: t("m09.f.surveyor"), value: sv ? pick(sv.nameAr, sv.nameEn) : <span className="text-muted">—</span> },
        { label: t("sharia.label"), value: <Badge tone="ok">{t(`sharia.${c.sharia_status}`)}</Badge> },
      ]} />
      <p className="mt-3 rounded-md bg-canvas px-3 py-2 text-[13px]">{pick(c.descriptionAr, c.descriptionEn)}</p>

      <div className="mt-4 grid gap-3 xl:grid-cols-2">
        <Panel title={t("m09.docs.title")} actions={<Badge tone={missing.length ? "warn" : "ok"}>{t("m09.docs.count", { a: docs.length - missing.length, b: docs.length })}</Badge>}>
          <ul className="grid gap-1.5 text-[13px]">
            {docs.map((d) => (
              <li key={d.key} className="flex items-center gap-2">
                {d.received ? <CheckCircle2 size={16} className="text-ok" aria-hidden /> : <Circle size={16} className="text-warn" aria-hidden />}
                <span>{pick(...CLAIM_DOC_LABELS[d.key as ClaimDocKey])}</span>
                <span className="ms-auto">
                  {d.received ? <DateText value={d.receivedAt} /> : (
                    <Button variant="ghost" onClick={() => setDocs((all) => all.map((x) => (x.key === d.key ? { ...x, received: true, receivedAt: TODAY } : x)))}>{t("m09.docs.receive")}</Button>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title={t("m09.assess.title")}>
          {c.assessed === undefined && idx < 2 ? <p className="text-[13px] text-muted">{t("m09.assess.none")}</p> : (
            <table className="w-full text-[13px]">
              <tbody>
                {lines.map((l) => (
                  <tr key={l.k} className="border-b border-line/60">
                    <td className="py-1">{t(`m09.line.${l.k}`)}{l.qty > 1 && <span className="num text-muted"> ×{l.qty}</span>}</td>
                    <td className="py-1 text-end"><Money value={l.qty * l.price} /></td>
                  </tr>
                ))}
                <tr className="border-b border-line/60"><td className="py-1 font-bold">{t("m09.assess.total")}</td><td className="py-1 text-end"><Money value={linesTotal} strong /></td></tr>
                <tr className="border-b border-line/60"><td className="py-1">{t("m09.assess.deductible")}</td><td className="py-1 text-end"><Money value={-c.deductible} /></td></tr>
                <tr><td className="py-1 font-bold">{t("m09.assess.net")}</td><td className="py-1 text-end"><Money value={net} strong /></td></tr>
              </tbody>
            </table>
          )}
        </Panel>

        <Panel title={t("m09.reserve.title")}>
          <Fields cols={1} items={[
            { label: t("m09.reserve.initial"), value: <Money value={c.initialReserve} /> },
            { label: t("m09.reserve.current"), value: <Money value={reserveNow} strong /> },
            { label: t("m09.fund"), value: <Badge tone="info">{t("fund.PTF")}</Badge> },
          ]} />
          <p className="mt-2 text-[12px] text-muted">{t("m09.reserve.note")}</p>
        </Panel>

        <Panel title={t("m09.ri.title")}>
          {recs.length ? recs.map((r) => {
            const tr = treatyById[r.treatyId];
            const formula = tr.type === "excess_of_loss"
              ? t("m09.ri.xol", { a: (c.approved ?? 0).toLocaleString("en-US"), r: (tr.retention ?? 0).toLocaleString("en-US") })
              : t("m09.ri.pct", { a: (c.approved ?? 0).toLocaleString("en-US"), p: tr.cededPct ?? 0 });
            return (
              <div key={r.id} className="grid gap-1 text-[13px]">
                <div className="flex items-center gap-2"><span className="num font-bold">{r.id}</span><span className="text-muted">{pick(tr.nameAr, tr.nameEn)}</span></div>
                <div className="num rounded bg-canvas px-2 py-1" dir="ltr">{formula}</div>
                <div className="flex items-center gap-2"><Money value={r.amount} strong />
                  <Badge tone={r.status === "received" ? "ok" : "warn"}>{t(`m09.ri.${r.status}`)}</Badge>{r.receivedAt && <DateText value={r.receivedAt} />}</div>
              </div>
            );
          }) : <p className="text-[13px] text-muted">{idx >= 3 && !rejected ? t("m09.ri.retained") : t("m09.ri.onApproval")}</p>}
        </Panel>

        <Panel title={t("m09.pay.title")}>
          <Fields cols={1} items={[
            { label: t("m09.fund"), value: <Badge tone="info">{t("fund.PTF")}</Badge> },
            { label: t("common.amount"), value: paidNow ? <Money value={c.paid ?? net} strong /> : <span className="text-muted">—</span> },
            { label: t("common.date"), value: <DateText value={paidNow ? c.stageDates.paid ?? TODAY : undefined} /> },
            { label: t("m09.pay.journal"), value: paidNow && payJournal ? <span className="num">{payJournal}</span> : <span className="text-muted">—</span> },
          ]} />
          <div className="mt-2 grid gap-2">
            {paidNow && <LockedNote text={t("common.locked")} />}
            <div><GuardButton tryLabel={t("m09.guard.shf.try")} blockedText={t("m09.guard.shf.blocked")} /></div>
          </div>
        </Panel>

        <Panel title={t("m09.mc.title")}>
          <Fields cols={1} items={[
            { label: t("m09.mc.prepared"), value: `${L.persona(c.handlerPersonaId)} · ${t("role.claims")}` },
            { label: t("m09.mc.assessedBy"), value: sv ? pick(sv.nameAr, sv.nameEn) : "—" },
            { label: t("m09.mc.approved"), value: approver && idx >= 3 ? `${pick(approver.levelAr, approver.levelEn)} (${t("m09.mc.limit")} ${approver.limit ? approver.limit.toLocaleString("en-US") : "∞"})` : <span className="text-muted">{t("m09.mc.pending")}</span> },
          ]} />
          <p className="mt-2 text-[12px] text-muted">{t("m09.mc.rule")}</p>
        </Panel>
      </div>
    </Sheet>
  );
}

function RecordScreen() {
  const L = useL();
  const [id, setId] = useState<string>(STORY.claimId);
  return (
    <div>
      <ControlPanel title={L.t("m09.rec.title")}
        actions={
          <select aria-label={L.t("m09.rec.pick")} value={id} onChange={(e) => setId(e.target.value)}
            className="rounded-md border border-line bg-surface px-2 py-1 text-[13px]">
            {claims.map((c) => <option key={c.id} value={c.id}>{c.id} · {L.cust(c)}</option>)}
          </select>
        } />
      <ClaimRecord key={id} id={id} />
    </div>
  );
}

/* ---------------------------------------------------------------- s3: SLA */
const DOW_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
function SlaDashboard() {
  const L = useL();
  const { t } = L;
  const open = claims.filter(isOpen).sort((a, b) => b.slaWorkingDays - a.slaWorkingDays);
  const paid = claims.filter((c) => c.stageDates.paid);
  const avg = paid.reduce((s, c) => s + c.slaWorkingDays, 0) / Math.max(1, paid.length);
  const within = paid.filter((c) => c.slaWorkingDays <= 5).length;
  const atRisk = open.filter((c) => c.slaWorkingDays >= 3);
  const esc = (c: Claim) => c.slaWorkingDays > 5 ? "breach" : c.slaWorkingDays >= 4 ? "d4" : c.slaWorkingDays >= 3 ? "d3" : "none";
  const cols: Column<Claim>[] = [
    { key: "id", label: t("m09.col.claim"), render: (c) => <span className="num font-bold">{c.id}</span> },
    { key: "cust", label: t("m09.f.customer"), render: (c) => L.cust(c) },
    { key: "stage", label: t("m09.col.stage"), render: (c) => <Badge tone="info">{L.stageLabel(c.stage)}</Badge> },
    { key: "reg", label: t("m09.f.registered"), render: (c) => <DateText value={c.registeredAt} /> },
    { key: "days", label: t("m09.col.days"), align: "center", render: (c) => <SlaBadge c={c} /> },
    { key: "esc", label: t("m09.col.esc"), render: (c) => <span className={esc(c) === "breach" ? "text-danger font-bold" : esc(c) === "none" ? "text-muted" : "text-warn"}>{t(`m09.esc.${esc(c)}`)}</span> },
    { key: "amt", label: t("m09.col.reserve"), align: "end", render: (c) => <Money value={c.reserve} /> },
  ];
  // Hero calendar: registered → paid
  const hero = claimById[STORY.claimId];
  const days: string[] = [];
  for (let d = hero.registeredAt; d <= hero.stageDates.paid!; d = addDays(d, 1)) days.push(d);
  const months = kpis.map((k) => ({ label: k.month.slice(5), value: k.avgSettlementDays, tone: (k.avgSettlementDays < 5 ? "ok" : "warn") as Tone }));
  return (
    <div>
      <KpiRow items={[
        { label: t("m09.kpi.open"), value: <span className="num">{open.length}</span> },
        { label: t("m09.kpi.avg"), value: <span className="num">{avg.toFixed(1)}</span>, hint: t("m09.sla.target"), tone: avg < 5 ? "ok" : "danger" },
        { label: t("m09.kpi.within"), value: <span className="num">{Math.round((within / Math.max(1, paid.length)) * 100)}%</span>, hint: t("m09.kpi.withinHint", { a: within, b: paid.length }) },
        { label: t("m09.kpi.risk"), value: <span className="num">{atRisk.length}</span>, tone: "danger", hint: t("m09.kpi.riskHint") },
      ]} />
      <div className="grid gap-3 px-4 pb-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Panel title={t("m09.sla.openList")}>
          <div className="-m-3"><DataTable columns={cols} rows={open} /></div>
        </Panel>
        <div className="grid content-start gap-3">
          <Panel title={t("m09.sla.trend")}>
            <BarChart data={months} format={(n) => n.toFixed(1)} />
            <p className="mt-1 text-[11px] text-muted">{t("m09.sla.trendNote")}</p>
          </Panel>
          <Panel title={t("m09.cal.title", { id: hero.id })}>
            <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-8">
              {days.map((d) => {
                const dow = new Date(`${d}T00:00:00Z`).getUTCDay();
                const work = isWorkingDay(d);
                return (
                  <div key={d} className={`rounded-md border p-1.5 text-center text-[11px] ${work ? "border-brand bg-soft text-brand-deep" : "border-line bg-canvas text-muted line-through"}`}>
                    <div className="font-bold">{t(`m09.dow.${DOW_KEYS[dow]}`)}</div>
                    <div className="num">{d.slice(5)}</div>
                  </div>
                );
              })}
            </div>
            <p className="mt-2 text-[12px]">{t("m09.cal.result", { n: hero.slaWorkingDays })}</p>
            <p className="text-[11px] text-muted">{t("m09.sla.calendar")}</p>
          </Panel>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- s4: surveyor mobile */
const PHOTO_KEYS = ["front", "rear", "left", "right", "close", "vin"];
function Surveyor() {
  const L = useL();
  const { t } = L;
  const mine = claims.filter((c) => c.surveyorId === STORY.surveyorId);
  const [id, setId] = useState<string>(STORY.claimId);
  const sv = surveyorById[STORY.surveyorId];
  return (
    <div className="grid gap-4 p-4 lg:grid-cols-[380px_minmax(0,1fr)]">
      <Phone key={id} c={claimById[id]} />
      <div className="grid content-start gap-3">
        <Panel title={t("m09.mob.assigned", { name: L.pick(sv.nameAr, sv.nameEn) })}>
          <ul className="grid gap-1.5 text-[13px]">
            {mine.map((c) => (
              <li key={c.id}>
                <button type="button" onClick={() => setId(c.id)}
                  className={`flex w-full items-center gap-2 rounded-md border px-2 py-1.5 text-start ${c.id === id ? "border-brand bg-soft" : "border-line bg-surface"}`}>
                  <span className="num font-bold">{c.id}</span><span className="truncate">{L.cust(c)}</span>
                  <span className="ms-auto"><Badge tone={c.rejected ? "danger" : "info"}>{L.stageLabel(c.rejected ? "rejected" : c.stage)}</Badge></span>
                </button>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title={t("m09.mob.how")}>
          <ul className="grid list-disc gap-1 ps-5 text-[13px]">
            {["p1", "p2", "p3", "p4"].map((k) => <li key={k}>{t(`m09.mob.${k}`)}</li>)}
          </ul>
        </Panel>
      </div>
    </div>
  );
}

function Phone({ c }: { c: Claim }) {
  const L = useL();
  const { t, pick } = L;
  const pol = policyById[c.policyId];
  const [shots, setShots] = useState<string[]>(c.id === STORY.claimId ? PHOTO_KEYS.slice(0, 5) : []);
  const [lines, setLines] = useState(linesOf(c).map((l, i) => ({ ...l, i })));
  const [sent, setSent] = useState(false);
  const total = lines.reduce((s, l) => s + l.qty * l.price, 0);
  const upd = (i: number, f: "qty" | "price", v: number) => setLines((all) => all.map((l) => (l.i === i ? { ...l, [f]: Number.isFinite(v) ? v : 0 } : l)));
  return (
    <div className="mx-auto w-full max-w-[360px] overflow-hidden rounded-[30px] border-[10px] border-navy bg-surface shadow-xl">
      <div className="bg-brand px-4 py-3 text-white">
        <div className="text-[11px] opacity-80">{t("m09.mob.app")}</div>
        <div className="num text-[16px] font-extrabold">{c.id}</div>
      </div>
      <div className="grid max-h-[640px] gap-3 overflow-y-auto p-3 text-[13px]">
        <div className="rounded-lg border border-line p-2">
          <div className="font-bold text-navy">{L.cust(c)}</div>
          <div className="text-muted">{pick(pol.riskAr, pol.riskEn)}</div>
          <div className="mt-1 flex items-center gap-1 text-muted"><MapPin size={13} aria-hidden />{pick(c.locationAr, c.locationEn)}</div>
        </div>
        <div>
          <div className="mb-1 flex items-center font-bold text-navy">{t("m09.mob.photos")}<span className="num ms-auto text-muted">{shots.length}/{PHOTO_KEYS.length}</span></div>
          <div className="grid grid-cols-3 gap-1.5">
            {PHOTO_KEYS.map((k) => {
              const done = shots.includes(k);
              return (
                <button key={k} type="button" disabled={sent} onClick={() => setShots((s) => (done ? s.filter((x) => x !== k) : [...s, k]))}
                  className={`flex aspect-square flex-col items-center justify-center gap-1 rounded-md border text-[10px] ${done ? "border-brand bg-soft text-brand-deep" : "border-dashed border-line bg-canvas text-muted"}`}>
                  {done ? <CheckCircle2 size={18} aria-hidden /> : <Camera size={18} aria-hidden />}
                  <span>{t(`m09.photo.${k}`)}</span>
                  {done && <span className="num text-[9px]">GPS · 10:4{PHOTO_KEYS.indexOf(k)}</span>}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <div className="mb-1 font-bold text-navy">{t("m09.mob.estimate")}</div>
          <div className="grid gap-1.5">
            {lines.map((l) => (
              <div key={l.i} className="grid grid-cols-[1fr_44px_80px] items-center gap-1">
                <span className="truncate">{t(`m09.line.${l.k}`)}</span>
                <input aria-label={t("m09.mob.qty")} type="number" min={1} value={l.qty} disabled={sent} onChange={(e) => upd(l.i, "qty", +e.target.value)}
                  className="num w-full rounded border border-line bg-canvas px-1 py-0.5 text-center" />
                <input aria-label={t("m09.mob.price")} type="number" min={0} value={l.price} disabled={sent} onChange={(e) => upd(l.i, "price", +e.target.value)}
                  className="num w-full rounded border border-line bg-canvas px-1 py-0.5 text-end" />
              </div>
            ))}
          </div>
          {!sent && <div className="mt-1"><Button variant="ghost" onClick={() => setLines((all) => [...all, { k: "other", qty: 1, price: 0, i: all.length ? Math.max(...all.map((x) => x.i)) + 1 : 0 }])}><Plus size={13} aria-hidden />{t("m09.mob.addLine")}</Button></div>}
          <div className="mt-1 flex items-center border-t border-line pt-1 font-bold"><span>{t("m09.assess.total")}</span><span className="ms-auto"><Money value={total} strong /></span></div>
        </div>
        {sent ? (
          <div className="rounded-md bg-ok-soft px-3 py-2 text-ok">{t("m09.mob.sent", { name: L.persona(c.handlerPersonaId) })}</div>
        ) : (
          <Button variant="primary" onClick={() => setSent(true)} disabled={!shots.length}><Send size={14} aria-hidden />{t("m09.mob.submit")}</Button>
        )}
        <p className="text-[11px] text-muted">{t("m09.mob.noApprove")}</p>
      </div>
    </div>
  );
}

export const screens: Record<string, ComponentType> = {
  s1: Board,
  s2: RecordScreen,
  s3: SlaDashboard,
  s4: Surveyor,
};
