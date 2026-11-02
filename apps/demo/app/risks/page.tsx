import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { RisksView } from "@/components/RisksView";

export default async function RisksPage() {
  const { persona } = await getSession();
  if (!persona) redirect("/login");
  return <RisksView persona={persona} />;
}
