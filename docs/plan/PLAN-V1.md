# TakafulTech — Build Execution Plan V1 (audited)

| Item | Value |
|---|---|
| Product | **TakafulTech**, a core takaful (Islamic insurance) platform. Formerly "Core Islamic Insurance", and before that an ERP with custom modules |
| First client | Takaful Insurance Company (شركة التكافل للتأمين), Tripoli, Libya |
| Source spec | `README.md`, all 1,160 lines read in full by every validator |
| Status | **Plan V1: validated, not yet built.** No application code exists. Building starts only after the Decision Pack (§5) is approved |
| Prepared by | Auditor/planner session: plan owner, verifier of build-session briefs, review findings, fixes, test runs and gates |
| Date | 2026-10-28 |
| Evidence | `docs/plan/validation/A…E` (validator reports), `docs/plan/AGENT-PROTOCOL.md` (builder / reviewer / auditor protocol, gate catalogue), `docs/plan/findings-ledger.md` |

> **Input gap.** The original Arabic brief ("العرض الفني — تطوير نظام التكافل التأميني الشامل") was **not available** in this session. Validators used the translated client quotes in README §6 "(a)". Before Phase 1 starts, someone must diff the Arabic original against README §6(a) and §19 (action **A-0** in §14).

---

## 1. Verdict

| Question | Answer |
|---|---|
| Is the README buildable as written? | **Not yet.** It is a strong spec: every Libyan Law 3/2005 figure checked out against the statute text, the stack is current and maintained, and the module scope is complete. But it contains **11 blockers and about 70 HIGH flags** that parallel builder agents would resolve in incompatible ways. The worst are accrual vs cash recognition, surplus double-counting, RLS breaking system postings, table ownership, and parallel-build conventions. |
| What unblocks the build? | Approval of the **Decision Pack D00** (§5: 24 decisions, each with a recommended default) and the **README errata** (§6). Foundation waves W1–W6 can start before D00. Money waves (W7 onward) cannot. |
| Can multiple AI builder agents build it? | **Yes**, under the operating model in §7: ≤4 concurrent builders, frozen contracts per wave, file and table ownership, independent review agent, auditor sign-off. |
| AI engineering time | P1–P3: **about 26 waves, about 255 h nominal, about 465 h with contingency and reactive waves**. That is about 4–5 weeks of calendar time at 15 operating hours a day. P4: about 12 more waves (about 190 h). |
| Total agent effort | About 550 builder agent-hours for P1–P3 (about 800 including review and fix passes); about 280 for P4 |
| Is software-complete by day 75 realistic? | **Yes.** All 12 client modules plus HR and payroll can be built and pass the automated §6 acceptance tests on masked or synthetic data well before day 75 (15 Jan 2027). |
| Is go-live on day 90 (30 Jan 2027) realistic? | **No.** Human, client and regulatory gates cannot be compressed by AI: the ARIMA migration chain, SSB approvals, the legal hosting opinion, the pen test, UAT, i-text review and the parallel run. |
| Realistic go-live (kickoff Mon 2 Nov 2026) | **P10: Sun 7 Mar 2027** (better Sun 14 Mar, after Eid al-Fitr). **P50: Sun 11 Apr 2027.** **P90: Jun–Sep 2027** (negative hosting opinion forcing in-country hosting, or ARIMA extraction blocked). A new-business-only go-live with ARIMA run-off: P50 21 Feb 2027, which falls in Ramadan, so mid-March is recommended. |
| Recommended contract restatement | "Software complete and UAT-ready by day 75; go-live gated; target April 2027." |

These estimates are **modelled, not measured.** Re-baseline them after waves W1–W3, using actual wave wall-clock times, as Plan V2.

---

## 2. How this plan was validated

| Wave | Agent | Scope | Output | Flags |
|---|---|---|---|---|
| 1 | A: Finance & Sharia | §5, M08, M12, M13, M14, M15, M16, M11, M19 (Law 3/2005 checked against the Arabic statute) | `validation/A-finance-sharia.md` | 3 BLOCKER, 9 HIGH, 12 MED, 2 LOW, plus 41 proposed tests |
| 1 | B: Insurance operations | M02–M07, M09, M10, M22, M28, P4 modules, event map | `validation/B-insurance-ops.md` | 0 BLOCKER, 13 HIGH, 24 MED, 7 LOW |
| 1 | C: Platform & tech | §2–4, §9–14, M00, M01, M24, M26, M27, M29–M32 (package versions checked Oct 2026; local PG16 feasibility tests) | `validation/C-platform-tech.md` | 2 BLOCKER, 11 HIGH, 15 MED, 8 LOW |
| 1 | D: Libya regulatory, HR, AML | §1.1, §7, §17, M17, M18, M19, data residency, rule packs | `validation/D-regulatory-hr.md` | 1 BLOCKER, about 10 HIGH, plus a verification table of about 50 rows |
| 2 | E: Internal consistency | Module inventory, table ownership, events, access model, phases, open questions | `validation/E-consistency.md` | 6 BLOCKER, 36 HIGH, 32 MED, 12 LOW, plus 40 decisions |
| 2 | F: Timeline planner | Work-package DAG, waves, calendar, human gates | Merged into §8–§11 of this plan, with auditor adjustments | — |
| 2 | G: Protocol designer | Builder / reviewer briefs, auditor checklist, gate catalogue, findings ledger | `AGENT-PROTOCOL.md` | 16 ADRs proposed |
| 3 | R1, R2: Red team | Adversarial review of this plan, plus traceability coverage | Applied to this V1. See §15 | — |

**How the auditor resolved conflicts between validators:**

1. **Inter-fund journal shape.** A-04 says one journal per transfer; E's D-02 says one journal per fund. **Ruling:** one journal per transfer, balanced inside each fund, with a pairing check. This matches README §5.4 L218–220.
2. **Wakala recognition timing.** A-01 says accrue at issue; E's D-01 says on collection. **Ruling:** the gross receivable sits **in the PTF** at issue in both options. Whether Wakala is recognised on written or collected contributions is a **versioned rule-pack parameter**. Default: collected, which matches M08 trigger L204 and M04's commission-on-collected rule. The takaful accountant confirms (D00-01).
3. **F's schedule** was built without the C and E reports. The auditor added WP F21 (system context, C-01), made the audit chain asynchronous (C-03), split the tenant factory (C-07), separated Neon projects per environment (C-12), and moved WP-101 to W7 to give D00 time.

---

## 3. Module-by-module validation verdict

Key: **GO** = build as written. **GO*** = build after the listed D00 decision or errata. **HOLD** = scope or legal decision needed first. Flag IDs refer to the validation reports.

