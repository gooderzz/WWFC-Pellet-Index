# Product brief

**Status: mostly superseded — kept for the problem statement and tone, not the scope list.**
This was the first pass, written before the club closed the planning questions. Several bullets
below were overtaken by later, club-confirmed decisions and have been corrected in place
(marked ✅). For anything not marked, the current source of truth is
[`AGENTS.md`](../../AGENTS.md) → [`open-questions.md`](open-questions.md) →
[`pellet-index-rules.md`](../01-domain/pellet-index-rules.md) →
[`engineering-guide.md`](../02-architecture/engineering-guide.md) →
[`DESIGN.md`](../05-design/DESIGN.md), in that order. If this doc and any of those disagree,
this doc is wrong.

## The one-line version

An app that runs the Pellet Index and records the season for Westminster Wanderers FC, replacing
**three seasons** of Google Sheets with something that can answer "why did I get 11 points on
Sunday?" (✅ corrected, CPO review 7 Sep 2026 — the original draft said "four years"; the club has
three complete legacy seasons on record: 2023/24, 2024/25, 2025/26.)

## The problem

The Pellet Index has run on a spreadsheet since 2023/24. The spreadsheet works — the club has three
complete seasons of it — but it has hit its ceiling in ways that are now obvious:

**It stores answers, not workings.** Every cell is a season total in points. Nobody can look up a
single match. Three seasons of fixtures, results, team sheets, goalscorers and votes exist nowhere
but in people's memories and on a league website. When someone asks how a player did in a specific
game, there is no answer.

**Someone has to do the arithmetic.** Points are typed in by hand, which is both a chore and a
source of error. The audit found three rows across three seasons where the goal and assist point
columns don't reconcile with the recorded counts.

**Identity is a free-text field.** The same player is `Volodymur Tymoshenko` one season and
`Vlad Tymoshenko` the next, so nobody can see a career total or compare a player's seasons.

**Nothing is live.** The Pellet Index is a competition. Competitions are more fun when you can see
the table move on a Sunday evening rather than whenever someone gets round to updating a sheet.

**The bonus has no home.** Bonus points are the most social part of the whole thing, and the sheet
records only a season total — there's no way to see which match a given bonus came from. ✅
**Corrected (CPO review, 7 Sep 2026):** the fix here is attributing a bonus to its match, not
capturing *who voted or who they voted for* — the vote stays verbal and informal at the pub,
deliberately; the app never records individual votes, only the certified 3rd/2nd/1st result.

The club is playing the 2026/27 season in the SSFL Premier Division. ✅ **Corrected (CPO review,
7 Sep 2026):** the original draft above implied a fresh promotion into the Premier Division; the
club has actually played there before, in both 2023/24 and 2025/26 (see
[`club-and-season-history.md`](../03-research/club-and-season-history.md)) — this season isn't a
first step up a division, just the current one.

## What success looks like

A player opens the app on their phone on Sunday evening, sees the result, sees their own points
broken down line by line, and sees where they sit in the table. Nobody opens a spreadsheet. The
person who currently maintains it gets their evening back.

**✅ Corrected (Q5, 6 Sep 2026):** the original draft above imagined the bonus vote itself
happening in-app ("casts their three votes"). It doesn't — the vote is verbal, at the pub, after
the match, exactly like it's always been. The app's job is to record the **certified result**
(who got 3rd/2nd/1st) after the fact, not to run a ballot. See
[`pellet-index-rules.md`](../01-domain/pellet-index-rules.md).

## Principles

**Events in, points out.** Record what happened; derive everything else. This is the fix for every
problem listed above, and it is non-negotiable.

**The rules are data.** They have changed in every season on record. They will change again. A
rule change must be a config edit that recomputes the season, not a code change.

**Reproduce the past honestly, not literally.** ✅ **Corrected:** the original draft imagined the
engine "recomputing" 2023/24–2025/26 match by match — but those seasons only ever existed as
spreadsheet season totals; the underlying matches, team sheets and goal-by-goal events were never
recorded, so there is nothing to replay. The real trust test is threefold: (1) the engine passes a
unit test for every rule line in each season's ruleset, (2) it scores a handful of hand-built
synthetic matches correctly, and (3) the three legacy seasons' *published point totals* import
unchanged, byte for byte, as a read-only archive. See
[`engineering-guide.md`](../02-architecture/engineering-guide.md) §10 ("Historical proof
(honest)") and [`schema.md`](../02-architecture/schema.md). Only 2026/27 onward gets full
event-level detail and a genuine season recompute.

**Sunday morning, bad signal, one hand.** The person entering a substitution is standing on a
touchline in the rain. Design for that, not for a desk.

**Fun over completeness.** This is a Sunday league side, not a data platform. If a feature doesn't
make someone want to open the app, it can wait.

## In scope for v1

- Fixtures and results for the current season — **league and cup only** (✅ corrected, Q23:
  friendlies and tour games don't count toward the Pellet Index; whether they still appear as
  bare fixture history is a separate, small product call — see `open-questions.md`)
- Team sheets: who started, who came on, who came off, and in **what rough order** — ✅
  corrected: never "when." There is no minute field anywhere in this product; see Q9 in
  [`open-questions.md`](open-questions.md) and [`pellet-index-rules.md`](../01-domain/pellet-index-rules.md)
- Per-match player stats: goals, assists, cards, own goals, penalties, saves, shootouts
- The Pellet Index engine, driven by a versioned per-season ruleset
- **Match fee tracking** — ✅ moved in from "out of scope" below (Q10, new scope, confirmed
  6 Sep 2026): £12 for 60+ minutes played, £6 for less, simple paid/unpaid ledger
- The certified bonus result: after the verbal pub vote, an Admin enters who got 3rd/2nd/1st —
  not an in-app ballot (✅ corrected above)
- Season leaderboard, per-player pages, per-match points breakdowns
- On-pitch goals for and against per player
- Historical archive: the three legacy seasons as read-only **totals** (not reconstructed
  matches — ✅ corrected above)

## Explicitly out of scope for v1

- Availability and squad selection — the club already uses **Stack** for this (Q34); don't
  build a competing feature
- The club's other teams (though `Team` is a first-class entity from day one so this is cheap
  to lift later — Q2)
- Training sessions
- Automated FA Full-Time scraping — **permanently** out of scope, not just v1 (Q13, confirmed:
  manual entry only)
- AI-generated match reports
- Per-person admin accounts, magic links, or any login beyond the two shared passphrases (Q16/Q24)
- An admin-facing ruleset editor — next season's rules are a small code change, not a UI (CPO/CTO
  call, 7 Sep 2026)

## Tone

This is a named, slightly silly internal competition run by a real Sunday side, and that is the
best thing about it. Keep the name. Keep the player names. Keep the vote and the arguments it
causes. The failure mode to avoid is sanding it down into a generic club admin platform — there are
already several of those, and none of them are fun.

## Deliberately deferred, but worth wanting

A shareable per-player season card. A cumulative "race" chart of the season. An end-of-season
awards deck generated from the data. Head-to-head records against opponents. Career totals across
seasons. All cheap once the data model is right, all pointless before it.
