"use client";
import { useMemo, useState, type ComponentType, type ReactNode } from "react";
import { CreditCard, Landmark, Banknote, Ban, ArrowLeftRight } from "lucide-react";
import {
  Badge, Button, ControlPanel, DataTable, DateText, Fields, KpiRow, LockedNote, Money, Panel, Sheet, Timeline, useFilter,
  type Column, type Tone,
} from "@/components/ui";
import { useT } from "@/components/I18n";
import {
  receipts, receiptById, policyById, customerById, outletById, instalments, instalmentsOfPolicy, overdueInstalments, journalById, iftById,
  accountById, commissionLines, agentById, journalFundTotals, isJournalBalancedPerFund, kpis, STORY, TODAY, addDays, round3,
} from "@/data/seed";
import type { PaymentChannel, Receipt, ShariaStatus } from "@/data/types";

/* ---------------- helpers ---------------- */
const SHARIA_TONE: Record<ShariaStatus, Tone> = { compliant: "ok", pending_review: "warn", non_compliant: "danger", purified: "info" };
function ShariaBadge({ s }: { s: ShariaStatus }) {
  const { t } = useT();
  return <Badge tone={SHARIA_TONE[s]}>{t(`sharia.${s}`)}</Badge>;
}
const CH_TONE: Record<PaymentChannel, Tone> = { cash_branch: "neutral", cash_border: "warn", bank_transfer: "info", card_moamalat: "ok" };
function ChannelBadge({ c }: { c: PaymentChannel }) {
  const { t } = useT();
  return <Badge tone={CH_TONE[c]}>{t(`m07.ch.${c}`)}</Badge>;
}
const FUND_TONE: Record<string, Tone> = { PTF: "ok", SHF: "info", PIF: "neutral" };
function FundBadge({ f }: { f: string }) {
  const { t } = useT();
  return <Badge tone={FUND_TONE[f] ?? "neutral"}>{t(`fund.${f}`)}</Badge>;
}
const sum = (xs: number[]) => round3(xs.reduce((s, x) => s + x, 0));
const daysBetween = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 86400000);
function useNames() {
  const { pick } = useT();
  return {
    customer: (id: string) => { const c = customerById[id]; return c ? pick(c.nameAr, c.nameEn) : id; },
    outlet: (id: string) => { const o = outletById[id]; return o ? pick(o.nameAr, o.nameEn) : id; },
    account: (id: string) => { const a = accountById[id]; return a ? pick(a.nameAr, a.nameEn) : id; },
  };
}

