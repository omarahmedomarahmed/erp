# TakafulTech — Plan V2: Lean 30-Day Build (active plan)

| Item | Decision (product owner, 2026-10-28) |
|---|---|
| Scope | The client's **12 modules** from the Arabic technical proposal (العرض الفني) **+ HR + payroll** |
| Stack | **TypeScript** (Next.js, PostgreSQL). The client must sign off the change from the brief's Python/Odoo (GOV decision) |
| Language | **Arabic-first everywhere**, with the editable terminology dictionary (`ARABIC-DICTIONARY-SPEC.md`) |
| Agents | **At most 4 agents at a time** (builders, reviewer or fixers) |
| CI | **No GitHub Actions.** All gates run locally in the build session's container. GitHub is used only to push the integration branch. |
| Target | **Day 30:** all modules built, tested, deployed to staging, with client UAT under way |
| Supersedes | `PLAN-V1.md`, kept as the reference audit of the full README |

---

## 1. What the final platform is (day 30)

One web platform in Arabic, RTL, for the staff of Takaful Insurance Company, usable on computer, tablet and phone.

| # | Module (brief §) | What staff can do |
|---|---|---|
| 1 | CRM (3.1) | One record per person or company; documents with expiry alerts; full change history; duplicate and fraud checks; KYC and PEP fields; UN sanctions-list screening |
| 2 | Policy issue and renewal (3.2) | Issue, endorse, cancel, renew. Signed and stamped Arabic PDF with QR. Daily scan sends an SMS or e-mail 30 days before expiry |
| 3 | Underwriting (3.3) | Rules engine with an instant decision; referrals to the approval matrix with a task and alert |
| 4 | Claims (3.4) | The exact 6 stages (مسجلة ← مراجعة ← مقدرة ← موافق عليها ← مصروفة ← مغلقة); 5-working-day SLA dashboard; payment from the participants' fund only |
| 5 | Retakaful (3.5) | Proportional and non-proportional treaties; automatic recovery when a claim exceeds retention; claim advices; monthly reconciliation |
| 6 | Contributions and billing (3.6) | Monthly, quarterly or annual plans; receipts posted automatically; local card and bank-transfer rails. Stripe and PayPal are built but switched off (not available in Libya) |
| 7 | Agents and brokers (3.7) | Own dashboard per agent; tiered commission by volume and KPIs; clawback on cancellation |
| 8 | Accounting (3.8) | Double entry, with automatic journals for issue, collection, claim and commission. Balance sheet, income statement and trial balance at one click, per fund and per class |
| 9 | Dashboards and reports (3.9) | 24 KPIs refreshed hourly, 12 dashboards, a Metabase / Power BI read-only connection |
| 10 | Sharia compliance (3.10) | Mandatory «الحالة الشرعية» on every contract and transaction; the database blocks mixing participants' and shareholders' money; SSB report engine, annual approval, compliance certificates |
| 11 | Surplus (3.11) | Year-end net surplus calculation, pro-rata distribution, individual statements, payment vouchers or a discount on the next renewal |
| 12 | Investments (3.12) | Murabaha, Mudaraba and Ijara; capital and profit tracking; return split between the funds (Mudarib share); periodic reports |
| + | HR | Organisation, employees, contracts, leave, attendance, staff advances, end of service, self-service. Hiring creates a login and termination disables it the same day |
| + | Payroll | Monthly run with maker-checker; social security, tax, stamp and solidarity from editable rate tables; Arabic payslips; bank file; journal to the shareholders' fund |
| + | Platform | Users, roles and access levels; maker-checker; audit trail; Arabic terminology dictionary page; three environments (development, staging, production); daily backups; user manuals (Arabic PDF) and videos |

### 1.1 Compliance minimums built inside the 12 modules

These are small additions, but without them the platform would not be compliant.

| Requirement | Where it lives | Why it can't be skipped |
|---|---|---|
| Technical reserves with Libyan floors (Law 3/2005 Art. 15); IBNR entered by the actuary | Accounting / surplus | The client's own surplus formula deducts «المخصصات» (provisions) |
| Separate accounts per insurance class (Art. 23) | Accounting dimension | Legal requirement; also needed for loss ratio by line |
| Basic solvency check (Art. 17) | Surplus gate | No distribution while insolvent |
| Registers (Art. 22), supervision levy (Art. 4), annual statements exported to Excel (Art. 24) | Reports | Regulator obligations; cheap to produce from the ledger |
| Assets covering reserves held in Libya (Art. 16) | Investments check | Legal requirement |
| KYC, PEP and UN sanctions screening; consent records (Law 6/2022 Arts. 73–79) | CRM | AML Resolution 1013/2017; data law |
| Audit trail, maker-checker, segregation of duties | Platform | Brief asks for tracking logs and anti-manipulation; auditors expect it |
| Data import: customers, active policies, open claims, opening balances | Go-live tool | Without it the system starts empty |

