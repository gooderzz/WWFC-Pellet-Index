# Component system

How the design language in [`DESIGN.md`](DESIGN.md) becomes code that stays consistent across every
page without anyone re-inventing a card.

The governing idea: **a page should contain almost no styling decisions.** If building a new screen
requires picking a colour, a font size or a padding value, the system has failed and the screen will
drift. Pages compose domain components; domain components compose primitives; primitives consume
tokens. Styling decisions live at exactly one level, and it is not the page.

---

## The four layers

```
Layer 4  Pages            app/(routes)/…            composition only, zero styling
             ↑
Layer 3  Domain           components/pellet/…       PelletScore, ScoreLedger, MatchCard…
             ↑                                      knows about football + the Pellet Index
Layer 2  Primitives       components/ui/…           shadcn/ui, restyled once to our tokens
             ↑                                      knows nothing about football
Layer 1  Tokens           app/globals.css           CSS custom properties + Tailwind theme
```

**The dependency rule is one-directional.** A primitive may never import a domain component. A page
may never import from `components/ui/` directly for anything that has a domain equivalent — if
you're putting a raw `<Card>` around a match, you should be using `<MatchCard>`.

### Layer 1 — Tokens

Every value from [`DESIGN.md`](DESIGN.md) is declared once as a CSS custom property in
`app/globals.css`, then exposed to Tailwind through `@theme` (Tailwind v4).

```css
@import "tailwindcss";

:root {
  --ww-yellow: #FFD400;  --ww-yellow-deep: #E8BE00;
  --ww-navy: #0B1B3F;    --ww-navy-700: #132650;  --ww-navy-600: #1B3163;
  --ww-paper: #F7F4ED;   --ww-black: #111111;
  --ww-chalk: #E8E2D5;   --ww-ink-muted: #4A5468;
  --ww-win: #1B7F4B;     --ww-draw: #5F6875;      --ww-loss: #C0342B;

  --radius-surface: 0px; --radius-stamp: 2px; --radius-action: 999px;
  --rule-hair: 1px solid var(--ww-chalk);
  --rule-total: 2px solid var(--ww-navy);
  --shadow-overlay: 0 24px 48px -12px rgba(11,27,63,.28), 0 2px 8px -2px rgba(11,27,63,.16);
}

@theme inline {
  --color-yellow: var(--ww-yellow);
  --color-navy: var(--ww-navy);
  --color-paper: var(--ww-paper);
  --color-ink-muted: var(--ww-ink-muted);
  --color-win: var(--ww-win);
  --color-draw: var(--ww-draw);
  --color-loss: var(--ww-loss);
  --font-display: "Archivo Expanded", "Archivo", system-ui, sans-serif;
  --font-text: "Archivo", system-ui, sans-serif;
  --font-ledger: "IBM Plex Mono", ui-monospace, monospace;
}
```

**Rules**

- No hex value appears anywhere outside this file. Ever.
- No arbitrary Tailwind values (`p-[13px]`, `text-[#FFD400]`). The spacing scale is the scale.
- Fonts load through `next/font` with `display: swap` and are assigned to the CSS variables above,
  so no component references a font family by name.
- A theme change — including the club overruling our yellow — is an edit to this file only.

### Layer 2 — Primitives (shadcn/ui)

Use shadcn/ui, restyled **once**, at install time. shadcn copies component source into the repo
rather than installing a dependency, which is exactly what we want: we own the files and can bend
them to Matchday Print instead of fighting a library's defaults.

The restyle is not optional and not cosmetic. Default shadcn is the house style of generated apps —
`rounded-md`, soft shadows, muted greys, Inter. Left alone it will produce precisely the output this
project has said it will reject.

