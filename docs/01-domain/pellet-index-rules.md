# The Pellet Index — scoring rules

This is the source of truth for how Pellet Index points are awarded. It is reverse-engineered from
the `Points` tab of the three historical spreadsheets, then cross-checked against the actual season
totals to confirm the arithmetic. Where the sheet is ambiguous, that is called out explicitly and
mirrored in [`../00-product/open-questions.md`](../00-product/open-questions.md).

Rules that differ between seasons are covered in
[`scoring-rule-history.md`](scoring-rule-history.md). The table below is the **2025/26** ruleset
with the confirmed **2026/27** changes layered on top (see "The 2026/27 ruleset" section below) —
2026/27 is the current, live ruleset to build against; there is no 2026/27 spreadsheet, the app
itself is the record going forward.

## Positions

Four position buckets drive almost every rule: `GK`, `DF`, `MD`, `FW`.

## The 2025/26 rule table

| Event | GK | DF | MD | FW | Notes |
| --- | --: | --: | --: | --: | --- |
| Appearance | 1 | 1 | 1 | 1 | Any time on the pitch |
| Played 60 minutes | 1 | 1 | 1 | 1 | Additive on top of the appearance point |
| Def Inf | 1 | 1 | 0 | 0 | See "Def Inf" below |
| Conceded 1 | 0 | 0 | 0 | 0 | |
| Conceded 2 | −1 | −1 | 0 | 0 | Defensive positions only |
| Conceded 3+ | −2 | −2 | 0 | 0 | Defensive positions only |
| Clean sheet | 8 | 8 | 4 | 2 | Full value if 60+ minutes played, **half** otherwise |
| Assist | 5 | 3 | 3 | 3 | GK assists were worth 3 before 2025/26 |
| Goal | 6 | 6 | 5 | 4 | |
| Saves | 1 per 3 saves | — | — | — | Integer division; 5 saves is 1 point |
| Penalty save | 4 | — | — | — | In open play |
| Penalty missed | −2 | −2 | −2 | −2 | In open play |
| Yellow card | −1 | −1 | −1 | −1 | |
| Red card | −3 | −3 | −3 | −3 | |
| Own goal | −2 | −2 | −2 | −2 | |
| On-the-day drop out / no show | −5 | −5 | −5 | −5 | |
| Shootout penalty scored | 1 | 1 | 1 | 1 | Penalty shootouts only |
| Shootout penalty not scored | −1 | −1 | −1 | −1 | Missed or saved |
| Shootout penalty save | 1 per save | — | — | — | |
| Bonus — 1st in the vote | 3 | 3 | 3 | 3 | |
| Bonus — 2nd in the vote | 2 | 2 | 2 | 2 | |
| Bonus — 3rd in the vote | 1 | 1 | 1 | 1 | |

## Things the rule table doesn't tell you

### Position is recorded per appearance, not per player

This is the most important modelling consequence of the whole audit, and it is not stated anywhere
in the sheets. The evidence is arithmetic:

- Ryan Braby scored 2 goals in 2025/26 and earned **9** goal points. No single position produces 9
  from two goals. It is one goal at 4 (FW) plus one at 5 (MD).
- Alfie Shorland is the same: 2 goals, 9 points.
- Tom Heaton has 11 appearances, 4 "Def Inf" points and 1 save point — a midfielder who covered at
  the back four times and went in goal at least once.

So a player's position is an attribute of their appearance in a given match, and the scoring engine
must resolve it per match. Modelling position as a fixed field on the player record would silently
produce wrong totals.

### "Def Inf" ✅ confirmed (open question Q3)

