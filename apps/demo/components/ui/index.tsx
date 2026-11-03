"use client";
// Odoo-style UI kit for the demo. Module screens compose these; no raw styling per module beyond layout.
import { Children, cloneElement, isValidElement, useMemo, useState, type ReactElement, type ReactNode } from "react";
import { Lock, Search, X, ShieldAlert, Check, Ban, Eye, EyeOff } from "lucide-react";
import { FULL_NAMES } from "@/lib/fullnames";
import { useT } from "@/components/I18n";

/* ---------- formatting ---------- */
export function money(n: number | null | undefined, lang: "ar" | "en" = "ar") {
  const v = (n ?? 0).toLocaleString("en-US", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
  return lang === "en" ? `LYD ${v}` : `${v} د.ل`;
}
export function Money({ value, strong }: { value: number | null | undefined; strong?: boolean }) {
  const { lang } = useT();
  return <span className={`num ${strong ? "font-bold" : ""}`}>{money(value, lang)}</span>;
}
export function DateText({ value }: { value?: string | null }) {
  if (!value) return <span className="text-muted">—</span>;
  return <span className="num">{value.slice(0, 10)}</span>;
}

/* ---------- badges ---------- */
export type Tone = "info" | "ok" | "warn" | "danger" | "neutral" | "brand";
const TONES: Record<Tone, string> = {
  info: "bg-soft text-brand-deep",
  brand: "bg-brand text-white",
  ok: "bg-ok-soft text-ok",
  warn: "bg-warn-soft text-warn",
  danger: "bg-danger-soft text-danger",
  neutral: "bg-canvas text-muted border border-line",
};
/** A person's name: first name visible, the rest masked; the eye button reveals the full (fictitious) name. */
export function Name({ masked }: { masked: string }) {
  const [shown, setShown] = useState(false);
  const full = FULL_NAMES[masked];
  if (!full) return <>{masked}</>;
  return (
    <span className="inline-flex items-center gap-1 whitespace-nowrap">
      <span>{shown ? full : masked}</span>
      <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShown((v) => !v); }} aria-label={shown ? "hide" : "show"} aria-pressed={shown}
        className="grid size-5 place-items-center rounded text-muted hover:bg-soft hover:text-brand-deep">
        {shown ? <EyeOff size={13} aria-hidden /> : <Eye size={13} aria-hidden />}
      </button>
    </span>
  );
}
/** Walks plain JSX and turns any masked person name into <Name>, so every table, record and timeline gets the eye button. */
export function withNames(node: ReactNode): ReactNode {
  if (typeof node === "string") return FULL_NAMES[node.trim()] ? <Name masked={node.trim()} /> : node;
  if (Array.isArray(node)) return Children.map(node, withNames);
  if (isValidElement(node) && typeof node.type === "string") {
    const el = node as ReactElement<{ children?: ReactNode }>;
    if (el.props.children === undefined) return el;
    return cloneElement(el, undefined, withNames(el.props.children));
  }
  return node;
}
export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold whitespace-nowrap ${TONES[tone]}`}>{children}</span>;
}

/* ---------- buttons ---------- */
export function Button({ children, onClick, variant = "secondary", type = "button", disabled }: {
  children: ReactNode; onClick?: () => void; variant?: "primary" | "secondary" | "ghost" | "danger"; type?: "button" | "submit"; disabled?: boolean;
}) {
  const v = {
    primary: "bg-brand text-white border-brand hover:bg-brand-deep",
    secondary: "bg-surface text-ink border-line hover:border-brand",
    ghost: "bg-transparent text-brand-deep border-transparent hover:bg-soft",
    danger: "bg-surface text-danger border-danger/40 hover:bg-danger-soft",
  }[variant];
  return (
    <button type={type} disabled={disabled} onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[13px] font-bold transition-colors disabled:opacity-50 ${v}`}>
      {children}
    </button>
  );
}

/* ---------- control panel (Odoo: breadcrumb + actions + search/filters) ---------- */
export function ControlPanel({ title, actions, filters, onSearch }: {
  title: ReactNode; actions?: ReactNode; filters?: { id: string; label: string; active?: boolean; onClick?: () => void }[]; onSearch?: (q: string) => void;
}) {
  const { t } = useT();
  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-line bg-surface px-4 py-2.5">
      <h2 className="text-[16px] font-extrabold text-navy">{title}</h2>
      <div className="flex flex-wrap gap-2">{actions}</div>
      <div className="ms-auto flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2">
        {filters?.map((f) => (
          <button key={f.id} type="button" onClick={f.onClick}
            className={`rounded-full border px-2.5 py-0.5 text-[12px] ${f.active ? "border-brand bg-soft text-brand-deep font-bold" : "border-line bg-surface text-muted"}`}>
            {f.label}
          </button>
        ))}
        {onSearch && (
          <label className="flex min-w-[160px] max-w-[280px] flex-1 items-center gap-2 rounded-md border border-line bg-canvas px-2 py-1">
            <Search size={14} className="text-muted" aria-hidden />
            <input aria-label={t("common.search")} placeholder={t("common.search")} onChange={(e) => onSearch(e.target.value)}
              className="min-w-0 flex-1 bg-transparent text-[13px] outline-none" />
          </label>
        )}
      </div>
    </div>
  );
}