---

## 2. Will it be compliant?

| Area | Status at day 30 | What the company still has to do |
|---|---|---|
| **Sharia** (AAOIFI SS 26; their Articles) | **Compliant by design.** Funds are separated in the database, Wakala and Mudaraba flows are explicit, there is no interest (late fees go to charity), surplus goes 100% to participants, Qard Hasan is tracked, and `sharia_status` is on every transaction | The SSB approves products, split rules, document wording and the surplus method |
| **Libyan insurance law** (Law 3/2005) | **Supported**: reserves and floors, solvency, per-class accounts, registers, levy, annual statements | Confirm the ISA return layouts (filled from our Excel export in year 1); the actuary signs off reserves |
| **Accounting standards** | Local / regulatory basis with AAOIFI FAS 42-style fund presentation | Confirm with the external auditor and the ISA that FAS 43 / IFRS 17 measurement is not required yet. If it is, it is a later project |
| **Compulsory motor** (Law 28/1971 + 2026 decisions) | Product rules configurable | Supply the 2026 decision texts (limits, commission caps) |
| **AML / CFT** | KYC, PEP and sanctions screening; alerts | Suspicious-transaction reports are filed manually on the goAML portal (automation deferred) |
| **Data protection** (Law 6/2022) | Consent and correction records; encryption of IDs, bank accounts and salaries | Hosting location decision plus a legal opinion if data is stored abroad (Art. 78) |
| **Labour / payroll** | Rate tables editable, all marked "to confirm" | The payroll accountant confirms social security (20.5% total), tax bands, stamp and solidarity |
| **E-signature** | PAdES signing works with any certificate | Choose the certificate provider; until then, test certificates on staging |

**Verdict:** the platform will be compliant for the business it runs, provided the company completes the approvals in the right-hand column. No software is "compliant" until the SSB, auditor and regulator accept it, and these approvals are the company's actions, not code.

---

## 3. What is missing, and is it a big deal?

| Left out of the 30 days | Big deal? | Why / what happens instead |
|---|---|---|
| Family takaful, health, export credit lines | **Business decision, not compliance.** The client sells these today | They stay on the current system (ARIMA) until a phase 2. They need special engines (savings accounts, medical network, buyer limits) that the brief did not ask for |
| IFRS 17 / FAS 43 measurement engine | Only if the auditor or ISA demands it | Not in the brief. Data needed later is captured from day 1 |
| Learning Center platform | No | The brief asks for manuals, videos and workshops. We deliver Arabic PDF manuals, videos and the "i" help icon |
| Offline border app | No | Not in the brief. Border points issue online |
| Full AML case management / automatic STR filing | Low | Screening and alerts are built; reports are filed manually on goAML |
| Customer self-service portal | No | Not in the brief |
| Live national registry / traffic connections | No | The brief asks for APIs that allow connecting "in future". The REST API is built; connections come when the authorities grant access |
| Full history migration from ARIMA | Medium | Go-live needs open business and balances, which the import tool covers. Old history stays readable in ARIMA |
| Other countries, multi-company tooling | No | One client |

**Bottom line:** for a single company running general takaful, nothing in this list blocks running the business or compliance. The real dependencies are the company's decisions and approvals (§6).

---

## 4. Build schedule: 21 waves, ≤4 agents at a time, local gates

Each wave: **build** (≤4 builders, 5–6 h) → **review** (1 fresh review agent runs every gate itself, 1.5 h) → **fix** (1.5 h) → **merge + full local gate** (1–1.5 h). That is about **10–11 h per wave**. A unit is a *build unit* (BU) of 4–6 agent-hours.