**Not a raw stat.** It's a deliberate flat **+1 point for a GK or DF who plays 60+ minutes**,
added specifically because clean sheets are hard to come by in Sunday league — a
compensation/participation point for defensive positions, not a tackles/interceptions/clearances
count. Rule: `Def Inf = 1 if position ∈ {GK, DF} AND played60, else 0`. The small discrepancies the
audit found in the sheets (e.g. Shim Ratynski's 18 sixty-minute games vs. 17 Def Inf points) are
most likely historical data-entry noise, not evidence of a different underlying rule.

### Clean sheets — changed for 2026/27 (open question Q4)

**✅ Eligibility confirmed (6 Sep 2026): under 60 minutes means zero, not half.** The club's own
words: "under 60 minutes makes you ineligible for any bonuses like Def Inf or clean sheet bonuses,
regardless of whether you kept a clean sheet in the small time frame you were on." So `played60`
is a hard gate — if false, both Def Inf and the clean-sheet bonus are 0, full stop, no partial
credit, and it doesn't matter how many (or few) goals were conceded during that player's actual
time on the pitch. This directly resolves the stacking question below: there's no quarter-credit
case, because under 60 minutes already zeroes it out before the conceded-tier logic is even
reached.

**✅ Settled, not a club-memory question (CPO cross-check, 7 Sep 2026).** This looked like a
binary-vs-half discrepancy between "2026/27 zeroes it, historical seasons might have halved it,"
but it isn't ambiguous at all: `data/legacy/rulesets.csv` — a verbatim extract of the sheets'
own `Points` tab — carries the club's own footnote against `Clean sheet` for **all three**
historical seasons: *"Half value if under 60 minutes."* That's the club's written rule at the
time, not a recollection to re-verify. So the mechanics genuinely changed for 2026/27: 23/24
through 25/26 gave half credit for a clean sheet kept in under 60 minutes on the pitch; 26/27
zeroes it instead. Both are already correctly encoded — see `cleanSheetHalfIfUnder60` in
[`scoring-rule-history.md`](./scoring-rule-history.md). This is moot for the live engine either
way, because legacy seasons import as published totals rather than being recomputed from events.
(An earlier draft of this section cited a specific in-sheet example — a sub scoring 4 as a
defender for a partial clean sheet — as supporting evidence. That example couldn't have existed:
the legacy sheets hold season *totals*, not per-match records, per
[`legacy-spreadsheets.md`](./legacy-spreadsheets.md). It's removed; the footnote above is the
real evidence.)

**✅ Fully resolved (6 Sep 2026): on-pitch only, not the whole match.** "Goals conceded while on"
means goals conceded during that specific player's own time on the pitch — not the final scoreline.
The club's example: a defender subbed off at 61 minutes in a 0–0 game **keeps the full clean-sheet
bonus** even if the team concedes at 85 minutes, because they weren't on the pitch for it. Q4 is
now completely closed.

**Modelling consequence:** the engine needs to know, for each opposition goal, whether it happened
before or after a given player's substitution — not just the final scoreline. Approximate
sequencing (the plan from Q9) is enough for this; an exact minute is not required. This ordering
lives on `substitution` `match_events`, not a per-appearance field — see
[`schema.md`](../02-architecture/schema.md).

### Conceded ✅ confirmed (open question Q4)

Counted on-pitch only, same as clean sheets above (see the resolution note). The point values are
confirmed: 0 or 1 conceded is free, 2 costs a point, 3+ costs two — **confirmed deliberately capped
at −2**, so a heavy defeat never costs a defender/keeper more than their Def Inf point is worth, no
matter how heavy the scoreline.

### Bonus points ✅ confirmed (open question Q5)

Three, two and one point to the top three players in a post-match team vote. **Confirmed:** the
vote is **verbal, in person, at the pub after the match**, among whoever stays for a pint — not a
WhatsApp poll or a whole-squad ballot. **Self-voting is allowed.**

**Who can receive vs. who can vote (confirmed 6 Sep 2026):** anyone who **played** in the match can
be voted for and receive the 3/2/1, whether or not they went to the pub. Only the people physically
**at the pub** get a vote — no minimum or maximum headcount; the club's own description is "sometimes
3-4 people, sometimes up to 10." There's no formal quorum or ballot process to model — it really is
just a show-of-hands/verbal count among whoever's there that evening.

There's no digital ballot and no record of individual votes, only the resolved 1st/2nd/3rd — which
is exactly what the sheets capture too (season totals only, no per-match ballot history), so this
doesn't change the import story. Still open, and low-stakes given the above: tie-breaking when
players finish level in an informal head-count (the club's framing suggests this is resolved
socially in the moment, not by a rule the app needs to encode).

### Assists ✅ confirmed (open question Q17)

Informal group consensus on who gets it, with the Captain and/or Manager making the final call if
there's disagreement — there's no stricter definition (last touch, key pass, etc.) than "who the
team agrees set it up." **A goal has 0 or 1 assist, never two.** The engine/UI should enforce at
most one assist per goal event — there's no case where two players split credit.

### Saves ✅ confirmed (open question Q18)

The goalkeeper self-reports a single number of saves after the match, agreed with whoever's
recording it (Captain/Manager/Admin). No individual save events, just a count per appearance —
exactly how the legacy sheets already did it. In practice the number is usually small (the club's
own estimate: "mostly always 3 saves") and the keeper will always report *something*, so treat a
missing save count as a genuine data gap to chase up, not as "0 saves."

### Cards ✅ confirmed (open question Q19c)

A second yellow card converts directly into a red — it's **just −3**, not −1 (for the yellow) and
−3 (for the red) stacked. Model a second-bookable dismissal as a single red-card event, not two
events.

### Rule changes mid-season ✅ confirmed (open question Q7)

**Rules never change mid-season.** A `Ruleset` is locked in for the entirety of a season once it
starts — there is no in-season tweak-and-recompute workflow to support. This removes a whole
category of engine complexity: a season's ruleset can be treated as immutable from kickoff of
matchday 1 onward, and "which ruleset applied on this date" is never ambiguous.

### Position per match — who decides ✅ confirmed

The Captain and Manager decide and know each player's position for a given match — sometimes
before kick-off, sometimes only clear afterwards — and there's no independent record of it beyond
their own knowledge. This confirms the "position is per-appearance, not per-player" modelling
conclusion above, and means whoever enters the match (Captain/Manager/Admin) is the source for
position — there's nothing else to reconcile it against.

## The 2026/27 ruleset (current, confirmed)

Frozen from 2025/26 — including the goalkeeper assist value of 5 (confirmed deliberate) — with
**one change to the numbers below, plus one confirmed eligibility gate**, both confirmed by the
club on 6 September 2026:

**Step 1 — the 60-minute gate (confirmed, applies before anything else):** `played60 == false` →
Def Inf = 0 and clean-sheet bonus = 0. Stop here; the table below never applies. (See the flag in
"Clean sheets" above — this reads stricter than the historical spreadsheet pattern, worth
re-verifying before assuming it always worked this way.)

**Step 2 — if `played60 == true`, apply the conceded tier, counting only goals conceded during
that player's own time on the pitch** (confirmed — see "Clean sheets" above, this is not the
whole-match scoreline):

