import { NextResponse } from "next/server";
import { kvAll, kvDelete, kvPut } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  return NextResponse.json(await kvAll("setting_value").catch(() => []));
}
export async function POST(req: Request) {
  const { persona } = await getSession();
  if (!persona) return NextResponse.json({ error: "no persona" }, { status: 401 });
  const { id, choice, reset } = (await req.json()) as { id: string; choice?: string; reset?: boolean };
  if (!/^[A-Z0-9]+-\d+$/.test(id)) return NextResponse.json({ error: "bad id" }, { status: 400 });
  if (reset) await kvDelete("setting_value", id, persona.id);
  else await kvPut("setting_value", id, { choice }, persona.id);
  return NextResponse.json({ ok: true });
}
