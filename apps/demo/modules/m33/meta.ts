import type { ModuleMeta } from "@/lib/types";

export const meta: ModuleMeta = {
  id: "m33",
  decisionIds: ["M33"],
  nameKey: "m33.name",
  taglineKey: "m33.tagline",
  deptKey: "dept.hr",
  icon: "Users",
  color: "#0f8b8d",
  briefRef: "",
  needs: [
    { ar: "الهيكل التنظيمي الحالي: الإدارات والوظائف والدرجات ومراكز التكلفة", en: "Current org structure: departments, positions, grades and cost centres" },
    { ar: "لائحة شؤون الموظفين: أنواع الإجازات وأرصدتها وقواعد الترحيل", en: "Staff regulations: leave types, entitlements and carry-over rules" },
    { ar: "نماذج العقود وقائمة الوثائق المطلوبة لكل موظف مع مدة صلاحيتها", en: "Contract templates and the required documents per employee with validity" },
    { ar: "بيانات الموظفين الحالية في Excel، مع أرقام الحسابات المصرفية", en: "Current staff data in Excel, including bank account numbers" },
    { ar: "من يعتمد الإجازات والتعيينات في كل إدارة", en: "Who approves leave and hiring in each department" },
  ],
  rules: [
    { id: "m33-ownRecord", tryKey: "m33.guard.ownRecord.try", blockedKey: "m33.guard.ownRecord.blocked" },
    { id: "m33-leave", tryKey: "m33.guard.leave.try", blockedKey: "m33.guard.leave.blocked" },
  ],
  screens: [
    { id: "s1", titleKey: "m33.s1.title", captionKey: "m33.s1.caption" },
    { id: "s2", titleKey: "m33.s2.title", captionKey: "m33.s2.caption" },
    { id: "s3", titleKey: "m33.s3.title", captionKey: "m33.s3.caption" },
    { id: "s4", titleKey: "m33.s4.title", captionKey: "m33.s4.caption" },
  ],
};