| Primitive | Required deviation from shadcn default |
| --- | --- |
| `Button` | **`--radius-action` (pill)**, **solid fill, no border, no shadow**. Primary = navy fill / paper text. Secondary = 1px navy outline on paper. Active = `translateY(1px)` + `color-mix` darken. Min height 44px. |
| `Input`, `Select`, `Textarea` | **1px navy underline, not a box.** `--radius-surface`, 48px tall on mobile, focus takes the underline to 2px plus a 3px outline offset 2px |
| `Card` | `--radius-surface` (0), **no border and no shadow by default** — separated by space and a `--rule-hair`. Border only when interactive and focused |
| `Table` | Chalk hairline row borders, no vertical rules, sticky header, `tabular-nums` on the whole table |
| `Dialog`, `Sheet` | `--radius-surface` (0), `--shadow-overlay` (the only shadow in the product), **no backdrop blur** — solid navy scrim at 85% |
| `Badge` | `--radius-stamp` (2px), uppercase, 12px/600, `+0.08em` tracking |
| `Tabs` | Underline style only: 3px navy bar under the active tab. No pill tabs, no filled backgrounds. |
| `Skeleton` | Static `--ww-chalk` block. **Shimmer animation removed.** |
| `Tooltip`, `Popover` | Navy field, paper text, 0 radius, no arrow |

Primitives we deliberately do **not** install: `Avatar` (no player photos in v1), `Carousel`,
`Accordion` (the ledger has its own disclosure), `Progress`, `Chart` (see below).

### Layer 3 — Domain components

This is where the app's identity actually lives, and where most engineering effort should go. Each
one owns its own layout, spacing and states so that a page never has to.

```
components/pellet/
  PelletScore.tsx        ScoreLedger.tsx      ScoreDelta.tsx
  MatchCard.tsx          MatchHeader.tsx      TeamSheet.tsx        MatchEventList.tsx
  IndexTable.tsx         PlayerRow.tsx        PlayerIdentity.tsx   PositionChip.tsx
  ResultChip.tsx         FormGuide.tsx        StatusChip.tsx
  MoneyRow.tsx           FeeSummary.tsx
  SectionBand.tsx        PageTitle.tsx        StatPair.tsx
  EmptyState.tsx         ErrorState.tsx       LoadingState.tsx
```

#### The five that matter most

**`PelletScore`** — the app's signature element. Renders a score at one of four sizes with tabular
figures and an optional count-up on first reveal.

```tsx
<PelletScore
  value={11}
  size="hero" | "large" | "inline" | "cell"
  tone="paper" | "navy" | "yellow"
  countUp={false}          // true only on first reveal of a match score
  label="Pellet points"    // rendered as eyebrow above the number
/>
```

Rules: `hero` is 128px/display-900; only one per screen. Always `tabular-nums`. Never renders a
unit ("pts") next to the number — the eyebrow label carries that.

**`ScoreLedger`** — the receipt. The single most important component in the product, because it is
the reason the app exists rather than a spreadsheet.

```tsx
<ScoreLedger
  lines={[{ ruleKey: 'goal_fw', label: 'Forward goal', quantity: 2, points: 8 }, …]}
  total={11}
  variant="full" | "compact"
/>
```

Renders each `PelletScore.breakdown` row in `--font-ledger` at 14px, label left, dotted leader,
signed points right, with `--rule-total` (2px navy) above the total row. Negative values are
`--ww-loss` and always show their sign. Zero-point lines are shown, not hidden — "Clean sheet · 0"
is informative, because it tells a defender the rule applied and they missed it.

**`MatchCard`** — one fixture anywhere it appears. Owns result colour, home/away, competition, and
recording status.

```tsx
<MatchCard match={match} variant="list" | "featured" | "compact" showStatus />
```

We are always on the left regardless of home or away, because the reader is always a Wanderer.
Venue is a separate line. An unplayed fixture shows the date where the score would be, in the same
type size, so a list of fixtures and results shares one rhythm.

**`IndexTable`** — the season leaderboard. Sortable, sticky header, sticky player column on mobile,
`tabular-nums` throughout. Row click expands into the player's per-match ledger inline rather than
navigating away. Never virtualises below 200 rows and never paginates a squad.

**`SectionBand`** — how pages get rhythm without decoration.

```tsx
<SectionBand tone="paper" | "yellow" | "navy" | "black" bleed>
```

Full-bleed horizontal band that applies the correct text colour for its tone automatically, so no
page ever chooses a background or a foreground.

