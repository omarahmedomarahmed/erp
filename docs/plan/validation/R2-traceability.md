# R2 — Traceability and coverage audit: README.md → PLAN-V1

| Item | Value |
|---|---|
| Auditor | R2 traceability / coverage (red team, wave 3) |
| Date | 2026-10-28 |
| Inputs read in full | `README.md` (L1–1160), `docs/plan/PLAN-V1.md` (L1–517), `validation/E-consistency.md`, `validation/A…D` (all flags), `AGENT-PROTOCOL.md` §1, §2, §5 A-5, §6 gate catalogue, App. X; `findings-ledger.md` |
| Question | Is every README line covered by a PLAN-V1 work package (WP), D00 decision, erratum, gate or human gate (H), or explicitly deferred or changed? |
| Edits made | None to PLAN-V1 or the README. This file is the only output |

## 0. Method and status codes

- Each README row is mapped to the **most specific** PLAN-V1 artefact: WP (`F01`…`F21`, `101`…`127`, `201`…`231`, `301`…`308`, P4 chains), D00-nn, errata #n (§6), gate (G0–G27, G-P1/2/3), H-item (§10.2), action A-n (§14), or the §4 consolidated flag (B1–B11, H1–H14).
- PLAN-V1 §8.3/§8.4 describe WPs in 3–6 words. AGENT-PROTOCOL A-1 item 1.6 requires every brief to cite README **line ranges covering the module's (a)–(e)**. So a feature that is inside a module's §6 section is covered *implicitly* when its module has an owning WP, even if PLAN-V1 never names the feature. Those rows are marked **I**. They are safe only if the brief author copies the full line range.

| Code | Meaning |
|---|---|
| **C** | Covered explicitly: PLAN-V1 names the item or an artefact that clearly contains it |
| **I** | Covered implicitly: the owning module has a WP, but PLAN-V1 does not name the item. It relies on the brief's README line range |
| **D** | Explicitly deferred or changed by D00, errata or the phase plan (an approved deviation) |
| **P** | Partially covered: some of the requirement is assigned, some is not |
| **NC** | NOT COVERED: no WP, D00, erratum, gate or H-item owns it |

---

## 1. Coverage matrix

### 1.1–1.2 Product and fixed decisions (README L32–59)

| README ref | Item | Plan coverage | St |
|---|---|---|---|
| 1.1 Name | Working name; "not called an ERP" | D00-24, errata 1, A-0 | C |
| 1.1 First client | Client profile, products, ARIMA "very likely" | H18 / A-2 (ARIMA only). Client facts (D-18: GWP, product list, founding date, §20 "ARIMA" stated as fact) not in errata | P |
| 1.1 Later clients | Country rules as rule-pack data | F13 rule-pack loader; P5 (§10.3) | C |
| 1.1 Sources | Arabic proposal, research, HR | A-0 (Arabic-brief diff) | C |
| D1 | One codebase, config per client | F13 | C |
| D2 | Own Neon + Vercel project per client | F16a/F16b, D00-20 (now also prod / non-prod split) | C |
| D3 | Modules on/off; M32 | F13 switchboard; 123 (M32) | C |
| D4 | "i" on every component | F08, F10, 124/125, D00-22 (scope narrowed) | C |
| D5 | Learning Center + smart search | 122, F19 | C |
| D6 | Per-module access, maker-checker, SoD | F12, F15, G8, G10 | C |
| D7 | Arabic-first RTL, Hijri, LYD 3 dp, multi-currency | F05, F08, F10, D00-21; Hijri variant (M00 verdict, C-27/D-07). Multi-currency **revaluation** not named | C |
| D8 | Own TS stack | F01 | C |
| D9 | Strong security | §13 rows below | C |
| D10 | Masked sandbox, no message to a real person | 119–121, F16b egress, F20, G16, G22 | C |
| D11 | All 12 modules + HR/payroll | §8.3–8.4 | C |
| D12 | Own takaful logic; no SaaS holding data | Errata 15 rewords D12 (C-23). Power BI Service conflict (B-40) not addressed | P |

### 2. Build instructions (L63–96)

| README ref | Item | Plan coverage | St |
|---|---|---|---|
| 2.1 | Milestone order; in-WP order migration→…→e2e | §7.1 builder role; §9 waves | C |
| DoD 1 | Reversible migration in CI | F03 (dbmate), G6 | C |
| DoD 2 | Domain + unit; property tests for funds | G4, G5 | C |
| DoD 3 | Server permission check per route | F12 `defineRoute`, G8 | C |
| DoD 4 | RLS + test per role | F04, G7, G8 | C |
| DoD 5 | `infoKey` + AR/EN text | F08, F10, G2, G13 | C |
| DoD 6 | Learning Center lesson | G13 (`learning:check`), 122 | C |
| DoD 7 | Audit events for every write | F06, G11 | C |
| DoD 8 | No hard-coded rates | G3, G14, G27 | C |
| DoD 9 | AR RTL + EN Playwright screenshots | G15 | C |
| DoD 10 | `numeric(20,3)` + decimal lib | F03, F05, G7, D00-21 | C |
| DoD 11 | e2e for main workflow | G15 | C |
| R1 | One fund per posting | 101, G9 | C |
| R2 | Posted journals immutable | D00-04, G9 | C |
| R3 | Mandatory `sharia_status` | F17, D00-07, G7 | C |
| R4 | Plain PG; Docker | G19, D00-20 (PG17 runtime / PG16 floor) | C |
| R5 | Long jobs in worker | F07, G14 | C |
| R6 | Outbound via M30; sandbox mailbox | F20, G16 | C |
| R7 | Versioned, effective-dated rules | F13, G27 (ADR-007 in protocol) | C |
| R8 | No raw HTML controls | F08, G3 | C |

### 3. Stack and repository (L100–156)

| README ref | Item | Plan coverage | St |
|---|---|---|---|
| 3.1 Language | TS strict | F01 | C |
| 3.1 Web + API | Next.js on Vercel | F01, F16a | C |
| 3.1 UI | Radix + Tailwind logical props | F08, F09 | C |
| 3.1 i18n | next-intl, Arabic default | F10 | C |
| 3.1 Database | PG16 on Neon | D00-20 (changed: PG17 runtime) | D |
| 3.1 Data access | Drizzle + hand SQL | F03, H3 (dbmate + Drizzle pull) | C |
| 3.1 Validation | Zod shared | F01 (WP-00 contracts in protocol) | C |
| 3.1 Money | `numeric(20,3)` + decimal.js | F05 | C |
| 3.1 Dates | Temporal + Hijri | F05 | C |
| 3.1 Authentication | Better Auth, TOTP, passkeys | F11 | C |
| 3.1 Job queue | pg-boss | F07 | C |
| 3.1 Worker | Docker container, same region | F07, F16a (ECS, D00-20) | C |
| 3.1 PDF | Chromium; PAdES per tenant | F18, H4/H13 | C |
| 3.1 Object storage | S3 per tenant, tenant key | F16a | C |
| 3.1 Search | FTS + trgm + normaliser + synonyms | F19 | C |
| 3.1 Dashboards | ECharts + read-only role/replica | 217–219; G-P2 "reporting role cannot write" | C |
| 3.1 Testing | Vitest, fast-check, Playwright, k6 | G4, G5, G15, G20, 301 | C |
| 3.1 CI/CD | GitHub Actions; per-tenant migrations | F02, F16b | C |
| 3.1 IaC | Terraform | F16a/F16b | C |
| 3.2 | Repository layout | F01 (renamed `takafultech/`, D00-24); `docs/` runbooks not assigned | C |

### 4. Platform-wide rules (L160–174)

| Area | Plan coverage | St |
|---|---|---|
| Fund separation by DB constraints | 101, D00-04, G9 | C |
| Sharia status | F17, D00-07 | C |
| Maker-checker (financial, product, rule, access, HR/payroll) | F15, G10 | C |
| Audit: hash chain, who/when/before/after/IP/device | F06 (IP/device capture not named) | C |
| "i" icon | F08 | C |
| Versioning (rules, products, workflows, templates, tax tables) | F13, 105, F18, F15 (templates and workflows implicit) | I |
| Language: Arabic prevails; documents bilingual | F18 | I |
| Currency fields on every money line | F05 "FX line" | C |
| Numbering gap-free; border-point blocks | F17, D00-16, 118 | C |
| Soft limits per role | F12 | C |
| Data retention configurable, default 10 y (Q24) | Nothing. No WP, no H-item, no D00 | **NC** |

### 5. Fund model (L178–236)

