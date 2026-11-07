# TakafulTech — Plan V3: 6-Month Delivery (active plan)

| Item | Decision (product owner, 2026-11-07) |
|---|---|
| Scope | The client's **12 modules** from the Arabic technical proposal (العرض الفني) **+ HR + payroll** |
| Stack | **TypeScript** (Next.js, PostgreSQL 17), delivered as one Docker package for the company's servers or the cloud. The client signs off the change from the brief's Python/Odoo (GOV decision) |
| Language | **Arabic-first everywhere**, with the editable terminology dictionary (`ARABIC-DICTIONARY-SPEC.md`) |
| Agents | **At most 4 agents at a time** (builders, reviewer or fixers) |
| CI | **No GitHub Actions.** All gates run locally in the build session's container. GitHub is used only to push the integration branch |
| Target | **6 months:** 3 months building, 1 month testing with both systems live in parallel, 2 months of supervised live operation, then handover and a 6-month warranty |
| Supersedes | `PLAN-V2-30D.md` (30-day plan). `PLAN-V1.md` stays as the reference audit of the full README |

---

## 1. The 6 months at a glance

This matches slide 20 of the client deck (`docs/presentation/`).

| Phase | Month | Main work | Exit criteria |
|---|---|---|---|
| Build | 1 | Platform foundation, fund engine and ledger core; customers, underwriting, policy issue, billing | Client sees these 4 modules working on staging |
| Build | 2 | Accounting screens and statements, claims, retakaful, agents and commission | Client sees full policy → receipt → claim → recovery → journal flow on staging |
| Build | 3 | Sharia governance, investments, surplus, dashboards, HR, payroll; import tool; security sweep and penetration test | Software-complete gate (§5.4) passed; pen-test findings fixed or accepted |
| Testing and parallel run | 4 | Data migration from the current system (ARIMA on Oracle), bank and SMS integration, **both systems live side by side with figures compared daily**, training, UAT | Go / no-go checklist (§6.2) signed |
| Supervised operation | 5–6 | Old system switched to read-only, new system runs the business with the build team on call, two full month-end closes | Acceptance certificate signed; handover pack delivered |
| Warranty | +6 | Defect fixes at no cost | — |

---

## 2. What the final platform is (handover, end of month 6)

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

### 2.1 Compliance minimums built inside the 12 modules

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

## 3. Will it be compliant?

| Area | Status at handover | What the company still has to do |
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

## 4. What is missing, and is it a big deal?

| Left out of this project | Big deal? | Why / what happens instead |
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

**Bottom line:** for a single company running general takaful, nothing in this list blocks running the business or compliance. The real dependencies are the company's decisions and approvals (§8).

---

---

## 5. Build: months 1–3

### 5.1 Effort

Estimated in weeks of work for one experienced human developer, for the full platform as described in §2.

| Part | Weeks |
|---|---|
| Foundation: login, roles, audit, dictionary, settings, environments, Docker, PDF and QR | 6 |
| Customers 3 · Underwriting 4 · Policy issue and renewal 4 · Contributions and billing 5 | 16 |
| Claims 5 · Retakaful 5 · Agents 3 · **Accounting with two funds 7** | 20 |
| Sharia 3 · Investments 3 · Surplus 3 · Dashboards 3 · HR 3 · Payroll 3 | 18 |
| Data migration tool 4 · Integrations (banks, SMS, e-signature) 3 · Testing and security hardening 5 | 12 |
| **Total** | **≈ 78 weeks (≈ 18 person-months)** |

13 weeks of build means about 6 developers' worth of output in parallel. Four builder agents produce that volume; the limit is **human review and client answers**, not coding speed. The plan therefore assumes one experienced human lead reviewing full-time, the 12 key questions answered by week 2, and scope frozen at the end of month 1.

### 5.2 Build units by month

