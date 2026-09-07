# Competitive landscape

Why build rather than buy, and what the existing grassroots apps get right.

## Why not just use an off-the-shelf app

Several products cover parts of this. None of them can run the Pellet Index, because the Pellet
Index is a bespoke scoring system with position-dependent values, per-match position resolution,
conceded bands, half-value clean sheets, a save-per-three rule and a ruleset that changes every
season. Every product below offers either fixed stat categories or, at best, a configurable
player-of-the-match vote. None lets you define a scoring formula.

That is the whole argument for building. The club has a genuinely custom competition with four
seasons of institutional history behind it, and the custom part is precisely the part nobody sells.

## What's out there

| Product | Strengths | Why it doesn't fit |
| --- | --- | --- |
| **TeamStats** | UK grassroots specialist since 2008. FA Full-Time result import, line-ups and formations, Stripe payments, AI match reports, full team and player stats. Free tier | Fixed stat model, no custom scoring. Post-match entry only. Interface widely described as dated |
| **Spond** | Free, reliable, excellent availability and messaging, payment collection | Almost no football-specific depth. No line-ups, no minutes tracking, ads on free tier |
| **Pitch Pulse** | Closest thing to the Pellet Index in spirit — players vote top three after each match, 3/2/1, live leaderboard, cumulative season race charts, AI match reports, end-of-season awards presentation | Only the voting half. No custom points engine, no positional scoring |
| **Mingle Sport** | Configurable awards, match ratings, leaderboards, timed voting windows | Voting and ratings only. Role-based voting and custom windows are paid |
| **Tactico / Squadd** | Drag-and-drop line-ups, live in-match recording, minute-accurate playing time, per-player season cards, offline support, end-of-season "Wrapped" | Fixed stat model. No custom scoring |
| **TeamFeePay** | Payments and player data, done properly | Payments only |
| **Pitchero** | Club websites and fixtures | Club-scale, heavyweight for one Sunday side |

## Ideas worth stealing

Several of these products have clearly learned things the hard way, and there is no reason to
relearn them:

- **A timed voting window.** Mingle opens voting 110 minutes after kick-off and closes it 24 hours
  later or when everyone has voted. That solves two real problems: people voting before full time,
  and results hanging unresolved for a week.
- **Offline-first match recording.** Sunday league pitches have terrible signal. Tactico and Pitch
  Pulse both make a point of working offline and syncing later. Anything that requires connectivity
  at the moment of a substitution will not get used.
- **Per-player season cards.** A shareable card with a player's own stats is the single most
  engaging feature these apps offer, and it costs almost nothing once the data exists.
- **A cumulative season race chart.** Pitch Pulse's "The Race" — position over time, not just the
  final table — is a much better way to show a season than a leaderboard, and the Pellet Index has
  exactly the data for it.
- **An end-of-season awards presentation.** Multiple products build one. The club almost certainly
  has an awards night; generating the slides from the data is an obvious win.
- **Recording playing time to the minute.** Tactico built it for FA playing-time compliance. We
  need it for on-pitch goals for and against.

## Ideas to avoid

- **Payments.** Everyone who has built this reports it as the highest-friction, lowest-joy part of
  the product, and it drags in Stripe, refunds and chasing people. The legacy sheets track subs in
  three columns that were mostly left at `£0.00`, which suggests it was never really used. Keep it
  out of v1.
- **AI-written match reports.** Cheap to add later, and worthless without match data. Not a v1
  feature.
- **Doing everything for the whole club.** Four teams, registrations, parents, safeguarding — that
  way lies Pitchero. Build the thing for one squad that already has a culture around it.

## The differentiator

None of these products can answer "why did I get 11 points last Sunday?" with a breakdown, because
none of them has a points engine. That question, asked every Sunday evening in a WhatsApp group for
four years, is the product.
