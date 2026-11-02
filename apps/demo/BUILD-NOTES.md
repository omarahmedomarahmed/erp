# TakafulTech demo: conventions for module builders

The app is a clickable **demo** (Next.js 15 + TypeScript, Tailwind 4) for Takaful Insurance Company. It is Odoo-style, simple and clean, Arabic RTL by default with an English toggle, and uses Takafuly brand colours. Data is **invented** (`data/seed.ts`). Persisted demo state (settings, dictionary edits, answers) goes to Neon through `/api/*`.

## Files you own per module `mXX`

| File | Contents |
|---|---|
| `modules/mXX/meta.ts` | `ModuleMeta` (see `lib/types.ts`), filled completely, see below |
| `modules/mXX/screens.tsx` | `"use client"`. Export `screens: Record<string, ComponentType>` keyed by the 4 screen ids in `meta.ts` |
| `content/dict/mXX.ts` | Every text your module shows, as dictionary entries with keys prefixed `mXX.` |

Do not edit any other file. If you need something in the shared kit, say so in your report. You may add small private components inside your own `modules/mXX/` folder.

## Rules

1. **No literal UI text.** Every visible string comes from `t("mXX.…")` (`useT()` from `@/components/I18n`), so the dictionary page can rename it everywhere. Seed data values (names, products) come from `data/seed.ts` via `pick(ar, en)`.
   - Arabic follows `/home/user/erp/docs/decisions/STYLE.md`: active voice, short, «نحن» for us, English for technical terms (KPI, SLA, IBNR, Quota Share, XoL, PDF, QR, SMS…), never «حدّية», never the letters "WP".
   - English is short and natural.
2. **Use the UI kit** (`@/components/ui`) for everything:
   - lists: `ControlPanel` + `DataTable` (+ `useFilter`)
   - records: `Sheet` + `Fields` + `StatusBar` + `Timeline`
   - pipelines: `Kanban`
   - dashboards: `KpiRow` + `Panel` + `BarChart` / `LineChart` / `Donut`
   - values: `Badge`, `Money`, `DateText`
   - safety demos: `GuardButton`, `LockedNote`, `Modal`
   - Tailwind tokens only: `bg-surface`, `bg-canvas`, `text-navy`, `text-muted`, `text-brand`, `text-brand-deep`, `bg-soft`, `border-line`, `bg-accent`, and `ok` / `warn` / `danger` (`-soft`). No other colours.
3. **4 screens per module** that show the module's real work, each with:
   - a short `titleKey` (tab label)
   - a **one-line** `captionKey` explaining the screen (this caption also goes into the client deck)

   A typical set is list, record/form, pipeline or board, and dashboard or report, but pick what fits the module best. Screens are interactive inside the demo (e.g. clicking a row opens the record in the same screen; buttons change local state with React `useState`). Nothing needs a server call except where stated.
4. **Same data everywhere.** Use `data/seed.ts`. The hero story (`STORY`: customer محمد علي الورفلي → motor policy → receipts → claim CLM-2026-00073 → retakaful recovery → commission → surplus) should be visible in your module where relevant, and selected by default where a record view opens.
5. **Takaful correctness is visible:**
   - every money line shows its **fund** (صندوق المشتركين / صندوق المساهمين); claims are paid from the participants' fund; commissions and salaries from the shareholders' fund
   - every contract and transaction shows **الحالة الشرعية** (Sharia status)
   - maker-checker shows "prepared by / approved by"
   - posted entries show `LockedNote`
6. **meta.ts must fill:**
   - `decisionIds`: the decision-module ids whose settings appear in the Settings tab (e.g. M09; accounting uses ["M08","M12","RES"])
   - `nameKey`, `taglineKey` (one line), `deptKey` (a `dept.*` key from `content/dict/common.ts`), `icon` (a lucide-react icon name), `color` (one of `#0f75db`, `#284dae`, `#152b56`, `#1f8a4c`, `#ff5722`, `#7a4ea3`, `#0f8b8d`, `#b26a00`), `briefRef` (client proposal section, e.g. "3.4"; "" for HR and payroll)
   - `needs`: 3–5 items {ar, en} naming what we need from the company to build this module correctly
   - `sensitive` for dangerous modules: `riskKey`, `controlKeys` (3–4), and `guards` (2), each a "try it" button with the blocked answer
   - the 4 `screens`
7. **Layout:** usable at 1440 px (screenshots for the deck are taken at 1440×900) and at phone width. No horizontal page scroll, except inside tables.
8. **Verify:** `cd /home/user/erp/apps/demo && npx tsc --noEmit` must be clean for your files. Do not run `next dev` or `next build`; the orchestrator does.
