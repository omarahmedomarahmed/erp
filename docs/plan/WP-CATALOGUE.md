# TakafulTech — Work-Package Catalogue (Plan V1)

This is the source for every builder brief. The **README lines** column lists the line ranges in `README.md` that the builder must read in full. A brief may add ranges but must never drop one (R2 traceability rule). **h** is builder agent-hours. **Deps** must be merged in an *earlier* wave (see `PLAN-V1.md` §9).

Every WP also inherits:

| Applies to | Rule |
|---|---|
| All WPs | README §2 (L63–96), §4 (L160–174), the D00 ADRs it cites, `docs/conventions.md` (from F01) and `AGENT-PROTOCOL.md` §3 |
| Any WP touching money | README §5 (L178–236) |
| Any WP with UI | README §9 (L704–757) and §10.1 (L763–775) |

README section line index:

| Section | Lines |
|---|---|
| §1 | 32–59 |
| §2 | 63–96 |
| §3 | 100–156 |
| §4 | 160–174 |
| §5 | 178–236 |
| 6.1 M02 | 244–274 |
| 6.2 M06 | 276–306 |
| 6.3 M05 | 308–335 |
| 6.4 M09 | 337–371 |
| 6.5 M10 | 373–400 |
| 6.6 M07 | 402–431 |
| 6.7 M04 | 433–461 |
| 6.8 M12 | 463–493 |
| 6.9 M28 | 495–542 |
| 6.10 M16 | 544–573 |
| 6.11 M15 | 575–609 |
| 6.12 M11 | 611–631 |
| §7 HR / Payroll | 635–672 |
| §8 | 676–700 |
| §9 | 704–757 |
| §10 | 761–798 |
| §11 | 802–818 |
| §12 | 822–875 |
| §13 | 879–892 |
| §14 | 896–929 |
| §15 | 933–977 |
| §16 | 981–996 |
| §17 | 1000–1023 |
| §18 | 1027–1064 |

## P0 / W1: Pre-build (parallel with F01)

| WP | Wave | Name and scope | README lines | Deps | Closes | h |
|---|---|---|---|---|---|---|
| WP-00-DOC | W1 | README errata (PLAN §6) as a PR; ADR-001…028 drafts from D00 into `docs/adr/` | all | — | Errata 1–20 | 6 |
| WP-00-TEST | W1 | Golden scenarios as **data + expected results**, not code: <ul><li>fund lifecycle (issue → receipt → earning → cancel), per fund</li><li>surplus golden year</li><li>retakaful layer cases incl. QS + XoL + limit</li><li>commission tiers marginal / whole-band</li><li>payroll 30-employee control-sheet template</li><li>claim transition table</li></ul>**Takaful accountant signs the fund and surplus numbers.** Locked by checksum manifest | 178–236, 337–371, 373–400, 433–461, 575–609, 657–672 | D00-B draft | Basis of AT-M12-3, M15-1/2, M10-2, M04-2, M34-1 | 8 |
| A-0 | P0 | Arabic brief vs README §6(a) / §19 diff (human, or AI given the document) | 240–631, 1068–1105 | Brief supplied | Q36 | — |

## Foundation (W1–W7)

