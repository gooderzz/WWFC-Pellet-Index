# 0003. Store events and derive points

**Status:** Accepted
**Date:** 2026-09-06

## Context

The legacy spreadsheets store one number per player per scoring category per season. That single
design choice causes every problem the app exists to solve:

- No match ever appears anywhere. Three seasons of fixtures, team sheets, goalscorers and votes are
  unrecoverable.
- A player's 14 goals are a number. Which games they came in is lost.
- Totals are typed by hand, and the audit found three rows across three seasons where the goal and
  assist point columns don't reconcile with the recorded counts.
- A rule change cannot be applied retrospectively, because the inputs no longer exist.
- Nobody can be told *why* they scored 11 points.

## Decision

The database records what happened: matches, appearances with position and a `played60`
judgement, and discrete match events ordered by `sequence`. Points are derived from those by
the scoring engine. **Q9 is closed: there are no minutes.** Do not add a `minute` column or a
`PlayingStint` table.

`PelletScore` rows are a materialised derivation, not a source of truth. They store both a total
and a component-by-component breakdown, and they can be discarded and recomputed at any time.

The only exception is the legacy import, which is aggregate-only by necessity. It is stored in a
clearly separate, read-only historical archive and is never mixed with derived scores.

## Consequences

Every number in the app is explainable. "Why 11 points?" gets an itemised answer, which is the
single most requested thing a player wants.

Correcting a mistake three weeks later — a goal that was actually an own goal, a substitution
recorded in the wrong order — recomputes cleanly with no manual arithmetic.

A rule change recomputes the season. Combined with [ADR 0002](0002-versioned-rulesets.md), this is
what lets the club own their own competition.

New derived stats become free. Points per game, form over the last five, on-pitch goals for and
against from event order, home versus away splits — all views over the same events, none
requiring a schema change.

The cost is real: data entry is heavier than ticking a season total. The club accepted that.
`played60` is a human boolean, not a timestamp. Recomputation must feel instant; at twenty
matches and twenty players a season that is not a serious concern.

## Alternatives considered

**Store per-match totals only** — one Pellet score per player per match, entered by hand. Much
lighter to capture and would still give per-match history, which is most of the win. Rejected
because it keeps the arithmetic manual and cannot explain a score, but it is the obvious fallback
if match-day data entry proves too heavy in practice.

**Store both, and let them drift.** Denormalising totals for speed while keeping events. Rejected
for now: at this scale there is no performance argument, and two sources of truth is precisely the
failure mode we are escaping. Caching derived scores is fine; treating them as authoritative is
not.
