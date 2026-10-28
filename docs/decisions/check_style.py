"""Check a decision data file against STYLE.md limits and banned forms. Usage: python3 -I check_style.py <file.json> [<original.json>]"""
import json
import re
import sys

BANNED = [r"\bيتم\b", r"\bتم\b", r"\bسيتم\b", r"حد[ّ]?ية", r"WP", r"\bيُ\S", r"\bتُ\S", r"\bأُ\S", r"\bسيُ\S"]
LIMITS = {"title_ar": 6, "question_ar": 20, "context_ar": 22, "recommended_reason_ar": 15, "summary_ar": 20}


def words(s):
    return len(re.findall(r"\S+", s or ""))


path = sys.argv[1]
data = json.load(open(path, encoding="utf-8"))
orig = json.load(open(sys.argv[2], encoding="utf-8")) if len(sys.argv) > 2 else None
issues = []


def scan(where, text):
    for pat in BANNED:
        if re.search(pat, text or ""):
            issues.append(f"{where}: banned pattern {pat!r}: {text[:60]}")


omap = {}
if orig:
    for m in orig["modules"]:
        for d in m["decisions"]:
            omap[d["id"]] = d
for m in data["modules"]:
    mid = m["id"]
    scan(mid + " summary", m.get("summary_ar", ""))
    if words(m.get("summary_ar")) > LIMITS["summary_ar"]:
        issues.append(f"{mid}: summary too long ({words(m['summary_ar'])})")
    if len(m.get("rules_ar", [])) > 10:
        issues.append(f"{mid}: {len(m['rules_ar'])} rules (max 10)")
    for r in m.get("rules_ar", []):
        scan(mid + " rule", r)
        if words(r) > 12:
            issues.append(f"{mid}: rule too long ({words(r)}): {r[:50]}")
    if len(m.get("deferred_ar", [])) > 4:
        issues.append(f"{mid}: too many deferred items")
    for r in m.get("deferred_ar", []):
        scan(mid + " deferred", r)
        if words(r) > 10:
            issues.append(f"{mid}: deferred item too long: {r[:50]}")
    for d in m["decisions"]:
        did = d["id"]
        for k, lim in LIMITS.items():
            if k in d:
                scan(f"{did}.{k}", d[k])
                if words(d[k]) > lim:
                    issues.append(f"{did}.{k}: {words(d[k])} words (max {lim})")
        if len(d.get("edge_cases_ar", [])) > 3:
            issues.append(f"{did}: more than 3 edge cases")
        for e in d.get("edge_cases_ar", []):
            scan(did + ".edge", e)
            if words(e) > 9:
                issues.append(f"{did}.edge too long: {e[:50]}")
        for o in d["options"]:
            scan(f"{did}.{o['key']}", o.get("label_ar", "") + " " + o.get("consequence_ar", ""))
            if words(o.get("label_ar")) > 9:
                issues.append(f"{did}.{o['key']} label {words(o['label_ar'])} words")
            if words(o.get("consequence_ar")) > 12:
                issues.append(f"{did}.{o['key']} consequence {words(o['consequence_ar'])} words")
        if did in omap:
            od = omap[did]
            for k in ("recommended", "owner_ar", "needed_by_day", "priority"):
                if od.get(k) != d.get(k):
                    issues.append(f"{did}: {k} changed")
            if [o["key"] for o in od["options"]] != [o["key"] for o in d["options"]]:
                issues.append(f"{did}: option keys changed")
if orig:
    missing = set(omap) - {d["id"] for m in data["modules"] for d in m["decisions"]}
    if missing:
        issues.append(f"missing decisions: {sorted(missing)}")
print(f"{len(issues)} issues")
for i in issues[:80]:
    print(" -", i)
