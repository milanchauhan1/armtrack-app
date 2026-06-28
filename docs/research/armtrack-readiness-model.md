# Estimating Daily Throwing Readiness in Youth Baseball: A Transparent, Literature-Informed Risk Model with a Path to a Learned System

**Author:** Milan Chauhan · ArmTrack (armtrack.app)
**Type:** Technical white paper / research abstract (adapt for Congressional App Challenge, Regeneron STS, JSHS, Polygence, college supplements)
**Status:** Draft v1 — *verify all external statistics against primary sources before formal submission.*

---

## Abstract
Arm injuries in youth baseball are common, costly, and substantially preventable: a large share trace
to cumulative overuse rather than a single acute event, yet most young players track nothing day to
day. ArmTrack is a free mobile application that converts a sub-60-second daily self-report — pain,
soreness, stiffness, and throwing workload — into an interpretable **readiness score (0–10)** and a
plain-language throwing recommendation, and aggregates a team's scores into a single coach view. This
paper documents the v1 readiness model: a transparent, weighted, evidence-informed scoring function
with workload- and trend-based modifiers, chosen deliberately over a black-box model because at zero
user data, interpretability and clinical defensibility matter more than predictive complexity. We
specify the model, its design rationale, its known limitations, and a staged validation and
machine-learning roadmap that activates as longitudinal user data accrues.

## 1. Problem and motivation
Overuse-pattern arm injuries (e.g., UCL tears requiring "Tommy John" reconstruction) have risen
sharply among adolescents, with a large fraction of cases concentrated in the 15–19 age band, and
fatigue is a well-documented amplifier of injury risk. The actionable gap is **visibility**: the early
signal (rising soreness, incomplete recovery, climbing workload) is available daily but uncaptured.
ArmTrack's thesis is that a frictionless daily measurement, surfaced as one number a player and coach
will actually look at, can move behavior earlier than pitch-count-at-the-game tools that miss the
bullpens, lessons, and long-toss that constitute most arm stress.

*(Cite: USA Baseball / MLB Pitch Smart guidelines; fatigue-as-risk-factor literature; UCL-injury
epidemiology in adolescents. Replace with primary citations before submission.)*

## 2. Design principles
1. **Interpretability over opacity (at this stage).** With no training data, a learned model would be
   unvalidated and unexplainable to a 13-year-old or a parent. A transparent weighted model can be
   reasoned about, audited, and trusted.
2. **Frictionless input.** Three 0–10 self-reports + a throw count. Daily adherence beats sensor
   precision that nobody sustains.
3. **Conservative and non-diagnostic.** The score is explicitly *estimated readiness*, never a medical
   claim; the system never says "do not throw," only "throwing not recommended," and always defers to a
   coach, athletic trainer, or physician.

## 3. The model
### 3.1 Per-log base score
Each daily log yields a base score from three subjective signals, weighted by their hypothesized
association with tissue stress (pain weighted highest):

```
weighted   = (pain·3 + soreness·2 + stiffness·1) / 6          # pain∈[0,10], etc.
baseScore  = clamp(10 − weighted, 0, 10)                       # higher = more ready
```

Pain is weighted 3×, soreness 2×, stiffness 1× — encoding the clinical prior that sharp/located pain
is a stronger warning than general stiffness. The result is a 0–10 readiness value.

### 3.2 Workload and trend modifiers
The full estimate adjusts the most recent base score with deductions that capture cumulative load and
direction of travel — the overuse signals a single day misses:

```
score = baseScore(latest)
  − 0.5  if latest.throws > 100                                  # high single-day volume
  − 0.5  if last two logs both > 75 throws                       # back-to-back heavy load
  − 0.5  if pain strictly increased across the last 3 logs       # rising-pain trend
score = clamp(score, 0, 10)
```

This is a hand-specified additive model — effectively a small expert system / linear scorecard.

### 3.3 Banding and recommendation
The continuous score maps to six interpretable states, each with a position-aware recommendation
(pitcher / catcher / fielder):

