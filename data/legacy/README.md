# Legacy data extracts

Verbatim extracts from the three historical Pellet Index Google Sheets, checked in so that the
project has a stable, diffable copy of the source data that does not depend on Drive access.

**These are reference material, not application seed data.** Do not import them directly. The
values are *season totals in points*, not events, so they cannot reconstruct a match history. Their
job is to serve as the regression target: once a scoring engine and a real match history exist,
recomputing each season must reproduce these totals.

## Files

| File | Source tab | Contents |
| --- | --- | --- |
| `pellet-index-2023-24.csv` | Pellet Index | Season point totals per player |
| `pellet-index-2024-25.csv` | Pellet Index | Season point totals per player |
| `pellet-index-2025-26.csv` | Pellet Index | Season point totals per player |
| `goals-assists-2023-24.csv` | WWFC Stats | Raw goal and assist counts |
| `goals-assists-2024-25.csv` | WWFC Stats | Raw goal and assist counts |
| `goals-assists-2025-26.csv` | WWFC Stats | Raw goal and assist counts |
| `rulesets.csv` | Points | Scoring rules for all three seasons, side by side |

## Column meanings

Every numeric column in the `pellet-index-*.csv` files is **points**, except `Appearance` and
`60 mins`, which happen to equal counts because each is worth exactly 1 point. `Saves` is
`floor(saves ÷ 3)`. `Total` is the row sum. `FPL` is `Total` scaled (×1.5 in 23/24, ×1.3 after).

The `goals-assists-*.csv` files are the only place raw event counts appear.

## Known data-quality issues

Recorded here so nobody rediscovers them during import. See
[`../../docs/01-domain/legacy-spreadsheets.md`](../../docs/01-domain/legacy-spreadsheets.md) for
the full audit.

- **Name drift.** The same person appears as `Volodymur Tymoshenko` (23/24) and `Vlad Tymoshenko`
  (25/26); `Lukman` and `Lukman Ipese`; `Mike Addy` and `Mike Bayala-Addy`; `Alex Hemingway` and
  `Alex Hemmingway`; `Lewis Speirs` and `Lewis Spiers`; `David J` and `David Jennings`.
- **Two different Baileys, or one?** 25/26 lists `Bailey Flynn` in the main tab and `Bailey Grant`
  in the stats tab, with matching goal figures. 24/25 has `Bailey Grant` only.
- **Placeholder names.** `Taras GK`, `Tom FB`, `Hugo Boss`, `Laurie`, `Ed`, `Alek`, `Enzo`,
  `Miquel`, `Iliass`, `Allen`, `Timoeto`, `Ackeem` — guests and trialists recorded loosely.
- **Duplicate rows.** `Will Goodwin` appears twice in the 23/24 stats tab.
- **Arithmetic that doesn't reconcile.** 23/24 `Volodymur Tymoshenko` has 10 goal points against 1
  recorded goal. 24/25 `Emil Snow` has 10 goal points against 1 recorded goal, and
  `Nii Bannerman` has 6 assist points against 1 recorded assist.
- **Misplaced value.** 23/24 `Will Bitar` has `-1` in the `C/Sheet` column where it should almost
  certainly be `Conceded`. The row total is still correct.
- **Empty filler rows.** 24/25 has ten blank rows carrying `Total 0` and `FPL 0`.
