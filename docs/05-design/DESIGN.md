# DESIGN.md — Westminster Wanderers Pellet Index

Agent-readable design spec. If you are generating UI for this project, this file is the contract.
Values here are exact and are not suggestions. Rationale is in
[`brand-foundation.md`](brand-foundation.md); component APIs are in
[`component-system.md`](component-system.md).

**Concept:** *Matchday Print* — a scoreboard, a team sheet and a bar receipt, not a SaaS dashboard.
**Playful through scale, colour and candour. Never through decoration.**

---

## Principles

1. **The number is the interface.** A Pellet score is the content of the screen it appears on. Set
   it enormous. Never bury it in a card with a 14px label above it.
2. **Every score shows its working.** Any total must be expandable into the ledger of rows that
   produced it. A number without its breakdown is a bug, not a design simplification.
3. **Yellow is a field, navy is ink.** Yellow is a surface or a mark. It never carries text on a
   light background.
4. **Print, not glass.** Flat fills, hard edges, hairline rules, and type doing the structural work.
   No gradients, no blur, no translucency, and no shadow outside overlays.
5. **Thumb-first.** The primary author is entering a match one-handed, in a pub, on bad signal.
   Every write flow is designed for that before it is designed for desktop.
6. **Density over whitespace.** This is a stats product for people who like stats. Show the table.
   Do not hide 20 rows behind "View all".
7. **Every expressive device is fenced.** This is the principle behind the whole spec. Surveying 104
   production design systems, what separates them from generated UI is not that they avoid bold
   devices — plenty use violet, gradients, even glassmorphism — it is that each device has a
   **stated dose and a stated place**. Generated UI applies its devices everywhere at once. So
   every loud thing here is rationed on purpose: yellow is a field and never text, black is the
   ledger and nothing else, the pill radius belongs to actions alone, and there is exactly one
   animation in the product. **If you add an expressive device, you must also write down where it
   is forbidden.** An unfenced device is how this design decays back into the default.

---

## Colour tokens

```css
:root {
  /* Core */
  --ww-yellow:      #FFD400;  /* club yellow. surfaces + marks only, never text on light */
  --ww-yellow-deep: #E8BE00;  /* yellow pressed/hover state */
  --ww-navy:        #0B1B3F;  /* ink: all body text, all headings, primary dark surface */
  --ww-navy-700:    #132650;  /* raised surface inside a navy area */
  --ww-navy-600:    #1B3163;  /* borders + dividers inside a navy area */
  --ww-paper:       #F7F4ED;  /* default page background. warm stock, NOT #FFFFFF */
  --ww-black:       #111111;  /* tour-kit black: the ledger, away surfaces */

  /* Support */
  --ww-chalk:       #E8E2D5;  /* hairlines, zebra striping, disabled fills */
  --ww-ink-muted:   #4A5468;  /* secondary text, labels, metadata */

  /* Result semantics */
  --ww-win:         #1B7F4B;
  --ww-draw:        #5F6875;
  --ww-loss:        #C0342B;
}
```

**Verified contrast** (WCAG 2.1, computed not estimated):

| Pair | Ratio | Verdict |
| --- | --- | --- |
| navy on paper | 15.38 | AA + AAA |
| paper on navy | 15.38 | AA + AAA |
| navy on yellow | 11.80 | AA + AAA |
| black on yellow | 13.19 | AA + AAA |
| ink-muted on paper | 6.93 | AA |
| win / draw / loss on paper | 4.57 / 5.13 / 5.07 | AA |
| **yellow on paper** | **1.30** | **FAILS — forbidden** |

### Token roles

Every token carries its permitted dose and its prohibition. **Read the role before using a colour** —
the role, not the name, is what governs. A token used outside its role is a defect even if the
result looks acceptable.

| Token | Role, and what it may not do |
| --- | --- |
| `--ww-yellow` | The club. Large flat **fields**, the brand bar, the active state, focus rings on dark. **Never text on a light surface (1.30:1)**, never a link colour, never below 24px on paper, never a "warning". |
| `--ww-navy` | The ink. All body text, all headings, all borders, and the default dark surface. **Never** used as an accent or a highlight — it is the neutral here, and treating it as a brand colour is what would turn this into a generic blue app. |
| `--ww-paper` | The canvas. The background of nearly every screen. **Never** substitute `#FFFFFF`; the warmth is doing real work and pure white reads as a template. |
| `--ww-black` | Tour-kit black. **The ledger, and away-match surfaces only.** Not a general dark background — that is navy. Its scarcity is what makes the ledger feel like a separate object. |
| `--ww-chalk` | Hairlines, table rules, zebra, disabled fills. **Never** carries text and never becomes a card background. |
| `--ww-ink-muted` | Secondary text, eyebrow labels, metadata. **Never** for a number anyone cares about — a greyed-out score is the most common way a stats product loses its nerve. |
| `--ww-win` `--ww-draw` `--ww-loss` | Match outcomes, exclusively. **Never** repurposed as generic success/neutral/error in forms or toasts. A red field-validation message using `--ww-loss` would make "invalid email" and "we lost 4–0" the same colour. |

