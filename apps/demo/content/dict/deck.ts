import type { Dict } from "@/lib/types";

// Text for the presentation deck (/deck). Short by design: one idea per slide.
// Voice: the system or a feature is the subject, or a noun phrase. Never "we", never addressing the reader.
export const dict: Dict = {
  "deck.cover.title": { ar: "منصة التكافل", en: "The Takaful Platform", cat: "label" },
  "deck.cover.sub": { ar: "نظام تأمين تكافلي متكامل لشركة التكافل للتأمين", en: "An integrated takaful system for Takaful Insurance Company", cat: "label" },
  "deck.cover.date": { ar: "عرض مبدئي · نوفمبر 2026", en: "Preview · November 2026", cat: "label" },

  "deck.map.title": { ar: "أربع عشرة وحدة في منصة واحدة", en: "Fourteen modules, one platform", cat: "label" },
  "deck.map.sub": { ar: "الوحدات الاثنتا عشرة الواردة في العرض الفني، مع الموارد البشرية والرواتب.", en: "The twelve modules of the technical proposal, plus HR and payroll.", cat: "label" },

  "deck.journey.title": { ar: "رحلة المشترك عبر المنصة", en: "The participant's journey through the platform", cat: "label" },
  "deck.journey.s1": { ar: "تسجيل العميل والتحقق من هويته", en: "Customer registration and identity check", cat: "label" },
  "deck.journey.s2": { ar: "اكتتاب وتسعير فوري بالقواعد", en: "Instant rule-based underwriting and pricing", cat: "label" },
  "deck.journey.s3": { ar: "إصدار وثيقة PDF موقعة مع QR", en: "Signed PDF policy with QR code", cat: "label" },
  "deck.journey.s4": { ar: "تحصيل الاشتراك وتقسيمه بين الصندوقين", en: "Contribution collected and split between the funds", cat: "label" },
  "deck.journey.s5": { ar: "تسوية المطالبة عبر 6 مراحل", en: "Claim settled in 6 stages", cat: "label" },
  "deck.journey.s6": { ar: "استرداد حصة إعادة التكافل آلياً", en: "Automatic retakaful recovery", cat: "label" },
  "deck.journey.s7": { ar: "توزيع الفائض على المشتركين", en: "Surplus distributed to participants", cat: "label" },

  "deck.module.screens": { ar: "الشاشات الرئيسية", en: "Main screens", cat: "label" },
  "deck.module.sensitive": { ar: "وحدة حساسة", en: "Sensitive module", cat: "label" },

  "deck.sensitive.title": { ar: "حماية الوحدات الحساسة", en: "Protecting the sensitive modules", cat: "label" },
  "deck.sensitive.sub": { ar: "قاعدة البيانات نفسها ترفض الخطأ، لا الشاشة فقط.", en: "The database itself refuses the mistake, not only the screen.", cat: "label" },

  "deck.hosting.title": { ar: "الاستضافة على خوادم الشركة أو في السحابة", en: "Hosting on company servers or in the cloud", cat: "label" },

  "deck.timeline.title": { ar: "التنفيذ في 3 أشهر", en: "Delivery in 3 months", cat: "label" },
  "deck.timeline.sub": { ar: "شهران للبناء، وشهر للتشغيل ونقل البيانات والتدريب.", en: "Two months of building, one month of rollout, data migration and training.", cat: "label" },
  "deck.month": { ar: "الشهر", en: "Month", cat: "label" },
  "deck.phase.build": { ar: "البناء", en: "Build", cat: "label" },
  "deck.phase.run": { ar: "التشغيل والتطبيق", en: "Rollout", cat: "label" },
  "deck.m1.title": { ar: "الأساس والعمليات الأمامية", en: "Foundation & front office", cat: "label" },
  "deck.m1.extra": { ar: "المستخدمون والصلاحيات والقاموس والمنتجات", en: "Users, access, dictionary, products", cat: "label" },
  "deck.m2.title": { ar: "المطالبات والمال والتقارير", en: "Claims, money & reports", cat: "label" },
  "deck.m2.extra": { ar: "اختبار شامل لكل الوحدات", en: "Full testing of every module", cat: "label" },
  "deck.m3.title": { ar: "التشغيل الفعلي", en: "Going live", cat: "label" },
  "deck.m3.migrate": { ar: "نقل البيانات من Oracle ومطابقتها", en: "Data migration from Oracle and reconciliation", cat: "label" },
  "deck.m3.uat": { ar: "اختبار القبول UAT", en: "User acceptance testing (UAT)", cat: "label" },
  "deck.m3.train": { ar: "تدريب 5 أيام وأدلة الاستخدام", en: "5-day training and user manuals", cat: "label" },
  "deck.m3.golive": { ar: "الإطلاق والتشغيل التجريبي", en: "Go-live and parallel run", cat: "label" },
  "deck.after.followup": { ar: "متابعة 15 يوماً بعد الإطلاق", en: "15-day follow-up after go-live", cat: "label" },
  "deck.after.warranty": { ar: "ضمان 6 أشهر", en: "6-month warranty", cat: "label" },

  "deck.questions.title": { ar: "معلومات أساسية قبل البناء", en: "Key information before building", cat: "label" },
  "deck.questions.sub": { ar: "بقية القرارات إعدادات افتراضية قابلة للتعديل لاحقاً.", en: "All other decisions are default settings, changeable later.", cat: "label" },

  "deck.next.title": { ar: "الخطوات التالية", en: "Next steps", cat: "label" },
  "deck.next.s1": { ar: "تجربة العرض بأي دور", en: "Demo walkthrough with any role", cat: "label" },
  "deck.next.s2": { ar: "الإجابة عن الأسئلة الأساسية وترتيب الوحدات", en: "Key questions answered and modules ranked", cat: "label" },
  "deck.next.s3": { ar: "مراجعة المصطلحات في القاموس", en: "Terminology review in the dictionary", cat: "label" },
  "deck.next.s4": { ar: "انطلاق البناء فور اكتمال المعلومات", en: "Build starts once the information is complete", cat: "label" },

  "deck.host.docker": { ar: "حزمة Docker واحدة", en: "One Docker package", cat: "label" },
  "deck.host.app": { ar: "التطبيق", en: "Application", cat: "label" },
  "deck.host.worker": { ar: "المعالج الخلفي", en: "Background worker", cat: "label" },
  "deck.host.db": { ar: "قاعدة البيانات", en: "Database", cat: "label" },
  "deck.host.onsite": { ar: "خوادم الشركة الداخلية", en: "Company on-site servers", cat: "label" },
  "deck.host.cloud": { ar: "أو السحابة", en: "or the cloud", cat: "label" },
  "deck.host.envs": { ar: "ثلاث بيئات مستقلة", en: "Three independent environments", cat: "label" },
  "deck.host.dev": { ar: "التطوير", en: "Development", cat: "label" },
  "deck.host.test": { ar: "الاختبار", en: "Test", cat: "label" },
  "deck.host.prod": { ar: "الإنتاج", en: "Production", cat: "label" },
  "deck.host.backup": { ar: "نسخ احتياطي يومي", en: "Daily backups", cat: "label" },
  "deck.host.migrate": { ar: "نقل البيانات من Oracle", en: "Data migration from Oracle", cat: "label" },

  "deck.q.1": { ar: "النظام الحالي", en: "Current system", cat: "label" },
  "deck.q.2": { ar: "الخوادم", en: "Servers", cat: "label" },
  "deck.q.3": { ar: "البيانات المنقولة", en: "Data to move", cat: "label" },
  "deck.q.4": { ar: "نسب الوكالة والمضاربة", en: "Wakala & Mudaraba", cat: "label" },
  "deck.q.5": { ar: "دليل الحسابات", en: "Chart of accounts", cat: "label" },
  "deck.q.6": { ar: "المنتجات والتسعير", en: "Products & tariffs", cat: "label" },
  "deck.q.7": { ar: "الفروع والمنافذ", en: "Branches & border points", cat: "label" },
  "deck.q.8": { ar: "البنوك والدفع", en: "Banks & payments", cat: "label" },
  "deck.q.9": { ar: "إعادة التكافل", en: "Retakaful", cat: "label" },
  "deck.q.10": { ar: "الهيئة الشرعية", en: "Sharia board", cat: "label" },
  "deck.q.11": { ar: "الموظفون والأقسام", en: "Staff & departments", cat: "label" },
  "deck.q.12": { ar: "الرواتب", en: "Payroll", cat: "label" },
};
