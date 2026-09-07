# Legacy spreadsheet audit

What is actually in the three Google Sheets, what can be migrated, and what is gone forever.
Verbatim extracts are checked into [`../../data/legacy/`](../../data/legacy/).

## The files

| Season | Title | Drive ID | Owner | Last modified |
| --- | --- | --- | --- | --- |
| 2025/26 | Pellet Index 25/26 | `1NhAiCEbw56JoJD1as0IuBC8weFemIRAsD9EsoxCSpnU` | tdheaton98@gmail.com | 17 Jul 2026 |
| 2024/25 | Pellet Index 24/25 | `1cUwCN0lkeBS-T9lE5jqg4yTyLD6dtsQt9QHY17wz0xs` | tdheaton98@gmail.com | 14 May 2025 |
| 2023/24 | Pellet Index 23/24 | `1epG5-pp1t5uHm_yXoBHTXloAqGDlfqu5XjPwPxUMnaU` | shane.livingstone@justeattakeaway.com | 12 May 2025 |

There is **no 2026/27 sheet**. The new season has just kicked off, which means the app is
being built into a real gap rather than replacing something already in flight — good timing, and
worth confirming (open question **Q1**).

## Structure

Each workbook has exactly three tabs, and the shape is identical across seasons:

**`Pellet Index`** — one row per player, one column per scoring category, plus `Total`, `FPL`, and
some admin columns (`Subs balance`, `Yearly Subs`, `Kit`, `FPL comparison`). 2025/26 adds `PPG`.
Row counts: 51 players in 23/24, 41 plus 10 blank filler rows in 24/25, 36 in 25/26.

**`WWFC Stats`** — `Name`, `Goals`, `Assists`, `G+A`. The only place raw event counts live.

**`Points`** — the scoring rules for that season, as a grid of event × position.

## What migrates cleanly

- **The rules.** All three rulesets are fully recoverable and are captured in
  [`scoring-rule-history.md`](scoring-rule-history.md) and `data/legacy/rulesets.csv`.
- **Season totals per player.** Useful as an all-time honours board and as the regression target
  for the scoring engine.
- **Raw goals and assists per player per season.** From the `WWFC Stats` tab.
- **A roster of everyone who has ever played** — roughly 100 distinct names across three seasons,
  after deduplication.

## What is gone

This is the important part, and it defines the value of the app.

- **Every per-match record.** No fixtures, no opponents, no dates, no scorelines, no team sheets.
  Three seasons of results exist only in members' memories and on FA Full-Time.
- **Who scored when.** A player's 14 goals are a single number; which match each came in is lost.
- **All voting history.** Bonus totals survive; who voted, who they voted for, and which match each
  bonus point came from do not.
- **Minutes.** There is an "over/under 60 minutes" flag implicit in the columns and nothing finer,
  so on-pitch goals for and against — a thing the club explicitly wants — cannot be backfilled.
- **Starters versus substitutes.** Not recorded anywhere.

Backfilling per-match history for past seasons would mean a manual reconstruction effort against
FA Full-Time results plus people's recollections. It is possible for scorelines and dates; it is
not realistically possible for team sheets and goal times. Recommendation: import the aggregates
as a read-only historical archive, and start capturing full detail from 2026/27 forward. See open
question **Q11**.

## Data-quality issues

### Player identity is the biggest one

There is no player ID. Rows are keyed on a free-text name typed afresh each season, so the same
person appears under different names:

| Same person, probably | Appears as |
| --- | --- |
| Vlad Tymoshenko | `Volodymur Tymoshenko` (23/24), `Vlad Tymoshenko` (24/25, 25/26) |
| Lukman Ipese | `Lukman` (23/24), `Lukman Ipese` (24/25, 25/26) |
| Mike Bayala-Addy | `Mike Bayala-Addy` (23/24), `Mike Addy` (24/25) |
| Alex Hemmingway | `Alex Hemmingway` (23/24, 24/25), `Alex Hemingway` (25/26) |
| Lewis Spiers | `Lewis Speirs` (23/24), `Lewis Spiers` (24/25) |
| David Jennings | `David J` (24/25), `David Jennings` (25/26); note a separate `David Jones` in 24/25 |
| Bailey ? | `Bailey Flynn` in the 25/26 index tab, `Bailey Grant` in the 25/26 stats tab and all of 24/25 |
| Emil Snow | `Emil Snow` in index tabs, `Emil` in the 24/25 stats tab |

Plus placeholders for guests and trialists: `Taras GK`, `Tom FB`, `Hugo Boss`, `Laurie`, `Ed`,
`Alek`, `Enzo`, `Miquel`, `Iliass`, `Allen`, `Timoeto`, `Ackeem`, `Gilbert M`.

Any import needs a human-reviewed name-mapping table. This is open question **Q12** — the club
needs to confirm which of the above are genuinely the same person.

### Arithmetic that doesn't reconcile

Cross-checking the `Goals` and `Assist` point columns against the raw counts in `WWFC Stats`
resolves cleanly for almost every player, which is what let us confirm the per-match position
finding. Three rows don't:

| Season | Player | Issue |
| --- | --- | --- |
| 2023/24 | Volodymur Tymoshenko | 10 goal points, 1 goal recorded. No position yields 10 from 1 |
| 2024/25 | Emil Snow | 10 goal points, 1 goal recorded |
| 2024/25 | Nii Bannerman | 6 assist points, 1 assist recorded |

Most likely the stats tab is under-recorded rather than the index tab being wrong, since the index
tab is the one people care about. Either way these are manual-entry drift, and they are exactly the
class of error that disappears once points are derived from events.

### Smaller things

- 2023/24 `Will Bitar` has `-1` in the `C/Sheet` column where `Conceded` was surely meant. The row
  total is unaffected.
- 2023/24 `Axel Ohoue` has `-30.00` in the `Yearly Subs` column, which elsewhere holds
  `Paid` / `Not Paid` / `NA`.
- 2023/24 `Will Goodwin` appears twice in the `WWFC Stats` tab.
- 2024/25 carries ten empty rows that still compute `Total 0` / `FPL 0`.
- `FPL comparison` reads "Coming Soon" for every player in every season. A feature that was
  intended and never built — possibly the same itch that led to this project.

## Squad churn

Worth noting for the product design: turnover is heavy. 51 names in 23/24, 41 in 24/25, 36 in
25/26, and only a handful appear in all three. Shane Livingstone, Matt Garner, Seb Gonzalez,
Tom Heaton, Mason Ferris, Jonas Skattum, Seamus Stokoe, Nii Bannerman, Ollie Wyatt, Adam Cowland,
Lukman Ipese and Emil Snow are the continuous core. A long tail plays once or twice and never
returns.

That has design consequences: onboarding a new player has to be near-frictionless, the leaderboard
needs an appearance threshold or a per-game view to stay meaningful, and "guest" needs to be a
first-class player status rather than a hack.
