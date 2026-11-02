import { NextResponse } from "next/server";
import { accessCode, COOKIE_ACCESS } from "@/lib/session";

export async function POST(req: Request) {
  const form = await req.formData();
  const code = String(form.get("code") ?? "").trim();
  if (code !== accessCode()) return NextResponse.redirect(new URL("/gate?e=1", req.url), 303);
  const res = NextResponse.redirect(new URL("/login", req.url), 303);
  res.cookies.set(COOKIE_ACCESS, code, { httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: 60 * 60 * 24 * 30 });
  return res;
}
