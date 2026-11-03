"use client";
// Private building blocks for m12 (accounting & the takaful fund engine).
import { useState } from "react";
import { ArrowLeftRight, CheckCircle2, Undo2, ArrowRight, ArrowLeft } from "lucide-react";
import { Badge, Button, DataTable, Fields, LockedNote, Money, DateText, Panel, Sheet, Timeline, type Tone } from "@/components/ui";
import { useT } from "@/components/I18n";
import { accountById, iftById, journalById, journalFundTotals, isJournalBalancedPerFund, isPeriodClosed, periods, round3, TODAY } from "@/data/seed";
import type { FundCode, Journal, JournalLine, ShariaStatus } from "@/data/seed";
import { personaById } from "@/content/personas";

export const FUND_TONE: Record<FundCode, Tone> = { PTF: "info", SHF: "warn", PIF: "neutral" };
export function FundBadge({ fund }: { fund: FundCode }) {
  const { t } = useT();
  return <Badge tone={FUND_TONE[fund]}>{t(`fund.${fund}`)}</Badge>;
}
const SHARIA_TONE: Record<ShariaStatus, Tone> = { compliant: "ok", pending_review: "warn", non_compliant: "danger", purified: "info" };
export function ShariaBadge({ status }: { status: ShariaStatus }) {
  const { t } = useT();
  return <Badge tone={SHARIA_TONE[status]}>{t(`sharia.${status}`)}</Badge>;
}
export const jTotal = (j: Journal) => round3(j.lines.reduce((s, l) => s + l.debit, 0));
export const jFunds = (j: Journal) => Array.from(new Set(j.lines.map((l) => l.fund))) as FundCode[];
export const ymOf = (d: string) => d.slice(0, 7);

/** Who did what: auto journals are prepared and approved by a posting rule; transfers list their approvers. */
export function useWho() {
  const { t, pick } = useT();
  return (id: string) => {
    if (id === "rule") return t("m12.who.rule");
    if (id === "actuary") return t("m12.who.actuary");
    if (id === "board") return t("m12.who.board");
    const p = personaById(id);
    return p ? pick(p.nameAr, p.nameEn) : id;
  };
}

function LinesTable({ lines }: { lines: (JournalLine & { id: string })[] }) {
  const { t, pick } = useT();
  const d = round3(lines.reduce((s, l) => s + l.debit, 0)), c = round3(lines.reduce((s, l) => s + l.credit, 0));
  return (
    <DataTable
      rows={lines}
      columns={[
        { key: "acc", label: t("m12.col.account"), render: (l) => <span className="num font-bold">{l.accountId}</span> },
        { key: "name", label: t("m12.col.accountName"), render: (l) => { const a = accountById[l.accountId]; return a ? pick(a.nameAr, a.nameEn) : l.accountId; } },
        { key: "dr", label: t("m12.col.debit"), align: "end", render: (l) => (l.debit ? <Money value={l.debit} /> : "") },
        { key: "cr", label: t("m12.col.credit"), align: "end", render: (l) => (l.credit ? <Money value={l.credit} /> : "") },
      ]}
      footer={<tr><td className="px-3 py-2" colSpan={2}>{t("common.total")}</td><td className="px-3 py-2 text-end"><Money value={d} /></td><td className="px-3 py-2 text-end"><Money value={c} /></td></tr>}
    />
  );
}

/** Journal lines grouped by fund; each group shows it balances on its own. */
export function FundGroups({ j, lines }: { j: Journal; lines?: JournalLine[] }) {
  const { t } = useT();
  const all = lines ?? j.lines;
  const funds = Array.from(new Set(all.map((l) => l.fund))) as FundCode[];
  const totals = journalFundTotals({ ...j, lines: all });
  return (
    <div className="grid gap-3 xl:grid-cols-2">
      {funds.map((f) => {
        const ok = Math.abs(totals[f].diff) < 0.0005;
        return (
          <section key={f} className={`min-w-0 overflow-hidden rounded-lg border-2 ${f === "PTF" ? "border-brand/40" : "border-warn/40"}`}>
            <header className={`flex flex-wrap items-center gap-2 px-3 py-2 ${f === "PTF" ? "bg-soft" : "bg-warn-soft"}`}>
              <FundBadge fund={f} />
              <span className="ms-auto flex items-center gap-1 text-[12px] font-bold">
                {ok ? <><CheckCircle2 size={14} className="text-ok" aria-hidden /><span className="text-ok">{t("m12.rec.balancedInFund")}</span></>
                  : <span className="text-danger">{t("m12.rec.unbalancedInFund")}</span>}
              </span>
            </header>
            <LinesTable lines={all.filter((l) => l.fund === f).map((l, i) => ({ ...l, id: `${f}-${i}` }))} />
          </section>
        );
      })}
    </div>
  );
}

