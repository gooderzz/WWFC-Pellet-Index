# Environments — local, staging, production

**Status:** Accepted — 7 September 2026

**✅ Resolved (CTO review, 7 Sep 2026) — Vercel Hobby, not Pro, is the v1 default.** The project's
own stated principle (`tech-stack.md`): "tiny scale, tiny budget... this should cost nothing to
run." Hobby's documented fallback below (a `staging` git branch with a reassigned domain, plus
branch-scoped env vars) covers everything this app needs technically — this app has no cron jobs,
no heavy function requirements, and doesn't need a "real" custom environment slug, just a stable
staging URL, which the branch-domain fallback provides.

**✅ Confirmed by William (7 Sep 2026, Q37): staying on Hobby.** "Let's keep it on Hobby right now
and if we need to upgrade we can." Option **(a)** below is locked in — Hobby under William's
Vercel account (`williamgoodwin-myyahoocoms-projects`, confirmed on Hobby), with the **GitHub
repo** as the real shared-ownership mechanism. Upgrading to Pro later, if Shane/Tom ever need
direct Vercel access, is a reversible decision, not a migration.

One real caveat, kept for context: Vercel's Hobby tier is scoped to a single personal account,
not a team — it's genuinely one login. That's in tension with the club's stated reason for
choosing Vercel/GitHub/Supabase at all (Q33: shared ownership across Shane, Tom and William, not
dependent on one person) — **(a)** stay on Hobby and rely on the GitHub repo as the actual
shared-ownership mechanism (anyone with repo access can redeploy to their *own* new Vercel
project from the same code in a pinch — Vercel itself just isn't jointly owned), or **(b)**
upgrade to Pro (~$20/month) for a real Vercel Team Shane and Tom can be added to directly.
Supabase's own multi-member org access is available on its free tier regardless, so the database
side of shared ownership doesn't have this problem.

### Provisioning status (live, updated as infra actually gets created)

| Resource | Status | Detail |
| --- | --- | --- |
| GitHub repository | ✅ Created by William | [`gooderzz/WWFC-Pellet-Index`](https://github.com/gooderzz/WWFC-Pellet-Index) — content import in progress (7 Sep 2026), pushed via the GitHub API since no git-credential path to github.com exists in this shell session |
| Vercel team | ✅ Exists | `williamgoodwin-myyahoocoms-projects`, Hobby plan, confirmed 7 Sep 2026 |
| Vercel project (this app) | ❌ Not created yet | Waiting on the GitHub import to finish so it can be git-linked on creation, per the promotion path below |
| Supabase organisation | ✅ Exists | "WWFC Pellet Index" (`waqufdoqwnbrlyownopn`), upgraded off Free by William to lift the account-wide 2-project cap |
| Supabase project — staging | ✅ Created 7 Sep 2026 | `ww-pellet-staging` (ref `serzpztmxjozztzickqz`), region `eu-west-2` (London, matches Vercel's `lhr1`), `ACTIVE_HEALTHY` |
| Supabase project — production | ✅ Created 7 Sep 2026 | `ww-pellet-prod` (ref `rftabjjqtazpmilmajpw`), region `eu-west-2`, `ACTIVE_HEALTHY`, **$10/month** — William confirmed this cost directly by creating it once the account was upgraded |

**Database passwords:** set by William, shared once in chat, **not committed to this repo** —
they live only in Vercel's environment variables once wired up. If either needs rotating later,
that's a Supabase dashboard action (Project Settings → Database) followed by updating the
corresponding Vercel env var; nothing in the schema or app code depends on the literal value.

**⚠️ One unverified detail:** the exact shared-pooler hostname shard (`aws-0-eu-west-2` vs.
`aws-1-...` etc.) hasn't been visually confirmed against either project's dashboard connection
string — `connections.md`'s documented default (`aws-0-<region>.pooler.supabase.com`) was used
to build the Vercel env vars. **Verify this against the actual "Connect" panel in each Supabase
project before the first real `drizzle-kit migrate` run** — if it's wrong, migrations will fail
to connect with a clear DNS/connection error, not silently misbehave.

Env vars, migrations and seeding for both projects are still outstanding beyond what's noted
above — nothing has been run against either database yet. Treat both as empty, freshly
provisioned Postgres instances.
**Audience:** agents and humans spinning up a machine or a deploy
**Sources:** [Vercel Environments](https://vercel.com/docs/deployments/environments),
[Custom environments](https://vercel.com/docs/deployments/environments#custom-environments),
[Hobby staging fallback](https://vercel.com/kb/guide/set-up-a-staging-environment-on-vercel),
[`connections.md`](connections.md)

This is the ops contract. Connection strings still follow `connections.md` (shared pooler,
IPv4, two URLs). Do not point a laptop or a preview at production.

**Build in this order:** local against staging → a long-lived staging URL → production last.
Do not create the production Supabase project, attach a club domain, or merge to `main` until
staging has been used on a phone.

---

## Agent cheat sheet

| Do | Do not |
| --- | --- |
| `WW_ENV=local` in `.env.local`, staging pooler URIs | Production URIs in `.env.local` |
| `vercel env pull .env.local --environment=development` | `vercel env pull` with `--environment=production` into `.env.local` |
| Migrate / seed / wipe **staging** freely | Migrate production unless a human asked, after the same SQL is on staging |
| Push `cursor/*` (Preview) or `staging` | `vercel --prod`, merge to `main`, or `vercel promote` unless asked for production |
| Different `ADMIN_PASSPHRASE` and `SESSION_SECRET` per database | Reuse staging cookies or secrets on production |

`WW_ENV=production` must never appear in `.env.local`. If a `DATABASE_URL` username
(`postgres.<ref>`) matches the production Connect panel, stop and revert.

Until Stream A exists there is nothing to `pnpm install`. Local work is `git pull` + docs.
The loops below apply the day the Next.js app lands.

---

## The three worlds

| World | What it is | Git | Vercel | Database | Who uses it |
| --- | --- | --- | --- | --- | --- |
| **Local** | Laptop / agent VM | any branch | none (`pnpm dev`) | **Staging** Supabase | Engineers, agents |
| **Staging** | Long-lived pre-prod | branch `staging` | Custom env `staging` (Pro) or branch-preview (Hobby) | **Staging** Supabase | Club checks a real URL before Sunday |
| **Production** | Live Index | `main` | Production | **Production** Supabase | Squad, pub, the record of the season |

There are **two** Supabase projects, not three. Local, Vercel Development, ephemeral Preview,
and Staging all share the **staging** database. Only Production has the production database.

Ephemeral PR previews may trash staging data. That is accepted. They must never see production
credentials.

`vercel promote` of a staging deployment **into production is forbidden**. Staging and
production have different `DATABASE_URL`s. A promote re-points the alias without rebuilding, so
the app would keep talking to staging. Production always **rebuilds** from `main`
(`vercel --prod` / Git merge to `main`).

---

## Names

Once the projects exist, write the real refs here. Until then use these slugs:

| | Slug |
| --- | --- |
| Vercel project | `ww-pellet-index` (one project, three Vercel environments) |
| Supabase staging | `ww-pellet-staging` — region London / EU West |
| Supabase production | `ww-pellet-prod` — same region |
| Vercel custom env | slug `staging` |
| Staging git branch | `staging` |
| Production git branch | `main` |

This is **Vercel** environments, not GitHub Environments. Do not add GitHub Environment
protection rules that inject production secrets into Actions. One Vercel project, not three.

`WW_ENV` is our own flag so agents do not guess from `VERCEL_ENV` (a custom environment still
reports as a preview-class deploy):

| `WW_ENV` | Set on |
| --- | --- |
| `local` | `.env.local` only |
| `staging` | Vercel Development, Preview, and the `staging` custom env |
| `production` | Vercel Production only |

---

## Env vars per world

Same keys everywhere. **Different values.** Copy URIs from each project's **Connect** panel
(transaction vs session — see `connections.md`).

| Key | Local / Staging | Production |
| --- | --- | --- |
| `WW_ENV` | `local` or `staging` | `production` |
| `DATABASE_URL` | staging transaction pooler `:6543` | prod transaction pooler |
| `DATABASE_URL_SESSION` | staging session pooler `:5432` | prod session pooler |
| `ADMIN_PASSPHRASE` | memorable test secret, **not** the live one | live admin passphrase |
| `VIEWER_PASSPHRASE` | empty (public) or a test secret | club choice |
| `SESSION_SECRET` | its own long random | a **different** long random |

Never reuse `SESSION_SECRET` or `ADMIN_PASSPHRASE` across staging and production. A cookie
minted on staging must not unlock production.

Vercel Dashboard scoping:

| Vercel target | Points at |
| --- | --- |
| Development | Staging DB (so `vercel env pull` is safe for laptops) |
| Preview | Staging DB (PR URLs) |
| Custom env `staging` | Staging DB (persistent URL) |
| Production | Production DB |

---

## Git → deploy map

```
cursor/*  or feature branches  →  Vercel Preview (ephemeral URL, staging DB)
staging                        →  Vercel custom env "staging" (stable URL, staging DB)
main                           →  Vercel Production (live URL, production DB)
```

Do not merge unreviewed work to `main`. Club-facing checks happen on the staging URL first.

Create the long-lived branch once (empty repo today; after Stream A it tracks `main`):

```bash
git fetch origin
git checkout -B staging origin/main   # or main, if origin/staging does not exist yet
git push -u origin staging
```

Once production holds real 26/27 data, protect `main` in GitHub (PR required). Until that
go-live, this new-project session still commits docs and scaffold to `main`. Do not protect
`staging` so tightly that agents cannot push a reviewed Preview into it.

---

## First-time order (humans / agents with dashboard access)

Do these in order. Skipping ahead is how production gets a test passphrase.

1. **Supabase `ww-pellet-staging`** — London / EU West. Copy transaction + session pooler URIs.
2. **Vercel project `ww-pellet-index`** — import GitHub, production branch `main`, region `lhr1`.
   Put **staging** secrets on Development, Preview, and the `staging` custom env. Leave the
   Production target empty or on a dummy URI until step 5.
3. **Git branch `staging`** — push it; confirm the custom env (or Hobby branch domain) builds.
4. **Local** — `vercel link` + `vercel env pull --environment=development`. Agents work here.
5. **Production last** — only when the club has used staging on a phone: create
   `ww-pellet-prod`, set Production-scoped vars, then merge `staging` → `main`.

Vercel always creates a Production environment on first import. That is not permission to
point it at live data. Treat an unset Production `DATABASE_URL` as "not live yet."

---

## 1. Local — agent / laptop loop

No local Docker, no `supabase start` in v1. The laptop talks to **staging** over the shared
pooler (IPv4). Direct `db.<ref>.supabase.co` will fail on most home ISPs.

### First clone (after the app exists)

```bash
git pull
pnpm install          # Node 24. Do not use npm.
cp .env.example .env.local
```

Then **either**:

```bash
# Preferred once Vercel exists: Development vars = staging DB
pnpm exec vercel link --yes --project ww-pellet-index
pnpm exec vercel env pull .env.local --environment=development --yes
```

**or** paste the staging pooler URIs by hand into `.env.local`.

Then:

```bash
# prove you are not on production
grep -E '^WW_ENV=|^DATABASE_URL=' .env.local
# WW_ENV must be local. DATABASE_URL host must be the STAGING pooler, not prod.

pnpm exec dotenv -e .env.local -- pnpm exec drizzle-kit migrate
pnpm dev
```

`vercel env pull` **replaces** `.env.local`. Keep machine-only overrides in
`.env.development.local` (Next loads it after `.env.local`; pull will not touch it).

Set `WW_ENV=local` in `.env.development.local` if pull overwrites it.

### Every session

```bash
git pull
pnpm install
# if DB calls start failing after ~12h on a linked project:
pnpm exec vercel env pull .env.local --environment=development --yes
pnpm dev
```

### Rules for agents on local

- Do not put production URIs in `.env.local`. If you find them, stop and revert.
- Do not run `drizzle-kit migrate` against production from a laptop unless a human explicitly
  asked to migrate production, and staging has already been migrated with the **same** SQL in
  git.
- `drizzle-kit` / `tsx` do not load `.env.local`. Always `pnpm exec dotenv -e .env.local -- …`.
- Cookies: `secure` is false on `http://localhost`, true on Vercel. That belongs in
  `lib/auth/session.ts` (`process.env.VERCEL === "1"` or `WW_ENV !== "local"`).
- Bind a non-default port only if 3000 is taken. Humans use `pnpm dev`; agents in this cloud
  environment pick an uncommon port.

Local is for building. Staging is for "does this work on a phone." Production is the season.

### What "local env" means here

| Need | How |
| --- | --- |
| Node | **24** (Vercel default). `pnpm` only. |
| Vercel CLI | `pnpm exec vercel` after the app exists; `vercel login` on a laptop. Agents in this cloud environment use the linked project / env pull, not a personal login, if the token is already present. |
| Database | Staging shared pooler. **No Docker, no `supabase start` in v1.** |
| Env files | `.env.example` is the template. `.env.local` is pulled Development (staging DB). `.env.development.local` holds `WW_ENV=local` so pull cannot clobber it. `.env.production.local` is throwaway, never committed, deleted after a prod migrate. |
| App | `pnpm dev` — humans on 3000; this cloud agent binds an uncommon port. |

A local env is **not** a third database. If Postgres is unreachable, check IPv4 / pooler
username (`postgres.<STAGING_REF>`), not "maybe I need Docker."

---

## 2. Staging — first-time setup (human or agent with dashboard access)

### A. Supabase project `ww-pellet-staging`

1. New project, region **London / EU West**.
2. Connect panel → copy **Transaction** URI → `DATABASE_URL`.
3. Connect panel → copy **Session** URI → `DATABASE_URL_SESSION`.
4. Username is `postgres.<PROJECT_REF>`.
5. Enable RLS on `public`. No DML for `anon` / `authenticated`. Data API optional-off.
6. Apply migrations: `DATABASE_URL_SESSION` + `drizzle-kit migrate`.
7. Seed later (Phase 2): synthetic players + legacy CSV totals. Not the live 26/27 votes.

### B. Vercel project `ww-pellet-index`

1. Import the GitHub repo. Production branch = `main`. Region `lhr1` (`vercel.ts`).
2. First-ever deploy is always Production in Vercel's model. **Do not attach the production
   domain or production DB until staging exists.** Use a dummy / staging URI for that first
   deploy if you must, then rotate Production vars before the club uses it.
3. Create custom environment **`staging`** (Pro: 1 per project, free on Pro):
   - Dashboard → Environments → Create → name `staging`
   - Branch tracking: **equals** `staging`
   - Attach a stable URL (Vercel subdomain is enough; club domain later)
4. Set env vars on targets Development, Preview, and `staging` to the **staging** secrets.
5. Push or merge to branch `staging`, or:

```bash
vercel deploy --target=staging
```

### Hobby fallback (no custom environments)

Custom environments are **Pro/Enterprise** (Pro = 1 per project). On Hobby:

1. Keep a `staging` git branch.
2. Settings → Domains → add a hostname and **reassign it from Production to branch `staging`**.
3. Settings → Environment Variables → add the staging DB URLs scoped to **Preview** + git
   branch `staging` (branch-specific vars override).
4. Do not also put those values on Production.

Same two-database rule. Only the Vercel UI differs.

### What staging is for

- Design gate: `PelletScore` + `ScoreLedger` on a phone.
- Pub-flow rehearsal with the test admin passphrase.
- Migrations land here **before** production.
- Safe for agents to seed, wipe, and re-migrate.

### Deployment Protection

Turn **Vercel Authentication** on for Preview and the `staging` custom env so draft URLs are
not a Google result. Share the Vercel bypass with Tom, Shane and William.

Production may stay reachable without Vercel login: the Index can be public, and
`VIEWER_PASSPHRASE` is the product gate if the club wants one. Do not require Vercel SSO on
Sunday at the pub.

---

## 3. Production

### A. Supabase project `ww-pellet-prod`

Separate project. Same region. Own passwords, own pooler URIs, own `SESSION_SECRET`.

Do not clone staging by pointing both Vercel envs at one database.

### B. Vercel Production

- Git: `main` only.
- Env vars: Production target only, production pooler URIs, live passphrases.
- Deploy: merge to `main`, or `vercel --prod` from `main` after staging sign-off.
- Rollback: `vercel rollback` (same build, same env). Do not "rollback" by promoting staging.

### Production migrate (rare, explicit)

```bash
# SQL already in git, already applied to staging
pnpm exec dotenv -e .env.production.local -- pnpm exec drizzle-kit migrate
```

Pull production env into a **throwaway** file, not `.env.local`:

```bash
pnpm exec vercel env pull .env.production.local --environment=production --yes
# migrate
rm .env.production.local
```

Never leave production URIs on disk in `.env.local`.

---

## Ownership, backups and match-day incidents

**✅ Resolved (CTO review, 7 Sep 2026).** There's no dedicated ops person here — three named
Admins, no on-call rota. The policy is deliberately light:

- **Who holds the actual accounts:** William, as the person setting this up, is the primary
  Vercel and Supabase account holder for now. Tom and Shane get Supabase dashboard access as
  organisation members (free on every Supabase tier) so database access isn't a single point of
  failure. Vercel access is the one open item — see the Hobby-vs-Pro note above.
- **Backups (accurate, not assumed):** Supabase's **Free** tier does not include automatic
  backups. **Pro** ($25/month) includes daily backups with 7 days of retention; point-in-time
  recovery is a paid add-on on top of Pro. A season's worth of real results is genuinely
  irreplaceable if lost, so this is worth a real decision rather than a default:
  - **Cheap option:** stay on Supabase Free for `ww-pellet-prod`, and someone (an admin, or a
    scheduled job later) runs a manual `pg_dump` against `DATABASE_URL_SESSION` after matchdays
    or monthly, saved somewhere durable (a shared Drive folder is fine — it's already how the
    club keeps things). Zero cost, manual, good enough for ~20 matches a year.
  - **Paid option:** upgrade `ww-pellet-prod` only (not staging) to Supabase Pro for real,
    automatic daily backups. This is the one place in the whole stack where "cost nothing to
    run" might be worth breaking for peace of mind — that's William/the club's call, not an
    engineering default.
  - Default until told otherwise: the cheap option (Free tier + occasional manual `pg_dump`).
- **✅ Two more Free-tier facts worth knowing before relying on it (CTO review, 7 Sep 2026):**
  Supabase's Free tier caps an organisation at **2 active projects** — which happens to fit this
  plan exactly (`ww-pellet-staging` + `ww-pellet-prod`), but leaves no headroom for a third
  project without upgrading. More importantly: **a Free project pauses automatically after about
  a week with no API/database activity**, and this is a genuine risk for a *Sunday league*
  season — May to August has no matches at all, and a paused project needs a manual unpause
  (from the dashboard, or the Supabase CLI) before the first pre-season match of the following
  year. Put "unpause both projects" on whatever checklist marks the start of pre-season; a
  scheduled off-season ping (even a monthly cron hitting a health-check route) is a cheap way to
  avoid discovering this live on the first Sunday of a new season instead.
- **Match-day incident runbook, one paragraph:** if the app is broken on a Sunday, first try
  `vercel rollback` to the last good production build (fast, no data loss). If that doesn't fix
  it, the match still gets recorded — on paper or in a phone note, same as every season before
  this app existed — and gets backfilled into the recorder once the app's working again. The app
  going down for a few hours must never be the reason a match doesn't get scored; it just means
  someone types it in later instead of at the pub.

---

## Agent deploy rules

| Action | Allowed? |
| --- | --- |
| `pnpm dev` against staging DB | Yes |
| Deploy Preview / `vercel` / push `cursor/*` | Yes |
| `vercel deploy --target=staging` or push `staging` | Yes, after tests |
| `vercel --prod` or merge to `main` | Only when the user asked for production |
| `vercel promote <staging-url>` to production | **Never** |
| Migrate production | Only when the user asked, and staging is already on that migration |
| Copy production dump into staging | Only when the user asked (PII / DOBs still never leave Drive) |

The first production deployment of a brand-new Vercel project is created even without
`--prod`. After that, `--prod` / `main` are the only production paths.

GitHub Actions must not receive production `DATABASE_URL`. Engine tests are pure and need no
database. A later integration job, if any, uses **staging** secrets only.

---

## Promotion path (the actual release)

1. PR / `cursor/*` → Preview URL (staging DB). CI: lint, types, scoring tests, design grep.
2. Merge to `staging` → custom env URL. Human (Tom/Shane/William) taps through the recorder on
   a phone.
3. Merge `staging` → `main` → production rebuild with production env.
4. If production is bad: `vercel rollback`, then fix on a branch, not a hot-edit of `main`.

---

## How to tell which database you have

Pooler host includes the project ref in the **username** (`postgres.<ref>`). Compare `.env.local`
to the staging Connect panel. If the ref matches production, stop.

`WW_ENV=production` must never appear in `.env.local`.
