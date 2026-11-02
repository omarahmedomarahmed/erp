import { NextResponse } from "next/server";
import { personaById } from "@/content/personas";
import { COOKIE_USER } from "@/lib/session";

export async function POST(req: Request) {
  const form = await req.formData();
  const p = personaById(String(form.get("persona") ?? ""));
  if (!p) return NextResponse.redirect(new URL("/login", req.url), 303);
  const res = NextResponse.redirect(new URL("/", req.url), 303);
  res.cookies.set(COOKIE_USER, p.id, { httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: 60 * 60 * 24 * 30 });
  return res;
}