The 84 build units (BU, 4–6 agent-hours each, defined in `BUILD-UNITS.md` and §4 of `PLAN-V2-30D.md`) are regrouped so each month ends with modules the client can see working. Each wave stays: build (≤4 builders) → fresh review agent runs every gate → fix → merge + full local gate, about 10–11 h.

| Month | Weeks | Build units | Waves | Client checkpoint (end of month) |
|---|---|---|---|---|
| 1 | 1–4 | Platform BU-01…BU-20 and BU-24 test harness · fund engine BU-21 · ledger core BU-26 · contribution split BU-33 · CRM BU-22, BU-25, BU-28 · dictionary admin BU-29 · agents register and border points BU-30 · products BU-27, BU-35 · underwriting BU-34, BU-40 · policy BU-41, BU-46, BU-52 · billing core BU-47, BU-53 | ≈ 10 | Customers, underwriting, policy issue with PDF and QR, receipts split between the funds |
| 2 | 5–9 | Accounting BU-36, BU-44, BU-58, BU-62 · claims BU-48, BU-54, BU-59 · retakaful BU-45, BU-55, BU-60 · agents and commission BU-56, BU-61 · payment rails and dunning BU-57, BU-63 | ≈ 4 | End-to-end money flow with per-fund trial balance and financial statements |
| 3 | 10–13 | Sharia BU-38, BU-67 · investments BU-43, BU-51 · solvency and surplus BU-66, BU-72, BU-79 · reporting BU-68, BU-69, BU-71, BU-73, BU-74 · HR BU-23, BU-31, BU-37 · payroll BU-42, BU-50 · import tool BU-65 · Arabic content BU-70 · tests, security, manuals, load, golden numbers BU-75, BU-76, BU-78, BU-80…BU-84 | ≈ 7 | All 14 modules on staging; software-complete gate; pen-test report |

About 21 waves and 220 engineering hours (310 h with 1.4× contingency) fit inside 13 weeks at roughly 4–5 hours of orchestrated build per day. The spare calendar time absorbs late client answers, human review and rework from the client's monthly checkpoint feedback.

### 5.3 CPU budget (4 vCPU / 15 GB container, no Docker, no GitHub Actions)

| Rule | Detail |
|---|---|
| Agents | At most 4 at any moment. During review: 1 reviewer, with builders idle |
| Database | One local PostgreSQL server, one database per builder (`createdb bu_<id>`). PG16 is installed; production runs PG17, so SQL is kept to the common subset |
| Builder tests | Unit and property tests for their own package, run single-threaded (`vitest --pool=forks --poolOptions.forks.singleFork`) |
| Heavy suites | Playwright end-to-end, the full suite and the load test run **only by the reviewer or at merge**, one at a time under a lock file (`flock /tmp/takafultech-heavy.lock`) |
| Chromium | At most one Chromium instance (PDF engine or Playwright), reused |
| Load test | Small k6 run (≤200 virtual users) against staging, once, in month 3 |
| Evidence | The reviewer's local gate logs (commit SHA, command, exit code, full output) are committed under `docs/plan/evidence/Wnn/`. For money waves the auditor re-runs the ledger, row-security and migration gates itself on a clean checkout. |

### 5.4 Gates (all local, `pnpm gate`)

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

---

## 6. Month 4: testing and parallel run

### 6.1 Work

| Week | Work |
|---|---|
| 13–14 | Migration rehearsal 1 and 2 from ARIMA / Oracle into staging: customers, active policies, open claims, agents, opening balances per fund. Every rehearsal ends with a reconciliation report |
| 14 | Bank statement import, SMS gateway and e-signature certificate connected on production |
| 14–17 | **Parallel run:** both systems record the same business every day. A daily comparison report checks policy count and contributions per product, receipts and cash-up per branch, claim reserves and payments, agent commission, and per-fund trial balance. Money differences must be zero or explained the same day |
| 15–16 | Training by role (5 days), Arabic manuals and videos; UAT scripts run by the company's staff |
| 17 | Final migration, penetration-test retest, go / no-go meeting |

