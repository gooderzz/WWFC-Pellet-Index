# Domain model (draft)

A first pass at the entities, now backed by a physical schema in
[`../02-architecture/schema.md`](../02-architecture/schema.md). If the two disagree, the schema
file wins for columns; this file wins for *why the entity exists*.

## Guiding principle

**Store events, derive points.** The spreadsheets store the derived totals and nothing else, which
is why nobody can answer "how did Bailey do in the away game at Cosmos?" or "who has the best
points-per-90 since Christmas?". If the app records the events that happened, every number in the
Pellet Index becomes a view over them, recomputable when a rule changes or when someone realises
the goal was actually an own goal.

## Entities

### Club and squad

**`Club`** — us, and every opponent. `name`, `shortName`, `faFullTimeTeamId`, `isUs`.
Opponents get a record so we can show head-to-head history.

**`Team`** — a squad within a club, e.g. "1st Team". **Confirmed (6 Sep 2026, open question Q2):
model this as a first-class entity now even though only one row exists** — the club runs four
teams and may want the Pellet Index to cover more of them later if this app proves itself. Every
`Season`, `Match`, `SeasonPlayer` etc. below is scoped to a `Team`, not implicitly singular. Don't
build multi-team UI yet; do make sure adding a second `Team` row later doesn't require a schema
change.

**`Season`** — `teamId`, `label` ("2026/27"), `startsOn`, `endsOn`, `rulesetId`, `isCurrent`.

**`Player`** — `displayName`, `knownAs`, `defaultPosition`, `squadNumber`, `status`
(active / injured / former / guest), `joinedOn`. Deliberately *not* a single fixed position; the
default is a UI convenience for pre-filling a team sheet.

No dates of birth. The club keeps a separate `WWFC | DOBs` file in Drive; that is personal data
with no role in a performance tracker and it stays out of this system.

**`PlayerAlias`** — maps a source spelling (`Volodymur`, `Tom FB`, `Bailey Grant`) onto a player.
Populated only after a human confirms the match; never auto-merged on string similarity. Without
this the legacy import cannot produce career totals.

**`SeasonPlayer`** — a player's registration in a season, so squads and eligibility are
season-scoped and a player who leaves and comes back keeps one identity.

### Roles and auth ✅ simplified and confirmed (open questions Q15/Q16, 6 Sep 2026)

**Only two auth tiers exist, not four.** Confirmed by the club: "we don't need auth for players,
just for the role of admin/manager/captain... maybe it's just 2 roles, viewer/player and then admin
privilege which we can give a few people." This is a materially simpler model than the four-role
table drafted earlier:

| Tier | Who | Needs an account? |
| --- | --- | --- |
| **Viewer/Player** | Everyone — the whole squad, opposition, anyone with the link | **No.** Open access, no login. This is the default for the whole app |
| **Admin** | A small, extensible set of named people — Shane Livingstone, Tom Heaton, William Goodwin to start, more can be granted later | **Knows the Admin passphrase** — no login, account, or per-person credential, just a shared secret that unlocks write access |

