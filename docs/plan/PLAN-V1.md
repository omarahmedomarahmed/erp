# TakafulTech — Build Execution Plan V1 (audited)

| Item | Value |
|---|---|
| Product | **TakafulTech**, a core takaful (Islamic insurance) platform. Earlier names: "Core Islamic Insurance", and before that an ERP with custom modules |
| First client | Takaful Insurance Company (شركة التكافل للتأمين), Tripoli, Libya |
| Source spec | `README.md`. All 1,160 lines were read in full by every validator and red-team agent |
| Status | **Plan V1: validated and red-teamed. Not built.** No application code exists. The build starts when the auditor approves the W1 briefs and **D00-A** is approved (§5). |
| Prepared by | Auditor/planner session. It owns the plan and verifies build-session briefs, review findings, fixes, test runs and gates |
| Date | 2026-10-28 |

Companion documents:

| Document | Contents |
|---|---|
| `WP-CATALOGUE.md` | Every work package: wave, scope, README line ranges, dependencies, acceptance tests closed, hours |
| `AGENT-PROTOCOL.md` | Builder brief, reviewer brief, auditor checklist, gate catalogue G0–G27, adversarial test library |
| `findings-ledger.md` | Single register of all findings |
| `validation/A…E` | Spec validators |
| `validation/R1`, `validation/R2` | Red-team reports on this plan |

> **Input gap.** The original Arabic brief ("العرض الفني — تطوير نظام التكافل التأميني الشامل") was **not available** in this session. Validators used the translated client quotes in README §6 "(a)". Action **A-0** (§14) diffs the Arabic original against README §6(a) and §19 before W7.

---

## 1. Verdict

| Question | Answer |
|---|---|
| Is the README buildable as written? | **Not yet.** The spec is strong: every Law 3/2005 figure matches the statute text, the stack is current, and module scope is complete. But it has **11 blockers and about 70 HIGH flags** that parallel builder agents would resolve in incompatible ways. |
| What unblocks the build? | **D00-A** (engineering decisions, approve on days 1–2) unblocks W1–W6. **D00-B** (business and Sharia decisions) unblocks W7 onward. Then the README errata (§6). |
| Can multiple AI agents build it? | **Yes**, under §7: at most 4 concurrent builder subagents, a dependency-ordered wave plan (§9), frozen contracts, file and table ownership, an independent review agent, CI-of-record gate evidence, and auditor sign-off. |
| AI engineering time | **28 planned waves plus about 10 reactive waves.** About 293 h nominal for planned waves (about 372 h including reactive); **about 583 h with contingency** (×2 on money waves, ×1.5 elsewhere, plus reactive). That is **about 5–6 calendar weeks at 15 operating hours/day**. P4 adds about 12 waves (about 200 h). |
| Builder effort | About 600 builder agent-hours for P1–P3 (about 865 including review and fix passes); about 280 for P4 |
| Software-complete by day 75 (Thu 14 Jan 2027)? | **Yes** at 15 h/day or 24 h/day: P2 is code-complete by about 3–10 Dec 2026. **No** at 8 h/day on 5-day weeks (about 21 Jan). Use an autonomous orchestrator with scheduled check-ins. |
| Go-live on day 90 (weekend; working day Thu 28 Jan 2027)? | **No.** The binding gates are human, client and regulatory: the ARIMA migration chain, SSB approvals, the legal hosting opinion, the pen test, UAT, i-text review and the parallel run. |
| Realistic go-live (kickoff Mon 2 Nov 2026) | **P10: Sun 14 Mar 2027** (first Sunday after Eid al-Fitr; 7 Mar is technically possible but falls in the last week of Ramadan). **P50: Sun 11 Apr 2027 (day 161).** **P90: Jun–Sep 2027**, if the hosting opinion is negative (in-country stack) or ARIMA extraction is blocked. |
| Recommended contract restatement | "Software complete and UAT-ready by day 75; go-live gated; target April 2027." |

All estimates are **modelled, not measured**. The auditor re-baselines them after W3 using actual wave times, gate times and token use, and publishes the result as **Plan V2**.

---

## 2. How this plan was validated

| Wave | Agent | Scope | Output | Flags |
|---|---|---|---|---|
| 1 | A: Finance & Sharia | §5, M08, M11–M16, M19 (Law 3/2005 checked against the Arabic statute) | `validation/A-finance-sharia.md` | 3 BLOCKER · 9 HIGH · 12 MED · 2 LOW · 41 tests |
| 1 | B: Insurance operations | M02–M07, M09, M10, M22, M28, P4 modules, events | `validation/B-insurance-ops.md` | 0 · 13 · 24 · 7 |
| 1 | C: Platform & tech | §2–4, §9–14, platform modules (package versions as of Oct 2026; local PG16 feasibility tests) | `validation/C-platform-tech.md` | 2 · 11 · 15 · 8 |
| 1 | D: Libya regulatory, HR, AML | §1.1, §7, §17, M17–M19, data residency, rule packs | `validation/D-regulatory-hr.md` | 1 · about 10 · plus a verification table of about 50 rows |
| 2 | E: Internal consistency | Inventory, table ownership, events, access, phases, open questions | `validation/E-consistency.md` | 6 · 36 · 32 · 12 · 40 decisions |
| 2 | F: Timeline planner | WP DAG, waves, calendar, human gates | Merged into §8–§10 and `WP-CATALOGUE.md` | — |
| 2 | G: Protocol designer | Briefs, auditor checklist, gates, ledger | `AGENT-PROTOCOL.md` | — |
| 3 | R1: Red team, feasibility | Adversarial review of the V1 draft | `validation/R1-redteam-feasibility.md` | 4 · 15 · 14 · 6 |
| 3 | R2: Red team, traceability | All 491 README rows mapped to the plan | `validation/R2-traceability.md` | 24 gaps; all 12 BLOCKERs addressed; 13 of 76 HIGH not fully addressed |

**Auditor rulings on conflicts:**

1. **Inter-fund journal shape** (A-04 vs E D-02): **one journal per transfer**, balanced inside each fund, with a pairing check. This matches README §5.4.
2. **Wakala recognition** (A-01 vs E D-01): R1-17 showed that recognising Wakala on collection overstates the PTF surplus when contributions are uncollected at year end. **Ruling:** Wakala **accrues with the contribution (written basis)**, as a versioned rule-pack parameter (`wakala_basis ∈ {written, earned}`). Commission stays on collected (an SHF matter).
3. **D-16 regrade:** the UAE takaful regulation was MEDIUM in D. The auditor regrades it to **HIGH for P5** because it invalidates "rule pack = data only" for the UAE.
4. **Precedence:** where they differ, `PLAN-V1.md` overrides `AGENT-PROTOCOL.md`. The protocol's ADR-001…016 labels are renumbered to D00 numbers when written (see the protocol header).

---

## 3. Module-by-module verdict

Key:

- **GO**: build as written.
- **GO\***: build after the listed D00 decision or erratum.
- **HOLD**: a scope or legal decision is needed first.

