# Architecture Decision Records

Short documents capturing decisions that would otherwise be re-litigated in six months. One file
per decision, numbered sequentially, never deleted — a superseded ADR gets its status changed and a
link to the one that replaced it.

Write one when a choice is hard to reverse, when a reasonable person would pick differently, or
when you find yourself explaining the same reasoning twice.

Copy [`template.md`](template.md) to start.

The implementation contract is [`../engineering-guide.md`](../engineering-guide.md). The physical
schema is [`../schema.md`](../schema.md). How the products actually connect (IPv4/IPv6, pooler)
is [`../connections.md`](../connections.md). Local / staging / production is
[`../environments.md`](../environments.md).

## Index

| ADR | Title | Status |
| --- | --- | --- |
| [0001](0001-record-architecture-decisions.md) | Record architecture decisions | Accepted |
| [0002](0002-versioned-rulesets.md) | Scoring rules are versioned data, not code | Accepted |
| [0003](0003-events-not-totals.md) | Store events and derive points | Accepted |
| [0004](0004-next-vercel-supabase.md) | Next.js on Vercel, Postgres on Supabase, Drizzle | Accepted |
| [0005](0005-shared-passphrases.md) | Two shared passphrases, no accounts | Accepted |
| [0006](0006-server-only-database.md) | Server-only database access | Accepted |
| [0007](0007-index-snapshots.md) | Index movement via snapshots on finalise | Accepted |
| [0008](0008-draft-persistence.md) | Match drafts persist locally and on the server | Accepted |
| [0009](0009-shared-pooler.md) | Shared pooler for Vercel/CI, session URI for migrations | Accepted |
| [0010](0010-three-environments.md) | Three environments: local, staging, production | Accepted |
