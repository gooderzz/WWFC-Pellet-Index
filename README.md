# Pellet Index

An interactive app for **Westminster Wanderers FC**, a Sunday league side in the Southern Sunday
Football League, to run the **Pellet Index** — the club's own fantasy-football-style performance
competition — and to keep a proper record of the season.

Players earn points for turning out, playing 60 minutes, keeping clean sheets, scoring, assisting,
making saves and so on, minus points for cards, own goals and dropping out with no notice. After
every game the squad votes for its top three at the pub, who take 3, 2 and 1 bonus points. It has
run on a Google Sheet since 2023/24. This replaces it.

The app also records the season itself: fixtures, results, who started, who came off the bench, and
what each player did while they were on the pitch.

## Status

**Phase 1 — frame and structure.** Planning questions are answered. The design contract is
written. The engineering contract, schema, connection guide, environments playbook and
ADRs 0004–0010 are in [`docs/02-architecture/`](docs/02-architecture/). There is still
**no application code** — scaffold is the next implementation step, not a missing product
decision.

Start with [`AGENTS.md`](AGENTS.md), then
[`docs/02-architecture/engineering-guide.md`](docs/02-architecture/engineering-guide.md).

The plan is [`docs/04-roadmap/phases.md`](docs/04-roadmap/phases.md).

## Repository layout

```
AGENTS.md      Condensed context for AI agents. Read this first
docs/          All documentation — see docs/README.md for the index
  00-product/     Brief, personas, open questions, glossary
  01-domain/      Scoring rules, rule history, domain model, spreadsheet audit
  02-architecture/  Engineering guide, schema, connections, environments, ADRs
  03-research/    The league, FA Full-Time, competitive landscape
  04-roadmap/     Delivery phases
  05-design/      Matchday Print — read DESIGN.md before any UI
data/
  legacy/         Verbatim CSV extracts of the three historical spreadsheets
```

## Background

| | |
| --- | --- |
| Club | Westminster Wanderers FC |
| League | [Southern Sunday Football League](https://fulltime.thefa.com/index.html?league=3545957) |
| Division 2026/27 | Supreme Trophies Graham Dodd Premier Division |
| Pellet Index seasons on record | 2023/24, 2024/25, 2025/26 (imported as published totals) |
| Live season | 2026/27 — app is the record from here |

## Running it locally

Nothing to run yet. After the Next.js scaffold (engineering guide Stream A): Node 24, `pnpm
install`, then follow [`docs/02-architecture/environments.md`](docs/02-architecture/environments.md)
— pull **Development** env vars (staging database), never production, then `pnpm dev`.

## Contributing

Read [`AGENTS.md`](AGENTS.md), then [`docs/README.md`](docs/README.md). Planning questions are
closed; do not re-ask them. New ambiguities go in
[`docs/00-product/open-questions.md`](docs/00-product/open-questions.md).