| WP | Wave | Name and scope | README lines | Deps | Closes | h |
|---|---|---|---|---|---|---|
| F01 | W1 | Monorepo (pnpm + turbo, strict TS); packages per §3.2 under `@takafultech/*`; CLAUDE.md with DoD/R1–R8; `docs/conventions.md` (ownership map, migration ranges, generated-file rules); local PG cluster scripts (no Docker daemon); Dockerfiles (built in CI) | 100–156 | — | — | 3 |
| F02 | W2 | GitHub Actions: PG16 + PG17 matrix, gate scripts, gate applicability matrix, CI artefacts = evidence of record, e2e sharding, Docker image build/boot (G19), Neon `int/wNN` automation (when H27 ready), golden-test checksum gate | 63–96, 123 | F01 | DoD 1 | 3 |
| F03 | W2 | dbmate runner with range enforcement; roles (owner, app, definer, auth, reporting, worker); schema lints; migration 0001 (extensions, `ar_norm()`, money/rate domains per D00-21, `sharia_status` enum); schema-doc generator | 110–111, 213–222, 755–757, 788–798 | F01 | DoD 1, 4, 10 | 4 |
| F05 | W2 | Money (decimal.js, 3 dp LYD, banker's rounding, largest remainder); FX line; Temporal + Hijri (tenant variant); working-calendar function; number-format policy | 113–114, 54, 171 | F01 | DoD 10 | 4 |
| 119 | W2 | M31 masking CLI: all §14.2 rules incl. agents as persons; HMAC pseudonyms with client-held key; leak scan; 200-record sampler; CSV/XLSX + Oracle Thin input; single signed binary (Win/Linux) | 896–925 | F01 | EX-P1-9 | 6 |
| F04 | W3 | `withRequestContext` (node-postgres / Neon WS pool; `set_config(...,true)`); lint ban on bare `SET`/`db.`; RLS role-matrix harness | 755–757, 886 | F03 | DoD 4, EX-P1-8 | 4 |
| F08 | W3 | DS A: Radix + Tailwind logical props; required `infoKey`; InfoIcon; Help mode; R8 lint; responsive breakpoints (desktop / tablet / phone) | 108, 763–771, 1076 | F01, F05 | D4, DoD 5, R8 | 6 |
| F13 | W3 | M00: Zod tenant config, branding, module switchboard with dependency check, rule-pack loader (R7), Libya pack skeleton, holiday calendar (incl. 24 Dec, 17 Feb; maker-checker), retention settings (Q24), fiscal year | 680, 1000–1023, 174 | F03, F05 | D1, D3, R7 | 5 |
| F17 | W3 | `number_series` + `number_block` + `number_void` (D00-16); `sharia_status` registry, meta-test, `sharia_status_event` (D00-07) | 172, 552–553, 571 | F03 | AT-M16-1 | 4 |
| F07 | W4 | Outbox/inbox, event catalogue v1 (D00-11), pg-boss on direct endpoint, `interactive` / `batch` queues, DLQ, replay, tz Africa/Tripoli | 818, 854–875 | F03, F05 | §11 events | 6 |
| F09 | W4 | DS B: DataGrid, MoneyInput, dual DatePicker, forms, app shell, SIMULATION watermark, mobile/tablet layouts | 107–108, 892 | F08 | DoD 9 | 6 |
| F10 | W4 | next-intl (ar default); help YAML schema; key extractor; `content:check` draft/release; seeding; auto-draft; shared keys (D00-22) | 109, 761–775 | F08 | EX-P1-7 tooling | 4 |
| F19 | W4 | KMS envelope field encryption + blind index; yearly rotation job + re-index; Arabic search (normaliser, trgm, synonym table, English FTS, `search_log`) | 120, 788–798, 887 | F03 | AT-M02-2 engine | 5 |
| F06 | W5 | M27: generic trigger capture, **async chainer**, daily verifier, WORM anchor (S3 Object Lock), History API, retention | 167, 696, 888 | F03, F04, F07 | DoD 7 | 4 |
| F11 | W5 | Better Auth 1.7.x (password + TOTP + passkeys), `auth` schema, policy layer (mandatory MFA, role→factor, per-role idle timeout), CSRF, rate limits, login anomaly alerts | 115, 885 | F04, F09, F10 | §13 identity | 6 |
| F18 | W5 | M24: template registry + versions + SSB-approval link; Chromium pool + Arabic fonts; PAdES signer (pyHanko or KMS; sandbox self-signed CA); QR; S3 adapter; ClamAV quarantine scan; signed short-lived links | 118–119, 693, 884 | F07, F09 | AT-M06-1/2 enablers | 6 |
| F20 | W5 | M30 core: connector framework, code-level sandbox kill switch, internal mailbox screen, `notification_log` idempotency, worker egress allow-list | 94, 698, 815, 818, 892 | F07, F13 | R6, EX-P1-2/9 | 4 |
| F12 | W6 | Levels 0–5, scopes, limits, SoD engine, capabilities (D00-08), **role × module level matrix**, `defineRoute` guard (level 0 → 404), quarterly access-review export, CSP via proxy | 704–757, 884–885 | F11 | DoD 3, EX-P1-8 | 5 |
| F21 | W6 | **System context** (D00-05): non-login definer role; function conventions; number allocator; audit append; outbox enqueue; tests proving user RLS is bypassable only through these | 755–757, 213–222 | F04, F06, F07, F17 | V-PB-03 | 5 |
| F16a | W6 | Terraform: prod and non-prod Neon + Vercel projects (fra1 / eu-central-1), S3 + KMS + Object Lock, Secrets Manager, ECS dev worker (needs H27) | 124, 822–852 | F01, F07 | §12 | 5 |
| 122 | W6 | M29 Learning Center: courses, role paths, progress, quizzes, manager view, smart search UI, i-text review workflow, `search_log` weekly report | 777–798 | F09, F10, F19 | D5 | 5 |
| F14 | W7 | Module generator + test harness (fixtures, seeded role users, Playwright AR/EN + mobile viewports) | 65–83 | F06, F07, F09, F10, F12 | DoD scaffold | 4 |
| F15 | W7 | M26 core: maker-checker, approval policies / matrix (D00-14), state-machine helper, task inbox, SLA timers on working calendar, escalation | 166, 320–321, 695 | F12, F13, F07 | §4 maker-checker | 6 |
| F16b | W7 | Staging + sandbox stacks, sandbox egress allow-list, per-tenant migration matrix, `terraform plan` in CI, break-glass dual-approval access, **basic backup restore drill** | 829–852, 886–889 | F16a | EX-P1-9, G-P1 restore | 5 |

## Phase 1 domain (W7–W15)

| WP | Wave | Name and scope | README lines | Deps | Closes | h |
|---|---|---|---|---|---|---|
| 101 | W7 | M08 schema: fund, `gl_account` (composite FK), journal header/lines, header deferred balance trigger (definer), immutability, period lock, `inter_fund_transfer` + pairing check, `contribution_allocation` as an allowed cross-fund reference, transfer types (D00-03), posting entry function | 178–236 | F03, F05, F06, F17, F21, D00-B | AT-M16-2, AT-M12-4 (DB), A-tests 1–7 | 6 |
| 103 | W8 | M12 core: posting-rule engine (event + product + fund → accounts; ownership registry), per-fund CoA, manual journals (maker-checker), reversals, recurring journals, TB per fund / combined with eliminations | 463–493 | 101, F15, F07 | AT-M12-3/4, A-tests 13–14 | 6 |
| 105 | W8 | M03 product model: versions, covers, compulsory flags, Art. 1 class mapping, rating tables, questionnaire schema, pass-through charges (D00-09), SSB-approval link, maker-checker activation | 682, 1007, 1014–1015 | F13, F15, F17 | M05/M06 prerequisite | 6 |
| 107 | W8 | M02 domain: party + extensions (D00-15), encrypted identities, exact-ID block, fuzzy candidates (non-blocking for the 60-s flow), merge with maker-checker, fraud flags, consent (Law 6/2022 Arts. 73–79), KYC levels, PEP flag, beneficial owners, `PartyCreated` | 244–274 | F19, F06, F15 | AT-M02-1/2/5 | 6 |
| 123a | W8 | M16 P1: SSB member + resolution / approval register (needed by M03 / M24 approvals), Sharia exception log, SSB-only status change via events | 544–566 | F17, 101 | AT-M16-1/2, EX-P1-5 | 4 |
| 102 | W9 | M08 split engine: versioned split rules (SSB-approved or `illustrative` in sandbox only), allocation, Wakala accrual per D00-01, PIF part per D00-03, Qard register (no-return test), settlement; property tests at 10k | 190–211 | 101, 103 | EX-P1-3, A-tests 8–12, 24 | 5 |
| 108 | W9 | M02 UI: 360 view, document upload + expiry alerts, History tab, duplicate-resolution screen | 250–274 | 107, F09, F18 | AT-M02-3/4 | 5 |
| 109 | W9 | M05 rules engine: decision tables + JSONLogic (D00-18), versions pinned per quote, rating, instant decision < 2 s, simulation on past quotes, decision record, gharar check, medical-data encryption | 308–335 | 105, 107 | AT-M05-1/4 | 6 |
| 118 | W9 | M04 register (agents, brokers, border points, licences, authorised products, number blocks) + M33 master (org, branches, departments, positions, cost centres, employees; hire → user) | 437–448, 639–646 | F12, F17, 107 | AT-M04-1 (RLS) | 5 |
| 104 | W10 | M12 UI and TB reports (per fund / branch / class; PDF / Excel; AR/EN) | 474, 486–493 | 103, F09, F18 | EX-P1-6 tool | 4 |
| 106 | W10 | M03 UI + seeds: product builder; compulsory motor TPL (Law 28/1971; Decisions 400/460/2026 limits) and travel, bound to split rules | 682, 1014 | 105, 102 | EX-P1-1 prerequisite | 5 |
| 110 | W10 | M05 approvals + UI: referral → task, limits, highest-role routing, SoD, quote screens | 320–335 | 109, F15 | AT-M05-2/3 | 4 |
| 111 | W10 | M06 domain: issue, endorse (pro rata), cancel (refund rule; `CertificateCancelled` fan-out incl. Wakala reversal), renew (manual / offer / auto on `PaymentReceived`; renewal-credit hook), policy register, IFRS 17 / FAS 43 capture fields (A-12) | 276–306 | 109, 102, F17 | AT-M06-4 (with 114), A-test 41 | 6 |
| 112 | W11 | M06 documents: PDF on `CertificateApproved`, PAdES, QR verification page (no PII), expiry scan (≤N days, idempotent) | 286–289, 302–304 | 111, F18, F20 | AT-M06-1/2/3, EX-P1-2 | 5 |
| 114 | W11 | M07 domain: invoices, instalments, receipts + allocation, customer credit, refunds (maker-checker), cash-up per currency, receipt → split → journal in one transaction, late fee → charity payable, dunning reminders (basic) | 402–431 | 111, 102, 103 | AT-M07-2 (API)/3/4, EX-P1-3 | 6 |
| 116 | W11 | M09 domain: transition table (D00-19) enforced by trigger + definer, sub-statuses, document checklist, assessment, case reserves (PTF), multi-payee, claim expenses → SHF, SLA policy, recoveries register (salvage / subrogation), retakaful stub | 337–371 | 111, 103, F15, F13 | AT-M09-1/5, EX-P1-4 | 6 |
| 124 | W11 | Content A: i-text + LC courses for M00, M01, M02, M03, M04, M33, M29 | 761–787 | F10, W1–W10 | EX-P1-7 (AI part) | 5 |
| 113 | W12 | M06 / M22 UI: quote → issue, endorse / cancel / renew screens, online compulsory motor + travel 60-s flow (1 Mbps budget) | 692, 306 | 110, 111, 112, 114 | AT-M06-5, EX-P1-1 | 5 |
| 115 | W12 | M07 UI: receipt PDF, cash-up, refunds | 410–419 | 114 | EX-P1-1/3 | 4 |
| 117 | W12 | M09 UI: claim timeline, SLA dashboard (working days), mobile surveyor screen with photos | 345–357 | 116 | AT-M09-3 | 5 |
| 120 | W12 | M31 loader: staging import, count/amount/fund reconciliation dashboard, synthetic-data generator fallback | 903–905, 925 | 114, 103 | EX-P1-6 tool | 5 |
| 116b | W13 | P1 PTF disbursement (D00-13): single claim payment and refund payment with maker-checker from the PTF bank account; `ClaimPaymentConfirmed` closes the loop | 349–350 | 116, 114, 103 | AT-M09-2, AT-M12-1 (claim) | 4 |
| 121 | W13 | M31 sample mapping + period replay + per-fund movement comparison with the client's books (masked sample, else synthetic) | 925 | 120, 114, 116, **H4** | EX-P1-6 | 5 |
| 125 | W13 | Content B: M05–M09, M12, M16, M22, M24 | 761–787 | F10, W1–W12 | EX-P1-7 (AI part) | 5 |
| 127 | W13 | Security sweep: CSP review, ZAP baseline config, gitleaks / osv / semgrep tuning, upload-scan e2e | 879–892 | F02, P1 UI | §13 testing | 4 |
| 123b | W14 | M27 audit-history viewer, daily chain-verify job UI, M32 module-request form + tracker (submit → triage → impact → estimate → approval → roadmap) | 696, 700 | F06, F15 | §8 M27/M32 | 4 |
| 126 | W14 | P1 exit e2e: EX-P1-1…9 in AR + EN + mobile; full RLS / SoD role matrix | 949–961 | all P1 | EX-P1 automated | 6 |
| S1 / S2 | W14 | Stabilisation: event wiring, posting-rule completeness | — | — | — | 8 |
| S3 / S4 | W15 | Stabilisation + **P1 engineering gate** | — | — | G-P1 automated | 8 |

## Phase 2 (W16–W25)

| WP | Wave | Name and scope | README lines | Deps | Closes | h |
|---|---|---|---|---|---|---|
| 201 | W16 | M10 treaties: counterparty (party extension, Decision 374/2026 registration, rating, Sharia status, SSB necessity approval), QS / surplus cession per certificate and endorsement, XoL / stop-loss M&D, cession basis (D00-26), local compulsory cession, **backfill cessions for P1 certificates** | 373–392 | 111, 103, 107 | AT-M10-1 | 6 |
| 204 | W16 | M04 commission engine: tiers (marginal / whole-band), KPI multipliers, regulated caps (Decision 88/2026), collected-only, clawback recompute, net remittance per D00-25, SHF postings, targets with maker-checker | 433–461 | 118, 114, 103 | AT-M04-2/3/4 | 6 |
| 206 | W16 | M07 gateways: adapter framework; Moamalat-shaped acquirer simulator; LYPAY / Sadad shaped; bank transfer + statement import; Stripe / PayPal behind flags; webhook signatures; pay-by-link page | 412–413, 809–810 | 114, F20 | AT-M07-1, AT-M07-2 (webhook) | 6 |
| 208 | W16 | M12 statements: balance sheet + income statement per fund / combined (eliminated) / branch / class; FAS 42-style; < 10 s | 474–475 | 103 | AT-M12-2 | 6 |
| 202 | W17 | M10 recovery engine (D00-12 order), `cat_event`, reinstatements, `RecoveryBooked`, replaces the M09 stub, salvage / subrogation share | 384, 359 | 201, 116 | AT-M10-2 (restated), AT-M09-4 | 6 |
| 205 | W17 | M04 agent dashboard (own data only), targets UI, statements | 442–448 | 204 | AT-M04-1 (UI) | 4 |
| 207 | W17 | M07 recurring billing / standing orders, full dunning, grace and lapse (`CertificateLapsed`), bank reconciliation auto-match + exceptions | 410–418 | 206 | §6.6, AT-M07-4 (late fee, full) | 5 |
| 209 | W17 | M12 close: checklist, FX revaluation per fund, `PeriodClosed`, closed-period lock UI, accruals | 477, 869 | 103, 208 | AT-M12-4 (close), A-test 16 | 6 |
| 209b | W18 | M12 payables + supplier register, expense invoices, payment runs, budgets vs actual (SHF), fixed assets + depreciation | 478–480 | 103 | §6.8 payables / FA | 6 |
| 210 | W18 | M13-lite: pro-rata UCR + Art. 15 floor (engineering exception, net of retakaful, prior-year written base); case OCR roll-up; actuary-entered IBNR + fluctuation with sign-off; PTF postings | 684, 1007 | 116, 202, 209 | A-tests 37–38 | 5 |
| 212 | W18 | M11 domain: portfolios per fund; Murabaha (FAS 28), Mudaraba (loss rules), Ijara (FAS 32), Wakala deposits, sukuk (FAS 33); income allocation; `MUDARIB_SHARE` / `INVESTMENT_WAKALA_FEE`; screening; purification | 611–631 | 102, 103, 123a | AT-M11-1/2, A-tests 30–34, 36 | 6 |
| 220 | W18 | M33 HR: contracts (versioned), lifecycle, attendance, leave (rule pack `to_verify`), `staff_advance`, appraisal, end of service by nationality, self-service, reports. **Size watch: split if > 6 h** | 639–655 | 118, F15 | §7.1 | 6 |
| 203 | W19 | M10 fac offers, claim advices / cash calls, bordereaux + statements on `PeriodClosed`, ICIEC format, UI | 382–386 | 202, 209 | AT-M10-3 | 5 |
| 211 | W19 | M19 basic (Art. 17 non-life, paid-up floor) + KPI dictionary (24 definitions) | 688, 1009 | 208, 210 | M15 gate input, A-test 39 | 4 |
| 213 | W19 | M11 performance reports, maturity ladder, Art. 16 Libyan-asset check, UI | 624–631, 1008 | 212 | AT-M11-3, A-test 35 | 4 |
| 216 | W19 | M16 governance: meetings, fatwa register, report engine, annual approval workflow, compliance certificates **signed by SSB members**, internal Sharia audit plan / findings, purification, zakat calc | 544–573 | 123a, F18 | AT-M16-3, A-tests 18–21 | 6 |
| 214 | W20 | M15 engine: formula per D00-02, Qard repaid first (incl. partial), solvency gate, largest-remainder allocation, approval chain (CFO → approving actuary → SSB → Board), one approved run per year | 575–609 | 210, 211, 212, 202, 209, 216 | AT-M15-1…4, A-tests 22–29 | 6 |
| 221 | W20 | M34 engine: ordered statutory pipeline (D-05), maker-checker-lock, retro, SHF journal, `PayrollRunApproved` | 657–672 | 220, 103 | AT-M34-1/2 | 6 |
| 223 | W20 | M17 AML: UN list import (incl. Libya 1970 regime), PEP / sanctions screening, risk scoring, alerts, goAML XML STR, complaints | 686, 1019 | 107, F07 | V-tests D-15 | 6 |
| 232 | W20 | Remaining product lines (seeded and tested): comprehensive motor, property / general, marine, Hajj / Umrah, Res. 315/2026 liability lines, three 2026 products (Q7), each with split rule + template | 40, 682, 1015 | 105, 106 | §1.1 products | 6 |
| 215 | W21 | M15 statements (PDF per participant), vouchers via M07, renewal credits applied by the M06 hook, credit → voucher expiry | 595–596, 609 | 214, 111, 112, 114 | AT-M15-5 | 5 |
| 222 | W21 | HR / payroll UI, self-service, payslip PDF, bank file, statutory SS / tax return data | 664–667 | 221, F18 | AT-M34-3 | 5 |
| 224 | W21 | M18: Art. 24 configurable layouts, Art. 22 registers, levy (SHF), ISA export | 687, 1004–1012 | 208, 210 | V-tests | 5 |
| 226 | W21 | M30 external adapters with simulators: registry, traffic, SMS (Libyana / Al Madar), e-mail, retakaful export, ISA export | 802–817 | F20 | §11 | 5 |
| 217 | W22 | M28 data: hourly `kpi_snapshot` (24 KPIs incl. payroll cost from 221), `rpt_*` views (PII-free, `security_barrier`), reporting role, Metabase guide | 495–542 | 211, 221, all P1 | AT-M28 hourly / read-only | 5 |
| 225 | W22 | M30 public REST API: OpenAPI, OAuth2 client credentials, per-client keys, rate limits | 808 | F12 | §11 | 5 |
| 227 | W22 | M22 Orange Card online + bureau simulator + inter-bureau claims flow | 692, 813 | 113, 116, 226 | V-tests B-16 | 5 |
| 228 | W22 | Staging masked-refresh pipeline | 835–842 | F16b | §12.2 | 3 |
| 218 | W23 | M28 dashboards 1–6 (ECharts, RLS) | 525–534 | 217 | AT-M28 | 5 |
| 219 | W23 | M28 dashboards 7–12 | 535–541 | 217 | AT-M28 | 5 |
| 229 | W23 | Content P2-A (finance / Sharia modules) + workflow maps (BPMN) | 761–787, 985 | 201–216 | §10 P2 | 5 |
| 309 | W23 | Security monitoring: security log stream, alerts (failed logins, privilege changes, bulk exports, RLS denials), incident-response runbook | 891 | F06, F11, F12 | §13 monitoring | 4 |
| 230 | W24 | Content P2-B (operations, HR, compliance) | 761–787 | 217–227 | §10 P2 | 5 |
| 231 | W24 | e2e for every §6 acceptance test (AR / EN), UAT scripts per role | 240–672, 987 | all P2 | "All §6 ATs pass" | 6 |
| S5 / S6 | W24 | Stabilisation | — | — | — | 8 |
| S7 / S8 | W25 | Stabilisation incl. **M15 golden run on the sample** → **P2 engineering gate** | — | — | G-P2 automated | 8 |

## Phase 3 engineering (W26–W28) and reactive waves

| WP | Wave | Name and scope | README lines | Deps | h |
|---|---|---|---|---|---|
| 301 | W26 | 3-year synthetic data + k6 (200 VUs, issue p95 < 2 s, close < 30 min, cold-start profile) | 890, 987 | P2 | 6 |
| 304 | W26 | DAST full + hardening | 890 | P2 | 4 |
| 305 | W26 | DR: daily encrypted logical backups to a second region, restore automation, measured RPO / RTO, runbooks | 889 | F16b | 4 |
| 306 | W26 | ARIMA migration ETL A: extract adapters, mapping engine, opening balances per fund (needs H18 schema; **agents never touch unmasked data**, see PLAN §7.6) | 927–929 | H18 | 6 |
| 302 / 303 | W27 | Performance tuning: DB (indexes, close, 100k-line posting) and web (bundle, PDF queue) | 987 | 301 | 10 |
| 307 | W27 | ARIMA ETL B: reconciliation reports, delta load, cutover scripts | 929 | 306, H19 | 6 |
| 308 | W27 | PDF manuals from LC; scripted video capture with AR / EN captions | 784–786, 989–990 | 229, 230 | 5 |
| 310 | W28 | Runbooks: cutover, hypercare (15 days), warranty severity SLA (2 h / 8 h / 2 days), weekly status-report template, training material for 5-day plan | 935, 991–995 | all | 4 |
| S9 | W28 | **P3 engineering gate** | — | — | 4 |
| RW1–RW10 | after W28 | Reactive waves: UAT defects ×3, pen-test fixes ×1, real integrations ×4 (acquirer, SMS, bureau, registry), trial-load fixes ×2 | — | Human triggers | about 70 total |

## Phase 4 (W29–W40, outline)

M14 chain, 7 deep: 401 data / cohorts / backfill → 402 PAA → 403 reinsurance held → 404 onerous / RA / curves → 405 GMM / VFA CSM → 406 FAS 43 view → 407 transition.

The other Phase 4 work packages:

| WPs | Module |
|---|---|
| 408–409 | M13 full |
| 410 | M19 full, including the life component |
| 411–414 | M20 family takaful |
| 415–418 | M21 health |
| 419–420 | M23 export credit |
| 421–422 | M25 customer portal |
| 423–424 | M26 visual designer |
| 425–426 | M22 offline PWA |
| 427–428 | Content and e2e |
| S10–S12 | Stabilisation |
