# Core Islamic Insurance

**A core takaful (Islamic insurance) platform.** First client: **Takaful Insurance Company (شركة التكافل للتأمين), Tripoli, Libya.**

This README is the complete build specification. It is written so that an engineer, or Claude Code, can build the system from it module by module. Read sections 1–5 before writing any code.

| Section | Contents |
|---|---|
| 1 | What we are building and the fixed decisions |
| 2 | How to build this repository (instructions for Claude Code) |
| 3 | Tech stack and repository structure |
| 4 | Platform-wide rules (apply to every module) |
| 5 | Takaful fund model (the heart of the system) |
| 6 | The client's 12 required modules, exactly as requested, plus the takaful research |
| 7 | HR and payroll (added by us) |
| 8 | Platform and supporting modules |
| 9 | Access model |
| 10 | "i" icon and Learning Center |
| 11 | Integrations |
| 12 | Architecture and deployment |
| 13 | Security |
| 14 | Data masking, simulation and migration |
| 15 | Phases, milestones and acceptance |
| 16 | Testing, training, documentation, warranty |
| 17 | Libya rule pack (regulations encoded as data) |
| 18 | Open questions and configurable parameters |
| 19 | Requirement traceability |
| 20 | Abbreviations |

---

## 1. What we are building

### 1.1 Product

| Item | Decision |
|---|---|
| Name (working) | Core Islamic Insurance |
| Category | Core takaful platform (insurtech). **Not** called an ERP (Enterprise Resource Planning) system anywhere in the product or docs |
| First client | Takaful Insurance Company, Tripoli, Libya. Full Takaful, general (non-life) insurer, hybrid Wakala (agency fee for underwriting) + Mudaraba (profit share for investment). Founded 2007, LYD (Libyan Dinar) 10 million capital, ~USD 13.8 million gross written premium (2024). Products: compulsory motor, comprehensive motor, Orange Card (Unified Arab Card), travel, health, family takaful, general/property, marine, Hajj/Umrah, export credit. Agents at land, sea and air border points and vehicle licensing offices. Current system very likely ARIMA (Oracle + .NET) |
| Later clients | Other Arab and Islamic insurers. Every country-specific rule lives in a **rule pack** (data), never in code |
| Source of requirements | (1) The client's technical proposal "العرض الفني — تطوير نظام التكافل التأميني الشامل" (12 modules), implemented **exactly as written** in section 6. (2) Takaful research (AAOIFI, IFRS 17, IFSB, Libyan Law 3/2005 and decisions), added on top. (3) HR and payroll, added by us (section 7) |

### 1.2 Fixed decisions (do not change without the product owner)

| # | Decision |
|---|---|
| D1 | One codebase for all clients. Per-client branding, modules, workflows and rules come from configuration |
| D2 | Each client company gets **its own Neon project** (separate PostgreSQL database, compute, roles, backups) and **its own Vercel project**. No two clients ever share a database or deployment |
| D3 | Modules can be switched on/off per client. Clients can request new modules (M32) |
| D4 | Every UI component has an "i" icon that opens a plain-language Arabic/English explanation (section 10) |
| D5 | A module-by-module Learning Center with smart Arabic/English search |
| D6 | Many employees, separated by module, with access levels per module, maker-checker and segregation of duties |
| D7 | Arabic-first, right-to-left (RTL) layout, English toggle, Hijri and Gregorian dates, LYD with 3 decimals, multi-currency |
| D8 | Our own tech stack (TypeScript). The client knows and accepts this |
| D9 | Strong cybersecurity and database security (section 13) |
| D10 | Phase 1 runs on a **masked sample** of the client's real data. No message can ever reach a real person from the sandbox |
| D11 | All 12 client modules are built as the client described them (section 6), extended with takaful rules from the research. HR and payroll are also built |
| D12 | All takaful logic is ours. We use proven open-source libraries for plumbing (authentication, encryption, queues, PDF), running inside our own deployment, with no third-party SaaS (software as a service) holding business data |

---

## 2. How to build this repository (instructions for Claude Code)

### 2.1 Work order

Build in the milestone order in section 15. Inside a milestone, build in this order: database migration → domain logic + unit tests → API → UI → "i" content → Learning Center lesson → end-to-end test.

### 2.2 Definition of done (every feature)

| # | Check |
|---|---|
| 1 | SQL migration written, reversible, applied in CI (continuous integration) |
| 2 | Domain logic in `packages/domain`, with unit tests; fund-engine logic also has property tests |
| 3 | Server-side permission check on every API route (module + access level + branch/fund scope) |
| 4 | Row-level security (RLS) policy on every new business table, with a test per role |
| 5 | Every UI component carries an `infoKey`; Arabic and English "i" text exists in `content/help/` |
| 6 | A Learning Center lesson is added or updated for the module |
| 7 | Audit events emitted for every write |
| 8 | No hard-coded rates, percentages, limits or country rules; all come from configuration or the rule pack |
| 9 | Arabic RTL and English layouts both checked in Playwright screenshots |
| 10 | Money uses `numeric(20,3)` in the database and a decimal library in code. Never floating point |
| 11 | End-to-end test for the main workflow passes |

### 2.3 Non-negotiable coding rules

| Rule | Detail |
|---|---|
| R1 | Every financial posting belongs to exactly one fund (PTF, PIF or SHF). See section 5 |
| R2 | Posted journals are never updated or deleted, only reversed |
| R3 | Every contract and every financial transaction has a mandatory `sharia_status` (section 6.10) |
| R4 | No Neon-only or Vercel-only features in business logic. Plain PostgreSQL 16 SQL. The app must also run from a Docker image |
| R5 | Long jobs (imports, batch PDFs, period close, reserving, surplus, payroll runs, IFRS 17) run in `apps/worker`, never in a Vercel function |
| R6 | Outbound SMS, e-mail and WhatsApp go through the Integration Hub (M30). In sandbox tenants these connectors are disabled at code level and messages land in an internal mailbox screen |
| R7 | Every rule (rate, split, cap, floor, tax band, commission tier) is versioned and effective-dated; running records keep the version they started with |
| R8 | Raw HTML controls are not allowed outside the design system (lint rule) |

---

## 3. Tech stack and repository structure

### 3.1 Stack

| Layer | Choice | Why |
|---|---|---|
| Language | TypeScript (strict) | One language for UI, API and worker; types enforce `infoKey` and money types |
| Web app + API | Next.js (App Router) on Vercel | Server rendering for slow links; route handlers for the API |
| UI | Own design system on Radix UI primitives; Tailwind CSS with logical properties for RTL | Every component requires `infoKey` |
| i18n | next-intl; Arabic default | Arabic/English |
| Database | PostgreSQL 16 on Neon | RLS, constraints, JSONB, full-text search, `pg_trgm` |
| Data access | Drizzle ORM for queries; hand-written SQL migrations | Portable plain SQL |
| Validation | Zod schemas shared by UI, API and worker | One definition per field rule |
| Money | `numeric(20,3)` + decimal.js | LYD has 3 decimals (1 dinar = 1,000 dirhams) |
| Dates | Temporal polyfill; Hijri via Intl `islamic-umalqura` calendar | Hijri/Gregorian side by side |
| Authentication | Better Auth (self-hosted in our app, data in our DB): password + TOTP (time-based one-time password) + passkeys (WebAuthn) | MFA (multi-factor authentication) without third-party identity SaaS |
| Job queue | pg-boss (queue inside PostgreSQL) | Transactional with business data; no extra infrastructure |
| Worker | Node.js container (Docker), deployed in the same region | Long jobs |
| PDF | Headless Chromium (Playwright) in the worker; HTML templates | Correct Arabic shaping; electronic signature and stamp image applied server-side; PAdES (PDF Advanced Electronic Signatures) signing with a per-tenant certificate |
| Object storage | S3-compatible bucket per tenant, encrypted with a tenant key | Documents, photos, certificates |
| Search | PostgreSQL full-text search + `pg_trgm` + Arabic normalisation function + synonym table | No external search service |
| Dashboards | Own dashboards (ECharts) + read-only reporting role/replica for Metabase or Power BI | Matches client request (section 6.9) |
| Testing | Vitest (unit), fast-check (property tests), Playwright (end-to-end, screenshots), k6 (load/stress) | |
| CI/CD | GitHub Actions → Vercel; migrations applied per tenant by CI | |
| Infrastructure as code | Terraform (Neon, Vercel, AWS bucket, worker, secrets) | New client stack in under a day |

### 3.2 Repository layout

```
core-islamic-insurance/
├─ apps/
│  ├─ web/                 # Next.js app: UI + API route handlers
│  └─ worker/              # pg-boss workers: imports, PDFs, closes, payroll, surplus…
├─ packages/
│  ├─ db/                  # SQL migrations, Drizzle schema, RLS policies, seed data
│  ├─ domain/              # Pure business logic per module (no I/O)
│  │   ├─ funds/           # Fund engine (section 5)
│  │   ├─ ledger/
│  │   ├─ policy/ claims/ retakaful/ billing/ agents/ surplus/ investments/
│  │   ├─ sharia/ underwriting/ hr/ payroll/ …
│  ├─ ui/                  # Design system; every component requires infoKey
│  ├─ auth/                # Auth, sessions, RLS session context
│  ├─ events/              # Transactional outbox + event types
│  ├─ integrations/        # Connector framework + adapters (M30)
│  ├─ rulepacks/           # Country rule packs as versioned data (libya/, ksa/, uae/…)
│  └─ config/              # Tenant config schema (Zod)
├─ content/
│  ├─ help/                # "i" texts, one YAML file per module (ar + en)
│  ├─ learning/            # Learning Center courses (Markdown + YAML)
│  └─ glossary/            # Glossary and synonyms
├─ tools/
│  ├─ masking/             # Masking CLI run by client IT (section 14)
│  └─ tenant-factory/      # Terraform + scripts to create a client stack
├─ tests/                  # e2e (Playwright), load (k6), security
├─ docs/                   # ADRs (architecture decision records), runbooks
└─ README.md               # This file
```

---

## 4. Platform-wide rules

