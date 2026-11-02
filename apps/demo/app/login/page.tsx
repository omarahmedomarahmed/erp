import { PERSONAS } from "@/content/personas";
import { loadDict } from "@/lib/dict";
import { getSession } from "@/lib/session";

// Anyone with the access code may act as any role, admin included.
export default async function Login() {
  const { lang } = await getSession();
  const { dict } = await loadDict();
  const t = (k: string) => dict[k]?.[lang] ?? k;
  return (
    <div className="min-h-screen bg-canvas">
      <div className="bg-accent px-4 py-0.5 text-center text-[11px] font-bold text-white">{t("app.demo")}</div>
      <div className="bg-navy px-4 py-5 text-white">
        <div className="mx-auto flex max-w-5xl items-center gap-4">
          <img src="/brand/logo.png" alt={t("app.company")} className="h-9 w-auto" />
          <div>
            <h1 className="text-[20px] font-extrabold">{t("pg.login.title")}</h1>
            <p className="text-[13px] text-white/80">{t("pg.login.intro")}</p>
          </div>
        </div>
      </div>
      <div className="mx-auto grid max-w-5xl gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
        {PERSONAS.map((p) => (
          <form key={p.id} action="/api/login" method="post">
            <input type="hidden" name="persona" value={p.id} />
            <button type="submit" className={`w-full rounded-lg border bg-surface p-4 text-start shadow-sm transition hover:border-brand hover:shadow ${p.isAdmin ? "border-brand" : "border-line"}`}>
              <div className="flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-soft font-extrabold text-brand-deep">{(lang === "en" ? p.nameEn : p.nameAr).replace("د. ", "").slice(0, 1)}</span>
                <div className="min-w-0">
                  <div className="truncate font-extrabold text-navy">{lang === "en" ? p.nameEn : p.nameAr}</div>
                  <div className="text-[12px] text-muted">{t(p.roleKey)} · {t(p.deptKey)}</div>
                </div>
              </div>
              <div className="mt-2 text-[11px] text-brand-deep">
                {p.modules === "*" ? t("pg.login.allModules") : `${t("pg.login.modules")}: ${p.modules.length}`}
                {p.isAdmin && <span className="ms-2 rounded bg-brand px-1.5 py-0.5 text-white">{t("pg.login.admin")}</span>}
              </div>
            </button>
          </form>
        ))}
      </div>
    </div>
  );
}
