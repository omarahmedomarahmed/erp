"use client";
import { useEffect, useState } from "react";
import { useT } from "@/components/I18n";
import { Badge } from "@/components/ui";
import type { SettingDef } from "@/lib/types";

type Stored = { key: string; choice?: string; updated_by?: string; updated_at?: string };

/** Each decision becomes a setting: default = the company's answer or our recommendation; they can switch. */
export function SettingsPanel({ settings }: { settings: SettingDef[] }) {
  const { t } = useT();
  const [stored, setStored] = useState<Record<string, Stored>>({});
  const [toast, setToast] = useState("");
  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then((rows: Stored[]) => setStored(Object.fromEntries(rows.map((r) => [r.key, r])))).catch(() => {});
  }, []);
  const save = async (id: string, choice: string | null) => {
    await fetch("/api/settings", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(choice ? { id, choice } : { id, reset: true }) });
    setStored((s) => { const n = { ...s }; if (choice) n[id] = { key: id, choice, updated_at: new Date().toISOString() }; else delete n[id]; return n; });
    setToast(t("pg.settings.saved")); setTimeout(() => setToast(""), 1800);
  };
  if (!settings.length) return <p className="p-6 text-muted">{t("pg.settings.empty")}</p>;
  return (
    <div className="p-4">
      <h2 className="text-[16px] font-extrabold text-navy">{t("pg.settings.title")}</h2>
      <p className="mb-3 text-[13px] text-muted">{t("pg.settings.intro")}</p>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {settings.map((s) => {
          const base = s.answered ?? s.recommended;
          const cur = stored[s.id]?.choice ?? base;
          const opt = s.options.find((o) => o.key === cur);
          return (
            <section key={s.id} className="flex flex-col gap-2 rounded-lg border border-line bg-surface p-3">
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted">
                <span className="en font-mono">{s.id}</span>
                {s.priority === "حرج" && <Badge tone="danger">{s.priority}</Badge>}
                {s.answered && <Badge tone="ok">{t("pg.settings.decided")}</Badge>}
                {stored[s.id] && <Badge tone="info">{t("pg.settings.changedBy")}</Badge>}
              </div>
              <h3 className="text-[14px] font-extrabold text-navy">{s.title}</h3>
              <label className="text-[12px] text-muted" htmlFor={`set-${s.id}`}>{s.question}</label>
              <select id={`set-${s.id}`} value={cur} onChange={(e) => save(s.id, e.target.value)}
                className="rounded-md border border-line bg-canvas px-2 py-1.5 text-[13px] outline-none focus:border-brand">
                {s.options.map((o) => (
                  <option key={o.key} value={o.key}>{o.key}. {o.label}{o.key === s.recommended ? ` — ${t("common.recommended")}` : ""}</option>
                ))}
              </select>
              {opt?.consequence && <p className="text-[12px] text-muted">{opt.consequence}</p>}
              <div className="mt-auto flex items-center gap-2 text-[11px] text-muted">
                <span>{t("pg.settings.ourDefault")}: <b className="en">{base}</b></span>
                {stored[s.id] && <button type="button" onClick={() => save(s.id, null)} className="ms-auto text-brand-deep underline">{t("pg.settings.reset")}</button>}
              </div>
            </section>
          );
        })}
      </div>
      {toast && <div className="fixed bottom-4 start-4 rounded-md bg-navy px-3 py-2 text-[13px] text-white">{toast}</div>}
    </div>
  );
}
