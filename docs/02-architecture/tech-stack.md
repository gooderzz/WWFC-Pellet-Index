# Tech stack

**Status: decided, and largely superseded by the fuller implementation contract.** This doc was
the first pass at the stack decision. It's still an accurate *rationale* (why Next.js, why
Supabase, why Drizzle), and the club decisions it cites (**Q33**: GitHub/Vercel/Supabase for
shared ownership; **Q16/Q24**: two shared passphrases, no accounts) are correct and final. For
the actual implementation contract — exact package choices, repository layout, migrations,
connection strings, environments — read
[`engineering-guide.md`](engineering-guide.md) and its ADRs instead; that is now the living
document, this one is the "why."

## What the product demands

Working backwards from the brief:

- **Phones, overwhelmingly.** Twenty players checking their points on a Sunday evening. Desktop is
  a nice-to-have for the Scorer.
- **Bad connectivity at the point of entry.** Recording a substitution at a pitch in Merton.
- **Zero-friction identity.** The bonus vote itself happens verbally at the pub, not in-app — an
  Admin just enters the resolved 3rd/2nd/1st afterwards. Nobody should have to remember a password
  to look anything up; the two shared passphrases exist only to gate write access, not identity.
- **Relational data with real integrity constraints.** ✅ Corrected: matches, appearances and
  events are deeply relational; there is no separate `votes` table (the vote is verbal, only the
  certified `bonus_awards` result is stored) — but the numbers still need to reconcile.
- **A pure, testable scoring engine.** It has to be provably correct against every rule the club
  has ever used — see engineering-guide.md §10 for what "reproduce three historical seasons"
  honestly means (season totals import unchanged; there's no match-level history to replay).
- **Tiny scale, tiny budget.** Twenty users, twenty matches a season. This should cost nothing to
  run.

## Proposal

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | **Next.js (App Router), TypeScript** | Server components suit a read-heavy app, one deployable, mature ecosystem |
| Styling | **Tailwind CSS** | Fast, consistent, mobile-first by default |
| Components | **shadcn/ui** | Accessible primitives, owned in-repo rather than a dependency, easy to theme to club colours |
| Database | **Postgres via Supabase** ✅ confirmed (Q33) | Relational integrity matters here. Chosen specifically so ownership/access can be shared across a few people, not tied to one account |
| ORM | **Drizzle** | Typed, SQL-shaped, migrations that are readable in a PR |
| Auth | **✅ Confirmed (Q16/Q24): two shared passphrases, no accounts** — Viewer/Player and Admin, each a constant plus a cookie, no Supabase Auth needed | Players need zero auth; the club explicitly traded security for simplicity for the small admin group too |
| Charts | **Recharts** or **visx** | The season race chart and per-player trends |
| Hosting | **Vercel** ✅ confirmed (Q33) | Chosen alongside GitHub/Supabase specifically for shared ownership |
| Testing | **Vitest** | The scoring engine needs real unit tests against the historical data |

## The one structural rule

**The scoring engine is a pure function, in its own module, with no framework dependencies.**
See [`engineering-guide.md`](engineering-guide.md) and [ADR 0004](adr/0004-next-vercel-supabase.md).

```
(appearance + match events + ruleset) → { total, breakdown }
```

No database access, no React, no I/O. It takes data and returns data. That makes it trivially
testable, and its test suite is the three legacy seasons: feed in reconstructed events and the
2023/24 ruleset, get 2023/24's published totals out.

Everything else in the app can be rewritten. This module is the asset.

## Alternatives considered

**A spreadsheet with better formulas.** Cheapest option, and worth naming honestly. Rejected
because it cannot fix the actual problems: no per-match history, no identity, no voting, no phone
experience.

**Supabase as a full backend** (Postgres + auth + realtime + storage in one). ✅ **Confirmed (Q33)
— this is the plan**, not just an option: the club explicitly named GitHub, Vercel and Supabase as
the stack precisely because it lets ownership and access be shared across a few people. With auth
now locked in as two shared passphrases rather than magic-link (Q16/Q24), Supabase's role narrows
to just the database — no need for Supabase Auth, a users table, or row-level-security policies
keyed to individual identities. The passphrase check can live entirely in the Next.js app (env vars
+ a signed cookie), which is simpler to build and reason about.

**SQLite / Turso.** Would work fine at this scale and is cheaper still. Postgres wins on
familiarity and on hosted free tiers that include a UI the Scorer could use in an emergency.

**A React Native or Flutter app.** Rejected. An installable PWA gets a home-screen icon and offline
support without app stores, review cycles or a second codebase. Revisit only if push notifications
turn out to be essential to getting people to vote.

**A no-code tool** (Airtable, Notion, Glide). Rejected for the same reason as the off-the-shelf
apps in the [landscape research](../03-research/competitive-landscape.md): none of them can express
the Pellet Index scoring rules.

## Open before this is settled

**None of these block Phase 1.**

- Hosting domain: `pelletindex.co.uk` vs `westminsterwanderers.co.uk` — not yet asked. Use the
  Vercel preview URL until then.
- Club confirmation of hex / crest SVG (design D1–D3) — tokens, not architecture.
- Whether a no-show owes a fee (D4) — assumed £0 in `schema.md`.

**Closed here, 7 Sep 2026:**

- Recorder drafts on bad signal → **v1**, local + server. Full offline Index → later.
  [ADR 0008](adr/0008-draft-persistence.md).
- Public vs viewer passphrase → env var; empty means public (Q24).
- No FA Full-Time importer (Q13).

The full implementation contract is
[`engineering-guide.md`](engineering-guide.md). How Vercel actually reaches Postgres (IPv4,
shared pooler, two URLs) is [`connections.md`](connections.md). Local / staging / production
is [`environments.md`](environments.md). This file is the *why*; those files are the *how*.
