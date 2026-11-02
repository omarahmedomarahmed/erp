"use client";
import { useMemo, useState, type ComponentType, type ReactNode } from "react";
import { CheckCircle2, Lock, Star, Printer } from "lucide-react";
import {
  Badge, BarChart, Button, ControlPanel, DataTable, Donut, Fields, GuardButton, KpiRow, LockedNote, Modal, Money, DateText, Panel, Sheet,
  StatusBar, Timeline, money, useFilter, type Column, type Tone,
} from "@/components/ui";
import { useT } from "@/components/I18n";
import { customerById, iftById, journalById, policiesOfCustomer, policyById, round3, STORY, surplusAllocations, surplusRun } from "@/data/seed";
import type { SurplusAllocation } from "@/data/seed";

const R = surplusRun;
const pct = (n: number) => `${(n * 100).toFixed(1)}%`;
const name = (a: SurplusAllocation, pick: (ar: string, en?: string) => string) =>
  a.customerId ? pick(customerById[a.customerId].nameAr, customerById[a.customerId].nameEn) : pick(a.labelAr ?? "", a.labelEn);
const isHero = (a: SurplusAllocation) => a.id === STORY.surplusAllocationId;
const ordered = [...surplusAllocations].sort((a, b) => Number(isHero(b)) - Number(isHero(a)));

function Blocked({ text }: { text: string }) {
  return <div className="flex gap-3 rounded-md bg-danger-soft p-3 text-[13px] text-danger"><Lock size={18} className="shrink-0" aria-hidden /><p>{text}</p></div>;
}
function Ok({ children }: { children: ReactNode }) {
  return <div className="flex gap-3 rounded-md bg-ok-soft p-3 text-[13px] text-ok"><CheckCircle2 size={18} className="shrink-0" aria-hidden /><div>{children}</div></div>;
}

