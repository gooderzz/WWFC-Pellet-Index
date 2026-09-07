# UX, roles and flows

Screen inventory and interaction design for the Pellet Index. Assumes the settled decisions in
[`../01-domain/domain-model.md`](../01-domain/domain-model.md) and
[`../00-product/open-questions.md`](../00-product/open-questions.md) — in particular the two-tier
passphrase auth (Q16/Q24), the verbal pub vote (Q5), manual fixture entry (Q13), and match fees
(Q10).

---

## 1. Who actually uses this

There are two auth tiers, but three behavioural modes. Designing for the tiers alone would miss the
one that matters most.

| Mode | Who | Where and when | What they need |
| --- | --- | --- | --- |
| **The Reader** | The whole squad, plus anyone with the link | Sunday night on the sofa, Monday at work, in the group chat | Their own score and *why*. Where they sit. Ammunition for banter. Zero friction — no login. |
| **The Recorder** | Tom, Shane, Will (Admin passphrase) | **In the pub, 20 minutes after full time, one-handed, on bad signal, mildly drunk** | To get a whole match in fast without losing it. This is the hardest problem in the app. |
| **The Fixer** | Same people, later | At a laptop, midweek | To correct a mistake, add a fixture, chase money, and see what's unfinished. |

The Recorder is the design centre of gravity. If recording a match is slow or lossy, no data exists
and none of the Reader screens have anything to show. Everything below is ordered accordingly.

**Auth is not a persona.** Admin is a grant, not a role hierarchy — the same person is a Reader most
of the week and a Recorder for twenty minutes on a Sunday. The interface should be one app that
grows extra affordances when unlocked, **not** a public site plus a separate admin panel.

## 2. Navigation

Four destinations. A five-item tab bar is already too many for a product this focused.

| Tab | Route | What it is |
| --- | --- | --- |
| **The Index** | `/` | The season leaderboard. The default screen and the reason people open the app. |
| **Matches** | `/matches` | Fixtures and results, newest first. |
| **Squad** | `/squad` | Players, season stats, career view. |
| **Money** | `/money` | Match fees owed and paid. |

Mobile: bottom tab bar, 44px minimum targets, labels always visible (icon-only tabs are a
guessing game). Desktop: single horizontal bar, no sidebar.

**Admin affordances appear inline** on the object they act on — an "Add fixture" button on
`/matches`, an "Edit" on a match page — never as a separate `/admin` section. There is one exception:
`/matches` gains an **Unfinished** filter when unlocked, because "what still needs doing" is a real
recurring job.

### The passphrase gate

Deliberately unglamorous, because it is not a security boundary — it is a doorbell.

- **Viewer passphrase** (if the club uses one at all — they're relaxed about the app being fully
  public): a single full-screen field on first visit, remembered indefinitely in a cookie. One
  input, one button, no branding ceremony, no "Sign in to your account" framing.
- **Admin passphrase**: never a page. It is a sheet that slides up when someone taps a write action
  while locked, unlocking in place and **completing the action they were trying to take**. Making
  someone navigate to a login page, authenticate, then find their way back to what they were doing
  is the single most common way this pattern is got wrong.
- A small persistent **"Admin" chip** in the header when unlocked, tappable to lock again — because
  the passphrase is shared and someone will hand their phone round.
- Copy is honest about what this is: *"Admins can add matches and edit scores. Ask Tom or Shane for
  the passphrase."* Not *"Enter your credentials"*.

## 3. Screen inventory

Ordered by value, which is roughly the order they should be built.

### `/` — The Index

The season leaderboard, public, the app's front door.

- **Yellow band** at the top: season label as eyebrow, "The Index" as the page title, and the three
  facts that frame the table — matches played, players used, leader's score.
- **The table**: rank, player, played, Pellet score, points per game. Sortable. Sticky header.
  Sticky player column on mobile. `tabular-nums` so ranks don't jitter.
- **Row expands in place** into that player's recent-match ledger. Never navigate away from a
  leaderboard to answer "why".
- **Movement is shown** — up/down arrows against last week. Cheap to compute, and it's the thing
  that makes a table feel alive rather than static.
- Empty state before the first match is recorded: the fixture list instead, with the season's start
  date. Not a shrug.

### `/matches/[id]` — Match page

The record of a game, and the highest-density screen in the app.

- **Header band** in the result colour: opponent, score, competition, date, venue, home/away. We are
  always on the left. A `corrected` match carries a navy-on-yellow chip stating it was edited.
- **The 3/2/1** immediately below the score — three players, the bonus is the social payload of the
  match and should not be scrolled to.
- **Team sheet** as a typed list, grouped **Started → Came on → Unused**, each with position
  chip, their Pellet score for the match, and a disclosure into their `ScoreLedger`.
- **Events** in `sequence` order — no minutes anywhere, per Q9. Rendered as an ordered list, not a
  timeline with a vertical rule and dots, which implies a precision we do not have.
