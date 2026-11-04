import { NextResponse } from "next/server";

// Owner key for the visit log. Separate from the shared access code so the client never sees visitor IPs.
export async function POST(req: Request) {
  const form = await req.formData();
  const key = String(form.get("key") ?? "").trim();
  const ok = !!process.env.OWNER_CODE && key === process.env.OWNER_CODE;
  const res = NextResponse.redirect(new URL(ok ? "/admin/visits" : "/admin/visits?e=1", req.url), 303);
  if (ok) res.cookies.set("tt_owner", key, { httpOnly: true, sameSite: "strict", secure: true, path: "/", maxAge: 60 * 60 * 24 * 90 });
  return res;
}