**It enforces the colour budget in code, which is the only way that budget survives contact with a
deadline.** `SectionBand` throws in development if more than one non-paper band renders in a single
page tree, and if a `yellow` band exceeds its height cap. A rule in a document gets forgotten; a
rule that fails the build does not. See the allocation table in [`DESIGN.md`](DESIGN.md).

#### States are components, not afterthoughts

`EmptyState`, `ErrorState` and `LoadingState` are shared and take real copy. Every list and table
must pass all three. This is how we guarantee the states the review checklist demands actually
exist, instead of relying on each engineer to remember.

```tsx
<EmptyState
  title="No matches yet"
  body="The season starts in September. Fixtures appear here once an admin adds them."
  action={isAdmin ? { label: 'Add a fixture', href: '/matches/new' } : undefined}
/>
```

### Layer 4 — Pages

Pages fetch data and compose Layer 3. A page file should contain **no colour, no font size, no
padding, and no border**. If a reviewer sees `className="bg-white rounded-lg shadow p-6"` in a page,
that is a defect regardless of how it looks.

```tsx
export default async function IndexPage() {
  const rows = await getSeasonIndex()
  return (
    <>
      <SectionBand tone="yellow" bleed>
        <PageTitle eyebrow="2026/27 season" title="The Index" />
      </SectionBand>
      <SectionBand tone="paper">
        {rows.length ? <IndexTable rows={rows} /> : <EmptyState … />}
      </SectionBand>
    </>
  )
}
```

---

## Charts

Do not use a charting library's default styling. There are only three charts in the roadmap (the
season race, form over time, on-pitch goals for/against) and all three use:

- `--ww-navy` for the primary series, `--ww-yellow` for the highlighted player, `--ww-chalk` for
  everything else.
- No gridlines beyond a single baseline. No legend if the series can be labelled directly on the
  line. No axis chrome beyond first/last tick.
- Tabular figures on every label.

If a chart arrives with a purple default palette and a boxed legend, it has not been styled.

---

## Keeping it consistent — the governance bit

Consistency is not maintained by good intentions. Four concrete mechanisms:

1. **Storybook, with the real states.** Every Layer 2 and Layer 3 component ships with stories for
   default, empty, loading, error, long-content and mobile. A component without stories is not done.
   This is also what lets a design reviewer check the system without running the app.

2. **Lint the rules that matter.** These are cheap and catch the actual drift:
   - `tailwindcss/no-arbitrary-value` — bans `p-[13px]`, `text-[#FFD400]`.
   - A custom ESLint rule banning raw hex in `.tsx`.
   - `no-restricted-imports` preventing `app/**` from importing `components/ui/{card,table,badge}`
     directly, forcing use of the domain equivalents.
   - A grep check in CI for `shadow-`, `blur`, `Inter`, and the banned mid-range radii
     (`rounded-md|rounded-lg|rounded-xl|rounded-2xl|rounded-3xl`), failing the build on a hit.
     Note `rounded-full` is **allowed** — it is `--radius-action` — so don't ban it wholesale.

3. **A written path for new components.** Before adding one, in order: use an existing domain
   component; extend one with a `variant` prop; compose two; only then create a new one — and if you
   do, it goes in Layer 3 with stories, not inline in a page. New Layer 3 components need a one-line
   entry in this file, which keeps the inventory honest.

4. **`DESIGN.md` is loaded into agent context.** Reference it from `AGENTS.md` so any agent
   generating UI has the token values and the Do-not-use list. Then review output against the
   checklist at the end of it — a written target makes review objective instead of a taste argument.

---

## Build order

Ordered so the highest-risk, highest-identity work is proven first rather than last:

1. Tokens, fonts, and `SectionBand` — proves the palette and the band rhythm on a real screen.
2. `PelletScore` + `ScoreLedger` — the product's reason to exist. Build these before any page.
3. Restyled shadcn primitives.
4. `IndexTable`, `MatchCard`, `ResultChip`, `FormGuide`, `StatusChip`.
5. State components, then the write-path forms.

Steps 1 and 2 are the point at which someone should look at a screen and say whether the direction
is right. Do not build twelve pages before that conversation.
