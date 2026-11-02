"use client";
import Link from "next/link";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import * as Icons from "lucide-react";
import { useT } from "@/components/I18n";
import { MODULES } from "@/content/modules";
import { QUESTIONS } from "@/content/questions";
import type { ModuleMeta } from "@/lib/types";

// 16:9 deck at 1280×720, scaled to the window. ?print=1 lays out every slide as a page for PDF export.
type IconCmp = React.ComponentType<{ size?: number; "aria-hidden"?: boolean }>;
const icon = (n: string): IconCmp => ((Icons as unknown as Record<string, IconCmp>)[n] ?? Icons.LayoutGrid);

function Slide({ children, dark, n, total }: { children: ReactNode; dark?: boolean; n: number; total: number }) {
  const { t } = useT();
  return (
    <section className={`deck-slide relative flex h-[720px] w-[1280px] flex-col overflow-hidden ${dark ? "bg-navy text-white" : "bg-surface text-ink"}`}>
      {children}
      <footer className={`absolute bottom-0 inset-x-0 flex items-center gap-3 px-10 py-3 text-[12px] ${dark ? "text-white/60" : "text-muted"}`}>
        <img src={dark ? "/brand/logo.png" : "/brand/logo-navy.png"} alt="" className="h-5 w-auto opacity-80" />
        <span>{t("app.demo")}</span><span className="ms-auto num">{n} / {total}</span>
      </footer>
    </section>
  );
}
function Title({ children, sub, dark }: { children: ReactNode; sub?: ReactNode; dark?: boolean }) {
  return (
    <header className="px-12 pt-10 pb-4">
      <h2 className={`text-[34px] font-extrabold leading-tight ${dark ? "text-white" : "text-navy"}`}>{children}</h2>
      {sub && <p className={`mt-1 text-[17px] ${dark ? "text-white/75" : "text-muted"}`}>{sub}</p>}
      <div className="mt-3 h-1 w-16 rounded bg-accent" />
    </header>
  );
}

function ModuleSlide({ m, n, total }: { m: ModuleMeta; n: number; total: number }) {
  const { t, lang } = useT();
  const I = icon(m.icon);
  return (
    <Slide n={n} total={total}>
      <header className="flex items-center gap-4 px-12 pt-8 pb-3">
        <span className="grid size-14 place-items-center rounded-2xl text-white" style={{ background: m.color }}><I size={28} aria-hidden /></span>
        <div className="min-w-0">
          <h2 className="text-[30px] font-extrabold text-navy">{t(m.nameKey)}</h2>
          <p className="text-[16px] text-muted">{t(m.taglineKey)}</p>
        </div>
        <div className="ms-auto flex items-center gap-2 text-[13px]">
          {m.briefRef && <span className="rounded-full bg-soft px-3 py-1 font-bold text-brand-deep">{lang === "en" ? "Proposal §" : "البند "}<span className="num">{m.briefRef}</span></span>}
          {m.sensitive && <span className="rounded-full bg-accent px-3 py-1 font-bold text-white">{t("deck.module.sensitive")}</span>}
        </div>
      </header>
      <div className="grid min-h-0 flex-1 grid-cols-2 grid-rows-2 gap-x-6 gap-y-3 px-12 pb-12">
        {m.screens.map((s) => (
          <figure key={s.id} className="flex min-h-0 flex-col gap-1.5">
            <div className="min-h-0 flex-1 overflow-hidden rounded-lg border border-line bg-canvas shadow-sm">
              <img src={`/deck/${m.id}-${s.id}-${lang}.jpg`} alt={t(s.titleKey)} className="h-full w-full object-cover object-top" />
            </div>
            <figcaption className="text-[14px] leading-snug"><b className="text-navy">{t(s.titleKey)}:</b> <span className="text-muted">{t(s.captionKey)}</span></figcaption>
          </figure>
        ))}
      </div>
    </Slide>
  );
}