| Area | Rule |
|---|---|
| Fund separation | Section 5. Enforced by database constraints, not only code |
| Sharia status | Every contract and transaction carries `sharia_status` (section 6.10) |
| Maker-checker | Every financial, product, rule, access and HR/payroll change needs a second person (section 9) |
| Audit | Every write emits an append-only, hash-chained audit event: who, when, before, after, IP/device (M27) |
| "i" icon | Every component has one (section 10) |
| Versioning | Rules, products, workflows, templates and tax tables are versioned and effective-dated |
| Language | Arabic is the legally prevailing language on documents; all documents bilingual |
| Currency | Store transaction currency, amount, LYD amount, rate and rate source (official / market) on every money line |
| Numbering | Certificate, claim, receipt and journal numbers are gap-free per series and per tenant; border points get pre-allocated blocks |
| Soft limits | All approval limits are per-role configuration |
| Data retention | Configurable per tenant; default 10 years (to confirm, Q24) |

---

## 5. Takaful fund model (the heart of the system)

### 5.1 Funds

| Fund | Code | Owner | Holds | Pays |
|---|---|---|---|---|
| Participants' Takaful Fund (also Participants' Risk Fund) | PTF | Participants collectively | Tabarru' (donation) part of contributions, retakaful recoveries, its own investment returns (net of Mudarib share), Qard Hasan received | Claims, retakaful contributions, technical reserves, Wakala fee, surplus to participants, Qard repayment |
| Participants' Investment Fund | PIF | Individual participants (family takaful) | Savings part of family contributions, returns | Maturity, surrender, death benefits (savings part) |
| Shareholders' Fund | SHF | Shareholders (the operator) | Capital, Wakala fee income, Mudarib share, returns on its own capital | All operating expenses (salaries, rent, commissions, IT), zakat on shareholders where applicable, Qard Hasan to PTF |

The client's Articles: separate "Takaful Fund account" and "shareholders' account"; **shareholders receive nothing from the insurance surplus**; surplus goes to participants at year-end after technical reserves, with Sharia board approval; Qard Hasan is defined.

### 5.2 Contribution split

| Part | Goes to | Set by |
|---|---|---|
| Tabarru' | PTF | Product split rule (versioned, SSB-approved) |
| Wakala fee | SHF (via inter-fund transfer) | Product split rule; % per line; configurable cap per rule pack (e.g., UAE 35% including commissions) |
| Investment part (family only) | PIF | Product split rule |

Percentages must sum to 100.000%. Only SSB-approved split rules can be used. Until the client signs its fund parameter sheet, the values are flagged `illustrative`.

### 5.3 Inter-fund transfers (the only way money moves between funds)

| Type | From → To | Trigger | Approval |
|---|---|---|---|
| `WAKALA_FEE` | PTF → SHF | Contribution allocated | Automatic by approved rule |
| `MUDARIB_SHARE` | PTF/PIF → SHF | Investment income allocated | Automatic by approved ratio |
| `QARD_DRAW` | SHF → PTF | PTF deficit | CFO + SSB |
| `QARD_REPAY` | PTF → SHF | Surplus run (repaid before any distribution) | CFO + SSB |
| `SURPLUS_ALLOC` | PTF → participants payable | Surplus run | CFO + actuary + SSB + Board |
| `EXPENSE_RECHARGE` | (blocked by default) | Only if a rule pack allows direct PTF expenses (e.g., claims-handling costs) | SSB |

Each transfer posts a "due to" in one fund and a "due from" in the other; cash settlement clears them later.

### 5.4 Database guarantees

| Guarantee | How |
|---|---|
| Every journal line has exactly one `fund_id` | `NOT NULL` + foreign key |
| Each journal balances inside each fund | Deferred constraint trigger at commit: for each (journal, fund), debits = credits |
| An account belongs to one fund | `account.fund_id NOT NULL`; journal line's account must match its fund |
| No direct cross-fund posting | Journals touching more than one fund must reference an `inter_fund_transfer` |
| Posted journals immutable | No `UPDATE`/`DELETE` grant on posted rows; reversal only |
| Closed periods locked | Trigger blocks postings dated in a closed period |

### 5.5 Worked example (illustrative 30% Wakala; real % from the client)

LYD 1,000.000 compulsory motor contribution received.

| Fund | Entry | Debit | Credit |
|---|---|---|---|
| PTF | Bank (PTF) / Contribution income | 1,000.000 | 1,000.000 |
| PTF | Wakala fee expense / Due to SHF | 300.000 | 300.000 |
| SHF | Due from PTF / Wakala fee income | 300.000 | 300.000 |

### 5.6 Core tables

`fund`, `account`, `split_rule`, `journal`, `journal_line` (fund, account, debit, credit, currency, amount_lyd, fx_rate, rate_source, branch, class, product, cohort, certificate_id, sharia_status), `inter_fund_transfer`, `contribution_allocation`, `qard_register`, `surplus_run`, `surplus_allocation`, `period`.

---

## 6. The client's 12 required modules

Each module below has: **(a)** the client's requirement, quoted from their proposal and translated; **(b)** what we build to meet it exactly; **(c)** takaful and regulatory additions from the research; **(d)** data; **(e)** acceptance criteria.

### 6.1 M02: Customer Management (CRM, Customer Relationship Management) — وحدة إدارة العملاء

**(a) Client requirement:** "The unified centre for all data of individuals and companies dealing with the company. A 'unified customer record' containing all personal data, official documents, policy history and claim history. Includes tracking logs that record any change to customer data, who made it and when, linked to digital identity data to prevent duplication and fraud."

**(b) What we build**

| Feature | Detail |
|---|---|
| Unified customer record | One record per individual or company; types: participant, beneficiary, driver, company, agent, reinsurer, employee link |
| Personal / company data | Arabic and Latin names, national number (الرقم الوطني) or passport, commercial register, contacts, addresses, bank accounts (encrypted) |
| Official documents | Upload and store ID, passport, commercial register, driving licence, vehicle registration; document type, number, expiry; expiry alerts |
| Policy history | All certificates (active, expired, cancelled) on the customer 360° screen |
| Claim history | All claims, status, amounts paid |
| Tracking logs | Field-level change history (who, when, before, after) from M27, shown on a "History" tab |
| Digital identity link | Verification against the national registry (Civil Registry national number) through M30 when the connector is available; until then, format validation + manual verification flag |
| Duplicate prevention | On create and edit: match on national number, passport, phone and Arabic-normalised fuzzy name; potential duplicates must be resolved (merge with maker-checker) before saving |
| Fraud flags | Same ID with different names, same phone on many customers, many claims in a short period → alert to compliance |

**(c) Takaful/regulatory additions:** KYC (Know Your Customer) levels by risk; beneficial owners for companies; PEP (politically exposed person) flag; sanctions/PEP screening (M17); consent record and data-correction requests (Libya Law No. 6 of 2022, Arts. 73–77); AML/CFT (Anti-Money Laundering / Countering the Financing of Terrorism) Resolution 1013/2017 customer due diligence.

**(d) Data:** `party`, `party_identity`, `party_document`, `party_contact`, `party_address`, `party_bank_account`, `party_relation`, `party_consent`, `kyc_check`, `duplicate_candidate`.

**(e) Acceptance**

| # | Test |
|---|---|
| 1 | Creating a customer with an existing national number is blocked and shows the existing record |
| 2 | Searching "احمد" finds "أحمد" and "أحمَد"; a typo still finds the record |
| 3 | Every field change appears in History with user and time |
| 4 | Customer 360° shows documents, certificates and claims |
| 5 | Expired ID document raises an alert |

### 6.2 M06: Policy Issuing and Renewal (Policy Management) — وحدة إصدار وتجديد الوثائق

**(a) Client requirement:** "The engine that creates digital insurance and takaful contracts and renews them automatically. A smart template engine automatically generates the takaful document as PDF, signed and stamped electronically, as soon as it is approved. An automatic scheduler scans customer documents daily and sends e-mail or SMS alerts to the customer 30 days before expiry to encourage renewal."

**(b) What we build**

| Feature | Detail |
|---|---|
| Issue | From an accepted quote (M05): certificate number, coverage period, insured object, covers, contribution, split rule |
| Smart templates | HTML templates per product and language (M24), with variables; SSB-approved wording only |
| PDF generation on approval | Worker job triggered by `CertificateApproved`; bilingual PDF; electronic signature (PAdES, per-tenant certificate) and company stamp image; QR (Quick Response) code linking to a public verification page |
| Automatic renewal | Per product: `manual`, `offer` (renewal quote created, customer confirms) or `auto` (renewed on payment). Renewal re-rates with the current product version |
| Daily expiry scan | Daily worker job at a tenant-configured time; finds certificates expiring in exactly N days (default 30, configurable per product) and not yet renewed |
| 30-day alert | E-mail and/or SMS through M30, using approved templates; delivery logged. Sandbox: internal mailbox only |
| Endorsements | Change of vehicle, sum covered, address, etc., with pro-rata contribution change |
| Cancellation | With refund rule per product (pro-rata or short-period table); refund via M07 with maker-checker |
| Registers | Policy register (Law 3/2005 Art. 22) |

