# Users and the jobs they need done

**Two auth tiers, confirmed by the club on 6 September 2026 (open questions Q15/Q16): Viewer/Player
needs no account at all, and Admin is a grant given to a handful of named people** — Shane
Livingstone, Tom Heaton and William Goodwin to start, extensible to more later. Below, "Player",
"Scorer", "Manager" and "Club" describe *jobs to be done*, not separate auth roles — in a Sunday
league side one person holds several jobs at once (Shane and Tom are both Players *and* the
expected data-enterers, both covered by the single Admin grant).

## The Player

The overwhelming majority of usage. Perhaps 16–20 people, all on phones, mostly on Sunday evening
and Monday morning.

- See the result and how I did
- **See my points broken down** — the single most important screen in the app
- ~~Vote for my top three~~ — **confirmed the vote itself stays verbal, at the pub (Q5); this is
  not an in-app job.** What the Player does want here is just to see who won bonus once it's
  entered
- See where I am in the table, and how far ahead or behind the person next to me
- See my season: goals, assists, appearances (and whether I hit the 60-minute mark), form
- Compare myself to previous seasons and to teammates

They will not read instructions, will not create a password, and will open the app roughly twice a
week. Anything requiring more commitment than that will fail.

## The Scorer

**Confirmed:** in practice this is **Tom Heaton (Captain)** and **Shane Livingstone (Manager)** —
matching the audit's guess that Tom maintains 24/25–25/26 and Shane started the sheet. Both are
also players. **William Goodwin (System Admin)** can also enter data. Their job is the one the app
most needs to make easier, because if it gets harder they will go back to the sheet — and it's
expected to happen from a phone, at the pub, right after the match (confirmed Q15).

- Enter a result and a team sheet quickly, ideally at the ground or on the way home
- Record goals, assists, cards and saves without fighting the UI
- Record substitutions and other events in the right rough order — never an exact minute,
  that precision doesn't exist for this club (Q9)
- Fix a mistake three weeks later and have everything recompute
- Not do any arithmetic, ever again
- ~~Tune the rules between seasons without asking a developer~~ — ✅ corrected (CPO/CTO review,
  7 Sep 2026): for v1 this is a small pull request against a checked-in ruleset file, once a year,
  not an in-app editor. See [ADR 0002](../02-architecture/adr/0002-versioned-rulesets.md)

Their real constraint is that match data entry competes with going to the pub. Target: a full match
recorded in under five minutes.

## The Manager

Picks the team, and cares about patterns rather than individual scores.

- Who is available, who is in form, who has played too much or too little
- How the team does with a given player on the pitch
- Home versus away, and against this specific opponent
- What the league table looks like

## The Club

Occasional, high-value moments rather than weekly use.

- The end-of-season awards night: winners, runners-up, records, a presentation
- Historical records across seasons — most appearances, most goals, best PPG
- Something worth sharing with the wider club and on social

## The jobs, ranked

If the app only ever does five things well, these are the five:

1. **Show me my points, broken down** (Player) — the reason the competition exists
2. **Record a match without pain** (Scorer) — the thing that kills the project if it's wrong
3. **See the bonus vote resolve** (Player) — the social heart of it; the vote itself stays verbal
   at the pub (Q5), the app just shows the certified result
4. **Show the table** (Player) — the competition
5. **Change the rules without a developer** (Scorer) — the thing that makes it last more than a season

## What each auth tier can do

**Simplified and confirmed (6 Sep 2026, Q15/Q16): just two tiers, not four.** "The Scorer" above
(Tom, Shane, William) are simply the people who happen to hold the Admin grant — there's no
separate Manager/Captain/System-Admin permission split to build:

| | Viewer/Player (no login) | Admin (Shane, Tom, William, extensible) |
| --- | :-: | :-: |
| View everything | yes | yes |
| Vote for the bonus | verbally, at the pub (Q5) — not an in-app action for anyone | |
| Enter results, team sheets, events | no | yes |
| Fix historical data | no | yes |
| Edit the ruleset | no | yes |
| Manage the squad | no | yes |
| Grant Admin to someone new | no | yes |

The realistic worry is not malice, it is a well-meaning player "fixing" their own goal tally —
that's exactly why Viewer/Player has no write access at all, not even to their own row. Keep
everything reversible even without a per-person audit trail. **Auth mechanism locked in (6 Sep
2026, Q16/Q24): two shared passphrases, no accounts.** A simple, memorable one gates Viewer/Player
(or the app is just public — the club doesn't mind either); a second, slightly longer but still
memorable one gates Admin write access. No magic link, no email provider, no per-person login —
and no built-in way to know which Admin made a given edit, a trade-off the club explicitly
accepted.
