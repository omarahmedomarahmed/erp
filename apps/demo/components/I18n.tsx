"use client";
import { createContext, useContext, type ReactNode } from "react";
import type { Dict, Lang } from "@/lib/types";

const Ctx = createContext<{ lang: Lang; dict: Dict }>({ lang: "ar", dict: {} });

export function I18nProvider({ lang, dict, children }: { lang: Lang; dict: Dict; children: ReactNode }) {
  return <Ctx.Provider value={{ lang, dict }}>{children}</Ctx.Provider>;
}

/** t("m09.board.title") → text in the current language; `{name}` placeholders filled from vars.
 *  A missing key shows the key itself so gaps are visible in review. */
export function useT() {
  const { lang, dict } = useContext(Ctx);
  const t = (key: string, vars?: Record<string, string | number>) => {
    const e = dict[key];
    let s = e ? e[lang] || e.ar : key;
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
    return s;
  };
  /** Pick between inline Arabic/English values (for seed data such as names). */
  const pick = (ar: string, en?: string) => (lang === "en" && en ? en : ar);
  return { t, lang, pick };
}