- Opposition goals appear as anonymous entries. That is correct and shouldn't be apologised for.
- **✅ Resolved (CPO review, 7 Sep 2026) — where a no-show shows up.** A `no_show` is **not** a
  fourth team-sheet group — it wasn't part of the match, unlike an unused sub who at least turned
  up. It's a single metadata line beneath the team sheet, in `--ww-ink-muted`: *"No show — Danny
  Fletcher −5"*, with the `−5` in `--ww-loss`, consistent with `ScoreLedger`'s treatment of
  negatives elsewhere. No badge, no icon — the number is loud enough. A player who told the
  manager they couldn't make it, at any point, doesn't appear on the match page at all; that's
  the whole point of not giving it an `appearances` row.

### `/players/[id]` — Player page

- **Hero band**: name, position, and their season Pellet score at `score-hero` (128px). One number,
  unmissable.
- Season splits: appearances, starts, goals, assists, clean sheets, bonus points, points per game.
  `StatPair` components, not four KPI cards with percentage deltas.
- **Match-by-match table**, each row expandable into its ledger.
- Career view across seasons once the legacy import lands, clearly marking imported seasons as
  archive rows so nobody mistakes a 2023/24 total for something the engine computed.

### `/matches` — Fixtures and results

Reverse-chronological list of `MatchCard`s, season-grouped, with the next fixture pinned at the top.
Unplayed fixtures show the date where a score would be, at the same size, so the list keeps one
rhythm. Admin sees an **Unfinished** filter surfacing anything in `draft` or `awaiting votes`.

### `/squad` — Squad

Player list with season score and appearances. Injured and former players filtered out by default,
recoverable by a toggle. Admin can add a player and edit identities — including merging a
`PlayerAlias`, which matters during the legacy import.

### `/money` — Match fees

A ledger, not a payments product. £12 for 60+ minutes, £6 for less, derived automatically from
`played60` so nobody does arithmetic.

- Reader sees the full table — who owes what — because social pressure is the actual collection
  mechanism and hiding it would defeat the point.
- Admin gets a single tap per row to mark paid.
- Totals at the top: owed, collected, outstanding.
- Tone stays factual. "Three unpaid" is fine. A red "OVERDUE" badge is not; these are mates.

## 4. The flow that matters: recording a match

The Recorder is in a pub. One hand holds a phone, the other a pint. Signal is poor. They want to be
done in under five minutes and back in the conversation.

**Design constraints, all non-negotiable:**

- **Every step autosaves as `draft` immediately.** Nothing is lost by backgrounding the app, losing
  signal, or the battery dying. Optimistic local writes, sync when possible.
- **The flow is resumable and order-independent.** Come back tomorrow, finish it. Do the vote before
  the events if that's what's fresh in memory.
- **No modals for data entry.** Modals plus a soft keyboard on a 390px screen is a losing fight.
- **Never a free-text field where a tap will do.** The squad is ~25 people; that's a list, not a
  search box.
- **A visible incomplete state**, so nobody thinks they've finished when they haven't.

### The steps

**1 · The result.** Opponent (from existing fixtures, or a quick-add), and the two scores via big
tap-up/tap-down numerals — not a number input that summons a keyboard. Competition and venue
pre-filled from the fixture. **Under 15 seconds.**

**2 · Who played.** The squad as a tap-to-cycle grid: *out → started → sub → unused*. One tap moves
a player forward through the states. Twenty-five taps, no keyboard, no dropdowns. Position defaults
from `Player.defaultPosition` and is corrected by tapping the position chip.

**✅ Resolved (CPO review, 7 Sep 2026) — a fifth state for no-show is deliberately not on the
grid.** The tap-cycle stays exactly four states. A silent no-show costs a real person five points
and happens maybe twice a season; it shouldn't be reachable by one extra tap on a crowded grid
where a mis-tap is easy. Instead, a **"Mark a no-show"** action sits below the grid, opens a
same-screen confirmation naming the player and the −5 penalty, and only then creates the
`no_show` row. A player who told the manager they couldn't make it, at any time, is simply left
`out` — no row, no action, nothing to record. "Drop out" is not a phrase used anywhere in the
product; the label is **"No show"**, with the explanatory line *"Didn't play, didn't tell
anyone"* wherever it needs one.

**+ Add a player.** A guest turns up unannounced more often than a spreadsheet-driven flow can
tolerate — legacy names like `Taras GK`, `Tom FB` and `Hugo Boss` prove it already happens. A
**"+ Add a player"** action at the foot of the grid (never a search box at the top — the tap grid
stays primary) creates a `players` row (`status = guest`) with just a name and optional position,
selectable immediately in the same step. Duplicate guests get cleaned up later on `/squad` via
`player_aliases`, same as any other identity merge — never auto-merged.

**3 · Sixty minutes?** A single toggle per player who played, defaulting sensibly — starters on,
subs off. This drives both the clean-sheet gate and the £12/£6 fee, so it earns its own step rather
than hiding inside step 2.