/* ---------------------------------------------------------------- s1: computation */
function Computation() {
  const { t, pick, lang } = useT();
  let run = 0;
  const steps = R.components.map((c) => { run = round3(run + c.amount); return { ...c, run }; });
  const rows: { id: string; label: ReactNode; amount: number; run: number; strong?: boolean; tone?: Tone }[] = [
    ...steps.map((c) => ({ id: c.key, label: pick(c.labelAr, c.labelEn), amount: c.amount, run: c.run })),
    { id: "net", label: t("m15.calc.net"), amount: R.netSurplus, run: R.netSurplus, strong: true },
    { id: "qard", label: t("m15.calc.qard"), amount: -R.qardRepaid, run: round3(R.netSurplus - R.qardRepaid), tone: "warn" },
    { id: "ret", label: t("m15.calc.retention", { p: R.retentionPct }), amount: 0, run: R.distributable },
    { id: "dist", label: t("m15.calc.distributable"), amount: R.distributable, run: R.distributable, strong: true },
    { id: "part", label: t("m15.calc.toParticipants", { p: R.distributionPct }), amount: R.distributable, run: R.distributable, tone: "ok" },
    { id: "sh", label: t("m15.calc.toShareholders"), amount: 0, run: 0, tone: "danger" },
  ];
  return (
    <div>
      <ControlPanel title={t("m15.s1.title")} actions={<><Badge tone="ok">{t("m15.run.completed")}</Badge><span className="num text-[12px] text-muted">{R.id}</span></>} />
      <KpiRow items={[
        { label: t("m15.kpi.net"), value: <Money value={R.netSurplus} /> },
        { label: t("m15.kpi.qard"), value: <Money value={R.qardRepaid} />, hint: t("m15.kpi.qardHint") },
        { label: t("m15.kpi.distributable"), value: <Money value={R.distributable} />, tone: "ok" },
        { label: t("m15.kpi.ratio"), value: pct(R.ratio), hint: t("m15.kpi.ratioHint", { e: money(R.eligibleContributions, lang) }) },
      ]} />
      <div className="grid gap-4 px-4 pb-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Panel title={t("m15.calc.title")}>
          <table className="w-full text-[13px]">
            <thead><tr className="border-b border-line text-muted"><th className="px-2 py-1.5 text-start">{t("m15.calc.step")}</th><th className="px-2 py-1.5 text-end">{t("common.amount")}</th><th className="px-2 py-1.5 text-end">{t("m15.calc.running")}</th></tr></thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id} className={`border-b border-line/60 ${r.strong ? "bg-canvas font-extrabold text-navy" : ""}`}>
                  <td className="px-2 py-1.5"><span className="num me-2 text-muted">{i + 1}</span>{r.label}</td>
                  <td className={`px-2 py-1.5 text-end ${r.tone === "danger" ? "text-danger" : r.tone === "ok" ? "text-ok" : r.tone === "warn" ? "text-warn" : r.amount < 0 ? "text-danger" : ""}`}><Money value={r.amount} strong={r.strong} /></td>
                  <td className="px-2 py-1.5 text-end text-muted"><Money value={r.run} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-[12px] text-muted">{t("m15.calc.formula")}</p>
        </Panel>
        <div className="grid content-start gap-4">
          <Panel title={t("m15.chart.title")}>
            <BarChart data={R.components.map((c) => ({ label: pick(c.labelAr, c.labelEn), value: Math.abs(c.amount), tone: c.amount < 0 ? "warn" : "ok" }))}
              format={(n) => `${(n / 1e6).toFixed(1)}m`} />
            <p className="mt-1 text-[11px] text-muted">{t("m15.chart.legend")}</p>
          </Panel>
          <Panel title={t("m15.solv.title")}>
            <Fields cols={1} items={[
              { label: t("m15.solv.before"), value: <span className="num font-bold">{R.solvencyBefore}%</span> },
              { label: t("m15.solv.after"), value: <span className="num font-bold">{R.solvencyAfter}%</span> },
              { label: t("m15.solv.rule"), value: pick(R.eligibilityRuleAr, R.eligibilityRuleEn) },
              { label: t("m15.solv.ssb"), value: <span className="num">{R.ssbResolutionId}</span> },
            ]} />
          </Panel>
          <Panel title={t("m15.journals.title")}>
            <ul className="grid gap-2 text-[12px]">
              {R.journalIds.map((id) => {
                const j = journalById[id];
                const x = j?.iftId ? iftById[j.iftId] : undefined;
                return (
                  <li key={id} className="flex flex-wrap items-center gap-2 border-b border-line/60 pb-1">
                    <span className="num font-bold">{id}</span><DateText value={j?.date} />
                    <span className="min-w-0 flex-1">{j ? pick(j.memoAr, j.memoEn) : ""}</span>
                    {x && <Badge tone="brand">{t(`m15.ift.${x.type}`)}</Badge>}
                  </li>
                );
              })}
            </ul>
            <div className="mt-2"><LockedNote text={t("common.locked")} /></div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- s2: approvals chain (with replay) */
function Approvals() {
  const { t, pick } = useT();
  const [replay, setReplay] = useState(false);
  const [done, setDone] = useState(4);
  const [qard, setQard] = useState(true);
  const [posted, setPosted] = useState(true);
  const [modal, setModal] = useState<null | "qard" | "ssb" | "approvals" | "ok">(null);
  const steps = R.approvals;
  const stage = posted ? "posted" : done < 4 ? steps[done].step : "ready";
  const startReplay = () => { setReplay(true); setDone(0); setQard(false); setPosted(false); };
  const distribute = () => {
    if (!qard) return setModal("qard");
    if (done < 3) return setModal("ssb");
    if (done < 4) return setModal("approvals");
    setPosted(true); setModal("ok");
  };
  const tl = [
    ...steps.slice(0, done).map((s) => ({ at: s.at ?? "", who: pick(s.byAr, s.byEn), text: t("m15.appr.signed", { step: pick(s.labelAr, s.labelEn) }), tone: "ok" as Tone })),
    ...(qard ? [{ at: "2026-02-16", who: t("m15.who.system"), text: t("m15.appr.qardDone") }] : []),
    ...(posted ? [{ at: R.postedAt, who: t("m15.who.system"), text: t("m15.appr.postedTl"), tone: "ok" as Tone }] : []),
  ];
  return (
    <div>
      <ControlPanel title={t("m15.s2.title")} actions={<>
        <Button onClick={startReplay}>{t("m15.appr.replay")}</Button>
        <GuardButton tryLabel={t("m15.guard.shareholders.try")} blockedText={t("m15.guard.shareholders.blocked")} />
      </>} />
      <div className="px-4 pt-4">
        <StatusBar current={stage} stages={[...steps.map((s) => ({ id: s.step, label: pick(s.labelAr, s.labelEn) })), { id: "ready", label: t("m15.appr.ready") }, { id: "posted", label: t("m15.appr.posted") }]} />
        {replay && <p className="mt-2 text-[12px] text-brand-deep">{t("m15.appr.replayNote")}</p>}
      </div>
      <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="grid content-start gap-3 sm:grid-cols-2">
          {steps.map((s, i) => {
            const ok = i < done;
            return (
              <div key={s.step} className={`rounded-lg border p-3 ${ok ? "border-ok/40 bg-ok-soft/40" : "border-line bg-surface"}`}>
                <div className="flex items-center gap-2">
                  <span className="num grid size-6 place-items-center rounded-full bg-navy text-[12px] font-bold text-white">{i + 1}</span>
                  <span className="font-extrabold text-navy">{pick(s.labelAr, s.labelEn)}</span>
                  <span className="ms-auto">{ok ? <Badge tone="ok">{t("m15.appr.approved")}</Badge> : <Badge tone="warn">{t("m15.appr.pending")}</Badge>}</span>
                </div>
                <p className="mt-2 text-[12px] text-muted">{t(`m15.appr.role.${s.step}`)}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px]">
                  <span>{pick(s.byAr, s.byEn)}</span>{ok && <DateText value={s.at} />}
                  {!ok && i === done && <span className="ms-auto"><Button variant="primary" onClick={() => setDone(done + 1)}>{t("m15.appr.sign")}</Button></span>}
                </div>
              </div>
            );
          })}
          <div className={`rounded-lg border p-3 sm:col-span-2 ${qard ? "border-ok/40 bg-ok-soft/40" : "border-warn/40 bg-warn-soft/40"}`}>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-extrabold text-navy">{t("m15.appr.qardTitle")}</span>
              <Badge tone="info">{t("m15.ift.QARD_REPAY")}</Badge>
              <span className="ms-auto"><Money value={R.qardOutstanding} strong /></span>
            </div>
            <p className="mt-1 text-[12px] text-muted">{t("m15.appr.qardText")}</p>
            <div className="mt-2">{qard ? <Badge tone="ok">{t("m15.appr.qardRepaid")}</Badge> : <Button variant="primary" onClick={() => setQard(true)}>{t("m15.appr.qardDo")}</Button>}</div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
            <Button variant="primary" disabled={posted} onClick={distribute}>{t("m15.appr.distribute")}</Button>
            {posted && <LockedNote text={t("m15.appr.lockedPosted")} />}
          </div>
        </div>
        <Timeline title={t("common.activity")} items={tl.length ? tl : [{ at: "—", text: t("m15.appr.empty") }]} />
      </div>
      <Modal open={modal !== null} onClose={() => setModal(null)} title={modal === "ok" ? t("m15.appr.okTitle") : t("common.blocked")}>
        {modal === "qard" && <Blocked text={t("m15.guard.qard.blocked")} />}
        {modal === "ssb" && <Blocked text={t("m15.guard.ssb.blocked")} />}
        {modal === "approvals" && <Blocked text={t("m15.guard.board.blocked")} />}
        {modal === "ok" && <Ok>{t("m15.appr.okText")}</Ok>}
        {modal !== "ok" && <p className="mt-2 text-[12px] text-muted">{t("common.blockedLogged")}</p>}
      </Modal>
    </div>
  );
}

