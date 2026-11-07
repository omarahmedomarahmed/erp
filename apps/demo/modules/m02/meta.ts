import type { ModuleMeta } from "@/lib/types";

export const meta: ModuleMeta = {
  id: "m02",
  decisionIds: ["M02"],
  nameKey: "m02.name",
  taglineKey: "m02.tagline",
  deptKey: "dept.underwriting",
  icon: "Users",
  color: "#0f75db",
  briefRef: "3.1",
  sensitive: {
    riskKey: "m02.risk",
    controlKeys: ["m02.control.1", "m02.control.2", "m02.control.3", "m02.control.4"],
    guards: [
      { id: "m02-dup-create", tryKey: "m02.guard.dup.try", blockedKey: "m02.guard.dup.blocked" },
      { id: "m02-merge-self", tryKey: "m02.guard.merge.try", blockedKey: "m02.guard.merge.blocked" },
    ],
  },
  needs: [
    { ar: "عينة مموهة من ملف العملاء الحالي لقياس التكرار وتخطيط الترحيل", en: "Anonymised sample of the current customer file, for duplicate measurement and migration planning" },
    { ar: "البيانات والوثائق الإلزامية لكل مستوى KYC ولكل منتج", en: "Mandatory data and documents for each KYC level and product" },
    { ar: "جهة اعتماد دمج السجلات المكررة، وحدود تنبيه الاحتيال لمسؤول الامتثال", en: "Approver for duplicate merges, and fraud-alert thresholds for compliance" },
    { ar: "حالة الاتفاق أو API مع السجل المدني للتحقق من الرقم الوطني", en: "Status of any agreement or API with the Civil Registry for national-number checks" },
    { ar: "نص موافقة العميل على معالجة بياناته وفق القانون 6/2022", en: "Customer consent wording for data processing under Law 6/2022" },
  ],
  screens: [
    { id: "s1", titleKey: "m02.s1.title", captionKey: "m02.s1.caption" },
    { id: "s2", titleKey: "m02.s2.title", captionKey: "m02.s2.caption" },
    { id: "s3", titleKey: "m02.s3.title", captionKey: "m02.s3.caption" },
    { id: "s4", titleKey: "m02.s4.title", captionKey: "m02.s4.caption" },
  ],
};