| README ref | Item | Plan coverage | St |
|---|---|---|---|
| 5.1 | Three funds, holds/pays | 101 | C |
| 5.1 | Articles: shareholders get nothing from surplus | 214, D00-02 | C |
| 5.2 | Split tabarru' / Wakala / investment | 102, 105, D00-01, D00-09 | C |
| 5.2 | Sum = 100.000%; SSB-approved only; `illustrative` | X23, G27, D00-07 | C |
| 5.2 | Wakala cap per rule pack | 102 / 204 | I |
| 5.3 | `WAKALA_FEE` | 102, D00-01 | C |
| 5.3 | `MUDARIB_SHARE` | 212/213 | I |
| 5.3 | `QARD_DRAW` (CFO + SSB) | D00-03; the approval UI and workflow have no named WP (101/102 or 214) | P |
| 5.3 | `QARD_REPAY` | 214 | C |
| 5.3 | `SURPLUS_ALLOC` | D00-03, 214 | C |
| 5.3 | `EXPENSE_RECHARGE` blocked by default | D00-09 (levy) | I |
| 5.3 | Due-to / due-from + cash settlement | D00-03 `SETTLEMENT` | C |
| 5.4 | Six DB guarantees | D00-04, 101, G9 | C |
| 5.5 | Worked example | Errata 2 / D00-01 (rewritten) | D |
| 5.6 | Core tables | 101, 103, 214; ownership D00-15 / E §3 | C |

### 6.1 M02 CRM (L244–274)

| Ref | Item | Plan coverage | St |
|---|---|---|---|
| (b) | Unified record, party types | 107, D00-15 | C |
| (b) | Personal/company data; bank accounts encrypted | 107, F19 | I |
| (b) | Official documents + expiry alerts | 107 (M02-5) | C |
| (b) | Policy history / claim history on 360° | 108 (M02-4) | C |
| (b) | Tracking logs / History tab | 108, F06 | C |
| (b) | Digital identity link + fallback flag | 107; 226 (simulator); H16 | C |
| (b) | Duplicate prevention + merge with maker-checker | 107; B-31 (verdict) | C |
| (b) | Fraud flags → compliance alert | 107. No P1 consumer; 223 in P2 | I |
| (c) | KYC levels by risk; beneficial owners; PEP flag | Not named. 107 | I |
| (c) | Sanctions/PEP screening (M17) | 223 (D-15 lists) | C |
| (c) | Consent record + correction requests (Law 6/2022) | Errata 8 fixes the citation. D-01 consent fields (purpose, refusal, notice) not assigned | P |
| (c) | AML CDD (Res. 1013/2017) | 107 / 223 | I |
| (e) 1–5 | Acceptance | §12: 107, 108, F19 | C |

### 6.2 M06 Policy issue and renewal (L276–306)

| Ref | Item | Plan coverage | St |
|---|---|---|---|
| (b) | Issue from accepted quote | 111 | C |
| (b) | Smart templates, SSB-approved wording | F18. The SSB approval register needed in P1 is not scheduled before 105/106 (E-27) | P |
| (b) | PDF on approval; PAdES; stamp; QR verification page | 112, F18, H4, H13 | C |
| (b) | Auto-renewal manual/offer/auto; re-rate on current version | 111 (+114 for "on payment") | C |
| (b) | Daily expiry scan at tenant time, N days | 112, B-05 (≤N + idempotency) | C |
| (b) | 30-day alert e-mail/SMS; delivery log; sandbox mailbox | 112, F20, H15 | C |
| (b) | Endorsements, pro rata | 111; `EndorsementIssued` (D00-11) | I |
| (b) | Cancellation refund rule; refund via M07 | 111 + 114; `WAKALA_FEE_REVERSAL` (D00-01) | C |
| (b) | Policy register (Art. 22) | Not assigned to any WP | **NC** |
| (c) | Membership certificate; split rule ID + `sharia_status` on certificate | 111, F17 | I |
| (c) | IFRS 17 data from day 1 | 111 (ADR-012 / A-12 list) | C |
| (c) | Compulsory covers (Law 28/1971; Res. 315/2026) | 106 (motor); H6, H10; Res. 315 templates have no WP | P |
| (e) 1–5 | Acceptance | §12: 111–114 | C |

### 6.3 M05 Underwriting (L308–335)

| Ref | Item | Plan coverage | St |
|---|---|---|---|
| (b) | Risk questionnaires per product | 109 | I |
| (b) | Versioned rules engine; test-mode simulation | 109, D00-18 | C |
| (b) | Rating tables from M03 | 105/106 | C |
| (b) | Instant decision < 2 s | 109, D00-23 | C |
| (b) | Approval Matrix routing by product/branch/SI/rule → role + limit | 110, F15, D00-14 | C |
| (b) | Alerts: task inbox, SLA, escalation | F15, 110 | C |
| (b) | Decision record | 109 | I |
| (c) | Gharar check; SSB-approved products; medical data encrypted | 109, F19 (Gharar never named) | I |
| (e) 1–4 | Acceptance | §12: 109, 110 | C |

### 6.4 M09 Claims (L337–371)

| Ref | Item | Plan coverage | St |
|---|---|---|---|
| (b) | Six stages with entry/exit actions | 116, D00-19 | C |
| (b) | Strict transitions + DB enforcement; Rejected/Reopened | D00-19, X9 | C |
| (b) | 5-working-day SLA; at-risk dashboard; escalation day 3/4 | 117, D00-19 (configurable) | C |
| (b) | Customer notified at each stage; timeline | 116/117 + F20 | I |
| (b) | Recoveries: third party, salvage, subrogation | 116 (`claim_recovery`), not named | I |
| (b) | Stage 3 surveyor **mobile** screen with photos | 117 (no responsive/mobile requirement anywhere in the plan; see §19 "responsive UI") | P |
| (b) | Stage 5 payment from PTF | D00-13 single-payment disbursement; **no WP named** for the disbursement (116 or 103?) | P |
| (c) | PTF only; case OCR (Art. 15) | D00-13, 116 | C |
| (c) | Retakaful recovery on approval | 202, D00-12 (P1 stub `retakaful_pending`) | C |
| (c) | IFRS 17 LIC data | 116 (ADR-012 field list) | I |
| (c) | Fraud indicators to M17 | 223 | I |
| (e) 1–5 | Acceptance | §12: 116, 117, 202 | C |

### 6.5 M10 Retakaful (L373–400)

| Ref | Item | Plan coverage | St |
|---|---|---|---|
| (b) | Treaty register (QS, surplus, XoL per risk/event, layers, reinstatements, stop loss) | 201, D00-12 | C |
| (b) | Facultative offer → cession (ICIEC) | 203 | C |
| (b) | Automatic cession on issue | 201. **No backfill rule** for certificates issued in P1 before M10 exists (E §1 M10 note). D00-13 backfills claims only | P |
| (b) | Automatic recovery on approval | 202, D00-12 | C |
| (b) | Claim reports / cash calls | 203 | I |
| (b) | Monthly bordereau + statement + reconciliation | 203 | C |
| (b) | Counterparty register, ISA registration (Dec. 374/2026) | 201, errata 9 | I |
| (b) | Compulsory local cession (Art. 13) | 201; H11 (quota) | I |
| (c) | PTF postings; SSB approval for conventional; IFSB-18; IFRS 17 held | 201–203, ADR-012 | I |
| (e) 1–3 | Acceptance | §12: 201, 202, 203; errata 6 (AT-2 limit) | C |

### 6.6 M07 Contributions and billing (L402–431)

| Ref | Item | Plan coverage | St |
|---|---|---|---|
| (b) | Billing plans; instalment schedule | 114 | C |
| (b) | Direct or scheduled (standing order) | 207 | C |
| (b) | Gateways: local card, transfer, Stripe, PayPal, cash | 206, D00-17, errata 7, H14 | D |
| (b) | Instant receipt via webhook; no human step | 206 (M07-1), D00-23 | C |
| (b) | Allocation; overpayment as credit | 114 | I |
| (b) | Dunning, grace, lapse | 207 | C |
| (b) | Refunds with maker-checker | 114 | I |
| (b) | Daily cash-up + deposit reconciliation | 114 (not named) | I |
| (b) | Bank reconciliation (import, auto-match, exceptions) | 207 | C |
| (b) | Pay-by-link (B-03 addition) | 206 | C |
| (c) | Split by certificate's rule; bank accounts per fund; Art. 23; no riba, late fee to charity | 102, 114, D00-06 | C |
| (e) 1–4 | Acceptance | §12: 114, 206 (M07-4 mapping wrong; see §4) | C |

### 6.7 M04 Agents and brokers (L433–461)

