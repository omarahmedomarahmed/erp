# TakafulTech — Arabic-First Product and the Terminology Dictionary (قاموس المصطلحات)

Status: requirement added on 2026-10-28 by the product owner. Binding for every build unit (BU) with user-visible output. This document extends README D4, D5 and D7, §10, and rule R8. It adds module **M35** and rule **R9**.

---

## 1. Requirement (as given)

> "We need the product and screens and text and everything to be in Arabic, with an admin dictionary of the translated words so we can change the name of a terminology or internal references or labels — everything translated — so we can edit the Arabic word everywhere by editing it in that one dictionary page, with filters. All of them are unchecked at first, until someone edits the word and marks it as checked, or marks it as checked if it was translated into Arabic correctly."

## 2. Arabic-first rule (R9)

| # | Rule |
|---|---|
| R9.1 | **Every user-visible text is Arabic by default and must exist in Arabic.** This covers screens, menus, module names, field labels, buttons, table columns, statuses and enum labels, validation and error messages, toasts, empty states, confirmations, "i" help texts, Learning Center content, PDFs (certificates, receipts, statements, payslips, letters, compliance certificates), e-mail, SMS and WhatsApp templates, in-app notifications, dashboards, KPI names, report titles and column headers, Excel/CSV export headers, audit-history field labels, role names, workflow step names, API error `message` fields (stable `code` stays English), and the public QR verification page. |
| R9.2 | Layout is RTL by default. English remains an optional toggle (README D7). Arabic is the legally prevailing language on documents (README §4). |
| R9.3 | **No user-visible string literal in code**, Arabic or English. All text is referenced by a dictionary key. Enforced by lint rule `no-literal-ui-text` (extends R8) and by gate G13 (`dictionary:check`). |
| R9.4 | Internal codes (enum values such as `WAKALA_FEE`, module IDs such as `M08`, table names, event names, numbering series codes) are never shown raw. Each has a display term in the dictionary, e.g. `WAKALA_FEE` → «أجرة الوكالة», `M08` → «محرك صناديق التكافل». |
| R9.5 | Digits and number format follow the tenant policy: Arabic-Indic or Latin digits, LYD with 3 decimals (D00-21). Hijri and Gregorian dates are shown side by side where the README requires it. |
| R9.6 | Metabase / Power BI: the `rpt_*` views expose Arabic column aliases generated from the dictionary (`rpt_*_ar`), regenerated when a term changes. |
| R9.7 | Data entered by users (names, addresses) is stored as entered. Arabic and Latin name fields remain as specified in M02. |

## 3. Module M35: Terminology Dictionary (قاموس المصطلحات), Phase 1

### 3.1 Two layers, one admin page

| Layer | What it holds | Example | Effect of editing |
|---|---|---|---|
| **Terms** (مصطلحات) | Canonical domain vocabulary and internal-reference display names | `term.certificate` = «وثيقة»; `term.contribution` = «اشتراك»; `term.ptf` = «صندوق المشتركين»; `code.WAKALA_FEE` = «أجرة الوكالة»; `module.m09` = «إدارة المطالبات» | Changes the word **everywhere it is referenced**: every label, message, document and help text that embeds it |
| **Texts** (نصوص) | Every label, sentence, heading, button, error, template fragment, help text | `m06.issue.button` = «إصدار {t:certificate}»; `err.m07.receipt-over-allocated` = «المبلغ المخصص يتجاوز قيمة {t:receipt}» | Changes that one text only |

Texts embed terms with the reference syntax `{t:<term>}`, plus grammatical form selectors (§3.3). Renaming «وثيقة» to «شهادة» in **one** dictionary row therefore updates every screen, PDF, SMS, report and help text that uses it, which is what the requirement asks for.

### 3.2 Data model (tenant database; owned by M35)

