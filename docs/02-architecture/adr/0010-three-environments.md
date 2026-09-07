# 0010. Three environments, two databases

**Status:** Accepted
**Date:** 2026-09-07

## Context

Agents will run this app on laptops, on ephemeral Preview URLs, and eventually on a URL the
squad actually opens on a Sunday. A single Supabase project shared by all of those is how
someone seeds fake Ollie Wyatt rows into the live Index.

Vercel provides Local / Preview / Production by default, plus **one custom environment per
Pro project**, which is the current documented way to keep a long-lived staging URL
([Environments](https://vercel.com/docs/deployments/environments)). Hobby can approximate
that with a branch-assigned domain.

`vercel promote` aliases an existing deployment to production **without rebuilding**. That is
wrong if staging and production have different `DATABASE_URL`s.

## Decision

- **Two** Supabase projects: staging and production. Same region (London / EU West).
- **One** Vercel project.
- **Local** and **Preview** and **Staging** all use the staging database.
- **Production** (`main`) alone uses the production database.
- Preferred Vercel staging: custom environment slug `staging`, branch matcher **equals**
  `staging`. Hobby fallback: domain + Preview env vars scoped to git branch `staging`.
- `WW_ENV` is `local` | `staging` | `production`.
- Different `ADMIN_PASSPHRASE` and `SESSION_SECRET` per database.
- Never `vercel promote` staging → production. Production always rebuilds from `main`.
- Never `vercel env pull` production into `.env.local`.

Playbook: [`../environments.md`](../environments.md).

## Consequences

Wiping staging is cheap. Production is the season record. Agents can migrate and seed staging
freely. Production migrates only on request, after the same SQL has run on staging.

We pay for two Supabase free (or Pro) projects. That is the cost of not mixing pub drafts with
live scores.

Hobby without a custom env still works; the staging URL is a branch domain instead of an
environment slug. The two-database rule does not change.

## Alternatives considered

**One database, three Vercel envs.** Simplest, and the first way a Preview seed script hits
Sunday's table. Rejected.

**Three databases (local Docker + staging + prod).** Heavier than this club needs. Local Docker
is deferred; laptops use the staging pooler (IPv4).

**Promote staging builds to production.** Instant, and would serve staging's data on the live
domain. Rejected.

**Supabase branching.** Useful later. Two full projects are clearer for passphrases, RLS, and
dashboard access for Tom/Shane/William.