| Ref | Item | Plan coverage | St |
|---|---|---|---|
| (b) | Register incl. ISA licence, authorised products | 118 | C |
| (b) | Agent dashboard (own data only) | 205 | C |
| (b) | Tiered commission + KPI multipliers | 204; D00-17 (Dec. 88/2026 override), H6 | C |
| (b) | Targets with maker-checker | 204 | I |
| (b) | Monthly run, statement, clawback | 204 | I |
| (b) | Anti-manipulation (collected only, locked tiers, audited overrides) | 204 | I |
| (b) | Payment via M07/M12 | 204 (`CommissionRunApproved` → M07 not added; B-34) | I |
| (b) | Number blocks | 118, D00-16 | C |
| (c) | SHF only; Wakala-incl.-commission cap; AML of agents | 204 (M04-4), 223 | I |
| (c+) | Agent net remittance mixes funds (B-26) | PLAN §3 M04 verdict says "resolve in WP brief"; no D00. Covered only by AGENT-PROTOCOL ADR-002 | P |
| (e) 1–4 | Acceptance | §12: 118, 204, 205 | C |

### 6.8 M12 Accounting (L463–493)

| Ref | Item | Plan coverage | St |
|---|---|---|---|
| (b) | Double entry; per-fund balance | 101, 103 | C |
| (b) | Automatic journals (issue, collect, claim, commission, others) | 103 + producer WPs (111, 114, 116, 204, 201, 221, 213) | C |
| (b) | Posting rules mapping | 103; "posting-rule ownership registry" W8 | C |
| (b) | One-click BS / IS / TB per fund, combined, branch, class; PDF + Excel | 104 (TB), 208 (BS/IS) | C |
| (b) | FAS 42 presentation; FAS 43 recognition | D00-10, errata 4 | D |
| (b) | Per-fund CoA; manual journals (maker-checker) | 103/104 | I |
| (b) | **Recurring journals; accruals; multi-currency revaluation** | Not named. ADR-006 covers balancing only | **NC** |
| (b) | Period close checklist; closed periods locked | 209; 101 trigger | C |
| (b) | **Payables: supplier register, expense invoices, payment runs, budgets vs actual** | README §15 lists "M12 … payables" as a P2 deliverable (L941). PLAN 208–209 = "statements + close" only | **NC** |
| (b) | **Fixed assets register + depreciation** | Not in any WP | **NC** |
| (b) | Bank accounts per fund; reconciliation with M07 | 207; E §3 ownership | I |
| (c) | Accounts per class (Art. 23) | 103 (dimension) | I |
| (c) | Annual returns via M18 | 224 | C |
| (c) | Technical reserve postings (M13) | 210 | C |
| (c) | IFRS 17 view (M14) | P4 chain | D |
| (c) | Zakat calculation support (M16) | Not in any WP | **NC** |
| (c+) | Combined-statement inter-fund elimination (A-23) | M12 verdict only | I |
| (e) 1–4 | Acceptance | §12: 101–103, 208 (M12-1 mapping incomplete; see §4) | C |

### 6.9 M28 Dashboards and reports (L495–542)

| Ref | Item | Plan coverage | St |
|---|---|---|---|
| (b) | Built-in dashboards respecting RLS | 217–219 | C |
| (b) | Metabase / Power BI read-only role + `rpt_*` views + connection guide | 217; G-P2. Power BI SaaS vs D12 (B-40) not decided | P |
| (b) | Hourly `kpi_snapshot` + drill-down | 217 | I |
| (b) | Exports logged | 217–219 | I |
| KPI 1–24 | 24 KPIs | 211 (KPI dictionary), 217 | C |
| Dash 1–12 | 12 dashboards | 218–219 | C |
| (e) | 24 KPIs, 12 dashboards, hourly, read-only | §12: 211, 217–219 | C |

### 6.10 M16 Sharia compliance (L544–573)

| Ref | Item | Plan coverage | St |
|---|---|---|---|
| (b) | `sharia_status` on every contract/transaction | F17, D00-07, G7 | C |
| (b) | Status rules; manual change by SSB with reason | D00-07 (`sharia_status_event`), F17, 123 | C |
| (b) | No-mixing algorithm; exceptions logged | 101, 123 (M16-2), X1 | C |
| (b) | SSB reporting engine | 216 (named "governance + certificates"; reporting engine implicit) | I |
| (b) | Annual approval workflow | 216, F15 | I |
| (b) | Compliance certificates PDF signed by SSB | 216 (M16-3), F18 | C |
| (b) | Governance: members, meetings, resolutions; approvals link | 216 (P2). The minimal register needed by M03/M24/M05 in P1 (E-27) is not scheduled | P |
| (b) | Internal Sharia audit per branch | 216; D-13 (optional until texts arrive) | I |
| (b) | Purification to charity with SSB approval | D00-06 | I |
| (b) | **Zakat on shareholders' funds** | Not named in any WP | **NC** |
| (c) | Standards (AAOIFI SS 26, IFSB-8) | Briefs | I |
| (e) 1–3 | Acceptance | §12: F17, 123, 101, 216 | C |

### 6.11 M15 Surplus (L575–609)

| Ref | Item | Plan coverage | St |
|---|---|---|---|
| Steps 1–6 | Formula | 214, D00-02, errata 3 | C |
| Step 7 | Deficit → Qard (maker-checker + SSB) | 214, D00-03 | C |
| Step 8 | Repay Qard first | 214 (M15-3) | C |
| Step 9 | Solvency test before/after | 211, 214 (M15-4) | C |
| Step 10 | Retention % (default 0) | 214 | I |
| Step 11 | 100% to participants; other packs configurable | 214; P5 (D-17 `SURPLUS_TO_SHAREHOLDERS` only in protocol ADR-002) | I |
| Step 12 | Pro rata by contribution; eligibility rules | D00-02 (basis), 214 | C |
| Step 13 | Individual statements (PDF) | 215 | C |
| Step 14 | Voucher or renewal discount | 215 (voucher). **Renewal-credit application inside M06 at renewal** has no P2 WP. M06 code is owned by 111/112 (P1) (E-08) | P |
| Step 15 | CFO → actuary → SSB → Board | F15 capabilities, D00-08 | C |
| (e) 1–5 | Acceptance | §12: 214, 215; S8 golden run | C |

### 6.12 M11 Investments (L611–631)

| Ref | Item | Plan coverage | St |
|---|---|---|---|
| (b) | Portfolios per owning fund | 212 | C |
| (b) | Murabaha, Mudaraba, Ijara + deposits, sukuk, equities | 212/213; errata 5 (FAS 28/32/33/30) | I |
| (b) | Tracking (capital, accrued/realised profit, maturities, valuation) | 212/213 | I |
| (b) | Return distribution, Mudarib share; Wakala investment fee | 213, D00-03 (`INVESTMENT_WAKALA_FEE`) | C |
| (b) | Sharia screening; purification | 212/213, D00-15 (`inv_sharia_screening`) | I |
| (b) | Performance reports | 213 (AT) | C |
| (b) | Art. 16 assets in Libya (Libyan-bank deposit) | Errata 5; D-22 verdict | C |
| (e) | Murabaha schedule; Mudarib share to SHF; per-fund report | §12: 212, 213 | C |

### 7. HR and payroll (L635–672)

| Ref | Item | Plan coverage | St |
|---|---|---|---|
| 7 intro | All payroll postings to SHF; rates confirmed (Q27) | 221 (AT), H12 | C |
| 7.1 Organisation | Branches, departments, positions, cost centres | 118 (master) / 220 | I |
| 7.1 Employee record | Encrypted IDs, documents with expiry alerts | 118, F19 | I |
| 7.1 Contracts | Versioned employment contracts | 220 | I |
| 7.1 Lifecycle | Hire creates / termination disables the M01 user the same day | 220; `EmployeeHired` (D00-11); `EmployeeTerminated` | C |
| 7.1 Attendance | Manual or device import, overtime, lateness | 220 (not named) | I |
| 7.1 Leave | Types, entitlements from rule pack, approvals, balances | 220 (not named) | I |
| 7.1 Loans/advances | Interest-free `staff_advance` via payroll | D00-15 rename; 220/221 | I |
| 7.1 Performance | Objectives and appraisal | 220 (not named) | I |
| 7.1 End of service | Configurable formula (by nationality, D-06) | 220; M33 verdict | I |
| 7.1 Self-service | Payslips, leave balance, requests | 220/222 | I |
| 7.1 Reports | Headcount, turnover, leave, document expiry | 220 | I |
| 7.1 Capacity | 10 feature rows in one 4–6 h WP (220) | Under-sized (see §2) | P |
| 7.2 Pay components | Basic, allowances, overtime, bonuses, deductions | 221 | C |
| 7.2 Payroll run | calc → review → maker → checker → lock (+ CFO final, §9.2) | 221, F15. The §7.2 vs §9.2 CFO-step conflict (E-49) is not fixed | P |
| 7.2 Statutory deductions | SS, income tax, versioned tables | 221, errata 9/10, ADR-016, H7 | C |
| 7.2 Payslips | Bilingual PDF + self-service | 222 | I |
| 7.2 Bank file | Salary transfer file per bank format | 222 / 226 (E-44) | I |
| 7.2 Accounting | SHF journal by cost centre | 221 | C |
| 7.2 **Statutory reports** | SS (INAS) and tax return data (D-05) | Not named in any WP | **NC** |
| 7.2 Retro and corrections | Recalculated in the next run | 221 | I |
| 7.2 Security | HR-only visibility; encrypted salaries; maker-checker | F19, G8 (X14), F15 | C |
| 7.2 `sharia_status` | On every payroll run | F17 registry | I |
| 7.2 Acceptance | 30 employees to the dirham; SHF only; termination disables login | §12: 221, 222, 118 (mapping wrong; see §4); H12 | C |

