"use client";
import Link from "next/link";
import { Settings2, Info } from "lucide-react";
import { Shell } from "@/components/Shell";
import { SettingsPanel } from "@/components/SettingsPanel";
import { useT } from "@/components/I18n";
import { GuardButton } from "@/components/ui";
import { SCREENS } from "@/content/screens";
import type { ModuleMeta, Persona, SettingDef } from "@/lib/types";

export function ModuleView({ persona, meta, settings, screen, allowed }: {
  persona: Persona; meta: ModuleMeta; settings: SettingDef[]; screen: string; allowed: boolean;
}) {
  const { t } = useT();
  const current = meta.screens.find((s) => s.id === screen);
  const Screen = current ? SCREENS[meta.id]?.[current.id] : undefined;
  const tab = (id: string, label: string, active: boolean, icon?: React.ReactNode) => (
    <Link key={id} href={`/m/${meta.id}?s=${id}`} scroll={false}
      className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-[13px] font-bold whitespace-nowrap ${active ? "border-brand text-brand-deep" : "border-transparent text-muted hover:text-ink"}`}>
      {icon}{label}
    </Link>
  );
  return (
    <Shell persona={persona} current={t(meta.nameKey)}>
      {!allowed ? (
        <p className="m-6 rounded-lg bg-warn-soft p-4 text-warn">{t("app.noAccess")}</p>
      ) : (
        <>
          <div className="flex items-center gap-2 overflow-x-auto border-b border-line bg-surface px-3">
            {meta.screens.map((s) => tab(s.id, t(s.titleKey), s.id === screen))}
            {tab("settings", t("app.settings"), screen === "settings", <Settings2 size={14} aria-hidden />)}
            {meta.sensitive && (
              <div className="ms-auto flex shrink-0 gap-2 py-1.5">
                {meta.sensitive.guards.slice(0, 2).map((g) => <GuardButton key={g.id} tryLabel={t(g.tryKey)} blockedText={t(g.blockedKey)} />)}
              </div>
            )}
          </div>
          {current && (
            <div className="flex items-center gap-2 bg-soft px-4 py-1.5 text-[12px] text-brand-deep">
              <Info size={14} aria-hidden /><span>{t(current.captionKey)}</span>
            </div>
          )}
          <div className="min-h-[60vh]">
            {screen === "settings" ? <SettingsPanel settings={settings} /> : Screen ? <Screen /> : null}
          </div>
        </>
      )}
    </Shell>
  );
}