| Goals conceded while on | 2025/26 and earlier | **2026/27** |
| --- | --- | --- |
| 0 | Full clean-sheet credit (8/8/4/2 by position) | Unchanged — full credit |
| 1 | **Zero** — any goal conceded wiped out the clean sheet entirely | **Half credit (new)** |
| 2+ | Zero | Unchanged — zero |

Everything else in the rule table above — appearance, Def Inf's position/minutes gate, the
conceded penalty bands, assists (max one per goal), goals, saves (self-reported), penalties, cards,
own goals, the on-the-day drop-out penalty, the shootout block, and the 3/2/1 bonus — carries over
unchanged into 2026/27. **The `Kit` point (see below) does not carry over — it's discontinued.**

## Derived columns in the sheets

| Column | Definition | Confidence |
| --- | --- | --- |
| `Total` | Sum of all point columns — **plus the `Kit` column in 2025/26 only** | Confirmed |
| `PPG` | `Total ÷ Appearances`. Introduced in 2025/26 | Confirmed |
| `FPL` | `round(Total × 1.3)` in 24/25 and 25/26; `× 1.5` in 23/24 | ✅ Purpose confirmed — see below, non-MVP |
| `FPL comparison` | Reads "Coming Soon" for every player in all three seasons | ✅ Confirmed intent — see below, never built, non-MVP |

### `FPL` and `FPL comparison` ✅ confirmed (open questions Q6/Q20), explicitly non-MVP

Not a multiplier despite the formula shape. The real intent: figure out which actual Fantasy
Premier League player, in the same position, would have a similar FPL points total for that
season — scaled up from the club's ~20-game season to FPL's 38-game season, hence the ×1.3/×1.5
factor. `FPL comparison` was presumably meant to name that comparable real player and never got
built. **Confirmed explicitly non-MVP** — leave both columns out of the initial build; they're fun,
not core to the competition.

### `Kit` ✅ confirmed — not a bug, a real (now-retired) rule (open question Q26)

`Kit` is a small integer, 1 to 4, and it's **a deliberate +1 point for whoever washed the club kit
that week** — added to spread the chore around rather than letting it always fall on the same one
or two people. In the 2025/26 sheet the `Total` formula sums the point columns **and `Kit`**, so
every player's published 2025/26 score legitimately included their kit-washing points that season.