### 8. Platform and supporting modules (L676–700)

| Module | README content | Plan coverage | St |
|---|---|---|---|
| M00 | Branding, languages, module switch + dependency check, rule-pack version, calendar, currencies | F13 (branding/visual identity not named) | C |
| M01 | Users, roles, levels, scopes, limits, MFA, sessions, **access reviews** | F11, F12. Access reviews not in any WP | P |
| M03 | Products without code; SSB approval; versioned | 105, 106, H7 | C |
| M03 (scope) | Client product lines: comprehensive motor, property/general, marine, Hajj/Umrah, Res. 315/2026 lines, Q7 2026 products | 106 seeds **motor TPL + travel only**. D00-17 keeps only family, health and export credit on ARIMA. **No WP configures the other lines that go live** | **NC** |
| M08 | Fund engine | 101, 102 | C |
| M13 | UCR, OCR, IBNR, fluctuation, Art. 15 floors, actuary sign-off | 210 (M13-lite, P2); full in P4 | D |
| M14 | Data capture P1; engine P4 | 111 (ADR-012); P4 chain (7 WPs). Event retention / backfill for M14 (A-12) not decided | C |
| M17 | Screening, scoring, alerts, STR, complaints | 223 (complaints not named) | I |
| M18 | Art. 24 returns, per-class accounts, Libyan-asset statement, levy | 224, D00-09, H11 | C |
| M19 | Art. 17 margin, stress tests, surplus gate | 211 (basic); P4 full | C |
| M20 | Family takaful | P4 (4 WPs); D00-17 stays on ARIMA | D |
| M21 | Medical / health | P4 (4 WPs); D00-17 | D |
| M22 | 60-s motor, Orange Card, travel at border, offline PWA | 113 (online); 227 (Orange Card online simulator); offline → P4 (D00-17). Orange Card **claims / inter-bureau** flow (B-16) not assigned | P |
| M23 | Export credit | P4 (2 WPs); D00-17 | D |
| M24 | Templates, SSB wording, versions | F18 | C |
| M25 | Agent dashboard P2; customer portal P4 | 205 (moved to M04); P4 (2 WPs); pay-by-link 206 | D |
| M26 | State machines, approval matrix, SLA, inbox; designer P4 | F15; P4 (2 WPs) | C |
| M27 | Append-only hash chain; daily verification | F06, 123 (UI) | C |
| M29 | "i" engine + Learning Center | F10, 122, 124/125, 229/230 | C |
| M30 | Integration hub | F07, F20, 225, 226 | C |
| M31 | Migration and sandbox | 119–121; 306/307 | C |
| M32 | Module request and change | 123 | C |

### 9. Access model (L704–757)

| Ref | Item | Plan coverage | St |
|---|---|---|---|
| 9.1 | Levels 0–5; Level 0 → 404 | F12, X16 | C |
| 9.1 | Level 4 change needs a second admin | F12/F15 | I |
| 9.1 | Level 5 has no financial rights | G10, X13 | C |
| 9.1 | Scopes: branch, fund, class, agent | F12, F04 | C |
| 9.2 | Default role template (19 roles) | F12, AGENT-PROTOCOL App. Y, D00-08 (+8 roles), errata 12 | C |
| 9.2 | Every module has View/Maker/Checker/Admin holders (E-48) | D00-08 adds roles but assigns no module levels for M08, M10/M13/M17/M19 checkers, M18 maker, M22, M24, M26–M32 | P |
| 9.3 | Seven SoD conflicts | G10, X11–X13, D00-08 | C |
| 9.4 | GUCs, ENABLE + FORCE RLS, app role owns nothing, migration role, per-role tests | F03, F04, G7, G8 (ADR-009 in protocol) | C |

### 10. "i" icon and Learning Center (L761–798)

| Ref | Item | Plan coverage | St |
|---|---|---|---|
| 10.1 Coverage | Every screen, field, button… | F08, F10; D00-22 (scope narrowed to in-app UI) | D |
| 10.1 Enforcement | Compile error; lint; CI; release gate | F08, F10, G2, G3, G13 | C |
| 10.1 Key format | `module.screen.element`; `err.*` | F10 (E-32 namespace not decided) | I |
| 10.1 Dialog | ≤80 words, 5 parts | F10 schema, G13 | C |
| 10.1 Display | "i" icon, keyboard, Help mode | F08 | C |
| 10.1 Storage | YAML → `help_item`; tenant overrides | F10 (tenant overrides not named) | I |
| 10.1 Fields | Field list incl. review_type, status, version | F10 (protocol help schema) | C |
| 10.1 Auto-draft | Draft from data dictionary; badge in sandbox only | F10 | C |
| 10.1 Review | Reviewer roles per domain | H23, A-7, D00-08 (content reviewer) | C |
| 10.2 Structure | Course per module: overview, glossary, diagrams, rules, tasks, quiz | 122, 124/125, 229/230 | I |
| 10.2 **Role paths** | "New border clerk", etc. | Not named | **NC** |
| 10.2 Visibility | Disabled modules' courses hidden | 122 | I |
| 10.2 Progress | Scores; **managers see their team** | 122 (team view not named) | I |
| 10.2 Videos | One per main workflow | 308, H25 | C |
| 10.2 Manuals | PDF export per course | 308 | C |
| 10.3 Arabic variants | Normaliser | F19 (`ar_norm()`) | C |
| 10.3 Typos | pg_trgm | F19 | C |
| 10.3 Synonyms | Table-driven | F19 | C |
| 10.3 English | FTS + stemming | F19 | C |
| 10.3 Scope | i texts, lessons, glossary, rules, screens, workflows | 122 | I |
| 10.3 Results | Grouped; jump to screen if allowed | 122 | I |
| 10.3 **`search_log`** | Zero/poor results reviewed weekly | Not in any WP or H-item | **NC** |

### 11. Integrations (L802–818)

| Connector | Plan coverage | St |
|---|---|---|
| Public REST API (OpenAPI, OAuth2 client credentials, keys, rate limits) | 225 | C |
| Payment gateways | 206, D00-17, H14 | C |
| Banks: statement import / salary files / **payment files** | 207 (statements), 222 (salary). Supplier and claim payment files depend on unassigned payables (§6.8) | P |
| National registry | 226 (simulator), H16 | C |
| Traffic / licensing (incl. "compulsory insurance status for licensing offices") | 226 simulator, H16. The inbound status query for licensing offices is not named (225?) | P |
| Orange Card bureau | 227, H17 | C |
| Retakaful companies (bordereaux, ICIEC format) | 203 | C |
| SMS and e-mail | 226, F20, H15 | C |
| Regulator (ISA) exports | 224 | I |
| Metabase / Power BI | 217 | C |
| Event delivery (outbox, idempotent, retry, DLQ) | F07, D00-11, G12 | C |

### 12. Architecture and deployment (L822–875)

**12.1–12.3**

| Ref | Item | Plan coverage | St |
|---|---|---|---|
| 12.1 Vercel | fra1, prod + preview | F16a | C |
| 12.1 Neon | Branches main/staging/sandbox/dev | D00-20, B11, errata 13 (changed: separate prod / non-prod projects) | D |
| 12.1 Worker | 2+ instances, Frankfurt | F16a (ECS; "2+ instances" not stated) | I |
| 12.1 Storage | Bucket + tenant key | F16a | C |
| 12.1 Secrets | Vault path | D00-20 (Secrets Manager + KMS) | C |
| 12.1 Created by | tenant-factory Terraform | F16a/F16b | C |
| 12.2 | Dev / staging / prod / sandbox | F16a/b, 228; errata 13 (staging in P1) | C |
| 12.3 Default | Neon + Vercel + AWS Frankfurt | F16 | C |
| 12.3 Private cloud / on-prem | G19 (Compose + PG16 + MinIO) | C |
| 12.3 Azure | No WP; R4 portability only | I |
| 12.3 Data residency opinion | B9, H9, A-4 | C |
| 12.3 KSA/UAE in-country | P5 | D |

