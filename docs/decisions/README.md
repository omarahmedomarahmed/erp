# Decision workbook (كراسة القرارات)

Arabic workbook for Takaful Insurance Company. It covers 20 modules (the 12 from the technical proposal, plus HR, payroll, platform-wide items, the terminology dictionary, reserves and solvency, and contract/go-live). For each module it lists the rules the system will apply, what is deferred, and **252 decisions** with options, our recommendation, owners and a needed-by day.

- Published page: https://claude.ai/artifact/6UHTg1pkn4eux3ccXYZyZq (answers are saved in the page's shared store, collection `answers`, one document per decision id)
- Source data: `data/*.json` (format: `SCHEMA.md`)
- Rebuild: `python3 -I docs/decisions/build_workbook.py . docs/decisions/workbook-template.html docs/decisions/decision-workbook.html`

To let client staff record answers, invite them by email as **Editors** from the page's Share menu, and do not also share it by public link. Viewers can still choose answers, but those are saved only in their own browser; the "copy summary" button gives them a text summary to send back.