### 6.2 Go / no-go checklist

| Item | Owner |
|---|---|
| UAT signed by each department head | Company |
| Parallel-run differences zero or explained for 10 consecutive working days | Build team + finance |
| Opening balances per fund reconciled and signed by the CFO | Company |
| Sharia board approval of products, split rules, documents and surplus method | Company (SSB) |
| Pen-test: no open critical or high findings | Build team |
| Backups and restore drill passed on production | Build team |
| Hosting legally cleared (data law, Art. 78) | Company |

---

## 7. Months 5–6: supervised live operation

| Item | Detail |
|---|---|
| Cut-over | Start of month 5. The old system becomes read-only for history |
| Support | Build team on call during working hours; critical issues fixed within 24 hours; daily health and reconciliation report |
| Month-end | Two full month-end closes in the new system, reviewed with the finance team and the external auditor |
| Automation | Atmet smart assistant in "suggest only" mode; every confirmation logged; no action without an employee's confirmation |
| Handover (end of month 6) | Source code, Docker package, operations runbook, backup and restore guide, admin training, acceptance certificate |
| Warranty | 6 months after handover |

---

## 8. Roles (unchanged in spirit; lighter in process)

| Role | Job |
|---|---|
| **Build orchestrator** (build session) | Writes each builder brief from this plan + README sections + the client's decisions. Launches ≤4 builders. Spawns a fresh review agent. Runs fixes. Merges. Pushes the integration branch |
| **Review agent** | Fresh context each wave. Runs all gates itself. Checks fund separation, row security, maker-checker, Arabic text. Returns findings by severity |
| **Auditor** (this planning session or its successor) | Approves wave briefs. Re-runs critical gates on money waves. Tracks client decisions. Signs off each wave and the software-complete gate |
| **Client** | Answers the decision workbook on time; joins UAT; gets the approvals |

`AGENT-PROTOCOL.md` gives the full templates. In V2: "CI of record" means the local gate run; branch rules are as in PLAN-V1 §7.3; reviewer concurrency counts toward the 4.

---

## 9. Client decisions drive the schedule

The Arabic decision workbook (`docs/decisions/`) and the 12 key questions in the demo collect what only Takaful Insurance can decide. The workbook's `needed_by_day` values came from the 30-day plan; under this plan they map to weeks:

| Needed by | Topics |
|---|---|
| Week 1 | Contract and go-live: tech stack sign-off, hosting location, environments, import scope, external costs, current system access |
| Week 2 | Fund rules (Wakala % and basis, split), accounting basis, chart of accounts, fiscal year, numbering, roles and approval limits, dictionary rules |
| Week 3 | CRM, products, underwriting, policy, Sharia status rules |
| Week 4 | Billing, claims, agents and commission, retakaful, investments, reserves |
| Week 8 | HR, payroll rates, surplus method |
| Week 9 | Dashboards and KPI definitions |

**If a decision is late**, builders use the recommended option, flagged «افتراضي – بانتظار القرار» (default, awaiting decision) in the dictionary and UI, and change it when the answer arrives. A late answer on a money rule (fund split, Wakala basis, surplus method) costs about one wave.

---

## 10. Changes from PLAN-V2 (30 days)

| Change | Reason |
|---|---|
| Build stretched from about 3 weeks to 3 months | Full effort is ≈ 78 developer-weeks; human review and client answers set the pace, not agent speed |
| New month 4 with both systems live in parallel | Proves the numbers against the current system before switching it off |
| New months 5–6 of supervised live operation with two month-end closes | Accounting is only proven after real closes; the company runs live with the team on call |
| Penetration test inside month 3, retest in month 4 | Security fixes land before go-live, not after |
| Decision deadlines in weeks instead of days | Matches the longer build |

Unchanged from V2: scope, stack, the ≤4-agent rule, local gates, build-unit definitions, compliance minimums and the review discipline.
