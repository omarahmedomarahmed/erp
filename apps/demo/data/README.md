# Demo dataset (`data/`)

One invented, deterministic dataset shared by all 14 module screens, so the same people and numbers appear everywhere.
Every name, ID, company and figure is invented. Percentages (Wakala, social security, tax) are **illustrative**.

- `types.ts`: record types. `FundCode` and `ShariaStatus` come from `lib/types.ts`.
- `seed.ts`: the data, maps, selectors and `STORY`. A seeded PRNG runs once at module load, so there is no runtime randomness.

Conventions: "today" is `TODAY = "2026-11-02"`. Dates are ISO strings. Money is LYD stored as a number with 3 decimals; display it with `fmtMoney(n, lang)` → `"1,250.500 د.ل"` / `"LYD 1,250.500"`. Every contract or transaction has `sharia_status`.

## What exists

| Area | Exports |
|---|---|
| Organisation | `outlets` (5 branches, 3 border points, 3 licensing offices), `branches`, `borderPoints`, `licensingOffices` |
| M02 CRM | `customers` (40: 32 individuals incl. 1 PEP and 2 duplicate records, 8 companies; some documents expired), `duplicateCandidates` |
| M05/M06 | `products` (7), `splitRules`, `uwRules`, `approvalMatrix`, `quotes` (20: 3 pending referrals, 2 declined), `policies` (60), `instalments` |
| M07 | `receipts` (81, split into tabarru'/Wakala), 3 overdue instalments |
| M09 | `claims` (22: 3/4/3/3/3/4 across the 6 stages + 2 rejected), `surveyors`, `CLAIM_STAGE_LABELS`, `CLAIM_DOC_LABELS` |
| M10 | `counterparties`, `treaties` (QS 40%, XoL 400k xs 100k, marine facultative), `cessions`, `recoveries`, `riStatements` (Jul–Oct) |
| M04 | `agents` (10, 3 at border points), `commissionTiers`, `agentMonths` (Aug–Oct), `commissionLines` (incl. one clawback) |
| M12 | `accounts` (per fund; PIF exists but has no postings), `journals` (~290), `interFundTransfers`, `periods` (Jan–Sep closed) |
| M11 | `portfolios`, `investmentContracts` (Mudaraba, Murabaha, Ijara, deposits, pending sukuk), `murabahaSchedule`, `investmentReturns` |
| M16 | `ssbMembers`, `ssbResolutions`, `ssbApprovals`, `shariaExceptions` (2 blocked mixing attempts, 1 purification), `complianceCertificates` |
| M15 | `surplusRun` (2025, completed), `surplusAllocations` |
| M33/M34 | `departments`, `employees` (30, including the 12 personas via `personaId`), `employeeContracts`, `leaveRequests`, `attendance`, `staffAdvances`, `payrollRates`, `payrollRuns` (Aug locked, Sep approved, Oct draft), `payrollLines` |
| M28 | `kpis` (Jan–Oct 2026, company-wide; liquidity is derived from the general ledger) |
| Inbox | `inbox` (items per persona; use `inboxOf(personaId)`) |

**Two scales of data.** The individual records (policies, receipts, claims) are a *sample* of the book. The company-wide figures (`kpis`, agent `collectedYtd`/`agentMonths`) cover the whole book, about LYD 68m a year. The general ledger posts the sample records one by one. It posts the rest of the book as monthly `book_summary` journals (company KPI minus the sample), so trial balances and liquidity match the KPIs.

**Ledger rules (README §5).** Every journal balances inside each fund. Journals that touch both PTF and SHF reference an `interFundTransfers` row (`WAKALA_FEE`, `MUDARIB_SHARE`, `QARD_REPAY`, `SETTLEMENT`). Claims, cessions and recoveries post to PTF only. Commission and payroll post to SHF only. Contributions are recognised when collected, which simplifies the accrual-at-issue rule. The general ledger starts on 2026-01-01 with opening balances, so receipts dated 2025 have no `journalId`.

## Hero story (`STORY`)

Mohamed Ali Al-Warfalli (`CUS-1001`, Misrata) had a 2025 comprehensive policy (`POL-0001`).

1. The 2025 surplus run `SR-2025` (ratio 5%) gave him LYD 91.000 (`SA-2025-0001`), applied as a renewal discount.
2. He bought comprehensive motor through agent `AG-01` (مكتب السلام للتأمين) at `BR-MIS`. Quote `Q-2026-00412` was auto-accepted by rule `UW-MTR-01`.
3. Certificate **TK-MTR-2026-000184** (`POL-0018`) was issued: Toyota Corolla 2022 valued at 78,000, contribution 2,730.000, net 2,639.000 after the discount.
4. He paid in 2 instalments. Each receipt splits 30% Wakala → `WAKALA_FEE` transfer and has its own journal. The agent earns 10% commission from SHF (`STORY.commissionLineIds`). The quota-share cession is `STORY.cessionId`.
5. Accident on 2026-09-14. Claim **CLM-2026-00073** went through all 6 stages from 09-14 to 09-28 (4 working days to payment). It was assessed at 18,400 less a 500 deductible, and 17,900 was paid from the PTF. The 40% quota-share recovery `REC-001` (7,160.000) was received on 2026-10-15.

`STORY` also holds the receipt, journal, transfer, surveyor and claim-payment journal IDs.

## How screens should use it

```ts
import { policies, claimById, STORY, fmtMoney, trialBalance, policiesOfCustomer } from "@/data/seed";
```

- Look up records with the maps: `customerById`, `policyById`, `claimById`, `agentById`, `journalById`, `iftById`, `accountById`, `productById`, `treatyById`, `employeeById`, `investmentById`, `quoteById`, `receiptById`, `outletById`.
- Selectors: `policiesOfCustomer`, `policiesOfAgent`, `claimsOfPolicy`, `claimsOfCustomer`, `receiptsOfPolicy`, `instalmentsOfPolicy`, `overdueInstalments`, `expiringPolicies(30)`, `claimsInStage`, `claimsRejected`, `quotesReferred`, `recoveriesOfClaim`, `journalsOf(sourceId)`, `journalsOfFund`, `trialBalance(fund?, upTo?, from?)`, `accountBalance`, `fundResult`, `journalFundTotals`, `isJournalBalancedPerFund`, `payrollLinesOf`, `employeeOfPersona`, `inboxOf`, `workingDaysBetween`.
- Treat the data as read-only. Keep screen edits in the demo store (`lib/db.ts` `record_override`), not in these arrays.
- Highlight the hero by comparing IDs with `STORY.*`.