/* ---------------------------------------------------------------- statement (shared by s3 and s4) */
function Statement({ a, onBack }: { a: SurplusAllocation; onBack?: () => void }) {
  const { t, pick } = useT();
  const [choice, setChoice] = useState<SurplusAllocation["settlement"]>(a.settlement);
  const cust = a.customerId ? customerById[a.customerId] : undefined;
  const pol25 = a.customerId ? policiesOfCustomer(a.customerId).filter((p) => p.start < "2026-01-01") : [];
  const applied = a.appliedPolicyId ? policyById[a.appliedPolicyId] : undefined;
  const settled = a.status !== "held";
  return (
    <Sheet
      title={t("m15.st.title", { y: R.year })}
      subtitle={cust ? `${pick(cust.nameAr, cust.nameEn)} · ${cust.id}` : name(a, pick)}
      status={<Badge tone={a.status === "held" ? "warn" : "ok"}>{t(`m15.status.${a.status}`)}</Badge>}
      actions={<>
        {onBack && <Button variant="ghost" onClick={onBack}>{t("m15.back")}</Button>}
        <Button><Printer size={14} aria-hidden />{t("m15.st.pdf")}</Button>
      </>}
      side={<Timeline title={t("common.activity")} items={[
        { at: R.postedAt, who: t("m15.who.system"), text: t("m15.st.tlAllocated") },
        ...(a.status === "applied" && applied ? [{ at: applied.issuedAt, who: t("m15.who.system"), text: t("m15.st.tlApplied", { cert: applied.certNo }), tone: "ok" as Tone }] : []),
        ...(a.status === "paid" ? [{ at: "2026-03-15", who: t("m15.who.system"), text: t("m15.st.tlPaid", { v: a.voucherNo ?? "" }), tone: "ok" as Tone }] : []),
      ]} />}
    >
      <Fields items={[
        { label: t("m15.st.participant"), value: cust ? pick(cust.nameAr, cust.nameEn) : name(a, pick) },
        { label: t("m15.st.allocation"), value: <span className="num">{a.id}</span> },
        { label: t("m15.st.policies"), value: pol25.length ? <span className="num">{pol25.map((p) => p.certNo).join(" · ")}</span> : "—" },
        { label: t("m15.st.fund"), value: <Badge tone="info">{t("fund.PTF")}</Badge> },
        { label: t("m15.st.contribution"), value: <Money value={a.contribution} /> },
        { label: t("m15.st.ratio"), value: <span className="num">{pct(R.ratio)}</span> },
        { label: t("m15.st.share"), value: <Money value={a.share} strong /> },
        { label: t("m15.st.ssb"), value: <span className="num">{R.ssbResolutionId}</span> },
      ]} />
      <div className="mt-4 rounded-lg border border-line bg-canvas p-3 text-[13px]">
        <div className="font-bold text-navy">{t("m15.st.calc")}</div>
        <div className="num mt-1" dir="ltr">{money(a.contribution, "en")} × {pct(R.ratio)} = {money(a.share, "en")}</div>
        <p className="mt-1 text-[12px] text-muted">{t("m15.st.calcNote", { d: money(R.distributable), e: money(R.eligibleContributions) })}</p>
      </div>
      <h4 className="mt-4 mb-2 text-[14px] font-extrabold text-navy">{t("m15.st.settlement")}</h4>
      <div className="flex flex-wrap gap-2">
        {(["renewal_discount", "voucher"] as const).map((c) => (
          <Button key={c} variant={choice === c ? "primary" : "secondary"} disabled={settled} onClick={() => setChoice(c)}>{t(`m15.settle.${c}`)}</Button>
        ))}
      </div>
      <div className="mt-2">
        {choice === "renewal_discount" && applied && (
          <Fields cols={1} items={[
            { label: t("m15.st.appliedTo"), value: <span className="num font-bold">{applied.certNo}</span> },
            { label: t("m15.st.newContribution"), value: <Money value={applied.contribution} /> },
            { label: t("m15.st.discount"), value: <span className="text-ok"><Money value={-applied.surplusCredit} /></span> },
            { label: t("m15.st.netPayable"), value: <Money value={applied.netPayable} strong /> },
          ]} />
        )}
        {choice === "voucher" && a.voucherNo && <Fields cols={1} items={[{ label: t("m15.st.voucher"), value: <span className="num font-bold">{a.voucherNo}</span> }]} />}
        {!settled && <p className="text-[12px] text-muted">{t("m15.st.heldNote")}</p>}
      </div>
      {settled && <div className="mt-3"><LockedNote text={t("m15.st.locked")} /></div>}
    </Sheet>
  );
}

