import * as Icons from "lucide-react";
import { MODULES } from "@/content/modules";
import { PERSONAS } from "@/content/personas";
import { loadDict } from "@/lib/dict";
import { getSession } from "@/lib/session";

type IconCmp = React.ComponentType<{ size?: number; "aria-hidden"?: boolean }>;
const icon = (n: string): IconCmp => ((Icons as unknown as Record<string, IconCmp>)[n] ?? Icons.LayoutGrid);

// Anyone with the access code may act as any role, admin included.
// The job title leads; names are fictitious and shortened on purpose.
export default async function Login() {
  const { lang } = await getSession();
  const { dict } = await loadDict();
  const t = (k: string) => dict[k]?.[lang] ?? k;
  return (
    <div className="min-h-screen bg-canvas">
      <div className="bg-accent px-4 py-0.5 text-center text-[11px] font-bold text-white">{t("app.demoShort")}</div>
      <div className="bg-navy px-4 py-5 text-white">
        <div className="mx-auto flex max-w-6xl items-center gap-4">
          <img src="/brand/logo.png" alt={t("app.company")} className="h-9 w-auto" />
          <div>
            <h1 className="text-[20px] font-extrabold">{t("pg.login.title")}</h1>
            <p className="text-[13px] text-white/80">{t("pg.login.intro")}</p>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-6xl p-4">
        <p className="mb-4 flex items-start gap-2 rounded-lg border border-accent/40 bg-surface px-3 py-2 text-[12px] text-muted">
          <Icons.Info size={16} className="mt-0.5 shrink-0 text-accent" aria-hidden />{t("app.disclaimer")}
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PERSONAS.map((p) => {
            const mods = p.modules === "*" ? MODULES : MODULES.filter((m) => (p.modules as string[]).includes(m.id));
            return (
              <form key={p.id} action="/api/login" method="post" className="flex">
                <input type="hidden" name="persona" value={p.id} />
                <button type="submit" className={`flex w-full flex-col gap-3 rounded-xl border bg-surface p-4 text-start shadow-sm transition hover:border-brand hover:shadow-md ${p.isAdmin ? "border-brand ring-1 ring-brand" : "border-line"}`}>
                  <div className="flex items-start gap-3">
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-navy text-white"><Icons.BadgeCheck size={22} aria-hidden /></span>
                    <div className="min-w-0">
                      <div className="text-[19px] font-extrabold leading-tight text-navy">{t(p.roleKey)}</div>
                      <span className="mt-1 inline-block rounded-md bg-soft px-2 py-0.5 text-[12px] font-bold text-brand-deep">{t(p.deptKey)}</span>
                    </div>
                    {p.isAdmin && <span className="ms-auto shrink-0 rounded bg-brand px-1.5 py-0.5 text-[11px] font-bold text-white">{t("pg.login.admin")}</span>}
                  </div>
                  <div>
                    <div className="mb-1.5 text-[11px] font-bold text-muted">
                      {p.modules === "*" ? t("pg.login.allModules") : `${t("pg.login.modules")} (${mods.length})`}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {mods.map((m) => {
                        const I = icon(m.icon);
                        return (
                          <span key={m.id} className="inline-flex items-center gap-1 rounded-full border border-line bg-canvas px-2 py-0.5 text-[11px] text-ink">
                            <span className="grid size-4 place-items-center rounded-full text-white" style={{ background: m.color }}><I size={10} aria-hidden /></span>
                            {t(m.nameKey)}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <div className="mt-auto border-t border-line pt-2 text-[11px] text-muted">{lang === "en" ? p.nameEn : p.nameAr}</div>
                </button>
              </form>
            );
          })}
        </div>
      </div>
    </div>
  );
}
