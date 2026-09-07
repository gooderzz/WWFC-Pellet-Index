# Documentation

Everything we know about this project. If you are an AI agent, start with
[`../AGENTS.md`](../AGENTS.md) instead — it is the condensed version with the facts you need most.

## Start here

1. [`../AGENTS.md`](../AGENTS.md) — condensed facts. Always first
2. [Engineering guide](02-architecture/engineering-guide.md) — how to build it
3. [Environments](02-architecture/environments.md) — local, staging, production
4. [Pellet Index rules](01-domain/pellet-index-rules.md) — how scoring works
5. [DESIGN.md](05-design/DESIGN.md) — visual contract, before any UI
6. [Open questions](00-product/open-questions.md) — **planning is closed**; archive of answers

## By area

### Product — `00-product/`

| Doc | Contents |
| --- | --- |
| [product-brief.md](00-product/product-brief.md) | The problem, the principles, what's in and out of scope |
| [personas-and-jobs.md](00-product/personas-and-jobs.md) | Player, Scorer, Manager, Club — four *jobs to be done*, not auth roles (there are only two of those: Viewer/Player and Admin) |
| [open-questions.md](00-product/open-questions.md) | Numbered Q&A. Planning closed 6 Sep 2026 |
| [glossary.md](00-product/glossary.md) | Def Inf, C/Sheet, SSFL, and the rest |

### Domain — `01-domain/`

| Doc | Contents |
| --- | --- |
| [pellet-index-rules.md](01-domain/pellet-index-rules.md) | The scoring rules, verified against published totals |
| [scoring-rule-history.md](01-domain/scoring-rule-history.md) | What changed each season, and why rulesets must be versioned |
| [domain-model.md](01-domain/domain-model.md) | Entities. Physical tables are in `02-architecture/schema.md` |
| [legacy-spreadsheets.md](01-domain/legacy-spreadsheets.md) | Full audit of the three sheets: structure, gaps, data quality |

### Architecture — `02-architecture/`

| Doc | Contents |
| --- | --- |
| [engineering-guide.md](02-architecture/engineering-guide.md) | **Implementation contract** — layout, principles, tandem streams |
| [connections.md](02-architecture/connections.md) | IPv4 vs IPv6, shared pooler, runtime vs migration URLs |
| [environments.md](02-architecture/environments.md) | Local, staging, production — two databases, one Vercel project |
| [schema.md](02-architecture/schema.md) | Physical Postgres schema, RLS, ruleset JSON |
| [tech-stack.md](02-architecture/tech-stack.md) | Why this stack. Detail is in the engineering guide |
| [adr/](02-architecture/adr/) | ADRs 0001–0010 |

### Research — `03-research/`

| Doc | Contents |
| --- | --- |
| [ssfl-and-fa-fulltime.md](03-research/ssfl-and-fa-fulltime.md) | The league, its divisions, and how to get data out of Full-Time |
| [club-and-season-history.md](03-research/club-and-season-history.md) | Club profile, division history, league tables, Pellet roll of honour |
| [competitive-landscape.md](03-research/competitive-landscape.md) | Existing apps, what to steal, what to avoid |

### Roadmap — `04-roadmap/`

| Doc | Contents |
| --- | --- |
| [phases.md](04-roadmap/phases.md) | Four phases, each gated on specific answers |

### Design — `05-design/`

Read [`DESIGN.md`](05-design/DESIGN.md) before generating any UI. It is the enforceable contract.

| Doc | Contents |
| --- | --- |
| [DESIGN.md](05-design/DESIGN.md) | **The spec.** Exact tokens, type scale, motion, a13y, and the do-not-use list |
| [brand-foundation.md](05-design/brand-foundation.md) | Palette derivation, typography, voice, the *Matchday Print* concept |
| [component-system.md](05-design/component-system.md) | Four layers, shadcn deviations, domain component APIs, drift governance |
| [ux-and-flows.md](05-design/ux-and-flows.md) | Roles, screen inventory, and the pub match-recording flow |
| [handoff-brief.md](05-design/handoff-brief.md) | What architecture must support, build order, open items |

## Conventions

- Markdown, wrapped around 100 characters.
- Open questions are numbered `Q1`, `Q2`, … and referenced by number from anywhere.
- Decisions that are hard to reverse get an ADR. Everything else goes in the relevant doc.
- Anything unverified says so. A guess presented as a fact is worse than a gap.
- If you add a doc, add it here and to [`../AGENTS.md`](../AGENTS.md).
