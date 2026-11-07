import type { ModuleMeta } from "@/lib/types";

export const meta: ModuleMeta = {
  id: "m12",
  decisionIds: ["M08", "M12", "RES"],
  nameKey: "m12.name",
  taglineKey: "m12.tagline",
  deptKey: "dept.finance",
  icon: "Landmark",
  color: "#152b56",
  briefRef: "3.8",
  sensitive: {
    riskKey: "m12.risk",
    controlKeys: ["m12.ctl.fundLine", "m12.ctl.balance", "m12.ctl.ift", "m12.ctl.lock"],
    guards: [
      { id: "m12-mix", tryKey: "m12.guard.mix.try", blockedKey: "m12.guard.mix.blocked" },
      { id: "m12-edit", tryKey: "m12.guard.edit.try", blockedKey: "m12.guard.edit.blocked" },
      { id: "m12-closed", tryKey: "m12.guard.closed.try", blockedKey: "m12.guard.closed.blocked" },
    ],
  },
  needs: [
    { ar: "دليل الحسابات الحالي وأرصدة الافتتاح لكل صندوق (المشتركين والمساهمين) في تاريخ الانتقال", en: "Current chart of accounts and opening balances per fund (participants and shareholders) at go-live" },
    { ar: "نسب الوكالة الفعلية لكل منتج وأساس الاحتساب (مكتتبة أو محصّلة أو مكتسبة)", en: "Actual Wakala % per product and its basis (written, collected or earned)" },
    { ar: "حسابات المصارف لكل صندوق وكشوف آخر 3 أشهر للتسوية", en: "Bank accounts per fund and their last 3 months of statements for reconciliation" },
    { ar: "آخر قوائم مالية مدققة وشكل العرض المطلوب من المراجع والهيئة", en: "Latest audited statements and the presentation the auditor and the regulator expect" },
    { ar: "تقويم الإقفال الشهري والسنوي ومن يعتمد كل إقفال", en: "Monthly and year-end close calendar and who approves each close" },
  ],
  screens: [
    { id: "s1", titleKey: "m12.s1.title", captionKey: "m12.s1.caption" },
    { id: "s2", titleKey: "m12.s2.title", captionKey: "m12.s2.caption" },
    { id: "s3", titleKey: "m12.s3.title", captionKey: "m12.s3.caption" },
    { id: "s4", titleKey: "m12.s4.title", captionKey: "m12.s4.caption" },
  ],
};
