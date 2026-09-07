# Physical schema

**Status:** Accepted — 7 September 2026
**Companion:** [`engineering-guide.md`](engineering-guide.md),
[`../01-domain/domain-model.md`](../01-domain/domain-model.md)

This is the v1 Postgres schema. Implement it in Drizzle (`lib/db/schema.ts`); **Drizzle Kit is the
sole migration authority for v1** (✅ resolved, CTO review 7 Sep 2026 — see
[`connections.md`](connections.md) §Migrations). There is no local Docker in v1, so the Supabase
CLI migration path (`supabase migration new`) is never actually exercised; don't generate one.
Names here are `snake_case` tables and columns.

There is **no `users` table**. Auth is two passphrases; see
[ADR 0005](adr/0005-shared-passphrases.md).

There is **no `minute` column** on any table. There is **no `playing_stints` table**.

---

## Conventions

- Primary keys: `uuid` generated with `gen_random_uuid()`, except `rulesets.id` which is a
  stable slug (`wwfc-2026-27`).
- Timestamps: `timestamptz`, `created_at` / `updated_at` where the row is edited.
- Enums: Postgres enums **or** `text` plus a check constraint. Prefer check constraints so a
  new value is a migration, not a type dance. The strings below are the only legal values.
- Money: `numeric(6,2)` in pounds. Not integers-in-pence — the club thinks in £12 / £6.
- JSON: `jsonb`. Validate shape in application code (Zod) before write.

---

## Tables

### `clubs`

Us, and every opponent.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid pk | |
| `name` | text not null | "Westminster Wanderers FC", "Bath Old Boys United" |
| `short_name` | text | "Wanderers", "Bath Old Boys" |
| `fa_full_time_team_id` | text | Informational. Never used to import |
| `is_us` | boolean not null default false | Exactly one row is `true` |
| `created_at` | timestamptz not null | |

### `teams`

A squad inside a club. **First-class from day one** (Q2). v1 UI shows one team.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid pk | |
| `club_id` | uuid fk `clubs` not null | |
| `name` | text not null | "1st Team" |
| unique | `(club_id, name)` | |

### `rulesets`

Versioned scoring config. Immutable once a season that references it has started (Q7).

| Column | Type | Notes |
| --- | --- | --- |
| `id` | text pk | `wwfc-2023-24` … `wwfc-2026-27` |
| `season_label` | text not null | "2026/27" |
| `config` | jsonb not null | Shape in § Ruleset JSON below |
| `created_at` | timestamptz not null | |

Seed four rows from `data/legacy/rulesets.csv` plus the confirmed 2026/27 deltas. Do not
hardcode points in TypeScript except as copies of these JSON objects in `lib/scoring/rulesets/`.

### `seasons`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid pk | |
| `team_id` | uuid fk `teams` not null | |
| `label` | text not null | "2026/27" |
| `starts_on` | date | |
| `ends_on` | date | |
| `ruleset_id` | text fk `rulesets` not null | |
| `is_current` | boolean not null default false | At most one `true` per `team_id` |
| unique | `(team_id, label)` | |

### `players`

No date of birth. Ever.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid pk | |
| `display_name` | text not null | "Shane Livingstone" |
| `known_as` | text | "Shane" |
| `default_position` | text | `GK` `DF` `MD` `FW` or null. UI prefill only |
| `squad_number` | int | Optional, unused if unknown |
| `status` | text not null | `active` `injured` `former` `guest` |
| `joined_on` | date | Nullable |
| `created_at` | timestamptz not null | |

Check: `default_position is null or default_position in ('GK','DF','MD','FW')`.

### `player_aliases`

Maps a spreadsheet spelling onto a player. **Never auto-merge on string similarity.**

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid pk | |
| `player_id` | uuid fk `players` not null | |
| `source` | text not null | e.g. `pellet-index-2025-26` |
| `original_name` | text not null | As typed in the sheet |
| unique | `(source, original_name)` | |

Confirmed pairs live in `AGENTS.md`. Full squad arrives at import (Q12).

### `season_players`

Registration. A player who leaves and returns keeps one `players` row.

