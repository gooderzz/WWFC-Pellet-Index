# Engineering guide

**Status:** Accepted — 7 September 2026
**Audience:** any engineer or agent building this product
**Owner:** CTO

This is the implementation contract. Product, domain and design are already decided. Do not
re-open them here. If a product fact is needed, read the source listed below and follow it.

**Provenance (other chats, not this one):**

| Who | What | Binding? |
| --- | --- | --- |
| Sonnet (`bc-49553769`) | Closed every planning question with the club, 6 Sep 2026 | **Yes.** `open-questions.md` |
| Opus (`bc-80d9934f`) | Matchday Print, four tabs, six-step recorder, ScoreLedger API | **Yes.** `docs/05-design/DESIGN.md` |
| GPT (`bc-34e72d90`) | First discovery dump | No — superseded |
| Refero research agents | Format/evidence for DESIGN.md | No — DESIGN.md is the contract |
| This guide | Stack, schema, auth, snapshots, drafts, connections, environments | **Yes.** ADRs 0004–0010 |

Do not re-ask the 35 questions. Do not chase the 6 Sep 3/2/1. Do not generate a crest. Always
`git pull` before writing: this repo moved on `main` from several agents.

If two documents conflict, this order wins:

1. Club-confirmed answers in [`../00-product/open-questions.md`](../00-product/open-questions.md)
2. Scoring in [`../01-domain/pellet-index-rules.md`](../01-domain/pellet-index-rules.md)
3. This guide + ADRs in this folder
4. Design contract in [`../05-design/DESIGN.md`](../05-design/DESIGN.md)
5. Older drafts (`product-brief.md`, `competitive-landscape.md`, ADR consequences that still
   mention open questions)

---

## 1. What we are building

A **single Next.js app** for Westminster Wanderers FC that:

- records 1st-team matches (result, who played, ordered events, certified 3/2/1)
- derives Pellet Index points from those facts via a **pure scoring engine**
- shows the Index, match pages, player pages, and a match-fee ledger
- imports 2023/24–2025/26 as **read-only published totals**, not reconstructed matches

It is not a multi-club SaaS, not a Full-Time scraper, not Stack, and not Stripe.

---

## 2. Stack — locked

| Layer | Choice | Do not substitute |
| --- | --- | --- |
| Language | **TypeScript**, `strict` | JavaScript, Python app code |
| App | **Next.js App Router** (current stable, Node runtime) | Pages Router, Remix, Vite SPA |
| UI | **React Server Components** by default; `"use client"` only for interaction | `"use client"` on pages |
| Styling | **Tailwind CSS v4** + tokens in `app/globals.css` | CSS-in-JS, another UI kit |
| Primitives | **shadcn/ui** (Radix, copied into repo), restyled once | MUI, daisyUI, raw shadcn defaults |
| Domain UI | `components/pellet/*` | Styling matches in `app/` |
| Database | **Supabase Postgres** | SQLite, Neon-direct, Firebase |
| Access | **Drizzle + postgres.js** over the **shared transaction pooler** (IPv4) | Prisma, supabase-js Data API, direct `db.*.supabase.co` from Vercel |
| Auth | **Two shared passphrases + httpOnly cookies** | Supabase Auth, Clerk, NextAuth, a `users` table |
| Hosting | **Vercel** (Fluid Compute, Node — not Edge) | Docker, a second backend |
| Source | **GitHub**, `main` is the product | Splitting into multiple repos |
| Tests | **Vitest** for the engine; Playwright later for the pub flow | Jest |
| Package manager | **pnpm** | Mixing npm/yarn in the same repo |
| Node | **24 LTS** (Vercel current default) | 18, 20 unless Vercel still offers it |

One deployable. No monorepo, no separate API service, no Edge runtime.

---

## 3. Principles (non-negotiable)

1. **Events in, points out.** `PelletScore` is a materialised view of facts. Never type a total.
2. **Rules are data.** No points value in a component. The engine takes a `Ruleset`.
3. **The engine is a pure function** in `lib/scoring/`. No Next, React, Drizzle, or `fetch`.
4. **The breakdown is the API.** Every score response includes ledger lines. The total is `sum(lines.points)`. Zero-point lines stay in.
5. **No minutes.** `sequence` on events, including `substitution` events (the sole source of who
   was on the pitch — ✅ 7 Sep 2026, `appearances.sub_sequence` was removed in favour of this).
   Do not add a `minute` column.