/* ---------- list view ---------- */
const ALIGN = { start: "text-start", end: "text-end", center: "text-center" } as const;
export interface Column<R> { key: string; label: string; render?: (r: R) => ReactNode; align?: "start" | "end" | "center"; width?: string }
export function DataTable<R extends { id: string }>({ columns, rows, onRowClick, empty, footer }: {
  columns: Column<R>[]; rows: R[]; onRowClick?: (r: R) => void; empty?: string; footer?: ReactNode;
}) {
  const { t } = useT();
  return (
    <div className="overflow-x-auto bg-surface">
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr className="border-b border-line bg-canvas text-muted">
            {columns.map((c) => (
              <th key={c.key} style={{ width: c.width }} className={`px-3 py-2 font-bold whitespace-nowrap ${ALIGN[c.align ?? "start"]}`}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} onClick={onRowClick ? () => onRowClick(r) : undefined}
              className={`border-b border-line/70 ${onRowClick ? "cursor-pointer hover:bg-soft/60" : ""}`}>
              {columns.map((c) => (
                <td key={c.key} className={`px-3 py-2 align-middle ${ALIGN[c.align ?? "start"]}`}>
                  {withNames(c.render ? c.render(r) : String((r as Record<string, unknown>)[c.key] ?? ""))}
                </td>
              ))}
            </tr>
          ))}
          {!rows.length && (
            <tr><td colSpan={columns.length} className="px-3 py-8 text-center text-muted">{empty ?? t("common.empty")}</td></tr>
          )}
        </tbody>
        {footer && <tfoot className="border-t-2 border-line bg-canvas font-bold">{footer}</tfoot>}
      </table>
    </div>
  );
}

/** Client-side text filter helper for list screens. */
export function useFilter<R>(rows: R[], fields: (r: R) => string) {
  const [q, setQ] = useState("");
  const out = useMemo(() => {
    const n = q.trim().toLowerCase();
    return n ? rows.filter((r) => fields(r).toLowerCase().includes(n)) : rows;
  }, [q, rows, fields]);
  return { rows: out, setQ };
}