| Column | Type | Notes |
| --- | --- | --- |
| `season_id` | uuid fk `seasons` not null | |
| `player_id` | uuid fk `players` not null | |
| pk | `(season_id, player_id)` | |

### `competitions`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid pk | |
| `season_id` | uuid fk `seasons` not null | |
| `name` | text not null | |
| `type` | text not null | `league` `cup` `friendly` |
| `code` | text | `MLIP` `CC` `FBC` or null for league/friendly |
| `counts_for_pellet` | boolean not null default true | See below |

**✅ Resolved (CPO review, 7 Sep 2026) — `friendly` added, gated by a boolean not the label.**
Friendlies never count toward the Pellet Index (Q23), but the engine doesn't branch on the
`type` string to decide that — it checks `counts_for_pellet`. `type` is a display label; a tour
game, a testimonial or a charity match will eventually turn up wearing a name that looks like a
cup, and scoring eligibility should be an explicit data property an admin can set per fixture,
not something inferred from what it's called. `friendly` defaults `counts_for_pellet` to `false`
at creation time (a UI default, not a hard rule); `league`/`cup` default to `true`.

The club does play friendlies, and a season's fixture list shouldn't have unexplained gaps on
days they played. So friendlies **are** recordable as bare fixture history (opponent, scoreline,
date) — with `counts_for_pellet = false` they generate no `appearances`, no `pellet_scores`, no
`match_fees`, and the recorder flow skips straight from step 1 (result) to done; no team sheet,
no events, nobody spends pub time entering a match that scores nothing. If a friendly is recorded
with a full team sheet anyway (nothing stops that), the engine still ignores it for scoring; it
only ever shows up in a "friendlies" filter, never in the Index.

### `matches`

Two independent statuses. Us always stored as ourselves; `is_home` plus opponent — never swap
who is "left" in the database. The UI puts us on the left.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid pk | |
| `season_id` | uuid fk `seasons` not null | |
| `competition_id` | uuid fk `competitions` not null | |
| `opponent_club_id` | uuid fk `clubs` not null | |
| `kick_off_at` | timestamptz | Nullable until known. **No default time** |
| `venue` | text | |
| `is_home` | boolean not null | |
| `fixture_status` | text not null | `scheduled` `played` `postponed` `abandoned` `walkover` `void` |
| `recording_status` | text not null default `draft` | `draft` `awaiting_votes` `final` `corrected` |
| `goals_for` | int | Nullable while draft |
| `goals_against` | int | |
| `went_to_extra_time` | boolean not null default false | |
| `shootout_for` | int | Nullable |
| `shootout_against` | int | |
| `notes` | text | |
| `fa_full_time_url` | text | Manual paste only. Never scraped |
| `entered_by` | text | Free-text, not an identity |
| `correction_reason` | text | Required when `recording_status = corrected` |
| `created_at` | timestamptz not null | |
| `updated_at` | timestamptz not null | |

`awaiting_votes` means facts are in and the certified 3/2/1 has not been entered yet. The vote
itself is verbal; there is no ballot table. **✅ Resolved (CPO review, 7 Sep 2026): a match in
`awaiting_votes` is fully visible on the public Index and match page** — result, team sheet, and
every non-bonus Pellet point, with a plain "bonus not certified yet" note. It does not disappear
until someone gets round to typing in the 3-2-1; hiding a whole match just because the bonus is
outstanding would contradict the product's own no-silent-gaps philosophy for partial data (see
[`ux-and-flows.md`](../05-design/ux-and-flows.md)'s Partial state).

`goals_for`/`goals_against` is the score after 90 (or, if `went_to_extra_time`, 120) minutes,
before any shootout. **Extra-time goals are ordinary `goal` events** — same points as any other
goal, no distinction — they simply land later in `match_events.sequence`. There's no `minute`
field to distinguish "extra time" by, so there's nothing to add.

Walkovers / postponements / void: no appearances, no scores, no fees.

