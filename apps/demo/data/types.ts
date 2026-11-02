// Types for the TakafulTech demo dataset (data/seed.ts). All records are invented.
// Money: LYD as number with up to 3 decimals (1250.5 = 1,250.500 LYD).
// Dates: ISO "YYYY-MM-DD" (or "YYYY-MM-DDTHH:mm" for timeline events).

import type { FundCode, ShariaStatus } from "@/lib/types";
export type { FundCode, ShariaStatus };

export type ISODate = string;
export type Money = number;

export interface Named {
  nameAr: string;
  nameEn: string;
}

// ---------------------------------------------------------------- organisation
export type OutletKind = "branch" | "border_point" | "licensing_office";
export interface Outlet extends Named {
  id: string;
  kind: OutletKind;
  cityAr: string;
  cityEn: string;
  isHq?: boolean;
  borderType?: "land" | "sea" | "air";
  /** Branch that supervises a border point / licensing office */
  parentBranchId?: string;
}

// ---------------------------------------------------------------- customers (M02)
export type CustomerType = "individual" | "company";
export type KycLevel = "basic" | "standard" | "enhanced";
export type CustomerDocType = "national_id" | "passport" | "driving_licence" | "commercial_register" | "tax_certificate";
export interface CustomerDoc {
  type: CustomerDocType;
  number: string;
  expiry: ISODate;
}
export interface Customer extends Named {
  id: string;
  type: CustomerType;
  gender?: "M" | "F";
  birthDate?: ISODate;
  /** Invented 12-digit national number (individuals) */
  nationalNo?: string;
  /** Invented commercial register number (companies) */
  crNo?: string;
  /** Obviously fake: 09x-0000xxx */
  phone: string;
  cityAr: string;
  cityEn: string;
  /** Home outlet (branch) */
  outletId: string;
  kycLevel: KycLevel;
  pep: boolean;
  pepRoleAr?: string;
  pepRoleEn?: string;
  sanctionsHit: boolean;
  docs: CustomerDoc[];
  createdAt: ISODate;
}
export interface DuplicateCandidate {
  id: string;
  customerIds: [string, string];
  /** 0..100 */
  score: number;
  reasonsAr: string[];
  reasonsEn: string[];
  status: "open" | "merged" | "dismissed";
}

// ---------------------------------------------------------------- products, rules (M06/M05)
export type ProductCode = "CMP" | "MTR" | "ORC" | "TRV" | "FIR" | "MAR" | "HAJ";
/** Insurance class for per-class accounts (Law 3/2005 Art. 23) */
export type ClassCode = "MOTOR" | "TRAVEL" | "PROPERTY" | "MARINE" | "PA";
export interface Product extends Named {
  id: ProductCode;
  /** Certificate number prefix, e.g. "TK-MTR" */
  certPrefix: string;
  classCode: ClassCode;
  compulsory: boolean;
  /** Illustrative until the client signs the fund parameter sheet */
  wakalaPct: number;
  tabarruPct: number;
  illustrative: true;
  ratingAr: string;
  ratingEn: string;
  /** Rate on sum insured (fraction), if rated that way */
  rate?: number;
  minContribution?: number;
  treatyIds: string[];
  splitRuleId: string;
  ssbResolutionId: string;
  sharia_status: ShariaStatus;
  /** Claim document checklist keys */
  claimDocs: ClaimDocKey[];
}
export interface SplitRule {
  id: string;
  productId: ProductCode;
  version: number;
  tabarruPct: number;
  wakalaPct: number;
  investmentPct: number;
  effectiveFrom: ISODate;
  ssbResolutionId: string;
  status: "approved" | "superseded" | "draft";
  illustrative: boolean;
}
export type UwOutcome = "auto_accept" | "refer" | "decline";
export interface UwRule extends Named {
  id: string;
  productIds: ProductCode[];
  conditionAr: string;
  conditionEn: string;
  outcome: UwOutcome;
  /** Approval level required when outcome is "refer" */
  referTo?: ApprovalLevel;
}
export type ApprovalLevel = "underwriter" | "senior_underwriter" | "uw_manager" | "cfo" | "gm" | "compliance" | "claims_manager";
export interface ApprovalMatrixRow {
  id: string;
  area: "underwriting" | "claims";
  level: ApprovalLevel;
  levelAr: string;
  levelEn: string;
  /** Max sum insured (underwriting) or claim amount (claims); null = unlimited */
  limit: Money | null;
  personaId?: string;
}

