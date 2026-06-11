# Product Marketing Context

*Last updated: 2026-06-10*

> **Status: V1 auto-draft.** Drafted from the codebase (landing page, app, founder story). Milan should review, correct, and fill the `⚠️ NEEDS INPUT` gaps. Every other marketing skill reads this file first.

## Product Overview
**One-liner:** Arm-health tracking that helps baseball players and coaches make smarter throwing decisions.
**What it does:** Athletes log pain, soreness, stiffness, and throwing volume in about 60 seconds a day. ArmTrack turns those logs into a daily readiness score and a throwing recommendation, plus trends over time. Coaches see their whole roster's readiness on one screen before practice.
**Product category:** Athlete arm-health / workload monitoring app (baseball & softball).
**Product type:** Mobile-first web app (PWA) + native iOS app via Capacitor. "Coming to the App Store soon."
**Business model:** Free for everyone (players and coaches) for now — fully free is the current positioning, used to drive adoption. **Planned:** once there's traction, introduce a premium tier — most likely a paid coach/team subscription (and/or a player premium upgrade). No pricing on the site yet; keep "free" front and center until a paid tier ships.

## Target Audience
**Target "companies":** Travel baseball organizations, high school baseball/softball programs, individual families.
**Decision-makers:** Coaches (travel + high school) and baseball parents. Athletes are the daily users.
**Primary use case:** Catch small arm issues early by tracking them daily, so a player/coach can decide whether to push, throw normally, or rest — before a minor issue becomes a real injury.
**Jobs to be done:**
- "Tell me whether my arm is ready to throw today."
- "Show me, as a coach, who on my roster is ready / needs a light day / hasn't checked in."
- "Give me a record of how my arm has trended so I notice patterns early."
**Use cases:** Pre-practice readiness check; pitcher workload monitoring across a tournament weekend; parent keeping tabs on a 12–18 y/o's arm; coach roster triage before a game.

## Personas
| Persona | Cares about | Challenge | Value we promise |
|---------|-------------|-----------|------------------|
| Athlete (12–18, pitcher/position) | Playing time, throwing hard, not being benched | Doesn't track anything; says "I'm fine" reflexively | A 60-sec daily habit and a clear "good to go / caution" answer |
| Coach (travel/HS) | Roster availability, not blowing out arms, winning | No visibility into how each arm actually feels | Whole-roster readiness on one screen before practice |
| Parent | Their kid's long-term arm health | Can't be at every practice; no data | Early visibility into trends; peace of mind |

## Problems & Pain Points
**Core problem:** Small arm issues become major problems when nobody tracks them. Aches get ignored ("ibuprofen and convince myself I'm fine") until they turn into lasting damage.
**Why alternatives fall short:**
- Memory / "feel" — athletes underreport and forget; no trend.
- Paper pitch counts — capture throws but not pain, soreness, recovery, or readiness.
- Generic wearables / fitness apps — not baseball-arm specific, no coach roster view.
**What it costs them:** Lost seasons, surgeries (e.g., Tommy John), college/recruiting setbacks, money, and the "what if I'd paid attention sooner" regret.
**Emotional tension:** Fear of a season- or career-ending injury; coaches' anxiety over being responsible for a blown-out arm; parents' helplessness.

## Competitive Landscape
**Direct:**
- **Ace Pitcher (Ace Pitcher Health)** — pitcher-focused app for pitch-count tracking, arm-care exercise routines, and recovery timelines. Falls short for ArmTrack's audience: built around throwing/exercise programs more than a fast daily readiness *call*, and weaker on a coach's whole-roster, at-a-glance view. *(Verify current feature set.)*
- **ArmCare (ArmCare.com)** — arm-health platform built around objective strength and range-of-motion testing, often paired with a handheld strength sensor. Falls short: the hardware + testing adds cost and friction vs. ArmTrack's 60-second subjective daily check-in; more clinical/assessment-oriented than a daily "am I ready to throw?" answer. *(Verify current feature set.)*

**Secondary:** Paper pitch counts, team spreadsheets, Pitch Smart guidelines. Fall short: count workload only — no soreness/recovery/readiness, no trend.
**Indirect:** "Just rest it" / athletic trainer visits / doing nothing. Fall short: reactive, not daily, no early signal.

**ArmTrack's wedge vs. both:** no hardware, no testing protocol — just a 60-second daily log that produces a readiness score *and* a coach roster view. Fastest path to a daily habit.

