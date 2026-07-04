# App Store Metadata Pack — paste into App Store Connect

Grounded in the live listing as of 2026-07-03 (App ID 6780317335, released
June 27, v1.0.3, 2 ratings). Metadata changes require submitting a new version
— bundle this with your next build.

## The diagnosis (what I found in the live store)

1. **Your app name is just "ArmTrack" — zero keywords.** The name is the
   single strongest ranking field in Apple's algorithm and you're using 8 of
   30 characters. This is the #1 reason you don't rank for category searches.
2. **Searching "armtrack" ranks you #3 — behind Amtrak and Greyhound.**
   Apple fuzzy-matches "armtrack" ≈ "amtrak" and their download volume
   crushes yours. Keywords in your name/subtitle plus rating velocity are how
   you climb above them.
3. **Not in the top 10 for "arm care baseball"** — the competitors there
   (Arm Care, Ace Pitcher, Armored Heat, Pitch AI) all have keyword-rich
   names.
4. Only 2 ratings — the in-app review prompt is already built, so installs
   will compound this. Every early rating matters disproportionately.

## Paste-in metadata

**App name (30 chars max):**
```
ArmTrack: Baseball Arm Care
```
(27 chars. "Baseball" + "Arm Care" in the name field is the whole play.)

**Subtitle (30 chars max):**
```
Pitch Counts & Arm Readiness
```
(28 chars. Adds "pitch counts" + "readiness" to the second-strongest field.)

**Keyword field (100 chars max, no spaces after commas, don't repeat words
already in name/subtitle):**
```
pitching,softball,tracker,sore,elbow,recovery,throwing,workload,youth,coach,pitcher,log,health
```
(94 chars. Apple combines fields — "baseball"+"tracker" ⇒ matches "baseball
tracker" without wasting characters repeating "baseball".)

**Promotional text (170 chars, changeable anytime without review):**
```
Know if your arm is ready today. Log pain, soreness & throws in 30 seconds — get a readiness score before you throw. Free for players. New: weekly recap & offline logging.
```

**What NOT to put in the keyword field:** "arm", "care", "app", "baseball",
"pitch", "counts", "readiness" (already in name/subtitle — repeats waste
characters), competitor brand names (rejection risk in metadata; fine to BID
on them in ASA).

## Category check

Currently **Health & Fitness**. Consider **Sports** as primary with Health &
Fitness secondary — your searchers ("pitch counter", "baseball") browse
Sports, and the Sports chart is less competitive for a new app. Test after
the metadata change settles, not at the same time (change one variable).

## Ratings flywheel

- 2 → 20 ratings is the highest-leverage jump you can make; Apple heavily
  weights rating count for a new app's search rank.
- The app already prompts after a few logs (`lib/review.ts`). Push the next
  build so more users hit it.
- Ask your first real users (teammates, the 2 who rated) directly — a text
  with the App Store link converts.

## Order of operations

1. Update name/subtitle/keywords in App Store Connect → submit with next build.
2. Wait ~1 week for indexing to settle; watch "arm care", "pitch counter",
   "armtrack" ranks (App Store Connect → Analytics → Search terms).
3. Then start/restructure ASA per `apple-search-ads-playbook.md` — ads on top
   of good metadata are multiplicative; keyword relevance also lowers your CPT.
4. Category test only after that, one change at a time.
