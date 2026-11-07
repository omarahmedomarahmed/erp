import type { ModuleMeta } from "@/lib/types";

export const meta: ModuleMeta = {
  id: "m15",
  decisionIds: ["M15"],
  nameKey: "m15.name",
  taglineKey: "m15.tagline",
  deptKey: "dept.finance",
  icon: "HandCoins",
  color: "#0f8b8d",
  briefRef: "3.11",
  sensitive: {
    riskKey: "m15.risk",
    controlKeys: ["m15.ctl.formula", "m15.ctl.qard", "m15.ctl.chain", "m15.ctl.share"],
    guards: [
      { id: "m15-shareholders", tryKey: "m15.guard.shareholders.try", blockedKey: "m15.guard.shareholders.blocked" },
      { id: "m15-early", tryKey: "m15.guard.early.try", blockedKey: "m15.guard.early.blocked" },
    ],
  },
  needs: [
    { ar: "حساب آخر فائض موزع: المكونات وطريقة التوزيع الفعلية", en: "Last distributed surplus, its components and the actual distribution method" },
    { ar: "رصيد القرض الحسن القائم وتاريخ كل سحب وقرار الهيئة لكل سحب", en: "Outstanding Qard Hasan balance, each draw date and the SSB resolution on it" },
    { ar: "قواعد الاستحقاق: استبعاد المشترك عند تجاوز التعويضات للمساهمة، والحد الأدنى للحصة", en: "Eligibility rules: exclusion of participants whose claims exceed their contribution, and the minimum share" },
    { ar: "طريقة التسوية المفضلة (قسيمة صرف أو خصم عند التجديد) ومهلة صرف القسائم", en: "Preferred settlement (voucher or renewal discount) and the voucher payment window" },
    { ar: "تقرير الخبير الاكتواري للمخصصات الفنية لآخر سنة", en: "The actuary's technical reserves report for the last year" },
  ],
  screens: [
    { id: "s1", titleKey: "m15.s1.title", captionKey: "m15.s1.caption" },
    { id: "s2", titleKey: "m15.s2.title", captionKey: "m15.s2.caption" },
    { id: "s3", titleKey: "m15.s3.title", captionKey: "m15.s3.caption" },
    { id: "s4", titleKey: "m15.s4.title", captionKey: "m15.s4.caption" },
  ],
};
