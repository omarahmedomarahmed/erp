import type { ModuleMeta } from "@/lib/types";

export const meta: ModuleMeta = {
  id: "m09",
  decisionIds: ["M09"],
  nameKey: "m09.name",
  taglineKey: "m09.tagline",
  deptKey: "dept.claims",
  icon: "ClipboardCheck",
  color: "#0f75db",
  briefRef: "3.4",
  sensitive: {
    riskKey: "m09.risk",
    controlKeys: ["m09.ctl.1", "m09.ctl.2", "m09.ctl.3", "m09.ctl.4"],
    guards: [
      { id: "m09-skip-stage", tryKey: "m09.guard.skip.try", blockedKey: "m09.guard.skip.blocked" },
      { id: "m09-own-approval", tryKey: "m09.guard.own.try", blockedKey: "m09.guard.own.blocked" },
      { id: "m09-shf", tryKey: "m09.guard.shf.try", blockedKey: "m09.guard.shf.blocked" },
    ],
  },
  needs: [
    { ar: "قائمة المستندات المطلوبة لكل منتج ولكل نوع مطالبة", en: "Required documents per product and claim type" },
    { ar: "حدود صلاحيات اعتماد التعويض لكل وظيفة (مصفوفة الاعتماد)", en: "Claim approval limits per role (approval matrix)" },
    { ar: "تقويم العطل الرسمية وقواعد التصعيد في اليوم 3 و4", en: "Public-holiday calendar and day-3/day-4 escalation rules" },
    { ar: "قائمة المعاينين المعتمدين وأتعابهم", en: "Approved surveyors and their fees" },
    { ar: "نماذج المطالبات الحالية وعينة من ملفات مصروفة", en: "Current claim forms and a sample of paid files" },
  ],
  screens: [
    { id: "s1", titleKey: "m09.s1.title", captionKey: "m09.s1.caption" },
    { id: "s2", titleKey: "m09.s2.title", captionKey: "m09.s2.caption" },
    { id: "s3", titleKey: "m09.s3.title", captionKey: "m09.s3.caption" },
    { id: "s4", titleKey: "m09.s4.title", captionKey: "m09.s4.caption" },
  ],
};