/* ---------------- receipt record (shared by s1 and s2) ---------------- */
function ReceiptRecord({ id, onBack, switcher }: { id: string; onBack?: () => void; switcher?: ReactNode }) {
  const { t, pick } = useT();
  const n = useNames();
  const r = receiptById[id];
  const pol = policyById[r.policyId];
  const ins = instalments.find((i) => i.id === r.instalmentId);
  const j = r.journalId ? journalById[r.journalId] : undefined;
  const ift = r.iftId ? iftById[r.iftId] : undefined;
  const com = commissionLines.find((c) => c.receiptId === r.id && c.kind === "earned");
  const tabPct = 100 - pol.wakalaPct;
  const auto = r.channel === "card_moamalat" || r.channel === "bank_transfer";
  const totals = j ? journalFundTotals(j) : {};
  const tl: { at: string; who?: string; text: ReactNode; tone?: Tone }[] = [
    { at: `${r.date} 10:02:11`, who: auto ? t("m07.rc.gateway") : t("m07.rc.cashierShort"), text: t("m07.tl.paid", { ch: t(`m07.ch.${r.channel}`) }) },
    { at: `${r.date} 10:02:12`, text: t("m07.tl.number", { id: r.id }) },
    { at: `${r.date} 10:02:12`, text: t("m07.tl.split", { rule: pol.splitRuleId }), tone: "ok" },
  ];
  if (j) tl.push({ at: `${r.date} 10:02:13`, text: t("m07.tl.journal", { j: j.id }), tone: "ok" });
  if (ift) tl.push({ at: `${r.date} 10:02:13`, text: t("m07.tl.ift", { id: ift.id }) });
  tl.push({ at: `${r.date} 10:02:14`, text: t("m07.tl.account") });
  if (com) tl.push({ at: `${com.date} 10:02:15`, text: t("m07.tl.commission", { agent: pick(agentById[com.agentId].nameAr, agentById[com.agentId].nameEn) }) });
  tl.reverse();

  return (
    <Sheet
      title={<span className="num">{r.id}</span>}
      subtitle={<span><span className="num">{pol.certNo}</span> · {n.customer(r.customerId)}</span>}
      status={<span className="flex flex-wrap gap-1"><Badge tone={j ? "ok" : "neutral"}>{j ? t("m07.rc.posted") : t("m07.rc.preGl")}</Badge><ShariaBadge s={r.sharia_status} /></span>}
      actions={<>{onBack && <Button variant="ghost" onClick={onBack}>{t("m07.back")}</Button>}{switcher}<Button>{t("common.print")}</Button></>}
      side={<Timeline title={t("m07.rc.trail")} items={tl} />}
    >
      <Fields items={[
        { label: t("common.date"), value: <DateText value={r.date} /> },
        { label: t("m07.col.amount"), value: <Money value={r.amount} strong /> },
        { label: t("m07.col.cert"), value: <span className="num">{pol.certNo}</span> },
        { label: t("m07.rc.instalment"), value: ins ? <span className="num">{t("m07.rc.insV", { n: ins.seq, d: ins.dueDate })}</span> : "—" },
        { label: t("m07.col.outlet"), value: n.outlet(r.outletId) },
        { label: t("m07.col.channel"), value: <ChannelBadge c={r.channel} /> },
        { label: t("m07.rc.ref"), value: <span className="num">{r.gatewayRef ?? "—"}</span> },
        { label: t("m07.rc.splitRule"), value: <span className="num">{pol.splitRuleId}</span> },
        { label: t("m07.rc.prepared"), value: auto ? t("m07.rc.gateway") : t("m07.rc.cashier", { outlet: n.outlet(r.outletId) }) },
        { label: t("m07.rc.approved"), value: t("m07.rc.rule", { rule: pol.splitRuleId }) },
      ]} />

      <h4 className="mt-5 mb-2 text-[14px] font-extrabold text-navy">{t("m07.split.title")}</h4>
      <div className="flex h-9 overflow-hidden rounded-md text-[12px] font-bold text-white" role="img" aria-label={t("m07.split.title")}>
        <div className="flex items-center justify-center bg-brand px-2" style={{ width: `${tabPct}%` }}>{t("m07.split.tabarru")} {tabPct}%</div>
        <div className="flex items-center justify-center bg-accent px-2" style={{ width: `${pol.wakalaPct}%` }}>{t("m07.split.wakala")} {pol.wakalaPct}%</div>
      </div>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <div className="rounded-md border border-line p-3">
          <div className="text-[12px] text-muted">{t("m07.split.tabarru")} → {t("fund.PTF")}</div>
          <div className="text-[18px] font-extrabold text-navy"><Money value={r.tabarru} /></div>
          <div className="text-[11px] text-muted">{t("m07.split.tabarruH")}</div>
        </div>
        <div className="rounded-md border border-line p-3">
          <div className="text-[12px] text-muted">{t("m07.split.wakala")} → {t("fund.SHF")}</div>
          <div className="text-[18px] font-extrabold text-navy"><Money value={r.wakala} /></div>
          <div className="text-[11px] text-muted">{ift ? t("m07.split.wakalaH", { id: ift.id }) : t("m07.split.wakalaPre")}</div>
        </div>
      </div>

      <h4 className="mt-5 mb-2 text-[14px] font-extrabold text-navy">{j ? t("m07.j.title", { id: j.id }) : t("m07.j.none")}</h4>
      {j ? (
        <>
          <DataTable rows={j.lines.map((l, i) => ({ ...l, id: `${i}` }))} columns={[
            { key: "acc", label: t("m07.j.account"), render: (l) => <span><span className="num text-muted">{l.accountId}</span> · {n.account(l.accountId)}</span> },
            { key: "fund", label: t("m07.j.fund"), render: (l) => <FundBadge f={l.fund} /> },
            { key: "dr", label: t("m07.j.debit"), align: "end", render: (l) => l.debit ? <Money value={l.debit} /> : "" },
            { key: "cr", label: t("m07.j.credit"), align: "end", render: (l) => l.credit ? <Money value={l.credit} /> : "" },
          ]} />
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px]">
            {Object.entries(totals).map(([f, x]) => (
              <Badge key={f} tone={Math.abs(x.diff) < 0.0005 ? "ok" : "danger"}>{t("m07.j.balanced", { fund: t(`fund.${f}`) })}</Badge>
            ))}
            {isJournalBalancedPerFund(j) && j.iftId && <Badge tone="info">{t("m07.j.iftRef", { id: j.iftId })}</Badge>}
          </div>
          <div className="mt-2"><LockedNote text={t("common.locked")} /></div>
        </>
      ) : <p className="text-[12px] text-muted">{t("m07.j.preGl")}</p>}
    </Sheet>
  );
}