## Differentiation
**Key differentiators:**
- 60-second daily log → instant readiness score + recommendation.
- Combined athlete *and* coach experience (roster readiness on one screen).
- Tracks four signals over time: pain, soreness, recovery, throwing workload — not just throw counts.
- Built by a player who lived the problem (authentic founder story).
**How we do it differently:** Daily, athlete-friendly, position-aware, and decision-oriented — not a clinical or hardware-heavy tool.
**Why that's better:** It actually gets used every day, and it gives coaches/parents visibility they've never had.
**Why customers choose us:** Free for players, fast, and it surfaces trends before they show up as injuries.

## Objections
| Objection | Response |
|-----------|----------|
| "Players won't log every day." | Under 60 seconds, no login after setup, works from the home screen; most log in under 45s. |
| "Is this medical / does it prevent injuries?" | No. ArmTrack surfaces trends to inform decisions. It doesn't diagnose or prevent injuries or replace a coach, trainer, or doctor. |
| "Another app/screen for my team." | One screen for the whole roster; replaces spreadsheets and guesswork. |
| "Why trust the score?" | Weighted, position-aware, based on the athlete's own recent trend — transparent inputs (pain, soreness, stiffness, throws). |

**Anti-persona:** Adults/pro settings wanting clinical diagnostics or hardware biomechanics; non-throwing sports; anyone expecting a medical/injury-prevention guarantee.

## Switching Dynamics
**Push:** A scare, an injury, or a coach who got burned by an unreported sore arm.
**Pull:** A clear daily answer + roster visibility, free for players.
**Habit:** Doing nothing / "he'll tell me if it hurts" / paper counts.
**Anxiety:** "Will the team actually use it?" / "Is the score trustworthy?" / privacy of a minor's data.

## Customer Language
**How they describe the problem:**
- "Elbow pain just became part of my routine."
- "I'd take ibuprofen and convince myself I was fine."
- "He says he's fine even when he's not."
**How they describe us:**
- "Finally I know which arms are ready before practice." (HS pitching coach, IL)
**Words to use:** arm health, readiness, soreness, workload, throwing decisions, good to go, caution, recovery, trends, before practice.
**Words to avoid:** prevent injuries, injury prevention, diagnose, treat, medical-grade, guarantee, cure. (No medical/prevention claims.)
**Glossary:**
| Term | Meaning |
|------|---------|
| Readiness score | Weighted 0–10 score from pain, soreness, stiffness, and recent throwing load |
| Recommendation | Daily call: e.g., "Good to Go," "Caution," normal session vs. rest |
| Caution flag | Low-readiness arm surfaced for the coach |

## Brand Voice
**Tone:** Premium, calm, direct, athlete-credible — sports-tech, not clinical, not hypey.
**Style:** Short, concrete, honest. Benefit-first. No buzzwords or AI clichés.
**Personality:** Trustworthy, modern, no-nonsense, athlete-built, protective.

## Proof Points
**Metrics:** Most players log in under 45 seconds. ⚠️ NEEDS INPUT — real usage/traction numbers once available (athletes, orgs, logs). Do NOT publish placeholder/fabricated numbers.
**Customers:** ⚠️ NEEDS INPUT — named orgs/teams once you have permission.
**Testimonials:**
> "Finally I know which arms are ready before practice. It changes how I make throwing decisions every single day." — High school pitching coach, Illinois
⚠️ NEEDS INPUT — collect coach, parent, and athlete testimonials (specific + attributed).
**Industry context (citable, not our metrics):** ~1 in 4 youth pitchers report arm pain serious enough to stop throwing; 36× higher injury risk pitching fatigued; 38.8% of MLB pitchers have had Tommy John. (Verify sources before heavy reliance.)
**Value themes:**
| Theme | Proof |
|-------|-------|
| Catch issues early | Daily 4-signal tracking + trends |
| Smarter throwing decisions | Readiness score + recommendation |
| Coach visibility | Whole-roster readiness on one screen |
| Actually gets used | 60-second log, no login after setup |

## Goals
**Business goal:** Grow adoption among travel/HS programs and families ahead of App Store launch.
**Conversion action:** Sign up (coach or player) — "Get Started Free."
**Current metrics:** ⚠️ NEEDS INPUT — current signups / conversion rate / traffic sources.