// ---------------------------------------------------------------- distribution (M04)
export type AgentKind = "agent" | "broker" | "border_agent";
export interface Agent extends Named {
  id: string;
  kind: AgentKind;
  outletId: string;
  licenceNo: string;
  licenceExpiry: ISODate;
  products: ProductCode[];
  /** Company-book figures (all business, not only the sample records) */
  targetAnnual: Money;
  collectedYtd: Money;
  tierId: string;
  phone: string;
  status: "active" | "suspended";
}
export interface CommissionTier {
  id: string;
  nameAr: string;
  nameEn: string;
  /** Monthly collected contributions band (whole-band method) */
  from: Money;
  to: Money | null;
  ratePct: number;
}
export interface AgentMonth {
  agentId: string;
  month: string; // "2026-08"
  target: Money;
  collected: Money;
  tierId: string;
  ratePct: number;
  commission: Money;
  status: "paid" | "approved" | "pending";
}
export interface CommissionLine {
  id: string;
  agentId: string;
  policyId: string;
  receiptId: string;
  date: ISODate;
  base: Money;
  ratePct: number;
  /** Negative for clawback */
  amount: Money;
  kind: "earned" | "clawback";
  status: "paid" | "pending";
  /** Always SHF */
  fund: "SHF";
  journalId?: string;
  sharia_status: ShariaStatus;
}

// ---------------------------------------------------------------- quotes & policies (M05/M06)
export type QuoteStatus = "quoted" | "referred" | "approved" | "declined" | "issued" | "expired";
export interface RuleHit {
  ruleId: string;
  outcome: UwOutcome;
}
export interface Quote {
  id: string;
  date: ISODate;
  customerId: string;
  productId: ProductCode;
  outletId: string;
  agentId?: string;
  sumInsured: Money;
  contribution: Money;
  riskAr: string;
  riskEn: string;
  rulesFired: RuleHit[];
  status: QuoteStatus;
  referral?: {
    level: ApprovalLevel;
    assignedPersonaId: string;
    decision: "pending" | "approved" | "declined";
    decidedAt?: ISODate;
    noteAr: string;
    noteEn: string;
  };
  policyId?: string;
  sharia_status: ShariaStatus;
}
export type PolicyStatus = "active" | "expired" | "cancelled";
export type BillingPlan = "single" | "2_instalments" | "quarterly";
export interface Policy {
  id: string;
  /** e.g. TK-MTR-2026-000184 */
  certNo: string;
  productId: ProductCode;
  customerId: string;
  outletId: string;
  agentId?: string;
  quoteId?: string;
  renewalOfId?: string;
  issuedAt: ISODate;
  start: ISODate;
  end: ISODate;
  status: PolicyStatus;
  cancelledAt?: ISODate;
  cancelReasonAr?: string;
  cancelReasonEn?: string;
  sumInsured: Money;
  riskAr: string;
  riskEn: string;
  /** Gross contribution (rated) */
  contribution: Money;
  wakalaPct: number;
  tabarru: Money;
  wakala: Money;
  /** 2025 surplus share applied as renewal discount */
  surplusCredit: Money;
  /** contribution - surplusCredit */
  netPayable: Money;
  billingPlan: BillingPlan;
  splitRuleId: string;
  issuedByPersonaId: string;
  sharia_status: ShariaStatus;
}
export type InstalmentStatus = "paid" | "due" | "overdue";
export interface Instalment {
  id: string;
  policyId: string;
  seq: number;
  dueDate: ISODate;
  amount: Money;
  status: InstalmentStatus;
  receiptId?: string;
}

