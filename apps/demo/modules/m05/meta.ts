import type { ModuleMeta } from "@/lib/types";

export const meta: ModuleMeta = {
  id: "m05",
  decisionIds: ["M05"],
  nameKey: "m05.name",
  taglineKey: "m05.tagline",
  deptKey: "dept.underwriting",
  icon: "Scale",
  color: "#152b56",
  briefRef: "3.3",
  needs: [
    { ar: "حدود مصفوفة الموافقة لكل دور وفرع: على مبلغ التغطية أم المساهمة؟", en: "Approval-matrix limits per role and branch: on sum covered or contribution?" },
    { ar: "قواعد الاكتتاب المكتوبة اليوم لكل منتج، بما فيها حالات الرفض", en: "Today's written underwriting guidelines per product, including declines" },
    { ar: "أسئلة الخطر لكل منتج، وأسئلة السن والصحة للسفر والحج والعمرة", en: "Risk questions per product, and age and health questions for travel, Hajj and Umrah" },
    { ar: "مهلة الرد على الإحالة، ومن يقرر ليلاً عند المنافذ الحدودية", en: "Referral response time, and who decides at night at border points" },
    { ar: "طاقة اتفاقيات إعادة التكافل التي توجب إسناداً اختيارياً قبل الإصدار", en: "Treaty capacity limits that require facultative cover before issue" },
  ],
  screens: [
    { id: "s1", titleKey: "m05.s1.title", captionKey: "m05.s1.caption" },
    { id: "s2", titleKey: "m05.s2.title", captionKey: "m05.s2.caption" },
    { id: "s3", titleKey: "m05.s3.title", captionKey: "m05.s3.caption" },
    { id: "s4", titleKey: "m05.s4.title", captionKey: "m05.s4.caption" },
  ],
};
