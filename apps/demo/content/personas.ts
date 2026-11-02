import type { Persona } from "@/lib/types";

// Demo staff. Names are invented. Anyone with the access code may act as any of them, admin included.
export const PERSONAS: Persona[] = [
  { id: "admin", nameAr: "سالم المبروك", nameEn: "Salem Al-Mabrouk", roleKey: "role.admin", deptKey: "dept.it", modules: "*", isAdmin: true },
  { id: "gm", nameAr: "عبد الحكيم الزوي", nameEn: "Abdulhakim Al-Zuwai", roleKey: "role.gm", deptKey: "dept.management", modules: "*" },
  { id: "cfo", nameAr: "فاطمة بن عمران", nameEn: "Fatima Ben Omran", roleKey: "role.cfo", deptKey: "dept.finance", modules: ["m12", "m07", "m15", "m11", "m28", "m16", "m34"] },
  { id: "accountant", nameAr: "خالد الشريف", nameEn: "Khaled Al-Sharif", roleKey: "role.accountant", deptKey: "dept.finance", modules: ["m12", "m07", "m28"] },
  { id: "uw", nameAr: "مريم القماطي", nameEn: "Mariam Al-Gammati", roleKey: "role.underwriter", deptKey: "dept.underwriting", modules: ["m02", "m05", "m06", "m28"] },
  { id: "border", nameAr: "أيمن الورفلي", nameEn: "Ayman Al-Warfalli", roleKey: "role.border", deptKey: "dept.branches", modules: ["m02", "m06", "m07"] },
  { id: "claims", nameAr: "نوري بالحاج", nameEn: "Nouri Belhaj", roleKey: "role.claims", deptKey: "dept.claims", modules: ["m09", "m10", "m02", "m28"] },
  { id: "reins", nameAr: "هدى الترهوني", nameEn: "Huda Al-Tarhouni", roleKey: "role.reins", deptKey: "dept.reinsurance", modules: ["m10", "m09", "m28"] },
  { id: "dist", nameAr: "طارق الفيتوري", nameEn: "Tarek Al-Fitouri", roleKey: "role.distribution", deptKey: "dept.sales", modules: ["m04", "m02", "m28"] },
  { id: "invest", nameAr: "سارة المسماري", nameEn: "Sara Al-Mismari", roleKey: "role.investment", deptKey: "dept.finance", modules: ["m11", "m28"] },
  { id: "ssb", nameAr: "د. محمد الغرياني", nameEn: "Dr. Mohamed Al-Ghariani", roleKey: "role.ssb", deptKey: "dept.sharia", modules: ["m16", "m15", "m11", "m12"] },
  { id: "hr", nameAr: "ليلى بوزيد", nameEn: "Laila Bouzaid", roleKey: "role.hr", deptKey: "dept.hr", modules: ["m33", "m34"] },
];

export const personaById = (id?: string | null) => PERSONAS.find((p) => p.id === id);
export const canOpen = (p: Persona | undefined, moduleId: string) =>
  !!p && (p.modules === "*" || p.modules.includes(moduleId));