**(c) Takaful additions:** the document is a takaful **membership certificate** (participant donates tabarru' to the PTF, appoints operator as Wakil); the split rule ID and `sharia_status` are stored on the certificate; IFRS 17 data captured from day 1 (issue date, coverage start/end, portfolio, annual cohort, measurement model flag); compulsory covers from the Libya rule pack (motor third-party under Law 28/1971 as amended; Resolution 315/2026 covers).

**(d) Data:** `certificate`, `certificate_version`, `certificate_cover`, `endorsement`, `cancellation`, `renewal`, `document_generated`, `notification_log`.

**(e) Acceptance**

| # | Test |
|---|---|
| 1 | Approving a certificate produces a signed, stamped bilingual PDF within 30 seconds; signature validates |
| 2 | QR verification page shows certificate status without personal data |
| 3 | Daily scan sends exactly one alert per certificate 30 days before expiry; re-running the job sends no duplicates |
| 4 | Auto-renewal creates the new certificate on payment with the current product version |
| 5 | Certificate issue under 60 seconds on a 1 Mbps link |

### 6.3 M05: Underwriting and Risk Assessment (Underwriting Engine) — وحدة الاكتتاب وتقييم المخاطر

**(a) Client requirement:** "The brain that decides whether to accept cover and sets the contribution. A rules engine based on the customer's risk inputs (age, medical history, vehicle type, etc.). It gives an instant automatic decision in normal cases, and refers complex cases to a human 'Approval Matrix', alerting the responsible employee to decide manually."

**(b) What we build**

| Feature | Detail |
|---|---|
| Risk questionnaires | Per product: age, medical history (health/family/travel), vehicle type, use, age of vehicle, engine size, sum covered, claims history, destination, etc. |
| Rules engine | Versioned, effective-dated rules per product: `accept`, `refer`, `decline`, `load %`, `discount %`, `exclude cover`. Rules editable by authorised users without code; test mode simulates a rule on past quotes before activation |
| Rating | Rating tables (base rate × factors) from M03 |
| Instant decision | Normal cases: automatic accept with contribution in under 2 seconds |
| Approval Matrix | Referral routing by product, branch, sum covered and rule triggered → role and monetary limit (e.g., underwriter ≤ X, senior underwriter ≤ Y, manager above) |
| Alerts | Task in the responsible employee's inbox (M26) + in-app notification; SLA timer and escalation |
| Decision record | Every decision stores inputs, rules fired, outcome, user |

**(c) Takaful additions:** Gharar (excessive uncertainty) check: wording and covers must be clear before issue; products used must be SSB-approved; medical data field-encrypted.

**(d) Data:** `quote`, `quote_answer`, `uw_rule`, `uw_rule_version`, `uw_decision`, `approval_matrix`, `referral`.

**(e) Acceptance**

| # | Test |
|---|---|
| 1 | A standard motor quote is auto-accepted with the correct contribution |
| 2 | A quote hitting a referral rule creates a task for the right role and blocks issue until approved |
| 3 | A user cannot approve above their limit or their own referral |
| 4 | Rule simulation on past quotes shows how many would change outcome |

### 6.4 M09: Claims Management — وحدة إدارة المطالبات

**(a) Client requirement:** "Manage and complete compensation requests with the highest speed and transparency. The system works as a state machine moving the claim through 6 strict stages: 1) Registered: claim and attachments received. 2) Under review: document audit. 3) Assessed: damage valued financially. 4) Approved: compensation approved. 5) Paid: payment order sent to accounting. 6) Closed: transaction completed. Goal: reduce claim settlement time to under 5 working days."

**(b) What we build**

| Stage (exact) | Arabic | Entry condition | Actions in stage | Exit to |
|---|---|---|---|---|
| 1 Registered | مسجلة | Claim notice with certificate, date, description, attachments | Validate cover in force; open claim number; initial reserve | 2 |
| 2 Under review | مراجعة | Registered | Document checklist per product (e.g., police report, licence, invoices); request missing documents | 3, or back to 1 (missing documents), or Rejected |
| 3 Assessed | مقدرة | Documents complete | Surveyor/assessor valuation (mobile screen with photos, estimate lines); reserve updated | 4 |
| 4 Approved | موافق عليها | Assessed | Approval by Approval Matrix limit (maker-checker); retakaful share calculated (M10) | 5 |
| 5 Paid | مصروفة | Approved | Payment order sent to accounting (M12), paid **from the PTF**; recovery receivable from retakaful booked | 6 |
| 6 Closed | مغلقة | Payment confirmed and no open recoveries | Final reserve released; close | — |

| Rule | Detail |
|---|---|
| Strict transitions | Only the transitions above are allowed (plus `Rejected` from 2/3/4 with reason, and `Reopened` from 6 with approval). The state machine is enforced in the domain layer and by a database check |
| 5-working-day target | SLA clock from Registered to Paid in working days (tenant calendar: Libyan weekend and holidays); dashboard of claims at risk; escalation at day 3 and 4 |
| Transparency | Customer can be notified at each stage (M30); claim timeline visible to staff |
| Recoveries | Third-party recovery, salvage and subrogation tracked |

**(c) Takaful/regulatory additions:** claims are paid from the PTF only; outstanding claims reserve (Law 3/2005 Art. 15); retakaful recovery triggered on approval when the claim exceeds retention (M10); IFRS 17 liability for incurred claims data; fraud indicators to M17.

**(d) Data:** `claim`, `claim_state_history`, `claim_document`, `claim_assessment`, `claim_reserve`, `claim_payment`, `claim_recovery`.

**(e) Acceptance**

| # | Test |
|---|---|
| 1 | Skipping a stage (e.g., 2 → 4) is rejected by API and database |
| 2 | Payment posts to PTF accounts only; SHF unchanged |
| 3 | SLA dashboard counts working days using the tenant calendar |
| 4 | Approving a claim above retention creates the retakaful recovery automatically |
| 5 | Claims handler cannot approve own assessment |

### 6.5 M10: Retakaful — وحدة إعادة التكافل

**(a) Client requirement:** "Distribute risks with retakaful companies to avoid large direct losses. Register retakaful treaties (proportional or non-proportional) in the system. As soon as any claim exceeding the company's retention limit is approved, the system automatically calculates the share due from the retakaful company and generates claim reports and monthly reconciliation reports to ease financial recovery."

**(b) What we build**

| Feature | Detail |
|---|---|
| Treaty register | Proportional: quota share, surplus treaty (lines, retention, capacity). Non-proportional: excess of loss per risk and per event (retention/priority, limit, layers, reinstatements), stop loss |
| Facultative | Offer → acceptance → cession per risk (e.g., ICIEC export-credit facultative) |
| Automatic cession | On certificate issue: ceded share and retakaful contribution calculated by treaty |
| Automatic recovery on claim approval | When a claim (or event) exceeds retention: recoverable share calculated per treaty/layer and booked as receivable |
| Claim reports | Per recoverable claim: cash call / claim advice to the retakaful company |
| Monthly reconciliation | Monthly bordereau and statement of account per counterparty: contributions ceded, commissions, claims recoverable, balances; reconciliation with counterparty confirmations |
| Counterparties | Retakaful/reinsurer register with ISA registration status (Decision 374/2026), rating, Sharia status |
| Compulsory local cession | Ministerial quota to local reinsurers (Law 3/2005 Art. 13), configurable |

**(c) Takaful additions:** cessions and recoveries post to the PTF; preference for retakaful (Sharia-compliant) counterparties, with SSB approval required for conventional reinsurance (necessity rule, configurable); IFSB-18 (retakaful) principles; IFRS 17 reinsurance contracts held data.

**(d) Data:** `treaty`, `treaty_layer`, `treaty_share`, `counterparty`, `cession`, `fac_offer`, `recovery`, `bordereau`, `ri_statement`.

**(e) Acceptance**

| # | Test |
|---|---|
| 1 | Quota share 40%: issuing a certificate cedes 40% of contribution automatically |
| 2 | Excess of loss retention LYD 100,000: approving a LYD 250,000 claim books LYD 150,000 recoverable |
| 3 | Monthly reconciliation report generated per counterparty on the 1st of each month |

### 6.6 M07: Contributions and Billing — وحدة تحصيل الأقساط والمساهمات

**(a) Client requirement:** "Manage incoming cash flows and organise billing. Support recurring billing for direct or scheduled payment (monthly, quarterly, annual). Direct link with electronic payment gateways (PayPal, Stripe, credit cards, bank transfers) to create payment receipts instantly and update the customer account automatically without human intervention."

**(b) What we build**

| Feature | Detail |
|---|---|
| Billing plans | Single, monthly, quarterly, semi-annual, annual; instalment schedule generated at issue |
| Direct or scheduled | Pay now, or scheduled automatic charge/standing order on due date |
| Payment gateways | Connector framework (M30) with adapters: **card payments** (local Libyan card acquirer and international cards), **bank transfer** (reference-based matching and bank statement import), **Stripe** and **PayPal** adapters (as requested; enable only where available to the tenant), cash at branch/border point |
| Instant receipt | Successful payment webhook → receipt number → PDF receipt → customer account updated → fund split (M08) → journal (M12), with no human step |
| Allocation | Receipt allocated to instalments/certificates; overpayment held as customer credit |
| Dunning | Reminders before and after due date; grace period; lapse rules per product |
| Refunds | Maker-checker; paid back through the original channel where possible |
| Cash-up | Daily cashier/agent cash-up and bank deposit reconciliation |
| Bank reconciliation | Import statements; auto-match; exceptions queue |

**(c) Takaful additions:** every receipt is split by the certificate's approved split rule (tabarru' → PTF, Wakala → SHF, investment → PIF); separate bank accounts per fund supported; Law 3/2005 Art. 23 accounts per class; no late-payment interest (riba): late fees, if any, go to a charity account per SSB rule.

**(d) Data:** `invoice`, `instalment`, `receipt`, `receipt_allocation`, `payment_transaction`, `gateway_event`, `refund`, `cashup`, `bank_statement_line`.

**(e) Acceptance**

| # | Test |
|---|---|
| 1 | A gateway success webhook creates a receipt and fund postings within 5 seconds, no user action |
| 2 | Duplicate webhook does not create a second receipt (idempotency) |
| 3 | Monthly plan creates 12 instalments with correct totals |
| 4 | Late fee (if configured) posts to the charity account, never to SHF or PTF income |

### 6.7 M04: Agents and Brokers — وحدة إدارة الوكلاء والوسطاء

**(a) Client requirement:** "Organise the work of sales partners and brokers and track their entitlements. A dedicated dashboard for each agent to follow their sales and track commissions due. A tiered commission system that calculates the rate automatically based on sales volume and achievement of targets (KPIs, key performance indicators), ensuring fairness and accuracy and preventing manipulation."

**(b) What we build**

