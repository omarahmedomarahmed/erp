import { NextResponse } from "next/server";
import { BASE_DICT } from "@/content/dict";
import { kvDelete, kvPut } from "@/lib/db";
import { loadDict } from "@/lib/dict";
import { getSession } from "@/lib/session";

export async function GET() {
  return NextResponse.json((await loadDict()).rows);
}
export async function POST(req: Request) {
  const { persona } = await getSession();
  if (!persona) return NextResponse.json({ error: "no persona" }, { status: 401 });
  const body = (await req.json()) as { key: string; ar?: string; en?: string; checked?: boolean; reset?: boolean };
  if (!BASE_DICT[body.key]) return NextResponse.json({ error: "unknown key" }, { status: 400 });
  if (body.reset) await kvDelete("dict_override", body.key, persona.id);
  else await kvPut("dict_override", body.key, { ar: body.ar?.slice(0, 500), en: body.en?.slice(0, 500), checked: !!body.checked }, persona.id);
  return NextResponse.json({ ok: true });
}
