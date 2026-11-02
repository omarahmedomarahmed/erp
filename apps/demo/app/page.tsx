import Link from "next/link";
import { redirect } from "next/navigation";
import * as Icons from "lucide-react";
import { MODULES } from "@/content/modules";
import { canOpen } from "@/content/personas";
import { HomeShell } from "@/components/HomeShell";
import { loadDict } from "@/lib/dict";
import { getSession } from "@/lib/session";

type IconCmp = React.ComponentType<{ size?: number; "aria-hidden"?: boolean }>;
const icon = (name: string): IconCmp => ((Icons as unknown as Record<string, IconCmp>)[name] ?? Icons.LayoutGrid);

export default async function Home() {
  const { lang, persona } = await getSession();
  if (!persona) redirect("/login");
  const { dict } = await loadDict();
  const t = (k: string) => dict[k]?.[lang] ?? k;
  const mine = MODULES.filter((m) => canOpen(persona, m.id));
  const platform = [
    { href: "/questions", key: "pg.home.links.questions", icon: "MessageSquareText", color: "#ff5722" },
    { href: "/dictionary", key: "pg.home.links.dictionary", icon: "Languages", color: "#284dae" },
    { href: "/risks", key: "pg.home.links.risks", icon: "ShieldCheck", color: "#c62828" },
    { href: "/deck", key: "pg.home.links.deck", icon: "Presentation", color: "#152b56" },
    ...(persona.isAdmin ? [{ href: "/admin", key: "pg.home.links.admin", icon: "Settings2", color: "#0f75db" }] : []),
  ];
  return (
    <HomeShell persona={persona}>
      <div className="mx-auto max-w-6xl p-4 sm:p-6">
        <h1 className="text-[20px] font-extrabold text-navy">{t("pg.home.title")}</h1>
        <p className="mb-5 text-muted">{t("pg.home.intro")}</p>
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
          {mine.map((m) => {
            const I = icon(m.icon);
            return (
              <Link key={m.id} href={`/m/${m.id}`} className="group flex flex-col items-center gap-2 rounded-xl p-3 text-center hover:bg-surface">
                <span className="relative grid size-16 place-items-center rounded-2xl text-white shadow-md transition group-hover:scale-105" style={{ background: m.color }}>
                  <I size={30} aria-hidden />
                  {m.sensitive && <span className="absolute -top-1 -end-1 size-3 rounded-full border-2 border-canvas bg-accent" title={t("pg.home.sensitive")} />}
                </span>
                <span className="text-[13px] font-bold leading-tight text-ink">{t(m.nameKey)}</span>
              </Link>
            );
          })}
        </div>
        <h2 className="mt-8 mb-3 text-[14px] font-extrabold text-muted">{t("app.platform")}</h2>
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
          {platform.map((p) => {
            const I = icon(p.icon);
            return (
              <Link key={p.href} href={p.href} className="group flex flex-col items-center gap-2 rounded-xl p-3 text-center hover:bg-surface">
                <span className="grid size-16 place-items-center rounded-2xl text-white shadow-md transition group-hover:scale-105" style={{ background: p.color }}><I size={30} aria-hidden /></span>
                <span className="text-[13px] font-bold leading-tight text-ink">{t(p.key)}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </HomeShell>
  );
}
