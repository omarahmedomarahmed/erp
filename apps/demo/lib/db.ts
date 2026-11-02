import { neon } from "@neondatabase/serverless";

// Demo persistence. Uses Neon when DATABASE_URL is set; otherwise an in-memory store
// so the demo still runs locally (changes are then lost on restart).

type Row = Record<string, unknown>;
const url = process.env.DATABASE_URL;
const sql = url ? neon(url) : null;

const mem: Record<string, Map<string, Row>> = {};
const table = (name: string) => (mem[name] ??= new Map());

export const hasDb = () => Boolean(sql);

/** Key-value tables: dict_override, setting_value, question_answer, record_override */
export async function kvAll(name: string): Promise<Row[]> {
  if (!sql) return [...table(name).values()];
  const rows = await sql.query(`select key, data, updated_by, updated_at from ${ident(name)}`);
  return rows.map((r: Row) => ({ ...(r.data as Row), key: r.key, updated_by: r.updated_by, updated_at: r.updated_at }));
}

export async function kvPut(name: string, key: string, data: Row, by: string): Promise<void> {
  if (!sql) {
    table(name).set(key, { ...data, key, updated_by: by, updated_at: new Date().toISOString() });
    return;
  }
  await sql.query(
    `insert into ${ident(name)} (key, data, updated_by, updated_at) values ($1, $2, $3, now())
     on conflict (key) do update set data = excluded.data, updated_by = excluded.updated_by, updated_at = now()`,
    [key, JSON.stringify(data), by],
  );
  await sql.query(`insert into change_log (tbl, key, data, actor) values ($1, $2, $3, $4)`, [name, key, JSON.stringify(data), by]);
}

export async function kvDelete(name: string, key: string, by: string): Promise<void> {
  if (!sql) {
    table(name).delete(key);
    return;
  }
  await sql.query(`delete from ${ident(name)} where key = $1`, [key]);
  await sql.query(`insert into change_log (tbl, key, data, actor) values ($1, $2, $3, $4)`, [name, key, JSON.stringify({ deleted: true }), by]);
}

export async function changeLog(limit = 200): Promise<Row[]> {
  if (!sql) return [];
  return sql.query(`select id, tbl, key, data, actor, at from change_log order by id desc limit $1`, [limit]);
}

const TABLES = new Set(["dict_override", "setting_value", "question_answer", "record_override"]);
function ident(name: string) {
  if (!TABLES.has(name)) throw new Error(`unknown table ${name}`);
  return name;
}

export const SCHEMA_SQL = `
create table if not exists dict_override   (key text primary key, data jsonb not null, updated_by text, updated_at timestamptz default now());
create table if not exists setting_value   (key text primary key, data jsonb not null, updated_by text, updated_at timestamptz default now());
create table if not exists question_answer (key text primary key, data jsonb not null, updated_by text, updated_at timestamptz default now());
create table if not exists record_override (key text primary key, data jsonb not null, updated_by text, updated_at timestamptz default now());
create table if not exists change_log (id bigserial primary key, tbl text not null, key text not null, data jsonb, actor text, at timestamptz default now());
`;