| Feature | Detail |
|---|---|
| Register | Agents, brokers, branches, border points, licensing offices; ISA licence decision number and expiry; authorised products |
| Agent dashboard | Each agent sees only their own: certificates sold, contributions collected, renewals due, commissions earned/paid/pending, target progress, rank vs target |
| Tiered commission | Tiers by sales volume per period (e.g., 0–50k: a%, 50–150k: b%, >150k: c%), per product; KPI multipliers (e.g., renewal rate, collection rate, loss ratio, new customers) |
| Targets | Monthly/quarterly/annual targets per agent, set by distribution manager with maker-checker |
| Calculation | Automatic monthly run in the worker; statement per agent; clawback on cancellation |
| Anti-manipulation | Commission only on **collected** contributions; cancelled/refunded business reverses commission; tier rules versioned and locked once a period starts; all overrides need checker approval and are audited |
| Payment | Commission payable → payment via M07/M12 |
| Number blocks | Pre-allocated certificate number blocks per agent/border point |

**(c) Takaful additions:** commissions are an operator expense paid from the **SHF**, never from the PTF; where a rule pack caps Wakala including commissions (e.g., UAE 35%), the cap is checked; AML coverage of agents.

**(d) Data:** `agent`, `agent_licence`, `agent_product`, `target`, `commission_scheme`, `commission_tier`, `kpi_rule`, `commission_run`, `commission_line`, `number_block`.

**(e) Acceptance**

| # | Test |
|---|---|
| 1 | Agent A cannot see Agent B's data (RLS test) |
| 2 | Crossing a tier threshold applies the higher rate exactly as the scheme defines (marginal or whole-band, configurable) |
| 3 | Cancelling a certificate reverses its commission in the next run |
| 4 | Commission postings hit SHF only |

### 6.8 M12: Accounting and Finance — وحدة المحاسبة والمالية

**(a) Client requirement:** "The central financial system, committed to Islamic accounting standards. Based on double entry. All system actions (issuing a policy, collecting a contribution, paying a claim, paying a commission) are automatically linked to the general ledger by creating an automatic journal entry. The system produces the balance sheet, income statement and trial balance at the press of a button."

**(b) What we build**

| Feature | Detail |
|---|---|
| Double entry | Every journal balances (and balances inside each fund; section 5) |
| Automatic journals (exact list) | **Issue policy** → contribution receivable / unearned contribution (accrual at issue); **collect contribution** → bank / receivable + fund split; **pay claim** → claims expense / bank (PTF); **pay commission** → commission expense / bank (SHF). Plus: retakaful cession and recovery, Wakala fee, refunds, payroll (section 7), investments |
| Posting rules | Configurable mapping: event type + product + fund → accounts |
| One-click reports | **Balance sheet, income statement, trial balance**: per fund (PTF, PIF, SHF), combined, per branch and class; any date or period; Arabic/English; PDF and Excel |
| Islamic standards | AAOIFI FAS 42 presentation (statement of financial position, statement of participants' fund surplus/deficit, shareholders' income statement, changes in funds); AAOIFI FAS 43 recognition |
| General ledger | Per-fund chart of accounts, manual journals (maker-checker), recurring journals, accruals, multi-currency revaluation |
| Period close | Month/year close with checklist; closed periods locked |
| Payables and expenses | Supplier register, expense invoices, payment runs, budgets vs actual (SHF) |
| Fixed assets | Register and depreciation (SHF) |
| Bank | Bank accounts per fund, reconciliation (with M07) |

**(c) Takaful/regulatory additions:** separate accounts per insurance class (Law 3/2005 Art. 23); annual returns data (Art. 24, via M18); technical reserves postings (M13); IFRS 17 view by mapping (M14); zakat calculation support (M16).

**(d) Data:** section 5.6 tables + `posting_rule`, `supplier`, `expense_invoice`, `payment_run`, `fixed_asset`, `budget`, `fx_rate`.

**(e) Acceptance**

| # | Test |
|---|---|
| 1 | Each of the four named actions creates the correct journal automatically |
| 2 | Balance sheet, income statement and trial balance generate in under 10 seconds for one year of data |
| 3 | Trial balance per fund always balances (property test with 10,000 random events) |
| 4 | A posting dated in a closed period is rejected |

### 6.9 M28: Dashboards and Reports (MIS, Management Information System) — وحدة لوحات القيادة والتقارير

**(a) Client requirement:** "Live graphical display of company performance indicators to help management decide. Link an advanced data analysis tool (Metabase or Power BI) to the main database. Data updated every hour, providing **more than 20 key performance indicators** (such as number of policies issued, claims loss ratios, sales by region, available liquidity) as easy interactive charts." Section 4: "build **more than 10 interactive dashboards** and statistical reports for top management."

**(b) What we build**

| Feature | Detail |
|---|---|
| Built-in dashboards | Interactive charts inside the app, respecting RLS |
| Metabase / Power BI link | A read-only reporting database role (and optional read replica) with curated views (`rpt_*`); connection guide for Metabase or Power BI |
| Hourly refresh | KPI snapshot job every hour (`kpi_snapshot`), plus live drill-down |
| Exports | PDF/Excel; all exports logged |

**KPI catalogue (24, minimum 20 required)**

| # | KPI | # | KPI |
|---|---|---|---|
| 1 | Certificates issued (count) | 13 | Average claim settlement time (working days) |
| 2 | Gross contributions written | 14 | % claims paid within 5 working days |
| 3 | Contributions collected | 15 | Outstanding claims (count, amount) |
| 4 | Sales by region/branch | 16 | Retakaful recoverable balance |
| 5 | Sales by product/line | 17 | Available liquidity per fund (PTF, SHF) |
| 6 | Sales by agent / border point | 18 | PTF surplus/deficit year to date |
| 7 | Renewal rate | 19 | Wakala fee income |
| 8 | New customers | 20 | Operating expense ratio (SHF) |
| 9 | Receivables ageing | 21 | Investment return per fund |
| 10 | Collection rate | 22 | Commission cost ratio |
| 11 | Claims loss ratio (by line) | 23 | Solvency margin vs minimum |
| 12 | Claims count and frequency | 24 | Headcount and payroll cost |

**Dashboards (12, minimum 10 required)**

| # | Dashboard | Main users |
|---|---|---|
| 1 | Executive summary | Board, GM |
| 2 | Sales and production | Sales manager |
| 3 | Branches and regions | GM, branch managers |
| 4 | Agents and commissions | Distribution manager |
| 5 | Claims performance and SLA | Claims manager |
| 6 | Underwriting and referrals | Underwriting manager |
| 7 | Collections and receivables | Finance |
| 8 | Funds and liquidity (PTF/PIF/SHF) | CFO, SSB |
| 9 | Retakaful | Reinsurance officer |
| 10 | Investments | CFO, SSB |
| 11 | Sharia compliance | SSB, Sharia auditor |
| 12 | HR and payroll | HR manager, GM |

**(e) Acceptance:** all 24 KPIs and 12 dashboards present; snapshot job runs hourly; Metabase connects with the read-only role and cannot write.

### 6.10 M16: Sharia Compliance — وحدة الالتزام والرقابة الشرعية

**(a) Client requirement:** "Ensure all financial and operational transactions and activities are free of Sharia violations. Add a **mandatory field called 'Sharia status' to every contract or transaction**. The system includes an algorithm that **prevents mixing shareholders' money with participants' money**, with a dedicated reporting engine that extracts all transactions clearly for the Sharia Supervisory Committee to obtain **annual approval** and **generate compliance certificates**."

**(b) What we build**

| Feature | Detail |
|---|---|
| `sharia_status` field | Mandatory on every contract and transaction table (certificates, quotes, receipts, claims, journals, cessions, investments, commissions, payroll runs, supplier invoices). Values: `compliant` (default only if produced by an SSB-approved rule/product), `pending_review`, `non_compliant`, `purified`. Cannot be null; database check |
| Status rules | Automatic: from approved product/rule/counterparty. Manual change only by Sharia auditor/SSB, with reason, audited |
| No-mixing algorithm | Section 5 database guarantees: one fund per posting, per-fund balancing, cross-fund only via approved inter-fund transfers, separate bank accounts per fund. Any attempt is blocked and logged as a Sharia exception |
| SSB reporting engine | Report of all transactions by period, fund, type and Sharia status; exceptions list; Wakala and Mudarib calculations; surplus computation; investments by Sharia contract |
| Annual approval | Annual Sharia review workflow: report pack → SSB review → resolutions → approval |
| Compliance certificates | Generated PDF certificate (annual and per product), signed by SSB members electronically |
| Governance | SSB members, meetings, resolutions/fatwa register; product, template, investment and surplus approvals link to resolutions |
| Internal Sharia audit | Audit plan per branch (Decision 60/2021 reportedly requires a Sharia auditor per branch), findings, follow-up |
| Purification | Non-compliant income moved to charity account with SSB approval |
| Zakat | Zakat calculation on shareholders' funds where applicable (configurable) |

**(c) Standards:** AAOIFI Sharia Standard No. 26 (Islamic Insurance); AAOIFI governance standards; IFSB-8 (takaful governance); client Articles (binding 3-member SSB approving all forms).

**(d) Data:** `ssb_member`, `ssb_meeting`, `ssb_resolution`, `ssb_approval`, `sharia_exception`, `sharia_audit_plan`, `sharia_finding`, `purification`, `zakat_calc`, `compliance_certificate`.

**(e) Acceptance**

| # | Test |
|---|---|
| 1 | Inserting any contract/transaction without `sharia_status` fails |
| 2 | A journal mixing PTF and SHF without an approved transfer is rejected and logged |
| 3 | Annual SSB report and compliance certificate PDF generated for a year of data |

### 6.11 M15: Surplus Calculation and Distribution — وحدة حساب وتوزيع الفائض التأميني

**(a) Client requirement:** "Return the surplus to the participants' account after paying claims and expenses. A precise mathematical algorithm calculates the net surplus at the end of the financial year (**contributions − claims − provisions − expenses**). Then shares are **distributed pro rata to participants according to each one's contribution**, and the system generates **individual entitlement statements** and issues **payment vouchers or a discount on next renewal**."

**(b) What we build**