**12.4 Events** (D00-11 makes the catalogue complete; F07 builds it)

| Event | Producer → consumers | Plan coverage | St |
|---|---|---|---|
| `PartyCreated` | M02 → M17 | 107 → 223 | C |
| `QuoteAccepted` | M05 → M06 | 109/110 → 111 | C |
| `CertificateApproved` | M06 → M07, M12, M10, M14, M24 | 111 → 114, 103, 201, F18/112. M14 (P4) retention / backfill undecided (A-12) | P |
| `PaymentReceived` | M07 → M08, M12, M04 (+M06 auto-renew, B-34/E-39) | 114 → 102, 103, 204. M06 consumer not added to D00-11 (implicit via M06-4 → 111+114) | I |
| `ContributionAllocated` | M08 → M12 | 102 → 103 | C |
| `ClaimStageChanged` | M09 → M30, M28 | 116 → F20, 217 | I |
| `ClaimApproved` | M09 → M10, M12 | 116 → 202, 103 | C |
| `ClaimPaid` | M09 → M12, M13 (+ `ClaimPaymentConfirmed`) | D00-11 adds `ClaimPaymentConfirmed`. `ClaimPaymentOrdered` (B-34/E-36) is not listed | P |
| `CommissionRunApproved` | M04 → M12 (+M07, B-34) | 204 | I |
| `PayrollRunApproved` | M34 → M12, M30 | 221/222 | I |
| `InvestmentIncomeBooked` | M11 → M08, M12 | 213 | I |
| `PeriodClosed` | M12 → M13, M18, M28 | 209 | I |
| `SurplusApproved` | M15 → M07, M06, M12 (+M08, E-40) | 214/215 | I |
| `EmployeeTerminated` | M33 → M01 | 220 | I |

**12.5 Background jobs**

| Job | Plan coverage | St |
|---|---|---|
| Imports and masking runs | 119, 120 | C |
| PDF generation (certificates, receipts, statements, payslips) | F18, 112, 114, 215, 222 | C |
| Daily expiry scan | 112 | C |
| Hourly KPI snapshot | 217 | I |
| Monthly commission run | 204 | I |
| Monthly retakaful reconciliation | 203 | C |
| Payroll run | 221 | C |
| Period close | 209 | C |
| Reserving | 210 | C |
| Surplus run | 214 | C |
| Investment accruals | 212/213 | I |
| Audit chain verification | F06 | C |
| **Backups export** (daily encrypted logical backup to a second region) | 305 in P3 only. The P1 restore test (G-P1 / G24, §15.2 d27–29) needs it earlier | P |

### 13. Security (L879–892)

| Area | README control | Plan coverage | St |
|---|---|---|---|
| Standard | ASVS L2 (L3 for identity, money, payroll); ISO 27001 later | Errata 15 (ASVS 5.0); 127; P5. L3 control list per module (C-21) not assigned | P |
| Application | Server permission check; shared validation; output encoding | F12, Zod | C |
| Application | **Strict CSP, CSRF protection, rate limits (app)** | Not in any WP. 225 covers the public-API rate limit only | **NC** |
| Application | Secure upload, malware scan, signed short-lived links | F18 (ClamAV), errata 15 | C |
| Identity | MFA all staff; passkeys for admins/checkers; 15-min idle | F11 | C |
| Identity | **Anomaly alerts** | Not in any WP | **NC** |
| Identity | **Quarterly access review** | Not in any WP | **NC** |
| Identity | Leavers disabled the same day | 220 | C |
| Database | Separate Neon per client; RLS forced; no bypass; migration role; reporting role | F03, F04, F16, G7 | C |
| Database | IP allow-list / private networking | H14 (cost); F16a/b | I |
| Database | **Break-glass access with dual approval and full logging** | Not in any WP | **NC** |
| Encryption | TLS 1.2+; at rest | F16 | I |
| Encryption | Field-level per-tenant keys; keyed-hash search | F19 | C |
| Encryption | **Yearly key rotation (+ blind-index re-index, C-17)** | Not in any WP | **NC** |
| Audit | Hash chain; daily verify; WORM copies | F06, H1 | C |
| Audit | Retention per tenant (10 y) | Not assigned (see §4 row) | **NC** |
| Backups / DR | PITR ≥7 d; second-region logical backups; RPO/RTO; quarterly restore | 305, G24, H14, errata 15 | C |
| Testing | SAST/deps/secrets per commit; weekly DAST; RLS/SoD in CI; k6; pen test then yearly | G18, G21, 304, G8, G10, 301, G20, H22, A-8 | C |
| Monitoring | **Security log stream; alerts (failed logins, privilege changes, bulk exports, RLS denials); incident response plan** | Not in any WP, gate or H-item | **NC** |
| Sandbox | Masked only; outbound blocked in code and network; SIMULATION watermark on screens and PDFs | F09, F18, F16b, F20, G16, G22 | C |

### 14. Masking, simulation, migration (L896–929)

| Ref | Item | Plan coverage | St |
|---|---|---|---|
| 14.1 | Period, content, format, fallback | H4, 119, 121, B7, errata 16 (window, opening balances, agents masked, CSV/Oracle Thin) | C |
| 14.1 content | Treaties, one month of payroll, last surplus: loaded and replayed **in P2** (E-65) | 121 (P1 replay) + S8 (M15 golden run). Treaty and payroll sample replay in P2 not assigned | P |
| 14.2 | 11 masking rules | 119; G22 leak scan + 200-record check | C |
| 14.3 | DSA → CLI on client machine → leak scan → load → reconcile → replay → compare | H2, 119, G22, 120, G23/H5, 121, G-P1 | C |
| 14.4 | Discovery → mapping → opening balances → 3 trial loads → parallel run → cutover | H18–H20, H26, 306/307 (cutover runbook / delta load implicit) | C |

### 15. Phases, milestones, exit criteria (L933–977)

| Ref | Item | Plan coverage | St |
|---|---|---|---|
| 15 intro | 90 days, weekly sprints, client tests each part | §9 pacing rule (weekly trains); §1 verdict restates go-live | D |
| Phase 0 | Kick-off, DSA, extract, fund parameter sheet, legal opinion | A-1…A-8, H2, H3, H6, H9 | C |
| Phase 0 | **Requirement workshops and workflow maps** | Not in §14 actions or any WP (see §16 row) | **NC** |
| Phase 0 | **Visual identity** | F13 branding (implicit); no P0 action | I |
| Phase 1 | Deliverable list | W1–W14 | C |
| Phase 1 exit 1–9 | §15.1 | 126 + G-P1; AGENT-PROTOCOL A-5; errata 18 (exit 6, 7) | C |
| Phase 2 | Deliverable list | W15–W23; offline → P4 (D00-17) | C |
| Phase 2 exit | All §6 ATs | G-P2, 231 | C |
| Phase 3 | UAT, load, DAST, pen test, migration rehearsals, training, manuals, videos, DR | H24, 301, G20, 304, H22, 306/307, H20, H25, 308, 305 | C |
| Phase 3 exit | Final UAT; no open high-severity | G-P3 | C |
| Go-live gates | SSB, legal, pen test, migration, fund parameters | G-P3 human, H6–H9, H20, H22, H26, H28 | C |
| Hypercare | 15 days | §10.3 date only; no support plan or runbook WP | I |
| Warranty | 6 months | §10.3 date only | I |
| Phase 4 | M14, M19, M20, M21, M23, M25, M26 designer | §8.6 | C |
| Phase 5 | KSA, UAE, Bahrain; in-country; ISO | §10.3; H13 (§4) | D |
| 15.2 | Sprint plan | Replaced by §9 waves (errata 17) | D |
| 15.2 d22–26 | UAT sessions with five roles | G-P1 human ("client staff session") | I |
| 15.2 d30 | Demo to management and SSB | G-P1 human | C |

### 16. Testing, training, documentation, warranty (L981–996)

