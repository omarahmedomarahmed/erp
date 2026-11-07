// The most important questions for Takaful Insurance Company.
// Everything else is a default setting (see content/settings.json) the company can change later.

export type QuestionType = "choice" | "text" | "multi";

export interface QuestionOption {
  key: string;
  ar: string;
  en: string;
}

export interface Question {
  id: string;
  ar: string;
  en: string;
  hintAr: string;
  hintEn: string;
  type: QuestionType;
  options?: QuestionOption[];
}

export const QUESTIONS: Question[] = [
  {
    id: "q01-core-system",
    ar: "النظام الحالي: الاسم والإصدار وقاعدة البيانات وصلاحية الدخول",
    en: "Current system: name, version, database and access",
    hintAr: "الإصدار واسم المسؤول عن قاعدة البيانات، لازمان لسحب البيانات.",
    hintEn: "Version and database-access holder, needed for data extraction.",
    type: "choice",
    options: [
      { key: "arima_oracle", ar: "ARIMA على Oracle", en: "ARIMA on Oracle" },
      { key: "arima_other", ar: "ARIMA على قاعدة بيانات أخرى", en: "ARIMA on another database" },
      { key: "other", ar: "نظام آخر (الاسم في الملاحظات)", en: "Another system (name in the notes)" },
      { key: "excel", ar: "Excel وملفات يدوية", en: "Excel and manual files" },
    ],
  },
  {
    id: "q02-hosting",
    ar: "الخوادم الحالية: المكان وCPU وRAM والتخزين ونظام التشغيل وVirtualization والنسخ الاحتياطي وخط الإنترنت",
    en: "Current servers: location, CPU, RAM, storage, OS, virtualization, backups and internet link",
    hintAr: "تسليم المنصة Docker images في الحالتين: على خوادم الشركة أو في السحابة.",
    hintEn: "Delivery as Docker images either way: on company servers or in the cloud.",
    type: "text",
  },
  {
    id: "q03-data-migration",
    ar: "نقل البيانات: نوع البيانات وعدد سنوات التاريخ",
    en: "Data migration: data types and years of history",
    hintAr: "اختيار متعدد، وعدد السنوات في الملاحظات.",
    hintEn: "Multiple choice; number of years in the notes.",
    type: "multi",
    options: [
      { key: "policies", ar: "الوثائق السارية", en: "Active policies" },
      { key: "customers", ar: "العملاء", en: "Customers" },
      { key: "claims", ar: "المطالبات المفتوحة", en: "Open claims" },
      { key: "balances", ar: "الأرصدة الافتتاحية", en: "Opening balances" },
      { key: "history", ar: "التاريخ الكامل للسنوات السابقة", en: "Full history of past years" },
    ],
  },
  {
    id: "q04-wakala-mudaraba",
    ar: "نسبة الوكالة لكل فرع تأمين، وحصة المضارب من عائد الاستثمار",
    en: "Wakala % per line and Mudarib share of investment returns",
    hintAr: "القيم توضيحية حتى توقيع الشركة ورقة معايير الصندوق.",
    hintEn: "Values stay illustrative until the company signs the fund parameter sheet.",
    type: "choice",
    options: [
      { key: "provide", ar: "النسب الفعلية جاهزة للإرسال الآن", en: "Actual rates ready to send now" },
      { key: "defaults", ar: "القيم التوضيحية مقبولة مؤقتا", en: "Illustrative defaults accepted for now" },
    ],
  },
  {
    id: "q05-coa-fiscal",
    ar: "دليل الحسابات الحالي، وتاريخ بداية السنة المالية",
    en: "Current chart of accounts and fiscal-year start date",
    hintAr: "ملف Excel يكفي. النظام يربط كل حساب بالصندوق وفرع التأمين.",
    hintEn: "An Excel file is enough. The system maps each account to a fund and a line.",
    type: "text",
  },
  {
    id: "q06-products",
    ar: "المنتجات والمنتجات الفرعية الحالية، وجدول أسعار كل منتج",
    en: "Current products and sub-products, with the tariff for each",
    hintAr: "قرار الشركة إطلاق كل المنتجات الفرعية يتطلب القائمة كاملة.",
    hintEn: "The company's decision to launch every sub-product requires the full list.",
    type: "text",
  },
  {
    id: "q07-network",
    ar: "عدد الفروع والمنافذ الحدودية والوكلاء، وجودة الإنترنت في المنافذ",
    en: "Number of branches, border points and agents, and internet quality at border points",
    hintAr: "الأعداد، وحالة الإنترنت في كل منفذ: جيد، متقطع، أو معدوم.",
    hintEn: "Counts, and internet at each border point: good, unstable or none.",
    type: "text",
  },
  {
    id: "q08-payments",
    ar: "المصارف وقنوات الدفع المستخدمة حاليا",
    en: "Banks and payment channels in use today",
    hintAr: "اختيار متعدد، وأسماء المصارف في الملاحظات.",
    hintEn: "Multiple choice; bank names in the notes.",
    type: "multi",
    options: [
      { key: "cash", ar: "نقد في الفروع", en: "Cash at branches" },
      { key: "transfer", ar: "تحويل مصرفي", en: "Bank transfer" },
      { key: "cheque", ar: "صكوك", en: "Cheques" },
      { key: "moamalat", ar: "بطاقات Moamalat", en: "Moamalat cards" },
      { key: "lypay", ar: "LYPAY", en: "LYPAY" },
      { key: "other", ar: "قناة أخرى", en: "Another channel" },
    ],
  },
  {
    id: "q09-retakaful",
    ar: "اتفاقيات إعادة التكافل السارية: المعيد والنوع ومبلغ الاحتفاظ لكل اتفاقية",
    en: "Retakaful treaties in force: reinsurer, type and retention for each",
    hintAr: "مثل Quota Share أو Excess of Loss (XoL). نسخة من كل اتفاقية تكفي.",
    hintEn: "For example Quota Share or Excess of Loss (XoL). A copy of each treaty is enough.",
    type: "text",
  },
  {
    id: "q10-sharia-board",
    ar: "الهيئة الشرعية: الأعضاء وطريقة الاعتماد والحاجة إلى توقيع إلكتروني وختم",
    en: "Sharia board: members, approval method, and need for e-signature and stamp",
    hintAr: "هذه الإجابة أساس مسار الاعتماد وشهادات المطابقة.",
    hintEn: "The approval flow and compliance certificates follow this answer.",
    type: "text",
  },
  {
    id: "q11-staff",
    ar: "قائمة الموظفين حسب القسم والوظيفة، أساس المستخدمين والصلاحيات",
    en: "Staff list by department and job, the basis for users and roles",
    hintAr: "ملف Excel يكفي: الاسم، القسم، الوظيفة، الفرع، البريد.",
    hintEn: "An Excel file is enough: name, department, job, branch, e-mail.",
    type: "text",
  },
  {
    id: "q12-payroll",
    ar: "تأكيد نسب الضمان الاجتماعي والضريبة والدمغة والتضامن، وأداة الرواتب الحالية",
    en: "Confirmation of social security, tax, stamp and solidarity rates, and current HR/payroll tool",
    hintAr: "النظام يعد جدول النسب مسبقا، والمراجعة والتأكيد على محاسب الرواتب.",
    hintEn: "The system prepares the rate table; the payroll accountant reviews it for confirmation.",
    type: "choice",
    options: [
      { key: "confirm", ar: "النسب مؤكدة كما هي", en: "Rates confirmed as they are" },
      { key: "changes", ar: "توجد تعديلات (التفاصيل في الملاحظات)", en: "Changes needed (details in the notes)" },
      { key: "later", ar: "المحاسب يرد خلال أسبوع", en: "The accountant replies within a week" },
    ],
  },
];

export const MODULE_RANKING_INTRO = {
  ar: "ترتيب الوحدات حسب الأهمية للشركة. البناء يبدأ بالأعلى.",
  en: "Module ranking by importance to the company. Build starts at the top.",
};