There is no distinct "Manager" vs. "Captain" vs. "System Admin" permission split for v1 — Shane,
Tom and William are just three named holders of the one **Admin** grant, with no need to model
different capabilities between them (e.g. only Admin can touch the ruleset — Manager/Captain
don't get a lesser write tier). Admin is a **grant**, not a fixed headcount — the club explicitly
wants to be able to add more admins later without a new role being invented; growing it is just
telling one more person the passphrase, no invite flow or new database row required.

With auth resolved as a shared passphrase rather than per-person accounts (see below), there's no
`User` or `AdminGrant` table at all — "who currently knows the Admin passphrase" is tracked
informally by the club, not in the schema.

**✅ Locked in (6 Sep 2026, Q16/Q24): two shared passphrases, no accounts at all.** Not magic link,
not per-person, not email-based:

- **Viewer/Player passphrase** — one simple, easy-to-remember shared secret (or the app could just
  be fully public; the club explicitly doesn't mind either way). Gates nothing important, just a
  light deterrent.
- **Admin passphrase** — a second, slightly longer but still-memorable shared secret, known only
  to the small Admin group (Shane, Tom, William to start, more later). Knowing it is what grants
  write access — there's no per-person login, invite flow, or admin table with individual
  credentials to manage.

This is about as simple as auth gets: two constants (probably environment variables plus a cookie
set on successful entry), no user table, no session-per-person, no password reset flow, no email
provider. **Accepted trade-off:** there's no built-in way to know *which* Admin made a given edit —
if that ever matters, add a free-text "entered by" field on the match/edit itself rather than
building real per-person auth.

In practice Tom and Shane will be the primary day-to-day data-enterers, from their phones at the
pub right after a match — this should shape "log a match" UX priorities more than anything else
in this document.

<details>
<summary>Superseded: the earlier four-role draft (Manager/Captain/System Admin/Player-Viewer)</summary>

An earlier pass modelled four distinct roles with different permissions. The club's clarification
above replaces that: it's genuinely just Admin-or-not. Kept here only so the reasoning isn't lost —
don't build a four-tier permission system.

</details>

### Fixtures

**`Competition`** — `name`, `type` (league / cup), `seasonId`. **✅ Confirmed (open question Q23,
6 Sep 2026): everything except friendlies and tour games counts.** In practice that's the 14-match
Graham Dodd Premier Division programme plus roughly 6 cup games a season across three cups the
club actually enters — **MLIP** (~3 games), **CC** (~1 game), **FBC** (~2 games), explicitly rough
and variable year to year. Friendlies and tour games are excluded outright, so `type` doesn't need
a `friendly` value after all — just `league` and `cup`. The type still matters because cups can go
to extra time and shootouts.

**`Match`** — `seasonId`, `competitionId`, `opponentClubId`, `kickOffAt`, `venue`, `isHome`,
`fixtureStatus`, `goalsFor`, `goalsAgainst`, `wentToExtraTime`, `shootoutFor`, `shootoutAgainst`,
`notes`, `faFullTimeUrl`.

Two independent statuses, which is worth separating explicitly:

- **Fixture status** — what happened to the game: scheduled, played, postponed, abandoned,
  walkover, void. Walkovers and postponements are not edge cases in Sunday league; the 2024/25 SSFL
  results include `H - W` fixtures where a side could not be fielded. They must not generate
  appearances or points.
- **Recording status** — where the match is in our own workflow: `draft` (team sheet and events
  still being entered), `awaiting_votes` (facts recorded; **the certified 3-2-1 bonus result has
  not been entered yet** — the vote itself already happened verbally at the pub, this status is
  purely "we're still waiting on someone to type it in," not a digital ballot), `final` (certified
  result entered, scores computed), `corrected` (edited after finalising, with a reason recorded).
  ✅ Corrected 7 Sep 2026 — an earlier draft of this line read "ballot open/closed," which wrongly
  implied an in-app vote; see [`schema.md`](../02-architecture/schema.md) for the authoritative
  wording. This status is what stops a half-entered match from polluting the leaderboard, and it
  gives the squad a visible signal that a result was changed after the fact.

### Participation

**`Appearance`** — the join between a player and a match, and the heart of the model.
`matchId`, `playerId`, `role` (started / substitute / unused / no_show — **✅ simplified 7 Sep
2026, see below**), `position` (GK/DF/MD/FW — **per match**, decided/known by the Captain and
Manager, before or after kick-off, confirmed open question **Q3**'s follow-up), `played60`
(boolean — **confirmed manual/judgement**, not derived from timestamps), `isCaptain`, `saves`
(integer, self-reported by the keeper — confirmed **Q18**, not individual events).

**✅ Resolved (CPO review, 7 Sep 2026) — the role enum drops `dropped-out`.** Only four things can
be true of a named player and a match, and only two of them get an `Appearance` row at all: they
played (`started`/`substitute`), they were named but didn't come on (`unused`), or they didn't
show up and didn't say anything (`no_show`, −5). Telling the manager they can't make it — at any
point, including matchday morning — means **no row at all**, same as any week they weren't picked;
that's availability tracking, and it's Stack's job (Q34), not this app's. `dropped-out` tried to
represent "told someone, but still penalised" — a state the club has never actually described —
so it's gone. See [`schema.md`](../02-architecture/schema.md)'s "Squad states" table.

**✅ Confirmed (6 Sep 2026): `played60` is a hard eligibility gate, not a multiplier.** If false, a
GK/DF's Def Inf is 0 and everyone's clean-sheet bonus is 0 — regardless of the scoreline while they
were on the pitch. No half-credit case. See
[`pellet-index-rules.md`](pellet-index-rules.md) for the full rule and a flag about how this
compares to the historical spreadsheet pattern (worth re-checking, not blocking).

**✅ Confirmed: rolling subs, and 60 minutes can be a combined total.** Rolling substitutions are
used, and a player can satisfy the 60-minute threshold by combining multiple stints in one match
(on, off, back on again). In practice this is rare — most subs who come off don't return for
meaningful further time — so `played60` staying a single judgement-call boolean (rather than
decomposing into individual stints) is still the right level of detail; a human just sums it up
when marking the appearance, exactly as confirmed by Q9/Q31.

**✅ Confirmed: `role = unused` scores 0.** Sitting on the bench without coming on doesn't earn the
appearance point — only actually playing does, regardless of minutes.

**✅ Confirmed: "clean sheet while on" is evaluated against substitution ordering, not the final
scoreline.** A defender subbed off at 61 minutes of a 0–0 keeps the full clean-sheet bonus even if
the team concedes at 85 — see the on-pitch-only resolution of open question **Q4** in
[`pellet-index-rules.md`](pellet-index-rules.md). This is why the engine needs a relative ordering
("this goal happened after this player came off"), not a scoreline snapshot.

**✅ Resolved (open question Q9, 6 Sep 2026): no minute-level data, ever.** The club knows events
happened and has a rough sense of who was on the pitch and the order things happened in, but never
an actual minute — not for their own goals, the opposition's, cards, or substitutions. On-pitch
goals for/against are a **best-effort, approximate** derived stat (order-based, not minute-based)
rather than something requiring precision.

**✅ Resolved (CPO review, 7 Sep 2026) — ordering lives on `MatchEvent`, not on `Appearance`.** An
earlier draft carried a `subSequence` field on `Appearance` itself, but a single integer per
appearance can't represent a rolling substitution (on, off, on again is two events for the same
player) or a substitution with nobody on the other side (a red card leaves the team a player
down; nobody comes on for it). Dropped `subSequence` entirely — `MatchEvent` of type
`substitution` (with an optional player going off and an optional player coming on) is the single
ordered source of truth. Who was on the pitch for a given `goal conceded` is derived by the engine
from the starting XI plus every `substitution` event's position in `sequence`, not stored
per-appearance. See `onPitch.ts` in [`engineering-guide.md`](../02-architecture/engineering-guide.md).

**`PlayingStint`** — **ruled out.** This was the "expensive option" flagged for repeat
substitutions/keeper swaps needing exact intervals. Confirmed (Q9): this club will never produce
minute-accurate data, so stints add cost without buying accuracy. Ordered `substitution` events
on a single `Appearance` handle repeat stints for free without needing an interval model —
approximate ordering is the ceiling of what's achievable here, not a v1 simplification to revisit
later.

**`MatchEvent`** — `matchId`, `sequence` (simple incrementing order per match, **not a minute** —
confirmed Q9), `type`, `playerId`, `secondaryPlayerId`, `detail`.
Types: goal, own goal, assist, yellow, second yellow→red, penalty scored, penalty missed,
penalty saved, substitution, shootout penalty scored, shootout penalty missed, shootout penalty
saved, goal conceded (opposition, anonymous — see below).

**✅ Confirmed: at most one assist per goal (Q17).** A goal event should allow zero or one linked
assist event, never two — enforce this at the validation layer, not just in the scoring engine.

**✅ Confirmed: second yellow = a single red event, not two events (Q19c).** Model a
second-bookable dismissal as one red card, scoring −3, not a yellow (−1) plus a red (−3).

**✅ Confirmed: saves are a single self-reported count on the `Appearance`, not individual events
(Q18).** The keeper reports one number after the match (usually small — the club's own estimate is
"mostly always 3"), agreed with whoever's recording the match. Drop `save` from the `MatchEvent`
type list above; it lives on `Appearance.saves` instead.

**✅ Confirmed: opposition goals are anonymous (Q22).** The club doesn't know opposition players'
names, so `playerId` is null for a `goal conceded` event — it exists purely to give the goal a
`sequence` position, so the engine can tell whether a given player was on the pitch for it (see
the on-pitch-only clean-sheet resolution above), not to attribute it to anyone.

### The vote

**✅ Confirmed (open question Q5, 6 Sep 2026): the vote itself happens verbally, in person, at the
pub after the match** — among whoever stays, not the whole squad, and not a WhatsApp poll.
Self-voting is allowed. There's no digital ballot today and no record of individual votes, only
the resolved outcome — which is exactly what the legacy sheets captured too (a season bonus total,
no per-match ballot). This favours the "certified result" design below for v1; skip `VoteWindow`
and `Vote` unless the club later wants to move the vote itself online.

**Eligibility, confirmed:** any player who **played** in the match (started or came on — being an
unused sub doesn't count) can receive the 3/2/1, whether or not they went to the pub afterwards.
Only whoever is physically at the pub takes part in casting the informal vote — no minimum or
maximum headcount is enforced or needs modelling ("sometimes 3-4 people, sometimes up to 10," per
the club). This means `BonusAward.playerId` should validate against `Appearance.role IN (started,
substitute)` for that match, but there's nothing to validate about who cast the vote — that's not
data the app captures.

**`BonusAward`** — the resolved outcome, entered after the fact by whoever recorded the match
(Manager/Captain/Admin): `matchId`, `playerId`, `rank` (1/2/3), `points`.

Still open, and low-stakes: tie-breaking when players finish level in the informal pub vote — the
club's framing suggests this gets resolved socially in the moment, not by an app-enforced rule.

<details>
<summary>Deferred: a real digital ballot (not needed for v1, per the above)</summary>

If the club ever wants the vote itself to move into the app: `VoteWindow` (`matchId`, `opensAt`,
`closesAt`, `status`) and `Vote` (`voteWindowId`, `voterId`, `firstChoiceId`, `secondChoiceId`,
`thirdChoiceId`, `submittedAt`), tallied into the same `BonusAward`. Not building this speculatively.

</details>

### Scoring

**`Ruleset`** — versioned scoring configuration, shape sketched in
[`scoring-rule-history.md`](scoring-rule-history.md).

**`PelletScore`** — derived per appearance: `appearanceId`, `rulesetId`, `total`, and a
`breakdown` of every component that contributed. Each breakdown line is a small ledger row — rule
key, quantity, points, and a human-readable phrase like "Forward goal × 2 = 8". Storing the
breakdown rather than just the total is what lets the app show a player exactly why they got 11
points, which is most of the fun.

Clean sheets and conceded bands are deliberately **not** events. They are computed from the
scoreline, the player's position, and how long they were on.

**`ImportedSeasonAggregate`** — legacy spreadsheet rows: source file ID, the original name as
typed, and the category point totals. Kept visibly distinct from calculated scores so nobody
mistakes a 2023/24 archive row for something the engine produced.

### Match fees ✅ confirmed new scope (open question Q10)

The legacy sheets carried `Subs balance`, `Yearly Subs` (Paid / Not Paid / NA) and `Kit` columns.
**Confirmed (6 Sep 2026): the app should track match fees going forward.** `Yearly Subs` is
explicitly dropped — not tracked at all. In its place, a simple per-appearance fee:

**`MatchFee`** — `appearanceId`, `amountOwed` (**£12** if `played60`, **£6** otherwise — only for
players who actually played; an unused sub or no-show owes nothing, unconfirmed but the sensible
default), `amountPaid`, `paidAt`. No `markedPaidBy` person reference — since auth is a shared
Admin passphrase rather than per-person accounts (see Roles and auth, above), there's no individual
identity to attach; if that ever matters, use a free-text note instead. Derived automatically from
`Appearance.played60` at creation time so nobody has to calculate it by hand, then tracked like a
simple ledger — this is closer to a bookkeeping feature than a scoring one, and doesn't touch the
`Ruleset`/`PelletScore` machinery at all.

`Kit` itself (see [`pellet-index-rules.md`](pellet-index-rules.md)) turned out to be a real,
if minor, 2025/26-only scoring rule (a point for washing the kit), not a bug — but it's confirmed
discontinued for 2026/27 and has no equivalent in this section.

## Relationships

```
Season ──< Competition ──< Match >── Club (opponent)
  │                          │
  │                          ├──< Appearance >── Player
  │                          │        ├──< PelletScore
  │                          │        └──< MatchFee
  │                          ├──< MatchEvent
  │                          └──< BonusAward
  └── Ruleset
```

## Does it answer the questions people actually ask?

| Question | Supported by |
| --- | --- |
| Who's top of the Pellet Index? | Sum `PelletScore.total` by player over a season |
| Why did I only get 3 points last week? | `PelletScore.breakdown` for that appearance |
| Who's the best per game, not just total? | Total ÷ appearance count, already a column in 25/26 |
| How do we do with X on the pitch? | On-pitch GF/GA from `substitution` events vs `goal` / `goal_conceded` order |
| Who's played the most games this season? | Count of appearances with `role in (started, substitute)` |
| Who actually played 60? | `Appearance.played_60` — a judgement, never minutes |
| What's our record against Clapham Rovers? | `Match` filtered by `opponentClubId` across seasons |
| Who wins Player of the Season? | Sum of `BonusAward.points`, or Pellet total, or both |
| How did Shane's 25/26 compare to his 23/24? | Cross-season player view — requires the legacy import |
| Are we better home or away? | `Match.isHome` |
| Who never turns up? | `Appearance.role = no_show` |

## Known gaps in this draft

- No availability / squad selection flow, and **confirmed this app doesn't need to build one**
  (open question **Q34**): the club already uses **Stack** for availability, shared over WhatsApp.
  The −5 drop-out penalty (see **Q8**, resolved) is judged from communication, not from this app.
- No training sessions. Unknown whether the club wants them.
- No photos, match reports or social output, though the landscape research suggests they are
  among the most-loved features in comparable apps.
- The wider club's other teams aren't modelled beyond the `Team` entity existing (confirmed Q2) —
  no multi-team UI, standings, or cross-team player sharing yet.
- No FA Full-Time fixture import (confirmed **Q13**: manual entry only, by design) — and match
  results still get separately submitted to FA Full-Time itself, unchanged (**Q34**); this app
  doesn't touch that submission at all.
