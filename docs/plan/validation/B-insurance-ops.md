# Validator B — Insurance Operations audit of README.md (TakafulTech / "Core Islamic Insurance")

Scope: M02, M06, M05, M09, M10, M07, M04, M03, M22 (incl. Orange Card + offline PWA), M28, M20/M21/M23/M25, §12.4 event map, §15 phasing.
Method: README.md read in full (lines 1–1160). External facts checked by web search/fetch (sources cited per flag). Items not confirmable are marked **UNVERIFIED**.

---

## 1. Summary

The insurance-operations sections are well structured and mostly trace back to the client quotes. Nothing the client asked for is silently dropped. Several asks, though, are **softened or can't be delivered as written**, and several mechanisms are **under-specified**. Parallel builder agents will implement those parts inconsistently.

Most serious problems:

1. **Stripe and PayPal do not serve Libyan merchants.** Stripe's official country list (51 countries) has no Libya, and the UAE is its only MENA market. No evidence was found that PayPal supports Libyan merchants. The client's explicit "PayPal, Stripe" ask cannot be met for a Libyan entity. The README hides this behind "enable only where available".
2. **Retakaful recovery trigger is wrong for proportional treaties.** Recovery is specified only "when the claim exceeds retention". Quota-share and surplus treaties recover on *every* claim. The order of treaty application (fac → proportional → XoL → stop loss) is never stated. Acceptance test 2 omits the XoL layer limit.
3. **Two modules both book the retakaful recoverable.** M09 says stage 5 (Paid), M10 says on approval. Builders will double-book.
4. **Event map §12.4 has gaps.** It misses the entire cancellation/endorsement/refund/lapse/renewal chain. M06 does not consume `PaymentReceived`, so auto-renewal acceptance test 4 can't work. There is no payment-confirmation event back to M09, so a claim can't move from Paid to Closed. M10 publishes nothing, so cessions and recoveries never reach M12.
5. **Gap-free numbering (§4) conflicts with offline pre-allocated blocks.** Orange Card is now an electronic, bureau-linked certificate (GAIF system since 2022). Offline issuance and self-allocated numbers may not be valid for it. Libya's participation in the electronic system is UNVERIFIED.
6. **Lines the client sells today have no system until P4.** These are family takaful, health and export credit. ICIEC facultative cover for Takaful Libya's export-credit deals was signed in September 2025 and is live. A day-90 go-live without M20/M21/M23 strands those lines on ARIMA.
7. **Phase 2 is overloaded.** It packs 45 days with ~17 deliverables, including two that depend on outside parties: Orange Card bureau integration and the offline PWA.
8. **No customer-facing payment surface before P4.** M25 (customer portal) is P4, yet the client wants online gateway payments that "update the customer account automatically". Customers have no page to pay on.

Flag count: **0 BLOCKER, 13 HIGH, 24 MEDIUM, 7 LOW (44 total).** Several facts are marked UNVERIFIED: PayPal's official status, recurring charging on the Libyan switch, Libya's participation in the electronic Orange Card system, the Libya–Frankfurt RTT, ARIMA's questionnaire data, the pg-boss polling interval, and the restriction on cancelling compulsory motor cover.

---

## 2. Flags

