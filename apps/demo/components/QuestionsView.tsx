"use client";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Check } from "lucide-react";
import { Shell } from "@/components/Shell";
import { useT } from "@/components/I18n";
import { Badge, Button } from "@/components/ui";
import { MODULES } from "@/content/modules";
import { MODULE_RANKING_INTRO, QUESTIONS, type Question } from "@/content/questions";
import type { Persona } from "@/lib/types";

type Answer = { answer?: string | string[]; notes?: string; updated_by?: string; updated_at?: string };

export function QuestionsView({ persona }: { persona: Persona }) {
  const { t, lang, pick } = useT();
  const [tab, setTab] = useState<"q" | "rank">("q");
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [order, setOrder] = useState<string[]>(MODULES.map((m) => m.id));
  const [toast, setToast] = useState("");
  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(""), 1800); };

  useEffect(() => {
    fetch("/api/questions").then((r) => r.json()).then((rows: (Answer & { key: string; order?: string[] })[]) => {
      const map: Record<string, Answer> = {};
      for (const r of rows) {
        if (r.key === "ranking" && Array.isArray(r.order)) {
          const known = r.order.filter((id) => MODULES.some((m) => m.id === id));
          setOrder([...known, ...MODULES.map((m) => m.id).filter((id) => !known.includes(id))]);
        } else map[r.key] = r;
      }
      setAnswers(map);
    }).catch(() => {});
  }, []);

  const save = async (key: string, data: Record<string, unknown>, msg: string) => {
    const r = await fetch("/api/questions", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ key, data }) });
    flash(r.ok ? msg : t("pg.questions.saveFailed"));
  };
  const done = QUESTIONS.filter((q) => { const a = answers[q.id]?.answer; return Array.isArray(a) ? a.length : !!a; }).length;
  const move = (i: number, d: -1 | 1) => setOrder((o) => { const n = [...o]; const j = i + d; if (j < 0 || j >= n.length) return o; [n[i], n[j]] = [n[j], n[i]]; return n; });

  return (
    <Shell persona={persona} current={t("pg.questions.title")}>
      <div className="mx-auto max-w-5xl p-4">
        <h1 className="text-[20px] font-extrabold text-navy">{t("pg.questions.title")}</h1>
        <p className="text-muted">{t("pg.questions.intro")}</p>
        <div className="mt-3 flex items-center gap-3">
          <div className="h-2 w-60 overflow-hidden rounded bg-line"><div className="h-full bg-brand" style={{ width: `${(done / QUESTIONS.length) * 100}%` }} /></div>
          <span className="text-[12px] text-muted">{t("pg.questions.progress", { done, total: QUESTIONS.length })}</span>
        </div>
        <div className="mt-4 flex gap-1 border-b border-line">
          {(["q", "rank"] as const).map((k) => (
            <button key={k} type="button" onClick={() => setTab(k)}
              className={`border-b-2 px-3 py-2 text-[13px] font-bold ${tab === k ? "border-brand text-brand-deep" : "border-transparent text-muted"}`}>
              {t(k === "q" ? "pg.questions.tab.questions" : "pg.questions.tab.ranking")}
            </button>
          ))}
        </div>

        {tab === "q" ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {QUESTIONS.map((q, i) => (
              <QuestionCard key={q.id} n={i + 1} q={q} value={answers[q.id] ?? {}}
                onChange={(a) => setAnswers((s) => ({ ...s, [q.id]: a }))}
                onSave={(a) => save(q.id, { answer: a.answer, notes: a.notes }, t("pg.questions.saved"))} />
            ))}
          </div>
        ) : (
          <div className="mt-4">
            <p className="mb-3 text-[13px] text-muted">{pick(MODULE_RANKING_INTRO.ar, MODULE_RANKING_INTRO.en)}</p>
            <ol className="grid gap-2">
              {order.map((id, i) => {
                const m = MODULES.find((x) => x.id === id)!;
                return (
                  <li key={id} className="grid gap-2 rounded-lg border border-line bg-surface p-3 sm:grid-cols-[48px_minmax(0,1fr)_auto]">
                    <span className="grid size-10 place-items-center rounded-full bg-navy text-[15px] font-extrabold text-white num">{i + 1}</span>
                    <div className="min-w-0">
                      <div className="font-extrabold text-navy">{t(m.nameKey)} <span className="text-[12px] font-normal text-muted">· {t(m.taglineKey)}</span></div>
                      {m.needs.length > 0 && (
                        <details className="mt-1 text-[12px]">
                          <summary className="cursor-pointer text-brand-deep">{t("pg.ranking.needs")}</summary>
                          <ul className="mt-1 list-disc ps-5 text-muted">{m.needs.map((n, k) => <li key={k}>{pick(n.ar, n.en)}</li>)}</ul>
                        </details>
                      )}
                    </div>
                    <div className="flex items-start gap-1">
                      <Button variant="ghost" onClick={() => move(i, -1)} disabled={i === 0}><ArrowUp size={14} aria-label={t("pg.ranking.moveUp")} /></Button>
                      <Button variant="ghost" onClick={() => move(i, 1)} disabled={i === order.length - 1}><ArrowDown size={14} aria-label={t("pg.ranking.moveDown")} /></Button>
                    </div>
                  </li>
                );
              })}
            </ol>
            <div className="mt-3 flex gap-2">
              <Button variant="primary" onClick={() => save("ranking", { order }, t("pg.ranking.saved"))}>{t("pg.ranking.save")}</Button>
              <Button onClick={() => setOrder(MODULES.map((m) => m.id))}>{t("pg.ranking.reset")}</Button>
            </div>
          </div>
        )}
      </div>
      {toast && <div className="fixed bottom-4 start-4 rounded-md bg-navy px-3 py-2 text-[13px] text-white">{toast}</div>}
      <span hidden>{lang}</span>
    </Shell>
  );
}

