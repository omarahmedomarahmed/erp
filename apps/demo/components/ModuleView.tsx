"use client";
import Link from "next/link";
import { Settings2, Info } from "lucide-react";
import { Shell } from "@/components/Shell";
import { SettingsPanel } from "@/components/SettingsPanel";
import { useT } from "@/components/I18n";
import { RulesButton } from "@/components/ui";
import { AutomationPanel } from "@/components/Automation";
import { SCREENS } from "@/content/screens";
import type { ModuleMeta, Persona, SettingDef } from "@/lib/types";

export function ModuleView({ persona, meta, settings, screen, allowed }: {
  persona: Persona; meta: ModuleMeta; settings: SettingDef[]; screen: string; allowed: boolean;
}) {
  const { t } = useT();
  const current = meta.screens.find((s) => s.id === screen);
  const Screen = current ? SCREENS[meta.id]?.[current.id] : undefined;
  const tab = (id: string, label: string, active: boolean, lead: React.ReactNode) => (
    <Link key={id} href={`/m/${meta.id}?s=${id}`} scroll={false} aria-current={active ? "page" : undefined}
      className={`relative flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-[14px] font-extrabold whitespace-nowrap transition-all ${active
        ? "bg-brand text-white shadow-md shadow-brand/30 ring-2 ring-brand/20"
        : "bg-surface text-navy/70 ring-1 ring-line hover:bg-soft hover:text-brand-deep hover:ring-brand/40"}`}>
      <span className={`grid size-6 place-items-center rounded-full text-[12px] num ${active ? "bg-white text-brand" : "bg-soft text-brand-deep"}`}>{lead}</span>
      {label}
    </Link>
  );
  const rules = [...(meta.sensitive?.guards ?? []), ...(meta.rules ?? [])].map((g) => ({ id: g.id, what: t(g.tryKey), why: t(g.blockedKey) }));
  return (
    <Shell persona={persona} current={t(meta.nameKey)}>
      {!allowed ? (
        <p className="m-6 rounded-lg bg-warn-soft p-4 text-warn">{t("app.noAccess")}</p>
      ) : (
        <>
          <div className="flex items-center gap-2.5 overflow-x-auto border-b border-line bg-canvas px-4 py-3">
            {meta.screens.map((s, i) => tab(s.id, t(s.titleKey), s.id === screen, i + 1))}
            <span className="mx-1 h-7 w-px shrink-0 bg-line" aria-hidden />
            {tab("settings", t("app.settings"), screen === "settings", <Settings2 size={13} aria-hidden />)}
            <div className="ms-auto shrink-0 ps-3"><RulesButton rules={rules} moduleName={t(meta.nameKey)} /></div>
          </div>
          <AutomationPanel moduleId={meta.id} />
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
