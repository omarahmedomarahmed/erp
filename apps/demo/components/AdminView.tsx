"use client";
import { useEffect, useMemo, useState } from "react";
import { Shell } from "@/components/Shell";
import { useT } from "@/components/I18n";
import { Badge, Button, DataTable, LockedNote, Modal, type Column } from "@/components/ui";
import { PERSONAS } from "@/content/personas";
import { MODULES } from "@/content/modules";
import * as seed from "@/data/seed";
import type { Persona, SettingDef } from "@/lib/types";

type Row = Record<string, unknown> & { id: string };
type LogRow = { id: number; tbl: string; key: string; data: Record<string, unknown>; actor: string; at: string };

// Demo master data the admin can create, edit and delete. Posted journals are read-only on purpose.
const ENTITIES: { id: string; rows: () => Row[]; fields: string[]; locked?: boolean }[] = [
  { id: "customers", rows: () => seed.customers as unknown as Row[], fields: ["nameAr", "nameEn", "phone", "cityAr"] },
  { id: "agents", rows: () => seed.agents as unknown as Row[], fields: ["nameAr", "nameEn", "licenceNo", "licenceExpiry", "status"] },
  { id: "employees", rows: () => seed.employees as unknown as Row[], fields: ["nameAr", "nameEn", "positionAr", "grade"] },
  { id: "products", rows: () => seed.products as unknown as Row[], fields: ["nameAr", "nameEn"] },
  { id: "policies", rows: () => seed.policies as unknown as Row[], fields: ["certNo", "status", "end"] },
  { id: "journals", rows: () => seed.journals as unknown as Row[], fields: ["date", "memoAr", "status"], locked: true },
];