export function Deck() {
  const { t, pick } = useT();
  const [i, setI] = useState(0);
  const [scale, setScale] = useState(1);
  const [print, setPrint] = useState(false);
  useEffect(() => { setPrint(new URLSearchParams(location.search).has("print")); }, []);
  const sensitive = MODULES.filter((m) => m.sensitive);
  const make = (total: number): ReactNode[] => {
    let n = 0;
    const next = () => ++n;
    return [
      <Slide key="cover" dark n={next()} total={total}>
        <div className="flex flex-1 flex-col items-start justify-center gap-6 px-16">
          <img src="/brand/logo.png" alt={t("app.company")} className="h-20 w-auto" />
          <h1 className="text-[56px] font-extrabold leading-tight">{t("deck.cover.title")}</h1>
          <p className="max-w-3xl text-[22px] text-white/80">{t("deck.cover.sub")}</p>
          <p className="text-[16px] text-accent">{t("deck.cover.date")}</p>
        </div>
        <img src="/brand/slogan.svg" alt="" className="absolute bottom-16 end-16 h-16 w-auto opacity-70" />
      </Slide>,
      <Slide key="map" n={next()} total={total}>
        <Title sub={t("deck.map.sub")}>{t("deck.map.title")}</Title>
        <div className="grid grid-cols-7 gap-4 px-12">
          {MODULES.map((m) => { const I = icon(m.icon); return (
            <div key={m.id} className="flex flex-col items-center gap-2 text-center">
              <span className="relative grid size-20 place-items-center rounded-2xl text-white" style={{ background: m.color }}><I size={36} aria-hidden />
                {m.sensitive && <span className="absolute -top-1 -end-1 size-4 rounded-full border-2 border-white bg-accent" />}</span>
              <span className="text-[14px] font-bold leading-tight text-navy">{t(m.nameKey)}</span>
            </div>); })}
        </div>
      </Slide>,
      <Slide key="journey" n={next()} total={total}>
        <Title>{t("deck.journey.title")}</Title>
        <ol className="grid grid-cols-7 gap-3 px-12 pt-8">
          {[1, 2, 3, 4, 5, 6, 7].map((k) => (
            <li key={k} className="flex flex-col gap-3 rounded-xl border border-line bg-canvas p-4">
              <span className="grid size-10 place-items-center rounded-full bg-brand text-[18px] font-extrabold text-white num">{k}</span>
              <span className="text-[16px] font-bold leading-snug text-navy">{t(`deck.journey.s${k}`)}</span>
            </li>
          ))}
        </ol>
      </Slide>,
      ...MODULES.map((m) => <ModuleSlide key={m.id} m={m} n={next()} total={total} />),
      <Slide key="sensitive" n={next()} total={total}>
        <Title sub={t("deck.sensitive.sub")}>{t("deck.sensitive.title")}</Title>
        <div className="grid grid-cols-2 gap-3 px-12">
          {sensitive.map((m) => (
            <div key={m.id} className="rounded-lg border border-line p-3">
              <div className="font-extrabold text-navy">{t(m.nameKey)}</div>
              <div className="text-[13px] text-danger">{m.sensitive && t(m.sensitive.riskKey)}</div>
              <ul className="mt-1 list-disc ps-5 text-[13px] text-muted">{m.sensitive?.controlKeys.slice(0, 2).map((c) => <li key={c}>{t(c)}</li>)}</ul>
            </div>
          ))}
        </div>
      </Slide>,
      <Slide key="hosting" dark n={next()} total={total}>
        <Title dark>{t("deck.hosting.title")}</Title>
        <ul className="grid gap-4 px-12 pt-4 text-[22px]">
          {[1, 2, 3, 4, 5].map((k) => <li key={k} className="flex gap-3"><span className="mt-2 size-3 shrink-0 rounded-full bg-accent" />{t(`deck.hosting.p${k}`)}</li>)}
        </ul>
      </Slide>,
      <Slide key="timeline" n={next()} total={total}>
        <Title>{t("deck.timeline.title")}</Title>
        <ol className="grid grid-cols-4 gap-4 px-12 pt-6">
          {[1, 2, 3, 4].map((k) => (
            <li key={k} className="rounded-xl bg-soft p-5"><div className="mb-2 h-1.5 rounded bg-brand" style={{ width: `${k * 25}%` }} />
              <p className="text-[18px] font-bold leading-snug text-navy">{t(`deck.timeline.w${k}`)}</p></li>
          ))}
        </ol>
        <p className="px-12 pt-8 text-[18px] text-muted">{t("deck.timeline.after")}</p>
      </Slide>,
      <Slide key="questions" n={next()} total={total}>
        <Title sub={t("deck.questions.sub")}>{t("deck.questions.title")}</Title>
        <ol className="grid grid-cols-2 gap-x-8 gap-y-2 px-12 text-[15px]">
          {QUESTIONS.map((q, k) => <li key={q.id} className="flex gap-2"><span className="num font-extrabold text-brand">{k + 1}.</span><span>{pick(q.ar, q.en)}</span></li>)}
        </ol>
      </Slide>,
      <Slide key="next" dark n={next()} total={total}>
        <Title dark>{t("deck.next.title")}</Title>
        <ol className="grid gap-4 px-12 pt-2 text-[24px]">
          {[1, 2, 3, 4].map((k) => <li key={k} className="flex items-center gap-4"><span className="grid size-11 place-items-center rounded-full bg-accent font-extrabold num">{k}</span>{t(`deck.next.s${k}`)}</li>)}
        </ol>
      </Slide>,
    ];
  };
  const total = 3 + MODULES.length + 5;
  const slides = make(total);
  const go = useCallback((d: number) => setI((x) => Math.max(0, Math.min(total - 1, x + d))), [total]);
  useEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / 1280, (window.innerHeight - 56) / 720));
    fit(); window.addEventListener("resize", fit);
    const key = (e: KeyboardEvent) => { if (["ArrowLeft", "PageDown", " "].includes(e.key)) go(document.dir === "rtl" ? 1 : -1); if (["ArrowRight", "PageUp"].includes(e.key)) go(document.dir === "rtl" ? -1 : 1); };
    window.addEventListener("keydown", key);
    return () => { window.removeEventListener("resize", fit); window.removeEventListener("keydown", key); };
  }, [go]);

  if (print) return <div className="deck-print">{slides}</div>;
  return (
    <div className="flex h-screen flex-col bg-ink">
      <div className="flex h-14 items-center gap-3 bg-navy px-4 text-[13px] text-white">
        <Link href="/" className="hover:underline">{t("app.home")}</Link>
        <span className="text-white/60">{t("pg.deck.title")}</span>
        <div className="ms-auto flex items-center gap-2">
          <button type="button" onClick={() => go(-1)} className="rounded bg-white/10 px-3 py-1">{t("pg.deck.prev")}</button>
          <span className="num">{i + 1} / {total}</span>
          <button type="button" onClick={() => go(1)} className="rounded bg-white/10 px-3 py-1">{t("pg.deck.next")}</button>
        </div>
      </div>
      <div className="grid flex-1 place-items-center overflow-hidden">
        <div style={{ width: 1280 * scale, height: 720 * scale }}>
          <div style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: 1280, height: 720 }} dir={undefined}>{slides[i]}</div>
        </div>
      </div>
    </div>
  );
}