/* ---------------- s1: receipts list ---------------- */
type CFilter = "all" | PaymentChannel;
const rcText = (r: Receipt) => `${r.id} ${policyById[r.policyId]?.certNo ?? ""} ${customerById[r.customerId]?.nameAr ?? ""} ${customerById[r.customerId]?.nameEn ?? ""} ${r.gatewayRef ?? ""}`;
function Receipts() {
  const { t } = useT();
  const n = useNames();
  const [filter, setFilter] = useState<CFilter>("all");
  const [open, setOpen] = useState<string | null>(null);
  const base = useMemo(() => receipts.filter((r) => filter === "all" || r.channel === filter).slice().sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)), [filter]);
  const { rows, setQ } = useFilter(base, rcText);
  if (open) return <ReceiptRecord id={open} onBack={() => setOpen(null)} />;
  const y26 = receipts.filter((r) => r.date >= "2026-01-01");
  const cols: Column<Receipt>[] = [
    { key: "id", label: t("m07.col.id"), render: (r) => <span className="num font-bold text-brand-deep">{r.id}</span> },
    { key: "date", label: t("common.date"), render: (r) => <DateText value={r.date} /> },
    { key: "cert", label: t("m07.col.cert"), render: (r) => <span className="num">{policyById[r.policyId].certNo}</span> },
    { key: "cust", label: t("m07.col.customer"), render: (r) => <span>{n.customer(r.customerId)}{STORY.receiptIds.includes(r.id) && <span className="ms-2"><Badge tone="info">{t("m07.hero")}</Badge></span>}</span> },
    { key: "outlet", label: t("m07.col.outlet"), render: (r) => n.outlet(r.outletId) },
    { key: "ch", label: t("m07.col.channel"), render: (r) => <ChannelBadge c={r.channel} /> },
    { key: "amt", label: t("m07.col.amount"), align: "end", render: (r) => <Money value={r.amount} strong /> },
    { key: "tab", label: t("m07.col.ptf"), align: "end", render: (r) => <Money value={r.tabarru} /> },
    { key: "wak", label: t("m07.col.shf"), align: "end", render: (r) => <Money value={r.wakala} /> },
    { key: "j", label: t("m07.col.journal"), render: (r) => r.journalId ? <span className="num text-[12px]">{r.journalId}</span> : <Badge tone="neutral">{t("m07.rc.preGl")}</Badge> },
  ];
  const f = (id: CFilter, label: string) => ({ id, label, active: filter === id, onClick: () => setFilter(id) });
  return (
    <div>
      <KpiRow items={[
        { label: t("m07.k.collected"), value: <Money value={sum(y26.map((r) => r.amount))} />, hint: t("m07.k.sample") },
        { label: t("m07.k.ptf"), value: <Money value={sum(y26.map((r) => r.tabarru))} /> },
        { label: t("m07.k.shf"), value: <Money value={sum(y26.map((r) => r.wakala))} /> },
        { label: t("m07.k.count"), value: receipts.length, hint: t("m07.k.countH") },
      ]} />
      <ControlPanel title={t("m07.s1.title")} onSearch={setQ}
        filters={[f("all", t("common.all")), f("cash_branch", t("m07.ch.cash_branch")), f("bank_transfer", t("m07.ch.bank_transfer")), f("card_moamalat", t("m07.ch.card_moamalat")), f("cash_border", t("m07.ch.cash_border"))]} />
      <DataTable columns={cols} rows={rows} onRowClick={(r) => setOpen(r.id)}
        footer={<tr><td colSpan={6} className="px-3 py-2">{t("common.total")}</td>
          <td className="px-3 py-2 text-end"><Money value={sum(rows.map((r) => r.amount))} /></td>
          <td className="px-3 py-2 text-end"><Money value={sum(rows.map((r) => r.tabarru))} /></td>
          <td className="px-3 py-2 text-end"><Money value={sum(rows.map((r) => r.wakala))} /></td><td /></tr>} />
    </div>
  );
}

