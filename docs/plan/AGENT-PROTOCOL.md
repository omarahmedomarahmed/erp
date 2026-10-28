# G — Agent Operating Protocol for the TakafulTech build

Status: DRAFT v1 for auditor approval. Spec source: `/home/user/erp/README.md` (1,160 lines; title still reads "Core Islamic Insurance", product name is TakafulTech).
Inputs read in full: README.md L1–1160; validator findings A-finance-sharia.md, B-insurance-ops.md and D-regulatory-hr.md. C and E were not present when this was written.

This document contains:

- §0 Roles and wave lifecycle
- §1 Pre-build decision gate (ADRs that must exist before dependent WPs launch)
- §2 Frozen contracts and ownership mechanics
- §3 Builder brief template
- §4 Reviewer brief template
- §5 Auditor checklist
- §6 Gate catalogue
- §7 Findings ledger format
- Appendix X: adversarial test library
- Appendix Y: role list for RLS and SoD matrices

Everything in a `«…»` placeholder is filled in by the orchestrator per WP. Nothing else in the templates should be edited per WP without auditor approval.

---

## 0. Roles and the wave lifecycle

### 0.1 Roles

| Role | Session | Can write | Cannot |
|---|---|---|---|
| **Auditor** (plan owner) | Separate, long-lived | `docs/plan/**` (plan, ADRs, ledgers, sign-offs), README errata via ADR | Write application code; approve its own plan changes without recording them |
| **Orchestrator** | Claude Code, long-lived | Wave branches, merge commits, `docs/plan/waves/**`, integration-point files (§2.5) | Write business logic; edit a WP's owned files; mark a finding resolved |
| **Builder** | Fresh subagent per WP, own git worktree | Only the WP's owned paths (§2.4) | Touch other paths, change frozen contracts, edit README/ADRs, skip gates |
| **Reviewer** | Fresh subagent per wave, no builder context | `review/«wave»` branch: adversarial tests under `tests/adversarial/**` and findings files | Edit WP-owned source; see builder transcripts; trust builder gate output |
| **Fix agent** | Fresh subagent, or the original builder re-launched | Only the paths named in the findings it is assigned | Fix findings it was not assigned; weaken tests |

### 0.2 Wave lifecycle (state machine; every arrow needs an artefact)

```
PLANNED ──(auditor approves briefs: A-1)──► LAUNCHED ──(all builder reports in)──► BUILT
BUILT ──(orchestrator freezes diff SHA)──► IN_REVIEW ──(review report)──► REVIEWED
REVIEWED ──(auditor review check: A-2)──► FIXING ──(fix reports)──► RE-VERIFY
RE-VERIFY ──(reviewer re-verify: 0 open BLOCKER/HIGH)──► FIX_VERIFIED ──(auditor A-3)──►
MERGE_READY ──(orchestrator merges, gates on merged SHA)──► MERGED ──(auditor A-4)──► SIGNED_OFF
```

- A wave has at most **4 builders**. WPs in one wave must have **disjoint ownership** and must not depend on each other's unmerged output. They depend only on frozen contracts and previously merged waves.
- Each wave state change is a row appended to `docs/plan/waves/«wave».md`, giving the timestamp, actor, SHA and evidence path.
- The wave ID format is `P«phase»W«nn»` (e.g. `P1W03`). The WP ID format is `«wave»-WP«n»-«module(s)»-«slug»` (e.g. `P1W03-WP2-M08-fund-core`).

### 0.3 Evidence rule (applies to all roles)

A gate result counts as evidence only if it is a file under `docs/plan/evidence/«wave»/«actor»/«gate».log`, and the log starts with this header:

```
# gate: G8  actor: reviewer  wave: P1W03  sha: <40-hex>  base: <40-hex>
# started: <ISO8601>  finished: <ISO8601>  exit: <int>
# tool versions: node 22.x, pnpm 9.x, postgres 16.x, playwright 1.x ...
# command: <exact command line>
<full unedited stdout+stderr>
```

The following are **not evidence**: prose like "all tests pass", truncated output, or output taken at a different SHA. `tools/plan/run-gate.sh` (built in WP-00) produces these logs, so no one writes them by hand.

---

## 1. Pre-build decision gate (ADRs before dependent WPs)

The validators found spec contradictions. If parallel builders meet these, each will resolve them differently. **A WP whose scope touches an item below may not be launched until the ADR exists in `docs/plan/adr/` with status `accepted`.** Every builder brief must cite the ADR. The auditor checks this at A-1.

| ADR | Decision | Source findings | Blocks |
|---|---|---|---|
| ADR-001 | Contribution recognition: accrual at issue vs §5.5 cash example. Which fund holds the gross receivable. Whether the split happens at issue or at receipt. Wakala recognition basis. Cancellation reversal | A-01, B-06 | M06, M07, M08, M12 |
| ADR-002 | Inter-fund transfers: one journal per transfer. Pairing constraint (due-to = due-from = transfer.amount). New types `SETTLEMENT`, `WAKALA_FEE_REVERSAL`, `INVESTMENT_WAKALA_FEE`, and `SURPLUS_TO_SHAREHOLDERS` (blocked by default). `SURPLUS_ALLOC` modelled as a single-fund PTF journal. Charity/purification payable per fund. Agent net remittance | A-04, A-05, A-21, B-26, D-17 | M08, M12, M07, M04, M15, M11 |
| ADR-003 | How the ledger DB guarantees are implemented. Deferred constraint trigger on the journal **header**, not per line. Immutability enforced by trigger plus RLS `USING (status<>'posted')`, not by GRANT. Composite FK `(account_id,fund_id)`. Closed-period trigger. Gap-free counter table | A-06, B-15 | M08, M12, all posting modules |
| ADR-004 | `sharia_status`: NOT NULL + CHECK enum, **no DEFAULT**. Status derived by trigger or service. Append-only `sharia_status_event` for posted rows. `sharia_tracked_table` registry. Blocking matrix | A-08 | Every transaction table (all waves) |
| ADR-005 | Event catalogue and outbox contract: event_id, aggregate_id + seq, schema_version, `processed_event(consumer,event_id)` inbox, DLQ, complete event list | B-33, B-34, B-35 | All event producers/consumers |
| ADR-006 | Multi-currency balancing basis (`amount_lyd` per (journal, fund)) and the rounding account | A-07 | M08, M12, M07 |
| ADR-007 | Rule representation and versioning (R7): rule-pack row metadata (issuer, gazette ref, in-force, evidence URL, `illustrative`, `to_verify`). UW rule DSL (decision tables + JSONLogic). Version pinning on running records | B-28, D-09, R7 | M03, M05, M04, M34, rule packs |
| ADR-008 | Claims state machine: full transition table, "awaiting documents" sub-status, the 4→3 transition, Rejected and Reopened exits, enforcement by trigger + `claim_transition` table. P1 case reserves live inside M09 | B-18, B-19, B-21, A-13, B-23 | M09 |
| ADR-009 | RLS session context. Only a `SECURITY DEFINER` function owned by the auth schema, called from `packages/auth`, sets the `app.*` GUCs. The app role must not be able to widen its own scope by calling `set_config` itself. Transaction-scoped (`SET LOCAL`) settings when pooling | §9.4 (reviewer concern) | M01 and every RLS table |
| ADR-010 | Number series: definition of gap-free ("every number accounted for"), block lifecycle, voids | B-15 | M06, M07, M09, M12, M04, M22 |
| ADR-011 | SoD actuary split (reserving actuary vs approving actuary) | A-10 | M13, M15 (P2) |
| ADR-012 | Book of record basis for P1–P3 (local/regulatory with FAS 42 presentation, FAS 43 in P4). IFRS 17 P1 data-capture field list | A-09, A-11, A-12 | M06, M09, M10, M12 |
| ADR-013 | Surplus formula (gross step 1, change in provisions only, net of retakaful). Distribution details | A-02, A-03, A-14, A-15 | M15 (P2) |
| ADR-014 | Retakaful: M10 is the single owner of the recoverable. Treaty order fac → QS/surplus → per-risk XoL → per-event XoL → stop loss. Corrected test 2 arithmetic | B-07, B-08, B-09, B-12 | M10, M09 (P2) |
| ADR-015 | Payment rails in scope for Libya (Moamalat, LYPAY, Sadad, bank transfer). Stripe/PayPal as dormant adapters. Pay-by-link page | B-01, B-03, D-08 | M07, M30 (P2) |
| ADR-016 | Regulated commission override (Dec. 88/2026) and payroll statutory pipeline (SS 20.5% three-way, solidarity 1%, stamp 0.5%, exemptions, ordering) as `illustrative` seeds | D-04, D-05 | M04, M34 (P2) |

