"use client";
import { createContext, useContext, useState, type ReactNode } from "react";
import Link from "next/link";
import { ChevronDown, Check, ShieldCheck, Link2, Sparkles, Info } from "lucide-react";
import { useT } from "@/components/I18n";
import { AUTOMATION, type AutoPrompt } from "@/content/automation";

// Automation (smart assistant by Atmet). Global on/off kept in the tt_auto cookie.
const Ctx = createContext<{ on: boolean; set: (v: boolean) => void }>({ on: false, set: () => {} });
export const useAuto = () => useContext(Ctx);

export function AutoProvider({ initial, children }: { initial: boolean; children: ReactNode }) {
  const [on, setOn] = useState(initial);
  const set = (v: boolean) => { setOn(v); document.cookie = `tt_auto=${v ? 1 : 0}; path=/; max-age=31536000; samesite=lax`; };
  return <Ctx.Provider value={{ on, set }}>{children}</Ctx.Provider>;
}

export function AutoToggle() {
  const { on, set } = useAuto();
  const { t } = useT();
  return (
    <button type="button" role="switch" aria-checked={on} onClick={() => set(!on)}
      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[14px] font-bold transition-colors ${on ? "bg-[#f55315] text-white" : "bg-white/10 text-white hover:bg-white/20"}`}>
      <img src="/brand/atmet-mark-white.svg" alt="" className="size-5" />
      {t("auto.toggle")}
      <span className={`relative h-5 w-9 rounded-full transition-colors ${on ? "bg-white/35" : "bg-white/25"}`}>
        <span className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition-all ${on ? "start-[18px]" : "start-0.5"}`} />
      </span>
    </button>
  );
}

export function AutomationPanel({ moduleId }: { moduleId: string }) {
  const { on } = useAuto();
  const { t, lang } = useT();
  const prompts = AUTOMATION[moduleId];
  const [open, setOpen] = useState(true);
  const [p, setP] = useState<AutoPrompt | null>(null);
  const [opt, setOpt] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  if (!on || !prompts) return null;
  const L = (x: { ar: string; en: string }) => x[lang];
  const choose = (i: number) => { setOpt(i); setBusy(true); setDone(false); setTimeout(() => setBusy(false), 900); };
  const reset = () => { setP(null); setOpt(null); setDone(false); };
  return (
    <section className="border-b-4 border-[#f55315] bg-[#0b0a09] text-white">
      <button type="button" onClick={() => setOpen(!open)} className="flex w-full items-center gap-3 px-5 py-3">
        <img src="/brand/atmet-mark-white.svg" alt="" className="size-7" />
        <span className="text-[16px] font-extrabold">{t("auto.title")}</span>
        <span className="flex items-center gap-1.5 text-[12px] text-white/55">{t("auto.by")}<img src="/brand/atmet-word-white.png" alt="Atmet" className="h-3.5 w-auto" /></span>
        <ChevronDown size={18} className={`ms-auto transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>
      {open && (
        <div className="grid gap-3 px-5 pb-4">
          {!p && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[13px] text-white/60">{t("auto.pick")}</span>
              {prompts.map((x) => (
                <button key={x.id} type="button" onClick={() => setP(x)}
                  className="inline-flex items-center gap-2 rounded-full border border-[#f55315]/60 bg-[#1f1c1a] px-4 py-2 text-[14px] font-bold hover:bg-[#f55315]">
                  <Sparkles size={15} className="text-[#f55315] group-hover:text-white" aria-hidden />{L(x.title)}
                </button>
              ))}
            </div>
          )}
          {p && (
            <div className="rounded-xl bg-[#1f1c1a] p-4">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Sparkles size={16} className="text-[#f55315]" aria-hidden />
                <span className="text-[15px] font-extrabold">{L(p.title)}</span>
                <button type="button" onClick={reset} className="ms-auto rounded-md px-2 py-1 text-[12px] text-white/60 hover:bg-white/10">{t("auto.reset")}</button>
              </div>
              <div className="mb-3 flex flex-wrap items-center gap-2 text-[13px]">
                <span className="text-white/60">{L(p.ask)}</span>
                {p.options.map((o, i) => (
                  <button key={i} type="button" onClick={() => choose(i)}
                    className={`rounded-full px-3 py-1 font-bold ${opt === i ? "bg-[#f55315] text-white" : "bg-white/10 hover:bg-white/20"}`}>{L(o)}</button>
                ))}
              </div>
              {opt !== null && busy && <div className="animate-pulse text-[13px] text-white/60">{t("auto.thinking")}</div>}
              {opt !== null && !busy && (
                <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr]">
                  <div className="rounded-lg bg-white p-4 text-ink">
                    <p className="mb-3 text-[15px] font-extrabold text-[#0b0a09]">{L(p.summary)}</p>
                    <div className="mb-2 text-[12px] font-bold text-muted">{t("auto.findings")}</div>
                    <ul className="grid gap-2">
                      {p.findings.map((f, i) => (
                        <li key={i} className="flex flex-wrap items-center gap-2 border-s-4 border-[#f55315] bg-canvas px-3 py-2 text-[13px]">
                          <span className="min-w-0 flex-1">{L(f.text)}</span>
                          {f.sources.map((s) => (
                            <Link key={s.label + s.href} href={s.href} className="inline-flex items-center gap-1 rounded-md bg-[#0b0a09] px-2 py-0.5 text-[11px] font-bold text-white hover:bg-[#f55315]">
                              <Link2 size={11} aria-hidden /><span className="num">{s.label}</span>
                            </Link>
                          ))}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex flex-col gap-3 rounded-lg border border-[#f55315]/50 p-4">
                    <div className="text-[12px] font-bold text-[#f55315]">{t("auto.suggested")}</div>
                    <p className="text-[14px] font-bold">{L(p.action)}</p>
                    {p.sensitive && <p className="flex items-center gap-1.5 text-[12px] text-white/70"><ShieldCheck size={14} className="text-[#f55315]" aria-hidden />{t("auto.needsHuman")}</p>}
                    {done
                      ? <p className="flex items-start gap-2 rounded-md bg-ok/20 p-2 text-[12px] text-white"><Check size={15} className="shrink-0" aria-hidden />{t("auto.confirmed")}</p>
                      : <button type="button" onClick={() => setDone(true)} className="mt-auto rounded-lg bg-[#f55315] px-4 py-2 text-[14px] font-extrabold hover:brightness-110">{t("auto.confirm")}</button>}
                  </div>
                </div>
              )}
            </div>
          )}
          <p className="flex items-start gap-2 rounded-lg border border-[#f55315]/40 bg-[#f55315]/10 px-3 py-2 text-[12.5px] font-bold text-white/90">
            <Info size={15} className="mt-0.5 shrink-0 text-[#f55315]" aria-hidden />{t("auto.disclaimer")}
          </p>
        </div>
      )}
    </section>
  );
}