| Module | Name | Phase | Verdict | Key flags | Size |
|---|---|---|---|---|---|
| M00 | Tenant & Configuration | P1 | GO* | Hijri variant per tenant; Libyan holidays from local announcements (C-27, D-07); numbering owner (D00-16) | M |
| M01 | Identity & Access | P1 | GO* | Better Auth policy layer is custom (C-16); `auth` schema; roles and the role × module matrix (D00-08, E-48/49) | L |
| M02 | CRM | P1 | GO* | Fuzzy duplicates non-blocking for the 60-s flow (B-31); one `party` (D00-15); Law 6/2022 Arts. 73–79 / Art. 78 (C-14, D-01) | L |
| M03 | Product Factory | P1, plus remaining lines in P2 | GO* | No tables in README (E); Art. 1 class (A-17); pass-through charges SSB-approved (D00-09); motor decisions 400/460/2026 (D-03); remaining product lines WP-232 | XL |
| M04 | Agents & Brokers | P1 / P2 | GO* | Decision 88/2026 commission caps (D-04); tier recompute (B-25); net remittance (D00-25) | L |
| M05 | Underwriting | P1 | GO* | Rule DSL (D00-18); approval engine is M26 (D00-14) | L |
| M06 | Policy issue / renew | P1 | GO* | Expiry scan `≤N days` + idempotency (B-05); PAdES CA (C-05); IFRS 17 capture (A-12); Wakala reversal (D00-03) | L |
| M07 | Contributions & Billing | P1 / P2 | **HOLD → GO*** | **Stripe does not serve Libya; PayPal reportedly not (B-01, D-08).** Local rails are built regardless (R1-39); Stripe and PayPal stay behind flags until the deviation is signed. Pay-by-link (B-03) | L |
| M08 | Takaful Fund Engine | P1 | **GO* (D00-B critical)** | A-01, A-04…A-07; system context (C-01, D00-05); family investment part (D00-03) | L |
| M09 | Claims | P1 | GO* | Case reserves in P1 (D00-13); transition table (D00-19); recoverable owned by M10 (D00-12); P1 PTF disbursement WP-116b | L |
| M10 | Retakaful | P2 | GO* | Recovery order and trigger (B-08); AT-2 limit (B-09); reinstatements (B-10); cession basis (D00-26); P1 cession backfill (WP-201) | XL |
| M11 | Investments | P2 | GO* | FAS 28/32/33/30 (A-11); Mudaraba loss rules (A-20); `INVESTMENT_WAKALA_FEE` (A-21); Art. 16 (A-22, D-22) | L |
| M12 | Accounting | P1 / P2 | **GO* (D00-B critical)** | Accrual model (D00-01); book of record (D00-10); eliminations (A-23); FX (A-07); payables / FA / budgets WP-209b | XL |
| M13 | Reserving | P2 lite / P4 full | GO* | M13-lite: UCR + Art. 15 floor, actuary-entered IBNR (A-25, A-17) | M / XL |
| M14 | IFRS 17 / FAS 43 | P1 data / P4 engine | GO* | P1 capture fields (A-12) | XL |
| M15 | Surplus | P2 | **GO* (D00-B critical)** | Formula (D00-02); actuary SoD (D00-08); sample window (A-14); distribution details (A-15) | L |
| M16 | Sharia | P1 / P2 | GO* | `sharia_status` model (D00-07); SSB approval register needed in P1 (WP-123a, E-27); Decision 60/2021 UNVERIFIED | L |
| M17 | AML/CFT | P2 | GO* | Law 2/2005, goAML XML, UN Libya list (D-15) | M |
| M18 | Libya Regulatory | P2 | GO* | Levy is an SHF expense (D00-09); Art. 22 registers; forms pending (Q17) | M |
| M19 | Solvency | P2 basic / P4 | GO* | Life component (A-18, D-12); Qard admissibility question to ISA | S / M |
| M20 | Family Takaful | P4 | **HOLD** | Client sells it today; stays on ARIMA until P4 (B-14) | XL |
| M21 | Health | P4 | **HOLD** | Same (B-14) | XL |
| M22 | Motor & Border | P1 online / P2 Orange Card / P4 offline | GO* online; **HOLD offline** | Offline PWA deferred (B-17); Orange Card inter-Arab electronic card (B-16) | M / L / XL |
| M23 | Export Credit | P4 | **HOLD** | ICIEC deal live (B-14) | L |
| M24 | Documents | P1 | GO* | PAdES library and CA (C-05) | L |
| M25 | Portals | P2 agent / P4 customer | GO* | Agent dashboard belongs to M04 (E) | L |
| M26 | Workflow & Tasks | P1 | GO* | Single approval engine (D00-14), WP F15 in W7 | L |
| M27 | Audit Trail | P1 | GO* | Async chainer + WORM anchor (C-03) | M–L |
| M28 | Dashboards | P2 | GO* | KPI dictionary (B-39); Power BI Service vs D12 (B-40); reporting role (C-28) | L |
| M29 | "i" + Learning Center | P1 | GO* | **Full-system i-text 10–15k keys (≤6k unique with shared keys); 400–600 reviewer-hours** (C-08, R1-12); custom `ar_norm()` (C-26) | L / XL content |
| M30 | Integration Hub | P1 / P2 | GO* | Sandbox egress block only from the worker (C-19) | M / XL |
| M31 | Migration & Sandbox | P1 | GO* | CLI binary, CSV / Oracle Thin (C-20); agents masked (E D-30) | XL |
| M32 | Module Request | P1 | GO | Slotted in WP-123b | S |
| M33 | HR | P1 master / P2 | GO* | End of service by nationality (D-06); `staff_advance`; WP-220 size watch | L |
| M34 | Payroll | P2 | GO* | **Social security 20.5% (5.125 / 14.35 / 1.025), not 3.75 / 11.25**; 1% solidarity; 0.5% stamp; exemptions (D-05); confirm with Q27 | L |

---

## 4. Consolidated blockers and top HIGH flags

