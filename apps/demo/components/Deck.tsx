"use client";
import Link from "next/link";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import * as Icons from "lucide-react";
import { useT } from "@/components/I18n";
import { MODULES } from "@/content/modules";
import type { ModuleMeta } from "@/lib/types";

// 16:9 deck at 1280×720, scaled to the window. ?print=1 lays every slide out as a page for PDF export.
// Visual first: one large screenshot per module, big icons and diagrams, very little text.
type IconCmp = React.ComponentType<{ size?: number; strokeWidth?: number; className?: string; "aria-hidden"?: boolean }>;
const icon = (n: string): IconCmp => ((Icons as unknown as Record<string, IconCmp>)[n] ?? Icons.LayoutGrid);
const mod = (id: string) => MODULES.find((m) => m.id === id)!;

/** The most telling screen of each module, shown large on its slide. */
const HERO: Record<string, string> = {
  m02: "s2", m06: "s2", m05: "s1", m09: "s1", m10: "s3", m07: "s2", m04: "s2",
  m12: "s2", m28: "s1", m16: "s3", m15: "s1", m11: "s3", m33: "s4", m34: "s1",
};

function Slide({ children, dark, n, total }: { children: ReactNode; dark?: boolean; n: number; total: number }) {
  const { t } = useT();
  return (
    <section className={`deck-slide relative flex h-[720px] w-[1280px] flex-col overflow-hidden ${dark ? "bg-navy text-white" : "bg-surface text-ink"}`}>
      {children}
      <footer className={`absolute inset-x-0 bottom-0 flex items-center gap-3 px-10 py-2.5 text-[12px] ${dark ? "text-white/60" : "text-muted"}`}>
        <img src={dark ? "/brand/logo.png" : "/brand/logo-navy.png"} alt="" className="h-5 w-auto opacity-80" />
        <span>{t("app.demoShort")}</span><span className="ms-auto num">{n} / {total}</span>
      </footer>
    </section>
  );
}
function Title({ children, sub, dark }: { children: ReactNode; sub?: ReactNode; dark?: boolean }) {
  return (
    <header className="flex items-end gap-6 px-14 pt-10 pb-6">
      <div>
        <h2 className={`text-[40px] font-extrabold leading-tight ${dark ? "text-white" : "text-navy"}`}>{children}</h2>
        {sub && <p className={`mt-1 text-[19px] ${dark ? "text-white/75" : "text-muted"}`}>{sub}</p>}
      </div>
      <div className="mb-3 ms-auto h-1.5 w-24 shrink-0 rounded bg-accent" />
    </header>
  );
}
/** Screenshot inside a simple browser frame. */
function Browser({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-xl border border-line bg-surface shadow-[0_20px_50px_-15px_rgba(21,43,86,0.45)] ${className}`}>
      <div className="flex h-7 items-center gap-1.5 bg-canvas px-3" dir="ltr">
        <span className="size-2.5 rounded-full bg-[#ff5f57]" /><span className="size-2.5 rounded-full bg-[#febc2e]" /><span className="size-2.5 rounded-full bg-[#28c840]" />
        <span className="ms-3 rounded bg-surface px-3 text-[10px] text-muted">takafuly.vercel.app</span>
      </div>
      <img src={src} alt={alt} className="block w-full" />
    </div>
  );
}
function Tile({ m, size = 76 }: { m: ModuleMeta; size?: number }) {
  const I = icon(m.icon);
  return (
    <span className="relative grid shrink-0 place-items-center rounded-[22%] text-white shadow-md" style={{ background: m.color, width: size, height: size }}>
      <I size={Math.round(size * 0.48)} aria-hidden />
      {m.sensitive && <span className="absolute -end-1 -top-1 size-4 rounded-full border-2 border-white bg-accent" />}
    </span>
  );
}

function ModuleSlide({ m, n, total }: { m: ModuleMeta; n: number; total: number }) {
  const { t, lang } = useT();
  const hero = m.screens.find((s) => s.id === HERO[m.id]) ?? m.screens[0];
  return (
    <Slide n={n} total={total}>
      <div className="flex h-full items-center gap-10 px-12 pt-6 pb-12">
        <div className="flex w-[300px] shrink-0 flex-col gap-5">
          <Tile m={m} size={104} />
          <div>
            <h2 className="text-[38px] font-extrabold leading-tight text-navy">{t(m.nameKey)}</h2>
            <p className="mt-2 text-[18px] leading-snug text-muted">{t(m.taglineKey)}</p>
          </div>
          <div className="flex flex-wrap gap-2 text-[13px] font-bold">
            {m.briefRef && <span className="rounded-full bg-soft px-3 py-1 text-brand-deep">{lang === "en" ? "Proposal §" : "البند "}<span className="num">{m.briefRef}</span></span>}
            {m.sensitive && <span className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-white"><Icons.ShieldCheck size={14} aria-hidden />{t("deck.module.sensitive")}</span>}
          </div>
          <ul className="grid gap-2">
            {m.screens.map((s) => (
              <li key={s.id} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[15px] font-bold ${s.id === hero.id ? "bg-brand text-white" : "bg-canvas text-navy"}`}>
                <Icons.Monitor size={16} aria-hidden />{t(s.titleKey)}
              </li>
            ))}
          </ul>
        </div>
        <div className="min-w-0 flex-1">
          <Browser src={`/deck/${m.id}-${hero.id}-${lang}.jpg`} alt={t(hero.titleKey)} />
        </div>
      </div>
    </Slide>
  );
}

