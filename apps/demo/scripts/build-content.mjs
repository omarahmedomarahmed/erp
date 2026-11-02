// Builds content/settings.json (SettingDef[]) from docs/decisions/data/*.json.
// Usage: node scripts/build-content.mjs  (plain Node ESM, no dependencies)
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const appDir = join(here, "..");
const dataDir = join(appDir, "..", "..", "docs", "decisions", "data");
const outFile = join(appDir, "content", "settings.json");

// Decisions the company already made (decision id -> option key).
const ANSWERED = {
  "GOV-01": "C",
  "GOV-02": "A",
  "GOV-03": "A",
  "GOV-10": "A",
  "GOV-11": "A",
  "GOV-12": "A",
  "GOV-13": "B",
  "GOV-14": "C",
  "GOV-15": "A",
  "GOV-16": "A",
  "M03-01": "C",
};

const settings = [];
const seen = new Set();
const files = readdirSync(dataDir).filter((f) => f.endsWith(".json")).sort();

for (const file of files) {
  const group = JSON.parse(readFileSync(join(dataDir, file), "utf8"));
  for (const mod of group.modules ?? []) {
    for (const d of mod.decisions ?? []) {
      if (seen.has(d.id)) throw new Error(`Duplicate decision id ${d.id} in ${file}`);
      seen.add(d.id);
      const options = (d.options ?? []).map((o) => {
        const opt = { key: o.key, label: o.label_ar };
        if (o.consequence_ar) opt.consequence = o.consequence_ar;
        return opt;
      });
      const s = {
        id: d.id,
        module: mod.id,
        title: d.title_ar,
        question: d.question_ar,
        options,
        recommended: d.recommended,
        priority: d.priority,
      };
      const ans = ANSWERED[d.id];
      if (ans) {
        if (!options.some((o) => o.key === ans)) throw new Error(`Answer ${d.id}:${ans} is not an option`);
        s.answered = ans;
      }
      settings.push(s);
    }
  }
}

for (const id of Object.keys(ANSWERED)) {
  if (!seen.has(id)) throw new Error(`Answered decision ${id} not found in data`);
}

writeFileSync(outFile, JSON.stringify(settings, null, 2) + "\n", "utf8");

const counts = {};
for (const s of settings) counts[s.module] = (counts[s.module] ?? 0) + 1;
console.log(`Wrote ${settings.length} settings to ${outFile}`);
console.log(Object.entries(counts).map(([m, n]) => `${m}:${n}`).join(" "));
