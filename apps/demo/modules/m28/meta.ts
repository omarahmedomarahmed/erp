import type { ModuleMeta } from "@/lib/types";

export const meta: ModuleMeta = {
  id: "m28",
  decisionIds: ["M28"],
  nameKey: "m28.name",
  taglineKey: "m28.tagline",
  deptKey: "dept.management",
  icon: "BarChart3",
  color: "#152b56",
  briefRef: "3.9",
  needs: [
    { ar: "ترتيب أولوية المؤشرات الـ24 واللوحات الـ12 للإدارة العليا", en: "Priority order of the 24 KPIs and 12 dashboards for top management" },
    { ar: "تعريف معتمد لـ «نسبة الخسارة» و«السيولة المتوفرة»", en: "An approved definition of “loss ratio” and “available liquidity”" },
    { ar: "من يرى أي لوحة، ومن يصدّر البيانات", en: "Who sees which dashboard, and who may export data" },
    { ar: "أداة التحليل المفضلة (Metabase أو Power BI) ومن يديرها", en: "Preferred BI tool (Metabase or Power BI) and who runs it" },
    { ar: "أرقام النظام القديم للسنوات السابقة للمقارنة", en: "Legacy-system figures for past years, for comparison" },
  ],
  screens: [
    { id: "s1", titleKey: "m28.s1.title", captionKey: "m28.s1.caption" },
    { id: "s2", titleKey: "m28.s2.title", captionKey: "m28.s2.caption" },
    { id: "s3", titleKey: "m28.s3.title", captionKey: "m28.s3.caption" },
    { id: "s4", titleKey: "m28.s4.title", captionKey: "m28.s4.caption" },
  ],
};