6. **Two auth tiers, no accounts.** Viewer cookie (optional) and Admin cookie. Unlock in place.
7. **Server owns writes.** Mutations are Server Actions. The browser never holds the database key.
8. **Drafts survive the pub.** Match entry writes locally first, then the server. `recording_status = draft` is real in Postgres.
9. **Pages do not style.** Tokens → primitives → `components/pellet` → pages. See §7.
10. **UK football copy, real names, real numbers.** No "Dashboard", no lorem, no Inter.
11. **Staging before production.** Laptops and Preview share the staging database. Production
    is a second Supabase project. Never `vercel promote`. See [`environments.md`](environments.md).

---

## 4. Repository layout

Scaffold into the repo root (not a nested app folder). After Phase 1 the tree is:

```
AGENTS.md
README.md
docs/                         # already exists — keep it
data/legacy/                  # already exists — regression fixtures, not seed
app/
  layout.tsx                  # fonts, theme, tab bar shell
  globals.css                 # THE token file. No hex elsewhere
  page.tsx                    # The Index  /
  matches/page.tsx
  matches/new/page.tsx        # recorder flow
  matches/[id]/page.tsx
  matches/[id]/record/page.tsx
  squad/page.tsx
  players/[id]/page.tsx
  money/page.tsx
  error.tsx
  not-found.tsx
  proxy.ts                    # optional viewer cookie gate — admin checks live in Server Actions
components/
  ui/                         # shadcn primitives, restyled once
  pellet/                     # domain components — see design component-system.md
  app/                        # shell: TabBar, AdminChip, UnlockSheet
lib/
  scoring/                    # PURE engine. The asset.
    types.ts
    rulesets/
      2023-24.ts
      2024-25.ts
      2025-26.ts
      2026-27.ts
    score.ts                  # scoreAppearance(...)
    onPitch.ts                # conceded-while-on from sequence
    index.ts
  db/
    schema.ts                 # Drizzle tables
    client.ts                 # getDb() — postgres.js, prepare: false, max: 1
    queries/                  # one file per aggregate (index, match, player, money)
  auth/
    passphrases.ts            # compare + sign cookies. server-only
    session.ts                # getViewer / getAdmin
  drafts/
    match-draft.ts            # localStorage/idb keying + merge
  actions/                    # "use server" — the write API
    unlock.ts
    matches.ts
    appearances.ts
    events.ts
    bonus.ts
    fees.ts
    squad.ts
drizzle.config.ts             # DATABASE_URL_SESSION, never DATABASE_URL
drizzle/                      # SQL generated by drizzle-kit generate
e2e/                          # later
vitest.config.ts
eslint.config.mjs
components.json               # shadcn
vercel.ts                     # Vercel project config (@vercel/config)
.env.example                  # WW_ENV + two pooler URLs; never real secrets
```

Path alias: `@/*` → repo root.

Do not introduce `src/`. Design docs already name `app/` and `components/`.

---

## 5. How we write application code

### Rendering

| Kind | Where | How |
| --- | --- | --- |
| Read a page | `app/**/page.tsx` | async Server Component, fetch in the page or a `lib/db/queries` helper |
| Mutate | `lib/actions/*.ts` | `"use server"`. Check admin session first. Revalidate tags after |
| Tiny client island | `components/pellet/*` or `components/app/*` | `"use client"` at the leaf: taps, expand, drag-reorder, unlock sheet |
| Never | Route Handlers for CRUD | No `/api/matches` unless a webhook appears (it will not in v1) |

`cookies()` and `headers()` are async. `params` / `searchParams` are async. Do not use
`getServerSideProps`. Do not set `runtime = "edge"`.

### Data flow for a score

```
Match + Appearances + Events + Ruleset
        → lib/scoring.scoreAppearance()
        → { total, breakdown[] }
        → persist PelletScore (cache)
        → UI reads breakdown, never recomputes points in the component
```

On any edit of a `final` / `corrected` match: delete that match's `pellet_scores` (and fees if
appearances changed) and re-run the engine. Do not patch a single ledger line by hand.

### Types

- Engine types live in `lib/scoring/types.ts`. They are the contract between engine tests and UI.
- Drizzle types are inferred from `lib/db/schema.ts`.
- Map DB → engine with explicit functions in `lib/db/mappers.ts`. Do not pass Drizzle rows into
  `scoreAppearance`.

### Naming