/* ---------------------------------------------------------------- s3: allocations */
function Allocations() {
  const { t, pick } = useT();
  const [sel, setSel] = useState<string | null>(null);
  const fields = useMemo(() => (a: SurplusAllocation) => `${a.id} ${a.customerId ?? ""} ${a.customerId ? customerById[a.customerId].nameAr + customerById[a.customerId].nameEn : (a.labelAr ?? "") + (a.labelEn ?? "")}`, []);
  const { rows, setQ } = useFilter(ordered, fields);
  if (sel) return <Statement a={surplusAllocations.find((a) => a.id === sel)!} onBack={() => setSel(null)} />;
  const total = round3(surplusAllocations.reduce((s, a) => s + a.share, 0));
  const totalC = round3(surplusAllocations.reduce((s, a) => s + a.contribution, 0));
  const vouchers = round3(surplusAllocations.filter((a) => a.settlement === "voucher").reduce((s, a) => s + a.share, 0));
  const renewals = round3(total - vouchers);
  const cols: Column<SurplusAllocation>[] = [
    { key: "id", label: t("m15.col.id"), render: (a) => <span className="num flex items-center gap-1 font-bold">{isHero(a) && <Star size={12} className="text-accent" aria-label={t("m15.hero")} />}{a.id}</span> },
    { key: "p", label: t("m15.col.participant"), render: (a) => name(a, pick) },
    { key: "c", label: t("m15.col.contribution"), align: "end", render: (a) => <Money value={a.contribution} /> },
    { key: "r", label: t("m15.col.ratio"), align: "end", render: () => <span className="num">{pct(R.ratio)}</span> },
    { key: "s", label: t("m15.col.share"), align: "end", render: (a) => <Money value={a.share} strong /> },
    { key: "st", label: t("m15.col.settlement"), render: (a) => <Badge tone={a.settlement === "voucher" ? "info" : "ok"}>{t(`m15.settle.${a.settlement}`)}</Badge> },
    { key: "ref", label: t("m15.col.ref"), render: (a) => <span className="num text-[12px]">{a.appliedPolicyId ? policyById[a.appliedPolicyId].certNo : a.voucherNo ?? "—"}</span> },
    { key: "stat", label: t("common.status"), render: (a) => <Badge tone={a.status === "held" ? "warn" : "ok"}>{t(`m15.status.${a.status}`)}</Badge> },
  ];
  return (
    <div>
      <ControlPanel title={t("m15.s3.title")} actions={<Button>{t("common.export")}</Button>} onSearch={setQ} />
      <KpiRow items={[
        { label: t("m15.kpi.distributable"), value: <Money value={R.distributable} /> },
        { label: t("m15.kpi.allocated"), value: <Money value={total} />, tone: Math.abs(total - R.distributable) < 0.0005 ? "ok" : "danger", hint: Math.abs(total - R.distributable) < 0.0005 ? t("m15.kpi.matches") : undefined },
        { label: t("m15.kpi.vouchers"), value: <Money value={vouchers} /> },
        { label: t("m15.kpi.renewals"), value: <Money value={renewals} /> },
      ]} />
      <div className="grid gap-4 px-4 pb-4 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="min-w-0 rounded-lg border border-line">
          <DataTable columns={cols} rows={rows} onRowClick={(a) => setSel(a.id)}
            footer={<tr><td className="px-3 py-2" colSpan={2}>{t("common.total")}</td><td className="px-3 py-2 text-end"><Money value={totalC} /></td><td /><td className="px-3 py-2 text-end"><Money value={total} /></td><td className="px-3 py-2" colSpan={3}><Badge tone="ok">{t("m15.alloc.zeroToShareholders")}</Badge></td></tr>} />
        </div>
        <div className="grid content-start gap-4">
          <Panel title={t("m15.chart.settlement")}>
            <Donut data={[{ label: t("m15.settle.voucher"), value: vouchers, color: "var(--color-brand)" }, { label: t("m15.settle.renewal_discount"), value: renewals, color: "var(--color-ok)" }]} />
          </Panel>
          <p className="text-[12px] text-muted">{t("m15.alloc.note")}</p>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- s4: entitlement statement */
function Entitlement() {
  const { t, pick } = useT();
  const list = ordered.filter((a) => a.customerId);
  const [id, setId] = useState(STORY.surplusAllocationId as string);
  const a = list.find((x) => x.id === id) ?? list[0];
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 border-b border-line bg-surface px-4 py-2">
        <label className="text-[12px] font-bold text-muted" htmlFor="m15-part">{t("m15.s4.pick")}</label>
        <select id="m15-part" value={a.id} onChange={(e) => setId(e.target.value)} className="min-w-0 max-w-full rounded-md border border-line bg-surface px-2 py-1 text-[13px]">
          {list.map((x) => <option key={x.id} value={x.id}>{name(x, pick)} · {x.id}</option>)}
        </select>
      </div>
      <Statement key={a.id} a={a} />
    </div>
  );
}

export const screens: Record<string, ComponentType> = {
  s1: Computation,
  s2: Approvals,
  s3: Allocations,
  s4: Entitlement,
};