Two system-level rules:

- **There is no amber and no warning colour.** Emphasis, warning and "look at this" are all **navy on
  a yellow field**, which is also how a real scoreboard raises its voice.
- **Dark surfaces are navy, not black.** Navy-not-black is the same move as warm-paper-not-white: a
  tinted neutral rather than an absolute, which is what keeps the greys from looking stock.

### Colour allocation — how much of each, and where

Yellow at this saturation is exhausting in quantity and loses all its impact when overused. It is a
**punctuation mark, not a page**. The budget below is enforceable and deliberately strict.

| Colour | Share of a typical screen | Where it is allowed |
| --- | --- | --- |
| `--ww-paper` | **~80%** | The default. Every screen is a paper screen unless stated otherwise. |
| `--ww-navy` | **~15%** | All type, all rules, plus at most one dark band or panel per screen. |
| `--ww-yellow` | **≤5%** | See the rules below. |
| `--ww-black` | **<2%** | The ledger block, and away-match headers. |
| result colours | **<1%** | The W/D/L letter and the match score only. |

**The five places yellow is allowed, and nowhere else:**

1. **One page-header device per screen.** Its default form is an **8px yellow rule** under the page
   title — not a filled band. A full yellow *field* is permitted on the Index (`/`) only, because
   it's the front door, and it is capped at **160px tall on mobile, 200px on desktop**.
2. **The active navigation indicator** — a 3px bar under the current tab.
3. **The leader's rank marker** on the Index, and a player's position marker on their own page.
   One mark, not a whole column.
4. **The `corrected` stamp.**
5. **Focus rings on dark surfaces.**

**Hard limits:**

- **Never two yellow regions visible at once.** If the header is a yellow field, nothing else on
  screen is yellow.
- **Never a yellow page background**, and never yellow behind a table, a form, or any body copy.
- **Never yellow as a section-alternation device.** Sections alternate paper against *navy*, and
  even that is capped at one dark band per screen.
- A screen with no yellow at all is completely fine. Most secondary screens should have very little.

The test: **squint at the screen. Yellow should read as one or two marks, not as a colour scheme.**
It is the thing your eye lands on first precisely because there is so little of it — spend it on
the most important element on the page and nothing else.

### Surfaces

The full surface ladder, so nothing has to be invented at build time. There are only five, and
depth between them is carried by **rules and space, not shadow**.

| Level | Name | Paper mode | Floodlight mode | Purpose |
| --- | --- | --- | --- | --- |
| 0 | Canvas | `--ww-paper` | `--ww-navy` | The page. Default for ~80% of every screen |
| 1 | Raised | `#FFFFFF` | `--ww-navy-700` | Sticky headers and the tab bar only — the one place pure white is allowed, as a 2% lift off warm paper |
| 2 | Recessed | `--ww-chalk` | `--ww-navy-600` | Table header, disabled fills, the hover tint on a row |
| 3 | Feature | `--ww-navy` | `--ww-navy-700` | The single dark band or panel a screen may carry |
| 4 | Ledger | `--ww-black` | `--ww-black` | The score breakdown, and nothing else. Identical in both modes, which is what makes it read as a separate object |

Level 1 is the sole exception to "never `#FFFFFF`", and it exists because a sticky header needs to
separate from the canvas without a shadow. It is never a card background.

---

## Typography

```css
--font-display: "Archivo Expanded", "Archivo", system-ui, sans-serif;  /* 700/800/900 */
--font-text:    "Archivo", system-ui, sans-serif;                      /* 400/500/600 */
--font-ledger:  "IBM Plex Mono", ui-monospace, monospace;              /* 400/600 */
```

**Substitutes**, if a face is ever unavailable: display → Archivo Black, then Anton (never Bebas
Neue, which is exhausted). Text → Public Sans. Ledger → JetBrains Mono. Match the weight and keep
the display/text **width** contrast — losing that matters more than losing the exact face.

**Display has a hard minimum of 32px.** Below that, use Text. A display face set small is the
fastest way to make a system look like a parody of itself.

**Inter is forbidden.** Not because it is a bad typeface — because *Inter alone at three sizes* is
the tell. Across 90 surveyed production sites Inter appeared on 17 but was the sole family on
exactly **one**; the norm is **2.7 families** with a display face doing separate work.

### Scale

| Token | px | Line height | Family / weight | Use |
| --- | --- | --- | --- | --- |
| `score-hero` | 128 | 0.85 | display 900, `-0.03em` | The one Pellet score a screen is about |
| `score` | 88 | 0.85 | display 900, `-0.03em` | Score on a match/player card |
| `display` | 56 | 1.0 | display 800, `-0.02em` | Page title |
| `h2` | 32 | 1.15 | display 700, `-0.02em` | Section heading |
| `h3` | 24 | 1.25 | text 600 | Sub-section, card title |
| `lead` | 20 | 1.45 | text 400 | Intro paragraph, empty-state body |
| `body` | 16 | 1.55 | text 400 | Default |
| `small` | 14 | 1.45 | text 400 | Table cells, metadata |
| `eyebrow` | 12 | 1.2 | text 600, uppercase, `+0.08em` | Labels above a value |

