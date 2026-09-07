# 0006. Server-only database access

**Status:** Accepted
**Date:** 2026-09-07

## Context

Supabase ships a Data API (PostgREST) and a publishable key meant for browsers. That model
assumes RLS policies keyed to `auth.uid()`. This app has no users ([ADR 0005](0005-shared-passphrases.md)).

Vercel Functions and GitHub Actions are **IPv4-only outbound**. Supabase's direct host and
dedicated pooler are **IPv6** unless the paid IPv4 add-on is enabled. The documented serverless
path is the **Shared Pooler (Supavisor) in transaction mode**.

A leaked `NEXT_PUBLIC_` key must not be able to read or write Pellet data. There are no users,
so RLS cannot be keyed to `auth.uid()`.

## Decision

The browser **never** queries PostgREST, never uses `supabase-js` for data, and never sees
`DATABASE_URL` or the service-role key.

- Drizzle + **postgres.js** only in server modules (`getDb()` in `lib/db/client.ts`).
- `DATABASE_URL` = shared **transaction** pooler (`*:6543`), `prepare: false`, `max: 1`.
- `DATABASE_URL_SESSION` = shared **session** pooler (`*:5432`) for drizzle-kit / migrations.
- Username `postgres.<PROJECT_REF>`. Copy from Connect. Never the direct `db.<ref>` host from
  Vercel or CI.
- RLS **on** for every `public` table. **No** DML grants to `anon` or `authenticated`.
- `NEXT_PUBLIC_*` may include a project URL if we ever need it for something else; it must not
  include a key that can read the database.

Migrations are generated from `lib/db/schema.ts` with Drizzle Kit against
`DATABASE_URL_SESSION`. We do not `apply_migration` MCP against production as day-to-day
workflow.

Prefer a **separate Supabase project** for preview. Colocate the project with Vercel `lhr1`.

Full connection contract: [`../connections.md`](../connections.md).

## Consequences

Every read goes through the Next server. At this scale that is fine. Caching, when we need it,
is Next's `cache` / tags, not a second data layer.

Defence in depth: even if someone finds the publishable key, RLS + no grants means empty.

We give up the Supabase client realtime/subscriptions story. v1 does not need it.

## Alternatives considered

**Open RLS and query from the client.** Fast to scaffold, and the first way this database gets
trashed. Rejected.

**Service-role key in the browser, "but it's a tiny club."** Rejected.

**Prisma Data Proxy / Neon serverless driver against the same Postgres.** Extra vendor. The
club named Supabase; we use its shared pooler.

**IPv4 add-on + direct connection.** Works, costs money, not dual-stack. Rejected as default;
see [ADR 0009](0009-shared-pooler.md).
