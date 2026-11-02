import { NextResponse } from "next/server";
import { kvAll, kvPut } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  return NextResponse.json(await kvAll("question_answer").catch(() => []));
}
export async function POST(req: Request) {
  const { persona } = await getSession();
  if (!persona) return NextResponse.json({ error: "no persona" }, { status: 401 });
  const { key, data } = (await req.json()) as { key: string; data: Record<string, unknown> };
  if (!/^[a-z0-9-]{2,60}$/.test(key)) return NextResponse.json({ error: "bad key" }, { status: 400 });
  const size = JSON.stringify(data ?? {}).length;
  if (size > 20000) return NextResponse.json({ error: "too large" }, { status: 413 });
  await kvPut("question_answer", key, data ?? {}, persona.id);
  return NextResponse.json({ ok: true });
}
