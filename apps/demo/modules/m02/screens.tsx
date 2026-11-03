"use client";
import { useMemo, useState, type ComponentType } from "react";
import {
  Badge, Button, ControlPanel, DataTable, DateText, Fields, Kanban, KpiRow, Modal, Money, Panel, Sheet, Timeline, useFilter,
  type Column, type Tone,
} from "@/components/ui";
import { useT } from "@/components/I18n";
import { personaById } from "@/content/personas";
import {
  customers, customerById, duplicateCandidates, outletById, policiesOfCustomer, claimsOfCustomer, receiptsOfCustomer, productById,
  claims, CLAIM_STAGE_LABELS, STORY, TODAY, addDays,
} from "@/data/seed";
import type { Customer, CustomerDoc, ShariaStatus } from "@/data/types";

/* ---------------- helpers ---------------- */
const SHARIA_TONE: Record<ShariaStatus, Tone> = { compliant: "ok", pending_review: "warn", non_compliant: "danger", purified: "info" };
function ShariaBadge({ s }: { s: ShariaStatus }) {
  const { t } = useT();
  return <Badge tone={SHARIA_TONE[s]}>{t(`sharia.${s}`)}</Badge>;
}
/** Arabic-normalised text for search: أ/إ/آ → ا, ة → ه, ى → ي, no diacritics. */
const norm = (s: string) => s.replace(/[ً-ْ]/g, "").replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").toLowerCase();
type DocState = "expired" | "soon" | "valid";
const docState = (d: CustomerDoc): DocState => (d.expiry < TODAY ? "expired" : d.expiry <= addDays(TODAY, 90) ? "soon" : "valid");
const DOC_TONE: Record<DocState, Tone> = { expired: "danger", soon: "warn", valid: "ok" };
const openDupIds = new Set(duplicateCandidates.filter((d) => d.status === "open").flatMap((d) => d.customerIds));
const flagsOf = (c: Customer) => ({
  pep: c.pep,
  dup: openDupIds.has(c.id),
  expired: c.docs.some((d) => docState(d) === "expired"),
  soon: c.docs.some((d) => docState(d) === "soon"),
});
const isFlagged = (c: Customer) => { const f = flagsOf(c); return f.pep || f.dup || f.expired || f.soon; };
const searchText = (c: Customer) => `${c.id} ${c.nameAr} ${norm(c.nameAr)} ${c.nameEn} ${c.nationalNo ?? ""} ${c.crNo ?? ""} ${c.phone}`;

function usePersonaName() {
  const { pick } = useT();
  return (id?: string) => { const p = personaById(id); return p ? pick(p.nameAr, p.nameEn) : id ?? ""; };
}

function Flags({ c }: { c: Customer }) {
  const { t } = useT();
  const f = flagsOf(c);
  if (!isFlagged(c)) return <Badge tone="ok">{t("m02.flag.ok")}</Badge>;
  return (
    <span className="flex flex-wrap gap-1">
      {f.pep && <Badge tone="warn">PEP</Badge>}
      {f.dup && <Badge tone="danger">{t("m02.flag.dup")}</Badge>}
      {f.expired && <Badge tone="danger">{t("m02.flag.expired")}</Badge>}
      {!f.expired && f.soon && <Badge tone="warn">{t("m02.flag.soon")}</Badge>}
    </span>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className={`border-b-2 px-3 py-1.5 text-[13px] font-bold ${active ? "border-brand text-brand-deep" : "border-transparent text-muted"}`}>
      {children}
    </button>
  );
}

