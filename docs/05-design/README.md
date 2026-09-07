# Design

The visual language, component system and UX for the Westminster Wanderers Pellet Index.

**If you are about to generate or write UI, read [`DESIGN.md`](DESIGN.md) first.** It holds the exact
token values and a list of thirteen patterns that will get the work rejected. The other documents
explain the reasoning behind it.

## The documents

| Doc | Read it when |
| --- | --- |
| **[DESIGN.md](DESIGN.md)** | Always, before writing UI. Tokens, type scale, spacing, motion, accessibility, do-not-use list, review checklist. |
| [brand-foundation.md](brand-foundation.md) | You need the *why* — where the palette comes from, what the concept is, how the app talks. |
| [component-system.md](component-system.md) | You're building components, or wondering whether to add a new one. |
| [ux-and-flows.md](ux-and-flows.md) | You're building a screen or a flow. |
| [handoff-brief.md](handoff-brief.md) | You're defining the architecture, or planning the build order. |

## The one-paragraph version

The concept is **Matchday Print** — the app looks like the printed matter that already surrounds
Sunday league football: a scoreboard, a team sheet pinned to a changing room wall, and the receipt
behind the bar. Club yellow `#FFD400` and navy `#0B1B3F` on warm paper `#F7F4ED`, Archivo Expanded
for enormous tabular numerals, IBM Plex Mono for the score breakdown so it reads as a receipt.
**~80% paper / ~15% navy / ≤5% yellow.** Two radius registers (0px record / pill action), hairline
rules, **one overlay shadow** (dialogs only). Playful through scale, colour and candour — never
through decoration. The signature screen is a player's match score at 128px with the ledger of
rules that produced it directly underneath, because *showing the working* is the only reason this
exists instead of a spreadsheet.

[`DESIGN.md`](DESIGN.md) wins if this paragraph drifts. Hard-offset card shadows and yellow as
big page planes were tried and **rejected**.

## Status

Proposed and complete enough to build against. One decision needs the club: confirmation of the
exact yellow, and whether they have real brand values or a crest file that should override our
inference. See [`brand-foundation.md`](brand-foundation.md#what-needs-confirming) — it's a token, so
a change is one line, and nothing is blocked waiting for it.
