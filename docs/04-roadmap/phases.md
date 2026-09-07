# Delivery phases

The agreed sequence is plan → frame and structure → data → UI and design. Phases are gated on
answers, not on time: each one lists what has to be settled before it starts.

---

## Phase 0 — Planning and research ← **done**

**Goal:** understand the domain well enough that the build doesn't have to guess.

- [x] Audit the three legacy spreadsheets and extract the data
- [x] Reverse-engineer the scoring rules and verify them against published totals
- [x] Document how the rules changed across seasons
- [x] Research the SSFL and whether FA Full-Time data is obtainable
- [x] Survey existing grassroots apps
- [x] Draft the domain model
- [x] Set up the docs structure and `AGENTS.md`
- [x] **Get answers to the blocking open questions** — done as of 6 Sep 2026. No question was ever
  tagged 🔴, every 🟠 has landed, and the last architecture pick (auth mechanism) was locked in the
  same day. Only a handful of low-priority 🟢 loose ends remain, deliberately deferred (see
  [`open-questions.md`](../00-product/open-questions.md)'s **Still open** section).

**Exit criteria:** every 🔴 question in
[`../00-product/open-questions.md`](../00-product/open-questions.md) is answered. ✅ **Fully met**
— nothing is blocking the move into Phase 1.

---

## Phase 1 — Frame and structure ← **current (docs done; code next)**

**Goal:** a running application skeleton with a correct schema and a proven scoring engine.

- [x] Confirm the stack and write the ADRs —
  [`engineering-guide.md`](../02-architecture/engineering-guide.md),
  [`connections.md`](../02-architecture/connections.md),
  [`environments.md`](../02-architecture/environments.md), ADRs 0004–0010,
  [`schema.md`](../02-architecture/schema.md)
- [ ] Scaffold the app, database and migrations (Stream A)
- [ ] Implement the schema in Drizzle and migrate with Drizzle Kit — the sole migration
      authority for v1, no separate Supabase CLI migration (Stream C)
- [ ] Build the scoring engine as a pure module (Stream B)
- [ ] Load all four rulesets (23/24 through 26/27)
- [ ] **Prove the engine** with synthetic matches + CSV aggregate import (we cannot replay
      23–26 from events; they do not exist)
- [ ] Passphrase cookies (ADR 0005)
- [ ] Deploy a **staging** URL to Vercel (custom env `staging` or Hobby branch domain).
      Production comes later — see [`environments.md`](../02-architecture/environments.md)

**Blocked on:** nothing. Build order and parallel streams are in the engineering guide.

**Exit criteria:** engine tests green against the golden cases in `pellet-index-rules.md`, schema
matches `schema.md`, empty shell on the **staging** URL. Sign-in is a passphrase sheet, not an
account. Production is not required to exit Phase 1.

---

## Phase 2 — Data

**Goal:** real data in, correctly.

- Squad management for 2026/27, with the club providing the full player list directly (Q12)
- Manual fixture entry — **no importer** (confirmed Q13, dropped from scope entirely)
- Match recording: result, team sheet, positions, substitutions, events (assists max 1/goal,
  self-reported saves, opposition goals anonymous — all confirmed, see
  [`pellet-index-rules.md`](../01-domain/pellet-index-rules.md))
- The bonus result entry: a simple "certified 3-2-1" form, not a voting window/ballot (confirmed
  Q5 — the vote itself is verbal, at the pub)
- **Match fee tracking** (new scope, confirmed Q10): £12/£6 per appearance based on `played60`,
  simple paid/unpaid ledger
- Legacy import: three seasons of totals as a read-only archive, **keeping the 2025/26 kit-washing
  points as published** (confirmed Q26 — not a bug to correct)
- Backfill the 2026/27 season so far

**Blocked on:** nothing from the open-questions list — Q1, Q2, Q7, Q8, Q9, Q10, Q11, Q12, Q13,
Q17, Q18, Q19, Q22, Q23, Q26, Q29, Q31 are all resolved. The only real remaining task inside this
phase (not a blocker to starting it) is the full squad/player-identity reconciliation the club
said they'd provide once we're here (Q12).

**Exit criteria:** a real match can be recorded end to end, the certified bonus result entered,
and the resulting Pellet points are correct without anyone touching a spreadsheet.

---

## Phase 3 — UI and design

**Goal:** something people want to open.

- The season leaderboard, public by default (confirmed Q24 — no complex privacy routing needed)
- Club branding — **Matchday Print is already specified** in
  [`../05-design/DESIGN.md`](../05-design/DESIGN.md). Hex values are tokens; the CDO can override.
- **Per-player match breakdown** — the highest-value screen in the app. `PelletScore` +
  `ScoreLedger` is the design review gate (engineering guide Stream D).
- Player season pages and career views
- Match pages with timeline and team sheet
- Team stats: home/away, form, on-pitch goals for and against (on-pitch only, per the resolved
  clean-sheet logic in Q4)
- Mobile polish, empty and loading and error states, PWA install
- **Stretch, not blocking:** a read-only `/rules` page rendering the active ruleset in plain
  English — the cheap alternative to a self-service ruleset editor (see
  [ADR 0002](../02-architecture/adr/0002-versioned-rulesets.md))

**Blocked on:** nothing. Design docs exist; implementation follows Stream D in the engineering
guide. D1–D3 (exact hex, paper vs navy, crest SVG) are club tokens, not blockers.

**Exit criteria:** the squad uses it on a Sunday evening without being asked to.

---

## Later

Ordered by expected value, not effort:

- **Shareable player season cards.** Cheap once the data exists, and the most engaging thing
  comparable apps offer.
- **The season race chart.** League position over time rather than a static table.
- **End-of-season awards deck**, generated from the data.
- **Head-to-head and opponent history.**
- **Availability and squad selection.** Confirmed **not needed** — the club already uses **Stack**
  for this (Q34). Only revisit if that changes.
- **Full offline Index / PWA.** Recorder **drafts** are v1 (ADR 0008). A service worker is not.
- **Push notifications** to nudge voting.
- **A real digital voting ballot**, if the club ever wants the pub vote itself to move into the
  app (it doesn't for v1 — see Q5, and the deferred `VoteWindow`/`Vote` sketch in
  [`domain-model.md`](../01-domain/domain-model.md)).
- **FPL comparison feature** (which real Premier League player is this player like?) — confirmed
  fun but explicitly non-MVP (Q6/Q20).

## Explicitly not planned

- **Multi-club SaaS.** Confirmed (Q2): the app should model `Team` as a real entity so the other
  Westminster Wanderers teams *could* be added later, but building multi-team UI now is explicitly
  out of scope.
- **Any FA Full-Time integration** (scraping, an API client, or a browser-side importer).
  Confirmed (Q13): manual entry only, permanently, not just for v1 — fixtures often aren't known
  far enough in advance for automated import to help anyway.
- **Replacing Stack** (availability) or **FA Full-Time result submission** (Q34) — both stay
  exactly as they are today, outside this app.
- **Yearly subs tracking** (Q10) — explicitly dropped, unlike match fees, which are in scope.
- Payments processing. AI match reports. Live in-play commentary.