// ---------------------------------------------------------------- billing (M07)
export type PaymentChannel = "cash_branch" | "bank_transfer" | "card_moamalat" | "cash_border";
export interface Receipt {
  id: string;
  date: ISODate;
  policyId: string;
  customerId: string;
  instalmentId: string;
  outletId: string;
  channel: PaymentChannel;
  amount: Money;
  /** Fund split by the policy's split rule */
  tabarru: Money; // -> PTF
  wakala: Money; // -> SHF via WAKALA_FEE transfer
  gatewayRef?: string;
  /** Set for receipts dated on/after GL go-live (2026-01-01) */
  journalId?: string;
  iftId?: string;
  sharia_status: ShariaStatus;
}

// ---------------------------------------------------------------- claims (M09)
export type ClaimStage = "registered" | "review" | "assessed" | "approved" | "paid" | "closed";
export type ClaimDocKey =
  | "claim_form" | "police_report" | "driving_licence" | "vehicle_registration" | "photos"
  | "repair_estimate" | "medical_report" | "invoices" | "civil_defence_report" | "bill_of_lading"
  | "survey_report" | "passport_copy" | "id_copy";
export interface ClaimDoc {
  key: ClaimDocKey;
  received: boolean;
  receivedAt?: ISODate;
}
export interface ClaimEvent {
  at: string; // ISO date-time
  stage: ClaimStage | "rejected";
  byPersonaId?: string;
  noteAr: string;
  noteEn: string;
}
export interface Claim {
  id: string;
  policyId: string;
  customerId: string;
  productId: ProductCode;
  outletId: string;
  lossDate: ISODate;
  registeredAt: ISODate;
  stage: ClaimStage;
  rejected: boolean;
  rejectReasonAr?: string;
  rejectReasonEn?: string;
  descriptionAr: string;
  descriptionEn: string;
  locationAr: string;
  locationEn: string;
  /** Current outstanding reserve (0 once paid/closed/rejected) */
  reserve: Money;
  initialReserve: Money;
  assessed?: Money;
  deductible: Money;
  approved?: Money;
  paid?: Money;
  surveyorId?: string;
  handlerPersonaId: string;
  approverLevel?: ApprovalLevel;
  docs: ClaimDoc[];
  timeline: ClaimEvent[];
  stageDates: Partial<Record<ClaimStage | "rejected", ISODate>>;
  /** Working days Registered -> Paid (or -> today while open). Libyan weekend Fri/Sat + holidays */
  slaWorkingDays: number;
  slaTarget: number;
  slaBreached: boolean;
  recoveryIds: string[];
  journalIds: string[];
  sharia_status: ShariaStatus;
}
export interface Surveyor extends Named {
  id: string;
  cityAr: string;
  cityEn: string;
  specialty: "motor" | "property" | "marine";
  phone: string;
}

