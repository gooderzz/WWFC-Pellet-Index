# 0008. Match drafts persist locally and on the server

**Status:** Accepted
**Date:** 2026-09-07

## Context

The primary author is in a pub on a phone with bad signal. Opus made draft persistence a **v1
correctness requirement**, not a PWA nice-to-have: a backgrounded tab, a reload, or a dropped
connection must not lose a half-entered team sheet.

Tech-stack.md had left "offline match recording" open. That question mixed two things: (1) can
the recorder survive a blip, and (2) can the whole Index be used with no network. Only (1) is
v1.

`matches.recording_status = draft` is already in the domain model. It has to be real in
Postgres, not a React state.

## Decision

**v1 recorder:**

- Every step upserts the server row (`recording_status = draft`).
- The same payload is written to **IndexedDB** (localStorage is acceptable if IDB is overkill)
  keyed by `matchId`.
- On load, merge server vs local by latest `updatedAt` **per field group** (result, sheet,
  events, bonus).
- Error copy says the draft is not lost.

**✅ Refined (CTO review, 7 Sep 2026) — `events` is not a same-shape field group as the other
three.** `result`, `sheet` (team sheet) and `bonus` are single-shot facts edited in one pass, so
last-`updatedAt`-wins per group is fine. `match_events` is different: it's an **append-only list
built incrementally over ~90 minutes**, and treating it as one group risks Tom adding a goal on
his phone silently vanishing if Shane's device — holding a stale copy of the events list — writes
its own unrelated group update a moment later. So **`match_events` merges by union of
client-generated ids**: every event gets a UUID at creation on the device that recorded it, and
the merge keeps every event either side has, re-sorted by `sequence`. The other three groups keep
simple last-`updatedAt`-wins; only `events` needs the union merge.

**Not v1:** service worker, install prompt, offline Index, sync queue for the read app.

Walkovers and scheduled-but-unplayed matches never generate scores. A draft never appears on
The Index.

## Consequences

Two sources of the same draft can diverge if two admins edit on two phones. Last write per field
group wins. That is acceptable: there are three admins and one pub table.

We do not need RxDB / Electric / Replicache. Twenty matches a year.

## Alternatives considered

**Server only.** Loses the pub-reload case. Rejected.

**Local only until finalise.** Loses the phone-swap case (Tom starts, Shane finishes) and any
crash before submit. Rejected.

**Full local-first sync.** Wrong scale.