/** Inter-fund transfer card: the only way money moves between funds. */
export function TransferCard({ iftId }: { iftId: string }) {
  const { t, lang } = useT();
  const who = useWho();
  const x = iftById[iftId];
  if (!x) return null;
  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;
  return (
    <div className="rounded-lg border-2 border-dashed border-brand/50 bg-surface p-3">
      <div className="flex flex-wrap items-center gap-2">
        <ArrowLeftRight size={16} className="text-brand" aria-hidden />
        <span className="font-extrabold text-navy">{t("m12.ift.title")}</span>
        <span className="num text-[12px] text-muted">{x.id}</span>
        <Badge tone="brand">{t(`m12.ift.${x.type}`)}</Badge>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-[13px]">
        <FundBadge fund={x.from} /><Arrow size={14} aria-hidden />
        {x.to === "PARTICIPANTS" ? <Badge tone="ok">{t("m12.ift.participants")}</Badge> : <FundBadge fund={x.to} />}
        <span className="ms-auto font-bold"><Money value={x.amount} strong /></span>
      </div>
      <p className="mt-2 text-[12px] text-muted">{t("m12.ift.only")}</p>
      <p className="mt-1 text-[12px]"><span className="font-bold text-muted">{t("m12.ift.approvedBy")}: </span>{x.approvedBy.map(who).join(" · ")}</p>
    </div>
  );
}

/** Full journal record: per-fund lines, linked transfer, lock, reverse. */
export function JournalRecord({ id, onBack }: { id: string; onBack?: () => void }) {
  const { t, pick } = useT();
  const who = useWho();
  const j = journalById[id];
  const [reversal, setReversal] = useState(false);
  if (!j) return null;
  const closed = isPeriodClosed(j.date);
  const per = periods.find((p) => p.id === ymOf(j.date));
  const revLines = j.lines.map((l) => ({ ...l, debit: l.credit, credit: l.debit }));
  const funds = jFunds(j);
  const timeline = [
    { at: j.date, who: t("m12.who.rule"), text: t("m12.tl.posted", { src: t(`m12.src.${j.source}`) }), tone: "ok" as Tone },
    ...(j.iftId ? [{ at: j.date, who: t("m12.who.rule"), text: t("m12.tl.ift", { id: j.iftId }) }] : []),
    ...(closed && per?.closedAt ? [{ at: per.closedAt, who: who(per.closedByPersonaId ?? "cfo"), text: t("m12.tl.periodClosed", { p: per.id }) }] : []),
    ...(reversal ? [{ at: TODAY, who: who("accountant"), text: t("m12.tl.reversed"), tone: "warn" as Tone }] : []),
  ];
  return (
    <Sheet
      title={<span className="num">{j.id}</span>}
      subtitle={pick(j.memoAr, j.memoEn)}
      status={<div className="flex gap-2"><Badge tone="ok">{t("m12.status.posted")}</Badge>{reversal && <Badge tone="warn">{t("m12.status.reversed")}</Badge>}</div>}
      actions={<>
        {onBack && <Button variant="ghost" onClick={onBack}>{t("m12.back")}</Button>}
        <Button variant="primary" disabled={reversal} onClick={() => setReversal(true)}><Undo2 size={14} aria-hidden />{t("m12.rec.reverse")}</Button>
      </>}
      side={<Timeline title={t("common.activity")} items={timeline} />}
    >
      <Fields items={[
        { label: t("common.date"), value: <DateText value={j.date} /> },
        { label: t("m12.col.source"), value: <Badge tone="info">{t("m12.auto")} · {t(`m12.src.${j.source}`)}</Badge> },
        { label: t("m12.col.sourceId"), value: <span className="num">{j.sourceId ?? "—"}</span> },
        { label: t("m12.col.funds"), value: <span className="flex flex-wrap gap-1">{funds.map((f) => <FundBadge key={f} fund={f} />)}</span> },
        { label: t("m12.col.period"), value: closed ? <Badge tone="neutral">{t("m12.period.closed", { p: ymOf(j.date) })}</Badge> : <Badge tone="ok">{t("m12.period.open", { p: ymOf(j.date) })}</Badge> },
        { label: t("sharia.label"), value: <ShariaBadge status={j.sharia_status} /> },
        { label: t("m12.rec.preparedBy"), value: t("m12.who.rule") },
        { label: t("m12.rec.approvedBy"), value: t("m12.who.ruleApproved") },
      ]} />

      <h4 className="mt-5 mb-2 text-[14px] font-extrabold text-navy">{t("m12.rec.linesPerFund")}</h4>
      <FundGroups j={j} />
      <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px]">
        {isJournalBalancedPerFund(j) && <Badge tone="ok"><CheckCircle2 size={12} aria-hidden />{t("m12.rec.dbCheck")}</Badge>}
        {funds.length > 1 ? <Badge tone="info">{t("m12.rec.crossNeedsIft")}</Badge> : <Badge tone="neutral">{t("m12.rec.singleFund")}</Badge>}
      </div>

      {j.iftId && <div className="mt-4"><TransferCard iftId={j.iftId} /></div>}

      <div className="mt-4"><LockedNote text={t("common.locked")} /></div>

      {reversal && (
        <div className="mt-4">
          <Panel title={t("m12.rev.title", { id: j.id })} actions={<Badge tone="ok">{t("m12.period.open", { p: ymOf(TODAY) })}</Badge>}>
            <p className="mb-2 text-[12px] text-muted">{t("m12.rev.note", { date: TODAY })}</p>
            <FundGroups j={j} lines={revLines} />
          </Panel>
        </div>
      )}
    </Sheet>
  );
}
