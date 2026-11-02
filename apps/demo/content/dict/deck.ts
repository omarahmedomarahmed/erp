import type { Dict } from "@/lib/types";

// Text for the presentation deck (/deck). Short by design: one idea per slide.
export const dict: Dict = {
  "deck.cover.title": { ar: "منصة التكافل", en: "The Takaful Platform", cat: "label" },
  "deck.cover.sub": { ar: "نظام تأمين تكافلي متكامل لشركة التكافل للتأمين", en: "An integrated takaful system for Takaful Insurance Company", cat: "label" },
  "deck.cover.date": { ar: "عرض مبدئي · نوفمبر 2026", en: "Preview · November 2026", cat: "label" },

  "deck.map.title": { ar: "الوحدات الأربع عشرة في منصة واحدة", en: "Fourteen modules, one platform", cat: "label" },
  "deck.map.sub": { ar: "الوحدات الاثنتا عشرة في عرضكم الفني، ونضيف الموارد البشرية والرواتب.", en: "The twelve modules in your proposal, plus HR and payroll.", cat: "label" },

  "deck.journey.title": { ar: "رحلة مشترك واحد عبر كل الوحدات", en: "One participant's journey across every module", cat: "label" },
  "deck.journey.s1": { ar: "نسجل العميل ونتحقق من هويته", en: "We register the customer and verify identity", cat: "label" },
  "deck.journey.s2": { ar: "نكتتب ونسعّر فورياً", en: "We underwrite and price instantly", cat: "label" },
  "deck.journey.s3": { ar: "نصدر الوثيقة PDF موقعة مع QR", en: "We issue a signed PDF with QR", cat: "label" },
  "deck.journey.s4": { ar: "نحصّل الاشتراك ونقسمه بين الصندوقين", en: "We collect and split between the funds", cat: "label" },
  "deck.journey.s5": { ar: "نسوي المطالبة عبر 6 مراحل", en: "We settle the claim in 6 stages", cat: "label" },
  "deck.journey.s6": { ar: "نسترد حصة إعادة التكافل", en: "We recover the retakaful share", cat: "label" },
  "deck.journey.s7": { ar: "نوزع الفائض على المشتركين", en: "We distribute surplus to participants", cat: "label" },

  "deck.module.screens": { ar: "الشاشات الرئيسية", en: "Main screens", cat: "label" },
  "deck.module.sensitive": { ar: "وحدة حساسة", en: "Sensitive module", cat: "label" },

  "deck.sensitive.title": { ar: "الوحدات الحساسة وكيف نحميها", en: "Sensitive modules and how we protect them", cat: "label" },
  "deck.sensitive.sub": { ar: "قاعدة البيانات نفسها ترفض الخطأ، لا الشاشة فقط.", en: "The database itself refuses the mistake, not only the screen.", cat: "label" },

  "deck.hosting.title": { ar: "الاستضافة على خوادمكم أو في السحابة", en: "Hosting on your servers or in the cloud", cat: "label" },
  "deck.hosting.p1": { ar: "نسلّم المنصة Docker images: التطبيق، والمعالج الخلفي، وPostgreSQL.", en: "We ship Docker images: the app, the background worker and PostgreSQL.", cat: "label" },
  "deck.hosting.p2": { ar: "تعمل على خوادمكم داخل الشركة أو على AWS أو Azure دون تغيير.", en: "They run on your on-site servers, AWS or Azure without changes.", cat: "label" },
  "deck.hosting.p3": { ar: "ثلاث بيئات مستقلة: التطوير، والاختبار، والإنتاج.", en: "Three independent environments: development, test, production.", cat: "label" },
  "deck.hosting.p4": { ar: "نسخ احتياطي يومي واختبار استعادة دوري.", en: "Daily backups and regular restore tests.", cat: "label" },
  "deck.hosting.p5": { ar: "ننقل بياناتكم من النظام الحالي (Oracle) بعد مطابقتها.", en: "We migrate your data from the current system (Oracle) after reconciling it.", cat: "label" },

  "deck.timeline.title": { ar: "البناء في 30 يوماً", en: "Built in 30 days", cat: "label" },
  "deck.timeline.w1": { ar: "الأسبوع 1: الأساس، العملاء، المنتجات", en: "Week 1: foundation, customers, products", cat: "label" },
  "deck.timeline.w2": { ar: "الأسبوع 2: الاكتتاب، الوثائق، التحصيل، المحاسبة", en: "Week 2: underwriting, policies, billing, accounting", cat: "label" },
  "deck.timeline.w3": { ar: "الأسبوع 3: المطالبات، إعادة التكافل، الوكلاء، الشرعي، الاستثمار، الفائض", en: "Week 3: claims, retakaful, agents, Sharia, investments, surplus", cat: "label" },
  "deck.timeline.w4": { ar: "الأسبوع 4: التقارير، الموارد البشرية والرواتب، الاختبار وUAT", en: "Week 4: reports, HR & payroll, testing and UAT", cat: "label" },
  "deck.timeline.after": { ar: "بعدها: التدريب 5 أيام، ثم الإطلاق ومتابعة 15 يوماً، وضمان 6 أشهر.", en: "Then: 5-day training, go-live, 15-day follow-up and 6-month warranty.", cat: "label" },

  "deck.questions.title": { ar: "نحتاج منكم إجابات قليلة فقط", en: "We need only a few answers from you", cat: "label" },
  "deck.questions.sub": { ar: "قررنا الباقي كإعدادات افتراضية يمكنكم تغييرها لاحقاً.", en: "We set everything else as defaults you can change later.", cat: "label" },

  "deck.next.title": { ar: "الخطوات التالية", en: "Next steps", cat: "label" },
  "deck.next.s1": { ar: "جربوا العرض واختاروا أي دور.", en: "Try the demo and pick any role.", cat: "label" },
  "deck.next.s2": { ar: "أجيبوا عن الأسئلة ورتّبوا الوحدات.", en: "Answer the questions and rank the modules.", cat: "label" },
  "deck.next.s3": { ar: "راجعوا القاموس وعدّلوا أي مصطلح.", en: "Review the dictionary and change any term.", cat: "label" },
  "deck.next.s4": { ar: "نبدأ البناء فور وصول الإجابات.", en: "We start building as soon as the answers arrive.", cat: "label" },
};
