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
    ar: "ما نظامكم الأساسي الحالي؟ ما إصداره وقاعدة بياناته؟ ومن يملك صلاحية الدخول إلى قاعدة البيانات؟",
    en: "What is your current core system and version, which database, and who holds database access?",
    hintAr: "اذكروا الإصدار واسم المسؤول عن قاعدة البيانات. نحتاجه لسحب البيانات.",
    hintEn: "Give the version and the person who holds database access. We need it to extract data.",
    type: "choice",
    options: [
      { key: "arima_oracle", ar: "ARIMA على Oracle", en: "ARIMA on Oracle" },
      { key: "arima_other", ar: "ARIMA على قاعدة بيانات أخرى", en: "ARIMA on another database" },
      { key: "other", ar: "نظام آخر (اذكروه في الملاحظات)", en: "Another system (name it in the notes)" },
      { key: "excel", ar: "Excel وملفات يدوية", en: "Excel and manual files" },
    ],
  },
  {
    id: "q02-hosting",
    ar: "أين تعمل خوادمكم اليوم؟ صفوا CPU وRAM والتخزين ونظام التشغيل وVirtualization والنسخ الاحتياطي وخط الإنترنت.",
    en: "Where do your servers run today? Describe CPU, RAM, storage, OS, virtualization, backups and internet link.",
    hintAr: "نسلّم المنصة Docker images في الحالتين: على خوادمكم أو في السحابة.",
    hintEn: "We deliver Docker images either way: on your servers or in the cloud.",
    type: "text",
  },
  {
    id: "q03-data-migration",
    ar: "ما البيانات التي ننقلها إلى المنصة؟ وكم سنة من التاريخ تريدون؟",
    en: "Which data should we bring over, and how many years of history?",
    hintAr: "اختاروا كل ما ينطبق، واكتبوا عدد السنوات في الملاحظات.",
    hintEn: "Pick all that apply and write the number of years in the notes.",
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
    ar: "ما نسبة الوكالة لكل فرع تأمين؟ وما حصة المضارب من عائد الاستثمار؟",
    en: "What is the Wakala % per line, and the Mudarib share of investment returns?",
    hintAr: "نعمل بقيم توضيحية حتى توقّعوا ورقة معايير الصندوق.",
    hintEn: "We use illustrative values until you sign the fund parameter sheet.",
    type: "choice",
    options: [
      { key: "provide", ar: "نرسل النسب الآن", en: "We will send the rates now" },
      { key: "defaults", ar: "نقبل القيم التوضيحية مؤقتا", en: "Accept the illustrative defaults for now" },
    ],
  },
  {
    id: "q05-coa-fiscal",
    ar: "أرسلوا دليل الحسابات الحالي. متى تبدأ سنتكم المالية؟",
    en: "Please send your current chart of accounts. When does your fiscal year start?",
    hintAr: "ملف Excel يكفي. نربط كل حساب بالصندوق وفرع التأمين.",
    hintEn: "An Excel file is enough. We map each account to a fund and a line.",
    type: "text",
  },
  {
    id: "q06-products",
    ar: "ما المنتجات والمنتجات الفرعية التي تبيعونها اليوم؟ أرسلوا جداول الأسعار لكل منها.",
    en: "Which products and sub-products do you sell today? Please send the tariff for each.",
    hintAr: "قررتم إطلاق كل المنتجات الفرعية، لذلك نحتاج القائمة كاملة.",
    hintEn: "You chose to launch every sub-product, so we need the full list.",
    type: "text",
  },
  {
    id: "q07-network",
    ar: "كم فرعا ومنفذا حدوديا ووكيلا لديكم؟ وكيف جودة الإنترنت في المنافذ؟",
    en: "How many branches, border points and agents do you have? How good is internet at border points?",
    hintAr: "اذكروا الأعداد، وصفوا الإنترنت في كل منفذ: جيد، متقطع، أو معدوم.",
    hintEn: "Give the counts and rate internet at each border point: good, unstable or none.",
    type: "text",
  },
  {
    id: "q08-payments",
    ar: "ما المصارف وقنوات الدفع التي تستخدمونها اليوم؟",
    en: "Which banks and payment channels do you use today?",
    hintAr: "اختاروا كل ما ينطبق، واكتبوا أسماء المصارف في الملاحظات.",
    hintEn: "Pick all that apply and name the banks in the notes.",
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
    ar: "ما اتفاقيات إعادة التكافل السارية؟ اذكروا المعيد والنوع ومبلغ الاحتفاظ لكل اتفاقية.",
    en: "Which retakaful treaties are in force? Give reinsurer, type and retention for each.",
    hintAr: "مثل Quota Share أو Excess of Loss (XoL). نسخة من كل اتفاقية تكفي.",
    hintEn: "For example Quota Share or Excess of Loss (XoL). A copy of each treaty is enough.",
    type: "text",
  },
  {
    id: "q10-sharia-board",
    ar: "من أعضاء الهيئة الشرعية؟ كيف تعتمد الهيئة القرارات؟ وهل تريدون توقيعا إلكترونيا وختما؟",
    en: "Who sits on the Sharia board, how does it approve, and do you want e-signature and stamp?",
    hintAr: "نبني مسار الاعتماد وشهادات المطابقة على إجابتكم.",
    hintEn: "We build the approval flow and compliance certificates on your answer.",
    type: "text",
  },
  {
    id: "q11-staff",
    ar: "أرسلوا قائمة الموظفين حسب القسم والوظيفة. نبني منها المستخدمين والصلاحيات.",
    en: "Please send the staff list by department and job. We build users and roles from it.",
    hintAr: "ملف Excel يكفي: الاسم، القسم، الوظيفة، الفرع، البريد.",
    hintEn: "An Excel file is enough: name, department, job, branch, e-mail.",
    type: "text",
  },
  {
    id: "q12-payroll",
    ar: "هل تؤكدون نسب الضمان الاجتماعي والضريبة والدمغة والتضامن؟ وما أداة الرواتب الحالية؟",
    en: "Do you confirm the social security, tax, stamp and solidarity rates? Which HR/payroll tool do you use?",
    hintAr: "محاسب الرواتب يراجع جدول النسب. نحن نعدّه مسبقا للتأكيد.",
    hintEn: "Your payroll accountant reviews the rate table. We prepare it for confirmation.",
    type: "choice",
    options: [
      { key: "confirm", ar: "نؤكد النسب كما هي", en: "We confirm the rates as they are" },
      { key: "changes", ar: "لدينا تعديلات (اكتبوها في الملاحظات)", en: "We have changes (write them in the notes)" },
      { key: "later", ar: "المحاسب يرد خلال أسبوع", en: "Our accountant will reply within a week" },
    ],
  },
];

export const MODULE_RANKING_INTRO = {
  ar: "رتّبوا الوحدات حسب أهميتها لكم. نبدأ بما يأتي أولا.",
  en: "Rank the modules by how much they matter to you. We start with the top ones.",
};