- Files: kebab-case for routes, PascalCase for components, camelCase for functions.
- DB: `snake_case` tables and columns.
- Pellet positions: `GK` `DF` `MD` `FW` — those strings, everywhere.
- Routes: `/` The Index, `/matches`, `/squad`, `/money`. Never `/dashboard`.

---

## 6. GitHub

**⚠️ Blocking prerequisite, not yet done (flagged in CTO review, 7 Sep 2026):** this repository's
current git remote is Cursor's own hosted git service, **not GitHub** — check with `git remote
-v`. Everything below, and all of `environments.md`'s Preview/staging/production promotion path,
assumes Vercel is importing from a real GitHub repository, because **Vercel's Git integration
only auto-deploys from GitHub, GitLab or Bitbucket** — it cannot attach to an arbitrary git
remote. A real GitHub repo has to exist and be connected to Vercel before any of Stream A
(platform scaffolding) can produce a working Preview/staging deploy. This is a to-do for William,
not something an agent can silently work around.

- Default branch: `main`. This new-project session works on `main` unless told otherwise.
- Agent branches: `cursor/<short-slug>-e323` when a new branch is required. Lowercase only.
- Commits: one concern each (`feat(scoring):`, `feat(schema):`, `feat(ui):`, `docs:`).
- CI on every push (GitHub Actions):

  1. `pnpm lint`
  2. `pnpm typecheck`
  3. `pnpm test` (engine + unit)
  4. **Design guard:** fail if `app/` or `components/pellet` contain
     `rounded-md|rounded-lg|rounded-xl|rounded-2xl|rounded-3xl`, `shadow-sm|shadow-md`,
     `backdrop-blur`, `Inter`, or raw `#` hex in `.tsx`
  5. `pnpm build`

  CI must **not** receive production `DATABASE_URL`. Engine tests are pure. A later
  integration job, if any, uses staging secrets only.

- Vercel is connected to the GitHub repo. Git → deploy map (ADR 0010):
  `cursor/*` → Preview (staging DB), branch `staging` → custom env `staging`,
  `main` → Production (production DB only). Playbook:
  [`environments.md`](environments.md).
- Do not put passphrases, `DATABASE_URL`, or `SUPABASE_SERVICE_ROLE_KEY` in the repo.
  Do not configure GitHub Environment secrets for production on CI.

---

## 7. How we make components

Full spec: [`../05-design/component-system.md`](../05-design/component-system.md) and
[`../05-design/DESIGN.md`](../05-design/DESIGN.md). Engineering summary:

```
Layer 1  app/globals.css              tokens only
Layer 2  components/ui/               shadcn, restyled at install
Layer 3  components/pellet/           football + Pellet Index
Layer 4  app/**/page.tsx              compose Layer 3, zero styling
```

- A page that contains `className="bg-white rounded-lg shadow p-6"` is a defect.
- A page that imports `components/ui/card` instead of `MatchCard` is a defect.
- Hex colours exist only in `app/globals.css`.
- New Layer 3 component: add stories, add one line to `component-system.md`.
- shadcn init: `npx shadcn@latest init -d --base radix`. Then immediately restyle Button, Input,
  Card, Table, Dialog/Sheet, Badge, Tabs, Skeleton per the deviation table in component-system.
- Do not install Avatar, Carousel, Accordion, Progress, Chart.

**First UI to exist:** `SectionBand` + `PageTitle` + `PelletScore` + `ScoreLedger`, fed by the
engine against a fixture. Stop and look at that screen before building twelve pages.

---

## 8. Supabase

**Two projects:** `ww-pellet-staging` and `ww-pellet-prod`. Local laptops, Preview URLs and
the staging custom env all use staging. Production is isolated. Names and agent rules:
[`environments.md`](environments.md).

Detail, connection strings, IPv4/IPv6 and the client snippet:
[`connections.md`](connections.md) and [ADR 0009](adr/0009-shared-pooler.md).

### What Supabase is in this product

**Postgres + dashboard + backups.** That is all.

Not used in v1: Auth, Storage, Realtime, Edge Functions, Vectors, the Data API as our API.

### How the app connects

**Vercel and GitHub Actions are IPv4-only outbound.** Supabase's direct host is IPv6. Therefore:

| Env var | Mode | Port | Used by |
| --- | --- | --- | --- |
| `DATABASE_URL` | Shared pooler **transaction** | 6543 | Next.js runtime (`getDb()`) |
| `DATABASE_URL_SESSION` | Shared pooler **session** | 5432 | drizzle-kit, migrations, psql |

Username on both is `postgres.<PROJECT_REF>`, not `postgres`. Copy from **Connect**.

