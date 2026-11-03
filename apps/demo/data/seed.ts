// TakafulTech demo dataset. Everything here is INVENTED: names, numbers, IDs, companies.
// Deterministic: hard-coded records plus a seeded PRNG evaluated once at module load.
// "Today" in the demo is 2026-11-02. Money = LYD with 3 decimals (number).
// Percentages (Wakala, social security, tax...) are ILLUSTRATIVE until the client confirms them.

import type { Lang } from "@/lib/types";
import type {
  Account, Agent, AgentMonth, ApprovalLevel, ApprovalMatrixRow, AttendanceSummary, BillingPlan, Cession, Claim,
  ClaimDoc, ClaimDocKey, ClaimEvent, ClaimStage, ClassCode, CommissionLine, CommissionTier, ComplianceCertificate,
  Counterparty, Customer, CustomerDoc, Department, DuplicateCandidate, Employee, EmploymentContract, FundCode,
  InboxItem, Instalment, InterFundTransfer, InvestmentContract, InvestmentReturn, IftType, Journal, JournalLine,
  JournalSource, KpiMonth, LeaveRequest, MurabahaScheduleRow, Outlet, PaymentChannel, PayrollLine, PayrollRates,
  PayrollRun, Period, Policy, Portfolio, Product, ProductCode, Quote, Receipt, Recovery, RiStatementRow,
  RuleHit, ShariaException, ShariaStatus, SplitRule, SsbApproval, SsbMember, SsbResolution, StaffAdvance,
  SurplusAllocation, SurplusRun, Surveyor, Treaty, TrialBalanceRow, UwRule,
} from "./types";

export type * from "./types";

// =====================================================================================
// Helpers
// =====================================================================================

export const TODAY = "2026-11-02";
export const GL_START = "2026-01-01";

/** Seeded PRNG (mulberry32). Evaluated at module load only. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(20260914);
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rng() * arr.length)];
const noise = (spread: number) => 1 + (rng() - 0.5) * 2 * spread;

export const round3 = (n: number) => Math.round((n + (n >= 0 ? 1e-9 : -1e-9)) * 1000) / 1000;
const sum = (xs: number[]) => round3(xs.reduce((a, b) => a + b, 0));
const pad = (n: number, w: number) => String(n).padStart(w, "0");

const d2n = (s: string) => Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10));
const n2d = (n: number) => new Date(n).toISOString().slice(0, 10);
export const addDays = (s: string, k: number) => n2d(d2n(s) + k * 86400000);
export const addMonths = (s: string, k: number) => {
  const y = +s.slice(0, 4), m = +s.slice(5, 7) - 1 + k, d = +s.slice(8, 10);
  const first = new Date(Date.UTC(y, m, 1));
  const last = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
  return n2d(Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), Math.min(d, last)));
};
const monthEnd = (ym: string) => n2d(Date.UTC(+ym.slice(0, 4), +ym.slice(5, 7), 0));
const ym = (s: string) => s.slice(0, 7);
const nextYm = (m: string) => ym(addMonths(`${m}-01`, 1));
const dayOfYear = (s: string) => Math.round((d2n(s) - Date.UTC(+s.slice(0, 4), 0, 1)) / 86400000) + 1;

/** Libyan public holidays 2026 (Islamic dates approximate; illustrative tenant calendar). */
export const HOLIDAYS_2026: string[] = [
  "2026-02-17", "2026-03-20", "2026-03-21", "2026-03-22", "2026-05-01", "2026-05-26", "2026-05-27",
  "2026-05-28", "2026-05-29", "2026-06-16", "2026-08-25", "2026-09-16", "2026-10-23", "2026-12-24",
];
/** Work week Sunday-Thursday (weekend Friday + Saturday). */
export const isWorkingDay = (s: string) => {
  const w = new Date(d2n(s)).getUTCDay();
  return w !== 5 && w !== 6 && !HOLIDAYS_2026.includes(s);
};
/** Working days in (from, to] */
export function workingDaysBetween(from: string, to: string): number {
  let n = 0;
  for (let d = addDays(from, 1); d <= to; d = addDays(d, 1)) if (isWorkingDay(d)) n++;
  return n;
}