| Module | Name | README phase | Verdict | Key flags (must be resolved in the WP brief) | Size |
|---|---|---|---|---|---|
| M00 | Tenant & Configuration | P1 | GO* | Hijri variant per tenant; Libyan holidays come from local announcements, not Umm al-Qura (C-27, D-07); numbering series owner (E D-34) | M |
| M01 | Identity & Access | P1 | GO* | Better Auth policy layer is custom work (C-16); `account` table name clash (E); missing roles: Board, GM, branch manager and others (E D-14); levels vs approval chains (E D-12) | L |
| M02 | CRM | P1 | GO* | Fuzzy duplicates must not block the 60-s issue (B-31); single `party` model with extensions (E D-10); Law 6/2022 citation corrected to Arts. 73–79, transfer abroad Art. 78 (C-14, D-01) | L |
| M03 | Product Factory | P1 | GO* | No data tables in README (E); Art. 1 class mapping (A-17); pass-through charges outside the 100% split (A-16); Decisions 400/460/2026 motor limits (D-03) | XL |
| M04 | Agents & Brokers | P1 register / P2 commission | GO* | Decision 88/2026 regulated commission overrides tiers (D-04); tier basis and recompute (B-25); net remittance would mix funds (B-26); dashboard owned by M04, not M25 (E) | L |
| M05 | Underwriting | P1 | GO* | Rule DSL undefined; use decision tables + JSONLogic (B-28); approval-matrix ownership is M26 (E-12); simulation can't use migrated quotes (B-29) | L |
| M06 | Policy issue / renew | P1 | GO* | Expiry scan `≤N days` + idempotency key (B-05); PAdES provider (C-05, Q32); IFRS 17 capture fields (A-12); Wakala reversal on cancellation (B-06) | L |
| M07 | Contributions & Billing | P1 / P2 | **HOLD → GO*** | **Stripe does not serve Libya, PayPal reportedly not (B-01, D-08).** Client must sign a deviation; local rails (Moamalat, LYPAY, Sadad, bank transfer) become primary. Pay-by-link page needed before P4 portal (B-03) | L |
| M08 | Takaful Fund Engine | P1 | **GO* (D00 critical)** | A-01, A-04, A-05, A-06, A-07; RLS vs system postings (C-01); `INVESTMENT_PART` PTF→PIF type (E D-04); charity account fund (E D-05) | L |
| M09 | Claims | P1 | GO* | Case reserves in P1 (A-13, E-06); full transition table incl. 4→3 and Reopened (B-18, B-19); recoverable booked once, by M10 (B-07); DB enforcement by trigger, not CHECK (B-21) | L |
| M10 | Retakaful | P2 | GO* | Recovery on every claim for QS/surplus treaties (B-08); recovery order; XoL limit missing in AT-2 (B-09); reinstatements (B-10); Decision 374/2026 is a ministerial decision (D) | XL |
| M11 | Investments | P2 | GO* | Cite FAS 28/32/33/30, not "IFRS 9" (A-11); Mudaraba loss rules (A-20); `INVESTMENT_WAKALA_FEE` (A-21); Art. 16 assets in Libyan banks (A-22, D-22) | L |
| M12 | Accounting | P1 / P2 | **GO* (D00 critical)** | Accrual vs §5.5 cash example (A-01, E-02); book of record P1–P3 = local/regulatory basis (A-09); inter-fund elimination (A-23); FX basis (A-07) | XL |
| M13 | Reserving | P2 | GO* (lite) | Ship **M13-lite** in P2: pro-rata UCR, Art. 15 floor incl. engineering exception, actuary-entered IBNR (A-25, A-17). Full engine P4 | M / XL |
| M14 | IFRS 17 / FAS 43 | data P1, engine P4 | GO* | P1 capture field list (A-12) must ship in M06/M09/M10 | XL (P4) |
| M15 | Surplus | P2 | **GO* (D00 critical)** | Formula double-counts Wakala and provisions (A-02, A-03); actuary SoD deadlock (A-10); sample year ≠ last distributed year (A-14); distribution details (A-15) | L |
| M16 | Sharia | P1 / P2 | GO* | `sharia_status` with no DEFAULT plus append-only status events (A-08); "Sharia auditor per branch" (Decision 60/2021) UNVERIFIED (D) | L |
| M17 | AML/CFT | P2 | GO* | Add Law 2/2005; goAML XML STR; UN Libya sanctions list (D-15) | M |
| M18 | Libya Regulatory Reporting | P2 | GO* | Levy is an SHF expense; Art. 4 bars passing it on (D-10 vs A-16, resolved in D00-09); forms to be obtained (Q17) | M |
| M19 | Solvency | P2 basic / P4 | GO* | Life/family component (A-18, D-12); PTF/SHF combination; Qard admissibility question to ISA | S / M |
| M20 | Family Takaful | P4 | **HOLD** | Client sells family takaful today; it stays on ARIMA until P4 (B-14). Client must accept phased cutover | XL |
| M21 | Medical / Health | P4 | **HOLD** | Same as M20 (B-14) | XL |
| M22 | Motor & Border | P1 online / P2 Orange Card + offline | GO* online; **HOLD offline** | Offline PWA is very large, never asked for by the client, and conflicts with numbering and KYC: **defer to P4** (B-17). Orange Card is an inter-Arab card issued electronically since 2022, so our own numbering may be invalid (B-16). Add M22 rows to §19 and border-clerk access (E) | M / L / XL |
| M23 | Export Credit | P4 | **HOLD** | ICIEC deal already live (B-14) | L |
| M24 | Documents | P1 | GO* | PAdES library is basic; choose pyHanko or a KMS signer; Libyan-licensed CA question (C-05); owns `document_generated` (E) | L |
| M25 | Portals | P2 agent / P4 customer | GO* | Agent dashboard belongs to M04 (E) | L |
| M26 | Workflow & Tasks | P1 | GO* | Single approval engine owner, built early: WP F15 in W7 (E-12) | L |
| M27 | Audit Trail | P1 | GO* | Synchronous global hash chain serialises all writes; chain asynchronously, WORM anchor (C-03) | M–L |
| M28 | Dashboards | P2 | GO* | KPI dictionary needed (B-39); Power BI Service conflicts with D12 (B-40); reporting role PII and scope (C-28) | L |
| M29 | "i" Engine & Learning Center | P1 | GO* | **3,000–5,000 P1 keys, about 200–500 reviewer-hours** (C-08); `unaccent` useless for Arabic, custom `ar_norm()` (C-26); synonyms as a table | L code / XL content |
| M30 | Integration Hub | P1 internal / P2 external | GO* | Sandbox egress block cannot be done on Vercel functions; send only from the worker (C-19) | M / XL |
| M31 | Migration & Sandbox | P1 | GO* | Masking CLI as a single binary with CSV / Oracle Thin input (C-20); agents must be masked too (E D-30); sample dates conflict, day 10 vs day 14 (E-59) | XL |
| M32 | Module Request | P1 | GO | Missing from the §15 sprint plan; slotted in WP-123 | S |
| M33 | HR | P1 master / P2 | GO* | End of service by nationality (D-06); `staff_advance`, not "qard" (E) | L |
| M34 | Payroll | P2 | GO* | **Social security total is 20.5% (5.125% employee / 14.35% employer / 1.025% treasury), not 3.75/11.25**; plus 1% solidarity, 0.5% stamp, exemptions (D-05). Rates still confirmed by the client's payroll accountant (Q27) | L |

---

## 4. Consolidated blockers and top HIGH flags (deduplicated)

