# The Southern Sunday Football League and FA Full-Time

Research into the competition Westminster Wanderers play in, and whether we can get its data into
the app automatically.

## The league

The **Southern Sunday Football League (SSFL)** is an affiliated London FA Sunday league operating
across Southwark, Lambeth, Wandsworth and Merton. Its FA Full-Time league ID is `3545957`:
<https://fulltime.thefa.com/index.html?league=3545957>

Chairman and General Secretary: Graham Rodber. President: Brian Howard.

### Division structure

The SSFL runs a deep pyramid, several divisions of which carry sponsor names:

1. Supreme Trophies **Graham Dodd Premier Division**
2. **Tony Eldridge Championship**
3. Bob Dixon **League One**
4. Voltra Sports **League Two**
5. **League Three**
6. JSF Plumbing and Heating **League Four**
7. **League Five** through **League Ten**

Note the naming: the sponsor prefix changes when sponsors change, but "Premier Division" and
"Championship" are stable. The app should store a division name per season rather than treating it
as a constant.

Competitions are identified by short codes on Full-Time: `PREM` and `CHAM` for the top two
divisions, and `FBC`, `MLIP`, `BLUN`, `DTC` and `BHPC` for cups seen across the league generally.
`3G` is a pitch-surface note, not a competition.

**✅ Confirmed by the club (open question Q23, 6 Sep 2026), the cups Westminster Wanderers
actually enter** are **MLIP** (~3 games a season), **CC** (~1 game), and **FBC** (~2 games) —
rough, variable estimates, not fixed numbers. `MLIP` and `FBC` match the guessed codes above; `CC`
didn't appear in the original guess (possibly a different naming on Full-Time, e.g. a "Charity
Cup" — not confirmed, doesn't block anything). Friendlies and the annual tour don't count toward
the Pellet Index at all.

### Where Westminster Wanderers sit

The club is registered on Full-Time as **Westminster Wanderers FC 1st Team**, and plays in the
Premier Division in 2026/27. Their full division history, the league tables, and the club profile
are in [`club-and-season-history.md`](club-and-season-history.md).

### Season shape

A 14-match league programme in a division of eight, plus cups. The 2024/25 SSFL cup competitions
visible in the records include a Fair Bruv Cup-style knockout with quarter-finals, semi-finals and
a final at Ashford Town, decided by extra time and penalties if level.

Two things follow. First, the Pellet Index season is much longer than the league programme — top
players racked up 19–24 appearances against 14 league games, so cups and friendlies are a large
share of the season and must be first-class. Second, penalty shootouts happen, which explains the
shootout scoring block added in 2024/25.

## Getting data out of FA Full-Time

Short version: **there is no supported API, and direct scraping from this environment is blocked.**

### What was tested

`https://fulltime.thefa.com/index.html?league=3545957` returns **HTTP 403** from this VM, with a
Cloudflare "you have been prevented from accessing this page" interstitial. Adding a browser user
agent does not help; the block is on the requesting IP range, not the headers. Datacentre and cloud
IPs appear to be filtered.

### What exists

- **No official API and no iCal feed.** A feature request for calendar file generation sits on the
  FA's Grassroots Technology forum marked "Not Taken".
- **CSV and Excel downloads** are available from the Downloads tab, but only to signed-in league
  administrators — which we are not. A club can generally see its own fixtures but not export the
  full division programme.
- **Community scrapers exist.** The `full-time-api` Python package parses division pages given a
  season ID and a fixture group ID, both readable from the Full-Time URL. It works by scraping
  HTML, so it is subject to the same Cloudflare block and to breakage whenever the markup changes.
- **Commercial precedent.** TeamStats advertises Full-Time integration for importing results,
  which confirms the data is obtainable in practice — most likely from an IP or arrangement that
  isn't blocked.

### ✅ Decided (open question Q13, 6 Sep 2026): plain manual entry, nothing automated

**No scraping, no importer, no browser-side fetch.** The club confirmed this directly, and for a
better reason than just the Cloudflare block: **fixtures often aren't confirmed until the week
before anyway**, so even a working importer wouldn't save much. Options 2–4 below are kept only as
historical context for why this was considered and rejected — none of them are being built.

1. ~~Manual entry with a good UI~~ → **this is simply the plan now**, not a v1 stopgap. Fourteen
   league fixtures plus ~6 cup games is maybe twenty matches a season; a plain form is enough.
2. ~~Browser-side fetch~~ (bookmarklet/extension sidestepping the IP block) — not needed.
3. ~~Server-side scrape via a residential proxy~~ — not needed, and would've pushed at the FA's
   terms of use for no real benefit now.
4. ~~Ask the league for a fixture export~~ — not needed.

**Design consequence, unchanged and now doubly true:** league data was never a hard dependency, and
now there's no import path to keep in sync with anyway. Fixtures, results and the league table are
entered directly, and everything the Pellet Index needs must work with a manually entered match.

## Useful identifiers

| Thing | Value |
| --- | --- |
| SSFL league ID | `3545957` |
| Full-Time league URL | `https://fulltime.thefa.com/index.html?league=3545957` |
| Tony Eldridge Championship division ID (2024/25) | `533593278` |
| Westminster Wanderers team ID (historical, Premier 2017/18) | `981044241` |
| A historical division-season ID | `896504709` |

**✅ Q14 resolved: not needed.** With no importer being built (see Q13 above), there's no longer
any use for the 2026/27 Premier Division's live Full-Time identifiers. Kept here only in case
that ever changes.
