import { notFound, redirect } from "next/navigation";
import settingsJson from "@/content/settings.json";
import { moduleById } from "@/content/modules";
import { canOpen } from "@/content/personas";
import { ModuleView } from "@/components/ModuleView";
import { getSession } from "@/lib/session";
import type { SettingDef } from "@/lib/types";

export default async function ModulePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ s?: string }> }) {
  const { id } = await params;
  const { s } = await searchParams;
  const meta = moduleById(id);
  if (!meta) notFound();
  const { persona } = await getSession();
  if (!persona) redirect("/login");
  const settings = (settingsJson as SettingDef[]).filter((x) => meta.decisionIds.includes(x.module));
  return <ModuleView persona={persona} meta={meta} settings={settings} screen={s ?? meta.screens[0].id} allowed={canOpen(persona, meta.id)} />;
}
