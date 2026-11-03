import type { Persona } from "@/lib/types";

// Demo staff. Names are invented. Anyone with the access code may act as any of them, admin included.
export const PERSONAS: Persona[] = [
  { id: "admin", nameAr: "سالم م.", nameEn: "Salem M.", roleKey: "role.admin", deptKey: "dept.it", modules: "*", isAdmin: true },
  { id: "gm", nameAr: "عبد الحكيم ز.", nameEn: "Abdulhakim Z.", roleKey: "role.gm", deptKey: "dept.management", modules: "*" },
  { id: "cfo", nameAr: "فاطمة ع.", nameEn: "Fatima O.", roleKey: "role.cfo", deptKey: "dept.finance", modules: ["m12", "m07", "m15", "m11", "m28", "m16", "m34"] },
  { id: "accountant", nameAr: "خالد ش.", nameEn: "Khaled S.", roleKey: "role.accountant", deptKey: "dept.finance", modules: ["m12", "m07", "m28"] },
  { id: "uw", nameAr: "مريم ق.", nameEn: "Mariam G.", roleKey: "role.underwriter", deptKey: "dept.underwriting", modules: ["m02", "m05", "m06", "m28"] },
  { id: "border", nameAr: "أيمن و.", nameEn: "Ayman W.", roleKey: "role.border", deptKey: "dept.branches", modules: ["m02", "m06", "m07"] },
  { id: "claims", nameAr: "نوري ب.", nameEn: "Nouri B.", roleKey: "role.claims", deptKey: "dept.claims", modules: ["m09", "m10", "m02", "m28"] },
  { id: "reins", nameAr: "هدى ت.", nameEn: "Huda T.", roleKey: "role.reins", deptKey: "dept.reinsurance", modules: ["m10", "m09", "m28"] },
  { id: "dist", nameAr: "طارق ف.", nameEn: "Tarek F.", roleKey: "role.distribution", deptKey: "dept.sales", modules: ["m04", "m02", "m28"] },
  { id: "invest", nameAr: "سارة م.", nameEn: "Sara M.", roleKey: "role.investment", deptKey: "dept.finance", modules: ["m11", "m28"] },
  { id: "ssb", nameAr: "د. محمد غ.", nameEn: "Dr. Mohamed G.", roleKey: "role.ssb", deptKey: "dept.sharia", modules: ["m16", "m15", "m11", "m12"] },
  { id: "hr", nameAr: "ليلى ب.", nameEn: "Laila B.", roleKey: "role.hr", deptKey: "dept.hr", modules: ["m33", "m34"] },
];

export const personaById = (id?: string | null) => PERSONAS.find((p) => p.id === id);
export const canOpen = (p: Persona | undefined, moduleId: string) =>
  !!p && (p.modules === "*" || p.modules.includes(moduleId));