| Deliverable | Plan coverage | St |
|---|---|---|
| Requirements analysis + **BPMN workflow maps** in `docs/workflows/` and the Learning Center | No WP, no action | **NC** |
| **Schema documentation generated from migrations** | No WP | **NC** |
| Tenant branding (visual identity) | F13 | I |
| Unit, property, e2e, integration tests in CI | G4, G5, G12, G15 | C |
| Load targets (200 users, p95 < 2 s, close < 30 min on 3 years) | 301, G20, G-P3, D00-23 | C |
| Security testing | G18, G21, H22 | C |
| **UAT scripts per role** | H24 (UAT) but no WP writes the scripts | **NC** |
| Cloud setup + automatic backups | F16, 305 | C |
| User manuals (PDF AR/EN) | 308 | C |
| Video tutorials | 308, H25 | C |
| 5-day training | H25 | C |
| Weekly sprint review / demo | §9 pacing rule | I |
| **Weekly written progress report** | Not assigned (orchestrator or PO) | **NC** |
| Staging environment | F16b, 228 | C |
| Hypercare 15 days | §10.3 | I |
| **Warranty severity SLA** (critical 2 h, high 8 h, normal 2 wd) | Not in the plan; no support process | **NC** |
| Out of scope (client pays hosting, gateway, SMS fees) | H27 (cloud billing) | I |

### 17. Libya rule pack (L1000–1023)

| Rule | Plan coverage | St |
|---|---|---|
| Supervision levy Art. 4 | 224, D00-09, errata 9 | C |
| Minimum capital Art. 6 (check in M19) | 211 (subscribed vs paid, A-19) | I |
| Compulsory local cession Art. 13 | 201, H11 | I |
| Technical reserve floors Art. 15 | 210, errata 9 | C |
| Assets in Libya Art. 16 | 212/213, errata 5 | C |
| Solvency Art. 17 | 211, errata 9 | C |
| **Registers Art. 22** (policies, claims, brokers, agents, treaties, allocated assets) | No WP owns the register reports | **NC** |
| Accounts per class Art. 23 | 103 | I |
| Annual returns Art. 24 | 224, H11 | C |
| Auditor from register Arts. 25–26 | F12 (auditor role) | I |
| Motor TPL Law 28/1971 | 106, errata 9 (Dec. 400/460) | C |
| **Res. 315/2026 product templates** | Errata 9 does not include D-14's re-description. No WP builds the templates | **NC** |
| Reinsurer registration Dec. 374/2026 | 201, errata 9 | C |
| Takaful decisions 529/201/60 | D-13 (configurable); 216 | I |
| Law 6/2022 data protection | Errata 8; 107 | C |
| AML Res. 1013/2017 | 223, errata 9 (+ Law 2/2005) | C |
| Labour Law 12/2010 | 220 | I |
| Social security Law 13/1980 | 221, errata 9 | C |
| Income tax Law 7/2010 | 221 | C |
| Working calendar | F13 | C |

### 18. Open questions (L1027–1064)

Errata 19 adds an owner and a due date to every Q. The table shows which Qs also have a scheduled H-item or action.

| Q | Topic | Plan coverage | St |
|---|---|---|---|
| Q1 | ARIMA | H18, A-2 | C |
| Q2 | Wakala %, Mudaraba split | H6 | C |
| Q3 | Last surplus | Errata 16 (window aligned); H4 | I |
| Q4 | Qard history | H4 (opening balances) | C |
| Q5 | Branches, agents, border points, internet | Errata 19 only | I |
| Q6 | Annual volumes | Errata 19 only (301 load data) | I |
| Q7 | Three 2026 products | Errata 19 only; no product WP (see M03 scope row) | **NC** |
| Q8 | Reinsurers, Libya Re | H11 (Art. 13 quota) | I |
| Q9 | Aug 2025 statement | Errata 19 only | I |
| Q10 | Bancassurance (orphan, E-81) | Not resolved | **NC** |
| Q11 | SSB members and process | H7/H8 | I |
| Q12 | Payment channels | H14, A-5 | C |
| Q13 | DSA + extract | H2, H4 | C |
| Q14 | Who signs fund parameters | H6 | C |
| Q15 | Chart of accounts + audited statements | B8, H5 (interim CoA mapping); no H-item for the CoA itself | I |
| Q16 | Frankfurt for sandbox | H3 | C |
| Q17 | Art. 24 forms; Decision 60/2021 | H11 | C |
| Q18 | IFRS 17 or AAOIFI | D00-10 | C |
| Q19 | Numbering + QR rules | D00-16 (no H-item; needed by W10) | I |
| Q20 | Orange Card bureau | H17 | C |
| Q21 | Staff per department, roles | Errata 19 only (needed by F12 in W6) | I |
| Q22 | Exchange-rate source | Errata 19 only (needed by F05/103) | I |
| Q23 | Fiscal year end, Hijri | §10.2 assumption "FY = calendar year" | C |
| Q24 | Retention period | Errata 19 only | I |
| Q25 | HR/payroll tool and data | H12 (partly) | I |
| Q26 | SMS provider | H15 | C |
| Q27 | SS and tax rates | H12 | C |
| Q28 | Commission tiers, KPIs | Errata 19 only | I |
| Q29 | Approval Matrix limits | Errata 19 only (needed by F12/F15 in W6–W7) | I |
| Q30 | Investments held | Errata 16 (opening investment positions) | I |
| Q31 | Registry and traffic access | H16 | C |
| Q32 | E-signature certificate | H13, §4 H4 | C |

### 19. Requirement traceability (L1068–1105)

| Client § | Requirement | Plan coverage | St |
|---|---|---|---|
| 1 | Full cycle (registration → statements) | All waves; D00-17 phased cutover | C |
| 1 | Private cloud or AWS/Azure | G19; Azure implicit | I |
| 1 | Fund separation; Sharia board rules | 101, 123, 216 | C |
| 2 | Agile weekly sprints, 90 days | §9 pacing; §1 verdict (go-live restated) | D |
| 2 | **Responsive UI on computers, tablets and phones** | Never mentioned. F08/F09 have no breakpoint requirement; G15 has no mobile or tablet viewport project | **NC** |
| 2 | PostgreSQL | D00-20 | C |
| 2 | REST APIs: banks, registry, traffic, retakaful | 225, 226, 203, 207 | C |
| 3.1 | CRM | 107, 108 | C |
| 3.2 | PDF signed on approval; auto renewal; scan; alerts | 111, 112 | C |
| 3.3 | Rules engine; instant decision; Approval Matrix | 109, 110 | C |
| 3.4 | 6-stage state machine; < 5 working days | 116, 117 | C |
| 3.5 | Treaties; auto share; reports | 201–203 | C |
| 3.6 | Recurring billing; gateways; instant receipts | 114, 206, 207; D00-17 | C |
| 3.7 | Agent dashboard; tiered commission | 204, 205 | C |
| 3.8 | Double entry; automatic journals; BS / IS / TB | 101–104, 208 | C |
| 3.9 | Metabase / Power BI; hourly; 20+ KPIs | 211, 217 | C |
| 3.10 | Sharia status; no mixing; SSB reports; certificates | F17, 123, 216 | C |
| 3.11 | Surplus formula; pro rata; statements; vouchers / discount | 214, 215 (M06 credit application gap) | P |
| 3.12 | Murabaha / Mudaraba / Ijara; returns split; reports | 212, 213 | C |
| 4 | Requirement sessions, **workflow maps**, DB design, visual identity | Workshops, maps and schema docs not assigned | **NC** |
| 4 | 10+ dashboards | 218–219 | C |
| 4 | Stress, security, bug testing; UAT | 301, 304, H22, H24 | C |
| 4 | Servers, DBs, automatic backups | F16, 305 | C |
| 4 | Manuals, videos, workshops | 308, H25 | C |
| 4 | Weekly coordination | §9 pacing (progress report not assigned) | P |
| 4 | Milestones incl. 15-day follow-up | §10.3 | C |
| 5 | Staging | F16b, 228, errata 13 | C |
| 5 | 5-day training | H25 | C |
| 5 | 6 months support | §10.3 (no SLA / process) | P |
| 6 | Open-source licences | G18 licence allow-list | C |
| 6 | Three environments | F16a/b, D00-20 | C |
| 6 | Hosting / gateway / SMS costs external | H27 | I |
| Added | HR and payroll | 118, 220–222 | C |
| Added | Qard, reserves, AML, returns, solvency, IFRS 17, audit, "i", LC, module requests | 101–102, 210, 223, 224, 211, 111 + P4, F06, F10, 122, 123 | C |
| (missing) | M22 row in §19 (E) | PLAN §3 M22 verdict asks for it; not in the errata list | P |

---

## 2. Totals

Counted over the 491 matrix rows above, with a script on this file. The KPI catalogue and the dashboard list each count as one row.

