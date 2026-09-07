# 0007. Index movement via snapshots on finalise

**Status:** Accepted
**Date:** 2026-09-07

## Context

Design needs week-on-week movement arrows on The Index (`ScoreDelta`). That requires knowing
each player's rank **before** the latest published match. Handoff item **D5** left the choice to
engineering: cheap historical snapshot vs recompute the table as-at a prior date.

Recompute-as-at is possible (sum `pellet_scores` for matches with `kick_off_at <= T` and
`recording_status in (final, corrected)`), but it is work on every page load and it is wrong
the moment someone corrects an older match: "the table as of 3 March" would move under you.

Twenty matches a season. Snapshots are tiny.

## Decision

**Snapshot on each publish.** When a match becomes `final`, and again if it becomes
`corrected`, write one `index_snapshots` row per player in that season (rank, total,
appearances, `match_id`).

Movement on `/` = current rank minus rank in the previous snapshot for that season. No previous
snapshot → no arrows (first finalised match of the year).

**✅ Clarified (CPO review, 7 Sep 2026) — "current rank" is the live table, which can include an
`awaiting_votes` match's points.** Per `schema.md`, a match sits fully on the public Index from
`awaiting_votes` onward — only the bonus is missing, and non-bonus points count immediately. So
"current" here means the live standings computed straight from `pellet_scores` right now
(including any in-progress `awaiting_votes` match), while "previous snapshot" stays anchored to
the last `final`/`corrected` publish, exactly as above. In practice this means a played-but-not-
yet-bonused match can nudge an arrow before the bonus is added and the next snapshot fires — that
self-corrects the moment the 3-2-1 lands, and is the intended behaviour, not a bug to guard
against.

Do not recompute "the table as of date T" on page load. Do not store movement on the player
row.

Correcting an old match writes a **new** snapshot tied to that match. Arrows then mean "versus
the previous publish", which is the honest pub question, not a time-travel rank.

## Consequences

Design can show movement **only after at least two matches are final**. That is the answer D5
asked for. First week of the season: ranks, no arrows.

A mid-season correction can reshuffle arrows. That is correct: the Index is the published
table, not a frozen newspaper. **✅ Refined (CTO review, 7 Sep 2026):** so nobody's confused why
their arrow moved with no new match, the Index should show a small, dismissible note when the
most recent snapshot came from a correction rather than a new result — e.g. "Recalculated: the
[opponent] match on [date] was corrected." This is copy/UI, not a schema change; it just reads
`index_snapshots` for a row whose `match_id` points at a `recording_status = corrected` match
newer than the viewer's last visit.

Storage is negligible. The snapshot is not a source of truth for points — `pellet_scores` is —
it is a source of truth for *what we showed the last time we published*.

## Alternatives considered

**Recompute as-at prior kick-off on every request.** Accurate time travel, more code, and
confusing when history is edited. Rejected for v1.

**Store only the previous rank on `season_players`.** One column, lost history, races if two
admins finalise. Rejected.

**No movement in v1.** Would unblock the Index, but the component is already specified. Snapshots
are cheaper than arguing.
