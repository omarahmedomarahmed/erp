import { BASE_DICT } from "@/content/dict";
import { kvAll } from "@/lib/db";
import type { Dict } from "@/lib/types";

export interface DictRow {
  key: string;
  ar: string;
  en: string;
  cat?: string;
  baseAr: string;
  baseEn: string;
  checked: boolean;
  edited: boolean;
  updatedBy?: string;
  updatedAt?: string;
}

/** Base dictionary merged with the company's edits from the database. */
export async function loadDict(): Promise<{ dict: Dict; rows: DictRow[] }> {
  let overrides: Record<string, Record<string, unknown>> = {};
  try {
    overrides = Object.fromEntries((await kvAll("dict_override")).map((r) => [String(r.key), r]));
  } catch {
    overrides = {};
  }
  const dict: Dict = {};
  const rows: DictRow[] = [];
  for (const [key, base] of Object.entries(BASE_DICT)) {
    const o = overrides[key];
    const ar = (o?.ar as string) || base.ar;
    const en = (o?.en as string) || base.en;
    dict[key] = { ar, en, cat: base.cat };
    rows.push({
      key, ar, en, cat: base.cat, baseAr: base.ar, baseEn: base.en,
      checked: Boolean(o?.checked),
      edited: Boolean(o && ((o.ar && o.ar !== base.ar) || (o.en && o.en !== base.en))),
      updatedBy: o?.updated_by as string | undefined,
      updatedAt: o?.updated_at ? String(o.updated_at) : undefined,
    });
  }
  return { dict, rows };
}
