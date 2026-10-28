# D — Regulatory, legal, HR/payroll validation of README.md

Auditor: regulatory/legal research validator. Date: 2026-10-28. Scope: README.md (1,160 lines, read in full).
Method: web research (Arabic + English). Primary Libyan statute site lawsociety.ly returned HTTP 402 (paywall) on every direct fetch, so article-level text came from mohamah.net (OCR copy of Law 3/2005), DLA Piper (Law 6/2022), PwC Tax Summaries (reviewed 31 May 2026), Atlas Magazine and Insurance Business (2026 decisions), and lawsociety.ly search-result titles (existence and title only). cbuae.thomsonreuters.com is blocked by the session network. Nothing below is legal advice; every "VERIFIED" still needs a Libyan lawyer to sign off against the Official Gazette.

---

## 1. Summary

- **The core of the Law 3/2005 citations is accurate.** Arts. 4, 6, 13, 15, 16, 17, 22, 23, 24, 25 and 26 match the README's topics and figures: 2.5‰ / 5‰ levy, LYD 10m, compulsory local cession, 47% / 25% / 40% unexpired-risk floors, 20% / 25% solvency with a 50% reinsurance deduction cap. Some details are missing:
  - Art. 4 forbids passing the levy on to insureds.
  - Art. 15 excludes engineering from the 40% floor.
  - Art. 17 has a separate life/family formula.
  - The executive regulation (GPC Decision 4/2006) is never cited.
- **Data protection is mis-cited.** Law 6/2022 is the *Electronic Transactions* law, and its data provisions are Arts. 73–79. Transfers abroad sit in **Art. 78**, which is outside the cited 73–77. Libya has no data protection authority. Whether Art. 73 applies to a private insurer is unclear.
- **The README misses several 2026 Ministry of Economy & Trade decisions that change the P1/P2 build:**
  - **Dec. 400/2026** regulates motor civil liability inside and outside Libya.
  - **Dec. 460** caps compulsory-motor bodily injury at LYD 120,000 per person.
  - **Dec. 88/2026** regulates agent commission on compulsory motor and the Unified Arab (Orange) Card. This conflicts with the free-form tiered commission in M04.
- **Two cited 2026 decisions check out.** Dec. 374/2026 (reinsurer registration with the ISA) is VERIFIED; its issuer is the Minister of Economy & Trade, not the ISA. Res. 315/2026 is PARTIALLY verified: it is compulsory *third-party liability* for technical firms. Professional indemnity and "fire" are not confirmed.
- **Takaful decisions 529/2008, 201/2012 and 60/2021 are all UNVERIFIED.** "A Sharia auditor per branch" cannot be confirmed anywhere.
- **Payroll in the README is incomplete for Libya.**
  - Social security is **20.5%** in total: employee 5.125%, employer 14.35%, public treasury 1.025%. The 3.75% / 11.25% figures floated in the brief are CONTRADICTED.
  - The 5% / 10% income-tax bands are verified.
  - The README omits the **1% Social Solidarity (Unity) Fund**, **0.5% stamp duty on net salaries**, personal exemptions, the ordering of the tax base, and the 2024 amendment of Law 13/1980 (Law 3/2024).
- **Stripe is not available in Libya** (stripe.com/global), and PayPal is reported unsupported. Phase-2 gateway acceptance must rest on Moamalat, LYPAY, Sadad or local banks.
- **The rule-pack examples are partly stale.**
  - UAE: a **new CBUAE Takaful Regulation took effect 14 Sep 2026**. It is wakala-only (no mudaraba hybrid) and gives the fund its own legal personality. Whether the 35% cap survives is unverified.
  - KSA: 10% / 90% is verified, but it is a cooperative model that gives 90% of surplus to shareholders. The fund engine has no transfer type for that, and a new KSA Insurance Law is in draft.
- **Client facts are weakly sourced.**
  - Capital LYD 10m: VERIFIED (Atlas Magazine 2012).
  - 2007 founding: conflicting. The company only became operational in Dec 2012.
  - GWC (gross written contributions) USD 13.8m, product list and ARIMA as current vendor: UNVERIFIED.
  - §1.1 says "very likely ARIMA" while §20 states it as fact.
- **The Frankfurt hosting gate (line 852 / 943) is correct in principle but too narrow.** The opinion must cover:
  - Law 6/2022 Art. 78
  - Cybercrime Law 5/2022
  - General Information Authority Circular 1/2024
  - the new national cybersecurity and digital sovereignty authority (Cabinet Dec. 358/2026)
  - ISA access to registers

---

## 2. Verification table

Legend: VERIFIED / PARTIALLY / UNVERIFIED / CONTRADICTED.

### 2.1 Client facts (§1.1 line 40, §20 line 1116)

