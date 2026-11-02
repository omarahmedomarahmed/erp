"use client";
import Link from "next/link";
import { ArrowLeft, Database, History, ShieldAlert, ShieldCheck, Users } from "lucide-react";
import { Shell } from "@/components/Shell";
import { useT } from "@/components/I18n";
import { Badge, GuardButton } from "@/components/ui";
import { MODULES } from "@/content/modules";
import type { Persona } from "@/lib/types";

const LAYERS = [
  { id: "db", Icon: Database },
  { id: "mc", Icon: Users },
  { id: "audit", Icon: History },
  { id: "ssb", Icon: ShieldCheck },
] as const;

export function RisksView({ persona }: { persona: Persona }) {
  const { t } = useT();
  const sensitive = MODULES.filter((m) => m.sensitive);
  return (
    <Shell persona={persona} current={t("pg.risks.title")}>
      <div className="mx-auto max-w-6xl p-4">
        <h1 className="text-[20px] font-extrabold text-navy">{t("pg.risks.title")}</h1>
        <p className="text-muted">{t("pg.risks.intro")}</p>

        <section className="mt-4 rounded-lg border border-line bg-surface p-4">
          <h2 className="text-[15px] font-extrabold text-navy">{t("rk.layers.title")}</h2>
          <p className="text-[13px] text-muted">{t("rk.layers.intro")}</p>
          <ol className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {LAYERS.map(({ id, Icon }, i) => (
              <li key={id} className="flex flex-col gap-1 rounded-lg border border-line bg-canvas p-3">
                <div className="flex items-center gap-2">
                  <span className="grid size-8 place-items-center rounded-full bg-navy text-white"><Icon size={16} aria-hidden /></span>
                  <span className="num text-[12px] text-muted">{i + 1}</span>
                </div>
                <h3 className="font-extrabold text-navy">{t(`rk.layer.${id}.title`)}</h3>
                <p className="text-[12px] text-muted">{t(`rk.layer.${id}.text`)}</p>
              </li>
            ))}
          </ol>
        </section>

        <div className="mt-4 flex items-center gap-2">
          <h2 className="text-[15px] font-extrabold text-navy">{t("rk.modules.title")}</h2>
          <Badge tone="danger">{sensitive.length}</Badge>
        </div>
        {!sensitive.length && <p className="mt-2 text-muted">{t("rk.modules.none")}</p>}
        <div className="mt-2 grid gap-3 lg:grid-cols-2">
          {sensitive.map((m) => {
            const s = m.sensitive!;
            return (
              <article key={m.id} className="flex min-w-0 flex-col gap-3 rounded-lg border border-line bg-surface p-4" style={{ borderInlineStartWidth: 4, borderInlineStartColor: m.color }}>
                <header className="flex flex-wrap items-center gap-2">
                  <h3 className="text-[16px] font-extrabold text-navy">{t(m.nameKey)}</h3>
                  <span className="text-[12px] text-muted">· {t(m.deptKey)}</span>
                  <Link href={`/m/${m.id}`} className="ms-auto inline-flex items-center gap-1 rounded-md border border-line px-2.5 py-1 text-[12px] font-bold text-brand-deep hover:border-brand">
                    {t("pg.risks.openModule")}<ArrowLeft size={13} className="ltr:rotate-180" aria-hidden />
                  </Link>
                </header>
                <div className="flex gap-2 rounded-md bg-danger-soft p-3 text-[13px] text-danger">
                  <ShieldAlert size={18} className="mt-0.5 shrink-0" aria-hidden />
                  <div><div className="text-[11px] font-bold">{t("pg.risks.col.risk")}</div>{t(s.riskKey)}</div>
                </div>
                <div>
                  <div className="mb-1 text-[12px] font-bold text-muted">{t("pg.risks.col.control")}</div>
                  <ul className="grid gap-1 text-[13px]">
                    {s.controlKeys.map((k) => (
                      <li key={k} className="flex items-start gap-2"><ShieldCheck size={14} className="mt-0.5 shrink-0 text-ok" aria-hidden />{t(k)}</li>
                    ))}
                  </ul>
                </div>
                <div className="mt-auto">
                  <div className="mb-1 text-[12px] font-bold text-muted">{t("pg.risks.col.try")}</div>
                  <div className="flex flex-wrap gap-2">
                    {s.guards.map((g) => <GuardButton key={g.id} tryLabel={t(g.tryKey)} blockedText={t(g.blockedKey)} />)}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </Shell>
  );
}