**✅ Resolved (CPO review, 7 Sep 2026) — `abandoned`.** Default treatment: an abandoned match
(started, then stopped early — weather, injury, a referee's call) is scored **exactly like any
other played match**, using whatever team sheet and events were captured up to the abandonment.
The club never tracked exact minutes anyway, so "the match didn't run the full 90" doesn't change
how precisely we can score it — `played_60` is already a manual judgement call, same as always.
If the league itself voids the result (rare, and governed by the SSFL's own rule for that
fixture, not ours), set `fixture_status = void` instead of `abandoned` and it drops out of
scoring entirely like any other void match. `abandoned` exists as a distinct status purely so the
fixture history can say what actually happened, not to trigger different scoring by itself.

### `appearances`

The heart of the model. One row per player per match, including unused subs and silent no-shows —
but **not** for a player who simply wasn't part of that week's squad, whether or not they gave
notice. See "Squad states" below; this was a genuine open question, now resolved (CPO/CTO review,
7 Sep 2026).

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid pk | |
| `match_id` | uuid fk `matches` not null | |
| `player_id` | uuid fk `players` not null | |
| `role` | text not null | `started` `substitute` `unused` `no_show` |
| `position` | text | `GK` `DF` `MD` `FW`. Required if started or substitute |
| `played_60` | boolean not null default false | **Manual judgement.** Hard CS/Def Inf gate in 26/27 |
| `is_captain` | boolean not null default false | |
| `saves` | int | Self-reported. Missing for a keeper who played ≠ 0 |
| unique | `(match_id, player_id)` | |

`unused` scores 0. `no_show` scores −5 (ruleset `dropOut`).

**✅ Resolved (CPO review, 7 Sep 2026) — squad states.** There are only four things that can be
true of a named player and a given match, and only two of them get a row here:

| State | Told the manager? | Gets an `appearances` row? | Points / fee |
| --- | --- | --- | --- |
| Played (started or came on) | — | Yes, `role = started` or `substitute` | Scored normally |
| Named but didn't come on | — | Yes, `role = unused` | 0 points, £0 fee |
| Couldn't play, said so — **any time, including matchday morning** | Yes | **No row at all.** Same as any other week they weren't picked | Nothing to score — they're not part of this match |
| Didn't play, didn't say anything | No | Yes, `role = no_show` | −5 points, £0 fee |

The old four-value enum (`started substitute unused dropped_out no_show`) had a redundant
`dropped_out` that tried to represent "told someone, but somehow still penalised" — a state the
club has never actually described. The rule is binary: *any* notice, at *any* time, is fine and
generates no record; *silence* is the only thing that's penalised. Simplifying to one penalty
role (`no_show`) removes a distinction the product never needed and a UI would have had to
explain.

Rolling subs: still one appearance. The human sums stints into `played_60`.

### `match_events`

Ordered facts. **No `minute`.**

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid pk | |
| `match_id` | uuid fk `matches` not null | |
| `sequence` | int not null | Dense order 1..n per match |
| `type` | text not null | See list below |
| `player_id` | uuid fk `players` | **Null** for `goal_conceded`. Player going **off**, on a `substitution` — nullable (e.g. a red card leaves the team a player down, nobody comes off for it) |
| `secondary_player_id` | uuid fk `players` | Player coming **on**, on a `substitution` — nullable (a straight sending-off, nobody replaces them) |
| `related_event_id` | uuid fk `match_events` | Assist → its goal. At most one assist per goal |
| `detail` | text | |
| unique | `(match_id, sequence)` | |

**Types:** `goal` `own_goal` `assist` `yellow` `red` `penalty_scored` `penalty_missed`
`penalty_saved` `substitution` `shootout_penalty_scored` `shootout_penalty_missed`
`shootout_penalty_saved` `goal_conceded`

- Second yellow → store a single `red`. Never yellow then red.
- `goal_conceded` is anonymous opposition. It exists so the engine can order it against
  `substitution` events.
- Saves are **not** events. They live on `appearances.saves`.
- App validation: at most one `assist` with a given `related_event_id`.

**✅ Resolved (CPO review, 7 Sep 2026) — `substitution` events are the sole source of truth for
who was on the pitch, replacing the earlier `appearances.sub_sequence` column (now removed).** A
single integer per appearance can't represent a rolling substitution (on, off, on again is two
events for the same player) or a substitution with no one on the other side of it; an ordered
list of `substitution` events already handles both for free. The engine derives "who was on the
pitch when this `goal_conceded` happened" from starters plus the ordered substitution events —
see `onPitch.ts` in [`engineering-guide.md`](engineering-guide.md) §10. This makes `substitution`
a first-class chip in the recorder's event list (§4 of
[`ux-and-flows.md`](../05-design/ux-and-flows.md)), not something implied by a separate step.