/* ---------------- s2: hero receipt split ---------------- */
function HeroSplit() {
  const { t } = useT();
  const ids = STORY.receiptIds;
  const [id, setId] = useState<string>(ids[0]);
  return (
    <ReceiptRecord id={id} switcher={
      <span className="flex gap-1">
        {ids.map((x, i) => <Button key={x} variant={x === id ? "primary" : "secondary"} onClick={() => setId(x)}>{t("m07.rc.insN", { n: i + 1 })}</Button>)}
      </span>
    } />
  );
}

/* ---------------- s3: instalments & dunning ---------------- */
const dunStage = (days: number) => (days <= 7 ? "r1" : days <= 15 ? "r2" : days <= 30 ? "final" : "lapse");
function Dunning() {
  const { t, pick } = useT();
  const n = useNames();
  const [sent, setSent] = useState<Record<string, boolean>>({});
  const [lateFee, setLateFee] = useState<"none" | "charity">("none");
  const heroPol = policyById[STORY.policyId];
  const heroIns = instalmentsOfPolicy(heroPol.id);
  const overdue = overdueInstalments().map((i) => ({ ...i, days: daysBetween(i.dueDate, TODAY) }));
  const upcoming = instalments.filter((i) => i.status === "due" && i.dueDate <= addDays(TODAY, 60)).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const last = kpis[kpis.length - 1];
  const charity = accountById["PTF-2160"];
  return (
    <div>
      <KpiRow items={[
        { label: t("m07.d.k.overdue"), value: overdue.length, tone: "danger", hint: <Money value={sum(overdue.map((i) => i.amount))} /> },
        { label: t("m07.d.k.upcoming"), value: upcoming.length, hint: <Money value={sum(upcoming.map((i) => i.amount))} /> },
        { label: t("m07.d.k.rate"), value: `${last.collectionRatePct}%`, hint: last.month },
        { label: t("m07.d.k.interest"), value: <Money value={0} />, tone: "ok", hint: t("m07.d.k.interestH") },
      ]} />
      <div className="grid gap-4 px-4 pb-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid min-w-0 content-start gap-4">
          <Panel title={t("m07.d.overdue")}>
            <DataTable rows={overdue} columns={[
              { key: "cert", label: t("m07.col.cert"), render: (i) => <span className="num font-bold">{policyById[i.policyId].certNo}</span> },
              { key: "cust", label: t("m07.col.customer"), render: (i) => n.customer(policyById[i.policyId].customerId) },
              { key: "seq", label: t("m07.d.seq"), align: "center", render: (i) => <span className="num">{i.seq}</span> },
              { key: "due", label: t("m07.d.due"), render: (i) => <DateText value={i.dueDate} /> },
              { key: "days", label: t("m07.d.days"), align: "center", render: (i) => <Badge tone={i.days > 30 ? "danger" : "warn"}>{t("m07.d.daysV", { n: i.days })}</Badge> },
              { key: "amt", label: t("m07.col.amount"), align: "end", render: (i) => <Money value={i.amount} /> },
              { key: "stage", label: t("m07.d.stage"), render: (i) => t(`m07.d.stage.${dunStage(i.days)}`) },
              { key: "act", label: "", render: (i) => sent[i.id] ? <Badge tone="ok">{t("m07.d.sent")}</Badge> : <Button onClick={() => setSent((s) => ({ ...s, [i.id]: true }))}>{t("m07.d.send")}</Button> },
            ]} />
          </Panel>
          <Panel title={t("m07.d.hero", { cert: heroPol.certNo })}>
            <DataTable rows={heroIns} columns={[
              { key: "seq", label: t("m07.d.seq"), align: "center", render: (i) => <span className="num">{i.seq}</span> },
              { key: "due", label: t("m07.d.due"), render: (i) => <DateText value={i.dueDate} /> },
              { key: "amt", label: t("m07.col.amount"), align: "end", render: (i) => <Money value={i.amount} /> },
              { key: "rc", label: t("m07.col.id"), render: (i) => <span className="num">{i.receiptId ?? "—"}</span> },
              { key: "ch", label: t("m07.col.channel"), render: (i) => i.receiptId ? <ChannelBadge c={receiptById[i.receiptId].channel} /> : "—" },
              { key: "st", label: t("common.status"), render: (i) => <Badge tone={i.status === "paid" ? "ok" : i.status === "overdue" ? "danger" : "neutral"}>{t(`m07.insSt.${i.status}`)}</Badge> },
            ]} />
            <p className="mt-2 text-[12px] text-muted">{t("m07.d.heroNote", { n: STORY.surplusShare })}</p>
          </Panel>
          <Panel title={t("m07.d.upcoming")}>
            <DataTable rows={upcoming} columns={[
              { key: "cert", label: t("m07.col.cert"), render: (i) => <span className="num">{policyById[i.policyId].certNo}</span> },
              { key: "cust", label: t("m07.col.customer"), render: (i) => n.customer(policyById[i.policyId].customerId) },
              { key: "due", label: t("m07.d.due"), render: (i) => <DateText value={i.dueDate} /> },
              { key: "amt", label: t("m07.col.amount"), align: "end", render: (i) => <Money value={i.amount} /> },
              { key: "rem", label: t("m07.d.reminder"), render: (i) => <span className="num text-[12px]">{addDays(i.dueDate, -7)}</span> },
            ]} />
          </Panel>
        </div>
        <div className="grid content-start gap-4">
          <Timeline title={t("m07.d.ladder")} items={["m7", "d0", "p7", "p15", "p30"].map((k) => ({ at: t(`m07.d.lad.${k}.at`), text: t(`m07.d.lad.${k}`), tone: k === "p30" ? "danger" : k === "p15" ? "warn" : "info" }))} />
          <Panel title={t("m07.d.fee")}>
            <div className="grid gap-2 text-[13px]">
              {(["none", "charity"] as const).map((k) => (
                <label key={k} className={`flex cursor-pointer items-start gap-2 rounded-md border p-2 ${lateFee === k ? "border-brand bg-soft" : "border-line"}`}>
                  <input type="radio" name="latefee" checked={lateFee === k} onChange={() => setLateFee(k)} className="mt-1" />
                  <span><b>{t(`m07.d.fee.${k}`)}</b>{k === "none" && <span className="ms-2"><Badge tone="ok">{t("common.recommended")}</Badge></span>}
                    <span className="block text-[12px] text-muted">{t(`m07.d.fee.${k}H`, { acc: `${charity.id} · ${pick(charity.nameAr, charity.nameEn)}` })}</span></span>
                </label>
              ))}
              <p className="rounded-md bg-danger-soft p-2 text-[12px] text-danger">{t("m07.d.noRiba")}</p>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

/* ---------------- s4: cash-up, bank reconciliation, gateways ---------------- */
interface CashRow { id: string; outletId: string; date: string; currency: string; system: number; count: number; pending?: boolean }
function CashBank() {
  const { t } = useT();
  const n = useNames();
  const cashRows: CashRow[] = useMemo(() => {
    const out: CashRow[] = [];
    const ids = Array.from(new Set(receipts.filter((r) => r.channel === "cash_border" || r.channel === "cash_branch").map((r) => r.outletId)));
    ids.sort((a, b) => (a.startsWith("BP-") ? 0 : 1) - (b.startsWith("BP-") ? 0 : 1) || a.localeCompare(b));
    for (const o of ids) {
      const cash = receipts.filter((r) => r.outletId === o && (r.channel === "cash_border" || r.channel === "cash_branch"));
      const day = cash.map((r) => r.date).sort().at(-1)!;
      out.push({ id: `${o}-LYD`, outletId: o, date: day, currency: "LYD", system: sum(cash.filter((r) => r.date === day).map((r) => r.amount)), count: 0 });
    }
    out.push({ id: "BP-RAJ-TND", outletId: "BP-RAJ", date: TODAY, currency: "TND", system: 0, count: 0, pending: true });
    out.push({ id: "BP-MJI-EUR", outletId: "BP-MJI", date: TODAY, currency: "EUR", system: 0, count: 0, pending: true });
    return out.map((r) => ({ ...r, count: r.system }));
  }, []);
  const [counted, setCounted] = useState<Record<string, number>>({ "BP-RAJ-LYD": round3((cashRows.find((r) => r.id === "BP-RAJ-LYD")?.system ?? 0) - 5) });
  const [closed, setClosed] = useState<Record<string, boolean>>({});

  const stmt = useMemo(() => {
    const lines = receipts.filter((r) => r.channel === "bank_transfer" && r.date >= "2026-10-01").map((r) => ({
      id: `BS-${r.id}`, date: r.date, ref: r.gatewayRef ?? "", amount: r.amount, match: r.id as string | null, kind: "matched" as "matched" | "noref" | "fee",
    }));
    lines.push({ id: "BS-X1", date: "2026-10-28", ref: "—", amount: 1250, match: null, kind: "noref" });
    lines.push({ id: "BS-X2", date: "2026-10-31", ref: "FEE-OCT", amount: -15, match: null, kind: "fee" });
    return lines.sort((a, b) => b.date.localeCompare(a.date));
  }, []);
  const [assigned, setAssigned] = useState<Record<string, boolean>>({});

  const gateways: { id: string; icon: ReactNode; on: boolean; tone: Tone }[] = [
    { id: "moamalat", icon: <CreditCard size={18} aria-hidden />, on: true, tone: "ok" },
    { id: "transfer", icon: <Landmark size={18} aria-hidden />, on: true, tone: "ok" },
    { id: "cash", icon: <Banknote size={18} aria-hidden />, on: true, tone: "ok" },
    { id: "lypay", icon: <ArrowLeftRight size={18} aria-hidden />, on: false, tone: "warn" },
    { id: "stripe", icon: <Ban size={18} aria-hidden />, on: false, tone: "neutral" },
    { id: "paypal", icon: <Ban size={18} aria-hidden />, on: false, tone: "neutral" },
  ];
  const matched = stmt.filter((s) => s.kind === "matched").length;

  return (
    <div className="grid gap-4 p-4">
      <Panel title={t("m07.cu.title")}>
        <DataTable rows={cashRows} columns={[
          { key: "o", label: t("m07.col.outlet"), render: (r) => <span className="font-bold">{n.outlet(r.outletId)}</span> },
          { key: "d", label: t("common.date"), render: (r) => <DateText value={r.date} /> },
          { key: "c", label: t("m07.cu.currency"), render: (r) => <Badge tone={r.pending ? "warn" : "neutral"}>{t(`m07.cur.${r.currency}`)}</Badge> },
          { key: "s", label: t("m07.cu.system"), align: "end", render: (r) => r.pending ? "—" : <Money value={r.system} /> },
          { key: "n", label: t("m07.cu.counted"), align: "end", render: (r) => r.pending ? "—" : (
            <input type="number" step="0.5" aria-label={t("m07.cu.counted")} disabled={closed[r.id]} value={counted[r.id] ?? r.count}
              onChange={(e) => setCounted((x) => ({ ...x, [r.id]: Number(e.target.value) || 0 }))}
              className="num w-28 rounded-md border border-line bg-canvas px-2 py-0.5 text-end text-[13px]" />) },
          { key: "diff", label: t("m07.cu.diff"), align: "end", render: (r) => {
            if (r.pending) return "—";
            const d = round3((counted[r.id] ?? r.count) - r.system);
            return <span className={d ? "font-bold text-danger" : "text-ok"}><Money value={d} /></span>;
          } },
          { key: "st", label: t("common.status"), render: (r) => {
            if (r.pending) return <Badge tone="warn">{t("m07.cu.pending")}</Badge>;
            if (closed[r.id]) return <Badge tone="ok">{t("m07.cu.closed")}</Badge>;
            const d = round3((counted[r.id] ?? r.count) - r.system);
            return d ? <span className="grid gap-1"><Badge tone="danger">{t("m07.cu.short")}</Badge><span className="text-[11px] text-muted">{t("m07.cu.shortH")}</span></span>
              : <Button onClick={() => setClosed((x) => ({ ...x, [r.id]: true }))}>{t("m07.cu.close")}</Button>;
          } },
        ]} />
        <p className="mt-2 text-[12px] text-muted">{t("m07.cu.note")}</p>
      </Panel>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Panel title={t("m07.br.title")} actions={<Badge tone="info">{t("m07.br.auto", { n: matched, all: stmt.length })}</Badge>}>
          <DataTable rows={stmt} columns={[
            { key: "d", label: t("common.date"), render: (s) => <DateText value={s.date} /> },
            { key: "ref", label: t("m07.br.ref"), render: (s) => <span className="num">{s.ref}</span> },
            { key: "a", label: t("m07.col.amount"), align: "end", render: (s) => <Money value={s.amount} /> },
            { key: "m", label: t("m07.br.match"), render: (s) => s.match ? <span className="num">{s.match}</span> : "—" },
            { key: "st", label: t("common.status"), render: (s) => s.kind === "matched" ? <Badge tone="ok">{t("m07.br.matched")}</Badge>
              : s.kind === "fee" ? <Badge tone="warn">{t("m07.br.fee")}</Badge>
              : assigned[s.id] ? <Badge tone="info">{t("m07.br.assigned")}</Badge>
              : <span className="flex flex-wrap items-center gap-2"><Badge tone="danger">{t("m07.br.noref")}</Badge><Button onClick={() => setAssigned((x) => ({ ...x, [s.id]: true }))}>{t("m07.br.assign")}</Button></span> },
          ]} />
          <p className="mt-2 text-[12px] text-muted">{t("m07.br.note")}</p>
        </Panel>
        <Panel title={t("m07.gw.title")}>
          <ul className="grid gap-2">
            {gateways.map((g) => (
              <li key={g.id} className={`flex items-start gap-3 rounded-md border p-2 ${g.on ? "border-line" : "border-line bg-canvas"}`}>
                <span className={g.on ? "text-ok" : "text-muted"}>{g.icon}</span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2"><b className="text-[13px]">{t(`m07.gw.${g.id}`)}</b>
                    <Badge tone={g.tone}>{t(g.on ? "m07.gw.on" : g.id === "lypay" ? "m07.gw.pending" : "m07.gw.off")}</Badge></span>
                  <span className="block text-[12px] text-muted">{t(`m07.gw.${g.id}H`)}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[12px] text-muted">{t("m07.gw.note")}</p>
        </Panel>
      </div>
    </div>
  );
}

export const screens: Record<string, ComponentType> = {
  s1: Receipts,
  s2: HeroSplit,
  s3: Dunning,
  s4: CashBank,
};
