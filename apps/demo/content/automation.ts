// Pre-made "Automation" (smart assistant by Atmet) answers for the demo. No live AI: every fact cites a record in the demo data.
type L = { ar: string; en: string };
export interface AutoSource { label: string; href: string }
export interface AutoFinding { text: L; sources: AutoSource[] }
export interface AutoPrompt { id: string; title: L; ask: L; options: L[]; summary: L; findings: AutoFinding[]; action: L; sensitive: boolean }

const who: L[] = [{ ar: "للدور الحالي", en: "For the current role" }, { ar: "للمدير العام", en: "For the general manager" }];
const askWho: L = { ar: "لمن يُعدّ الملخص؟", en: "Who is the summary for?" };

export const AUTOMATION: Record<string, AutoPrompt[]> = {
  m02: [
    {
      id: "m02-a", title: { ar: "ملخص ملف العميل CUS-1002", en: "Summary of customer CUS-1002" }, ask: askWho, options: who, sensitive: true,
      summary: { ar: "ملف CUS-1002 فيه تنبيه تكرار مفتوح يحتاج قراراً قبل أي إصدار جديد.", en: "CUS-1002 has an open duplicate alert that needs a decision before any new issue." },
      findings: [
        { text: { ar: "مرشح تكرار بنسبة 94% مع CUS-1031: الرقم الوطني نفسه واسم متقارب", en: "94% duplicate candidate with CUS-1031: same national number, similar name" }, sources: [{ label: "DUP-001", href: "/m/m02?s=s3" }, { label: "CUS-1031", href: "/m/m02?s=s1" }] },
        { text: { ar: "شهادتان مسجلتان على العميل", en: "Two certificates on file" }, sources: [{ label: "CUS-1002", href: "/m/m02?s=s1" }, { label: "الشهادات / Certificates", href: "/m/m06?s=s1" }] },
        { text: { ar: "مستوى KYC قياسي ولا تنبيه PEP", en: "Standard KYC level, no PEP flag" }, sources: [{ label: "KYC", href: "/m/m02?s=s4" }] },
      ],
      action: { ar: "إحالة طلب الدمج DUP-001 إلى موظف ثانٍ للاعتماد", en: "Route merge request DUP-001 to a second employee for approval" },
    },
    {
      id: "m02-b", title: { ar: "العملاء الذين تحتاج وثائق هويتهم تحديثاً", en: "Customers whose ID documents need renewal" }, ask: askWho, options: who, sensitive: false,
      summary: { ar: "3 عملاء بوثائق هوية منتهية، وعميل واحد بتنبيه PEP.", en: "3 customers have expired ID documents; 1 customer carries a PEP flag." },
      findings: [
        { text: { ar: "وثيقة هوية منتهية", en: "Expired ID document" }, sources: [{ label: "CUS-1004", href: "/m/m02?s=s1" }, { label: "CUS-1009", href: "/m/m02?s=s1" }, { label: "CUS-1012", href: "/m/m02?s=s1" }] },
        { text: { ar: "تنبيه PEP بمستوى KYC معزّز", en: "PEP flag with enhanced KYC" }, sources: [{ label: "CUS-1005", href: "/m/m02?s=s4" }] },
      ],
      action: { ar: "إرسال رسالة SMS تذكير بتحديث الهوية لـ3 عملاء", en: "Send an SMS reminder to update ID to 3 customers" },
    },
  ],
  m06: [
    {
      id: "m06-a", title: { ar: "فحص ما قبل إصدار شهادة للعميل CUS-1001", en: "Pre-issue check for customer CUS-1001" }, ask: askWho, options: who, sensitive: false,
      summary: { ar: "لا مانع من الإصدار: لا تكرار، والهوية سارية، ومستوى KYC قياسي.", en: "Clear to issue: no duplicate, valid ID, standard KYC." },
      findings: [
        { text: { ar: "لا يوجد مرشح تكرار على الرقم الوطني 119900001001", en: "No duplicate candidate on national number 119900001001" }, sources: [{ label: "CUS-1001", href: "/m/m02?s=s1" }, { label: "التكرار / Duplicates", href: "/m/m02?s=s3" }] },
        { text: { ar: "شهادتان سابقتان على العميل", en: "Two earlier certificates for this customer" }, sources: [{ label: "الشهادات / Certificates", href: "/m/m06?s=s1" }] },
      ],
      action: { ar: "تجهيز مسودة الشهادة لمراجعة الموظف قبل الإصدار", en: "Prepare a draft certificate for the employee to review before issue" },
    },
    {
      id: "m06-b", title: { ar: "هل يمكن إصدار شهادة جديدة للعميل CUS-1002؟", en: "Can a new certificate be issued to CUS-1002?" }, ask: askWho, options: who, sensitive: true,
      summary: { ar: "الإصدار ينتظر قرار الدمج DUP-001، لأن الرقم الوطني مسجل لعميلين.", en: "Issue waits for merge decision DUP-001: the national number is on two customers." },
      findings: [
        { text: { ar: "تنبيه تكرار مفتوح بنسبة 94% مع CUS-1031", en: "Open 94% duplicate alert with CUS-1031" }, sources: [{ label: "DUP-001", href: "/m/m02?s=s3" }] },
        { text: { ar: "شهادتان قائمتان على CUS-1002", en: "Two existing certificates on CUS-1002" }, sources: [{ label: "الشهادات / Certificates", href: "/m/m06?s=s1" }] },
      ],
      action: { ar: "إحالة DUP-001 إلى مسؤول العملاء للبت قبل الإصدار", en: "Send DUP-001 to the customer officer for a decision before issue" },
    },
  ],
  m09: [
    {
      id: "m09-a", title: { ar: "ملخص المطالبة CLM-2026-00052", en: "Summary of claim CLM-2026-00052" }, ask: askWho, options: who, sensitive: true,
      summary: { ar: "أكبر مطالبة مفتوحة: التقدير 96,000 د.ل يتجاوز الاحتياطي الأولي بـ6.7%.", en: "Largest open claim: assessment LYD 96,000 is 6.7% above the initial reserve." },
      findings: [
        { text: { ar: "تاريخ الحادث ⁦2026-04-18⁩، والاحتياطي الأولي 90,000 د.ل", en: "Loss date 2026-04-18, initial reserve LYD 90,000" }, sources: [{ label: "CLM-2026-00052", href: "/m/m09?s=s1" }] },
        { text: { ar: "تقرير المعاين SV-04 وصل في ⁦2026-07-12⁩: التقدير 96,000 د.ل، والتحمل 1,000 د.ل", en: "Surveyor SV-04 report received 2026-07-12: assessed LYD 96,000, deductible LYD 1,000" }, sources: [{ label: "SV-04", href: "/m/m09?s=s4" }] },
        { text: { ar: "المبلغ فوق حد الاحتفاظ: حصة إعادة التكافل قابلة للاسترداد", en: "Amount above retention: retakaful share is recoverable" }, sources: [{ label: "إعادة التكافل / Retakaful", href: "/m/m10?s=s1" }] },
      ],
      action: { ar: "إحالة المطالبة إلى صاحب الصلاحية التالي في مصفوفة الاعتماد", en: "Route the claim to the next approver in the matrix" },
    },
    {
      id: "m09-b", title: { ar: "مقارنة الاحتياطي بالتقدير", en: "Reserve vs assessment" }, ask: askWho, options: who, sensitive: true,
      summary: { ar: "مطالبتان فوق الاحتياطي ومطالبة تحته، والفرق الأكبر 22.7%.", en: "Two claims above reserve, one below; the largest gap is 22.7%." },
      findings: [
        { text: { ar: "CLM-2026-00073: الاحتياطي 15,000 والتقدير 18,400 د.ل (+22.7%)", en: "CLM-2026-00073: reserve 15,000, assessed LYD 18,400 (+22.7%)" }, sources: [{ label: "CLM-2026-00073", href: "/m/m09?s=s1" }] },
        { text: { ar: "CLM-2026-00052: الاحتياطي 90,000 والتقدير 96,000 د.ل (+6.7%)", en: "CLM-2026-00052: reserve 90,000, assessed LYD 96,000 (+6.7%)" }, sources: [{ label: "CLM-2026-00052", href: "/m/m09?s=s1" }] },
        { text: { ar: "CLM-2026-00061: الاحتياطي 8,000 والتقدير 7,320 د.ل (−8.5%)", en: "CLM-2026-00061: reserve 8,000, assessed LYD 7,320 (−8.5%)" }, sources: [{ label: "CLM-2026-00061", href: "/m/m09?s=s1" }] },
      ],
      action: { ar: "تحديث احتياطي CLM-2026-00073 إلى 18,400 د.ل", en: "Update the CLM-2026-00073 reserve to LYD 18,400" },
    },
  ],
};