| # | README claim (line) | Status | Finding | Source |
|---|---|---|---|---|
| C1 | Name شركة التكافل للتأمين, Tripoli (3, 40) | PARTIALLY | "Takaful Insurance Company (TIC)", HQ Tripoli, CEO Basem A. Tantush. It called itself "first cooperative-type company". A 2025 report names "Takaful Libya" (ICIEC facultative deal), which may or may not be the same entity. | https://atlas-mag.net/fr/articles/takaful-insurance-company-est-operationnelle ; https://www.atlas-mag.net/en/articles/new-regulatory-measures-libyas-insurance-sector (search snippet re ICIEC) |
| C2 | Founded 2007 (40) | PARTIALLY / conflicting | Atlas overview says TIC began in 2007. Atlas (7 Dec 2012) says it became operational in Dec 2012. One academic source says Libyan takaful regulations date from 2012. | https://www.atlas-mag.net/en/article/takaful-insurance/concept-and-first-companies ; Atlas 2012 above ; https://dspace.academy.edu.ly/entities/project/2c14a054-3e51-4fbd-b603-2357354eedd7/full |
| C3 | Capital LYD 10 million (40) | VERIFIED (as of 2012) | LYD 10,000,000. Current paid-up capital is not confirmed. | Atlas 2012 above |
| C4 | GWC (gross written contributions) ~USD 13.8m 2024 (40) | UNVERIFIED | No public source found. | — |
| C5 | Products incl. Orange Card, Hajj/Umrah, export credit, family takaful (40) | UNVERIFIED (export credit PARTIALLY) | Only an ICIEC facultative agreement with "Takaful Libya" (Sept 2025) was found. | search snippet, Atlas (above) |
| C6 | Hybrid Wakala + Mudaraba, "Full Takaful" (40) | UNVERIFIED | No public source. The 2012 self-description was "cooperative-type". | — |
| C7 | Current system ARIMA (Oracle + .NET) (40: "very likely"; 1116: stated as fact) | UNVERIFIED; internally inconsistent | ARIMA Insurance Software WLL is in Manama and linked to ARIG (part-owned by the Central Bank of Libya). Profiles conflict: one has ARIG at 49%, another says it was acquired by BSynchro in 2014. No Libyan client of ARIMA found. | https://www.arig.net/?p=1433 ; https://pitchbook.com/profiles/company/64227-70 |
| C8 | Q9 "August 2025 regulator statement" (1041) | UNVERIFIED | Not found. The closest item is the ISA joining the takaful federation (25 Sep 2025). | https://meinsurancereview.com/News/ViewNewsLetterArticle/id/93013/type/MiddleEast/Libya-becomes-member-of-Sudan-based-international-takaful-federation |

### 2.2 Law 3/2005 on insurance supervision (§17 lines 1004–1013, and module refs)

Text source for all rows: https://www.mohamah.net/law/?p=11467 (OCR copy). In-force status: https://lawsociety.ly/?p=1005 (index).

