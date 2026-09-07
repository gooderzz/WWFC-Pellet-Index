# 0004. Next.js on Vercel, Postgres on Supabase, Drizzle

**Status:** Accepted
**Date:** 2026-09-07

## Context

The club locked the ownership trio — **GitHub, Vercel, Supabase** — so the project can be handed
between Shane, Tom and William rather than living on one person's laptop (open question **Q33**,
6 Sep 2026). Auth is two shared passphrases, so Supabase Auth is unused (Q16/Q24).

The product is a read-heavy stats site plus one write-heavy pub flow. Scale is ~20 readers and
~3 writers. The scoring engine must be unit-testable with no I/O.

Sonnet proposed Next.js App Router, TypeScript, Tailwind, shadcn/ui, Drizzle and Vitest during
planning. Opus's design contract assumes `app/`, `components/ui/`, `components/pellet/` and
Tailwind v4 tokens in `globals.css`.

## Decision

We build **one Next.js App Router application** in this repository, TypeScript `strict`, Node
runtime on **Vercel Fluid Compute**. We do **not** set `runtime = "edge"`.

- UI: React Server Components by default, Tailwind CSS v4, shadcn/ui copied into
  `components/ui/` and restyled once to Matchday Print.
- Data: **Supabase Postgres** reached only from the server via **Drizzle + postgres.js** over
  the **shared transaction pooler** (IPv4). See [ADR 0009](0009-shared-pooler.md).
- Mutations: Next.js Server Actions. No public CRUD Route Handlers in v1.
- Tests: Vitest for the engine. Playwright later for the recorder.
- Package manager: pnpm. No monorepo. No second backend.

The scoring engine lives in `lib/scoring/` as a **pure function**. No Next, React, Drizzle, or
`fetch`.

Request gating for the optional viewer passphrase may use Next's `proxy.ts` (not
`middleware.ts`). Admin checks live in Server Actions. Do not treat proxy as the write
security boundary.

## Consequences

One deployable, one Vercel project, **two** Supabase databases (staging for local/Preview/
staging URL; production for `main` only). See [ADR 0010](0010-three-environments.md).
Engineers can split work by folder (`lib/scoring`, `lib/db`, `components/pellet`, `app`)
without a service boundary.

We are committed to Vercel + Supabase billing and to Drizzle migrations checked into git. Moving
off either later is a project, not a config flag.

SQLite/Turso would have been cheaper still. Postgres wins because the club already named
Supabase and because a hosted SQL UI is the emergency hatch if the app is down on a Sunday.

## Alternatives considered

**Supabase as the app API (PostgREST + RLS keyed to users).** Rejected: there are no users. See
[ADR 0006](0006-server-only-database.md).

**Remix / Vite SPA / a separate Hono API.** Rejected: extra moving parts for twenty users, and
the design docs already name the Next App Router layout.

**Prisma.** Readable, but Drizzle's SQL-shaped migrations are easier to review in a PR of this
size.

**Pages Router, `getServerSideProps`, Edge runtime.** Rejected. Fluid Compute is the Vercel
default and keeps Node APIs; Edge is a compatibility trap we do not need.
