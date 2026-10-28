# E — Internal Consistency & Completeness Audit of README.md (TakafulTech build spec)

Auditor scope: internal consistency and completeness only (not domain, legal or tech feasibility, except where two sections of the README contradict each other). All 1160 lines read. Line numbers refer to `/home/user/erp/README.md` at time of audit.

## Summary

- **Module IDs:** all 35 IDs (M00–M34) are defined somewhere, so there is no numbering gap. The definitions are scattered across §6 (12 client modules, out of numeric order), §7 (M33, M34) and §8 (the rest). No single register lists every module with its phase. §8 leaves out the 12 client modules and M33/M34. §19 covers only some modules. Phase data for M14, M22, M28, M30, M32 and M33 differs between §8, §15, §15.2 and §19.
- **Biggest risks for parallel builders:**
  1. **Ownership of the §5.6 core tables is unassigned.** M08 is "Section 5". M12(d) claims "section 5.6 tables". M15(d) re-lists `surplus_run`, `surplus_allocation` and `qard_register`. M03 owns "split rules".
  2. **Contribution recognition basis contradicts itself.** §5.5 books income on receipt. M12 accrues at issue. Builders would double-count.
  3. **`account` table collision.** Better Auth's default `account` table clashes with the ledger `account` table. **`portfolio`** means both the investment portfolio (M11) and the IFRS 17 portfolio (M14). **"Qard"** means both Qard Hasan SHF→PTF (§5) and staff advances (M33).
  4. **The approval engine has three owners.** M01 holds approval limits, M05 has an `approval_matrix` table, and M26 holds the "approval matrix" and maker-checker. M26 is scheduled for days 16–19, after the modules that need it (days 6–16).
  5. **The P1 claims scope contradicts itself.** §15 says "without reserving", but M09's stages 1, 3 and 6 create and release reserves, and stages 4–5 need M10 (P2).
  6. **`sharia_status` is mutable on posted journals.** Manual change by SSB/auditor (L553) conflicts with "no UPDATE grant on posted rows" (L221).
  7. **The fund model has holes.** No inter-fund transfer type moves the family investment part to the PIF. The "charity account" has no fund, although R1 says every posting needs exactly one.
  8. **The default role template breaks the README's own SoD rule.** The Actuary role calculates reserves (M13 maker) and approves the surplus (M15 checker), which L750 forbids. The Board role is needed for surplus approval but is missing from §9.2.
