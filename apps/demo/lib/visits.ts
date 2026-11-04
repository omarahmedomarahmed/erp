import { neon } from "@neondatabase/serverless";

// Visit log: who entered the access code and which role they picked. Read only on /admin/visits (owner key).
const url = process.env.DATABASE_URL;
const sql = url ? neon(url) : null;
const mem: VisitRow[] = [];

export interface VisitRow { id?: number; at?: string; event: string; persona?: string | null; ip?: string | null; country?: string | null; region?: string | null; city?: string | null; ua?: string | null; path?: string | null }

export const VISIT_SCHEMA = `create table if not exists visit_log (id bigserial primary key, at timestamptz default now(), event text not null, persona text, ip text, country text, region text, city text, ua text, path text)`;

/** Reads the visitor details Vercel adds to every request. */
export function visitFrom(req: Request, event: string, persona?: string): VisitRow {
  const h = req.headers;
  const dec = (v: string | null) => { try { return v ? decodeURIComponent(v) : null; } catch { return v; } };
  return {
    event, persona: persona ?? null,
    ip: h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip"),
    country: h.get("x-vercel-ip-country"), region: dec(h.get("x-vercel-ip-country-region")), city: dec(h.get("x-vercel-ip-city")),
    ua: h.get("user-agent")?.slice(0, 400) ?? null, path: new URL(req.url).pathname,
  };
}

/** Never blocks or breaks the sign-in flow: a logging failure is swallowed. */
export async function logVisit(v: VisitRow) {
  try {
    if (!sql) { mem.unshift({ ...v, at: new Date().toISOString() }); return; }
    await sql.query(VISIT_SCHEMA);
    await sql.query(`insert into visit_log (event, persona, ip, country, region, city, ua, path) values ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [v.event, v.persona, v.ip, v.country, v.region, v.city, v.ua, v.path]);
  } catch { /* ignore */ }
}

export async function listVisits(limit = 500): Promise<VisitRow[]> {
  if (!sql) return mem.slice(0, limit);
  await sql.query(VISIT_SCHEMA);
  return (await sql.query(`select id, at, event, persona, ip, country, region, city, ua, path from visit_log order by id desc limit $1`, [limit])) as VisitRow[];
}
