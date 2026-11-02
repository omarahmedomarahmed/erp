import { cookies } from "next/headers";
import { personaById } from "@/content/personas";
import type { Lang } from "@/lib/types";

export const COOKIE_ACCESS = "tt_access";
export const COOKIE_USER = "tt_user";
export const COOKIE_LANG = "tt_lang";

export const accessCode = () => process.env.ACCESS_CODE || "takaful";

export async function getSession() {
  const c = await cookies();
  const lang: Lang = c.get(COOKIE_LANG)?.value === "en" ? "en" : "ar";
  const persona = personaById(c.get(COOKIE_USER)?.value);
  return { lang, persona };
}
