import { loadDict } from "@/lib/dict";
import { getSession } from "@/lib/session";

export default async function Gate({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  const { lang } = await getSession();
  const { dict } = await loadDict(false);
  const t = (k: string) => dict[k]?.[lang] ?? k;
  const { e } = await searchParams;
  return (
    <div className="grid min-h-screen place-items-center bg-navy p-4">
      <form action="/api/gate" method="post" className="w-full max-w-sm rounded-xl bg-surface p-6 shadow-xl">
        <img src="/brand/logo-navy.png" alt={t("app.company")} className="mx-auto mb-4 h-10 w-auto" />
        <h1 className="text-center text-[18px] font-extrabold text-navy">{t("pg.gate.title")}</h1>
        <p className="mb-4 text-center text-[13px] text-muted">{t("pg.gate.subtitle")}</p>
        <label htmlFor="code" className="text-[12px] font-bold text-muted">{t("pg.gate.codeLabel")}</label>
        <input id="code" name="code" type="password" autoComplete="off" required placeholder={t("pg.gate.codePlaceholder")}
          className="mt-1 w-full rounded-md border border-line bg-canvas px-3 py-2 outline-none focus:border-brand" />
        {e && <p className="mt-2 text-[12px] text-danger">{t("pg.gate.wrongCode")}</p>}
        <button type="submit" className="mt-4 w-full rounded-md bg-brand py-2 font-bold text-white hover:bg-brand-deep">{t("pg.gate.submit")}</button>
        <p className="mt-3 text-center text-[11px] text-muted">{t("pg.gate.help")}</p>
        <p className="mt-3 border-t border-line pt-3 text-center text-[10px] leading-relaxed text-muted">{t("app.disclaimer")}</p>
      </form>
    </div>
  );
}