| Table | Key columns |
|---|---|
| `dict_entry` | `key` (unique, e.g. `m06.issue.button`), `kind` (term / text), `category` (label, button, status, enum, error, message, help, document, notification, report, kpi, menu, module, role, workflow, email, sms), `module`, `screen`, `tags` (sharia, finance, legal, hr, compliance), `ar_default` (shipped), `ar_current`, `en_default`, `en_current`, `checked` (**boolean, default false**), `checked_by`, `checked_at`, `edited_by`, `edited_at`, `version`, `notes`, `sharia_status` (for SSB-approved wording) |
| `dict_term_form` | Arabic grammatical forms per term: `singular`, `dual`, `plural`, `definite_singular` (with «ال»), `definite_plural`, `gender` (m/f), `construct` (إضافة) form where it differs |
| `dict_usage` | `key` → where used (screen key, document template, notification template, report), generated at build time + scanned templates, so the page can show «مستخدم في 37 موضعاً» |
| `dict_version` | Published dictionary versions per tenant (immutable snapshots) |
| `dict_change` | Append-only history: before/after text, actor, reason, approval reference (also emitted to the M27 audit chain) |

Shipped defaults live in the repo (`content/dictionary/ar.yaml`, `en.yaml`, `terms.yaml`), seeded per tenant. Tenant edits are **overrides** and never modify the shipped base. This matches README §10.1 behaviour for help texts.

### 3.3 Arabic grammar support

Arabic agreement needs more than string replacement.

| Mechanism | Rule |
|---|---|
| Forms | `{t:certificate}` uses the singular. `{t:certificate|plural}`, `{t:certificate|def}`, `{t:certificate|def,plural}` and `{t:certificate|dual}` select forms from `dict_term_form`. |
| Gender agreement | `{t:certificate|gender, select, f {صادرة} m {صادر}}` follows the term's gender. When a term is renamed with a different gender, every dependent adjective follows automatically. |
| Counts | ICU plural with CLDR Arabic categories (zero, one, two, few, many, other) is mandatory for count-bearing texts. |
| Impact checks | Editing a term shows a **live preview** of 5–10 sample texts that use it, and warns when a new gender or form is missing. |

### 3.4 The dictionary admin page (شاشة القاموس)

| Feature | Behaviour |
|---|---|
| Table | One row per key: Arabic (editable inline), English (editable), key, kind, category, module, screen, tags, usage count, checked ☐/☑, last edited by/at |
| **Initial state** | **Every entry starts unchecked (☐ «غير مُراجَع»)**, including all AI-seeded Arabic text |
| Edit | Editing the Arabic text saves a new version. The editor may tick **«تم التحقق»** in the same action. Editing an entry that was checked **resets it to unchecked** unless the editor re-ticks it, so every change is a conscious review. |
| Mark as checked | A reviewer can tick ☑ without editing, confirming the Arabic translation is correct. The reviewer and time are recorded. Un-checking is allowed and audited. |
| Bulk actions | Mark selected as checked (confirmation shows count); reset selected to default; export / import XLSX/CSV for offline translators. Import never auto-checks. |
| Filters | Checked / unchecked; edited / default; kind; category; module; screen; tag (Sharia, finance, legal, HR, compliance); changed by; changed date range; "used in" (screen or document); missing English; invalid ICU syntax. All filters start **cleared**, showing every entry. Saved filter presets are allowed. |
| Search | Arabic-normalised search (same `ar_norm()` as README §10.3: hamza forms, ta marbuta, alef maqsura, tashkeel removed) across Arabic, English, key and notes |
| Progress | Header counters: total / checked / unchecked / edited, by module and by tag |
| History | Per-key history with diff, actor, approval and restore |
| Access | M01 levels apply: View (1), Maker = edit (2), Checker = mark checked or approve (3), Module Admin (4). A new default role, **«مسؤول المصطلحات» (Terminology admin)**, is added to README §9.2. |
| Help | The page itself carries "i" icons, and its own labels come from the dictionary |