| Status | Rows | Share |
|---|---|---|
| C: covered explicitly | 299 | 61% |
| I: covered implicitly (brief line range only) | 116 | 24% |
| D: deferred / changed by approved decision | 17 | 3% |
| P: partially covered | 29 | 6% |
| **NC: not covered** | **30** | **6%** |

So 432 rows (88%) are covered or explicitly deferred, 116 of them only through the brief's README line range. The 30 NC rows reduce to 24 distinct gaps (N1–N24 in §3.1).

*Count method: one row = one table row in §1. Rows for the same gap that appear in two sections (for example retention in §4 and §13) are counted in both.*

---

## 3. NOT COVERED and weakly covered items (with fix)

Severity: **HIGH** = a client-contract deliverable or a go-live/production control with no owner, or a defect that will produce wrong money. **MEDIUM** = will be built ad hoc or forgotten. **LOW** = editorial or process.

### 3.1 NOT COVERED

| # | README ref | Gap | Sev | Add to |
|---|---|---|---|---|
| N1 | §8 M03 / §1.1 products / Q7 / §17 Res. 315 | Under D00-17 the client goes live with comprehensive motor, property/general, marine (open covers, declarations) and Hajj/Umrah, plus Res. 315/2026 lines and the three 2026 products (Q7). The only seed WP, 106, covers motor TPL and travel. No WP configures, tests or i-texts the other lines | HIGH | New P2 WP **232 "M03 product catalogue: comprehensive motor, property/general, marine, Hajj/Umrah, Res. 315 TPL"** in W17–W20, gated on H10 + Q7. Add an H-item for Q7 product specs |
| N2 | §6.8 M12(b); §15 L941 | Payables: supplier register, expense invoices, payment runs, budgets vs actual (SHF). This is a named client P2 deliverable | HIGH | Split **209** or add **209b "M12 payables, payment runs, budgets"** in W17. Include bank payment files (§11 Banks) |
| N3 | §13 Monitoring | Security log stream, alerts (failed logins, privilege changes, bulk exports, RLS denials), incident response plan | HIGH | New P3 WP **309 "Security monitoring, alerting, incident-response runbook"**. Emit the security events from F06/F11/F12 now (add to their briefs). Add a G-P3 check |
| N4 | §19 client §2 | Responsive UI on computers, tablets, phones; M09 stage 3 surveyor mobile screen | HIGH (client requirement) | **F08/F09**: breakpoint and touch requirements. **G15**: add `ar-rtl-mobile` and `tablet` Playwright projects. **117**: mobile assessment screen with photo capture |
| N5 | §13 Identity, §8 M01 | Quarterly access review campaigns | MEDIUM | **F12** (data model + scheduled campaign), UI in **123** or a P2 WP |
| N6 | §13 Identity | Anomaly alerts | MEDIUM | **309** (with N3), using the F11 session events |
| N7 | §13 Application | Strict CSP (nonce in `proxy.ts`), CSRF protection, app-wide rate limits | MEDIUM | **F11/F12** (middleware); verified by **127** and **304** |
| N8 | §13 Database | Break-glass access with dual approval and full logging | MEDIUM | **F16b** (role + procedure) + a runbook in 305 |
| N9 | §13 Encryption | Yearly key rotation, plus blind-index re-index job (C-17) | MEDIUM | **F19** (rotation-ready `key_version`, re-index job); drill in **305** |
| N10 | §4, §13 Audit, Q24 | Configurable data retention (default 10 y), audit retention | MEDIUM | **F13** (tenant retention setting), **F06** (WORM retention); add an H-item for Q24 |
| N11 | §6.8 (b) | Fixed assets register + depreciation (SHF) | MEDIUM | **209b** (with N2) |
| N12 | §6.8 (b) | Recurring journals, accruals, multi-currency revaluation per fund | MEDIUM | **104** (recurring/accrual), **209** (month-end revaluation, ADR-006 extension) |
| N13 | §6.10 (b), §6.8 (c) | Zakat calculation on shareholders' funds | MEDIUM | **216** (name it in the brief) |
| N14 | §17 Art. 22; §6.2 Registers | Art. 22 registers (policies, claims, brokers, agents, treaties, allocated assets) | MEDIUM | **224** (M18) owns the register reports, reading 111/116/118/201/212 data |
| N15 | §7.2 | Statutory payroll returns (SS/INAS, monthly tax) | MEDIUM | **222** |
| N16 | §16, §15 P0, §19 client §4 | Requirement workshops + BPMN workflow maps in `docs/workflows/` and the Learning Center | MEDIUM | P0 action **A-11** (workshops) + content WPs **124/125/229/230** (maps embedded in courses) |
| N17 | §16 | UAT scripts per role | MEDIUM | **126** (P1 roles) and **231** (P2), reused in H24 |
| N18 | §16 | Warranty severity SLA and support process; hypercare plan | MEDIUM | New P3 WP **310 "Support runbooks: hypercare, warranty SLA, on-call"**, or 308 |
| N19 | §6.6/§6.5 | Cession backfill for certificates issued in P1 before M10 (201) exists | MEDIUM | **201** (backfill job + test); mirror D00-13 |
| N20 | §16 | Schema documentation generated from migrations | LOW | **F02/F03** (CI artefact) |
| N21 | §10.2 | Learning Center role paths; manager team-progress view | LOW | **122** |
| N22 | §10.3 | `search_log` + weekly review | LOW | **122** (log), owner in H23 |
| N23 | §16 | Weekly written progress report | LOW | Orchestrator duty in §7.1, or PO in §14 |
| N24 | Q10 | Bancassurance (orphan, E-81) | LOW | Errata 19: drop it, or add to M04/M30 |

### 3.2 Partial or implicit items that need an explicit line in a brief

| # | Item | Sev | Add to |
|---|---|---|---|
| P1 | SSB approval register (`ssb_member`, `ssb_resolution`, `ssb_approval`) needed by 105/106 (W8–W9), 110, F18 in P1 (E-27). 123 (M16 P1) is in W10, *after* its consumers | HIGH | Move a minimal register into **105** or a slot in W7, or allow a manual "approval reference" field until 123. Add it to D00-07/D00-14 |
| P2 | Role × module level matrix for every module (E-48); multiple-role rule "highest level wins"; §7.2 vs §9.2 payroll CFO step (E-49) | HIGH | **F12** + errata 12 (extend to E-48/E-49) |
| P3 | P1 claim disbursement from PTF (D00-13) has no WP | HIGH | **116** (domain + posting) or **103**; state it in §8.3 |
| P4 | M06 applies M15 renewal credits at renewal (M15-5, E-08). M06 code is owned by 111/112; nothing in P2 owns the change | MEDIUM | **215** with a CCR on M06 renewal, or a generic "renewal credit" hook in **111** |
| P5 | Sample treaties, payroll month and last surplus replayed in P2 (E-65) | MEDIUM | **S8** / **231**: name the replay of treaties (201–203) and payroll (221) |
| P6 | Orange Card claims / inter-bureau flow (B-16) | MEDIUM | **227** |
| P7 | Consent fields: purpose, refusal (Art. 79), notice (Art. 76) (D-01) | MEDIUM | **107** |
| P8 | Agent net remittance (B-26) is a D00-level money decision in AGENT-PROTOCOL ADR-002 but missing from PLAN D00 | MEDIUM | Add to **D00-03** |
| P9 | M14 event retention / backfill policy (A-12) | MEDIUM | **F07** (outbox retention) or ADR-012 |
| P10 | `ClaimPaymentOrdered`; M06 as consumer of `PaymentReceived`; M07 as consumer of `CommissionRunApproved`; M08 of `SurplusApproved` | MEDIUM | Make the **D00-11** list exhaustive (B-33 + E-35…E-42) |
| P11 | Backup export job needed for the P1 restore test (G24 at W14); 305 is P3 | MEDIUM | **F16b** |
| P12 | M33 HR: 10 feature rows in one ≤6 h WP (220) | MEDIUM | Split **220a** (org, contracts, lifecycle, M01 link) / **220b** (attendance, leave, advances, appraisal, EOS, self-service, reports) |
| P13 | Licensing-office "compulsory insurance status" lookup (§11 Traffic) | LOW | **225** (endpoint) |
| P14 | Power BI Service vs D12 (B-40) | LOW | D00 or errata 15 |
| P15 | Client facts (D-18); §20 states ARIMA as fact | LOW | Errata 1/19 |
| P16 | §19 missing M22 row | LOW | Errata 11 |

---

## 4. Validator BLOCKER and HIGH flags: addressed in PLAN-V1?

