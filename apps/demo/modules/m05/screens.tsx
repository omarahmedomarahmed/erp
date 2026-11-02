"use client";
import { useEffect, useMemo, useState, type ComponentType, type ReactNode } from "react";
import { Zap, CheckCircle2 } from "lucide-react";
import {
  Badge, BarChart, Button, ControlPanel, DataTable, DateText, Fields, KpiRow, Modal, Money, Panel, Timeline,
  type Tone,
} from "@/components/ui";
import { useT } from "@/components/I18n";
import { personaById } from "@/content/personas";
import {
  uwRules, approvalMatrix, quotes, customerById, productById, outletById, agentById, workingDaysBetween, STORY, TODAY, round3,
} from "@/data/seed";
import type { ApprovalLevel, ApprovalMatrixRow, Quote, UwOutcome, UwRule } from "@/data/types";

/* ---------------- rules engine (demo) ---------------- */
type Prod = "MTR" | "TRV" | "FIR";
interface Input {
  product: Prod; customerId: string;
  value: number; year: number; licensed: boolean; // motor
  si: number; hazardous: boolean; // fire
  age: number; days: number; zone: "arab" | "schengen" | "world"; // travel
}
interface Hit { rule: UwRule; hit: boolean }
interface Decision { hits: Hit[]; outcome: UwOutcome; level?: ApprovalLevel; contribution: number; noRule: boolean }
const CURRENT_LIMIT = 150000;
const RANK: Record<ApprovalLevel, number> = { underwriter: 1, senior_underwriter: 2, uw_manager: 3, gm: 4, cfo: 4, compliance: 3, claims_manager: 2 };
const ZONE_RATE = { arab: 2.5, schengen: 3.5, world: 4.5 } as const;
const THIS_YEAR = Number(TODAY.slice(0, 4));

function evaluate(inp: Input, limit = CURRENT_LIMIT): Decision {
  const vehAge = THIS_YEAR - inp.year;
  const pep = !!customerById[inp.customerId]?.pep;
  const cond: Record<string, boolean> = {
    "UW-MTR-01": vehAge <= 10 && inp.value <= limit && inp.licensed,
    "UW-MTR-02": inp.value > limit,
    "UW-MTR-03": vehAge > 15,
    "UW-FIR-01": inp.si > 5000000,
    "UW-FIR-02": inp.hazardous,
    "UW-TRV-01": inp.age > 75,
    "UW-GEN-01": pep,
  };
  const hits = uwRules.filter((r) => r.productIds.includes(inp.product) && r.id in cond).map((rule) => ({ rule, hit: cond[rule.id] }));
  const fired = hits.filter((h) => h.hit);
  let outcome: UwOutcome = "auto_accept";
  let level: ApprovalLevel | undefined;
  let noRule = false;
  if (fired.some((h) => h.rule.outcome === "decline")) outcome = "decline";
  else if (fired.some((h) => h.rule.outcome === "refer")) {
    outcome = "refer";
    level = fired.filter((h) => h.rule.referTo).map((h) => h.rule.referTo!).sort((a, b) => RANK[b] - RANK[a])[0];
  } else if (inp.product === "MTR" && !cond["UW-MTR-01"]) { outcome = "refer"; level = "underwriter"; noRule = true; }
  const contribution = inp.product === "MTR" ? round3(Math.max(900, inp.value * 0.035))
    : inp.product === "FIR" ? round3(Math.max(500, inp.si * 0.0015))
    : round3(Math.max(45, ZONE_RATE[inp.zone] * inp.days * (inp.age > 65 ? 1.5 : 1)));
  return { hits, outcome, level, contribution, noRule };
}
const OUT_TONE: Record<UwOutcome, Tone> = { auto_accept: "ok", refer: "warn", decline: "danger" };
function OutcomeBadge({ o }: { o: UwOutcome }) {
  const { t } = useT();
  return <Badge tone={OUT_TONE[o]}>{t(`m05.out.${o}`)}</Badge>;
}
const ageOf = (customerId: string) => { const b = customerById[customerId]?.birthDate; return b ? THIS_YEAR - Number(b.slice(0, 4)) : 40; };
const yearFromRisk = (s: string) => Number(s.match(/(19|20)\d{2}/)?.[0] ?? THIS_YEAR);
const levelRow = (lvl: ApprovalLevel): ApprovalMatrixRow | undefined => approvalMatrix.find((r) => r.area === "underwriting" && r.level === lvl);

function FormRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid grid-cols-[minmax(120px,40%)_1fr] items-center gap-2 border-b border-line/60 py-1.5 text-[13px]">
      <span className="font-bold text-muted">{label}</span><span className="min-w-0">{children}</span>
    </label>
  );
}
const inputCls = "num w-full max-w-[220px] rounded-md border border-line bg-canvas px-2 py-1 text-[13px]";

/* ---------------- s1: instant decision ---------------- */
const DEMO_CUSTOMERS = ["CUS-1001", "CUS-1005", "CUS-1023", "CUS-1021", "CUS-1026"];
function InstantDecision() {
  const { t, pick } = useT();
  const heroQ = quotes.find((q) => q.id === STORY.quoteId)!;
  const [inp, setInp] = useState<Input>({
    product: "MTR", customerId: STORY.customerId, value: heroQ.sumInsured, year: yearFromRisk(heroQ.riskEn), licensed: true,
    si: 950000, hazardous: false, age: ageOf(STORY.customerId), days: 21, zone: "schengen",
  });
  const run = (x: Input) => { const t0 = performance.now(); const d = evaluate(x); return { d, ms: performance.now() - t0, at: new Date().toISOString().slice(11, 19) }; };
  // Deterministic first render (no clock values) so server and client markup match; the real timing runs after mount.
  const [res, setRes] = useState(() => ({ d: evaluate(inp), ms: 0, at: "00:00:00" }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setRes(run(inp)); }, []);
  const set = <K extends keyof Input>(k: K, v: Input[K]) => setInp((x) => ({ ...x, [k]: v }));
  const lvl = res.d.level ? levelRow(res.d.level) : undefined;
  const isHero = inp.product === "MTR" && inp.customerId === STORY.customerId && inp.value === heroQ.sumInsured && res.d.outcome === "auto_accept";
  return (
    <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <Panel title={t("m05.q.inputs")}>
        <FormRow label={t("m05.q.product")}>
          <select value={inp.product} onChange={(e) => set("product", e.target.value as Prod)} className={inputCls}>
            {(["MTR", "TRV", "FIR"] as Prod[]).map((p) => <option key={p} value={p}>{pick(productById[p].nameAr, productById[p].nameEn)}</option>)}
          </select>
        </FormRow>
        <FormRow label={t("m05.q.customer")}>
          <select value={inp.customerId} onChange={(e) => setInp((x) => ({ ...x, customerId: e.target.value, age: ageOf(e.target.value) }))} className={inputCls}>
            {DEMO_CUSTOMERS.map((id) => <option key={id} value={id}>{pick(customerById[id].nameAr, customerById[id].nameEn)}{customerById[id].pep ? " · PEP" : ""}</option>)}
          </select>
        </FormRow>
        {inp.product === "MTR" && (<>
          <FormRow label={t("m05.q.value")}><input type="number" value={inp.value} step={1000} onChange={(e) => set("value", Number(e.target.value) || 0)} className={inputCls} /></FormRow>
          <FormRow label={t("m05.q.year")}><input type="number" value={inp.year} min={1980} max={THIS_YEAR + 1} onChange={(e) => set("year", Number(e.target.value) || THIS_YEAR)} className={inputCls} /></FormRow>
          <FormRow label={t("m05.q.licensed")}><input type="checkbox" checked={inp.licensed} onChange={(e) => set("licensed", e.target.checked)} /></FormRow>
        </>)}
        {inp.product === "FIR" && (<>
          <FormRow label={t("m05.q.si")}><input type="number" value={inp.si} step={50000} onChange={(e) => set("si", Number(e.target.value) || 0)} className={inputCls} /></FormRow>
          <FormRow label={t("m05.q.hazardous")}><input type="checkbox" checked={inp.hazardous} onChange={(e) => set("hazardous", e.target.checked)} /></FormRow>
        </>)}
        {inp.product === "TRV" && (<>
          <FormRow label={t("m05.q.age")}><input type="number" value={inp.age} onChange={(e) => set("age", Number(e.target.value) || 0)} className={inputCls} /></FormRow>
          <FormRow label={t("m05.q.days")}><input type="number" value={inp.days} min={1} onChange={(e) => set("days", Number(e.target.value) || 1)} className={inputCls} /></FormRow>
          <FormRow label={t("m05.q.zone")}>
            <select value={inp.zone} onChange={(e) => set("zone", e.target.value as Input["zone"])} className={inputCls}>
              {(["arab", "schengen", "world"] as const).map((z) => <option key={z} value={z}>{t(`m05.zone.${z}`)}</option>)}
            </select>
          </FormRow>
        </>)}
        <div className="mt-3"><Button variant="primary" onClick={() => setRes(run(inp))}><Zap size={14} aria-hidden />{t("m05.q.decide")}</Button></div>
      </Panel>

      <div className="grid content-start gap-4">
        <Panel title={t("m05.q.decision")} actions={<Badge tone="ok">{t("m05.q.time", { ms: res.ms.toFixed(1) })}</Badge>}>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[18px] font-extrabold"><OutcomeBadge o={res.d.outcome} /></span>
            {res.d.outcome !== "decline" && <span className="text-[18px] font-extrabold text-navy"><Money value={res.d.contribution} /></span>}
            {isHero && <Badge tone="info">{t("m05.q.hero", { id: STORY.quoteId })}</Badge>}
          </div>
          <p className="mt-2 text-[13px]">
            {res.d.outcome === "auto_accept" && t("m05.q.msg.accept")}
            {res.d.outcome === "decline" && t("m05.q.msg.decline")}
            {res.d.outcome === "refer" && lvl && t("m05.q.msg.refer", { level: pick(lvl.levelAr, lvl.levelEn) })}
          </p>
          {res.d.noRule && <p className="mt-1 text-[12px] text-warn">{t("m05.q.noRule")}</p>}
        </Panel>
        <Panel title={t("m05.q.rules")}>
          <DataTable rows={res.d.hits.map((h) => ({ ...h, id: h.rule.id }))} columns={[
            { key: "id", label: t("m05.r.id"), render: (h) => <span className="num font-bold">{h.rule.id}</span> },
            { key: "name", label: t("m05.r.name"), render: (h) => pick(h.rule.nameAr, h.rule.nameEn) },
            { key: "cond", label: t("m05.r.condition"), render: (h) => <span className="text-[12px]">{pick(h.rule.conditionAr, h.rule.conditionEn)}</span> },
            { key: "res", label: t("m05.r.result"), render: (h) => h.hit ? <OutcomeBadge o={h.rule.outcome} /> : <Badge tone="neutral">{t("m05.r.notMet")}</Badge> },
          ]} />
        </Panel>
        <Panel title={t("m05.q.record")}>
          <Fields items={[
            { label: t("m05.q.recUser"), value: (() => { const p = personaById("uw"); return p ? pick(p.nameAr, p.nameEn) : ""; })() },
            { label: t("m05.q.recTime"), value: <span className="num">{TODAY} {res.at}</span> },
            { label: t("m05.q.recRules"), value: <span className="num">{res.d.hits.filter((h) => h.hit).map((h) => h.rule.id).join(", ") || "—"}</span> },
            { label: t("sharia.label"), value: <Badge tone="ok">{t("sharia.compliant")}</Badge> },
          ]} />
          <p className="mt-2 text-[12px] text-muted">{t("m05.q.gharar")}</p>
        </Panel>
      </div>
    </div>
  );
}

