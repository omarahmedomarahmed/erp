"""Merge docs/decisions/data/*.json into the workbook template and validate the content."""
import glob
import json
import os
import sys

repo, template, out = sys.argv[1], sys.argv[2], sys.argv[3]
groups, problems, ids = [], [], set()
for path in sorted(glob.glob(os.path.join(repo, "docs/decisions/data/*.json"))):
    with open(path, encoding="utf-8") as fh:
        g = json.load(fh)
    groups.append(g)
    for m in g.get("modules", []):
        for key in ("id", "name_ar", "summary_ar", "rules_ar", "decisions"):
            if not m.get(key):
                problems.append(f"{os.path.basename(path)} {m.get('id')}: missing {key}")
        for d in m.get("decisions", []):
            if d.get("id") in ids:
                problems.append(f"duplicate decision id {d.get('id')}")
            ids.add(d.get("id"))
            for key in ("title_ar", "question_ar", "options", "recommended"):
                if not d.get(key):
                    problems.append(f"{d.get('id')}: missing {key}")
            keys = [o.get("key") for o in d.get("options", [])]
            if d.get("recommended") not in keys:
                problems.append(f"{d.get('id')}: recommended {d.get('recommended')} not in options {keys}")
            if d.get("priority") not in ("حرج", "مهم", "عادي"):
                problems.append(f"{d.get('id')}: priority {d.get('priority')!r}")

blob = json.dumps({"groups": groups}, ensure_ascii=False).replace("</", "<\\/")
for word in ("WP", "Wp", "wp"):
    if f'"{word}' in blob or f" {word} " in blob or f"{word}-" in blob:
        problems.append(f"found forbidden token {word}")
with open(template, encoding="utf-8") as fh:
    html = fh.read().replace("__DATA__", blob)
with open(out, "w", encoding="utf-8") as fh:
    fh.write(html)

mods = [m for g in groups for m in g.get("modules", [])]
print("modules:", len(mods), "decisions:", len(ids), "rules:", sum(len(m.get("rules_ar", [])) for m in mods))
print("bytes:", len(html.encode("utf-8")))
print("problems:", len(problems))
for p in problems[:40]:
    print(" -", p)