Order only ever changes two things: **opposition goals relative to substitutions.** Goals for,
assists, cards and penalties have no ordering consequence for any scoring rule — the recorder UI
should say so, so nobody agonises over exact event order that doesn't affect anyone's points.

### `bonus_awards`

Certified pub result. No `votes` table.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid pk | |
| `match_id` | uuid fk `matches` not null | |
| `player_id` | uuid fk `players` not null | Must have `role in (started, substitute)` |
| `rank` | int not null | 1, 2 or 3 |
| `points` | int not null | 3, 2 or 1 matching rank (also in the ruleset) |
| unique | `(match_id, rank)` | |
| unique | `(match_id, player_id)` | |

**✅ Resolved (CTO review, 7 Sep 2026) — status transitions.** Neither transition is automatic;
both are an explicit admin action, because both certify that a human is satisfied the record is
right:

- **`draft` → `awaiting_votes`:** the "Finish recording" action at the end of the six-step
  recorder. **Hard requirements:** `fixture_status` and `goals_for`/`goals_against` set, at least
  one appearance with `role = started`, and `played_60` set for every `started`/`substitute`
  appearance. **Deliberately not required:** a full 11-man starting XI — a Sunday-morning squad
  can genuinely be short, and blocking on headcount would be actively hostile to the club's real
  matchday reality. **Soft check, warn don't block:** if the count of `goal`/`own_goal` events
  doesn't match `goals_for`/`goals_against` for either side, or a keeper appearance has no
  `saves` value, show it in a checklist ("3 conceded logged, scoreline says 4 — add the missing
  one or fix the score") but let the admin proceed anyway; chasing a keeper for a number or
  re-checking an event a week later shouldn't hold up recording. **Not required at all to leave
  draft:** `match_fees` (fees derive automatically once `played_60` is set — see below — but
  marking them paid can lag indefinitely).
- **`awaiting_votes` → `final`:** entering the certified 3-2-1 (`bonus_awards`) is the **only**
  hard requirement — that's the literal definition of what `awaiting_votes` is waiting for. Every
  soft-check warning from the previous transition can still be outstanding; none of them block
  finalising. The ledger line for a missing keeper `saves` value is just `0` (a data gap, not a
  real zero — see [`pellet-index-rules.md`](../01-domain/pellet-index-rules.md)) until someone
  fills it in, and correcting it later is a normal `corrected` edit like any other.

### `pellet_scores`

Materialised engine output. **Never typed by a human.** Delete and recompute when facts change.

| Column | Type | Notes |
| --- | --- | --- |
| `appearance_id` | uuid pk fk `appearances` | |
| `ruleset_id` | text fk `rulesets` not null | Copied from the season at compute time |
| `total` | int not null | Must equal `sum(breakdown.points)` |
| `breakdown` | jsonb not null | `LedgerLine[]` — **include zero-point lines** |
| `computed_at` | timestamptz not null | |

`LedgerLine`: `{ "ruleKey": "goal", "label": "Forward goal", "quantity": 2, "points": 8 }`.

### `match_fees`

Derived from `played_60` when the match is finalised. Not scoring.

| Column | Type | Notes |
| --- | --- | --- |
| `appearance_id` | uuid pk fk `appearances` | |
| `amount_owed` | numeric(6,2) not null | £12 if `played_60`, else £6 if they played, else £0 |
| `amount_paid` | numeric(6,2) not null default 0 | |
| `paid_at` | timestamptz | |
| `note` | text | Optional "entered by" |

Played means `role in (started, substitute)`. Unused / no-show owe **£0** (✅ confirmed, CPO
review 7 Sep 2026 — a no-show didn't use the pitch, so owes nothing beyond the −5 Pellet penalty;
it's a token amount either way, not a schema change if the club ever overrules this).

**✅ Resolved (CPO/CTO review, 7 Sep 2026) — correcting `played_60` must not erase a payment.**
If a correction changes `played_60` (e.g. a player originally marked as an early sub turns out to
have played 60+ minutes), **update `amount_owed` in place; never delete/reinsert this row and
never touch `amount_paid` or `paid_at`.** This is different from `pellet_scores`, which *is*
delete-and-reinsert on every correction (see Recompute, below) — fees have real-world payment
history attached that scores don't, so they get an `UPDATE`, not a `DELETE` + `INSERT`. A player
who already paid £6 and is corrected up to owing £12 should see "£6 of £12 paid," never "not
paid" again just because an unrelated fact changed.

### `imported_season_aggregates`

Read-only archive of 2023/24–2025/26 published **point totals**, not event counts.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid pk | |
| `season_label` | text not null | |
| `source_file_id` | text not null | Drive ID |
| `original_name` | text not null | |
| `player_id` | uuid fk `players` | Null until a human confirms the alias |
| `category_points` | jsonb not null | Keys as in the CSV: Goals, Assists, Kit, Total, … |
| unique | `(season_label, original_name)` | |

A cell `Goals = 56` means **56 points**. Import as published, including 2025/26 `Kit`.

Never mix these rows into `pellet_scores`.

### `index_snapshots`

[ADR 0007](adr/0007-index-snapshots.md). Written when a match becomes `final` or `corrected`.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid pk | |
| `season_id` | uuid fk `seasons` not null | |
| `match_id` | uuid fk `matches` not null | The match just published |
| `player_id` | uuid fk `players` not null | |
| `rank` | int not null | 1-based, ties share, next rank skips |
| `total` | int not null | Season sum of `pellet_scores.total` after this match |
| `appearances` | int not null | |
| `captured_at` | timestamptz not null | |
| unique | `(match_id, player_id)` | |

Movement on `/` = this player's rank vs the previous snapshot in the same season. No prior
snapshot → no arrows.

---

## Indexes

```sql
create index matches_season_kickoff_idx on matches (season_id, kick_off_at);
create index appearances_match_idx on appearances (match_id);
create index appearances_player_idx on appearances (player_id);
create index match_events_match_seq_idx on match_events (match_id, sequence);
create index bonus_awards_match_idx on bonus_awards (match_id);
create index index_snapshots_season_player_idx on index_snapshots (season_id, player_id);
create index pellet_scores_ruleset_idx on pellet_scores (ruleset_id);
```

---

## RLS

Enable RLS on **every** table in `public`. Grant **no** `SELECT`/`INSERT`/`UPDATE`/`DELETE` to
`anon` or `authenticated`. See [ADR 0006](adr/0006-server-only-database.md).

**✅ Resolved (CTO review, 7 Sep 2026) — what RLS actually protects here.** The Next.js server
connects through the shared pooler as `postgres.<PROJECT_REF>`, which is Supabase's `postgres`
role — the **table owner**. Postgres exempts a table's owner from RLS by default, with or without
policies, unless `FORCE ROW LEVEL SECURITY` is explicitly set on that table. So: **RLS-on with no
policies does nothing to restrict our own server connection** — it can always read and write
everything, exactly as it needs to. What RLS-on-with-no-grants actually does is make every table
return zero rows to `anon`/`authenticated`, which is the defence against a leaked publishable key
hitting the Supabase Data API (PostgREST). Do **not** set `FORCE ROW LEVEL SECURITY` — that would
also restrict the owner (our own server), which we explicitly don't want. Belt-and-braces beyond
that: turning the Data API off entirely in Supabase's API settings (already noted as optional in
[`connections.md`](connections.md)) removes the PostgREST attack surface altogether, making RLS
here pure defence-in-depth rather than the only thing standing between a leaked key and the data.

---

## Ruleset JSON

Locked shape for v1. Four files in `lib/scoring/rulesets/` must match the four `rulesets.config`
rows.

**✅ Resolved (CTO review, 7 Sep 2026) — which one is canonical.** The **checked-in TypeScript
files are canonical.** They're git-reviewed, type-checked, and are what the pure scoring engine
actually imports (the engine has no I/O, so it can never read the database directly). The
`rulesets.config` jsonb rows are a **generated copy**, written by the seed script *from* those TS
files — never hand-typed into the database separately. A Vitest check asserts the two are
byte-for-byte identical (parse each TS file, compare to its DB row) so drift is a failing test,
not a silent bug. Practical consequence: **changing a rule for a future season is a git PR that
edits a TS file**, not a database edit and not an admin UI — see the "self-service ruleset
editor" decision in [`AGENTS.md`](../../AGENTS.md) for why that's the right amount of ceremony
for a change that happens once a year.

```jsonc
{
  "id": "wwfc-2026-27",
  "season": "2026/27",
  "positions": ["GK", "DF", "MD", "FW"],
  "kitPoints": false,
  "cleanSheetHalfIfUnder60": false,
  "rules": {
    "appearance": { "GK": 1, "DF": 1, "MD": 1, "FW": 1 },
    "minutes60": { "GK": 1, "DF": 1, "MD": 1, "FW": 1 },
    "defensiveInvolvement": {
      "requires60": true,
      "GK": 1, "DF": 1, "MD": 0, "FW": 0
    },
    "cleanSheet": {
      "requires60": true,
      "GK": 8, "DF": 8, "MD": 4, "FW": 2,
      "concededTiers": { "0": 1, "1": 0.5, "2+": 0 }
    },
    "concededBands": [
      { "min": 2, "max": 2, "points": { "GK": -1, "DF": -1, "MD": 0, "FW": 0 } },
      { "min": 3, "points": { "GK": -2, "DF": -2, "MD": 0, "FW": 0 } }
    ],
    "goal": { "GK": 6, "DF": 6, "MD": 5, "FW": 4 },
    "assist": { "GK": 5, "DF": 3, "MD": 3, "FW": 3, "maxPerGoal": 1 },
    "savesPerPoint": 3,
    "penaltySave": 4,
    "penaltyMissed": -2,
    "yellowCard": -1,
    "redCard": -3,
    "ownGoal": -2,
    "dropOut": -5,
    "shootout": { "scored": 1, "notScored": -1, "gkSavePerSave": 1 },
    "bonus": [3, 2, 1]
  }
}
```

**Do not silently unify historical and live CS rules.**

| Season | `requires60` on CS | `cleanSheetHalfIfUnder60` | `concededTiers["1"]` | `kitPoints` | GK assist | dropOut |
| --- | --- | --- | --- | --- | --- | --- |
| 2023/24 | false | true (sheet audit) | 0 | false | 3 | −2 |
| 2024/25 | false | true (sheet audit) | 0 | false | 3 | −5 |
| 2025/26 | false | true (sheet audit) | 0 | **true** | **5** | −5 |
| 2026/27 | **true** | **false** | **0.5** | false | 5 | −5 |

We **cannot** replay 23–26 from events; they do not exist. Historical rulesets exist so the
engine is honest if we ever reconstruct a sample, and so 2025/26 `Kit` import stays a first-class
line. Live scoring is 2026/27.

`requires60` is checked **before** `concededTiers`. Under 60 in 26/27 → CS 0 and Def Inf 0, no
quarter-credit.

---

## Recompute

When a `final` or `corrected` match's facts change:

1. Delete `pellet_scores` for that match's appearances.
2. Run `scoreAppearance` for every appearance.
3. Insert the new scores.
4. **Fees are `UPDATE`, not delete-and-reinsert:** if an appearance's `played_60` changed,
   recompute `amount_owed` and `UPDATE` the existing `match_fees` row for that appearance in
   place. **Never touch `amount_paid` or `paid_at`.** If a *new* appearance was added (a player
   who wasn't recorded at all before), `INSERT` a fresh `match_fees` row for it, `amount_paid = 0`
   — there's no prior payment to preserve because there was no prior row.
5. Insert a new `index_snapshots` set for the season as-of this match (ADR 0007).

Do not patch a single ledger line by hand. `pellet_scores` has no payment history, so
delete-and-reinsert is fine there; `match_fees` does, so it isn't.

---

## Explicitly absent

`users`, `admin_grants`, `sessions` (cookies only), `vote_windows`, `votes`, `playing_stints`,
`minutes`, `availability`, `photos`, `kit` as a live 26/27 line, yearly subs.