**4 · What happened.** Add events by picking a type then a player. Goals, assists, cards, own
goals, penalties, opposition goals, **and substitutions** — event types, not a separate step,
prefilled from step 2 (players marked `sub` are the "on" candidates, players currently on are
the "off" candidates). **No minutes** — events land in the order they're entered. Assists are
attached to a goal and capped at one, enforced in the UI (Q17). Keeper saves are a single number
on the appearance (Q18).

**✅ Resolved (CPO review, 7 Sep 2026) — insert-anywhere replaces drag as the primary way to fix
event order.** Drag-to-reorder on a 390px screen, one-handed, after a couple of pints, is the
weakest interaction in this flow. Every row gets an overflow action offering **Insert above /
Insert below / Move up / Move down / Delete**; `sequence` renumbers densely on the server. Drag
stays available as a cheap accelerator, never the only way to fix a forgotten event.

**Helper copy right on this step, because it removes most of the anxiety that causes fiddly
reordering in the first place:** *"Only the order of opposition goals and substitutions changes
anyone's points."* Goals for, assists, cards and penalties have no ordering consequence for any
scoring rule — say so, so nobody agonises over the order two unrelated events were tapped in.

**5 · The 3/2/1.** Three taps against the players who actually played. Only they are selectable
(Q5). Self-votes are permitted and unremarked.

**6 · Finalise.** A summary showing computed Pellet scores *before* committing, so an obvious error
gets caught while everyone's still in the room. **A reconcile check runs first** (warns, doesn't
block, per `schema.md`'s status-transition rules): if the count of logged `goal`/`goal_conceded`
events doesn't match step 1's scoreline, or a keeper appearance has no `saves` value, it's flagged
right here — *"The score says 3 conceded, you've logged 2. Add the missing one or fix the
score"* — but doesn't stop the recorder finishing. Finishing here with the 3/2/1 already entered
moves the match straight to `final`; leaving steps 1–4 done but the bonus not yet decided leaves
it at `awaiting_votes` instead, fully visible on the Index either way (see §5's Partial state).

### Editing after the fact

Editing a `final` match requires a reason and flips it to `corrected`, shown publicly on the match
page. There's no per-person audit trail — auth is a shared passphrase — so the visible correction
notice is the accountability mechanism. That's a deliberate trade, and making corrections loud is
what keeps it acceptable.

## 5. States, everywhere

Every list, table and page needs all four. They are shared components so this is enforceable, not
aspirational.

| State | Rule | Example copy |
| --- | --- | --- |
| **Empty** | Say what happens next, with a date if known. Never "No data available". | "No matches yet. The season starts in September." |
| **Loading** | Static chalk blocks in the shape of the content. No shimmer. | — |
| **Error** | Say what broke and whether anything was lost. Offer the retry. | "Couldn't load the Index. Nothing's wrong with your data — try again." |
| **Partial** | A match mid-entry is visibly unfinished, never silently excluded. | "Bonus to add — 3, 2 and 1 points still to come from Sunday's vote." |

**✅ Resolved (CPO review, 7 Sep 2026) — the exact copy for `awaiting_votes`, everywhere it
appears.** The words *ballot*, *voting window*, *votes still to come in* and *players still to be
scored* must not appear anywhere in the product — they all imply an in-app vote, and the vote
already happened verbally at the pub; what's outstanding is data entry, not a decision. Corrected
wording, per surface:

| Where | Copy |
| --- | --- |
| `StatusChip` label | **"Bonus to add"** (the underlying value stays `awaiting_votes`; not worth a migration for a label) |
| Match page banner | "Everything's in except the 3-2-1 from the pub. These points go up once it's added." |
| Index / partial-state line | "Bonus to add — 3, 2 and 1 points still to come from Sunday's vote." |
| Score ledger, affected match | A line reading "Bonus — not added yet" in place of the usual `Bonus · 0`, resolving to the real value once certified |
| Admin CTA / Unfinished filter | "Add the 3-2-1" |

The **error state during match entry** is the one to get right: it must state plainly that the draft
is saved locally and nothing has been lost. A Recorder who believes they've lost twenty minutes of
work in a pub will not use the app again.

## 6. Offline

Not a nice-to-have — the primary write flow happens in a basement pub.

- **v1:** match entry drafts persist to local storage and survive a reload and a dead connection.
  The Reader screens can be network-dependent.
- **Later:** full PWA install with a service worker, so the app opens on the walk from the pitch.

`phases.md` lists offline recording as a "later" item. The draft-persistence half of it is not
optional and belongs in v1; only the service worker can wait.

## 7. What we are deliberately not building

Restating so no one designs it in by reflex:

- **Availability or squad selection** — the club uses Stack (Q34).
- **A digital ballot** — the vote is verbal, at the pub (Q5). We record a certified result.
- **Player photos or avatars** — nobody will supply 25 photos, and placeholder initial-circles are
  a hallmark of generated UI. Players are their names, set well.
- **Notifications** in v1.
- **A separate admin panel** — admin is an unlock, not a destination.
- **Yearly subs** (Q10), **FA Full-Time integration** (Q13), **multi-team UI** (Q2).