**There is deliberately nothing between 32 and 56.** The gap is the point. An evenly-spaced type
scale with a step every 2px is what makes generated pages read as flat and templated. Do not add
intermediate sizes to "smooth it out".

### Type rules

- `font-variant-numeric: tabular-nums` on **every** figure in a column, table, or anything that
  updates in place. No exceptions.
- Negative tracking on display sizes only. Body text is never tracked.
- Positive tracking (`+0.08em`) only on `eyebrow`, which is always uppercase.
- Never letterspace lowercase text.
- Max measure for prose: `68ch`. Tables are exempt.
- The ledger uses `--font-ledger` at 14px with `tabular-nums`, and that is the only place monospace
  appears in running content.

---

## Space, radius, edges, elevation

### Spacing scale

`2, 4, 8, 12, 16, 24, 32, 48, 64, 96` (px). Nothing else. No arbitrary values.

Section rhythm: 64 between major sections on desktop, 48 on mobile. Card padding: 24 desktop, 16
mobile. Table row padding: 12 vertical.

### Radius — keyed by element, in two registers

Radius is specified **per element**, never as a `sm/md/lg` scale, so it cannot be misapplied. There
are two registers and **the gap between them is the design**.

```css
/* Register 1 — print. The page is built from rectangles. */
--radius-surface: 0px;    /* cards, bands, table cells, inputs, dialogs, images */
--radius-stamp:   2px;    /* status chips — the only softened rectangle */

/* Register 2 — the rosette. Used sparingly, in hard contrast to register 1. */
--radius-action:  999px;  /* buttons, form-guide letters, position chips */
```

**Nothing exists between 2px and 999px.** No `rounded-md`, `rounded-lg` or `rounded-xl`. A uniform
mid-range radius applied to everything is the single most reliable marker of generated UI — in a
sample of 104 production design systems, *none* used one value throughout, and the low-radius-card
against pill-action collision is a recognised signature of print-led systems specifically.

The two registers also carry meaning, which is what stops the contrast being arbitrary decoration:

- **Rectangles are the record** — the fixed, printed facts. A match, a table row, a ledger.
- **Rosettes are the interaction** — the thing you press, and the badge a result earns. Circular
  form-guide letters are how football has always shown a W-D-L run; this is native, not novelty.

Pill actions also give the pub flow the large, unmissable thumb targets it needs.

### Borders — hairlines, not outlines

**Structure comes from fine rules and alignment, the way a printed results table does it.** Not
from boxing everything in a heavy outline.

```css
--rule-hair:  1px solid var(--ww-chalk);  /* the default. table rows, dividers, card separation */
--rule-ink:   1px solid var(--ww-navy);   /* a rule that needs to read as deliberate */
--rule-total: 2px solid var(--ww-navy);   /* above a ledger total, and under a page title. only */
```