### 3.5 Governance (consistent with README §4 maker-checker and §6.10)

| Entry tag | Edit rule |
|---|---|
| Untagged UI text | Maker edits and can self-mark checked. This is the user-requested fast path. |
| `legal`, `finance`, `compliance`, `hr` | Edit requires a checker (a second person) before it is published |
| `sharia`, or text used in **SSB-approved document wording** (certificates, compliance certificates) | Edit requires checker + SSB approval reference. Until approved, the old wording stays live. |
| All edits | Audited (M27), versioned (R7) |

### 3.6 Propagation

| Item | Behaviour |
|---|---|
| Publishing | Publishing creates `dict_version` n+1. Web and worker load the current version per tenant with a cache. Changes are live in **≤60 seconds** across web, worker (PDF, SMS, e-mail) and API messages. |
| Immutability | **Already-issued documents are not changed.** PDFs are stored as rendered with the `dict_version` they used (README R2/R7 immutability). Re-issue or endorsement uses the current version. |
| Search | The Learning Center and smart search re-index on publish. The **old term is kept automatically as a synonym** so searches for the previous word still find results (README §10.3 synonym table). |
| Reporting | Metabase Arabic alias views are regenerated on publish (R9.6) |

### 3.7 Enforcement in the build (gates)

| Gate | Check |
|---|---|
| G3 lint | `no-literal-ui-text`: no user-visible string literals in TSX/TS UI, templates or notification code. Only dictionary keys. |
| G13 `dictionary:check` | Every referenced key exists, with `ar_default` non-empty and valid ICU in Arabic and English. Every `{t:…}` reference resolves to a term with the required forms. No orphan keys. Every enum, code and module ID that can reach the UI has a display term. |
| G15 e2e | `ar-rtl` screenshots on key screens; a pseudo-locale run that fails if any raw key or English text appears in Arabic mode |
| Release gate | Shows checked % by module and tag. **Go-live requires 100% checked** for entries tagged `sharia`, `legal`, `finance`, and every document, notification and error text. The remaining UI labels are reported, and the client may accept the residue in writing. |

### 3.8 Relationship to "i" help texts and the glossary

"i" help texts (README §10.1) are dictionary entries of category `help`. Their review status uses the same **checked** flag, replacing the separate `approved` status, so one page and one review flag cover all Arabic text. The README §10.3 glossary and synonym lists are seeded from the terms layer.

### 3.9 Build units

| BU | Wave | Scope | Deps | h |
|---|---|---|---|---|
| F10 (extended) | W4 | i18n pipeline: key extractor, `content/dictionary/*.yaml` schema, `{t:…}` reference syntax, ICU validation, `dictionary:check`, `no-literal-ui-text` lint | F08 | 4 |
| **F22** | W5 | Dictionary runtime: `dict_*` tables, tenant overrides, versioned publish, ≤60-s cache invalidation for web and worker, term-form resolution and gender select, document version stamping, synonym auto-add, Arabic alias view generator | F03, F10 | 5 |
| **128** | W13 | M35 admin page: table, inline edit, checked flag (default unchecked; reset on edit), bulk actions, filters, normalised search, preview of usages, history and restore, XLSX import/export, governance by tag (maker-checker, SSB reference), progress counters, i-text entries | F22, F12, F15, F09, F19 | 5 |
| Content BUs 124 / 125 / 229 / 230 | as planned | Seed Arabic for all keys and the terms layer (with forms and gender); all seeded **unchecked** | — | as planned |

### 3.10 Human workload

Arabic review now covers labels, messages, documents and help texts in one queue. Estimate before sharing: 8,000–12,000 entries. With shared terms and texts the target is ≤6,000 unique. Human review stays at about **400–600 reviewer-hours** (H23 in PLAN-V1, near-critical). Two Arabic reviewers from week 3 is the minimum, plus Sharia, finance and legal specialists for tagged entries.
