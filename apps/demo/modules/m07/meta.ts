import type { ModuleMeta } from "@/lib/types";

export const meta: ModuleMeta = {
  id: "m07",
  decisionIds: ["M07"],
  nameKey: "m07.name",
  taglineKey: "m07.tagline",
  deptKey: "dept.finance",
  icon: "Wallet",
  color: "#1f8a4c",
  briefRef: "3.6",
  sensitive: {
    riskKey: "m07.risk",
    controlKeys: ["m07.control.1", "m07.control.2", "m07.control.3", "m07.control.4"],
    guards: [
      { id: "m07-no-split", tryKey: "m07.guard.split.try", blockedKey: "m07.guard.split.blocked" },
      { id: "m07-late-interest", tryKey: "m07.guard.interest.try", blockedKey: "m07.guard.interest.blocked" },
    ],
  },
  needs: [
    { ar: "الحسابات المصرفية لكل صندوق، والبنك المحصل للبطاقات (Moamalat)", en: "The bank accounts per fund and the card acquirer (Moamalat)" },
    { ar: "المنتجات التي تقبل التقسيط، وعدد الأقساط، ومهلة السماح لكل منتج", en: "Which products allow instalments, how many, and the grace period per product" },
    { ar: "نماذج كشوف حساب من كل بنك (الصيغة والتكرار) للمطابقة الآلية", en: "Sample statements from each bank (format and frequency) for auto-matching" },
    { ar: "قواعد النقد والعملات في المنافذ الحدودية، ومتى يورد أمين الصندوق", en: "Cash and currency rules at border points, and when cashiers deposit" },
    { ar: "رأي الهيئة الشرعية في غرامة التأخير ومصيرها", en: "The SSB's position on late fees and where they go" },
  ],
  screens: [
    { id: "s1", titleKey: "m07.s1.title", captionKey: "m07.s1.caption" },
    { id: "s2", titleKey: "m07.s2.title", captionKey: "m07.s2.caption" },
    { id: "s3", titleKey: "m07.s3.title", captionKey: "m07.s3.caption" },
    { id: "s4", titleKey: "m07.s4.title", captionKey: "m07.s4.caption" },
  ],
};