| # | Flags | Issue | Resolution | Owner | Target / P50 |
|---|---|---|---|---|---|
| B1 | A-01, E-02, R1-17, R1-24 | Income recognised twice; fund of receivable undefined; family savings via PTF | D00-01, D00-03; §5.5 rewritten | Takaful accountant + PO | Before W7 |
| B2 | A-02, A-03, R1-23 | Surplus formula double-counts | D00-02; golden scenario signed (WP-00-TEST) | Takaful accountant + SSB | Before W20 |
| B3 | C-01 | RLS blocks system postings | D00-05; WP F21 (W6) | Tech lead | D00-A, day 2 |
| B4 | C-02, E-01, R1-02 | No parallel-build or branch conventions; table ownership | §7; D00-15 | Orchestrator + auditor | W1 |
| B5 | E-06, A-13 | P1 claims vs reserves | D00-13; WP-116b | PO | Before W11 |
| B6 | E-12, E-60 | Approval engine ownership and timing | D00-14; F15 in W7 before all consumers (W8+) | PO | Before W7 |
| B7 | E-59 | Sample / CLI timeline | WP-119 in W2 → CLI to client by day 8; sample target day 14, P50 6 Dec; synthetic fallback | Orchestrator + client IT | W2 |
| B8 | E-66, A-14 | Exit 6 not achievable as written | Reconcile per-fund **movements** with interim CoA mapping and opening TB; request opening balances | PO + client finance | P1 exit |
| B9 | D-02 | Legal opinion too narrow | Widened scope; due P2 day 60; Frankfurt sandbox acceptance target day 10 (P50 16 Nov) | Client counsel | Day 10 / day 60 |
| B10 | B-01, D-08 | Stripe / PayPal unavailable | D00-17 signed deviation; local rails built regardless | PO + client | P0 |
| B11 | C-12 | Staging / sandbox branched from production | D00-20: separate prod and non-prod projects | Tech lead | D00-A |
| H1 | C-03 | Audit chain global lock | Async chainer (F06) | Tech lead | W5 |
| H2 | C-10, C-24 | Driver / pooler and RLS context | F04; worker on direct endpoint | Tech lead | W3 |
| H3 | C-09 | Migration tool | dbmate (D00-20) | Tech lead | W2 |
| H4 | C-05 | PAdES CA / Libyan licensing | H13, Q32; sandbox self-signed CA | Client + counsel | Go-live |
| H5 | C-08, R1-12 | i-text workload (full system) | Shared keys; 2 FTE reviewers from week 3; H23 near-critical | Client + PO | Go-live |
| H6 | D-03, D-04 | 2026 motor decisions missing | Errata 9; H10 | Client legal | Before W10 (106) |
| H7 | D-05 | Payroll statutory model | WP-221; `to_verify` until Q27 | Payroll accountant | W20 |
| H8 | B-33…B-35, B-34 | Event catalogue gaps | D00-11 (W4) | Orchestrator | W4 |
| H9 | B-07…B-09 | Retakaful recovery | D00-12; AT-M10-2 restated | Reinsurance officer | W17 |
| H10 | A-08 | `sharia_status` model | D00-07 (D00-A mechanics; SSB confirms semantics) | Tech lead + SSB adviser | W3 |
| H11 | A-10, E | Actuary SoD; missing roles | D00-08 | PO | W7 |
| H12 | B-14, B-17 | P4 lines; offline PWA | D00-17 | Client | P0 |
| H13 | D-16 (regraded) | UAE 2026 regulation | P5 fund-model variants | PO | P5 |
| H14 | C-11, C-13 | Network isolation cost; RPO scope | Cost model; errata 15 | PO | Production |
| H15 | R1-01 | Build environment (no Docker daemon; 4 vCPU / 15 GB shared; PG16 only) | §7.5 | Orchestrator | W1 |
| H16 | R1-07, R1-08 | Forgeable evidence; same-model reviewer; AI-made golden numbers | §7.4; WP-00-TEST signed by the takaful accountant | Auditor | W1 |
| H17 | R1-16 | Unmasked data in migration trial loads | §7.6 | PO + client IT | Before W26 |
| H18 | D-18, E | Client facts unverified (founding year, ARIMA) | P0 confirmation (A-11) | PO | P0 |

All validator flags stay in their reports. `findings-ledger.md` tracks these consolidated items now. **At W1 the orchestrator imports every remaining BLOCKER, HIGH and MEDIUM validator flag as a `V-*` row**, each with its closing D00 decision, erratum or WP.

---

## 5. Decision Pack D00

### 5.1 D00-A: engineering decisions (approve days 1–2; tech lead + auditor; blocks W1–W6)

| ID | Decision | Default | Blocks |
|---|---|---|---|
| D00-04 | Balancing and immutability mechanics | Deferred constraint trigger on the **journal header** at `status → posted` (definer); composite FK `(account_id, fund_id)`; immutability via RLS policy + BEFORE trigger; balance on `amount_lyd` with a per-fund FX rounding account | W7 (101) |
| D00-05 | System context vs RLS | Posting, numbering, audit append and outbox enqueue only via `SECURITY DEFINER` functions owned by a non-login role, with a fixed `search_path` and tests | W6 (F21) |
| D00-07 | `sharia_status` mechanics | NOT NULL + CHECK, **no DEFAULT**; derived on insert (approved source → `compliant`, else `pending_review`); append-only `sharia_status_event` + current view; registry + CI meta-test. *Semantics of the blocking matrix for `non_compliant` are confirmed by the SSB adviser in D00-B* | W3 (F17) |
| D00-11 | Event catalogue v1 | §12.4 plus missing events (`CertificateCancelled`, `EndorsementIssued`, `CertificateRenewed`, `CertificateLapsed`, `RefundApproved`, `CessionBooked`, `RecoveryBooked`, `ReserveChanged`, `ClaimPaymentConfirmed`, `EmployeeHired`, …); outbox/inbox; `aggregate_seq`; idempotency key; versioned Zod payloads | W4 (F07) |
| D00-15 | Party model, table names, ownership | One `party` + extensions; `gl_account`, `auth.*`, `inv_portfolio` / `ifrs17_portfolio`, `staff_advance`, `ri_recovery`, `inv_sharia_screening`, `aml_screening`; ownership map E §3 | W2 (F03) |
| D00-16 | Numbering | "Gap-free" = every number accounted for (issued, voided, spoiled, returned) with `number_void`; locked counter taken last; blocks drawn from series. ISA rules (Q19) may add format constraints later | W3 (F17) |
| D00-20 | Infrastructure | Worker on AWS ECS Fargate eu-central-1; Secrets Manager + KMS; S3 + Object Lock; **PG17 runtime, CI matrix PG16 + PG17** (R4 floor); dbmate; node-postgres / Neon WS pool; separate prod and non-prod Neon + Vercel projects | W2 |
| D00-21 | Precision and formats | Money `numeric(20,3)`; FX `numeric(18,8)`; rates `numeric(12,9)` fractions; banker's rounding; per-tenant number format | W2 (F05) |
| D00-22 | `infoKey` scope | In-app interactive UI only; shared keys (`common.*`, `field.*`); release gate = 100% text + 100% risk-tagged keys approved | W4 (F10) |
| D00-24 | Naming | Product "TakafulTech"; npm scope `@takafultech/*`; repo root `takafultech/`. **GitHub repo rename (`erp` → `takafultech`) only between phases, with remote updated in the same step** | W1 |

### 5.2 D00-B: business and Sharia decisions (approve by about Sun 8 Nov; PO + takaful accountant + SSB adviser; blocks W7+)