An earlier draft of this spec used 2px navy outlines on every card, input and button, paired with
hard offset shadows. **That has been removed deliberately** — see
[Why this isn't neobrutalism](#why-this-isnt-neobrutalism) below.

Rules to follow:

- **Cards do not have borders by default.** They are separated by space and by a hairline rule.
  A border appears only when a card is genuinely interactive and focused.
- **Inputs get a 1px navy underline**, not a full box. A boxed field is a form; an underlined field
  on paper is a team sheet. On focus the underline goes to 2px and the focus ring appears.
- Vertical rules in tables are banned outright. Columns are separated by alignment.

### Elevation — flat, with one exception

The page is flat. Depth is not how this interface communicates; **hierarchy is carried by type
size, colour field and position.**

```css
/* The only shadow in the product. Overlays exclusively. */
--shadow-overlay: 0 24px 48px -12px rgba(11, 27, 63, 0.28),
                  0 2px 8px -2px rgba(11, 27, 63, 0.16);
```

Two things about it:

- It applies to **dialogs, sheets and popovers only** — things that genuinely float above the page
  and need to say so for the interface to be usable. Never to a card, never to a button, never to
  a table row.
- It is **navy-tinted, not grey**. Tinted shadows are the same discipline as warm paper and navy
  ink: no absolute neutrals anywhere in the system.

Everything else that needs to feel raised does it with a **colour field** — a navy or yellow
surface — rather than with a shadow.

### Why this isn't neobrutalism

Worth stating plainly, because the two are easy to confuse and the difference is the whole point.

Thick black outlines, hard offset shadows and flat bright colour is **neobrutalism** — a web style
that peaked around 2021–23. It has two problems now: it reads as dated, and it has itself become a
common generated-UI look, so it would fail the brief for the exact reason we're trying to avoid.

Matchday Print references *actual print*, which is a different thing. Real printed matter — a
results table, an almanac, a match programme, a Swiss timetable — is built from **hairline rules,
tight alignment, strong typographic contrast and flat ink**. It is restrained, not chunky. That's
also where current editorial-led interface design sits, so the concept and the contemporary idiom
point the same way.

The practical difference on screen: neobrutalism boxes every element in a heavy outline and offsets
it; this system leaves elements unboxed and lets **the type do the work**, with fine rules for
structure and one big colour field per screen for impact.

### Rotation — one device, tightly fenced

Rotation is a real tool in print-led systems, and it is the only decorative flourish this design
permits. It has exactly one use:

**The `corrected` stamp.** When a finalised match is edited, the match page carries a rubber-stamp
mark — uppercase, navy on yellow, `--radius-stamp`, rotated **−4°**. Nothing else in the product
rotates. Not cards, not headings, not images.

The fence is the point. A stamp is a real object in the world of team sheets and match cards, so it
earns its angle; rotating anything else would be decoration for its own sake, and would also make
the correction notice stop standing out — which is the one job it has.

---

## Layout

- **Mobile-first, 4pt grid.** Breakpoints: `sm 640`, `md 768`, `lg 1024`, `xl 1280`.
- Content max width `1120px`; reading-only pages `720px`.
- **Sections are separated by space and by a rule**, not by colour. A full-bleed band is a feature,
  not a rhythm device: **at most one coloured band per screen**, and per the allocation budget it
  is navy far more often than yellow.
- **No sidebar navigation.** A **four-item** bottom tab bar on mobile (The Index, Matches, Squad,
  Money); a single horizontal bar on desktop. A sidebar would signal "admin tool", which is exactly
  wrong.
- Tables stay tables on mobile. Reduce columns, freeze the player-name column, keep the score.
  **Never** collapse a leaderboard into stacked cards — comparison is the entire point of a table.

---

## Imagery and icons

A real gap if left unstated, because "no photos" is not an imagery system.

**Photography: none.** There are no player photos, no avatars, no initial-circles, and no stock
imagery anywhere in the product. Nobody is going to supply 25 headshots, and placeholder avatars are
a hallmark of generated UI. **A player is their name, set well.** The one exception is a
user-uploaded match photo, if that is ever built — displayed full-bleed at `--radius-surface`, never
cropped to a circle.

**Icons: monoline, 1.5px stroke, 24px grid, navy, no fill.** One set, used consistently — Lucide is
the sensible default since it ships with shadcn. Rules:

- Icons **support** labels; they never replace them. Every tab, every action button, every filter
  carries a word.
- No multicolour icons, no filled/duotone variants, and **no emoji** as iconography.
- The icon set is small on purpose. If a concept needs an icon that isn't in the set, use a word.

**Data visualisation is the real imagery of this product.** The decorative weight a marketing site
puts into illustration goes here instead: a 128px score, a form-guide run, a ledger. If a screen
feels bare, the answer is **more data or bigger type**, never an illustration.

**Crest:** one club crest, supplied by the club, used in exactly three places — app header, install
icon, home match card. Never a watermark, never a background. **Never generate one.**

---

## Motion

Fast and mechanical. Nothing floats, nothing eases in from below.

| Use | Duration | Easing |
| --- | --- | --- |
| Hover, focus, press | 120ms | `ease-out` |
| Disclosure (ledger expand) | 180ms | `cubic-bezier(.2,.8,.2,1)` |
| Score count-up on reveal | 600ms | `ease-out`, tabular figures, once only |
| Page transition | none | — |

- The **score count-up** is the only expressive animation in the app. It fires when a player's
  match score is first revealed, never on scroll, never on re-render.
- No parallax. No scroll-triggered fades. No skeleton shimmer — use a static chalk block.
- Respect `prefers-reduced-motion: reduce`: drop the count-up to an instant value and disclosure
  to 0ms.

---

## Platform expectations

Things a 2026 web app is simply expected to do. None of these are stylistic; leaving them out is
what dates an interface far faster than any visual choice.

### Floodlight mode (dark)

Not optional, and not an inverted palette. The navy surface ramp already exists, so dark mode is a
**surface swap, not a second design**:

| | Paper mode | Floodlight mode |
| --- | --- | --- |
| Canvas | `--ww-paper` | `--ww-navy` |
| Raised surface | `--ww-paper` | `--ww-navy-700` |
| Rules | `--ww-chalk` | `--ww-navy-600` |
| Ink | `--ww-navy` | `--ww-paper` |
| Muted ink | `--ww-ink-muted` | `#9AA5BD` |

Yellow keeps its allocation budget in both, and gets *slightly* more latitude in Floodlight since it
carries text legibly on navy (11.80:1). Follow the system preference by default with a manual
override. Implement as a `data-theme` attribute swapping the semantic tokens — components must
never branch on theme themselves.

### Interaction

- **Swipe actions** where they map to a real verb: swipe a `/money` row to mark paid, swipe a match
  row to jump to its ledger. Always with a visible fallback control — swipe is an accelerator, never
  the only route.
- **Optimistic updates** on every write, with the rollback path designed, not just handled.
- **View Transitions API** for the leaderboard-row-to-detail expansion and match navigation, gated
  behind `prefers-reduced-motion`. This is the one place a transition genuinely aids comprehension,
  because it preserves the identity of the row you tapped.
- **Haptic feedback** on match-entry taps where supported. Twenty-five taps to build a team sheet is
  much better with confirmation you can feel.
- **No hover-dependent affordances.** Anything discoverable by hover must be discoverable by tap.

### Live regions and feedback

- Score changes and newly finalised matches announce through an `aria-live="polite"` region.
- Autosave state during match entry is **visible and continuous** — a persistent "Saved" indicator,
  not a toast that disappears before it's read.
- Errors are inline and adjacent to the thing that failed. No global toast for a field-level error.

### Modern CSS

- **Container queries** for `MatchCard`, `PlayerRow` and `PelletScore` — they appear at several
  widths and should respond to their container, not the viewport.
- **`text-wrap: balance`** on headings, **`pretty`** on body copy.
- Logical properties throughout.
- `color-mix()` for state variations rather than hand-picked hover hexes.
- `@supports` fallbacks for View Transitions; the app must be fully usable without them.

---

## Components

Exact specifications. Props and file layout are in
[`component-system.md`](component-system.md); the values below are the contract.

### Pellet Score — Hero
**Role:** the single score a screen is about.

Archivo Expanded 900 at **128px**, line-height **0.85**, tracking **−0.03em**, `tabular-nums`. Navy
on paper, or yellow on navy in Floodlight. An `eyebrow` label (12px/600 uppercase, +0.08em,
`--ww-ink-muted`) sits **8px** above. **No unit beside the number** — the label carries it. Counts
up over 600ms once, on first reveal only. **One per screen, ever.**

### Score Ledger
**Role:** the receipt showing exactly how a score was reached. The most important component here.

IBM Plex Mono 400 at **14px**, `tabular-nums`, row height **28px**. Label left in navy, a dotted
leader filling the gap (`border-bottom: 1px dotted var(--ww-chalk)` on a flex spacer), signed value
right. Negative values in `--ww-loss`, **always** with their sign. Zero-value rows are shown, in
`--ww-ink-muted` — "Clean sheet · 0" tells a defender the rule applied and they missed it. Total
row: IBM Plex Mono 600 at **16px**, `--rule-total` above it, 12px padding-top. Sits on `--ww-black`
with paper text when it is the focus of a screen, on paper otherwise. No border, no radius.

### Index Row
**Role:** one player in the season leaderboard.

**56px** tall with a `--rule-hair` bottom. Columns: rank 32px, name flex, played 48px, score 72px,
points-per-game 56px. Name in Archivo 500/16px; every number Archivo 500/16px `tabular-nums`,
right-aligned. **Rank 1 carries a 4px yellow bar on its leading edge — the only yellow in the
table.** Tap expands the ledger inline beneath over 180ms. No zebra, no vertical rules, no hover
background beyond a `--ww-chalk` tint.

### Match Card
**Role:** one fixture or result, anywhere it appears.

Paper, **no border, no shadow**, `--radius-surface`, 16px padding, separated from siblings by a
`--rule-hair`. Three rows: competition and date as a 12px eyebrow in `--ww-ink-muted`; "Wanderers"
and the opponent in Archivo 600/20px with **us always on the left** regardless of venue; then the
score in Archivo Expanded 800/**32px** `tabular-nums` beside a 24px form-guide circle. An unplayed
fixture puts the kick-off time where the score would go, **at the same size**, in `--ww-ink-muted`,
so a mixed list keeps one rhythm.

### Section Band
**Role:** a full-bleed page region, and the enforcement point for the colour budget.

`100vw`, no radius, no border, 48px vertical padding on mobile and 64px on desktop. Tone sets
background *and* foreground together: paper→navy ink, navy→paper ink, yellow→navy ink, black→paper
ink. **At most one non-paper band per page.** A yellow band is capped at **160px tall on mobile,
200px on desktop**.

### Page Title
**Role:** the standard head of every screen, and the default home for yellow.

A 12px eyebrow, then Archivo Expanded 800 at **56px** (32px on mobile), tracking −0.02em, with an
**8px yellow rule, 64px wide**, directly beneath. That rule is the default yellow device on every
screen — a filled yellow band is the exception, not this.

### Primary Button
`--radius-action` pill, `--ww-navy` fill, `--ww-paper` text, **no border, no shadow**. Archivo
600/16px. Padding **14px 28px**, min-height **48px** (44px absolute floor). Hover
`color-mix(in oklab, var(--ww-navy) 88%, white)`. Active `translateY(1px)`. Focus: 3px navy outline,
2px offset. A **yellow** primary with navy text is permitted as the single page-level action on a
screen that has no yellow elsewhere.

### Secondary Button
Identical geometry. Paper fill, navy text, **1px** navy outline. Destructive uses `--ww-loss` fill
with paper text.

### Text Input
**Not a box.** Paper background, **1px navy bottom border only**, `--radius-surface`, 48px tall,
text at **16px** — never smaller, or iOS zooms on focus. Label is a 12px eyebrow above the field,
always present, never floating and never placeholder-only. Focus takes the bottom border to 2px and
adds a 3px navy outline at 2px offset. Error turns the bottom border `--ww-loss` with the message
directly beneath at 14px.

### Status Chip
`--radius-stamp` (2px), 12px/600 uppercase, +0.08em, padding 4px 8px. `draft`, `awaiting votes` and
`final` are navy on `--ww-chalk`. **`corrected` is the stamp**: navy on yellow, 1px navy rule,
rotated **−4°**. Status is a record, so it stays rectangular — it is not an action.

### Form Guide Letter
`--radius-action` circle, **24px** diameter, Archivo 700/12px, paper text on `--ww-win` /
`--ww-draw` / `--ww-loss`. **Always the letter W, D or L** — colour is never the only signal. 4px
gap between letters in a run.

### Position Chip
`--radius-action` pill, 20px tall, padding 0 8px, 11px/600 uppercase, navy on chalk. `GK`, `DF`,
`MD`, `FW` only.

### Bottom Tab Bar
Fixed, **64px** plus safe-area inset, paper, `--rule-hair` on top. Four items — The Index, Matches,
Squad, Money. Each is a 24px monoline icon above an 11px/600 label; **labels are always visible**,
never icon-only. Active state is navy ink plus a **3px yellow bar** across the top of the item;
inactive is `--ww-ink-muted`.

### Empty State
**Left-aligned, never centred**, and never inside a dashed box. Archivo 600/24px title, `lead`
20px body in `--ww-ink-muted`, optional primary button. Max 48ch. No illustration, no icon. The
body says what happens next, with a date where we know one.

### Table
`--rule-hair` between rows, **no vertical rules ever**, no zebra above 10 rows, sticky header,
`tabular-nums` throughout, player-name column frozen on mobile.

---

## Accessibility

- AA minimum everywhere; the core navy/paper pairing is AAA and should be preserved.
- **Focus is visible and loud:** `outline: 3px solid var(--ww-yellow); outline-offset: 2px` on
  navy surfaces, and `3px solid var(--ww-navy)` on paper. Never `outline: none`.
- Colour is never the only signal. Result colours are always accompanied by the letter W/D/L.
  Paid/unpaid is a word, not a green or red dot.
- Every score has an accessible label reading the full breakdown, not just the number.
- Tables use real `<th scope>`; the ledger is a real `<dl>` or `<table>`, never a stack of divs.
- Test at 200% zoom and at 320px width. Both are realistic: this is a phone app used by people who
  have had a couple of pints.

---

## Do

The prescriptive half. The prohibitions below are much easier to follow when it's clear what the
correct move actually is.

- **Lead every screen with its biggest number.** Find the one figure the screen is about and set it
  at `score-hero` or `score`. If no number qualifies, the screen probably shouldn't exist.
- **Make every total expandable into its ledger.** A score the user can't interrogate is the
  spreadsheet problem we're solving.
- **Spend yellow once per screen**, on the single most important element, and default to the 8px
  rule under the page title rather than a filled band.
- **Separate things with space and a hairline rule**, and let type size carry hierarchy. Reach for
  a border only when an element is interactive and focused.
- **Set every figure in a column with `tabular-nums`**, without exception.
- **Pair each result colour with its letter** — W, D or L — so colour is never the only signal.
- **Use the two radius registers deliberately:** rectangles for the record, pills for actions.
- **Write real copy with real numbers and real names.** "Shane's had 11 points off one game."
- **Design the empty, loading, error and mid-entry states at the same time as the happy path**, and
  say what happens next with a date where we know one.
- **Build and test at 390px first**, one-handed, with a long player name and a three-digit score.

---

## Do not use

Reject any generated UI containing:

1. Indigo/violet primaries, or **any** gradient used as a brand device.
2. Purple-to-pink, blue-to-cyan, or "aurora" backgrounds. Blobs of any kind.
3. Glassmorphism, `backdrop-filter: blur`, translucent panels.
4. Soft grey drop shadows (`0 Npx Npx rgba(0,0,0,0.0x)`).
5. **Any radius between 3px and 998px** — `rounded-md`, `rounded-lg`, `rounded-xl`. A mid-range
   radius applied uniformly is the strongest single signal of generated UI. See the two registers.
6. Inter, or `font-family: system-ui` as the display face.
7. Emoji as icons or status indicators. (Emoji in user-authored notes is fine.)
8. A centred hero with a big headline, a subheading and two buttons.
9. A row of four KPI cards with percentage deltas and tiny sparklines.
10. Three-column icon/heading/two-lines-of-grey-text feature grids.
11. The words "Dashboard", "Overview", "Insights", "Analytics" as page names. Use "The Index",
    "Matches", "Squad", "Money".
12. Placeholder copy of any kind — "Lorem ipsum", "Welcome to your app", "No data available".
13. Charts with default library styling. Any chart uses the tokens above and drops gridlines,
    legends and axis chrome to the minimum that keeps it readable.

---

## Review checklist

Before any UI is considered done:

- [ ] Screenshot at 320px, 390px and 1280px with **real** data — real names, a 3-digit score, a
      player with a 22-character name, a 12-row ledger.
- [ ] Empty, loading, error and "match not finalised yet" states all exist.
- [ ] Numbers are tabular and do not shift when values change.
- [ ] Nothing on screen violates the Do not use list.
- [ ] The primary number on the page is the largest thing on the page.
- [ ] Every total can be expanded to its breakdown.
- [ ] Keyboard-only pass: focus is visible on every interactive element, in a sane order.
- [ ] The whole write flow is completable one-handed on a 390px screen.

### The uniformity test

Run this last. It catches the failure the other checks miss, because it looks for *flatness* rather
than for wrong values — and flatness, not any particular colour or radius, is what actually makes an
interface look machine-made.

Ask of the finished screen:

- [ ] **Radius:** are both registers present, and is nothing sitting between them?
- [ ] **Type:** is there a genuine display/text separation, or has everything drifted to one family
      at three near-identical sizes?
- [ ] **Scale:** is the largest thing at least 4× the smallest? (Ours is 128 against 12.)
- [ ] **Leading:** does line-height *change direction* with size — tightening below 1.0 at display
      while staying at 1.55 for body — rather than sitting at a constant 1.2?
- [ ] **Neutrals:** is every grey tinted (warm chalk, navy-cast muted ink), with no stock
      `#E5E5E5`, no Tailwind `gray-*`, no pure `#FFFFFF` or `#000000` anywhere?
- [ ] **Depth:** is separation carried by hairline rules, space and colour fields, with no shadow
      anywhere outside an overlay?

A screen that fails several of these is bland even if every individual token is correct.

---

## Adjacent references

For anyone who needs to widen the target without loosening the spec, these production systems solve
related problems and are worth looking at. They are **reference, not licence** — nothing here
overrides the rules above.

| System | Why it's relevant |
| --- | --- |
| **Drive Capital** | The closest structural analogue: four colours, strictly shadowless, `0px` cards against `60px` buttons. Proof the two-register radius reads as designed rather than inconsistent. |
| **Flying Papers** | Riso-print logic — flat saturated fields, 6px cards colliding with 100px pills, no filled CTA at all. The reference for treating colour as printed ink. |
| **Cards Against Humanity** | Chromatic colour used as **outline only**, section breaks by polarity inversion. Relevant to how our yellow and navy bands alternate. |
| **Karl** | A single saturated yellow as the entire canvas, display type at 0.72 leading. The clearest example of "the colour *is* the surface". |
| **Agence Foudre** | Sets body copy in a saturated colour rather than grey. Worth knowing about as the road not taken — our ink stays navy for density. |

---

## Quick start

Copy this whole block into `app/globals.css`. It is the complete token set; nothing else in the
codebase should declare a hex value, a font size or a radius.

```css
@import "tailwindcss";

:root {
  /* Colour */
  --ww-yellow: #FFD400;      --ww-yellow-deep: #E8BE00;
  --ww-navy: #0B1B3F;        --ww-navy-700: #132650;   --ww-navy-600: #1B3163;
  --ww-paper: #F7F4ED;       --ww-black: #111111;
  --ww-chalk: #E8E2D5;       --ww-ink-muted: #4A5468;
  --ww-win: #1B7F4B;         --ww-draw: #5F6875;       --ww-loss: #C0342B;

  /* Semantic surfaces — these are what components consume */
  --surface-canvas: var(--ww-paper);
  --surface-raised: #FFFFFF;
  --surface-recessed: var(--ww-chalk);
  --surface-feature: var(--ww-navy);
  --surface-ledger: var(--ww-black);
  --ink: var(--ww-navy);
  --ink-muted: var(--ww-ink-muted);

  /* Type families */
  --font-display: "Archivo Expanded", "Archivo", system-ui, sans-serif;
  --font-text: "Archivo", system-ui, sans-serif;
  --font-ledger: "IBM Plex Mono", ui-monospace, monospace;

  /* Type scale — size / line-height / tracking */
  --text-score-hero: 128px; --leading-score-hero: 0.85; --tracking-score-hero: -0.03em;
  --text-score: 88px;       --leading-score: 0.85;      --tracking-score: -0.03em;
  --text-display: 56px;     --leading-display: 1.0;     --tracking-display: -0.02em;
  --text-h2: 32px;          --leading-h2: 1.15;         --tracking-h2: -0.02em;
  --text-h3: 24px;          --leading-h3: 1.25;         --tracking-h3: 0;
  --text-lead: 20px;        --leading-lead: 1.45;       --tracking-lead: 0;
  --text-body: 16px;        --leading-body: 1.55;       --tracking-body: 0;
  --text-small: 14px;       --leading-small: 1.45;      --tracking-small: 0;
  --text-eyebrow: 12px;     --leading-eyebrow: 1.2;     --tracking-eyebrow: 0.08em;

  /* Space */
  --space-2: 2px;   --space-4: 4px;   --space-8: 8px;   --space-12: 12px;
  --space-16: 16px; --space-24: 24px; --space-32: 32px; --space-48: 48px;
  --space-64: 64px; --space-96: 96px;

  /* Layout */
  --page-max-width: 1120px;
  --reading-max-width: 720px;
  --section-gap: 64px;          /* 48px on mobile */
  --card-padding: 24px;         /* 16px on mobile */
  --row-padding-block: 12px;
  --tabbar-height: 64px;

  /* Radius — two registers, nothing between */
  --radius-surface: 0px;
  --radius-stamp: 2px;
  --radius-action: 999px;

  /* Rules */
  --rule-hair: 1px solid var(--ww-chalk);
  --rule-ink: 1px solid var(--ww-navy);
  --rule-total: 2px solid var(--ww-navy);

  /* The only shadow in the product */
  --shadow-overlay: 0 24px 48px -12px rgb(11 27 63 / 0.28),
                    0 2px 8px -2px rgb(11 27 63 / 0.16);

  /* Motion */
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-disclosure: cubic-bezier(0.2, 0.8, 0.2, 1);
  --duration-fast: 120ms;
  --duration-disclosure: 180ms;
}

