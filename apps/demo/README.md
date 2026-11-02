# Takafuly demo (clickable mockup)

Live: **https://takafuly.vercel.app**. The access code is held in the Vercel project's `ACCESS_CODE` setting. After the code, pick any role (admin included).

| Part | Where |
|---|---|
| 14 modules × 4 screens + settings tab | `/m/<id>`; screens in `modules/<id>/screens.tsx`, metadata in `modules/<id>/meta.ts` |
| Questions for the company + module ranking | `/questions` (`content/questions.ts`) |
| Terminology dictionary (edit once → changes everywhere) | `/dictionary` (base text in `content/dict/*.ts`, edits in Neon `dict_override`) |
| Sensitive modules and "try to break it" demos | `/risks` |
| Admin: users, settings overview, demo-data CRUD, change log | `/admin` |
| Presentation deck (16:9; `?print=1` for PDF) | `/deck`; PDFs in `docs/presentation/` |

**Data**
- Invented records are in `data/seed.ts`.
- Settings come from `docs/decisions/data/*.json` (`npm run content`).
- Changes made in the demo are stored in Neon project `takafuly-demo` (Frankfurt): `setting_value`, `question_answer`, `dict_override`, `record_override`, `change_log`.

**Deploy:** Vercel project `takafuly`, root directory `apps/demo`, production deployments from the GitHub branch.

**Refresh deck screenshots:** run the app, take a screenshot of every `/m/<id>?s=<screen>` at 1440×900 in `ar` and `en`, save each as `public/deck/<id>-<screen>-<lang>.jpg`, then print `/deck?print=1` to PDF at 1280×720.
