import type { ModuleMeta } from "@/lib/types";

export const meta: ModuleMeta = {
  id: "m10",
  decisionIds: ["M10"],
  nameKey: "m10.name",
  taglineKey: "m10.tagline",
  deptKey: "dept.reinsurance",
  icon: "Share2",
  color: "#284dae",
  briefRef: "3.5",
  needs: [
    { ar: "نسخ اتفاقيات إعادة التكافل السارية والملاحق (الاحتفاظ، الحدود، الطبقات، العمولات)", en: "Current retakaful treaties and addenda (retention, limits, layers, commissions)" },
    { ar: "قائمة المعيدين مع التصنيفات وحالة التسجيل لدى هيئة الإشراف", en: "Counterparties with ratings and ISA registration status" },
    { ar: "نموذج الكشف الشهري و Bordereau المطلوب لكل معيد", en: "The monthly statement and bordereau format each counterparty expects" },
    { ar: "قرارات الهيئة الشرعية بشأن الإسناد لمعيد تقليدي", en: "Sharia board resolutions on cessions to conventional reinsurers" },
    { ar: "نسبة الإسناد الإلزامي المحلي (المادة 13)، إن وجدت", en: "Compulsory local cession quota, if any (Art. 13)" },
  ],
  rules: [
    { id: "m10-recovery", tryKey: "m10.guard.recovery.try", blockedKey: "m10.guard.recovery.blocked" },
    { id: "m10-shf", tryKey: "m10.guard.shf.try", blockedKey: "m10.guard.shf.blocked" },
  ],
  screens: [
    { id: "s1", titleKey: "m10.s1.title", captionKey: "m10.s1.caption" },
    { id: "s2", titleKey: "m10.s2.title", captionKey: "m10.s2.caption" },
    { id: "s3", titleKey: "m10.s3.title", captionKey: "m10.s3.caption" },
    { id: "s4", titleKey: "m10.s4.title", captionKey: "m10.s4.caption" },
  ],
};
