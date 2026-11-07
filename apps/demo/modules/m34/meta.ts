import type { ModuleMeta } from "@/lib/types";

export const meta: ModuleMeta = {
  id: "m34",
  decisionIds: ["M34"],
  nameKey: "m34.name",
  taglineKey: "m34.tagline",
  deptKey: "dept.hr",
  icon: "Wallet",
  color: "#b26a00",
  briefRef: "",
  sensitive: {
    riskKey: "m34.risk",
    controlKeys: ["m34.control.makerChecker", "m34.control.encrypt", "m34.control.lock", "m34.control.shf"],
    guards: [
      { id: "approveOwn", tryKey: "m34.guard.approveOwn.try", blockedKey: "m34.guard.approveOwn.blocked" },
      { id: "ownSalary", tryKey: "m34.guard.ownSalary.try", blockedKey: "m34.guard.ownSalary.blocked" },
      { id: "m34-ptf", tryKey: "m34.guard.ptf.try", blockedKey: "m34.guard.ptf.blocked" },
    ],
  },
  needs: [
    { ar: "نسب الضمان الاجتماعي وشرائح ضريبة الدخل والدمغة والتضامن، يؤكدها محاسب الرواتب", en: "Social security, income tax bands, stamp and solidarity rates, confirmed by the payroll accountant" },
    { ar: "آخر 3 كشف رواتبات رواتب فعلية، لمطابقة حساب النظام حتى الدرهم", en: "The last 3 actual payroll runs, to match the system's calculation to the dirham" },
    { ar: "مكونات الراتب والبدلات وقواعد العمل الإضافي لكل درجة", en: "Pay components, allowances and overtime rules per grade" },
    { ar: "صيغة ملف التحويل لكل مصرف تتعامل معه الشركة", en: "The transfer file format of each bank the company uses" },
    { ar: "من يعد الكشف ومن يدققه ومن يعتمده", en: "Who prepares, checks and approves the payroll" },
  ],
  screens: [
    { id: "s1", titleKey: "m34.s1.title", captionKey: "m34.s1.caption" },
    { id: "s2", titleKey: "m34.s2.title", captionKey: "m34.s2.caption" },
    { id: "s3", titleKey: "m34.s3.title", captionKey: "m34.s3.caption" },
    { id: "s4", titleKey: "m34.s4.title", captionKey: "m34.s4.caption" },
  ],
};
