# Brand foundation

**Status: proposed, pending one confirmation from the club.** Everything here is derived from real
Westminster Wanderers source material (kits, club identity) and from the product truths already
settled in [`../00-product/product-brief.md`](../00-product/product-brief.md) and
[`../01-domain/domain-model.md`](../01-domain/domain-model.md). The one thing that needs a human
yes/no is the exact yellow — see [Colour: what needs confirming](#what-needs-confirming).

[`phases.md`](../04-roadmap/phases.md) assigns final colour picks to the club's Chief Design
Officer. This document is that pick, with the reasoning shown so it can be overruled on evidence
rather than taste.

---

## 1. What we are branding

**Westminster Wanderers Pellet Index** — the full name, confirmed in open question Q25. In the
interface it is almost never written out in full. The product refers to itself as:

| Context | Wording |
| --- | --- |
| Browser title, install name, first run | Westminster Wanderers Pellet Index |
| App header, once you're inside | **Pellet Index** |
| A single player's number | their **Pellet score** — never "points total", never "PI score" |
| The season table | **the Index** ("top of the Index", "climbed six places") |
| The 3/2/1 pub vote | **bonus** — never "MOTM", never "player ratings" |

The club is **Westminster Wanderers FC**; the team in scope is the **1st Team**. `Team` is a real
entity (Q2) but no multi-team branding exists yet — don't design a team switcher.

## 2. The strategic problem

This app replaces a Google Sheet that already works. A spreadsheet is free, everyone can open it,
and nobody has to learn it. The only reasons to move are things a sheet fundamentally cannot do:

1. **Show your working.** A sheet shows `56`. The app shows *"Forward goal × 14 = 56"*. The
   `PelletScore.breakdown` ledger is the product's actual reason to exist.
2. **Be worth opening on a Sunday night.** A sheet is a chore. This has to be the thing you check
   in the pub before your pint lands.
3. **Survive being used one-handed, drunk, on 3G.** Tom and Shane enter matches on their phones at
   the pub straight after the game. That is the real primary workflow, not an edge case.

Brand exists to serve those three. If a visual decision doesn't make the number more legible, the
app more fun to open, or data entry faster with one thumb, it isn't earning its place.

## 3. Design concept: **Matchday Print**

The reference is not a SaaS dashboard. It's the printed matter that already surrounds Sunday
league football: **the team sheet pinned to the changing room wall, the scoreboard, the matchday
programme, and the receipt behind the bar.**

That gives us five things a generic app doesn't have:

| Print idea | What it becomes in the product |
| --- | --- |
| **Scoreboard** | Pellet scores set enormous, tabular, unmissable. The number *is* the screen. |
| **Team sheet** | Line-ups as a typed list with ruled dividers, not avatar cards in a grid. |
| **Receipt / ledger** | The score breakdown as monospace rows with dotted leaders and a ruled total. |
| **Programme** | Warm paper stock, not `#FFFFFF`. Editorial headlines. Ink, not grey-on-grey. |
| **Kit** | Yellow used as a *field* — big flat planes of it — the way a shirt uses colour. |

The concept is deliberately narrow so it produces decisions. "Playful" on its own does not: as the
DESIGN.md guidance puts it, words like *premium*, *playful* and *clean* need supporting rules to
become useful. Ours is: **playful through scale, colour and candour — never through decoration.**
Big numbers, loud yellow, blunt copy. No mascots, no confetti, no emoji as iconography.

## 4. Colour

### Where it comes from

Westminster Wanderers' kits, supplied by **Hope & Glory**, are consistently **yellow with navy**
(2022–23 and 2024–25 home shirts). The 2025 tour kit was an explicitly Dortmund-inspired
**electric yellow and black** strip. Yellow is unambiguously the club's primary; navy is the
established home partner; black is the tour-kit alternative.

This is a gift. Yellow and navy is loud, sporty, and about as far as it's possible to get from the
indigo-violet palette that every AI-generated app defaults to. We lean into it hard.

### The palette

Every value below has been checked with real WCAG contrast math, not estimated. Ratios are quoted
against the surface each colour is actually used on.

**Core**

| Token | Hex | Role | Contrast |
| --- | --- | --- | --- |
| `--ww-yellow` | `#FFD400` | The club. Fields, the active state, the brand bar | 11.80 on navy |
| `--ww-navy` | `#0B1B3F` | Ink. All body text, all headings, dark surfaces | 15.38 on paper |
| `--ww-paper` | `#F7F4ED` | The default page background. Warm programme stock, **not white** | — |
| `--ww-black` | `#111111` | Tour-kit black. Away/alternate surfaces, the ledger | 13.19 under yellow |

**Support**

| Token | Hex | Role | Contrast |
| --- | --- | --- | --- |
| `--ww-chalk` | `#E8E2D5` | Hairlines, table zebra, disabled fills | 13.09 under navy |
| `--ww-ink-muted` | `#4A5468` | Secondary text, labels, metadata | 6.93 on paper |
| `--ww-navy-700` | `#132650` | Raised surface on navy | 13.46 under paper |
| `--ww-navy-600` | `#1B3163` | Borders and dividers inside navy areas | 11.47 under paper |

**Result semantics** — these appear constantly (form guides, match cards) so they are first-class
tokens, not ad-hoc Tailwind greens and reds.

| Token | Hex | Role | Contrast on paper |
| --- | --- | --- | --- |
| `--ww-win` | `#1B7F4B` | Win | 4.57 |
| `--ww-draw` | `#5F6875` | Draw | 5.13 |
| `--ww-loss` | `#C0342B` | Loss | 5.07 |

`--ww-draw` is deliberately `#5F6875` and not Tailwind's `gray-500` (`#6B7280`), which measures
4.40 on our paper and fails AA for body text. Don't substitute it back.

### The one non-negotiable colour rule

**Yellow never carries text on a light background.** `--ww-yellow` on `--ww-paper` measures
**1.30:1** — it is functionally invisible. Yellow is a *surface* that navy or black sits on top of,
or it is a *mark* (a rule, a bar, a fill) that carries no text at all.

This single rule does most of the work of keeping the app looking like a football club instead of
a fintech startup, because it forces yellow to appear as big confident planes rather than as
timid accent text and small button fills.

Corollaries:

- A primary button is **navy field, yellow or paper text** — or **yellow field, navy text**. Never
  yellow text on paper.
- Yellow is never the colour of a link, a caption, or any type below 24px on a light surface.
- Yellow is never used to mean "warning". We have no amber semantic; a warning is navy on yellow
  and reads as emphasis, which is what we actually mean.

### What needs confirming

`--ww-yellow` `#FFD400` is my read of the kit: an electric, slightly green-leaning yellow
consistent with both the Hope & Glory home shirts and the Dortmund-inspired tour strip. Two
questions for the club before this is locked:

1. **Is there an existing brand spec?** A Hope & Glory kit order, a crest artwork file, or anything
   from the club's designer will have real values. If so they beat my inference outright — send
   them over and I'll re-run the contrast checks against them.
2. **Yellow or navy as the dominant surface?** Both work and they read very differently. A
   mostly-paper app with yellow fields feels like a printed programme; a mostly-navy app with
   yellow type feels like a floodlit scoreboard at night. My recommendation is **paper-dominant by
   default with a navy "matchday" mode**, because the app is mostly read in daylight on a phone and
   paper is easier on data density. Worth 30 seconds of your opinion.

Nothing downstream is blocked on this. Every colour is a token, so changing the yellow is a
one-line change, not a redesign.

## 5. Typography

Three requirements: enormous numerals that stay aligned, dense tables that stay readable on a
phone, and **not Inter**, which is the single clearest tell of a default AI-generated interface.

| Role | Family | Weights | Why |
| --- | --- | --- | --- |
| **Display** | **Archivo Expanded** (variable) | 700 / 800 / 900 | A grotesque with a real width axis. At heavy weights and expanded widths it reads like a scoreboard or a shirt number. Distinctive, free, on Google Fonts. |
| **Text** | **Archivo** (variable) | 400 / 500 / 600 | Same family at normal width, so headings and body are related without a second personality. Excellent tabular figures. |
| **Ledger** | **IBM Plex Mono** | 400 / 600 | The score breakdown, fee amounts, and any column of figures. Monospace is what makes a breakdown read as a *receipt* rather than a table. |

Rules:

- **`font-variant-numeric: tabular-nums` on every number that appears in a column.** Non-negotiable.
  A leaderboard where the digits shift horizontally as scores change is the single most obvious
  sign of an interface nobody tested with real data.
- **Display type is set tight** — `letter-spacing: -0.02em` at 48px and above, `-0.03em` at 72px
  and above. Loose display type looks like a template.
- **Never letterspace lowercase text.** Small uppercase labels (`.eyebrow`) get `+0.08em`; nothing
  else gets positive tracking.
- **The type scale jumps hard.** See [`DESIGN.md`](DESIGN.md) — there is deliberately nothing
  between 32px and 56px. Timid, evenly-spaced type scales are what make generated UI look flat.

## 6. Logo and marks

The club has a crest. We do not have a usable digital copy of it in this repo, and **we should not
invent one.**

- **Ask the club for the crest** as SVG, or failing that the highest-resolution raster available.
  Until it arrives, the app's mark is a **typographic lockup**: `WW` set in Archivo Expanded 900,
  navy, on a yellow square with no rounding.
- The crest, when it arrives, appears in exactly three places: the app header, the install icon,
  and the match card for a home fixture. It is not a watermark, not a background, not decoration.
- **No AI-generated crest, ever.** A fake badge for a real club is worse than no badge.

Opposition clubs have no logos and we will not source them. An opponent is represented by their
name set in Archivo, plus their result colour. This is a feature: it keeps the visual weight on us.

## 7. Voice

The app is written the way the team actually talks about itself — dry, specific, a bit merciless,
never corporate and never cutesy.

| Do | Don't |
| --- | --- |
| "Bath Old Boys United 1–2 Wanderers" | "Great result, lads! 🎉" |
| "You haven't paid for three games." | "Friendly reminder: outstanding balance" |
| "No matches yet. The season starts in September." | "Nothing to see here!" |
| "Shane's had 11 points off one game." | "Shane is performing well this season" |
| "Didn't play." | "N/A" |
| "Couldn't save that. Try again — nothing was lost." | "An error occurred" |

Specific rules:

- **Numbers in prose, always.** "Six clean sheets", not "several clean sheets".
- **Name people.** The app knows who did what; using names is what makes it feel like the team's
  app rather than software.
- **Empty states say what happens next**, with a date if we know one. Never "No data available".
- **Errors during match entry must promise the data survived**, because the person reading it is in
  a pub on bad signal and will otherwise assume they've lost twenty minutes of work.
- **Banter is aimed at performance, never at people.** "Who never turns up" is a real query in the
  domain model. It's funny as a stat; it must not be a shaming feature. No walls of shame, no
  automated dig at the bottom of the table.
- **Never use the word "engagement", "insights", "journey", or "seamless".** If a sentence would
  fit in a B2B SaaS marketing page, rewrite it.

## 8. What this brand explicitly rejects

Stated plainly so a build agent can be held to it. These are the defaults that would make this look
like every other generated app:

- Indigo or violet primary. Purple-to-pink gradients. Any gradient as a brand device.
- Glassmorphism, frosted panels, backdrop blur.
- A uniform mid-range radius on everything. We use two registers with nothing between them: 0px
  rectangles for the record, pills for actions — see [`DESIGN.md`](DESIGN.md).
- Soft grey drop shadows on white cards floating over a light grey page.
- Inter as the typeface.
- Emoji used as icons or as status indicators.
- A centred hero with a gradient blob behind it.
- Three-column feature grids with a small icon, a bold heading and two lines of grey text.
- "Dashboard" as a page name, or a metric-card row of four KPIs with percentage deltas.

---

**Next:** [`DESIGN.md`](DESIGN.md) is the agent-readable spec with exact tokens and rules.
[`component-system.md`](component-system.md) turns those into components.
[`ux-and-flows.md`](ux-and-flows.md) covers screens and roles.
