# 0009. Shared pooler for Vercel and CI, session URI for migrations

**Status:** Accepted
**Date:** 2026-09-07

## Context

Supabase direct connections resolve to **IPv6**. Vercel Functions and GitHub Actions cannot
open outbound IPv6 sockets. That combination is a well-known production failure
(`ENETUNREACH`), and it is why the club's "just use DATABASE_URL from the dashboard" instinct
is unsafe if the dashboard default is the direct host.

Supabase now ships two poolers:

- **Shared (Supavisor)** — IPv4 on every tier. Session = port 5432, transaction = port 6543.
  Username is `postgres.<project_ref>`.
- **Dedicated (PgBouncer)** — paid, co-located, IPv6 unless the IPv4 add-on is on. Transaction
  only.

Transaction mode does not support prepared statements. Drizzle + postgres.js default to
prepared statements.

Vercel Fluid Compute (default for new projects) reuses instances, so an app-side pool of tens
of connections per instance will exhaust a small Postgres.

## Decision

1. **Runtime `DATABASE_URL`** = Shared pooler **transaction** mode (`*:6543`).
2. **Migrations `DATABASE_URL_SESSION`** = Shared pooler **session** mode (`*:5432`).
3. Driver = **postgres.js** + `drizzle-orm/postgres-js`, `prepare: false`, `max: 1`, lazy
   `getDb()`.
4. Do not use the direct host or the dedicated pooler from Vercel or GitHub Actions.
5. Do not buy the IPv4 add-on unless we later need a true direct connection from IPv4.
6. Colocate: Supabase in EU West / London, Vercel `regions: ["lhr1"]`.

Full strings, username format, and the client snippet live in
[`../connections.md`](../connections.md). Which Supabase *project* those URLs belong to
(staging vs production) is [ADR 0010](0010-three-environments.md).

## Consequences

The app always talks IPv4. Migrations work from GitHub Actions and from IPv4 laptops.
Prepared-statement bugs show up the moment someone points runtime at 6543 without
`prepare: false`.

We give up session-level Postgres features in the request path (`LISTEN`, session `SET`).
v1 does not need them.

Switching to the dedicated pooler later is an env-var change **plus** either IPv6 egress
(Vercel still does not have it) or the IPv4 add-on. Do not "just change the host."

## Alternatives considered

**IPv4 add-on + direct or dedicated pooler.** Works, costs ~$4/month, and is not dual-stack.
Rejected as the default; shared pooler is the documented serverless path.

**`pg` Pool + `attachDatabasePool`.** Current Vercel Fluid sample. Rejected for v1 because
the official Supabase↔Drizzle quickstart is postgres.js. Revisit if Fluid suspend leaves
stale postgres.js sockets.

**`@vercel/postgres` / `drizzle-orm/vercel-postgres`.** Sunset. Rejected.

**Prisma with `?pgbouncer=true`.** Wrong ORM for this repo.