| Step | Detail |
|---|---|
| 1 Gross | PTF contributions (tabarru') earned for the year |
| 2 Less | Net claims (paid + change in outstanding, net of retakaful recoveries) |
| 3 Less | Provisions: technical reserves (unearned contribution reserve, outstanding claims, IBNR, fluctuation reserve, Libyan floors) |
| 4 Less | Expenses charged to the PTF: Wakala fee, retakaful contributions, any SSB-approved direct PTF costs |
| 5 Plus | PTF investment income net of Mudarib share |
| 6 = | Net underwriting surplus (or deficit) |
| 7 | If deficit: Qard Hasan from SHF (maker-checker + SSB); stop |
| 8 | If surplus: **repay outstanding Qard Hasan first** |
| 9 | Solvency test before and after distribution (M19) |
| 10 | Retention % for reserves if SSB approves (configurable, default 0) |
| 11 | Distribution share to participants: **100%** (client Articles: shareholders get nothing); other rule packs configurable (e.g., KSA 10% to policyholders) |
| 12 | **Pro rata by each participant's contribution** in the year (exact client method); optional eligibility rules (e.g., exclude participants with paid claims above their contribution, minimum amount) only if SSB approves |
| 13 | **Individual entitlement statements** (bilingual PDF per participant) |
| 14 | Settlement choice per participant or policy: **payment voucher** (cash/bank via M07) or **discount on next renewal** (credit applied at renewal) |
| 15 | Approvals: CFO → actuary → SSB → Board; then posting `SURPLUS_ALLOC` |

**(d) Data:** `surplus_run`, `surplus_component`, `surplus_allocation`, `surplus_statement`, `surplus_voucher`, `renewal_credit`, `qard_register`.

**(e) Acceptance**

| # | Test |
|---|---|
| 1 | Run on the 12-month masked sample reproduces the formula exactly; components shown line by line |
| 2 | Sum of allocations = distributable amount to the dirham (rounding residue handled by rule) |
| 3 | Outstanding Qard is repaid before any allocation |
| 4 | Distribution blocked if solvency test fails or approvals missing |
| 5 | Renewal credit is applied automatically on the participant's next renewal |

### 6.12 M11: Investment Funds — وحدة إدارة الصناديق الاستثمارية

**(a) Client requirement:** "Invest the takaful account's surplus cash in Sharia-licensed investment channels. A portfolio management system supporting registration of Sharia contracts (**Murabaha, Mudaraba, Ijara**). The system tracks invested capital, realised profits, and the **mechanism for distributing returns between the participants' fund and the shareholders' fund (in return for the management fee)**, with periodic performance reports."

**(b) What we build**

| Feature | Detail |
|---|---|
| Portfolios | Per owning fund (PTF, PIF, SHF); assets never pooled across funds without allocation records |
| Contract types | **Murabaha** (cost-plus sale: cost, mark-up, deferred schedule), **Mudaraba** (profit-sharing: capital, profit-sharing ratio, loss borne by capital provider), **Ijara** (leasing: asset, rentals, term). Also: Islamic deposits (Wakala investment), sukuk, Sharia-screened equities (configurable) |
| Tracking | Invested capital, accrued and realised profits, maturities, cash flows, valuation |
| Return distribution | Income allocated to the owning fund; operator's management fee as **Mudarib share** (% of profit) or Wakala investment fee, by SSB-approved ratio → `MUDARIB_SHARE` transfer to SHF |
| Sharia screening | Counterparty and instrument approval by SSB; non-compliant income → purification |
| Performance reports | Monthly/quarterly: return per portfolio and fund, by contract type, maturity ladder, concentration |
| Regulatory | Assets covering technical provisions held in Libya (Law 3/2005 Art. 16) check |

**(c) Standards:** AAOIFI investment standards / IFRS 9 classification; riba prohibition.

**(d) Data:** `portfolio`, `investment_contract`, `murabaha_schedule`, `mudaraba_terms`, `ijara_terms`, `investment_cashflow`, `investment_income`, `valuation`, `screening`.

**(e) Acceptance:** Murabaha schedule generates correct deferred profit recognition; Mudaraba income split by ratio posts Mudarib share to SHF; performance report per fund.

---

## 7. HR and payroll (added by us)

Staff costs are operator expenses, so **all payroll postings go to the SHF**. Rates for social security and income tax are in the Libya rule pack and **must be confirmed by the client's payroll accountant** before go-live (Q27).

### 7.1 M33: Human Resources

| Feature | Detail |
|---|---|
| Organisation | Company, branches, departments, positions, cost centres, reporting lines |
| Employee record | Personal data (encrypted IDs), contacts, qualifications, documents with expiry alerts, emergency contact, bank account |
| Contracts | Type, start/end, probation, grade, salary components, working hours; versioned |
| Lifecycle | Hire → onboarding checklist → transfers/promotions → termination; **hire creates and termination disables the user account in M01 the same day** |
| Attendance | Daily attendance (manual or import from devices), overtime, lateness |
| Leave | Leave types (annual, sick, maternity, Hajj, unpaid…) with entitlements from the rule pack and policy; requests and approvals; balances |
| Loans and advances | Interest-free staff advances (qard) with instalment deduction through payroll |
| Performance | Annual objectives and appraisal (basic) |
| End of service | End-of-service entitlement per labour law and contract (configurable formula) |
| Self-service | Employees see own payslips, leave balance, requests |
| Reports | Headcount, turnover, leave, document expiry |

**Libyan basis (to verify):** Labour Relations Law No. 12 of 2010 and its executive regulations (leave, working hours, end of service).

### 7.2 M34: Payroll

| Feature | Detail |
|---|---|
| Pay components | Basic salary, allowances (housing, transport, family, etc.), overtime, bonuses, deductions, advances repayment |
| Payroll run | Monthly run in the worker: calculate → review → maker approves → checker approves → lock |
| Statutory deductions | Social security contributions (employee and employer) and income tax, from **versioned Libya rule-pack tables**: Social Security Law (Law No. 13 of 1980, to verify) and Income Tax Law No. 7 of 2010 (to verify); bands and rates are configuration, not code |
| Payslips | Bilingual PDF payslips; employee self-service |
| Bank file | Salary transfer file per bank format; payment status |
| Accounting | Automatic journal to **SHF**: salary expense by cost centre, statutory payables, bank |
| Statutory reports | Social security and tax returns data |
| Retro and corrections | Retroactive changes recalculated in the next run with audit |
| Security | Payroll data visible only to HR/payroll roles; salary fields field-encrypted; all changes maker-checker |
| `sharia_status` | On every payroll run (no interest in advances; no non-compliant benefits) |

**Acceptance:** a test run for 30 employees reproduces a hand-calculated control sheet to the dirham; journal hits SHF only; terminating an employee disables their login.

---

## 8. Platform and supporting modules

| ID | Module | What it does | Phase |
|---|---|---|---|
| M00 | Tenant & Configuration | Branding (logo, colours, names), languages, modules on/off with dependency check, rule-pack version, fiscal and working calendar (Libyan weekend/holidays), currencies | P1 |
| M01 | Identity & Access | Users, roles, access levels per module, branch/fund/class scopes, approval limits, MFA, sessions, access reviews | P1 |
| M03 | Product Factory | Products without code: covers, rating tables, split rules, documents, compulsory flags; SSB approval before go-live; versioned | P1 |
| M08 | Takaful Fund Engine | Section 5 | P1 |
| M13 | Reserving & Actuarial | Unearned contribution reserve, outstanding claims, IBNR (Incurred But Not Reported), fluctuation reserve; Libyan floors (Art. 15: unexpired-risk minimum 47% motor third-party, 25% transport, 40% others); actuary sign-off | P2 (needed for surplus provisions) |
| M14 | IFRS 17 / FAS 43 Engine | Portfolios, annual cohorts, profitability groups; PAA (Premium Allocation Approach) first for ≤1-year contracts; GMM/VFA later; FAS 43 fund view as book of record | Data capture P1; engine P4 |
| M17 | Compliance & AML/CFT | Screening, risk scoring, alerts, STR (Suspicious Transaction Report) to Libyan Financial Information Unit, complaints | P2 |
| M18 | Regulatory Reporting (Libya) | Art. 24 annual returns, accounts per class, Libyan-asset statement, supervision levy (Art. 4); layouts configurable until forms obtained | P2 |
| M19 | Solvency & Capital | Art. 17 solvency margin (non-life: greater of 20% of net premiums or 25% of net claims; never below paid-up capital), stress tests, surplus gate | P2 (basic test for surplus), P4 (full) |
| M20 | Family Takaful | PIF accounts, unit pricing, surrender, maturity | P4 |
| M21 | Medical / Health | Members, provider network, pre-approvals, adjudication or TPA (Third-Party Administrator) link | P4 |
| M22 | Motor & Border Insurance | 60-second compulsory motor, Orange Card, travel at border points; offline Progressive Web App with number blocks | Online P1, Orange Card + offline P2 |
| M23 | Export Credit & Trade | Buyer limits, country risk, declarations, ICIEC facultative | P4 |
| M24 | Documents & Correspondence | Templates (certificates, receipts, letters, payslips, statements), SSB-approved wording, versions | P1 |
| M25 | Portals | Customer self-service (buy, pay, claim), agent and broker portals | Agent dashboard P2; customer portal P4 |
| M26 | Workflow & Tasks | State machines, approval matrix, SLA timers, task inbox; visual designer later | P1 (config), P4 (designer) |
| M27 | Audit Trail | Append-only, hash-chained events; daily chain verification | P1 |
| M29 | "i" Engine & Learning Center | Section 10 | P1 |
| M30 | Integration Hub | Section 11 | P1 (internal), P2 (external) |
| M31 | Migration & Simulation Sandbox | Section 14 | P1 |
| M32 | Module Request & Change | Client requests new modules: submit → triage → Sharia/regulatory impact → estimate → client approval → roadmap; status visible to client | P1 (form + tracker) |

---

## 9. Access model

### 9.1 Levels (one per user per module)

| Level | Name | Can do |
|---|---|---|
| 0 | None | Module hidden; API returns 404 |
| 1 | View | Read within scope |
| 2 | Maker | Create and submit |
| 3 | Checker | Approve others' items within monetary limit; never own |
| 4 | Module Admin | Configure module (changes need a second admin) |
| 5 | Tenant Admin | Users and modules; no financial rights |

Scopes per user: branches, funds (PTF/PIF/SHF), classes, agents (own only for agents).

### 9.2 Default role template (editable per client)

| Role | Main access |
|---|---|
| Agent / border clerk | M02, M06, M07 maker (own scope); M04 own dashboard; M09 notice only |
| Underwriter / senior underwriter | M05, M06 maker / checker within limit |
| Claims handler / surveyor / claims manager | M09 maker / checker within limit |
| Cashier | M07 maker |
| Accountant / finance officer / CFO (Chief Financial Officer) | M12 maker / checker; M07 checker; M15 maker (CFO checker) |
| Reinsurance officer | M10 maker |
| Investment officer | M11 maker; CFO checker |
| Distribution manager | M04 checker (targets, schemes) |
| Actuary | M13, M14, M19 maker; M03 pricing; M15 checker |
| Product manager | M03 maker |
| SSB member | M16 checker; Sharia approvals in M03, M10, M11, M15; read-only elsewhere |
| Internal Sharia auditor | Read-only all; M16 findings maker |
| Compliance officer / MLRO (Money Laundering Reporting Officer) | M17 full; M02 view |
| HR officer / HR manager | M33 maker / checker |
| Payroll officer / payroll checker | M34 maker / checker (CFO final approval) |
| Employee (self-service) | Own HR record, payslips, leave |
| Internal / external auditor | Time-boxed read-only |
| ISA (regulator) | Read-only M18 and registers |
| Tenant Admin | M00, M01 |

### 9.3 Segregation of duties (blocked by the system)

| Conflict |
|---|
| Create and approve the same item |
| Grant roles to yourself; edit your own user record |
| Price a product and give its final approval |
| Calculate reserves and approve the surplus |
| Prepare and approve the payroll run; change your own salary |
| SSB members change financial data |
| Tenant Admin posts or approves money |

### 9.4 Row-level security

The app sets `app.user_id`, `app.branch_ids`, `app.fund_scope`, `app.class_scope`, `app.agent_id` per request. Every business table has `ENABLE` and `FORCE ROW LEVEL SECURITY`. The app's database role owns no tables and cannot bypass RLS; migrations use a separate owner role used only by CI. Automated tests log in as each role and prove out-of-scope rows are invisible.

---

## 10. "i" icon and Learning Center

### 10.1 "i" icon

| Item | Rule |
|---|---|
| Coverage | Every screen, field, button, column, status, report and error message |
| Enforcement | Design-system components require an `infoKey` prop (TypeScript compile error if missing); lint forbids raw controls; CI fails if a key has no Arabic and English text; production release fails if any key is not `approved` |
| Key format | `module.screen.element`, e.g. `m08.fund-balance.ptf-total`, `err.m07.receipt-over-allocated` |
| Dialog (≤80 words per language) | 1) What is this? 2) Why does it exist? 3) Rule behind it (e.g., "Law 3/2005 Art. 15") 4) Example in LYD 5) "Learn more" link to the lesson |
| Display | Small "i" by the label; click/keyboard/tap; "Help mode" toggle shows all icons |
| Storage | `content/help/<module>.yaml` in the repo (ships with the feature); seeded into each tenant's `help_item` table; tenant overrides allowed without changing base text |
| Fields | key, module, element type, title_ar, body_ar, title_en, body_en, rule_ref, example, lesson_link, owner, reviewer, review_type (none/Sharia/compliance/actuarial/HR), status, version |
| Auto-draft | Script drafts field text from the data dictionary; drafts show a "draft" badge in sandbox only |
| Review | General UI: content writer + module owner. Fund/financial: takaful accountant. Sharia: Sharia advisor. Regulatory/AML: compliance. HR/payroll: HR lead |

