import { NextResponse } from "next/server";
import { changeLog, kvAll, kvDelete, kvPut } from "@/lib/db";
import { getSession } from "@/lib/session";

// Demo-data CRUD for the admin page: edits are stored as overrides keyed "<entity>:<id>".
export async function GET(req: Request) {
  const what = new URL(req.url).searchParams.get("what");
  if (what === "log") return NextResponse.json(await changeLog().catch(() => []));
  return NextResponse.json(await kvAll("record_override").catch(() => []));
}
export async function POST(req: Request) {
  const { persona } = await getSession();
  if (!persona?.isAdmin) return NextResponse.json({ error: "admin only" }, { status: 403 });
  const { key, data, remove } = (await req.json()) as { key: string; data?: Record<string, unknown>; remove?: boolean };
  if (!/^[a-z_]+:[A-Za-z0-9_-]+$/.test(key)) return NextResponse.json({ error: "bad key" }, { status: 400 });
  if (remove) await kvDelete("record_override", key, persona.id);
  else await kvPut("record_override", key, data ?? {}, persona.id);
  return NextResponse.json({ ok: true });
}