/* ---------- form view (record sheet) ---------- */
export function StatusBar({ stages, current }: { stages: { id: string; label: string }[]; current: string }) {
  const idx = stages.findIndex((s) => s.id === current);
  return (
    <ol className="flex flex-wrap overflow-hidden rounded-md border border-line text-[12px]">
      {stages.map((s, i) => (
        <li key={s.id} className={`flex items-center gap-1 px-3 py-1 ${i === idx ? "bg-brand text-white font-bold" : i < idx ? "bg-soft text-brand-deep" : "bg-surface text-muted"} ${i ? "border-s border-line" : ""}`}>
          {i < idx && <Check size={12} aria-hidden />}{s.label}
        </li>
      ))}
    </ol>
  );
}
export function Sheet({ title, subtitle, status, actions, children, side }: {
  title: ReactNode; subtitle?: ReactNode; status?: ReactNode; actions?: ReactNode; children: ReactNode; side?: ReactNode;
}) {
  return (
    <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0 rounded-lg border border-line bg-surface shadow-sm">
        <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-2">{actions}<div className="ms-auto">{status}</div></div>
        <div className="px-5 py-4">
          <h3 className="text-[20px] font-extrabold text-navy">{withNames(title)}</h3>
          {subtitle && <p className="text-muted">{withNames(subtitle)}</p>}
          <div className="mt-4">{children}</div>
        </div>
      </div>
      {side && <aside className="min-w-0">{side}</aside>}
    </div>
  );
}
export function Fields({ items, cols = 2 }: { items: { label: string; value: ReactNode }[]; cols?: 1 | 2 | 3 }) {
  return (
    <dl className={`grid gap-x-8 gap-y-2 ${cols === 1 ? "" : cols === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
      {items.map((f, i) => (
        <div key={i} className="grid grid-cols-[minmax(110px,40%)_1fr] items-baseline gap-2 border-b border-line/60 py-1">
          <dt className="text-[12px] font-bold text-muted">{f.label}</dt>
          <dd className="min-w-0">{withNames(f.value)}</dd>
        </div>
      ))}
    </dl>
  );
}
/** Odoo "chatter": activity timeline next to a record. */
export function Timeline({ title, items }: { title: string; items: { at: string; who?: string; text: ReactNode; tone?: Tone }[] }) {
  return (
    <div className="rounded-lg border border-line bg-surface p-3">
      <h4 className="mb-2 text-[13px] font-extrabold text-navy">{title}</h4>
      <ol className="grid gap-2">
        {items.map((it, i) => (
          <li key={i} className="border-s-2 border-soft ps-3 text-[12px]">
            <div className="flex flex-wrap gap-2 text-muted"><span className="num">{it.at}</span>{it.who && <span>· {withNames(it.who)}</span>}</div>
            <div>{it.text}</div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ---------- kanban ---------- */
export function Kanban<C extends { id: string }>({ columns, cards, renderCard, onCardClick }: {
  columns: { id: string; label: string; tone?: Tone }[]; cards: (C & { column: string })[]; renderCard: (c: C) => ReactNode; onCardClick?: (c: C) => void;
}) {
  return (
    <div className="flex gap-3 overflow-x-auto p-4">
      {columns.map((col) => {
        const list = cards.filter((c) => c.column === col.id);
        return (
          <section key={col.id} className="flex w-[230px] shrink-0 flex-col gap-2 rounded-lg bg-canvas p-2">
            <header className="flex items-center justify-between px-1 text-[13px] font-extrabold text-navy">
              <span>{col.label}</span><Badge tone={col.tone ?? "neutral"}>{list.length}</Badge>
            </header>
            {list.map((c) => (
              <article key={c.id} onClick={onCardClick ? () => onCardClick(c) : undefined}
                className={`rounded-md border border-line bg-surface p-2.5 text-[12px] shadow-sm ${onCardClick ? "cursor-pointer hover:border-brand" : ""}`}>
                {withNames(renderCard(c))}
              </article>
            ))}
          </section>
        );
      })}
    </div>
  );
}

/* ---------- KPIs & charts ---------- */
export function KpiRow({ items }: { items: { label: string; value: ReactNode; hint?: ReactNode; tone?: Tone }[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 p-4 md:grid-cols-4">
      {items.map((k, i) => (
        <div key={i} className="rounded-lg border border-line bg-surface p-3">
          <div className="text-[12px] text-muted">{k.label}</div>
          <div className={`mt-1 text-[20px] font-extrabold ${k.tone === "danger" ? "text-danger" : k.tone === "ok" ? "text-ok" : "text-navy"}`}>{k.value}</div>
          {k.hint && <div className="text-[11px] text-muted">{k.hint}</div>}
        </div>
      ))}
    </div>
  );
}
export function Panel({ title, children, actions }: { title: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <section className="min-w-0 rounded-lg border border-line bg-surface">
      <header className="flex items-center gap-2 border-b border-line px-3 py-2"><h4 className="text-[13px] font-extrabold text-navy">{title}</h4><div className="ms-auto">{actions}</div></header>
      <div className="p-3">{children}</div>
    </section>
  );
}
/** Simple bar chart. Values share one scale; labels under bars. */
export function BarChart({ data, height = 160, format }: { data: { label: string; value: number; tone?: Tone }[]; height?: number; format?: (n: number) => string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-2" style={{ height }} role="img">
      {data.map((d, i) => (
        <div key={i} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1">
          <span className="num text-[10px] text-muted">{format ? format(d.value) : Math.round(d.value).toLocaleString("en-US")}</span>
          <div className={`w-full rounded-t ${d.tone === "warn" ? "bg-accent" : d.tone === "ok" ? "bg-ok" : "bg-brand"}`} style={{ height: `${(d.value / max) * (height - 40)}px` }} />
          <span className="w-full truncate text-center text-[10px] text-muted">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
/** Line chart over evenly spaced points. */
export function LineChart({ series, labels, height = 160 }: { series: { name: string; values: number[]; color?: string }[]; labels: string[]; height?: number }) {
  const w = 600, h = height, pad = 24;
  const all = series.flatMap((s) => s.values);
  const max = Math.max(1, ...all), min = Math.min(0, ...all);
  const x = (i: number) => pad + (i * (w - 2 * pad)) / Math.max(1, labels.length - 1);
  const y = (v: number) => h - pad - ((v - min) / (max - min || 1)) * (h - 2 * pad);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" style={{ direction: "ltr" }}>
      {[0, 0.5, 1].map((f) => <line key={f} x1={pad} x2={w - pad} y1={pad + f * (h - 2 * pad)} y2={pad + f * (h - 2 * pad)} stroke="var(--color-line)" />)}
      {series.map((s, si) => (
        <g key={si}>
          <polyline fill="none" stroke={s.color ?? (si ? "var(--color-accent)" : "var(--color-brand)")} strokeWidth={2.5} points={s.values.map((v, i) => `${x(i)},${y(v)}`).join(" ")} />
          {s.values.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r={i === s.values.length - 1 ? 4 : 2} fill={s.color ?? (si ? "var(--color-accent)" : "var(--color-brand)")} />)}
        </g>
      ))}
      {labels.map((l, i) => <text key={i} x={x(i)} y={h - 6} textAnchor="middle" fontSize="10" fill="var(--color-muted)">{l}</text>)}
    </svg>
  );
}
/** Donut with legend. */
export function Donut({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  let acc = 0;
  const stops = data.map((d) => { const a = acc; acc += (d.value / total) * 100; return `${d.color} ${a}% ${acc}%`; }).join(", ");
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="size-28 rounded-full" style={{ background: `conic-gradient(${stops})`, mask: "radial-gradient(circle, transparent 52%, #000 53%)", WebkitMask: "radial-gradient(circle, transparent 52%, #000 53%)" }} role="img" />
      <ul className="grid gap-1 text-[12px]">
        {data.map((d) => <li key={d.label} className="flex items-center gap-2"><span className="size-2.5 rounded-sm" style={{ background: d.color }} />{d.label}<span className="num text-muted">{Math.round((d.value / total) * 100)}%</span></li>)}
      </ul>
    </div>
  );
}

/* ---------- modal & guarded actions ---------- */
export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-navy/40 p-4" role="dialog" aria-modal="true" aria-label={title} onClick={onClose}>
      <div className="w-full max-w-md rounded-lg bg-surface p-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-2 flex items-center gap-2"><h3 className="text-[15px] font-extrabold text-navy">{title}</h3>
          <button type="button" onClick={onClose} className="ms-auto text-muted" aria-label="close"><X size={16} /></button></div>
        {children}
      </div>
    </div>
  );
}
/** One rule the platform enforces: what is not allowed, and why. */
export function RuleItem({ what, why }: { what: string; why: string }) {
  const { t } = useT();
  return (
    <li className="flex gap-3 rounded-lg border border-danger/20 bg-danger-soft/50 p-3">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-danger text-white"><Ban size={17} aria-hidden /></span>
      <div className="min-w-0">
        <div className="text-[14px] font-extrabold text-danger">{what}</div>
        <div className="mt-1 text-[13px] leading-relaxed text-ink"><span className="font-bold text-muted">{t("rules.why")}: </span>{why}</div>
      </div>
    </li>
  );
}
/** One button per module: opens the list of actions the platform does not allow, each with its reason. */
export function RulesButton({ rules, moduleName }: { rules: { id: string; what: string; why: string }[]; moduleName: string }) {
  const [open, setOpen] = useState(false);
  const { t } = useT();
  if (!rules.length) return null;
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-danger/40 bg-danger-soft px-3.5 py-2 text-[13px] font-extrabold text-danger transition-colors hover:bg-danger hover:text-white">
        <Ban size={16} aria-hidden />{t("rules.button")}
        <span className="grid size-5 place-items-center rounded-full bg-danger text-[11px] text-white num">{rules.length}</span>
      </button>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-navy/50 p-4" role="dialog" aria-modal="true" aria-label={t("rules.title")} onClick={() => setOpen(false)}>
          <div className="w-full max-w-xl rounded-xl bg-surface shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 rounded-t-xl bg-danger px-5 py-4 text-white">
              <ShieldAlert size={24} aria-hidden />
              <div><h3 className="text-[17px] font-extrabold">{t("rules.title")}</h3><div className="text-[12px] text-white/80">{moduleName}</div></div>
              <button type="button" onClick={() => setOpen(false)} className="ms-auto rounded-md p-1 hover:bg-white/15" aria-label="close"><X size={18} /></button>
            </div>
            <ul className="grid max-h-[65vh] gap-2.5 overflow-y-auto p-5">
              {rules.map((r) => <RuleItem key={r.id} what={r.what} why={r.why} />)}
            </ul>
            <p className="flex items-center gap-2 border-t border-line px-5 py-3 text-[12px] text-muted"><Lock size={14} aria-hidden />{t("common.blockedLogged")}</p>
          </div>
        </div>
      )}
    </>
  );
}
/** Inline lock note for posted/immutable records. */
export function LockedNote({ text }: { text: string }) {
  return <div className="flex items-center gap-2 rounded-md bg-canvas px-3 py-2 text-[12px] text-muted"><Lock size={14} aria-hidden />{text}</div>;
}

export function Placeholder() {
  return <div className="p-10 text-center text-muted">…</div>;
}
