import type { ModuleMeta } from "@/lib/types";

export const meta: ModuleMeta = {
  id: "m06",
  decisionIds: ["M06", "M03"],
  nameKey: "m06.name",
  taglineKey: "m06.tagline",
  deptKey: "dept.underwriting",
  icon: "FileBadge",
  color: "#284dae",
  briefRef: "3.2",
  needs: [
    { ar: "جدول نسب الوكالة لكل منتج موقعاً، وقرارات الهيئة الشرعية للمنتجات", en: "The signed Wakala % sheet per product and the SSB resolutions for each product" },
    { ar: "نماذج الشهادات الحالية بالعربية والإنجليزية لكل منتج، بنصوص تعتمدها الهيئة", en: "Today's certificate templates in Arabic and English per product, with SSB-approved wording" },
    { ar: "مصدر التعرفة الإجبارية المعتمد، وطريقة ترقيم البطاقة البرتقالية مع المكتب الموحد", en: "The approved compulsory tariff source and Orange Card numbering with the unified bureau" },
    { ar: "مزود شهادة التوقيع الرقمي، وصورة الختم، واسم الموقّع على الشهادة", en: "The digital-signature certificate provider, stamp image and signatory name" },
    { ar: "عقد مزود SMS واسم المرسل، وطريقة التجديد لكل منتج", en: "The SMS provider contract and sender name, and the renewal mode per product" },
  ],
  screens: [
    { id: "s1", titleKey: "m06.s1.title", captionKey: "m06.s1.caption" },
    { id: "s2", titleKey: "m06.s2.title", captionKey: "m06.s2.caption" },
    { id: "s3", titleKey: "m06.s3.title", captionKey: "m06.s3.caption" },
    { id: "s4", titleKey: "m06.s4.title", captionKey: "m06.s4.caption" },
  ],
};
