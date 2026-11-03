import type { Persona } from "@/lib/types";

// Demo staff. Names are invented. Anyone with the access code may act as any of them, admin included.
export const PERSONAS: Persona[] = [
  { id: "admin", nameAr: "سالم ا******", nameEn: "Salem A*********", roleKey: "role.admin", deptKey: "dept.it", modules: "*", isAdmin: true },
  { id: "gm", nameAr: "عبد الحكيم ا****", nameEn: "Abdulhakim A*******", roleKey: "role.gm", deptKey: "dept.management", modules: "*" },
  { id: "cfo", nameAr: "فاطمة ب* ع****", nameEn: "Fatima B** O****", roleKey: "role.cfo", deptKey: "dept.finance", modules: ["m12", "m07", "m15", "m11", "m28", "m16", "m34"] },
  { id: "accountant", nameAr: "خالد ا*****", nameEn: "Khaled A********", roleKey: "role.accountant", deptKey: "dept.finance", modules: ["m12", "m07", "m28"] },
  { id: "uw", nameAr: "مريم ا******", nameEn: "Mariam A*********", roleKey: "role.underwriter", deptKey: "dept.underwriting", modules: ["m02", "m05", "m06", "m28"] },
  { id: "border", nameAr: "أيمن ا******", nameEn: "Ayman A**********", roleKey: "role.border", deptKey: "dept.branches", modules: ["m02", "m06", "m07"] },
  { id: "claims", nameAr: "نوري ب*****", nameEn: "Nouri B*****", roleKey: "role.claims", deptKey: "dept.claims", modules: ["m09", "m10", "m02", "m28"] },
  { id: "reins", nameAr: "هدى ا*******", nameEn: "Huda A**********", roleKey: "role.reins", deptKey: "dept.reinsurance", modules: ["m10", "m09", "m28"] },
  { id: "dist", nameAr: "طارق ا*******", nameEn: "Tarek A*********", roleKey: "role.distribution", deptKey: "dept.sales", modules: ["m04", "m02", "m28"] },
  { id: "invest", nameAr: "سارة ا*******", nameEn: "Sara A*********", roleKey: "role.investment", deptKey: "dept.finance", modules: ["m11", "m28"] },
  { id: "ssb", nameAr: "د. محمد ا*******", nameEn: "Dr. Mohamed A**********", roleKey: "role.ssb", deptKey: "dept.sharia", modules: ["m16", "m15", "m11", "m12"] },
  { id: "hr", nameAr: "ليلى ب****", nameEn: "Laila B******", roleKey: "role.hr", deptKey: "dept.hr", modules: ["m33", "m34"] },
];

export const personaById = (id?: string | null) => PERSONAS.find((p) => p.id === id);
export const canOpen = (p: Persona | undefined, moduleId: string) =>
  !!p && (p.modules === "*" || p.modules.includes(moduleId));
