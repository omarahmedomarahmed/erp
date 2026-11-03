"use client";
import { useMemo, useState, type ComponentType } from "react";
import { UserPlus, UserX, ArrowRight, KeyRound } from "lucide-react";
import { useT } from "@/components/I18n";
import {
  Badge, Button, ControlPanel, DataTable, DateText, Fields, KpiRow, Kanban, LockedNote, Modal, Money, Panel, Sheet, Timeline,
  useFilter, type Column, type Tone,
} from "@/components/ui";
import {
  TODAY, departments, departmentById, employees, employeeById, employeeContracts, employeeOfPersona, leaveRequests, outletById,
} from "@/data/seed";
import type { Employee, LeaveRequest } from "@/data/types";

/* ---------- helpers ---------- */
const DAY = 86400000;
const daysUntil = (d: string) => Math.round((Date.parse(d) - Date.parse(TODAY)) / DAY);
type DocState = "valid" | "expiring" | "expired" | "none";
const docState = (expiry?: string): DocState => {
  if (!expiry) return "none";
  const n = daysUntil(expiry);
  return n < 0 ? "expired" : n <= 60 ? "expiring" : "valid";
};
const DOC_TONE: Record<DocState, Tone> = { valid: "ok", expiring: "warn", expired: "danger", none: "neutral" };
const docsOf = (e: Employee) => [
  { id: "nationalId", expiry: e.idExpiry },
  { id: "contract", expiry: e.contractEnd },
  { id: "ssReg", expiry: undefined },
  { id: "qualification", expiry: undefined },
  { id: "bank", expiry: undefined },
];
const worstDoc = (e: Employee): DocState => {
  const s = docsOf(e).map((d) => docState(d.expiry));
  return s.includes("expired") ? "expired" : s.includes("expiring") ? "expiring" : "valid";
};
const username = (e: Employee) => e.personaId ?? e.nameEn.toLowerCase().replace(/[^a-z -]/g, "").replace(/-/g, "").trim().split(/\s+/).join(".");
const ANNUAL_ENTITLEMENT = 30;
const leaveBalance = (empId: string) => {
  const mine = leaveRequests.filter((l) => l.employeeId === empId && l.type === "annual");
  const used = mine.filter((l) => l.status === "approved").reduce((a, l) => a + l.days, 0);
  const pending = mine.filter((l) => l.status === "pending").reduce((a, l) => a + l.days, 0);
  return { entitlement: ANNUAL_ENTITLEMENT, used, pending, remaining: ANNUAL_ENTITLEMENT - used - pending };
};
const STATUS_TONE: Record<string, Tone> = { active: "ok", on_leave: "info", terminated: "danger" };

/** A new hire created inside the demo (local state only). */
const NEW_HIRE: Employee = {
  id: "EMP-031", nameAr: "يوسف ا*****", nameEn: "Youssef A*******", departmentId: "DEP-UW", positionAr: "مكتتب", positionEn: "Underwriter",
  outletId: "BR-TRP", gender: "M", nationalNo: "119800005031", hireDate: TODAY, contractType: "fixed_term", contractEnd: "2029-11-01",
  grade: "G4", basic: 3000, housing: 450, transport: 150, children: 0, socialSecurity: true, idExpiry: "2030-05-01", status: "active",
};

function useNames() {
  const { pick } = useT();
  return {
    emp: (id?: string) => { const e = id ? employeeById[id] : undefined; return e ? pick(e.nameAr, e.nameEn) : "—"; },
    dept: (id: string) => { const d = departmentById[id]; return d ? pick(d.nameAr, d.nameEn) : id; },
    outlet: (id: string) => { const o = outletById[id]; return o ? pick(o.nameAr, o.nameEn) : id; },
    persona: (pid?: string) => { const e = pid ? employeeOfPersona(pid) : undefined; return e ? pick(e.nameAr, e.nameEn) : "—"; },
  };
}