[data-theme="dark"] {
  --surface-canvas: var(--ww-navy);
  --surface-raised: var(--ww-navy-700);
  --surface-recessed: var(--ww-navy-600);
  --surface-feature: var(--ww-navy-700);
  --ink: var(--ww-paper);
  --ink-muted: #9AA5BD;
}

@theme inline {
  --color-yellow: var(--ww-yellow);
  --color-navy: var(--ww-navy);
  --color-paper: var(--ww-paper);
  --color-chalk: var(--ww-chalk);
  --color-ink: var(--ink);
  --color-ink-muted: var(--ink-muted);
  --color-win: var(--ww-win);
  --color-draw: var(--ww-draw);
  --color-loss: var(--ww-loss);

  --font-display: var(--font-display);
  --font-text: var(--font-text);
  --font-ledger: var(--font-ledger);

  --radius-surface: var(--radius-surface);
  --radius-stamp: var(--radius-stamp);
  --radius-action: var(--radius-action);
}

body {
  background: var(--surface-canvas);
  color: var(--ink);
  font-family: var(--font-text);
  font-size: var(--text-body);
  line-height: var(--leading-body);
}

/* Non-negotiable: every figure in a column aligns */
table, .ledger, [data-numeric] { font-variant-numeric: tabular-nums; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 1ms !important; transition-duration: 1ms !important; }
}
```

---

## Agent prompt guide

If you are generating a single component and don't want to read the whole file, this is the
minimum viable context.

**Quick reference**

- Canvas `#F7F4ED` (warm paper, never `#FFFFFF`) · Ink `#0B1B3F` (navy, never `#000000`)
- Brand `#FFD400` — **surfaces and marks only, never text on light, ≤5% of any screen**
- Muted `#4A5468` · Rules `#E8E2D5` · Ledger surface `#111111`
- Results: win `#1B7F4B`, draw `#5F6875`, loss `#C0342B` — always with the letter W/D/L
- Type: Archivo Expanded 700–900 display (≥32px only), Archivo 400–600 text, IBM Plex Mono ledger.
  **Never Inter.** `tabular-nums` on every figure in a column
