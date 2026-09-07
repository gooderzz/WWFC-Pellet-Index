# 0002. Scoring rules are versioned data, not code

**Status:** Accepted
**Date:** 2026-09-06

## Context

The Pellet Index scoring rules have changed in every season we have a record of:

- 2023/24 → 2024/25: the drop-out penalty went from −2 to −5, and a penalty shootout block was added
- 2024/25 → 2025/26: goalkeeper assists went from 3 points to 5, and the drop-out rule was
  relabelled "On The Day Drop Out / No Show"

These are not migrations. All three rulesets remain simultaneously valid — 2023/24's totals are
only correct under 2023/24's rules. The club will keep tuning them.

**✅ Resolved (CPO/CTO review, 7 Sep 2026): tuning a ruleset is a small code change for v1, not a
self-service admin UI.** It happens roughly once a year, between seasons, and the ruleset's
canonical form is a checked-in TypeScript file (`schema.md` §Ruleset JSON) precisely so the
engine's own test suite catches a mistake before it ships — a bad hand-typed database edit has no
such safety net. "Without a developer" was the original ambition; the actual v1 answer is one of
the three named Admins (or anyone they ask) opens a small pull request, the engine tests either
pass or catch the error, and it merges. Revisit a self-service editor only if it turns out nobody
with the ability to open a PR is available at the point a season needs new rules — that hasn't
happened in three years of doing this by hand in a spreadsheet, so it's a real but low risk.

**Nice-to-have, not blocking:** a read-only "How points work this season" page, rendered directly
from the active ruleset and reachable from a disclosure link on `/rules` (not a fifth nav tab),
gives the club visibility into what's live without reading a TypeScript file — the actual need
behind "let us edit it ourselves," without the risk of a self-service editor. Candidate for a
Phase 3 stretch item; see [`phases.md`](../../04-roadmap/phases.md).

## Decision

A ruleset is a versioned data record. Each season references exactly one. The scoring engine takes
a ruleset as an explicit input and never reaches for a global or a constant.

No points value appears anywhere in application code. A UI component that needs to know a clean
sheet is worth 8 to a defender reads it from the ruleset.

Historical rulesets are immutable once their season ends.

## Consequences

Recomputing any **live, event-recorded** season (2026/27 onward), at any time, with its own rules,
yields the correct totals. That's the regression test for the entire scoring engine going
forward. **✅ Clarified (Q11, engineering-guide.md §10):** 2023/24–2025/26 are the exception —
those seasons only ever existed as spreadsheet season totals, never match-by-match events, so
there is nothing to "recompute" for them. They're imported as a read-only archive of published
totals instead, and the engine's honesty is proven against unit tests and synthetic golden
matches rather than a legacy replay. This ADR's versioned-ruleset decision still stands; it just
doesn't retroactively make three years of missing match data appear.

Rule changes become a config edit, reviewable as a diff — ✅ corrected: this **does** mean a small
deployment (a PR to a TypeScript file, not a live database edit), which is the right amount of
ceremony for something that happens once a year. See the resolved note above.

The engine has to be written against a general rule shape rather than the specific 2026/27 values,
which is slightly more work up front. The shape also has to be expressive enough for rules we
haven't seen — the conceded bands and the half-value-under-60 clean sheet are already awkward
enough to prove the point.

**Q7 is closed:** rules never change mid-season. A ruleset is immutable from kick-off of match
one. There is no retroactive-recompute-from-date-T workflow.

## Alternatives considered

**Hardcode the current season's values.** Simplest, and wrong within one season. It would also make
importing history impossible, which throws away the only regression test we have.

**One ruleset, with historical seasons stored as pre-computed totals only.** ✅ **This is actually
what we do for 2023/24–2025/26** (Q11) — but for a different reason than "tempting simplicity":
those seasons' match-level data was never recorded, so there's nothing to reconstruct regardless
of how the ruleset is stored. This alternative is rejected only as the model for *live-forward*
seasons (2026/27+), where full event history exists and versioned rulesets let the club tune
values without losing the ability to recompute.

**A scripting language for rules** — letting the club write expressions. Far more flexible, far
more ways to break. The rule space here is small and well understood; a declarative config covers
it. Revisit only if a rule appears that config genuinely cannot express.