/* ---------------- s1: customer list ---------------- */
type ListFilter = "all" | "individual" | "company" | "flagged" | "dup";
function CustomerList() {
  const { t, pick } = useT();
  const [filter, setFilter] = useState<ListFilter>("all");
  const [open, setOpen] = useState<string | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const base = useMemo(() => customers.filter((c) =>
    filter === "all" ? true : filter === "individual" || filter === "company" ? c.type === filter : filter === "flagged" ? isFlagged(c) : openDupIds.has(c.id)), [filter]);
  const { rows, setQ } = useFilter(base, searchText);

  if (open) return <Customer360 initialId={open} onBack={() => setOpen(null)} />;

  const cols: Column<Customer>[] = [
    { key: "id", label: t("m02.col.id"), render: (c) => <span className="num font-bold text-brand-deep">{c.id}</span> },
    { key: "name", label: t("m02.col.name"), render: (c) => <span className="font-bold">{pick(c.nameAr, c.nameEn)}{c.id === STORY.customerId && <span className="ms-2"><Badge tone="info">{t("m02.hero")}</Badge></span>}</span> },
    { key: "type", label: t("m02.col.type"), render: (c) => t(`m02.type.${c.type}`) },
    { key: "idNo", label: t("m02.col.idNo"), render: (c) => <span className="num">{c.nationalNo ?? c.crNo}</span> },
    { key: "city", label: t("m02.col.city"), render: (c) => pick(c.cityAr, c.cityEn) },
    { key: "kyc", label: t("m02.col.kyc"), render: (c) => <Badge tone={c.kycLevel === "enhanced" ? "warn" : c.kycLevel === "basic" ? "neutral" : "info"}>{t(`m02.kyc.${c.kycLevel}`)}</Badge> },
    { key: "flags", label: t("m02.col.flags"), render: (c) => <Flags c={c} /> },
    { key: "pol", label: t("m02.col.policies"), align: "center", render: (c) => <span className="num">{policiesOfCustomer(c.id).length}</span> },
  ];
  const f = (id: ListFilter, label: string) => ({ id, label, active: filter === id, onClick: () => setFilter(id) });
  return (
    <div>
      <ControlPanel title={t("m02.s1.title")} onSearch={setQ}
        actions={<Button variant="primary" onClick={() => setNewOpen(true)}>{t("m02.new.btn")}</Button>}
        filters={[f("all", t("common.all")), f("individual", t("m02.f.individual")), f("company", t("m02.f.company")), f("flagged", t("m02.f.flagged")), f("dup", t("m02.f.dup"))]} />
      <p className="bg-canvas px-4 py-1.5 text-[12px] text-muted">{t("m02.searchHint")}</p>
      <DataTable columns={cols} rows={rows} onRowClick={(c) => setOpen(c.id)} />
      <NewCustomerModal open={newOpen} onClose={() => setNewOpen(false)} onOpenExisting={(id) => { setNewOpen(false); setOpen(id); }} />
    </div>
  );
}

function NewCustomerModal({ open, onClose, onOpenExisting }: { open: boolean; onClose: () => void; onOpenExisting: (id: string) => void }) {
  const { t, pick } = useT();
  const sample = customerById["CUS-1002"];
  const [nid, setNid] = useState(sample.nationalNo ?? "");
  const [name, setName] = useState("احمد سالم ك.");
  const [result, setResult] = useState<null | { existing?: Customer }>(null);
  const check = () => setResult({ existing: customers.find((c) => c.nationalNo && c.nationalNo === nid.trim()) });
  return (
    <Modal open={open} onClose={() => { setResult(null); onClose(); }} title={t("m02.new.title")}>
      <div className="grid gap-2 text-[13px]">
        <label className="grid gap-1"><span className="font-bold text-muted">{t("m02.new.nid")}</span>
          <input value={nid} onChange={(e) => { setNid(e.target.value); setResult(null); }} className="num rounded-md border border-line bg-canvas px-2 py-1" /></label>
        <label className="grid gap-1"><span className="font-bold text-muted">{t("m02.new.name")}</span>
          <input value={name} onChange={(e) => setName(e.target.value)} className="rounded-md border border-line bg-canvas px-2 py-1" /></label>
        <div><Button variant="primary" onClick={check}>{t("m02.new.check")}</Button></div>
        {result?.existing && (
          <div className="rounded-md bg-danger-soft p-3 text-danger">
            <p>{t("m02.new.exists", { no: nid, name: pick(result.existing.nameAr, result.existing.nameEn), id: result.existing.id })}</p>
            <div className="mt-2"><Button onClick={() => onOpenExisting(result.existing!.id)}>{t("m02.new.open")}</Button></div>
          </div>
        )}
        {result && !result.existing && <p className="rounded-md bg-ok-soft p-3 text-ok">{t("m02.new.ok")}</p>}
      </div>
    </Modal>
  );
}

/* ---------------- s2: customer 360 ---------------- */
type HistItem = { at: string; who?: string; text: string; tone?: Tone };
const PREV_PHONE = "092-0000655";

