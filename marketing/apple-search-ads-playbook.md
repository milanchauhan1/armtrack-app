# Apple Search Ads Playbook — ArmTrack

Written for a solo founder running a small daily budget. Everything here is
doable in one sitting, then ~20 min/week of maintenance.

---

## 1. Why ASA usually "isn't doing its job" — diagnose first

Run through these in order in the ASA dashboard. One of the first four is
almost always the culprit:

1. **Search Match / broad match is eating the budget.** Check Charts →
   spend by keyword. If most spend has no installs, or the "search terms"
   report shows junk queries (generic "baseball games", "MLB scores"), that's
   the leak. Fix: turn Search Match OFF everywhere except one small discovery
   campaign (structure below), move everything else to exact match.
2. **Bidding on terms nobody searches.** "Arm care tracker" may have ~0
   volume. Check impressions per keyword: <100/month = dead keyword, it can't
   do a job. The volume lives in adjacent terms ("pitching app", "pitch
   counter", "baseball throwing program").
3. **Losing every auction.** Impression share <10% on your core keywords means
   bids are too low to ever be seen. Better 5 keywords you can actually win
   than 50 you can't.
4. **The ad works, the page doesn't.** If TTR (tap-through rate) is >6% but
   CVR (install rate) is <20%, the product page is the problem, not the ads.
   Your first screenshot (readiness score) is strong — but see §5 on title/
   subtitle keywords and custom product pages.
5. **Wrong moment.** Youth baseball is brutally seasonal. Jan–May (tryouts +
   spring season) is peak intent; late summer/fall drops hard. Flat spend
   year-round means overpaying off-season and starving peak.

---

## 2. Campaign structure (4 campaigns, ~10 min to set up)

Classic separation so you can see what actually works:

| Campaign | Match | Search Match | Purpose | Budget share |
|---|---|---|---|---|
| **Brand** | Exact | Off | Own "armtrack" so competitors can't buy it | 5% |
| **Category** | Exact | Off | The money keywords (§3) | 60% |
| **Competitor** | Exact | Off | Riding known-app searches (§4) | 20% |
| **Discovery** | Broad + Search Match ON | On | Find new terms cheaply | 15% |

**The discovery loop (this is the whole system):** once a week, open the
Discovery campaign's search-terms report. Any term with an install → add it
as **exact** to Category (or Competitor) and as a **negative exact** to
Discovery. Any term with spend and no installs → negative exact in Discovery.
Discovery's job is to feed the exact campaigns, not to convert.

Add every Category/Competitor keyword as **negative** in Discovery from day
one so campaigns never compete with each other.

---

## 3. Category keywords (seed list, exact match)

High intent — the searcher has the problem ArmTrack solves:

- pitch counter · pitch count tracker · pitch count app
- baseball pitching app · pitching tracker · softball pitching app
- arm care · arm care app · baseball arm care
- throwing program · baseball throwing program
- pitching workload · workload tracker baseball
- sore arm baseball · youth pitch count

Medium intent (worth testing at lower bids):

- baseball training app · softball training app
- velocity training · pitching velocity app
- baseball coach app · youth baseball app
- pitching drills · long toss program

Notes:
- **"pitch counter" family is likely your volume king.** ArmTrack tracks
  throws — that's a pitch counter plus a brain. Someone searching it has the
  exact pain point (usually a parent counting pitches from the bleachers).
- Parents search differently than players: "youth pitch count", "little
  league pitch count rules", "sore arm kid baseball". Test parent phrasing.
- Skip single generic words ("baseball", "pitching") — expensive, unqualified.

## 4. Competitor keywords (exact match, modest bids)

- pulse throw · driveline pulse · driveline
- armcare · armcare.com
- gamechanger (huge volume — the parent scorekeeping crowd; test carefully,
  it can spend fast)
- diamond kinetics · pitch logic · rapsodo

Competitor clicks convert worse than category clicks — bid ~60% of your
category bids and judge after ~50 taps each.

## 5. Product page (ads multiply what the page converts)

- **Title & subtitle are ASA relevance inputs.** Apple's relevance score uses
  your metadata; a keyword in the title/subtitle earns cheaper CPTs on it.
  Aim for: title `ArmTrack: Arm Care & Readiness`, subtitle
  `Pitch counts, soreness & recovery` (or similar — get "arm care" and
  "pitch count" into metadata somewhere, including the hidden keyword field
  in App Store Connect).
- **Custom Product Pages (CPPs)** when you have 30 min: make one CPP with a
  parent/safety angle (first screenshot: "Know when your kid's arm needs a
  day off") and point the "pitch counter"/parent-phrase ad group at it, and
  one with a performance angle ("Extend the career") for player terms
  ("velocity training"). Same app, matched message → CVR jumps.
- Screenshot 1 already leads with the readiness score — keep that. Make sure
  screenshot 2 shows the 30-second log (speed is the differentiator).

## 6. Bids, budget, and judging

- Starting CPT bids: **$1.00–1.50** category exact, **$0.75** competitor,
  **$0.50** discovery. US storefront only until it works.
- iOS 13+ devices, all ages (your users are 13–18 + parents — do NOT add an
  age filter; under-18 devices often report no age and get excluded).
- A keyword needs **~30–50 taps** before you judge it. At $1 CPT that's
  $30–50 per keyword — this is why 5 good keywords beat 50.
- Kill/keep rule: CPA (cost per install) under ~$3 → raise bid 20% and take
  more volume. Over ~$6 with 50+ taps → pause. In between → leave it.
- Since the athlete loop is free, your real metric is **cost per retained
  logger**, not per install. Once a week, sanity-check: are signups from ad
  weeks actually logging (Supabase: profiles created that week with 3+ logs)?
  If installs don't log, it's a product-page/expectation problem, not ASA.

## 7. Weekly 20-minute cadence

1. Discovery search-terms report → promote winners to exact, negative the junk.
2. Pause any keyword with 50+ taps and no install.
3. +20% bid on anything with CPA < $3; check impression share on core terms.
4. Supabase check: did this week's installs turn into loggers?

## 8. Seasonality calendar (US youth baseball)

| Months | What's happening | Move |
|---|---|---|
| Jan–Feb | Tryout prep, indoor training | Ramp up — cheap, high intent |
| Mar–May | Season + peak sore arms | Max budget, this is the year |
| Jun–Jul | Travel/all-star ball | Hold steady |
| Aug–Oct | Fall ball (smaller) | Trim 30–50% |
| Nov–Dec | Dead | Minimum viable spend, brand only |
