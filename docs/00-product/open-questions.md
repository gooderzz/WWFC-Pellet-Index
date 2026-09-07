# Open questions

Everything the build needs from the club that research couldn't settle. Numbered so they can be
referenced from other docs and answered piecemeal.

**Status key:** 🔴 blocking — 🟠 needed before that area is built — 🟢 nice to know

**Status as of 6 September 2026: planning is fully closed out.** No question was ever tagged 🔴,
every 🟠 has landed, and the last real architecture decision (auth mechanism) was locked in on
6 September 2026 — see **Q16/Q24 — Answered**. Full detail for every resolved question is in
**Answered**, grouped to match the sections below.

**Update, 7 September 2026 (evening):** architecture and design docs got written, a CPO/CTO
review surfaced Q35–Q41, and **William has now answered all of them except Q41** (a narrow,
non-blocking match-fee edge case). Headlines: **implementation is authorised, conditional on
real infrastructure existing** — a real GitHub repo (confirmed needed), a Vercel project (staying
on **Hobby**), and a Supabase project (staying on **Free**, backups are not a concern). Q39's
memory-check and Q40's abandoned-match question are both fully closed too — see the
**7 September 2026** section below for the detail on each. **The only thing left blocking further
work is getting that real infrastructure in place** (see `AGENTS.md` for the current state and
what's needed next); Q41 rides along with the D1–D3 crest/colour questions whenever those get
asked.

---

## Still open — nothing. Planning is closed out

Auth is fully decided (see **Q16/Q24** in **Answered**): **two shared passphrases, no per-person
accounts, no magic link, no email provider.** A simple one for Viewer/Player, a slightly longer
but still-memorable one for Admin.

The remaining items that used to sit here were never planning questions — they're just work that
belongs to a later phase, and the club confirmed that explicitly on 6 Sep 2026:

- **Q30's vote result** (who got 3rd/2nd/1st for the 6 September game) is **data entry, not
  research.** It happened, but capturing it is what the built app is for — not something to chase
  down and write into a doc now. Dropped from this list entirely.
- **Q12's full squad/player-identity list** is explicitly **data-import scope** — the club will
  supply real squad names when that phase starts, not during planning.
- **Q25's actual club colour values** are the **Chief Design Officer's call**, not this doc's — we
  can research public reference points (kit photos, crest, existing branding) to hand over as a
  starting point, but the final hex/Pantone picks aren't a planning deliverable.
- **Scoring verification** happens in two stages, neither of which needs live data entry now: (1)
  the historical spreadsheets already extracted into
  [`data/legacy/`](../../data/legacy/) let the scoring engine be checked against three full
  seasons of *published* totals once it's built (see
  [`legacy-spreadsheets.md`](../01-domain/legacy-spreadsheets.md)); (2) a true end-to-end test
  run with a real 26/27 match happens naturally later, once there's an actual match to enter
  through the built app — not something to simulate now.

---

## 7 September 2026 — new items from the CPO/CTO review

A fresh outside read of every doc (GPT 5.6) surfaced real internal contradictions (now fixed —
mostly `product-brief.md` not having caught up with later decisions) and a batch of genuinely
new questions. Sonnet ran a CPO pass (Claude Opus 5) and a CTO pass (Cursor Grok 4.6) to answer
almost all of them; those are folded into `schema.md`, the ADRs, and `engineering-guide.md`
in-place (search for "✅ Resolved" + "7 Sep 2026"), not repeated here. **Genuinely left for
William** — a real fact, a money decision, or a values call, not something a CPO/CTO stand-in
can settle:

**Q35 — Is implementation actually authorised now, or does this repo stay docs-only?** ✅
**Answered (7 Sep 2026): yes, conditionally.** William: "once we confirm all of these points we
can move to implementation but I want to ensure the set up is there, like a proper github, the
vercel set up and supabase project." So implementation is authorised **once the real
infrastructure exists** — a real GitHub repo (Q36), a Vercel project connected to it, and a
Supabase project — not before. This is now an infra checklist to work through, not an open
question. See `AGENTS.md` for what's been done and what's still needed.