Runtime client: `postgres` (postgres.js) + `drizzle-orm/postgres-js`, `prepare: false`, `max: 1`,
lazy `getDb()`. Do not use `@vercel/postgres`. Do not append `?pgbouncer=true` (Prisma).

Do not use the dedicated pooler from Vercel — it is IPv6 unless you pay for the add-on, which
we are not buying by default.

### Data API / RLS

The browser does **not** talk to PostgREST. Optionally disable the Data API in project API
settings.

- Enable **RLS on every table** in `public`.
- Grant **no** DML to `anon` or `authenticated`.
- The pooler user is used only on the server.

Never put `DATABASE_URL`, `DATABASE_URL_SESSION`, or a service-role / secret key in
`NEXT_PUBLIC_*`.

### Migrations

`lib/db/schema.ts` is the source of truth. `drizzle.config.ts` uses `DATABASE_URL_SESSION`.

```bash
pnpm exec dotenv -e .env.local -- pnpm exec drizzle-kit generate
pnpm exec dotenv -e .env.local -- pnpm exec drizzle-kit migrate
```

Never invent a migration filename. Never run migrations through the transaction pooler.
Never `apply_migration` MCP against production as day-to-day workflow.

Physical tables: [`schema.md`](schema.md).

---

## 9. Auth (passphrases)

See [ADR 0005](adr/0005-shared-passphrases.md).

| Cookie | Env var | Meaning |
| --- | --- | --- |
| `ww_viewer` (optional) | `VIEWER_PASSPHRASE` | If empty, the app is public. If set, `app/layout.tsx` (or a narrow `proxy.ts` matcher) requires the cookie |
| `ww_admin` | `ADMIN_PASSPHRASE` | Required for every Server Action that writes. **This is the security boundary.** |

Implementation:

- Compare with `crypto.timingSafeEqual` on hashed buffers (encode both sides, pad to same length).
- Sign cookies with `SESSION_SECRET` (HMAC), `httpOnly`, `secure`, `sameSite: lax`, long max-age.
- Admin unlock is a **sheet**, not a route. `unlockAdmin(passphrase)` sets the cookie and the
  caller retries the original action. No `/login` bounce.
- Do not rely on `proxy.ts` / `middleware.ts` as the only admin check (CVE-2025-29927 history).
  `middleware.ts` is deprecated in Next.js 16; if a viewer gate lives at the edge, the file is
  `proxy.ts` and it must exclude `/_next/static`.
- Header shows an Admin chip when unlocked; tapping it clears the cookie (phone gets handed round).
- Optional `entered_by` text on a match — not an identity system.

Staging and production **must** use different `ADMIN_PASSPHRASE` and `SESSION_SECRET`
values ([ADR 0010](adr/0010-three-environments.md)).

There is no `users` table.

---

## 10. Scoring engine

`lib/scoring/score.ts`:

```ts
scoreAppearance({
  appearance,   // role, position, played60, saves
  events,       // ordered MatchEvent[], including substitution
  bonus,        // 1 | 2 | 3 | null
  ruleset,      // versioned config
}): { total: number; breakdown: LedgerLine[] }
```

`LedgerLine`: `{ ruleKey, label, quantity, points }`.