/* ---------- employee record (used in s1 and s2) ---------- */
function EmployeeRecord({ emp, onBack, extraActions }: { emp: Employee; onBack?: () => void; extraActions?: React.ReactNode }) {
  const { t, pick } = useT();
  const n = useNames();
  const [terminatedOn, setTerminatedOn] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const status = terminatedOn ? "terminated" : emp.status;
  const contract = employeeContracts.find((c) => c.employeeId === emp.id);
  const bal = leaveBalance(emp.id);
  const head = departments.find((d) => d.id === emp.departmentId)?.headEmployeeId;
  const manager = head && head !== emp.id ? head : "EMP-002";
  const timeline = [
    ...(terminatedOn ? [
      { at: terminatedOn, who: n.persona("hr"), text: t("m33.tl.loginDisabled"), tone: "danger" as Tone },
      { at: terminatedOn, who: n.persona("hr"), text: t("m33.tl.terminated") },
    ] : []),
    ...(contract && contract.version > 1 ? [{ at: "2025-01-01", who: n.persona("hr"), text: t("m33.tl.contractVersion", { v: contract.version }) }] : []),
    { at: emp.hireDate, who: n.persona("hr"), text: t("m33.tl.loginCreated", { user: username(emp) }) },
    { at: emp.hireDate, who: n.persona("hr"), text: t("m33.tl.hired") },
  ];
  return (
    <>
      <Sheet
        title={pick(emp.nameAr, emp.nameEn)}
        subtitle={`${emp.id} · ${pick(emp.positionAr, emp.positionEn)} · ${n.dept(emp.departmentId)}`}
        status={<Badge tone={STATUS_TONE[status]}>{t(`m33.status.${status}`)}</Badge>}
        actions={<>
          {onBack && <Button variant="ghost" onClick={onBack}><ArrowRight size={14} aria-hidden className="ltr:rotate-180" />{t("m33.back")}</Button>}
          {extraActions}
          {!terminatedOn && <Button variant="danger" onClick={() => setConfirm(true)}><UserX size={14} aria-hidden />{t("m33.terminate")}</Button>}
        </>}
        side={<div className="grid gap-3">
          <Panel title={t("m33.acc.title")}>
            <Fields cols={1} items={[
              { label: t("m33.acc.username"), value: <span className="num">{username(emp)}</span> },
              { label: t("common.status"), value: terminatedOn ? <Badge tone="danger">{t("m33.acc.disabled")}</Badge> : <Badge tone="ok">{t("m33.acc.active")}</Badge> },
              { label: t("m33.acc.created"), value: <DateText value={emp.hireDate} /> },
              ...(terminatedOn ? [{ label: t("m33.acc.disabledAt"), value: <DateText value={terminatedOn} /> }] : []),
            ]} />
            <p className="mt-2 flex items-start gap-1.5 text-[11px] text-muted"><KeyRound size={12} className="mt-0.5 shrink-0" aria-hidden />{t("m33.acc.note")}</p>
          </Panel>
          <Timeline title={t("common.activity")} items={timeline} />
        </div>}
      >
        <Fields items={[
          { label: t("m33.f.nationalNo"), value: <span className="num">{`••••••••${emp.nationalNo.slice(-4)}`} <Badge>{t("m33.f.encrypted")}</Badge></span> },
          { label: t("m33.f.gender"), value: t(`m33.gender.${emp.gender}`) },
          { label: t("m33.col.outlet"), value: n.outlet(emp.outletId) },
          { label: t("m33.f.manager"), value: n.emp(manager) },
          { label: t("m33.col.hire"), value: <DateText value={emp.hireDate} /> },
          { label: t("m33.f.grade"), value: emp.grade },
        ]} />

        <h4 className="mt-5 mb-2 text-[14px] font-extrabold text-navy">{t("m33.sec.contract")}</h4>
        <Fields items={[
          { label: t("m33.col.contract"), value: t(`m33.contract.${emp.contractType}`) },
          { label: t("m33.f.version"), value: <span className="num">v{contract?.version ?? 1}</span> },
          { label: t("m33.f.start"), value: <DateText value={emp.hireDate} /> },
          { label: t("m33.f.end"), value: emp.contractEnd ? <DateText value={emp.contractEnd} /> : t("m33.f.openEnded") },
          { label: t("m33.f.probation"), value: <DateText value={contract?.probationEnd} /> },
          { label: t("m33.f.basic"), value: <Money value={emp.basic} /> },
          { label: t("m33.f.housing"), value: <Money value={emp.housing} /> },
          { label: t("m33.f.transport"), value: <Money value={emp.transport} /> },
        ]} />
        <p className="mt-1 text-[11px] text-muted">{t("m33.f.salaryNote")}</p>

        <h4 className="mt-5 mb-2 text-[14px] font-extrabold text-navy">{t("m33.sec.docs")}</h4>
        <DataTable
          columns={[
            { key: "doc", label: t("m33.doc.col"), render: (d) => t(`m33.doc.${d.id}`) },
            { key: "exp", label: t("m33.doc.expiry"), render: (d) => d.expiry ? <DateText value={d.expiry} /> : <span className="text-muted">{t("m33.doc.noExpiry")}</span> },
            { key: "st", label: t("common.status"), render: (d) => {
              const s = docState(d.expiry);
              return s === "none" ? <Badge tone="ok">{t("m33.doc.valid")}</Badge> : <Badge tone={DOC_TONE[s]}>{t(`m33.doc.${s}`)}</Badge>;
            } },
          ] as Column<{ id: string; expiry?: string }>[]}
          rows={docsOf(emp)}
        />

        <h4 className="mt-5 mb-2 text-[14px] font-extrabold text-navy">{t("m33.sec.leave")}</h4>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {([["entitlement", bal.entitlement], ["used", bal.used], ["pending", bal.pending], ["remaining", bal.remaining]] as const).map(([k, v]) => (
            <div key={k} className="rounded-md border border-line bg-canvas p-2">
              <div className="text-[11px] text-muted">{t(`m33.bal.${k}`)}</div>
              <div className="num text-[18px] font-extrabold text-navy">{v}</div>
            </div>
          ))}
        </div>
        <p className="mt-1 text-[11px] text-muted">{t("m33.bal.note")}</p>
        {terminatedOn && <div className="mt-4"><LockedNote text={t("m33.terminatedNote", { date: terminatedOn })} /></div>}
      </Sheet>
      <Modal open={confirm} onClose={() => setConfirm(false)} title={t("m33.terminate")}>
        <p className="text-[13px]">{t("m33.terminateConfirm", { name: pick(emp.nameAr, emp.nameEn), date: TODAY })}</p>
        <div className="mt-3 flex gap-2">
          <Button variant="danger" onClick={() => { setTerminatedOn(TODAY); setConfirm(false); }}>{t("m33.confirm")}</Button>
          <Button onClick={() => setConfirm(false)}>{t("common.cancel")}</Button>
        </div>
      </Modal>
    </>
  );
}

