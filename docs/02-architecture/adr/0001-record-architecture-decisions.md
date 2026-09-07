# 0001. Record architecture decisions

**Status:** Accepted
**Date:** 2026-09-06

## Context

This project starts from an empty repository and will be built largely by AI agents working in
separate sessions, with a club that is not full-time on it. Context evaporates between sessions.
Decisions that felt obvious when made become mysterious a month later, and the cost of
re-litigating them falls on whoever picks the work up next.

The domain also has several decisions that are genuinely contested — how much history to import,
how people sign in, how much match detail to capture — where the reasoning matters more than the
outcome.

## Decision

We keep Architecture Decision Records in `docs/02-architecture/adr/`, numbered sequentially, one
file per decision, using the format in `template.md`.

An ADR is written when a choice is hard to reverse, when a reasonable person would choose
differently, or when the same reasoning has been explained twice.

Superseded ADRs stay in the repository with their status updated and a link to the replacement.
The history of what we thought is part of the record.

## Consequences

Anyone joining the project — human or agent — can read the ADR index and understand the shape of
the system without archaeology. `AGENTS.md` points at the index.

The cost is discipline: an ADR that is written after the fact, or not at all, is worse than none
because it makes the index untrustworthy.

## Alternatives considered

**Nothing.** The default, and the reason most projects cannot explain themselves. Rejected given
how much of this work will be done by agents with no memory of previous sessions.

**A single running decision log.** Lower ceremony, but it becomes an unsearchable wall and there
is nowhere to record that a decision was superseded.

**Decisions in commit messages and PR descriptions.** They are there, but nobody reads git history
looking for rationale, and this repository will not always have PRs.