// ---------------------------------------------------------------- retakaful (M10)
export interface Counterparty extends Named {
  id: string;
  countryAr: string;
  countryEn: string;
  kind: "retakaful" | "conventional";
  /** Illustrative rating */
  rating: string;
  isaRegistration: "registered" | "pending";
  sharia_status: ShariaStatus;
  ssbResolutionId?: string;
}
export type TreatyType = "quota_share" | "excess_of_loss" | "facultative";
export interface Treaty extends Named {
  id: string;
  type: TreatyType;
  productIds: ProductCode[];
  start: ISODate;
  end: ISODate;
  /** Quota share / facultative ceded % */
  cededPct?: number;
  /** XoL */
  retention?: Money;
  limit?: Money;
  minDepositPremium?: Money;
  reinstatements?: number;
  cedingCommissionPct: number;
  shares: { counterpartyId: string; pct: number }[];
  /** Facultative: the certificate it covers */
  policyId?: string;
  status: "active" | "expired";
  sharia_status: ShariaStatus;
}
export interface Cession {
  id: string;
  treatyId: string;
  /** Absent for XoL deposit premium instalments */
  policyId?: string;
  date: ISODate;
  kind: "proportional" | "xol_premium";
  base: Money;
  ceded: Money;
  commission: Money;
  journalId?: string;
  sharia_status: ShariaStatus;
}
export interface Recovery {
  id: string;
  claimId: string;
  treatyId: string;
  bookedAt: ISODate;
  amount: Money;
  status: "receivable" | "received";
  receivedAt?: ISODate;
  journalIds: string[];
}
export interface RiStatementRow {
  counterpartyId: string;
  month: string;
  opening: Money;
  contributionsCeded: Money;
  commission: Money;
  recoveriesBooked: Money;
  cashPaid: Money;
  cashReceived: Money;
  /** Positive = we owe the counterparty */
  closing: Money;
  reconciliation: "confirmed" | "difference" | "pending";
  differenceNoteAr?: string;
  differenceNoteEn?: string;
}

// ---------------------------------------------------------------- accounting (M12)
export interface Account extends Named {
  /** e.g. "PTF-4100-MOTOR" */
  id: string;
  fund: FundCode;
  code: string;
  type: "asset" | "liability" | "equity" | "income" | "expense";
  classCode?: ClassCode;
}
export interface JournalLine {
  accountId: string;
  fund: FundCode;
  debit: Money;
  credit: Money;
}
export type JournalSource =
  | "opening" | "receipt" | "surplus_credit" | "claim_payment" | "cession" | "recovery" | "ri_settlement"
  | "commission" | "commission_payment" | "investment" | "payroll" | "payroll_remittance" | "staff_advance"
  | "surplus" | "fund_settlement" | "purification" | "book_summary" | "opex";
export interface Journal {
  id: string;
  date: ISODate;
  source: JournalSource;
  /** Id of the record that produced it (receipt, claim, ...) */
  sourceId?: string;
  memoAr: string;
  memoEn: string;
  lines: JournalLine[];
  /** Required when the journal touches more than one fund */
  iftId?: string;
  status: "posted";
  sharia_status: ShariaStatus;
}
export type IftType = "WAKALA_FEE" | "MUDARIB_SHARE" | "QARD_DRAW" | "QARD_REPAY" | "SURPLUS_ALLOC" | "SETTLEMENT";
export interface InterFundTransfer {
  id: string;
  type: IftType;
  from: FundCode;
  to: FundCode | "PARTICIPANTS";
  amount: Money;
  date: ISODate;
  journalId: string;
  sourceId?: string;
  approvedBy: string[]; // persona ids or "rule"
}
export interface Period {
  id: string; // "2026-09"
  status: "closed" | "open";
  closedAt?: ISODate;
  closedByPersonaId?: string;
}
export interface TrialBalanceRow {
  accountId: string;
  code: string;
  nameAr: string;
  nameEn: string;
  type: Account["type"];
  debit: Money;
  credit: Money;
  /** debit - credit */
  balance: Money;
}

// ---------------------------------------------------------------- investments (M11)
export type InvestmentType = "murabaha" | "mudaraba" | "ijara" | "islamic_deposit" | "sukuk";
export interface Portfolio extends Named {
  id: string;
  fund: FundCode;
}
export interface InvestmentContract extends Named {
  id: string;
  portfolioId: string;
  fund: FundCode;
  type: InvestmentType;
  counterpartyAr: string;
  counterpartyEn: string;
  start: ISODate;
  end: ISODate;
  principal: Money;
  /** Expected annual return % (illustrative) */
  expectedPct: number;
  /** Mudaraba: share of profit to the fund (capital provider) */
  profitRatioFundPct?: number;
  /** Murabaha: total mark-up */
  markup?: Money;
  /** Ijara: monthly rental */
  monthlyRental?: Money;
  status: "active" | "proposed" | "matured";
  ssbResolutionId?: string;
  sharia_status: ShariaStatus;
}
export interface MurabahaScheduleRow {
  contractId: string;
  seq: number;
  dueDate: ISODate;
  principal: Money;
  profit: Money;
  instalment: Money;
  status: "received" | "due";
}
export interface InvestmentReturn {
  id: string;
  contractId: string;
  fund: FundCode;
  month: string;
  date: ISODate;
  gross: Money;
  /** Operator's Mudarib share (PTF/PIF only), to SHF */
  mudaribShare: Money;
  netToFund: Money;
  journalId?: string;
  iftId?: string;
}