/* ---------------- s2: referral queue & approval matrix ---------------- */
const SLA_DAYS: Partial<Record<ApprovalLevel, number>> = { underwriter: 1, senior_underwriter: 1, uw_manager: 2, gm: 3 };
const ACT_LEVELS: ApprovalLevel[] = ["underwriter", "senior_underwriter", "uw_manager", "gm"];
type RefRow = Quote & { decision: "pending" | "approved" | "declined"; elapsed: number; target: number };
function Referrals() {
  const { t, pick } = useT();
  const [acting, setActing] = useState<ApprovalLevel>("senior_underwriter");
  const [decided, setDecided] = useState<Record<string, "approved" | "declined">>({});
  const [blocked, setBlocked] = useState<string | null>(null);
  const rows: RefRow[] = useMemo(() => quotes.filter((q) => q.referral).map((q) => {
    const r = q.referral!;
    const decision = (decided[q.id] as RefRow["decision"] | undefined) ?? r.decision;
    return { ...q, decision, elapsed: workingDaysBetween(q.date, r.decidedAt ?? TODAY), target: SLA_DAYS[r.level] ?? 2 };
  }).sort((a, b) => (a.decision === "pending" ? -1 : 1) - (b.decision === "pending" ? -1 : 1) || b.date.localeCompare(a.date)), [decided]);
  const [sel, setSel] = useState<string>(rows[0]?.id ?? "");
  const q = rows.find((r) => r.id === sel);
  const actRow = levelRow(acting)!;
  const pending = rows.filter((r) => r.decision === "pending");
  const decide = (d: "approved" | "declined") => {
    if (!q) return;
    const need = q.referral!.level;
    const ok = RANK[acting] >= RANK[need] && (actRow.limit === null || q.sumInsured <= actRow.limit);
    if (!ok) { setBlocked(q.id); return; }
    setBlocked(null);
    setDecided((x) => ({ ...x, [q.id]: d }));
  };
  const name = (id?: string) => { const p = personaById(id); return p ? pick(p.nameAr, p.nameEn) : ""; };
  const lvlLabel = (l: ApprovalLevel) => { const r = levelRow(l); return r ? pick(r.levelAr, r.levelEn) : l; };
  return (
    <div>
      <KpiRow items={[
        { label: t("m05.rf.k.pending"), value: pending.length, tone: pending.length ? "danger" : "ok" },
        { label: t("m05.rf.k.breached"), value: pending.filter((r) => r.elapsed > r.target).length, tone: "danger" },
        { label: t("m05.rf.k.decided"), value: rows.length - pending.length },
        { label: t("m05.rf.k.auto"), value: `${Math.round((quotes.filter((x) => !x.referral && x.status !== "declined" && x.status !== "expired").length / quotes.length) * 100)}%`, hint: t("m05.rf.k.autoH") },
      ]} />
      <div className="grid gap-4 px-4 pb-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 overflow-hidden rounded-lg border border-line">
          <ControlPanel title={t("m05.rf.title")} actions={
            <label className="flex items-center gap-2 text-[12px] font-bold text-muted">{t("m05.rf.acting")}
              <select value={acting} onChange={(e) => { setActing(e.target.value as ApprovalLevel); setBlocked(null); }} className="rounded-md border border-line bg-canvas px-2 py-1 text-[13px] text-ink">
                {ACT_LEVELS.map((l) => <option key={l} value={l}>{lvlLabel(l)}</option>)}
              </select>
            </label>} />
          <DataTable rows={rows} onRowClick={(r) => { setSel(r.id); setBlocked(null); }} columns={[
            { key: "id", label: t("m05.rf.quote"), render: (r) => <span className={`num font-bold ${r.id === sel ? "text-brand-deep" : ""}`}>{r.id}</span> },
            { key: "date", label: t("common.date"), render: (r) => <DateText value={r.date} /> },
            { key: "cust", label: t("m05.q.customer"), render: (r) => pick(customerById[r.customerId].nameAr, customerById[r.customerId].nameEn) },
            { key: "prod", label: t("m05.q.product"), render: (r) => pick(productById[r.productId].nameAr, productById[r.productId].nameEn) },
            { key: "si", label: t("m05.rf.si"), align: "end", render: (r) => <Money value={r.sumInsured} /> },
            { key: "rule", label: t("m05.rf.rule"), render: (r) => <span className="num text-[12px]">{r.rulesFired.map((h) => h.ruleId).join(", ")}</span> },
            { key: "lvl", label: t("m05.rf.level"), render: (r) => lvlLabel(r.referral!.level) },
            { key: "sla", label: "SLA", render: (r) => <Badge tone={r.elapsed > r.target ? "danger" : "ok"}>{t("m05.rf.slaV", { e: r.elapsed, t: r.target })}</Badge> },
            { key: "st", label: t("common.status"), render: (r) => <Badge tone={r.decision === "pending" ? "warn" : r.decision === "approved" ? "ok" : "danger"}>{t(`m05.rf.st.${r.decision}`)}</Badge> },
          ]} />
        </div>
        <div className="grid content-start gap-4">
          {q && (
            <Panel title={`${q.id} · ${pick(q.riskAr, q.riskEn)}`}>
              <Fields cols={1} items={[
                { label: t("m05.rf.si"), value: <Money value={q.sumInsured} /> },
                { label: t("m05.rf.contribution"), value: <Money value={q.contribution} /> },
                { label: t("m05.rf.level"), value: <span>{lvlLabel(q.referral!.level)} · {levelRow(q.referral!.level)?.limit ? <Money value={levelRow(q.referral!.level)!.limit} /> : t("m05.rf.unlimited")}</span> },
                { label: t("m05.rf.note"), value: pick(q.referral!.noteAr, q.referral!.noteEn) },
                { label: t("m05.rf.prepared"), value: q.agentId ? pick(agentById[q.agentId].nameAr, agentById[q.agentId].nameEn) : pick(outletById[q.outletId].nameAr, outletById[q.outletId].nameEn) },
                { label: t("m05.rf.approver"), value: q.decision === "pending" ? "—" : decided[q.id] ? `${lvlLabel(acting)} · ${name(actRow.personaId)}` : `${lvlLabel(q.referral!.level)} · ${name(q.referral!.assignedPersonaId)}` },
                { label: t("sharia.label"), value: <Badge tone="ok">{t(`sharia.${q.sharia_status}`)}</Badge> },
              ]} />
              {q.decision === "pending" && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button variant="primary" onClick={() => decide("approved")}>{t("common.approve")}</Button>
                  <Button variant="danger" onClick={() => decide("declined")}>{t("common.reject")}</Button>
                </div>
              )}
              {blocked === q.id && (
                <p className="mt-2 rounded-md bg-danger-soft p-2 text-[12px] text-danger">
                  {t("m05.rf.blocked", { level: lvlLabel(q.referral!.level) })}
                </p>
              )}
              {q.decision === "pending" && <p className="mt-2 text-[12px] text-muted">{t("m05.rf.noIssue")}</p>}
            </Panel>
          )}
          <Panel title={t("m05.rf.matrix")}>
            <DataTable rows={approvalMatrix} columns={[
              { key: "area", label: t("m05.rf.area"), render: (r) => t(`m05.area.${r.area}`) },
              { key: "lvl", label: t("m05.rf.role"), render: (r) => <span className={r.level === acting && r.area === "underwriting" ? "font-bold text-brand-deep" : ""}>{pick(r.levelAr, r.levelEn)}</span> },
              { key: "lim", label: t("m05.rf.limit"), align: "end", render: (r) => r.limit === null ? t("m05.rf.unlimited") : <Money value={r.limit} /> },
            ]} />
          </Panel>
        </div>
      </div>
    </div>
  );
}