### 10.2 Learning Center

| Item | Rule |
|---|---|
| Structure | One course per enabled module: overview, glossary, workflow diagrams, rules mapped, step-by-step tasks with screenshots, quiz |
| Role paths | e.g. "New border clerk", "New claims handler", "Finance officer: funds", "SSB member", "HR and payroll officer" |
| Visibility | Courses of disabled modules hidden |
| Progress | Completion and quiz scores per user; managers see their team |
| Videos | Short screen-recorded video per main workflow, embedded in lessons (client request, section 16) |
| User manuals | Each course exportable as a PDF user manual (client request) |

### 10.3 Smart search (inside PostgreSQL)

| Need | How |
|---|---|
| Arabic variants | Normalise before indexing and searching: remove tashkeel and tatweel; أ إ آ → ا; ة → ه; ى → ي; ؤ → و; ئ → ي |
| Typos | `pg_trgm` similarity |
| Synonyms | Table: اشتراك = قسط = contribution = premium; وثيقة = شهادة = policy = certificate; مطالبة = تعويض = claim |
| English | English full-text configuration with stemming |
| Scope | "i" texts, lessons, glossary, rules, screen names, workflows |
| Results | Grouped by module; jump to screen if user has access |
| Learning | `search_log` of zero/poor results reviewed weekly |

---

## 11. Integrations (M30)

The client asked for RESTful APIs to connect with **bank payment gateways, the national registry, traffic systems and retakaful companies**.

| Connector | Purpose | Phase |
|---|---|---|
| Public REST API | Versioned REST API with OpenAPI spec, OAuth2 client credentials, per-client keys, rate limits | P2 |
| Payment gateways | Local card acquirer, bank transfer, Stripe, PayPal adapters (section 6.6) | P2 |
| Banks | Statement import, salary transfer files, payment files | P2 |
| National registry | Verify national number and identity (M02) | P2 (subject to access from the authority) |
| Traffic / vehicle licensing system | Vehicle and plate lookup, compulsory insurance status for licensing offices | P2 (subject to access) |
| Orange Card bureau | Unified Arab Card issuing data | P2 |
| Retakaful companies | Bordereaux and statements export (Excel/CSV/API), ICIEC format | P2 |
| SMS and e-mail | Renewal alerts, claim stages, receipts; provider adapters | P2 (disabled in sandbox) |
| Regulator (ISA) | Return exports | P2 |
| Metabase / Power BI | Read-only reporting role | P2 |
| Event delivery | Transactional outbox; at-least-once; idempotent handlers; retry and dead-letter queue | P1 |

---

## 12. Architecture and deployment

### 12.1 Per-client stack

| Component | Per client | Region for Libya |
|---|---|---|
| Vercel project | Production + preview | `fra1` (Frankfurt) |
| Neon project | Branches: `main` (production), `staging`, `sandbox` (masked simulation), `dev` | `aws-eu-central-1` (Frankfurt) |
| Worker | Container, 2+ instances | Frankfurt (e.g., AWS ECS or Fly.io) |
| Object storage | One bucket, tenant key | AWS `eu-central-1` |
| Secrets | One vault path | — |
| Created by | `tools/tenant-factory` (Terraform) | — |

### 12.2 Environments (client requirement: three independent environments)

| Environment | Purpose | Data |
|---|---|---|
| Development | Our engineers | Synthetic |
| Staging (test) | Separate copy of production for client testing and UAT before every release | Masked |
| Production | Live operations | Real |
| Sandbox (extra) | Phase 1 simulation | Masked sample |

### 12.3 Hosting options (client asked for private cloud or AWS/Azure)

| Option | How |
|---|---|
| Default | Neon + Vercel + AWS, Frankfurt |
| Private cloud / on-premise / in-country | Same Docker images + PostgreSQL 16 + S3-compatible storage + Kubernetes or Docker Compose; supported because of rule R4 |
| Azure | Same Docker images on Azure Container Apps + Azure Database for PostgreSQL |

Data residency: hosting personal data in Frankfurt requires a written Libyan legal opinion under Law No. 6 of 2022 ("appropriate level of protection" for transfers abroad) before production. Saudi/UAE clients need in-country hosting.

### 12.4 Events between modules

| Event | Published by | Consumed by |
|---|---|---|
| `PartyCreated` | M02 | M17 |
| `QuoteAccepted` | M05 | M06 |
| `CertificateApproved` | M06 | M07 (invoice), M12 (receivable), M10 (cession), M14 (cohort), M24 (PDF) |
| `PaymentReceived` | M07 | M08 (split), M12, M04 (commission basis) |
| `ContributionAllocated` | M08 | M12 |
| `ClaimStageChanged` | M09 | M30 (notify), M28 |
| `ClaimApproved` | M09 | M10 (recovery), M12 |
| `ClaimPaid` | M09 | M12, M13 |
| `CommissionRunApproved` | M04 | M12 |
| `PayrollRunApproved` | M34 | M12, M30 (bank file) |
| `InvestmentIncomeBooked` | M11 | M08 (Mudarib share), M12 |
| `PeriodClosed` | M12 | M13, M18, M28 |
| `SurplusApproved` | M15 | M07 (vouchers), M06 (renewal credits), M12 |
| `EmployeeTerminated` | M33 | M01 (disable user) |

### 12.5 Background jobs (worker)

Imports and masking runs, PDF generation (certificates, receipts, statements, payslips), daily expiry scan, hourly KPI snapshot, monthly commission run, monthly retakaful reconciliation, payroll run, period close, reserving, surplus run, investment accruals, audit chain verification, backups export.

---

## 13. Security

| Area | Control |
|---|---|
| Standard | OWASP ASVS (Open Worldwide Application Security Project Application Security Verification Standard) Level 2; Level 3 for identity, money and payroll. ISO/IEC 27001 programme later |
| Application | Server-side permission check on every route; shared input validation; output encoding; strict Content Security Policy; CSRF (Cross-Site Request Forgery) protection; rate limits; secure file upload with malware scan and signed short-lived links |
| Identity | MFA for all staff (TOTP or passkey); passkeys required for admins and checkers; 15-minute idle timeout for finance/payroll; anomaly alerts; quarterly access review; leavers disabled same day (M33 link) |
| Database | Separate Neon project per client; RLS forced; app role cannot bypass RLS; separate migration role; read-only reporting role; IP allow-list/private networking; break-glass access only with dual approval and full logging |
| Encryption | TLS (Transport Layer Security) 1.2+; encryption at rest; field-level encryption (per-tenant keys) for national IDs, passports, bank accounts, medical data, salaries; searchable by keyed hash; yearly key rotation |
| Audit | Append-only, hash-chained audit tables; daily verification; copies to write-once storage; retention per tenant (default 10 years) |
| Backups / DR (disaster recovery) | Neon point-in-time recovery ≥7 days; daily encrypted logical backups to a second region; RPO (recovery point objective) ≤15 min; RTO (recovery time objective) ≤4 h; quarterly restore test |
| Testing | SAST (static analysis), dependency and secret scanning on every commit; weekly DAST (dynamic scan, OWASP ZAP) on staging; RLS/SoD tests per role in CI; **load and stress tests** (k6); independent penetration test before go-live, then yearly |
| Monitoring | Security log stream, alerts (failed logins, privilege changes, bulk exports, RLS denials); incident response plan |
| Sandbox | Masked data only; outbound messaging disabled in code and network; "SIMULATION" watermark on every screen and PDF |