// ---------------------------------------------------------------- sharia (M16)
export interface SsbMember extends Named {
  id: string;
  roleAr: string;
  roleEn: string;
  personaId?: string;
  since: ISODate;
}
export interface SsbResolution {
  id: string;
  date: ISODate;
  titleAr: string;
  titleEn: string;
  subject: "product" | "split_rule" | "investment" | "surplus" | "retakaful" | "purification" | "policy";
  decision: "approved" | "approved_with_conditions" | "rejected";
  signedBy: string[]; // ssb member ids
}
export interface SsbApproval {
  id: string;
  subjectKind: "product" | "split_rule" | "investment" | "counterparty" | "surplus_run" | "form";
  subjectId: string;
  resolutionId: string;
  date: ISODate;
  status: "approved" | "pending" | "rejected";
}
export interface ShariaException {
  id: string;
  at: string;
  kind: "blocked_mixing" | "non_compliant_income";
  descriptionAr: string;
  descriptionEn: string;
  byPersonaId: string;
  amount: Money;
  outcome: "blocked" | "purified";
  journalId?: string;
  resolutionId?: string;
}
export interface ComplianceCertificate {
  id: string;
  year: number;
  scope: "annual" | "product";
  productId?: ProductCode;
  issuedAt: ISODate;
  resolutionId: string;
}

// ---------------------------------------------------------------- surplus (M15)
export interface SurplusComponent {
  key: string;
  labelAr: string;
  labelEn: string;
  /** Signed: + adds to surplus, - deducts */
  amount: Money;
}
export interface SurplusApproval {
  step: "cfo" | "actuary" | "ssb" | "board";
  labelAr: string;
  labelEn: string;
  status: "approved" | "pending";
  at?: ISODate;
  byAr: string;
  byEn: string;
}
export interface SurplusAllocation {
  id: string;
  runId: string;
  /** Absent for the aggregated line of all other participants */
  customerId?: string;
  labelAr?: string;
  labelEn?: string;
  contribution: Money;
  share: Money;
  settlement: "renewal_discount" | "voucher";
  /** Policy the renewal discount was applied to */
  appliedPolicyId?: string;
  voucherNo?: string;
  status: "applied" | "paid" | "held";
}
export interface SurplusRun {
  id: string;
  year: number;
  status: "completed";
  components: SurplusComponent[];
  netSurplus: Money;
  qardOutstanding: Money;
  qardRepaid: Money;
  retentionPct: number;
  distributable: Money;
  distributionPct: number;
  eligibleContributions: Money;
  /** distributable / eligibleContributions */
  ratio: number;
  eligibilityRuleAr: string;
  eligibilityRuleEn: string;
  solvencyBefore: number;
  solvencyAfter: number;
  approvals: SurplusApproval[];
  postedAt: ISODate;
  journalIds: string[];
  ssbResolutionId: string;
}