/* ---------- s1: employees list by department ---------- */
function EmployeesList() {
  const { t, pick } = useT();
  const n = useNames();
  const [dep, setDep] = useState<string>("all");
  const [open, setOpen] = useState<string | null>(null);
  const base = useMemo(() => (dep === "all" ? employees : employees.filter((e) => e.departmentId === dep)), [dep]);
  const fields = useMemo(() => (e: Employee) => `${e.id} ${e.nameAr} ${e.nameEn} ${e.positionAr} ${e.positionEn}`, []);
  const { rows, setQ } = useFilter(base, fields);
  const alerts = employees.filter((e) => worstDoc(e) !== "valid").length;
  if (open) return <EmployeeRecord emp={employeeById[open]} onBack={() => setOpen(null)} />;
  const cols: Column<Employee>[] = [
    { key: "id", label: t("m33.col.id"), render: (e) => <span className="num text-muted">{e.id}</span> },
    { key: "name", label: t("m33.col.name"), render: (e) => <span className="font-bold text-navy">{pick(e.nameAr, e.nameEn)}</span> },
    { key: "pos", label: t("m33.col.position"), render: (e) => pick(e.positionAr, e.positionEn) },
    { key: "dep", label: t("m33.col.dept"), render: (e) => n.dept(e.departmentId) },
    { key: "out", label: t("m33.col.outlet"), render: (e) => n.outlet(e.outletId) },
    { key: "con", label: t("m33.col.contract"), render: (e) => t(`m33.contract.${e.contractType}`) },
    { key: "hire", label: t("m33.col.hire"), render: (e) => <DateText value={e.hireDate} /> },
    { key: "docs", label: t("m33.col.docs"), render: (e) => { const s = worstDoc(e); return <Badge tone={DOC_TONE[s]}>{t(`m33.doc.${s}`)}</Badge>; } },
    { key: "st", label: t("common.status"), render: (e) => <Badge tone={STATUS_TONE[e.status]}>{t(`m33.status.${e.status}`)}</Badge> },
  ];
  return (
    <div>
      <ControlPanel title={t("m33.s1.title")} onSearch={setQ}
        filters={[{ id: "all", label: t("common.all"), active: dep === "all", onClick: () => setDep("all") },
          ...departments.map((d) => ({ id: d.id, label: pick(d.nameAr, d.nameEn), active: dep === d.id, onClick: () => setDep(d.id) }))]} />
      {alerts > 0 && <div className="bg-warn-soft px-4 py-1.5 text-[12px] font-bold text-warn">{t("m33.docAlert", { n: alerts })}</div>}
      <DataTable columns={cols} rows={rows} onRowClick={(e) => setOpen(e.id)}
        footer={<tr><td colSpan={cols.length} className="px-3 py-2 text-[12px]">{t("m33.count", { n: rows.length })}</td></tr>} />
    </div>
  );
}

