import type { ModuleMeta } from "@/lib/types";

export const meta: ModuleMeta = {
  id: "m04",
  decisionIds: ["M04"],
  nameKey: "m04.name",
  taglineKey: "m04.tagline",
  deptKey: "dept.sales",
  icon: "Handshake",
  color: "#b26a00",
  briefRef: "3.7",
  needs: [
    { ar: "قائمة الوكلاء والوسطاء ونقاط البيع مع أرقام التراخيص وتواريخ الانتهاء", en: "Agents, brokers and outlets with licence numbers and expiry dates" },
    { ar: "جدول العمولات الحالي لكل منتج وشريحة، والنسبة المنظمة للإجباري", en: "Current commission table per product and tier, and the regulated compulsory rate" },
    { ar: "مؤشرات KPI المرتبطة بالعمولة وقيمة كل مضاعف", en: "KPIs linked to commission and each multiplier value" },
    { ar: "أهداف كل وكيل للفترة القادمة وجهة الاعتماد", en: "Each agent's targets for the next period and who approves them" },
    { ar: "عينة كشوف عمولة مصروفة وسياسة الاسترداد عند الإلغاء", en: "Sample paid commission statements and the clawback policy on cancellation" },
  ],
  rules: [
    { id: "m04-ptf", tryKey: "m04.guard.ptf.try", blockedKey: "m04.guard.ptf.blocked" },
    { id: "m04-uncollected", tryKey: "m04.guard.uncollected.try", blockedKey: "m04.guard.uncollected.blocked" },
  ],
  screens: [
    { id: "s1", titleKey: "m04.s1.title", captionKey: "m04.s1.caption" },
    { id: "s2", titleKey: "m04.s2.title", captionKey: "m04.s2.caption" },
    { id: "s3", titleKey: "m04.s3.title", captionKey: "m04.s3.caption" },
    { id: "s4", titleKey: "m04.s4.title", captionKey: "m04.s4.caption" },
  ],
};
