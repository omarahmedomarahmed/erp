"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, RotateCcw, Save, Search } from "lucide-react";
import { Shell } from "@/components/Shell";
import { useT } from "@/components/I18n";
import { Badge, Button } from "@/components/ui";
import { personaById } from "@/content/personas";
import type { DictRow } from "@/lib/dict";
import type { Persona } from "@/lib/types";

const PAGE = 50;
type Status = "all" | "checked" | "unchecked" | "edited";
type Draft = { ar: string; en: string; checked: boolean; ticked: boolean };

/** Arabic-normalised lowercase text for search: tashkeel and tatweel removed, hamza/alef, ta marbuta and alef maqsura unified. */
export function normAr(s: string) {
  return s.toLowerCase()
    .replace(/[ً-ٰٟـ]/g, "")
    .replace(/[أإآٱ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").replace(/ؤ/g, "و").replace(/ئ/g, "ي");
}
const moduleOf = (key: string) => key.split(".")[0];

export function DictionaryView({ persona }: { persona: Persona }) {
  const { t, pick } = useT();
  const router = useRouter();
  const [rows, setRows] = useState<DictRow[] | null>(null);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [status, setStatus] = useState<Status>("all");
  const [cat, setCat] = useState("all");
  const [mod, setMod] = useState("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<{ text: string; bad?: boolean } | null>(null);
  const flash = (text: string, bad?: boolean) => { setToast({ text, bad }); setTimeout(() => setToast(null), 2000); };

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/dictionary", { cache: "no-store" });
      if (r.ok) setRows((await r.json()) as DictRow[]);
      else setRows([]);
    } catch { setRows([]); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const all = rows ?? [];
  const index = useMemo(() => all.map((r) => ({ r, s: normAr(`${r.key} ${r.ar} ${r.en} ${r.baseAr} ${r.baseEn}`) })), [all]);
  const cats = useMemo(() => [...new Set(all.map((r) => r.cat ?? "label"))].sort(), [all]);
  const mods = useMemo(() => [...new Set(all.map((r) => moduleOf(r.key)))].sort(), [all]);
  const counts = useMemo(() => ({
    total: all.length,
    checked: all.filter((r) => r.checked).length,
    unchecked: all.filter((r) => !r.checked).length,
    edited: all.filter((r) => r.edited).length,
  }), [all]);
  const filtered = useMemo(() => {
    const nq = normAr(q.trim());
    return index.filter(({ r, s }) =>
      (status === "all" || (status === "checked" ? r.checked : status === "unchecked" ? !r.checked : r.edited)) &&
      (cat === "all" || (r.cat ?? "label") === cat) &&
      (mod === "all" || moduleOf(r.key) === mod) &&
      (!nq || s.includes(nq))).map((x) => x.r);
  }, [index, status, cat, mod, q]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const cur = Math.min(page, pages - 1);
  const shown = filtered.slice(cur * PAGE, cur * PAGE + PAGE);

  const draftOf = (r: DictRow): Draft => drafts[r.key] ?? { ar: r.ar, en: r.en, checked: r.checked, ticked: false };
  const setText = (r: DictRow, field: "ar" | "en", v: string) => setDrafts((d) => {
    const x = d[r.key] ?? { ar: r.ar, en: r.en, checked: r.checked, ticked: false };
    // Editing a checked entry resets it to unchecked unless the editor re-ticks it.
    return { ...d, [r.key]: { ...x, [field]: v, checked: x.ticked ? x.checked : false } };
  });
  const post = async (body: Record<string, unknown>, ok: string, key: string) => {
    setBusy(key);
    try {
      const res = await fetch("/api/dictionary", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error();
      await load();
      setDrafts((d) => { const n = { ...d }; delete n[key]; return n; });
      router.refresh();
      flash(ok);
    } catch { flash(t("pg.dict.toast.error"), true); }
    setBusy(null);
  };
  const toggleChecked = (r: DictRow) => {
    const d = draftOf(r);
    const textDirty = d.ar !== r.ar || d.en !== r.en;
    if (!textDirty) {
      // Pure review: save the flag at once.
      void post({ key: r.key, ar: r.ar, en: r.en, checked: !d.checked }, t(!d.checked ? "pg.dict.toast.checked" : "pg.dict.toast.saved"), r.key);
    } else setDrafts((x) => ({ ...x, [r.key]: { ...d, checked: !d.checked, ticked: true } }));
  };
  const save = (r: DictRow) => { const d = draftOf(r); void post({ key: r.key, ar: d.ar.trim(), en: d.en.trim(), checked: d.checked }, t("pg.dict.toast.saved"), r.key); };
  const reset = (r: DictRow) => void post({ key: r.key, reset: true }, t("pg.dict.toast.reset"), r.key);
  const who = (id?: string) => { const p = personaById(id); return p ? pick(p.nameAr, p.nameEn) : id ?? ""; };
  const sel = "rounded-md border border-line bg-canvas px-2 py-1 text-[13px]";
  const chip = (id: Status, label: string, n: number) => (
    <button key={id} type="button" onClick={() => { setStatus(id); setPage(0); }}
      className={`rounded-full border px-2.5 py-0.5 text-[12px] ${status === id ? "border-brand bg-soft font-bold text-brand-deep" : "border-line bg-surface text-muted"}`}>
      {label} <span className="num">{n}</span>
    </button>
  );

  return (
    <Shell persona={persona} current={t("pg.dict.title")}>
      <div className="mx-auto max-w-[1400px] p-4">
        <h1 className="text-[20px] font-extrabold text-navy">{t("pg.dict.title")}</h1>
        <p className="text-muted">{t("pg.dict.intro")}</p>

        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
          {([["total", "common.total", "text-navy"], ["checked", "pg.dict.filter.checked", "text-ok"], ["unchecked", "pg.dict.filter.unchecked", "text-warn"], ["edited", "pg.dict.filter.edited", "text-brand-deep"]] as const).map(([k, label, tone]) => (
            <div key={k} className="rounded-lg border border-line bg-surface p-3">
              <div className="text-[12px] text-muted">{t(label)}</div>
              <div className={`num mt-1 text-[20px] font-extrabold ${tone}`}>{counts[k]}</div>
              {k === "checked" && counts.total > 0 && (
                <div className="mt-1 h-1.5 overflow-hidden rounded bg-line"><div className="h-full bg-ok" style={{ width: `${(counts.checked / counts.total) * 100}%` }} /></div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-t-lg border border-line bg-surface px-3 py-2">
          {chip("all", t("pg.dict.filter.all"), counts.total)}
          {chip("checked", t("pg.dict.filter.checked"), counts.checked)}
          {chip("unchecked", t("pg.dict.filter.unchecked"), counts.unchecked)}
          {chip("edited", t("pg.dict.filter.edited"), counts.edited)}
          <label className="flex items-center gap-1 text-[12px] text-muted">{t("pg.dict.col.cat")}
            <select className={sel} value={cat} onChange={(e) => { setCat(e.target.value); setPage(0); }}>
              <option value="all">{t("pg.dict.filter.all")}</option>
              {cats.map((c) => <option key={c} value={c}>{t(`rk.dict.cat.${c}`)}</option>)}
            </select>
          </label>
          <label className="flex items-center gap-1 text-[12px] text-muted">{t("rk.dict.module")}
            <select className={sel} value={mod} onChange={(e) => { setMod(e.target.value); setPage(0); }}>
              <option value="all">{t("pg.dict.filter.all")}</option>
              {mods.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </label>
          <label className="ms-auto flex min-w-[200px] max-w-[340px] flex-1 items-center gap-2 rounded-md border border-line bg-canvas px-2 py-1">
            <Search size={14} className="text-muted" aria-hidden />
            <input value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} placeholder={t("pg.dict.search")} aria-label={t("pg.dict.search")}
              className="min-w-0 flex-1 bg-transparent text-[13px] outline-none" />
          </label>
        </div>

        <div className="overflow-x-auto border-x border-line bg-surface">
          <table className="w-full min-w-[900px] border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-line bg-canvas text-muted">
                <th className="px-2 py-2 text-start font-bold" style={{ width: "18%" }}>{t("pg.dict.col.key")}</th>
                <th className="px-2 py-2 text-start font-bold" style={{ width: "30%" }}>{t("pg.dict.col.ar")}</th>
                <th className="px-2 py-2 text-start font-bold" style={{ width: "26%" }}>{t("pg.dict.col.en")}</th>
                <th className="px-2 py-2 text-center font-bold">{t("pg.dict.col.checked")}</th>
                <th className="px-2 py-2 text-start font-bold">{t("pg.dict.col.editedBy")}</th>
                <th className="px-2 py-2" />
              </tr>
            </thead>
            <tbody>
              {rows === null && <tr><td colSpan={6} className="px-3 py-8 text-center text-muted">…</td></tr>}
              {rows !== null && !shown.length && <tr><td colSpan={6} className="px-3 py-8 text-center text-muted">{t("pg.dict.empty")}</td></tr>}
              {shown.map((r) => {
                const d = draftOf(r);
                const dirty = d.ar !== r.ar || d.en !== r.en || d.checked !== r.checked;
                return (
                  <tr key={r.key} className={`border-b border-line/70 align-top ${dirty ? "bg-soft/50" : ""}`}>
                    <td className="px-2 py-2">
                      <div className="num break-all text-[12px] text-navy" dir="ltr">{r.key}</div>
                      <div className="mt-1 flex flex-wrap gap-1"><Badge>{t(`rk.dict.cat.${r.cat ?? "label"}`)}</Badge>{r.edited && <Badge tone="info">{t("pg.dict.filter.edited")}</Badge>}</div>
                    </td>
                    <td className="px-2 py-2">
                      <textarea dir="rtl" rows={Math.min(4, Math.max(1, Math.ceil(d.ar.length / 45)))} value={d.ar} aria-label={`${t("pg.dict.col.ar")} ${r.key}`}
                        onChange={(e) => setText(r, "ar", e.target.value)}
                        className="w-full resize-y rounded-md border border-line bg-canvas px-2 py-1 outline-none focus:border-brand" />
                      {r.edited && r.baseAr !== r.ar && <div className="mt-0.5 text-[11px] text-muted">{t("rk.dict.default")}: {r.baseAr}</div>}
                    </td>
                    <td className="px-2 py-2">
                      <textarea dir="ltr" rows={Math.min(4, Math.max(1, Math.ceil(d.en.length / 45)))} value={d.en} aria-label={`${t("pg.dict.col.en")} ${r.key}`}
                        onChange={(e) => setText(r, "en", e.target.value)}
                        className="w-full resize-y rounded-md border border-line bg-canvas px-2 py-1 outline-none focus:border-brand" />
                      {r.edited && r.baseEn !== r.en && <div className="mt-0.5 text-[11px] text-muted" dir="ltr">{t("rk.dict.default")}: {r.baseEn}</div>}
                    </td>
                    <td className="px-2 py-2 text-center">
                      <label className="inline-flex cursor-pointer flex-col items-center gap-0.5 text-[11px] text-muted">
                        <input type="checkbox" checked={d.checked} disabled={busy === r.key} onChange={() => toggleChecked(r)}
                          className="size-4 accent-[var(--color-brand)]" aria-label={t("pg.dict.markChecked")} />
                        {d.checked ? <span className="text-ok">{t("pg.dict.filter.checked")}</span> : <span>{t("pg.dict.filter.unchecked")}</span>}
                      </label>
                      {r.checked && !d.checked && dirty && <div className="mt-1 text-[10px] text-warn">{t("rk.dict.uncheckedByEdit")}</div>}
                    </td>
                    <td className="px-2 py-2 text-[12px]">
                      {r.updatedAt ? <>
                        <div>{who(r.updatedBy)}</div>
                        <div className="num text-muted">{r.updatedAt.slice(0, 16).replace("T", " ")}</div>
                      </> : <span className="text-muted">—</span>}
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex flex-col items-stretch gap-1">
                        <Button variant="primary" disabled={!dirty || busy === r.key} onClick={() => save(r)}><Save size={13} aria-hidden />{t("pg.dict.save")}</Button>
                        {(r.edited || r.updatedAt) && (
                          <Button variant="ghost" disabled={busy === r.key} onClick={() => reset(r)}><RotateCcw size={13} aria-hidden />{t("pg.dict.reset")}</Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center gap-2 rounded-b-lg border border-line bg-surface px-3 py-2 text-[12px]">
          <span className="text-muted">{t("pg.dict.count", { shown: filtered.length, total: counts.total })}</span>
          <div className="ms-auto flex items-center gap-2">
            <Button variant="ghost" disabled={cur === 0} onClick={() => setPage(cur - 1)}><ChevronRight size={14} className="ltr:rotate-180" aria-hidden />{t("rk.dict.prev")}</Button>
            <span className="num">{t("rk.dict.page", { page: cur + 1, pages })}</span>
            <Button variant="ghost" disabled={cur >= pages - 1} onClick={() => setPage(cur + 1)}>{t("rk.dict.next")}<ChevronLeft size={14} className="ltr:rotate-180" aria-hidden /></Button>
          </div>
        </div>
        <p className="mt-2 text-[11px] text-muted">{t("rk.dict.rule")}</p>
      </div>
      {toast && <div className={`fixed bottom-4 start-4 z-50 rounded-md px-3 py-2 text-[13px] text-white ${toast.bad ? "bg-danger" : "bg-navy"}`}>{toast.text}</div>}
    </Shell>
  );
}