/* ---------- s2: employee record + lifecycle (hire / terminate) ---------- */
function EmployeeFile() {
  const { t, pick } = useT();
  const n = useNames();
  const [hired, setHired] = useState(false);
  const [sel, setSel] = useState("EMP-014");
  const [hireOpen, setHireOpen] = useState(false);
  const list = hired ? [...employees, NEW_HIRE] : employees;
  const emp = list.find((e) => e.id === sel) ?? employees[0];
  const steps = ["record", "contract", "login", "onboarding"] as const;
  return (
    <div>
      <ControlPanel title={t("m33.s2.title")}
        actions={<>
          <label className="flex items-center gap-2 text-[13px]">
            <span className="text-muted">{t("m33.pickEmployee")}</span>
            <select value={emp.id} onChange={(e) => setSel(e.target.value)} aria-label={t("m33.pickEmployee")}
              className="max-w-[220px] rounded-md border border-line bg-canvas px-2 py-1 text-[13px]">
              {list.map((e) => <option key={e.id} value={e.id}>{`${e.id} · ${pick(e.nameAr, e.nameEn)}`}</option>)}
            </select>
          </label>
          {!hired && <Button variant="primary" onClick={() => setHireOpen(true)}><UserPlus size={14} aria-hidden />{t("m33.hire")}</Button>}
        </>} />
      <EmployeeRecord key={emp.id} emp={emp} />
      <Modal open={hireOpen} onClose={() => setHireOpen(false)} title={t("m33.hire")}>
        <Fields cols={1} items={[
          { label: t("m33.col.name"), value: pick(NEW_HIRE.nameAr, NEW_HIRE.nameEn) },
          { label: t("m33.col.position"), value: pick(NEW_HIRE.positionAr, NEW_HIRE.positionEn) },
          { label: t("m33.col.dept"), value: n.dept(NEW_HIRE.departmentId) },
          { label: t("m33.col.hire"), value: <DateText value={TODAY} /> },
        ]} />
        <p className="mt-3 text-[12px] font-bold text-navy">{t("m33.hire.weDo")}</p>
        <ol className="mt-1 grid list-decimal gap-1 ps-5 text-[12px]">
          {steps.map((s) => <li key={s}>{t(`m33.hire.step.${s}`, { user: username(NEW_HIRE) })}</li>)}
        </ol>
        <div className="mt-3 flex gap-2">
          <Button variant="primary" onClick={() => { setHired(true); setSel(NEW_HIRE.id); setHireOpen(false); }}>{t("m33.confirm")}</Button>
          <Button onClick={() => setHireOpen(false)}>{t("common.cancel")}</Button>
        </div>
      </Modal>
    </div>
  );
}

/* ---------- s3: leave requests with approval ---------- */
type LeaveCard = LeaveRequest & { column: string };
function Leave() {
  const { t } = useT();
  const n = useNames();
  const [status, setStatus] = useState<Record<string, LeaveRequest["status"]>>({});
  const [open, setOpen] = useState<LeaveRequest | null>(null);
  const cards: LeaveCard[] = leaveRequests.map((l) => ({ ...l, status: status[l.id] ?? l.status, column: status[l.id] ?? l.status }));
  const pending = cards.filter((c) => c.status === "pending").length;
  const decide = (s: LeaveRequest["status"]) => { if (open) setStatus((x) => ({ ...x, [open.id]: s })); setOpen(null); };
  const cur = open ? cards.find((c) => c.id === open.id)! : null;
  const bal = cur ? leaveBalance(cur.employeeId) : null;
  return (
    <div>
      <ControlPanel title={t("m33.s3.title")} actions={<Badge tone={pending ? "warn" : "ok"}>{t("m33.leave.pendingCount", { n: pending })}</Badge>} />
      <Kanban<LeaveRequest>
        columns={[{ id: "pending", label: t("m33.leave.pending"), tone: "warn" }, { id: "approved", label: t("m33.leave.approved"), tone: "ok" }, { id: "rejected", label: t("m33.leave.rejected"), tone: "danger" }]}
        cards={cards}
        onCardClick={(c) => setOpen(c)}
        renderCard={(c) => (
          <div className="grid gap-1">
            <div className="flex items-center gap-1"><span className="font-bold text-navy">{n.emp(c.employeeId)}</span><span className="num ms-auto text-muted">{c.id}</span></div>
            <div><Badge tone="info">{t(`m33.leaveType.${c.type}`)}</Badge> <span className="num">{t("m33.leave.days", { n: c.days })}</span></div>
            <div className="num text-muted">{c.from} → {c.to}</div>
            <div className="text-muted">{t("m33.leave.approver")}: {n.persona(c.approverPersonaId)}</div>
          </div>
        )} />
      <Modal open={!!cur} onClose={() => setOpen(null)} title={cur ? `${cur.id} · ${n.emp(cur.employeeId)}` : ""}>
        {cur && bal && <>
          <Fields cols={1} items={[
            { label: t("m33.leave.type"), value: t(`m33.leaveType.${cur.type}`) },
            { label: t("m33.leave.period"), value: <span className="num">{cur.from} → {cur.to}</span> },
            { label: t("m33.leave.daysLabel"), value: <span className="num">{cur.days}</span> },
            { label: t("m33.leave.approver"), value: n.persona(cur.approverPersonaId) },
            { label: t("m33.bal.remaining"), value: <span className="num">{bal.remaining}</span> },
            { label: t("common.status"), value: <Badge tone={cur.status === "approved" ? "ok" : cur.status === "rejected" ? "danger" : "warn"}>{t(`m33.leave.${cur.status}`)}</Badge> },
          ]} />
          {cur.type === "annual" && cur.status === "pending" && <p className="mt-2 text-[12px] text-muted">{t("m33.leave.deductNote")}</p>}
          {cur.status === "pending" ? (
            <div className="mt-3 flex gap-2">
              <Button variant="primary" onClick={() => decide("approved")}>{t("common.approve")}</Button>
              <Button variant="danger" onClick={() => decide("rejected")}>{t("common.reject")}</Button>
            </div>
          ) : <div className="mt-3"><LockedNote text={t("m33.leave.decided")} /></div>}
        </>}
      </Modal>
    </div>
  );
}

