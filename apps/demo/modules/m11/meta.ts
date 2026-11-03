import type { ModuleMeta } from "@/lib/types";

export const meta: ModuleMeta = {
  id: "m11",
  decisionIds: ["M11"],
  nameKey: "m11.name",
  taglineKey: "m11.tagline",
  deptKey: "dept.finance",
  icon: "TrendingUp",
  color: "#b26a00",
  briefRef: "3.12",
  sensitive: {
    riskKey: "m11.risk",
    controlKeys: ["m11.ctl.ssb", "m11.ctl.portfolio", "m11.ctl.mudarib", "m11.ctl.purify"],
    guards: [
      { id: "m11-riba", tryKey: "m11.guard.riba.try", blockedKey: "m11.guard.riba.blocked" },
      { id: "m11-pool", tryKey: "m11.guard.pool.try", blockedKey: "m11.guard.pool.blocked" },
    ],
  },
  needs: [
    { ar: "قائمة الاستثمارات القائمة لكل صندوق: العقد والطرف ورأس المال والمدة والعائد", en: "Current investments per fund: contract, counterparty, principal, term and return" },
    { ar: "نسبة حصة المضارب أو أجرة وكالة الاستثمار التي اعتمدتها الهيئة الشرعية", en: "The Mudarib share or investment Wakala fee approved by the SSB" },
    { ar: "قنوات الاستثمار والمصارف المعتمدة شرعاً وحدود التركّز", en: "SSB-approved investment channels and banks, and concentration limits" },
    { ar: "كشوف المصارف لحسابات الاستثمار وأي فوائد قيّدها المصرف سابقاً، لغرض التطهير", en: "Bank statements of investment accounts and any interest credited before, for purification" },
  ],
  screens: [
    { id: "s1", titleKey: "m11.s1.title", captionKey: "m11.s1.caption" },
    { id: "s2", titleKey: "m11.s2.title", captionKey: "m11.s2.caption" },
    { id: "s3", titleKey: "m11.s3.title", captionKey: "m11.s3.caption" },
    { id: "s4", titleKey: "m11.s4.title", captionKey: "m11.s4.caption" },
  ],
};