function QuestionCard({ n, q, value, onChange, onSave }: { n: number; q: Question; value: Answer; onChange: (a: Answer) => void; onSave: (a: Answer) => void }) {
  const { t, pick } = useT();
  const sel = value.answer;
  const answered = Array.isArray(sel) ? sel.length > 0 : !!sel;
  const set = (a: Partial<Answer>) => onChange({ ...value, ...a });
  return (
    <section className={`flex flex-col gap-2 rounded-lg border bg-surface p-4 ${answered ? "border-brand" : "border-line"}`}>
      <div className="flex items-center gap-2">
        <span className="grid size-7 place-items-center rounded-full bg-soft text-[12px] font-extrabold text-brand-deep num">{n}</span>
        {answered ? <Badge tone="ok"><Check size={11} aria-hidden />{t("pg.questions.answered")}</Badge> : <Badge>{t("pg.questions.open")}</Badge>}
      </div>
      <h3 className="font-extrabold text-navy">{pick(q.ar, q.en)}</h3>
      <p className="text-[12px] text-muted">{pick(q.hintAr, q.hintEn)}</p>
      {q.type === "text" && (
        <textarea id={`q-${q.id}`} aria-label={t("pg.questions.yourAnswer")} value={typeof sel === "string" ? sel : ""} onChange={(e) => set({ answer: e.target.value })}
          className="min-h-20 rounded-md border border-line bg-canvas p-2 text-[13px] outline-none focus:border-brand" />
      )}
      {q.type !== "text" && (
        <div className="grid gap-1.5">
          {q.options?.map((o) => {
            const on = q.type === "multi" ? Array.isArray(sel) && sel.includes(o.key) : sel === o.key;
            return (
              <label key={o.key} className={`flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-1.5 text-[13px] ${on ? "border-brand bg-soft" : "border-line bg-canvas"}`}>
                <input type={q.type === "multi" ? "checkbox" : "radio"} name={`q-${q.id}`} checked={on} className="accent-[var(--color-brand)]"
                  onChange={() => {
                    if (q.type === "multi") { const cur = Array.isArray(sel) ? sel : []; set({ answer: on ? cur.filter((k) => k !== o.key) : [...cur, o.key] }); }
                    else set({ answer: o.key });
                  }} />
                {pick(o.ar, o.en)}
              </label>
            );
          })}
        </div>
      )}
      <input aria-label={t("pg.questions.notes")} placeholder={t("pg.questions.notesPlaceholder")} value={value.notes ?? ""} onChange={(e) => set({ notes: e.target.value })}
        className="rounded-md border border-line bg-canvas px-2 py-1.5 text-[13px] outline-none focus:border-brand" />
      <div className="mt-auto flex items-center gap-2">
        <Button variant="primary" onClick={() => onSave(value)}>{t("pg.questions.save")}</Button>
        {value.updated_at && <span className="text-[11px] text-muted num">{String(value.updated_at).slice(0, 16).replace("T", " ")}</span>}
      </div>
    </section>
  );
}