/* ---------- s4: org chart ---------- */
function OrgChart() {
  const { t, pick } = useT();
  const gm = employeeById["EMP-002"];
  const onLeave = employees.filter((e) => e.status === "on_leave").length;
  const expiring = employees.filter((e) => worstDoc(e) !== "valid").length;
  const ending = employees.filter((e) => e.contractEnd && daysUntil(e.contractEnd) <= 365).length;
  return (
    <div>
      <KpiRow items={[
        { label: t("m33.kpi.headcount"), value: <span className="num">{employees.length}</span> },
        { label: t("m33.kpi.departments"), value: <span className="num">{departments.length}</span> },
        { label: t("m33.kpi.onLeave"), value: <span className="num">{onLeave}</span> },
        { label: t("m33.kpi.docs"), value: <span className="num">{expiring}</span>, tone: expiring ? "danger" : "ok", hint: t("m33.kpi.contractsEnding", { n: ending }) },
      ]} />
      <div className="px-4 pb-4">
        <div className="mx-auto mb-4 w-full max-w-xs rounded-lg border-2 border-brand bg-surface p-3 text-center">
          <div className="text-[11px] text-muted">{pick(gm.positionAr, gm.positionEn)}</div>
          <div className="font-extrabold text-navy">{pick(gm.nameAr, gm.nameEn)}</div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {departments.filter((d) => d.id !== "DEP-MGT").map((d) => {
            const head = d.headEmployeeId ? employeeById[d.headEmployeeId] : undefined;
            const staff = employees.filter((e) => e.departmentId === d.id && e.id !== d.headEmployeeId);
            return (
              <section key={d.id} className="min-w-0 rounded-lg border border-line bg-surface">
                <header className="flex items-center gap-2 border-b border-line bg-canvas px-3 py-2">
                  <h4 className="truncate text-[13px] font-extrabold text-navy">{pick(d.nameAr, d.nameEn)}</h4>
                  <Badge tone="info">{staff.length + (head ? 1 : 0)}</Badge>
                </header>
                {head && (
                  <div className="border-b border-line/60 px-3 py-2">
                    <div className="text-[11px] text-muted">{t("m33.org.head")}</div>
                    <div className="font-bold">{pick(head.nameAr, head.nameEn)}</div>
                    <div className="text-[11px] text-muted">{pick(head.positionAr, head.positionEn)}</div>
                  </div>
                )}
                <ul className="grid gap-1 px-3 py-2 text-[12px]">
                  {staff.map((e) => (
                    <li key={e.id} className="flex items-center gap-1 border-s-2 border-soft ps-2">
                      <span className="truncate">{pick(e.nameAr, e.nameEn)}</span>
                      <span className="ms-auto truncate text-[11px] text-muted">{pick(e.positionAr, e.positionEn)}</span>
                    </li>
                  ))}
                  {!staff.length && <li className="text-muted">{t("m33.org.noStaff")}</li>}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Screens for m33, keyed by ScreenDef.id in meta.ts.
export const screens: Record<string, ComponentType> = {
  s1: EmployeesList,
  s2: EmployeeFile,
  s3: Leave,
  s4: OrgChart,
};
