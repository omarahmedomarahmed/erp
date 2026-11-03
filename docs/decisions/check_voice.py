"""Flag Arabic that speaks as "we" or addresses the reader. Heuristic: review every hit.
Usage: python3 -I check_voice.py <file> [...]"""
import re
import sys

PATTERNS = [
    (r"\bنحن\b|\bلنا\b|\bلدينا\b|\bعندنا\b|\bمنا\b|نا\b(?=[\s\.،:؛\"]|$)", "first person"),
    (r"\b(ن(?:سجل|ربط|حفظ|حسب|قترح|بني|ستخدم|حتاج|ريد|سلم|عرض|نشئ|رسل|تحقق|منع|وفر|دعم|قوم|ضيف|صدر|حصل|سوي|سترد|وزع|كتتب|سعر|نقل|عمل|طبق|ضمن|تابع|بدأ|راجع|ستورد|غطي|ولد))", "first-person verb"),
    (r"كم\b", "you (pronoun كم)"),
    (r"\b(اختاروا|حددوا|حدّدوا|أرسلوا|ارسلوا|أجيبوا|اكتبوا|جربوا|جرّبوا|راجعوا|رتبوا|رتّبوا|افتحوا|اطلبوا|استخدموا|انسخوا)\b", "imperative to reader"),
    (r"\b(تريدون|تجاوبون|تقومون|تستطيعون|تحتاجون|تملكون|ترغبون|تفضلون|تعملون|تستخدمون)\b", "addressing reader"),
    (r"\bيتم\b|\bتم\b|\bسيتم\b", "impersonal يتم/تم"),
]
EN = [(r"\b(we|We|our|Our|us)\b", "EN first person"), (r"\b(you|You|your|Your)\b", "EN second person")]

hits = 0
for path in sys.argv[1:]:
    for n, line in enumerate(open(path, encoding="utf-8"), 1):
        for pat, why in PATTERNS + EN:
            m = re.search(pat, line)
            if m:
                hits += 1
                print(f"{path}:{n}: [{why}] …{line.strip()[max(0, m.start() - 40):m.end() + 40]}…")
                break
print(f"{hits} lines flagged")