const moneyFmt = new Intl.NumberFormat("en-US", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
/** 3 decimals, Latin digits: "1,250.500 د.ل" (ar) / "LYD 1,250.500" (en) */
export function fmtMoney(n: number, lang: Lang = "ar"): string {
  const s = moneyFmt.format(round3(n));
  return lang === "ar" ? `${s} د.ل` : `LYD ${s}`;
}
/** Plain number with 3 decimals, no currency */
export const fmtAmount = (n: number) => moneyFmt.format(round3(n));

export function indexBy<T extends { id: string }>(rows: T[]): Record<string, T> {
  const m: Record<string, T> = {};
  for (const r of rows) m[r.id] = r;
  return m;
}

// =====================================================================================
// Organisation: branches, border points, licensing offices
// =====================================================================================

export const outlets: Outlet[] = [
  { id: "BR-TRP", kind: "branch", nameAr: "الإدارة العامة – طرابلس", nameEn: "Head Office – Tripoli", cityAr: "طرابلس", cityEn: "Tripoli", isHq: true },
  { id: "BR-BEN", kind: "branch", nameAr: "فرع بنغازي", nameEn: "Benghazi Branch", cityAr: "بنغازي", cityEn: "Benghazi" },
  { id: "BR-MIS", kind: "branch", nameAr: "فرع مصراتة", nameEn: "Misrata Branch", cityAr: "مصراتة", cityEn: "Misrata" },
  { id: "BR-SEB", kind: "branch", nameAr: "فرع سبها", nameEn: "Sebha Branch", cityAr: "سبها", cityEn: "Sebha" },
  { id: "BR-ZUW", kind: "branch", nameAr: "فرع زوارة", nameEn: "Zuwara Branch", cityAr: "زوارة", cityEn: "Zuwara" },
  { id: "BP-RAJ", kind: "border_point", borderType: "land", parentBranchId: "BR-ZUW", nameAr: "منفذ رأس اجدير البري", nameEn: "Ras Ajdir Land Border Point", cityAr: "رأس اجدير", cityEn: "Ras Ajdir" },
  { id: "BP-PRT", kind: "border_point", borderType: "sea", parentBranchId: "BR-TRP", nameAr: "منفذ ميناء طرابلس البحري", nameEn: "Tripoli Seaport Point", cityAr: "طرابلس", cityEn: "Tripoli" },
  { id: "BP-MJI", kind: "border_point", borderType: "air", parentBranchId: "BR-TRP", nameAr: "منفذ مطار معيتيقة الدولي", nameEn: "Mitiga International Airport Point", cityAr: "طرابلس", cityEn: "Tripoli" },
  { id: "LO-TRP", kind: "licensing_office", parentBranchId: "BR-TRP", nameAr: "مكتب الترخيص – طرابلس", nameEn: "Vehicle Licensing Office – Tripoli", cityAr: "طرابلس", cityEn: "Tripoli" },
  { id: "LO-MIS", kind: "licensing_office", parentBranchId: "BR-MIS", nameAr: "مكتب الترخيص – مصراتة", nameEn: "Vehicle Licensing Office – Misrata", cityAr: "مصراتة", cityEn: "Misrata" },
  { id: "LO-BEN", kind: "licensing_office", parentBranchId: "BR-BEN", nameAr: "مكتب الترخيص – بنغازي", nameEn: "Vehicle Licensing Office – Benghazi", cityAr: "بنغازي", cityEn: "Benghazi" },
];
export const branches = outlets.filter((o) => o.kind === "branch");
export const borderPoints = outlets.filter((o) => o.kind === "border_point");
export const licensingOffices = outlets.filter((o) => o.kind === "licensing_office");

// =====================================================================================
// Customers (M02)
// =====================================================================================

type CityKey = "TRP" | "BEN" | "MIS" | "SEB" | "ZUW" | "ZLT" | "BAY" | "ZAW" | "AJD" | "GHR" | "SAB" | "UBR";
const CITY: Record<CityKey, [string, string, string]> = {
  TRP: ["طرابلس", "Tripoli", "BR-TRP"], BEN: ["بنغازي", "Benghazi", "BR-BEN"], MIS: ["مصراتة", "Misrata", "BR-MIS"],
  SEB: ["سبها", "Sebha", "BR-SEB"], ZUW: ["زوارة", "Zuwara", "BR-ZUW"], ZLT: ["زليتن", "Zliten", "BR-MIS"],
  BAY: ["البيضاء", "Bayda", "BR-BEN"], ZAW: ["الزاوية", "Zawiya", "BR-TRP"], AJD: ["أجدابيا", "Ajdabiya", "BR-BEN"],
  GHR: ["غريان", "Gharyan", "BR-TRP"], SAB: ["صبراتة", "Sabratha", "BR-ZUW"], UBR: ["أوباري", "Ubari", "BR-SEB"],
};
const PHONE_PREFIX = ["091", "092", "094"];
const fakePhone = (n: number) => `${PHONE_PREFIX[n % 3]}-0000${pad(n % 1000, 3)}`;

interface PersonOpts { kyc?: Customer["kycLevel"]; pep?: [string, string]; sameIdAs?: number; docs?: CustomerDoc[]; birth?: string }
function person(n: number, nameAr: string, nameEn: string, g: "M" | "F", city: CityKey, createdAt: string, o: PersonOpts = {}): Customer {
  const idNo = o.sameIdAs ?? n;
  const nationalNo = `${g === "M" ? "1" : "2"}199${pad(idNo, 8)}`;
  return {
    id: `CUS-${n}`, type: "individual", nameAr, nameEn, gender: g, birthDate: o.birth ?? `19${70 + (n % 25)}-${pad((n % 12) + 1, 2)}-${pad((n % 27) + 1, 2)}`,
    nationalNo, phone: fakePhone(n), cityAr: CITY[city][0], cityEn: CITY[city][1], outletId: CITY[city][2],
    kycLevel: o.pep ? "enhanced" : o.kyc ?? "standard", pep: !!o.pep, pepRoleAr: o.pep?.[0], pepRoleEn: o.pep?.[1], sanctionsHit: false,
    docs: o.docs ?? [{ type: "national_id", number: `NID-${pad(idNo, 6)}`, expiry: addMonths("2028-01-15", n % 30) }],
    createdAt,
  };
}
function company(n: number, nameAr: string, nameEn: string, city: CityKey, createdAt: string, o: { kyc?: Customer["kycLevel"]; crExpiry?: string } = {}): Customer {
  return {
    id: `CUS-${n}`, type: "company", nameAr, nameEn, crNo: `CR-${city}-${pad(n, 6)}`, phone: fakePhone(n),
    cityAr: CITY[city][0], cityEn: CITY[city][1], outletId: CITY[city][2], kycLevel: o.kyc ?? "standard", pep: false, sanctionsHit: false,
    docs: [
      { type: "commercial_register", number: `CR-${city}-${pad(n, 6)}`, expiry: o.crExpiry ?? addMonths("2027-03-31", n % 12) },
      { type: "tax_certificate", number: `TAX-${pad(n, 7)}`, expiry: addMonths("2026-12-31", n % 6) },
    ],
    createdAt,
  };
}
const nid = (n: number, expiry: string): CustomerDoc => ({ type: "national_id", number: `NID-${pad(n, 6)}`, expiry });
const dl = (n: number, expiry: string): CustomerDoc => ({ type: "driving_licence", number: `DL-${pad(n, 7)}`, expiry });
const pp = (n: number, expiry: string): CustomerDoc => ({ type: "passport", number: `P-FAKE${pad(n, 5)}`, expiry });

export const customers: Customer[] = [
  person(1001, "محمد علي و.", "Mohamed Ali W.", "M", "MIS", "2025-02-27", { birth: "1986-04-12", docs: [nid(1001, "2029-04-11"), dl(1001, "2030-02-20")] }),
  person(1002, "أحمد سالم ك.", "Ahmed Salem K.", "M", "TRP", "2025-01-15", { docs: [nid(1002, "2028-07-01"), dl(1002, "2027-05-14")] }),
  person(1003, "سعاد عمر ف.", "Souad Omar F.", "F", "BEN", "2025-12-20", { docs: [nid(1003, "2029-01-30"), pp(1003, "2030-06-18")] }),
  person(1004, "يوسف إبراهيم ز.", "Youssef Ibrahim Z.", "M", "ZLT", "2025-11-20", { kyc: "basic", docs: [nid(1004, "2026-05-10")] }),
  person(1005, "عبد الرزاق الهادي ح.", "Abdulrazzaq Al-Hadi H.", "M", "TRP", "2026-04-10", { pep: ["عضو مجلس بلدي (افتراضي)", "Municipal council member (invented)"], docs: [nid(1005, "2030-09-09"), pp(1005, "2031-02-01"), dl(1005, "2029-03-03")] }),
  person(1006, "مصطفى رمضان ب.", "Mustafa Ramadan B.", "M", "BEN", "2025-03-15"),
  person(1007, "خديجة محمد ع.", "Khadija Mohamed O.", "F", "BEN", "2026-06-18", { birth: "1958-02-03", docs: [nid(1007, "2027-11-30"), pp(1007, "2029-08-14")] }),
  person(1008, "عمر فرج ك.", "Omar Faraj K.", "M", "MIS", "2025-06-01"),
  person(1009, "صالح ميلاد د.", "Saleh Milad D.", "M", "BAY", "2026-06-28", { docs: [nid(1009, "2028-10-01"), pp(1009, "2026-04-02")] }),
  person(1010, "نادية عادل ط.", "Nadia Adel T.", "F", "TRP", "2025-07-08", { docs: [nid(1010, "2029-05-05"), pp(1010, "2030-01-21"), dl(1010, "2028-09-09")] }),
  person(1011, "إبراهيم جمعة غ.", "Ibrahim Jumaa G.", "M", "TRP", "2026-09-25"),
  person(1012, "عادل مفتاح س.", "Adel Muftah S.", "M", "SEB", "2026-02-18", { docs: [nid(1012, "2028-03-03"), dl(1012, "2026-08-01")] }),
  person(1013, "حسين الطاهر ج.", "Hussein Al-Taher J.", "M", "BEN", "2025-11-09"),
  person(1014, "مريم صالح ش.", "Maryam Saleh S.", "F", "ZAW", "2026-10-02", { kyc: "basic" }),
  person(1015, "عبد السلام رمضان ح.", "Abdulsalam Ramadan H.", "M", "BAY", "2026-10-25"),
  person(1016, "فرج علي م.", "Faraj Ali M.", "M", "BEN", "2025-11-05"),
  person(1017, "أسماء خليفة ب.", "Asma Khalifa B.", "F", "TRP", "2026-07-30"),
  person(1018, "علي عبد الله أ.", "Ali Abdullah A.", "M", "AJD", "2026-07-03"),
  person(1019, "رمضان سالم ق.", "Ramadan Salem G.", "M", "ZUW", "2025-08-01"),
  person(1020, "هند يوسف ز.", "Hind Youssef Z.", "F", "MIS", "2026-07-15"),
  person(1021, "خليفة مسعود ر.", "Khalifa Masoud R.", "M", "GHR", "2025-02-10", { birth: "1947-06-01", docs: [nid(1021, "2025-12-31")] }),
  person(1022, "منى أحمد ش.", "Mona Ahmed S.", "F", "TRP", "2026-06-15"),
  person(1023, "الطاهر عمر ت.", "Al-Taher Omar T.", "M", "TRP", "2025-11-22"),
  person(1024, "ميلاد حسن ه.", "Milad Hassan H.", "M", "SEB", "2026-04-07"),
  person(1025, "زينب إبراهيم ص.", "Zainab Ibrahim S.", "F", "SAB", "2026-07-20"),
  person(1026, "جمعة محمد ف.", "Jumaa Mohamed F.", "M", "UBR", "2026-09-02", { docs: [nid(1026, "2029-02-02"), dl(1026, "2026-10-15")] }),
  person(1027, "سالمة عبد الحميد ع.", "Salma Abdulhamid O.", "F", "BEN", "2026-08-03"),
  person(1028, "عبد الحميد خالد ز.", "Abdulhamid Khaled Z.", "M", "TRP", "2026-08-20"),
  person(1029, "هشام نوري م.", "Hisham Nouri M.", "M", "MIS", "2026-03-12"),
  person(1030, "وليد فتحي ن.", "Walid Fathi N.", "M", "ZUW", "2026-08-02"),
  // Deliberate duplicate candidates (same national number, slightly different spelling)
  person(1031, "احمد سالم ك.", "Ahmad Salim K.", "M", "TRP", "2026-02-03", { sameIdAs: 1002, kyc: "basic", docs: [nid(1002, "2028-07-01")] }),
  person(1032, "خديجه محمد ع.", "Khadijah Mohammed O.", "F", "BEN", "2026-10-15", { sameIdAs: 1007, kyc: "basic", birth: "1958-02-03", docs: [nid(1007, "2027-11-30")] }),
  // Companies
  company(1033, "شركة الساحل للمقاولات العامة", "Al-Sahel General Contracting Co.", "TRP", "2026-01-28"),
  company(1034, "شركة النسيم لاستيراد المواد الغذائية", "Al-Naseem Food Import Co.", "MIS", "2025-09-10"),
  company(1035, "مصنع الواحة للبلاستيك", "Al-Waha Plastics Factory", "BEN", "2025-11-28"),
  company(1036, "شركة قافلة الرحمة للحج والعمرة", "Qafilat Al-Rahma Hajj & Umrah Co.", "TRP", "2025-05-15"),
  company(1037, "شركة برقة للنقل البري", "Barqa Land Transport Co.", "BEN", "2025-11-12", { crExpiry: "2026-09-30" }),
  company(1038, "شركة فزان للتجارة العامة", "Fezzan General Trading Co.", "SEB", "2026-05-05"),
  company(1039, "شركة زوارة للصيد البحري", "Zuwara Fisheries Co.", "ZUW", "2026-05-28", { kyc: "basic" }),
  company(1040, "مجمع المدينة التجاري", "Al-Madina Commercial Complex", "TRP", "2025-03-25", { kyc: "enhanced" }),
];

export const duplicateCandidates: DuplicateCandidate[] = [
  {
    id: "DUP-001", customerIds: ["CUS-1002", "CUS-1031"], score: 94, status: "open",
    reasonsAr: ["نفس الرقم الوطني", "تشابه الاسم (اختلاف في الإملاء)", "نفس المدينة"],
    reasonsEn: ["Same national number", "Similar name (spelling variant)", "Same city"],
  },
  {
    id: "DUP-002", customerIds: ["CUS-1007", "CUS-1032"], score: 91, status: "open",
    reasonsAr: ["نفس الرقم الوطني", "تشابه الاسم (خديجة / خديجه)", "نفس تاريخ الميلاد"],
    reasonsEn: ["Same national number", "Similar name (Khadija / Khadijah)", "Same birth date"],
  },
];

// =====================================================================================
// Products, split rules, underwriting rules, approval matrix (M06/M05)
// =====================================================================================

export const CLASSES: Record<ClassCode, [string, string]> = {
  MOTOR: ["المركبات", "Motor"], TRAVEL: ["السفر", "Travel"], PROPERTY: ["الحريق والممتلكات", "Fire & Property"],
  MARINE: ["البحري", "Marine"], PA: ["الحوادث الشخصية", "Personal Accident"],
};

export const products: Product[] = [
  { id: "CMP", certPrefix: "TK-CMP", nameAr: "تأمين إجباري مركبات", nameEn: "Compulsory Motor", classCode: "MOTOR", compulsory: true, wakalaPct: 30, tabarruPct: 70, illustrative: true,
    ratingAr: "تعرفة ثابتة حسب فئة المركبة (165 / 210 / 380 / 420 د.ل)", ratingEn: "Fixed tariff by vehicle class (165 / 210 / 380 / 420 LYD)",
    treatyIds: ["TR-2026-XL"], splitRuleId: "SR-CMP-2", ssbResolutionId: "SSB-2025-04", sharia_status: "compliant",
    claimDocs: ["claim_form", "police_report", "driving_licence", "vehicle_registration", "photos", "medical_report"] },
  { id: "MTR", certPrefix: "TK-MTR", nameAr: "تأمين شامل مركبات", nameEn: "Comprehensive Motor", classCode: "MOTOR", compulsory: false, wakalaPct: 30, tabarruPct: 70, illustrative: true,
    ratingAr: "3.5% من قيمة المركبة، حد أدنى 900 د.ل", ratingEn: "3.5% of vehicle value, minimum LYD 900", rate: 0.035, minContribution: 900,
    treatyIds: ["TR-2026-QS"], splitRuleId: "SR-MTR-2", ssbResolutionId: "SSB-2025-04", sharia_status: "compliant",
    claimDocs: ["claim_form", "police_report", "driving_licence", "vehicle_registration", "photos", "repair_estimate"] },
  { id: "ORC", certPrefix: "TK-ORC", nameAr: "البطاقة البرتقالية", nameEn: "Orange Card", classCode: "MOTOR", compulsory: true, wakalaPct: 30, tabarruPct: 70, illustrative: true,
    ratingAr: "حسب المدة: 15 يوماً 95، شهر 160، 3 أشهر 380 د.ل", ratingEn: "By duration: 15 days 95, 1 month 160, 3 months 380 LYD",
    treatyIds: [], splitRuleId: "SR-ORC-2", ssbResolutionId: "SSB-2025-04", sharia_status: "compliant",
    claimDocs: ["claim_form", "police_report", "driving_licence", "photos", "passport_copy"] },
  { id: "TRV", certPrefix: "TK-TRV", nameAr: "تأمين السفر", nameEn: "Travel", classCode: "TRAVEL", compulsory: false, wakalaPct: 35, tabarruPct: 65, illustrative: true,
    ratingAr: "يومي حسب المنطقة (عربية 2.5، شنغن 3.5، عالمية 4.5 د.ل)، +50% فوق 65 سنة، حد أدنى 45", ratingEn: "Daily by zone (Arab 2.5, Schengen 3.5, worldwide 4.5 LYD), +50% over 65, minimum 45",
    minContribution: 45, treatyIds: [], splitRuleId: "SR-TRV-2", ssbResolutionId: "SSB-2025-04", sharia_status: "compliant",
    claimDocs: ["claim_form", "passport_copy", "medical_report", "invoices"] },
  { id: "FIR", certPrefix: "TK-FIR", nameAr: "تأمين الحريق والممتلكات", nameEn: "Fire & Property", classCode: "PROPERTY", compulsory: false, wakalaPct: 25, tabarruPct: 75, illustrative: true,
    ratingAr: "1.5 بالألف من مبلغ التأمين، حد أدنى 500 د.ل", ratingEn: "1.5 per mille of sum insured, minimum LYD 500", rate: 0.0015, minContribution: 500,
    treatyIds: ["TR-2026-XL"], splitRuleId: "SR-FIR-2", ssbResolutionId: "SSB-2025-04", sharia_status: "compliant",
    claimDocs: ["claim_form", "civil_defence_report", "photos", "invoices", "survey_report"] },
  { id: "MAR", certPrefix: "TK-MAR", nameAr: "التأمين البحري (بضائع)", nameEn: "Marine Cargo", classCode: "MARINE", compulsory: false, wakalaPct: 25, tabarruPct: 75, illustrative: true,
    ratingAr: "0.35% من قيمة البضاعة، حد أدنى 350 د.ل", ratingEn: "0.35% of cargo value, minimum LYD 350", rate: 0.0035, minContribution: 350,
    treatyIds: ["TR-2026-FAC-MAR-01"], splitRuleId: "SR-MAR-2", ssbResolutionId: "SSB-2025-04", sharia_status: "compliant",
    claimDocs: ["claim_form", "bill_of_lading", "invoices", "survey_report", "photos"] },
  { id: "HAJ", certPrefix: "TK-HAJ", nameAr: "تأمين الحج والعمرة", nameEn: "Hajj & Umrah", classCode: "PA", compulsory: false, wakalaPct: 35, tabarruPct: 65, illustrative: true,
    ratingAr: "لكل حاج 120 د.ل، لكل معتمر 65 د.ل", ratingEn: "Per pilgrim: Hajj LYD 120, Umrah LYD 65",
    treatyIds: [], splitRuleId: "SR-HAJ-2", ssbResolutionId: "SSB-2025-04", sharia_status: "compliant",
    claimDocs: ["claim_form", "passport_copy", "medical_report", "invoices"] },
];
export const productById = indexBy(products) as Record<ProductCode, Product>;

const SPLIT_V1: Record<ProductCode, number> = { CMP: 30, MTR: 30, ORC: 30, TRV: 33, FIR: 25, MAR: 25, HAJ: 33 };
export const splitRules: SplitRule[] = products.flatMap((p) => [
  { id: `SR-${p.id}-1`, productId: p.id, version: 1, wakalaPct: SPLIT_V1[p.id], tabarruPct: 100 - SPLIT_V1[p.id], investmentPct: 0,
    effectiveFrom: "2025-01-01", ssbResolutionId: "SSB-2025-09", status: "superseded" as const, illustrative: true },
  { id: `SR-${p.id}-2`, productId: p.id, version: 2, wakalaPct: p.wakalaPct, tabarruPct: p.tabarruPct, investmentPct: 0,
    effectiveFrom: "2026-01-01", ssbResolutionId: "SSB-2026-01", status: "approved" as const, illustrative: true },
]);

export const uwRules: UwRule[] = [
  { id: "UW-MTR-01", productIds: ["MTR"], nameAr: "قبول تلقائي – شامل مركبات", nameEn: "Auto-accept – comprehensive motor",
    conditionAr: "عمر المركبة ≤ 10 سنوات وقيمتها ≤ 150,000 د.ل وسائق مرخص", conditionEn: "Vehicle age ≤ 10 years, value ≤ LYD 150,000, licensed driver", outcome: "auto_accept" },
  { id: "UW-MTR-02", productIds: ["MTR"], nameAr: "مركبة عالية القيمة", nameEn: "High-value vehicle",
    conditionAr: "قيمة المركبة > 150,000 د.ل", conditionEn: "Vehicle value > LYD 150,000", outcome: "refer", referTo: "senior_underwriter" },
  { id: "UW-MTR-03", productIds: ["MTR"], nameAr: "مركبة قديمة", nameEn: "Old vehicle",
    conditionAr: "عمر المركبة > 15 سنة", conditionEn: "Vehicle age > 15 years", outcome: "decline" },
  { id: "UW-FIR-01", productIds: ["FIR"], nameAr: "مبلغ تأمين كبير", nameEn: "Large sum insured",
    conditionAr: "مبلغ التأمين > 5,000,000 د.ل (يتطلب فحص إعادة التكافل)", conditionEn: "Sum insured > LYD 5,000,000 (retakaful check required)", outcome: "refer", referTo: "gm" },
  { id: "UW-FIR-02", productIds: ["FIR"], nameAr: "نشاط خطر", nameEn: "Hazardous occupancy",
    conditionAr: "محطات وقود أو مخازن مواد قابلة للاشتعال أو غياب شهادة السلامة", conditionEn: "Fuel stations, flammable stores or missing fire-safety certificate", outcome: "refer", referTo: "uw_manager" },
  { id: "UW-MAR-01", productIds: ["MAR"], nameAr: "شحنة كبيرة", nameEn: "Large cargo",
    conditionAr: "قيمة الشحنة > 1,000,000 د.ل (إعادة تكافل اختيارية)", conditionEn: "Cargo value > LYD 1,000,000 (facultative retakaful)", outcome: "refer", referTo: "uw_manager" },
  { id: "UW-TRV-01", productIds: ["TRV"], nameAr: "مسافر كبير السن", nameEn: "Senior traveller",
    conditionAr: "العمر > 75 سنة", conditionEn: "Age > 75", outcome: "refer", referTo: "senior_underwriter" },
  { id: "UW-GEN-01", productIds: ["CMP", "MTR", "ORC", "TRV", "FIR", "MAR", "HAJ"], nameAr: "شخص مُعرّض سياسياً", nameEn: "Politically exposed person",
    conditionAr: "العميل مصنف PEP (عناية واجبة معززة)", conditionEn: "Customer flagged PEP (enhanced due diligence)", outcome: "refer", referTo: "uw_manager" },
];

export const approvalMatrix: ApprovalMatrixRow[] = [
  { id: "AM-UW-1", area: "underwriting", level: "underwriter", levelAr: "مكتتب", levelEn: "Underwriter", limit: 150000 },
  { id: "AM-UW-2", area: "underwriting", level: "senior_underwriter", levelAr: "مكتتب أول", levelEn: "Senior underwriter", limit: 500000, personaId: "uw" },
  { id: "AM-UW-3", area: "underwriting", level: "uw_manager", levelAr: "مدير الاكتتاب", levelEn: "Underwriting manager", limit: 5000000, personaId: "uw" },
  { id: "AM-UW-4", area: "underwriting", level: "gm", levelAr: "المدير العام", levelEn: "General manager", limit: null, personaId: "gm" },
  { id: "AM-CL-1", area: "claims", level: "claims_manager", levelAr: "مدير المطالبات", levelEn: "Claims manager", limit: 20000, personaId: "claims" },
  { id: "AM-CL-2", area: "claims", level: "cfo", levelAr: "المدير المالي", levelEn: "CFO", limit: 100000, personaId: "cfo" },
  { id: "AM-CL-3", area: "claims", level: "gm", levelAr: "المدير العام", levelEn: "General manager", limit: null, personaId: "gm" },
];
const claimApprover = (amt: number): ApprovalLevel => (amt <= 20000 ? "claims_manager" : amt <= 100000 ? "cfo" : "gm");

// =====================================================================================
// Agents & commission (M04)
// =====================================================================================

export const commissionTiers: CommissionTier[] = [
  { id: "T1", nameAr: "الشريحة الأولى", nameEn: "Tier 1", from: 0, to: 50000, ratePct: 7.5 },
  { id: "T2", nameAr: "الشريحة الثانية", nameEn: "Tier 2", from: 50000, to: 150000, ratePct: 10 },
  { id: "T3", nameAr: "الشريحة الثالثة", nameEn: "Tier 3", from: 150000, to: null, ratePct: 12.5 },
];
/** Compulsory products pay a flat regulated rate regardless of tier (illustrative). */
export const COMPULSORY_COMMISSION_PCT = 5;
const tierFor = (collected: number) => commissionTiers.find((t) => collected >= t.from && (t.to === null || collected < t.to))!;

const AG = (id: string, nameAr: string, nameEn: string, kind: Agent["kind"], outletId: string, licenceExpiry: string,
  prods: ProductCode[], targetAnnual: number, collectedYtd: number, months: [number, number, number], status: Agent["status"] = "active") =>
  ({ a: { id, nameAr, nameEn, kind, outletId, licenceNo: `ISA-AG-${pad(+id.slice(3) + 40, 4)}`, licenceExpiry, products: prods, targetAnnual, collectedYtd,
    tierId: tierFor(months[2] || months[1]).id, phone: fakePhone(500 + +id.slice(3)), status } as Agent, months });

const AGENT_DEFS = [
  AG("AG-01", "مكتب السلام للتأمين", "Al-Salam Insurance Office", "agent", "BR-MIS", "2027-06-30", ["MTR", "CMP", "FIR", "TRV"], 1200000, 968400, [98200, 96400, 104900]),
  AG("AG-02", "مكتب الأمان للخدمات التأمينية", "Al-Aman Insurance Services", "agent", "BR-TRP", "2027-03-31", ["MTR", "FIR", "TRV", "HAJ"], 2400000, 1985000, [212000, 188500, 201300]),
  AG("AG-03", "وكالة الهدى للتأمين", "Al-Huda Insurance Agency", "agent", "BR-BEN", "2026-12-15", ["MTR", "FIR", "CMP"], 1800000, 1402600, [151200, 139800, 146000]),
  AG("AG-04", "مكتب النجمة للوساطة التأمينية", "Al-Najma Insurance Brokerage", "broker", "BR-TRP", "2027-09-30", ["FIR", "MTR", "MAR"], 3000000, 2615000, [265000, 248700, 281400]),
  AG("AG-05", "وكالة الجنوب للتأمين", "Al-Janoub Insurance Agency", "agent", "BR-SEB", "2027-01-31", ["CMP", "FIR", "MTR"], 600000, 428300, [44100, 47900, 52600]),
  AG("AG-06", "مكتب الساحل الغربي للتأمين", "West Coast Insurance Office", "agent", "BR-ZUW", "2027-05-31", ["MAR", "CMP", "MTR"], 500000, 391800, [38900, 41200, 43700]),
  AG("AG-07", "مكتب العبور – رأس اجدير", "Al-Oboor Office – Ras Ajdir", "border_agent", "BP-RAJ", "2027-02-28", ["ORC", "CMP"], 900000, 812300, [118600, 92400, 71800]),
  AG("AG-08", "مكتب الميناء للتأمين البحري", "Port Marine Insurance Office", "border_agent", "BP-PRT", "2027-04-30", ["MAR"], 1100000, 846000, [79500, 88100, 93400]),
  AG("AG-09", "مكتب المطار للتأمين", "Airport Insurance Desk", "border_agent", "BP-MJI", "2027-08-31", ["TRV"], 700000, 588200, [82300, 54600, 47100]),
  AG("AG-10", "مكتب الرواد للوساطة", "Al-Rowad Brokerage", "broker", "BR-BEN", "2026-09-30", ["MTR", "FIR"], 800000, 512400, [61200, 48300, 0], "suspended"),
];
export const agents: Agent[] = AGENT_DEFS.map((d) => d.a);
export const agentById = indexBy(agents);
export const agentMonths: AgentMonth[] = AGENT_DEFS.flatMap((d) =>
  (["2026-08", "2026-09", "2026-10"] as const).map((month, i) => {
    const collected = d.months[i];
    const t = tierFor(collected);
    return { agentId: d.a.id, month, target: round3(d.a.targetAnnual / 12), collected, tierId: t.id, ratePct: t.ratePct,
      commission: round3((collected * t.ratePct) / 100), status: i < 2 ? "paid" : "pending" } as AgentMonth;
  }),
);

// =====================================================================================
// Policies (M06) — 60 certificates. Specs are hand-written; amounts are rated.
// =====================================================================================

type Veh = "car_small" | "car_large" | "truck" | "bus";
interface PSpec {
  n: number; p: ProductCode; c: number; o: string; a?: string; s: string; plan?: BillingPlan; si?: number;
  veh?: Veh; car?: [string, string, number]; days?: number; zone?: "arab" | "schengen" | "world"; age?: number;
  pax?: number; umrah?: boolean; risk?: [string, string]; cancel?: [string, string, string]; unpaid?: number[]; renewalOf?: number;
}
const S: PSpec[] = [
  // ---- issued in 2025
  { n: 1, p: "MTR", c: 1001, o: "BR-MIS", a: "AG-01", s: "2025-03-01", si: 52000, car: ["هيونداي إلنترا", "Hyundai Elantra", 2017] },
  { n: 2, p: "CMP", c: 1002, o: "LO-TRP", s: "2025-01-15", veh: "car_small", car: ["كيا بيكانتو", "Kia Picanto", 2019] },
  { n: 3, p: "FIR", c: 1040, o: "BR-TRP", a: "AG-04", s: "2025-04-01", plan: "quarterly", si: 6500000, risk: ["مجمع تجاري من 3 طوابق – طرابلس", "3-storey commercial complex – Tripoli"] },
  { n: 4, p: "TRV", c: 1010, o: "BP-MJI", a: "AG-09", s: "2025-07-10", days: 21, zone: "schengen", age: 34 },
  { n: 5, p: "HAJ", c: 1036, o: "BR-TRP", a: "AG-02", s: "2025-05-20", pax: 40 },
  { n: 6, p: "CMP", c: 1008, o: "LO-MIS", s: "2025-06-01", veh: "car_large", car: ["تويوتا كامري", "Toyota Camry", 2020] },
  { n: 7, p: "MTR", c: 1013, o: "BR-BEN", a: "AG-03", s: "2025-11-10", plan: "2_instalments", si: 64000, car: ["نيسان سنترا", "Nissan Sentra", 2021] },
  { n: 8, p: "CMP", c: 1004, o: "LO-MIS", s: "2025-11-20", veh: "car_small", car: ["هيونداي أكسنت", "Hyundai Accent", 2018] },
  { n: 9, p: "MTR", c: 1023, o: "BR-TRP", a: "AG-02", s: "2025-11-25", plan: "2_instalments", si: 98000, car: ["كيا سبورتاج", "Kia Sportage", 2023] },
  { n: 10, p: "FIR", c: 1035, o: "BR-BEN", a: "AG-03", s: "2025-12-01", plan: "quarterly", si: 3800000, risk: ["مصنع بلاستيك – المنطقة الصناعية، بنغازي", "Plastics factory – industrial zone, Benghazi"] },
  { n: 11, p: "CMP", c: 1016, o: "LO-BEN", s: "2025-11-05", veh: "truck", car: ["مرسيدس أكتروس (شاحنة)", "Mercedes Actros (truck)", 2015] },
  { n: 12, p: "MTR", c: 1037, o: "BR-BEN", a: "AG-03", s: "2025-11-15", plan: "quarterly", si: 145000, car: ["أسطول: 3 شاحنات إيسوزو", "Fleet: 3 Isuzu trucks", 2020], unpaid: [4] },
  { n: 13, p: "ORC", c: 1019, o: "BP-RAJ", a: "AG-07", s: "2025-08-01", days: 30, car: ["تويوتا هايلكس", "Toyota Hilux", 2019] },
  { n: 14, p: "CMP", c: 1021, o: "LO-TRP", s: "2025-02-10", veh: "car_small", car: ["شيفروليه أفيو", "Chevrolet Aveo", 2012] },
  { n: 15, p: "MAR", c: 1034, o: "BP-PRT", a: "AG-08", s: "2025-09-15", si: 1250000, risk: ["أرز وسكر – ميناء طرابلس (من مرسين)", "Rice and sugar – Tripoli port (from Mersin)"] },
  { n: 16, p: "TRV", c: 1003, o: "BP-MJI", s: "2025-12-20", days: 14, zone: "arab", age: 41 },
  { n: 17, p: "MTR", c: 1006, o: "BR-BEN", a: "AG-03", s: "2025-03-15", si: 71000, car: ["هيونداي توسان", "Hyundai Tucson", 2019] },
  // ---- issued in 2026
  { n: 18, p: "MTR", c: 1001, o: "BR-MIS", a: "AG-01", s: "2026-03-01", plan: "2_instalments", si: 78000, car: ["تويوتا كورولا", "Toyota Corolla", 2022] },
  { n: 19, p: "CMP", c: 1002, o: "LO-TRP", s: "2026-01-15", veh: "car_small", car: ["كيا بيكانتو", "Kia Picanto", 2019], renewalOf: 2 },
  { n: 20, p: "CMP", c: 1031, o: "LO-TRP", s: "2026-02-03", veh: "car_large", car: ["هيونداي سوناتا", "Hyundai Sonata", 2018] },
  { n: 21, p: "CMP", c: 1008, o: "LO-MIS", s: "2026-06-01", veh: "car_large", car: ["تويوتا كامري", "Toyota Camry", 2020], renewalOf: 6 },
  { n: 22, p: "CMP", c: 1012, o: "BR-SEB", s: "2026-02-18", veh: "truck", car: ["فولفو FH (شاحنة)", "Volvo FH (truck)", 2016] },
  { n: 23, p: "CMP", c: 1024, o: "BR-SEB", a: "AG-05", s: "2026-04-07", veh: "car_large", car: ["تويوتا لاندكروزر", "Toyota Land Cruiser", 2017] },
  { n: 24, p: "CMP", c: 1029, o: "LO-MIS", s: "2026-06-12", veh: "car_small", car: ["كيا ريو", "Kia Rio", 2020] },
  { n: 25, p: "CMP", c: 1018, o: "LO-BEN", s: "2026-07-03", veh: "car_large", car: ["نيسان باترول", "Nissan Patrol", 2018] },
  { n: 26, p: "CMP", c: 1028, o: "LO-TRP", s: "2026-08-21", veh: "bus", car: ["حافلة تويوتا كوستر", "Toyota Coaster bus", 2014] },
  { n: 27, p: "CMP", c: 1026, o: "BR-SEB", a: "AG-05", s: "2026-09-09", veh: "car_small", car: ["سوزوكي سويفت", "Suzuki Swift", 2021] },
  { n: 28, p: "CMP", c: 1014, o: "LO-TRP", s: "2026-10-02", veh: "car_small", car: ["هيونداي i10", "Hyundai i10", 2022],
    cancel: ["2026-10-20", "إلغاء: شهادة مكررة صادرة بالخطأ", "Cancelled: duplicate certificate issued in error"] },
  { n: 29, p: "MTR", c: 1003, o: "BR-BEN", a: "AG-03", s: "2026-01-20", si: 56000, car: ["كيا سيراتو", "Kia Cerato", 2021] },
  { n: 30, p: "MTR", c: 1005, o: "BR-TRP", a: "AG-04", s: "2026-04-15", plan: "quarterly", si: 235000, car: ["لكزس ES", "Lexus ES", 2024] },
  { n: 31, p: "MTR", c: 1008, o: "BR-MIS", a: "AG-01", s: "2026-05-02", plan: "2_instalments", si: 61000, car: ["هيونداي إلنترا", "Hyundai Elantra", 2023] },
  { n: 32, p: "MTR", c: 1010, o: "BR-TRP", s: "2026-06-10", si: 88000, car: ["مازدا CX-5", "Mazda CX-5", 2022] },
  { n: 33, p: "MTR", c: 1020, o: "BR-MIS", a: "AG-01", s: "2026-07-18", plan: "2_instalments", si: 47000, car: ["كيا بيكانتو", "Kia Picanto", 2023], unpaid: [2] },
  { n: 34, p: "MTR", c: 1027, o: "BR-BEN", a: "AG-03", s: "2026-08-05", plan: "quarterly", si: 69000, car: ["تويوتا ياريس", "Toyota Yaris", 2024] },
  { n: 35, p: "MTR", c: 1017, o: "BR-TRP", a: "AG-02", s: "2026-09-12", plan: "2_instalments", si: 115000, car: ["تويوتا راف 4", "Toyota RAV4", 2023] },
  { n: 36, p: "MTR", c: 1006, o: "BR-BEN", a: "AG-03", s: "2026-03-20", si: 73000, car: ["هيونداي توسان", "Hyundai Tucson", 2019], renewalOf: 17,
    cancel: ["2026-06-30", "إلغاء بطلب العميل: بيع المركبة", "Cancelled at customer request: vehicle sold"] },
  { n: 37, p: "ORC", c: 1019, o: "BP-RAJ", a: "AG-07", s: "2026-07-01", days: 30, car: ["تويوتا هايلكس", "Toyota Hilux", 2019] },
  { n: 38, p: "ORC", c: 1025, o: "BP-RAJ", a: "AG-07", s: "2026-07-20", days: 15, car: ["كيا سورينتو", "Kia Sorento", 2020] },
  { n: 39, p: "ORC", c: 1030, o: "BP-RAJ", a: "AG-07", s: "2026-08-02", days: 90, car: ["فولكس فاغن باسات", "Volkswagen Passat", 2016] },
  { n: 40, p: "ORC", c: 1011, o: "BP-RAJ", a: "AG-07", s: "2026-09-25", days: 90, car: ["هيونداي سانتا في", "Hyundai Santa Fe", 2021] },
  { n: 41, p: "ORC", c: 1009, o: "BP-RAJ", s: "2026-10-12", days: 30, car: ["تويوتا كورولا", "Toyota Corolla", 2018] },
  { n: 42, p: "ORC", c: 1022, o: "BP-RAJ", a: "AG-07", s: "2026-06-15", days: 15, car: ["نيسان صني", "Nissan Sunny", 2019] },
  { n: 43, p: "ORC", c: 1015, o: "BP-RAJ", s: "2026-10-25", days: 15, car: ["ميتسوبيشي باجيرو", "Mitsubishi Pajero", 2017] },
  { n: 44, p: "TRV", c: 1010, o: "BP-MJI", a: "AG-09", s: "2026-07-05", days: 21, zone: "schengen", age: 35 },
  { n: 45, p: "TRV", c: 1017, o: "BP-MJI", a: "AG-09", s: "2026-08-01", days: 14, zone: "arab", age: 29 },
  { n: 46, p: "TRV", c: 1022, o: "BP-MJI", s: "2026-09-03", days: 30, zone: "world", age: 46 },
  { n: 47, p: "TRV", c: 1025, o: "BR-TRP", a: "AG-02", s: "2026-10-20", days: 10, zone: "arab", age: 52 },
  { n: 48, p: "TRV", c: 1007, o: "BR-BEN", s: "2026-06-20", days: 30, zone: "schengen", age: 68 },
  { n: 49, p: "TRV", c: 1032, o: "BR-BEN", s: "2026-10-15", days: 7, zone: "arab", age: 68 },
  { n: 50, p: "FIR", c: 1040, o: "BR-TRP", a: "AG-04", s: "2026-04-01", plan: "quarterly", si: 6500000, risk: ["مجمع تجاري من 3 طوابق – طرابلس", "3-storey commercial complex – Tripoli"], renewalOf: 3, unpaid: [3] },
  { n: 51, p: "FIR", c: 1033, o: "BR-TRP", a: "AG-02", s: "2026-02-01", plan: "quarterly", si: 2200000, risk: ["مقر ومستودعات شركة مقاولات – تاجوراء", "Contractor HQ and warehouses – Tajoura"] },
  { n: 52, p: "FIR", c: 1038, o: "BR-SEB", a: "AG-05", s: "2026-05-10", plan: "2_instalments", si: 950000, risk: ["مستودع مواد غذائية – سبها", "Food warehouse – Sebha"] },
  { n: 53, p: "FIR", c: 1029, o: "BR-MIS", a: "AG-01", s: "2026-03-15", plan: "2_instalments", si: 420000, risk: ["منزل سكني – مصراتة", "Private house – Misrata"] },
  { n: 54, p: "FIR", c: 1023, o: "BR-TRP", s: "2026-09-01", si: 380000, risk: ["شقة سكنية – طرابلس", "Apartment – Tripoli"] },
  { n: 55, p: "MAR", c: 1034, o: "BP-PRT", a: "AG-08", s: "2026-03-10", si: 1450000, risk: ["دقيق ومعكرونة – ميناء طرابلس (من مرسين)", "Flour and pasta – Tripoli port (from Mersin)"] },
  { n: 56, p: "MAR", c: 1039, o: "BR-ZUW", a: "AG-06", s: "2026-06-01", si: 380000, risk: ["أسماك مجمدة – تصدير من زوارة إلى مالطا", "Frozen fish – export Zuwara to Malta"] },
  { n: 57, p: "MAR", c: 1038, o: "BP-PRT", a: "AG-08", s: "2026-09-20", si: 640000, risk: ["مواد بناء – ميناء طرابلس (من الإسكندرية)", "Building materials – Tripoli port (from Alexandria)"] },
  { n: 58, p: "HAJ", c: 1036, o: "BR-TRP", a: "AG-02", s: "2026-05-10", pax: 55 },
  { n: 59, p: "HAJ", c: 1036, o: "BR-TRP", a: "AG-02", s: "2026-01-25", plan: "2_instalments", pax: 30, umrah: true },
  { n: 60, p: "HAJ", c: 1013, o: "BR-BEN", s: "2026-10-05", pax: 4, umrah: true },
];

const VEH_TARIFF: Record<Veh, number> = { car_small: 165, car_large: 210, bus: 380, truck: 420 };
const ORC_TARIFF: Record<number, number> = { 15: 95, 30: 160, 90: 380 };
const TRV_DAY: Record<string, number> = { arab: 2.5, schengen: 3.5, world: 4.5 };
const ZONE: Record<string, [string, string]> = { arab: ["الدول العربية", "Arab countries"], schengen: ["دول شنغن", "Schengen"], world: ["عالمي", "Worldwide"] };

function rate(s: PSpec): number {
  switch (s.p) {
    case "CMP": return VEH_TARIFF[s.veh!];
    case "MTR": return round3(Math.max(900, s.si! * 0.035));
    case "ORC": return ORC_TARIFF[s.days!];
    case "TRV": return round3(Math.max(45, TRV_DAY[s.zone!] * s.days! * ((s.age ?? 30) > 65 ? 1.5 : 1)));
    case "FIR": return round3(Math.max(500, s.si! * 0.0015));
    case "MAR": return round3(Math.max(350, s.si! * 0.0035));
    case "HAJ": return s.pax! * (s.umrah ? 65 : 120);
  }
}
function endDate(s: PSpec): string {
  if (s.p === "ORC" || s.p === "TRV") return addDays(s.s, s.days! - 1);
  if (s.p === "MAR") return addDays(s.s, 59);
  if (s.p === "HAJ") return addDays(s.s, 44);
  return addDays(addMonths(s.s, 12), -1);
}
const CERT_DAILY: Record<ProductCode, number> = { CMP: 300, MTR: 3, ORC: 60, TRV: 25, FIR: 1, MAR: 1, HAJ: 2 };
function certNo(s: PSpec): string {
  const y = s.s.slice(0, 4);
  const seq = s.n === 18 ? 184 : dayOfYear(s.s) * CERT_DAILY[s.p] + (s.n % 3) + 1;
  return `${productById[s.p].certPrefix}-${y}-${pad(seq, 6)}`;
}
function riskText(s: PSpec): [string, string] {
  if (s.risk) return s.risk;
  if (s.car) {
    const plate = `${(s.n % 60) + 5}-${pad(100000 + s.n * 731, 6)}`;
    return [`${s.car[0]} ${s.car[2]} – لوحة ${plate}`, `${s.car[1]} ${s.car[2]} – plate ${plate}`];
  }
  if (s.p === "TRV") return [`${s.days} يوماً – ${ZONE[s.zone!][0]} – عمر المسافر ${s.age}`, `${s.days} days – ${ZONE[s.zone!][1]} – traveller age ${s.age}`];
  if (s.p === "HAJ") return s.umrah ? [`عمرة – ${s.pax} معتمراً`, `Umrah – ${s.pax} pilgrims`] : [`حج – ${s.pax} حاجاً`, `Hajj – ${s.pax} pilgrims`];
  return ["", ""];
}
const sumInsuredOf = (s: PSpec) => (s.p === "TRV" ? 250000 : s.p === "HAJ" ? s.pax! * 20000 : s.si ?? 0);

const polId = (n: number) => `POL-${pad(n, 4)}`;
const cusId = (n: number) => `CUS-${n}`;

// ---- 2025 surplus parameters (needed to price renewal discounts)
export const SURPLUS_RATIO = 0.05; // distributable / eligible contributions (2,956,000 / 59,120,000)
const SURPLUS_POSTED = "2026-02-16";

// Pass 1: rated contributions
const gross: Record<number, number> = {};
for (const s of S) gross[s.n] = rate(s);

// Sample participants of 2025 and their settlement choice
const contrib2025: Record<string, number> = {};
for (const s of S) if (s.s < "2026-01-01") contrib2025[cusId(s.c)] = round3((contrib2025[cusId(s.c)] ?? 0) + gross[s.n]);
const creditPolicy: Record<string, number> = {};
for (const cid of Object.keys(contrib2025)) {
  const next = S.filter((s) => cusId(s.c) === cid && s.s >= SURPLUS_POSTED && !s.cancel).sort((a, b) => a.s.localeCompare(b.s))[0];
  if (next) creditPolicy[cid] = next.n;
}

export const policies: Policy[] = S.map((s) => {
  const wakalaPct = s.s < "2026-01-01" ? SPLIT_V1[s.p] : productById[s.p].wakalaPct;
  const contribution = gross[s.n];
  const wakala = round3((contribution * wakalaPct) / 100);
  const cid = cusId(s.c);
  const surplusCredit = creditPolicy[cid] === s.n ? round3(contrib2025[cid] * SURPLUS_RATIO) : 0;
  const end = endDate(s);
  const [riskAr, riskEn] = riskText(s);
  const isBorder = s.o.startsWith("BP-") || s.o.startsWith("LO-");
  return {
    id: polId(s.n), certNo: certNo(s), productId: s.p, customerId: cid, outletId: s.o, agentId: s.a,
    renewalOfId: s.renewalOf ? polId(s.renewalOf) : undefined,
    issuedAt: s.s, start: s.s, end,
    status: s.cancel ? "cancelled" : end < TODAY ? "expired" : "active",
    cancelledAt: s.cancel?.[0], cancelReasonAr: s.cancel?.[1], cancelReasonEn: s.cancel?.[2],
    sumInsured: sumInsuredOf(s), riskAr, riskEn, contribution, wakalaPct, wakala, tabarru: round3(contribution - wakala),
    surplusCredit, netPayable: round3(contribution - surplusCredit), billingPlan: s.plan ?? "single",
    splitRuleId: `SR-${s.p}-${s.s < "2026-01-01" ? 1 : 2}`,
    issuedByPersonaId: isBorder ? "border" : "uw", sharia_status: "compliant",
  } as Policy;
});
export const policyById = indexBy(policies);
const P = (n: number) => policyById[polId(n)];

// =====================================================================================
// Instalments & receipts (M07)
// =====================================================================================

export const instalments: Instalment[] = [];
for (const s of S) {
  const pol = P(s.n);
  const k = pol.billingPlan === "single" ? 1 : pol.billingPlan === "2_instalments" ? 2 : 4;
  const step = pol.billingPlan === "2_instalments" ? 3 : 3;
  const each = round3(pol.netPayable / k);
  for (let i = 1; i <= k; i++) {
    const due = addMonths(pol.start, (i - 1) * step);
    const amount = i < k ? each : round3(pol.netPayable - each * (k - 1));
    const unpaid = s.unpaid?.includes(i);
    instalments.push({ id: `INS-${pad(s.n, 4)}-${i}`, policyId: pol.id, seq: i, dueDate: due, amount,
      status: due > TODAY ? "due" : unpaid ? "overdue" : "paid" });
  }
}

const HERO_CHANNELS: PaymentChannel[] = ["cash_branch", "card_moamalat"];
const rcptDraft: Omit<Receipt, "id">[] = [];
for (const ins of instalments) {
  if (ins.status !== "paid") continue;
  const pol = policyById[ins.policyId];
  const cust = customers.find((c) => c.id === pol.customerId)!;
  const isHero = pol.id === polId(18);
  const offset = isHero ? 0 : Math.floor(rng() * 3);
  const date = [addDays(ins.dueDate, offset), TODAY].sort()[0];
  const channel: PaymentChannel = isHero ? HERO_CHANNELS[ins.seq - 1]
    : pol.outletId.startsWith("BP-") ? "cash_border"
    : cust.type === "company" ? "bank_transfer"
    : pick(["cash_branch", "cash_branch", "card_moamalat", "card_moamalat", "bank_transfer"] as const);
  const wakala = round3((ins.amount * pol.wakalaPct) / 100);
  rcptDraft.push({ date, policyId: pol.id, customerId: pol.customerId, instalmentId: ins.id, outletId: pol.outletId, channel,
    amount: ins.amount, wakala, tabarru: round3(ins.amount - wakala), sharia_status: "compliant",
    gatewayRef: channel === "card_moamalat" ? `MOA-${pad(Math.floor(rng() * 1e8), 8)}` : channel === "bank_transfer" ? `TRF-${pad(Math.floor(rng() * 1e6), 6)}` : undefined });
}
rcptDraft.sort((a, b) => a.date.localeCompare(b.date) || a.instalmentId.localeCompare(b.instalmentId));
const rcSeq: Record<string, number> = { "2025": 2400, "2026": 0 };
export const receipts: Receipt[] = rcptDraft.map((r) => {
  const y = r.date.slice(0, 4);
  rcSeq[y] = y === "2026" ? Math.max(rcSeq[y], dayOfYear(r.date) * 55) + 1 + Math.floor(rng() * 20) : rcSeq[y] + 40 + Math.floor(rng() * 120);
  return { id: `RC-${y}-${pad(rcSeq[y], 6)}`, ...r };
});
export const receiptById = indexBy(receipts);
for (const r of receipts) instalments.find((i) => i.id === r.instalmentId)!.receiptId = r.id;

// ---- Sample commission lines (paid from SHF, on collected contributions only)
const agentRateAt = (agentId: string, month: string): number => {
  const am = agentMonths.find((m) => m.agentId === agentId && m.month === month);
  return am && am.collected > 0 ? am.ratePct : commissionTiers.find((t) => t.id === agentById[agentId].tierId)!.ratePct;
};
export const commissionLines: CommissionLine[] = [];
for (const r of receipts) {
  const pol = policyById[r.policyId];
  if (!pol.agentId || r.date < GL_START) continue;
  const ratePct = pol.productId === "CMP" ? COMPULSORY_COMMISSION_PCT : agentRateAt(pol.agentId, ym(r.date));
  commissionLines.push({ id: `COM-${pad(commissionLines.length + 1, 4)}`, agentId: pol.agentId, policyId: pol.id, receiptId: r.id, date: r.date,
    base: r.amount, ratePct, amount: round3((r.amount * ratePct) / 100), kind: "earned", status: ym(r.date) < "2026-10" ? "paid" : "pending",
    fund: "SHF", sharia_status: "compliant" });
}
for (const pol of policies.filter((p) => p.status === "cancelled" && p.agentId)) {
  for (const l of commissionLines.filter((c) => c.policyId === pol.id && c.kind === "earned"))
    commissionLines.push({ ...l, id: `COM-${pad(commissionLines.length + 1, 4)}`, date: pol.cancelledAt!, amount: -l.amount, kind: "clawback",
      status: ym(pol.cancelledAt!) < "2026-10" ? "paid" : "pending" });
}

// =====================================================================================
// Quotes (M05)
// =====================================================================================

const quoteNo = (date: string, n: number) => `Q-${date.slice(0, 4)}-${pad(dayOfYear(date) * 7 + (n % 7), 5)}`;
const ref = (level: ApprovalLevel, personaId: string, decision: "pending" | "approved" | "declined", noteAr: string, noteEn: string, decidedAt?: string) =>
  ({ level, assignedPersonaId: personaId, decision, decidedAt, noteAr, noteEn });

interface QSpec { n: number; rules: RuleHit[]; referral?: Quote["referral"] }
const QSPECS: QSpec[] = [
  { n: 18, rules: [{ ruleId: "UW-MTR-01", outcome: "auto_accept" }] },
  { n: 29, rules: [{ ruleId: "UW-MTR-01", outcome: "auto_accept" }] },
  { n: 30, rules: [{ ruleId: "UW-GEN-01", outcome: "refer" }, { ruleId: "UW-MTR-02", outcome: "refer" }],
    referral: ref("uw_manager", "uw", "approved", "اكتملت العناية الواجبة المعززة (PEP) – قبول بتحمل 1,000 د.ل", "Enhanced due diligence (PEP) completed – accepted with LYD 1,000 excess", "2026-04-13") },
  { n: 31, rules: [{ ruleId: "UW-MTR-01", outcome: "auto_accept" }] },
  { n: 32, rules: [{ ruleId: "UW-MTR-01", outcome: "auto_accept" }] },
  { n: 33, rules: [{ ruleId: "UW-MTR-01", outcome: "auto_accept" }] },
  { n: 34, rules: [{ ruleId: "UW-MTR-01", outcome: "auto_accept" }] },
  { n: 35, rules: [{ ruleId: "UW-MTR-01", outcome: "auto_accept" }] },
  { n: 50, rules: [{ ruleId: "UW-FIR-01", outcome: "refer" }],
    referral: ref("gm", "gm", "approved", "موافقة بعد التحقق من سعة اتفاقية فائض الخسارة", "Approved after checking excess-of-loss capacity", "2026-03-30") },
  { n: 51, rules: [] },
  { n: 53, rules: [] },
  { n: 55, rules: [{ ruleId: "UW-MAR-01", outcome: "refer" }],
    referral: ref("uw_manager", "uw", "approved", "موافقة مشروطة بإسناد اختياري 70%", "Approved subject to 70% facultative cession", "2026-03-08") },
  { n: 57, rules: [] },
];
export const quotes: Quote[] = [];
for (const q of QSPECS) {
  const pol = P(q.n);
  const date = addDays(pol.issuedAt, -3);
  const id = q.n === 18 ? "Q-2026-00412" : quoteNo(date, q.n);
  quotes.push({ id, date, customerId: pol.customerId, productId: pol.productId, outletId: pol.outletId, agentId: pol.agentId,
    sumInsured: pol.sumInsured, contribution: pol.contribution, riskAr: pol.riskAr, riskEn: pol.riskEn, rulesFired: q.rules,
    status: "issued", referral: q.referral, policyId: pol.id, sharia_status: "compliant" });
  pol.quoteId = id;
}
const extraQ = (id: string, date: string, c: number, p: ProductCode, o: string, si: number, contribution: number, risk: [string, string],
  rules: RuleHit[], status: Quote["status"], referral?: Quote["referral"], agentId?: string): Quote =>
  ({ id, date, customerId: cusId(c), productId: p, outletId: o, agentId, sumInsured: si, contribution, riskAr: risk[0], riskEn: risk[1],
    rulesFired: rules, status, referral, sharia_status: "compliant" });
quotes.push(
  extraQ("Q-2026-02121", "2026-10-29", 1023, "MTR", "BR-TRP", 310000, 10850, ["مرسيدس E-Class 2024", "Mercedes E-Class 2024"],
    [{ ruleId: "UW-MTR-02", outcome: "refer" }], "referred", ref("senior_underwriter", "uw", "pending", "قيمة المركبة تتجاوز حد القبول التلقائي", "Vehicle value above auto-accept limit"), "AG-02"),
  extraQ("Q-2026-02129", "2026-10-30", 1033, "FIR", "BR-TRP", 1800000, 2700, ["محطة وقود – تاجوراء", "Fuel station – Tajoura"],
    [{ ruleId: "UW-FIR-02", outcome: "refer" }], "referred", ref("uw_manager", "uw", "pending", "نشاط خطر: يلزم تقرير معاينة سلامة", "Hazardous occupancy: safety survey report required"), "AG-02"),
  extraQ("Q-2026-02136", "2026-11-01", 1021, "TRV", "BP-MJI", 250000, 157.5, ["30 يوماً – دول شنغن – عمر المسافر 79", "30 days – Schengen – traveller age 79"],
    [{ ruleId: "UW-TRV-01", outcome: "refer" }], "referred", ref("senior_underwriter", "uw", "pending", "مسافر فوق 75: يلزم إقرار صحي", "Traveller over 75: health declaration required")),
  extraQ("Q-2026-01716", "2026-09-02", 1026, "MTR", "BR-SEB", 28000, 980, ["تويوتا هايلكس 2008", "Toyota Hilux 2008"],
    [{ ruleId: "UW-MTR-03", outcome: "decline" }], "declined", undefined, "AG-05"),
  extraQ("Q-2026-01563", "2026-08-12", 1037, "FIR", "BR-BEN", 2600000, 3900, ["مستودع شاحنات – بنغازي (بدون شهادة سلامة)", "Truck depot – Benghazi (no fire-safety certificate)"],
    [{ ruleId: "UW-FIR-02", outcome: "refer" }], "declined", ref("uw_manager", "uw", "declined", "رفض: لا توجد شهادة سلامة من الدفاع المدني", "Declined: no civil-defence safety certificate", "2026-08-16"), "AG-03"),
  extraQ("Q-2026-02100", "2026-10-27", 1034, "MAR", "BP-PRT", 1800000, 6300, ["زيت طهي – ميناء طرابلس (من مرسين)", "Cooking oil – Tripoli port (from Mersin)"],
    [{ ruleId: "UW-MAR-01", outcome: "refer" }], "approved", ref("uw_manager", "uw", "approved", "موافقة مشروطة بإسناد اختياري – بانتظار السداد", "Approved subject to facultative cession – awaiting payment", "2026-10-28"), "AG-08"),
  extraQ("Q-2026-01274", "2026-06-28", 1009, "TRV", "BP-MJI", 250000, 52.5, ["21 يوماً – الدول العربية – عمر المسافر 44", "21 days – Arab countries – traveller age 44"], [], "expired"),
);
export const quoteById = indexBy(quotes);

// =====================================================================================
// Claims (M09) — 22 claims across the 6 stages + 2 rejected
// =====================================================================================

export const CLAIM_STAGES: ClaimStage[] = ["registered", "review", "assessed", "approved", "paid", "closed"];
export const CLAIM_STAGE_LABELS: Record<ClaimStage | "rejected", [string, string]> = {
  registered: ["مسجلة", "Registered"], review: ["مراجعة", "Under review"], assessed: ["مقدرة", "Assessed"],
  approved: ["موافق عليها", "Approved"], paid: ["مصروفة", "Paid"], closed: ["مغلقة", "Closed"], rejected: ["مرفوضة", "Rejected"],
};
export const CLAIM_DOC_LABELS: Record<ClaimDocKey, [string, string]> = {
  claim_form: ["نموذج المطالبة", "Claim form"], police_report: ["محضر الشرطة", "Police report"], driving_licence: ["رخصة القيادة", "Driving licence"],
  vehicle_registration: ["كتيب المركبة", "Vehicle registration"], photos: ["صور الأضرار", "Damage photos"], repair_estimate: ["تقدير الإصلاح", "Repair estimate"],
  medical_report: ["التقرير الطبي", "Medical report"], invoices: ["الفواتير", "Invoices"], civil_defence_report: ["تقرير الدفاع المدني", "Civil defence report"],
  bill_of_lading: ["بوليصة الشحن", "Bill of lading"], survey_report: ["تقرير المعاينة", "Survey report"], passport_copy: ["صورة جواز السفر", "Passport copy"],
  id_copy: ["صورة إثبات الهوية", "ID copy"],
};

export const surveyors: Surveyor[] = [
  { id: "SV-01", nameAr: "مكتب الدقة للمعاينة والتقدير", nameEn: "Al-Diqqa Survey & Assessment Office", cityAr: "مصراتة", cityEn: "Misrata", specialty: "motor", phone: fakePhone(801) },
  { id: "SV-02", nameAr: "مكتب الخبرة الفنية للمعاينة", nameEn: "Al-Khibra Technical Survey Office", cityAr: "طرابلس", cityEn: "Tripoli", specialty: "property", phone: fakePhone(802) },
  { id: "SV-03", nameAr: "مكتب برقة للمعاينة والتقدير", nameEn: "Barqa Survey & Assessment Office", cityAr: "بنغازي", cityEn: "Benghazi", specialty: "motor", phone: fakePhone(803) },
  { id: "SV-04", nameAr: "مكتب الأمواج للمعاينة البحرية", nameEn: "Al-Amwaj Marine Surveyors", cityAr: "طرابلس", cityEn: "Tripoli", specialty: "marine", phone: fakePhone(804) },
];

type StageDates = Partial<Record<ClaimStage | "rejected", string>>;
interface CSpec {
  id: string; n: number; loss: string; st: StageDates; r0: number; assessed?: number; ded?: number; sv?: string;
  d: [string, string]; loc: [string, string]; reject?: [string, string]; missing?: ClaimDocKey[]; recvd?: string; extra?: ClaimEvent[];
}
const CS: CSpec[] = [
  { id: "CLM-2026-00073", n: 18, loss: "2026-09-14", r0: 15000, assessed: 18400, ded: 500, sv: "SV-01", recvd: "2026-10-15",
    st: { registered: "2026-09-14", review: "2026-09-15", assessed: "2026-09-17", approved: "2026-09-20", paid: "2026-09-21", closed: "2026-09-28" },
    d: ["تصادم خلفي عند إشارة ضوئية؛ تضرر الصدام الخلفي وغطاء الصندوق والمصابيح الخلفية", "Rear-end collision at a traffic light; rear bumper, boot lid and tail lights damaged"],
    loc: ["الطريق الساحلي مصراتة – زليتن", "Coastal road Misrata – Zliten"] },
  { id: "CLM-2026-00018", n: 29, loss: "2026-02-22", r0: 5000, assessed: 6250, ded: 500, sv: "SV-03", recvd: "2026-04-20",
    st: { registered: "2026-02-23", review: "2026-02-24", assessed: "2026-02-26", approved: "2026-03-01", paid: "2026-03-02", closed: "2026-03-09" },
    d: ["احتكاك جانبي في موقف سيارات؛ تضرر الباب الأمامي والرفرف", "Side-swipe in a car park; front door and wing damaged"], loc: ["بنغازي – الفويهات", "Benghazi – Al-Fwayhat"] },
  { id: "CLM-2026-00021", n: 59, loss: "2026-02-10", r0: 3000, assessed: 3400, ded: 0,
    st: { registered: "2026-02-15", review: "2026-02-16", assessed: "2026-02-18", approved: "2026-02-19", paid: "2026-02-22", closed: "2026-03-01" },
    d: ["دخول معتمر المستشفى في مكة المكرمة (التهاب رئوي)؛ تكاليف العلاج", "Pilgrim hospitalised in Makkah (pneumonia); treatment costs"], loc: ["مكة المكرمة", "Makkah"] },
  { id: "CLM-2026-00027", n: 14, loss: "2026-03-02", r0: 4000, st: { registered: "2026-03-03", review: "2026-03-04", rejected: "2026-03-05" },
    reject: ["الشهادة منتهية في 2026-02-09؛ لا تغطية سارية بتاريخ الحادث", "Certificate expired on 2026-02-09; no cover in force at the loss date"],
    d: ["اصطدام بمركبة طرف ثالث عند دوار", "Collision with a third-party vehicle at a roundabout"], loc: ["غريان", "Gharyan"] },
  { id: "CLM-2026-00052", n: 55, loss: "2026-04-18", r0: 90000, assessed: 96000, ded: 1000, sv: "SV-04", recvd: "2026-07-12",
    st: { registered: "2026-04-20", review: "2026-04-21", assessed: "2026-05-05", approved: "2026-05-10", paid: "2026-05-12", closed: "2026-07-14" },
    d: ["تسرب مياه البحر إلى الحاوية؛ تلف 38 طناً من الدقيق", "Seawater ingress into the container; 38 tonnes of flour spoiled"], loc: ["ميناء طرابلس", "Tripoli port"] },
  { id: "CLM-2026-00061", n: 44, loss: "2026-07-12", r0: 8000, assessed: 7320, ded: 0,
    st: { registered: "2026-07-28", review: "2026-07-29", assessed: "2026-10-21", approved: "2026-10-22", paid: "2026-10-27" },
    extra: [
      { at: "2026-07-30T11:00", stage: "registered", byPersonaId: "claims", noteAr: "أعيدت للتسجيل: الفواتير الأصلية ناقصة", noteEn: "Returned to registered: original invoices missing" },
      { at: "2026-10-19T10:15", stage: "review", byPersonaId: "claims", noteAr: "استلام الفواتير الأصلية من المستشفى", noteEn: "Original hospital invoices received" },
    ],
    d: ["علاج طارئ في المستشفى أثناء السفر (التواء الكاحل وكسر)", "Emergency hospital treatment while travelling (ankle sprain and fracture)"], loc: ["ميونخ، ألمانيا", "Munich, Germany"] },
  { id: "CLM-2026-00066", n: 33, loss: "2026-08-28", r0: 12000, assessed: 15200, ded: 500, sv: "SV-01",
    st: { registered: "2026-08-30", review: "2026-08-31", assessed: "2026-09-03", rejected: "2026-09-06" },
    reject: ["السائق وقت الحادث بدون رخصة قيادة سارية (استثناء البند 4.2)", "Driver at the time of the accident held no valid licence (exclusion 4.2)"],
    d: ["انقلاب المركبة على طريق ترابي", "Vehicle rolled over on an unpaved road"], loc: ["مصراتة – طمينة", "Misrata – Tomina"] },
  { id: "CLM-2026-00077", n: 26, loss: "2026-09-30", r0: 25000, assessed: 22000, ded: 0, sv: "SV-02",
    st: { registered: "2026-10-01", review: "2026-10-04", assessed: "2026-10-12", approved: "2026-10-22", paid: "2026-10-27" },
    d: ["اصطدام حافلة بأحد المشاة؛ إصابة جسدية لطرف ثالث (علاج وتعويض حسب الجدول)", "Bus struck a pedestrian; third-party bodily injury (treatment and tariff compensation)"], loc: ["طرابلس – طريق الشط", "Tripoli – Al-Shatt road"] },
  { id: "CLM-2026-00079", n: 10, loss: "2026-10-05", r0: 220000, assessed: 252500, ded: 2500, sv: "SV-03",
    st: { registered: "2026-10-06", review: "2026-10-07", assessed: "2026-10-20", approved: "2026-10-28" },
    d: ["حريق في مخزن المواد الخام؛ تلف المخزون وجزء من السقف", "Fire in the raw-material store; stock and part of the roof destroyed"], loc: ["بنغازي – المنطقة الصناعية", "Benghazi – industrial zone"] },
  { id: "CLM-2026-00081", n: 31, loss: "2026-10-12", r0: 9000, assessed: 8640, ded: 500, sv: "SV-01",
    st: { registered: "2026-10-12", review: "2026-10-13", assessed: "2026-10-14", approved: "2026-10-15", paid: "2026-10-18" },
    d: ["اصطدام أمامي خفيف؛ تضرر الشبك الأمامي والمصباح", "Minor front collision; grille and headlamp damaged"], loc: ["مصراتة – شارع طرابلس", "Misrata – Tripoli Street"] },
  { id: "CLM-2026-00083", n: 35, loss: "2026-10-15", r0: 12000, assessed: 11780, ded: 500, sv: "SV-02",
    st: { registered: "2026-10-15", review: "2026-10-18", assessed: "2026-10-21", approved: "2026-10-26" },
    d: ["سقوط جسم صلب على المركبة أثناء أعمال بناء", "Falling object from a construction site hit the vehicle"], loc: ["طرابلس – حي الأندلس", "Tripoli – Hay Al-Andalus"] },
  { id: "CLM-2026-00085", n: 22, loss: "2026-10-18", r0: 6000, assessed: 5400, ded: 0, sv: "SV-02",
    st: { registered: "2026-10-18", review: "2026-10-19", assessed: "2026-10-22", approved: "2026-10-28" },
    d: ["شاحنة اصطدمت بمركبة متوقفة؛ أضرار مادية لطرف ثالث", "Truck hit a parked car; third-party property damage"], loc: ["سبها – الطريق الدائري", "Sebha – ring road"] },
  { id: "CLM-2026-00086", n: 40, loss: "2026-10-19", r0: 7000, assessed: 6880, ded: 0,
    st: { registered: "2026-10-21", review: "2026-10-22", assessed: "2026-10-29" },
    d: ["تصادم في بن قردان (تونس)؛ أضرار لمركبة طرف ثالث بموجب البطاقة البرتقالية", "Collision in Ben Gardane (Tunisia); third-party vehicle damage under the Orange Card"], loc: ["بن قردان، تونس", "Ben Gardane, Tunisia"] },
  { id: "CLM-2026-00087", n: 52, loss: "2026-10-20", r0: 45000, assessed: 38900, ded: 1000, sv: "SV-02",
    st: { registered: "2026-10-20", review: "2026-10-21", assessed: "2026-10-28" },
    d: ["انفجار أنبوب مياه وغرق المستودع؛ تلف بضائع غذائية", "Burst water pipe flooded the warehouse; food stock damaged"], loc: ["سبها", "Sebha"] },
  { id: "CLM-2026-00088", n: 30, loss: "2026-10-21", r0: 35000, assessed: 41500, ded: 500, sv: "SV-02",
    st: { registered: "2026-10-21", review: "2026-10-22", assessed: "2026-10-27" },
    d: ["اصطدام أمامي على طريق المطار؛ انتفاخ الوسائد الهوائية", "Front-end collision on the airport road; airbags deployed"], loc: ["طرابلس – طريق المطار", "Tripoli – airport road"] },
  { id: "CLM-2026-00089", n: 12, loss: "2026-10-22", r0: 28000, missing: ["police_report", "repair_estimate"],
    st: { registered: "2026-10-22", review: "2026-10-25" },
    d: ["انزلاق شاحنة من الأسطول على الطريق الساحلي", "Fleet truck skidded on the coastal road"], loc: ["أجدابيا – الطريق الساحلي", "Ajdabiya – coastal road"] },
  { id: "CLM-2026-00091", n: 9, loss: "2026-10-26", r0: 14000, missing: ["repair_estimate"], st: { registered: "2026-10-27", review: "2026-10-28" },
    d: ["اصطدام جانبي عند تقاطع", "Side impact at a junction"], loc: ["طرابلس – زاوية الدهماني", "Tripoli – Zawiyat Al-Dahmani"] },
  { id: "CLM-2026-00092", n: 34, loss: "2026-10-27", r0: 9500, missing: ["photos"], st: { registered: "2026-10-28", review: "2026-10-29" },
    d: ["تهشم الزجاج الأمامي وأضرار بالسقف بسبب البرد", "Windscreen smashed and roof dented by hail"], loc: ["بنغازي", "Benghazi"] },
  { id: "CLM-2026-00093", n: 24, loss: "2026-10-28", r0: 4000, missing: ["police_report"], st: { registered: "2026-10-29", review: "2026-11-01" },
    d: ["صدم دراجة نارية لطرف ثالث", "Hit a third-party motorcycle"], loc: ["مصراتة – الزروق", "Misrata – Al-Zarrouk"] },
  { id: "CLM-2026-00095", n: 46, loss: "2026-09-21", r0: 3500, st: { registered: "2026-10-29" },
    d: ["فقدان أمتعة وتأخر رحلة", "Lost baggage and flight delay"], loc: ["إسطنبول، تركيا", "Istanbul, Turkey"] },
  { id: "CLM-2026-00096", n: 53, loss: "2026-10-30", r0: 12000, st: { registered: "2026-11-01" },
    d: ["تسرب مياه من الخزان العلوي وتضرر الأسقف والأثاث", "Roof-tank leak damaged ceilings and furniture"], loc: ["مصراتة", "Misrata"] },
  { id: "CLM-2026-00098", n: 57, loss: "2026-10-27", r0: 30000, st: { registered: "2026-11-01" },
    d: ["نقص في عدد الطرود عند التفريغ (12 منصة)", "Shortage at discharge (12 pallets missing)"], loc: ["ميناء طرابلس", "Tripoli port"] },
];

const STAGE_NOTES: Record<ClaimStage | "rejected", [string, string]> = {
  registered: ["تسجيل المطالبة والتحقق من سريان التغطية وفتح احتياطي أولي", "Claim registered, cover validated, initial reserve opened"],
  review: ["تدقيق المستندات حسب قائمة المنتج", "Documents checked against the product checklist"],
  assessed: ["تقدير الضرر من المعاين وتحديث الاحتياطي", "Damage valued by the surveyor; reserve updated"],
  approved: ["اعتماد التعويض حسب مصفوفة الصلاحيات واحتساب حصة إعادة التكافل", "Compensation approved per the approval matrix; retakaful share calculated"],
  paid: ["إرسال أمر الدفع للحسابات والصرف من صندوق المشتركين", "Payment order sent to accounting; paid from the PTF"],
  closed: ["تأكيد الدفع وعدم وجود استردادات مفتوحة؛ إقفال", "Payment confirmed, no open recoveries; closed"],
  rejected: ["رفض المطالبة مع ذكر السبب", "Claim rejected with reason"],
};
const STAGE_PERSONA: Record<ClaimStage | "rejected", string> = {
  registered: "claims", review: "claims", assessed: "claims", approved: "claims", paid: "accountant", closed: "claims", rejected: "claims",
};
const STAGE_HOUR: Record<ClaimStage | "rejected", string> = { registered: "09:20", review: "10:05", assessed: "12:40", approved: "11:30", paid: "13:15", closed: "10:00", rejected: "12:00" };

export const claims: Claim[] = CS.map((c) => {
  const pol = P(c.n);
  const prod = productById[pol.productId];
  const rejected = !!c.st.rejected;
  const stage = [...CLAIM_STAGES].reverse().find((s) => c.st[s])!;
  const idx = CLAIM_STAGES.indexOf(stage);
  const approvedAmt = !rejected && idx >= 3 && c.assessed !== undefined ? round3(c.assessed - (c.ded ?? 0)) : undefined;
  const paidAmt = idx >= 4 ? approvedAmt : undefined;
  const reserve = rejected || idx >= 4 ? 0 : idx === 3 ? approvedAmt! : idx === 2 ? round3(c.assessed! - (c.ded ?? 0)) : c.r0;
  const docsDone = rejected || idx >= 2;
  const docs: ClaimDoc[] = prod.claimDocs.map((key) => {
    const received = docsDone ? true : idx === 0 ? key === "claim_form" : !c.missing?.includes(key);
    return { key, received, receivedAt: received ? c.st.registered : undefined };
  });
  const timeline: ClaimEvent[] = [];
  for (const s of [...CLAIM_STAGES, "rejected"] as const) {
    const d = c.st[s];
    if (!d) continue;
    const note = s === "rejected" && c.reject ? c.reject : STAGE_NOTES[s];
    timeline.push({ at: `${d}T${STAGE_HOUR[s]}`, stage: s, byPersonaId: STAGE_PERSONA[s], noteAr: note[0], noteEn: note[1] });
  }
  timeline.push(...(c.extra ?? []));
  timeline.sort((a, b) => a.at.localeCompare(b.at));
  const slaEnd = c.st.paid ?? c.st.rejected ?? TODAY;
  const sla = workingDaysBetween(c.st.registered!, slaEnd);
  return {
    id: c.id, policyId: pol.id, customerId: pol.customerId, productId: pol.productId, outletId: pol.outletId, lossDate: c.loss,
    registeredAt: c.st.registered!, stage, rejected, rejectReasonAr: c.reject?.[0], rejectReasonEn: c.reject?.[1],
    descriptionAr: c.d[0], descriptionEn: c.d[1], locationAr: c.loc[0], locationEn: c.loc[1],
    reserve, initialReserve: c.r0, assessed: idx >= 2 ? c.assessed : undefined, deductible: c.ded ?? 0, approved: approvedAmt, paid: paidAmt,
    surveyorId: c.sv, handlerPersonaId: "claims", approverLevel: approvedAmt !== undefined ? claimApprover(approvedAmt) : undefined,
    docs, timeline, stageDates: c.st, slaWorkingDays: sla, slaTarget: 5, slaBreached: sla > 5, recoveryIds: [], journalIds: [], sharia_status: "compliant",
  };
});
export const claimById = indexBy(claims);

// =====================================================================================
// Retakaful (M10)
// =====================================================================================

export const counterparties: Counterparty[] = [
  { id: "RC-01", nameAr: "شركة النخلة لإعادة التكافل", nameEn: "Al-Nakhla Retakaful Co.", countryAr: "البحرين", countryEn: "Bahrain", kind: "retakaful", rating: "A-", isaRegistration: "registered", sharia_status: "compliant" },
  { id: "RC-02", nameAr: "مجموعة الواحة لإعادة التكافل", nameEn: "Al-Waha Retakaful Group", countryAr: "ماليزيا", countryEn: "Malaysia", kind: "retakaful", rating: "A", isaRegistration: "registered", sharia_status: "compliant" },
  { id: "RC-03", nameAr: "شركة المتوسط لإعادة التأمين", nameEn: "Mediterranean Reinsurance Co.", countryAr: "تونس", countryEn: "Tunisia", kind: "conventional", rating: "BBB+", isaRegistration: "pending", sharia_status: "compliant", ssbResolutionId: "SSB-2026-05" },
  { id: "RC-04", nameAr: "شركة سرت لإعادة التكافل", nameEn: "Sirte Retakaful Co.", countryAr: "ليبيا", countryEn: "Libya", kind: "retakaful", rating: "B+", isaRegistration: "registered", sharia_status: "compliant" },
];
export const treaties: Treaty[] = [
  { id: "TR-2026-QS", type: "quota_share", nameAr: "اتفاقية حصة نسبية 40% – شامل مركبات 2026", nameEn: "Quota Share 40% – Comprehensive Motor 2026",
    productIds: ["MTR"], start: "2026-01-01", end: "2026-12-31", cededPct: 40, cedingCommissionPct: 20,
    shares: [{ counterpartyId: "RC-01", pct: 60 }, { counterpartyId: "RC-02", pct: 40 }], status: "active", sharia_status: "compliant" },
  { id: "TR-2026-XL", type: "excess_of_loss", nameAr: "فائض خسارة لكل خطر 400,000 بعد 100,000", nameEn: "Per-risk Excess of Loss 400,000 xs 100,000",
    productIds: ["FIR", "CMP"], start: "2026-01-01", end: "2026-12-31", retention: 100000, limit: 400000, minDepositPremium: 540000, reinstatements: 1, cedingCommissionPct: 0,
    shares: [{ counterpartyId: "RC-02", pct: 50 }, { counterpartyId: "RC-04", pct: 50 }], status: "active", sharia_status: "compliant" },
  { id: "TR-2026-FAC-MAR-01", type: "facultative", nameAr: "إسناد اختياري 70% – شحنة دقيق (بحري)", nameEn: "Facultative 70% – flour cargo (marine)",
    productIds: ["MAR"], start: "2026-03-10", end: "2026-05-08", cededPct: 70, cedingCommissionPct: 15, policyId: polId(55),
    shares: [{ counterpartyId: "RC-03", pct: 100 }], status: "expired", sharia_status: "compliant" },
];
export const treatyById = indexBy(treaties);

export const cessions: Cession[] = [];
for (const pol of policies) {
  if (pol.issuedAt < GL_START) continue;
  const t = pol.productId === "MTR" ? treatyById["TR-2026-QS"] : pol.id === polId(55) ? treatyById["TR-2026-FAC-MAR-01"] : undefined;
  if (!t) continue;
  const ceded = round3((pol.tabarru * t.cededPct!) / 100);
  cessions.push({ id: `CES-${pad(cessions.length + 1, 4)}`, treatyId: t.id, policyId: pol.id, date: pol.issuedAt, kind: "proportional",
    base: pol.tabarru, ceded, commission: round3((ceded * t.cedingCommissionPct) / 100), sharia_status: "compliant" });
}
for (const d of ["2026-01-15", "2026-04-15", "2026-07-15", "2026-10-15"])
  cessions.push({ id: `CES-${pad(cessions.length + 1, 4)}`, treatyId: "TR-2026-XL", date: d, kind: "xol_premium", base: 540000, ceded: 135000, commission: 0, sharia_status: "compliant" });
cessions.sort((a, b) => a.date.localeCompare(b.date));
cessions.forEach((c, i) => (c.id = `CES-${pad(i + 1, 4)}`));

const RECEIVED: Record<string, string> = Object.fromEntries(CS.filter((c) => c.recvd).map((c) => [c.id, c.recvd!]));
export const recoveries: Recovery[] = [];
for (const cl of claims) {
  if (cl.rejected || cl.approved === undefined) continue;
  const pol = policyById[cl.policyId];
  let treatyId: string | undefined, amount = 0;
  if (pol.productId === "MTR") { treatyId = "TR-2026-QS"; amount = round3(cl.approved * 0.4); }
  else if (pol.productId === "FIR" && cl.approved > 100000) { treatyId = "TR-2026-XL"; amount = Math.min(cl.approved - 100000, 400000); }
  else if (pol.id === polId(55)) { treatyId = "TR-2026-FAC-MAR-01"; amount = round3(cl.approved * 0.7); }
  if (!treatyId) continue;
  const rec: Recovery = { id: `REC-${pad(recoveries.length + 1, 3)}`, claimId: cl.id, treatyId, bookedAt: cl.stageDates.approved!, amount,
    status: RECEIVED[cl.id] ? "received" : "receivable", receivedAt: RECEIVED[cl.id], journalIds: [] };
  recoveries.push(rec);
  cl.recoveryIds.push(rec.id);
}

// =====================================================================================
// Surplus 2025 (M15)
// =====================================================================================

const SURPLUS_COMPONENTS = [
  { key: "gross_earned", labelAr: "إجمالي المساهمات المكتسبة", labelEn: "Gross earned contributions", amount: 63450000 },
  { key: "wakala", labelAr: "أجرة الوكالة للمشغل", labelEn: "Wakala fee to the operator", amount: -18650000 },
  { key: "retakaful", labelAr: "مساهمات إعادة التكافل (صافي العمولة)", labelEn: "Retakaful contributions (net of commission)", amount: -4820000 },
  { key: "net_claims", labelAr: "صافي المطالبات (بعد استردادات إعادة التكافل)", labelEn: "Net claims (after retakaful recoveries)", amount: -33970000 },
  { key: "reserves", labelAr: "التغير في المخصصات الفنية", labelEn: "Change in technical reserves", amount: -3240000 },
  { key: "investment", labelAr: "عائد الاستثمار بعد حصة المضارب", labelEn: "Investment income net of Mudarib share", amount: 1386000 },
];
const NET_SURPLUS = sum(SURPLUS_COMPONENTS.map((c) => c.amount)); // 4,156,000
const QARD = 1200000;
const DISTRIBUTABLE = round3(NET_SURPLUS - QARD); // 2,956,000
const ELIGIBLE = 59120000;

export const surplusAllocations: SurplusAllocation[] = [];
{
  let i = 0;
  for (const [cid, contribution] of Object.entries(contrib2025).sort()) {
    const applied = creditPolicy[cid];
    surplusAllocations.push({ id: `SA-2025-${pad(++i, 4)}`, runId: "SR-2025", customerId: cid, contribution, share: round3(contribution * SURPLUS_RATIO),
      settlement: applied ? "renewal_discount" : "voucher", appliedPolicyId: applied ? polId(applied) : undefined,
      voucherNo: applied ? undefined : `SV-2026-${pad(i, 5)}`, status: applied ? "applied" : "paid" });
  }
  const sampleContrib = sum(surplusAllocations.map((a) => a.contribution));
  const sampleShare = sum(surplusAllocations.map((a) => a.share));
  const restContrib = round3(ELIGIBLE - sampleContrib), restShare = round3(DISTRIBUTABLE - sampleShare);
  const vContrib = round3(restContrib * 0.55), vShare = round3(restShare * 0.55);
  surplusAllocations.push(
    { id: `SA-2025-${pad(++i, 4)}`, runId: "SR-2025", labelAr: "باقي المشتركين – قسائم صرف", labelEn: "Other participants – payment vouchers",
      contribution: vContrib, share: vShare, settlement: "voucher", status: "paid" },
    { id: `SA-2025-${pad(++i, 4)}`, runId: "SR-2025", labelAr: "باقي المشتركين – خصم عند التجديد (محتجز)", labelEn: "Other participants – renewal credits (held)",
      contribution: round3(restContrib - vContrib), share: round3(restShare - vShare), settlement: "renewal_discount", status: "held" },
  );
}
export const surplusRun: SurplusRun = {
  id: "SR-2025", year: 2025, status: "completed", components: SURPLUS_COMPONENTS, netSurplus: NET_SURPLUS, qardOutstanding: QARD, qardRepaid: QARD,
  retentionPct: 0, distributable: DISTRIBUTABLE, distributionPct: 100, eligibleContributions: ELIGIBLE, ratio: SURPLUS_RATIO,
  eligibilityRuleAr: "جميع المشتركين الذين سددوا مساهماتهم في 2025؛ التوزيع بنسبة المساهمة (100% للمشتركين ولا شيء للمساهمين)",
  eligibilityRuleEn: "All participants who paid contributions in 2025; pro rata to contribution (100% to participants, nothing to shareholders)",
  solvencyBefore: 168.4, solvencyAfter: 152.9,
  approvals: [
    { step: "cfo", labelAr: "المدير المالي", labelEn: "CFO", status: "approved", at: "2026-02-03", byAr: "فاطمة ع.", byEn: "Fatima O." },
    { step: "actuary", labelAr: "الخبير الاكتواري", labelEn: "Actuary", status: "approved", at: "2026-02-05", byAr: "مكتب الإحصاء الاكتواري (افتراضي)", byEn: "Actuarial consultant (invented)" },
    { step: "ssb", labelAr: "هيئة الرقابة الشرعية", labelEn: "Sharia Supervisory Board", status: "approved", at: "2026-02-10", byAr: "د. محمد غ.", byEn: "Dr. Mohamed G." },
    { step: "board", labelAr: "مجلس الإدارة", labelEn: "Board of Directors", status: "approved", at: "2026-02-15", byAr: "رئيس مجلس الإدارة", byEn: "Board chair" },
  ],
  postedAt: SURPLUS_POSTED, journalIds: [], ssbResolutionId: "SSB-2026-03",
};

// =====================================================================================
// Investments (M11)
// =====================================================================================

export const OPERATOR_MUDARIB_PCT = 20; // illustrative, SSB-2026-07
export const portfolios: Portfolio[] = [
  { id: "PF-PTF", fund: "PTF", nameAr: "محفظة صندوق المشتركين", nameEn: "Participants' Takaful Fund portfolio" },
  { id: "PF-PIF", fund: "PIF", nameAr: "محفظة صندوق استثمار المشتركين (غير مفعلة)", nameEn: "Participants' Investment Fund portfolio (not in use)" },
  { id: "PF-SHF", fund: "SHF", nameAr: "محفظة صندوق المساهمين", nameEn: "Shareholders' Fund portfolio" },
];
export const investmentContracts: InvestmentContract[] = [
  { id: "INV-PTF-MUD-01", portfolioId: "PF-PTF", fund: "PTF", type: "mudaraba", nameAr: "مضاربة مقيدة – تمويل تجاري", nameEn: "Restricted Mudaraba – trade finance",
    counterpartyAr: "مصرف السدرة الإسلامي", counterpartyEn: "Al-Sidra Islamic Bank", start: "2025-07-01", end: "2027-06-30", principal: 5000000, expectedPct: 6.0,
    profitRatioFundPct: 65, status: "active", ssbResolutionId: "SSB-2025-09", sharia_status: "compliant" },
  { id: "INV-PTF-MUR-01", portfolioId: "PF-PTF", fund: "PTF", type: "murabaha", nameAr: "مرابحة سلع (12 قسطاً)", nameEn: "Commodity Murabaha (12 instalments)",
    counterpartyAr: "مصرف السدرة الإسلامي", counterpartyEn: "Al-Sidra Islamic Bank", start: "2026-02-01", end: "2027-02-01", principal: 2000000, expectedPct: 5.5,
    markup: 110000, status: "active", ssbResolutionId: "SSB-2026-04", sharia_status: "compliant" },
  { id: "INV-PTF-DEP-01", portfolioId: "PF-PTF", fund: "PTF", type: "islamic_deposit", nameAr: "وديعة وكالة استثمارية", nameEn: "Wakala investment deposit",
    counterpartyAr: "بنك الأفق الإسلامي", counterpartyEn: "Al-Ofuq Islamic Bank", start: "2025-10-01", end: "2026-12-31", principal: 3000000, expectedPct: 4.25,
    status: "active", ssbResolutionId: "SSB-2025-09", sharia_status: "compliant" },
  { id: "INV-SHF-IJR-01", portfolioId: "PF-SHF", fund: "SHF", type: "ijara", nameAr: "إجارة طابق تجاري – طرابلس", nameEn: "Ijara of a commercial floor – Tripoli",
    counterpartyAr: "شركة الريادة للخدمات اللوجستية", counterpartyEn: "Al-Riyada Logistics Co.", start: "2024-01-01", end: "2028-12-31", principal: 3600000, expectedPct: 9.0,
    monthlyRental: 27000, status: "active", ssbResolutionId: "SSB-2025-09", sharia_status: "compliant" },
  { id: "INV-SHF-DEP-01", portfolioId: "PF-SHF", fund: "SHF", type: "islamic_deposit", nameAr: "وديعة وكالة استثمارية", nameEn: "Wakala investment deposit",
    counterpartyAr: "بنك الأفق الإسلامي", counterpartyEn: "Al-Ofuq Islamic Bank", start: "2025-06-01", end: "2027-05-31", principal: 4000000, expectedPct: 4.0,
    status: "active", ssbResolutionId: "SSB-2025-09", sharia_status: "compliant" },
  { id: "INV-PTF-SUK-01", portfolioId: "PF-PTF", fund: "PTF", type: "sukuk", nameAr: "صكوك إجارة (مقترح)", nameEn: "Ijara Sukuk (proposal)",
    counterpartyAr: "جهة إصدار افتراضية", counterpartyEn: "Invented issuer", start: "2026-12-01", end: "2029-11-30", principal: 1500000, expectedPct: 5.2,
    status: "proposed", sharia_status: "pending_review" },
];
export const investmentById = indexBy(investmentContracts);

export const murabahaSchedule: MurabahaScheduleRow[] = [];
{
  const c = investmentById["INV-PTF-MUR-01"];
  const pr = round3(c.principal / 12), pf = round3(c.markup! / 12);
  for (let i = 1; i <= 12; i++) {
    const principal = i < 12 ? pr : round3(c.principal - pr * 11);
    const profit = i < 12 ? pf : round3(c.markup! - pf * 11);
    const dueDate = addMonths("2026-03-01", i - 1);
    murabahaSchedule.push({ contractId: c.id, seq: i, dueDate, principal, profit, instalment: round3(principal + profit), status: dueDate <= TODAY ? "received" : "due" });
  }
}
export const MONTHS_2026 = ["2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06", "2026-07", "2026-08", "2026-09", "2026-10"];
export const investmentReturns: InvestmentReturn[] = [];
{
  const add = (contractId: string, date: string, grossAmt: number) => {
    const c = investmentById[contractId];
    const mud = c.fund === "SHF" ? 0 : round3((grossAmt * OPERATOR_MUDARIB_PCT) / 100);
    investmentReturns.push({ id: `IR-${pad(investmentReturns.length + 1, 4)}`, contractId, fund: c.fund, month: ym(date), date, gross: round3(grossAmt), mudaribShare: mud, netToFund: round3(grossAmt - mud) });
  };
  const MUD_Q: Record<string, number> = { "2026-03-31": 71500, "2026-06-30": 74100, "2026-09-30": 76800 };
  for (const m of MONTHS_2026) {
    const end = monthEnd(m);
    if (MUD_Q[end]) add("INV-PTF-MUD-01", end, MUD_Q[end]);
    for (const row of murabahaSchedule) if (ym(row.dueDate) === m && row.status === "received") add("INV-PTF-MUR-01", row.dueDate, row.profit);
    add("INV-PTF-DEP-01", end, round3(((3000000 * 0.0425) / 12) * noise(0.04)));
    add("INV-SHF-IJR-01", `${m}-05`, 27000);
    add("INV-SHF-DEP-01", end, round3(((4000000 * 0.04) / 12) * noise(0.04)));
  }
  investmentReturns.sort((a, b) => a.date.localeCompare(b.date) || a.contractId.localeCompare(b.contractId));
  investmentReturns.forEach((r, i) => (r.id = `IR-${pad(i + 1, 4)}`));
}

// =====================================================================================
// HR (M33) & payroll (M34)
// =====================================================================================

export const departments: Department[] = [
  { id: "DEP-MGT", deptKey: "dept.management", nameAr: "الإدارة العامة", nameEn: "General Management", headEmployeeId: "EMP-002" },
  { id: "DEP-FIN", deptKey: "dept.finance", nameAr: "الإدارة المالية", nameEn: "Finance", headEmployeeId: "EMP-003" },
  { id: "DEP-UW", deptKey: "dept.underwriting", nameAr: "إدارة الاكتتاب", nameEn: "Underwriting", headEmployeeId: "EMP-005" },
  { id: "DEP-CLM", deptKey: "dept.claims", nameAr: "إدارة المطالبات", nameEn: "Claims", headEmployeeId: "EMP-007" },
  { id: "DEP-RI", deptKey: "dept.reinsurance", nameAr: "إدارة إعادة التكافل", nameEn: "Retakaful", headEmployeeId: "EMP-008" },
  { id: "DEP-SAL", deptKey: "dept.sales", nameAr: "إدارة المبيعات والتوزيع", nameEn: "Sales & Distribution", headEmployeeId: "EMP-009" },
  { id: "DEP-BR", deptKey: "dept.branches", nameAr: "إدارة الفروع والمنافذ", nameEn: "Branches & Border Points", headEmployeeId: "EMP-013" },
  { id: "DEP-SHR", deptKey: "dept.sharia", nameAr: "الرقابة الشرعية", nameEn: "Sharia Supervision", headEmployeeId: "EMP-011" },
  { id: "DEP-HR", deptKey: "dept.hr", nameAr: "الموارد البشرية", nameEn: "Human Resources", headEmployeeId: "EMP-012" },
  { id: "DEP-IT", deptKey: "dept.it", nameAr: "تقنية المعلومات", nameEn: "IT", headEmployeeId: "EMP-001" },
];
type ERow = [string | undefined, string, string, "M" | "F", string, string, string, string, number, string, Employee["contractType"], number];
const EROWS: ERow[] = [
  ["admin", "سالم م.", "Salem M.", "M", "DEP-IT", "مدير تقنية المعلومات", "IT Manager", "BR-TRP", 4200, "2019-03-01", "permanent", 2],
  ["gm", "عبد الحكيم ز.", "Abdulhakim Z.", "M", "DEP-MGT", "المدير العام", "General Manager", "BR-TRP", 9500, "2016-01-10", "permanent", 4],
  ["cfo", "فاطمة ع.", "Fatima O.", "F", "DEP-FIN", "المدير المالي", "Chief Financial Officer", "BR-TRP", 7800, "2017-06-15", "permanent", 2],
  ["accountant", "خالد ش.", "Khaled S.", "M", "DEP-FIN", "محاسب أول", "Senior Accountant", "BR-TRP", 3600, "2020-09-01", "permanent", 3],
  ["uw", "مريم ق.", "Mariam G.", "F", "DEP-UW", "مدير الاكتتاب", "Underwriting Manager", "BR-TRP", 4900, "2018-02-11", "permanent", 1],
  ["border", "أيمن و.", "Ayman W.", "M", "DEP-BR", "مشرف منفذ رأس اجدير", "Ras Ajdir Point Supervisor", "BP-RAJ", 3200, "2021-04-04", "permanent", 2],
  ["claims", "نوري ب.", "Nouri B.", "M", "DEP-CLM", "مدير المطالبات", "Claims Manager", "BR-TRP", 4800, "2017-11-20", "permanent", 3],
  ["reins", "هدى ت.", "Huda T.", "F", "DEP-RI", "رئيس قسم إعادة التكافل", "Head of Retakaful", "BR-TRP", 4300, "2019-08-18", "permanent", 0],
  ["dist", "طارق ف.", "Tarek F.", "M", "DEP-SAL", "مدير التوزيع", "Distribution Manager", "BR-TRP", 4900, "2018-05-06", "permanent", 3],
  ["invest", "سارة م.", "Sara M.", "F", "DEP-FIN", "مسؤول الاستثمار", "Investment Officer", "BR-TRP", 4000, "2022-01-09", "permanent", 0],
  ["ssb", "د. محمد غ.", "Dr. Mohamed G.", "M", "DEP-SHR", "رئيس هيئة الرقابة الشرعية", "Chair, Sharia Supervisory Board", "BR-TRP", 3500, "2016-01-10", "consultant", 0],
  ["hr", "ليلى ب.", "Laila B.", "F", "DEP-HR", "مدير الموارد البشرية", "HR Manager", "BR-TRP", 4400, "2018-10-14", "permanent", 2],
  [undefined, "عبد الباسط ش.", "Abdulbasit S.", "M", "DEP-BR", "مدير فرع مصراتة", "Misrata Branch Manager", "BR-MIS", 4600, "2017-03-12", "permanent", 4],
  [undefined, "نسرين ق.", "Nisreen G.", "F", "DEP-BR", "أمين صندوق", "Cashier", "BR-MIS", 2100, "2023-02-01", "fixed_term", 1],
  [undefined, "مروان ع.", "Marwan A.", "M", "DEP-UW", "مكتتب", "Underwriter", "BR-BEN", 3100, "2021-07-11", "permanent", 2],
  [undefined, "ربيع ف.", "Rabie F.", "M", "DEP-BR", "مدير فرع بنغازي", "Benghazi Branch Manager", "BR-BEN", 4500, "2017-09-03", "permanent", 3],
  [undefined, "حنان ش.", "Hanan S.", "F", "DEP-CLM", "موظف مطالبات", "Claims Officer", "BR-BEN", 2700, "2022-03-20", "permanent", 1],
  [undefined, "أنس ب.", "Anas B.", "M", "DEP-CLM", "موظف مطالبات", "Claims Officer", "BR-TRP", 2800, "2021-12-05", "permanent", 0],
  [undefined, "عائشة ص.", "Aisha S.", "F", "DEP-FIN", "محاسب ذمم دائنة", "Payables Accountant", "BR-TRP", 2900, "2022-06-26", "permanent", 2],
  [undefined, "معتز ه.", "Moataz H.", "M", "DEP-BR", "أمين صندوق", "Cashier", "BR-TRP", 2000, "2024-01-14", "fixed_term", 0],
  [undefined, "صلاح الدين ت.", "Salaheddin T.", "M", "DEP-BR", "مدير فرع سبها", "Sebha Branch Manager", "BR-SEB", 4000, "2018-04-22", "permanent", 5],
  [undefined, "فتحية ق.", "Fathia A.", "F", "DEP-SAL", "موظف مبيعات", "Sales Officer", "BR-SEB", 2300, "2023-05-07", "permanent", 2],
  [undefined, "كمال ز.", "Kamal Z.", "M", "DEP-BR", "مدير فرع زوارة", "Zuwara Branch Manager", "BR-ZUW", 3900, "2019-01-20", "permanent", 3],
  [undefined, "بشير ش.", "Bashir S.", "M", "DEP-BR", "أمين صندوق منفذ", "Border Cashier", "BP-RAJ", 2200, "2023-08-13", "fixed_term", 1],
  [undefined, "نجلاء أ.", "Najla A.", "F", "DEP-BR", "موظف منفذ الميناء", "Seaport Desk Officer", "BP-PRT", 2400, "2022-11-06", "permanent", 0],
  [undefined, "حمزة ق.", "Hamza G.", "M", "DEP-BR", "موظف منفذ المطار", "Airport Desk Officer", "BP-MJI", 2400, "2023-03-19", "permanent", 0],
  [undefined, "رحاب ش.", "Rehab S.", "F", "DEP-SHR", "مدقق شرعي داخلي", "Internal Sharia Auditor", "BR-TRP", 3300, "2021-10-03", "permanent", 1],
  [undefined, "أسامة ب.", "Osama B.", "M", "DEP-IT", "مطور أنظمة", "Systems Developer", "BR-TRP", 3800, "2022-08-28", "permanent", 1],
  [undefined, "إيمان ع.", "Iman A.", "F", "DEP-HR", "موظف موارد بشرية", "HR Officer", "BR-TRP", 2600, "2023-09-10", "permanent", 0],
  [undefined, "عبد المنعم ك.", "Abdulmonem K.", "M", "DEP-FIN", "محلل اكتواري", "Actuarial Analyst", "BR-TRP", 3500, "2024-02-04", "fixed_term", 1],
];
export const employees: Employee[] = EROWS.map((r, i) => {
  const n = i + 1;
  const consultant = r[10] === "consultant";
  return {
    id: `EMP-${pad(n, 3)}`, personaId: r[0], nameAr: r[1], nameEn: r[2], gender: r[3], departmentId: r[4], positionAr: r[5], positionEn: r[6], outletId: r[7],
    nationalNo: `${r[3] === "M" ? "1" : "2"}198${pad(5000 + n, 8)}`, hireDate: r[9], contractType: r[10],
    contractEnd: r[10] === "fixed_term" ? addDays(addMonths(r[9], 36), -1) > TODAY ? addDays(addMonths(r[9], 36), -1) : "2027-06-30" : consultant ? "2027-12-31" : undefined,
    grade: r[8] >= 7000 ? "G1" : r[8] >= 4500 ? "G2" : r[8] >= 3500 ? "G3" : r[8] >= 2600 ? "G4" : "G5",
    basic: r[8], housing: consultant ? 0 : round3(r[8] * 0.15), transport: consultant ? 0 : 150, children: r[11], socialSecurity: !consultant,
    idExpiry: [7, 14, 24].includes(n) ? addMonths("2026-10-20", n % 3) : addMonths("2028-03-15", n),
    status: n === 17 ? "on_leave" : "active",
  };
});
export const employeeById = indexBy(employees);
export const employeeContracts: EmploymentContract[] = employees.map((e) => ({
  id: `CON-${e.id.slice(4)}`, employeeId: e.id, type: e.contractType, start: e.hireDate, end: e.contractEnd, probationEnd: addMonths(e.hireDate, 3),
  grade: e.grade, basic: e.basic, version: e.hireDate < "2020-01-01" ? 3 : e.hireDate < "2023-01-01" ? 2 : 1,
}));

export const leaveRequests: LeaveRequest[] = [
  { id: "LV-0141", employeeId: "EMP-017", type: "maternity", from: "2026-10-04", to: "2027-01-03", days: 98, status: "approved", approverPersonaId: "hr" },
  { id: "LV-0152", employeeId: "EMP-013", type: "annual", from: "2026-08-09", to: "2026-08-20", days: 10, status: "approved", approverPersonaId: "gm" },
  { id: "LV-0158", employeeId: "EMP-004", type: "sick", from: "2026-09-21", to: "2026-09-22", days: 2, status: "approved", approverPersonaId: "cfo" },
  { id: "LV-0163", employeeId: "EMP-021", type: "hajj", from: "2026-05-17", to: "2026-06-11", days: 20, status: "approved", approverPersonaId: "gm" },
  { id: "LV-0170", employeeId: "EMP-018", type: "annual", from: "2026-10-11", to: "2026-10-15", days: 5, status: "approved", approverPersonaId: "claims" },
  { id: "LV-0174", employeeId: "EMP-025", type: "emergency", from: "2026-10-27", to: "2026-10-28", days: 2, status: "approved", approverPersonaId: "hr" },
  { id: "LV-0177", employeeId: "EMP-009", type: "annual", from: "2026-11-15", to: "2026-11-26", days: 10, status: "pending", approverPersonaId: "gm" },
  { id: "LV-0178", employeeId: "EMP-024", type: "annual", from: "2026-11-08", to: "2026-11-12", days: 5, status: "pending", approverPersonaId: "border" },
  { id: "LV-0179", employeeId: "EMP-028", type: "unpaid", from: "2026-11-22", to: "2026-12-03", days: 10, status: "pending", approverPersonaId: "admin" },
  { id: "LV-0165", employeeId: "EMP-020", type: "annual", from: "2026-09-27", to: "2026-10-08", days: 10, status: "rejected", approverPersonaId: "hr" },
];

const workingDaysInMonth = (m: string) => workingDaysBetween(addDays(`${m}-01`, -1), monthEnd(m));
export const attendance: AttendanceSummary[] = employees.map((e, i) => {
  const wd = workingDaysInMonth("2026-10");
  const leave = leaveRequests.filter((l) => l.employeeId === e.id && l.status === "approved" && l.from <= "2026-10-31" && l.to >= "2026-10-01")
    .reduce((a, l) => a + workingDaysBetween(addDays([l.from, "2026-10-01"].sort()[1], -1), [l.to, "2026-10-31"].sort()[0]), 0);
  const absent = i % 9 === 4 ? 1 : 0;
  return { employeeId: e.id, month: "2026-10", workingDays: wd, leave, absent, present: wd - leave - absent,
    lateCount: Math.floor(rng() * 4), overtimeHours: e.outletId.startsWith("BP-") || e.departmentId === "DEP-CLM" ? 4 + Math.floor(rng() * 12) : Math.floor(rng() * 4) };
});

export const staffAdvances: StaffAdvance[] = [
  { id: "ADV-001", employeeId: "EMP-017", date: "2025-11-01", amount: 5000, instalments: 10, monthlyDeduction: 500, remaining: 0, status: "active" },
  { id: "ADV-002", employeeId: "EMP-014", date: "2026-06-01", amount: 3000, instalments: 10, monthlyDeduction: 300, remaining: 0, status: "active" },
  { id: "ADV-003", employeeId: "EMP-020", date: "2026-07-15", amount: 2400, instalments: 8, monthlyDeduction: 300, remaining: 0, status: "active" },
  { id: "ADV-004", employeeId: "EMP-024", date: "2026-09-01", amount: 1800, instalments: 6, monthlyDeduction: 300, remaining: 0, status: "active" },
];
/** Deduction in a payroll month (first deduction the month after the advance) */
const advanceDeduction = (a: StaffAdvance, m: string) => {
  const first = nextYm(ym(a.date));
  if (m < first) return 0;
  let k = 0;
  for (let x = first; x < m; x = nextYm(x)) k++;
  return Math.max(0, Math.min(a.monthlyDeduction, a.amount - k * a.monthlyDeduction));
};
for (const a of staffAdvances) {
  let deducted = 0;
  for (let x = nextYm(ym(a.date)); x <= "2026-10"; x = nextYm(x)) deducted += advanceDeduction(a, x);
  a.remaining = round3(a.amount - deducted);
  a.status = a.remaining <= 0 ? "settled" : "active";
}

export const payrollRates: PayrollRates = {
  illustrative: true, ssEmployeePct: 3.75, ssEmployerPct: 11.25, solidarityPct: 1, stampPct: 0.5, taxMonthlyExemption: 150,
  taxBands: [{ upTo: 1000, pct: 5 }, { upTo: null, pct: 10 }], familyAllowancePerChild: 50,
  noteAr: "نسب توضيحية فقط: يجب أن يؤكدها محاسب الرواتب لدى الشركة (الضمان الاجتماعي وضريبة الدخل والدمغة وصندوق التضامن)",
  noteEn: "Illustrative rates only: to be confirmed by the company's payroll accountant (social security, income tax, stamp, solidarity fund)",
};
export const payrollRuns: PayrollRun[] = [];
export const payrollLines: PayrollLine[] = [];
for (const [m, status] of [["2026-08", "locked"], ["2026-09", "approved"], ["2026-10", "draft"]] as const) {
  const runId = `PR-${m}`;
  const lines = employees.map((e): PayrollLine => {
    const otH = m === "2026-10" ? attendance.find((a) => a.employeeId === e.id)!.overtimeHours : e.contractType === "consultant" ? 0 : Math.floor(rng() * 8);
    const overtime = round3((e.basic / 176) * 1.5 * otH);
    const family = Math.min(e.children, 4) * payrollRates.familyAllowancePerChild;
    const grossPay = round3(e.basic + e.housing + e.transport + family + overtime);
    const ssBase = e.basic + e.housing;
    const ssEmployee = e.socialSecurity ? round3((ssBase * payrollRates.ssEmployeePct) / 100) : 0;
    const ssEmployer = e.socialSecurity ? round3((ssBase * payrollRates.ssEmployerPct) / 100) : 0;
    const solidarity = round3((grossPay * payrollRates.solidarityPct) / 100);
    const stamp = round3((grossPay * payrollRates.stampPct) / 100);
    const taxable = Math.max(0, grossPay - ssEmployee - payrollRates.taxMonthlyExemption);
    const incomeTax = round3(Math.min(taxable, 1000) * 0.05 + Math.max(0, taxable - 1000) * 0.1);
    const adv = sum(staffAdvances.filter((a) => a.employeeId === e.id).map((a) => advanceDeduction(a, m)));
    return { runId, employeeId: e.id, basic: e.basic, housing: e.housing, transport: e.transport, family, overtime, gross: grossPay, ssEmployee, ssEmployer,
      solidarity, incomeTax, stamp, advanceDeduction: adv, net: round3(grossPay - ssEmployee - solidarity - incomeTax - stamp - adv) };
  });
  payrollLines.push(...lines);
  const tot = (k: keyof PayrollLine) => sum(lines.map((l) => l[k] as number));
  payrollRuns.push({ id: runId, month: m, status, preparedByPersonaId: "hr", approvedByPersonaId: status === "draft" ? undefined : "cfo",
    lockedAt: status === "locked" ? `${nextYm(m)}-02` : undefined,
    totals: { gross: tot("gross"), ssEmployee: tot("ssEmployee"), ssEmployer: tot("ssEmployer"), solidarity: tot("solidarity"), incomeTax: tot("incomeTax"),
      stamp: tot("stamp"), advances: tot("advanceDeduction"), net: tot("net"), headcount: lines.length },
    fund: "SHF", sharia_status: "compliant" });
}

// =====================================================================================
// KPIs (M28) — company-book figures (all business). Sample records above are part of them.
// =====================================================================================

const PRODS: ProductCode[] = ["CMP", "MTR", "ORC", "TRV", "FIR", "MAR", "HAJ"];
const byProd = (f: (p: ProductCode) => number) => Object.fromEntries(PRODS.map((p) => [p, f(p)])) as Record<ProductCode, number>;
const BASE_GWP: Record<ProductCode, number> = { CMP: 1650000, MTR: 1380000, ORC: 560000, TRV: 270000, FIR: 840000, MAR: 560000, HAJ: 280000 };
const SEASON: Record<"general" | "ORC" | "TRV" | "HAJ", number[]> = {
  general: [0.92, 0.95, 1.02, 1.0, 0.98, 1.05, 1.12, 1.1, 1.03, 1.01],
  ORC: [0.6, 0.6, 0.8, 0.9, 1.0, 1.4, 1.8, 1.7, 1.1, 0.9],
  TRV: [0.7, 0.7, 0.8, 0.9, 1.0, 1.3, 1.6, 1.5, 1.0, 0.9],
  HAJ: [0.5, 0.7, 1.1, 1.9, 2.6, 0.4, 0.3, 0.4, 0.8, 1.3],
};
const BASE_LR: Record<ProductCode, number> = { CMP: 0.62, MTR: 0.55, ORC: 0.38, TRV: 0.3, FIR: 0.35, MAR: 0.28, HAJ: 0.22 };
const AVG_PREMIUM: Record<ProductCode, number> = { CMP: 190, MTR: 2600, ORC: 170, TRV: 120, FIR: 4200, MAR: 3800, HAJ: 2900 };
const OUTLET_SHARE: Record<string, number> = {
  "BR-TRP": 0.3, "BR-BEN": 0.19, "BR-MIS": 0.14, "BR-SEB": 0.06, "BR-ZUW": 0.05, "BP-RAJ": 0.07, "BP-PRT": 0.06, "BP-MJI": 0.03,
  "LO-TRP": 0.05, "LO-MIS": 0.03, "LO-BEN": 0.02,
};
export const kpis: KpiMonth[] = MONTHS_2026.map((month, i) => {
  const gwp = byProd((p) => round3(BASE_GWP[p] * (SEASON[p === "ORC" || p === "TRV" || p === "HAJ" ? p : "general"][i]) * noise(0.03)));
  const collRate = 0.9 + i * 0.004 + rng() * 0.02;
  const collected = byProd((p) => round3(gwp[p] * collRate));
  const claimsPaid = byProd((p) => round3(gwp[p] * BASE_LR[p] * noise(0.08)));
  const gwpTotal = sum(Object.values(gwp)), collectedTotal = sum(Object.values(collected)), claimsPaidTotal = sum(Object.values(claimsPaid));
  const summer = i >= 5 && i <= 7 ? 1.35 : 1;
  const w: Record<string, number> = Object.fromEntries(Object.entries(OUTLET_SHARE).map(([k, v]) => [k, k === "BP-RAJ" || k === "BP-MJI" ? v * summer : v]));
  const wSum = Object.values(w).reduce((a, b) => a + b, 0);
  const keys = Object.keys(w);
  const salesByOutlet: Record<string, number> = {};
  let acc = 0;
  keys.forEach((k, j) => { const v = j < keys.length - 1 ? round3((gwpTotal * w[k]) / wSum) : round3(gwpTotal - acc); salesByOutlet[k] = v; acc = round3(acc + v); });
  const policiesIssued = byProd((p) => Math.round(gwp[p] / AVG_PREMIUM[p]));
  const renewalsDue = Math.round(policiesIssued.CMP * 0.55 + policiesIssued.MTR * 0.75 + policiesIssued.FIR * 0.8);
  const renewalRatePct = round3(66 + i * 0.9 + rng() * 2);
  const renewed = Math.round((renewalsDue * renewalRatePct) / 100);
  return {
    month, gwp, gwpTotal, collected, collectedTotal, claimsPaid, claimsPaidTotal,
    lossRatio: byProd((p) => round3((claimsPaid[p] / gwp[p]) * 100)), lossRatioTotal: round3((claimsPaidTotal / gwpTotal) * 100),
    salesByOutlet, policiesIssued, policiesIssuedTotal: Object.values(policiesIssued).reduce((a, b) => a + b, 0),
    renewalsDue, renewed, renewalRatePct: round3((renewed / renewalsDue) * 100),
    claimsRegistered: Math.round(420 + gwpTotal / 60000 + rng() * 40), avgSettlementDays: round3(Math.max(4.2, 8.1 - i * 0.38 + rng() * 0.4)),
    newCustomers: Math.round(1700 + gwpTotal / 9000 + rng() * 150), collectionRatePct: round3((collectedTotal / gwpTotal) * 100),
    liquidity: { PTF: 0, PIF: 0, SHF: 0 },
  };
});

// Part of the book not represented by sample records (posted as monthly summary journals)
const sampleCollected = (m: string, p: ProductCode) => sum(receipts.filter((r) => ym(r.date) === m && policyById[r.policyId].productId === p).map((r) => r.amount));
const sampleClaims = (m: string, p: ProductCode) => sum(claims.filter((c) => c.paid !== undefined && ym(c.stageDates.paid!) === m && c.productId === p).map((c) => c.paid!));
export const bookSummary = MONTHS_2026.map((m, i) => {
  const collected = byProd((p) => round3(kpis[i].collected[p] - sampleCollected(m, p)));
  const claimsPaid = byProd((p) => round3(kpis[i].claimsPaid[p] - sampleClaims(m, p)));
  const qsCeded = round3(collected.MTR * 0.7 * 0.4);
  return { month: m, collected, claimsPaid, qsCeded, qsCommission: round3(qsCeded * 0.2), qsRecovered: round3(claimsPaid.MTR * 0.4),
    commission: round3(sum(Object.values(collected)) * 0.035), opex: m < "2026-08" ? 1080000 : 985000,
    reserveChange: round3(kpis[i].gwpTotal * 0.045) };
});

// =====================================================================================
// Chart of accounts (M12)
// =====================================================================================

const A = (fund: FundCode, code: string, type: Account["type"], nameAr: string, nameEn: string, classCode?: ClassCode): Account =>
  ({ id: `${fund}-${code}`, fund, code, type, nameAr, nameEn, classCode });
const CLS: ClassCode[] = ["MOTOR", "TRAVEL", "PROPERTY", "MARINE", "PA"];
export const accounts: Account[] = [
  A("PTF", "1110", "asset", "المصرف – صندوق المشتركين", "Bank – PTF"),
  A("PTF", "1120", "asset", "تسويات البطاقات (معاملات)", "Card clearing (Moamalat)"),
  A("PTF", "1130", "asset", "نقدية الفروع والمنافذ", "Cash at branches and border points"),
  A("PTF", "1210", "asset", "استثمارات – مرابحة", "Investments – Murabaha"),
  A("PTF", "1220", "asset", "استثمارات – مضاربة", "Investments – Mudaraba"),
  A("PTF", "1230", "asset", "ودائع إسلامية", "Islamic deposits"),
  A("PTF", "1310", "asset", "مستحقات استردادات إعادة التكافل", "Retakaful recoveries receivable"),
  A("PTF", "2110", "liability", "مستحق لصندوق المساهمين", "Due to Shareholders' Fund"),
  A("PTF", "2120", "liability", "مستحق لشركات إعادة التكافل", "Due to retakaful companies"),
  A("PTF", "2140", "liability", "فائض مستحق للمشتركين", "Surplus payable to participants"),
  A("PTF", "2150", "liability", "قرض حسن مستحق لصندوق المساهمين", "Qard Hasan payable to SHF"),
  A("PTF", "2160", "liability", "مستحق لجهات خيرية (تطهير)", "Charity payable (purification)"),
  A("PTF", "2210", "liability", "المخصصات الفنية", "Technical reserves"),
  A("PTF", "3100", "equity", "الفائض المتراكم للمشتركين", "Participants' accumulated surplus"),
  A("PTF", "3110", "equity", "عجز سابق ممول بالقرض الحسن", "Prior deficit funded by Qard Hasan"),
  ...CLS.map((c) => A("PTF", `4100-${c}`, "income", `إيرادات المساهمات – ${CLASSES[c][0]}`, `Contribution income – ${CLASSES[c][1]}`, c)),
  A("PTF", "4200", "income", "استردادات إعادة التكافل", "Retakaful recoveries"),
  A("PTF", "4300", "income", "عمولات إعادة التكافل", "Retakaful commission income"),
  A("PTF", "4400", "income", "إيرادات الاستثمار", "Investment income"),
  ...CLS.map((c) => A("PTF", `5100-${c}`, "expense", `التعويضات المدفوعة – ${CLASSES[c][0]}`, `Claims paid – ${CLASSES[c][1]}`, c)),
  A("PTF", "5200", "expense", "مساهمات إعادة التكافل المسندة", "Retakaful contributions ceded"),
  A("PTF", "5300", "expense", "أجرة الوكالة", "Wakala fee expense"),
  A("PTF", "5400", "expense", "حصة المضارب", "Mudarib share expense"),
  A("PTF", "5500", "expense", "التغير في المخصصات الفنية", "Change in technical reserves"),
  A("PIF", "1110", "asset", "المصرف – صندوق استثمار المشتركين", "Bank – PIF"),
  A("PIF", "2100", "liability", "حسابات استثمار المشتركين", "Participants' investment accounts"),
  A("PIF", "4100", "income", "إيرادات الاستثمار – PIF", "Investment income – PIF"),
  A("SHF", "1110", "asset", "المصرف – صندوق المساهمين", "Bank – SHF"),
  A("SHF", "1120", "asset", "مستحق من صندوق المشتركين", "Due from PTF"),
  A("SHF", "1130", "asset", "قرض حسن لصندوق المشتركين", "Qard Hasan receivable from PTF"),
  A("SHF", "1140", "asset", "سلف الموظفين (قرض حسن)", "Staff advances (qard)"),
  A("SHF", "1210", "asset", "ودائع إسلامية", "Islamic deposits"),
  A("SHF", "1220", "asset", "أصول مؤجرة (إجارة)", "Ijara assets"),
  A("SHF", "2110", "liability", "عمولات مستحقة للوكلاء", "Commission payable to agents"),
  A("SHF", "2130", "liability", "الضمان الاجتماعي المستحق", "Social security payable"),
  A("SHF", "2140", "liability", "ضريبة الدخل المستحقة", "Income tax payable"),
  A("SHF", "2150", "liability", "الدمغة وصندوق التضامن المستحقة", "Stamp duty and solidarity payable"),
  A("SHF", "3100", "equity", "رأس المال المدفوع", "Paid-up capital"),
  A("SHF", "3200", "equity", "الأرباح المحتجزة", "Retained earnings"),
  A("SHF", "4100", "income", "إيرادات أجرة الوكالة", "Wakala fee income"),
  A("SHF", "4200", "income", "إيرادات حصة المضارب", "Mudarib share income"),
  A("SHF", "4300", "income", "إيرادات الودائع الإسلامية", "Islamic deposit income"),
  A("SHF", "4400", "income", "إيرادات الإجارة", "Ijara rental income"),
  A("SHF", "5100", "expense", "عمولات الوكلاء", "Agents' commission expense"),
  A("SHF", "5200", "expense", "الرواتب والبدلات", "Salaries and allowances"),
  A("SHF", "5210", "expense", "حصة صاحب العمل في الضمان", "Employer social security"),
  A("SHF", "5300", "expense", "مصروفات عمومية وإدارية", "General and administrative expenses"),
];
export const accountById = indexBy(accounts);

export const periods: Period[] = [
  ...MONTHS_2026.slice(0, 9).map((m) => ({ id: m, status: "closed" as const, closedAt: `${nextYm(m)}-12`, closedByPersonaId: "cfo" })),
  { id: "2026-10", status: "open" },
  { id: "2026-11", status: "open" },
];

// =====================================================================================
// Journals — posted in date order from all events above. Each journal balances per fund;
// journals touching two funds reference an inter-fund transfer.
// =====================================================================================

export const journals: Journal[] = [];
export const interFundTransfers: InterFundTransfer[] = [];
type L = [string, number, number];
interface PostOpt { ift?: { type: IftType; from: FundCode; to: FundCode | "PARTICIPANTS"; amount: number; approvedBy?: string[] }; sharia?: ShariaStatus }
function post(date: string, source: JournalSource, sourceId: string | undefined, memoAr: string, memoEn: string, specs: L[], opt: PostOpt = {}): Journal {
  const id = `JV-${date.slice(0, 4)}-${pad(journals.length + 1, 6)}`;
  const lines: JournalLine[] = specs.filter(([, d, c]) => d !== 0 || c !== 0)
    .map(([accountId, d, c]) => ({ accountId, fund: accountId.slice(0, 3) as FundCode, debit: round3(d), credit: round3(c) }));
  let iftId: string | undefined;
  if (opt.ift) {
    iftId = `IFT-${date.slice(0, 4)}-${pad(interFundTransfers.length + 1, 5)}`;
    interFundTransfers.push({ id: iftId, type: opt.ift.type, from: opt.ift.from, to: opt.ift.to, amount: round3(opt.ift.amount), date, journalId: id, sourceId,
      approvedBy: opt.ift.approvedBy ?? ["rule"] });
  }
  const j: Journal = { id, date, source, sourceId, memoAr, memoEn, lines, iftId, status: "posted", sharia_status: opt.sharia ?? "compliant" };
  journals.push(j);
  return j;
}
const queue: { date: string; seq: number; run: () => void }[] = [];
let qseq = 0;
const at = (date: string, run: () => void, late = 0) => queue.push({ date, seq: late * 1e6 + qseq++, run });

const CASH_ACCT: Record<PaymentChannel, string> = { cash_branch: "PTF-1130", cash_border: "PTF-1130", card_moamalat: "PTF-1120", bank_transfer: "PTF-1110" };
const wakalaLines = (w: number): L[] => [["PTF-5300", w, 0], ["PTF-2110", 0, w], ["SHF-1120", w, 0], ["SHF-4100", 0, w]];

// Opening balances (GL go-live 2026-01-01)
at(GL_START, () => {
  post(GL_START, "opening", undefined, "أرصدة افتتاحية – صندوق المشتركين", "Opening balances – PTF", [
    ["PTF-1110", 14500000, 0], ["PTF-1220", 5000000, 0], ["PTF-1230", 3000000, 0], ["PTF-3110", QARD, 0],
    ["PTF-2150", 0, QARD], ["PTF-3100", 0, NET_SURPLUS], ["PTF-2210", 0, round3(14500000 + 5000000 + 3000000 + QARD - QARD - NET_SURPLUS)],
  ]);
  post(GL_START, "opening", undefined, "أرصدة افتتاحية – صندوق المساهمين", "Opening balances – SHF", [
    ["SHF-1110", 9800000, 0], ["SHF-1130", QARD, 0], ["SHF-1210", 4000000, 0], ["SHF-1220", 3600000, 0], ["SHF-3100", 0, 15000000], ["SHF-3200", 0, 3600000],
  ]);
});

// Receipts: contribution + Wakala split (PTF -> SHF)
for (const r of receipts) {
  if (r.date < GL_START) continue;
  at(r.date, () => {
    const pol = policyById[r.policyId];
    const cls = productById[pol.productId].classCode;
    const j = post(r.date, "receipt", r.id, `تحصيل مساهمة ${pol.certNo} – إيصال ${r.id}`, `Contribution collected ${pol.certNo} – receipt ${r.id}`,
      [[CASH_ACCT[r.channel], r.amount, 0], [`PTF-4100-${cls}`, 0, r.amount], ...wakalaLines(r.wakala)],
      { ift: { type: "WAKALA_FEE", from: "PTF", to: "SHF", amount: r.wakala } });
    r.journalId = j.id; r.iftId = j.iftId;
  });
}
// Surplus credits applied at issue (renewal discount)
for (const pol of policies.filter((p) => p.surplusCredit > 0)) {
  at(pol.issuedAt, () => {
    const cls = productById[pol.productId].classCode;
    const w = round3((pol.surplusCredit * pol.wakalaPct) / 100);
    post(pol.issuedAt, "surplus_credit", pol.id, `تطبيق خصم الفائض 2025 على ${pol.certNo}`, `2025 surplus applied as renewal discount on ${pol.certNo}`,
      [["PTF-2140", pol.surplusCredit, 0], [`PTF-4100-${cls}`, 0, pol.surplusCredit], ...wakalaLines(w)],
      { ift: { type: "WAKALA_FEE", from: "PTF", to: "SHF", amount: w } });
  });
}
// Commission accruals (SHF only) and monthly payments
for (const l of commissionLines) {
  at(l.date, () => {
    const amt = Math.abs(l.amount);
    const lines: L[] = l.amount >= 0 ? [["SHF-5100", amt, 0], ["SHF-2110", 0, amt]] : [["SHF-2110", amt, 0], ["SHF-5100", 0, amt]];
    const j = post(l.date, "commission", l.id, `${l.kind === "earned" ? "عمولة" : "استرداد عمولة"} ${agentById[l.agentId].nameAr}`,
      `${l.kind === "earned" ? "Commission" : "Commission clawback"} – ${agentById[l.agentId].nameEn}`, lines);
    l.journalId = j.id;
  });
}
for (const m of MONTHS_2026.slice(0, 9)) {
  const net = sum(commissionLines.filter((l) => ym(l.date) === m).map((l) => l.amount));
  if (net > 0) at(`${nextYm(m)}-10`, () => post(`${nextYm(m)}-10`, "commission_payment", m, `صرف عمولات الوكلاء عن ${m}`, `Agents' commission paid for ${m}`, [["SHF-2110", net, 0], ["SHF-1110", 0, net]]));
}
// Claims paid (PTF only)
for (const cl of claims) {
  if (cl.paid === undefined) continue;
  at(cl.stageDates.paid!, () => {
    const cls = productById[cl.productId].classCode;
    const j = post(cl.stageDates.paid!, "claim_payment", cl.id, `صرف تعويض ${cl.id}`, `Claim paid ${cl.id}`, [[`PTF-5100-${cls}`, cl.paid!, 0], ["PTF-1110", 0, cl.paid!]]);
    cl.journalIds.push(j.id);
  });
}
// Retakaful: cessions, recoveries
for (const c of cessions) {
  at(c.date, () => {
    const j = post(c.date, "cession", c.id, `إسناد إعادة تكافل ${c.id}`, `Retakaful cession ${c.id}`,
      [["PTF-5200", c.ceded, 0], ["PTF-2120", 0, c.ceded], ["PTF-2120", c.commission, 0], ["PTF-4300", 0, c.commission]]);
    c.journalId = j.id;
  });
}
for (const r of recoveries) {
  at(r.bookedAt, () => {
    const j = post(r.bookedAt, "recovery", r.id, `استرداد مستحق من إعادة التكافل – ${r.claimId}`, `Retakaful recovery booked – ${r.claimId}`, [["PTF-1310", r.amount, 0], ["PTF-4200", 0, r.amount]]);
    r.journalIds.push(j.id); claimById[r.claimId].journalIds.push(j.id);
  });
  if (r.receivedAt) at(r.receivedAt, () => {
    const j = post(r.receivedAt!, "recovery", r.id, `تحصيل استرداد إعادة التكافل – ${r.claimId}`, `Retakaful recovery received – ${r.claimId}`, [["PTF-1110", r.amount, 0], ["PTF-1310", 0, r.amount]]);
    r.journalIds.push(j.id);
  });
}
// Book summary (rest of the company's business) per month
for (const b of bookSummary) {
  const d = monthEnd(b.month);
  at(d, () => {
    const byCls: Partial<Record<ClassCode, number>> = {};
    let w = 0;
    for (const p of PRODS) {
      const cls = productById[p].classCode;
      byCls[cls] = round3((byCls[cls] ?? 0) + b.collected[p]);
      w = round3(w + round3((b.collected[p] * productById[p].wakalaPct) / 100));
    }
    const total = sum(Object.values(byCls) as number[]);
    post(d, "book_summary", b.month, `ملخص تحصيل المساهمات – باقي المحفظة ${b.month}`, `Contributions collected – rest of book ${b.month}`,
      [["PTF-1110", total, 0], ...(Object.entries(byCls) as [ClassCode, number][]).map(([c, v]): L => [`PTF-4100-${c}`, 0, v]), ...wakalaLines(w)],
      { ift: { type: "WAKALA_FEE", from: "PTF", to: "SHF", amount: w } });
    const clByCls: Partial<Record<ClassCode, number>> = {};
    for (const p of PRODS) clByCls[productById[p].classCode] = round3((clByCls[productById[p].classCode] ?? 0) + b.claimsPaid[p]);
    const clTotal = sum(Object.values(clByCls) as number[]);
    post(d, "book_summary", b.month, `ملخص التعويضات المدفوعة – باقي المحفظة ${b.month}`, `Claims paid – rest of book ${b.month}`,
      [...(Object.entries(clByCls) as [ClassCode, number][]).map(([c, v]): L => [`PTF-5100-${c}`, v, 0]), ["PTF-1110", 0, clTotal]]);
    post(d, "book_summary", b.month, `ملخص إعادة التكافل (حصة نسبية) – ${b.month}`, `Retakaful quota share – rest of book ${b.month}`,
      [["PTF-5200", b.qsCeded, 0], ["PTF-2120", 0, b.qsCeded], ["PTF-2120", b.qsCommission, 0], ["PTF-4300", 0, b.qsCommission],
        ["PTF-1110", b.qsRecovered, 0], ["PTF-4200", 0, b.qsRecovered]]);
    post(d, "book_summary", b.month, `التغير في المخصصات الفنية (غير المكتسبة، تحت التسوية، IBNR) – ${b.month}`, `Change in technical reserves (UCR, OCR, IBNR) – ${b.month}`,
      [["PTF-5500", b.reserveChange, 0], ["PTF-2210", 0, b.reserveChange]]);
    post(d, "book_summary", b.month, `ملخص عمولات الوكلاء – ${b.month}`, `Agents' commission – rest of book ${b.month}`, [["SHF-5100", b.commission, 0], ["SHF-1110", 0, b.commission]]);
    post(d, "opex", b.month, `مصروفات تشغيلية (إيجار، تقنية، عمومية) – ${b.month}`, `Operating expenses (rent, IT, general) – ${b.month}`, [["SHF-5300", b.opex, 0], ["SHF-1110", 0, b.opex]]);
  });
}
// Retakaful settlements: pay previous month's net balance due on the 10th
for (const m of MONTHS_2026.slice(0, 9)) {
  const d = `${nextYm(m)}-10`;
  at(d, () => {
    let net = 0;
    for (const j of journals) if (ym(j.date) === m && j.source !== "ri_settlement") for (const l of j.lines) if (l.accountId === "PTF-2120") net += l.credit - l.debit;
    net = round3(net);
    if (net > 0) post(d, "ri_settlement", m, `تسوية حسابات إعادة التكافل عن ${m}`, `Retakaful account settlement for ${m}`, [["PTF-2120", net, 0], ["PTF-1110", 0, net]]);
  });
}
// Investments
at("2026-02-01", () => post("2026-02-01", "investment", "INV-PTF-MUR-01", "إبرام مرابحة سلع مع مصرف السدرة الإسلامي", "Commodity Murabaha placed with Al-Sidra Islamic Bank",
  [["PTF-1210", 2000000, 0], ["PTF-1110", 0, 2000000]]));
for (const r of investmentReturns) {
  at(r.date, () => {
    const c = investmentById[r.contractId];
    let lines: L[];
    if (c.fund === "SHF") lines = [["SHF-1110", r.gross, 0], [c.type === "ijara" ? "SHF-4400" : "SHF-4300", 0, r.gross]];
    else if (c.type === "murabaha") {
      const row = murabahaSchedule.find((x) => x.dueDate === r.date)!;
      lines = [["PTF-1110", row.instalment, 0], ["PTF-1210", 0, row.principal], ["PTF-4400", 0, r.gross]];
    } else lines = [["PTF-1110", r.gross, 0], ["PTF-4400", 0, r.gross]];
    if (r.mudaribShare > 0) lines.push(["PTF-5400", r.mudaribShare, 0], ["PTF-2110", 0, r.mudaribShare], ["SHF-1120", r.mudaribShare, 0], ["SHF-4200", 0, r.mudaribShare]);
    const j = post(r.date, "investment", r.id, `عائد ${c.nameAr} – ${r.month}`, `Return on ${c.nameEn} – ${r.month}`, lines,
      r.mudaribShare > 0 ? { ift: { type: "MUDARIB_SHARE", from: "PTF", to: "SHF", amount: r.mudaribShare } } : {});
    r.journalId = j.id; r.iftId = j.iftId;
  });
}
// Surplus 2025: Qard repaid first, then allocation, vouchers paid
at(SURPLUS_POSTED, () => {
  const a = post(SURPLUS_POSTED, "surplus", "SR-2025", "سداد القرض الحسن لصندوق المساهمين قبل التوزيع", "Qard Hasan repaid to SHF before distribution",
    [["PTF-2150", QARD, 0], ["PTF-1110", 0, QARD], ["SHF-1110", QARD, 0], ["SHF-1130", 0, QARD]],
    { ift: { type: "QARD_REPAY", from: "PTF", to: "SHF", amount: QARD, approvedBy: ["cfo", "ssb"] } });
  const b = post(SURPLUS_POSTED, "surplus", "SR-2025", "إطفاء العجز السابق الممول بالقرض الحسن", "Prior Qard-funded deficit offset against surplus", [["PTF-3100", QARD, 0], ["PTF-3110", 0, QARD]]);
  const c = post(SURPLUS_POSTED, "surplus", "SR-2025", "توزيع فائض 2025 على المشتركين", "2025 surplus allocated to participants", [["PTF-3100", DISTRIBUTABLE, 0], ["PTF-2140", 0, DISTRIBUTABLE]],
    { ift: { type: "SURPLUS_ALLOC", from: "PTF", to: "PARTICIPANTS", amount: DISTRIBUTABLE, approvedBy: ["cfo", "actuary", "ssb", "board"] } });
  surplusRun.journalIds.push(a.id, b.id, c.id);
});
at("2026-03-15", () => {
  const v = sum(surplusAllocations.filter((x) => x.settlement === "voucher").map((x) => x.share));
  const j = post("2026-03-15", "surplus", "SR-2025", "صرف قسائم فائض 2025", "2025 surplus vouchers paid", [["PTF-2140", v, 0], ["PTF-1110", 0, v]]);
  surplusRun.journalIds.push(j.id);
});
// Purification of non-compliant income (Sharia exception SX-003)
const PURIFIED = 1284.65;
at("2026-06-30", () => post("2026-06-30", "purification", "SX-003", "فائدة مقيدة من مصرف مراسل تقليدي – تُجنَّب للتطهير", "Interest credited by a conventional correspondent bank – set aside for purification",
  [["PTF-1110", PURIFIED, 0], ["PTF-2160", 0, PURIFIED]], { sharia: "purified" }));
at("2026-07-20", () => post("2026-07-20", "purification", "SX-003", "صرف مبلغ التطهير لجهة خيرية", "Purification amount paid to charity", [["PTF-2160", PURIFIED, 0], ["PTF-1110", 0, PURIFIED]], { sharia: "purified" }));
// Staff advances (SHF)
for (const a of staffAdvances.filter((x) => x.date >= GL_START))
  at(a.date, () => { a.journalId = post(a.date, "staff_advance", a.id, `سلفة موظف (قرض حسن) ${a.employeeId}`, `Staff advance (qard) ${a.employeeId}`, [["SHF-1140", a.amount, 0], ["SHF-1110", 0, a.amount]]).id; });
// Payroll (SHF only) for approved/locked runs; statutory remittance on the 10th of next month
for (const run of payrollRuns.filter((r) => r.status !== "draft")) {
  const d = `${run.month}-27`;
  const t = run.totals;
  at(d, () => {
    run.journalId = post(d, "payroll", run.id, `رواتب ${run.month}`, `Payroll ${run.month}`, [
      ["SHF-5200", t.gross, 0], ["SHF-5210", t.ssEmployer, 0], ["SHF-2130", 0, round3(t.ssEmployee + t.ssEmployer)], ["SHF-2140", 0, t.incomeTax],
      ["SHF-2150", 0, round3(t.stamp + t.solidarity)], ["SHF-1140", 0, t.advances], ["SHF-1110", 0, t.net],
    ]).id;
  });
  const rd = `${nextYm(run.month)}-10`;
  at(rd, () => post(rd, "payroll_remittance", run.id, `توريد الاستقطاعات القانونية عن ${run.month}`, `Statutory deductions remitted for ${run.month}`, [
    ["SHF-2130", round3(t.ssEmployee + t.ssEmployer), 0], ["SHF-2140", t.incomeTax, 0], ["SHF-2150", round3(t.stamp + t.solidarity), 0],
    ["SHF-1110", 0, round3(t.ssEmployee + t.ssEmployer + t.incomeTax + t.stamp + t.solidarity)],
  ]));
}
// Month-end cash settlement of Due to/Due from (PTF -> SHF)
for (const m of MONTHS_2026) {
  const d = monthEnd(m);
  at(d, () => {
    let due = 0;
    for (const j of journals) if (ym(j.date) === m) for (const l of j.lines) if (l.accountId === "PTF-2110") due += l.credit - l.debit;
    due = round3(due);
    if (due > 0) post(d, "fund_settlement", m, `تسوية نقدية للمستحق لصندوق المساهمين – ${m}`, `Cash settlement of amounts due to SHF – ${m}`,
      [["PTF-2110", due, 0], ["PTF-1110", 0, due], ["SHF-1110", due, 0], ["SHF-1120", 0, due]],
      { ift: { type: "SETTLEMENT", from: "PTF", to: "SHF", amount: due } });
  }, 1);
}
queue.sort((a, b) => a.date.localeCompare(b.date) || a.seq - b.seq).forEach((q) => q.run());
export const journalById = indexBy(journals);
export const iftById = indexBy(interFundTransfers);

// Liquidity per fund at month end, from the GL
const CASH_ACCOUNTS: Record<FundCode, string[]> = { PTF: ["PTF-1110", "PTF-1120", "PTF-1130"], PIF: ["PIF-1110"], SHF: ["SHF-1110"] };
for (const k of kpis) {
  const end = monthEnd(k.month);
  for (const f of ["PTF", "PIF", "SHF"] as FundCode[]) {
    let bal = 0;
    for (const j of journals) if (j.date <= end) for (const l of j.lines) if (CASH_ACCOUNTS[f].includes(l.accountId)) bal += l.debit - l.credit;
    k.liquidity[f] = round3(bal);
  }
}

// =====================================================================================
// Retakaful monthly statements per counterparty (Jul–Oct 2026), from cessions/recoveries + book QS
// =====================================================================================

export const riStatements: RiStatementRow[] = [];
{
  const share = (treatyId: string, cp: string) => (treatyById[treatyId].shares.find((s) => s.counterpartyId === cp)?.pct ?? 0) / 100;
  for (const cp of counterparties) {
    let bal = 0, prevNet = 0;
    for (const m of MONTHS_2026) {
      const ces = cessions.filter((c) => ym(c.date) === m);
      const book = bookSummary.find((b) => b.month === m)!;
      const ceded = round3(sum(ces.map((c) => c.ceded * share(c.treatyId, cp.id))) + book.qsCeded * share("TR-2026-QS", cp.id));
      const commission = round3(sum(ces.map((c) => c.commission * share(c.treatyId, cp.id))) + book.qsCommission * share("TR-2026-QS", cp.id));
      const bookRec = round3(book.qsRecovered * share("TR-2026-QS", cp.id));
      const recBooked = round3(sum(recoveries.filter((r) => ym(r.bookedAt) === m).map((r) => r.amount * share(r.treatyId, cp.id))) + bookRec);
      const cashReceived = round3(sum(recoveries.filter((r) => r.receivedAt && ym(r.receivedAt) === m).map((r) => r.amount * share(r.treatyId, cp.id))) + bookRec);
      const cashPaid = m === "2026-01" ? 0 : prevNet;
      const opening = bal;
      bal = round3(bal + ceded - commission - recBooked - cashPaid + cashReceived);
      prevNet = round3(ceded - commission);
      if (m >= "2026-07") riStatements.push({ counterpartyId: cp.id, month: m, opening, contributionsCeded: ceded, commission, recoveriesBooked: recBooked, cashPaid, cashReceived, closing: bal,
        reconciliation: m === "2026-10" ? "pending" : cp.id === "RC-02" && m === "2026-09" ? "difference" : "confirmed",
        differenceNoteAr: cp.id === "RC-02" && m === "2026-09" ? "فرق 1,240.000 د.ل في عمولة الإسناد – قيد المراجعة" : undefined,
        differenceNoteEn: cp.id === "RC-02" && m === "2026-09" ? "LYD 1,240.000 difference in ceding commission – under review" : undefined });
    }
  }
}

// =====================================================================================
// Sharia (M16)
// =====================================================================================

export const ssbMembers: SsbMember[] = [
  { id: "SSB-M1", nameAr: "د. محمد غ.", nameEn: "Dr. Mohamed G.", roleAr: "رئيس الهيئة", roleEn: "Chair", personaId: "ssb", since: "2016-01-10" },
  { id: "SSB-M2", nameAr: "د. عبد الرؤوف ع.", nameEn: "Dr. Abdulraouf A.", roleAr: "عضو", roleEn: "Member", since: "2019-05-01" },
  { id: "SSB-M3", nameAr: "د. نجاة ص.", nameEn: "Dr. Najat S.", roleAr: "عضو تنفيذي", roleEn: "Executive member", since: "2022-03-15" },
];
const ALL_SSB = ["SSB-M1", "SSB-M2", "SSB-M3"];
export const ssbResolutions: SsbResolution[] = [
  { id: "SSB-2025-04", date: "2025-01-20", subject: "product", decision: "approved", signedBy: ALL_SSB,
    titleAr: "اعتماد وثائق المنتجات السبعة وشروطها", titleEn: "Approval of the seven product wordings and terms" },
  { id: "SSB-2025-09", date: "2025-01-20", subject: "split_rule", decision: "approved", signedBy: ALL_SSB,
    titleAr: "اعتماد قواعد تقسيم المساهمة (الإصدار 1) وقنوات الاستثمار المسموحة", titleEn: "Approval of contribution split rules (v1) and permitted investment channels" },
  { id: "SSB-2026-01", date: "2025-12-18", subject: "split_rule", decision: "approved", signedBy: ALL_SSB,
    titleAr: "اعتماد قواعد تقسيم المساهمة 2026 (الإصدار 2) – نسب توضيحية", titleEn: "Approval of 2026 contribution split rules (v2) – illustrative percentages" },
  { id: "SSB-2026-02", date: "2025-12-18", subject: "retakaful", decision: "approved", signedBy: ALL_SSB,
    titleAr: "اعتماد اتفاقيتي الحصة النسبية وفائض الخسارة لعام 2026", titleEn: "Approval of the 2026 quota share and excess-of-loss treaties" },
  { id: "SSB-2026-07", date: "2025-12-18", subject: "investment", decision: "approved", signedBy: ALL_SSB,
    titleAr: "تحديد حصة المضارب للمشغل بنسبة 20% من أرباح استثمار صندوق المشتركين", titleEn: "Operator Mudarib share set at 20% of PTF investment profit" },
  { id: "SSB-2026-04", date: "2026-01-27", subject: "investment", decision: "approved", signedBy: ALL_SSB,
    titleAr: "اعتماد عقد مرابحة سلع مع مصرف السدرة الإسلامي", titleEn: "Approval of a commodity Murabaha with Al-Sidra Islamic Bank" },
  { id: "SSB-2026-03", date: "2026-02-10", subject: "surplus", decision: "approved", signedBy: ALL_SSB,
    titleAr: "اعتماد حساب وتوزيع الفائض التأميني لعام 2025 بعد سداد القرض الحسن", titleEn: "Approval of the 2025 surplus computation and distribution after Qard Hasan repayment" },
  { id: "SSB-2026-05", date: "2026-03-05", subject: "retakaful", decision: "approved_with_conditions", signedBy: ALL_SSB,
    titleAr: "الإسناد الاختياري لمعيد تأمين تقليدي للضرورة (شحنة بحرية) بشروط", titleEn: "Facultative cession to a conventional reinsurer by necessity (marine cargo), with conditions" },
  { id: "SSB-2026-08", date: "2026-04-22", subject: "policy", decision: "approved", signedBy: ALL_SSB,
    titleAr: "رسوم التأخير – إن وجدت – تُصرف لحساب الخيرات ولا تدخل الإيرادات", titleEn: "Late fees, if any, go to the charity account, never to income" },
  { id: "SSB-2026-06", date: "2026-07-14", subject: "purification", decision: "approved", signedBy: ALL_SSB,
    titleAr: "تطهير فائدة مقيدة بمبلغ 1,284.650 د.ل وصرفها لجهة خيرية", titleEn: "Purification of LYD 1,284.650 interest credited and payment to charity" },
];
export const ssbApprovals: SsbApproval[] = [
  ...products.map((p, i): SsbApproval => ({ id: `SSA-${pad(i + 1, 3)}`, subjectKind: "product", subjectId: p.id, resolutionId: "SSB-2025-04", date: "2025-01-20", status: "approved" })),
  ...splitRules.map((r, i): SsbApproval => ({ id: `SSA-${pad(i + 8, 3)}`, subjectKind: "split_rule", subjectId: r.id, resolutionId: r.ssbResolutionId, date: r.version === 1 ? "2025-01-20" : "2025-12-18", status: "approved" })),
  { id: "SSA-022", subjectKind: "investment", subjectId: "INV-PTF-MUR-01", resolutionId: "SSB-2026-04", date: "2026-01-27", status: "approved" },
  { id: "SSA-023", subjectKind: "counterparty", subjectId: "RC-03", resolutionId: "SSB-2026-05", date: "2026-03-05", status: "approved" },
  { id: "SSA-024", subjectKind: "surplus_run", subjectId: "SR-2025", resolutionId: "SSB-2026-03", date: "2026-02-10", status: "approved" },
  { id: "SSA-025", subjectKind: "investment", subjectId: "INV-PTF-SUK-01", date: "2026-10-26", status: "pending" },
];
export const shariaExceptions: ShariaException[] = [
  { id: "SX-001", at: "2026-04-07T10:42", kind: "blocked_mixing", byPersonaId: "accountant", amount: 18450, outcome: "blocked",
    descriptionAr: "محاولة صرف عمولات وكلاء من حساب مصرف صندوق المشتركين – رُفض: العمولات مصروف على صندوق المساهمين",
    descriptionEn: "Attempt to pay agents' commission from the PTF bank account – blocked: commissions are an SHF expense" },
  { id: "SX-002", at: "2026-08-19T14:05", kind: "blocked_mixing", byPersonaId: "accountant", amount: 6200, outcome: "blocked",
    descriptionAr: "قيد يدوي يجمع مصرف صندوق المشتركين مع مصروف رواتب صندوق المساهمين دون تحويل معتمد – رُفض",
    descriptionEn: "Manual journal mixing PTF bank with SHF salary expense without an approved transfer – blocked" },
  { id: "SX-003", at: "2026-06-30T09:10", kind: "non_compliant_income", byPersonaId: "cfo", amount: PURIFIED, outcome: "purified", resolutionId: "SSB-2026-06",
    descriptionAr: "فائدة قيدها مصرف مراسل تقليدي على حساب صندوق المشتركين – جُنّبت وصرفت لجهة خيرية",
    descriptionEn: "Interest credited by a conventional correspondent bank to a PTF account – set aside and paid to charity",
    journalId: journals.find((j) => j.source === "purification")!.id },
];
export const complianceCertificates: ComplianceCertificate[] = [
  { id: "SCC-2025-A", year: 2025, scope: "annual", issuedAt: "2026-03-02", resolutionId: "SSB-2026-03" },
  ...products.map((p): ComplianceCertificate => ({ id: `SCC-2026-${p.id}`, year: 2026, scope: "product", productId: p.id, issuedAt: "2026-01-05", resolutionId: "SSB-2026-01" })),
];

// =====================================================================================
// Inbox per persona
// =====================================================================================

const IB = (personaId: string, module: string, kind: InboxItem["kind"], titleAr: string, titleEn: string, refKind: string, refId: string, due: string,
  priority: InboxItem["priority"] = "normal", status: InboxItem["status"] = "open"): Omit<InboxItem, "id"> =>
  ({ personaId, module, kind, titleAr, titleEn, ref: { kind: refKind, id: refId }, due, priority, status });
const expiringSoon = policies.filter((p) => p.status === "active" && p.end >= TODAY && p.end <= addDays(TODAY, 30));
export const inbox: InboxItem[] = [
  IB("uw", "m05", "referral", "إحالة: مركبة عالية القيمة (310,000 د.ل)", "Referral: high-value vehicle (LYD 310,000)", "quote", "Q-2026-02121", "2026-11-03", "high"),
  IB("uw", "m05", "referral", "إحالة: محطة وقود – نشاط خطر", "Referral: fuel station – hazardous occupancy", "quote", "Q-2026-02129", "2026-11-04"),
  IB("uw", "m05", "referral", "إحالة: مسافر عمره 79 سنة", "Referral: traveller aged 79", "quote", "Q-2026-02136", "2026-11-03"),
  IB("uw", "m06", "alert", `${expiringSoon.length} شهادات تنتهي خلال 30 يوماً`, `${expiringSoon.length} certificates expire within 30 days`, "report", "renewals-30d", "2026-11-05"),
  IB("claims", "m09", "sla_breach", "تجاوز مهلة 5 أيام عمل: مطالبة أسطول برقة", "5-working-day SLA breached: Barqa fleet claim", "claim", "CLM-2026-00089", "2026-11-02", "high"),
  IB("claims", "m09", "approval", "اعتماد تعويض بطاقة برتقالية (6,880 د.ل)", "Approve Orange Card claim (LYD 6,880)", "claim", "CLM-2026-00086", "2026-11-03"),
  IB("claims", "m09", "task", "مستند ناقص: محضر الشرطة", "Missing document: police report", "claim", "CLM-2026-00093", "2026-11-04"),
  IB("claims", "m09", "alert", "مطالبة قرب حد المهلة (اليوم 4)", "Claim approaching SLA (day 4)", "claim", "CLM-2026-00091", "2026-11-03"),
  IB("claims", "m09", "task", "إقفال مطالبة بعد تحصيل استرداد إعادة التكافل", "Close claim after retakaful recovery is collected", "claim", "CLM-2026-00081", "2026-11-10", "low"),
  IB("cfo", "m09", "approval", "اعتماد تعويض مستودع فزان (37,900 د.ل)", "Approve Fezzan warehouse claim (LYD 37,900)", "claim", "CLM-2026-00087", "2026-11-03", "high"),
  IB("cfo", "m09", "approval", "اعتماد تعويض مركبة عميل PEP (41,000 د.ل)", "Approve PEP customer motor claim (LYD 41,000)", "claim", "CLM-2026-00088", "2026-11-03", "high"),
  IB("cfo", "m34", "approval", "اعتماد مسير رواتب أكتوبر 2026", "Approve October 2026 payroll run", "payroll_run", "PR-2026-10", "2026-11-05"),
  IB("cfo", "m12", "task", "إقفال فترة أكتوبر 2026", "Close period October 2026", "period", "2026-10", "2026-11-12"),
  IB("accountant", "m12", "task", "قائمة إقفال أكتوبر: تسوية البنوك", "October close checklist: bank reconciliation", "period", "2026-10", "2026-11-08"),
  IB("accountant", "m07", "alert", "3 أقساط متأخرة السداد", "3 instalments overdue", "report", "overdue-instalments", "2026-11-04"),
  IB("accountant", "m10", "task", "تسوية إعادة التكافل لشهر أكتوبر (تُستحق 10 نوفمبر)", "October retakaful settlement (due 10 November)", "ri_statement", "2026-10", "2026-11-10"),
  IB("reins", "m10", "task", "مطالبة نقدية لمعيدي فائض الخسارة (150,000 د.ل)", "Cash call to XoL reinsurers (LYD 150,000)", "claim", "CLM-2026-00079", "2026-11-04", "high"),
  IB("reins", "m10", "review", "فرق في كشف مجموعة الواحة لشهر سبتمبر", "Difference on Al-Waha September statement", "ri_statement", "RC-02:2026-09", "2026-11-06"),
  IB("reins", "m10", "task", "عرض إسناد اختياري لشحنة زيت 1,800,000 د.ل", "Facultative offer for LYD 1,800,000 oil cargo", "quote", "Q-2026-02100", "2026-11-03"),
  IB("dist", "m04", "alert", "ترخيص مكتب الرواد منتهٍ – الوكيل موقوف", "Al-Rowad licence expired – agent suspended", "agent", "AG-10", "2026-11-05", "high"),
  IB("dist", "m04", "alert", "ترخيص وكالة الهدى ينتهي 15 ديسمبر", "Al-Huda licence expires 15 December", "agent", "AG-03", "2026-11-30"),
  IB("dist", "m04", "approval", "اعتماد عمولات أكتوبر (تشغيل شهري)", "Approve October commission run", "commission_run", "2026-10", "2026-11-07"),
  IB("invest", "m11", "task", "تأكيد ربح المضاربة للربع الثالث", "Confirm Q3 Mudaraba profit", "investment", "INV-PTF-MUD-01", "2026-11-06"),
  IB("invest", "m11", "review", "مقترح صكوك إجارة بانتظار الهيئة الشرعية", "Ijara sukuk proposal awaiting the SSB", "investment", "INV-PTF-SUK-01", "2026-11-20", "low"),
  IB("ssb", "m16", "approval", "اعتماد مقترح صكوك إجارة 1,500,000 د.ل", "Approve Ijara sukuk proposal LYD 1,500,000", "investment", "INV-PTF-SUK-01", "2026-11-15"),
  IB("ssb", "m16", "review", "مراجعة استثناءات شرعية الربع الثالث (3)", "Review Q3 Sharia exceptions (3)", "report", "sharia-exceptions", "2026-11-10"),
  IB("ssb", "m15", "task", "تحضير المراجعة الشرعية السنوية 2026", "Prepare the 2026 annual Sharia review", "report", "annual-review-2026", "2026-12-15", "low"),
  IB("hr", "m33", "approval", "طلب إجازة سنوية – بشير ش.", "Annual leave request – Bashir S.", "leave", "LV-0178", "2026-11-04"),
  IB("hr", "m33", "alert", "وثائق هوية تنتهي خلال 60 يوماً (3 موظفين)", "ID documents expiring within 60 days (3 staff)", "report", "id-expiry", "2026-11-09"),
  IB("hr", "m34", "task", "مراجعة مسودة رواتب أكتوبر", "Review October payroll draft", "payroll_run", "PR-2026-10", "2026-11-04", "high"),
  IB("border", "m07", "task", "إقفال صندوق منفذ رأس اجدير اليومي", "Ras Ajdir daily cash-up", "outlet", "BP-RAJ", "2026-11-02", "high"),
  IB("border", "m06", "alert", "كتلة أرقام البطاقة البرتقالية قاربت على النفاد (8%)", "Orange Card number block nearly used (8% left)", "outlet", "BP-RAJ", "2026-11-06"),
  IB("gm", "m09", "approval", "اعتماد تعويض حريق مصنع الواحة (250,000 د.ل)", "Approve Al-Waha factory fire claim (LYD 250,000)", "claim", "CLM-2026-00079", "2026-10-28", "high", "done"),
  IB("gm", "m28", "review", "لوحة الأداء: نسبة الخسارة للإجباري فوق 60%", "Dashboard: compulsory motor loss ratio above 60%", "kpi", "lossRatio.CMP", "2026-11-05"),
  IB("gm", "m04", "approval", "اعتماد إيقاف مكتب الرواد للوساطة", "Approve suspension of Al-Rowad Brokerage", "agent", "AG-10", "2026-11-03"),
  IB("admin", "m28", "alert", "مراجعة صلاحيات المستخدمين الربعية", "Quarterly user access review", "report", "access-review", "2026-11-15", "low"),
].map((x, i) => ({ id: `INB-${pad(i + 1, 3)}`, ...x }));

// =====================================================================================
// Maps & selectors
// =====================================================================================

export const customerById = indexBy(customers);
export const outletById = indexBy(outlets);
export const counterpartyById = indexBy(counterparties);
export const surveyorById = indexBy(surveyors);
export const departmentById = indexBy(departments);

export const policiesOfCustomer = (customerId: string) => policies.filter((p) => p.customerId === customerId);
export const policiesOfAgent = (agentId: string) => policies.filter((p) => p.agentId === agentId);
export const claimsOfPolicy = (policyId: string) => claims.filter((c) => c.policyId === policyId);
export const claimsOfCustomer = (customerId: string) => claims.filter((c) => c.customerId === customerId);
export const receiptsOfPolicy = (policyId: string) => receipts.filter((r) => r.policyId === policyId);
export const receiptsOfCustomer = (customerId: string) => receipts.filter((r) => r.customerId === customerId);
export const instalmentsOfPolicy = (policyId: string) => instalments.filter((i) => i.policyId === policyId);
export const overdueInstalments = () => instalments.filter((i) => i.status === "overdue");
export const expiringPolicies = (days = 30, from = TODAY) => policies.filter((p) => p.status === "active" && p.end >= from && p.end <= addDays(from, days));
export const commissionLinesOfAgent = (agentId: string) => commissionLines.filter((l) => l.agentId === agentId);
export const agentMonthsOf = (agentId: string) => agentMonths.filter((m) => m.agentId === agentId);
export const recoveriesOfClaim = (claimId: string) => recoveries.filter((r) => r.claimId === claimId);
export const cessionsOfTreaty = (treatyId: string) => cessions.filter((c) => c.treatyId === treatyId);
export const journalsOf = (sourceId: string) => journals.filter((j) => j.sourceId === sourceId);
export const journalsOfFund = (fund: FundCode) => journals.filter((j) => j.lines.some((l) => l.fund === fund));
export const returnsOfContract = (contractId: string) => investmentReturns.filter((r) => r.contractId === contractId);
export const payrollLinesOf = (runId: string) => payrollLines.filter((l) => l.runId === runId);
export const employeeOfPersona = (personaId: string) => employees.find((e) => e.personaId === personaId);
export const inboxOf = (personaId: string) => inbox.filter((i) => i.personaId === personaId);
export const quotesReferred = () => quotes.filter((q) => q.referral?.decision === "pending");
export const claimsInStage = (stage: ClaimStage) => claims.filter((c) => c.stage === stage && !c.rejected);
export const claimsRejected = () => claims.filter((c) => c.rejected);
export const customerName = (id: string, lang: Lang = "ar") => { const c = customerById[id]; return c ? (lang === "ar" ? c.nameAr : c.nameEn) : id; };
export const isPeriodClosed = (date: string) => periods.find((p) => p.id === ym(date))?.status === "closed";

/** Per-fund debit/credit totals of one journal; balanced when every diff is 0. */
export function journalFundTotals(j: Journal): Record<string, { debit: number; credit: number; diff: number }> {
  const t: Record<string, { debit: number; credit: number; diff: number }> = {};
  for (const l of j.lines) {
    const x = (t[l.fund] ??= { debit: 0, credit: 0, diff: 0 });
    x.debit = round3(x.debit + l.debit); x.credit = round3(x.credit + l.credit); x.diff = round3(x.debit - x.credit);
  }
  return t;
}
export const isJournalBalancedPerFund = (j: Journal) => Object.values(journalFundTotals(j)).every((x) => Math.abs(x.diff) < 0.0005);

/** Trial balance of one fund (or all funds when omitted), up to and including a date. */
export function trialBalance(fund?: FundCode, upTo: string = TODAY, from: string = GL_START): TrialBalanceRow[] {
  const agg: Record<string, { d: number; c: number }> = {};
  for (const j of journals) {
    if (j.date > upTo || j.date < from) continue;
    for (const l of j.lines) {
      if (fund && l.fund !== fund) continue;
      const x = (agg[l.accountId] ??= { d: 0, c: 0 });
      x.d += l.debit; x.c += l.credit;
    }
  }
  return accounts.filter((a) => agg[a.id]).map((a) => {
    const x = agg[a.id];
    return { accountId: a.id, code: a.code, nameAr: a.nameAr, nameEn: a.nameEn, type: a.type, debit: round3(x.d), credit: round3(x.c), balance: round3(x.d - x.c) };
  });
}
export const accountBalance = (accountId: string, upTo: string = TODAY) => {
  let b = 0;
  for (const j of journals) if (j.date <= upTo) for (const l of j.lines) if (l.accountId === accountId) b += l.debit - l.credit;
  return round3(b);
};
/** Income statement totals per fund for a date range (income positive). */
export function fundResult(fund: FundCode, from: string = GL_START, to: string = TODAY) {
  const tb = trialBalance(fund, to, from);
  const income = round3(-sum(tb.filter((r) => r.type === "income").map((r) => r.balance)));
  const expense = sum(tb.filter((r) => r.type === "expense").map((r) => r.balance));
  return { income, expense, result: round3(income - expense) };
}

// =====================================================================================
// HERO STORY — Mohamed Ali W., comprehensive motor, Misrata
// =====================================================================================

const heroPolicy = P(18);
const heroClaim = claimById["CLM-2026-00073"];
const heroReceipts = receiptsOfPolicy(heroPolicy.id);
export const STORY = {
  customerId: "CUS-1001",
  agentId: "AG-01",
  outletId: "BR-MIS",
  previousPolicyId: P(1).id,
  previousCertNo: P(1).certNo,
  quoteId: "Q-2026-00412",
  uwRuleId: "UW-MTR-01",
  policyId: heroPolicy.id,
  certNo: "TK-MTR-2026-000184",
  splitRuleId: heroPolicy.splitRuleId,
  wakalaPct: heroPolicy.wakalaPct,
  instalmentIds: instalmentsOfPolicy(heroPolicy.id).map((i) => i.id),
  receiptIds: heroReceipts.map((r) => r.id),
  receiptJournalIds: heroReceipts.map((r) => r.journalId!),
  wakalaTransferIds: heroReceipts.map((r) => r.iftId!),
  surplusCreditJournalId: journals.find((j) => j.source === "surplus_credit" && j.sourceId === heroPolicy.id)!.id,
  commissionLineIds: commissionLines.filter((l) => l.policyId === heroPolicy.id).map((l) => l.id),
  treatyId: "TR-2026-QS",
  cessionId: cessions.find((c) => c.policyId === heroPolicy.id)!.id,
  accidentDate: "2026-09-14",
  claimId: heroClaim.id,
  surveyorId: heroClaim.surveyorId!,
  claimPaymentJournalId: journals.find((j) => j.source === "claim_payment" && j.sourceId === heroClaim.id)!.id,
  recoveryId: heroClaim.recoveryIds[0],
  surplusRunId: "SR-2025",
  surplusAllocationId: surplusAllocations.find((a) => a.customerId === "CUS-1001")!.id,
  surplusShare: surplusAllocations.find((a) => a.customerId === "CUS-1001")!.share,
} as const;