| ID | Sev | README § / line | Issue | Evidence / source | Recommended fix |
|---|---|---|---|---|---|
| B-01 | HIGH | 6.6 L404, L412; §11 L809 | Client explicitly asks for "PayPal, Stripe". Stripe does not onboard businesses in Libya. Its official list has 51 countries; the UAE is the only Middle East market and there are none in North Africa. No evidence was found of PayPal merchant support in Libya (only a 2021 CBL "considering PayPal" report and user reports of non-availability). The README phrase "enable only where available to the tenant" hides that the requirement is undeliverable for the first client. Building two adapters that can't go live in P2 wastes effort. | https://stripe.com/global (Libya absent). https://www.leconomistemaghrebin.com/2021/10/08/libye-banque-centrale-envisage-introduire-paypal/ ; https://community.shopify.com/t/how-can-i-solve-payment-issues-in-regions-with-no-shopify-support/190629 . PayPal status: **UNVERIFIED** (no official PayPal country page fetched). | State in §6.6 and §19 that Stripe/PayPal are not available to a Libyan-domiciled merchant. Record a written deviation signed by the client (tie to Q12). Make the P2 priority the local rails: the Moamalat/national-switch e-commerce gateway (now moving to CBL operation), bank wallets such as LYPAY, aggregators (Edfali, MobiCash, Sadad-type), and bank transfer. Keep Stripe/PayPal adapters as P5 productisation for other tenants. Add an acceptance test that uses the actual Libyan acquirer. |
| B-02 | MEDIUM | 6.6 L412; Q12 L1044 | The local Libyan card acquirer is unnamed. Recurring/tokenised charging ("scheduled automatic charge") on the Libyan national switch is **UNVERIFIED**. The CBL reported a National Switch outage on 24 Oct 2025 and an agreement to move switch operation from Moamalat to the CBL, so the target platform may change mid-build. | https://cbl.gov.ly/en/fdjw ; https://cbl.gov.ly/en/?p=64757 ; https://www.ncb.ly/en/business/business-electronic-services/business-lypay | Close Q12 in Phase 0. If recurring card charging is unavailable, give "scheduled" two meanings: (a) a bank standing order with statement matching, or (b) a reminder plus a payment link. Get the client to accept this. |
| B-03 | HIGH | 6.6 L404, L413; M25 L695 (P4) | The client wants gateway payments that create receipts and update the customer account "without human intervention". This implies customer self-payment, but the customer portal (M25) is P4 and no payment link or page is specified for P2. Webhooks need a hosted checkout that someone can reach. | README internal inconsistency | Add a P2 "pay-by-link" page: a tokenised, unauthenticated, single-instalment checkout. Links go out in renewal and dunning SMS/e-mail. Add an acceptance test: link → pay → receipt → posting. |
| B-04 | MEDIUM | 6.2 L278, L289; §11 L815; §19 L1080 | Client wants 30-day e-mail/SMS alerts. SMS and e-mail are both external P2 connectors, and the SMS provider is unknown (Q26). This is acceptable because P1 is a sandbox, but go-live then depends on a Libyan SMS aggregator with a registered sender ID (lead time **UNVERIFIED**). | README | Start sender-ID registration and select the provider in Phase 0. Add a P2 exit item: a real SMS is delivered to a test handset on staging. |
| B-05 | MEDIUM | 6.2 L288; test L304 | The expiry scan finds certificates expiring "in exactly N days". If the job fails or is skipped for a day, those certificates never get an alert. Short-term products (border motor, travel shorter than 30 days) are not excluded. | README | Change to: expiry ≤ today+N, not renewed, and no alert sent for (certificate, campaign). Use a unique constraint on `notification_log(certificate_id, alert_type)`. Add a per-product flag `renewal_alert_enabled`. Add a test: skip a day, re-run, the alert is still sent once. |
| B-06 | MEDIUM | 6.2 L291 | Cancellation refund doesn't say how the Wakala fee already moved to the SHF is unwound. Is the fee refunded pro rata from the SHF (reverse `WAKALA_FEE`), or retained? The cession reversal (M10) and commission clawback (M04) are not linked here either. | §5.3 has no `WAKALA_FEE_REVERSAL` type | Add an inter-fund transfer type `WAKALA_FEE_REVERSAL` (SSB rule: full, pro-rata or none). Have `CertificateCancelled` drive M07 refund, M08 reversal, M10 cession reversal and M04 clawback (see B-20). |
| B-07 | HIGH | 6.4 L349 vs 6.5 L384, L359 | **Double booking.** M09 stage 5 says "recovery receivable from retakaful booked" at Paid. M10 says recoverable "booked as receivable" on claim approval. Two builders will each post it. | README internal | Pick one owner. Recommended: M10 books the recoverable on `ClaimApproved` (or on any reserve change, for IFRS 17 reinsurance-held data). M09 stage 5 only references it. Edit L349. |
| B-08 | HIGH | 6.4 L359; 6.5 L384; test 6.4#4 L370 | Recovery is triggered only "when the claim exceeds retention". That is correct for XoL only. Quota-share and surplus treaties recover their share on **every** claim, and the client quote covers "proportional or non-proportional" (L375). For XoL per event, a single claim may be under the retention while the event aggregate exceeds it. Stop loss is an annual aggregate on loss ratio and cannot be triggered by one claim approval. | Standard reinsurance practice | Rewrite as follows. On `ClaimApproved` (and on reserve change), compute recoveries for every treaty attached to the certificate's cession. Order: (1) facultative, (2) proportional (QS/surplus) at the cession %, (3) per-risk XoL on net retained, (4) per-event XoL on net aggregated by `cat_event`, (5) stop loss at period end. Add a `cat_event` table and a claim→event link. |
| B-09 | HIGH | 6.5 test 2 L399 | "XoL retention 100k, 250k claim → 150k recoverable" only holds if the layer limit is ≥150k (e.g. 150k xs 100k or more). With 100k xs 100k the answer is 100k. The test also doesn't say whether a QS sits in front (with 40% QS, net is 150k → XoL recovers only 50k). | Arithmetic | Restate: "Treaty: per-risk XoL, LYD 400,000 xs 100,000, no QS. Claim 250,000 → recoverable 150,000. Claim 600,000 → recoverable 400,000 and 200,000 retained above the limit." Add a combined QS+XoL test. |
| B-10 | MEDIUM | 6.5 L381 | Reinstatements are listed but there is no mechanism. An XoL recovery consumes the limit and triggers a reinstatement contribution (pro rata to amount, and possibly to time), payable from the PTF. The contribution, the remaining-limit tracking and the event are all missing. | Standard XoL practice | Add `treaty_layer_usage` with reinstatement count, `reinstatement_premium` posting (PTF), and a `ReinstatementDue` event. Add a test: a recovery of 50% of the limit gives a reinstatement contribution of 50% × rate × layer contribution. |
| B-11 | MEDIUM | 6.5 L383 | "On certificate issue: ceded share and retakaful contribution calculated by treaty" assumes per-certificate cession. XoL and stop-loss contributions are a minimum and deposit on GNPI, adjusted at year end, not per certificate. The surplus treaty needs a "risk" aggregation definition (same location/vessel) and a sum covered per risk. | Practice | Split the cession engine: proportional = per certificate (and per endorsement); non-proportional = treaty-level M&D instalments + annual adjustment job. Define the `risk` aggregation key per product (M03). |
| B-12 | MEDIUM | 6.5 test 1 L398; §5.2 | "Cedes 40% of contribution" doesn't say whether that is gross contribution or the tabarru' portion. In a Wakala model the PTF pays retakaful out of tabarru'; ceding the gross (including the SHF's Wakala fee) gives a different number. Where the ceding/retakaful commission lands (PTF vs SHF) is not stated. | AAOIFI SS 26 practice (PTF owns retakaful arrangements); exact SSB position **UNVERIFIED** for client | Add `cession_basis` (gross / tabarru') and `ceding_commission_fund` to the treaty, both SSB-approved, and make the test explicit about the basis. |
| B-13 | LOW | 6.5 test 3 L400 | The reconciliation is "generated on the 1st of each month", but the prior month isn't closed yet, so the bordereau will be incomplete. | Practice | Trigger on `PeriodClosed` (M12), with a configurable fallback day. |
| B-14 | HIGH | §1.1 L40; §8 L689–692; §15 L946 | The client currently sells family takaful, health and export credit. M20, M21 and M23 are P4 (months 4–9). After a day-90 go-live and ARIMA freeze (L929), those lines have no system. ICIEC facultative reinsurance for Takaful Libya export deals was signed on 23 Sep 2025 and is "implementing immediately". Marine (open covers and declarations) and Hajj/Umrah are not covered by any module spec beyond the generic M03. The client's "full cycle" ask (L1072) is at risk. | https://iciec.isdb.org/news-and-events/iciec-partners-with-takaful-libya-to-strengthen-shariah-compliant-export-credit-insurance-in-libya/ ; https://www.reinsurancene.ws/iciec-to-provide-fac-reinsurance-to-certain-takaful-libya-export-deals/ | Either (a) declare phased cutover: go-live covers motor, travel, Orange Card, property, marine and general, while ARIMA stays live for family, health and export credit until P4, with the migration and reporting implications spelled out (M28 KPIs would be incomplete); or (b) bring a minimal M23 (buyer limit and declaration) and M10 fac into P2. Get a client decision. |
| B-15 | HIGH | §4 L172; 6.7 L448; §8 M22 L691 | "Gap-free per series" conflicts with pre-allocated offline blocks. Lost or wiped devices, voided prints and unused block tails all create gaps. The README doesn't define what gap-free means legally. | Logic | Define gap-free as "every number accounted for": each number is issued, voided (with reason and approver), spoiled or returned. Add a `number_block` lifecycle (allocated → active → exhausted/returned/revoked), a block-reconciliation report and a test that every number in a closed block has a status. Confirm ISA / bureau numbering rules (Q19) before P2. |
| B-16 | HIGH | §8 M22 L691; §11 L813; Q19/Q20 | Orange Card is the inter-Arab motor third-party card under the 1975 Tunis convention, coordinated by GAIF (20 Arab countries). An electronic card and cross-border electronic link have been in force since April/July 2022. Electronic cards are likely numbered and registered by the national unified bureau or GAIF platform at issue, which conflicts with offline issuance and own numbering. Libya's participation in the electronic system and the Libyan bureau's API are **UNVERIFIED**. Claims under foreign-issued cards (inter-bureau handling and settlement) have no flow in M09. | https://atlas-mag.net/en/articles/motor-insurance-electronic-inter-arab-card-format-0 ; https://en.challenges.tn/economy/inter-arab-motor-insurance-card-electronic-format-efffective-starting-april-1/ ; https://amwalalghad.com/a6fb ; https://en.wikipedia.org/wiki/General_Arab_Insurance_Federation | Move Q19/Q20 to Phase 0 blockers. Assume Orange Card issuance is **online-only** unless the bureau confirms offline is allowed. Add an Orange Card claims flow: handling-bureau claims, inter-bureau recoveries and payments, and the visiting-vehicle case (Libyan bureau handles claims for foreign cards). Bureau tariffs are set externally, so make them a rate-table import. |
| B-17 | HIGH | §8 M22 L691; §15 P2 L941 | The offline PWA is under-specified, though complexity is XL. Things that can't happen offline: UW rules evaluation (needs a versioned offline rule bundle), duplicate/KYC/sanctions checks (M02/M17), card payments, PAdES signing (the server holds the key), and gap-free numbering. Concurrency risks: the same vehicle insured at two border points, and the same party created on two devices. Security: an encrypted local store, device binding and remote revocation of blocks. Nothing in the client quotes asks for offline; it is our addition. | Design analysis | Specify the offline scope: compulsory motor and border travel only; cash only; rules bundle with version and expiry; provisional printed certificate with QR "pending sync" and the server-side PAdES PDF on sync; post-sync duplicate/KYC queue; conflict rule: duplicate vehicle in force → flag, not auto-cancel; device registration and revocation. Consider deferring offline to P4 (it is not a client requirement) to de-risk P2. |
| B-18 | MEDIUM | 6.4 L346 | Stage 2 "back to 1 (missing documents)" re-enters Registered, whose entry actions are "open claim number; initial reserve". A naive state-entry hook will re-run them. | Logic | Model "awaiting documents" as a sub-status of stage 2 with no transition to 1. Keep stage 1 entry actions idempotent. |
| B-19 | MEDIUM | 6.4 L347–354 | Missing transitions: 4→3 (the approver sends it back for re-assessment; today the only option is Reject); Rejected has no defined exits (terminal? Reopen? reserve release?); Reopened's target stage is unspecified; and reopening after a recovery has been booked needs the recovery adjusted. Rejected and Reopened go beyond the client's "6 strict stages" and need explicit client sign-off. | Logic | Publish a full transition table: 1→2; 2→3/2→Rejected; 3→4/3→Rejected; 4→5/4→3/4→Rejected; 5→6; 6→Reopened(→2 or 3); Rejected→Reopened (approval). Rejected releases the reserve. Get written client acceptance of the two extra states. |
| B-20 | MEDIUM | 6.4 L349–350 | Interim or partial payments and multiple payees (garage, third-party claimant, hospital) don't fit a single linear Paid state. Motor third-party bodily injury often has several claimants per accident. "Closed requires no open recoveries" means claims with long subrogation or retakaful recoveries stay open for months, which distorts KPI 15 and the 5-day metric. | Practice | Add `claim_payment` lines (many per claim) with stage 5 = "all approved payments ordered". Track recoveries in their own lifecycle (`claim_recovery.status`) and allow Closed with open recoveries, flagged. Consider claimant/feature level (`claim_line`). |
| B-21 | LOW | 6.4 L354 | "Enforced … by a database check": a plain CHECK constraint can't see the previous state. | Postgres semantics | Specify a BEFORE UPDATE trigger on `claim.state` that validates (OLD.state, NEW.state) against a `claim_transition` table and requires a matching `claim_state_history` insert in the same transaction. Revoke direct UPDATE of `state` from the app role except through a SECURITY DEFINER function. |
| B-22 | MEDIUM | 6.4 L355 | SLA clock: whether it pauses while waiting for customer documents is unspecified, as is the start rule for a claim registered on a weekend or holiday. "Escalation at day 3 and 4" is hard-coded, which breaks DoD #8 (L80). Islamic holidays depend on moon sighting and are announced late. | Libyan weekend Fri–Sat verified: https://www.officeholidays.com/countries/libya ; https://thenationalnews.com/mena/2021/12/07/when-is-the-weekend-in-the-arab-world (2006 change) | Make the SLA a configurable policy (target days, escalation days, pause statuses). Start on the next working day if registered on a non-working day. Let the M00 calendar be edited per year with maker-checker. Add a test with Eid inside the window. |
| B-23 | MEDIUM | 6.4 L348; §15 L940 | M09 is P1, but stage 4 calls "retakaful share calculated (M10)" and M10 is P2. P1 also says "without reserving" while stages 1/3/6 manage case reserves. | README internal | Specify that the P1 stage 4 retakaful share is a no-op stub behind an interface. State that case reserves (`claim_reserve`) are in M09 P1 and only IBNR/UPR is in M13 P2. |
| B-24 | MEDIUM | 6.4 L349 | "Paid from the PTF" is right for claim amounts. Surveyor and assessor fees and claim-handling costs are SHF expenses unless a rule pack allows `EXPENSE_RECHARGE` (L209). M09 doesn't separate them. | §5.3 L209 | Add `claim_expense` with fund determined by rule pack (default SHF). Test: surveyor fee posts to SHF. |
| B-25 | MEDIUM | 6.7 L443–446; test L459–460 | Tier basis is not defined (written, collected or net of cancellations). With whole-band tiers, a cancellation that drops the agent below a threshold changes the rate for the *whole period*, but test 3 only reverses "its commission". | Logic | Define tier volume as net collected contributions in the period (configurable). On any reversal, recompute the period's tier and post the difference. Freeze after period close; later reversals carry into the next period. Add a test: crossing down a band under whole-band recomputes all lines. |
| B-26 | HIGH | 6.7 L446–447; 6.6 L417 | Agents at border points usually collect cash and remit **net of commission**. Netting PTF contributions against an SHF commission payable in a single settlement mixes funds, which breaks §5.4 and the M16 no-mixing rule. The README is silent on agent remittance. | §5.4 L220 | Model the agent account with two legs: gross receipt to PTF (and Wakala to SHF via transfer); commission payable from SHF; net settlement as an inter-fund cash clearing referencing an `inter_fund_transfer`. Add a test: an agent's net remittance posts correctly per fund. |
| B-27 | LOW | 6.7 L450 | Commission from SHF is consistent with the Wakala model (operator bears acquisition cost from its fee). The L450 Wakala-including-commissions cap is UAE-specific; Libya has no such cap in rule pack §17. | AAOIFI SS 26 (general principle) | No change; make sure the cap check reads a nullable rule-pack value. |
| B-28 | MEDIUM | 6.3 L317 | "Rules editable without code" gives no rule representation. Parallel builders could each invent a DSL. Rule changes that affect price need actuary sign-off and SoD (price vs approve, L749) but only "authorised users" is stated. | Design | Fix the format in an ADR: decision tables plus a sandboxed JSON expression language (e.g. JSONLogic) over a typed questionnaire schema. Rule activation requires maker-checker (and actuary for load/discount). Store `uw_rule_version_id` on each quote. |
| B-29 | MEDIUM | 6.3 L317; test L335 | Simulation on past quotes needs stored questionnaire answers. Migrated ARIMA history almost certainly lacks them, so simulation works only on quotes made in the new system. It's undefined whether a simulation re-rates with today's tables or historical ones. | Data reality (**UNVERIFIED** ARIMA content) | State that simulation uses quotes captured in-platform (plus masked sample where answers can be derived). Simulation pins the rating table version to the one in force at quote date unless "re-rate" is chosen. Output: counts by outcome change and contribution delta. |
| B-30 | LOW | 6.3 L320 | The Approval Matrix limit dimension is ambiguous (sum covered or contribution). A referral can fire several rules routed to different roles. | Logic | Define: limit on sum covered (configurable); multiple fired rules route to the highest required role. |
| B-31 | MEDIUM | 6.1 L259 | Fuzzy-name duplicate matches block saving until resolved through maker-checker. At a border point this blocks the 60-second issue (M22). The client asks to "prevent duplication", which exact ID matches cover. | Ops impact | Block only on exact national number / passport. Fuzzy matches create a `duplicate_candidate` for back-office review without blocking. Keep test 1 as is. |
| B-32 | MEDIUM | 6.1 L258; §11 L811 | "Linked to digital identity data" is softened to format validation until the Civil Registry connector exists (P2, "subject to access", Q31). Without access the client requirement isn't met at go-live. | README | Make Q31 a Phase 0 action with a go-live decision. Record client acceptance of the fallback. |
| B-33 | HIGH | §12.4 L854–871 | **Event map gaps.** Missing events: `CertificateCancelled` (M07 refund, M08 Wakala reversal, M10 cession reversal, M04 clawback, M12, M14); `EndorsementIssued` (M07 extra or refund invoice, M10 adjustment, M04, M12); `CertificateLapsed` (M07 dunning → M06/M10/M12); `RenewalDue` (scan → M30); `CertificateRenewed`; `ReceiptRefunded`/`RefundPaid` (M08, M12, M04); `CessionBooked`/`RecoveryBooked`/`ReinstatementDue` (M10 → M12, M28); `ClaimRegistered` (M17 fraud, M10 large-loss advice); `ClaimReserveChanged` (M12, M13, M10); `ClaimRejected`/`ClaimReopened`; `ClaimPaymentConfirmed` (M12 → M09, needed for stage 6); `QuoteReferred`/`ReferralDecided` (M26); `ReceiptIssued` (M24 PDF); `PartyUpdated`/`PartyMerged` (M17 rescreen); `AgentLicenceExpired` (block issuance); `ProductVersionActivated`/`SplitRuleApproved`; `NumberBlockAllocated`/`OfflineBatchSynced`. | README internal (§6 text vs §12.4) | Make §12.4 complete and normative. Add a CI check that every publish/subscribe in code is registered in an event catalogue (Zod schema + version). |
| B-34 | HIGH | §12.4 L861; test 6.2#4 L305 | `PaymentReceived` is not consumed by M06, but auto-renewal is "renewed on payment". `CommissionRunApproved` → M07 is missing, though payment goes "via M07/M12" (L447). `ClaimPaid` is published by M09, but payment is executed by M12, so it's unclear who confirms. | README internal | Add M06 as a consumer of `PaymentReceived` and M07 of `CommissionRunApproved`. Split into `ClaimPaymentOrdered` (M09 → M12) and `ClaimPaymentConfirmed` (M12 → M09). |
| B-35 | MEDIUM | §11 L818; §12.4 | The idempotency and ordering contract isn't specified: no consumer inbox table, no per-aggregate ordering (e.g. `ClaimApproved` must be processed before `ClaimPaid`), no event versioning, no poison-message handling per consumer. | Design | Specify: outbox row in the same transaction; `event_id` UUID; `aggregate_id` + `aggregate_seq`; consumer `processed_event(consumer, event_id)` PK in the same transaction as side effects; consumers reject out-of-order seq (retry); payload `schema_version`; DLQ with a replay tool. Add a test: replaying the same event 3× → one posting. |
| B-36 | MEDIUM | 6.2 L302, L306; §16 L987 | Performance targets are realistic in a warm state only. Neon scale-to-zero wakes in 500 ms to a few seconds (default suspend after 5 min). Vercel cold starts are reduced but not eliminated by Fluid compute. Libya→Frankfurt RTT on border links (3G/satellite) is **UNVERIFIED** and could be 300–700 ms. "Issue < 60 s on 1 Mbps" has no defined start and end points or RTT. | https://neon.com/docs/introduction/scale-to-zero ; https://neon.tech/docs/connect/connection-latency ; https://vercel.com/docs/fluid-compute | Production: disable Neon scale-to-zero, set a minimum compute size and a connection timeout of at least 10 s. Define the test as: start from login on the quote screen; network profile 1 Mbps / 500 ms RTT / 1% loss; end at certificate number shown, PDF excluded. Add k6 + Playwright network throttling. Set a JS bundle budget (e.g. ≤250 KB gz per route). |
| B-37 | MEDIUM | 6.2 test 1 L302; §3.1 L118; §12.5 L875 | "Signed PDF < 30 s" shares the pg-boss queue with batch PDFs (renewal statements, surplus statements, payslips). Thousands of batch jobs starve single certificates. A Chromium cold launch adds 1–3 s, and pg-boss polls instead of being pushed. | Design (pg-boss polling interval **UNVERIFIED** for chosen version) | Use separate queues: `pdf.interactive` (high priority, own worker concurrency, warm browser pool) and `pdf.batch`. Measure p95 under concurrent batch load. |
| B-38 | MEDIUM | 6.6 test 1 L428 | "Webhook → receipt + fund postings < 5 s" doesn't say whether the postings run in the webhook request or go through outbox → worker → M08 → M12 (three hops via the queue). It also doesn't say whether the receipt PDF counts. Webhook signature verification is not in the acceptance tests. | Design | Specify: receipt, allocation and split postings in one DB transaction in the webhook handler (domain call, no queue); PDF async. Add tests: invalid signature → 401 with no receipt; amount/currency mismatch → exception queue. |
| B-39 | MEDIUM | 6.9 L508–523 | There is no KPI dictionary (formula, gross/net, earned/written, period, fund, source table). Builders will compute "loss ratio" differently. KPI 11 needs earned contributions and IBNR from M13 (P2). KPI 18 needs reserves (M13). KPI 23 Solvency needs M19 (basic P2, full P4), so it shows the basic formula only until P4. KPI 7 renewal rate needs a predecessor link that migrated data may lack. KPI 4 needs a region master that M00 doesn't define. | README internal | Add a KPI catalogue table with columns: formula, numerator/denominator source, grain, phase available, owner. Label KPI 23 "basic Art. 17 margin" until P4. Add `region` to the M00 branch master. |
| B-40 | MEDIUM | 6.9 L497, L504; §3.1 L121; D12 L59 | Power BI Service is Microsoft SaaS. Connecting it imports business and personal data into a third-party cloud, which contradicts D12 and the Law 6/2022 transfer concern (L852). Metabase self-hosted is fine. | README internal | Allow Power BI only through Power BI Report Server/on-prem gateway or masked/aggregated `rpt_*` views with no PII. Document this in §6.9 and get client acknowledgement. |
| B-41 | HIGH | §15 L941 | P2 (45 days) holds M10, M04 tiers, M07 gateways and recurring billing, M12 statements and close, M28, M16 reports, M13, M19, M15, M11, M33 + M34, M30 external, M17, M18, M22 Orange Card + offline, and staging. Several depend on outside parties (bureau, registry, acquirer, SMS). For parallel agents the critical path runs M13 → M15 (surplus needs reserves) → M19 gate. | Planning | Re-baseline P2. Move the offline PWA to P4. Make external connectors "adapter + simulator" deliverables, with go-live gated on real access. Publish a dependency DAG per sprint. |
| B-42 | LOW | 6.2 L294; §17 L1014 | Cancellation of compulsory motor TPL while the vehicle remains licensed is usually restricted. No rule pack flag exists. | **UNVERIFIED** for Libya | Add `cancellable` / `cancel_requires_proof` (e.g. de-registration) per product in the rule pack. |
| B-43 | LOW | 6.6 L410–415; Q22 | At border points, contributions (Orange Card, foreign vehicles) are often collected in foreign currency. Cash-up per currency and the official vs market rate for receipts aren't specified for cashiers. | Practice | Do cash-up per currency per drawer; set the rate source per receipt channel in the rule pack. |
| B-44 | LOW | 6.6 L415 | The dunning lapse rule doesn't connect to M06 status, M10 cession reversal or M04 (see B-33). | README internal | Covered by the `CertificateLapsed` event. |

---

## 3. Verified items

| Item | Result | Source |
|---|---|---|
| Libyan weekend Friday–Saturday | **Verified** (changed from Friday-only in 2006) | https://www.officeholidays.com/countries/libya ; https://thenationalnews.com/mena/2021/12/07/when-is-the-weekend-in-the-arab-world ; https://anba.com.br/en/libyans-two-resting-days-a-week/ |
| Stripe for Libyan merchants | **Not available** | https://stripe.com/global |
| PayPal for Libyan merchants | **No evidence of availability**; official confirmation UNVERIFIED | see B-01 |
| Local Libyan payment rails exist (Moamalat e-commerce platform / National Switch, LYPAY, aggregators) | Verified exist; recurring and tokenisation capability UNVERIFIED | https://cbl.gov.ly/en/fdjw ; https://www.ncb.ly/en/business/business-electronic-services/business-lypay ; https://apps.apple.com/ly/app/dpay-ly/id6760252459 |
| Orange Card = inter-Arab motor TPL card, 1975 Tunis convention, GAIF-coordinated, electronic since 2022 | **Verified**; Libya's electronic participation and bureau API UNVERIFIED | https://atlas-mag.net/en/articles/motor-insurance-electronic-inter-arab-card-format-0 ; https://amwalalghad.com/a6fb |
| ICIEC facultative reinsurance for Takaful Libya export-credit deals | **Verified** (signed 23 Sep 2025, Tripoli) | https://iciec.isdb.org/news-and-events/iciec-partners-with-takaful-libya-to-strengthen-shariah-compliant-export-credit-insurance-in-libya/ |
| Neon cold start 500 ms – few s; default suspend 5 min; can disable on paid plans | **Verified** | https://neon.com/docs/introduction/scale-to-zero ; https://neon.tech/docs/connect/connection-latency |
| Vercel Fluid compute default (300 s duration, reduced cold starts) | **Verified**; long jobs correctly sent to worker (R5) | https://vercel.com/docs/fluid-compute |
| Commission from SHF in Wakala model | Consistent with operator-bears-expenses principle (L186) | AAOIFI SS 26 (general; not fetched) |
| Client quotes vs "(b)" coverage | All client asks have a matching (b) feature. Softened: Stripe/PayPal (B-01), digital identity (B-32), recurring card charging (B-02). Extended beyond the quote: Rejected/Reopened claim states (B-19) | README |
| Tiered commission marginal/whole-band configurable | Present (L459); needs basis and reversal semantics (B-25) | README |
| Claims paid only from PTF; SHF unchanged test | Present (L369) | README |
| Duplicate webhook idempotency test | Present (L429) | README |

---

## 4. Missing acceptance tests (proposed)

**M02**
- Fuzzy match creates a review candidate without blocking; exact national-number match blocks (B-31).
- Merge of two parties re-points certificates and claims, is audited, and requires a checker.
- Fraud flag: same phone on more than N parties raises a compliance alert.

**M06**
- Skipped scan day: next run still alerts once. Short-term products are excluded (B-05).
- Endorsement of sum covered posts a pro-rata extra contribution, adjusts cession, and regenerates the PDF as version 2 with the same certificate number.
- Cancellation: refund amount per short-period table; Wakala reversal per SSB rule; commission clawback; cession reversal, all from one `CertificateCancelled` event.
- A tampered PDF fails signature validation. QR on a cancelled certificate shows "cancelled".

**M05**
- Rule version pinned on the quote: activating a new rule does not change an open quote.
- Simulation report shows contribution delta, not only outcome counts.
- Multiple referral rules route to the highest required role.
- p95 auto-decision < 2 s measured under 200 concurrent users after a 10-minute idle period (cold path).

**M09**
- Full transition matrix: every disallowed (from, to) pair is rejected by API **and** by direct SQL UPDATE.
- 4→3 send-back works.
- Rejected releases the reserve.
- Reopen requires approval and re-books a recovery adjustment.
- SLA: claim registered Thursday 15:00 with Eid holiday inside the window gives the correct due date. The pause status stops the clock.
- Surveyor fee posts to SHF (unless the rule pack allows otherwise).
- Two payees on one claim; stage 6 only after all payments are confirmed.

**M10**
- QS 40% recovers 40% of *every* claim, including ones below retention.
- XoL with explicit limit (B-09), plus a claim above limit.
- QS then XoL on net.
- Per-event XoL across three claims linked to one `cat_event`.
- Reinstatement contribution calculated and posted to PTF.
- Surplus treaty: SI 1,000,000, retention 200,000, 4 lines (capacity 800,000) → ceded 800,000/1,000,000 = 80%. Claim of 100k recovers 80k. A second case with SI 1,500,000 gives 800k/1.5m = 53.33% ceded and the 500k excess retained or sent to facultative.
- Stop loss computed at year end from the loss-ratio band.
- Cancellation reverses cession.
- Bordereau totals equal the GL PTF retakaful accounts for the month.

**M07**
- Invalid webhook signature is rejected.
- Amount or currency mismatch goes to the exception queue.
- Partial payment allocates to the oldest instalment.
- Refund reverses fund split and commission.
- Daily cash-up per currency balances to deposits.
- Pay-by-link flow end-to-end (B-03).

**M04**
- Whole-band downward crossing after cancellation recomputes the period (B-25).
- Commission accrues only on collected instalments (monthly plan, 3 of 12 paid → 3/12 commission).
- Tier change mid-period is blocked.
- Agent net remittance posts PTF and SHF legs separately (B-26).
- Expired agent licence blocks issuance.

**M22**
- Offline: issue with no network, sync, server PDF signed, number status updated.
- Same vehicle issued on two devices gives a conflict flag.
- A revoked device cannot issue.
- Block reconciliation: every number in a closed block has a status (B-15).
- Orange Card issued and registered with the bureau (or simulator) and returns the bureau reference.

**M28**
- Each KPI reproduces a hand-computed value on a fixed dataset (KPI dictionary, B-39).
- Hourly snapshot is idempotent per hour.
- `rpt_*` views expose no encrypted or PII fields.

**Events**
- Replaying any event 3× gives one effect.
- An out-of-order `ClaimPaid` before `ClaimApproved` is retried, not applied.
- CI fails if code publishes an event not in the catalogue.

---

## 5. Complexity and hard dependencies

| Module | Size | Hard dependencies (must exist first) | Notes |
|---|---|---|---|
| M03 Product Factory | **XL** | M00, M01, M16 (SSB approval), M24 (templates), M08 split rules | The no-code rating tables, covers, questionnaires and versioning sit under M05, M06 and M10. It is on the P1 critical path. |
| M02 CRM | L | M00, M01, M27; M30 (registry P2); M17 (screening P2) | Arabic normalisation, fuzzy matching, merge with maker-checker |
| M05 Underwriting | L | M03, M02, M26 (approval matrix and tasks) | Rule DSL + simulator. ADR needed first (B-28). |
| M06 Policy issue/renew | L | M05, M03, M24, M08, M12, M07, M30, worker PDF and PAdES (Q32 certificate) | Endorsement and cancellation are the hard parts |
| M07 Billing (receipts P1) | L | M06, M08, M12 | |
| M07 gateways + recurring (P2) | L–XL | M30, local acquirer access (Q12), pay-by-link page | Local adapter unknown (B-01/B-02) |
| M09 Claims | L | M06, M26, M12, M00 calendar; M10 (P2) | Multi-payee and recoveries (B-20) |
| M10 Retakaful | **XL** | M06 cessions, M09, M12, M02 counterparties, M16 (SSB approval of conventional), M13 (IFRS 17 later) | Treaty ordering, event aggregation, reinstatements, M&D adjustments |
| M04 Agents (register P1, commission P2) | L | M02, M06, M07, M12, M08 (fund legs) | Whole-band recompute; net remittance |
| M22 online motor/travel | M | M03, M05, M06, M07 | |
| M22 Orange Card | L | M22 online, bureau access (Q20), M09 inter-bureau | External dependency |
| M22 offline PWA | **XL** | M04 number blocks, M05 rule bundle, M06, sync API, device management | Candidate for deferral (B-17) |
| M28 Dashboards | L | All P1/P2 modules, M13, M19 basic, KPI dictionary | |
| M20 Family | XL | M08 PIF, M11, M13, M14 | Client sells it today (B-14) |
| M21 Health | XL | M09 (adjudication), M30 (TPA), provider network | Client sells it today |
| M23 Export credit | L | M10 fac (ICIEC), M02 buyers, country-risk data | ICIEC fac live since Sep 2025 |
| M25 Portals | L | M06, M07, M09, M30, Better Auth for customers | Pay-by-link needed earlier (B-03) |

Critical path (P1): M00/M01/M27 → M03 → M05 → M06 (+M24, PDF signing) → M07 receipts/M08/M12 → M09.
Critical path (P2): M10 (needs cession data from P1 issue) and M13 → M15 → M19 gate. External: acquirer, SMS, bureau, registry.
