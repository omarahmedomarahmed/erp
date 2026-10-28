# Validator A — Finance & Sharia Core: audit of README.md

Scope: §5 (fund model), M08, M12 (6.8), M16 (6.10), M15 (6.11), M11 (6.12), M13, M19, M14, plus related rows in §8, §9, §14, §15, §17, §18.
Method: I read all 1,160 lines of README.md. I checked the Libya articles against the **Arabic statute text of Law No. 3 of 2005**, taken from the Libyan law-society portal (lawsociety.ly/?p=1005, fetched with curl and converted to text). I checked the AAOIFI and IFSB items against AAOIFI and IFSB pages and announcements. AAOIFI standard texts are paywalled, so where I could not see the paragraph text, the item is marked UNVERIFIED.

---

## 1. Summary

The fund model is sound in concept: three funds, Wakala and Mudaraba transfers, Qard Hasan, and 100% of surplus to participants. The Libya rule pack is largely accurate. Every numeric figure I checked against the statute (Arts 4, 6, 13, 15, 16, 17, 22, 23, 24) is correct. However, the spec has **accounting-design contradictions** that parallel builders will resolve in different ways. Some of them make the surplus figure wrong by construction.

Most important:
1. **Accrual vs cash, and which fund holds the receivable** (A-01). The §5.5 worked example books *Bank / Contribution income* when the money is received. M12 books *receivable / unearned contribution* at issue. Followed literally, the two rules recognise the income twice, and neither says which fund holds the receivable before the split at collection.
2. **The surplus formula double-counts** (A-02, A-03). Step 1 starts from "tabarru'" contributions, which may already be net of Wakala, and step 4 deducts Wakala again. Step 3 deducts the full UCR and outstanding-claims balances, which are already reflected in "earned" contributions and in claims net of the change in outstanding claims.
3. **Inter-fund mechanics are under-specified** (A-04, A-05). It is unclear whether a transfer is one journal or two. There is no transfer type for cash settlement of due-to/due-from balances, so settlement journals would be blocked. No constraint ties the PTF "due to" to the SHF "due from". `SURPLUS_ALLOC` is not an inter-fund transfer at all.
4. **The per-row deferred constraint trigger** works in PostgreSQL 16 but becomes O(n²) on large journals: surplus allocation, commission and payroll runs (A-06).
5. **`sharia_status` conflicts with R2 immutability.** The SSB may change the status of posted rows, but posted rows cannot be updated. The "default" also contradicts acceptance test 1 (A-08).
6. **SoD conflict.** The actuary is "M13 maker" and an "M15 checker" (§9.2), but §9.3 blocks "Calculate reserves and approve the surplus" (A-10).
7. **FAS 43 is promised in two different phases.** M12 promises "FAS 43 recognition" in P1–P2, but the FAS 43 engine is P4. FAS 43 is a full measurement standard, effective 1 Jan 2025 (A-11).
8. **The P1 IFRS 17 / FAS 43 data capture is too thin.** Claims have no loss date or reported date, acquisition costs have no link, and there is no onerous flag basis (A-12).
9. **The P2 surplus run on the 12-month sample cannot be checked against the client's last surplus.** The last *distributed* year is a different year from the last 12 months, and opening reserve and Qard balances are not requested (A-14).

Libya: the statute confirms 47% / 25% / 40% (engineering is excluded and computed pro rata; reserves are net of reinsurance), 20% / 25% solvency with the reinsurance deduction capped at 50%, the paid-up capital floor, and the 2.5‰ / 5‰ levy. The README omits the life/family solvency component, the engineering exception and the persons-insurance class rules (A-17, A-18). The FAIR market overview says "no allowance for reinsurance ceded" in the solvency margin; that is **wrong against the statute**, and the README matches the statute.

---

## 2. Flags

Severity: BLOCKER = builders will build divergent or incorrect money logic in P1/P2; HIGH = material rework or wrong figures if not fixed before the module starts; MEDIUM = gap or ambiguity to resolve during build; LOW = wording or minor.