function Customer360({ initialId = STORY.customerId, onBack }: { initialId?: string; onBack?: () => void }) {
  const { t, pick } = useT();
  const personaName = usePersonaName();
  const [id, setId] = useState(initialId);
  const [tab, setTab] = useState<"data" | "docs" | "policies" | "claims">("data");
  const [phones, setPhones] = useState<Record<string, string>>({});
  const [edits, setEdits] = useState<Record<string, HistItem[]>>({});
  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const c = customerById[id];
  const phone = phones[id] ?? c.phone;
  const pols = policiesOfCustomer(id);
  const cls = claimsOfCustomer(id);
  const outlet = outletById[c.outletId];
  const docLabel = (d: CustomerDoc) => t(`m02.doc.${d.type}`);

  const history: HistItem[] = useMemo(() => {
    const creator = outlet?.kind === "branch" ? "uw" : "border";
    const h: HistItem[] = [{ at: `${c.createdAt} 09:12`, who: personaName(creator), text: t("m02.h.created", { outlet: outlet ? pick(outlet.nameAr, outlet.nameEn) : "" }) }];
    c.docs.forEach((d, i) => {
      if (id === STORY.customerId && d.type === "driving_licence") return;
      h.push({ at: `${c.createdAt} 09:${14 + i}`, who: personaName(creator), text: t("m02.h.doc", { doc: docLabel(d), no: d.number }) });
    });
    if (id === STORY.customerId) {
      const dlDoc = c.docs.find((d) => d.type === "driving_licence");
      h.push({ at: "2026-02-26 10:41", who: personaName("uw"), text: t("m02.h.field", { field: t("m02.f.phone"), from: PREV_PHONE, to: c.phone }) });
      if (dlDoc) h.push({ at: "2026-02-26 10:43", who: personaName("uw"), text: t("m02.h.doc", { doc: docLabel(dlDoc), no: dlDoc.number }) });
      h.push({ at: "2026-02-26 10:44", who: personaName("uw"), text: t("m02.h.kyc", { from: t("m02.kyc.basic"), to: t("m02.kyc.standard") }) });
    }
    pols.forEach((p) => h.push({ at: `${p.issuedAt} 11:00`, who: personaName(p.issuedByPersonaId), text: t("m02.h.policy", { cert: p.certNo }) }));
    cls.forEach((cl) => h.push({ at: `${cl.registeredAt} 10:20`, who: personaName(cl.handlerPersonaId), text: t("m02.h.claim", { id: cl.id }), tone: "warn" }));
    return [...(edits[id] ?? []), ...h.sort((a, b) => b.at.localeCompare(a.at))];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, edits, t]);

  const savePhone = () => {
    const v = draft.trim();
    if (!v || v === phone) { setEditOpen(false); return; }
    setEdits((e) => ({ ...e, [id]: [{ at: `${TODAY} 12:05`, who: personaName("uw"), text: t("m02.h.field", { field: t("m02.f.phone"), from: phone, to: v }), tone: "info" }, ...(e[id] ?? [])] }));
    setPhones((p) => ({ ...p, [id]: v }));
    setEditOpen(false);
  };

  const paidClaims = cls.reduce((s, x) => s + (x.paid ?? 0), 0);
  const collected = receiptsOfCustomer(id).reduce((s, r) => s + r.amount, 0);

  return (
    <Sheet
      title={pick(c.nameAr, c.nameEn)}
      subtitle={<span className="num">{c.id} · {t(`m02.type.${c.type}`)} · {pick(c.cityAr, c.cityEn)}</span>}
      status={<Flags c={c} />}
      actions={
        <>
          {onBack && <Button variant="ghost" onClick={onBack}>{t("m02.back")}</Button>}
          <select aria-label={t("m02.pick")} value={id} onChange={(e) => { setId(e.target.value); setTab("data"); }}
            className="max-w-[220px] rounded-md border border-line bg-canvas px-2 py-1 text-[13px]">
            {customers.map((x) => <option key={x.id} value={x.id}>{x.id} · {pick(x.nameAr, x.nameEn)}</option>)}
          </select>
          <Button onClick={() => { setDraft(phone); setEditOpen(true); }}>{t("m02.editPhone")}</Button>
        </>
      }
      side={<Timeline title={t("m02.history")} items={history} />}
    >
      <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          [t("m02.k.policies"), String(pols.length)],
          [t("m02.k.active"), String(pols.filter((p) => p.status === "active").length)],
          [t("m02.k.claims"), String(cls.length)],
          [t("m02.k.paid"), null],
        ].map(([l, v], i) => (
          <div key={i} className="rounded-md border border-line bg-canvas p-2">
            <div className="text-[11px] text-muted">{l}</div>
            <div className="text-[16px] font-extrabold text-navy">{v ?? <Money value={paidClaims} />}</div>
          </div>
        ))}
      </div>
      <div className="mb-3 flex flex-wrap border-b border-line">
        <TabBtn active={tab === "data"} onClick={() => setTab("data")}>{t("m02.tab.data")}</TabBtn>
        <TabBtn active={tab === "docs"} onClick={() => setTab("docs")}>{t("m02.tab.docs")} ({c.docs.length})</TabBtn>
        <TabBtn active={tab === "policies"} onClick={() => setTab("policies")}>{t("m02.tab.policies")} ({pols.length})</TabBtn>
        <TabBtn active={tab === "claims"} onClick={() => setTab("claims")}>{t("m02.tab.claims")} ({cls.length})</TabBtn>
      </div>
      {tab === "data" && (
        <Fields items={[
          { label: t("m02.col.id"), value: <span className="num">{c.id}</span> },
          { label: t("m02.col.type"), value: t(`m02.type.${c.type}`) },
          { label: c.type === "company" ? t("m02.f.cr") : t("m02.f.nid"), value: <span className="num">{c.nationalNo ?? c.crNo}</span> },
          { label: t("m02.f.birth"), value: <DateText value={c.birthDate} /> },
          { label: t("m02.f.phone"), value: <span className="num">{phone}</span> },
          { label: t("m02.col.city"), value: pick(c.cityAr, c.cityEn) },
          { label: t("m02.f.outlet"), value: outlet ? pick(outlet.nameAr, outlet.nameEn) : "—" },
          { label: t("m02.f.since"), value: <DateText value={c.createdAt} /> },
          { label: t("m02.col.kyc"), value: <Badge tone={c.kycLevel === "enhanced" ? "warn" : "info"}>{t(`m02.kyc.${c.kycLevel}`)}</Badge> },
          { label: "PEP", value: c.pep ? <Badge tone="warn">{pick(c.pepRoleAr ?? "", c.pepRoleEn)}</Badge> : t("common.no") },
          { label: t("m02.f.sanctions"), value: c.sanctionsHit ? <Badge tone="danger">{t("m02.f.hit")}</Badge> : <Badge tone="ok">{t("m02.f.clear")}</Badge> },
          { label: t("m02.f.identity"), value: <Badge tone="warn">{t("m02.f.identityManual")}</Badge> },
          { label: t("m02.f.collected"), value: <Money value={collected} /> },
          { label: t("m02.f.consent"), value: <Badge tone="ok">{t("m02.f.consentYes")}</Badge> },
        ]} />
      )}
      {tab === "docs" && (
        <DataTable<CustomerDoc & { id: string }>
          rows={c.docs.map((d) => ({ ...d, id: d.number }))}
          columns={[
            { key: "type", label: t("m02.doc.type"), render: (d) => docLabel(d) },
            { key: "number", label: t("m02.doc.number"), render: (d) => <span className="num">{d.number}</span> },
            { key: "expiry", label: t("m02.doc.expiry"), render: (d) => <DateText value={d.expiry} /> },
            { key: "state", label: t("common.status"), render: (d) => <Badge tone={DOC_TONE[docState(d)]}>{t(`m02.docState.${docState(d)}`)}</Badge> },
          ]} />
      )}
      {tab === "policies" && (
        <DataTable rows={pols} columns={[
          { key: "cert", label: t("m02.pol.cert"), render: (p) => <span className="num font-bold">{p.certNo}</span> },
          { key: "prod", label: t("m02.pol.product"), render: (p) => pick(productById[p.productId].nameAr, productById[p.productId].nameEn) },
          { key: "period", label: t("m02.pol.period"), render: (p) => <span className="num">{p.start} → {p.end}</span> },
          { key: "amt", label: t("m02.pol.contribution"), align: "end", render: (p) => <Money value={p.contribution} /> },
          { key: "st", label: t("common.status"), render: (p) => <Badge tone={p.status === "active" ? "ok" : p.status === "cancelled" ? "danger" : "neutral"}>{t(`m02.polState.${p.status}`)}</Badge> },
          { key: "sh", label: t("sharia.label"), render: (p) => <ShariaBadge s={p.sharia_status} /> },
        ]} />
      )}
      {tab === "claims" && (
        <DataTable rows={cls} columns={[
          { key: "id", label: t("m02.cl.id"), render: (x) => <span className="num font-bold">{x.id}</span> },
          { key: "loss", label: t("m02.cl.loss"), render: (x) => <DateText value={x.lossDate} /> },
          { key: "stage", label: t("common.status"), render: (x) => <Badge tone={x.rejected ? "danger" : x.stage === "closed" || x.stage === "paid" ? "ok" : "warn"}>{pick(...CLAIM_STAGE_LABELS[x.rejected ? "rejected" : x.stage])}</Badge> },
          { key: "paid", label: t("m02.cl.paid"), align: "end", render: (x) => <Money value={x.paid ?? 0} /> },
          { key: "fund", label: t("m02.cl.fund"), render: () => <Badge tone="ok">{t("fund.PTF")}</Badge> },
          { key: "sh", label: t("sharia.label"), render: (x) => <ShariaBadge s={x.sharia_status} /> },
        ]} />
      )}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title={t("m02.editPhone")}>
        <label className="grid gap-1 text-[13px]"><span className="font-bold text-muted">{t("m02.f.phone")}</span>
          <input value={draft} onChange={(e) => setDraft(e.target.value)} className="num rounded-md border border-line bg-canvas px-2 py-1" /></label>
        <p className="mt-2 text-[12px] text-muted">{t("m02.editNote")}</p>
        <div className="mt-3 flex gap-2"><Button variant="primary" onClick={savePhone}>{t("common.save")}</Button><Button onClick={() => setEditOpen(false)}>{t("common.cancel")}</Button></div>
      </Modal>
    </Sheet>
  );
}