| Wave | Build units (≤4) | Depends on |
|---|---|---|
| W1 | BU-01 monorepo, conventions, **local gate runner** · BU-02 decisions log (from the client workbook) · BU-03 golden test scenarios (fund lifecycle, surplus, retakaful, commission, payroll; numbers signed by the client's accountant) | — |
| W2 | BU-04 database conventions, migrations, roles, row-level security context · BU-05 money (3 decimals), dates, Hijri · BU-06 design system A (RTL, "i" icon, responsive) · BU-07 i18n + dictionary core (no hard-coded text) | W1 |
| W3 | BU-08 login (password + OTP / passkeys) · BU-09 audit trail · BU-10 background worker + events · BU-11 design system B (tables, forms, dates, shell) | W2 |
| W4 | BU-12 company settings, calendar, holidays, numbering · BU-13 «الحالة الشرعية» registry · BU-14 roles, access levels, scopes, segregation of duties · BU-16 PDF engine (Arabic fonts, e-signature, QR) | W3 |
| W5 | BU-15 protected posting / numbering functions · BU-17 SMS / e-mail hub (staging mailbox only) · BU-18 dictionary runtime (edit once → everywhere) · BU-20 maker-checker, approval matrix, task inbox | W4 |
| W6 | BU-19 environments (dev, staging, prod), backups, restore drill · BU-21 **fund engine schema** (PTF / SHF / PIF, per-fund balancing, no mixing) · BU-22 CRM domain · BU-24 test harness and generator | W5 |
| W7 | BU-26 ledger core (posting rules, per-class accounts, trial balance) · BU-27 product factory · BU-25 Arabic search + sanctions screening · BU-23 HR organisation and employee master | W6 |
| W8 | BU-33 contribution split, Wakala fee, Qard Hasan · BU-28 CRM screens (360, documents, history, merge) · BU-29 **dictionary admin page** · BU-30 agents register, border points, number blocks | W7 |
| W9 | BU-34 underwriting rules engine · BU-35 product screens + product seeds (compulsory and comprehensive motor, Orange Card, travel, property, marine, Hajj / Umrah) · BU-38 Sharia board register + exceptions · BU-31 HR contracts, leave, attendance, advances, end of service | W8 |
| W10 | BU-40 underwriting approvals + screens · BU-41 policy domain (issue, endorse, cancel, renew) · BU-36 accounting screens + trial balance · BU-37 HR screens + self-service | W9 |
| W11 | BU-46 policy PDF, QR, 30-day expiry scan · BU-47 billing domain (receipts → split → journal; refunds; cash-up; late fee → charity) · BU-48 claims domain (6 stages, SLA, case reserves) · BU-42 payroll engine | W10 |
| W12 | BU-52 60-second issue screens (motor, travel) · BU-53 billing screens · BU-54 claims screens (timeline, SLA dashboard, mobile surveyor) · BU-50 payroll screens, payslips, bank file | W11 |
| W13 | BU-45 retakaful treaties + cession · BU-56 commission engine · BU-57 payment rails (local cards, bank import; Stripe / PayPal behind flags) · BU-44 balance sheet + income statement per fund / class | W12 |
| W14 | BU-55 retakaful recovery on claim approval · BU-59 claim payment from participants' fund, salvage, subrogation · BU-61 agent dashboard + targets · BU-63 recurring billing, dunning, bank reconciliation | W13 |
| W15 | BU-60 bordereaux + monthly reconciliation · BU-62 reserves with Libyan floors · BU-58 period close, FX, payables, fixed assets, budgets · BU-43 investments domain | W14 |
| W16 | BU-66 solvency check + KPI definitions · BU-67 Sharia governance (reports, annual approval, certificates, purification, zakat) · BU-51 investment screens + reports · BU-65 **data import tool** | W15 |
| W17 | BU-72 **surplus engine** · BU-68 hourly KPIs + reporting views + Metabase role · BU-69 regulatory pack (registers, levy, Art. 24 Excel) · BU-71 REST API (OpenAPI) | W16 |
| W18 | BU-79 surplus statements, vouchers, renewal discount · BU-73 dashboards 1–6 · BU-74 dashboards 7–12 · BU-70 Arabic content pass (dictionary seed, "i" texts) | W17 |
| W19 | BU-75 end-to-end acceptance tests A · BU-76 end-to-end tests B + role-access matrix · BU-78 security sweep · BU-81 Arabic user manuals + video scripts | W18 |
| W20 | BU-80 light load test + tuning · BU-82 UAT scripts + staging release · BU-83 golden-number verification (surplus, payroll) · BU-84 stabilisation | W19 |
| W21 | Stabilisation (≤4 units) → **software-complete gate** | W20 |
| RW1–RW3 | Reactive waves from client UAT feedback | UAT |

About 84 build units, about 420 builder agent-hours.

### 4.1 Timeline

| Operating mode | Engineering (21 waves × 10.5 h ≈ 220 h; ×1.4 contingency ≈ 310 h) | Day 30 status |
|---|---|---|
| **Orchestrator running about 20 h/day** (autonomous, with scheduled check-ins) | Software complete by **about day 16–18** | UAT days 18–30 with 2–3 reactive fix waves. **Fits, with margin** |
| About 15 h/day | Software complete by **about day 21** | UAT days 21–30. **Fits, tight** |
| 8 h/day | About day 39 | **Does not fit** |

Go-live is decided by the company once UAT is signed, the SSB has approved, data has been imported and reconciled, and hosting is legally cleared. If they move quickly, go-live with new business can follow within days of day 30.

### 4.2 CPU budget (4 vCPU / 15 GB container, no Docker, no GitHub Actions)

| Rule | Detail |
|---|---|
| Agents | At most 4 at any moment. During review: 1 reviewer, with builders idle |
| Database | One local PostgreSQL server, one database per builder (`createdb bu_<id>`). PG16 is installed; production runs PG17, so SQL is kept to the common subset |
| Builder tests | Unit and property tests for their own package, run single-threaded (`vitest --pool=forks --poolOptions.forks.singleFork`) |
| Heavy suites | Playwright end-to-end, the full suite and the load test run **only by the reviewer or at merge**, one at a time under a lock file (`flock /tmp/takafultech-heavy.lock`) |
| Chromium | At most one Chromium instance (PDF engine or Playwright), reused |
| Load test | Small k6 run (≤200 virtual users) against staging, once, in W20 |
| Evidence | The reviewer's local gate logs (commit SHA, command, exit code, full output) are committed under `docs/plan/evidence/Wnn/`. For money waves the auditor re-runs the ledger, row-security and migration gates itself on a clean checkout. |

### 4.3 Gates (all local, `pnpm gate`)

| Gate | Checks |
|---|---|
| G1 | Typecheck (strict; missing "i" key = compile error) |
| G2 | Lint: no raw HTML controls, no floating-point money, no hard-coded rates, **no literal UI text** |
| G3 | Unit + property tests (per-fund trial balance always balances over 10,000 random events) |
| G4 | Migrations up → down → up |
| G5 | Row-level security per role; segregation of duties; no self-approval |
| G6 | Ledger rules: no cross-fund journal without a transfer; closed period blocked; posted entries immutable; `sharia_status` mandatory |
| G7 | `dictionary:check`: every key has Arabic; every term reference resolves |
| G8 | End-to-end in Arabic RTL on desktop and mobile size, run serially |
| G9 | Secret scan and dependency audit |
| Review | 0 open BLOCKER or HIGH findings before merge |

---

## 5. Roles (unchanged in spirit; lighter in process)

| Role | Job |
|---|---|
| **Build orchestrator** (build session) | Writes each builder brief from this plan + README sections + the client's decisions. Launches ≤4 builders. Spawns a fresh review agent. Runs fixes. Merges. Pushes the integration branch |
| **Review agent** | Fresh context each wave. Runs all gates itself. Checks fund separation, row security, maker-checker, Arabic text. Returns findings by severity |
| **Auditor** (this planning session or its successor) | Approves wave briefs. Re-runs critical gates on money waves. Tracks client decisions. Signs off each wave and the software-complete gate |
| **Client** | Answers the decision workbook on time; joins UAT; gets the approvals |

`AGENT-PROTOCOL.md` gives the full templates. In V2: "CI of record" means the local gate run; branch rules are as in PLAN-V1 §7.3; reviewer concurrency counts toward the 4.

---

## 6. Client decisions drive the schedule

Every module has rules and edge cases only Takaful Insurance can decide. They are collected in the **Arabic decision workbook** (`docs/decisions/`, published as a shareable Arabic page). Each decision has options, our recommendation and a **needed-by day**:

| Needed by | Topics |
|---|---|
| Day 2–3 | Contract and go-live: tech stack sign-off, hosting location, environments, import scope, external costs |
| Day 4 | Fund rules (Wakala % and basis, split), accounting basis, chart of accounts, fiscal year, numbering, roles and approval limits, dictionary rules |
| Day 5–6 | CRM, products, underwriting, policy, Sharia status rules, HR, payroll |
| Day 7–8 | Billing, claims, agents and commission, retakaful, investments, reserves |
| Day 10 | Surplus method |
| Day 11 | Dashboards and KPI definitions |

**If a decision is late**, builders use our recommended option, flagged «افتراضي – بانتظار القرار» (default, awaiting decision) in the dictionary and UI, and change it when the answer arrives. Late answers on money rules (fund split, Wakala basis, surplus method) cost about 1 wave each.

---

## 7. Changes from PLAN-V1

| Removed or deferred | Reason |
|---|---|
| M13 full actuarial engine, M14 IFRS 17, M17 full AML, M18 as a module, M19 full, M20–M23, M25, M26 visual designer, M29 Learning Center platform, M31 masking sandbox, M32 module-request tracker, tenant factory / Terraform, offline app, other countries | Outside the brief's 12 modules + HR / payroll; embedded minimums kept (§1.1) |
| 8-agent and GitHub Actions options | Owner decision: ≤4 agents, local gates |
| Hash-chained audit, ASVS L3, cross-region DR | Replaced by: append-only audit with daily integrity check; ASVS L2; daily backups + restore drill |

Kept from V1: the money decisions (D00 → now asked to the client in Arabic), table ownership, migration ranges, the review discipline, the Arabic dictionary, and the BU naming.