| # | Flag(s) | Issue | Resolution | Owner | Needed by |
|---|---|---|---|---|---|
| B1 | A-01, E-02 | Income recognised twice (accrual at issue + §5.5 cash); fund of the receivable undefined | D00-01; rewrite §5.5 as a 3-event example | Takaful accountant + PO | Before W7 |
| B2 | A-02, A-03 | Surplus formula double-deducts Wakala and provisions | D00-02; golden-number test | Takaful accountant + SSB adviser | Before W18 (M15) |
| B3 | C-01 | Fund-scoped RLS blocks the system's own cross-fund postings, balance trigger, numbering and audit | D00-05: SECURITY DEFINER "system context" functions, WP F21 | Tech lead | Before W4 |
| B4 | C-02, E-01 | No multi-agent conventions; core tables owned by 3 modules | §7 operating model + table-ownership map (E §3) frozen in WP F01/F03 | Orchestrator + auditor | W1 |
| B5 | E-06, A-13 | P1 claims "without reserving" yet stages create reserves | D00-13: case reserves in P1 (M09), M13-lite in P2 | PO | Before W11 |
| B6 | E-12 | Approval engine owned by M01, M05 and M26, and built after its consumers | D00-14: M26 owns the engine (WP F15, W7); M01 owns limits | PO | Before W7 |
| B7 | E-59 | Sample timeline conflicts (day 10 vs day 14); masking CLI unscheduled | CLI = WP-119 in W2, shipped by day 8; synthetic data in parallel; sample cut-off day 14 | Orchestrator + client IT | W2 |
| B8 | E-66 | Exit criterion 6 (TB reconciles to client books) impossible without CoA mapping and opening balances | Errata: reconcile 12-month **movements** per fund with interim CoA mapping and opening TB loaded (E D-18); request opening balances in §14.1 (A-14) | PO + client finance | P1 exit |
| B9 | D-02 | Hosting legal opinion too narrow, no deadline | Widen scope (Law 6/2022 Art. 78, Cybercrime Law 5/2022, 2024 circular, 2026 digital-sovereignty authority); due P2 day 60; written client acceptance of Frankfurt for the masked sandbox by day 10 | Client counsel | Day 10 / day 60 |
| B10 | B-01, D-08 | Stripe and PayPal unavailable for Libyan merchants | Client signs a deviation; local rails primary; adapters kept behind flags | PO + client | P0 |
| B11 | C-12 | Staging and sandbox as branches of production would copy real data | Separate Neon (and Vercel) projects: prod / non-prod (staging, sandbox, dev) | Tech lead | W6 (F16a) |
| H1 | C-03 | Synchronous audit chain is a global lock | Async chainer worker + daily WORM anchor | Tech lead | W4 |
| H2 | C-10, C-24 | Neon HTTP driver has no transactions; pooler leaks session `SET` | `withRequestContext` on node-postgres / WebSocket pool; worker on the direct endpoint | Tech lead | W3 |
| H3 | C-09 | No reversible plain-SQL migration tool | dbmate (or node-pg-migrate); Drizzle schema pulled + drift check; pg-boss and Better Auth DDL in our migrations | Tech lead | W2 |
| H4 | C-05, Q32 | PAdES "signature validates" depends on an unchosen CA, possibly Libyan-licensed | Phase 0 gate; sandbox uses a self-signed tenant CA with watermark | Client + counsel | P0 / go-live |
| H5 | C-08 | i-text review workload is about 200–500 reviewer-hours | Shared keys; 2 dedicated Arabic reviewers from week 3; gate = 100% text, 100% risk-tagged keys approved | Client + us | W3 onward |
| H6 | D-03, D-04 | 2026 motor decisions 400/460/88 missing from the Libya rule pack | Add to §17; motor product (WP-106) and commission caps (WP-204) | Client legal | Day 6 |
| H7 | D-05 | Payroll statutory model wrong or incomplete | Corrected pipeline in WP-221; marked `to_verify` until Q27 | Payroll accountant | P2 |
| H8 | B-33, B-34, B-35 | About 20 events missing; renewal and claim close cannot complete; no idempotency or ordering contract | Event catalogue v1 in D00-11 | Orchestrator | W4 |
| H9 | B-07, B-08, B-09 | Retakaful recovery double-booked, wrong trigger, AT-2 missing its limit | D00-12; restate M10 AT-2 with layer limit | PO + reinsurance officer | W15 |
| H10 | A-08 | `sharia_status` default contradicts NOT NULL test; SSB changes conflict with R2 | D00-07 | SSB adviser | W3 (F17) |
| H11 | A-10, E | Actuary is both maker and surplus checker (SoD deadlock); no Board role | D00-08 | PO | W7 |
| H12 | B-14, B-17 | Family, health and export credit not migrated until P4; offline PWA large | D00-17 (phased cutover, offline deferred to P4) | Client | P0 |
| H13 | D-16 | **New UAE takaful regulation (14 Sep 2026)**: wakala-only, fund with legal personality; the UAE rule pack can't simply be a config | Phase 5 re-scoping; fund-model variants must be designed for later, not hard-coded | PO | P5 |
| H14 | C-11, C-13 | Weak IP allow-list via shared Vercel static IPs; RPO 15 min holds in-region only | Budget Neon Scale + Vercel PrivateLink; state RPO as in-region or add cross-region logical replica | PO (cost) | Before production |

The full lists are in the validation reports: A 26, B 44, C 36, D 24, E 86 flags. All are tracked in `docs/plan/findings-ledger.md`.

---

## 5. Decision Pack D00 (approve before money waves; recommended defaults)

D00 becomes ADR-001…ADR-024 in `docs/adr/`. Builders **must stop and raise a question** on any ambiguity not covered by an ADR. They must never invent a resolution.

