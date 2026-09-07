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
- **A real GitHub repo is confirmed needed** ("this is one of the problems that we should be
  using github") — but **this agent cannot create the repository itself.** For a New Project
  session, that's a user action: click **Create repo** in the Cursor dashboard. Once it exists,
  push this branch's history to it and everything downstream (Vercel import, CI) can proceed.
- **Vercel: staying on Hobby** ("let's keep it on Hobby right now and if we need to upgrade we
  can"). One account, upgradeable later — not a day-one blocker.
- **Supabase: staying on Free, backups are not a concern** ("not too worried about the lack of
  backups"). No Pro upgrade needed for this.
- **Q39 (historical clean-sheet-under-60) is closed twice over** — the legacy sheet's own
  footnote and William's independent memory ("that was from my memory based on a rule change we
  made this year") agree: half credit through 25/26, hard zero from 26/27.
- **Q40 (abandoned matches) is closed** — the SSFL follows FA rules, which means a replay at a
  later date (unknown at the time of abandonment), not the partial result standing. The abandoned
  match is recorded as `abandoned` with whatever was captured; once the league confirms a replay,
  it flips to `void` and the replay is entered as its own new match when its date is known.

### Infra checklist — real progress, updated 7 September 2026 (evening)

Vercel and Supabase were already connected to this session, so two steps happened immediately
rather than waiting on the GitHub blocker. **Live status — see `environments.md`'s "Provisioning
status" table for the full detail:**

1. ✅ **Vercel team confirmed:** `williamgoodwin-myyahoocoms-projects`, Hobby plan — matches Q37.
2. ✅ **Supabase org confirmed:** "WWFC Pellet Index" (`waqufdoqwnbrlyownopn`).
3. ✅ **Supabase staging project created:** `ww-pellet-staging` (ref `serzpztmxjozztzickqz`,
   region `eu-west-2`/London, Free tier, $0/month). Empty — no schema, migrations or seed data
   yet.
4. ⚠️ **Supabase production project creation failed — a real blocker, not a policy choice.**
   Supabase's Free tier caps an *account* at 2 active free projects across every organisation it
   owns/administers, and William's account is already at that cap from something outside this
   workspace. **Needs William:** either pause/delete whatever that other free project is, or
   upgrade one project to Pro ($25/mo) to stop it counting against the cap — then production can
   be created. (This is also genuinely fine to defer: `environments.md`'s own build order says
   not to create production until staging has been proven on a phone, so this isn't urgent yet.)
5. ❌ **GitHub repository still not created.** William clicks **Create repo** in the Cursor
   dashboard — this agent cannot create it directly for a New Project session. Nothing about
   Vercel project creation or CI can proceed without this.
6. ❌ **Vercel project for this app not created yet** — deliberately waiting for the GitHub repo
   so it can be git-linked at creation time, matching the Preview/staging/production promotion
   path in `environments.md`, rather than creating a disconnected project now.
7. Once the repo exists: push this branch's history to the new GitHub remote (add it alongside
   the existing Cursor-hosted `origin`, don't replace `origin` — that keeps this dashboard in
   sync), import into Vercel, wire up env vars (`connections.md`/`environments.md`), then Phase 1
   Stream A (the Next.js scaffold) can start.

## Doc map

| Doc | What's in it |
| --- | --- |
| [`docs/README.md`](docs/README.md) | Index of all documentation |
| [`docs/00-product/product-brief.md`](docs/00-product/product-brief.md) | Why this exists, who uses it, what a good v1 looks like |
| [`docs/00-product/personas-and-jobs.md`](docs/00-product/personas-and-jobs.md) | The four user types and the jobs they need done |
| [`docs/00-product/open-questions.md`](docs/00-product/open-questions.md) | **Planning Q&A, all answered.** Do not re-ask |
| [`docs/00-product/glossary.md`](docs/00-product/glossary.md) | Pellet Index, Def Inf, SSFL, and other terms of art |
| [`docs/01-domain/pellet-index-rules.md`](docs/01-domain/pellet-index-rules.md) | **The scoring rules.** The single source of truth for how points are awarded |
| [`docs/01-domain/scoring-rule-history.md`](docs/01-domain/scoring-rule-history.md) | How the rules changed between 23/24, 24/25 and 25/26, and why versioning matters |
| [`docs/01-domain/domain-model.md`](docs/01-domain/domain-model.md) | Entities and relationships. Physical columns: `schema.md` |
| [`docs/01-domain/legacy-spreadsheets.md`](docs/01-domain/legacy-spreadsheets.md) | Audit of the three Google Sheets: structure, quirks, data-quality issues |
| [`docs/02-architecture/engineering-guide.md`](docs/02-architecture/engineering-guide.md) | **The implementation contract.** Stack, layout, principles, tandem streams |
| [`docs/02-architecture/schema.md`](docs/02-architecture/schema.md) | Physical Postgres schema, RLS, ruleset JSON |
| [`docs/02-architecture/tech-stack.md`](docs/02-architecture/tech-stack.md) | Why this stack (short). Detail lives in the engineering guide |
| [`docs/02-architecture/connections.md`](docs/02-architecture/connections.md) | **How Vercel talks to Supabase.** IPv4, shared pooler, two URLs |
| [`docs/02-architecture/environments.md`](docs/02-architecture/environments.md) | **Local, staging, production.** Two Supabase projects, one Vercel project, agent deploy rules |
| [`docs/02-architecture/adr/`](docs/02-architecture/adr/) | ADRs 0001–0010 |
| [`docs/03-research/ssfl-and-fa-fulltime.md`](docs/03-research/ssfl-and-fa-fulltime.md) | The league, its divisions, and how (and whether) we can get data out of FA Full-Time |
| [`docs/03-research/club-and-season-history.md`](docs/03-research/club-and-season-history.md) | Club profile, ground, division history, league tables, Pellet roll of honour |
| [`docs/03-research/competitive-landscape.md`](docs/03-research/competitive-landscape.md) | Existing grassroots apps and what we should and shouldn't copy |
| [`docs/04-roadmap/phases.md`](docs/04-roadmap/phases.md) | Delivery phases and what "done" means for each |
| [`docs/05-design/DESIGN.md`](docs/05-design/DESIGN.md) | **The design contract.** Exact tokens, type scale, motion, and a list of banned patterns. Read before writing any UI |
| [`docs/05-design/brand-foundation.md`](docs/05-design/brand-foundation.md) | Palette derivation, typography, voice, the *Matchday Print* concept |
| [`docs/05-design/component-system.md`](docs/05-design/component-system.md) | Token → primitive → domain → page layering, shadcn deviations, drift governance |
| [`docs/05-design/ux-and-flows.md`](docs/05-design/ux-and-flows.md) | Roles, screen inventory, and the pub match-recording flow |
| [`docs/05-design/handoff-brief.md`](docs/05-design/handoff-brief.md) | What the architecture must support, build order, open design items |
| [`data/legacy/`](data/legacy/) | Reference extracts from the historical spreadsheets |

## Facts an agent should not have to rediscover

- **Club:** Westminster Wanderers FC. Registered on FA Full-Time as *Westminster Wanderers FC 1st
  Team*. The wider club has run up to four teams; **confirmed the Pellet Index covers the 1st
  team only for now, but `Team` is a first-class entity from day one** so more teams can be added
  later without a schema change. See open question **Q2**.
- **League:** Southern Sunday Football League, league ID `3545957` on FA Full-Time.
  <https://fulltime.thefa.com/index.html?league=3545957>
- **Division 2026/27:** Supreme Trophies Graham Dodd Premier Division. Public records show the
  club has played at this level before — 2023/24 and 2025/26. **Confirmed (Q27):** "our very
  first game in the Premier Division" meant *first game of the 2026/27 season*, not a first-ever
  Premier Division appearance.
- **Home ground:** The Griffin Sports Ground, Turney Road, Dulwich. **Kick-off has no fixed
  default — confirmed it varies** (10am, 12pm, 10:30, 1pm, or later). Never hardcode a kickoff
  time; it's entered per fixture.
- **Seasons run** roughly September to May/July. The league programme is 14 matches; **confirmed
  (Q23) everything except friendlies and tour games counts** toward the Pellet Index, which in
  practice adds roughly 6 cup games a season across three cups the club actually enters — `MLIP`
  (~3), `CC` (~1), `FBC` (~2), all rough estimates. This matches the 14–24 appearances regulars
  actually record.
- **Positions** used by the scoring system are `GK`, `DF`, `MD`, `FW` — recorded **per
  appearance**, not fixed per player, and confirmed the Captain and Manager decide/know it
  (before or after kick-off) rather than it being written down anywhere else. See
  [`docs/01-domain/pellet-index-rules.md`](docs/01-domain/pellet-index-rules.md).
- **Auth model, confirmed and locked in (Q15/Q16/Q24, 6 Sep 2026):** just **two tiers**, and the
  mechanism is fully decided: **two shared passphrases, no accounts at all.** A simple,
  easy-to-remember passphrase gates Viewer/Player (or the app can just be public — the club
  doesn't mind either way). A second, slightly longer but still-memorable passphrase gates Admin
  write access, known to a small, extensible set of named people — Shane Livingstone, Tom Heaton,
  William Goodwin to start, more can be added later. **No magic link, no email provider, no
  per-person accounts, no user table.** There's no permission split between Manager/Captain/
  System-Admin either; they're just three named holders of the one Admin passphrase. Tom and
  Shane are expected to do most of the actual data entry, from their phones, at the pub, right
  after the match. Don't build a four-role permission system, and don't build per-person auth —
  the accepted trade-off is no built-in audit trail of *which* Admin made an edit; if that ever
  matters, use a free-text "entered by" note, not a real login system.
- **Tech stack, confirmed (Q33) and specified (7 Sep 2026):** GitHub + Vercel + Supabase, so
  ownership can be shared. Implementation: Next.js App Router, TypeScript, Tailwind v4, shadcn
  restyled to Matchday Print, Drizzle + **postgres.js** over the **shared transaction pooler**
  (IPv4 — Vercel cannot reach the IPv6 direct host), two passphrase cookies, Vitest, Node 24 /
  Fluid Compute, no Edge runtime. Connection strings: see
  [`docs/02-architecture/connections.md`](docs/02-architecture/connections.md).
  **Environments (ADR 0010):** local + Vercel Preview/Staging share Supabase
  `ww-pellet-staging`; production (`main`) is `ww-pellet-prod` only. Playbook:
  [`docs/02-architecture/environments.md`](docs/02-architecture/environments.md).
  Never `vercel promote`. Never put production URIs in `.env.local`.
- **Existing tools, confirmed (Q34), not being replaced:** the club uses **Stack** for availability
  tracking already — don't build a competing availability/squad-selection feature. Match results
  still get submitted to **FA Full-Time** separately, unchanged by this app.
- **Match fees, confirmed new scope (Q10):** track who's paid per match — **£12 for 60+ minutes
  played, £6 for less.** `Yearly Subs` is dropped entirely, not tracked. See the new Money/Fees
  section in [`docs/01-domain/domain-model.md`](docs/01-domain/domain-model.md).
- **Scoring details confirmed (Q4, Q7, Q8, Q17–Q19c, Q22, Q26, Q29):**
  - Clean sheets/conceded are counted **on-pitch only** (a player's own time on the pitch), not the
    whole-match scoreline — this was the last real scoring ambiguity, now fully closed.
  - **Rules never change mid-season** — a ruleset is locked for the whole season once it starts.
  - The drop-out/no-show −5 is about **communication, not timing**: telling the Manager even on
    match morning is fine; it's genuine silence (no notice at all) that's penalised.
  - **Assists:** informal consensus, Captain/Manager has final say, **0 or 1 per goal, never 2**.
  - **Saves:** goalkeeper self-reports one number per match, agreed with Captain/Manager — no
    individual save events.
  - **A second yellow = a single red card event (−3), not −1 and −3 stacked.**
  - **Opposition goals are anonymous** — scoreline only, no opposition player names, ever.
  - **`Kit` was never a bug** — it was a deliberate +1 for washing the kit, real only in 2025/26,
    now **confirmed retired** for 26/27 (drawn from a hat instead). Historical 2025/26 totals
    should be imported **as published**, not "corrected."
  - **Unused substitutes score 0** — only actually playing earns the appearance point.
  - `FPL` / `FPL comparison`: confirmed meaning (a real-FPL-player comparison), confirmed
    **non-MVP**, not being built.
- **26/27 season opener, confirmed:** Bath Old Boys United 1–2 Westminster Wanderers FC 1st Team,
  a **league** (Premier Division) game, played 6 September 2026 at Clapham Common (Bath Old Boys
  United's home ground) — an away win. **The pub vote for this game has already happened, but who
  got 3rd/2nd/1st is not tracked anywhere in this repo — that's data entry for the built app, not
  a research task, and the club was explicit about not wanting it chased down and written into a
  doc now.** Don't go looking for it; it'll be entered once the app exists (6 Sep 2026).
- **26/27 ruleset, confirmed:** frozen from 25/26 with one change to the numbers — clean sheet
  credit is now tiered by goals conceded while on: 0 conceded = full credit, **1 conceded = half
  credit (new)**, 2+ conceded = zero — **plus a confirmed eligibility gate: under 60 minutes means
  zero for Def Inf and the clean-sheet bonus, full stop, no partial/quarter credit, regardless of
  the scoreline while on.** (This gate reads stricter than the "halved if <60" pattern the sheet
  audit found in 2025/26 data — flagged in
  [`pellet-index-rules.md`](docs/01-domain/pellet-index-rules.md) as worth double-checking, not
  blocking.) The conceded penalty cap (−2 max, at 3+ conceded) is unchanged and confirmed
  deliberate. The bonus vote (3/2/1) stays entirely verbal, at the pub, self-voting allowed —
  anyone who **played** can receive it whether or not they went to the pub, but only pub attendees
  vote, with no min/max headcount. The app just records the certified result.
- **Match logging, confirmed:** no exact minutes, ever — only a rough chronological order of who
  was on the pitch and what happened. Design around simple ordering/sequencing, not a `minute`
  field or `PlayingStint` intervals.
- **The legacy sheets store season totals in points, not raw event counts.** A cell reading `56`
  under "Goals" means 56 points, i.e. 14 goals for a forward. This trips people up constantly.
- **The 2025/26 `Total` column includes the `Kit` column, worth 1 to 4 points per player — but
  this is confirmed a real rule (a kit-washing incentive), not a bug.** Import 2025/26 as
  published; don't "correct" it down. See Q26.
- **A blank cell in the sheets means zero**, not unknown.
- **FA Full-Time is behind Cloudflare** and returns HTTP 403 to requests from this VM — moot now
  anyway, since **the club confirmed manual entry only, permanently, no importer of any kind**
  (Q13). Results still get submitted to Full-Time separately by the club, unchanged.
- **Never put personal data in this repo.** Drive holds a `WWFC | DOBs` file and the spreadsheet
  owners' personal email addresses. Neither belongs in the product or the codebase.
- **Two more things are deliberately deferred, not planning gaps — don't try to close them now
  (confirmed 6 Sep 2026):**
  - **Full squad/player-identity list (Q12):** the club will supply real names when the
    data-import work starts (Phase 2). The name-pairs already confirmed correct are enough for
    now.
  - **Actual club colour values (Q25):** ✅ **now proposed, awaiting one confirmation.** The palette
    was derived from the club's Hope & Glory kits — yellow with navy on the home shirts, electric
    yellow and black on the 2025 tour strip — and every contrast ratio was computed rather than
    estimated: yellow `#FFD400`, navy `#0B1B3F`, paper `#F7F4ED`. See
    [`docs/05-design/brand-foundation.md`](docs/05-design/brand-foundation.md). Two things still
    need a human answer: whether the club has real brand values or a crest file that should
    override the inference, and paper- versus navy-dominant surfaces. Neither blocks anything —
    colours are tokens. **Do not generate a club crest**; use the typographic `WW` lockup until the
    real one arrives.

## Working agreements

- **Do not re-open closed questions.** Planning is done. If something *new* is ambiguous, add it
  to `docs/00-product/open-questions.md` rather than guessing in code. Do not re-ask Q1–Q40; Q41
  is the only genuinely open numbered question left, and it's non-blocking.
- **The rules are data, not logic.** Scoring changes every season. Every rule must live in a
  versioned, season-scoped ruleset that can reproduce historical totals exactly. Never hardcode a
  points value in a component.
- **Every stored number should be reproducible.** Store the events that happened; derive the
  points. The legacy sheets store only the derived totals, which is precisely the limitation we
  are removing.
- **Mobile first.** Nearly all real usage is a player on a phone, on a pitch, on a Sunday, on a
  bad connection. Recorder drafts persist locally **and** as `recording_status = draft` (ADR 0008).
- Branch prefix for agent work is `cursor/`. Commit in logical units with descriptive messages.
- Index movement (design D5): **snapshots on finalise**, not recompute-as-at. ADR 0007.

## Environments (binding)

Three named worlds, **two** Supabase projects, **one** Vercel project. Full playbook:
[`docs/02-architecture/environments.md`](docs/02-architecture/environments.md) (ADR 0010).

| World | Git | Database | `WW_ENV` |
| --- | --- | --- | --- |
| Local (`pnpm dev`) | any | Staging (`ww-pellet-staging`) | `local` |
| Staging URL | branch `staging` | same staging project | `staging` |
| Production | `main` | Production (`ww-pellet-prod`) | `production` |

Vercel Preview (`cursor/*`) also uses the staging database. Ephemeral previews may wipe
staging rows; that is accepted.

**Agent rules:**

1. Build local first, against staging. No Docker Postgres in v1.
2. Pull env with `vercel env pull .env.local --environment=development` — never production
   into `.env.local`.
3. Stand up the long-lived staging URL (custom env `staging`, or Hobby branch domain) before
   creating `ww-pellet-prod`.
4. `vercel --prod` / merge to `main` / migrate production only when a human asked for
   production, and the same SQL already ran on staging.
5. Never `vercel promote` a staging deployment to production (different `DATABASE_URL`;
   promote does not rebuild).

Until Stream A, local work is `git pull` + docs. This new-project session still commits to
`main` until production holds real 26/27 data.

## Source material

The three historical spreadsheets live in Google Drive and are the primary source for rules and
historical data:

| Season | File | Drive ID |
| --- | --- | --- |
| 2025/26 | Pellet Index 25/26 | `1NhAiCEbw56JoJD1as0IuBC8weFemIRAsD9EsoxCSpnU` |
| 2024/25 | Pellet Index 24/25 | `1cUwCN0lkeBS-T9lE5jqg4yTyLD6dtsQt9QHY17wz0xs` |
| 2023/24 | Pellet Index 23/24 | `1epG5-pp1t5uHm_yXoBHTXloAqGDlfqu5XjPwPxUMnaU` |

Each has three tabs: `Pellet Index` (season totals per player), `WWFC Stats` (goals/assists), and
`Points` (the scoring rules for that season). Extracts are checked into `data/legacy/`.
