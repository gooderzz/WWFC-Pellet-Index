# AGENTS.md — Westminster Wanderers Pellet Index

Entry point for any AI agent or new contributor working in this repo. Read this first, then
follow the links to the deeper docs. Keep this file current: if you add a doc, add it to the map.

## What this project is

An interactive web application for **Westminster Wanderers FC**, a Sunday league club playing in
the **Southern Sunday Football League (SSFL)**, London. It replaces a set of Google Sheets that
the team has used for three seasons to run the **Pellet Index** — an in-house, fantasy-football
style performance tracker where players earn points for appearances, clean sheets, goals, assists,
saves, cards and so on, plus 3/2/1 bonus points from a post-match team vote.

The app also has to be the club's record of the season itself: fixtures, results, who played, who
started, who came off the bench, and per-player match stats.

## Current status

**Phase 1 — frame and structure.** Planning is closed. Design is written. The engineering
contract is written. **No application code exists yet** — that is still deliberate until someone
is asked to scaffold.

1. Plan and gather context — ✅ closed 6 Sep 2026 (Sonnet + the club)
2. Frame and structure — ✅ **docs done 7 Sep 2026.** Next: scaffold Next.js / Supabase when asked
3. Data (legacy import, scoring engine, seeding)
4. UI — visual contract already in [`docs/05-design/`](docs/05-design/); implement against it

**Read this order in a new session:** `git pull`, this file, then
[`docs/02-architecture/engineering-guide.md`](docs/02-architecture/engineering-guide.md). Do not
re-ask the planning questions. Do not chase the 6 Sep 3/2/1. Before any `vercel env`,
`drizzle-kit migrate`, or `--prod`, read
[`docs/02-architecture/environments.md`](docs/02-architecture/environments.md).

[`docs/05-design/DESIGN.md`](docs/05-design/DESIGN.md) is binding UI. The CDO wrote it ahead of
the original "UI last" sequence on purpose so nobody ships generic AI chrome.

## 7 September 2026 — CPO/CTO review closed the last engineering + product gaps

A fresh outside read of every doc (GPT 5.6) found real internal contradictions and open
edges — mostly one early doc (`product-brief.md`) not catching up with later decisions, plus a
dozen genuine unanswered engineering/product questions. Sonnet orchestrated a CPO pass (Claude
Opus 5) and a CTO pass (Cursor Grok 4.6) to close them; both are now folded into the docs
in-place (search any file for "✅ Resolved" + "7 Sep 2026" / "CPO review" / "CTO review" to find
the specific fix and rationale). Headlines, so you don't have to re-derive them:

- **`appearances.role` simplified** to `started substitute unused no_show` — a communicated
  absence, at *any* notice, gets **no row at all**; only silent no-shows are penalised. The old
  `dropped_out` role tried to capture a state the club never actually described. See `schema.md`.
- **`competitions.type` gained `friendly`, gated by a `counts_for_pellet` boolean, not the label**
  — friendlies never score, but can be logged as bare fixture history so the season calendar has
  no unexplained gaps; the engine checks the boolean, never infers scoring eligibility from what
  a competition is called.
- **`appearances.sub_sequence` is gone.** `substitution` `match_events` (on/off, either side
  nullable) are the sole source of who was on the pitch — a single integer per appearance
  couldn't represent a rolling sub. Order only ever matters for opposition-goal-vs-substitution;
  everything else is order-independent.
- **PPG ships in v1** (season total ÷ started/substitute appearances, no minimum-appearance
  threshold) and an **admin can add a guest player inline** while recording a match (name +
  optional position, `status = guest`, dedup later on `/squad`). Match-fee corrections display
  "£X of £Y paid" or "£X in credit" rather than ever un-paying someone; the fee UI itself stays a
  single paid/unpaid tap, never a partial-amount entry.
- **A match in `awaiting_votes` is fully visible** on the public Index/match page (result, team
  sheet, every non-bonus point) with a "bonus not certified yet" note — it doesn't hide until the
  3-2-1 is typed in.
- **Finalising (`awaiting_votes` → `final`) is blocked only by the certified 3-2-1.** Missing GK
  saves warns, never blocks.
- **Abandoned matches score normally** (whatever was captured before the stoppage), unless the
  league itself voids the result — that's a per-match `fixture_status` choice, not a blanket rule.
- **Extra-time goals are ordinary goals.** No distinction, no new field — there's no minute to
  distinguish by anyway.
- **Drizzle Kit is the sole migration authority for v1** — `schema.md`, `engineering-guide.md`
  and `phases.md`'s stray "Supabase migration" mentions were stale; `connections.md` already had
  it right.
- **RLS-on-with-no-policies does not restrict the app's own server connection** (the pooler user
  is the table owner, which Postgres exempts from RLS by default) — it only blocks a leaked key
  from reading via the Data API. Do not set `FORCE ROW LEVEL SECURITY`.
- **The checked-in TypeScript ruleset files are canonical**, not the database row — the DB copy
  is generated from them, checked for drift by a test. Practical effect: **changing next
  season's rules is a small pull request, not an admin UI**, for v1.
- **Correcting `played_60` updates a fee's `amount_owed` in place and never touches
  `amount_paid`/`paid_at`.** Fees are `UPDATE`, not delete-and-reinsert, unlike scores.
- **`match_events` drafts merge by union of ids, not whole-group last-write-wins** — the other
  three field groups (result/sheet/bonus) are fine with simple timestamp-wins.
- **Vercel Hobby is the default**, not Pro — see the one open caveat about single-account
  ownership in `environments.md`, which is a genuine question for William, not an engineering
  call.
- **A lightweight ops/security policy now exists**: passphrase rotation runbook, a proportionate
  (not enterprise) rate-limit, and an honest statement of Supabase's backup tiers — see
  `environments.md` and [ADR 0005](docs/02-architecture/adr/0005-shared-passphrases.md).
- **Passphrase rotation needs both env vars, not one.** Changing `ADMIN_PASSPHRASE` alone does
  **not** log out an already-unlocked browser — the `ww_admin` cookie is signed with
  `SESSION_SECRET`, not derived from the passphrase. To actually kick out every existing admin
  session (the case that matters if the passphrase leaked), rotate `SESSION_SECRET` too. See
  [ADR 0005](docs/02-architecture/adr/0005-shared-passphrases.md).
- **Supabase Free-tier projects pause after ~1 week idle** — a real risk given a Sunday league's
  off-season (May–August has no matches at all). Unpausing both projects belongs on whatever
  checklist marks the start of pre-season. See `environments.md`.
## 7 September 2026 (evening) — William answered Q35–Q40; implementation is authorised, conditionally

Every remaining CPO/CTO-review question has a real answer now (see
[`open-questions.md`](docs/00-product/open-questions.md)'s **7 September 2026** section for the
exact quotes and reasoning) — only **Q41** (does an unused-but-turned-up sub owe the £6 fee) is
still genuinely open, and it's non-blocking. Headlines:

- **Implementation is authorised, but conditional on real infrastructure existing.** William:
  "once we confirm all of these points we can move to implementation but I want to ensure the
  set up is there, like a proper github, the vercel set up and supabase project." **Do not start
  Phase 1 Stream A/B (the Next.js scaffold) until the infra checklist below is done** — that's
  the actual gate now, not a documentation question.
- **A real GitHub repo is confirmed neede