/* ---------------- s3: rules table (versioned) ---------------- */
interface RuleVersion { v: number; from: string; status: "active" | "superseded" | "draft"; noteKey: string; vars?: Record<string, string> }
const fmt = (n: number) => n.toLocaleString("en-US");
const RULE_VERSIONS = (id: string): RuleVersion[] => {
  if (id === "UW-MTR-01" || id === "UW-MTR-02") return [
    { v: 3, from: "2027-01-01", status: "draft", noteKey: "m05.rv.limit", vars: { limit: fmt(200000) } },
    { v: 2, from: "2026-01-01", status: "active", noteKey: "m05.rv.limit", vars: { limit: fmt(150000) } },
    { v: 1, from: "2025-01-01", status: "superseded", noteKey: "m05.rv.limit", vars: { limit: fmt(120000) } },
  ];
  return [
    { v: 2, from: "2026-01-01", status: "active", noteKey: "m05.rv.reviewed" },
    { v: 1, from: "2025-01-01", status: "superseded", noteKey: "m05.rv.first" },
  ];
};
const VS_TONE: Record<RuleVersion["status"], Tone> = { active: "ok", draft: "warn", superseded: "neutral" };
function Rules() {
  const { t, pick } = useT();
  const [sel, setSel] = useState<string>(STORY.uwRuleId);
  const [newOpen, setNewOpen] = useState(false);
  const hits = (id: string) => quotes.filter((q) => q.rulesFired.some((h) => h.ruleId === id)).length;
  const rule = uwRules.find((r) => r.id === sel)!;
  const versions = RULE_VERSIONS(sel);
  const active = (id: string) => RULE_VERSIONS(id).find((v) => v.status === "active")!;
  const lvlLabel = (l?: ApprovalLevel) => { if (!l) return "—"; const r = levelRow(l); return r ? pick(r.levelAr, r.levelEn) : l; };
  return (
    <div>
      <ControlPanel title={t("m05.s3.title")} actions={<Button variant="primary" onClick={() => setNewOpen(true)}>{t("m05.ru.new")}</Button>} />
      <div className="grid gap-4 p-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 overflow-hidden rounded-lg border border-line">
          <DataTable rows={uwRules} onRowClick={(r) => setSel(r.id)} columns={[
            { key: "id", label: t("m05.r.id"), render: (r) => <span className={`num font-bold ${r.id === sel ? "text-brand-deep" : ""}`}>{r.id}</span> },
            { key: "name", label: t("m05.r.name"), render: (r) => pick(r.nameAr, r.nameEn) },
            { key: "prod", label: t("m05.ru.products"), render: (r) => <span className="num text-[12px]">{r.productIds.length > 3 ? t("common.all") : r.productIds.join(", ")}</span> },
            { key: "cond", label: t("m05.r.condition"), render: (r) => <span className="text-[12px]">{pick(r.conditionAr, r.conditionEn)}</span> },
            { key: "out", label: t("m05.ru.outcome"), render: (r) => <OutcomeBadge o={r.outcome} /> },
            { key: "to", label: t("m05.ru.referTo"), render: (r) => lvlLabel(r.referTo) },
            { key: "v", label: t("m05.ru.version"), align: "center", render: (r) => <span className="num">v{active(r.id).v}</span> },
            { key: "from", label: t("m05.ru.from"), render: (r) => <DateText value={active(r.id).from} /> },
            { key: "hits", label: t("m05.ru.hits"), align: "center", render: (r) => <span className="num">{hits(r.id)}</span> },
          ]} />
        </div>
        <div className="grid content-start gap-4">
          <Panel title={`${rule.id} · ${pick(rule.nameAr, rule.nameEn)}`}>
            <Fields cols={1} items={[
              { label: t("m05.r.condition"), value: pick(rule.conditionAr, rule.conditionEn) },
              { label: t("m05.ru.outcome"), value: <OutcomeBadge o={rule.outcome} /> },
              { label: t("m05.ru.referTo"), value: lvlLabel(rule.referTo) },
              { label: t("m05.ru.hits"), value: <span className="num">{hits(rule.id)}</span> },
            ]} />
            {rule.id === STORY.uwRuleId && <p className="mt-2 text-[12px] text-brand-deep">{t("m05.ru.heroNote", { id: STORY.quoteId })}</p>}
          </Panel>
          <Timeline title={t("m05.ru.history")} items={versions.map((v) => ({
            at: v.from, who: `v${v.v}`, tone: VS_TONE[v.status],
            text: <span className="flex flex-wrap items-center gap-2">{t(v.noteKey, v.vars)} <Badge tone={VS_TONE[v.status]}>{t(`m05.vs.${v.status}`)}</Badge></span>,
          }))} />
        </div>
      </div>
      <Modal open={newOpen} onClose={() => setNewOpen(false)} title={t("m05.ru.new")}>
        <ol className="grid list-decimal gap-1 ps-5 text-[13px]">
          {["1", "2", "3", "4"].map((k) => <li key={k}>{t(`m05.ru.path.${k}`)}</li>)}
        </ol>
      </Modal>
    </div>
  );
}

