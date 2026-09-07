# Handoff brief — design to architecture

**From:** Product & Design
**To:** the CTO agent defining the architecture, and the engineers building against it
**Covers:** what design has decided, what is deliberately left to engineering, and what must not be
re-litigated.

Read [`DESIGN.md`](DESIGN.md) first — it is the enforceable contract. This brief exists to say how
the design work constrains the architecture, and where it doesn't.

---

## 1. What design has settled

| Area | Decision | Where |
| --- | --- | --- |
| Concept | *Matchday Print* — scoreboard, team sheet, receipt | [`brand-foundation.md`](brand-foundation.md) |
| Palette | Yellow `#FFD400` / navy `#0B1B3F` / paper `#F7F4ED`, all contrast-verified | [`DESIGN.md`](DESIGN.md) |
| Type | Archivo Expanded / Archivo / IBM Plex Mono. **Not Inter** | [`DESIGN.md`](DESIGN.md) |
| Radii, edges, elevation | Two radius registers (0px record / pill action), hairline rules, flat surfaces, one overlay shadow | [`DESIGN.md`](DESIGN.md) |
| Colour allocation | ~80% paper, ~15% navy, **≤5% yellow**, enforced in `SectionBand` | [`DESIGN.md`](DESIGN.md) |
| Component layering | Tokens → shadcn primitives → domain components → pages, one-directional | [`component-system.md`](component-system.md) |
| Navigation | Four tabs. No sidebar. No separate admin panel | [`ux-and-flows.md`](ux-and-flows.md) |
| Primary flow | Six-step match recording, autosaving as `draft` throughout | [`ux-and-flows.md`](ux-and-flows.md) |

## 2. What design needs from the architecture

These are the places where a design commitment imposes a real technical requirement. Each one is a
thing that cannot be retrofitted cheaply.

### 2.1 The breakdown is an API contract, not a UI detail

`ScoreLedger` is the product's reason to exist. Every score the app displays — season total, match
score, per-category subtotal — must be traceable to `PelletScore.breakdown` rows carrying
`ruleKey`, `label`, `quantity` and `points`.

**Requirement:** the scoring engine emits the ledger as its primary output; the total is a sum over
it, never computed separately. Any endpoint returning a score can return its breakdown without a
second round trip. Zero-point lines are included, not filtered — the UI shows them deliberately.

### 2.2 Draft persistence is a v1 correctness requirement

The Recorder is in a pub on bad signal. A match must be enterable across a dropped connection, a
backgrounded app and a page reload without loss.

**Requirement:** match entry writes optimistically to local storage keyed by match, and reconciles
on reconnect. Server-side, a `draft` match is a first-class persisted state, not a client-only
concept. The recording-status machine (`draft` → `awaiting votes` → `final` → `corrected`) is
already in the domain model — the UI depends on it existing server-side.

### 2.3 Ordering, never minutes

Per the resolved Q9 there are no minutes anywhere. Events carry `sequence`, including
`substitution` events (on/off, either side nullable) — the sole record of who was on the pitch
when, replacing an earlier `appearances.sub_sequence` field that couldn't represent a rolling
substitution. The clean-sheet-while-on calculation is an ordering comparison against those events.

**Requirement:** do not add a `minute` field "just in case". The UI has no field to populate it, the
club will never supply it, and its presence would invite an engine that silently depends on it.

### 2.4 Rulesets are versioned and the UI says which one applied

A ledger row is only meaningful alongside the ruleset that produced it, and the club's rules change
between seasons (ADR 0002).

**Requirement:** `PelletScore` rows reference their `rulesetId`, and it is retrievable with the
breakdown so the UI can label an archived season's scoring honestly.

### 2.5 Movement on the Index

**Decided (engineering, 7 Sep 2026):** snapshot the Index whenever a match becomes `final` or
`corrected`. Movement is rank versus the previous snapshot. No prior snapshot → no arrows (first
published match of the season). See [ADR 0007](../02-architecture/adr/0007-index-snapshots.md).

### 2.6 Auth shape

Two shared passphrases, no accounts (Q16/Q24). Admin unlocks **in place** and completes the action
the user was mid-way through.

**Requirement:** the unlock is an API call that sets a cookie and returns to the interrupted
mutation — not a redirect to a login route and back. Every page is renderable in both locked and
unlocked states without a different route.

## 3. What design is not dictating

Explicitly engineering's call, so nobody waits on design:

- Rendering strategy, caching, and where the scoring engine runs.
- Schema specifics beyond what the domain model already fixes.
- Data-fetching approach, state management, form library.
- Testing strategy — though the engine's ledger output is the natural assertion target, and the
  legacy seasons are the natural regression fixture.
- Whether Storybook is Storybook or another workshop tool. The requirement is that components are
  viewable in isolation with their real states; the tool is not the point.

## 4. Build order

Design's recommended sequence, optimised for finding out early whether the visual direction is
right, rather than discovering it after twelve pages exist.

1. **Tokens, fonts, `SectionBand`.** One screen, correct palette and band rhythm.
2. **`PelletScore` + `ScoreLedger`** against real 2025/26 data. → **Design review gate.**
3. Restyled shadcn primitives, per the deviation table.
4. `IndexTable`, `MatchCard`, `ResultChip`, `FormGuide`, `StatusChip`, state components.
5. Read-only screens: `/`, `/matches`, `/matches/[id]`, `/players/[id]`.
6. Write path: the six-step match flow, then the admin unlock.
7. `/money`.

**Stop at step 2 and show someone.** That screen — a real player's real score with its real
breakdown — is the whole product in miniature. If it doesn't feel right, nothing built on top of it
will.

## 5. Open, and who owns it

| # | Item | Owner | Blocking? |
| --- | --- | --- | --- |
| D1 | Confirm `#FFD400`, or supply the real kit/crest values | **Club** | No — it's a token |
| D2 | Paper-dominant or navy-dominant as default surface | **Club** | No — design recommends paper |
| D3 | Club crest as SVG | **Club** | No — typographic `WW` lockup until it arrives |
| D4 | Does an **unused sub who turned up** owe the £6 fee? (A silent no-show owes £0 — settled, CPO review 7 Sep 2026; see [`open-questions.md`](../00-product/open-questions.md) Q41.) | **Club** | No — assumed no |
| **D5** | Index movement: snapshots or recompute | **Engineering — decided 7 Sep 2026: snapshots on finalise.** [ADR 0007](../02-architecture/adr/0007-index-snapshots.md). Arrows appear after the second published match of a season. | No |

None of these block starting. D1–D3 are the ones to put in front of the club now, because they have
a long human latency and nothing else does.

## 6. The rejection criteria

Restating the standard this work will actually be judged against, because it is unusually specific
and it is the reason the design docs are written the way they are.

The brief was explicit: **if the output looks like every other AI-generated interface, it will be
rejected.** That is a real acceptance criterion, so it has been made testable rather than left as
taste. Three artefacts do that job:

- The **Do not use** list in [`DESIGN.md`](DESIGN.md) — thirteen concrete banned patterns.
- The **review checklist** at the end of the same file.
- The **CI grep and lint rules** in [`component-system.md`](component-system.md), which catch the
  most common regressions automatically.

The failure mode to watch for is not ugliness. It is *defaulting*: an engineer or agent reaching for
`rounded-lg shadow-sm bg-white` because it is what the muscle memory produces. That is why the
tokens ban raw hex, the primitives are restyled at install rather than at use, and pages are
forbidden from making styling decisions at all. The system is designed so the lazy path and the
correct path are the same path.
