"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { LayoutGrid, Languages, UserRound } from "lucide-react";
import { useT } from "@/components/I18n";
import type { Persona } from "@/lib/types";

/** Odoo-like top bar: logo, apps menu, current app name, language toggle, persona. */
export function Shell({ persona, current, children }: { persona: Persona; current?: ReactNode; children: ReactNode }) {
  const { t, lang } = useT();
  const router = useRouter();
  const post = async (url: string, body: unknown) => {
    await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    router.refresh();
  };
  return (
    <div className="min-h-screen">
      <div className="bg-accent px-4 py-0.5 text-center text-[11px] font-bold text-white">{t("app.demo")}</div>
      <header className="sticky top-0 z-40 flex items-center gap-3 bg-navy px-4 py-2 text-white shadow">
        <Link href="/" className="flex items-center gap-2" aria-label={t("app.home")}>
          <img src="/brand/logo.png" alt={t("app.company")} className="h-7 w-auto" />
        </Link>
        <Link href="/" className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[13px] hover:bg-white/10"><LayoutGrid size={16} aria-hidden />{t("app.apps")}</Link>
        {current && <span className="truncate text-[14px] font-bold text-white/90">/ {current}</span>}
        <div className="ms-auto flex items-center gap-2">
          <button type="button" onClick={() => post("/api/lang", { lang: lang === "ar" ? "en" : "ar" })}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-[12px] hover:bg-white/10"><Languages size={15} aria-hidden />{t("app.lang")}</button>
          <Link href="/login" className="flex items-center gap-2 rounded-md bg-white/10 px-2 py-1 text-[12px] hover:bg-white/20">
            <UserRound size={15} aria-hidden />
            <span className="font-bold">{t(persona.roleKey)}</span>
            <span className="hidden text-white/60 sm:inline">· {lang === "en" ? persona.nameEn : persona.nameAr}</span>
          </Link>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