/* ---------------- s4: rule simulation on past quotes ---------------- */
function Simulation() {
  const { t, pick } = useT();
  const [limit, setLimit] = useState(200000);
  const [sent, setSent] = useState(false);
  const rows = useMemo(() => quotes.filter((q) => q.productId === "MTR").map((q) => {
    const inp: Input = { product: "MTR", customerId: q.customerId, value: q.sumInsured, year: yearFromRisk(q.riskEn), licensed: true,
      si: 0, hazardous: false, age: 40, days: 1, zone: "arab" };
    const now = evaluate(inp).outcome;
    const sim = evaluate(inp, limit).outcome;
    return { ...q, year: inp.year, now, sim, changed: now !== sim };
  }), [limit]);
  const count = (k: "now" | "sim", o: UwOutcome) => rows.filter((r) => r[k] === o).length;
  const changed = rows.filter((r) => r.changed);
  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 border-b border-line bg-surface px-4 py-3">
        <h2 className="text-[16px] font-extrabold text-navy">{t("m05.sim.title")}</h2>
        <label className="flex flex-wrap items-center gap-2 text-[13px]">
          <span className="font-bold text-muted">{t("m05.sim.limit")}</span>
          <input type="range" min={50000} max={400000} step={10000} value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setSent(false); }} aria-label={t("m05.sim.limit")} />
          <span className="num font-extrabold text-navy"><Money value={limit} /></span>
          <span className="text-muted">{t("m05.sim.current")} <Money value={CURRENT_LIMIT} /></span>
        </label>
      </div>
      <KpiRow items={[
        { label: t("m05.sim.k.tested"), value: rows.length },
        { label: t("m05.sim.k.changed"), value: changed.length, tone: changed.length ? "danger" : "ok" },
        { label: t("m05.sim.k.toRefer"), value: changed.filter((r) => r.sim === "refer").length },
        { label: t("m05.sim.k.toAccept"), value: changed.filter((r) => r.sim === "auto_accept").length },
      ]} />
      <div className="grid gap-4 px-4 pb-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 overflow-hidden rounded-lg border border-line">
          <DataTable rows={rows} columns={[
            { key: "id", label: t("m05.rf.quote"), render: (r) => <span className="num font-bold">{r.id}</span> },
            { key: "date", label: t("common.date"), render: (r) => <DateText value={r.date} /> },
            { key: "cust", label: t("m05.q.customer"), render: (r) => pick(customerById[r.customerId].nameAr, customerById[r.customerId].nameEn) },
            { key: "risk", label: t("m05.sim.vehicle"), render: (r) => <span className="text-[12px]">{pick(r.riskAr, r.riskEn)}</span> },
            { key: "si", label: t("m05.q.value"), align: "end", render: (r) => <Money value={r.sumInsured} /> },
            { key: "now", label: t("m05.sim.now"), render: (r) => <OutcomeBadge o={r.now} /> },
            { key: "sim", label: t("m05.sim.sim"), render: (r) => <OutcomeBadge o={r.sim} /> },
            { key: "ch", label: t("m05.sim.change"), render: (r) => r.changed ? <Badge tone="danger">{t("m05.sim.changed")}</Badge> : <Badge tone="neutral">{t("m05.sim.same")}</Badge> },
          ]} />
        </div>
        <div className="grid content-start gap-4">
          <Panel title={t("m05.sim.chart")}>
            <BarChart data={[
              { label: t("m05.sim.acceptNow"), value: count("now", "auto_accept") },
              { label: t("m05.sim.acceptSim"), value: count("sim", "auto_accept"), tone: "ok" },
              { label: t("m05.sim.referNow"), value: count("now", "refer") },
              { label: t("m05.sim.referSim"), value: count("sim", "refer"), tone: "warn" },
            ]} />
          </Panel>
          <Panel title={t("m05.sim.next")}>
            <p className="text-[12px] text-muted">{t("m05.sim.nextText")}</p>
            <div className="mt-2">
              {sent
                ? <p className="flex items-center gap-2 rounded-md bg-ok-soft p-2 text-[12px] text-ok"><CheckCircle2 size={14} aria-hidden />{t("m05.sim.sent")}</p>
                : <Button variant="primary" onClick={() => setSent(true)}>{t("m05.sim.submit")}</Button>}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

export const screens: Record<string, ComponentType> = {
  s1: InstantDecision,
  s2: Referrals,
  s3: Rules,
  s4: Simulation,
};