---

## 14. Data masking, simulation and migration

### 14.1 Phase 1 sample

| Item | Ask |
|---|---|
| Period | Last 12 months |
| Content | Customers, certificates (all lines), receipts, refunds, claims (paid and outstanding), agents, branches, retakaful treaties, trial balance, payroll for one month (masked), surplus calculation of the last distributed year |
| Format | Oracle export or CSV/Excel from ARIMA |
| Fallback | If not received by day 10: synthetic data from published product rules, flagged "synthetic" |

### 14.2 Masking rules (all mandatory)

| Field | Rule |
|---|---|
| Names (Arabic/Latin) | Consistent pseudonym from a Libyan name list |
| National number, passport | Format-preserving fake that fails real checks |
| Phone, WhatsApp | Reserved non-routable test range |
| E-mail | `<pseudonym>@example.invalid` |
| Address | City/district kept, street/building replaced |
| Bank account, card | Fake numbers failing check digits |
| Plate, chassis | Format-preserving fake |
| Date of birth | Shifted ±0–90 days, same age band |
| Salaries (payroll sample) | Scaled by a secret factor per run; structure kept |
| Free text | Scrubber removes phones, e-mails, ID-like numbers and known names; 200-record manual check |
| Amounts, dates, products, agents, branches | Unchanged |

### 14.3 Process

Data-sharing agreement → client IT extracts → our masking CLI (`tools/masking`) runs **on the client's machine** (mapping key stays with the client) → leak scan + manual sample → load into sandbox → reconcile counts, contributions, claims and fund balances to the dirham → replay the period (issue, receipt, split, claim, cession, close, surplus) → compare to the client's books.

### 14.4 Full migration (before go-live)

Discovery of ARIMA schema → mapping spec approved by finance → opening balances per fund (outstanding claims, unearned contributions, Qard, retakaful balances) → 3 trial loads with full reconciliation → parallel run → cutover (freeze ARIMA, delta load, reconcile, switch; ARIMA kept read-only).

---

## 15. Phases, milestones and acceptance

The client's proposal: **90 days, weekly Agile (Scrum) sprints, client team testing each part as delivered**; milestones: core modules complete at the end of month 1 → all modules complete and final UAT (user acceptance testing) passed → **15 days of live-operation follow-up** and training workshops → **6 months warranty and support**. This plan follows that structure, with masked-data simulation in month 1 and gates before go-live.

| Phase | Days | Sprints | Deliverables | Exit gate |
|---|---|---|---|---|
| Phase 0: Preparation | Week 0 | — | Kick-off; data-sharing agreement; extract requested; fund parameter sheet sent; requirement workshops and workflow maps; visual identity; Libyan legal opinion requested | Agreement signed; contacts named |
| **Phase 1: Core modules (simulation)** | 1–30 | 1–4 | M00, M01, M27, M29, M24, M26, M31; **M02 CRM**; M03; **M05 underwriting**; **M06 issue/renew/PDF/30-day scan**; **M07 receipts + billing plans**; M08; **M12 core ledger + trial balance**; **M09 claims 6-stage state machine** (without reserving); **M16 `sharia_status` + no-mixing**; M04 register; M22 online compulsory motor and travel; M33 employee master | Exit criteria 15.1 |
| **Phase 2: All 12 modules complete** | 31–75 | 5–11 | **M10 retakaful** (proportional + non-proportional, auto recovery, monthly reconciliation); **M04 tiered commission + agent dashboards**; **M07 gateways + recurring billing**; **M12 balance sheet, income statement, period close, payables**; **M28 24 KPIs + 12 dashboards + Metabase/Power BI link**; **M16 SSB reports + compliance certificates**; M13 reserving; M19 basic solvency; **M15 surplus** (run on the 12-month sample); **M11 investments** (Murabaha, Mudaraba, Ijara); **M33 HR + M34 payroll**; M30 external connectors; M17 AML; M18 Libya returns; M22 Orange Card + offline; staging environment | All section-6 acceptance tests pass |
| **Phase 3: UAT, hardening, training** | 76–90 | 12–13 | Final UAT with client staff; load and stress tests; DAST and penetration test; full migration rehearsals; 5-day training; user manuals (PDF), videos; DR restore test | Final UAT signed; no open high-severity defects |
| Go-live | Day 90 + gates | — | Cutover when gates pass: SSB approval of fund model and products; legal hosting opinion; penetration test passed; migration reconciled; fund parameters signed | Client go-live approval |
| Hypercare | Go-live + 15 days | — | Daily support on site/remote; issue log | Stable operations signed off |
| Warranty and support | 6 months after go-live | — | Bug fixes and maintenance (section 16) | — |
| Phase 4: Depth | Months 4–9 | — | M14 IFRS 17 / FAS 43 engine (with actuary), M19 full, M20 family, M21 health, M23 export credit, M25 customer portal, M26 visual designer | Actuary and auditor sign-off |
| Phase 5: Productisation | Months 9–15 | — | KSA, UAE, Bahrain rule packs; in-country hosting; ISO/IEC 27001 | Second client |

### 15.1 Phase 1 exit criteria

| # | Criterion |
|---|---|
| 1 | Client staff create customers, quote, issue, endorse, cancel and renew motor third-party and travel certificates on masked data; signed PDF with QR produced |
| 2 | 30-day expiry scan produces alerts in the internal mailbox only |
| 3 | Receipts split by SSB-approved (or labelled illustrative) rules; every fund balances on its own |
| 4 | A claim moves through all 6 stages; payment hits PTF only |
| 5 | Every contract and transaction has `sharia_status`; mixing attempts blocked |
| 6 | Trial balance per fund reconciles to the client's records for the sample |
| 7 | 100% of Phase 1 components have approved bilingual "i" text; Learning Center courses for Phase 1 modules live |
| 8 | MFA, RBAC, maker-checker, SoD and RLS proven by automated tests |
| 9 | Zero real phones, e-mails or IDs in the sandbox; no outbound message possible |

### 15.2 Phase 1 sprint plan

| Days | Work |
|---|---|
| 1–2 | Tenant factory (Vercel fra1, Neon Frankfurt branches, worker, bucket); design system with RTL and required `infoKey`; CI gates |
| 3–5 | M01 auth, MFA, roles, levels, RLS session context; M27 audit; M00 tenant settings and module switchboard |
| 6–8 | M02 CRM (unified record, documents, duplicates, history); M04 register; M33 employee master; M03 motor third-party and travel products with split rules |
| 9–12 | M08 fund engine + M12 core ledger with per-fund balancing, inter-fund Wakala transfer, `sharia_status` everywhere; property tests |
| 10–14 | M31 masking CLI to client (day 10); masked sample received (day 14) |
| 13–16 | M05 rules engine + approval matrix; M06 issue/endorse/cancel/renew, signed PDF, QR, 30-day scan; M24 templates; M22 online issue screen |
| 16–19 | M07 receipts, billing plans, refunds, cash-up; M26 maker-checker and task inbox |
| 19–23 | M09 claims state machine (6 stages, SLA working-day clock); load sample; reconciliation dashboard |
| 22–26 | "i" content review sprint; Learning Center courses; UAT sessions with border clerk, underwriter, cashier, claims, finance |
| 27–29 | Security sweep (dependency, secrets, ZAP, RLS/SoD tests), backup restore test |
| 30 | Demo to management and SSB; Phase 1 report |

---

## 16. Testing, training, documentation, warranty

| Item (client requirement) | What we deliver |
|---|---|
| Requirements analysis and workflow maps | Workshops per department in Phase 0–1; BPMN-style workflow maps in `docs/workflows/` and in the Learning Center |
| Database design and visual identity | Schema documentation generated from migrations; tenant branding in M00 |
| Quality, integration and acceptance testing | Unit, property, end-to-end, integration tests in CI; **load and stress tests** (target: 200 concurrent users, certificate issue p95 < 2 s, month-end close < 30 min on 3 years of data); security testing; UAT scripts per role |
| Cloud setup and automatic backups | Tenant factory; automated backups and restore tests (section 13) |
| User manuals | PDF manuals exported from Learning Center courses, Arabic and English |
| Video tutorials | One short video per main workflow per module |
| Training | **5 working days**: days 1–3 operational staff (issuing, billing, claims, agents); day 4 accounting and finance (ledger, reports, surplus, investments, payroll); day 5 technical/admin team (users, roles, modules, workflows, reports, backups) |
| Weekly coordination | Weekly sprint review and demo with the client team; weekly written progress report (done, next, risks, decisions needed) |
| Staging environment | Separate staging environment identical to production |
| Live follow-up | 15 days of hypercare after go-live |
| Warranty | 6 months from go-live: bug fixes and maintenance at no extra cost; severity SLA: critical response 2 h, high 8 h, normal 2 working days |
| Out of scope (client terms) | Hosting, payment gateway and SMS gateway fees are paid by the client. New modules beyond this README go through M32 |

---

## 17. Libya rule pack (`packages/rulepacks/libya`)

