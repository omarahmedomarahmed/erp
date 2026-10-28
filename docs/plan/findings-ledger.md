# Findings Ledger

Format and rules are in `AGENT-PROTOCOL.md` §7. Rows are append-only. A status change goes into History, and the main table shows the current state. The orchestrator maintains this file. Only the auditor sets `DEFERRED`, `WONT_FIX` and `CLOSED`.

Statuses: OPEN → IN_FIX → FIXED → VERIFIED → CLOSED · OPEN → DEFERRED | WONT_FIX · VERIFIED → REOPENED

ID format:
- `W«nn»-F«nnn»`: review findings
- `W«nn»-A«nnn»`: auditor findings
- `V-«A|B|C|D|E»-«nn»`: spec-validator items, tracked until their D00 decision or README erratum is accepted

## Summary

| Scope | BLOCKER open | HIGH open | MEDIUM open/deferred | LOW open | Last updated |
|---|---|---|---|---|---|
| Spec validation (pre-build) | 11 | 18 (consolidated) | see validation reports | see validation reports | 2026-10-28 |

## Findings: spec validation (pre-build)

The consolidated items come from PLAN-V1 §4. Every other validator flag stays in its report under `validation/` and is closed through the D00 decision or erratum named here.

| ID | Sev | Status | Source flags | Title | Resolution path | Owner | Needed by |
|---|---|---|---|---|---|---|---|
| V-PB-01 | BLOCKER | OPEN | A-01, E-02 | Contribution income recognised twice; fund of receivable undefined | D00-01 + errata 2 | Takaful accountant + PO | W7 |
| V-PB-02 | BLOCKER | OPEN | A-02, A-03 | Surplus formula double-deducts Wakala and provisions | D00-02 + errata 3 | Takaful accountant + SSB | W18 |
| V-PB-03 | BLOCKER | OPEN | C-01 | RLS blocks system cross-fund postings | D00-05 + BU F21 | Tech lead | W4 |
| V-PB-04 | BLOCKER | OPEN | C-02, E-01 | No parallel-build conventions; table ownership | PLAN §7.3 + D00-15 | Orchestrator + auditor | W1 |
| V-PB-05 | BLOCKER | OPEN | E-06, A-13 | P1 claims "without reserving" vs reserve actions | D00-13 + errata 6 | PO | W11 |
| V-PB-06 | BLOCKER | OPEN | E-12 | Approval engine triple ownership, built late | D00-14 + BU F15 (W7) | PO | W7 |
| V-PB-07 | BLOCKER | OPEN | E-59 | Masking CLI and sample timeline conflict | BU-119 in W2; CLI by day 8 | Orchestrator + client IT | W2 |
| V-PB-08 | BLOCKER | OPEN | E-66, A-14 | Exit 6 needs CoA mapping and opening balances | Errata 16, 18 | PO + client finance | P1 exit |
| V-PB-09 | BLOCKER | OPEN | D-02 | Legal hosting opinion too narrow, no deadline | PLAN §14 A-4; H9 | Client counsel | Day 10 / day 60 |
| V-PB-10 | BLOCKER | OPEN | B-01, D-08 | Stripe/PayPal unavailable in Libya | D00-17 (signed deviation) + errata 7 | PO + client | P0 |
| V-PB-11 | BLOCKER | OPEN | C-12 | Staging and sandbox branched from production | D00-20 + errata 13 | Tech lead | W6 |
| V-PH-01 | HIGH | OPEN | C-03 | Synchronous audit chain is a global lock | BU F06 (async chainer) | Tech lead | W4 |
| V-PH-02 | HIGH | OPEN | C-10, C-24 | Neon driver and pooler: RLS session context | BU F04; D00-20 | Tech lead | W3 |
| V-PH-03 | HIGH | OPEN | C-09 | No reversible plain-SQL migration tool | D00-20 (dbmate) | Tech lead | W2 |
| V-PH-04 | HIGH | OPEN | C-05 | PAdES CA / Libyan licensing | H13; Q32 | Client + counsel | Go-live |
| V-PH-05 | HIGH | OPEN | C-08 | i-text review workload | D00-22; H23; A-7 | Client + PO | W3 onward |
| V-PH-06 | HIGH | OPEN | D-03, D-04 | 2026 motor decisions missing | Errata 9; H10 | Client legal | Day 6 |
| V-PH-07 | HIGH | OPEN | D-05 | Payroll statutory model | Errata 9, 10; BU-221 | Payroll accountant | P2 |
| V-PH-08 | HIGH | OPEN | B-33, B-34, B-35 | Event catalogue gaps | D00-11 | Orchestrator | W4 |
| V-PH-09 | HIGH | OPEN | B-07, B-08, B-09 | Retakaful recovery ownership, trigger and AT-2 | D00-12 + errata 6 | Reinsurance officer | W15 |
| V-PH-10 | HIGH | OPEN | A-08 | `sharia_status` default vs R2 | D00-07 | SSB adviser | W3 |
| V-PH-11 | HIGH | OPEN | A-10 | Actuary SoD deadlock; no Board role | D00-08 | PO | W7 |
| V-PH-12 | HIGH | OPEN | B-14, B-17 | Family / health / export credit until P4; offline PWA | D00-17 | Client | P0 |
| V-PH-13 | HIGH | OPEN | D-16 | UAE 2026 takaful regulation changes the rule-pack model | P5 re-scope | PO | P5 |
| V-PH-14 | HIGH | OPEN | C-11, C-13 | Network isolation cost; in-region RPO | Cost model; errata 15 | PO | Production |
| V-PH-15 | HIGH | OPEN | R1-01 | Build environment: no Docker daemon, shared 4 vCPU / 15 GB, PG16 only | PLAN §7.5 | Orchestrator | W1 |
| V-PH-16 | HIGH | OPEN | R1-07, R1-08 | Forgeable evidence; same-model reviewer; AI-made golden numbers | PLAN §7.4; BU-00-TEST sign-off | Auditor | W1 |
| V-PH-17 | HIGH | OPEN | R1-16 | Unmasked data in migration trial loads | PLAN §7.6 | PO + client IT | W26 |
| V-PH-18 | HIGH | OPEN | D-18, E | Client facts unverified (founding, ARIMA) | PLAN §14 A-11; errata 21 | PO | P0 |

## Findings: build waves

| ID | Sev | Status | Wave found | BU / module | Location (file:line) | Rule / ref | Title | Repro | Fix owner | Fix commit | Verified by / evidence | Target wave (if deferred) | Approved by |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|

## History (append-only)

| When (ISO) | ID | From → To | Actor | SHA | Note / evidence path |
|---|---|---|---|---|---|
| 2026-10-28 | V-PB-01…11, V-PH-01…18 | — → OPEN | auditor | — | Seeded from PLAN-V1 §4 and `validation/` |