/* ---------------- s3: duplicates & merge ---------------- */
type MergeState = "open" | "requested" | "merged" | "dismissed";
function Duplicates() {
  const { t, pick } = useT();
  const personaName = usePersonaName();
  const [state, setState] = useState<Record<string, MergeState>>(Object.fromEntries(duplicateCandidates.map((d) => [d.id, d.status as MergeState])));
  const [selfTry, setSelfTry] = useState<string | null>(null);

  const claimCount: Record<string, number> = {};
  claims.forEach((c) => { claimCount[c.customerId] = (claimCount[c.customerId] ?? 0) + 1; });
  const fraud = Object.entries(claimCount).filter(([, n]) => n >= 2).map(([id, n]) => ({ id, n }));
  const open = Object.values(state).filter((s) => s === "open" || s === "requested").length;

  return (
    <div>
      <KpiRow items={[
        { label: t("m02.dup.k.open"), value: open, tone: open ? "danger" : "ok" },
        { label: t("m02.dup.k.merged"), value: Object.values(state).filter((s) => s === "merged").length },
        { label: t("m02.dup.k.rule"), value: t("m02.dup.k.ruleV"), hint: t("m02.dup.k.ruleH") },
        { label: t("m02.dup.k.fraud"), value: fraud.length, tone: fraud.length ? "danger" : "ok" },
      ]} />
      <div className="grid gap-4 px-4 pb-4 xl:grid-cols-2">
        {duplicateCandidates.map((d) => {
          const [a, b] = d.customerIds.map((x) => customerById[x]);
          const [keep, drop] = a.createdAt <= b.createdAt ? [a, b] : [b, a];
          const s = state[d.id];
          const row = (label: string, f: (c: Customer) => string) => {
            const va = f(a), vb = f(b);
            return (
              <tr key={label} className="border-b border-line/60">
                <td className="py-1 pe-2 text-[12px] font-bold text-muted">{label}</td>
                <td className="py-1 pe-2">{va}</td><td className="py-1 pe-2">{vb}</td>
                <td className="py-1">{va === vb ? <Badge tone="danger">{t("m02.dup.same")}</Badge> : null}</td>
              </tr>
            );
          };
          const moved = policiesOfCustomer(drop.id).length;
          const movedRc = receiptsOfCustomer(drop.id).length;
          return (
            <Panel key={d.id} title={`${d.id} · ${t("m02.dup.score")} ${d.score}%`}
              actions={<Badge tone={s === "merged" ? "ok" : s === "dismissed" ? "neutral" : s === "requested" ? "warn" : "danger"}>{t(`m02.dup.state.${s}`)}</Badge>}>
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead><tr className="text-muted"><th /><th className="text-start num">{a.id}</th><th className="text-start num">{b.id}</th><th /></tr></thead>
                  <tbody>
                    {row(t("m02.col.name"), (c) => pick(c.nameAr, c.nameEn))}
                    {row(t("m02.f.nid"), (c) => c.nationalNo ?? "")}
                    {row(t("m02.f.birth"), (c) => c.birthDate ?? "")}
                    {row(t("m02.f.phone"), (c) => c.phone)}
                    {row(t("m02.col.city"), (c) => pick(c.cityAr, c.cityEn))}
                    {row(t("m02.f.since"), (c) => c.createdAt)}
                    {row(t("m02.col.kyc"), (c) => t(`m02.kyc.${c.kycLevel}`))}
                    {row(t("m02.col.policies"), (c) => String(policiesOfCustomer(c.id).length))}
                  </tbody>
                </table>
              </div>
              <ul className="mt-2 flex flex-wrap gap-1">{(pick(d.reasonsAr.join("|"), d.reasonsEn.join("|"))).split("|").map((r) => <li key={r}><Badge tone="info">{r}</Badge></li>)}</ul>
              <p className="mt-2 text-[12px] text-muted">{t("m02.dup.survivor", { keep: keep.id, drop: drop.id })}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {s === "open" && (<>
                  <Button variant="primary" onClick={() => setState((x) => ({ ...x, [d.id]: "requested" }))}>{t("m02.dup.request")}</Button>
                  <Button variant="ghost" onClick={() => setState((x) => ({ ...x, [d.id]: "dismissed" }))}>{t("m02.dup.dismiss")}</Button>
                </>)}
                {s === "requested" && (<>
                  <Button variant="danger" onClick={() => setSelfTry(d.id)}>{t("m02.dup.approveSelf")}</Button>
                  <Button variant="primary" onClick={() => { setSelfTry(null); setState((x) => ({ ...x, [d.id]: "merged" })); }}>{t("m02.dup.approveChecker")}</Button>
                </>)}
              </div>
              {s !== "open" && s !== "dismissed" && (
                <div className="mt-2 grid gap-1 text-[12px]">
                  <span>{t("m02.dup.preparedBy")}: <b>{personaName("uw")}</b></span>
                  {s === "merged" && <span>{t("m02.dup.approvedBy")}: <b>{personaName("gm")}</b></span>}
                </div>
              )}
              {selfTry === d.id && s === "requested" && <p className="mt-2 rounded-md bg-danger-soft p-2 text-[12px] text-danger">{t("m02.guard.merge.blocked")}</p>}
              {s === "merged" && <p className="mt-2 rounded-md bg-ok-soft p-2 text-[12px] text-ok">{t("m02.dup.result", { drop: drop.id, keep: keep.id, n: moved, r: movedRc })}</p>}
            </Panel>
          );
        })}
        <Panel title={t("m02.fraud.title")}>
          <p className="mb-2 text-[12px] text-muted">{t("m02.fraud.rule")}</p>
          <DataTable rows={fraud} columns={[
            { key: "id", label: t("m02.col.id"), render: (r) => <span className="num font-bold">{r.id}</span> },
            { key: "name", label: t("m02.col.name"), render: (r) => pick(customerById[r.id].nameAr, customerById[r.id].nameEn) },
            { key: "n", label: t("m02.fraud.claims"), align: "center", render: (r) => <span className="num">{r.n}</span> },
            { key: "a", label: t("m02.fraud.action"), render: () => <Badge tone="warn">{t("m02.fraud.sent")}</Badge> },
          ]} />
        </Panel>
      </div>
    </div>
  );
}