// ---------------------------------------------------------------- HR & payroll (M33/M34)
export interface Department {
  id: string;
  /** Matches persona deptKey */
  deptKey: string;
  nameAr: string;
  nameEn: string;
  headEmployeeId?: string;
}
export interface Employee extends Named {
  id: string;
  personaId?: string;
  departmentId: string;
  positionAr: string;
  positionEn: string;
  outletId: string;
  gender: "M" | "F";
  nationalNo: string;
  hireDate: ISODate;
  contractType: "permanent" | "fixed_term" | "consultant";
  contractEnd?: ISODate;
  grade: string;
  basic: Money;
  housing: Money;
  transport: Money;
  children: number;
  socialSecurity: boolean;
  idExpiry: ISODate;
  status: "active" | "on_leave";
}
export interface EmploymentContract {
  id: string;
  employeeId: string;
  type: Employee["contractType"];
  start: ISODate;
  end?: ISODate;
  probationEnd: ISODate;
  grade: string;
  basic: Money;
  version: number;
}
export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: "annual" | "sick" | "hajj" | "maternity" | "unpaid" | "emergency";
  from: ISODate;
  to: ISODate;
  days: number;
  status: "pending" | "approved" | "rejected";
  approverPersonaId?: string;
}
export interface AttendanceSummary {
  employeeId: string;
  month: string;
  workingDays: number;
  present: number;
  leave: number;
  absent: number;
  lateCount: number;
  overtimeHours: number;
}
export interface StaffAdvance {
  id: string;
  employeeId: string;
  date: ISODate;
  amount: Money;
  instalments: number;
  monthlyDeduction: Money;
  /** Interest-free (qard) */
  remaining: Money;
  status: "active" | "settled";
  journalId?: string;
}
export interface PayrollRates {
  illustrative: true;
  ssEmployeePct: number;
  ssEmployerPct: number;
  solidarityPct: number;
  stampPct: number;
  taxMonthlyExemption: Money;
  taxBands: { upTo: Money | null; pct: number }[];
  familyAllowancePerChild: Money;
  noteAr: string;
  noteEn: string;
}
export interface PayrollLine {
  runId: string;
  employeeId: string;
  basic: Money;
  housing: Money;
  transport: Money;
  family: Money;
  overtime: Money;
  gross: Money;
  ssEmployee: Money;
  ssEmployer: Money;
  solidarity: Money;
  incomeTax: Money;
  stamp: Money;
  advanceDeduction: Money;
  net: Money;
}
export interface PayrollRun {
  id: string;
  month: string;
  status: "draft" | "approved" | "locked";
  preparedByPersonaId: string;
  approvedByPersonaId?: string;
  lockedAt?: ISODate;
  totals: { gross: Money; ssEmployee: Money; ssEmployer: Money; solidarity: Money; incomeTax: Money; stamp: Money; advances: Money; net: Money; headcount: number };
  /** Payroll always posts to SHF */
  fund: "SHF";
  journalId?: string;
  sharia_status: ShariaStatus;
}

// ---------------------------------------------------------------- KPIs (M28)
export interface KpiMonth {
  month: string; // "2026-01"
  gwp: Record<ProductCode, Money>;
  gwpTotal: Money;
  collected: Record<ProductCode, Money>;
  collectedTotal: Money;
  claimsPaid: Record<ProductCode, Money>;
  claimsPaidTotal: Money;
  /** claims paid / GWP, % */
  lossRatio: Record<ProductCode, number>;
  lossRatioTotal: number;
  /** GWP by outlet id */
  salesByOutlet: Record<string, Money>;
  policiesIssued: Record<ProductCode, number>;
  policiesIssuedTotal: number;
  renewalsDue: number;
  renewed: number;
  renewalRatePct: number;
  claimsRegistered: number;
  avgSettlementDays: number;
  newCustomers: number;
  collectionRatePct: number;
  /** Month-end cash+bank per fund, derived from the GL */
  liquidity: Record<FundCode, Money>;
}

// ---------------------------------------------------------------- inbox (all modules)
export interface InboxItem {
  id: string;
  personaId: string;
  module: string; // "m09"
  kind: "referral" | "approval" | "sla_breach" | "alert" | "review" | "task";
  titleAr: string;
  titleEn: string;
  ref: { kind: string; id: string };
  due: ISODate;
  priority: "high" | "normal" | "low";
  status: "open" | "done";
}