### A-01 — BLOCKER — Accrual at issue vs the §5.5 cash example; fund of the receivable is undefined
- **Where:** §5.5 L224–232; §6.8 M12 L472; §6.6 M07 L413–420; §5.3 L204; §12.4 L860–862.
- **Issue:** M12 says "Issue policy → contribution receivable / unearned contribution (accrual at issue)". §5.5 shows the cash receipt as *Dr Bank (PTF) / Cr Contribution income*. If both are implemented, income is recognised twice: once as unearned and released over coverage, and once as income on receipt. The receipt entry should be *Dr Bank / Cr Contribution receivable*. The fund split happens only "on allocation / receipt" (M07 L413, M08 `WAKALA_FEE` trigger "Contribution allocated"), so the gross receivable created at issue has no defined fund. It contains tabarru' (PTF), Wakala (SHF) and possibly an investment part (PIF). Under R1 it must sit in exactly one fund. Also undefined: the fund for overpayments or customer credit (L414), unallocated receipts, and refunds on cancellation (including the Wakala portion already moved to SHF).
- **Evidence:** internal contradiction. Under both the legacy AAOIFI takaful standards and FAS 43, contributions are recognised over the coverage period, not on cash (FAS 43 effective 1 Jan 2025: https://aaoifi.com/announcement/aaoifi-issues-financial-accounting-standard-43-accounting-for-takaful-recognition-and-measurement-officially-in-arabic/?lang=en).
- **Fix:** Replace §5.5 with a three-event worked example (issue, receipt, month-end earning). Recommended model: at issue, book the gross receivable and unearned contribution **in the PTF** and accrue the Wakala fee as *PTF Dr Wakala expense (or deferred Wakala) / Cr Due to SHF*, with the mirror entry in SHF. Then the split rule is applied **at issue**, not at receipt. Receipt only clears the receivable, and cash moves between fund bank accounts by settlement. Alternatively, keep the split at receipt but state it explicitly and use a single "unallocated" suspense account in the PTF. Make the Wakala recognition basis (written, earned or collected) a versioned rule-pack parameter (Q2). Add a cancellation example that reverses the `WAKALA_FEE` transfer.

### A-02 — BLOCKER — Surplus formula: possible double deduction of the Wakala fee
- **Where:** §6.11 steps 1 and 4 (L583, L586); §5.2 L192–196; §5.5 L230–232.
- **Issue:** Step 1 = "PTF contributions (**tabarru'**) earned". §5.2 defines tabarru' as the PTF part, i.e. net of Wakala. Step 4 then deducts the "Wakala fee" again. §5.5, by contrast, credits the **gross** 1,000 to the PTF and expenses the Wakala 300. Whether step 1 is gross or tabarru'-only changes the surplus by the whole Wakala amount.
- **Evidence:** internal; client formula "contributions − claims − provisions − expenses" (L577).
- **Fix:** Define step 1 as "gross contributions earned in the PTF (tabarru' + Wakala portion, before the Wakala expense)" and keep step 4. Or define it as "tabarru' net of Wakala" and remove Wakala from step 4. Pick the gross presentation, which matches §5.5 and the AAOIFI gross PTF statement (FAS 42 presentation; exact paragraph UNVERIFIED). Add a golden-number test.

### A-03 — BLOCKER — Surplus formula: provisions double-counted
- **Where:** §6.11 steps 1–3 (L583–585).
- **Issue:** Step 1 uses *earned* contributions, which already exclude the unearned contribution reserve (UCR). Step 2 uses claims "paid + change in outstanding", which already includes the outstanding-claims movement. Step 3 then deducts "technical reserves (unearned contribution reserve, outstanding claims, IBNR, fluctuation reserve, Libyan floors)" again. Read as balances, that is a gross double deduction. Even read as "changes", UCR and outstanding claims appear twice.
- **Fix:** Rewrite step 3 as "**change in** provisions not already reflected above: IBNR, fluctuation (adverse-deviation) reserve, premium-deficiency / unexpired-risk top-up, and the top-up required to meet the Art. 15 minimum UCR". State explicitly that the Art. 15 floor raises the UCR, which reduces earned contributions, so it is not a separate deduction. All figures are **net of retakaful** (Art. 15 last paragraph: "بعد استبعاد ما يناظر العمليات المعاد التأمين عليها").

### A-04 — HIGH — Inter-fund transfer: one journal or two? No pairing constraint
- **Where:** §5.3 L211; §5.4 L218, L220; §5.5.
- **Issue:** "Each transfer posts a 'due to' in one fund and a 'due from' in the other." If this is **one journal**, per-(journal, fund) balancing works and the cross-fund rule triggers correctly. If it is **two journals**, each touches one fund, the rule at L220 never fires, and nothing ensures both legs exist or match. In neither case is there a guarantee that the PTF due-to-SHF equals the SHF due-from-PTF.
- **Fix:** Specify one journal per transfer, with per-fund balancing, `inter_fund_transfer_id NOT NULL` when >1 fund, and a deferred check that the amount on the "due to" account in from_fund equals the amount on the "due from" account in to_fund equals `inter_fund_transfer.amount`, with fund pair and type matching. Add a daily inter-fund reconciliation report (balances must mirror).

### A-05 — HIGH — No transfer type for cash settlement; `SURPLUS_ALLOC` and charity are mis-modelled
- **Where:** §5.3 table L202–209, L211; §6.6 L420; §6.10 L560.
- **Issue:** (a) "Cash settlement clears them later". A settlement journal (*PTF Dr Due to SHF / Cr Bank-PTF; SHF Dr Bank-SHF / Cr Due from PTF*) touches two funds, but no transfer type covers it, so §5.4 would block it. (b) `SURPLUS_ALLOC` goes "PTF → participants payable". That is a liability inside the PTF, not another fund, so it is not an inter-fund transfer. (c) The charity / purification account and late fees (L420, L560) must belong to a fund under R1, and no fund is named. (d) `QARD_DRAW` is triggered only by a "PTF deficit"; intra-year liquidity Qard (the PTF cannot pay claims before year end) is not covered. (e) There is no type for the Wakala *investment* fee (see A-21) or for refunds of Wakala on cancellation.
- **Fix:** Add `SETTLEMENT` (clears existing due-to/due-from only; amount ≤ open balance), `WAKALA_FEE_REVERSAL`, and `INVESTMENT_WAKALA_FEE`. Model `SURPLUS_ALLOC` as a single-fund PTF journal (Dr surplus / Cr surplus payable to participants). Define a charity payable account inside each fund that generates purification income, with no income-statement impact. Allow `QARD_DRAW` at any time on CFO + SSB approval.

### A-06 — HIGH — Deferred constraint trigger is feasible but O(n²) on big journals; "no UPDATE grant on posted rows" is not expressible with GRANT
- **Where:** §5.4 L218, L221.
- **Issue:** PG16 constraint triggers "must be AFTER ROW triggers" and "should not" use transition tables (https://www.postgresql.org/docs/16/sql-createtrigger.html). A per-line trigger that re-sums its (journal, fund) fires once per line, so an N-line journal does O(N²) work. Surplus allocation for tens of thousands of participants, commission runs and payroll runs will hit this, against a month-end close target of < 30 min (§16). Separately, GRANT is table- or column-level, so "no UPDATE/DELETE grant on posted rows" cannot be row-conditional.
- **Fix:** Put the deferred constraint trigger on the **journal header** (fires once, on `status → posted`, checks all funds with one GROUP BY). Add a BEFORE trigger on `journal_line` that rejects insert, update or delete when the parent is posted. Enforce immutability with a FORCE RLS UPDATE/DELETE policy `USING (status <> 'posted')` plus a trigger. Use a composite FK `(account_id, fund_id) → account(id, fund_id)` for "account must match fund". Gap-free journal numbering must use a locked counter table, not a SEQUENCE, so rolled-back deferred failures leave no gaps.

### A-07 — MEDIUM — Multi-currency balancing basis undefined
- **Where:** §5.4 L218; §4 L171; §5.6 L236.
- **Issue:** "Debits = credits" does not say in which currency. Journals with a foreign transaction currency converted at 3 decimals can be out by 0.001 LYD.
- **Fix:** Balance mandatorily in `amount_lyd` per (journal, fund), and in the transaction currency when the journal is single-currency. Add a rule for a rounding line, posted to a per-fund FX rounding account. Specify FX revaluation per fund.

### A-08 — HIGH — `sharia_status`: default vs NOT NULL test; status change vs R2 immutability; scope of "every transaction"
- **Where:** R3 L91; §6.10 L552–553, L571; §5.6 L236 (on `journal_line`).
- **Issue:** (a) "`compliant` (default only if produced by an SSB-approved rule/product)" is conditional, so it cannot be a column DEFAULT. If any DEFAULT exists, acceptance test 1 ("inserting without `sharia_status` fails") becomes false. (b) "Manual change only by Sharia auditor/SSB" requires UPDATE on posted journals and lines, which R2 forbids. (c) There is no derivation rule for tables with no "product" (payroll runs, supplier invoices, manual journals, fixed assets), so they will either default to `pending_review` and flood the SSB queue or be guessed. (d) What a `non_compliant` status *blocks* is undefined (posting, payment, distribution). (e) "Every contract and transaction table" is an open-ended list, and builders need a registry.
- **Fix:** No DB DEFAULT; NOT NULL plus a CHECK enum. A BEFORE INSERT trigger or domain service derives the status from source (product/rule/counterparty approval), else `pending_review`. Keep status changes on posted records in an append-only `sharia_status_event` table, with the effective status shown in a view, and never update the row. Add a table tag (e.g. a `COMMENT` or a registry table `sharia_tracked_table`) and a CI meta-test that every tagged table has the column with NOT NULL and the CHECK. Define the blocking matrix (e.g. `non_compliant` investment income cannot be posted to income and must go to purification).

### A-09 — HIGH — FAS 43 vs "book of record" during P1–P3
- **Where:** M12 L475 ("AAOIFI FAS 43 recognition"); §8 M14 L685 ("FAS 43 fund view as book of record"; engine P4); §15 L946; Q18 L1050.
- See also A-11. **Issue:** If the FAS 43 engine is P4, the P1–P3 ledger cannot claim FAS 43 recognition. FAS 43 is an IFRS 17-style measurement standard: AAOIFI describes Part B as the "general / variable fee approach" (search summary of cis.aaoifi.com/ar/?p=1647; paragraph text UNVERIFIED). The Libyan regulator's Art. 24 returns are conventional formats ("profit distribution account", per-class revenue accounts).
- **Fix:** State that the P1–P3 book of record is a **local / regulatory basis**: UCR (pro rata with the Art. 15 floor), case OCR, IBNR as an actuary input, fluctuation reserve, with FAS 42-style fund presentation. FAS 43 measurement starts in P4 as a parallel ledger or mapping. Make Q18 a Phase 0 gate.

### A-10 — HIGH — SoD rule blocks the surplus approval chain
- **Where:** §9.2 L731 (Actuary: M13 maker … M15 checker); §9.3 L750 ("Calculate reserves and approve the surplus" blocked); §6.11 step 15 L597 (CFO → actuary → SSB → Board).
- **Issue:** The only actuary role calculates reserves and is a required surplus approver, which §9.3 blocks. Libya's client has very few actuaries (often one external).
- **Fix:** Separate the roles: "reserving actuary (maker)" and "appointed / approving actuary (checker)". Or narrow the conflict to "the same *user* who prepared the reserve run of the surplus year cannot approve that surplus run", and allow an external actuary as checker.

### A-11 — HIGH — Standard naming and scope: FAS 42/43 real; legacy standards superseded; investment standards misnamed
- **Where:** M12 L475; M16 L563; M11 L627; M10 L390.
- **Verified:** FAS 42 "Presentation and Disclosures in the Financial Statements of Takaful Institutions" and FAS 43 "Accounting for Takaful: Recognition and Measurement" are real and effective for periods beginning on or after **1 Jan 2025**. FAS 42 supersedes FAS 12, and FAS 43 supersedes FAS 13 and 15 (per AAOIFI; one academic source also lists FAS 9). Sources: https://aaoifi.com/announcement/aaoifi-issues-financial-accounting-standard-42-presentation-and-disclosures-in-the-financial-statements-of-takaful-institutions-officially-in-arabic/?lang=en and the FAS 43 announcement above. IFSB-8 is real: "Guiding Principles on Governance for Takāful (Islamic Insurance) Undertakings", Dec 2009 (IFSB-8 (December 2009), published on ifsb.org under Standards). IFSB-18 is real: "Guiding Principles for Retakāful (Islamic Reinsurance)", adopted at the 28th Council meeting (https://www.ifsb.org/press-releases/the-ifsb-council-adopts-three-documents/).
- **UNVERIFIED by fetch, believed correct:** AAOIFI Sharia Standard No. 26 "Islamic Insurance".
- **Issue:** M11 says "AAOIFI investment standards / IFRS 9 classification", which is vague and mixes frameworks. The relevant AAOIFI standards are FAS 28 (Murabaha and Other Deferred Payment Sales; supersedes FAS 2 and 20), FAS 32 (Ijarah; supersedes FAS 8), FAS 33 (Investments in Sukuk, Shares and Similar Instruments; supersedes FAS 25), and FAS 30 (Impairment, Credit Losses and Onerous Commitments; title from memory, UNVERIFIED). Sources: https://aaoifi.com/announcement/aaoifi-financial-accounting-standard-no-28-murabaha-and-other-deferred-payment-sales-officially-issued-in-arabic/?lang=en ; https://aaoifi.com/announcement/aaoifi-issues-financial-accounting-standard-32-ijarah-officially-in-arabic/?lang=en ; https://aaoifi.com/announcement/aaoifi-issues-fas-33-investments-in-sukuk-shares-and-similar-instruments-and-fas-34-financial-reporting-for-sukuk-holders/?lang=en. I could not confirm the current Mudaraba standard number. The prudential standards are also missing: IFSB-11 (takaful solvency) and IFSB-14 (takaful risk management) are relevant to M19 and M11 (from memory, UNVERIFIED).
- **Fix:** In M11 name FAS 28/32/33/30 as primary and IFRS 9 only as the optional IFRS view. Add IFSB-11/14 to M19/M16 references. Note: the aaoifi.com announcement page for the joint FAS 42/43 release currently serves spam content (possibly compromised), so cite the Arabic-release announcements or cis.aaoifi.com instead.

### A-12 — HIGH — The P1 IFRS 17 / FAS 43 data capture is insufficient for a P4 engine
- **Where:** M06 L294; M09 L359; M10 L390; §8 M14 L685; §12.4 L860.
- **Issue:** Only "issue date, coverage start/end, portfolio, annual cohort, measurement model flag" are listed. A P4 engine (PAA/GMM/VFA or FAS 43) needs history that cannot be rebuilt later.
- **Fix — the minimum P1 fields:**
  - **Certificate:** contract boundary dates, initial-recognition date (the earliest of coverage start, first due date, or onerous date), portfolio (Art. 1 class mapping), annual cohort, profitability group at initial recognition plus the basis used, PAA eligibility flag, currency, every endorsement and cancellation with its effective date and contribution delta, and the split-rule version.
  - **Cash flows:** each instalment's due date and amount, and the received date per instalment.
  - **Acquisition cash flows:** commission linked to certificate and group, with the paid date.
  - **Directly attributable expense allocation keys:** SHF cost centre to line, a placeholder table.
  - **Claims:** loss (accident) date, reported date, registration date, every case-reserve change with its date (needed for triangles and IBNR), payments with dates, recoveries, ULAE tagging.
  - **Retakaful held:** treaty-to-underlying-group mapping, ceded contribution and commission per certificate, recoverables per claim, counterparty rating.
  - **Other:** FX rates and source per date; monthly UCR and OCR snapshots.
  - **M14 events:** M14 consumes `CertificateApproved` in P1 but does not exist until P4, so the outbox must retain events or M14 must backfill from tables.

### A-13 — MEDIUM — M09 does reserving actions in P1 but the phase says "without reserving"
- **Where:** M09 L345–350 (initial reserve, reserve updated, final reserve released); §15 P1 L940 ("without reserving"); M13 P2 L684.
- **Fix:** State that **case reserves (`claim_reserve`) and their PTF postings are in P1 inside M09**, and that M13 (P2) adds UCR / Art. 15 floors, IBNR and fluctuation reserve. Define the case-reserve journal (PTF: Dr claims expense / Cr OCR).

### A-14 — HIGH — The P2 surplus on the "12-month sample" cannot be reconciled
- **Where:** §14.1 L903; M15 test 1 L605; §15 P2 L941; Q3/Q4 L1036–1037.
- **Issue:** The sample is the "last 12 months". The control is the "surplus calculation of the **last distributed year**", which is a different period. The surplus also needs **opening** UCR, OCR, IBNR, fluctuation reserve, Qard balance, retakaful balances and investment positions at the start of the window. None of these are in the §14.1 extract list (they appear only in §14.4 full migration).
- **Fix:** Ask for the full financial year matching the last distributed surplus, or a 12-month window aligned to the last fiscal year end. Add to §14.1: opening technical reserves per class (net and gross of retakaful), Qard register, investment positions, and the actuary's reserve report for that year.

### A-15 — MEDIUM — Surplus distribution details missing
- **Where:** §6.11 steps 10–14 L592–596; tests L605–609.
- **Issues and fixes:**
  - (a) "Pro rata by each participant's contribution" — specify which basis: tabarru' or gross, written, earned or collected. Recommend **tabarru' earned and collected in the year**, with outstanding receivables offset before payment (SSB to confirm).
  - (b) Certificates that are cancelled, lapsed or mid-year: define eligibility.
  - (c) Rounding residue "handled by rule": define the largest-remainder method at 0.001 LYD, with the residue left in the PTF.
  - (d) De minimis and unclaimed amounts: SSB-approved treatment (stays in PTF, or goes to charity after N months).
  - (e) A **renewal credit for a participant who does not renew** must convert to a voucher or cash after N days, or the participant loses the entitlement (a Sharia issue).
  - (f) When a renewal credit is applied, the new contribution is split across funds, so the credit acts as a PTF payable settling a receivable: specify the journal.
  - (g) Surplus per class vs whole PTF (Art. 23 per-class accounts; client asked for a single net surplus). Make it configurable, default whole-PTF.
  - (h) Whether unrealised investment gains (fair value) are distributable. Recommend excluding them unless the SSB approves.
  - (i) Other PTF income lines are missing: retakaful commission received, salvage, subrogation. Retakaful commission is PTF or SHF by rule.
  - (j) One approved run per fiscal year. A re-run after a reserve change voids the earlier approvals.
  - (k) Partial Qard repayment when surplus < Qard (repay up to the surplus, distribute 0).

### A-16 — MEDIUM — Split "must sum to 100%" ignores pass-through charges (Art. 4 levy, stamp, fees)
- **Where:** §5.2 L198; §17 L1004.
- **Evidence:** Art. 4 (statute text): annual supervision fee of **2.5‰** (life and capital-formation business) and **5‰** (other business) "من جملة الأقساط المباشرة … في السنة السابقة". Companies may not recover from policyholders "بما يجاوز النسب المحددة" (more than those rates), which implies recovery from policyholders up to those rates is allowed.
- **Fix:** Model `contribution = net contribution (split 100% tabarru'/Wakala/investment) + pass-through charges (levy, stamp, Orange Card bureau fee, policy fee)`, with each charge mapped to a fund and a payable. Decide who bears the levy: SHF as an operating cost, or PTF if recovered from participants. This is an open question for the client and the SSB.

### A-17 — MEDIUM — Art. 15 floors: missing conditions
- **Where:** §8 M13 L684; §17 L1007.
- **Evidence (statute):** Art. 15 ثانياً(أ). The unexpired-risk reserve must be at least the following percentage of the company's total written contributions for the past year: **47%** compulsory motor civil liability, **25%** marine, air and land transport, **40%** "all other operations **except engineering**". Engineering is computed pro rata over the project period. ب: claims under settlement (reported). ج: IBNR "per rules set by the Ministry". د: adverse-fluctuation reserve per the executive regulations. Last paragraph: provisions are formed **net of reinsurance**. Persons insurance (Art. 1 أولاً: life, capital formation, medical liability, personal accident and **medical treatment**) uses a mathematical reserve set by an actuary plus outstanding claims. It does not use the 40% UPR floor.
- **Issue:** The README omits the engineering exception, the net-of-retakaful basis and the written-premium base. It also does not say that **health, PA and family** (and possibly travel-medical) are persons-insurance classes under Art. 1, which use different reserve and solvency rules.
- **Fix:** Floors table columns: class, Art. 1 category (persons vs property/liability), floor %, base = net written contribution of the prior fiscal year, method override (pro rata for engineering). Map each product to an Art. 1 class in M03. IBNR rules and fluctuation-reserve bases come from the executive regulations (Decision 4/2006) and ministry rules: obtain them and add to Q17.

### A-18 — MEDIUM — Art. 17 solvency: life/family component missing; asset and liability basis undefined; takaful application unclear
- **Where:** §8 M19 L688; §17 L1009.
- **Evidence (statute, Art. 17):** For property and liability business, assets must exceed liabilities at all times by the greater of **20% of net premiums** or **25% of net incurred claims** ("صافي التعويضات التحميلية") of the past year, and the reinsurance deduction may not exceed **50%** of total operations. For persons and capital-formation business: **3‰ of capital at risk** (reinsurance reduction ≤ 50%) **plus 4% of mathematical reserves** (reduction ≤ 15%). The required excess must never be **below paid-up capital**. The ministry defines the asset and liability elements. The README is correct for non-life. The FAIR market overview's "no allowance … for reinsurance ceded" is contradicted by the statute (FAIR PDF: https://fair1964.org/sites/default/files/2024-04/Libya%20-%20Insurance%20Market%20Overview%20-%20by%20Hussein%20Elsayed%2C%209%20Jan%202024.pdf).
- **Fix:** Add the family component (needed when M20 goes live, but the client writes family takaful now). Change "25% net claims" to "25% net *incurred* claims". Make admissible asset rules a rule-pack table (pending ministry rules). Specify how the company-level test combines PTF and SHF: the PTF deficit is covered by Qard, which is an asset of the SHF, and the qard receivable may need to be inadmissible. Raise this as an open question to the ISA.

### A-19 — LOW — Art. 6 capital nuance
- **Where:** §17 L1005.
- **Evidence:** Art. 6: **subscribed** capital ≥ LYD 10m for direct insurers. At least 3/10 is paid at founding and the remainder within 5 years. Reinsurers must have LYD 30m **paid**. Libyan ownership ≥ 51%.
- **Fix:** M19 checks both subscribed and paid-up capital. The client was founded in 2007, so the capital should be fully paid by now.

### A-20 — MEDIUM — Mudaraba rules incomplete
- **Where:** M11 L620–622; §5.3 `MUDARIB_SHARE` L205.
- **Issue:** (a) Mudarib share is due only on **profit after recovering capital**: losses in the period must first be offset against profits of the same Mudaraba pool, and the Mudarib share is zero in a loss period. (b) The basis must be stated: per contract or per pooled portfolio and period. (c) Losses fall on the capital provider (the PTF) unless the Mudarib was negligent (ta'addi/taqsir), in which case the operator bears them. This needs a flag and a workflow. (d) Profit on an investee bank's Mudaraba deposit is recognised when declared or distributed, not accrued at the expected rate.
- **Fix:** Add these rules and tests (see section 4).

### A-21 — MEDIUM — Wakala investment fee is not a Mudarib share
- **Where:** M11 L620, L622.
- **Issue:** Under a Wakala investment model the operator earns a **fixed or AUM-based fee regardless of profit**. Routing it through `MUDARIB_SHARE` ("% of profit") is wrong and changes the surplus in loss years.
- **Fix:** Add a separate `INVESTMENT_WAKALA_FEE` transfer type with its own SSB-approved rule (optionally with an incentive fee).

### A-22 — MEDIUM — Murabaha and Ijara gaps
- **Where:** M11 L620, L631.
- **Issue:** Murabaha (FAS 28): deferred profit recognised on a time-apportioned (effective profit) basis is fine. Missing: early settlement rebate (ibra'), late payment by the counterparty (no compounding; any penalty goes to charity), impairment (FAS 30). Ijara (FAS 32): the lessor owns the asset, which needs depreciation, major maintenance and takaful on the asset at the lessor's cost, IMB transfer, and impairment. Realistically the insurer will hold **Ijara sukuk** rather than direct leases, so FAS 33 classification and valuation are needed. Sharia-screened equities need a dividend purification ratio. Art. 16: assets covering provisions must be **in Libya and deposited with banks operating in Libya**, and persons-insurance assets must be **separate** from other assets. The executive regulations set the investment ratios and valuation methods (Decision 4/2006, not obtained, UNVERIFIED).
- **Fix:** Add these items to M11 (b)/(e), and add the Art. 16 separation and the Art. 22 "allocated assets register" (سجل الأموال المخصصة).

### A-23 — MEDIUM — Combined statements need inter-fund elimination; FAS 42 statement set to be specified
- **Where:** M12 L474–475.
- **Issue:** "Combined" balance sheet and trial balance are listed without **eliminating due-to/due-from balances and Wakala income/expense** between funds. The FAS 42 statement list in the README is plausible, but the exact required set is UNVERIFIED (paywalled).
- **Fix:** Add an elimination rule set for combined views, and a test that the combined statements show no inter-fund balances.

### A-24 — MEDIUM — Qard Hasan accounting incomplete
- **Where:** §5.1 L184–186; §5.3 L206–207; M15 L589–590.
- **Issue:** The PTF qard payable and SHF qard receivable must mirror each other. The SHF should assess the qard receivable for recoverability: AAOIFI/IFSB practice (exact FAS 43 paragraph UNVERIFIED). Repayment ordering when there are multiple draws (FIFO) is undefined. Qard balances do not carry any return (riba).
- **Fix:** Add a `qard_register` with draw date, approvals, repaid amount and an impairment assessment field. Add a test that the qard carries no profit or fee.

### A-25 — MEDIUM — Phasing: M15 depends on five P2 modules in a 45-day window
- **Where:** §15 L941.
- **Issue:** M15 needs M13 (reserves), M10 (net-of-retakaful), M11 (investment income), M19 basic, M12 year close, M07 (vouchers) and M06 (renewal credit). All are P2 (days 31–75).
- **Fix:** Order P2 as M10 and M12 close → M13-lite and M11 → M19-basic → M15. Define **M13-lite** for P2: pro rata UCR with Art. 15 floor, case OCR from M09, and IBNR and fluctuation reserve as **actuary-entered figures with sign-off**, not computed. That makes the P2 surplus achievable. A triangle-based IBNR engine moves to P4.

### A-26 — LOW — Wording
- §5.1 L184: the PTF "pays … technical reserves". Reserves are held, not paid.
- §5.3 "PIF" transfers exist, but PIF/M20 is P4: mark PIF as P4 or a placeholder.
- M16 L559: Decision 60/2021 "reportedly requires a Sharia auditor per branch". Keep marked unverified (Q17).
- The README title still says "Core Islamic Insurance" (product renamed TakafulTech).

---

## 3. Verified items

| Item | Status | Source |
|---|---|---|
| Law 3/2005 Art. 4: levy 2.5‰ life & capital formation, 5‰ others, base = total direct premiums due in the prior year | VERIFIED (statute) | lawsociety.ly/?p=1005 (Arabic text) |
| Art. 6: subscribed capital ≥ LYD 10m (3/10 paid at founding, rest within 5 years); reinsurers LYD 30m paid | VERIFIED (README simplifies) | same |
| Art. 13: compulsory local cession per ministerial decision (rates and commissions by decision) | VERIFIED; actual % UNVERIFIED (a 2014 secondary source says 25% of facultative, which may be outdated: https://bsalaw.com/insight/compulsory-retention-rates-across-the-mena-region/) | same |
| Art. 15: 47% motor compulsory TPL, 25% transport, 40% others (engineering excluded, pro rata), OCR, IBNR, fluctuation reserve; net of reinsurance | VERIFIED (README omits the conditions) | same; also FAIR overview |
| Art. 16: assets ≥ provisions held in Libya; deposited with Libyan banks; persons-insurance assets separate | VERIFIED | same |
| Art. 17: 20% net premiums / 25% net incurred claims, greater of; reinsurance deduction ≤ 50%; ≥ paid-up capital; life: 3‰ capital at risk + 4% mathematical reserves | VERIFIED (README omits the life part) | same |
| Art. 22: registers (policies, claims, brokers, agents, treaties, allocated assets) per class | VERIFIED | same |
| Art. 23: separate accounts per class | VERIFIED | same |
| Art. 24: annual returns (balance sheet, profit distribution account, general revenue and expense, per-class revenue and expense, reinsurance treaty summary, statement of assets required in Libya, report); signed by authorised signatory + CFO (+ actuary for life) | VERIFIED; forms per executive regulations (not obtained) | same |
| Arts. 25–26 auditor from register (an auditor may audit at most 2 companies) | VERIFIED (Art. 25) | same |
| Law 3/2005 contains no takaful provisions (0 matches for "تكافل"); takaful rests on later decisions | VERIFIED | same |
| Art. 36: regulator may order distributable surplus *to shareholders* to be withheld | VERIFIED; relevant to M19/M15 for the SHF | same |
| FAS 42 & FAS 43 exist, effective 1 Jan 2025; FAS 42 supersedes FAS 12; FAS 43 supersedes FAS 13, 15 | VERIFIED | AAOIFI announcements (links in A-11) |
| FAS 43 contents (PAA availability, Wakala fee recognition timing, qard impairment) | UNVERIFIED (paywalled) | — |
| Gross-contribution-in-PTF then Wakala expense (§5.5 pattern) | Consistent with mainstream AAOIFI takaful presentation (gross PTF statement, Wakala as PTF expense and SHF income); FAS 43 paragraph UNVERIFIED. The cash-vs-accrual timing is wrong (A-01) | — |
| IFSB-8 (Dec 2009, governance for takaful undertakings), IFSB-18 (retakaful) | VERIFIED | ifsb.org links in A-11 |
| AAOIFI Sharia Standard 26 "Islamic Insurance" | UNVERIFIED by fetch (believed correct) | — |
| PG16 deferred constraint triggers: AFTER ROW only, no transition tables, SET CONSTRAINTS can force immediate | VERIFIED | https://www.postgresql.org/docs/16/sql-createtrigger.html |
| KSA "10% to policyholders" example | Consistent with the KSA cooperative model (from memory, UNVERIFIED here) | — |
| Qard repaid from surplus before distribution; 100% to participants per client Articles | Consistent with practice and client brief | — |

---

## 4. Missing tests (proposed, concrete)

**Fund engine / M08 / §5.4**
1. A cross-fund journal where each fund balances but there is no `inter_fund_transfer_id` is rejected at COMMIT.
2. A transfer journal where the PTF due-to (300.000) ≠ SHF due-from (299.999) is rejected.
3. A transfer referencing an *unapproved* QARD_DRAW is rejected, and so is one whose fund pair doesn't match its type (e.g. `WAKALA_FEE` SHF→PTF).
4. A settlement journal clearing due-to/due-from succeeds; settling more than the open balance fails.
5. Inserting, updating or deleting a line in a posted journal fails for the app role, migration role excepted; a reversal creates an exact mirror dated in an open period.
6. Account/fund mismatch is rejected by the composite FK.
7. Performance: posting a 100,000-line single-fund journal completes in < N s (guards against the O(n²) trigger).
8. Property test: for 10,000 random events, the sum of inter-fund balances across funds = 0 and the combined trial balance after elimination equals the per-fund sum.
9. Split rounding: for random amounts at 3 decimals, tabarru' + Wakala + investment = gross exactly, with the residue going to the rule-specified bucket.
10. Split-rule versioning: an endorsement keeps the certificate's original split version (R7); a non-SSB-approved split rule cannot be activated.
11. Lifecycle golden test per fund: issue → partial receipt → month-end earning → cancellation with pro-rata refund, including reversal of the Wakala portion from SHF.
12. FX: a USD receipt converted to LYD balances per fund in LYD; month-end revaluation is posted per fund.

**M12**
13. Each of the four named automatic journals hits the expected *fund and account*, not just "a journal" (strengthens test 1).
14. Combined balance sheet shows no due-to/due-from or Wakala income/expense between funds.
15. Per-class (Art. 23) income statement sums to the fund total.
16. Year-end close is blocked while there are open un-settled transfers above a threshold (configurable).

**M16**
17. A CI meta-test lists every table registered as contract/transaction and asserts NOT NULL + CHECK on `sharia_status` and **no DEFAULT**.
18. A status change on a posted journal creates a `sharia_status_event` and leaves the journal row unchanged.
19. A non-SSB user cannot change the status (API + RLS).
20. Income tagged `non_compliant` cannot be credited to PTF/SHF income and is auto-proposed for purification to the charity payable.
21. A mixing attempt is logged as a `sharia_exception` row with the user and payload.

**M15**
22. A hand-calculated golden scenario (published in the README) covering gross contributions, Wakala, retakaful, claims, reserve movements, investment income net of Mudarib share, Qard repay and rounding reproduces the result to 0.001 LYD.
23. Deficit scenario: creates a QARD_DRAW *request* (not a posting); distribution = 0.
24. Surplus < outstanding Qard: partial repayment, no allocation.
25. SHF balance changes only by QARD_REPAY during a surplus run.
26. A participant with an outstanding receivable is netted per the SSB rule.
27. A participant who does not renew: the renewal credit converts to a voucher after N days.
28. Second approval of the same fiscal year is blocked; a reserve change after approval invalidates the run.
29. The actuary SoD rule (A-10) lets the configured chain complete.

**M11**
30. Mudaraba loss period: Mudarib share = 0 and PTF capital is reduced; a later profit first recovers the loss.
31. The Wakala investment fee is charged in a loss period.
32. Murabaha early settlement with ibra' adjusts the deferred profit correctly.
33. A late Murabaha payment produces no additional income (penalty goes to charity).
34. Ijara asset depreciation is posted to the owning fund.
35. The Art. 16 check fails when Libyan-held covering assets < technical provisions, or when persons and other assets are commingled.
36. A PTF portfolio cannot hold an SHF-funded contract without an allocation record.

**M13 / M19**
37. UCR = max(pro rata, Art. 15 floor × net written contribution of the prior year) per class; engineering is pro rata only.
38. All reserve postings hit the PTF only.
39. Art. 17 worked example incl. the 50% reinsurance cap and the paid-up-capital floor; family component when M20 is enabled.
40. Distribution is blocked when the post-distribution margin < minimum (M15 test 4 should show the computed figures).

**M14 data capture (P1)**
41. Completeness report: 100% of certificates have cohort, portfolio, coverage dates and recognition date; 100% of claims have loss date and reported date; every reserve change is timestamped.

---

## 5. Complexity & dependencies

| Module | Complexity | Notes |
|---|---|---|
| M08 Fund Engine | **L** | Schema, header-level deferred checks, split at 3 decimals, transfer types, approvals, property tests. Everything financial depends on it, so it must be frozen by about day 12 of P1 |
| M12 Accounting | **XL** | GL, posting-rule engine, per-fund/branch/class statements, eliminations, FX revaluation, period close, AP, fixed assets, budgets, FAS 42-style presentation, Art. 24 mappings |
| M16 Sharia | **L** | Cross-cutting `sharia_status` (M, but touches every module), governance/resolutions (M), SSB reporting and certificates (M), purification/zakat (S–M) |
| M15 Surplus | **L** | Formula, Qard logic, allocation over large participant sets, statements PDF, vouchers/renewal credits, 4-step approvals |
| M11 Investments | **L** | 3 contract types + sukuk/equities/Wakala deposits, accruals, allocation across funds, Mudarib/Wakala fees, performance, Art. 16 |
| M13 Reserving | **M** (P2-lite) / **XL** (full actuarial) | Lite: UCR + floors + case OCR + actuary inputs. Full: triangles, IBNR methods, PDR |
| M19 Solvency | **S** basic / **M** full | Art. 17 formula + stress tests; admissible-asset rules pending |
| M14 IFRS 17 / FAS 43 | **XL** | Measurement models, CSM/RA, cohorts, onerous testing, reinsurance held, transition; needs an actuary |

**Hard dependencies (→ = must exist first)**
- M03 (split rules, product → Art. 1 class), M01/M26 (approvals, SoD), M27 → **M08** → **M12**.
- M06 (issue accrual), M07 (receipt), M09 (claims payments + case reserves), M04 (commissions on SHF), M34 (payroll on SHF) → M08/M12 posting rules.
- M10 → M13 (net reserves), M12, M15.
- M09 + M06 + M10 → **M13** → M19, M15, M18.
- M12 + M13 + M10 (+ M11 assets) → **M19**.
- M08 + M16 (screening) → **M11** → M15 (investment income), M19, M18 (Art. 16/24).
- M12 year close + M13 + M10 + M11 + M19 + M16 (SSB approval) + M07 (vouchers) + M06 (renewal credit) + M24 (statements) → **M15**.
- M16 `sharia_status` is a prerequisite column for **every** P1 transaction table, so it must be in the first migrations alongside M08.
- M06/M09/M10/M12/M13 data with the A-12 fields → **M14** (P4).
- **Decisions needed before P1 M08/M12 start:** A-01 (accrual model and fund of the receivable), A-02/A-03 (surplus definitions), A-04/A-05 (transfer mechanics), A-08 (`sharia_status` model), A-09 (book-of-record basis / Q18).
