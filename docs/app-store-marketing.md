# ArmTrack — App Store listing & discoverability

Goal: when someone searches **"ArmTrack"**, *we* rank #1 (not Amtrak the train app), and we
also show up for arm-care / pitching searches. Two levers: **ASO** (the listing text) and
**Apple Search Ads** (a paid brand-defense campaign).

---

## 1. The "Amtrak" problem — why it happens & the fix
Apple's search fuzzy-matches and favors popular apps. "armtrack" is one character from "amtrak,"
which is a huge, established app, so Apple may autocorrect or rank Amtrak above a brand-new app.

You beat this with **three signals**, strongest first:

1. **Apple Search Ads brand campaign (the real fix).** Bid on your *own* exact keyword
   `armtrack`. Your ad then sits in the #1 slot for that search, above any organic result —
   including Amtrak. Brand keywords are cheap (little competition on your own name). This is the
   single most effective move. See §4.
2. **Exact app name = "ArmTrack."** An exact name match is the strongest organic ranking signal.
   Keep "ArmTrack" as the literal first word of the app name.
3. **Ratings + installs.** Ranking authority grows with downloads and good reviews. Early on,
   ask your first users to rate; that's what lets you out-rank Amtrak organically over time.

> Reality: for the first few weeks, organic search for "armtrack" may still surface Amtrak. The
> Search Ads brand campaign is what guarantees you're on top *now*. Budget a few $/day for it.

---

## 2. Listing text (paste into App Store Connect → App Information / Version)

**App Name (≤30 chars)** — name + a keyword:
> `ArmTrack: Baseball Arm Care`  (27)

**Subtitle (≤30 chars)** — different keywords than the name:
> `Throwing readiness & recovery`  (29)

**Keywords field (≤100 chars, comma-separated, NO spaces, NO repeats of name/subtitle words).**
Don't waste space repeating "armtrack/arm/care/readiness" (already in name+subtitle). Apple
auto-combines words, so include singulars; plurals are matched automatically:
> `pitcher,pitching,baseball,softball,throwing,pitch,count,velocity,sore,injury,coach,workload,mph,bullpen,rehab`

**Promotional text (≤170 chars, editable anytime without a new build):**
> `Know whether your arm is ready today. Log throwing and recovery in under a minute and get a clear, personalized readiness score. Built for pitchers and coaches.`

**Description (full):**
> ArmTrack helps baseball and softball players protect their arm and extend their career.
>
> Log your throwing and recovery in under a minute a day, and ArmTrack turns it into an
> estimated readiness score — so you know whether your arm is ready today, based on your recent
> pain, soreness, stiffness, and workload.
>
> • Daily readiness score from your own logs
> • 60-second check-ins — throws, intensity, pain, soreness, recovery
> • Trends that surface warning signs before they become injuries
> • A shareable athlete profile, and tools for coaches to follow their team
>
> ArmTrack gives you information to make smarter throwing decisions. It is not medical advice and
> does not diagnose injuries — always listen to your body and your coach.
>
> Protect the arm. Extend the career.

**Keep these accurate** — App Privacy labels, age rating, etc. (see docs/app-store-submission.md).

---

## 3. Screenshots
- Required size: **6.9"/6.7" iPhone = 1290 × 2796** (one set covers most devices; you can add a
  6.5" set later). 3–10 allowed; 3–5 strong ones is plenty.
- Generated marketing versions live in `marketing/app-store/` (branded background + headline +
  the screen). Source raw screens are in `screenshots/`.
- ⚠️ Re-capture the raw screens from **build 18** before final upload — the current ones predate
  the nav cleanup (they still show the old "Sign out" top button). Save them over the same names
  in `screenshots/` and rerun the generator.
- Order them by impact: **readiness score → fast logging → trends**. The first 1–2 are what
  people actually see in search results, so lead with the readiness score.

---

## 4. Apple Search Ads — setup (the brand-defense campaign)
App Store Connect → **Apple Search Ads** (or searchads.apple.com).

**Campaign A — Brand defense (do this first):**
- Type: Apple Search Ads **Advanced** (keyword-level control).
- Keyword: `armtrack` as **exact match** (and maybe `arm track` as two words).
- Budget: small, e.g. **$5/day**. Cheap because no one else bids on your name.
- Effect: your app takes the top ad slot whenever someone searches your name — beats Amtrak.

**Campaign B — Category discovery (optional, when you have budget):**
- Keywords (broad/exact): `pitch count`, `arm care`, `pitching`, `baseball training`,
  `throwing program`, `arm recovery`.
- Start small ($5–10/day), watch cost-per-install, keep the cheap converting keywords.

**Tips:**
- Apple Search Ads **Basic** is the no-effort option (set a budget, Apple optimizes) — fine if
  you don't want to manage keywords, but Advanced gives you the brand-exact control you want.
- You can't run Search Ads until the app is **live** on the store, so this comes right after
  release.

---

## 5. Order of operations
1. Finalize listing text (§2) + re-shot screenshots (§3) in App Store Connect.
2. Submit build 18 for review (see docs/app-store-submission.md).
3. After it's **live**, set up the **brand-defense Search Ads campaign** (§4 Campaign A).
4. Ask your first users for ratings — that's what wins the organic "armtrack" search long-term.