**Q36 — Has a real GitHub repository been created yet?** ✅ **Answered (7 Sep 2026): confirmed
needed.** William: "this is one of the problems that we should be using github." This session's
git remote is still Cursor's own hosted git, not GitHub. **This agent cannot create the actual
GitHub repository itself** — for a New Project session that's a user action (the "Create repo"
control in the Cursor dashboard). Once a real repo exists, Vercel's automatic
Preview/staging/production deploys (the promotion path in `environments.md`) can import from it.

**Q37 — Vercel Hobby or Pro.** ✅ **Answered (7 Sep 2026): Hobby.** William: "let's keep it on
Hobby right now and if we need to upgrade we can." One account (William's) holds the Vercel
project; the GitHub repo remains the real shared-ownership mechanism. Upgrade to Pro later is a
low-friction, reversible decision if Shane/Tom ever need direct Vercel access — not a day-one
requirement.

**Q38 — Backups: Supabase Free has none.** ✅ **Answered (7 Sep 2026): confirmed, not a concern.**
William: "not too worried about the lack of backups." Stay on Supabase Free for both projects;
the occasional manual `pg_dump` documented in `environments.md` is enough — no Pro upgrade for
backups specifically.

**Q39 — Historical clean-sheet-under-60 behaviour.** ✅ **Double-confirmed, 7 Sep 2026 — memory and
the source document agree.** `data/legacy/rulesets.csv` (a verbatim extract of the sheets' own
`Points` tab) carries the club's own footnote for all three historical seasons: *"Half value if
under 60 minutes."* William, independently: "that was from my memory based on a rule change we
made this year" — i.e. his own recollection is that the hard zero-gate is new for 2026/27, which
is exactly what the footnote shows too (half credit 23/24–25/26, hard zero 26/27). Two
independent sources landing on the same answer — fully closed. (An earlier draft of
`pellet-index-rules.md` cited a different, fabricated-looking example as evidence — a sub scoring
4 as a defender for a partial clean sheet — which couldn't have existed since the sheets hold
season totals, not per-match records; that's been removed in favour of the real footnote.)

**Q40 — Does the SSFL have its own rule for abandoned matches?** ✅ **Answered (7 Sep 2026):
confirmed — replay, not "result stands."** William: "it follows FA rules... it would be replayed
at a later date, unknown at the time when that would be." So the CPO/CTO default was right in
shape but the club's real-world case is the common one, not the rare exception: an abandoned
match is recorded with whatever was captured before the stoppage (`fixture_status = abandoned`),
and once the league confirms it's being replayed, it's set to `void` (it doesn't count) with the
replay entered as its own new match once its date is known — which can lag well behind the
abandonment itself, so `abandoned` may sit un-replayed for a while and that's expected, not a
data-entry gap to chase.

**Q41 — Does an unused substitute who turned up owe a match fee?** New, from the CPO pass. £0 for
a silent no-show is settled (the −5 penalty is the sanction; charging a fee on top creates a debt
that never gets paid). But a sub who **travelled and sat on the bench** without coming on is a
genuine gap in "£12 for 60+ minutes, £6 for less" — some clubs split the pitch/ref cost across
everyone who showed up, bench included. 🟢 Default stays **£0** (only pitch-time creates a fee) so
build proceeds either way; the fee derivation is a single function so flipping this later is a
one-line change plus a recompute, not a schema change. Worth asking William alongside the D1–D3
crest/colour questions since those already have long human latency.

Everything else on GPT's list (ruleset JSON shape, migration tooling, RLS semantics, draft-merge
conflicts, fee correction behaviour, the `no_show`/`unused`/absence state model, friendlies as
fixture history, PPG, guest players mid-recording, admin ruleset self-service, rate limiting) had
a clear engineering or product answer and didn't need William's input — see the "✅ Resolved"
notes across `schema.md` and the ADRs for the reasoning on each.

Phase 0 has nothing left to chase.

---

## Scoring rules

**Q3 — Def Inf.** ✅ Flat +1 for a GK/DF who plays 60+ minutes. See **Answered**.

**Q4 — Clean sheets: whole match, or while on the pitch?** ✅ **Answered (6 Sep 2026): while on the
pitch only.** A defender subbed off at 61 minutes at 0–0 keeps the full clean-sheet bonus even if
the team concedes after they leave. Combined with the under-60 gate and the 26/27 tiering, this is
now a fully specified rule — see **Answered**.

**Q5 — How does the vote work?** ✅ Verbal, at the pub, self-voting allowed; anyone who played can
receive it regardless of pub attendance. See **Answered**.

**Q17 — What counts as an assist?** ✅ **Answered:** informal consensus, with the Captain/Manager
making the final call if there's disagreement. **A goal has 0 or 1 assist, never more.**

**Q18 — How are saves counted?** ✅ **Answered:** the keeper self-reports a single number after the
match, agreed with the Captain/Manager. No individual save events needed.

**Q19 — Does a late sub get the same appearance point?** ✅ **Answered:** yes, confirmed
intentional. Appearance (any minutes) and the 60-minute point are two separate, stackable
rewards — a full 90 gets both, an 88th-minute cameo gets only the appearance point.


**Q7 — Can the rules change mid-season?** ✅ **Answered: no.** The ruleset is locked for the whole
season once it starts. Simplifies the engine considerably — no retroactive recompute logic needed.

**Q6 / Q20 — The `FPL` column and `FPL comparison`.** ✅ **Answered:** not a multiplier at all —
the intent was "which real Fantasy Premier League player, in the same position, has a similar FPL
points total to this player," scaled for playing ~20 games a season instead of 38. **Explicitly
non-MVP** — deferred, not needed for v1.

**Q26 — The `Kit` column.** ✅ **Answered, and it's not a bug.** It was a deliberate **+1 point for
whoever washed the kit that week**, to stop the chore always falling on the same people. It only
ever got folded into the 2025/26 `Total` — **the club is discontinuing it for 26/27** (kit washing
will be drawn from a hat instead, no points attached). See **Answered** for what this means for
the import.

**Q19b — Blank vs. zero for saves, going forward.** ✅ **Answered:** the keeper will always report
a number (usually around 3), so this shouldn't come up in practice — but it's worth keeping the
distinction in the data model anyway for the rare match where genuinely nobody counted.

**Q19c — Second yellow and a red.** ✅ **Answered:** just −3. A second yellow converts to a red
card event; it doesn't also carry its own −1.

**Q29 — Unused substitutes.** ✅ **Answered: 0 points.** Being an unused sub on the bench doesn't
score the appearance point; only actually coming on does.

---

## The season, the club, the squad

**Q1 / Q27 / Q30 — Timeline and the game just played.** ✅ See **Answered**. One non-blocking loose
end: whether the pub vote for this game has already happened.

**Q28 — The 2026/27 ruleset.** ✅ See **Answered**.

**Q2 — Which team does the Pellet Index cover?** ✅ See **Answered**.

**Q11 — How much history to import?** ✅ **Answered:** your recommendation — import the three
seasons' totals as a read-only archive, and start full match-by-match detail from 2026/27.

**Q12 — Player identity mapping.** ✅ **Partially answered, rest deferred on purpose:** the
proposed name-pair mappings are confirmed correct. A full squad list and reconciliation is coming
later, from you directly, once we're in the data-import phase — not something to chase now. Noted:
guest/loan players from other teams occasionally turn out for the 1st team but never contend for
the Index since they only play a game or two — fine to include them, just expect them to sit near
the bottom.

**Q21 — Do guests and trialists belong on the leaderboard?** ✅ **Answered: yes, no threshold.**
As soon as you've played once, you're on the board.

---

## Match recording

**Q9 — Match-day detail level.** ✅ See **Answered**.

**Q8 — Availability and the drop-out penalty.** ✅ **Answered, and refined:** the squad list is
shared on WhatsApp before the match. The −5 penalty is really about **communication, not
timing** — telling the Manager you can't make it, even on the morning of the match, is fine and
isn't a drop-out. The penalty is specifically for **silence**: not showing up and not telling
anyone. (This corrects the original guess, which assumed the distinction was advance-notice vs.
day-of notice — it's actually notice vs. no notice, at any point.)

**Q22 — Are opposition details worth recording?** ✅ **Answered: no, just the final scoreline.**
The club doesn't know opposition players' names, so there's no goalscorer-level opposition data —
only team-level goals-against events (needed for **Q4**'s on-pitch clean-sheet logic), with no name
attached.

**Q23 — What competitions count?** ✅ **Answered:** everything except friendlies and tour games
counts. In practice that's the 14-match league programme plus roughly 6 cup games a season across
three cups — **MLIP** (~3 games), **CC** (~1 game), **FBC** (~2 games) — though the club is clear
these are rough estimates that vary year to year. Tour games don't count, but this is moot anyway
since the tour happens after the season finishes.

**Q31 — Substitution rules in practice.** ✅ **Answered:** rolling subs are used, and a player's
60-minute threshold can be met by **combining multiple stints** in the same match. In practice this
is rare — most players who come off don't come back on for meaningful time — so it doesn't need to
be a heavily engineered feature, just something the `Appearance.played60` judgement call already
naturally accounts for.

**Q32 — Practical defaults.** ✅ **Answered: there isn't a fixed default.** Kick-off varies a lot —
10am, 12pm, 10:30, 1pm or later depending on the opponent — so don't hardcode or default to 10:30
anywhere; it has to be entered per fixture. Captain and Manager for 2026/27 are confirmed via
**Q15** (Tom Heaton and Shane Livingstone).

---

## Product and platform

**Q15 — Who does what?** ✅ See **Answered**.

**Q16 / Q24 — Auth and public/private access.** ✅ **Answered and locked in (6 Sep 2026):** two
shared passphrases — a simple one for Viewer/Player, a slightly longer but still-memorable one for
Admin. No per-person accounts, no magic link. See **Answered**.

**Q10 — Subs and match fees.** ✅ **Answered, and this is new scope:** the app should track who's
paid and who hasn't. **£12 owed for playing 60+ minutes, £6 for playing less.** Drop `Yearly Subs`
entirely — not tracked going forward. This needs a small addition to the domain model (see
[`domain-model.md`](../01-domain/domain-model.md)).

**Q25 — Branding and name.** ✅ **Answered:** use the club's actual colours (need the hex/Pantone
values — Phase 3 task, not blocking now), and call the app **"Westminster Wanderers Pellet
Index"**, not just "Pellet Index." No WhatsApp posting integration needed.

**Q33 — Ownership.** ✅ **Answered:** this is exactly why GitHub, Vercel and Supabase were chosen —
so ownership and access can sit with a few people, and GitHub is the fallback route for someone
else to pick the project up if needed. This also confirms Supabase as the backend, not just an
option under consideration — see [`tech-stack.md`](../02-architecture/tech-stack.md).

**Q34 — Anything already in use?** ✅ **Answered:** the club uses **Stack** for availability
tracking today — this app doesn't need to replace that. Match results still get submitted to FA
Full-Time separately and that submission isn't changing or being replaced by this app.

---

## Integrations

**Q13 — How should fixtures get in?** ✅ **Answered: manual entry, no scraping.** Fixtures often
aren't known until the week before anyway, so there's no real upside to an importer even setting
aside the Cloudflare block. This simplifies Phase 2/3 scope — no fixture-import feature to build.

**Q14 — The 2026/27 Premier Division Full-Time IDs.** ✅ **Answered: not needed.** Directly follows
from Q13 — with no importer being built, there's nothing that needs these IDs.

---

## Answered

### Q4 — Clean sheets: on-pitch only
**Resolved (6 Sep 2026):** "goals conceded while on" means exactly that — only goals conceded
during a player's own time on the pitch count against their clean-sheet bonus. In the club's
example: a defender subbed off at 61 minutes in a 0–0 game keeps the **full** clean-sheet bonus
even if the team goes on to concede at 85 minutes, because they weren't on the pitch for it. This
was the last open half of Q4 — combined with the under-60 gate and the 26/27 half-credit tier
(both resolved earlier), the clean-sheet rule is now fully specified:

1. `played60 == false` → 0, full stop (the hard gate).
2. If `played60 == true`, look at goals conceded **while that player was on the pitch specifically**
   (not the whole-match scoreline): 0 conceded = full credit, 1 conceded = half credit (26/27's one
   rule change), 2+ = zero.

This has a real modelling consequence: the engine needs to know, for each opposition goal, roughly
*when* it happened relative to that player's substitution events (on before/after it, or off
before/after it) — not the scoreline at full time. Approximate sequencing (already the plan per Q9)
is enough; an exact minute is not required, just "before or after this substitution." (✅ this
ordering lives on `substitution` `match_events`, not a per-appearance `subSequence` field — see
`schema.md`.)

### Q17 — What counts as an assist
Informal group consensus on who gets it, with the Captain and/or Manager making the final call if
there's any disagreement. **A goal has 0 or 1 assist — never two players credited for the same
goal.** `MatchEvent` validation should enforce at most one assist per goal event.

### Q18 — How saves are counted
The goalkeeper self-reports a single number of saves after the match, agreed with whoever's
recording it (Captain/Manager/Admin). No need to log individual save events — just a count per
appearance, exactly as the legacy sheets did it.

### Q19 / Q29 — Appearance points, the 60-minute point, and unused subs
Three separate, confirmed facts about the same rule area:
- **Appearance** (1 point) and **played 60 minutes** (a separate 1 point) stack independently. A
  full 90 minutes earns both; an 88th-minute substitute appearance earns only the appearance point.
- **Unused substitutes score 0.** Sitting on the bench without coming on doesn't earn the
  appearance point — only actually playing does.

### Q7 — Mid-season rule changes
**Rules don't change mid-season — a ruleset is locked in for the whole season once it starts.**
This removes an entire category of engine complexity: no retroactive recompute logic is needed,
and a season's `Ruleset` can be treated as immutable from kickoff of matchday 1.

### Q6 / Q20 — What the `FPL` column and `FPL comparison` were for
Not a formula-driven multiplier despite looking like one (`Total × 1.3`, `× 1.5`). The actual
intent: figure out which real Fantasy Premier League player, in the same position, has a similar
FPL points total for that season, scaled up to account for the club playing roughly 20 games a
season against FPL's 38-game season. `FPL comparison` (which read "Coming Soon" in every sheet)
was presumably meant to name that comparable player and never got built. **Confirmed non-MVP** —
fun, not a priority, safe to leave out of the initial build entirely.

### Q26 — The `Kit` column was never a bug
It's a **deliberate +1 point for whoever washed the club kit that week** — introduced to spread the
chore around rather than letting it fall on the same one or two people every time. It only shows up
folded into the `Total` formula in the 2025/26 sheet (23/24 and 24/25 don't do this), which is why
the audit read it as an accidental bug rather than an intentional (if unusual) scoring line.

**For 26/27, this is being discontinued** — kit washing will be assigned by drawing from a hat
instead of being incentivised with points. So the app's live ruleset has no `Kit` line at all.

**What this means for the historical import:** since it was a real rule for that one season, not
an error, the published 2025/26 figures (Shane's 127, not a "corrected" 125, etc.) should probably
be **kept as the historical record as published**, not adjusted down — they're accurate to what
the club's own rules actually paid out that season. Worth a quick sanity check with the club during
the data-import phase, but there's no longer a strong reason to "fix" these numbers.

### Q11 — History import approach
Confirmed: import the three legacy seasons' totals as a **read-only archive** (`ImportedSeasonAggregate`,
already in the domain model) rather than trying to reconstruct old fixtures, team sheets or
goalscorers from FA Full-Time. Full match-by-match detail starts fresh with the 2026/27 season.

### Q12 — Player identity mapping
The proposed duplicate-name pairs are confirmed correct (`Volodymur Tymoshenko`/`Vlad Tymoshenko`,
`Lukman`/`Lukman Ipese`, `Mike Bayala-Addy`/`Mike Addy`, `Alex Hemmingway`/`Alex Hemingway`,
`Lewis Speirs`/`Lewis Spiers`, `David J`/`David Jennings`, `Bailey Flynn`/`Bailey Grant`, `Emil
Snow`/`Emil`). A full squad list and final reconciliation (including whether `David Jones` is a
separate person, and which one-off names are guests) is deliberately deferred — the club will
provide the full 1st-team player list directly when we're in the data-import phase. Also
confirmed: guest/loan players from other clubs occasionally turn out for the 1st team, are included
in the Index, but never contend for top spots since they only play a game or two.

### Q21 — Guests and trialists on the leaderboard
No minimum-appearances threshold. As soon as someone plays a single match, they appear on the
board — consistent with how the legacy sheets already worked.

### Q8 — Availability and the drop-out penalty
The squad is shared on WhatsApp ahead of each match, so everyone knows who's expected to play.
**The −5 "On The Day Drop Out / No Show" penalty is about communication, not timing:** telling the
Manager you can't make it — even on the morning of the match — is fine and doesn't trigger the
penalty. It's specifically for **not showing up and not telling anyone**. This corrects an earlier
assumption (that the distinction was "told in advance" vs. "told on the day") — it's really
"told at all" vs. "silence."

### Q22 — Opposition detail
Just the final scoreline. The club doesn't know opposition players' names, so there's no
goalscorer-level data for the opposition — only anonymous, team-level "goal conceded" events (still
needed, with approximate sequencing, to support Q4's on-pitch clean-sheet logic).

### Q23 — Which competitions count
Everything except friendlies and tour games. In practice: the 14-match league programme plus
roughly 6 cup games a season, spread across three cups the club actually enters — **MLIP** (~3
games), **CC** (~1 game), **FBC** (~2 games) — explicitly rough estimates that vary season to
season. Tour games don't count, though this rarely matters in practice since the tour happens after
the domestic season finishes. This is a good match for the historical appearance-count range
(14–24 a season) found in the audit.

### Q31 — Substitution rules in practice
Rolling substitutions are used, and a player's 60-minute threshold can be satisfied by combining
multiple stints in the same match (on, off, back on again). In practice this is rare — most
players who come off don't return for meaningful further time — so `Appearance.played60` staying a
single judgement-call boolean (rather than modelling individual stints) remains the right level of
detail; see **Q9**.

### Q32 — Practical defaults
No fixed default kick-off time — it genuinely varies by fixture (10am, 12pm, 10:30, 1pm, or later
depending on the opponent), so kick-off must be entered per match, never defaulted or assumed.
Captain and Manager for 2026/27 are Tom Heaton and Shane Livingstone, confirmed via **Q15**.

### Q10 — Match fees (new scope)
Confirmed the app should track who's paid their match fee and who hasn't: **£12 owed for playing
60+ minutes, £6 for playing less than that.** `Yearly Subs` is explicitly dropped — not tracked at
all going forward. This is a genuinely new feature (not just documentation of an existing rule) —
see the new Money/Fees section in
[`domain-model.md`](../01-domain/domain-model.md). A silent no-show owes **£0** — confirmed by the
CPO pass (7 Sep 2026): the −5 penalty is the sanction, and a fee on top would just be permanent
uncollected debt. The remaining nuance is narrower than "no-show" — see **Q41**: whether an unused
sub who *turned up* owes the £6 rate; default is no pending William's confirmation.

### Q25 — Branding and name
Use the club's real colours (still need the actual hex/Pantone values — a Phase 3 task). Name the
app **"Westminster Wanderers Pellet Index"** in full, not a shortened "Pellet Index." No need to
post results into a WhatsApp group.

### Q33 — Ownership and the tech stack
The choice of GitHub, Vercel and Supabase is explicitly about shared ownership — a few people can
hold access, and GitHub is the fallback if someone needs to pick the project up later. This
confirms Supabase as the actual backend decision, not one of several options still open — see
[`tech-stack.md`](../02-architecture/tech-stack.md), which has been updated accordingly.

### Q34 — Existing tools
The club uses **Stack** to track availability today, and that's not being replaced by this app.
Match results still get submitted to FA Full-Time separately (a requirement the club can't get out
of and doesn't want to) — this app is a companion for the Pellet Index and match history, not a
replacement for either of those.

### Q13 / Q14 — Fixture entry
No scraping or importer needed. Fixtures often aren't confirmed until the week before anyway, so a
Full-Time importer wouldn't save much even without the Cloudflare block. Manual entry it is — which
also makes Q14 (grabbing the 2026/27 Premier Division's Full-Time URL identifiers) moot; nothing
in the plan needs them any more.

### Q2 — Which team does the Pellet Index cover?
**1st team only, for now.** The club fields four teams in 2026/27; Pellet Index stays a 1st-team
competition unless the app proves itself. **Explicitly design as though more teams could be added
later** — `Team` should be a first-class entity from day one even with a single row in it, not
something bolted on afterwards. Don't build multi-team UI yet.

### Q1 / Q27 / Q30 — Timeline and the game just played
**Bath Old Boys United 1–2 Westminster Wanderers FC 1st Team**, played 6 September 2026 — an
**away** win, Bath Old Boys United hosting at **Clapham Common**. This is the first game of the
2026/27 season, which is what "our very first game in the Premier Division" meant (not the club's
first-ever Premier game — see
[`club-and-season-history.md`](../03-research/club-and-season-history.md) for the fuller division
history). **Confirmed a league (Premier Division) game.** This is the first result the app should
eventually be able to log properly — though not right now, per the club: "we aren't doing data
entry right now," consistent with staying in the planning phase. The pub vote for this game did
happen, but who got 3rd/2nd/1st is **data entry for the built app, not a research question** — the
club was clear this isn't something to chase down and record in a doc now (6 Sep 2026).

### Q15 / Q16 — Who does what, and how do they sign in
**Superseded and simplified (6 Sep 2026).** An initial pass drafted four named roles (Manager /
Captain / System Admin / Player-Viewer) with different permissions. The club then clarified this is
overbuilt: **"we don't need auth for players, just for the role of admin/manager/captain... maybe
it's just 2 roles, viewer/player and then admin privilege which we can give a few people."**

The model going forward is two tiers, not four:

| Tier | Who | Needs an account? |
| --- | --- | --- |
| Viewer/Player | Everyone — the whole squad, no distinction between them | **No** — open access |
| Admin | Shane Livingstone, Tom Heaton, William Goodwin to start | **At this point in the timeline: "yes."** See Q24 immediately below — this was corrected same-day to "no account, just a shared passphrase" |

There's no permission difference between Manager/Captain/System-Admin — they're just three named
holders of one Admin grant. Q16 initially proposed magic-link email auth for that group; Q24 then
suggested something simpler, and the two were reconciled and **locked in on 6 September 2026** —
see Q24 below for the final decision.

### Q24 — Public access, and the final auth decision: two shared passphrases
**Locked in (6 Sep 2026).** The club doesn't mind the app being public, and explicitly preferred a
simpler mechanism over per-person accounts ("I know it's less secure but that's not a priority").
The final shape, confirmed:

- **Viewer/Player: a simple, easy-to-remember shared passphrase.** One passphrase, known to the
  whole squad, gates the whole read side of the app (or the app could just be fully public — the
  passphrase is a light deterrent, not real security either way).
- **Admin: a second, slightly longer but still-memorable shared passphrase.** Known only to the
  small Admin group (Shane, Tom, William to start). Not per-person, not magic-link, not email-based
  — a single shared secret that unlocks write access.

**No per-person accounts, no email/magic-link provider, no admin-invite flow.** The trade-off,
accepted explicitly: there's no built-in way to tell *which* Admin made a given edit — if that ever
matters, the simplest fix is asking whoever's entering a match to add their name to a `notes` or
`enteredBy` free-text field, not a real auth upgrade. This is now closed — no further reconciliation
needed with Q16.

### Position per match — who decides
Not a numbered question above, but answered alongside the others: **the Captain and Manager decide
and know each player's position for a given match** — sometimes set before kick-off, sometimes only
clear afterwards — and it isn't written down anywhere separate from their own knowledge. This
confirms the domain model's existing assumption that position lives on the `Appearance` (per match,
per player), not on the `Player` record, and that whoever enters the match (Captain/Manager) is
the source for it — there's no independent record to reconcile it against.

### Q28 — The 2026/27 ruleset
**Frozen from 2025/26**, including the goalkeeper assist value of 5 (confirmed deliberate, not a
data-entry slip), the −5 on-the-day drop-out penalty, and the penalty-shootout block — **with
exactly one change: clean-sheet tiering** (see Q4 above and
[`pellet-index-rules.md`](../01-domain/pellet-index-rules.md)). Also now confirmed: the `Kit` point
is discontinued for 26/27 (see Q26), and rules are locked for the whole season once it starts
(see Q7).

### Q3 — What "Def Inf" means
**Not a raw stat.** It's a deliberate flat **+1 point for a GK or DF who plays 60+ minutes**, added
specifically to compensate for how hard clean sheets are to come by in Sunday league — a
consolation/participation point for defensive positions, not a tackles/interceptions/clearances
count. Fires on `position ∈ {GK, DF} AND played60`, nothing else. (The small discrepancies the
audit found — e.g. Shim Ratynski's 18 sixty-minute games vs. 17 Def Inf points — are most likely
historical data-entry noise in the sheet, not evidence of a different rule.)

### The under-60-minutes gate and the 26/27 clean-sheet tiers
**Conceded points are confirmed capped at −2** for 3+ goals conceded — deliberate, so a heavy
defeat doesn't cost a defender/keeper more than their Def Inf point is worth. MD/FW never receive
or lose conceded points.

**Clean-sheet credit changes for 2026/27 — this is the one scoring rule change this season:**

| Goals conceded while on | 25/26 and earlier | 26/27 |
| --- | --- | --- |
| 0 | Full credit (8/8/4/2, if 60+ mins) | Unchanged — full credit |
| 1 | **Zero** — any goal conceded wiped out the clean sheet | **Half credit (new)** |
| 2+ | Zero | Unchanged — zero |

**Under 60 minutes, confirmed (6 Sep 2026):** ineligible outright for Def Inf *and* the clean-sheet
bonus, regardless of the scoreline while on — this is a hard gate applied *before* the table above,
not a halving that stacks with it. In the club's words: "under 60 minutes makes you ineligible for
any bonuses like Def Inf or clean sheet bonuses, regardless of whether you kept a clean sheet in
the small time frame you were on." **This genuinely is a rule change, not an inconsistency to
sanity-check** — see **Q39**: the historical seasons' own `Points` tab footnote confirms 23/24–25/26
gave *half* credit under 60 minutes, so 26/27's hard zero-gate is a deliberate tightening, both
sides already correctly encoded; see
[`pellet-index-rules.md`](../01-domain/pellet-index-rules.md) for the full note.

The remaining ambiguity in this area — whole-match scoreline vs. on-pitch-only for "goals
conceded" — is now resolved too: **on-pitch only**. See Q4 above.

### Q5 — How the vote works
**Verbal, in person, at the pub after the match** — self-votes allowed, though frowned upon
socially. **Confirmed (6 Sep 2026):** anyone who **played** can receive the 3-2-1, whether or not
they went to the pub; only pub attendees vote. No minimum or maximum number of voters — "sometimes
3-4 people, sometimes up to 10... it's not that deep." There's no digital ballot today; whoever
runs the vote informally ends up with a 1st/2nd/3rd, which then needs entering into the app after
the fact — this favours a "certified result" design (an Admin types in the final 3-2-1) over an
in-app ballot for v1. The one loose end — tie-breaking for 2nd/3rd — reads as low-stakes given the
club's own framing, so treat as resolved socially unless told otherwise.

### Q9 — Match-day recording detail
**Deliberately lightweight — don't overcomplicate this early.** Starting XI + a subs list is "the
main thing." For substitutions, only a **rough idea of when** (order/sequence, not a
stopwatch-accurate minute). For events (goals for/against, cards, etc.) the club knows something
happened and has a rough sense of who was on the pitch and the order things happened in, but **no
exact minutes for anything** — not their own goals, not the opposition's, not cards. Build the
domain model around a simple ordered sequence per match, not `PlayingStint` intervals or a
`MatchEvent.minute` field — that precision will never exist for this club's Sunday mornings.
