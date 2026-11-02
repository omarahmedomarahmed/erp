import { NextResponse } from "next/server";
import { COOKIE_LANG } from "@/lib/session";

export async function POST(req: Request) {
  const { lang } = (await req.json().catch(() => ({}))) as { lang?: string };
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_LANG, lang === "en" ? "en" : "ar", { sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 365 });
  return res;
}
