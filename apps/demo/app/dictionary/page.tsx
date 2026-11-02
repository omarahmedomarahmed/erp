import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { DictionaryView } from "@/components/DictionaryView";

export default async function DictionaryPage() {
  const { persona } = await getSession();
  if (!persona) redirect("/login");
  return <DictionaryView persona={persona} />;
}