| # | Claim (line) | Status | Finding |
|---|---|---|---|
| L1 | Law 3/2005 in force | VERIFIED | Listed as in force. Executive regulation is GPC Decision 4/2006 (https://lawsociety.ly/?p=10746), **which the README does not cite**. |
| L2 | ISA exists (1132) | VERIFIED | هيئة الإشراف على التأمين was created by GPC Decision 760/2007 under Economy & Trade. Note that Art. 3 of the law vests supervision in the Economy & Trade secretariat (now the Ministry). The 2026 decisions are ministerial. (https://lawsociety.ly/legislation/قرار-رقم-760-لسنة-2007...) |
| L3 | Art. 4 levy 2.5‰ life, 5‰ other (1004, 687) | VERIFIED + gap | Rates match and apply to gross premiums of the prior year. **The article also says companies may not pass the fee on to policyholders/insureds.** The README does not say which fund bears it (see D-10). |
| L4 | Art. 6 min. capital LYD 10m (1005) | VERIFIED + detail | This is *subscribed* capital for direct insurers: 3/10 paid at incorporation, the rest within 5 years. Libyans must hold at least 51%, and nominative shares at least 50%. Reinsurers need LYD 30m. |
| L5 | Art. 13 compulsory local cession by ministerial quota (388, 1006) | VERIFIED | Shares and commissions are set by ministerial decision. No % is fixed in the law. |
| L6 | Art. 15 reserves; 47% motor TPL, 25% transport, 40% others; IBNR; fluctuation (684, 1007) | VERIFIED + gap | 40% applies to "others **except engineering**". Engineering is pro-rata over the project period. Reserves are net of reinsurance. Life lines need a mathematical reserve set by an actuary. IBNR follows "Secretariat rules" and the fluctuation reserve follows the executive regulation. |
| L7 | Art. 16 assets ≥ technical provisions held in Libya (625, 1008) | VERIFIED + detail | Those assets cannot be seized. Cash and securities must be **deposited in a Libyan bank**. Life assets are kept separate. Investment rules are in the executive regulation. |
| L8 | Art. 17 solvency, non-life: max(20% NP, 25% NC), reinsurance deduction ≤50%, ≥ paid-up capital (688, 1009) | VERIFIED + gap | **Life/capitalisation formula is omitted**: 3‰ of sum at risk (up to 50% reinsurance relief) plus 4% of mathematical reserves (up to 15% relief). Family takaful (M20) needs it. |
| L9 | Art. 22 registers (292, 1010) | VERIFIED | Registers of policies, claims, brokers, agents, agreements and earmarked assets, kept per class. They may be computerised. |
| L10 | Art. 23 separate accounts per class (420, 482, 1011) | VERIFIED | — |
| L11 | Art. 24 annual returns (482, 687, 1012) | VERIFIED | Returns: balance sheet, profit distribution, general income/expense, income/expense per class, reinsurance summary, statement of Libyan assets. Signed by the authorised signatory and the finance manager (plus the actuary for life). The deadline is in the executive regulation. |
| L12 | Arts. 25–26 auditor from regulator's register (1013) | VERIFIED + detail | One auditor may audit at most two companies. The ISA may appoint another at the company's cost. Arts. 25–26 also require an actuarial report for life. |
| L13 | Law 3/2005 applied to takaful | — | The law makes no mention of takaful or a two-fund structure. How Arts. 15–17 apply to PTF vs SHF is an interpretation question for the ISA, lawyers and the actuary. |

### 2.3 Other Libyan instruments (§17 lines 1014–1023 and module refs)

| # | Claim (line) | Status | Finding | Source |
|---|---|---|---|---|
| O1 | Law 28/1971 compulsory motor TPL "as amended" (294, 1014) | VERIFIED | Amended by Law 4/2001 and Law 8/2003 (Art. 6). A 2008 Supreme Court constitutional ruling struck down Art. 6 para 1. Compensation bases are set by Decisions 195/2001 and 213/2003. | https://security-legislation.ly/latest-laws/law-no-8-of-2003-on-amending-an-article-in-law-no-28-of-1971-on-compulsory-insurance-for-civil-liability-arising-from-vehicle-accidents/ ; https://www.mohamah.net/law/?p=11455 |
| O2 | *(missing)* MoET Decision 400/2026: motor civil liability inside and outside Libya under the compulsory policy | NOT IN README — exists | Title confirmed and indexed as in force. Text not retrieved. | https://lawsociety.ly/akn/ly/act/decision/moet/2026/400 (title via search) |
| O3 | *(missing)* Decision 460 (2026): compulsory motor death/bodily-injury cap LYD 120,000 per person | NOT IN README — exists | Reported by Atlas Magazine on 31 Aug 2026. Title and date not given. | https://www.atlas-mag.net/en/articles/new-regulatory-measures-libyas-insurance-sector |
| O4 | *(missing)* MoET Decision 88/2026: agent commission % on compulsory policies and the Unified Arab Card | NOT IN README — exists | Title confirmed. Rate not retrieved. | https://lawsociety.ly/akn/ly/act/decision/moecon/2026/88 (title via search) |
| O5 | Resolution 315/2026: compulsory PI, public liability and fire for professional/technical/engineering firms (294, 1015) | PARTIALLY | Atlas describes it as **mandatory third-party liability** for companies in engineering, consulting, contracting, cybersecurity, healthcare and tourism. "Professional indemnity" and "fire" are **not confirmed**. Limits are unknown. | Atlas 2026 (above) |
| O6 | Decision 374/2026 reinsurer registration with the ISA (387, 1016) | VERIFIED (issuer correction) | Issued by the **Minister of Economy & Trade** (Suhail Abu Shiha), not the ISA. It requires reinsurers, branches and representative offices to register with the ISA under solvency, rating and oversight criteria, and sets criteria for how Libyan insurers deal with them. Thresholds and effective date not retrieved. | https://www.insurancebusinessmag.com/reinsurance/news/breaking-news/libyas-reinsurance-market-gets-its-first-formal-supervisory-framework-583757.aspx ; https://lawsociety.ly/akn/ly/act/decision/moet/2026/374 |
| O7 | Decisions 529/2008, 201/2012 (takaful practice) (1017) | UNVERIFIED | Not found. Only a secondary reference to "2012 takaful regulations" exists. | dspace.academy.edu.ly (above) |
| O8 | Decision 60/2021: Sharia auditor per branch (559, 1017, Q17) | UNVERIFIED | Not found. The only Libyan Sharia-auditor register found is the **Central Bank of Libya** Circular 8/2017 for *banks and financial institutions*. Its applicability to insurers is unknown. | https://lawsociety.ly/legislation/منشور-رقم-8-لسنة-2017... |
| O9 | Law 6/2022, Arts. 73–77: consent, transfers abroad, correction (262, 852, 1018) | PARTIALLY / mis-cited | Law 6/2022 is the **Electronic Transactions Law**. Ch. 7 covers Arts. 73–79, with penalties in Arts. 81–84. Art. 73 requires explicit consent, but the DLA Piper reading ties it to certificate issuance. Art. 74 lists exceptions, Art. 76 notice, Art. 77 access and update. **Art. 78 is transfers abroad ("appropriate level of protection", six factors). Art. 79 covers objection and purpose limitation, and breaching it carries ≥1 yr prison and a fine of LYD 3–10k under Art. 81.** There is no DPA and no breach-notification duty. | https://www.dlapiperdataprotection.com/index.html?c=LY&t=law ; https://lawsociety.ly/en/akn/ly/act/law/hor/2022/6 |
| O10 | Resolution 1013/2017 AML/CFT (262, 1019) | VERIFIED + caveat | Presidential Council (GNA) resolution of 24 Oct 2017 "issuing the AML/CFT Law", indexed as in force. **Law 2/2005 on AML** is still cited by other sources. Central Bank of Libya material refers to a **new draft AML/CFT law submitted to the legislature**. MENAFATF third-round evaluation is in preparation. | https://lawsociety.ly/en/legislation/resolution-no-1013-of-2017-concerning-the-issuance-of-the-anti-money-laundering-and-terrorism-financing-law/ ; https://amlwatcher.com/our-coverage/libya ; https://cbl.gov.ly/en/?p=59755 |
| O11 | STR to the Libyan Financial Information Unit (686) | VERIFIED | The FIU runs **goAML** as the national reporting platform and publishes an STR Reporting Guide (2023). Whether insurers must register is not confirmed. | https://www.biia.com/libyas-central-bank-implements-electronic-system-to-combat-financial-crime ; https://lawsociety.ly/resource/دليل-الإبلاغ-عن-العمليات-المشبوهة-2023/ |
| O12 | Labour Relations Law 12/2010 (655, 1020) | VERIFIED (existence); figures PARTIALLY | Executive regulation is Decree 595/2010. Secondary sources give: 48 h/week, 10 h/day; annual leave 30 days, 45 at age 50+ or after 20 yrs; maternity 14 weeks (Playroll says 50 days, a conflict). Art. 78 end-of-service is reportedly for **non-nationals** only (½ month/yr for the first 5 yrs, then 1 month/yr); nationals fall under Social Security. | https://lawsociety.ly/en/akn/ly/act/law/gpc-congress/2010/12 ; https://www.rivermate.com/guides/libya/working-hours ; https://www.haqq.ai/blog/fasl-taasufi-nihayat-khidma-libya |
| O13 | Social Security Law 13/1980 (663, 1021) | VERIFIED + amended | **Amended by Law 3/2024** (Arts. 1, 8). Current rates (PwC, reviewed 31 May 2026): **employee 5.125%, employer 14.350%, public treasury 1.025% = 20.5%** for a Libyan entity (a foreign branch's employer pays 15.375%). Late-payment fine is 5% p.a. **The 3.75% / 11.25% figures are CONTRADICTED.** | https://taxsummaries.pwc.com/libya/individual/other-taxes ; https://lawsociety.ly/?p=325 |
| O14 | Income Tax Law 7/2010 salary bands (663, 1022) | VERIFIED | 5% up to LYD 12,000 per year (1,000 per month), 10% above. The tax base is computed **after** social security, the solidarity fund and personal exemptions. Exemptions: single 1,800 per year; married 2,400 + 300 per child. Monthly declaration to the Tax Department. | https://taxsummaries.pwc.com/libya/individual/taxes-on-personal-income ; https://taxsummaries.pwc.com/libya/individual/deductions |
| O15 | *(missing)* Social Solidarity / Unity Fund 1% | NOT IN README | 1% of monthly gross salary, collected by the Tax Department. | PwC other-taxes (above) |
| O16 | *(missing)* Stamp duty on salaries 0.5% | NOT IN README | 0.5% of net salaries. Stamp duty on insurance policies and receipts is not covered by PwC: **UNVERIFIED**. | PwC other-taxes (above) |
| O17 | Jihad tax (brief asks whether abolished) | UNVERIFIED | Listed at 3% in a 2016–17 guide. Absent from PwC 2026. No repeal instrument found. | https://smeportal.unescwa.org/sites/default/files/2019-12/libya-tax-guide-2016-17.pdf |
| O18 | Weekend Friday–Saturday; public holidays (355, 680, 1023) | PARTIALLY | Fixed national days: 17 Feb, 16 Sep, 23 Oct, 24 Dec. Eid and other Islamic dates differ by a day across sources and depend on announcements. Ad-hoc government holidays happen (e.g., Jan 2026 weather closure decreed by the *eastern* PM Hammad). Fri–Sat weekend is not confirmed from a primary source. | https://calendarific.com/holidays/2026/ly ; https://truecalendar.com/public-holidays/libya/2026 |

### 2.4 Payments, messaging, Orange Card

| # | Claim (line) | Status | Finding | Source |
|---|---|---|---|---|
| P1 | Stripe adapter "enable only where available" (412, 809) | CONTRADICTED for Libya | Libya is not on Stripe's country list. | https://stripe.com/global |
| P2 | PayPal adapter | UNVERIFIED (likely unavailable) | Secondary reports say it is unsupported. A 2021 Central Bank of Libya idea to bring PayPal in was not followed up. | https://www.leconomistemaghrebin.com/2021/10/08/libye-banque-centrale-envisage-introduire-paypal/ ; https://community.shopify.com/t/how-can-i-solve-payment-issues-in-regions-with-no-shopify-support/190629 |
| P3 | "Local Libyan card acquirer" (412) | VERIFIED (landscape) | **Moamalat** is licensed as a local card issuance and acceptance processor; the national switch is moving to the Central Bank of Libya. **LYPAY** is the CBL instant QR payment system (bank-offered). **Sadad** does bill payments and merchant services. **Fawry** holds a wallet licence. | https://cbl.gov.ly/en/?p=15034 ; https://www.ncb.ly/en/business/business-electronic-services/business-lypay ; https://regalert.today/guides/fintech/LY |
| P4 | SMS provider (815, Q26) | PARTIALLY | The operators are Libyana and Al Madar Aljadid. Sender-ID registration rules differ by aggregator, and numeric IDs are unreliable. | https://support.telnyx.com/en/articles/6674989-libya-sms-guidelines ; https://www.twilio.com/guidelines/ly/sms |
| P5 | Orange Card / Unified Arab Card bureau (692, 813, Q19–20) | PARTIALLY | This is the GAIF scheme (1975 Tunis convention) with a national unified bureau per member state. An electronic certificate format is used, including Libya–Tunisia. The Libyan bureau's identity and data spec were not found. Dec. 88/2026 regulates agent commission on it. | https://en.wikipedia.org/wiki/General_Arab_Insurance_Federation ; https://en.challenges.tn/economy/inter-arab-motor-insurance-card-electronic-format-efffective-starting-april-1/ |

### 2.5 Rule-pack examples (§5.2 line 195, §6.7 line 450, §6.11 line 593, §15 line 947)

| # | Claim (line) | Status | Finding | Source |
|---|---|---|---|---|
| R1 | UAE Wakala cap 35% incl. commissions (195, 450) | PARTIALLY (likely outdated) | The 35% cap on short-term products, including all commissions, was in the prior regime (IA Decision 49/2019 Art. 16, CBUAE Rulebook). **The new CBUAE "Regulation regarding takaful insurance" took effect 14 Sep 2026** and replaces the 2022 regs. It mandates a **wakala-only model** (no mudaraba hybrid), a **takaful fund with separate legal personality**, and rules for takaful windows. Whether the 35% cap is retained is UNVERIFIED. | https://www.pinsentmasons.com/out-law/news/uae-central-bank-overhauls-takaful-insurance-framework ; https://www.uaeexperthub.com/?p=6621 |
| R2 | KSA 10% surplus to policyholders (593) | VERIFIED + caveat | Under the Implementing Regs, 10% of net surplus goes to policyholders (cash or a premium reduction) and **90% goes to shareholders**, with IA written approval. KSA is a cooperative model, not wakala takaful. A **new KSA Insurance Law** draft was in consultation in 2025 and is not yet confirmed enacted. | https://rulebook.sama.gov.sa/en/node/7876 ; https://www.ia.gov.sa/documents/Rules/II_Surplus_Distribution_Policy.pdf ; https://www.captiveinternational.com/consultation-open-on-saudi-arabia-new-insurance-laws |
| R3 | Bahrain rule pack (947) | UNVERIFIED (not researched in depth) | — | — |

### 2.6 Data residency (§12.3 line 852)

| # | Claim | Status | Finding | Source |
|---|---|---|---|---|
| DR1 | Frankfurt hosting needs a Libyan legal opinion under Law 6/2022 "appropriate level of protection" | PARTIALLY | The quoted phrase matches **Art. 78** (not 73–77). There is no explicit localisation ban in Law 6/2022. Other instruments may bear on it: **General Information Authority Circular 1/2024** (protection and confidentiality of *government and personal* data, 5 Sep 2024; text not retrieved), **CBL Circular 18/2025** (banking-sector data protection), **Cabinet Decision 358/2026** creating a national cybersecurity and digital sovereignty authority, and **Cybercrime Law 5/2022**. | DLA Piper (above) ; https://lawsociety.ly/akn/ly/doc/circular/gia/2024/1 ; https://lawsociety.ly/?p=157561 (titles via search) |

---

## 3. Flags

| ID | Sev | README line(s) | Issue | Recommended fix |
|---|---|---|---|---|
| D-01 | HIGH | 262, 1018, 852 | Law 6/2022 is cited as "Arts. 73–77" for consent, transfers and correction. Transfers abroad are **Art. 78**, and Art. 79 (objection, purpose limitation) carries **criminal penalties** under Art. 81. It is also unclear whether Art. 73 binds a private insurer, since it is tied to certification and e-transactions. Libya has no DPA. | Re-cite as "Law 6/2022 (Electronic Transactions), Ch. 7, Arts. 73–79; penalties Arts. 81–84". Add `party_consent` fields for purpose, explicit refusal (Art. 79) and notice given (Art. 76). Add the scope question to the legal-opinion request. |
| D-02 | BLOCKER (go-live) | 852, 939, 943, Q16 | The legal hosting opinion is the right gate, but its scope is too narrow. It is "requested" in Phase 0 with no deadline, yet Phase 1 starts processing masked data in Frankfurt on day 14. | Scope the opinion to cover: Law 6/2022 Art. 78; GIA Circular 1/2024; Cabinet Dec. 358/2026 (digital sovereignty authority); Cybercrime Law 5/2022; ISA access to Art. 22 registers and Art. 24 returns; and whether US-parent processors (Vercel, Neon, AWS) are acceptable. Set a **due date before Phase 2 day 60**, so the in-country fallback (R4 / §12.3) can be stood up before UAT. Get Q16 answered in writing before day 10. |
| D-03 | HIGH | 294, 692, 1014 | The compulsory-motor rule pack cites only Law 28/1971. It misses **Dec. 400/2026** (motor civil liability inside and outside Libya), **Dec. 460** (LYD 120,000 per-person bodily-injury cap) and compensation-basis decisions 195/2001 and 213/2003. Compulsory motor is a **Phase-1** product (M22). | Add these instruments to §17 and to the M03 compulsory-motor template: cover limits, territorial scope (in-Libya vs cross-border/Orange Card), compensation tables. Get the texts from the client's lawyer before sprint days 6–8 (M03 motor product). |
| D-04 | HIGH | 443–459, 1051, Q28 | **Dec. 88/2026 fixes agent commission % on compulsory policies and the Unified Arab Card.** M04's free-form tiered commission and KPI multipliers could breach it for those lines. | Add a rule-pack "regulated commission" table that caps or overrides tiers per product class. Make tiers inapplicable to regulated lines. Add an acceptance test: a compulsory-motor commission never exceeds the regulated %. |
| D-05 | HIGH | 663, 1021–1022, 637, Q27 | Payroll statutory scope is incomplete. It is missing the **1% Social Solidarity/Unity Fund**, **0.5% stamp duty on net salaries**, **personal exemptions** (1,800 / 2,400 + 300 per child), the **ordering of the tax base** (tax after SS + solidarity + exemptions), the **three-way SS split** (employee 5.125%, employer 14.35%, treasury 1.025%), and the **Law 3/2024 amendment** of Law 13/1980. | Extend M34 with an ordered calculation pipeline: gross → SS employee → solidarity → exemptions → tax bands → stamp duty. Add separate employer and treasury SS lines (a treasury-share payable or receivable). Add the jihad-tax status as an explicit rule-pack item (currently UNVERIFIED). Add statutory returns for the Social Security Fund (INAS) and the Tax Department (monthly). Seed `illustrative` values from PwC (31 May 2026) and keep Q27 sign-off as the gate. |
| D-06 | MEDIUM | 651, 655 | End of service is "per labour law (configurable formula)". Reportedly Art. 78 Law 12/2010 gratuity applies to **non-nationals** not covered by SS; nationals rely on Social Security pension. Leave figures conflict (30/45 days; maternity 14 weeks vs 50 days). | Make end of service depend on nationality and SS coverage. Rule pack: annual leave 30 days (45 at age 50+ or after 20 yrs), 48 h/week, 10 h/day, all flagged `to_verify`. Hajj leave, Ramadan hours and maternity duration go to the client's HR lawyer. |
| D-07 | MEDIUM | 114, 355, 680, 1023, Q23 | The Hijri calendar uses `islamic-umalqura`, which is the Saudi tabular calendar. Libyan Eid and holiday dates follow local announcements and differ by a day across sources. Ad-hoc holidays are decreed, sometimes by rival governments. The claims SLA (5 working days) depends on this. | The tenant holiday calendar must be maker-checker editable per year, with an "announced" override. Do not derive holidays from Umm al-Qura. Record the issuing authority for each holiday. |
| D-08 | HIGH | 404, 412, 809, 941 | **Stripe does not serve Libya**, and PayPal is reported unsupported. The client requirement names them, and Phase 2 "M07 gateways" acceptance could be blocked by something that cannot be delivered. | Record in the contract or traceability (§19, 3.6) that Stripe and PayPal are built as adapters but cannot be activated for a Libyan merchant. The Libya acceptance tests use **Moamalat (cards), LYPAY (QR/instant, via the client's bank), Sadad**, and bank transfer. Q12 must name the client's acquiring bank by Phase 1 day 30. |
| D-09 | MEDIUM | 387, 1016 | The issuer of Decision 374/2026 is the **Minister of Economy & Trade**, not the ISA. Other 2026 instruments (88, 315, 400, 460) are also ministerial. Libya has parallel governments, so instruments may compete. | The rule pack should store issuer, Gazette reference, in-force status and evidence URL for each rule. Add a "jurisdictional validity confirmed by client counsel" flag. |
| D-10 | MEDIUM | 186, 1004, 687 | Law 3/2005 Art. 4 says the supervision levy **may not be passed on to policyholders**. The README never says which fund bears the levy. Charging it to the PTF arguably passes it to participants. | Default the levy to an SHF expense. Allow the PTF only with legal and SSB approval through `EXPENSE_RECHARGE`. Add an "i" text citing Art. 4. |
| D-11 | MEDIUM | 684, 1007 | The Art. 15 floors omit the **engineering exception** (pro rata over the project period instead of 40%). They also omit net-of-reinsurance computation and the regulator's power to demand more. The **executive regulation (GPC Decision 4/2006)** governs the fluctuation reserve, investments and the Art. 24 deadlines, and is not cited anywhere. | Add the engineering rule. Add Decision 4/2006 to §17 and the source list (line 42). Get its text (paywalled online) through the client. |
| D-12 | MEDIUM | 688, 1009 | Art. 17 also has a **life/capitalisation solvency formula** (3‰ sum at risk + 4% mathematical reserves, with reinsurance relief caps), and Art. 15 a life mathematical reserve. Family takaful is a listed client product (M20, P4). | Add the life formula to the M19 rule pack. Flag as a Phase-4 dependency. |
| D-13 | MEDIUM | 13, 1017, 559, Q17 | Takaful decisions 529/2008, 201/2012 and 60/2021 cannot be found. "Sharia auditor per branch" is unverified, and the only Sharia-auditor register found is the CBL's (Circular 8/2017) for banks. Law 3/2005 does not mention takaful at all. | Keep `configurable`. Phase 0 deliverable: the client supplies certified copies of every takaful-specific ISA/MoET instrument and its licence conditions. Until then, M16 per-branch audit plans are optional and not acceptance-tested. |
| D-14 | MEDIUM | 1015 | Res. 315/2026 is described as "PI, public liability, fire". The only source says **mandatory third-party liability** for engineering, consulting, contracting, cybersecurity, healthcare and tourism firms. | Re-describe it as "compulsory third-party liability for listed technical sectors (scope per text)". Templates wait for the text (Q7 may be related). |
| D-15 | HIGH | 262, 686, 1019 | The AML basis is cited only as PC Res. 1013/2017. **Law 2/2005** is also cited as the AML law, and a new AML/CFT law is in draft. The FIU reporting channel is **goAML**, with a 2023 STR guide. The sanctions-list scope is not specified. Libya-related UN sanctions (UNSC 1970 regime) and 1267/1988 lists will generate domestic hits. | Cite "Law 2/2005 and PC Resolution 1013/2017 (status per counsel); FIU STR Guide 2023". Make M17 STR export goAML-compatible (XML schema from the FIU). Screening lists: UN consolidated (incl. the Libya 1970 regime), any national list (to obtain), plus configurable OFAC and EU lists. Phase 2 needs the client MLRO's registration on goAML. |
| D-16 | MEDIUM | 195, 450, 947 | The **UAE example is outdated**. The new CBUAE Takaful Regulation (in force 14 Sep 2026) is wakala-only and gives the fund separate legal personality. The README's hybrid Wakala + Mudaraba design (§5.3 `MUDARIB_SHARE`) would be non-compliant in the UAE. Whether the 35% cap survives is unverified. | Phase 5: rebuild the UAE pack from the 2026 regulation text. The fund engine must allow `MUDARIB_SHARE` to be switched off per rule pack and replaced by a wakala investment fee, and must allow a fund-as-legal-entity attribute. Change the README example to "e.g., UAE cap per current CBUAE regulation". |
| D-17 | MEDIUM | 593, 208, 947 | The **KSA example is mis-framed**. KSA cooperative insurance gives 10% to policyholders and **90% to shareholders**. §5.3 has no inter-fund transfer type for a surplus share to the SHF, and §5.1 assumes takaful funds. A new KSA Insurance Law is in draft. | Add a `SURPLUS_TO_SHAREHOLDERS` transfer type, blocked by default and enabled per rule pack. Note in §15 Phase 5 that KSA needs a "cooperative" fund-model variant. Revalidate against the KSA law in force at Phase 5. |
| D-18 | HIGH | 40, 1116, Q1 | Client facts are weak. GWC (gross written contributions) USD 13.8m, the product list and ARIMA are UNVERIFIED. The founding date conflicts (2007 vs operational 2012). §1.1 says "very likely ARIMA" but §20 states it as fact. Migration scope (§14.4) and Phase-1 extract format (line 904) depend on ARIMA/Oracle. | Mark these facts "client-reported, unverified". Fix §20 to "presumed". Q1 must be confirmed at kick-off (Phase 0). If it is not ARIMA, re-plan §14. |
| D-19 | LOW | 1041 | The "August 2025 regulator statement" (Q9) cannot be found. | Keep as a discreet question. Do not reference it in client-facing material without a source. |
| D-20 | LOW | 1, 38, 129 | The brief says the product is renamed "TakafulTech", but the README still says "Core Islamic Insurance" in 3 places. | Rename (product owner decision D-level). |
| D-21 | LOW | 815, Q26 | SMS: sender-ID registration differs by aggregator and operator (Libyana vs Al Madar), and numeric IDs are filtered. | Q26 should also ask for a registered alphanumeric sender ID per operator. Allow 2–4 weeks lead time before Phase 2 live SMS. |
| D-22 | MEDIUM | 625, 1008 | Art. 16 requires cash and securities covering reserves to be deposited **in a Libyan bank**, and those assets cannot be seized. M11 only checks "held in Libya". | Add a custodian/bank-country attribute on investment and bank accounts, and an Art. 16 coverage report per fund. |
| D-23 | LOW | 1056, Q24 | The default 10-year retention has no legal basis cited (AML record-keeping, commercial and tax law). | Ask counsel. Keep 10 years as an illustrative default. |
| D-24 | MEDIUM | 670, 561 | Zakat via payroll and a Hajj-leave entitlement are not modelled. Their Libyan legal status is UNVERIFIED. Zakat is likely voluntary for employees. | Add an optional voluntary deduction type (zakat/charity) with consent. Add Hajj leave as a configurable leave type (already listed) whose entitlement is confirmed by HR counsel. |

---

## 4. Client and lawyer dependency list (what, from whom, needed before)

| # | Item | From | Needed before | Blocks |
|---|---|---|---|---|
| 1 | Written confirmation of the current core system (ARIMA? version, Oracle data ownership) and of company facts (capital, GWC (gross written contributions), product list, licence) | Client CFO/IT | Phase 0 kick-off | §14 migration, Phase 1 extract (D-18) |
| 2 | Q16: written acceptance of Frankfurt for the **masked** sandbox | Client management + counsel | Phase 1 day 10 (masking CLI handover) | Sandbox load day 14 (D-02) |
| 3 | Libyan legal opinion on hosting personal data abroad, scoped as in D-02 | Client's Libyan counsel | Phase 2 day ~60 (decides in-country fallback); hard gate at go-live | Production hosting |
| 4 | Certified texts: Law 28/1971 consolidated, **Dec. 400/2026, Dec. 460, Dec. 88/2026**, Decisions 195/2001 and 213/2003, the current compulsory-motor tariff | Client legal/compliance | Phase 1 day 6 (M03 motor product) | M03/M22 compulsory motor, M04 commission (D-03, D-04) |
| 5 | GPC Decision 4/2006 (Law 3/2005 executive regulation); Art. 24 return forms and deadlines; ministerial compulsory-cession quota (Art. 13) | Client compliance / ISA | Phase 2 start (day 31) | M13, M18, M10 (D-11) |
| 6 | Takaful-specific instruments: 529/2008, 201/2012, 60/2021, the client's licence conditions and Articles; SSB charter | Client compliance + SSB secretary | Phase 1 day 9 (M16 `sharia_status`) for the Articles; Phase 2 for M16 audit plans | M08 fund model, M16 (D-13) |
| 7 | Res. 315/2026 and Dec. 374/2026 full texts (scope, limits, reinsurer criteria) | Client compliance | Phase 2 (M10 counterparties; new products Q7) | M10, M03 (D-09, D-14) |
| 8 | AML: confirmation of the governing law (2/2005 vs 1013/2017 vs any new law), FIU goAML registration and XML schema, national sanctions list, ISA AML instructions for insurers | Client MLRO | Phase 2 day 31 (M17 build) | M17 (D-15) |
| 9 | Payroll: SS rates (20.5% split), solidarity 1%, stamp duty 0.5%, exemptions, jihad-tax status, current HR/payroll data (Q25, Q27) | Client payroll accountant + tax advisor | Phase 2 day ~50 (M34 build); signed control sheet before payroll UAT | M34 (D-05) |
| 10 | Labour: leave entitlements, end-of-service policy by nationality, Hajj leave, Ramadan hours, internal HR policy | Client HR + labour counsel | Phase 1 day 6 (M33 master) for contract fields; Phase 2 for leave/EOS | M33 (D-06) |
| 11 | Official holiday calendar for the year, plus the authority the client follows | Client HR/admin | Phase 1 day 19 (claims SLA clock) | M00, M09 SLA (D-07) |
| 12 | Acquiring bank and channels (Moamalat merchant ID, LYPAY via bank, Sadad), plus a contract annex acknowledging Stripe/PayPal are unavailable | Client finance + bank | Phase 1 day 30 (so Phase 2 M07 can start) | M07/M30 gateways (D-08) |
| 13 | Orange Card: Libyan unified bureau contact, certificate format and data spec, numbering/QR rules (Q19–20) | Client motor dept + bureau | Phase 2 day 31 | M22 Orange Card (P5) |
| 14 | SMS: provider contract and registered sender IDs on both operators | Client IT | Phase 2 day ~60 | Live alerts (D-21) |
| 15 | Fund-parameter sheet and SSB approvals (Q2, Q14), including who bears the Art. 4 levy | CFO + SSB + counsel | Phase 1 day 9 (labelled illustrative until signed); go-live gate | M08, D-10 |
| 16 | Phase 5 (KSA, UAE, Bahrain): fresh legal review of the 2026 CBUAE Takaful Regulation, the KSA Insurance Law (if enacted), and the CBB Takaful module | Our regulatory counsel per country | Phase 5 start (month 9) | Rule packs (D-16, D-17) |

---

## 5. Sources not reachable

- lawsociety.ly returned HTTP 402 on all direct fetches. Instrument titles and in-force tags were confirmed only from search-result snippets.
- cbuae.thomsonreuters.com is blocked by the session network policy.
- Statutory text for Law 3/2005 came from an OCR copy (mohamah.net). Its figures must be checked against the Official Gazette.
