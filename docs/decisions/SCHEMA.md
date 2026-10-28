# Decision workbook data format (Arabic, for the client)

One JSON file per module group in `docs/decisions/data/`. All client-facing text is Arabic (Modern Standard Arabic, formal, clear to insurance staff; Libyan context; no "WP", no English except unavoidable codes in `refs`).

```json
{
  "group": "G1",
  "modules": [
    {
      "id": "M06",
      "name_ar": "إصدار وتجديد الوثائق",
      "brief_ref_ar": "البند ٣.٢ من العرض الفني",
      "summary_ar": "ما الذي سيبنيه النظام في هذه الوحدة (فقرة قصيرة)",
      "rules_ar": ["قاعدة يطبقها النظام كما فهمناها …", "…"],
      "deferred_ar": ["ما لن يكون في الإطلاق الأول ولماذا …"],
      "decisions": [
        {
          "id": "M06-01",
          "title_ar": "عنوان قصير",
          "question_ar": "السؤال الموجّه للشركة",
          "context_ar": "لماذا يهم القرار، مع مثال بالدينار الليبي إن أمكن",
          "edge_cases_ar": ["حالة حدّية يجب أن يعرف النظام كيف يتصرف فيها"],
          "options": [
            {"key": "A", "label_ar": "الخيار", "consequence_ar": "أثره على النظام والعمل"}
          ],
          "recommended": "A",
          "recommended_reason_ar": "سبب التوصية",
          "owner_ar": ["المدير المالي", "هيئة الرقابة الشرعية"],
          "needed_by_day": 5,
          "priority": "حرج | مهم | عادي",
          "refs": ["README §6.2", "D00-01", "A-01"]
        }
      ]
    }
  ]
}
```

`needed_by_day` = the build day (1–30) by which the answer is needed. `priority`: حرج = blocks money logic or go-live; مهم = changes behaviour; عادي = has a safe default.