Shane Livingstone's point columns sum to 125; his kit number is 2; the sheet reports 127 (125 +
2). Robert Reynolds is 96 + 2 = 98. Lukman Ipese is 89 + 1 = 90. Will Goodwin is 85 + 1 = 86. It
holds for every row. The 2023/24 and 2024/25 sheets don't do this — either the rule didn't exist
yet, or it just wasn't folded into `Total` those seasons.

**Confirmed discontinued for 2026/27** — kit washing will be assigned by drawing from a hat
instead, with no points attached. The live 26/27 ruleset has no `Kit` line at all.

**What this means for the historical import:** since this turned out to be a real rule for that
one season rather than a spreadsheet error, the published 2025/26 figures are **the accurate
historical record as the club's own rules actually paid out that season** — there's no longer a
strong case for "correcting" them down to 125/96/89 etc. Worth a quick sanity check with the club
during the import phase, but the default should now be **keep the published figures as-is**.

## A trap worth repeating

**Every numeric column in the `Pellet Index` tab holds points, not event counts.** Shane
Livingstone's "Goals" cell reads `56`; he scored 14 goals as a forward, at 4 points each. The
`WWFC Stats` tab is the only place raw goal and assist counts are recorded. Reading the main tab as
counts will inflate everything by a factor of four to six.

## Verification

The rule table above reproduces the published 2025/26 totals. Spot checks:

| Player | Check | Result |
| --- | --- | --- |
| Shane Livingstone | 14 goals × 4 (FW) | 56 = sheet value |
| Robert Reynolds | 6 assists × 3, 5 goals × 5 (MD) | 18 and 25 = sheet values |
| Tom King | 1 assist × 5 (GK), 12 saves ÷ 3 | 5 and 4 = sheet values |
| Will Goodwin | 4 clean sheets × 8 (GK), 36 saves ÷ 3 | 32 and 12 = sheet values |
| Ollie Wyatt | 1 app + 1 sixty + 1 Def Inf − 2 conceded | 1 = sheet total |

Any scoring engine we build must pass every spot-check in the table above — i.e. apply each
season's own ruleset correctly to a known input and get the published per-category point value
out — before it's trusted with a live season. ✅ **Clarified (engineering-guide.md §10):** this
means unit tests against these category-level formulas plus importing each season's *published
totals* unchanged, including the 2025/26 `Kit` points (a real, if now-retired, rule — not an error
to correct out). It does **not** mean replaying full historical matches; those events were never
recorded and can't be reconstructed. Live match-by-match recomputation starts with 2026/27.

## Things the engine must not do

- **Do not import Fantasy Premier League's own rules.** The Pellet Index is FPL-*shaped* — position
  splits, a 60-minute threshold, 3/2/1 bonus — but the numbers are the club's own. There is no BPS,
  no price, no squad budget, and `Def Inf` is a flat one-point line, not FPL's defensive
  contribution metric.
- **Do not add a `Kit` line to the 2026/27 (or later) ruleset.** It's confirmed retired — kit
  washing is now decided by drawing from a hat, with no points attached. It only ever applied to
  2025/26, and it was a real rule there, not a bug to strip out during import.
- **Do not treat a blank cell as unknown.** In the sheets, empty means zero.
- **Do not apply an old season's values to a new one.** The 23/24 drop-out of −2 and its ×1.5 FPL
  multiplier are history.
- **Do not let rules change mid-season.** Confirmed: a ruleset is locked for the entire season once
  it starts. No in-season tweak-and-recompute workflow exists or is wanted.
- **Do not allow more than one assist per goal.** Confirmed 0 or 1, never split between players.
- **Do not stack a second-yellow's −1 with the resulting red's −3.** It's just −3.
- **Do not treat clean sheet as binary any more.** 2026/27 has three tiers (0/1/2+ conceded while
  on) — see "The 2026/27 ruleset" above. Don't apply this retroactively to 2025/26 or earlier,
  which stays binary (any goal conceded = zero credit).
- **Do not require exact minutes.** Confirmed: this club will only ever produce a rough
  chronological order of events and substitutions, never a stopwatch-accurate minute — for their
  own goals, the opposition's, cards, anything. Design `Appearance` and `MatchEvent` around
  ordering/sequencing, not a `minute: integer` field.