- **Schedule:** the sample/fallback dates conflict: day 10 (§14.1) vs day 14 (§15.2, Q13). The masking CLI has no build slot. M26, M30 internal (outbox) and M29 infrastructure are scheduled after the modules that depend on them. M32 and M14 data capture are P1 per §8 but appear in neither §15 nor §15.2. Phase 2 (45 days, about 15 modules) has no sprint plan. The migration discovery, mapping and parallel run (§14.4) are never scheduled.
- **Exit criteria:** criterion 6 (trial balance reconciles to the client's books) needs a chart-of-accounts mapping (Q15) and opening balances, and neither is in P1. Criterion 7 (100% approved "i" text) needs named human reviewers, and none is assigned in Phase 0. Criterion 1 (signed PDF) needs a signing certificate (Q32).
- **Open questions:** 10 of the 32 block Phase 0 or Phase 1 work, and Q16 blocks day 1. None of the 32 has an owner or due date.
- **Naming:** "Core Islamic Insurance" appears at L1 and L38, and `core-islamic-insurance/` at L129. The git repo/remote is named `erp`, which breaks L39 ("not called an ERP anywhere").

Totals: **6 BLOCKER, 36 HIGH, 32 MEDIUM, 12 LOW** flags (86 in all). 40 decisions are needed.

---

## 1. Module inventory

Phase columns: §8 = platform table (L678–700); §15 = phase table (L937–947); §15.2 = P1 sprint days (L965–977); §19 = traceability (L1070–1105). "—" means not mentioned.

| ID | Name | Defined at | §8 | §15 | §15.2 (days) | §19 | Mismatch? |
|---|---|---|---|---|---|---|---|
| M00 | Tenant & Configuration | §8 L680 | P1 | P1 | 3–5 | — | No |
| M01 | Identity & Access | §8 L681 | P1 | P1 | 3–5 | — | Approval limits here, and also in M05 and M26 (E-12) |
| M02 | CRM | §6.1 L244 | — | P1 | 6–8 | P1 (+registry P2) | Fraud flags/sanctions go to M17 (P2): no P1 consumer |
| M03 | Product Factory | §8 L682 | P1 | P1 | 6–8 | — | Needs SSB approval workflow (M16 P2 tables) in P1 (E-27) |
| M04 | Agents & Brokers | §6.7 L433 | — | P1 register; P2 tiers + dashboard | 6–8 (register) | P2 | Agent dashboard also claimed by M25 "Agent dashboard P2" (L694). §9.2 Agent role has "M04 own dashboard" in P1 |
| M05 | Underwriting | §6.3 L308 | — | P1 | 13–16 | P1 | Needs M26 task inbox, scheduled later (16–19) |
| M06 | Policy Issue/Renewal | §6.2 L276 | — | P1 | 13–16 | P1 (SMS P2) | Auto-renew "on payment" needs M07 (16–19); PDF ownership with M24 (E-14) |
| M07 | Contributions & Billing | §6.6 L402 | — | P1 receipts + billing plans; P2 gateways + recurring | 16–19 | P1–P2 | "Billing plans" (P1) vs "recurring billing" (P2) boundary undefined |
| M08 | Takaful Fund Engine | §8 L683 (+§5) | P1 | P1 | 9–12 | P1 (row "5, M08, M16") | Table ownership vs M12/M15 (E-01) |
| M09 | Claims | §6.4 L337 | — | P1 "without reserving" | 19–23 | P1 | Stages use reserves and M10 (E-06) |
| M10 | Retakaful | §6.5 L373 | — | P2 | — | P2 | §12.4 consumes `CertificateApproved` from P1 certificates (no backfill rule); no checker role |
| M11 | Investments | §6.12 L611 | — | P2 | — | P2 | — |
| M12 | Accounting & Finance | §6.8 L463 | — | P1 core + TB; P2 BS/IS/close/payables | 9–12 | P1–P2 | P1 claim payment needs payment path (payment runs = P2) |
| M13 | Reserving & Actuarial | §8 L684 | P2 | P2 | — | — | No (d) data, no acceptance tests; M09 P1 needs case reserves |
| M14 | IFRS 17 / FAS 43 | §8 L685 | Data capture P1; engine P4 | P4 only | — | "IFRS 17" in P1–P4 row | **Yes.** P1 data capture is not in the §15 P1 list or §15.2; §12.4 has M14 consuming `CertificateApproved` |
| M15 | Surplus | §6.11 L575 | — | P2 | — | P2 | Duplicate tables with §5.6 (E-01) |
| M16 | Sharia Compliance | §6.10 L544 | — | P1 status + no-mixing; P2 SSB reports + certificates | 9–12 ("sharia_status everywhere") | P1–P2 | SSB approval tables (`ssb_approval`) needed by M03/M24 in P1 |
| M17 | Compliance & AML | §8 L686 | P2 | P2 | — | — | M02 P1 fraud alerts have no target |
| M18 | Regulatory Reporting | §8 L687 | P2 | P2 | — | — | No maker role (only ISA read-only) |
| M19 | Solvency & Capital | §8 L688 | P2 basic / P4 full | P2 basic, P4 full | — | — | No |
| M20 | Family Takaful | §8 L689 | P4 | P4 | — | — | PIF exists in P1 fund engine with no P1 producer (OK, but note) |
| M21 | Medical / Health | §8 L690 | P4 | P4 | — | — | No |
| M22 | Motor & Border | §8 L691 | Online P1; Orange Card + offline P2 | Same | 13–16 (online screen) | — (no row) | No §19 row; no acceptance criteria; Agent/border clerk role has no M22 access (L723) |
| M23 | Export Credit | §8 L692 | P4 | P4 | — | — | M10 facultative mentions ICIEC export-credit in P2 |
| M24 | Documents & Correspondence | §8 L693 | P1 | P1 | 13–16 | — | PDF render ownership vs M06 (E-14) |
| M25 | Portals | §8 L694 | Agent dashboard P2; customer portal P4 | Customer portal P4 (agent dashboard listed under M04 P2) | — | — | Agent dashboard owned twice (M04 / M25) |
| M26 | Workflow & Tasks | §8 L695 | P1 config; P4 designer | P1; P4 designer | 16–19 | — | **Scheduled after its dependants** (E-12) |
| M27 | Audit Trail | §8 L696 | P1 | P1 | 3–5 | — | No |
| M28 | Dashboards & MIS | §6.9 L495 | — (client module, not in §8) | P2 | — (but "reconciliation dashboard" 19–23 and M09 SLA dashboard in P1) | P2 | §12.4 consumers in P1 events; no roles in §9.2 |
| M29 | "i" Engine & Learning Center | §8 L697 | P1 | P1 | 22–26 (content only) | "Added" P1–P4 | Infrastructure needed from day 1 (DoD 5–6) but not scheduled |
| M30 | Integration Hub | §8 L698, §11 | P1 internal; P2 external | P2 "M30 external connectors" (P1 internal not listed) | — | P2 (REST APIs) | **Yes.** P1 "internal" (outbox, internal mailbox) has no slot; §11 L818 event delivery P1 |
| M31 | Migration & Sandbox | §8 L699, §14 | P1 | P1 | 10–14 | — | CLI delivery day 10 has no build slot; §14.4 migration not scheduled anywhere |
| M32 | Module Request & Change | §8 L700 | P1 (form + tracker) | **absent** | **absent** | "Added … module requests" P1–P4 | **Yes.** Missing from §15 and §15.2 |
| M33 | Human Resources | §7.1 L639 | — | P1 employee master; P2 HR | 6–8 | P1–P2 | M01 link (hire creates user) not scoped for P1 |
| M34 | Payroll | §7.2 L657 | — | P2 | — | P1–P2 (joint row) | §19 joint row implies payroll in P1 |

Environment-level mismatch: the **staging environment** is created in P1 (§12.1 Neon branch `staging`, days 1–2 tenant factory; §13 weekly DAST "on staging"; §15.2 days 27–29 ZAP). §15 P2 (L941) and §19 L1098 list it as P2, and §19 L1102 says "P1–P2". See E-30.

---

## 2. Flags

Severity: **BLOCKER** = parallel builders will produce incompatible code or the P1 exit cannot be met as written. **HIGH** = likely divergence or rework. **MEDIUM** = ambiguity that needs a ruling. **LOW** = cosmetic or editorial.

### A. Data ownership and schema

| ID | Sev | Lines | Issue | Fix |
|---|---|---|---|---|
| E-01 | BLOCKER | 236, 484, 599, 683, 682 | §5.6 "core tables" have no owner. M08 = "Section 5" (L683), and M12(d) = "section 5.6 tables + …" (L484). M15(d) re-lists `surplus_run`, `surplus_allocation` and `qard_register` (L599). M03 owns "split rules" (L682), but `split_rule` is in §5.6. Three builders (M08, M12, M15) and possibly M03 will each create migrations for the same tables | Add an explicit owner column to §5.6. Recommended ownership is in the table-ownership map (§3 below). Other modules reference the tables but never migrate them |
| E-02 | BLOCKER | 229–232, 472, 413, 861–862, 204 | **Recognition basis contradicts itself.** §5.5 posts "Bank / Contribution income" on receipt. M12 L472 accrues at issue ("contribution receivable / unearned contribution"). §12.4: `CertificateApproved` goes to M12 (receivable) and `PaymentReceived` goes to M08 (split) and M12. If both are built as written, contribution income is credited twice. Also unclear: is the Wakala fee recognised on written or collected contributions (L204 "Contribution allocated")? | Decision D-01. Rewrite §5.5 to match the chosen basis. Specify the exact journal templates per event in one place (posting-rule seed) |
| E-03 | HIGH | 115, 236 | Better Auth (§3.1) creates its own `user`, `session`, **`account`** and `verification` tables by default. The ledger table in §5.6 is also `account`. The two collide | Put auth tables in schema `auth` (or prefix `auth_`). Rename the ledger table to `gl_account` |
| E-04 | HIGH | 629, 685, 294 | `portfolio` means the M11 investment portfolio table. It also means the IFRS 17 "portfolios" (M14) and the certificate's "portfolio" attribute (M06 c). Collision | `inv_portfolio` (M11) vs `ifrs17_portfolio` (M14, ref data seeded in P1) |
| E-05 | HIGH | 184–186, 236, 650 | "Qard" means Qard Hasan SHF→PTF (`qard_register`, §5). M33 L650 calls staff advances "qard" too. A builder may reuse `qard_register` for staff loans | Rename staff advances to `staff_advance` and keep "Qard Hasan" for the inter-fund loan only |
| E-06 | BLOCKER | 345–350, 361, 940 | §15 P1 = "M09 claims 6-stage state machine (**without reserving**)". But stage 1 sets an "initial reserve", stage 3 has "reserve updated" and stage 6 has "final reserve released", and `claim_reserve` is a P1 table. Stage 4 "retakaful share calculated (M10)" and stage 5 "recovery receivable booked" depend on M10 (P2). Exit criterion 4 needs all 6 stages | Define P1 claims as: a case reserve per claim (no IBNR or actuarial reserving, which stays in M13 P2) with reserve postings to the PTF, plus an M10 hook that is a no-op in P1 and records `retakaful_pending=true`. Update L940 wording |
| E-07 | HIGH | 252, 392, 441, 452, 478, 644 | A party is modelled several times. M02 party types include agent, reinsurer and employee link. M04 has its own `agent`, M10 its own `counterparty`, M12 its own `supplier` and M33 its own employee record. Builders will duplicate names, IDs and bank accounts (and encryption) | Rule: every person or organisation is a `party` (M02). Role tables (`agent`, `counterparty`, `supplier`, `employee`) are extensions with an FK to `party_id`. Bank accounts live only in `party_bank_account` |
| E-08 | HIGH | 296, 599, 870, 609 | Renewal credit has two owners. M15 owns `renewal_credit`. §12.4 says `SurplusApproved` is consumed by M06 to create "renewal credits". M15 acceptance 5 needs M06 to apply the credit at renewal, but M06(d) has no link | M15 creates `renewal_credit`. M06 consumes it at renewal (reads and marks it applied). Change the §12.4 text to "M06 (apply renewal credits)" |
| E-09 | HIGH | 172, 448, 452 | Gap-free numbering per series (certificate, claim, receipt, journal) is a platform rule with no owning module or table. M04 owns `number_block` for agents/border points only | Add a `number_series` service and table to M00 (allocation is transactional and gap-free). M04 `number_block` references it |
| E-10 | HIGH | 418, 422, 480, 810 | Bank statement import and reconciliation has three owners: M07 (`bank_statement_line`, "Bank reconciliation"), M12 ("Bank accounts per fund, reconciliation (with M07)") and §11/M30 ("Banks: statement import" P2) | M30 owns file transport and parsing. M07 owns `bank_statement_line` and matching to receipts. M12 owns `bank_account` (per fund) and the GL reconciliation report |
| E-11 | MEDIUM | 361, 392 | `claim_recovery` (M09: third party, salvage, subrogation) and `recovery` (M10: retakaful) are easy to confuse | Rename to `ri_recovery` (M10). Keep `claim_recovery` for non-retakaful recoveries |
| E-12 | BLOCKER | 320, 326, 681, 695, 973 | **The approval engine has three owners.** M01 has "approval limits", M05 has an `approval_matrix` table and `referral`, and M26 has the "approval matrix, maker-checker, SLA timers, task inbox". M09 and M15 also need multi-step approvals (CFO→actuary→SSB→Board). M26 is scheduled for days 16–19, but maker-checker is needed earlier: M02 merge (days 6–8), M03 (6–8), M12 manual journals (9–12) and M05 referrals (13–16) | M26 owns generic `approval_policy`, `approval_request`, `approval_step`, `task` and `sla_timer`. M01 owns per-role monetary limits. M05 `approval_matrix` becomes M26 policy rows scoped to `module=M05`. **Move the core of M26 (maker-checker, task inbox) to days 3–5** |
| E-13 | MEDIUM | 296, 289, 818 | `notification_log` (M06) duplicates M30 delivery logging. The R6 "internal mailbox" (L94) has no table or owner | M30 owns `outbound_message` (internal mailbox in sandbox) and `delivery_log`. M06 references it |
| E-14 | HIGH | 286, 296, 693, 860 | PDF generation has two owners. M06 says "Worker job triggered by `CertificateApproved`" and owns `document_generated`. §12.4 lists M24 (PDF) as the consumer of the same event. M24 has no (d) data | M24 owns templates (`template`, `template_version`), the render/sign worker and `document_generated`. M06 publishes the event only |
| E-15 | MEDIUM | 422, 291, 296 | `refund` (M07) vs `cancellation` (M06): cancellation computes the refund, and M07 pays it. There is no event between them (see E-38) | M06 `cancellation` computes the amount and emits `CertificateCancelled`. M07 creates `refund` (maker-checker) |
| E-16 | MEDIUM | 422, 860, 472 | M07 `invoice`/`instalment` are created on `CertificateApproved`, and M12 books the receivable on the same event. It is unclear whether the receivable is the GL control account for the M07 sub-ledger or a separate one | State: M07 is the sub-ledger, and M12 posts only the control-account journal. Reconciliation is sub-ledger vs control |
| E-17 | MEDIUM | 629, 262, 686 | `screening` (M11 investment Sharia screening) vs M17 screening (sanctions/PEP) vs M02 `kyc_check` | `inv_sharia_screening` (M11). `aml_screening` (M17). `kyc_check` stays in M02 |
| E-18 | MEDIUM | 484, 236 | `fx_rate` table (M12) vs `journal_line.fx_rate` column vs the "rate source" stored on every money line (L171). M07 also needs rates | M12 owns the `fx_rate` reference table (effective-dated, source). Money lines copy the rate value and source |
| E-19 | HIGH | 684–700, 639–671 | **No (d) Data section** for M00, M01, M03, M08 (beyond §5.6), M13, M14, M17–M27, M29–M34. Builders will each invent names, and cross-module FKs will not line up. Named-in-text but unlisted tables: `help_item` (L772), `search_log` (L798), the synonym table (L794), `kpi_snapshot` (L505), `rpt_*` views, the outbox, audit events, calendar/holidays, users/roles/levels/scopes, `module_request`, payroll and HR tables | Add a (d) Data line for every module (see the table-ownership map) before builders start |
| E-20 | MEDIUM | 452, 437–447 | `target`, `valuation`, `cession` and `contract` (M33 contracts vs `investment_contract`) are generic names. `kpi_rule` (M04 commission KPI) is easy to confuse with the KPI catalogue (M28) | Prefix with the module domain: `agent_target`, `inv_valuation`, `employment_contract`, `commission_kpi_rule` |

### B. Fund model and rules (R1–R8, DoD)

| ID | Sev | Lines | Issue | Fix |
|---|---|---|---|---|
| E-21 | HIGH | 196, 200–209, 420 | The investment part of family contributions goes to the PIF (L196, L420), but §5.3 ("the only way money moves between funds") has no PTF→PIF type, and a receipt crediting both PTF and PIF would be a cross-fund journal (L220) | Add an `INVESTMENT_PART` transfer type (or `CONTRIBUTION_SPLIT` covering Wakala and investment). Alternatively, state that the receipt journal is per-fund with a transfer reference |
| E-22 | HIGH | 89, 420, 431, 560 | The "charity account" (late fees, purification) must belong to one of the three funds (R1, L219). L431 says "never to SHF or PTF income", which leaves PIF or a fourth fund. Undefined | Decision D-05: a charity payable (liability) account inside the fund where the income arose, never income. Or add a fourth fund code `CHF`. Pick one |
| E-23 | HIGH | 89, 220, 211, 229–232 | R1 says "every financial posting belongs to exactly one fund". L220 allows a journal to touch more than one fund if it references an inter-fund transfer. §5.5 shows three lines in two funds without saying whether they form one journal or two | Decision D-02: one journal per fund, linked by `inter_fund_transfer_id`. A journal never spans funds. Reword L220 |
| E-24 | HIGH | 91, 165, 552, 553, 221 | `sharia_status` is mandatory on posted journals (L552), and L553 allows "manual change only by Sharia auditor/SSB". Posted rows have no UPDATE grant (L221, R2). Contradiction | Store status changes in an append-only `sharia_status_event`, and expose the current status through a view. The column on the posted row holds the status at posting time only |
| E-25 | HIGH | 91, 165, 552, 670 | "Every contract and transaction": "transaction" is undefined. L552 lists 10 table types. Unclear: `journal_line` (has the column in §5.6) vs `journal`; endorsements, cancellations, refunds, invoices, instalments, receipt allocations, inter-fund transfers, Qard, surplus allocations, claim reserves, recoveries, staff advances, payroll lines. "Default `compliant` only if produced by an SSB-approved rule": P1 split rules are `illustrative` and not SSB-approved, so every P1 transaction would be `pending_review`. No rule says what makes a payroll run compliant | Publish an explicit list of tables carrying `sharia_status` in `packages/db`, with a CI check. Decision D-06 for illustrative rules (recommend `pending_review` + "illustrative" badge) |
| E-26 | HIGH | 198, 955 | §5.2: "Only SSB-approved split rules can be used". Exit 3: "SSB-approved (or labelled illustrative)" | Rule: in sandbox tenants, illustrative rules are allowed and watermarked. In production, SSB-approved only (enforced by a tenant flag) |
| E-27 | HIGH | 285, 324, 682, 553, 565, 940 | M03 ("SSB approval before go-live"), M24 ("SSB-approved wording"), M05 ("products used must be SSB-approved") and M16 status rules all need `ssb_approval`/`ssb_resolution` in P1. P1 M16 scope is only "`sharia_status` + no-mixing". SSB governance is P2 | Move M16 `ssb_member`, `ssb_resolution` and `ssb_approval` (minimal register) into P1 days 6–8, or allow an "approval reference (manual)" field until P2 |
| E-28 | MEDIUM | 95, 169, 320 | R7 lists rate, split, cap, floor, tax band and commission tier. §4 lists rules, products, workflows, templates and tax tables. Neither covers approval matrix limits, posting rules, UW rules (versioned in M05), KPI rules, help texts or FX rates. Endorsements and payroll retro: unclear whether they use the original or the current version | One canonical list in R7 (union of both). Rule: endorsements use the certificate's original version, and payroll retro uses the version effective on the period being corrected |
| E-29 | MEDIUM | 76, 79 | DoD 4 "RLS on every new business table" and DoD 7 "audit for every write": "business table" and "write" are undefined. The audit table itself, the outbox, pg-boss tables, sessions, `search_log`, the hourly `kpi_snapshot` and rule-pack reference data would create noise or recursion | Define a schema split: `app.*` = business (RLS + audit trigger). `ref.*`/`rulepack.*` = read-only reference data (no RLS, versioned). `sys.*` = outbox, jobs, audit (no audit-of-audit) |
| E-30 | MEDIUM | 116, 757 | pg-boss (§3.1) creates and migrates its own schema with the connecting role. §9.4 says "the app's database role owns no tables" | Create the pg-boss schema with the migration role (`migrate: false` at runtime), and grant DML only |
| E-31 | MEDIUM | 77, 767–768 | DoD 5 / §10.1 "every component", including "report and error message". PDFs (certificates, payslips, statements), e-mails and SMS, Metabase dashboards and API-only errors cannot carry an interactive "i" | Scope `infoKey` to in-app interactive UI and in-app reports. Documents and messages get no "i". Error codes still get a help key for the in-app error display |
| E-32 | LOW | 769, 772 | Key format `module.screen.element` vs the example `err.m07.…`. Storage is "one YAML per module", so errors have no home | Allow the `err.<module>.<code>` namespace and store it inside the module YAML under `errors:` |
| E-33 | MEDIUM | 82, 198 | Money is `numeric(20,3)`, but splits "sum to 100.000%". FX rates, Mudarib ratios, tax rates and unit prices (M20) need a different precision | Money `numeric(20,3)`. Rates/percentages as fractions `numeric(12,9)`. FX `numeric(18,8)` |
| E-34 | LOW | 73 | "Reversible" migrations vs append-only audit and hash chains, where a down-migration would destroy evidence | Down-migrations are required for schema only. Data-destroying downs are forbidden in production |

### C. Events (§12.4)

| ID | Sev | Lines | Issue | Fix |
|---|---|---|---|---|
| E-35 | HIGH | 383, 384, 390, 856–871 | Missing events for M10 → M12: cession (`CessionBooked`) and retakaful recovery (`RetakafulRecoveryBooked`). M10 says these post to the PTF | Add both events, consumed by M12 (and M28) |
| E-36 | HIGH | 349–350, 865 | Claim payment loop: M09 sends a payment order to M12, M12 pays, and stage 6 needs "payment confirmed". §12.4 has only `ClaimPaid` published by M09 and consumed by M12. Direction and ownership are unclear, so builders might post claim payments twice | `ClaimPaymentOrdered` (M09 → M12/M07). `ClaimPaymentConfirmed` (M12 → M09). M09 then moves to Paid |
| E-37 | HIGH | 646, 871 | Only `EmployeeTerminated` exists. §7.1 says hire also creates the user in M01 | Add `EmployeeHired` (M33 → M01) |
| E-38 | HIGH | 290–291, 446, 460, 609 | No `CertificateCancelled`, `EndorsementApproved` or `CertificateRenewed`. They are needed for M07 refunds, M04 commission clawback (acceptance 3), M10 cession adjustment, M12 journals and M15 renewal credit application | Add these events with their consumers |
| E-39 | MEDIUM | 287, 413, 862 | M06 auto-renewal "renewed on payment" needs `PaymentReceived`, but M06 is not listed as a consumer | Add M06 as a consumer |
| E-40 | MEDIUM | 870, 208 | `SurplusApproved`: the `SURPLUS_ALLOC` and `QARD_REPAY` transfers are M08 objects, but M08 is not a consumer. `QARD_DRAW` (deficit) has no event | Add M08 as a consumer and add `QardDrawApproved` |
| E-41 | MEDIUM | 359, 260, 858 | M09 → M17 fraud indicators and M02 fraud flags/party updates have no events. M17 consumes `PartyCreated` but not `PartyUpdated`, and the M17 text (L686) never mentions the event | Add `PartyUpdated` and `ClaimRegistered` → M17 |
| E-42 | MEDIUM | 482, 584–585 | M13 technical reserve postings → M12 and → M15 have no event (`ReservesApproved`) | Add it |
| E-43 | MEDIUM | 860, 685 | M14 consumes `CertificateApproved` (cohort), but M14 is P4 and its P1 "data capture" is unscheduled. M14 has no module text describing the event | Make M06 write the cohort/portfolio fields directly in P1. M14 subscribes in P4 |
| E-44 | LOW | 867, 665 | `PayrollRunApproved` → M30 (bank file). M34 also says it produces the bank file (L665) | M34 builds the file. M30 transports it |
| E-45 | LOW | 866, 447 | `CommissionRunApproved` → M12 only. Payment goes via M07 (L447) | Add M07 or define payment through M12 payment runs |

### D. Access model (§9)

| ID | Sev | Lines | Issue | Fix |
|---|---|---|---|---|
| E-46 | HIGH | 731, 750 | The default template gives the **Actuary** both M13 maker (calculate reserves) and M15 checker (approve surplus). §9.3 L750 blocks exactly that combination | Make the M15 actuary step a "certification" by a different actuary, or remove the M15 checker from the Actuary role. Add a CI test that the default template passes SoD |
| E-47 | HIGH | 208, 597, 719–741 | The **Board** approves `SURPLUS_ALLOC` (L208, L597), but there is no Board role. GM, branch manager, sales manager, underwriting manager and claims manager are dashboard users in §6.9, but not all of them have roles. There is no Sharia secretary/maker for M16 meetings or resolutions, and no "i" reviewers (content writer, takaful accountant, Sharia advisor, HR lead; L775) | Add the roles Board member, GM, Branch manager, Sharia secretary and Content reviewer (by `review_type`) |
| E-48 | HIGH | 723–741 | Modules with no maker/checker coverage in the template: M08 (QARD_DRAW needs CFO + SSB, but nobody has M08 access), M10 checker, M13 checker, M14, M17 checker (STR approval), M18 maker, M19 checker, M22 (border clerk role lacks M22 although it is P1), M24 (template maintenance), M26 (workflow config), M27 (audit viewer), M28, M29, M30, M31, M32 | Extend §9.2 with one row per module. Every P1 module needs at least View, Maker, Checker and Module Admin holders |
| E-49 | HIGH | 706, 724–737, 207–208, 597, 737, 662 | "One level per user per module" cannot express multi-step approval chains. M15 is CFO → actuary → SSB → Board. Payroll is maker → checker → CFO final (L737), but §7.2 L662 has no CFO step. SSB "Sharia approvals in M03, M10, M11, M15" are not module levels, and giving SSB M03 Checker would let SSB approve pricing. The README also does not say what happens when a user holds two roles with different levels for one module | Decision D-12: levels for CRUD. Approval steps come from M26 policies keyed by an *approval capability* (e.g., `ssb.sharia_approve`, `board.surplus_approve`). With multiple roles, the user gets the highest level in each module. Fix §7.2 to include the CFO step (or drop it from §9.2) |
| E-50 | MEDIUM | 553, 734, 752 | Manual `sharia_status` change is allowed for the "Sharia auditor/SSB" (L553). The Internal Sharia auditor is "read-only all; M16 findings maker" (L734). SoD blocks "SSB members change financial data", and a status change could count as one | Status change = an M16 action (`sharia_status_event`). It is not a financial data change. Grant it to SSB as checker and to the Sharia auditor as maker |
| E-51 | MEDIUM | 669, 734, 739, 740 | M34: "Payroll data visible only to HR/payroll roles". But "Internal Sharia auditor: read-only **all**", "Internal/external auditor read-only" and the "payroll runs" `sharia_status` review by SSB all need access | Payroll is excluded from "all". Auditors get time-boxed, payroll-masked access unless explicitly granted |
| E-52 | MEDIUM | 504, 542, 757 | Metabase read-only role vs "every business table FORCE RLS". Either the reporting role bypasses branch/fund scoping (L757 says no role bypasses) or it sees nothing. Built-in dashboards "respect RLS", but Metabase scope is undefined | The reporting role reads only `rpt_*` views (security-definer, tenant-wide, PII-masked). Document that Metabase is tenant-wide management data |
| E-53 | LOW | 723, 885 | Agents are users ("own scope"). §13 "MFA for all staff": agents and brokers are external, so it is unclear whether MFA and passkeys apply to them | MFA is required for every user type, including agents |

### E. Numbers and units

| ID | Sev | Lines | Issue | Fix |
|---|---|---|---|---|
| E-54 | MEDIUM | 302, 306, 319, 428, 491, 691, 987 | Performance targets lack definitions: issue <60 s on 1 Mbps (L306, L691), issue p95 <2 s at 200 users (L987), instant UW decision <2 s (L319), PDF within 30 s (L302), receipt + postings within 5 s (L428; is the PDF included? R5 puts PDFs in the worker), statements <10 s (L491; is that a web request or a worker job?), close <30 min on 3 years (L987; only 12 months of sample exist) | Define: the 60 s = end-to-end user task on 1 Mbps; p95 2 s = server API latency; 5 s excludes the PDF; statements <10 s on screen, while PDF/Excel exports run as worker jobs. Specify a synthetic 3-year dataset for the load test |
| E-55 | MEDIUM | 355, 1023, 995, 512–514 | Working days: the SLA runs "Registered to Paid". Unspecified: whether the registration day counts, whether a time-of-day cut-off applies, and whether KPI 13 (settlement time) ends at Paid or Closed. Escalation at "day 3 and 4" is hard-coded, against DoD 8. The warranty SLA "2 working days" uses whose calendar? | Day of registration = day 0. Business-hours cut-off is configurable. KPI 13 ends at Paid. Escalation days are configuration (default 3, 4). The warranty SLA uses the vendor's support calendar, stated in the contract |
| E-56 | MEDIUM | 288, 304 | "Certificates expiring in **exactly** N days" means certificates are missed whenever a daily run fails, yet acceptance says "exactly one alert" | Select `expiry ≤ today+N` and not already alerted, with a unique index on (certificate, alert_type) |
| E-57 | LOW | 174, 888, 1056 | Retention: §4 says all data 10 years (Q24). §13 says audit 10 years. Q24 maps only to M27. Sandbox and masked-sample retention is undefined | Q24 affects M00 (global) + M27. Add a sandbox data-destruction date to the data-sharing agreement |
| E-58 | LOW | 523, 536 | KPI 17 liquidity covers "PTF, SHF" but omits the PIF, while dashboard 8 includes the PIF | Include the PIF |

### F. Schedule (§15.2) and exit criteria (§15.1)

| ID | Sev | Lines | Issue | Fix |
|---|---|---|---|---|
| E-59 | BLOCKER | 905, 971, 1045, 939 | Sample dates conflict. §14.1 fallback: "if not received by **day 10** → synthetic". §15.2: masking CLI handed to the client day 10, sample received **day 14**. Q13: "extract by day 14". The CLI has no build slot before day 10, and it needs the ARIMA export format (Q1), which is only "discovered" in §14.4 | CLI built days 3–8 against the ARIMA export format agreed in Phase 0 (Q1). CLI handed over day 8. Synthetic generator runs in parallel from day 6. Switch to masked data if it arrives by day 14; fallback decision on day 14 |
| E-60 | HIGH | 973, 695 | M26 maker-checker and task inbox come in days 16–19, after M02 merge (6–8), M03 (6–8), M12 manual journals (9–12) and M05 referrals/approval matrix (13–16) | Move the M26 core to days 3–5 (see E-12) |
| E-61 | HIGH | 818, 698, 860 | M30 internal (transactional outbox, idempotent handlers, sandbox internal mailbox) is needed by days 9–16, because every §12.4 event and the 30-day alert use it. It has no slot | Put `packages/events` outbox and the internal mailbox in days 3–5 (owner: platform/M30) |
| E-62 | HIGH | 768, 974–975, 959 | M29 infrastructure is unscheduled: `help_item` seeding, CI key check, Learning Center app and search. Only "content review" (22–26) is planned, yet DoD 5–6 apply to every feature from day 3 | Days 1–2: infoKey type and CI check. Days 6–8: `help_item`, help dialog and search. Days 22–26: content review |
| E-63 | HIGH | 700, 940 | M32 is P1 in §8 but absent from the §15 P1 list and from §15.2. M14 P1 "data capture" (L685) is also absent | Add M32 form + tracker to days 27–29, or move it to P2 in §8. Make M14 data capture an explicit M06 task (E-43) |
| E-64 | HIGH | 287, 291, 972–973 | M06 (13–16) needs M07 for auto-renew on payment and for cancellation refunds. M07 is built 16–19. M06 issue needs M05 quotes, and both share days 13–16 | Order: M05 days 13–14, M06 days 14–16, then M06 renew/cancel completion in 17–19 after M07. Or accept stubs, with e2e tests on day 19 |
| E-65 | HIGH | 925, 903, 974 | §14.3 replay = "issue, receipt, split, claim, **cession, close, surplus**". Cession (M10), close (M12 P2) and surplus (M15 P2) are not in P1. The sample includes treaties, payroll and the last surplus, with no P1 module to load them into | P1 replay = issue, receipt, split, claim. Load treaties, payroll and surplus into M31 staging tables and replay them in P2 |
| E-66 | BLOCKER | 958, 1047, 929 | Exit 6 says the trial balance per fund reconciles to the client's records. That needs (a) a chart-of-accounts mapping (Q15), which §14.4 schedules as pre-go-live "mapping spec approved by finance", (b) opening balances per fund, and (c) per-fund books on the client side (ARIMA is probably not per-fund). None of these is in P1 | Redefine exit 6 as: per-fund movements for the 12-month sample reconcile to the client's GL movements through an interim mapping, with opening TB loaded as opening balances. Pull the CoA mapping (Q15) into days 6–12 |
| E-67 | HIGH | 959, 775, 939 | Exit 7 needs 100% **approved** bilingual "i" text. The reviewers (takaful accountant, Sharia advisor, compliance, HR lead) are not named or contracted in Phase 0. "Learning Center courses live": videos are P3 (L942) | Phase 0 deliverable: named reviewers with an SLA. Exit 7 covers text and lessons; videos excluded |
| E-68 | HIGH | 953, 1064, 118 | Exit 1 needs a signed PDF (PAdES, per-tenant certificate). Q32 (signature certificate provider) is open | P1 uses a sandbox self-signed tenant CA, watermarked SIMULATION. Production certificate is a go-live gate |
| E-69 | HIGH | 941, 942, 929 | Phase 2 (45 days, about 15 modules) has no sprint plan, so §2.1 "build in milestone order" gives builders no order inside P2. The §14.4 migration discovery, mapping spec, opening balances and parallel run are not scheduled. Phase 3 lists only "migration rehearsals", and the parallel run is impossible before day 90 | Add a §15.3 P2 sprint plan with dependency order: M13→M15, M19 basic→M15, M10 before M09 recovery tests, M33→M34. Add a migration track starting P2 day 31 (discovery), mapping sign-off by day 60, trial loads in P3, and the parallel run after day 90 as a go-live gate |
| E-70 | MEDIUM | 941, 1098, 829, 890, 976 | Staging: the Neon branch exists from days 1–2, DAST runs "weekly on staging", and the P1 day 27–29 ZAP scan needs a target. Yet §15/§19 put staging in P2. §12.2 promises "independent" environments, but all four are branches of one Neon project, and the Vercel mapping (only "Production + preview") is undefined | Staging is P1 (it exists from day 2). Define the Vercel environment → Neon branch mapping (custom environments `staging` and `sandbox`). Rule on whether production gets a separate Neon project from non-prod (D-20) |
| E-71 | MEDIUM | 941, 942 | P2 exit "All section-6 acceptance tests pass" leaves out §7 (M34 acceptance) and the §8 modules (M13, M17, M18, M19, M22 offline), which have **no acceptance criteria at all** | Write (e) acceptance for M13, M17, M18, M19, M22, M24, M26, M27, M29, M30, M31, M32, M33. Make the P2 exit "§6, §7 and §8 acceptance" |
| E-72 | MEDIUM | 605, 902–903 | M15 acceptance 1 runs on the "12-month masked sample", but the sample is the *last 12 months* (rolling), not a fiscal year (Q23). The "last distributed year" surplus may fall outside it. Reserves need opening and closing values | Request the sample as the last full fiscal year + the YTD, plus opening technical reserves |
| E-73 | HIGH | 921, 961 | Masking keeps "agents, branches **unchanged**". Agents are natural persons with names, phones and IDs, so exit 9 ("zero real phones or IDs") would fail | Agents (persons) are masked like customers. Only the agent code and branch stay unchanged |
| E-74 | MEDIUM | 918, 925 | Date of birth is shifted ±90 days, which can change the age factor, so a re-rated replay would not reconcile "to the dirham" | Replay uses recorded contributions and never re-rates historic certificates |
| E-75 | MEDIUM | 646, 969, 1057 | M33 employee master in P1 says "hire creates the user in M01" (L646). In P1, users are also created directly in M01. Q25 (HR data) is listed as migration only, but the master is built on day 6 | P1: M01 creates users. The M33 link is activated in P2. Q25 is needed by day 6 for the field list |

### G. Naming

| ID | Sev | Lines | Issue | Fix |
|---|---|---|---|---|
| E-76 | HIGH | 1, 38 | Product name is "Core Islamic Insurance" | Replace with **TakafulTech** (title and §1.1 "Name") |
| E-77 | HIGH | 129 | Repository root is `core-islamic-insurance/` | Use `takafultech/`. Also note package scope (e.g., `@takafultech/*`) to fix import paths for all builders |
| E-78 | MEDIUM | 39, git remote `omarahmedomarahmed/erp`, working dir `/home/user/erp` | L39 forbids "ERP" anywhere, but the repo itself is named `erp`. L1124 keeps "ERP" in the abbreviations | Rename the GitHub repo to `takafultech` (GitHub redirects the old URL). Keep the ERP abbreviation only if L39 still mentions it |
| E-79 | LOW | 138–139 | `packages/domain` folders use domain names (policy, claims, billing…) without module IDs. No folder exists for crm/party, products, reserving, workflow, documents, compliance or reporting | Add a module → folder table (e.g., `m02-party/`) |

### H. Other gaps

| ID | Sev | Lines | Issue | Fix |
|---|---|---|---|---|
| E-80 | MEDIUM | 352, 1048 | §12.3 needs a Libyan legal opinion before production, but no open question covers it. Q16 covers only the masked sandbox | Add Q33: legal opinion on Frankfurt hosting (owner: client legal; gate: go-live) |
| E-81 | MEDIUM | 1042 | Q10 (bancassurance partner) maps to M30, but bancassurance appears nowhere else in the spec. It is an orphan | Either add a bancassurance channel to M04/M30 or drop Q10 |
| E-82 | MEDIUM | 1031–1064 | No open question has an owner, due date or default. Only Q13 has a date embedded in its text | Add Owner, Needed-by (phase/day) and Default-if-unanswered columns (see map §4) |
| E-83 | LOW | 352–353 | Reopened claims (L353): the target stage is undefined. "Rejected" is a 7th terminal state, while the client wants "6 strict stages" | Reopened → stage 2. Rejected is terminal and shown separately in reporting |
| E-84 | LOW | 414 | The fund for customer overpayment credit is undefined | Hold it in the PTF as a liability ("participant credit") |
| E-85 | LOW | 935, 942, 991 | Training timing: §15 intro says workshops happen with the live follow-up, but the table puts 5-day training in Phase 3 | State: 5-day training in P3, refresher workshops during hypercare |
| E-86 | LOW | 1011, 474 | Separate accounts per class (Art. 23) are a "ledger dimension" (`journal_line.class`), but M12 also says "per-fund chart of accounts". Not stated: is the class a segment of `gl_account` or a dimension column? | Make it a dimension column (already in §5.6). Reports group by it |

---

## 3. Table-ownership map (recommended; **bold** = conflict in the README today)

| Table(s) | Owning module (creates migration) | Also referenced / claimed by | README conflict |
|---|---|---|---|
| `fund`, **`split_rule`**, **`inter_fund_transfer`**, `contribution_allocation`, **`qard_register`** | M08 | M03 (split rules edited via M08 API), M12, M15 | §5.6 unowned; M12(d) claims all §5.6; M15(d) lists `qard_register` |
| **`account`** → `gl_account`, `journal`, `journal_line`, `period`, `posting_rule`, `fx_rate`, `bank_account` | M12 | all posting modules | Clash with Better Auth `account` |
| **`surplus_run`**, **`surplus_allocation`**, `surplus_component`, `surplus_statement`, `surplus_voucher`, `renewal_credit` | M15 | M08 (transfers), M06 (applies `renewal_credit`), M07 (vouchers) | §5.6 and M15(d) both list them |
| `party*`, `kyc_check`, `duplicate_candidate`, `party_consent` | M02 | M04, M10, M12, M33 extension tables | Party duplicated by agent/counterparty/supplier/employee |
| `product`, `product_version`, `cover`, `rating_table`, `rating_factor` (not named in README) | M03 | M05, M06 | M03 has no (d) |
| `quote`, `quote_answer`, `uw_rule`, `uw_rule_version`, `uw_decision`, `referral` | M05 | M26 | — |
| **`approval_matrix`** → M26 `approval_policy`, `approval_request`, `approval_step`, `task`, `sla_timer` | M26 | M05, M09, M15, M34, all checkers | M01 / M05 / M26 triple ownership |
| `approval_limit`, `user`, `role`, `user_role`, `user_module_level`, `user_scope`, `access_review` | M01 (auth tables in `auth` schema) | — | Undefined |
| `certificate`, `certificate_version`, `certificate_cover`, `endorsement`, `cancellation`, `renewal` (+ IFRS 17 fields: cohort, `ifrs17_portfolio_id`) | M06 | M07, M10, M12, M14 | — |
| `document_generated`, `template`, `template_version` | **M24** | M06, M07, M15, M34 | M06(d) lists `document_generated` |
| `notification_log` → `outbound_message`, `delivery_log`, `connector`, `connector_config`, `outbox_event`, `dead_letter` | **M30** | M06, M09, M07 | M06(d) lists `notification_log` |
| `invoice`, `instalment`, `receipt`, `receipt_allocation`, `payment_transaction`, `gateway_event`, `refund`, `cashup`, **`bank_statement_line`** | M07 | M12, M30 | Bank reconciliation in M07/M12/M30 |
| `agent` (ext. of party), `agent_licence`, `agent_product`, `agent_target`, `commission_scheme`, `commission_tier`, `commission_kpi_rule`, `commission_run`, `commission_line` | M04 | M25 (dashboard UI only) | Dashboard owned by M04 and M25 |
| **`number_block`** + `number_series` | M00 (`number_series`), M04 (`number_block`) | M06, M09, M07, M12, M22 | Numbering unowned |
| `claim`, `claim_state_history`, `claim_document`, `claim_assessment`, `claim_reserve`, `claim_payment`, `claim_recovery` | M09 | M10, M12, M13 | `claim_reserve` vs "without reserving" |
| `treaty`, `treaty_layer`, `treaty_share`, `counterparty` (ext. of party), `cession`, `fac_offer`, **`recovery`** → `ri_recovery`, `bordereau`, `ri_statement` | M10 | M09, M12 | name clash with `claim_recovery` |
| `supplier` (ext. of party), `expense_invoice`, `payment_run`, `fixed_asset`, `budget` | M12 | — | — |
| **`portfolio`** → `inv_portfolio`, `investment_contract`, `murabaha_schedule`, `mudaraba_terms`, `ijara_terms`, `investment_cashflow`, `investment_income`, `inv_valuation`, **`screening`** → `inv_sharia_screening` | M11 | M08, M16 | Clashes with M14 portfolio and M17 screening |
| `ssb_member`, `ssb_meeting`, `ssb_resolution`, `ssb_approval`, `sharia_exception`, `sharia_status_event` (new), `sharia_audit_plan`, `sharia_finding`, `purification`, `zakat_calc`, `compliance_certificate` | M16 (approval register in P1) | M03, M10, M11, M15, M24 | Needed in P1, scheduled P2 |
| `reserve_run`, `reserve_line`, `reserve_floor` (unnamed) | M13 | M15, M12 | No (d) |
| `ifrs17_portfolio`, `ifrs17_group`, `cohort` (unnamed) | M14 (ref data P1) | M06 | No (d) |
| `aml_screening`, `aml_alert`, `str_report`, `complaint` (unnamed) | M17 | M02, M09 | No (d) |
| `return_layout`, `return_run` (unnamed) | M18 | — | No (d) |
| `solvency_run` (unnamed) | M19 | M15 | No (d) |
| `audit_event` (hash-chained), `audit_chain_check` | M27 | all | No (d) |
| `kpi_snapshot`, `rpt_*` views | M28 | — | Named in text, not in a (d) |
| `help_item`, `lesson`, `course`, `quiz`, `lesson_progress`, `glossary_term`, `synonym`, `search_log` | M29 | all | Named in text, not in a (d) |
| `tenant_config`, `module_switch`, `calendar`, `holiday`, `rulepack_version` | M00 | all | No (d) |
| `import_batch`, `staging_*`, `mask_run`, `reconciliation_result` | M31 | — | No (d) |
| `module_request` | M32 | — | No (d) |
| `org_unit`, `position`, `cost_centre`, `employee` (ext. of party), `employment_contract`, `attendance`, `leave_*`, **`staff_advance`**, `appraisal`, `end_of_service_calc` | M33 | M34, M01 | "qard" naming clash; no (d) |
| `pay_component`, `payroll_run`, `payroll_line`, `payslip`, `bank_file`, `statutory_return` | M34 | M12, M30 | No (d) |

---

## 4. Open-question blocking map

"Needed by" = the earliest day work stalls without an answer (or without an agreed illustrative default). No question in §18 has an owner or due date (E-82). The proposed owner is the client unless noted.

| Q# | Topic | Needed by | Blocks | Default if unanswered | Severity |
|---|---|---|---|---|---|
| Q16 | Frankfurt hosting OK for masked sandbox | **Phase 0 / day 1** (tenant factory) | All (infra) | None safe; must answer | BLOCKER |
| Q1 | ARIMA modules, version, Oracle ownership | **Phase 0** (masking CLI input format) | M31, exit 6 | CSV/Excel export template designed by us | BLOCKER |
| Q13 | Data agreement + extract | Phase 0 sign / day 14 sample | M31, M15 acceptance, exit 6 | Synthetic data (conflicts with day 10, E-59) | BLOCKER |
| Q11 | SSB members and approval process | P1 day 6 (M03 product/split approval) | M03, M16, M24, exit 3/5 | Illustrative + `pending_review` | HIGH |
| Q15 | Chart of accounts + audited statements | P1 day 9 (M12) | M12, exit 6 | Standard takaful CoA template; but exit 6 fails | HIGH |
| Q23 | Fiscal year end; Hijri needs | P1 day 3 (M00 calendar, M12 periods) | M00, M12, M15 | Gregorian calendar year | HIGH |
| Q22 | Exchange-rate source | P1 day 9 (rate_source on money lines) | M07, M12 | CBL official rate | MEDIUM |
| Q2 / Q14 | Wakala %, Mudaraba split; who signs | P1 day 6 (illustrative); go-live (signed) | M03, M08, M11 | 30% illustrative (as §5.5) | MEDIUM (P1) / BLOCKER (go-live) |
| Q19 | Certificate numbering + QR rules | P1 day 13 | M06, M22, M00 numbering | Per-branch yearly series | HIGH |
| Q32 | E-signature certificate + stamp | P1 day 13 (exit 1) | M06, M24 | Sandbox self-signed CA (E-68) | HIGH |
| Q29 | Approval Matrix limits | P1 day 3–5 (M01 limits), 13 (M05), 19 (M09) | M01, M05, M09, M26 | Illustrative limits table | MEDIUM |
| Q21 | Staff per department, roles | P1 day 3–5 | M01 template, UAT day 22 | §9.2 template | MEDIUM |
| Q5 | Branches, agents, border points, internet | P1 day 6 (M04 register), day 13 (M22) | M04, M22, M00 | From sample | MEDIUM |
| Q6 | Annual volumes per line | P1 day 6 (number blocks); P3 load tests | M04, M22, load tests | Derive from sample | LOW |
| Q24 | Retention period | P1 day 3 (M27) | M27, M00 | 10 years | LOW |
| Q25 | Current HR/payroll tool + data | P1 day 6 (employee master fields) | M33 (P1), M34 | Generic employee schema | MEDIUM |
| Q12 | Payment channels | P1 day 16 (cash/transfer), P2 gateways | M07, M30 | Cash + bank transfer | MEDIUM |
| Q9 | Aug 2025 regulator statement | Phase 0 (risk) | Compliance / project risk | n/a | MEDIUM |
| Q18 | ISA: IFRS 17 or AAOIFI? | P1 day 9 (statement presentation, M14 data fields) | M12, M14 | FAS 42 presentation + IFRS 17 fields captured | MEDIUM |
| Q7 | Three 2026 products | P2 (M03 beyond motor/travel) | M03 | — | LOW |
| Q8 | Reinsurers, Libya Re cession | P2 day 31 | M10 | Illustrative quota share | MEDIUM |
| Q3 / Q4 | Last surplus; Qard history | P2 (M15), and the day-14 sample request | M15 | — | HIGH for M15 acceptance |
| Q28 | Commission tiers, KPIs | P2 day 31 | M04 | Illustrative tiers | LOW |
| Q30 | Investments held | P2 | M11 | — | LOW |
| Q27 | Social security + tax rates | P2 (M34 build); go-live (confirmed) | M34 | Rule-pack values flagged to verify | MEDIUM |
| Q17 | Art. 24 forms; Decision 60/2021 | P2 | M18, M16 audit | Configurable layouts | MEDIUM |
| Q20 | Orange Card bureau | P2 | M22 | — | MEDIUM |
| Q26 | SMS provider | P2 | M30 | — | LOW |
| Q31 | Registry + traffic access | P2 | M30, M02, M22 | Manual verification flag | LOW |
| Q10 | Bancassurance partner | none (orphan, E-81) | — | — | LOW |
| (missing) Q33 | Legal opinion, hosting (Law 6/2022) | Go-live gate | Production | — | HIGH (E-80) |
| (missing) Q34 | Named "i" reviewers (Sharia, takaful accountant, compliance, HR) | Phase 0 / day 22 | Exit 7 | — | HIGH (E-67) |
| (missing) Q35 | Board approval process for surplus | P2 | M15 | — | MEDIUM |

---

## 5. Decisions needed (with recommended defaults)

| # | Decision | Recommended default |
|---|---|---|
| D-01 | Contribution recognition: accrual at issue (M12) or on receipt (§5.5)? Wakala on written or collected? | Issue: PTF Dr receivable / Cr unearned contribution (gross). Receipt: Dr bank / Cr receivable. `ContributionAllocated` on receipt triggers the Wakala and investment-part transfers on the **collected** amount (consistent with M04 "collected only"). Rewrite §5.5. **Confirm with the takaful accountant** |
| D-02 | Multi-fund journal shape | One journal per fund. The legs are linked by `inter_fund_transfer_id`. No journal spans funds |
| D-03 | Owner of §5.6 tables | As in the ownership map (M08 / M12 / M15) |
| D-04 | Investment part to PIF | Add the `INVESTMENT_PART` transfer type (PTF→PIF, automatic by approved rule) |
| D-05 | Charity account fund | Liability account "charity payable" in the fund where the income arose. Never income |
| D-06 | `sharia_status` for illustrative rules, payroll and derived lines | Illustrative → `pending_review`. Payroll → `compliant` if all components are flagged approved in M34 config, else `pending_review`. Journal lines inherit from the source document |
| D-07 | Mutable `sharia_status` on posted rows | Append-only `sharia_status_event` + current-status view |
| D-08 | Approval engine | M26 generic engine, built days 3–5. M01 holds limits. Module-specific matrices are policy rows |
| D-09 | PDF ownership | M24 renders and signs. Modules publish events |
| D-10 | Party model | Single `party`. Agent, counterparty, supplier and employee are extensions |
| D-11 | Table naming collisions | `gl_account`, `auth.*`, `inv_portfolio`/`ifrs17_portfolio`, `staff_advance`, `ri_recovery`, `inv_sharia_screening`, `aml_screening` |
| D-12 | Access levels vs approval chains, multiple roles | Highest level per module. Approval steps through capabilities (`ssb.approve`, `board.approve`, `cfo.final`) |
| D-13 | Actuary SoD conflict | Actuary does not approve M15. The M15 chain is CFO → independent actuary certification (a different user) → SSB → Board |
| D-14 | Missing roles | Add Board member, GM, Branch manager, Sharia secretary, Content reviewer, Integration admin, Migration operator, Regulatory reporting officer |
| D-15 | P1 claims reserves and retakaful | Case reserves only in P1. The M10 hook records `retakaful_pending`. P2 backfills recoveries |
| D-16 | P1 claim payment path | M12 P1 includes a single-payment disbursement (maker-checker) from a PTF bank account. Payment runs come in P2 |
| D-17 | Sample timeline | CLI handed over day 8; synthetic in parallel from day 6; masked sample cut-off day 14 |
| D-18 | Exit 6 wording | Reconcile 12-month per-fund **movements** using an interim CoA mapping, with opening TB loaded |
| D-19 | Exit 7 scope | Approved text for every P1 key + lessons. Videos excluded (P3). Reviewers named in Phase 0 |
| D-20 | Environments | Staging in P1. Production in its own Neon project; dev, staging and sandbox in a non-prod project per client (satisfies "independent"). Vercel custom environments `staging` and `sandbox` |
| D-21 | `infoKey` scope | In-app interactive UI only. Documents, messages, API and Metabase excluded |
| D-22 | "Business table" and "write" for RLS/audit | Schema split `app` / `ref` / `sys` (E-29) |
| D-23 | Numeric precision | Money `numeric(20,3)`. Rates `numeric(12,9)` fractions. FX `numeric(18,8)` |
| D-24 | Performance target definitions | See E-54 |
| D-25 | Working-day counting | Day 0 = registration day. Configurable escalation (default 3, 4). KPI ends at Paid |
| D-26 | Expiry scan | `≤ N days` + idempotency key |
| D-27 | Version used by endorsement / retro payroll | Endorsement: the certificate's original version. Retro: the version effective in the corrected period |
| D-28 | Sandbox signing | Self-signed tenant CA, watermarked |
| D-29 | Split rules in sandbox vs production | Illustrative allowed only where `tenant.mode = sandbox` |
| D-30 | Agent masking | Mask agents as persons. Keep codes |
| D-31 | Replay | Replay uses recorded amounts. No re-rating |
| D-32 | M32 / M14 P1 scope | M32 → days 27–29 (or P2). M14 P1 = fields on the certificate, written by M06 |
| D-33 | Hire → user link | Activate in P2. In P1, M01 creates users |
| D-34 | Numbering | M00 `number_series`, gap-free via row lock. M04 blocks reference series |
| D-35 | Metabase scope | `rpt_*` views only, tenant-wide, PII-masked |
| D-36 | Auditor access to payroll | Excluded unless a time-boxed grant is approved by the CFO + HR manager |
| D-37 | Reopened / Rejected claim states | Reopened → stage 2. Rejected is terminal |
| D-38 | Repo and package naming | Repo `takafultech`, root `takafultech/`, npm scope `@takafultech/*`. Product name "TakafulTech" everywhere |
| D-39 | P2 order | Write a §15.3 sprint plan. Dependency order: M13 → M19 basic → M15; M10 before the M09 recovery tests; M33 → M34; M30 external before M07 gateways |
| D-40 | pg-boss schema ownership | Created by the migration role. Runtime `migrate:false` |
