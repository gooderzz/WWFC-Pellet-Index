# 0005. Two shared passphrases, no accounts

**Status:** Accepted
**Date:** 2026-09-07

## Context

William closed auth after a short conflict between a four-role matrix, magic-link, and a shared
password (Q15/Q16/Q24, 6 Sep 2026):

- Nobody should log in to look at the Index.
- Write access is a small, extensible set of named people: Shane Livingstone, Tom Heaton,
  William Goodwin, more later by telling them the secret.
- There is no permission split between Manager, Captain and system admin.
- Tom and Shane enter matches on phones at the pub. A login page that dumps the in-flight
  recorder is unusable.
- The club explicitly traded "who edited this" for simplicity.

Opus's UX contract: viewer gate is optional; admin unlock is a **sheet**, not a route; the
interrupted mutation completes after the cookie is set; an Admin chip in the header locks the
phone again when it gets handed round.

## Decision

**No Supabase Auth. No Clerk. No NextAuth. No `users` table. No magic link. No email.**

Two environment variables and two httpOnly cookies:

| Cookie | Env | Meaning |
| --- | --- | --- |
| `ww_viewer` | `VIEWER_PASSPHRASE` | If the env var is empty, the app is public. If set, `proxy.ts` requires the cookie |
| `ww_admin` | `ADMIN_PASSPHRASE` | Required on every Server Action that writes |

Cookies are HMAC-signed with `SESSION_SECRET`, `httpOnly`, `secure`, `sameSite=lax`, long
max-age. Compare secrets with `crypto.timingSafeEqual` on equal-length buffers.

`unlockAdmin(passphrase)` sets the cookie and the caller retries the original action in place.
There is no `/login` and no `/admin`.

Optional free-text `entered_by` on a match is the audit trail. Knowing the passphrase is the
grant; growing the admin set is telling one more person.

**✅ Resolved (CTO review, 7 Sep 2026) — the security posture proportionate to this app.** This
protects a Sunday league scoring app for ~20 people, not a bank; the controls below are
deliberately light:

- **Cookie lifetime:** long max-age (**180 days**), refreshed on use. Nobody should have to
  re-unlock mid-season. Clearing the Admin chip (phone handed round) clears it immediately
  regardless of max-age.
- **Rate limiting:** no dedicated infrastructure for v1. A single in-memory counter in the
  `unlockAdmin` Server Action (e.g. a `Map<ip, {count, resetAt}>`, capped at ~10 attempts per
  15 minutes) is enough to blunt a naive script; it resets on a cold Fluid instance, and that's
  fine — the attacker surface here is "someone guesses `WWFC2026`," not a credential-stuffing
  botnet. Do not add Redis/Upstash/Vercel KV for this alone.
- **Failed attempts:** just the wrong-passphrase error message; no lockout, no alerting. Locking
  out Tom because he fat-fingered it twice on a phone in a pub is a worse outcome than the risk
  it prevents.
- **Rotation runbook (manual, and that's fine):** if the admin passphrase leaks, or once a
  season defensively, whoever holds the Vercel project changes `ADMIN_PASSPHRASE` in Vercel's
  env vars and redeploys. **✅ Corrected (CTO review, 7 Sep 2026): that step alone does not log
  anyone out.** The `ww_admin` cookie is an HMAC signed with `SESSION_SECRET`, not a value
  derived from the passphrase itself — so an already-unlocked browser stays unlocked after
  `ADMIN_PASSPHRASE` changes; rotating it only stops *new* unlocks that try the old (leaked)
  value. **To actually invalidate every existing admin session** — the case that matters if the
  passphrase leaked to someone untrusted, not just "change it defensively once a season" — both
  `ADMIN_PASSPHRASE` **and** `SESSION_SECRET` must be rotated together. Changing `SESSION_SECRET`
  breaks every cookie's signature at once, forcing a fresh unlock everywhere — acceptable, there
  are three admins, and re-unlocking takes one tap. No per-person revoke exists because there are
  no per-person accounts to revoke.

## Consequences

Anyone with the admin passphrase can rewrite the season. That is the accepted trade-off. Rotate
the passphrase in Vercel env vars if it leaks; there is no per-person revoke.

Staging and production must use **different** admin passphrases and `SESSION_SECRET`s
([ADR 0010](0010-three-environments.md)). A cookie minted on staging must not unlock
production.

RLS cannot be keyed to a user id, which is why the browser never talks to PostgREST
([ADR 0006](0006-server-only-database.md)).

## Alternatives considered

**Four roles (Manager / Captain / System Admin / Player).** Drafted, then killed by the club.

**Magic link / email.** Floated, then killed: "lock the simpler shared passphrase approach."

**Supabase Auth anonymous + a single shared password user.** Extra moving parts for the same
secret. Rejected.

**Fully public writes behind obscurity.** Rejected: the Index being public is fine; writing
scores is not.