| Rule | Source | Encoded as |
|---|---|---|
| Supervision levy 2.5‰ life, 5‰ other direct premiums | Law 3/2005 Art. 4 | Levy table |
| Minimum capital LYD 10 million (direct insurers) | Art. 6 | Check in M19 |
| Compulsory local cession by ministerial quota | Art. 13 | Configurable % per class |
| Technical reserves; unexpired-risk minimum 47% motor third-party, 25% transport, 40% others; outstanding claims; IBNR; fluctuation reserve | Art. 15 | Floors table in M13 |
| Assets ≥ technical provisions held in Libya | Art. 16 | Check in M11 |
| Solvency margin (non-life: greater of 20% net premiums or 25% net claims; reinsurance deduction capped at 50%; never below paid-up capital) | Art. 17 | Formula in M19 |
| Registers: policies, claims, brokers, agents, treaties, allocated assets | Art. 22 | Register reports |
| Separate accounts per class | Art. 23 | Ledger dimension |
| Annual returns | Art. 24 | M18 layouts (forms to obtain) |
| Auditor from regulator's register | Arts. 25–26 | Auditor role |
| Compulsory motor third-party bodily injury | Law 28/1971 as amended | Product template |
| Compulsory professional indemnity, public liability, fire for professional/technical/engineering firms | Resolution 315/2026 | Product templates |
| Reinsurer registration with ISA | Decision 374/2026 | Counterparty check |
| Takaful practice; Sharia audit | Decisions 529/2008, 201/2012, 60/2021 (text to obtain) | Configurable |
| Data protection: consent, transfers abroad, correction | Law 6/2022 Arts. 73–77 | M02 consent; hosting check |
| AML/CFT | Resolution 1013/2017 | M17 |
| Labour (leave, hours, end of service) | Labour Relations Law 12/2010 (to verify) | M33 tables |
| Social security contributions | Law 13/1980 (to verify rates) | M34 tables |
| Income tax on salaries | Income Tax Law 7/2010 (to verify bands) | M34 tables |
| Working calendar | Libyan weekend (Friday–Saturday) and public holidays | M00 calendar |

---

## 18. Open questions and configurable parameters

All of these are configuration. Until answered, values are flagged `illustrative` in the UI.

| # | Question | Affects |
|---|---|---|
| Q1 | ARIMA modules, version, Oracle data ownership | Migration |
| Q2 | Wakala fee % and Mudaraba split per line; yearly changes? | M08, M11 |
| Q3 | Last surplus: year, amount, method, cash or renewal discount | M15 |
| Q4 | Qard Hasan history | M15 opening balances |
| Q5 | Branches, agents, border points; internet quality | M04, M22 |
| Q6 | Annual volumes per line | Performance, number blocks |
| Q7 | The three 2026 products | M03 |
| Q8 | Reinsurers besides ICIEC; Libya Re cession requirements | M10 |
| Q9 | Background of the August 2025 regulator statement (ask carefully) | Compliance |
| Q10 | Bancassurance partner bank | M30 |
| Q11 | SSB members and approval process | M16 |
| Q12 | Payment channels used (local cards, e-wallets, transfer) | M07, M30 |
| Q13 | Data-sharing agreement and 12-month extract by day 14 | M31 |
| Q14 | Who signs fund parameters | M08 |
| Q15 | Chart of accounts and last audited statements | M12 |
| Q16 | Acceptance of Frankfurt hosting for masked sandbox | Environment |
| Q17 | Art. 24 return forms; Decision 60/2021 text | M18, M16 |
| Q18 | Has the ISA asked for IFRS 17 or AAOIFI? | M12, M14 |
| Q19 | Certificate number and QR rules (ISA, Orange Card bureau) | M06, M22 |
| Q20 | Orange Card bureau integration | M22 |
| Q21 | Staff per department and current roles | M01 template |
| Q22 | Exchange-rate source | M07, M12 |
| Q23 | Fiscal year end; Hijri needs | M00 |
| Q24 | Record retention period | M27 |
| Q25 | Current HR/payroll tool and data | M33, M34 migration |
| Q26 | SMS provider; regulator copies of notices | M30 |
| Q27 | Social security and income-tax rates/bands confirmed by payroll accountant | M34 |
| Q28 | Commission tiers and KPI targets per agent type | M04 |
| Q29 | Approval Matrix limits per role | M05, M09 |
| Q30 | Investment contracts currently held (Murabaha, Mudaraba, Ijara) | M11 |
| Q31 | Access to national registry and traffic systems | M30 |
| Q32 | Electronic signature certificate provider and stamp image | M06 |

---

## 19. Requirement traceability

| Client proposal section | Requirement | Our module | Phase |
|---|---|---|---|
| 1 | Full cycle: registration → cover request → risk → contributions → claims → surplus → financial statements | All | P1–P2 |
| 1 | Private cloud or AWS/Azure | 12.3 | P1 |
| 1 | Separation of participants' and shareholders' accounts; Sharia board rules | 5, M08, M16 | P1 |
| 2 | Agile weekly sprints, 90 days, client tests each part | 15 | All |
| 2 | Responsive UI on computers, tablets, phones | Design system | P1 |
| 2 | PostgreSQL | 3.1 | P1 |
| 2 | RESTful APIs: banks, national registry, traffic, retakaful | 11 | P2 |
| 3.1 | CRM: unified record, documents, history, tracking logs, digital identity, anti-duplicate/fraud | 6.1 M02 | P1 (+registry P2) |
| 3.2 | PDF signed and stamped on approval; auto renewal; daily scan; e-mail/SMS 30 days before expiry | 6.2 M06 | P1 (SMS live P2) |
| 3.3 | Rules engine; instant decision; Approval Matrix with alert | 6.3 M05 | P1 |
| 3.4 | 6-stage state machine; < 5 working days | 6.4 M09 | P1 |
| 3.5 | Proportional/non-proportional treaties; auto share above retention; claim and monthly reconciliation reports | 6.5 M10 | P2 |
| 3.6 | Recurring billing; gateways; instant receipts; automatic account update | 6.6 M07 | P1–P2 |
| 3.7 | Agent dashboard; tiered commission by volume and KPIs | 6.7 M04 | P2 |
| 3.8 | Double entry; automatic journals for issue, collect, claim, commission; balance sheet, income statement, trial balance | 6.8 M12 | P1–P2 |
| 3.9 | Metabase/Power BI; hourly; 20+ KPIs | 6.9 M28 | P2 |
| 3.10 | Mandatory Sharia status; no-mixing algorithm; SSB report engine; annual approval; compliance certificates | 6.10 M16 | P1–P2 |
| 3.11 | Net surplus formula; pro rata by contribution; individual statements; vouchers or renewal discount | 6.11 M15 | P2 |
| 3.12 | Murabaha, Mudaraba, Ijara; capital, profits; return split participants/shareholders for management fee; performance reports | 6.12 M11 | P2 |
| 4 | Requirement sessions, workflow maps, DB design, visual identity | 16 | P0–P1 |
| 4 | 10+ dashboards | 6.9 | P2 |
| 4 | Stress, security, bug testing; UAT | 13, 16 | P3 |
| 4 | Servers, databases, automatic backups | 12, 13 | P1 |
| 4 | Manuals, videos, workshops | 10.2, 16 | P3 |
| 4 | Weekly coordination | 16 | All |
| 4 | Milestones: core month 1; all modules + UAT; 15-day follow-up | 15 | — |
| 5 | Staging environment | 12.2 | P2 |
| 5 | 5-day training | 16 | P3 |
| 5 | 6 months support | 16 | Post go-live |
| 6 | Open-source licences | 3.1 | — |
| 6 | Three environments: development, test, production | 12.2 | P1–P2 |
| 6 | Hosting, gateway and SMS costs external | 16 | — |
| Added | HR and payroll | 7 M33, M34 | P1–P2 |
| Added | Takaful research: Qard Hasan, reserves, AML, Libya returns, solvency, IFRS 17, audit, "i", Learning Center, module requests | 5, 8, 10, 17 | P1–P4 |

---

## 20. Abbreviations

| Short | Full form |
|---|---|
| AAOIFI | Accounting and Auditing Organization for Islamic Financial Institutions |
| AML/CFT | Anti-Money Laundering / Countering the Financing of Terrorism |
| API | Application Programming Interface |
| ARIMA | ARIMA Insurance Software WLL (Bahrain), client's current system vendor |
| BPMN | Business Process Model and Notation |
| CFO | Chief Financial Officer |
| CI/CD | Continuous Integration / Continuous Delivery |
| CRM | Customer Relationship Management |
| CSRF | Cross-Site Request Forgery |
| DAST / SAST | Dynamic / Static Application Security Testing |
| DR | Disaster Recovery |
| ERP | Enterprise Resource Planning |
| FAS | Financial Accounting Standard (AAOIFI) |
| GM | General Manager |
| GMM / PAA / VFA | General Measurement Model / Premium Allocation Approach / Variable Fee Approach (IFRS 17) |
| IBNR | Incurred But Not Reported |
| ICIEC | Islamic Corporation for the Insurance of Investment and Export Credit |
| IFRS | International Financial Reporting Standard |
| IFSB | Islamic Financial Services Board |
| ISA | Insurance Supervisory Authority (Libya) |
| ISO/IEC | International Organization for Standardization / International Electrotechnical Commission |
| KPI | Key Performance Indicator |
| KYC | Know Your Customer |
| LYD | Libyan Dinar |
| MFA | Multi-Factor Authentication |
| MIS | Management Information System |
| MLRO | Money Laundering Reporting Officer |
| OWASP ASVS | Open Worldwide Application Security Project Application Security Verification Standard |
| PAdES | PDF Advanced Electronic Signatures |
| PDF | Portable Document Format |
| PEP | Politically Exposed Person |
| PTF / PIF / SHF | Participants' Takaful Fund / Participants' Investment Fund / Shareholders' Fund |
| QR | Quick Response (code) |
| RBAC | Role-Based Access Control |
| RLS | Row-Level Security |
| RPO / RTO | Recovery Point Objective / Recovery Time Objective |
| RTL | Right-to-Left |
| SaaS | Software as a Service |
| SLA | Service Level Agreement |
| SMS | Short Message Service |
| SoD | Segregation of Duties |
| SSB | Sharia Supervisory Board |
| STR | Suspicious Transaction Report |
| TLS | Transport Layer Security |
| TOTP | Time-based One-Time Password |
| TPA | Third-Party Administrator |
| UAT | User Acceptance Testing |