On-pitch conceded: `onPitch.ts` walks the match `events` in `sequence` order, derives who's on
the pitch at any point from the starting XI plus every `substitution` event's position in that
order (not a per-appearance field — `appearances.sub_sequence` was removed, ✅ 7 Sep 2026, because
a single integer can't represent a rolling sub or a substitution with nobody on the other side),
and counts opposition `goal_conceded` while that player is on. Approximate is correct. Exact
minutes are forbidden.

Rulesets: four frozen JSON-compatible objects, one per season, loaded by `season.ruleset_id`.
2026/27 includes the half-credit-on-one-conceded tier and the hard `played60` gate.
2025/26 historical engine must still be able to express **half clean sheet under 60** if we ever
reconstruct appearances — but we import 23–26 as aggregates, so live code path is 26/27 + tests
for all four.

**Historical proof (honest):** we cannot replay 2023/24 matches; they do not exist. Phase 1 proof
is:

1. Unit tests for every rule line in `data/legacy/rulesets.csv`
2. Golden synthetic matches (Ollie Wyatt 1-app row, Shane 14×4 FW goals, Tom King GK assist + saves)
3. Import job: CSV totals land in `imported_season_aggregates` unchanged (including 2025/26 Kit)

---

## 11. Index movement

Design needs week-on-week arrows. **Decision:** snapshot the Index whenever a match becomes
`final` (and again if it becomes `corrected`).

Table `index_snapshots (season_id, match_id, player_id, rank, total, captured_at)`.
Movement on `/` = rank vs previous snapshot for that season. No snapshot → no arrows. Simple.

Do not recompute "the table as of 3 March" on every page load.

---

## 12. Offline / drafts

See [ADR 0008](adr/0008-draft-persistence.md).

v1 (required):

- Recorder steps write to **IndexedDB** (or localStorage if IDB is overkill) keyed by `matchId`
- Each step also `upsert`s the server `draft`
- On load: merge server draft with local (latest `updatedAt` wins per field group)
- Error copy: the draft is not lost

Not v1: service worker, install prompt, full offline Index. PWA later.

---

## 13. Testing

| Layer | Tool | What |
| --- | --- | --- |
| Engine | Vitest | Rules, on-pitch ordering, bonus eligibility, second-yellow, assist cap |
| Mappers | Vitest | DB row → engine input |
| Actions | Vitest + a test DB | Admin cookie required; viewer cannot write |
| UI | Storybook (or Vitest + Testing Library) | Every pellet component: empty/loading/error/long name |
| E2E | Playwright, later | Six-step record on a 390px viewport |

Assertion target for scores is always the **ledger**, not a magic total.

---

## 14. Vercel

Full ops contract: [`environments.md`](environments.md) (ADR 0010). Summary:

- **One** Vercel project (`ww-pellet-index`). **Two** Supabase projects. Not three Vercel
  projects, not one shared database.
- Framework preset: Next.js. **Fluid Compute is the default**. Node runtime. No
  `runtime = "edge"`.
- `vercel.ts`: `framework: "nextjs"`, `regions: ["lhr1"]`. Both Supabase projects in
  London / EU West.
- Env vars: `.env.example`. Development / Preview / custom env `staging` → staging DB.
  Production target → production DB. Pull with
  `vercel env pull .env.local --environment=development --yes`.
- drizzle-kit does not load `.env.local` — use `dotenv-cli`.
- Design gate on the **staging** URL (phone), not only an ephemeral Preview.
- Never `vercel promote` staging → production. Production rebuilds from `main`.
- `vercel --prod` / merge to `main` only when a human asked for production.

---

## 15. How this scales

User scale is irrelevant (~20 weekly readers, ~3 writers). We scale in **time and scope**:

| Growth | How the architecture absorbs it |
| --- | --- |
| Another season | New `seasons` row + new `rulesets` row. Engine unchanged |
| A second WWFC team | New `teams` row. UI still hidden. Queries already `team_id`-scoped |
| Rule tweak between seasons | Edit next season's ruleset JSON. Never mutate a started season |
| 10 years of matches | Indexes on `(season_id, player_id)`, `(match_id, sequence)`. Snapshots stay tiny |
| Real accounts someday | New ADR. Do not sneak a `users` table in "just in case" |

Do not add Redis, queues, or microservices. Twenty matches a year.

---

## 16. Build order and tandem streams

Optimised so the engine and the visual identity are proven **before** twelve pages exist.

### Stream A — Platform (blocks almost nothing once done)

1. `create-next-app` (TS, App Router, Tailwind v4, ESLint) into a temp dir, move to repo root
2. pnpm, `vercel.ts` (`regions: ["lhr1"]`), `.env.example`, GitHub Action
3. Supabase **staging** project (`ww-pellet-staging`) in EU West. Paste **transaction** and
   **session** pooler URIs (not direct). Production project comes later — [`environments.md`](environments.md)
4. Tokens + fonts (`next/font` → CSS variables) + `SectionBand` + `PageTitle`
5. Deploy empty shell to Vercel Preview / the `staging` custom env. Do not attach
   `ww-pellet-prod` yet.

### Stream B — Engine (starts day one, no database)

1. `lib/scoring/types.ts` + ruleset objects for all four seasons
2. `scoreAppearance` + `onPitch`
3. Vitest golden cases
4. **Gate:** tests green against synthetic matches and the spot checks in
   `pellet-index-rules.md`

### Stream C — Data

1. Drizzle schema from [`schema.md`](schema.md)
2. `drizzle-kit generate` + `drizzle-kit migrate` against `DATABASE_URL_SESSION` — RLS + indexes
   are part of this generated migration, not a separate Supabase CLI migration (✅ resolved, CTO
   review 7 Sep 2026: Drizzle Kit is the sole migration authority for v1 — see
   [`connections.md`](connections.md) §Migrations)
3. Seed script (`scripts/seed.ts`): our own `clubs`/`teams` row, the four `seasons` + `rulesets`
   rows (generated from `lib/scoring/rulesets/*.ts`, not hand-typed — see `schema.md` §Ruleset
   JSON), and the three known `competitions` (`MLIP`/`CC`/`FBC`) plus the current league
   competition. **Opponent clubs are not pre-seeded in general** — an admin creates one inline the
   first time they enter a fixture against a new team (✅ resolved, CTO review 7 Sep 2026) — with
   one deliberate exception: seed **Bath Old Boys United** as an opponent club directly, since the
   6 September 2026 result is already a locked fact this project exists to record, and it avoids a
   chicken-and-egg "create the opponent before you can enter the match you already know happened"
   step the very first time anyone uses the recorder
4. Queries for Index, match, player
5. Recompute helper: match → delete scores → score all appearances → write scores + snapshot.
   Fees are `UPDATE`, not delete/reinsert — see `schema.md` §Recompute
6. Import script for `data/legacy/*.csv` into `imported_season_aggregates` + `player_aliases`

### Stream D — Read UI (after A tokens + B types)

1. `PelletScore` + `ScoreLedger` on a fixture page — **DESIGN REVIEW GATE. Stop here.**
2. Restyle shadcn primitives
3. `IndexTable`, `MatchCard`, `ResultChip`, `FormGuide`, `StatusChip`, states
4. `/`, `/matches`, `/matches/[id]`, `/players/[id]`, `/squad`

### Stream E — Write UI (after C + auth)

1. Cookie unlock sheet
2. Six-step recorder with local draft
3. Finalise → engine → snapshot → fees
4. `/money` mark paid
5. Corrected stamp + reason

**Parallelism:** A ∥ B at the start. C needs A (repo). D needs A + B types. E needs C + D.

**Do not** build `/money` or the recorder before the design gate. The ledger is the product.

**Do not scaffold in the same breath as a docs-only turn.** Phase 1 code starts when someone is
asked to implement Stream A/B. `create-next-app` goes into a **subdirectory**, then files move
to the repo root — targeting `/workspace` directly fails a parent-write check.

### Other repos

Opus found `gooderzz/wwfc-frontend` and `wwfc-backend` (FA Full-Time scrape, Square). They
contradict club-locked decisions: **no importer**, **Stack for availability**, **no payments
processor**. This repository is the product. Do not absorb those codebases unless the club
explicitly says so.

---

## 17. Definition of done (v1)

- A match can be recorded on a phone in the six-step flow, survive a refresh, and finalise
- The Index shows derived scores with inline ledgers
- 2026/27 Bath Old Boys United 1–2 can be entered (vote left to the club at entry time)
- Legacy seasons appear as archive rows, published totals intact (Kit included for 25/26)
- Fees derive from `played60`; admin can mark paid
- DESIGN.md checklist passes on 390px with real names
- CI green; staging URL used on a phone; production on Vercel against `ww-pellet-prod`;
  schema on both Supabase projects

---

## 18. Explicitly out of scope (do not build)

Availability, Stack clone, Full-Time import, digital ballot, player photos, avatars, Inter,
minutes, `PlayingStint`, yearly subs, Stripe, AI reports, `/admin`, `/dashboard`, FPL comparison,
generated crest, Edge runtime, Supabase Auth.

---

## Related ADRs

| ADR | Decision |
| --- | --- |
| [0001](adr/0001-record-architecture-decisions.md) | We write ADRs |
| [0002](adr/0002-versioned-rulesets.md) | Rules are versioned data |
| [0003](adr/0003-events-not-totals.md) | Store events, derive points |
| [0004](adr/0004-next-vercel-supabase.md) | Next.js + Vercel + Supabase + Drizzle |
| [0005](adr/0005-shared-passphrases.md) | Two passphrases, no accounts |
| [0006](adr/0006-server-only-database.md) | No PostgREST from the browser |
| [0007](adr/0007-index-snapshots.md) | Leaderboard movement via snapshots on finalise (**D5**) |
| [0008](adr/0008-draft-persistence.md) | Local + server drafts; no full offline Index |
| [0009](adr/0009-shared-pooler.md) | Shared pooler IPv4; session URI for migrations |
| [0010](adr/0010-three-environments.md) | Local + staging share one DB; production is isolated |
