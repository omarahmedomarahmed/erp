import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { QuestionsView } from "@/components/QuestionsView";

export default async function QuestionsPage() {
  const { persona } = await getSession();
  if (!persona) redirect("/login");
  return <QuestionsView persona={persona} />;
}
