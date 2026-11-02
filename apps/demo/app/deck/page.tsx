import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { Deck } from "@/components/Deck";

export default async function DeckPage() {
  const { persona } = await getSession();
  if (!persona) redirect("/login");
  return <Deck />;
}
