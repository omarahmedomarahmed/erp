"use client";
import { useMemo, useState, type ComponentType, type ReactNode } from "react";
import { BadgeCheck, CheckCircle2, Lock, PenLine, Printer, ShieldCheck } from "lucide-react";
import {
  Badge, Button, ControlPanel, DataTable, Fields, GuardButton, KpiRow, LockedNote, Modal, Money, DateText, Panel, Sheet, StatusBar, Timeline,
  money, useFilter, type Column, type Tone,
} from "@/components/ui";
import { useT } from "@/components/I18n";
import {
  accountById, agentById, cessions, claims, commissionLines, complianceCertificates, counterpartyById, customerById, interFundTransfers,
  investmentContracts, journalById, journals, payrollRuns, policies, policyById, productById, receipts, round3, ssbApprovals, ssbMembers,
  ssbResolutions, shariaExceptions, surplusRun, TODAY,
} from "@/data/seed";
import type { FundCode, ShariaException, ShariaStatus, SsbResolution } from "@/data/seed";
import { personaById } from "@/content/personas";

/* ---------------------------------------------------------------- small helpers */
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
function Blocked({ text }: { text: string }) {
  return <div className="flex gap-3 rounded-md bg-danger-soft p-3 text-[13px] text-danger"><Lock size={18} className="shrink-0" aria-hidden /><p>{text}</p></div>;
}
const STATUSES: ShariaStatus[] = ["compliant", "pending_review", "non_compliant", "purified"];
const sum = (xs: number[]) => round3(xs.reduce((a, b) => a + b, 0));

/* ---------------------------------------------------------------- unified register of contracts & transactions */
type Kind = "journal" | "receipt" | "policy" | "claim" | "investment" | "commission" | "cession" | "payroll" | "counterparty";
const KINDS: Kind[] = ["policy", "receipt", "claim", "journal", "investment", "commission", "cession", "payroll", "counterparty"];
interface RegRow { id: string; kind: Kind; date: string; funds: FundCode[]; amount: number; status: ShariaStatus; descAr: string; descEn: string }
const REGISTER: RegRow[] = [
  ...policies.map((p): RegRow => ({ id: p.certNo, kind: "policy", date: p.issuedAt, funds: ["PTF", "SHF"], amount: p.contribution, status: p.sharia_status,
    descAr: `${productById[p.productId].nameAr} – ${customerById[p.customerId].nameAr}`, descEn: `${productById[p.productId].nameEn} – ${customerById[p.customerId].nameEn}` })),
  ...receipts.map((r): RegRow => ({ id: r.id, kind: "receipt", date: r.date, funds: ["PTF", "SHF"], amount: r.amount, status: r.sharia_status,
    descAr: `تحصيل ${policyById[r.policyId].certNo}`, descEn: `Collection ${policyById[r.policyId].certNo}` })),
  ...claims.map((c): RegRow => ({ id: c.id, kind: "claim", date: c.registeredAt, funds: ["PTF"], amount: c.paid ?? c.approved ?? c.reserve, status: c.sharia_status,
    descAr: c.descriptionAr, descEn: c.descriptionEn })),
  ...journals.map((j): RegRow => ({ id: j.id, kind: "journal", date: j.date, funds: Array.from(new Set(j.lines.map((l) => l.fund))) as FundCode[],
    amount: round3(j.lines.reduce((s, l) => s + l.debit, 0)), status: j.sharia_status, descAr: j.memoAr, descEn: j.memoEn })),
  ...investmentContracts.map((c): RegRow => ({ id: c.id, kind: "investment", date: c.start, funds: [c.fund], amount: c.principal, status: c.sharia_status, descAr: c.nameAr, descEn: c.nameEn })),
  ...commissionLines.map((l): RegRow => ({ id: l.id, kind: "commission", date: l.date, funds: ["SHF"], amount: l.amount, status: l.sharia_status,
    descAr: agentById[l.agentId].nameAr, descEn: agentById[l.agentId].nameEn })),
  ...cessions.map((c): RegRow => ({ id: c.id, kind: "cession", date: c.date, funds: ["PTF"], amount: c.ceded, status: c.sharia_status, descAr: c.treatyId, descEn: c.treatyId })),
  ...payrollRuns.map((r): RegRow => ({ id: r.id, kind: "payroll", date: `${r.month}-27`, funds: ["SHF"], amount: r.totals.gross, status: r.sharia_status,
    descAr: `رواتب ${r.month}`, descEn: `Payroll ${r.month}` })),
  ...Object.values(counterpartyById).map((c): RegRow => ({ id: c.id, kind: "counterparty", date: "", funds: ["PTF"], amount: 0, status: c.sharia_status, descAr: c.nameAr, descEn: c.nameEn })),
].sort((a, b) => b.date.localeCompare(a.date));