The orchestrator may launch non-blocked WPs (design system, auth shell, audit chain) while ADRs are pending.

---

## 2. Frozen contracts and ownership mechanics

### 2.1 Wave 0 / WP-00 "Contracts & Rails"

WP-00 runs alone, before any feature WP. Its output is frozen at tag `contracts-v1`. It creates:

| Contract | Path (proposed; WP-00 finalises) | Contents |
|---|---|---|
| Kernel types | `packages/domain/kernel/` | `Money` (decimal.js wrapper, scale 3, currency, banker's or ADR-defined rounding, no `number` constructor from float), `FundCode = 'PTF'\|'PIF'\|'SHF'`, `ShariaStatus` enum, branded IDs, `EffectiveDated<T>`, `RuleVersionRef`, `TenantContext`, `AccessLevel 0–5` |
| Zod schemas | `packages/config/` and `packages/domain/kernel/zod.ts` | Shared field rules; `moneySchema` rejects >3 dp and JS floats |
| Event catalogue | `packages/events/catalogue/` | One file per event: name, version, Zod payload, producer module, consumer modules (ADR-005). `publish()` accepts only catalogued events (type-level) |
| Outbox/inbox | `packages/events/outbox.ts`, `packages/db/migrations/0010_outbox` | Outbox and inbox tables, helper `withOutbox(tx, …)` |
| Audit helper | `packages/db/audit/` | Generic hash-chained audit trigger function plus `attach_audit(table)` helper. Every business migration must call it |
| RLS helper | `packages/db/rls/` | `enable_force_rls(table)`, standard scope policies (branch/fund/class/agent/own), ADR-009 context setter |
| Sharia helper | `packages/db/sharia/` | `add_sharia_status(table)` that adds the column, CHECK and registry row, and no DEFAULT (ADR-004) |
| Money column helper | lint plus SQL meta-test | Money columns are `numeric(20,3)` only |
| UI primitives | `packages/ui/` | Base components with required `infoKey: InfoKey` prop (template-literal type `${Module}.${string}.${string}`); ESLint rule `no-raw-controls` (R8) |
| Help content schema | `content/help/_schema.yaml`, `tools/help-check/` | Per-module YAML schema (§10.1 fields); checker for G13 |
| Test harness | `tests/harness/` | Ephemeral PG16 container (testcontainers, plain `postgres:16` image), per-role login helpers, factory builders, fast-check arbitraries for Money and Fund |
| Gate runner | `tools/plan/run-gate.sh`, `pnpm wp:verify` | Implements §6 gates and writes evidence logs |
| Ownership checker | `tools/plan/check-ownership.ts` | Compares `git diff --name-only base..head` against the WP manifest |

**Contract change request (CCR):** After the freeze, any change under a contract path needs a `docs/plan/ccr/CCR-nnn.md` approved by the orchestrator and the auditor. The change goes in its own WP and bumps the tag (`contracts-v2`). A builder that needs a contract change **stops and reports an open question**. It does not edit the contract.

### 2.2 Migration numbering

- Files are named `packages/db/migrations/«NNNN»_«module»_«slug».up.sql` with a matching `.down.sql` (hand-written plain SQL, R4).
- The orchestrator assigns each WP a **reserved block** in `docs/plan/migration-ledger.md`, e.g. `P1W03-WP2 → 0300–0319`. WP-00 owns 0001–0099.
- A builder may only create numbers inside its block. It may never edit or rename a migration that has already been merged. Fixes go in a new migration.
- Ordering across WPs in a wave is by block. Blocks are assigned so that dependencies sort earlier.

### 2.3 Table ownership

`docs/plan/table-ownership.md` lists `table | module | owning WP | created in migration | RLS policy family | sharia-tracked (Y/N) | money columns`.

- Only the owning WP may `CREATE` or `ALTER` a table.
- Other WPs read the table through the owning module's domain API, or through a view the owner publishes. Writes go through the owner's domain functions or events, never through direct `INSERT` from another module's code.
- The §5.6 tables (`fund`, `account`, `journal`, `journal_line`, `inter_fund_transfer`, `period`, …) are owned by the **M08/M12 ledger WP**. Every other module posts only via `ledger.post(postingRequest)` and the posting rules.

### 2.4 File ownership manifest (per WP)

Each brief carries a manifest of globs, for example:

```yaml
owns:
  - packages/domain/claims/**
  - packages/db/migrations/04[0-1][0-9]_m09_*
  - apps/web/app/(app)/m09/**
  - apps/web/app/api/m09/**
  - apps/worker/jobs/m09/**
  - content/help/m09.yaml
  - content/learning/m09/**
  - apps/web/messages/{ar,en}/m09.json
  - tests/e2e/m09/**
  - packages/db/test/rls/m09.*.test.ts
reads_only: [packages/domain/kernel/**, packages/events/catalogue/**, packages/ui/**, packages/db/{audit,rls,sharia}/**]
```

G0 fails the wave if the diff touches anything outside `owns`.

### 2.5 Integration points (no shared hand-edited files)

WP-00 makes navigation, route permissions, job registration, help-file loading and event subscriptions **auto-discovered** from per-module files (e.g. `apps/web/app/(app)/m09/module.ts` exports nav, permissions and infoKeys). The remaining shared files are root `package.json`, `pnpm-lock.yaml`, `turbo.json`, root ESLint/TS config and CI workflow. The **orchestrator** owns these. A builder that needs a new dependency lists it under "Integration requests" in its report. The orchestrator applies it in the wave merge commit, and the reviewer re-runs G1 on the merged SHA.

---

## 3. BUILDER BRIEF TEMPLATE (paste, fill `«…»`)

```markdown
# Builder Brief — «WP-ID» — «one-line goal»

Wave: «P1W03»   Base SHA: «40-hex»   Contracts tag: «contracts-v1»
Branch / worktree: wave/«P1W03»/«WP-ID»  (git worktree at «path»)
Owning module(s): «M09»   Phase: «P1»   Time-box: «n» agent-hours
Depends on (merged): «P1W02-WP1-M08-fund-core @ sha …»   ADRs: «ADR-003, ADR-004, ADR-008»

## 1. Goal
«2–5 sentences: what exists when you are done, in user terms, e.g. "A claim can be registered and moved
through the 6 stages of README §6.4 with strict transitions enforced in domain + DB; payment posts to PTF
only via ledger.post; SLA working-day clock from the M00 calendar."»

Out of scope (do NOT build): «e.g. M10 recovery calc (stub interface only, ADR-014), reserving beyond case reserves (M13)»

## 2. Read in full before writing any code
You must read these line ranges completely. Do not skim. At the top of your report, give the line
ranges you read.
- README §1.2 L44–59, §2 L63–96, §4 L160–174, §5 L178–236 (fund model — always), §9 L704–757, §10.1 L763–775, §13 L879–892
- Module section(s): «§6.4 L337–371»
- Related: «§12.4 L854–871 events; §12.5 L873–875; §15.2 L963–977 sprint row»
- ADRs: «docs/plan/adr/ADR-003.md, ADR-004.md, ADR-008.md»
- Contracts: packages/domain/kernel/README.md, packages/events/catalogue/«ClaimStageChanged, ClaimApproved, ClaimPaid…»
- Validator findings relevant to this WP (context, not spec; the ADR wins): «B-18…B-24, A-13»
If README and ADR conflict, the ADR governs. If README conflicts with itself and no ADR covers it,
STOP that item and raise it as an Open Question. Do not choose an answer yourself.

## 3. Frozen contracts you consume (do not modify)
| Contract | Path | You use it for |
|---|---|---|
| Money / FundCode / ShariaStatus | packages/domain/kernel | all amounts, fund tagging |
| ledger.post(PostingRequest) | packages/domain/ledger (merged in «WP») | every financial effect; you never insert journal rows |
| Events | packages/events/catalogue | publish «ClaimStageChanged v1, ClaimApproved v1, ClaimPaymentOrdered v1»; consume «ClaimPaymentConfirmed v1» |
| Audit | packages/db/audit attach_audit() | every new business table |
| RLS | packages/db/rls enable_force_rls() + policy family «branch+class» | every new business table |
| Sharia | packages/db/sharia add_sharia_status() | tables: «claim, claim_payment, claim_recovery» |
| UI | packages/ui (infoKey required) | every component |
| Rule access | packages/rulepacks + config getters | every rate/limit/day count |
Migration block: «0400–0419». Tables you own (create): «claim, claim_state_history, claim_document, claim_assessment, claim_reserve, claim_payment, claim_recovery, claim_transition». Tables you may read: «certificate (via policy API), party (view rpt_party_basic)».
If you need a contract change, STOP and raise it as an Open Question (CCR). Do not edit the contract.

## 4. Ownership
You OWN and may create/modify only:
«paste the owns: manifest from §2.4»
Everything else is read-only. This includes package.json, pnpm-lock.yaml, turbo.json, root configs,
CI workflows, README.md, docs/plan/**, other modules' files and contract paths. If you need a new
dependency, list it under "Integration requests" in your report.

## 5. Definition of Done (every item must be checked with evidence)
| # | Item (README ref) | Concrete, verifiable criterion | Gate |
|---|---|---|---|
| DoD1 | Reversible migration (§2.2#1) | Every `.up.sql` has a `.down.sql`. up→down→up on fresh PG16 gives an identical `pg_dump --schema-only`. Numbers are inside your block | G6 |
| DoD2 | Domain logic + tests (§2.2#2) | Pure logic in packages/domain/«module» (no I/O imports). Unit tests ≥90% lines / ≥85% branches for the package. Fund, ledger, split, surplus and recovery logic also has fast-check property tests (≥10,000 runs in CI, seed logged) | G4, G5 |
| DoD3 | Server-side permission (§2.2#3, §9.1) | Every route handler calls `authorize({module, level, scope})` before any read or write. Level 0 → 404. A test per route covers allowed, wrong level and out-of-scope | G8, G10 |
| DoD4 | RLS (§2.2#4, §9.4) | Every new business table has ENABLE + FORCE RLS and a policy from the family. The app role neither owns nor bypasses it. A test per role in Appendix Y proves in-scope rows are visible and out-of-scope rows are invisible, for SELECT/INSERT/UPDATE/DELETE | G7, G8 |
| DoD5 | infoKey + ar/en text (§2.2#5, §10.1) | Every screen, field, button, column, status, report and error message uses an `infoKey` matching `^(m\d{2}\|err\.m\d{2})\.[a-z0-9-]+\.[a-z0-9-]+$`. Each key exists in content/help/«m09».yaml with title/body in ar and en, ≤80 words each, rule_ref, LYD example, lesson_link, review_type. Status `draft` is allowed in a WP; `approved` is required at the phase gate | G2, G13 |
| DoD6 | Learning Center (§2.2#6, §10.2) | content/learning/«m09»/ lesson added or updated: overview, glossary, workflow diagram, rules mapped, steps, quiz (≥5 questions) | G13 |
| DoD7 | Audit event per write (§2.2#7, §4, M27) | Every new business table has the audit trigger. A test proves INSERT/UPDATE/DELETE each produce an audit row with actor, time, before, after, IP/device and a valid chain hash | G7, G11 |
| DoD8 | No hard-coded rules (§2.2#8, R7) | Every rate, %, limit, day count, threshold or country rule is read from config or the rule pack through a versioned, effective-dated getter. Running records store the rule version id. Semgrep rule pack is clean | G14 |
| DoD9 | RTL + EN screenshots (§2.2#9, D7) | Playwright projects `ar-rtl` and `en-ltr` take screenshots of every new screen. `<html dir>` is asserted. No physical left/right CSS (logical properties only). Baselines committed | G15 |
| DoD10 | Money (§2.2#10) | DB money columns are `numeric(20,3)`. Code uses only `Money` (decimal.js). No `number` arithmetic on amounts, no `parseFloat` or `toFixed` on money. Every money line carries currency, amount, amount_lyd, fx_rate and rate_source (§4) | G3, G7, G14 |
| DoD11 | E2E main workflow (§2.2#11) | A Playwright e2e for the main workflow passes in both locales and is tagged with the README acceptance IDs it covers, e.g. `@acc:M09-1 @acc:M09-2` | G15, G25 |
| R1 | One fund per posting | All postings go through `ledger.post`. Each line has a fundCode. Cross-fund effects use only ADR-002 transfer types. The adversarial cross-fund test passes | G9 |
| R2 | Posted journals immutable | No code path updates or deletes posted rows. Corrections are reversals. The DB test proves UPDATE and DELETE on posted rows fail for the app role | G9 |
| R3 | sharia_status | Every contract or transaction table you create was added via `add_sharia_status`: NOT NULL, CHECK, no DEFAULT, registered. Status is derived per ADR-004. An insert without it fails | G7 |
| R4 | Portable SQL | No Neon- or Vercel-specific API in packages/domain, packages/db business SQL or apps/worker job logic. Tests run on plain `postgres:16` | G3, G19 |
| R5 | Long jobs in worker | Imports, batch PDFs, closes, runs and any job that may take >10 s are pg-boss jobs in apps/worker. Route handlers only enqueue them | G14 |
| R6 | Outbound via M30 only | No direct SMTP/SMS/WhatsApp/HTTP-to-third-party client outside packages/integrations. In a sandbox tenant the test proves the connector throws or diverts to the internal mailbox | G16 |
| R7 | Versioned, effective-dated rules | New rule tables have `version, effective_from, effective_to, approved_by, status`. Records pin `rule_version_id`. The test proves that a new version does not change an in-flight record | G4, G14 |
| R8 | No raw HTML controls | ESLint `no-raw-controls` passes. Only packages/ui components are used | G3 |
| MC | Maker-checker and SoD (§4, §9.3) | Every financial, product, rule, access or HR/payroll change in scope goes through the M26 approval API. Tests cover self-approval blocked, approval over limit blocked, and the §9.3 conflicts relevant to the module | G10 |
| EV | Events | Only catalogued events are published, inside the business transaction (outbox). Consumers are idempotent: a test replays 3× and gets one effect. Out-of-order events are retried | G12 |

## 6. Required tests (minimum; name them exactly so the reviewer can find them)
- Unit: packages/domain/«module»/**/*.test.ts. Every domain function, plus error paths.
- Property (fund/ledger/split/surplus/recovery/commission only): `*.property.test.ts` with fast-check. Required invariants: per-fund debits=credits; sum of split parts = gross to 0.001; inter-fund balances net to zero; reversal(x)+x = 0; «module-specific».
- DB guarantees: packages/db/test/«module»/*.db.test.ts on ephemeral PG16. Include each Appendix X case marked for this module.
- RLS per role: packages/db/test/rls/«module».rls.test.ts using the Appendix Y matrix (role × table × op × in/out scope).
- Migration: up/down/up round trip is covered by G6. Add a data-preserving down test if the down drops data.
- Permission/SoD: apps/web/test/api/«module»/*.authz.test.ts.
- Events: «module»/events/*.test.ts covering publish-in-tx, 3× replay, and out-of-order handling.
- E2E: tests/e2e/«module»/*.spec.ts with projects ar-rtl and en-ltr, screenshot baselines, @acc tags.
- i-text: `pnpm help:check --module «m09»` passes. Every new infoKey found by the extractor is present.
- Acceptance coverage: each README (e) test for your module that is in scope «list IDs» has ≥1 test tagged `@acc:«ID»`.
Forbidden in your diff: `.skip`, `.only`, `.todo`, `xit`, `test.fails` without a linked finding, lowering coverage
thresholds, deleting or relaxing existing assertions, snapshot updates of other modules.

## 7. Commands you must run before declaring done (from repo root, in your worktree)
pnpm install --frozen-lockfile
pnpm wp:verify --wp «WP-ID» --base «base-sha»
#   which runs, writing evidence to docs/plan/evidence/«wave»/builder-«WP-ID»/:
#   G0 ownership · G1 build · G2 typecheck · G3 lint · G4 unit+coverage · G5 property ·
#   G6 migrations round-trip · G7 schema invariants · G8 RLS · G9 ledger guarantees ·
#   G10 SoD · G11 audit chain · G12 events · G13 help+learning · G14 semgrep rules ·
#   G15 e2e ar+en · G16 sandbox egress · G18 secrets/SAST/deps · G19 docker/plain-PG
If any gate fails, fix it. If you cannot fix it inside your ownership, report it. Do NOT declare done with a red gate
unless the failure is listed under Deviations and the orchestrator has acknowledged it.

## 8. Report format (write to docs/plan/waves/«wave»/reports/«WP-ID».md, also return it)
---
wp: «WP-ID»
head_sha: <40-hex>
base_sha: «base»
status: DONE | DONE_WITH_DEVIATIONS | BLOCKED
---
### README/ADR sections read
(list with line ranges)
### Files changed
(table: path | added/modified | purpose). Must be a subset of the owns manifest.
### Migrations
(number | file | tables created/altered | down tested Y/N)
### Tables created / RLS family / sharia-tracked / audit attached
### Tests added
(count by type; file list; the @acc IDs covered; property-test seeds)
### Gate results
(table: gate | exit code | evidence log path | one-line summary). Do not paraphrase failures; link the log.
### DoD checklist
(each DoD1–11, R1–R8, MC, EV: PASS / N/A with a reason / FAIL with a reason, plus the test or file proving it)
### infoKeys added
(count; module yaml path; how many still status=draft)
### Integration requests
(dependencies, root config changes needed, with justification)
### Open questions
(spec conflicts or contract needs. Each gives the README line, the ADR gap and the options. You did not pick one)
### Deviations
(anything not done exactly as briefed: what, why, risk, proposed follow-up)
### Known limitations / stubs
(e.g. "M10 recovery is a no-op behind RecoveryPort, per ADR-014")

## 9. Prohibitions (violation = BLOCKER finding)
1. No hard-coded rates, percentages, limits, day counts, tax bands, commission tiers or country rules (DoD8/R7).
2. No floating-point money: no `number` for amounts, no `real`/`double precision`/`float` columns, no `parseFloat`/`toFixed`/`Math.round` on money.
3. No edits outside your ownership manifest, and no edits to frozen contracts, README.md, docs/plan/** (except your report and evidence) or another WP's migrations.
4. No skipping, disabling or weakening tests, lint rules, type checks, coverage thresholds or gates. No `// eslint-disable` or `@ts-ignore`/`@ts-expect-error` without a linked finding ID.
5. No Neon-only or Vercel-only features in business logic (R4). Examples: Neon branching or serverless driver features used in domain code, Vercel KV/Blob/Edge Config, `@vercel/*` imports outside apps/web deploy glue.
6. No direct writes to another module's tables, and no direct INSERT into journal/journal_line (use `ledger.post`).
7. No UPDATE or DELETE of posted financial rows, audit rows or `sharia_status` on posted rows (use reversal or status events).
8. No `sharia_status` DEFAULT, and no nullable `sharia_status`.
9. No outbound network call to third parties outside packages/integrations. No real phone numbers, e-mails or IDs in fixtures (use `@example.invalid` and reserved test ranges).
10. No secrets, keys, tokens or connection strings in code, fixtures or logs. Use env vars from `.env.example` names only.
11. No `SECURITY DEFINER` functions, `BYPASSRLS`, `SET ROLE` or `set_config('app.*')` outside packages/auth and packages/db/rls.
12. No long-running work in route handlers (R5).
13. No raw HTML controls (R8), and no UI component without an `infoKey`.
14. No choosing an answer to a spec ambiguity yourself. Raise it as an Open Question.
15. No git operations on branches other than your own. Do not merge or rebase onto other WPs.
```

---

## 4. REVIEWER BRIEF TEMPLATE (paste, fill `«…»`)

```markdown
# Reviewer Brief — Wave «P1W03» — Round «1»

Diff under review: «base-sha»..«frozen-head-sha» on branch wave/«P1W03»/integration
(the orchestrator's pre-merge integration of WPs «list»; the per-WP heads are also given: «WP→sha»)
Your branch: review/«P1W03»-r«1» (adversarial tests only)   Contracts tag: «contracts-v1»

## 0. Independence rules
1. You are a fresh session. You have NOT seen builder transcripts or reasoning, and you must not ask for them.
2. Inputs you may use: the diff, the WP briefs, README.md, ADRs, frozen contracts, the table and migration ledgers,
   and the findings ledger. You may read builder reports ONLY AFTER Step 3 below, and only to check their claims.
   Their claims are hypotheses to test, never evidence.
3. You run every gate yourself on the frozen SHA, in a clean checkout (`git clean -xfd`, fresh DB container).
   Builder evidence logs are never accepted as your evidence.
4. You do not edit WP-owned source. You may add adversarial tests under tests/adversarial/«wave»/**. A failing
   adversarial test is attached to a finding and later handed to the fixer.
5. You report what you find with file:line evidence. "Looks fine" is not a result. Every checklist row gets
   PASS / FAIL (with finding ID) / N/A (with a reason).
6. You did not build, and will not fix, any WP in this wave.

## 1. Inputs
- WP briefs: docs/plan/waves/«wave»/briefs/*.md
- README sections: §2 L63–96, §4 L160–174, §5 L178–236, §9 L704–757, §10.1 L763–775, §11 L818, §12.4 L854–871,
  §13 L879–892, plus each WP's module section «list with lines»
- ADRs: «list»   Validator findings relevant: «list IDs»
- Prior open findings for these modules: docs/plan/findings-ledger.md (filter: module ∈ «…», status ≠ CLOSED)

## 2. Procedure
Step 1. Scope: run G0 (ownership) per WP. List every file outside a manifest as a BLOCKER.
Step 2. Gates: run the full per-wave gate set (§6: G0–G19) on the frozen SHA and write logs to
        docs/plan/evidence/«wave»/reviewer-r«n»/. Any red gate is a finding.
Step 3. Read the diff against the checklist (§3 below), module by module, and record each row.
Step 4. Adversarial: write and run the Appendix X cases applicable to the wave's modules, plus at least 3 of your
        own targeted at this wave's riskiest change.
Step 5. Claims check: read the builder reports and verify each DoD "PASS" claim against the code and tests.
        A false claim is a separate finding (severity HIGH, rule "REPORT-INTEGRITY").
Step 6. Write the review report (§5 format) and append findings to the ledger with status OPEN.

## 3. Platform review checklist (each row → PASS/FAIL/N/A + evidence)
### Funds and ledger (§5, R1, R2)
C01 Every new posting path goes through ledger.post. `rg "insert into (journal|journal_line)" -i` hits only the ledger package.
C02 journal_line.fund_id is NOT NULL + FK. The account/fund match uses a composite FK (ADR-003).
C03 The per-(journal, fund) balance check is a deferred constraint and fires at COMMIT (test: an unbalanced journal commits → error).
C04 Cross-fund journals require an inter_fund_transfer of an allowed type with a matching fund pair; legs pair-match (ADR-002).
C05 Posted journal and lines are immutable for the app role (UPDATE/DELETE fail). Corrections are reversals dated in an open period.
C06 Closed-period trigger rejects postings dated in a closed period, including reversals and back-dated entries.
C07 The fund for each effect follows README: claims from PTF (§6.4), commissions and payroll from SHF (§6.7, §7), Wakala PTF→SHF (§5.5), late fees to charity (§6.6), surveyor fees per ADR/rule pack (B-24).
C08 Property tests exist and actually assert per-fund balance and split-sum invariants. Run count ≥10,000 in CI. Check that assertions are not tautological.
### Sharia (R3, §6.10)
C09 Every new contract/transaction table is in the sharia_tracked_table registry, NOT NULL, CHECK enum, **no DEFAULT** (catalog query).
C10 Status derivation follows ADR-004. Manual change is only via a status event by an SSB/Sharia auditor role, and is audited.
C11 A mixing attempt is blocked AND logged as a sharia_exception.
### Access (§9, DoD3–4)
C12 Every table has `relrowsecurity` and `relforcerowsecurity`. The app role is not the owner and has no BYPASSRLS.
C13 RLS tests exist per Appendix Y role for each new table. Out-of-scope rows are invisible for every op, not only SELECT.
C14 GUC scope cannot be self-widened by the app role (ADR-009). Settings are transaction-scoped under pooling.
C15 Every route handler has an authorize() call before data access. Level 0 → 404 (not 403). Branch/fund/class scope is applied server-side.
C16 Maker-checker: an approval creates a separate checker record. Self-approval is blocked. The monetary limit comes from per-role config.
C17 The §9.3 SoD conflicts relevant to these modules are enforced and tested (Tenant Admin cannot post money; SSB cannot change financial data; no self role grant).
### Audit (M27, DoD7)
C18 An audit trigger is on every new business table. Before/after/actor/IP are captured. The hash chain verifies after the test run. Audit tables have no UPDATE/DELETE path.
### UI and content (D4, R8, §10.1, DoD5, 6, 9)
C19 The infoKey prop is present on every component and type-enforced. No raw controls.
C20 Every infoKey used has ar and en text that is meaningful (not a copy of the key, not lorem). ≤80 words. rule_ref is present for financial and Sharia items. The LYD example uses 3 decimals.
C21 RTL: logical CSS properties only. ar-rtl and en-ltr screenshots exist and are reviewed visually by you (mirrored layout, numerals, Hijri/Gregorian dates where applicable).
C22 A Learning Center lesson exists and matches the built workflow.
### Money and rules (DoD8, DoD10, R7)
C23 Money is numeric(20,3) in SQL and Money/decimal.js in TS. There is no float path, including JSON serialisation (amounts as strings) and Zod parsing.
C24 Every money line carries currency, amount, amount_lyd, fx_rate and rate_source (§4).
C25 No hard-coded rates, limits or day counts. Rules are versioned and effective-dated. In-flight records keep their pinned version (test).
C26 Values not yet signed by the client are flagged `illustrative` and shown as such in the UI (§5.2, §18).
### Events and integration (§11, §12.4, R6)
C27 The outbox write is in the same transaction as the business change. event_id/aggregate_seq/schema_version are present. Only catalogued events are used.
C28 Consumers are idempotent (inbox PK). 3× replay gives one effect. Out-of-order events are retried. DLQ is configured.
C29 Webhooks (if any): signature verified; duplicate delivery gives one receipt (§6.6 test 2).
C30 Sandbox: outbound connectors are disabled in code (not by config alone). Messages land in the internal mailbox. "SIMULATION" watermark (§13).
### Platform hygiene (R4, R5, §13)
C31 No secrets in diff or history range (gitleaks). No PII in fixtures.
C32 Migrations are reversible, plain PG16, numbered inside the WP block. No edits to merged migrations.
C33 No Neon- or Vercel-only features in business logic. The Docker/plain-PG run passes (G19).
C34 Long jobs are in apps/worker. Route handlers only enqueue.
C35 Input validation uses shared Zod schemas. Output encoding/CSP is not weakened. File uploads (if any) go via signed short-lived links.
C36 Field-level encryption for national IDs, passports, bank accounts, medical data and salaries (§13), searchable by keyed hash.
### Spec fidelity
C37 Each in-scope README (e) acceptance test has a tagged, passing test, and the test asserts the README condition (not something weaker).
C38 Behaviour matches the WP brief and ADRs. Any divergence is listed in the builder's Deviations; an unlisted divergence is a finding.
C39 Client-quoted requirements (§6 (a)) are not silently softened.

## 4. Severity scale and merge policy
| Severity | Definition (any one suffices) | Merge policy |
|---|---|---|
| BLOCKER | Violates R1–R8, fund separation, R2 immutability or `sharia_status` NOT NULL. RLS bypass or cross-scope data exposure. Secret or real PII committed. Float money. Edits outside ownership or to frozen contracts. Gate cannot run or is red. Audit chain broken. Sandbox can send outbound. Report integrity failure on a DoD claim tied to these | Wave cannot merge. Fix + re-verify required |
| HIGH | A DoD item is missing (no RLS test for a role, no audit trigger, missing infoKey text, missing e2e). A README acceptance test fails or is weakened. Missing maker-checker/SoD on an in-scope change. Hard-coded rule. Non-idempotent consumer. Irreversible migration. False builder claim | No merge until fixed and re-verified |
| MEDIUM | Correct but incomplete or fragile: missing edge-case tests, weak property-test generators, unclear i-text, performance risk with evidence, deviation not documented | Fix in-wave, OR defer ≤1 wave with an auditor-approved deferral row in the ledger (target wave + owner) |
| LOW | Style, naming, docs, minor UX | Logged. Fix opportunistically. Never blocks |
Merge requires: 0 open BLOCKER, 0 open HIGH, every MEDIUM either VERIFIED or DEFERRED (auditor-approved),
and all per-wave gates green on the MERGED SHA.

## 5. Report format (docs/plan/waves/«wave»/review-r«n».md)
---
wave: «P1W03»  round: «n»  reviewer_session: «id»  frozen_sha: «…»  base_sha: «…»
verdict: PASS | FAIL     counts: {BLOCKER: n, HIGH: n, MEDIUM: n, LOW: n}
---
### Gate results (my own runs)
| Gate | Exit | Log path | Summary |
### Checklist
| C-id | Result | Evidence (file:line / log) | Finding |
### Adversarial tests run
| X-id | Test file | Expected | Observed | Finding |
### Findings
For each finding:
- **ID:** «P1W03-F007»
- **Severity:** HIGH
- **WP / module:** «P1W03-WP2 / M08»
- **Location:** packages/db/migrations/0305_m08_journal.up.sql:41
- **Rule violated:** «R2 / DoD4 / C05 / ADR-003 §2 / README L221»
- **Description:** what is wrong, in one paragraph
- **Repro:** the exact command or test, e.g. `pnpm vitest run tests/adversarial/P1W03/x05-posted-update.test.ts`, plus the observed output excerpt
- **Expected:** «UPDATE on posted journal_line raises 'posted journal immutable'»
- **Suggested fix:** a concrete change (not code-golf)
- **Fix owner:** «WP-ID» (paths within its manifest)
### Builder claims check
| WP | Claim | Verified? | Note |
### Residual risk / not covered
```

---

## 5. AUDITOR CHECKLIST

The auditor records each check as ✔ / ✘ / N/A with a note in `docs/plan/waves/«wave».md` under "Audit". Any ✘ blocks the transition.

### A-1 Wave launch (before builders start)

| # | Check |
|---|---|
| 1.1 | The wave is in the plan, and the phase/sprint mapping matches README §15.2 (or a recorded plan deviation). At most 4 WPs |
| 1.2 | Every ADR the WPs depend on (§1 table) is `accepted`. No WP touches an ADR-blocked area without the ADR |
| 1.3 | Contracts tag exists and is frozen. The WP's consumed contracts are listed and exist at that tag |
| 1.4 | Ownership manifests are disjoint across WPs (`tools/plan/check-ownership.ts --overlap`). No WP owns contract paths or root files |
| 1.5 | Migration blocks are assigned, non-overlapping and dependency-ordered. Table ownership rows exist for every table to be created |
| 1.6 | Each brief: the goal is testable; out-of-scope is explicit; README sections are given with **line ranges** that actually cover the module's (a)–(e) plus §2, §4, §5, §9, §10.1; relevant validator IDs are listed |
| 1.7 | Each brief's DoD table is complete (DoD1–11, R1–R8, MC, EV). Rows are N/A only with a reason (e.g. no money in M29) |
| 1.8 | Each brief lists required tests, including in-scope README acceptance IDs (`@acc`) and the Appendix X cases for its modules |
| 1.9 | No dependency between WPs in the same wave on unmerged code. Stubs/ports are named for later-phase modules (e.g. M10 RecoveryPort in P1) |
| 1.10 | Prohibitions block is present and unmodified. The report format is present |
| 1.11 | The reviewer brief for the wave is drafted, includes all C-rows plus wave-specific adversarial targets, and names a reviewer session distinct from the builders |
| 1.12 | External dependencies from D-§4 that this wave needs (e.g. motor decrees for M03, holiday calendar for M09 SLA) are received, or the brief says to use `illustrative` values |

### A-2 Review completion

| # | Check |
|---|---|
| 2.1 | Independence: the reviewer session ID differs from every builder and fixer. The report shows builder reports were read only at Step 5. The reviewer did not edit WP-owned files (`git diff` on review branch ⊆ tests/adversarial/**) |
| 2.2 | Gate evidence is real. Each gate log has the reviewer as actor, sha = frozen SHA, a timestamp after the freeze, exit code and full output. Spot-check: the auditor re-runs **G6, G8, G9 and one random gate** on the frozen SHA and compares results |
| 2.3 | Checklist coverage: every C01–C39 row has a result. Each N/A has a valid reason. FAIL rows map to findings |
| 2.4 | Adversarial coverage: every applicable Appendix X case was run, plus ≥3 wave-specific cases. Each has a test file and observed output |
| 2.5 | Findings are well-formed: ID, file:line, rule, repro command, expected result, fix owner. Severity matches the §4 scale. The auditor re-grades any finding it believes is under-rated and records why |
| 2.6 | Claims check is done for every WP report |
| 2.7 | Findings are appended to the ledger with status OPEN |

### A-3 Fix verification

| # | Check |
|---|---|
| 3.1 | Each fix commit references the finding IDs. The diff stays inside the fix owner's manifest and touches only what the finding needs (no opportunistic rewrites) |
| 3.2 | The failing repro (adversarial test or reviewer command) now passes, **and that test is kept in the suite** (regression) |
| 3.3 | No test was weakened. `git diff` on test files shows no deleted assertions, no added `.skip`/`.only`, no lowered thresholds, and no snapshot re-baselining unrelated to the fix |
| 3.4 | Re-verification was done by the reviewer (or a new reviewer), not the fixer. A full per-wave gate run on the post-fix SHA is logged |
| 3.5 | Ledger rows moved OPEN → FIXED (by fixer) → VERIFIED (by reviewer). Deferred MEDIUMs have a target wave and owner, and the auditor's initials |
| 3.6 | No new BLOCKER/HIGH was introduced by the fixes (the re-verify report lists new findings separately) |

### A-4 Wave sign-off

| # | Check |
|---|---|
| 4.1 | Merged SHA recorded. Per-wave gates G0–G19 are green **on the merged SHA**, from the orchestrator's run, with logs present |
| 4.2 | Ledger for this wave: 0 OPEN/FIXED BLOCKER or HIGH. MEDIUMs are VERIFIED or DEFERRED (approved). LOWs are logged |
| 4.3 | Table ownership, migration ledger and event catalogue are updated to reflect what merged. CCRs (if any) were applied in their own WP |
| 4.4 | Coverage did not drop versus the previous wave. Test count increased. No `.skip` in the tree (`rg` count = 0, or each is linked to a deferred finding) |
| 4.5 | `content/help` key count increased by at least the number of new UI elements. Count of draft keys is recorded (must reach 0 by phase gate) |
| 4.6 | Acceptance traceability (G25 report) is updated. The README (e) IDs newly covered are listed |
| 4.7 | Deviations and open questions from the builders are either resolved into ADRs or entered in `docs/plan/deviations.md` with an owner |
| 4.8 | Sign-off line: `SIGNED_OFF «wave» sha=«…» by auditor «date»` |

### A-5 Phase gate sign-off

Run all per-phase gates (G20–G27) in addition to G0–G19 on the phase-candidate SHA, deployed to the target environment (sandbox for P1, staging for P2/P3).

**Phase 1 exit (README §15.1):**

| §15.1 # | Criterion | Evidence required |
|---|---|---|
| 1 | Create customers, quote, issue, endorse, cancel, renew motor TPL + travel on masked data; signed PDF with QR | E2E suite `@exit:P1-1` green in ar+en on sandbox. PDF signature validation log (e.g. `pdfsig`/pyHanko `validate`) on generated certificates. QR verification page shows no PII. Acceptance M02-1..5, M05-1..4, M06-1..5 (M06-5 with 1 Mbps/500 ms throttling per B-36) |
| 2 | 30-day scan alerts only in the internal mailbox | `@acc:M06-3` + G16 egress test on the sandbox deployment. Mailbox screenshot. Network egress deny log |
| 3 | Receipts split by SSB-approved or `illustrative` rules; every fund balances | G5 property (10,000 events) + G9. Per-fund trial balance report per fund = 0 difference. UI shows the `illustrative` label |
| 4 | Claim through all 6 stages; payment hits PTF only | `@acc:M09-1..5`. SQL proof that SHF balances are unchanged across the claim e2e |
| 5 | `sharia_status` on every contract/transaction; mixing blocked | G7 registry meta-test. `@acc:M16-1,2`. sharia_exception rows from adversarial run |
| 6 | Per-fund trial balance reconciles to client records for the sample | G23 reconciliation report signed by client finance (human signature recorded) |
| 7 | 100% of P1 components have **approved** bilingual i-text; P1 Learning Center courses live | G13 in `--release` mode (0 draft, 0 missing). Course list per P1 module |
| 8 | MFA, RBAC, maker-checker, SoD, RLS proven by automated tests | G8, G10 all-roles matrix. MFA e2e (TOTP + passkey for checkers/admins). 15-min idle timeout test |
| 9 | Zero real phones/e-mails/IDs in sandbox; no outbound possible | G22 leak scan = 0 hits + 200-record manual check record. G16 |
| — | Security sweep (§15.2 d27–29) | G18 clean, G21 ZAP baseline with no High, G24 restore test log |
| — | Ledger | 0 OPEN BLOCKER/HIGH in P1. Deferred MEDIUMs are carried forward explicitly |

**Phase 2 exit ("All section-6 acceptance tests pass"):** The G25 traceability report lists every README (e) ID and maps each to ≥1 passing tagged test on staging. The IDs are:

- M02-1..5, M06-1..5, M05-1..4, M09-1..5
- M10-1..3 (test 2 as corrected by ADR-014)
- M07-1..4, M04-1..4, M12-1..4
- M28 (24 KPIs, 12 dashboards, hourly job, read-only Metabase role cannot write)
- M16-1..3, M15-1..5
- M11 (Murabaha schedule; Mudarib share to SHF; per-fund report)
- M34 (30-employee control sheet to the dirham; journal SHF-only; termination disables login)

Also required:

- G20 load smoke
- staging environment live (§12.2)
- a real SMS delivered to a test handset on staging (B-04)
- ADR-013 surplus golden scenario reproduced to 0.001 LYD

**Phase 3 exit:**

- Final UAT signed by the client
- G20 k6 at 200 concurrent users with certificate issue p95 < 2 s and month-end close < 30 min on 3 years of data (§16)
- G21 full ZAP scan, and an independent pentest report with no open High
- G24 DR restore within RPO ≤ 15 min / RTO ≤ 4 h
- Full migration rehearsal reconciled (G23)
- Manuals and videos present
- Ledger: **no open HIGH or BLOCKER** (README L942)

**Go-live gates (§15 L943), tracked by the auditor, not by code:**

- SSB approval of the fund model and products
- Legal hosting opinion with the D-02 scope
- Pentest passed
- Migration reconciled
- Fund parameters signed (Q14)
- All `illustrative` flags cleared in production config. A G13/G14 release-mode check fails if any `illustrative` rule is active in production

---

## 6. GATE CATALOGUE

Cadence:

- **C** = per commit (pre-push hook + CI)
- **W** = per wave (builder self-check, reviewer run, merged-SHA run)
- **P** = per phase gate

Commands assume the WP-00 scripts. Package scope is `@tt/*` (proposed).

| Gate | Name | Intent | Example command(s) | When | Pass criteria |
|---|---|---|---|---|---|
| G0 | Ownership & scope | Diff stays inside the WP manifest. No edits to contracts, merged migrations or root files | `pnpm tsx tools/plan/check-ownership.ts --wp $WP --base $BASE --head HEAD`; `--overlap` across a wave's briefs | C, W | 0 files outside manifest. 0 manifest overlaps. 0 modified merged migrations |
| G1 | Install & build | Reproducible build | `pnpm install --frozen-lockfile && pnpm turbo run build` | C, W | Exit 0. Lockfile unchanged unless an orchestrator integration commit |
| G2 | Typecheck | Strict TS; infoKey and Money enforced by types | `pnpm turbo run typecheck` (`tsc --noEmit`, `strict`, `noUncheckedIndexedAccess`) | C, W | 0 errors. 0 new `@ts-ignore`/`@ts-expect-error` without a finding ID |
| G3 | Lint | R8 raw controls, money misuse, forbidden imports (R4), no `.only`/`.skip` | `pnpm turbo run lint` (ESLint with `@tt/eslint-plugin`: `no-raw-controls`, `no-float-money`, `no-restricted-imports` for `@neondatabase/*`, `@vercel/*`, `nodemailer`, `twilio` outside allowed packages; `no-focused-tests`, `no-skipped-tests`) | C, W | 0 errors, 0 warnings in changed files |
| G4 | Unit tests + coverage | Domain correctness | `pnpm turbo run test -- --coverage --passWithNoTests=false` (Vitest) | C, W | All pass. packages/domain ≥90% lines / ≥85% branches. funds, ledger, surplus, claims state machine and recoveries ≥95% branches. Coverage not lower than the previous merged SHA |
| G5 | Property tests | Fund-engine invariants at scale | `FC_NUM_RUNS=10000 pnpm --filter @tt/domain test:property` (fast-check; seed printed) | W (C at 500 runs) | All properties hold. Seed and run count logged. Includes per-fund balance, split sum, inter-fund net-zero, reversal symmetry, and allocation sum = distributable (M15) |
| G6 | Migration round-trip | DoD1 reversible, plain PG16 | `docker run -d postgres:16`; `pnpm db:migrate up && pg_dump -s > a.sql && pnpm db:migrate down --to 0 && pnpm db:migrate up && pg_dump -s > b.sql && diff a.sql b.sql` | W | Exit 0 and empty diff. Every up has a down. Numbers are inside WP blocks |
| G7 | Schema invariants (catalog meta-tests) | DB-level DoD across all tables | `pnpm --filter @tt/db test:invariants`. SQL over `pg_class`/`pg_attribute`/`pg_policy`/`pg_trigger`: every business table has `relrowsecurity AND relforcerowsecurity`, ≥1 policy and the audit trigger; app role is not owner and not BYPASSRLS; no `real`/`double precision`/`money` types; money columns are `numeric(20,3)`; registered sharia tables have `sharia_status` NOT NULL, a CHECK and **no default**; `journal_line.fund_id` NOT NULL FK; no UPDATE/DELETE grant on audit tables | W | 0 violations |
| G8 | RLS per role | DoD4, §9.4 | `pnpm --filter @tt/db test:rls` (logs in as each Appendix Y role with scoped GUCs and asserts visibility for SELECT/INSERT/UPDATE/DELETE in and out of scope) | W | 100% of (role × table × op) matrix cells for new tables tested and passing. Agent A cannot see Agent B's rows (`@acc:M04-1`) |
| G9 | Ledger guarantees (adversarial SQL) | §5.4, R1, R2, closed period | `pnpm --filter @tt/db test:ledger-guarantees` (Appendix X1–X8 as the app role) | W | Every forbidden operation is rejected with the expected error code. Allowed paths succeed. A 100k-line journal posts within the ADR-003 budget (A-06) |
| G10 | Maker-checker & SoD | §4, §9.1 L3, §9.3 | `pnpm test:sod` (API + DB): self-approve, over-limit, the §9.3 conflict list, Tenant Admin money, SSB financial edit, self role grant | W | All blocked cases are blocked and audited. Allowed chains complete |
| G11 | Audit chain | M27, DoD7 | `pnpm test:audit && pnpm --filter @tt/worker job:run audit-verify --tenant ci` | W | Every write in the test run produced an audit row. Chain verification OK. A tamper test (direct row edit as owner) is detected |
| G12 | Events & outbox | §11, §12.4, ADR-005 | `pnpm events:check-catalogue` (every publish/subscribe call is in the catalogue and every catalogue entry has a producer); `pnpm test:events` (publish-in-tx rollback, 3× replay, out-of-order, DLQ) | C (catalogue), W | 0 uncatalogued events. 3× replay gives exactly 1 effect. Rollback publishes nothing |
| G13 | i-text & Learning | §10.1, DoD5–6 | `pnpm help:check` (extract infoKeys from TSX via AST → every key has ar+en, ≤80 words each, key regex, required fields); `pnpm learning:check` (course per enabled module, quiz present); release mode: `pnpm help:check --release` | C (dev mode), W, P (release) | Dev: 0 missing keys. Release: 0 keys not `approved`, 0 `illustrative` active in prod config |
| G14 | Rule & placement static rules | DoD8, R5, R6, R7, R4 | `semgrep --error --config tools/semgrep/takaful.yml` with rules for: numeric literals in rate/percent/limit contexts in packages/domain and apps/**; `/ 100` on Money; route handlers importing worker job modules or calling PDF/batch functions; HTTP clients outside packages/integrations; `process.env.NEON_*`/`VERCEL_*` read in domain; `set_config('app.` outside auth | C, W | 0 findings (justified suppressions need a finding ID) |
| G15 | E2E + screenshots | DoD9, DoD11 | `pnpm playwright test --project=ar-rtl --project=en-ltr` (visual comparisons `toHaveScreenshot`, `dir` assertions, `@acc` tags); throttled profile for M06-5 / M22 | W, P | All pass in both projects. No unreviewed baseline changes. Report HTML archived |
| G16 | Sandbox egress block | R6, D10, §15.1#9 | `pnpm test:sandbox-egress` (tenant `mode=sandbox`: every connector send throws `SandboxOutboundBlocked` and writes to internal mailbox); network check: run the worker in a container with an egress-deny policy and assert zero DNS/TCP to non-allow-listed hosts | W, P | 0 outbound attempts succeed. All messages are in the mailbox. Watermark is present on screens and PDFs |
| G17 | Acceptance tag lint | Traceability hygiene | `pnpm acceptance:lint` (every `@acc:` tag names a real README (e) ID or ADR-amended ID) | C | 0 unknown tags |
| G18 | Security static | §13 SAST/secret/dependency | `gitleaks detect --source . --log-opts="$BASE..HEAD" --redact`; `semgrep --error --config p/owasp-top-ten --config p/typescript --config p/secrets`; `pnpm audit --audit-level=high` or `osv-scanner -r .`; licence check `pnpm licenses list` vs allow-list | C (gitleaks, semgrep), W (all) | 0 secrets. 0 high/critical SAST. 0 high/critical vulnerable deps without an approved exception. Licences on the allow-list |
| G19 | Portability | R4, §12.3 | `docker compose -f docker-compose.ci.yml up --build --abort-on-container-exit` (web + worker images + `postgres:16` + MinIO) running the smoke e2e subset | W | Smoke e2e passes on plain PG16 + S3-compatible storage, with no Neon or Vercel services |
| G20 | Load & stress | §16 targets | `k6 run tests/load/issue-certificate.js` (200 VUs; thresholds `http_req_duration{flow:issue}` p(95)<2000); `k6 run tests/load/month-end-close.js` on 3-year dataset; cold-path run after 10-min idle (B-36) | P (smoke at P2, full at P3) | Thresholds met. Close < 30 min. Error rate < 0.1% |
| G21 | DAST | §13 | `docker run ghcr.io/zaproxy/zaproxy:stable zap-baseline.py -t $STAGING_URL -c tools/zap/rules.conf` (weekly); `zap-full-scan.py` at P3 | P (+ weekly on staging) | 0 High. Mediums triaged into the ledger |
| G22 | Masking leak scan | §14.2, §15.1#9 | `pnpm --filter @tt/masking leak-scan --db $SANDBOX_URL` (regex + checksum validity for national numbers, phones in real ranges, e-mail domains ≠ example.invalid, known-name list) + 200-record manual sample record | P (P1), on every sandbox load | 0 hits. Manual sample signed |
| G23 | Reconciliation | §14.3, §15.1#6 | `pnpm --filter @tt/worker job:run recon --sample $ID --report out/recon.xlsx` (counts, contributions, claims, fund balances vs client control totals) | P | Differences = 0.000 LYD per fund, or each difference explained and accepted by client finance |
| G24 | Backup / DR restore | §13 | `tools/tenant-factory/scripts/restore-test.sh --env staging` (PITR + logical backup restore, then audit-chain verify + TB compare) | P (P1 d27–29, P3, then quarterly) | Restore within RTO ≤ 4 h. Data loss ≤ RPO 15 min. Audit chain verifies. TB is identical |
| G25 | Acceptance traceability | §6 (e), §15 exits | `pnpm acceptance:report --phase P2 --junit out/*.xml` (maps every README (e) ID → tagged tests → result) | W (informational), P (blocking) | Phase scope: 100% of IDs have ≥1 passing test |
| G26 | Mutation testing (fund core) | Tests actually assert money logic | `pnpm --filter @tt/domain stryker run --mutate "funds/**,ledger/**,surplus/**"` | P | Mutation score ≥ 80% on the listed paths |
| G27 | Rule-pack provenance | D-09, R7, §18 | `pnpm rulepacks:check` (every row has issuer, source ref, effective dates, status; `illustrative`/`to_verify` counts reported; production config rejects `illustrative`) | W (report), P (blocking for go-live) | Schema valid. At go-live, 0 active `illustrative` rows |

The **per-wave required set** is G0–G19 (G17 included). The **per-phase** set adds G20–G27, as scoped by the phase.

---

## 7. FINDINGS LEDGER FORMAT (`docs/plan/findings-ledger.md`)

Rows are appended only. A status change is a new row event in the History section, and the main table shows the current state. The orchestrator maintains the file. The auditor alone sets `DEFERRED`, `WONT_FIX` and `CLOSED`.

```markdown
# Findings Ledger

Statuses: OPEN → IN_FIX → FIXED (fixer, with commit) → VERIFIED (reviewer, with evidence) → CLOSED (auditor at wave sign-off)
          OPEN → DEFERRED (auditor; MEDIUM/LOW only; target wave required) | WONT_FIX (auditor; LOW only, or ADR-backed)
          VERIFIED → REOPENED (if a later wave regresses it)
ID format: «wave»-F«nnn» for review findings; «wave»-A«nnn» for auditor findings; V-«A|B|D»-«nn» for spec-validator items tracked here.

## Summary
| Wave | BLOCKER open | HIGH open | MEDIUM open/deferred | LOW open | Last updated |
|---|---|---|---|---|---|
| P1W03 | 0 | 1 | 2/1 | 4 | 2026-11-12 |

## Findings
| ID | Sev | Status | Wave found | WP / module | Location (file:line) | Rule / ref | Title | Repro (test or cmd) | Fix owner | Fix commit | Verified by / evidence | Target wave (if deferred) | Approved by |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| P1W03-F001 | BLOCKER | VERIFIED | P1W03 | WP2 / M08 | packages/db/migrations/0305_m08_journal.up.sql:41 | R2, C05, ADR-003 | posted journal_line UPDATE allowed for app role | tests/adversarial/P1W03/x05-posted-update.test.ts | P1W03-WP2 | a1b2c3d | reviewer-r2 / evidence/P1W03/reviewer-r2/G9.log | — | — |
| P1W03-F002 | HIGH | OPEN | P1W03 | WP3 / M09 | packages/db/test/rls/m09.rls.test.ts | DoD4, C13 | no RLS test for surveyor role on claim_assessment | `pnpm test:rls -t surveyor` (0 tests) | P1W03-WP3 | | | | |
| P1W03-F003 | MEDIUM | DEFERRED | P1W03 | WP3 / M09 | content/help/m09.yaml:88 | DoD5, C20 | ar text for err.m09.stage-skip is a literal translation, unclear | review note | P1W04-WP1 | | | P1W04 | auditor 2026-11-12 |

## History (append-only)
| When (ISO) | ID | From → To | Actor | SHA | Note / evidence path |
|---|---|---|---|---|---|
| 2026-11-10T14:02Z | P1W03-F001 | — → OPEN | reviewer-r1 | f00d… | evidence/P1W03/reviewer-r1/X05.log |
| 2026-11-11T09:40Z | P1W03-F001 | OPEN → FIXED | fix-WP2 | a1b2c3d | migration 0306 adds immutability trigger |
| 2026-11-11T12:15Z | P1W03-F001 | FIXED → VERIFIED | reviewer-r2 | a1b2c3d | G9 green; X05 passes |
```

Rules:

- A wave cannot be SIGNED_OFF while any of its rows is BLOCKER or HIGH in a status other than VERIFIED or CLOSED.
- A phase cannot pass while any row of any wave is BLOCKER or HIGH and not CLOSED. A DEFERRED MEDIUM whose target is an earlier wave is automatically escalated to HIGH.
- Validator items (A-xx, B-xx, D-xx) that become ADRs are tracked as `V-*` rows until the ADR is accepted.

---

## Appendix X — Adversarial test library (reviewer must attempt the applicable ones)

All tests run as the **app role** with realistic GUCs, unless stated otherwise. Each test must fail closed: the operation is rejected, and logged where the spec says so.

| X | Attack | Expected result | Modules |
|---|---|---|---|
| X1 | **Cross-fund journal**: one journal with PTF and SHF lines, each fund balanced, no `inter_fund_transfer` | Rejected at COMMIT. `sharia_exception` row written (M16-2) | M08/M12 |
| X2 | Journal balanced overall but not per fund (PTF Dr 100 / SHF Cr 100) | Rejected at COMMIT | M08 |
| X3 | Transfer with mismatched legs (PTF due-to 300.000, SHF due-from 299.999), or wrong type direction (`WAKALA_FEE` SHF→PTF), or referencing an unapproved `QARD_DRAW` | Rejected | M08 |
| X4 | Account of fund SHF used on a line tagged PTF | Rejected by composite FK | M08 |
| X5 | UPDATE amount, or DELETE a line, of a posted journal; DELETE posted header | Rejected (R2) | M08/M12 |
| X6 | **Posting to a closed period**, including a reversal dated in a closed period and a back-dated manual journal | Rejected | M12 |
| X7 | Insert into a sharia-tracked table without `sharia_status`; with an invalid value; UPDATE of status on a posted row by the app role | All rejected. Status change only via event by an SSB role | all |
| X8 | Amount with 4 decimals; JS float `0.1+0.2` passed through the API; `"1e3"` string | Rejected by Zod/Money. DB stores exact 3 dp | all money |
| X9 | **Skip claim stage** 2→4 via API, and via direct `UPDATE claim SET state=…` | Both rejected (M09-1, ADR-008) | M09 |
| X10 | Re-enter stage 1 from stage 2 and check whether a second claim number or reserve is created | No duplicate side effects | M09 |
| X11 | **Approve own item**: maker approves own claim assessment / referral / manual journal / refund / payroll run | Rejected (M05-3, M09-5, §9.3) | M05, M09, M12, M07, M34 |
| X12 | Checker approves above their monetary limit | Rejected | M05, M09, M07 |
| X13 | Tenant Admin posts or approves money; SSB member edits financial data; user grants self a role or edits own user/salary | All rejected and audited | M01, M12, M34 |
| X14 | **Out-of-scope RLS read**: branch-A user reads branch-B rows; Agent A reads Agent B (M04-1); PTF-scoped user reads SHF lines; payroll rows read by non-HR role | 0 rows (not an error leaking existence). API returns 404 | all |
| X15 | Scope widening: app role calls `set_config('app.branch_ids', '<all>', false)` or `SET app.fund_scope` mid-session; session GUC leaks across pooled connections | Rejected or ineffective (ADR-009). No leakage across requests | M01 |
| X16 | Level-0 user calls a module API | 404 (not 403) | all |
| X17 | **Duplicate webhook**: same gateway event delivered 3×, concurrently | Exactly 1 receipt and 1 set of postings (M07-2) | M07 |
| X18 | Webhook with invalid signature; amount or currency mismatch | 401 with no receipt; exception queue entry | M07 |
| X19 | Event replayed 3×; `ClaimPaid` delivered before `ClaimApproved` | 1 effect; out-of-order event is retried, not applied | all consumers |
| X20 | Business tx rolls back after `publish()` | No outbox row and no downstream effect | all producers |
| X21 | Sandbox tenant triggers renewal SMS/e-mail; direct call to connector adapter; worker tries raw HTTPS to an SMS API | Blocked; message in internal mailbox; egress denied (R6) | M06, M30 |
| X22 | Change a split/commission/tax rule version while a certificate/run is in flight | In-flight record keeps its pinned version (R7) | M03, M04, M34 |
| X23 | Activate a split rule not SSB-approved, or one whose parts ≠ 100.000% | Rejected (§5.2) | M03, M08 |
| X24 | Edit an audit row as the owner role, then run chain verify | Tamper detected | M27 |
| X25 | Omit `infoKey` on a component; use a raw `<input>` | Compile error; lint error | UI |
| X26 | Daily expiry scan run twice; scan skipped a day | Exactly one alert per certificate (M06-3, B-05) | M06 |
| X27 | Claim payment posting attempts SHF; commission or payroll posting attempts PTF; late fee to PTF/SHF income | Rejected, or routed per rule (M09-2, M04-4, M07-4, M34) | M09, M04, M07, M34 |
| X28 | Concurrent issuance from the same number series (50 parallel) | No duplicates and no gaps beyond ADR-010 accounted voids | M06, M07, M12 |
| X29 | Create a customer with an existing national number via a race (2 parallel requests) | One succeeds; the other is blocked and shown the existing record (M02-1) | M02 |
| X30 | Field-encrypted columns (national ID, salary) read via the reporting role or `rpt_*` views | No plaintext exposed | M02, M34, M28 |

## Appendix Y — Role list for RLS/SoD matrices (from README §9.2)

Agent/border clerk (own scope) · Underwriter · Senior underwriter · Claims handler · Surveyor · Claims manager · Cashier · Accountant · Finance officer · CFO · Reinsurance officer · Investment officer · Distribution manager · Actuary (reserving / approving per ADR-011) · Product manager · SSB member · Internal Sharia auditor · Compliance officer/MLRO · HR officer · HR manager · Payroll officer · Payroll checker · Employee (self-service) · Internal auditor (time-boxed RO) · External auditor (time-boxed RO) · ISA regulator (RO M18 + registers) · Tenant Admin · Reporting role (Metabase, read-only) · Migration owner role (CI only: must be the only role able to DDL).

Each RLS test file declares `matrix: Record<Role, {select: 'all'|'scoped'|'none', insert, update, delete}>` per table. G8 fails if any Appendix Y role is missing from the matrix of a new table. A role is never silently omitted; use `'none'` explicitly.