/* ---------------- s4: documents & KYC board ---------------- */
type BoardCol = "expired" | "soon" | "kyc" | "pep";
function AlertsBoard() {
  const { t, pick } = useT();
  const [sel, setSel] = useState<string | null>(null);
  const [sent, setSent] = useState<Record<string, boolean>>({});
  const cards: { id: string; column: BoardCol; c: Customer }[] = [];
  for (const c of customers) {
    if (c.docs.some((d) => docState(d) === "expired")) cards.push({ id: `expired-${c.id}`, column: "expired", c });
    else if (c.docs.some((d) => docState(d) === "soon")) cards.push({ id: `soon-${c.id}`, column: "soon", c });
    if (c.kycLevel === "basic") cards.push({ id: `kyc-${c.id}`, column: "kyc", c });
    if (c.pep || c.kycLevel === "enhanced") cards.push({ id: `pep-${c.id}`, column: "pep", c });
  }
  const count = (col: BoardCol) => cards.filter((x) => x.column === col).length;
  const selCard = cards.find((x) => x.id === sel);
  return (
    <div>
      <KpiRow items={[
        { label: t("m02.board.expired"), value: count("expired"), tone: "danger" },
        { label: t("m02.board.soon"), value: count("soon") },
        { label: t("m02.board.kyc"), value: count("kyc") },
        { label: t("m02.board.pep"), value: count("pep") },
      ]} />
      <p className="mx-4 rounded-md bg-warn-soft px-3 py-2 text-[12px] text-warn">{t("m02.board.note")}</p>
      <Kanban
        columns={[
          { id: "expired", label: t("m02.board.expired"), tone: "danger" },
          { id: "soon", label: t("m02.board.soon"), tone: "warn" },
          { id: "kyc", label: t("m02.board.kyc"), tone: "info" },
          { id: "pep", label: t("m02.board.pep"), tone: "warn" },
        ]}
        cards={cards}
        onCardClick={(x) => setSel(x.id)}
        renderCard={(x) => (
          <div className="grid gap-1">
            <div className="font-bold text-navy">{pick(x.c.nameAr, x.c.nameEn)}</div>
            <div className="num text-muted">{x.c.id}</div>
            {(x.column === "expired" || x.column === "soon") && x.c.docs.filter((d) => docState(d) !== "valid").map((d) => (
              <div key={d.number} className="flex flex-wrap items-center gap-1">{t(`m02.doc.${d.type}`)} <Badge tone={DOC_TONE[docState(d)]}><span className="num">{d.expiry}</span></Badge></div>
            ))}
            {x.column === "kyc" && <div>{t("m02.board.kycHint")}</div>}
            {x.column === "pep" && <div>{x.c.pep ? pick(x.c.pepRoleAr ?? "", x.c.pepRoleEn) : t("m02.kyc.enhanced")}</div>}
            {sent[x.id] && <Badge tone="ok">{t("m02.board.sent")}</Badge>}
          </div>
        )}
      />
      <Modal open={!!selCard} onClose={() => setSel(null)} title={selCard ? pick(selCard.c.nameAr, selCard.c.nameEn) : ""}>
        {selCard && (
          <div className="grid gap-2 text-[13px]">
            <Fields cols={1} items={[
              { label: t("m02.col.id"), value: <span className="num">{selCard.c.id}</span> },
              { label: t("m02.f.phone"), value: <span className="num">{selCard.c.phone}</span> },
              { label: t("m02.col.kyc"), value: t(`m02.kyc.${selCard.c.kycLevel}`) },
              ...selCard.c.docs.map((d) => ({ label: t(`m02.doc.${d.type}`), value: <Badge tone={DOC_TONE[docState(d)]}><span className="num">{d.expiry}</span></Badge> })),
            ]} />
            <p className="text-muted">{t(`m02.board.action.${selCard.column}`)}</p>
            <div>
              {sent[selCard.id]
                ? <Badge tone="ok">{t("m02.board.sent")}</Badge>
                : <Button variant="primary" onClick={() => setSent((s) => ({ ...s, [selCard.id]: true }))}>{t("m02.board.send")}</Button>}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export const screens: Record<string, ComponentType> = {
  s1: CustomerList,
  s2: () => <Customer360 />,
  s3: Duplicates,
  s4: AlertsBoard,
};
