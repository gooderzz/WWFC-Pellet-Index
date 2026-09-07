# Scoring rule history

The Pellet Index rules have changed in every season we have a record of. That is not a problem to
solve — it is a feature of how the club runs the competition, and the app has to accommodate it.
The consequence for the build is firm: **rulesets are versioned data, scoped to a season, and the
scoring engine takes one as input.**

## What changed, season by season

| Rule | 2023/24 | 2024/25 | 2025/26 | **2026/27** |
| --- | --- | --- | --- | --- |
| Assist (GK) | 3 | 3 | **5** | 5 (unchanged, confirmed deliberate) |
| Assist (DF/MD/FW) | 3 | 3 | 3 | 3 (unchanged) |
| Drop out / no show | −2 | **−5** | −5, relabelled "On The Day Drop Out / No Show" | −5 (unchanged) |
| Penalty shootout scored | — | **+1** | +1 | +1 (unchanged) |
| Penalty shootout not scored | — | **−1** | −1 | −1 (unchanged) |
| Shootout penalty save (GK) | — | **+1 per save** | +1 per save | +1 per save (unchanged) |
| Clean sheet on exactly 1 conceded while on (60+ mins) | 0 (no credit) | 0 (no credit) | 0 (no credit) | **Half credit (new)** — see [`pellet-index-rules.md`](pellet-index-rules.md) |
| Def Inf / clean sheet if under 60 minutes | Sheet audit suggests **half credit** for clean sheet (unverified for Def Inf) | ″ | ″ | **Confirmed by the club: zero, a hard gate — not half.** ⚠️ Tension with the historical pattern above, flagged in [`pellet-index-rules.md`](pellet-index-rules.md); re-verify before assuming both eras work the same way |
| `Kit` (kit-washing point) | absent | absent | **+1, folded into `Total`** | **Confirmed retired** — kit washing now drawn from a hat, no points |
| `PPG` column | absent | absent | **added** | no 2026/27 sheet exists — TBD whether the app keeps this as a concept |
| `FPL` multiplier | ×1.5 | **×1.3** | ×1.3 | confirmed non-MVP — dropped from the live app regardless |

Everything else — appearance, 60 minutes, Def Inf, conceded bands, goals, saves, penalty saves and
misses in open play, cards, own goals, and the 3/2/1 bonus values — has been stable across all four
seasons. **Confirmed by the club on 6 September 2026:** 2026/27 freezes 2025/26 in full except the
clean-sheet change above — this is the only rule change for the new season.

## Reading the changes

The **drop-out penalty tripling** between 23/24 and 24/25 looks like a response to a real problem:
players not showing up without a word. **Confirmed (Q8):** the "On The Day Drop Out / No Show"
label is slightly misleading — the actual distinction isn't *when* you tell the Manager (even the
morning of the match is fine), it's *whether you tell them at all*. The penalty is for genuine
silence: not showing up and not saying anything. The app should model it that way — a boolean
"did they communicate," not a timestamp comparison against kick-off.

The **penalty shootout block** appearing in 24/25 tells us cup competitions matter and shootouts
need first-class support, not a note in a comments field.

The **GK assist bump to 5** in 25/26 is a small, specific tweak of the kind that will keep
happening. It is the clearest argument for keeping the rules in a versioned config rather than in
code.

## What this means for the schema

- A `ruleset` is a versioned record. A `season` points at one. Historical seasons keep their
  original ruleset forever.
- Recomputing 2023/24 with the 2023/24 ruleset must reproduce the published totals exactly. That
  is the regression test for the whole scoring engine.
- Rulesets should be diffable and readable by a human, so the club can see exactly what changed
  when they tweak something.
- **✅ Resolved (Q7): rulesets are immutable once a season starts.** The club confirmed rules never
  change mid-season, so there's no retroactive-recompute workflow to build — "which ruleset applied
  on this date" is never ambiguous.

**Ruleset shape — canonical version lives in
[`../02-architecture/schema.md`](../02-architecture/schema.md) §"Ruleset JSON," which is the
**"Locked shape for v1."** The sketch below is kept in sync with it (corrected 7 Sep 2026 — an
earlier draft here used `dropOutOnTheDay` and had no top-level `kitPoints` /
`cleanSheetHalfIfUnder60` flags; both were field-name drift against the locked schema, not a real
disagreement about the rule itself). If this sketch and `schema.md` ever diverge again,
`schema.md` wins — fix this file, not that one.

```jsonc
{
  "id": "wwfc-2026-27",
  "season": "2026/27",
  "positions": ["GK", "DF", "MD", "FW"],
  "kitPoints": false,              // the 2025/26 kit-washing point, confirmed retired for 26/27
  "cleanSheetHalfIfUnder60": false, // 26/27 uses the hard played60 gate instead — see below
  "rules": {
    "appearance":      { "GK": 1, "DF": 1, "MD": 1, "FW": 1 },
    "minutes60":       { "GK": 1, "DF": 1, "MD": 1, "FW": 1 },
    // Confirmed 6 Sep 2026: played60 is a hard gate for both of the next two rules —
    // if false, both are 0, no partial/half credit. Evaluate this before anything else.
    "defensiveInvolvement": { "requires60": true, "GK": 1, "DF": 1, "MD": 0, "FW": 0 },
    "cleanSheet": {
      "requires60": true,
      "GK": 8, "DF": 8, "MD": 4, "FW": 2,
      "concededTiers": { "0": 1, "1": 0.5, "2+": 0 }  // multiplier on the base value, only reached if requires60 passes
    },
    "concededBands":   [ { "min": 2, "max": 2, "points": { "GK": -1, "DF": -1, "MD": 0, "FW": 0 } },
                         { "min": 3, "points": { "GK": -2, "DF": -2, "MD": 0, "FW": 0 } } ],  // capped at -2, confirmed
    "goal":            { "GK": 6, "DF": 6, "MD": 5, "FW": 4 },
    "assist":          { "GK": 5, "DF": 3, "MD": 3, "FW": 3, "maxPerGoal": 1 },  // GK=5 deliberate; 0 or 1 assist, never split
    "savesPerPoint":   3,  // self-reported count on the appearance, not individual save events
    "penaltySave":     4,
    "penaltyMissed":   -2,
    "yellowCard":      -1,
    "redCard":         -3,  // a 2nd yellow converts straight to this; never stack -1 and -3
    "ownGoal":         -2,
    "dropOut":         -5,  // triggered by silence (no notice at all), not by late notice
    "shootout":        { "scored": 1, "notScored": -1, "gkSavePerSave": 1 },
    "bonus":           [3, 2, 1]  // verbal pub vote, self-voting allowed, confirmed
  }
}
```

**Resolved (6 Sep 2026):** `requires60` and `concededTiers` don't stack — `requires60` is checked
first and short-circuits to 0 if false, so there's no quarter-credit case. **Also resolved:**
`concededTiers` counts goals conceded only while that specific player was on the pitch, not the
whole-match scoreline — see open question **Q4**, now fully closed.

The four seasons don't share these flags — see `schema.md`'s season matrix for exactly how
`requires60`, `cleanSheetHalfIfUnder60`, `concededTiers["1"]`, `kitPoints`, GK assist value and
`dropOut` differ across 2023/24 through 2026/27.
