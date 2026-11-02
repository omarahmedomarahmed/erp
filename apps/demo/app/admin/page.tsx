import { redirect } from "next/navigation";
import settingsJson from "@/content/settings.json";
import { getSession } from "@/lib/session";
import { AdminView } from "@/components/AdminView";
import type { SettingDef } from "@/lib/types";

export default async function AdminPage() {
  const { persona } = await getSession();
  if (!persona) redirect("/login");
  if (!persona.isAdmin) redirect("/");
  return <AdminView persona={persona} settings={settingsJson as SettingDef[]} />;
}