| Score | State | Color |
|------|-------|-------|
| ≥ 8.5 | Ready | green |
| 7.0–8.4 | Good to Go | green |
| 5.5–6.9 | Proceed with Caution | amber |
| 4.0–5.4 | Light Day | amber |
| 2.0–3.9 | Rest Recommended | red |
| < 2.0 | Throwing Not Recommended | red |

### 3.4 Supporting signals
The system also computes a consecutive-day logging **streak** (adherence/retention) and a
**staleness** guard (readiness older than 2 days is flagged as not reflecting "today"), and surfaces
up to two prioritized contextual insights (concerning before positive).

*Reference implementation: `lib/readiness.ts` (pure, side-effect-free functions; unit-testable).*

## 4. Why not machine learning yet?
A supervised model predicting injury would require labeled outcomes (who got hurt, when) across many
athlete-seasons — data that does not exist at launch and is ethically and practically slow to collect
for minors. Deploying an unvalidated black box for an injury-adjacent decision would be irresponsible.
The v1 heuristic is the correct **cold-start** choice: safe, explainable, and good enough to drive the
behavior change (daily attention) that is itself the primary intervention.

## 5. Validation plan (staged, data-gated)
1. **Adherence & reliability (months 1–3):** Do users log daily? Are self-reports internally
   consistent (test-retest on stable days)? Distribution of scores across the population.
2. **Construct validity:** Does the score correlate with downstream behavior (rest taken after low
   scores) and with self-reported "felt off" days?
3. **Predictive validity (longitudinal):** Once enough athlete-time and outcome reports accrue, test
   whether trajectories preceding reported pain spikes / shutdowns differ from baseline — i.e., does a
   declining score *lead* trouble?
4. **Calibration:** Are the band thresholds (8.5 / 7.0 / 5.5 / …) well-placed, or should they be
   re-fit to observed risk?

## 6. Roadmap to a learned model
As the dataset grows, the transparent scorecard becomes the **baseline and the safety rail** for a
data-driven successor:
- **Re-weighting / re-thresholding:** fit the feature weights and band cutoffs to data
  (e.g., logistic regression / ordinal model) instead of hand-set priors — keeps interpretability.
- **Workload modeling:** acute:chronic workload ratio (ACWR) and exponentially-weighted load features
  from the throw-count history.
- **Personalization:** per-athlete baselines (mixed-effects / hierarchical models) so "normal
  soreness" is relative to the individual.
- **Sequence models:** once trajectories are rich, evaluate time-series methods on the daily sequence —
  always benchmarked against, and constrained by, the transparent baseline, never replacing the
  explainability that earns user trust.

## 7. Limitations
Subjective self-report is noisy and gameable; the v1 weights/modifiers are expert priors, not
empirically fit; the score is not a medical device and does not diagnose, treat, or prevent injury.
These are stated plainly in-product. The model's value at this stage is **behavioral** (it makes the
invisible visible daily), with predictive rigor as an explicit, staged goal.

## 8. Conclusion
ArmTrack v1 is a deliberately transparent, literature-informed readiness model deployed in a shipped,
free iOS/web product for a population (youth pitchers) where overuse injury is common and largely
preventable. Its contribution is not algorithmic novelty but **the engineering and product discipline
to make a defensible daily measurement frictionless and usable** — and a clear, honest path from an
explainable cold-start heuristic to a validated, data-driven system.

---

### How to use this document
- **Congressional App Challenge:** condense §1, §3, §8 into the project description + demo-video script.
- **Regeneron STS / JSHS:** expand §3–§6 into the methods/results sections; add primary citations and,
  once available, real adherence/distribution data and figures.
- **Polygence / a faculty mentor:** §5–§6 *is* the research proposal — bring it to a sports-medicine or
  data-science mentor as the project plan.
- **College essays/supplements:** the narrative is §1 + the founder story (player who got hurt → built
  the free fix); this paper is the proof of intellectual depth behind it.

*Before any formal submission: replace the parenthetical citation notes with primary sources, and add
real usage data/figures once the app has users.*