type Actor = "ssb" | "accountant" | "cfo";
interface StatusEvent { at: string; who: string; from: ShariaStatus; to: ShariaStatus; reason: string }

/* ---------------------------------------------------------------- s1: register */
function Register() {
  const { t, pick } = useT();
  const [st, setSt] = useState<"all" | ShariaStatus>("all");
  const [kind, setKind] = useState<"all" | Kind>("all");
  const [actor, setActor] = useState<Actor>("accountant");
  const [ov, setOv] = useState<Record<string, ShariaStatus>>({});
  const [events, setEvents] = useState<Record<string, StatusEvent[]>>({});
  const [open, setOpen] = useState<RegRow | null>(null);
  const [next, setNext] = useState<ShariaStatus>("pending_review");
  const [reason, setReason] = useState("");
  const statusOf = (r: RegRow) => ov[r.id] ?? r.status;
  const base = useMemo(() => REGISTER.filter((r) => (kind === "all" || r.kind === kind) && (st === "all" || (ov[r.id] ?? r.status) === st)), [kind, st, ov]);
  const fields = useMemo(() => (r: RegRow) => `${r.id} ${r.descAr} ${r.descEn}`, []);
  const { rows, setQ } = useFilter(base, fields);
  const count = (s: ShariaStatus) => REGISTER.filter((r) => (kind === "all" || r.kind === kind) && (ov[r.id] ?? r.status) === s).length;
  const shown = rows.slice(0, 100);
  const p = personaById(actor);
  const apply = () => {
    if (!open) return;
    const from = statusOf(open);
    setOv({ ...ov, [open.id]: next });
    setEvents({ ...events, [open.id]: [...(events[open.id] ?? []), { at: TODAY, who: p ? pick(p.nameAr, p.nameEn) : actor, from, to: next, reason }] });
    setReason("");
  };
  const cols: Column<RegRow>[] = [
    { key: "id", label: t("m16.col.ref"), render: (r) => <span className="num font-bold text-brand-deep">{r.id}</span> },
    { key: "k", label: t("m16.col.kind"), render: (r) => <Badge tone="neutral">{t(`m16.kind.${r.kind}`)}</Badge> },
    { key: "d", label: t("common.date"), render: (r) => <DateText value={r.date} /> },
    { key: "desc", label: t("m16.col.desc"), render: (r) => <span className="line-clamp-1 max-w-[300px]">{pick(r.descAr, r.descEn)}</span> },
    { key: "f", label: t("m16.col.fund"), render: (r) => <span className="flex gap-1">{r.funds.map((f) => <FundBadge key={f} fund={f} />)}</span> },
    { key: "a", label: t("common.amount"), align: "end", render: (r) => (r.amount ? <Money value={r.amount} /> : <span className="text-muted">—</span>) },
    { key: "s", label: t("sharia.label"), render: (r) => <span className="flex items-center gap-1"><ShariaBadge status={statusOf(r)} />{ov[r.id] && <PenLine size={12} className="text-muted" aria-label={t("m16.reg.changed")} />}</span> },
  ];
  const fs = (id: typeof st, label: string) => ({ id, label, active: st === id, onClick: () => setSt(id) });
  return (
    <div>
      <ControlPanel
        title={t("m16.s1.title")}
        actions={<>
          <select aria-label={t("m16.col.kind")} value={kind} onChange={(e) => setKind(e.target.value as typeof kind)} className="rounded-md border border-line bg-surface px-2 py-1 text-[13px]">
            <option value="all">{t("m16.kind.all")}</option>
            {KINDS.map((k) => <option key={k} value={k}>{t(`m16.kind.${k}`)}</option>)}
          </select>
          <label className="flex items-center gap-1 text-[12px] text-muted">{t("m16.reg.actingAs")}
            <select value={actor} onChange={(e) => setActor(e.target.value as Actor)} className="rounded-md border border-line bg-surface px-2 py-1 text-[13px] text-ink">
              {(["accountant", "cfo", "ssb"] as Actor[]).map((a) => { const x = personaById(a)!; return <option key={a} value={a}>{pick(x.nameAr, x.nameEn)} – {t(x.roleKey)}</option>; })}
            </select>
          </label>
        </>}
        filters={[fs("all", `${t("common.all")} ${REGISTER.filter((r) => kind === "all" || r.kind === kind).length}`), ...STATUSES.map((s) => fs(s, `${t(`sharia.${s}`)} ${count(s)}`))]}
        onSearch={setQ}
      />
      <DataTable columns={cols} rows={shown} onRowClick={(r) => { setOpen(r); setNext(statusOf(r) === "compliant" ? "pending_review" : "compliant"); setReason(""); }} />
      <p className="px-4 py-2 text-[12px] text-muted">{t("m16.reg.count", { shown: shown.length, total: rows.length })} · {t("m16.reg.mandatory")}</p>

      <Modal open={!!open} onClose={() => setOpen(null)} title={t("m16.reg.modalTitle", { id: open?.id ?? "" })}>
        {open && (
          <div className="grid gap-3 text-[13px]">
            <Fields cols={1} items={[
              { label: t("m16.col.kind"), value: t(`m16.kind.${open.kind}`) },
              { label: t("m16.col.desc"), value: pick(open.descAr, open.descEn) },
              { label: t("m16.reg.current"), value: <ShariaBadge status={statusOf(open)} /> },
              { label: t("m16.reg.source"), value: t(`m16.reg.src.${open.kind === "journal" || open.kind === "receipt" || open.kind === "commission" || open.kind === "payroll" ? "rule" : "approval"}`) },
            ]} />
            {actor !== "ssb" ? (
              <>
                <Blocked text={t("m16.guard.status.blocked")} />
                <p className="text-[12px] text-muted">{t("common.blockedLogged")}</p>
              </>
            ) : (
              <>
                <div className="flex flex-wrap gap-1.5">
                  {STATUSES.filter((s) => s !== statusOf(open)).map((s) => (
                    <Button key={s} variant={next === s ? "primary" : "secondary"} onClick={() => setNext(s)}>{t(`sharia.${s}`)}</Button>
                  ))}
                </div>
                <label className="grid gap-1 text-[12px] font-bold text-muted">{t("m16.reg.reason")}
                  <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} className="rounded-md border border-line bg-canvas p-2 text-[13px] font-normal text-ink" />
                </label>
                <div className="flex items-center gap-2">
                  <Button variant="primary" disabled={reason.trim().length < 3 || next === statusOf(open)} onClick={apply}>{t("m16.reg.apply")}</Button>
                  <span className="text-[11px] text-muted">{t("m16.reg.appendOnly")}</span>
                </div>
              </>
            )}
            {(events[open.id] ?? []).length > 0 && (
              <Timeline title={t("m16.reg.history")} items={(events[open.id] ?? []).map((e) => ({ at: e.at, who: e.who, text: `${t(`sharia.${e.from}`)} → ${t(`sharia.${e.to}`)} · ${e.reason}` }))} />
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ---------------------------------------------------------------- s2: exceptions & purification */
const ATTEMPTS: Record<string, [string, number, number][]> = {
  "SX-001": [["SHF-5100", 18450, 0], ["PTF-1110", 0, 18450]],
  "SX-002": [["SHF-5200", 6200, 0], ["PTF-1110", 0, 6200]],
};
function ExceptionDetail({ x, onBack }: { x: ShariaException; onBack: () => void }) {
  const { t, pick } = useT();
  const who = personaById(x.byPersonaId);
  const pur = journals.filter((j) => j.source === "purification" && j.sourceId === x.id);
  const res = x.resolutionId ? ssbResolutions.find((r) => r.id === x.resolutionId) : undefined;
  const attempt = ATTEMPTS[x.id];
  return (
    <Sheet
      title={<span className="num">{x.id}</span>}
      subtitle={pick(x.descriptionAr, x.descriptionEn)}
      status={<Badge tone={x.outcome === "blocked" ? "danger" : "info"}>{t(`m16.outcome.${x.outcome}`)}</Badge>}
      actions={<Button variant="ghost" onClick={onBack}>{t("m16.back")}</Button>}
      side={<Timeline title={t("common.activity")} items={[
        { at: x.at.replace("T", " "), who: who ? pick(who.nameAr, who.nameEn) : x.byPersonaId, text: t(x.kind === "blocked_mixing" ? "m16.exc.tlAttempt" : "m16.exc.tlDetected") },
        ...(x.kind === "blocked_mixing" ? [{ at: x.at.replace("T", " "), who: t("m16.who.db"), text: t("m16.exc.tlBlocked"), tone: "danger" as Tone }] : []),
        ...(res ? [{ at: res.date, who: t("m16.who.ssb"), text: t("m16.exc.tlResolution", { id: res.id }), tone: "ok" as Tone }] : []),
        ...pur.map((j) => ({ at: j.date, who: t("m16.who.system"), text: `${j.id} · ${pick(j.memoAr, j.memoEn)}` })),
      ]} />}
    >
      <Fields items={[
        { label: t("m16.col.kind"), value: t(`m16.exc.kind.${x.kind}`) },
        { label: t("m16.exc.by"), value: who ? `${pick(who.nameAr, who.nameEn)} – ${t(who.roleKey)}` : x.byPersonaId },
        { label: t("common.amount"), value: <Money value={x.amount} strong /> },
        { label: t("m16.exc.outcome"), value: <Badge tone={x.outcome === "blocked" ? "danger" : "info"}>{t(`m16.outcome.${x.outcome}`)}</Badge> },
      ]} />
      {attempt && (
        <div className="mt-5">
          <h4 className="mb-2 text-[14px] font-extrabold text-navy">{t("m16.exc.attemptTitle")}</h4>
          <div className="grid gap-3 md:grid-cols-2">
            {(["SHF", "PTF"] as FundCode[]).map((f) => {
              const ls = attempt.filter(([a]) => a.startsWith(f));
              const d = sum(ls.map((l) => l[1])), c = sum(ls.map((l) => l[2]));
              return (
                <div key={f} className="rounded-lg border-2 border-danger/40 p-2">
                  <div className="mb-1 flex items-center gap-2"><FundBadge fund={f} /><span className="ms-auto text-[12px] font-bold text-danger">{t("m16.exc.unbalanced", { d: money(d), c: money(c) })}</span></div>
                  <table className="w-full text-[12px]"><tbody>
                    {ls.map(([a, dr, cr]) => (
                      <tr key={a} className="border-t border-line/60">
                        <td className="py-1"><span className="num">{a}</span> · {pick(accountById[a].nameAr, accountById[a].nameEn)}</td>
                        <td className="py-1 text-end">{dr ? <Money value={dr} /> : ""}</td><td className="py-1 text-end">{cr ? <Money value={cr} /> : ""}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>
              );
            })}
          </div>
          <div className="mt-3"><Blocked text={t("m16.exc.dbRule")} /></div>
        </div>
      )}
      {x.kind === "non_compliant_income" && (
        <div className="mt-5">
          <h4 className="mb-2 text-[14px] font-extrabold text-navy">{t("m16.pur.title")}</h4>
          <StatusBar current="paid" stages={[{ id: "det", label: t("m16.pur.detected") }, { id: "aside", label: t("m16.pur.aside") }, { id: "ssb", label: t("m16.pur.ssb") }, { id: "paid", label: t("m16.pur.paid") }]} />
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {pur.map((j) => (
              <div key={j.id} className="rounded-lg border border-line p-2 text-[12px]">
                <div className="mb-1 flex flex-wrap items-center gap-2"><span className="num font-bold">{j.id}</span><DateText value={j.date} /><ShariaBadge status={j.sharia_status} /></div>
                <p className="mb-1 text-muted">{pick(j.memoAr, j.memoEn)}</p>
                <table className="w-full"><tbody>
                  {j.lines.map((l, i) => (
                    <tr key={i} className="border-t border-line/60">
                      <td className="py-1">{pick(accountById[l.accountId].nameAr, accountById[l.accountId].nameEn)}</td>
                      <td className="py-1 text-end">{l.debit ? <Money value={l.debit} /> : ""}</td><td className="py-1 text-end">{l.credit ? <Money value={l.credit} /> : ""}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[12px] text-muted">{t("m16.pur.note")}</p>
        </div>
      )}
      <div className="mt-4"><LockedNote text={t("m16.exc.locked")} /></div>
    </Sheet>
  );
}
function Exceptions() {
  const { t, pick } = useT();
  const [sel, setSel] = useState<string | null>(null);
  const x = shariaExceptions.find((e) => e.id === sel);
  if (x) return <ExceptionDetail x={x} onBack={() => setSel(null)} />;
  const rows = [...shariaExceptions].sort((a, b) => b.at.localeCompare(a.at));
  return (
    <div>
      <ControlPanel title={t("m16.s2.title")} actions={<GuardButton tryLabel={t("m16.guard.mix.try")} blockedText={t("m16.guard.mix.blocked")} />} />
      <KpiRow items={[
        { label: t("m16.kpi.blocked"), value: shariaExceptions.filter((e) => e.kind === "blocked_mixing").length, hint: t("m16.kpi.blockedHint"), tone: "danger" },
        { label: t("m16.kpi.purified"), value: <Money value={sum(shariaExceptions.filter((e) => e.outcome === "purified").map((e) => e.amount))} />, hint: t("m16.kpi.purifiedHint") },
        { label: t("m16.kpi.open"), value: 0, tone: "ok" },
        { label: t("m16.kpi.leaked"), value: <Money value={0} />, tone: "ok", hint: t("m16.kpi.leakedHint") },
      ]} />
      <DataTable rows={rows} onRowClick={(e) => setSel(e.id)} columns={[
        { key: "id", label: t("m16.col.ref"), render: (e) => <span className="num font-bold text-brand-deep">{e.id}</span> },
        { key: "at", label: t("m16.exc.at"), render: (e) => <span className="num">{e.at.replace("T", " ")}</span> },
        { key: "k", label: t("m16.col.kind"), render: (e) => <Badge tone={e.kind === "blocked_mixing" ? "danger" : "warn"}>{t(`m16.exc.kind.${e.kind}`)}</Badge> },
        { key: "d", label: t("m16.col.desc"), render: (e) => <span className="line-clamp-2 max-w-[420px]">{pick(e.descriptionAr, e.descriptionEn)}</span> },
        { key: "by", label: t("m16.exc.by"), render: (e) => { const p = personaById(e.byPersonaId); return p ? pick(p.nameAr, p.nameEn) : e.byPersonaId; } },
        { key: "a", label: t("common.amount"), align: "end", render: (e) => <Money value={e.amount} /> },
        { key: "o", label: t("m16.exc.outcome"), render: (e) => <Badge tone={e.outcome === "blocked" ? "danger" : "info"}>{t(`m16.outcome.${e.outcome}`)}</Badge> },
      ]} />
    </div>
  );
}

/* ---------------------------------------------------------------- s3: SSB board */
function Board() {
  const { t, pick } = useT();
  const pending = ssbApprovals.filter((a) => a.status === "pending");
  const [signed, setSigned] = useState<Record<string, string>>({});
  const [signing, setSigning] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const all = ssbMembers.every((m) => signed[m.id]);
  const subjectName = (kind: string, id: string) => {
    if (kind === "investment") { const c = investmentContracts.find((x) => x.id === id); return c ? pick(c.nameAr, c.nameEn) : id; }
    if (kind === "product") { const p = productById[id as keyof typeof productById]; return p ? pick(p.nameAr, p.nameEn) : id; }
    return id;
  };
  const byKind = Array.from(new Set(ssbApprovals.map((a) => a.subjectKind))).map((k) => ({ k, n: ssbApprovals.filter((a) => a.subjectKind === k && a.status === "approved").length }));
  const resCols: Column<SsbResolution>[] = [
    { key: "id", label: t("m16.col.resolution"), render: (r) => <span className="num font-bold">{r.id}</span> },
    { key: "d", label: t("common.date"), render: (r) => <DateText value={r.date} /> },
    { key: "s", label: t("m16.col.subject"), render: (r) => <Badge tone="neutral">{t(`m16.subject.${r.subject}`)}</Badge> },
    { key: "t", label: t("m16.col.title"), render: (r) => pick(r.titleAr, r.titleEn) },
    { key: "dec", label: t("m16.col.decision"), render: (r) => <Badge tone={r.decision === "approved" ? "ok" : r.decision === "rejected" ? "danger" : "warn"}>{t(`m16.decision.${r.decision}`)}</Badge> },
    { key: "sig", label: t("m16.col.signatures"), render: (r) => <span className="num flex items-center gap-1"><PenLine size={12} aria-hidden />{r.signedBy.length}/{ssbMembers.length}</span> },
  ];
  return (
    <div>
      <ControlPanel title={t("m16.s3.title")} />
      <div className="grid gap-4 p-4 lg:grid-cols-3">
        {ssbMembers.map((m) => (
          <div key={m.id} className="flex items-center gap-3 rounded-lg border border-line bg-surface p-3">
            <span className="grid size-10 place-items-center rounded-full bg-ok-soft text-ok"><ShieldCheck size={20} aria-hidden /></span>
            <div className="min-w-0">
              <div className="font-extrabold text-navy">{pick(m.nameAr, m.nameEn)}</div>
              <div className="text-[12px] text-muted">{pick(m.roleAr, m.roleEn)} · {t("m16.board.since")} <span className="num">{m.since.slice(0, 4)}</span></div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid gap-4 px-4 pb-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Panel title={t("m16.board.resolutions")}>
          <div className="-m-3"><DataTable columns={resCols} rows={[...ssbResolutions].sort((a, b) => b.date.localeCompare(a.date))} /></div>
        </Panel>
        <div className="grid content-start gap-4">
          {pending.map((a) => (
            <Panel key={a.id} title={t("m16.board.pending")} actions={all ? <Badge tone="ok">{t("m16.board.approvedNow")}</Badge> : <Badge tone="warn">{t("m16.board.awaiting")}</Badge>}>
              <div className="text-[13px] font-bold">{subjectName(a.subjectKind, a.subjectId)}</div>
              <div className="num text-[12px] text-muted">{a.id} · {a.subjectId} · {a.date}</div>
              <ul className="mt-3 grid gap-2">
                {ssbMembers.map((m) => (
                  <li key={m.id} className="flex items-center gap-2 text-[12px]">
                    <span className="min-w-0 flex-1">{pick(m.nameAr, m.nameEn)}</span>
                    {signed[m.id] ? <Badge tone="ok"><CheckCircle2 size={12} aria-hidden />{t("m16.board.signed")}</Badge>
                      : <Button onClick={() => { setSigning(m.id); setOtp(""); }}><PenLine size={14} aria-hidden />{t("m16.board.sign")}</Button>}
                  </li>
                ))}
              </ul>
              {all && <p className="mt-3 rounded-md bg-ok-soft p-2 text-[12px] text-ok">{t("m16.board.resolutionDraft")}</p>}
              <p className="mt-2 text-[11px] text-muted">{t("m16.board.rule")}</p>
            </Panel>
          ))}
          <Panel title={t("m16.board.approvals")}>
            <ul className="grid gap-1 text-[13px]">
              {byKind.map(({ k, n }) => <li key={k} className="flex items-center justify-between border-b border-line/60 py-1"><span>{t(`m16.approval.${k}`)}</span><Badge tone="ok">{n}</Badge></li>)}
            </ul>
          </Panel>
        </div>
      </div>
      <Modal open={!!signing} onClose={() => setSigning(null)} title={t("m16.board.signTitle")}>
        <p className="text-[13px]">{t("m16.board.signText", { name: (() => { const m = ssbMembers.find((x) => x.id === signing); return m ? pick(m.nameAr, m.nameEn) : ""; })() })}</p>
        <label className="mt-3 grid gap-1 text-[12px] font-bold text-muted">{t("m16.board.otp")}
          <input value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" className="num rounded-md border border-line bg-canvas p-2 text-[15px] tracking-widest text-ink" />
        </label>
        <div className="mt-3 flex gap-2">
          <Button variant="primary" disabled={otp.length !== 6} onClick={() => { if (signing) setSigned({ ...signed, [signing]: TODAY }); setSigning(null); }}>{t("m16.board.confirm")}</Button>
          <Button onClick={() => setSigning(null)}>{t("common.cancel")}</Button>
        </div>
      </Modal>
    </div>
  );
}

/* ---------------------------------------------------------------- s4: annual review & certificate */
function Certificate({ year, children }: { year: number; children?: ReactNode }) {
  const { t, pick } = useT();
  const cert = complianceCertificates.find((c) => c.scope === "annual" && c.year === year);
  if (!cert) return null;
  return (
    <div className="rounded-lg border-4 border-double border-ok/60 bg-surface p-6 text-center">
      <BadgeCheck size={36} className="mx-auto text-ok" aria-hidden />
      <div className="mt-2 text-[12px] font-bold text-muted">{t("app.company")}</div>
      <h3 className="mt-1 text-[20px] font-extrabold text-navy">{t("m16.cert.title", { y: year })}</h3>
      <p className="mx-auto mt-3 max-w-xl text-[13px] leading-7">{t("m16.cert.body", { y: year })}</p>
      <div className="mt-2 text-[12px] text-muted"><span className="num">{cert.id}</span> · {t("m16.cert.resolution")} <span className="num">{cert.resolutionId}</span> · {t("m16.cert.issued")} <span className="num">{cert.issuedAt}</span></div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {ssbMembers.map((m) => (
          <div key={m.id} className="rounded-md border border-line p-2 text-[12px]">
            <div className="font-bold text-navy">{pick(m.nameAr, m.nameEn)}</div>
            <div className="text-muted">{pick(m.roleAr, m.roleEn)}</div>
            <div className="mt-1 flex items-center justify-center gap-1 text-ok"><PenLine size={12} aria-hidden />{t("m16.cert.esigned")}</div>
          </div>
        ))}
      </div>
      {children}
    </div>
  );
}
function AnnualReview() {
  const { t, pick } = useT();
  const [year, setYear] = useState<2025 | 2026>(2026);
  const [stage, setStage] = useState<"pack" | "review">("pack");
  const y26 = REGISTER.filter((r) => r.date >= "2026-01-01");
  const iftSum = (type: string) => sum(interFundTransfers.filter((x) => x.type === type).map((x) => x.amount));
  const stages = [{ id: "pack", label: t("m16.ar.st.pack") }, { id: "review", label: t("m16.ar.st.review") }, { id: "res", label: t("m16.ar.st.res") }, { id: "approve", label: t("m16.ar.st.approve") }, { id: "cert", label: t("m16.ar.st.cert") }];
  const productCerts = complianceCertificates.filter((c) => c.scope === "product");
  return (
    <div>
      <ControlPanel title={t("m16.s4.title")}
        actions={<Button><Printer size={14} aria-hidden />{t("m16.ar.pdf")}</Button>}
        filters={[{ id: "2026", label: t("m16.ar.y2026"), active: year === 2026, onClick: () => setYear(2026) }, { id: "2025", label: t("m16.ar.y2025"), active: year === 2025, onClick: () => setYear(2025) }]} />
      <div className="px-4 pt-4"><StatusBar stages={stages} current={year === 2025 ? "cert" : stage} /></div>
      {year === 2026 ? (
        <div className="grid gap-4 p-4 lg:grid-cols-2">
          <Panel title={t("m16.ar.packTitle")} actions={stage === "pack" ? <Button variant="primary" onClick={() => setStage("review")}>{t("m16.ar.send")}</Button> : <Badge tone="info">{t("m16.ar.sent")}</Badge>}>
            <DataTable rows={STATUSES.map((s) => ({ id: s, s, n: y26.filter((r) => r.status === s).length }))} columns={[
              { key: "s", label: t("sharia.label"), render: (r) => <ShariaBadge status={r.s} /> },
              { key: "n", label: t("m16.ar.count"), align: "end", render: (r) => <span className="num font-bold">{r.n}</span> },
            ]} footer={<tr><td className="px-3 py-2">{t("common.total")}</td><td className="px-3 py-2 text-end num">{y26.length}</td></tr>} />
            <p className="mt-2 text-[12px] text-muted">{t("m16.ar.packNote")}</p>
          </Panel>
          <Panel title={t("m16.ar.calcTitle")}>
            <Fields cols={1} items={[
              { label: t("m16.ar.wakala"), value: <Money value={iftSum("WAKALA_FEE")} /> },
              { label: t("m16.ar.mudarib"), value: <Money value={iftSum("MUDARIB_SHARE")} /> },
              { label: t("m16.ar.qard"), value: <Money value={iftSum("QARD_REPAY")} /> },
              { label: t("m16.ar.surplus"), value: <span><Money value={surplusRun.distributable} /> · <span className="num">{surplusRun.ssbResolutionId}</span></span> },
              { label: t("m16.ar.exceptions"), value: <span className="num">{shariaExceptions.length}</span> },
              { label: t("m16.ar.purified"), value: <Money value={sum(shariaExceptions.filter((e) => e.outcome === "purified").map((e) => e.amount))} /> },
              { label: t("m16.ar.toShareholders"), value: <span className="text-ok"><Money value={0} strong /></span> },
            ]} />
          </Panel>
          <Panel title={t("m16.ar.productCerts")}>
            <ul className="grid gap-1 text-[13px]">
              {productCerts.map((c) => (
                <li key={c.id} className="flex flex-wrap items-center gap-2 border-b border-line/60 py-1">
                  <BadgeCheck size={14} className="text-ok" aria-hidden />
                  <span className="min-w-0 flex-1">{c.productId ? pick(productById[c.productId].nameAr, productById[c.productId].nameEn) : c.id}</span>
                  <span className="num text-[12px] text-muted">{c.id}</span>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title={t("m16.ar.nextTitle")}>
            <p className="text-[13px]">{t("m16.ar.nextText")}</p>
            <div className="mt-3"><LockedNote text={t("m16.ar.lockedUntil")} /></div>
          </Panel>
        </div>
      ) : (
        <div className="p-4"><Certificate year={2025}><p className="mt-4 text-[11px] text-muted">{t("m16.cert.note")}</p></Certificate></div>
      )}
    </div>
  );
}

export const screens: Record<string, ComponentType> = {
  s1: Register,
  s2: Exceptions,
  s3: Board,
  s4: AnnualReview,
};

void journalById;
