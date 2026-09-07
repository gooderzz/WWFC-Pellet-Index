# How we connect the products (checked 7 Sep 2026)

**Status:** Accepted
**Sources (current vendor docs, not training memory):**

- [Connect to Postgres](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [IPv4 / IPv6](https://supabase.com/docs/guides/troubleshooting/supabase--your-network-ipv4-and-ipv6-compatibility-cHe3BP)
- [Drizzle + Supabase](https://supabase.com/docs/guides/database/drizzle)
- [Drizzle connect-supabase](https://orm.drizzle.team/docs/connect-supabase)
- [Vercel Fluid Compute](https://vercel.com/changelog/fluid-compute-is-now-the-default-for-new-projects)
- [attachDatabasePool](https://vercel.com/docs/functions/functions-api-reference/vercel-functions-package)
- [Next.js `proxy.ts`](https://nextjs.org/docs/app/api-reference/file-conventions/proxy)

If a later agent updates this file, re-fetch those pages. Do not reconnect from memory.

---

## The constraint that actually bites

**Vercel Functions and GitHub Actions cannot make outbound IPv6 connections.**

Supabase's **direct** host `db.<ref>.supabase.co:5432` is **IPv6-only** unless you pay for the
IPv4 add-on. Same for the **dedicated** pooler `db.<ref>.supabase.co:6543` on paid plans.

Supabase lists Vercel, GitHub Actions, Retool and Render as IPv4-only. That is why this
project uses the **Shared Pooler (Supavisor)** for almost everything.

Do **not** buy the IPv4 add-on as the default fix. The shared pooler is IPv4 on every tier
and is what serverless is supposed to use. The add-on is only if we later need a true
direct connection from an IPv4 network (some GUIs, replication, etc.).

The IPv4 add-on is **not dual-stack**: it *replaces* the AAAA record with an A record.

---

## Connection matrix

Copy the URI from the dashboard **Connect** panel. Do not invent the hostname.

| Job | Use | Host:port | IP | Username |
| --- | --- | --- | --- | --- |
| **App runtime** (Vercel / `next start`) | Shared pooler **transaction** | `aws-<region>.pooler.supabase.com:6543` | IPv4 | `postgres.<PROJECT_REF>` |
| **Migrations, drizzle-kit, psql, GUI** | Shared pooler **session** | `aws-<region>.pooler.supabase.com:5432` | IPv4 | `postgres.<PROJECT_REF>` |
| Direct Postgres | Only from an IPv6 machine | `db.<ref>.supabase.co:5432` | IPv6 | `postgres` |
| Dedicated PgBouncer | Paid, IPv6 unless add-on | `db.<ref>.supabase.co:6543` | IPv6 | `postgres` |

**Transaction mode (6543)** does **not** support prepared statements, `LISTEN/NOTIFY`, session
`SET`, or temp tables that span transactions.

**Session mode (5432)** on the shared pooler is the IPv4-safe stand-in for a direct connection.

Env vars:

| Var | What |
| --- | --- |
| `DATABASE_URL` | Transaction pooler URI. **Runtime only.** |
| `DATABASE_URL_SESSION` | Session pooler URI. **Migrations / drizzle-kit / scripts.** |

Never point the Next.js server at the session URI (it will hold connections). Never point
drizzle-kit at the transaction URI (migrations need session features / prepared statements).

---

## Runtime client (locked)

Packages: `drizzle-orm`, `postgres` (postgres.js). **Not** `pg`, **not** `@vercel/postgres`
(sunset), **not** `drizzle-orm/vercel-postgres`.

```ts
// lib/db/client.ts — server only
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");

  const client = postgres(url, {
    prepare: false, // required: transaction pooler / Supavisor
    max: 1,         // one TCP connection per Fluid instance
    idle_timeout: 20,
    connect_timeout: 10,
  });

  return drizzle({ client, schema });
}

let _db: ReturnType<typeof createDb> | null = null;

export function getDb() {
  if (!_db) _db = createDb();
  return _db;
}
```

Why this shape:

- **`prepare: false`** — official Drizzle and Supabase guidance for transaction mode. Without
  it you get `prepared statement "s1" already exists` on the second request.
- **`max: 1`** — Fluid Compute reuses the instance across concurrent requests. A big app-side
  pool on every instance × many instances exhausts `max_connections`.
- **Lazy `getDb()`** — Next.js evaluates modules at build time. Do not throw at import if the
  env var is missing during `next build` on a fresh project; call `getDb()` from request code.
  Do **not** wrap the client in a JavaScript `Proxy`.
- **`drizzle({ client })`** — current Drizzle constructor. If a future drizzle-orm changes the
  call, follow *that* version's docs, keep `prepare: false`.

Vercel also documents `pg.Pool` + `attachDatabasePool` from `@vercel/functions` for Fluid
suspend/resume. That helper is for **node-postgres**, not postgres.js. Stay on postgres.js
unless we see stale-connection errors after Fluid suspend; then switch in one place
(`lib/db/client.ts`) and call `attachDatabasePool(pool)`.

Prisma's `?pgbouncer=true` query param is **not** used here. We are not using Prisma.

---

## Username gotcha

Shared pooler usernames are `postgres.<PROJECT_REF>`, not `postgres`.

```
# wrong — password auth failed
postgres://postgres:SECRET@aws-0-eu-west-2.pooler.supabase.com:6543/postgres

# right
postgres://postgres.abcdefghijkl:SECRET@aws-0-eu-west-2.pooler.supabase.com:6543/postgres
```

Copy from Connect. Do not hand-edit the user.

---

## Regions (colocate)

Create the Supabase project in **London / EU West** (`eu-west-2` if offered). Set Vercel
Functions to **`lhr1`** in `vercel.ts`:

```ts
import type { VercelConfig } from "@vercel/config/v1";

export const config: VercelConfig = {
  framework: "nextjs",
  regions: ["lhr1"],
};
```

Fluid Compute is **already the default** for new Vercel projects. Do not set
`runtime = "edge"`. Do not pay for the IPv4 add-on to make the dedicated pooler work from
Vercel — use the shared transaction pooler instead.

---

## Migrations

Source of truth for tables: `lib/db/schema.ts`.

```bash
# generate SQL from the Drizzle schema
pnpm exec dotenv -e .env.local -- pnpm exec drizzle-kit generate

# apply using the SESSION pooler (IPv4, prepared statements OK)
pnpm exec dotenv -e .env.local -- pnpm exec drizzle-kit migrate
```

`drizzle.config.ts` must read `DATABASE_URL_SESSION`, not `DATABASE_URL`.

**✅ Resolved (CTO review, 7 Sep 2026): Drizzle Kit is the sole migration authority for v1, full
stop.** `supabase migration new` is not used — not for staging, not for production, not
anywhere — because there is no local Docker / `supabase start` in v1 (see
[`environments.md`](environments.md)), so the one scenario that would justify the Supabase CLI
migration path never actually arises. If local Docker is ever added later, that's a new decision
requiring its own ADR, not a default fallback to reach for today. Do not run two competing
migration histories.

GitHub Actions is IPv4-only — CI migrate jobs must use `DATABASE_URL_SESSION`.

---

## What we deliberately do not use

| Thing | Why not |
| --- | --- |
| Direct `db.<ref>.supabase.co` from the app | IPv6. Vercel cannot reach it |
| Dedicated pooler from the app | Same IPv6 problem unless we pay for the add-on |
| `@vercel/postgres` / `drizzle-orm/vercel-postgres` | Sunset. Replaced by Neon or a normal driver |
| `supabase-js` Data API as the write path | No users; we own SQL via Drizzle |
| `NEXT_PUBLIC_` database URL or service-role key | Browser would get the database |
| Prisma `?pgbouncer=true` | Wrong ORM |
| `?workaround=supabase-pooler.vercel` | Legacy `@vercel/postgres` hack |

Optional hardening: in Supabase **API settings**, turn the Data API off if we are solely on
Drizzle. Keep RLS on anyway (defence in depth). New publishable/secret keys can exist on the
project; the app ignores them.

Marketplace `vercel install supabase` is a fine way to *provision* the project and inject
env vars — then **overwrite** the injected DB URL with the **transaction** pooler string if
the integration gave you the direct host.

---

## Auth vs `proxy.ts`

Admin security lives in **Server Actions** (`getAdmin()`). That is the boundary.

Optional viewer passphrase: a cookie check in `app/layout.tsx` (or a tiny `proxy.ts` matcher
that **excludes** `/_next/static`, `/_next/image`, and files). Next.js 16 renamed
`middleware.ts` → `proxy.ts`. Do not put admin authorisation only in proxy — there is a
history of middleware auth-bypass (CVE-2025-29927). A passphrase cookie check is a light
deterrent, not a bank vault.

---

## Local development

Local laptops use the **staging** pooler URIs, not production and not a local Docker
Postgres. Pull Development env vars from Vercel rather than hand-copying URLs:

```bash
vercel env pull .env.local --environment=development --yes
```

Manual example (never commit real secrets; `WW_ENV=local`):

```bash
# .env.local
WW_ENV=local
DATABASE_URL=postgresql://postgres.<STAGING_REF>:<PASSWORD>@aws-0-eu-west-2.pooler.supabase.com:6543/postgres?sslmode=require
DATABASE_URL_SESSION=postgresql://postgres.<STAGING_REF>:<PASSWORD>@aws-0-eu-west-2.pooler.supabase.com:5432/postgres?sslmode=require
```

Full three-world playbook (local / staging / production, agent rules, Hobby vs Pro):
[`environments.md`](environments.md).

`drizzle-kit` and `tsx` do **not** load `.env.local`. Use `dotenv-cli`.