| ID | Decision | Recommended default | Approver | Blocks |
|---|---|---|---|---|
| D00-01 | Contribution recognition, and fund of the receivable | At issue: **PTF** Dr contribution receivable / Cr unearned contribution (gross). At receipt: Dr bank / Cr receivable. Wakala and investment-part transfers are triggered by a **versioned rule-pack parameter** `wakala_basis ∈ {written, collected}` (default `collected`). Cancellation reverses via `WAKALA_FEE_REVERSAL`. §5.5 rewritten as issue → receipt → month-end earning → cancellation | Takaful accountant + PO | W7 (101) |
| D00-02 | Surplus formula | Step 1 = **gross** contributions earned in the PTF. Step 4 keeps Wakala. Step 3 = **change in** IBNR, fluctuation reserve, premium deficiency and Art. 15 top-up only. All figures net of retakaful. Basis per participant = tabarru' earned and collected (SSB confirms). Largest-remainder rounding at 0.001 LYD; residue stays in PTF. Unrenewed renewal credit converts to a voucher after N days | Takaful accountant + SSB | W18 |
| D00-03 | Inter-fund transfer shape | One journal per transfer, balanced per fund. `inter_fund_transfer_id NOT NULL` when more than 1 fund. Deferred check: due-to = due-from = transfer amount. New types: `SETTLEMENT`, `WAKALA_FEE_REVERSAL`, `INVESTMENT_PART` (PTF→PIF), `INVESTMENT_WAKALA_FEE`. `SURPLUS_ALLOC` becomes a single-fund PTF journal. `QARD_DRAW` allowed any time with CFO + SSB approval | Takaful accountant | W7 |
| D00-04 | Balancing and immutability mechanics | Deferred constraint trigger on the **journal header** at `status → posted` (not per line). Composite FK `(account_id, fund_id)`. Immutability by RLS policy + BEFORE trigger (GRANT can't do rows). Balance on `amount_lyd` with a per-fund FX rounding account | Tech lead | W7 |
| D00-05 | System context vs RLS | Posting, numbering, audit append and outbox enqueue go only through `SECURITY DEFINER` functions owned by a non-login role, with a fixed `search_path` and tests. User RLS governs reads and direct writes. The balance trigger runs as definer | Tech lead + auditor | W4 (F21) |
| D00-06 | Charity and purification | "Charity payable" liability in the fund where the income arose; never income | SSB adviser | W7 |
| D00-07 | `sharia_status` | NOT NULL + CHECK enum, **no DEFAULT**. Derived on insert from approved product, rule or counterparty, else `pending_review`. Illustrative rules give `pending_review`. Changes go to append-only `sharia_status_event` plus a current-status view. Registry table + CI meta-test. Blocking matrix for `non_compliant` | SSB adviser | W3 (F17) |
| D00-08 | Actuary SoD and approval roles | Reserving actuary (maker) ≠ approving actuary (checker); external actuary allowed. Add roles: Board member, GM, branch manager, Sharia secretary, content reviewer, integration admin, migration operator, regulatory reporting officer. Approval chains use capabilities (`ssb.approve`, `board.approve`, `cfo.final`) | PO | W7 |
| D00-09 | Pass-through charges and levy | Contribution = net (split 100%) + pass-through charges (stamp, bureau fee, policy fee), each mapped to a fund. The Art. 4 supervision levy defaults to an **SHF expense** (Art. 4 bars passing it on to policyholders; D-10) | CFO + counsel | W8 (105) |
| D00-10 | Book of record P1–P3 | Local/regulatory basis (UCR pro rata with Art. 15 floor, case OCR, actuary IBNR) with FAS 42-style fund presentation. FAS 43 measurement is a parallel ledger from P4 (Q18) | CFO | W8 (103) |
| D00-11 | Event catalogue v1 | §12.4 plus the missing events from B-33/E. Includes `CertificateCancelled`, `EndorsementIssued`, `CertificateRenewed`, `CertificateLapsed`, `RefundApproved`, `CessionBooked`, `RecoveryBooked`, `ReserveChanged`, `ClaimPaymentConfirmed`, `EmployeeHired`. Outbox/inbox with `aggregate_seq`, idempotency key, versioned Zod payloads | Orchestrator + auditor | W4 (F07) |
| D00-12 | Retakaful recovery | M10 alone books recoverables on `ClaimApproved`. Order: fac → QS/surplus (every claim) → per-risk XoL → per-event XoL → stop loss. Reinstatement contributions. Restate AT-M10-2 with an explicit layer limit | Reinsurance officer | W15 |
| D00-13 | P1 claims scope | Case reserves and their PTF postings in P1 (M09). Retakaful share is a stub recorded as `retakaful_pending` and backfilled in P2. P1 single-payment disbursement from the PTF bank with maker-checker | PO | W11 |
| D00-14 | Approval engine owner | M26 generic engine (WP F15). M01 holds limits. Module matrices are policy rows | PO | W7 |
| D00-15 | Party model and table naming | One `party` table; agent, counterparty, supplier, employee and SSB member are extensions. Renames: `gl_account`, `auth.*` schema, `inv_portfolio` / `ifrs17_portfolio`, `staff_advance`, `ri_recovery`, `inv_sharia_screening`, `aml_screening`. Ownership per E §3 | Orchestrator + auditor | W3 |
| D00-16 | Numbering | "Gap-free" = every number accounted for (issued, voided, spoiled, returned) with a `number_void` register. Locked counter row taken last in the transaction. Blocks drawn from the series. M00 owns `number_series`, M04 owns `number_block` | PO + ISA rules (Q19) | W3 (F17) |
| D00-17 | Scope deviations | Stripe/PayPal adapters behind flags (unavailable in Libya). Family, health and export credit stay on ARIMA until P4. **Offline PWA deferred to P4.** Orange Card online-only against a simulator until the bureau spec arrives. Regulated commission caps (Decision 88/2026) override tiers | Client (signed) | P0 |
| D00-18 | Underwriting rule DSL | Decision tables + JSONLogic over a typed questionnaire schema. Rule versions pinned on each quote | PO | W9 (109) |
| D00-19 | Claim state machine | Full transition table incl. sub-status for missing documents, 4→3 send-back, Rejected terminal, Reopened → stage 2 with approval. Enforced by trigger + definer function. SLA day 0 = registration day. Escalation days configurable (default 3, 4) | Claims manager | W11 |
| D00-20 | Infrastructure | Worker on **AWS ECS Fargate eu-central-1**; AWS Secrets Manager + KMS; S3 with Object Lock. **PostgreSQL 17** at runtime, SQL kept PG16-compatible (R4 floor). dbmate migrations. Separate prod and non-prod Neon/Vercel projects | Tech lead | W2 / W6 |
| D00-21 | Precision and formats | Money `numeric(20,3)`; FX `numeric(18,8)`; rates and percentages `numeric(12,9)` as fractions. Banker's rounding policy. Per-tenant number-format policy (C-34) | Tech lead | W2 (F05) |
| D00-22 | `infoKey` scope | In-app interactive UI only (not PDFs, messages, API, Metabase). Shared keys allowed (`common.*`, `field.*`) | PO | W4 (F10) |
| D00-23 | Performance target definitions | Issue < 60 s end-to-end on 1 Mbps (user journey). Server p95 < 2 s per request. PDF < 30 s async after approval. Receipt + postings < 5 s, PDF excluded. Warm compute on production (no Neon autosuspend) | PO | P3 |
| D00-24 | Naming | Product "TakafulTech" everywhere. Repo root `takafultech/`; npm scope `@takafultech/*`. GitHub repo `erp` to be renamed `takafultech` (README L39 forbids "ERP") | PO | W1 |

---

## 6. README errata (apply before W1; tracked as WP-00-DOC)

1. Rename "Core Islamic Insurance" → **TakafulTech** (L1, L38, L129); repo root `takafultech/`.
2. §5.5: replace with the D00-01 multi-event example. §5.3: add the D00-03 transfer types.
3. §6.11 surplus steps 1, 3 and 4 per D00-02. Add distribution details (A-15).
4. §6.8 M12: "FAS 43 recognition" → "FAS 42-style presentation; FAS 43 measurement P4" (A-09).
5. §6.12: cite AAOIFI FAS 28/32/33/30; add `INVESTMENT_WAKALA_FEE`, Mudaraba loss rules, Art. 16 Libyan-bank deposit (A-20…A-22).
6. §6.5 AT-2: add "layer limit ≥ LYD 150,000" (B-09). §6.4: P1 case reserves (D00-13); full transitions (D00-19).
7. §6.6: payment rails = Moamalat / LYPAY / Sadad / bank transfer / cash; Stripe and PayPal behind flags pending availability (B-01).
8. §6.1(c), §12.3, §17: "Law No. 6 of 2022 on Electronic Transactions, Ch. 7 Arts. 73–79 (transfer abroad Art. 78)"; add Cybercrime Law 5/2022 (C-14, D-01).
9. §17 Libya rule pack: Art. 15 engineering exception + net-of-retakaful basis; Art. 17 life component (3‰ capital at risk + 4% mathematical reserves); levy borne by SHF; Decisions 400/2026, 460, 88/2026; Decision 374/2026 is ministerial; AML Law 2/2005 + goAML; social security 20.5% split; 1% solidarity; 0.5% stamp; tax exemptions (A-17, A-18, D-03…D-15).
10. §7.2: payroll statutory pipeline order (D-05).
11. §8: add M33/M34 and the 12 client modules to one master module table with phases (E); add data tables for the §8 modules (E §3).
12. §9.2/9.3: add roles (D00-08); fix the actuary conflict.
13. §12.1/12.2: separate prod / non-prod projects; staging in P1 (C-12, E).
14. §12.4: event catalogue v1 (D00-11).
15. §13: ASVS **5.0**; malware scanner = ClamAV in the worker; RPO/RTO scope (C-13, C-18, C-21); D12 reworded to "no SaaS beyond contracted hosting processors" (C-23).
16. §14.1: request opening balances (reserves, Qard, retakaful, investments) and a window aligned to the last distributed surplus year (A-14); mask agents as persons (E D-30); CLI input = CSV/XLSX or Oracle Thin (C-20).
17. §15: replace with §10 of this plan. Add a P2 sprint plan (E D-39).
18. §15.1: exit 6 rewording (E D-18); exit 7 scope (E D-19).
19. §18: add owners and due dates; add Q33 legal opinion, Q34 named i-text reviewers, Q35 Board approval process, Q36 Arabic-brief diff (E §4).
20. §3.1: PostgreSQL 17 runtime / 16 floor; dbmate; node-postgres or Neon WebSocket pool; pyHanko or KMS signer; AWS ECS (C-06, C-09, C-10, C-15).

---

## 7. Build operating model (multi-agent)

Full templates, checklists and the gate catalogue are in **`docs/plan/AGENT-PROTOCOL.md`**. This section is the binding summary.

### 7.1 Roles

| Role | Who | Responsibilities |
|---|---|---|
| **Build Orchestrator** | The build session (Claude Code) | Owns `main` merges, lockfile, `.github/`, contract freezes and migration-range allocation. Writes builder briefs from the template. Launches ≤4 builders per wave. Spawns a **fresh** review agent after each wave and briefs it. Routes findings to fix passes. Runs `gate:wave`. Merges in dependency order. |
| **Builder agents** (≤4 at a time) | Subagents spawned by the orchestrator, each in its own git worktree | Build exactly one WP in owned paths only. Follow §2.1 order: migration → domain + tests → API → UI → i-text → lesson → e2e. Run the WP verify command. Return a report with full gate logs. Never edit another WP's files, tests or frozen contracts. |
| **Review agent** | A fresh subagent spawned and briefed by the orchestrator after builders finish (concurrency still ≤4) | Independent: never sees builder transcripts and reads builder reports only after forming its own findings. Re-runs **all gates itself** on a clean checkout. Applies the 39-item platform checklist and adversarial tests (cross-fund journal, skipped claim stage, approving own item, out-of-scope RLS read, duplicate webhook, posting to a closed period…). Returns findings ranked BLOCKER/HIGH/MEDIUM/LOW with file:line and repro. |
| **Auditor / planner** | This session, or a dedicated auditor session that the build session messages | Approves each wave's briefs **before launch**. Checks reviewer independence and that gate evidence is real command output, not claims. Verifies fixes and re-runs the money, RLS and migration gates plus one random gate. Signs off waves and phase gates. Owns this plan, the ADRs and the findings ledger statuses (only the auditor can defer or close a finding). |
| **Humans** | PO, takaful accountant, SSB adviser, client staff, counsel | Approve D00, errata and contract changes. Supply data and credentials. UAT. Legal and Sharia approvals. |

### 7.2 Wave lifecycle (every arrow needs an artefact in `docs/plan/waves/Wnn/`)

```
PLANNED → briefs written (orchestrator) → BRIEFS APPROVED (auditor: brief-approval.md)
→ BUILDING (≤4 builders, worktrees) → builder reports + gate logs
→ REVIEW (fresh review agent; re-runs gates) → review-round-1.md
→ FIX (builders or fix agents) → fix reports + gate logs
→ RE-REVIEW (review agent verifies each finding) → review-round-2.md
→ AUDIT (auditor verifies findings, fixes, gate evidence) → audit-signoff.md
→ MERGE (orchestrator, dependency order, gate:wave on merged main) → WAVE CLOSED
```

**Merge policy:** 0 open BLOCKER or HIGH. MEDIUMs are logged in the ledger with an owning future wave. A BLOCKER or HIGH found twice in one WP triggers an integration-review agent and auditor escalation.

**Evidence rule:** a gate result counts only as a log file containing the commit SHA, the exact command, the exit code and full output. Prose such as "all tests pass" is rejected.

**Synchronous audit** (auditor reviews before merge, not sampled): W3, W4 (foundations: RLS, audit, events), W7–W11 (money), W15–W19 (retakaful, ledger close, surplus, payroll). Other waves: the auditor samples at least 20% of findings plus all gate logs.

### 7.3 Parallel-safety conventions (frozen in W1–W4)

| Hot spot | Convention |
|---|---|
| Migrations | `packages/db/migrations/<wave*100+slot*25+n>_<module>_<slug>.{up,down}.sql`. The runner rejects numbers outside the WP's range. CI checks up → down → up gives an identical schema dump and upgrades from the previous wave's snapshot |
| Drizzle schema | One file per module, pulled from SQL with a drift check; barrels generated by `pnpm gen` |
| Canonical entities | Table-ownership map (E §3 + D00-15) frozen; lint flags near-duplicate table names |
| Events / contracts | `packages/events/catalog/<mXX>.ts`, `packages/contracts/<mXX>.ts`. Changed only in the contract freeze at wave start |
| Registries (permissions, menus, help, posting rules, rule-pack topics) | One file per module, aggregated by generator. No shared hand-edited files |
| Design system | Frozen after W5. New primitives via change request |
| Dependencies / CI | Only the orchestrator edits `pnpm-lock.yaml`, `.github/` and root config |
| Tests | Acceptance and golden tests are written **before** the build by a test-author pass and locked by CODEOWNERS. Reviewer diffs every test change. Mutation score ≥80% on funds, ledger, surplus and payroll |
| Databases | Local Docker Postgres per builder worktree. One Neon branch `int/wNN` per wave integration run, reset from `ci-base`. Destructive Neon operations need human approval |
| Stubs | Registered with an owning future WP; `stub:check` gate; registry must be empty at the phase gate |
| Context | Brief ≤15k tokens: README sections by line range, relevant ADRs, conventions, contracts. WP ≤6 builder-hours. Handoff note in `docs/wp/<id>.md` |

---

## 8. Work-package catalogue (summary)

Sizes are builder agent-hours. Each WP carries the README acceptance tests (AT) and validator tests (V) it closes. Full WP-to-AT mapping is in the briefs; the template is in AGENT-PROTOCOL §3.

### 8.1 Pre-build (P0, humans + orchestrator)

| WP | Name | Output |
|---|---|---|
| WP-00-DOC | README errata (§6) + ADR-001…024 drafts (D00) | PR to README + `docs/adr/` (AI about 6 h; human approval about 5 working days) |
| WP-00-TEST | Test-author pass: golden fund lifecycle, surplus golden scenario, retakaful layer cases, payroll control sheet template, P1 exit e2e skeletons | `tests/golden/`, locked by CODEOWNERS |
| A-0 | Diff of the Arabic brief vs README §6(a) and §19 | `docs/plan/arabic-brief-diff.md` (human or AI with the document) |

### 8.2 Foundation (F, about 105 h)

| WP | Name | Deps | h |
|---|---|---|---|
| F01 | Monorepo scaffold (pnpm + turbo, strict TS, packages per §3.2 renamed `@takafultech/*`, Docker Compose PG17, CLAUDE.md with DoD and R1–R8, conventions doc) | — | 3 |
| F02 | CI + gate scripts (`gate:wave`, Neon `int/wNN` automation, e2e sharding) | F01 | 3 |
| F03 | DB conventions: dbmate runner with range enforcement, roles (owner, app, definer, auth, reporting, worker), schema lints, migration 0001 (extensions, `ar_norm()`, money domains, `sharia_status` enum) | F01 | 4 |
| F04 | `withRequestContext` RLS helper (node-postgres / WS pool), RLS role-matrix harness | F03 | 4 |
| F05 | Money / time kernel: decimal.js `Money`, allocator, FX line, Temporal, Hijri, working-calendar function, property tests | F01 | 4 |
| F06 | Audit (M27 core): generic trigger capture, **async chainer**, daily verifier, WORM anchor to S3 Object Lock | F03, F04, F07 | 4 |
| F07 | Events + worker runtime: outbox/inbox, catalogue v1 (D00-11), pg-boss on direct endpoint, `interactive` / `batch` queues, DLQ, replay | F03, F05 | 6 |
| F08 | Design system A: Radix + Tailwind logical props, required `infoKey`, InfoIcon, Help mode, R8 lint rule | F01, F05 | 6 |
| F09 | Design system B: DataGrid, MoneyInput, dual DatePicker, forms, shell, SIMULATION watermark | F08 | 6 |
| F10 | i18n + help pipeline: next-intl (ar default), help YAML schema, key extractor, `content:check` (draft / release), seeding, auto-draft | F08 | 4 |
| F11 | Auth (M01 part 1): Better Auth 1.7.x, password + TOTP + passkeys, auth schema, policy layer (mandatory MFA, role→factor, per-role idle timeout) | F04, F09, F10 | 6 |
| F12 | Access (M01 part 2): levels 0–5, scopes, limits, SoD engine, capabilities, `defineRoute` guard | F11 | 5 |
| F13 | M00 tenant config, module switchboard, rule-pack loader (R7), Libya pack skeleton, holiday calendar | F03, F05 | 5 |
| F14 | Module generator + test harness (fixtures, role users, Playwright AR/EN helper) | F06, F07, F09, F10, F12 | 4 |
| F15 | M26 core: maker-checker, approval policies, state-machine helper, task inbox, SLA timers | F12, F13, F07 | 6 |
| F16a | Tenant factory part 1: Terraform for prod / non-prod Neon + Vercel projects, S3 + KMS, Secrets Manager, ECS dev worker (needs human cloud accounts H27) | F01, F07 | 5 |
| F16b | Tenant factory part 2: staging and sandbox stacks, sandbox egress allow-list, per-tenant migration matrix, `terraform plan` in CI | F16a | 5 |
| F17 | Numbering (D00-16) + `sharia_status` registry, meta-test, `sharia_status_event` (D00-07) | F03 | 4 |
| F18 | M24 documents: template registry, Chromium pool + Arabic fonts, PAdES signer (pyHanko or KMS), QR, S3, ClamAV upload scan | F07, F09 | 6 |
| F19 | Field encryption (KMS envelope + blind index) + Arabic search (normaliser, trgm, synonym table, English FTS) | F03 | 5 |
| F20 | M30 core: connector framework, code-level sandbox kill switch, internal mailbox, `notification_log` idempotency | F07, F13 | 4 |
| F21 | **System context** (D00-05): definer functions for posting entry, number allocation, audit append and outbox enqueue, plus tests proving user RLS can't be bypassed except through them | F04, F17 | 5 |

### 8.3 Phase 1 domain (about 157 h)

101 M08 schema · 102 M08 split engine · 103 M12 core ledger · 104 M12 UI and TB · 105 M03 product model · 106 M03 UI + motor/travel seeds · 107 M02 domain · 108 M02 UI · 109 M05 rules engine · 110 M05 approvals/UI · 111 M06 domain + IFRS 17 capture · 112 M06 PDF, QR, expiry scan · 113 M06/M22 UI (60-s flow) · 114 M07 billing domain · 115 M07 UI · 116 M09 claims domain · 117 M09 UI + SLA · 118 M04 register + M33 master · 119 M31 masking CLI (ships by day 8) · 120 M31 loader + reconciliation · 121 M31 sample mapping + replay · 122 M29 Learning Center + search UI · 123 M16 P1 + M27 UI + M32 · 124/125 content packs · 126 P1 exit e2e suite + RLS/SoD matrix · 127 security sweep · S1–S4 stabilisation. Each is 4–6 h. WP-by-WP deps and ATs are as in the validator F model; see the AT mapping in §12.

### 8.4 Phase 2 (about 187 h, offline PWA deferred)

201–203 M10 (treaties, recovery engine, fac/bordereaux) · 204–205 M04 commission + dashboard · 206–207 M07 gateways (local-rail simulators, pay-by-link) + recurring/dunning/bank recon · 208–209 M12 statements + close · 210 M13-lite · 211 M19 basic + KPI dictionary · 212–213 M11 · 214–215 M15 engine + statements/vouchers/credits · 216 M16 governance + certificates · 217–219 M28 data + 12 dashboards · 220 M33 HR · 221–222 M34 payroll engine + UI · 223 M17 AML · 224 M18 returns · 225 M30 public API · 226 M30 external adapters (simulators) · 227 M22 Orange Card (online, simulator) · 228 staging pipeline · 229–230 content · 231 §6 acceptance e2e · S5–S8 (incl. M15 golden run).

### 8.5 Phase 3 engineering

301 3-year synthetic data + k6 · 302/303 performance tuning · 304 DAST full · 305 DR automation + measured RPO/RTO · 306/307 **ARIMA migration ETL: start as soon as the schema arrives (H18), not in P3** · 308 manuals + scripted video capture · R1–R10 reactive waves (UAT defects, pen-test fixes, real integrations, trial-load fixes).

### 8.6 Phase 4 (about 31 WPs)

M14 chain (7 deep: data → PAA → reinsurance held → onerous/RA → GMM/VFA → FAS 43 view → transition) · M13 full (triangles, IBNR, PDR) · M19 full · M20 family (4) · M21 health (4) · M23 export credit (2) · M25 customer portal (2) · M26 visual designer (2) · M22 offline PWA (2) · content + e2e · stabilisation.

---

## 9. Wave schedule (≤4 builders per wave; brief → build → review → fix → re-review → audit → merge)

Typical wave wall-clock: brief + audit approval 0.75 h · build 5–6 h · review 1.25 h · fix 1.5 h · re-review/audit 0.75 h · merge + gate 0.75 h = **about 10–11.5 h**.

| Wave | WPs (parallel builders) | Gate / note | h | Cum. h |
|---|---|---|---|---|
| W1 | F01 | Run alone; conventions frozen | 5 | 5 |
| W2 | F02, F03, F05, 119 | Masking CLI to the client by day 8 | 10 | 15 |
| W3 | F04, F08, F13, F17 | First migrations; synchronous audit | 10 | 25 |
| W4 | F06, F07, F10, F21 | Event catalogue v1 frozen; system context; synchronous audit | 10.5 | 35.5 |
| W5 | F09, F11, F18, F19 | Design system frozen after this wave | 10.5 | 46 |
| W6 | F12, F20, F16a, 122 | Cloud accounts needed (H27) | 10.5 | 56.5 |
| W7 | F14, F15, 101, 107 | **D00 must be approved**; money waves begin; synchronous audit | 11 | 67.5 |
| W8 | 102, 103, 105, 108 | Posting-rule ownership registry | 11 | 78.5 |
| W9 | 104, 106, 109, 118 | | 11 | 89.5 |
| W10 | 110, 111, 123, F16b | Certificate contract frozen | 11 | 100.5 |
| W11 | 112, 113, 114, 116 | Heaviest event wave; synchronous audit | 11.5 | 112 |
| W12 | 115, 117, 120, 124 | | 10 | 122 |
| W13 | 121 (sample or synthetic), 125, 127, S1 | 121 waits for H4 | 10.5 | 132.5 |
| W14 | 126, S2, S3, S4 | **P1 engineering gate** | 8 | **140.5** |
| W15 | 201, 204, 206, 208 | P2 contract freeze | 11 | 151.5 |
| W16 | 202, 207, 209, 210 | | 11 | 162.5 |
| W17 | 203, 205, 211, 212 | | 11 | 173.5 |
| W18 | 213, 214, 216, 220 | M15 is the hardest money WP; synchronous audit | 11.5 | 185 |
| W19 | 215, 217, 221, 223 | | 11 | 196 |
| W20 | 218, 219, 222, 224 | | 10.5 | 206.5 |
| W21 | 225, 226, 227, 228 | | 10 | 216.5 |
| W22 | 229, 230, 231, S5 | | 10.5 | 227 |
| W23 | S6, S7, S8 (M15 golden run on sample) | **P2 engineering gate** | 8 | **235** |
| W24 | 301, 304, 305, 308 | | 10 | 245 |
| W25 | 302, 303, 306, 307 | 306/307 can be pulled earlier once the ARIMA schema arrives | 11 | **256** |
| R1–R10 | Reactive (UAT ×3, pen-test ×1, real integrations ×4, trial loads ×2) | | about 8 each | about 336 |
| P4 W26–W37 | 401–428 + stabilisation | | about 10.5 each | about 125 |

**Pacing rule.** Engineering can run ahead of the client's capacity to test. Release to staging in **weekly trains** (client Scrum clause) and do not let the backlog of unverified work exceed about 2 weeks of client testing.

---

## 10. Timeline

### 10.1 AI engineering time

| Phase | Waves | Nominal | With ×1.5 contingency | Builder agent-h | Incl. review + fix |
|---|---|---|---|---|---|
| P1 (incl. foundation) | 14 | 140 h | 210 h | about 260 | about 375 |
| P2 | 9 | 95 h | 142 h | about 187 | about 270 |
| P3 planned | 2 | 21 h | 32 h | about 41 | about 60 |
| P3 reactive | about 10 | about 80 h | about 80 h | about 70 | about 100 |
| **P1–P3** | **about 35** | **about 336 h** | **about 465 h** | **about 560** | **about 805** |
| P4 | 12 | 125 h | 190 h | about 195 | about 280 |

| Operating mode | P1+P2 code-complete (kickoff 2 Nov 2026) |
|---|---|
| 24 h/day autonomous orchestrator | about 18–20 Nov 2026 |
| **15 h/day (base case)** | **P1 about 16–17 Nov; P2 about 26 Nov – 1 Dec 2026** |
| 8 h/day, 5-day weeks | about mid-Jan 2027 (still before day 75) |

**AI engineering is not the critical path.** The human gates are.

### 10.2 Human and client gates AI cannot compress (P50 / P90 from kickoff Mon 2 Nov 2026)

| # | Item | Owner | P50 | P90 | Blocks |
|---|---|---|---|---|---|
| H1 | D00 decision pack + errata approved | PO + takaful accountant + SSB adviser | Sun 8 Nov | Mon 16 Nov | W7 onward |
| H2 | Data-sharing agreement | Client legal | Thu 19 Nov | Thu 3 Dec | H4 |
| H3 | Q16 Frankfurt OK for the masked sandbox (written) | Client + counsel | Mon 16 Nov | Mon 30 Nov | Sandbox load |
| H4 | Masked 12-month sample + opening balances received and leak-checked | Client IT | **Sun 6 Dec** | Thu 31 Dec (else synthetic) | WP-121, P1 exit |
| H5 | Sample reconciled per fund to the dirham | Client finance + us | Sun 20 Dec | Thu 21 Jan | P1 exit |
| H6 | Fund parameter sheet signed (Q2, Q14, levy bearer) | CFO | Thu 3 Dec | Thu 7 Jan | Go-live |
| H7 | SSB round 1: fund model, split rules, motor and travel products | SSB | Thu 17 Dec | Thu 28 Jan | Go-live |
| H8 | SSB round 2: document wording, surplus method, counterparties | SSB | Thu 28 Jan | Thu 4 Mar | Go-live |
| H9 | Legal hosting opinion (widened scope, B9) | Client counsel | Mon 21 Dec | Sun 31 Jan; **if negative: in-country stack, +8–12 weeks** | Production |
| H10 | 2026 motor decision texts (400, 460, 88) | Client legal | Mon 16 Nov | Thu 10 Dec | Motor product |
| H11 | ISA forms, Decision 4/2006, Art. 13 quota | Client compliance | about 10 Jan | Unknown | M18 (not a go-live blocker) |
| H12 | Payroll rates (Q27) + 30-employee control sheet | Payroll accountant | Thu 14 Jan | Thu 11 Feb | M34 go-live |
| H13 | E-signature CA (Q32) + stamp | Client + CA | Sun 31 Jan | Wed 31 Mar | Production-signed PDFs |
| H14 | Acquirer contract (Moamalat / LYPAY) | Client + bank | Sun 31 Jan | Apr 2027 | Live card gateway (go-live can use cash + transfer) |
| H15 | SMS contract + sender IDs (Libyana, Al Madar) | Client IT | Thu 31 Dec | Thu 4 Feb | Live alerts |
| H16 | National registry and traffic access | Government | Not by go-live | — | Fallback flag; client acceptance |
| H17 | Orange Card bureau spec | Bureau / GAIF | Feb 2027 | Unknown | Orange Card stays on ARIMA until available |
| H18 | **ARIMA access + schema discovery** | Client IT / ARIMA vendor | **Mon 30 Nov** | Mon 21 Dec | **Migration (critical path)** |
| H19 | Migration mapping approved by finance | Client finance | Mon 21 Dec | Thu 21 Jan | Trial loads |
| H20 | Trial loads 1–3, fully reconciled | Us + client finance | TL1 7 Jan · TL2 28 Jan · **TL3 18 Feb** | TL3 25 Mar | Parallel run |
| H21 | Client FY2026 year-end close (competes for the same staff) | Client finance | Jan–Feb 2027 | — | Slows H19–H24 |
| H22 | Pen test (procure, test frozen staging, fix, retest) | Independent firm | Retest passed Thu 11 Feb | Thu 4 Mar | Go-live |
| H23 | i-text human review (about 5,000 keys, AR+EN; about 200 reviewer-h) | Content writer + specialists | Thu 28 Jan | Thu 25 Feb | Production release gate |
| H24 | UAT (5 departments, 2 regression cycles) | Client staff | Sign-off Sun 7 Feb | Thu 4 Mar | Go-live |
| H25 | 5-day training (about 8 days in Ramadan) + narrated videos | Us + client | Thu 18 Feb | Thu 11 Mar | Go-live |
| H26 | Parallel run through one month-end, reconciled | Client finance + us | **Thu 8 Apr** | May–Jun | **Cutover** |
| H27 | Cloud accounts and billing (Neon, Vercel, AWS); paying US vendors from Libya | Us / client | Thu 12 Nov | Thu 3 Dec | F16a, staging, production |
| H28 | Client go-live approval (management + Board) | Client | +1 week | — | Go-live |

Calendar assumptions: Libyan working week Sun–Thu; FY = calendar year (Q23, assumed); Ramadan 1448 about 8 Feb – 9 Mar 2027 (about −30% client capacity); Eid al-Fitr about 9–11 Mar; Eid al-Adha about 16 May 2027 (dates depend on moon sighting).

### 10.3 End-to-end milestones

| Milestone | Proposal (day 1 = 2 Nov 2026) | Plan V1 P50 |
|---|---|---|
| P1 code-complete | Day 30 (1 Dec) | about 17 Nov |
| **P1 exit (§15.1, all 9 criteria)** | Day 30 | **about Tue 22 Dec 2026** (needs H4, H5, part of H23, client sessions) |
| P2 code-complete (simulators) | Day 75 (15 Jan) | about 1 Dec 2026 |
| P2 gate (all §6 ATs on the sample) | Day 75 | about Thu 7 Jan 2027 |
| UAT signed | Day 90 (30 Jan) | Sun 7 Feb 2027 |
| Pen test passed | Day 90 | Thu 11 Feb 2027 |
| **Go-live (full migration)** | Day 90 + gates | **P10 Sun 7 Mar (better 14 Mar) · P50 Sun 11 Apr · P90 Jun–Sep 2027** |
| Go-live (new business only, ARIMA run-off) | — | P50 21 Feb (Ramadan); recommended Sun 14 Mar 2027 |
| Hypercare (15 days) | — | 11–25 Apr 2027 |
| Warranty (6 months) | — | to about 11 Oct 2027 |
| P4 sign-off | Months 4–9 | Sep–Oct 2027 (actuary methodology and auditor review dominate; AI engineering about 2–3 weeks) |
| P5 (KSA, UAE, Bahrain packs; ISO 27001) | Months 9–15 | Driven by counsel; UAE needs a wakala-only fund variant (D-16); KSA a cooperative variant (D-17) |

**Critical path (P50):** kickoff → H18 ARIMA schema (30 Nov) → H19 mapping (21 Dec) → WP-306/307 ETL (AI, about 2 days) → TL1 / TL2 / TL3 (7 Jan → 18 Feb, overlapping FY close and Ramadan) → H26 parallel run through the March month-end (reconciled 8 Apr) → cutover 8–10 Apr → **go-live Sun 11 Apr 2027 (day 160)**.

**Near-critical (slack):**
- SSB round 2: about 10 weeks
- pen test: about 8 weeks
- UAT and training: about 7 weeks
- legal opinion: about 15 weeks, **unless negative**, in which case it becomes critical and moves go-live to about Jun–Jul

---

## 11. Gates

### 11.1 Per-commit (builders) and per-wave (`pnpm gate:wave`, re-run by the review agent itself)

| # | Gate | Pass criterion |
|---|---|---|
| G0 | Ownership | Diff touches only the WP's owned paths and migration range |
| G1 | Install / generate | `pnpm install --frozen-lockfile && pnpm gen --check` |
| G2 | Typecheck | `tsc -b --noEmit`; a missing `infoKey` is a compile error |
| G3 | Lint | R8 raw-HTML ban; `no-float-money`; `no-hardcoded-rates`; import boundaries (domain has no I/O; no Neon/Vercel SDK in domain or db; no outbound calls outside integrations); no bare `SET` / `db.` outside `withRequestContext` |
| G4 | Unit + coverage | domain ≥85%; funds, ledger, surplus and payroll ≥90% |
| G5 | Property | fast-check: per-fund TB at 10,000 events; split rounding; inter-fund sum = 0 |
| G6 | Migrations | up → down → up identical dump; upgrade from previous wave snapshot |
| G7 | Schema invariants | RLS ENABLE+FORCE on every business table; app role owns nothing and has no BYPASSRLS; money `numeric(20,3)`; `sharia_status` NOT NULL + CHECK with **no DEFAULT** on registered tables; immutability triggers |
| G8 | RLS role matrix | Out-of-scope rows invisible and writes blocked for every §9.2 role |
| G9 | Ledger guarantees | Cross-fund journal without a transfer rejected; posting in a closed period rejected; posted rows immutable; pairing check |
| G10 | SoD | Every §9.3 conflict blocked; checker cannot approve own item or above limit |
| G11 | Audit chain | `audit:verify` passes after e2e |
| G12 | Events | Catalogue check; consumer contract tests; idempotent replay |
| G13 | Content | `content:check --mode=draft` (AR+EN, ≤80 words); lesson exists for touched modules |
| G14 | Semgrep custom rules | Platform rules (money, RLS bypass, secrets in briefs) |
| G15 | e2e affected + smoke | Playwright `ar-rtl` + `en-ltr` with screenshot diffs on key screens |
| G16 | Sandbox egress | No connector enabled in a sandbox build; worker egress allow-list test |
| G17 | Stubs + traceability | Stub registry; AT IDs in test titles (`[AT-M09-1]`) |
| G18 | Security quick | gitleaks, osv-scanner (no High), licence allow-list |
| G19 | Build / portability | `pnpm build`; web + worker Docker images boot against plain Postgres (R4) |
| Review | Review agent | 0 open BLOCKER or HIGH; auditor sign-off on synchronous-audit waves |

### 11.2 Phase gates

| Gate | Automated (G20–G27, see protocol) | Human |
|---|---|---|
| **G-P1** | Full suite fresh + upgrade; P1 traceability (all P1 ATs + EX-P1 automated parts); ZAP baseline (0 High); sandbox egress test (EX-P1-9); masking leak scan; restore test; audit chain over full sample | Per-fund movement reconciliation to client books (EX-P1-6); `content:check --mode=release` for P1 modules (EX-P1-7); client staff session (EX-P1-1); demo to management and SSB |
| **G-P2** | All §6 ATs green; KPI golden dataset; reporting role cannot write; M15 golden number; Terraform drift = none; weekly ZAP full | Payroll control sheet to the dirham; M15 sample run reviewed by CFO and actuary; screenshot baselines approved |
| **G-P3 / go-live** | k6: 200 VUs, issue p95 < 2 s, close < 30 min on 3 years of data; ZAP full 0 High; DR restore measured (RTO ≤4 h; RPO ≤15 min in-region); release-mode content for all modules; audit verify on staging and a production copy | Pen test with 0 open High/Critical; TL3 + parallel run reconciled; SSB rounds 1 and 2; fund parameters signed; legal opinion; UAT signed; training delivered; client go-live approval |

---

## 12. Acceptance-test traceability (README §6 / §15.1 → WP)

| AT | WP | | AT | WP |
|---|---|---|---|---|
| M02-1, 2, 5 | 107 (+F19) | | M07-1, 2 | 114, 206 |
| M02-3, 4 | 108 | | M07-3, 4 | 114 |
| M06-1, 2, 3 | 112 (+F18) | | M04-1 | 118, 205 |
| M06-4 | 111 + 114 | | M04-2, 3, 4 | 204 |
| M06-5 | 113 | | M12-1, 3, 4 | 101–103 |
| M05-1, 4 | 109 | | M12-2 | 208 |
| M05-2, 3 | 110 | | M28 (24 KPIs, 12 dashboards, hourly, read-only) | 211, 217–219 |
| M09-1, 2, 5 | 116 | | M16-1 | F17, 123 |
| M09-3 | 117 | | M16-2 | 101, 123 |
| M09-4 / M10-2 | 202 | | M16-3 | 216 |
| M10-1 | 201 | | M15-1…4 | 214 |
| M10-3 | 203 | | M15-5 | 215 |
| M11 (3) | 212, 213 | | M34 (3) | 221, 222, 118 |
| EX-P1-1…9 | 126 (automated) + human items in G-P1 | | Validator tests A-1…41 | Mapped in each WP brief |

---

## 13. Multi-agent risks and mitigations

| Risk | Mitigation |
|---|---|
| Schema drift or duplicate tables | Migration ranges, table-ownership map, near-duplicate-name lint, contracts-only cross-module access |
| Semantic double-booking (e.g. retakaful recoverable, Wakala) | D00 ADRs; posting-rule ownership registry; golden-lifecycle property test |
| Event contract drift | Versioned Zod catalogue; contract tests; changes only at freeze |
| Builder context loss | ≤15k-token briefs, ≤6 h WPs, CLAUDE.md with DoD/R1–R8, handoff notes |
| Test gaming (weakening tests) | Tests authored before the build and CODEOWNERS-locked; reviewer diffs all test changes; mutation testing on money domains |
| Reviewer blind spots | Fixed 39-item checklist and adversarial tests; integration-reviewer agent every 3 waves reads whole modules; auditor re-runs critical gates |
| Stubs left in place | Stub registry with owning WP; empty at phase gate |
| Flaky Arabic e2e | Bundled fonts, mocked clock, per-test seeded data; quarantine budget ≤2% |
| Hallucinated library APIs | Pinned versions (Next 16.4, Better Auth 1.7.x, Drizzle 0.45, pg-boss 12, next-intl 4) + local doc excerpts in `docs/deps/` |
| Over-production vs client absorption | Weekly release trains; pacing rule (§9) |
| Secrets in agent environments | Builders use only local and ephemeral credentials; production secrets used only by F16 under human control; gitleaks |

---

## 14. Immediate next actions (P0 week, from Mon 2 Nov 2026)

| # | Action | Owner |
|---|---|---|
| A-0 | Provide the original Arabic brief; diff it against README §6(a) and §19 | PO |
| A-1 | Review and approve D00 (§5); apply README errata (§6) via WP-00-DOC | PO + takaful accountant + SSB adviser |
| A-2 | Request ARIMA confirmation, DB access and schema (H18), **on day 1** | PO → client IT |
| A-3 | Send data-sharing agreement, fund parameter sheet, opening-balance request, written Frankfurt acceptance (H2, H3, H6) | PO |
| A-4 | Commission the widened legal opinion (B9) and the motor decision texts (H10) | Client counsel |
| A-5 | Get a signed scope deviation: payment rails, offline PWA → P4, family / health / export credit stay on ARIMA until P4 (D00-17) | PO + client |
| A-6 | Open cloud accounts (Neon Scale, Vercel Pro + PrivateLink, AWS) and confirm billing from Libya (H27) | PO |
| A-7 | Name i-text reviewers (2 Arabic content reviewers + Sharia, finance, compliance, HR specialists) (H23) | Client + PO |
| A-8 | Procure the pen-test firm (lead time about 4–6 weeks) | PO |
| A-9 | Build session starts W1 (F01) once A-1 is in progress. W1–W6 do not need D00; **W7 does** | Orchestrator, after auditor brief approval |
| A-10 | After W3: re-baseline wave times and publish **Plan V2** | Auditor |

---

## 15. Red-team review of this plan (wave 3)

See `docs/plan/validation/R-redteam.md` for the adversarial review of V1 and the changes applied.
