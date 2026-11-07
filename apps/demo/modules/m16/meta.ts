import type { ModuleMeta } from "@/lib/types";

export const meta: ModuleMeta = {
  id: "m16",
  decisionIds: ["M16"],
  nameKey: "m16.name",
  taglineKey: "m16.tagline",
  deptKey: "dept.sharia",
  icon: "ShieldCheck",
  color: "#1f8a4c",
  briefRef: "3.10",
  sensitive: {
    riskKey: "m16.risk",
    controlKeys: ["m16.ctl.mandatory", "m16.ctl.ssbOnly", "m16.ctl.exceptions", "m16.ctl.esign"],
    guards: [
      { id: "m16-status", tryKey: "m16.guard.status.try", blockedKey: "m16.guard.status.blocked" },
      { id: "m16-mix", tryKey: "m16.guard.mix.try", blockedKey: "m16.guard.mix.blocked" },
    ],
  },
  needs: [
    { ar: "أسماء أعضاء الهيئة الشرعية وأرقام الهواتف للتوقيع الإلكتروني (OTP)", en: "SSB member names and phone numbers for e-signature (OTP)" },
    { ar: "سجل قرارات واعتمادات الهيئة السابقة للمنتجات والنماذج وقواعد التقسيم", en: "Past SSB resolutions and their approvals of products, forms and split rules" },
    { ar: "آخر تقرير مراجعة شرعية سنوية وشهادة الالتزام الصادرة", en: "Latest annual Sharia review report and issued compliance certificate" },
    { ar: "من يملك صلاحية تغيير الحالة الشرعية (الهيئة، المراجع الشرعي الداخلي، مراجع كل فرع)", en: "Who may change a Sharia status (SSB, internal Sharia auditor, branch auditors)" },
    { ar: "حالات التطهير السابقة والمبالغ والجهات الخيرية المعتمدة", en: "Past purification cases, amounts and approved charities" },
  ],
  screens: [
    { id: "s1", titleKey: "m16.s1.title", captionKey: "m16.s1.caption" },
    { id: "s2", titleKey: "m16.s2.title", captionKey: "m16.s2.caption" },
    { id: "s3", titleKey: "m16.s3.title", captionKey: "m16.s3.caption" },
    { id: "s4", titleKey: "m16.s4.title", captionKey: "m16.s4.caption" },
  ],
};