export function AdminView({ persona, settings }: { persona: Persona; settings: SettingDef[] }) {
  const { t, pick, lang } = useT();
  const [tab, setTab] = useState<"users" | "settings" | "records" | "log">("users");
  const [entity, setEntity] = useState(ENTITIES[0].id);
  const [overrides, setOverrides] = useState<Record<string, Row & { deleted?: boolean }>>({});
  const [stored, setStored] = useState<Record<string, { choice?: string; updated_by?: string; updated_at?: string }>>({});
  const [log, setLog] = useState<LogRow[]>([]);
  const [editing, setEditing] = useState<Row | null>(null);
  const [toast, setToast] = useState("");
  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(""), 1800); };

  const load = () => {
    fetch("/api/records").then((r) => r.json()).then((rows: (Row & { key: string })[]) => setOverrides(Object.fromEntries(rows.map((r) => [r.key, r])))).catch(() => {});
    fetch("/api/settings").then((r) => r.json()).then((rows: { key: string; choice?: string; updated_by?: string; updated_at?: string }[]) => setStored(Object.fromEntries(rows.map((r) => [r.key, r])))).catch(() => {});
    fetch("/api/records?what=log").then((r) => r.json()).then(setLog).catch(() => {});
  };
  useEffect(load, []);

  const ent = ENTITIES.find((e) => e.id === entity)!;
  const rows = useMemo(() => {
    const base = ent.rows().map((r) => ({ ...r, ...(overrides[`${entity}:${r.id}`] ?? {}), id: r.id }));
    const added = Object.entries(overrides).filter(([k]) => k.startsWith(`${entity}:NEW`)).map(([k, v]) => ({ ...v, id: k.split(":")[1] }));
    return [...base, ...added].filter((r) => !(r as { deleted?: boolean }).deleted);
  }, [ent, entity, overrides]);

  const saveRecord = async (r: Row, remove = false) => {
    const key = `${entity}:${r.id}`;
    const data = remove ? { deleted: true } : Object.fromEntries(ent.fields.map((f) => [f, r[f]]));
    const res = await fetch("/api/records", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ key, data }) });
    flash(res.ok ? t(remove ? "pg.admin.deleted" : "pg.admin.saved") : "!");
    setEditing(null); load();
  };

  const name = (p: Persona) => (lang === "en" ? p.nameEn : p.nameAr);
  const changed = settings.filter((s) => stored[s.id]);
  const decided = settings.filter((s) => s.answered);
  const cols: Column<Row>[] = [
    { key: "id", label: "ID", render: (r) => <span className="en font-mono text-[12px]">{r.id}</span> },
    ...ent.fields.map((f) => ({ key: f, label: f, render: (r: Row) => String(r[f] ?? "") })),
    { key: "act", label: "", align: "end" as const, render: (r: Row) => ent.locked ? <Badge>{t("pg.admin.lockedPosted")}</Badge> : (
      <span className="flex justify-end gap-1">
        <Button variant="ghost" onClick={() => setEditing(r)}>{t("pg.admin.edit")}</Button>
        <Button variant="danger" onClick={() => saveRecord(r, true)}>{t("pg.admin.delete")}</Button>
      </span>) },
  ];

  return (
    <Shell persona={persona} current={t("pg.admin.title")}>
      <div className="mx-auto max-w-7xl p-4">
        <h1 className="text-[20px] font-extrabold text-navy">{t("pg.admin.title")}</h1>
        <p className="text-muted">{t("pg.admin.intro")}</p>
        <div className="mt-3 flex gap-1 overflow-x-auto border-b border-line">
          {(["users", "settings", "records", "log"] as const).map((k) => (
            <button key={k} type="button" onClick={() => setTab(k)} className={`border-b-2 px-3 py-2 text-[13px] font-bold whitespace-nowrap ${tab === k ? "border-brand text-brand-deep" : "border-transparent text-muted"}`}>
              {t({ users: "pg.admin.section.users", settings: "pg.admin.section.settings", records: "pg.admin.section.records", log: "pg.admin.section.changelog" }[k])}
            </button>
          ))}
        </div>

        {tab === "users" && (
          <div className="mt-3 rounded-lg border border-line">
            <DataTable<Row> columns={[
              { key: "n", label: t("pg.admin.section.users"), render: (r) => <b>{name(r.p as Persona)}</b> },
              { key: "r", label: t("app.actingAs"), render: (r) => t((r.p as Persona).roleKey) },
              { key: "d", label: t("app.departments"), render: (r) => t((r.p as Persona).deptKey) },
              { key: "m", label: "", render: (r) => { const p = r.p as Persona; return p.modules === "*" ? <Badge tone="brand">{t("pg.login.allModules")}</Badge> :
                <span className="flex flex-wrap gap-1">{p.modules.map((id) => { const m = MODULES.find((x) => x.id === id); return <Badge key={id}>{m ? t(m.nameKey) : id}</Badge>; })}</span>; } },
            ]} rows={PERSONAS.map((p) => ({ id: p.id, p }))} />
          </div>
        )}

        {tab === "settings" && (
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-line bg-surface p-3"><div className="text-muted text-[12px]">{t("pg.admin.settings.defaults")}</div><div className="text-[22px] font-extrabold text-navy num">{settings.length}</div></div>
            <div className="rounded-lg border border-line bg-surface p-3"><div className="text-muted text-[12px]">{t("pg.admin.settings.decided")}</div><div className="text-[22px] font-extrabold text-ok num">{decided.length}</div></div>
            <div className="rounded-lg border border-line bg-surface p-3"><div className="text-muted text-[12px]">{t("pg.admin.settings.changed")}</div><div className="text-[22px] font-extrabold text-brand num">{changed.length}</div></div>
            <div className="md:col-span-3 rounded-lg border border-line">
              <DataTable<Row> columns={[
                { key: "id", label: "ID", render: (r) => <span className="en font-mono text-[12px]">{r.id}</span> },
                { key: "title", label: t("pg.settings.title"), render: (r) => String(r.title) },
                { key: "cur", label: t("pg.settings.current"), render: (r) => <b className="en">{String(r.cur)}</b> },
                { key: "src", label: "", render: (r) => r.src === "changed" ? <Badge tone="info">{t("pg.admin.settings.changed")}</Badge> : <Badge tone="ok">{t("pg.admin.settings.decided")}</Badge> },
              ]} rows={[...changed.map((s) => ({ id: s.id, title: s.title, cur: stored[s.id]?.choice, src: "changed" })), ...decided.filter((s) => !stored[s.id]).map((s) => ({ id: s.id, title: s.title, cur: s.answered, src: "decided" }))]} />
            </div>
          </div>
        )}

        {tab === "records" && (
          <div className="mt-3">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              {ENTITIES.map((e) => <button key={e.id} type="button" onClick={() => setEntity(e.id)} className={`rounded-full border px-3 py-1 text-[12px] ${entity === e.id ? "border-brand bg-soft font-bold text-brand-deep" : "border-line bg-surface text-muted"}`}>{e.id}</button>)}
              {!ent.locked && <span className="ms-auto"><Button variant="primary" onClick={() => setEditing({ id: `NEW${Date.now().toString(36).toUpperCase()}` })}>{t("pg.admin.create")}</Button></span>}
            </div>
            {ent.locked && <div className="mb-2"><LockedNote text={t("common.locked")} /></div>}
            <div className="rounded-lg border border-line"><DataTable columns={cols} rows={rows.slice(0, 200)} /></div>
          </div>
        )}

        {tab === "log" && (
          <div className="mt-3 rounded-lg border border-line">
            <DataTable<Row> empty={t("pg.admin.log.empty")} columns={[
              { key: "at", label: t("pg.admin.log.when"), render: (r) => <span className="num text-[12px]">{String(r.at).slice(0, 19).replace("T", " ")}</span> },
              { key: "actor", label: t("pg.admin.log.who"), render: (r) => { const p = PERSONAS.find((x) => x.id === r.actor); return p ? name(p) : String(r.actor); } },
              { key: "what", label: t("pg.admin.log.what"), render: (r) => <span className="en font-mono text-[12px]">{String(r.tbl)} · {String(r.key)}</span> },
              { key: "after", label: t("pg.admin.log.after"), render: (r) => <span className="en text-[12px] text-muted">{JSON.stringify(r.data).slice(0, 120)}</span> },
            ]} rows={log.map((l) => ({ ...l, id: String(l.id) }))} />
          </div>
        )}
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={`${entity} · ${editing?.id ?? ""}`}>
        {editing && (
          <form onSubmit={(e) => { e.preventDefault(); saveRecord(editing); }} className="grid gap-2">
            {ent.fields.map((f) => (
              <label key={f} className="grid gap-1 text-[12px] font-bold text-muted">{f}
                <input id={`f-${f}`} value={String(editing[f] ?? "")} onChange={(e) => setEditing({ ...editing, [f]: e.target.value })}
                  className="rounded-md border border-line bg-canvas px-2 py-1.5 text-[13px] font-normal text-ink outline-none focus:border-brand" />
              </label>
            ))}
            <div className="mt-2 flex gap-2"><Button type="submit" variant="primary">{t("common.save")}</Button><Button onClick={() => setEditing(null)}>{t("pg.admin.cancel")}</Button></div>
          </form>
        )}
      </Modal>
      {toast && <div className="fixed bottom-4 start-4 rounded-md bg-navy px-3 py-2 text-[13px] text-white">{toast}</div>}
      <span hidden>{pick("", "")}</span>
    </Shell>
  );
}