export function Deck() {
  const { t, lang } = useT();
  const [i, setI] = useState(0);
  const [scale, setScale] = useState(1);
  const [print, setPrint] = useState(false);
  useEffect(() => { setPrint(new URLSearchParams(location.search).has("print")); }, []);
  const sensitive = MODULES.filter((m) => m.sensitive);
  const total = 3 + MODULES.length + 5;
  let n = 0;
  const next = () => ++n;

  const journey: { icon: string; key: string; mod: string }[] = [
    { icon: "UserPlus", key: "deck.journey.s1", mod: "m02" },
    { icon: "Scale", key: "deck.journey.s2", mod: "m05" },
    { icon: "FileCheck2", key: "deck.journey.s3", mod: "m06" },
    { icon: "Wallet", key: "deck.journey.s4", mod: "m07" },
    { icon: "ClipboardCheck", key: "deck.journey.s5", mod: "m09" },
    { icon: "Share2", key: "deck.journey.s6", mod: "m10" },
    { icon: "HandCoins", key: "deck.journey.s7", mod: "m15" },
  ];
  const weeks = [
    { n: 1, key: "deck.week1", mods: ["m02"], extra: "deck.week1.extra" },
    { n: 2, key: "deck.week2", mods: ["m05", "m06", "m07", "m12"] },
    { n: 3, key: "deck.week3", mods: ["m09", "m10", "m04", "m16", "m11", "m15"] },
    { n: 4, key: "deck.week4", mods: ["m28", "m33", "m34"], extra: "deck.week4.extra" },
  ];
  const qIcons = ["Database", "Server", "ArrowRightLeft", "Percent", "BookOpen", "Package", "MapPin", "Landmark", "Share2", "Scale", "Users", "Banknote"];

  const slides: ReactNode[] = [
    <Slide key="cover" dark n={next()} total={total}>
      <div className="flex h-full items-center gap-10 ps-16">
        <div className="flex w-[520px] shrink-0 flex-col gap-6">
          <img src="/brand/logo.png" alt={t("app.company")} className="h-20 w-auto self-start" />
          <h1 className="text-[64px] font-extrabold leading-[1.1]">{t("deck.cover.title")}</h1>
          <p className="text-[22px] leading-snug text-white/80">{t("deck.cover.sub")}</p>
          <p className="text-[17px] font-bold text-accent">{t("deck.cover.date")}</p>
          <p className="text-[12px] leading-relaxed text-white/55">{t("app.disclaimer")}</p>
        </div>
        <div className="relative h-full min-w-0 flex-1">
          <Browser src={`/deck/m28-s1-${lang}.jpg`} alt="" className="absolute top-[110px] start-0 w-[900px] -rotate-3" />
        </div>
      </div>
      <img src="/brand/slogan.svg" alt="" className="absolute bottom-12 start-16 h-12 w-auto opacity-60" />
    </Slide>,

    <Slide key="map" n={next()} total={total}>
      <Title sub={t("deck.map.sub")}>{t("deck.map.title")}</Title>
      <div className="grid flex-1 grid-cols-7 content-center gap-x-4 gap-y-10 px-14 pb-16">
        {MODULES.map((m) => (
          <div key={m.id} className="flex flex-col items-center gap-3 text-center">
            <Tile m={m} size={112} />
            <span className="text-[17px] font-extrabold leading-tight text-navy">{t(m.nameKey)}</span>
          </div>
        ))}
      </div>
      <div className="absolute bottom-12 end-14 flex items-center gap-2 text-[14px] text-muted">
        <span className="size-4 rounded-full bg-accent" />{t("deck.module.sensitive")}
      </div>
    </Slide>,

    <Slide key="journey" n={next()} total={total}>
      <Title>{t("deck.journey.title")}</Title>
      <ol className="flex flex-1 items-center gap-2 px-12 pb-16">
        {journey.map((s, k) => {
          const I = icon(s.icon);
          const m = mod(s.mod);
          return (
            <li key={k} className="flex flex-1 items-center gap-2">
              <div className="flex min-w-0 flex-1 flex-col items-center gap-4 text-center">
                <span className="relative grid size-[120px] place-items-center rounded-full text-white shadow-lg" style={{ background: m.color }}>
                  <I size={56} aria-hidden />
                  <span className="absolute -start-2 -top-2 grid size-10 place-items-center rounded-full border-4 border-white bg-accent text-[17px] font-extrabold num">{k + 1}</span>
                </span>
                <span className="text-[18px] font-extrabold leading-snug text-navy">{t(s.key)}</span>
                <span className="rounded-full bg-canvas px-3 py-1 text-[13px] font-bold text-muted">{t(m.nameKey)}</span>
              </div>
              {k < journey.length - 1 && <Icons.ChevronLeft size={34} className="shrink-0 text-line ltr:rotate-180" aria-hidden />}
            </li>
          );
        })}
      </ol>
    </Slide>,

    ...MODULES.map((m) => <ModuleSlide key={m.id} m={m} n={next()} total={total} />),

    <Slide key="sensitive" n={next()} total={total}>
      <Title sub={t("deck.sensitive.sub")}>{t("deck.sensitive.title")}</Title>
      <div className="grid flex-1 grid-cols-4 grid-rows-2 gap-5 px-14 pb-16">
        {sensitive.map((m) => (
          <div key={m.id} className="flex flex-col gap-4 rounded-2xl border border-line bg-canvas p-5">
            <div className="flex items-center gap-3">
              <Tile m={m} size={64} />
              <Icons.ShieldCheck size={36} className="ms-auto text-ok" aria-hidden />
            </div>
            <div className="text-[20px] font-extrabold leading-tight text-navy">{t(m.nameKey)}</div>
            <div className="text-[14px] leading-snug text-muted">{m.sensitive && t(m.sensitive.controlKeys[0])}</div>
          </div>
        ))}
      </div>
    </Slide>,

    <Slide key="hosting" dark n={next()} total={total}>
      <Title dark>{t("deck.hosting.title")}</Title>
      <div className="flex flex-1 items-center gap-8 px-14 pb-6">
        <div className="flex-1 rounded-3xl border-2 border-dashed border-white/30 p-8">
          <div className="mb-6 flex items-center gap-3 text-[26px] font-extrabold"><Icons.Container size={42} className="text-accent" aria-hidden />{t("deck.host.docker")}</div>
          <div className="grid grid-cols-3 gap-4">
            {[["AppWindow", "deck.host.app"], ["Cog", "deck.host.worker"], ["Database", "deck.host.db"]].map(([ic, k]) => {
              const I = icon(ic);
              return <div key={k} className="flex h-[230px] flex-col items-center justify-center gap-4 rounded-2xl bg-white/10 p-6 text-center"><I size={84} strokeWidth={1.5} aria-hidden /><span className="text-[23px] font-extrabold">{t(k)}</span>{k === "deck.host.db" && <span className="en text-[16px] text-white/60">PostgreSQL</span>}</div>;
            })}
          </div>
        </div>
        <Icons.ArrowLeft size={72} className="shrink-0 text-accent ltr:rotate-180" aria-hidden />
        <div className="flex w-[360px] shrink-0 flex-col gap-5">
          <div className="flex items-center gap-5 rounded-2xl bg-white p-7 text-navy"><Icons.Server size={64} aria-hidden /><span className="text-[25px] font-extrabold leading-tight">{t("deck.host.onsite")}</span></div>
          <div className="text-center text-[19px] font-bold text-white/70">{t("deck.host.cloud")}</div>
          <div className="grid grid-cols-2 gap-3">
            {["AWS", "Azure"].map((c) => <div key={c} className="flex items-center justify-center gap-3 rounded-2xl bg-white/10 p-6 text-[26px] font-extrabold en"><Icons.Cloud size={40} aria-hidden />{c}</div>)}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 px-14 pb-16">
        <span className="text-[15px] font-bold text-white/70">{t("deck.host.envs")}</span>
        {["deck.host.dev", "deck.host.test", "deck.host.prod"].map((k) => <span key={k} className="rounded-full bg-white/15 px-4 py-1.5 text-[15px] font-bold">{t(k)}</span>)}
        <span className="ms-auto inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-[15px] font-bold"><Icons.DatabaseBackup size={18} aria-hidden />{t("deck.host.backup")}</span>
        <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-[15px] font-bold"><Icons.ArrowRightLeft size={18} aria-hidden />{t("deck.host.migrate")}</span>
      </div>
    </Slide>,

    <Slide key="timeline" n={next()} total={total}>
      <Title>{t("deck.timeline.title")}</Title>
      <div className="grid flex-1 grid-cols-4 gap-5 px-14">
        {weeks.map((w) => (
          <div key={w.n} className="flex flex-col gap-4 rounded-2xl bg-canvas p-5">
            <div className="flex items-baseline gap-2">
              <span className="text-[15px] font-bold text-muted">{t("deck.week")}</span>
              <span className="text-[56px] font-extrabold leading-none text-brand num">{w.n}</span>
            </div>
            <div className="h-2 rounded bg-line"><div className="h-full rounded bg-brand" style={{ width: `${w.n * 25}%` }} /></div>
            <div className="text-[21px] font-extrabold leading-tight text-navy">{t(w.key)}</div>
            <div className="flex flex-wrap gap-2">
              {w.mods.map((id) => <span key={id} className="inline-flex items-center gap-2 rounded-full bg-surface py-1 ps-1 pe-3 text-[15px] font-bold text-navy"><Tile m={mod(id)} size={34} />{t(mod(id).nameKey)}</span>)}
            </div>
            {w.extra && <div className="mt-auto text-[16px] font-bold text-muted">{t(w.extra)}</div>}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-4 px-14 pt-6 pb-14">
        {[["GraduationCap", "deck.after.train"], ["Rocket", "deck.after.golive"], ["ShieldCheck", "deck.after.warranty"]].map(([ic, k], j) => {
          const I = icon(ic);
          return (
            <div key={k} className="flex items-center gap-4">
              {j > 0 && <Icons.ChevronLeft size={28} className="text-line ltr:rotate-180" aria-hidden />}
              <span className="inline-flex items-center gap-3 rounded-2xl bg-navy px-5 py-3 text-[18px] font-extrabold text-white"><I size={26} aria-hidden />{t(k)}</span>
            </div>
          );
        })}
      </div>
    </Slide>,

    <Slide key="questions" n={next()} total={total}>
      <Title sub={t("deck.questions.sub")}>{t("deck.questions.title")}</Title>
      <div className="grid flex-1 grid-cols-4 grid-rows-3 gap-4 px-14 pb-16">
        {qIcons.map((ic, k) => {
          const I = icon(ic);
          return (
            <div key={k} className="flex items-center gap-4 rounded-2xl border border-line bg-canvas px-5">
              <span className="relative grid size-16 shrink-0 place-items-center rounded-2xl bg-brand text-white"><I size={32} aria-hidden />
                <span className="absolute -start-2 -top-2 grid size-7 place-items-center rounded-full bg-accent text-[13px] font-extrabold num">{k + 1}</span></span>
              <span className="text-[19px] font-extrabold leading-tight text-navy">{t(`deck.q.${k + 1}`)}</span>
            </div>
          );
        })}
      </div>
    </Slide>,

    <Slide key="next" dark n={next()} total={total}>
      <Title dark>{t("deck.next.title")}</Title>
      <div className="grid flex-1 grid-cols-4 gap-5 px-14 pb-16">
        {[["MousePointerClick", "deck.next.s1"], ["MessageSquareText", "deck.next.s2"], ["Languages", "deck.next.s3"], ["Rocket", "deck.next.s4"]].map(([ic, k], j) => {
          const I = icon(ic);
          return (
            <div key={k} className="flex flex-col justify-between rounded-3xl bg-white/10 p-6">
              <span className="text-[72px] font-extrabold leading-none text-accent num">{j + 1}</span>
              <I size={84} strokeWidth={1.5} aria-hidden />
              <span className="text-[24px] font-extrabold leading-snug">{t(k)}</span>
            </div>
          );
        })}
      </div>
    </Slide>,
  ];

  const go = useCallback((d: number) => setI((x) => Math.max(0, Math.min(total - 1, x + d))), [total]);
  useEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / 1280, (window.innerHeight - 56) / 720));
    fit(); window.addEventListener("resize", fit);
    const key = (e: KeyboardEvent) => {
      const rtl = document.dir === "rtl";
      if (["ArrowLeft", "PageDown", " "].includes(e.key)) go(rtl ? 1 : -1);
      if (["ArrowRight", "PageUp"].includes(e.key)) go(rtl ? -1 : 1);
    };
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
          <div style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: 1280, height: 720 }}>{slides[i]}</div>
        </div>
      </div>
    </div>
  );
}