Inventory: A 3 B / 9 H · B 0 B / 13 H · C 2 B / 11 H · D 1 B / 7 H (PLAN §2 says "about 10") · E 6 B / 36 H. Total **12 BLOCKER, 76 HIGH**.

### 4.1 All BLOCKERs: addressed (12/12)

A-01, A-02, A-03 → B1/B2, D00-01/02. C-01 → B3/D00-05/F21. C-02 → B4/§7. D-02 → B9/H9. E-01 → B4/D00-15. E-02 → B1. E-06 → B5/D00-13. E-12 → B6/D00-14. E-59 → B7. E-66 → B8/errata 18.

### 4.2 HIGH flags fully addressed (63 of 76)

A-04, A-05, A-06, A-08, A-09, A-10, A-14 · B-01, B-03, B-07, B-08, B-09, B-14, B-15, B-17, B-33 (non-exhaustive list), B-41 · C-03…C-13 (all 11) · D-03, D-04, D-05, D-08, D-15 · E-03, E-04, E-05, E-07, E-09, E-10 (via E §3 map), E-14, E-19, E-21, E-22, E-23, E-24, E-25, E-26 (protocol G13/G27), E-35, E-37, E-38, E-46, E-47, E-61, E-62, E-63, E-64 (M06-4 → 111+114), E-67, E-68, E-69, E-73, E-76, E-77, E-08 (via ownership map).

### 4.3 HIGH flags NOT addressed or only partly addressed (13)

| Flag | Issue | Status in PLAN-V1 | What is missing |
|---|---|---|---|
| **E-27** | SSB approval register needed in P1 | **Not addressed** | No WP or D00. 123 (M16 P1) comes after its consumers (see §3.2 P1) |
| **D-18** | Client facts unverified; §20 states ARIMA as fact | **Not addressed** (H18 covers ARIMA access only) | Errata line for §1.1 / §20 "client-reported, unverified" |
| **E-48** | Modules with no maker/checker holders in the role template | Partial (D00-08 adds roles only) | Role × module level matrix |
| **E-49** | Levels vs approval chains; multiple roles; §7.2 CFO step | Partial (capabilities only) | "Highest level per module" rule; §7.2/§9.2 payroll chain fix |
| **E-65** | P1 replay scope; treaties, payroll, surplus replay in P2 | Partial (121, S8) | Named P2 replay of treaties and payroll |
| **E-60** | M26 core before its consumers | Partial: F15 is in **W7 alongside 107** (M02 merge needs maker-checker) | Move F15 to W6, or move 107 to W8 |
| **E-36** | Claim payment loop direction | Partial (`ClaimPaymentConfirmed` only) | `ClaimPaymentOrdered` and the P1 disbursement WP |
| **B-34** | Missing consumers (M06 ← PaymentReceived, M07 ← CommissionRunApproved) | Partial | Exhaustive D00-11 list |
| **B-16** | Orange Card online-only + claims flow | Partial (online-only decided) | Inter-bureau claims flow in 227 |
| **B-26** | Agent net remittance mixes funds | Partial (PLAN verdict + protocol ADR-002; not in D00) | Add to D00-03 |
| **A-12** | P1 IFRS 17 capture for M09/M10/M04 and M14 event retention | Partial (111 only names M06) | Name the fields in 116, 201, 204; outbox retention |
| **D-01** | Law 6/2022 consent fields | Partial (citation fixed in errata 8) | `party_consent` fields in 107 |
| **A-11** | Standards naming incl. IFSB-11/14 | Mostly (errata 4/5); IFSB-11/14 references missing | LOW impact |

---

## 5. PLAN-V1 §12 AT traceability table: errors

| # | Row | Error | Correct mapping |
|---|---|---|---|
| T1 | M07-3, 4 → 114 | M07-4 (late fee → charity) depends on dunning/late-payment logic, which is 207 (P2). 114 alone cannot pass it | M07-3 → 114; **M07-4 → 114 + 207** (charity posting D00-06 in 102/103) |
| T2 | M12-1, 3, 4 → 101–103 | M12-1 needs all four producers: issue (111), collect (114), pay claim (116 + P1 disbursement), **pay commission (204, P2)**. It cannot be green at the P1 gate | **M12-1 → 103 + 111, 114, 116, 204** (P1 partial: 3 of 4; full in P2). M12-3, 4 → 101–103 is fine |
| T3 | M34 (3) → 221, 222, 118 | "Terminating an employee disables their login" needs M33 lifecycle + `EmployeeTerminated` → M01. Per E-75 / D-33 the link is activated in P2 in **220**, not in 118 (P1 master) | **M34-3 → 220 (+F12 consumer)**; drop 118 |
| T4 | M15-5 → 215 | Renewal credit is applied by **M06 at renewal**. No P2 WP owns the M06 side | **M15-5 → 215 + M06 hook (111 or a CCR)** |
| T5 | M15-1…4 → 214 | M15-1 runs on the 12-month sample: needs **S8** (golden run) + **121** (sample). M15-4 needs **211** (solvency) | **M15-1 → 214 + S8**; **M15-4 → 214 + 211** |
| T6 | M09-1, 2, 5 → 116 | M09-2 (payment hits PTF) needs the D00-13 disbursement, which has no WP. M09-5 needs **F15** | Name the disbursement WP; **M09-5 → 116 + F15** |
| T7 | M10-1 → 201 | Cession on issue of certificates created in P1 needs a backfill (N19) | **M10-1 → 201** + backfill test |
| T8 | M28 → 211, 217–219 | Fine, but the hourly-job and read-only-role checks have no named WP (217 implied) | State "hourly snapshot + reporting role → 217" |
| T9 | Missing rows | Not in §12: (a) the corrected **M10-2** wording (errata 6 / ADR-014) should be noted; (b) validator-proposed tests from **B, C and D** (only "A-1…41" are mapped); (c) §16 performance targets (G-P3 covers them, but they have no AT IDs); (d) Phase 2 exit adds a real-SMS test (protocol A-5) with no WP (226) | Add rows: "B tests → per WP brief", "Real SMS on staging → 226 / H15", "§16 load → 301 / G20" |
| T10 | All README (e) IDs | Check: every README AT ID (M02 1–5, M06 1–5, M05 1–4, M09 1–5, M10 1–3, M07 1–4, M04 1–4, M12 1–4, M28, M16 1–3, M15 1–5, M11, M34, EX-P1 1–9) appears at least once. **No README AT is missing** | — |

---

## 6. Other plan-level traceability defects found

| # | Defect | Sev | Fix |
|---|---|---|---|
| X1 | **ADR numbering conflict.** PLAN §5 says D00-01…24 become ADR-001…024 (so ADR-002 = surplus formula). AGENT-PROTOCOL §1 defines ADR-001…016 with different content (ADR-002 = inter-fund transfers, ADR-013 = surplus). Briefs must cite ADRs, so builders will cite the wrong decision | HIGH | Use one numbering. Recommend ADR-0nn = D00-nn and renumber the protocol table |
| X2 | **WP dependencies inside the same wave** (F's model is not in the repo): F06 needs F07 (both W4); F11 and F18 need F09 (all W5); 107 needs F15 (W7, E-60); 214 needs 213 investment income (W18); 113 uses 112 (W11) | HIGH | Re-sequence, or declare a stub contract per pair in the wave brief |
| X3 | **WP-level scope is not written down for 101–127 / 201–231.** §8.3 says deps and ATs are "as in the validator F model", which is not in `docs/plan/`. No README line ranges per WP | HIGH | Publish `docs/plan/wp-catalogue.md` (WP → README line ranges, owned tables, ATs, deps) before W7 |
| X4 | Dangling references: `validation/R-redteam.md` (§15) does not exist. `docs/adr/` does not exist yet (expected after WP-00-DOC) | MEDIUM | Create or re-point |
| X5 | PLAN §4 says "all [~216] flags are tracked in findings-ledger.md". The ledger holds only the 25 consolidated items and says the rest "stay in the reports" | MEDIUM | Seed V-* rows for every BLOCKER/HIGH (at least the 13 in §4.3), or fix the PLAN sentence |
| X6 | Protocol vs plan conventions differ: package scope `@tt/*` vs `@takafultech/*` (D00-24); migration numbering "reserved block in migration-ledger.md" vs "wave*100+slot*25+n"; "WP-00 Contracts & Rails" vs F01–F21; G4 coverage thresholds (protocol ≥90/95% vs plan ≥85/90%) | MEDIUM | Align the protocol to PLAN-V1 (or the reverse) in WP-00-DOC |
| X7 | PLAN §2 says D has "about 10 HIGH"; the report has 7 HIGH + 1 BLOCKER | LOW | Correct the count |
