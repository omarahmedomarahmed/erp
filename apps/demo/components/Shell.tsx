"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { LayoutGrid, Languages, UserRound } from "lucide-react";
import { useT } from "@/components/I18n";
import type { Persona } from "@/lib/types";
import { Name } from "@/components/ui";
import { AutoToggle } from "@/components/Automation";

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
      <div className="bg-accent px-4 py-1 text-center text-[12px] font-bold text-white">{t("app.demo")}</div>
      <header className="sticky top-0 z-40 flex h-[72px] items-center gap-4 border-b-4 border-accent bg-navy px-5 text-white shadow-lg">
        <Link href="/" className="flex items-center gap-2" aria-label={t("app.home")}>
          <img src="/brand/logo.png" alt={t("app.company")} className="h-12 w-auto" />
        </Link>
        <span className="h-9 w-px bg-white/20" aria-hidden />
        <Link href="/" className="flex items-center gap-2 rounded-lg px-3 py-2 text-[15px] font-bold hover:bg-white/10"><LayoutGrid size={19} aria-hidden />{t("app.apps")}</Link>
        {current && <span className="truncate text-[17px] font-extrabold text-white"><span className="text-white/40">/ </span>{current}</span>}
        <div className="ms-auto flex items-center gap-2">
          <AutoToggle />
          <button type="button" onClick={() => post("/api/lang", { lang: lang === "ar" ? "en" : "ar" })}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[14px] font-bold hover:bg-white/10"><Languages size={18} aria-hidden />{t("app.lang")}</button>
          <Link href="/login" className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-[14px] hover:bg-white/20">
            <UserRound size={18} aria-hidden />
            <span className="font-bold">{t(persona.roleKey)}</span>
            <span className="hidden text-white/60 sm:inline">· <Name masked={lang === "en" ? persona.nameEn : persona.nameAr} /></span>
          </Link>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