| ID | Decision | Default | Blocks |
|---|---|---|---|
| D00-01 | Contribution recognition | At issue, per fund: PTF Dr receivable / Cr unearned contribution for the tabarru' + Wakala parts; PIF part booked to PIF (family only). **Wakala accrues at issue** (`wakala_basis = written`, alternative `earned`): PTF Dr Wakala expense (deferred) / Cr due to SHF, mirrored in SHF. Receipt: Dr bank / Cr receivable. Cancellation reverses (`WAKALA_FEE_REVERSAL`). §5.5 rewritten as issue → receipt → month-end → cancel | W7 |
| D00-02 | Surplus formula | Step 1 = **gross** contributions earned in the PTF (UCR already includes the Art. 15 floor, so the **floor is not deducted again**). Step 2 = net claims incl. change in OCR. Step 3 = **change in** IBNR, fluctuation reserve and premium deficiency only. Step 4 = Wakala + retakaful contributions + SSB-approved PTF costs. Step 5 = investment income net of Mudarib share. All net of retakaful. Participant basis = tabarru' earned and collected (SSB confirms). **Largest-remainder allocation at 0.001 LYD so allocations sum exactly to the distributable amount (no residue).** Unrenewed renewal credit converts to a voucher after N days | W20 |
| D00-03 | Inter-fund transfer shape | One journal per transfer, balanced per fund; cross-fund journals must reference an `inter_fund_transfer` **or** a `contribution_allocation` (the split record); deferred pairing check. New types: `SETTLEMENT`, `WAKALA_FEE_REVERSAL`, `INVESTMENT_WAKALA_FEE`. `SURPLUS_ALLOC` = single-fund PTF journal. `QARD_DRAW` any time with CFO + SSB. **The PIF part never passes through PTF** | W7 |
| D00-06 | Charity / purification | "Charity payable" liability in the fund where the income arose; never income | W7 |
| D00-07b | `non_compliant` blocking matrix | E.g. non-compliant investment income cannot be credited to income and goes to purification; SSB confirms the list | W8 |
| D00-08 | Roles and actuary SoD | Reserving actuary ≠ approving actuary (external allowed). Add Board member, GM, branch manager, Sharia secretary, content reviewer, integration admin, migration operator, regulatory reporting officer. Approval steps via capabilities | W6 (F12) |
| D00-09 | Pass-through charges and levy | Contribution = net (100% split) + pass-through charges mapped to funds. **Each charge type needs SSB approval before use.** Art. 4 levy = SHF expense (not passed on) | W8 |
| D00-10 | Book of record P1–P3 | Local / regulatory basis with FAS 42-style presentation; FAS 43 parallel from P4 (Q18) | W8 |
| D00-12 | Retakaful recovery | M10 books on `ClaimApproved`; order fac → QS / surplus (every claim) → per-risk XoL → per-event XoL → stop loss; reinstatements; AT-M10-2 restated with a layer limit | W16 |
| D00-13 | P1 claims scope | Case reserves (PTF) in P1; retakaful share as `retakaful_pending`, backfilled in P2; P1 single PTF disbursement with maker-checker (WP-116b) | W11 |
| D00-14 | Approval engine | M26 owns it (F15); M01 owns limits; module matrices are policy rows | W7 |
| D00-17 | Scope deviations (client-signed) | Stripe / PayPal behind flags; family, health and export credit on ARIMA until P4; offline PWA → P4; Orange Card online with a simulator until the bureau spec arrives; regulated commission caps override tiers | P0 |
| D00-18 | Underwriting DSL | Decision tables + JSONLogic over a typed questionnaire; versions pinned per quote | W9 |
| D00-19 | Claim state machine | Full transition table; missing-document sub-status; 4→3 send-back; Rejected terminal; Reopened → stage 2 with approval; SLA day 0 = registration; escalation days configurable (3, 4) | W11 |
| D00-23 | Performance definitions | Issue < 60 s user journey on 1 Mbps; server p95 < 2 s; PDF < 30 s async; receipt + postings < 5 s (no PDF); production compute always warm | P3 |
| D00-25 | Agent net remittance (B-26) | Agents remit **gross**; commission is paid separately from SHF. Netting only through an SHF→PTF settlement entry, never by short-paying the PTF | W16 |
| D00-26 | Cession basis and ceding commission (B-12) | Cession on gross contribution (tabarru' + Wakala) unless the treaty says tabarru'-only; ceding commission → PTF income unless the SSB rules otherwise | W16 |
| D00-27 | Claim-handling and surveyor costs (B-24) | SHF expense; direct PTF only if the rule pack allows `EXPENSE_RECHARGE` + SSB | W11 |
| D00-28 | Retakaful commission, salvage, subrogation (A-15i) | PTF income lines in the surplus computation | W17 |

D00 becomes ADR-001…ADR-028 in `docs/adr/` (ADR-0NN = D00-NN). Builders **stop and raise a question** on any ambiguity not covered by an ADR.

**If D00-B slips:** W7 runs F14, F15 and F16b without 101. Money WPs slip one wave each (about 11 h nominal) per approval stall. The P90 stall is about 8 days.

---

## 6. README errata (WP-00-DOC in W1; tracked in the ledger)

1. "Core Islamic Insurance" → **TakafulTech** (L1, L38, L129); repo root `takafultech/`.
2. §5.3 / §5.4 / §5.5: transfer types and the `contribution_allocation` reference (D00-03); multi-event worked example (D00-01).
3. §6.11 surplus steps per D00-02; distribution details (A-15).
4. §6.8: "FAS 42-style presentation; FAS 43 measurement P4" (A-09).
5. §6.12: FAS 28/32/33/30; `INVESTMENT_WAKALA_FEE`; Mudaraba loss rules; Art. 16 (A-20…A-22).
6. §6.5 AT-2: add "layer limit ≥ LYD 150,000" (B-09). §6.4: P1 case reserves; transition table (D00-13, D00-19).
7. §6.6: rails = Moamalat / LYPAY / Sadad / bank transfer / cash; Stripe / PayPal behind flags (B-01).
8. §6.1(c), §12.3, §17: "Law 6/2022 on Electronic Transactions, Ch. 7 Arts. 73–79 (transfer abroad Art. 78)"; add Cybercrime Law 5/2022.
9. §17: the following changes (A-17, A-18, D-03…D-15).
   - Art. 15: add the engineering exception and the net-of-retakaful basis.
   - Art. 17: add the life component.
   - Levy: borne by SHF.
   - Add Decisions 400/2026, 460 and 88/2026.
   - Decision 374/2026 is ministerial.
   - AML: Law 2/2005 and goAML.
   - Payroll: social security 20.5% split, 1% solidarity, 0.5% stamp, exemptions.
   - Holidays: 24 Dec and 17 Feb.
10. §7.2: payroll pipeline order (D-05).
11. §8: one master module table (all 35 modules) with phases and data tables (E).
12. §9.2 / §9.3: roles (D00-08); actuary conflict; role × module level matrix.
13. §12.1 / §12.2: separate prod and non-prod projects; staging in P1 (C-12).
14. §12.4: event catalogue v1 (D00-11).
15. §13: ASVS **5.0**; ClamAV; RPO / RTO scope; D12 reworded to "no SaaS beyond contracted hosting processors" (C-13, C-18, C-21, C-23).
16. §14.1: opening balances; window aligned to the last distributed surplus year; mask agents; CSV / Oracle Thin input (A-14, E D-30, C-20).
17. §15: replaced by §9–§10 of this plan; P2 sprint plan.
18. §15.1: exit 6 (movements) and exit 7 scope (E D-18, D-19).
19. §18: owners and due dates; Q33 legal opinion; Q34 named i-text reviewers; Q35 Board approval process; Q36 Arabic-brief diff; Q10 bancassurance flagged as orphan.
20. §3.1: PG17 runtime / PG16 floor; dbmate; driver; pyHanko or KMS signer; AWS ECS.
21. §20: ARIMA "client's current system vendor" → "likely current vendor (to confirm)" (D-18).

---

## 7. Build operating model

The full templates are in `AGENT-PROTOCOL.md`. This section is binding and takes precedence.

### 7.1 Roles

| Role | Who | Responsibilities |
|---|---|---|
| **Build Orchestrator** | The build session (Claude Code) | Owns the integration branch, lockfile, `.github/`, contract freezes and migration ranges. Writes builder briefs from `WP-CATALOGUE.md` (README line ranges are mandatory). Launches up to 4 builder subagents per wave. Then spawns a **fresh review agent** and briefs it. Routes findings to fix passes. Merges. Posts the wave packet for the auditor. |
| **Builder agents** (≤4 concurrent) | Subagents of the orchestrator, each in its own git worktree on a local `wp/<id>` branch | One WP each, in owned paths only. Work order per §2.1. Run `wp:verify`. Report with gate logs. Never touch another WP's files, the locked golden tests, or frozen contracts. |
| **Review agent** | Fresh subagent after builders finish; never concurrent with more than 3 other agents | Independent: no builder transcripts; reads builder reports only after forming its own findings. Re-runs gates on a clean checkout. Applies the 39-item checklist plus adversarial tests X1–X30. Returns findings ranked by severity with file:line and repro. **Uses a different model from the builders where the platform allows.** |
| **Integration reviewer** | Fresh subagent every 3 waves | Reads whole modules end to end for cross-module defects such as double-booking, event gaps and duplicate tables |
| **Auditor / planner** | This session, or a successor auditor session per phase with a handoff note | Approves wave briefs before launch. Verifies reviewer independence and that evidence is **CI-of-record**. Verifies fixes; re-runs the money, RLS and migration gates plus one random gate. Signs off waves and phases. Owns the plan, ADRs and ledger statuses. |
| **Humans** | PO, takaful accountant, SSB adviser, client staff, counsel | D00 approvals, errata, golden-number sign-off, data, credentials, UAT, legal and Sharia approvals |

Concurrency: ≤4 agents spawned by the orchestrator at any moment (builders, or reviewer, or fixers). The orchestrator and auditor sessions are separate sessions and are not counted.

### 7.2 Wave lifecycle (artefacts in `docs/plan/waves/Wnn/`)

```
PLANNED → briefs (orchestrator) → BRIEFS APPROVED (auditor: brief-approval.md)
→ BUILDING (≤4 builders) → builder reports
→ REVIEW (fresh reviewer; gates re-run) → review-round-1.md
→ FIX → fix reports → RE-REVIEW → review-round-2.md
→ MERGE to integration branch → CI run of record (GitHub Actions) green
→ AUDIT (auditor checks findings, fixes, CI run IDs) → audit-signoff.md → WAVE CLOSED
```

**Merge policy:** 0 open BLOCKER or HIGH. MEDIUMs go into the ledger with an owning wave. A BLOCKER or HIGH found twice in one WP triggers an integration-reviewer pass and auditor escalation.

**Synchronous audit** (blocking) for W2–W4 (foundations, RLS, events), W6–W7 (system context, fund schema) and every money wave W8–W12 and W16–W21. Elsewhere the auditor samples at least 20% of findings plus all CI runs.

### 7.3 Branch strategy (R1-02)

| Item | Rule |
|---|---|
| Integration branch | The session's designated development branch (or a `build/integration` branch the user designates). Only the orchestrator pushes. |
| Builder branches | Local `wp/<WP-ID>` branches in worktrees, merged locally by the orchestrator in dependency order. Pushing them is optional and only for backup. |
| PRs to `main` | One per phase gate (or per wave train if the client wants weekly drops). Human approval required. Never auto-merged by agents. |
| Locked tests (replaces CODEOWNERS) | Golden and acceptance tests are listed in `tests/golden/MANIFEST.sha256`. Gate G0 fails if any locked file changes without an auditor-signed entry in `docs/plan/test-changes.md`. |
| Generated files | `pnpm gen` output is never hand-edited or committed by builders. The orchestrator regenerates at merge; `gen --check` runs in CI. |
| Repo rename | Only between phases (D00-24), with the remote updated in the same step |

### 7.4 Evidence and independence (R1-07, R1-08)

| Item | Rule |
|---|---|
| Evidence of record | The **GitHub Actions run on the integration branch** (run ID + commit SHA). Agent-written logs in `docs/plan/evidence/` are advisory only. The auditor cites CI run IDs in every sign-off. |
| Golden numbers | Prepared by AI in WP-00-TEST, **signed by the takaful accountant** (fund lifecycle, surplus) and the payroll accountant (payroll control sheet) before the WPs that depend on them. |
| Reviewer model | Where the platform allows, a different model or configuration from the builders. In every case: different context and a fixed checklist. |

### 7.5 Build environment (R1-01)

| Item | Rule |
|---|---|
| No Docker daemon in the session container | Builders use the **container's PostgreSQL cluster** (PG16 installed), with one database per worktree (`createdb wp_<id>`) and setup and teardown scripts from F01. PG17 and Docker image builds and boots (G19) run in **GitHub Actions**. |
| Resources (4 vCPU / 15 GB shared) | Heavy gates (Playwright e2e, k6, ZAP) are serialised by a lock file or run in CI. Builders run unit, property and migration gates locally plus affected e2e only. If wave wall-clock exceeds the plan by more than 30% in W2–W3, move the orchestrator to a larger environment or self-hosted runners. |
| Neon / Vercel | One Neon branch `int/wNN` per wave integration run, after H27 (cloud accounts). Before H27, CI Postgres only. |

### 7.6 Real data (R1-16)

Agents **never** receive unmasked client data. They work on masked samples, synthetic data and schema-only ARIMA metadata. Real-data trial loads and the parallel run are executed by a **human migration operator** through the CI pipeline in the production-isolated project. Only reconciliation reports (aggregates) return to agents.

### 7.7 Failure handling (R1-09)

| Situation | Rule |
|---|---|
| Builder exceeds 1.5× its estimate or stalls | The orchestrator checkpoints its work, then either splits the WP or reassigns it to a fresh builder with a handoff note. |
| Wave completes partially | Completed WPs whose dependants are unaffected may merge after review. The failed WP carries into the next wave and the auditor re-plans. |
| Repeated gate failure (3 times) | Escalates to the auditor. The auditor may change scope via an ADR amendment. |

### 7.8 Cost and operations (R1-10)

| Item | Rule |
|---|---|
| Token budget | A planning placeholder only: about 1–2 M tokens (mostly cache reads) per builder agent-hour, so about 1–1.7 B tokens for P1–P3. **Measure actual use in W1–W3** and set a per-wave budget alarm at 1.5× the measured median. |
| Human operator time | About 2–3 h/day: approvals, credentials, escalations. The orchestrator runs autonomously with scheduled check-ins; 15 h/day is wall-clock agent operation, not human hours. |
| Gate time growth (R1-11) | Wave gate = affected tests + smoke. Full suite nightly and at phase gates. Wave times in §9 include +0.5 h from W12 onward. |

### 7.9 Gate applicability (R1-31)

Gates become mandatory as their harness lands:

| Gates | Mandatory from |
|---|---|
| G0–G4, G6, G18 | W2 |
| G5, G7 | W3 |
| G8 | W3 (F04) |
| G13 | W4 (F10) |
| G11, G12 | W5 |
| G9 | W7 (101) |
| G10, G15 | W7 (F14 / F15) |
| G16 | W5 (F20) |
| G17, G19 | W2 (CI) |

---

## 8. Work packages

The complete catalogue, with scope, README line ranges, dependencies, acceptance tests and hours for every WP, is in **`WP-CATALOGUE.md`**.

Totals in builder agent-hours:

| Group | WPs | Builder-hours |
|---|---|---|
| Pre-build | WP-00-DOC, WP-00-TEST | 14 h |
| Foundation | F01–F21, 119, 122 | 115 h |
| P1 domain | 101–127, 116b, 123a/b, S1–S4 | 153 h |
| P2 | 201–232, 209b, 309, S5–S8 | 195 h |
| P3 | 301–310, S9, plus reactive waves | about 49 + 70 h |
| P4 | — | about 195 h |

---

## 9. Wave schedule (every dependency is merged in an earlier wave; ≤4 builders per wave)

Wave anatomy:

| Step | Time |
|---|---|
| Briefs + auditor approval | 0.75 h |
| Build | 5–6 h |
| Review | 1.25 h |
| Fix | 1.5 h |
| Re-review | 0.75 h |
| Merge + CI of record | 0.75 h |
| **Total** | **about 10–11 h** |

From W12 onward each wave gets +0.5 h for gate growth.

| Wave | Builders | h (nominal) | Cum. | Notes |
|---|---|---|---|---|
| W1 | F01, WP-00-DOC, WP-00-TEST | 6 | 6 | D00-A approved days 1–2 |
| W2 | F02, F03, F05, 119 | 10 | 16 | Masking CLI to the client by day 8 |
| W3 | F04, F08, F13, F17 | 10 | 26 | Sync audit |
| W4 | F07, F09, F10, F19 | 10.5 | 36.5 | Event catalogue v1 frozen; sync audit |
| W5 | F06, F11, F18, F20 | 10.5 | 47 | DS frozen after W5 |
| W6 | F12, F21, F16a, 122 | 10.5 | 57.5 | Needs H27 (cloud accounts); sync audit |
| W7 | F14, F15, F16b, 101 | 11 | 68.5 | **D00-B required for 101**; sync audit |
| W8 | 103, 105, 107, 123a | 11 | 79.5 | Money |
| W9 | 102, 108, 109, 118 | 11 | 90.5 | Money |
| W10 | 104, 106, 110, 111 | 11 | 101.5 | Money; certificate contract frozen; needs H10 for 106 |
| W11 | 112, 114, 116, 124 | 11 | 112.5 | Money; heaviest event wave |
| W12 | 113, 115, 117, 120 | 11 | 123.5 | Money |
| W13 | 116b, 121, 125, 127 | 11 | 134.5 | 121 uses the masked sample if H4 has arrived, else synthetic |
| W14 | 123b, 126, S1, S2 | 11 | 145.5 | |
| W15 | S3, S4 | 8 | **153.5** | **P1 engineering gate** |
| W16 | 201, 204, 206, 208 | 11.5 | 165 | P2 contract freeze; money |
| W17 | 202, 205, 207, 209 | 11.5 | 176.5 | Money |
| W18 | 209b, 210, 212, 220 | 11.5 | 188 | Money |
| W19 | 203, 211, 213, 216 | 11.5 | 199.5 | Money |
| W20 | 214, 221, 223, 232 | 12 | 211.5 | Money; M15 + payroll |
| W21 | 215, 222, 224, 226 | 11.5 | 223 | Money |
| W22 | 217, 225, 227, 228 | 11 | 234 | |
| W23 | 218, 219, 229, 309 | 11 | 245 | |
| W24 | 230, 231, S5, S6 | 11 | 256 | |
| W25 | S7, S8 | 8 | **264** | **P2 engineering gate** (M15 golden run) |
| W26 | 301, 304, 305, 306 | 11 | 275 | 306 needs H18 (P50 30 Nov) |
| W27 | 302, 303, 307, 308 | 11.5 | 286.5 | 307 needs H19 (P50 21 Dec); runs when it arrives |
| W28 | 310, S9 | 6 | **292.5** | **P3 engineering gate** |
| RW1–RW10 | Reactive | about 8 each | about 372 | UAT ×3, pen test ×1, real integrations ×4, trial loads ×2 |
| W29–W40 | P4 | about 11 each | about 130 more | |

**Pacing rule:** release to staging in **weekly trains** (client Scrum clause). Do not let unverified work exceed about 2 weeks of client test capacity.

---

## 10. Timeline

### 10.1 AI engineering

| Phase | Waves | Nominal | Contingency | With contingency |
|---|---|---|---|---|
| P1 | W1–W15 | 153.5 h | Money waves W8–W12 at ×2; others ×1.5 | about 260 h |
| P2 | W16–W25 | 110.5 h | Money waves W16–W21 at ×2; others ×1.5 | about 200 h |
| P3 engineering | W26–W28 | 28.5 h | ×1.5 | about 43 h |
| Reactive | RW1–RW10 | about 80 h | — | about 80 h |
| **P1–P3** | **28 + 10** | **about 372 h** | — | **about 583 h** |
| P4 | 12 | about 130 h | — | about 200 h |

| Operating mode (kickoff Mon 2 Nov 2026) | P1 code-complete | P2 code-complete | P3 engineering |
|---|---|---|---|
| 24 h/day autonomous | about 13 Nov | about 22 Nov | about 24 Nov (306/307 still wait for H18/H19) |
| **15 h/day (base)** | **about 19–20 Nov** (+ up to 8 days if D00-B or H27 stall) | **about 3–10 Dec** | about 6–13 Dec |
| 8 h/day, 5-day weeks | about 18 Dec | about 21 Jan (**misses day 75**) | about late Jan |

**AI engineering is not the critical path at 15 h/day or more. The human gates are.**

### 10.2 Human and client gates (P50 / P90 from kickoff)

| # | Item | Owner | Target | P50 | P90 | Blocks |
|---|---|---|---|---|---|---|
| H0 | D00-A approved | Tech lead + auditor | Day 2 | Tue 3 Nov | Thu 5 Nov | W2–W6 |
| H1 | D00-B approved + golden numbers signed | PO + takaful accountant + SSB adviser | Day 6 | Sun 8 Nov | Mon 16 Nov | W7+ money WPs |
| H2 | Data-sharing agreement | Client legal | P0 | Thu 19 Nov | Thu 3 Dec | H4 |
| H3 | Frankfurt OK for the masked sandbox (written) | Client + counsel | Day 10 | Mon 16 Nov | Mon 30 Nov | Sandbox load |
| H4 | Masked 12-month sample + opening balances | Client IT | Day 14 | **Sun 6 Dec** | Thu 31 Dec (else synthetic) | WP-121, P1 exit |
| H5 | Sample reconciled per fund to the dirham | Client finance + us | Day 30 | Sun 20 Dec | Thu 21 Jan | P1 exit |
| H6 | Fund parameter sheet signed | CFO | Before go-live | Thu 3 Dec | Thu 7 Jan | Go-live |
| H7 | SSB round 1 (fund model, splits, motor/travel) | SSB | — | Thu 17 Dec | Thu 28 Jan | Go-live |
| H8 | SSB round 2 (wording, surplus method, counterparties) | SSB | — | Thu 28 Jan | Thu 4 Mar | Go-live |
| H9 | Legal hosting opinion (widened scope) | Client counsel | Day 60 | Mon 21 Dec | Sun 31 Jan; **if negative: in-country, +8–12 weeks** | Production |
| H10 | 2026 motor decision texts | Client legal | Day 6 | Mon 16 Nov | Thu 10 Dec | WP-106 (W10) |
| H11 | ISA forms, Decision 4/2006, Art. 13 quota | Client compliance | P2 | about 10 Jan | Unknown | M18 (not a go-live blocker) |
| H12 | Payroll rates + 30-employee control sheet | Payroll accountant | P2 | Thu 14 Jan | Thu 11 Feb | M34 go-live |
| H13 | E-signature CA + stamp | Client + CA | Go-live | Sun 31 Jan | Wed 31 Mar | Signed production PDFs |
| H14 | Acquirer contract (Moamalat / LYPAY) | Client + bank | P2 | Sun 31 Jan | Apr 2027 | Live card gateway (go-live can use cash + transfer) |
| H15 | SMS contract + sender IDs | Client IT | P2 | Thu 31 Dec | Thu 4 Feb | Live alerts |
| H16 | National registry / traffic access | Government | P2 | Not by go-live | — | Fallback flag |
| H17 | Orange Card bureau spec | Bureau / GAIF | P2 | Feb 2027 | Unknown | Orange Card stays on ARIMA |
| H18 | **ARIMA access + schema** | Client IT / vendor | Day 1 request | **Mon 30 Nov** | Mon 21 Dec | **Migration (critical)** |
| H19 | Mapping approved by finance | Client finance | — | Mon 21 Dec | Thu 21 Jan | Trial loads |
| H20 | Trial loads 1–3 reconciled (human operator, §7.6) | Us + client finance | — | 7 Jan · 28 Jan · **18 Feb** | TL3 25 Mar | Parallel run |
| H21 | Client FY2026 close (same staff) | Client finance | — | Jan–Feb 2027 | — | Slows H19–H24 |
| H22 | Pen test incl. retest | Independent firm | P3 | Thu 11 Feb | Thu 4 Mar | Go-live |
| H23 | i-text review: full system (≤6k unique keys; 400–600 reviewer-h; 2 FTE from week 3) | Content writers + specialists | Go-live | Thu 25 Feb | Thu 25 Mar | Release gate (**near-critical**) |
| H24 | UAT (5 departments, 2 cycles). **Finance UAT before 20 Dec or after the FY close** | Client staff | Day 90 | Sign-off Sun 7 Feb | Thu 4 Mar | Go-live |
| H25 | 5-day training (about 8 days in Ramadan) + narrated videos | Us + client | P3 | Thu 18 Feb | Thu 11 Mar | Go-live |
| H26 | Parallel run through one month-end | Client finance + us | — | **Thu 8 Apr** | May–Jun | **Cutover** |
| H27 | Cloud accounts + billing from Libya | PO | Day 3 | Thu 12 Nov | Thu 3 Dec | W6 F16a (else CI-only Postgres continues) |
| H28 | Client go-live approval (management + Board) | Client | — | +1 week | — | Go-live |

Calendar assumptions:
- Libyan working week Sun–Thu.
- Public holidays: 24 Dec, 17 Feb, plus Islamic holidays.
- FY = calendar year (Q23, assumed).
- Ramadan 1448 about 8 Feb – 8 Mar 2027 (−30% client capacity); Eid al-Fitr about 9–11 Mar; Eid al-Adha about 16 May.
- All Islamic dates are ±1 day for local moon sighting.

### 10.3 End-to-end milestones

| Milestone | Proposal (day 1 = Mon 2 Nov 2026) | Plan V1 P50 |
|---|---|---|
| P1 code-complete | Day 30 (Tue 1 Dec) | about 20 Nov |
| **P1 exit (all 9 §15.1 criteria)** | Day 30 | **about Tue 22 Dec** (day 51; needs H4, H5, part of H23, client sessions). Tell the client at kickoff. |
| P2 code-complete (simulators) | Day 75 (Fri 15 Jan → Thu 14 Jan) | about 3–10 Dec |
| P2 gate (all §6 ATs on the sample) | Day 75 | about Thu 7 Jan |
| UAT signed | Day 90 (Sat 30 Jan → Thu 28 Jan) | Sun 7 Feb |
| Pen test passed | Day 90 | Thu 11 Feb |
| **Go-live (full migration)** | Day 90 + gates | **P10 Sun 14 Mar · P50 Sun 11 Apr (day 161) · P90 Jun–Sep 2027** |
| Go-live (new business only, ARIMA run-off) | — | Earliest 21 Feb (in Ramadan); recommended Sun 14 Mar |
| Hypercare | 15 days | 11–25 Apr 2027 |
| Warranty | 6 months | to about 11 Oct 2027 |
| P4 sign-off | Months 4–9 | Sep–Oct 2027 (actuary methodology and auditor review dominate; AI engineering about 3 weeks) |
| P5 | Months 9–15 | Counsel-driven; UAE wakala-only fund variant; KSA cooperative variant |

**Critical path (P50):**

1. Kickoff
2. H18 ARIMA schema (30 Nov)
3. H19 mapping (21 Dec)
4. WP-306 / 307 ETL
5. TL1 / TL2 / TL3 (7 Jan → 18 Feb; overlaps the FY close and Ramadan)
6. H26 parallel run through the March month-end (8 Apr)
7. Cutover 8–10 Apr
8. **Go-live Sun 11 Apr 2027**

**Near-critical slack:**

| Chain | Slack |
|---|---|
| i-text review | about 6 weeks |
| SSB round 2 | about 10 weeks |
| Pen test | about 8 weeks |
| UAT and training | about 7 weeks |
| Legal opinion | about 15 weeks, **unless negative**, in which case go-live moves to about Jun–Jul |

---

## 11. Gates

### 11.1 Per wave: `pnpm gate:wave`, re-run by the review agent and by CI of record

| # | Gate | Pass criterion |
|---|---|---|
| G0 | Ownership + locked tests | Diff only in owned paths and migration range; `MANIFEST.sha256` unchanged unless an auditor-signed change exists |
| G1 | Install / generate | `pnpm install --frozen-lockfile && pnpm gen --check` |
| G2 | Typecheck | Strict; a missing `infoKey` is a compile error |
| G3 | Lint | R8 raw HTML; `no-float-money`; `no-hardcoded-rates`; import boundaries (domain has no I/O; no Neon/Vercel SDK in domain or db; no outbound calls outside integrations); no bare `SET` / `db.` |
| G4 | Unit + coverage | domain ≥85%; funds, ledger, surplus and payroll ≥90% |
| G5 | Property | Per-fund TB at 10,000 events; split rounding; inter-fund sum = 0 |
| G6 | Migrations | up → down → up identical; upgrade from the previous wave snapshot; PG16 and PG17 |
| G7 | Schema invariants | RLS ENABLE+FORCE; app role owns nothing and has no BYPASSRLS; `numeric(20,3)`; `sharia_status` NOT NULL + CHECK, no DEFAULT; immutability triggers |
| G8 | RLS matrix | Every role: out-of-scope invisible; writes blocked |
| G9 | Ledger | Cross-fund without reference rejected; closed period rejected; posted immutable; pairing |
| G10 | SoD | Every §9.3 conflict blocked; no self-approval or over-limit approval |
| G11 | Audit chain | `audit:verify` after e2e |
| G12 | Events | Catalogue; contract tests; idempotent replay; out-of-order handling |
| G13 | Content | `content:check --mode=draft` |
| G14 | Semgrep | Platform rules |
| G15 | e2e | Affected + smoke; `ar-rtl`, `en-ltr`, mobile and tablet viewports on key screens |
| G16 | Sandbox egress | No enabled connector in a sandbox build; worker egress allow-list |
| G17 | Stubs + traceability | Stub registry; `[AT-…]` IDs in test titles |
| G18 | Security quick | gitleaks, osv (no High), licence allow-list |
| G19 | Build / portability | Web + worker images build and boot against plain Postgres (CI) |
| Review | Review agent + auditor | 0 open BLOCKER or HIGH |

### 11.2 Phase gates

| Gate | Automated | Human |
|---|---|---|
| **G-P1** | Full suite fresh + upgrade; P1 traceability; ZAP baseline 0 High; sandbox egress (EX-P1-9); masking leak scan; **restore drill (F16b)**; audit chain over the full sample | Per-fund movement reconciliation (EX-P1-6); release-mode content for P1 modules (EX-P1-7); client session (EX-P1-1); demo to management + SSB |
| **G-P2** | All §6 ATs green; KPI golden dataset; reporting role cannot write; M15 golden number; Terraform no drift; ZAP full | Payroll control sheet to the dirham; M15 sample run reviewed by CFO + approving actuary; screenshot baselines approved |
| **G-P3 / go-live** | k6 thresholds; ZAP full 0 High; DR measured (RTO ≤4 h; RPO ≤15 min in-region); release-mode content for all modules; audit verify on staging + a production copy | Pen test 0 open High / Critical; TL3 + parallel run reconciled; SSB rounds 1–2; fund parameters signed; legal opinion; UAT signed; training; client approval |

---

## 12. Acceptance-test traceability (corrected per R2)

| AT | Closing WPs | | AT | Closing WPs |
|---|---|---|---|---|
| M02-1, 2, 5 | 107 (+F19) | | M07-1 | 206 |
| M02-3, 4 | 108 | | M07-2 | 114 (API), 206 (webhook) |
| M06-1, 2, 3 | 112 (+F18) | | M07-3 | 114 |
| M06-4 | 111 + 114 | | M07-4 | 114 + 207 |
| M06-5 | 113 | | M04-1 | 118 (RLS) + 205 (UI) |
| M05-1, 4 | 109 | | M04-2, 3, 4 | 204 |
| M05-2, 3 | 110 (+F15) | | M12-1 | issue 111, collect 114, claim 116b, commission 204. **Full test at the P2 gate** |
| M09-1, 5 | 116 (+F15) | | M12-2 | 208 |
| M09-2 | 116b | | M12-3, 4 | 101–103, 209 |
| M09-3 | 117 | | M28 (all) | 211, 217–219 |
| M09-4 / M10-2 | 202 | | M16-1 | F17, 123a |
| M10-1 | 201 | | M16-2 | 101, 123a |
| M10-3 | 203 | | M16-3 | 216 |
| M11 (3) | 212, 213 | | M15-1 | 214 + S8 (golden run) |
| M34-1, 2 | 221 | | M15-2, 3 | 214 |
| M34-3 | 220 (termination → M01) + 222 | | M15-4 | 214 + 211 |
| EX-P1-1…9 | 126 + G-P1 human items | | M15-5 | 215 + 111 (renewal hook) |

Validator-proposed tests (A-1…41 and those in the B, C and D reports) are mapped into WP briefs by the orchestrator. The auditor checks each brief lists its validator tests.

---

## 13. Multi-agent risks and mitigations

| Risk | Mitigation |
|---|---|
| Schema drift / duplicate tables | Migration ranges; ownership map; near-duplicate-name lint; contracts-only cross-module access |
| Semantic double-booking | D00 ADRs; posting-rule ownership registry; signed golden lifecycle; integration reviewer every 3 waves |
| Event contract drift | Versioned catalogue; contract tests; freeze at wave start |
| Context loss | ≤15k-token briefs; WPs ≤6 h; CLAUDE.md; handoff notes; mandatory README line ranges |
| Test gaming | Locked golden tests (checksum manifest); reviewer diffs all test changes; mutation ≥80% on money domains |
| Forged or optimistic evidence | CI run of record; auditor re-runs critical gates |
| Same-model blind spots | Different reviewer model where possible; fixed checklist; adversarial library; human-signed golden numbers |
| Builder stall | §7.7 |
| Resource contention in the container | §7.5; heavy gates in CI |
| Hallucinated APIs | Pinned versions (Next 16.4, Better Auth 1.7.x, Drizzle 0.45, pg-boss 12, next-intl 4) + doc excerpts in `docs/deps/` |
| Over-production | Weekly trains; pacing rule |
| Secrets / real data | Local and ephemeral credentials only; §7.6; gitleaks |
| Auditor bottleneck | Synchronous audit only on listed waves; successor auditor sessions per phase with handoff notes |

---

## 14. Immediate next actions (P0, from Mon 2 Nov 2026)

| # | Action | Owner |
|---|---|---|
| A-0 | Provide the original Arabic brief; diff it against README §6(a) and §19 | PO |
| A-1 | Approve **D00-A** (days 1–2) and **D00-B** (by day 6). Sign the WP-00-TEST golden numbers | Tech lead + auditor; PO + takaful accountant + SSB adviser |
| A-2 | Request ARIMA confirmation, DB access and schema **on day 1** (H18) | PO → client IT |
| A-3 | Send the data-sharing agreement, fund parameter sheet, opening-balance request and Frankfurt acceptance request | PO |
| A-4 | Commission the widened legal opinion and the motor decision texts | Client counsel |
| A-5 | Get the D00-17 scope deviation signed | PO + client |
| A-6 | Open cloud accounts; confirm billing from Libya (H27) | PO |
| A-7 | Name the i-text reviewers (2 Arabic content FTE from week 3 + specialists) | Client + PO |
| A-8 | Procure the pen-test firm (lead time 4–6 weeks) | PO |
| A-9 | Build session runs W1 once D00-A is approved and the auditor approves the W1 briefs | Orchestrator |
| A-10 | After W3: re-baseline times, tokens and gate durations; publish **Plan V2** | Auditor |
| A-11 | Confirm client facts (founding year, capital paid, products, ARIMA, GWP) and plan workshops for BPMN workflow maps | PO |

---

## 15. Red-team disposition (wave 3)

| Report | Findings | Applied in this V1 |
|---|---|---|
| R1 feasibility (`validation/R1-redteam-feasibility.md`) | 4 BLOCKER, 15 HIGH, 14 MED, 6 LOW | **All BLOCKERs resolved:** R1-01 (§7.5), R1-02 (§7.3), R1-03 (D00-A/B split), R1-04/05 (wave table rebuilt; every dependency now in an earlier wave). **HIGH resolved:** R1-06 (precedence note), R1-07/08 (§7.4), R1-09 (§7.7), R1-10/11 (§7.8), R1-12 (H23), R1-13…15 (WPs 209b, 309, 310; F16b restore drill; 231 UAT scripts), R1-16 (§7.6), R1-17 (D00-01 written basis), R1-18 (D00-09 SSB), R1-19 (this section). **MEDIUM / LOW applied:** R1-20 (×2 money contingency; 220 size watch), R1-22 (target vs P50 columns), R1-23 (D00-02), R1-24 (D00-03), R1-25 (D00-25…28), R1-26 (PG matrix), R1-27 (successor auditors), R1-28 (§12), R1-29 (P1 exit day 51; finance UAT window), R1-30 (generated files), R1-31 (§7.9), R1-32 (WPs 224, 116, 216, F09), R1-33 (P10 → 14 Mar), R1-34 (day 161; day 75/90 weekdays; wave count), R1-35 (holidays), R1-36 (D-16 regrade recorded), R1-38 (concurrency note), R1-39 (M07). R1-21 (stalls) reflected in §10.1. R1-37 (naming): reactive waves renamed RW1–RW10. |
| R2 traceability (`validation/R2-traceability.md`) | 491 README rows: 61% explicit, 24% via brief line ranges, 3% changed by decision, 6% partial, 6% not covered (24 gaps) | All 24 gaps assigned in `WP-CATALOGUE.md`: product lines WP-232; payables / FA / budgets 209b; security monitoring 309; responsive UI F08 / F09 / G15; access review F12; CSP / CSRF / rate limits F11 / F12; break-glass F16b; key rotation F19; retention F13 / F06; recurring journals 103; FX revaluation 209; zakat 216; Art. 22 registers 224; statutory payroll returns 222; P1 cession backfill 201; BPMN maps A-11 + 229; UAT scripts 231; runbooks / warranty / weekly report 310; LC role paths and `search_log` 122; schema docs F03; Q10 → errata 19. Partials: E-27 → 123a in W8; E-48/49 → F12; P1 claim payment → 116b; M06 renewal-credit hook → 111 / 215; M33 size watch → 220. AT table corrected (§12). README line ranges are now mandatory per WP. |

**Residual risks the auditor accepts for V1:** all estimates are modelled; Libyan legal texts are partly UNVERIFIED (paywalled sources); P90 depends on the outcome of the hosting opinion. All three are re-assessed in Plan V2 after W3.