- Radius: `0px` on everything except buttons and circular chips, which are `999px`. **Nothing in
  between**
- No shadows except on overlays. No gradients, no blur, no emoji, no avatars

**Worked examples**

1. **Player hero score** — Archivo Expanded 900 at 128px, line-height 0.85, tracking −0.03em,
   `tabular-nums`, `#0B1B3F` on `#F7F4ED`. A 12px/600 uppercase `#4A5468` label with +0.08em
   tracking sits 8px above. No "pts" beside the number. One per screen.
2. **Score ledger row** — IBM Plex Mono 400 at 14px, 28px tall. Label left in `#0B1B3F`, a
   `1px dotted #E8E2D5` leader filling the gap, signed value right. Negatives in `#C0342B` with
   their sign. Total row is IBM Plex Mono 600 at 16px with a `2px solid #0B1B3F` rule above.
3. **Primary button** — pill (`border-radius: 999px`), `#0B1B3F` fill, `#F7F4ED` text, Archivo
   600/16px, padding 14px 28px, min-height 48px. No border, no shadow. Active `translateY(1px)`.
   Focus `outline: 3px solid #0B1B3F; outline-offset: 2px`.
4. **Page title** — 12px uppercase eyebrow, then Archivo Expanded 800 at 56px (32px on mobile),
   tracking −0.02em, with an 8px tall × 64px wide `#FFD400` rule directly beneath. This rule is the
   screen's yellow allowance; don't add more.
5. **Leaderboard row** — 56px tall, `1px solid #E8E2D5` bottom rule. Rank 32px, name flex, then
   played / score / points-per-game right-aligned at 48 / 72 / 56px, all Archivo 500/16px with
   `tabular-nums`. Rank 1 gets a 4px `#FFD400` bar on its leading edge. No zebra, no vertical rules.
6. **Match card** — paper, no border, no shadow, 16px padding, `1px solid #E8E2D5` between
   siblings. Competition and date as a 12px `#4A5468` eyebrow; "Wanderers" and opponent in Archivo
   600/20px with us always left; score in Archivo Expanded 800/32px beside a 24px result circle
   containing W, D or L.
