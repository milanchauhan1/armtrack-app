# Congressional App Challenge — ArmTrack Submission Packet
*Everything pre-written. When the portal opens (~summer, due ~early November — verify your district's date at congressionalappchallenge.us), paste these in. Record the demo video using the script at the bottom.*

---

## App name
**ArmTrack**

## One-line description
A free app that gives baseball and softball players a daily arm-readiness score so they can catch overuse before it becomes an injury — and lets coaches see their whole team's readiness on one screen.

## Short description (≈75 words — for the app summary field)
ArmTrack is a free mobile app that helps baseball and softball players protect their throwing arm. In under 60 seconds a day, a player logs pain, soreness, stiffness, and how much they threw. ArmTrack turns that into a readiness score (0–10) and a clear recommendation — throw, take a light day, or rest. Coaches get a dashboard of every player's readiness before practice. Built to catch overuse early, because most youth arm injuries are preventable.

## Full description (≈250 words — for the long description field)
Most serious arm injuries in youth baseball don't happen from one bad throw — they build up over weeks of overuse that nobody is tracking. UCL injuries requiring "Tommy John" surgery have risen sharply in teenagers, and fatigue is a known amplifier of risk. Yet the early warning signs — rising soreness, incomplete recovery, climbing throw counts — go unrecorded.

ArmTrack closes that gap. A player spends under a minute a day rating pain, soreness, and stiffness and entering how much they threw. The app computes a readiness score from 0 to 10 using a transparent, weighted model (pain is weighted most heavily, with deductions for high single-day volume, back-to-back heavy days, and a rising-pain trend), then maps it to a plain-language recommendation. Coaches get a single dashboard showing every player's readiness before practice — who's good to throw, who needs a light day, who hasn't checked in.

I built ArmTrack with Next.js and TypeScript, Supabase (authentication and a Postgres database with row-level security to protect minors' data), and Capacitor to ship it as a native iOS app. The hardest parts weren't the UI — they were designing a readiness model I could actually defend, and locking down the database so a public API key can't expose a single player's health data.

It's completely free, with no ads and no selling of data. I built it because I'm a player who dealt with elbow pain I never tracked, and I wanted the next player to catch it sooner.

## "What inspired you / the problem" (if asked)
I've played baseball most of my life. As I started throwing harder, elbow pain just became part of the routine — ibuprofen before practice, telling myself I was fine. I never tracked my throwing volume, my soreness, or how I was recovering, and it caught up with me. I built ArmTrack so the next player doesn't have to learn that the hard way — and I made it free so cost is never the reason a kid goes untracked.

## "How you built it / tech stack" (if asked)
- **Frontend:** Next.js (React) + TypeScript, statically exported for speed and offline support.
- **Backend/data:** Supabase — authentication plus a PostgreSQL database secured with row-level security policies so each player's data is readable only by them and their coach.
- **Mobile:** Capacitor wraps the web app as a native iOS app (in the App Store).
- **The model:** a transparent, weighted readiness score with workload and trend modifiers — documented in a white paper at armtrack.app/methodology. I deliberately chose an explainable model over a black box because there's no training data yet and the decision is health-adjacent.

## "Biggest challenge / what you learned" (if asked)
The biggest challenge was security. ArmTrack stores health-adjacent data for minors, and because the app talks to the database directly with a public key, the only thing protecting that data is row-level security. I audited every table, found and fixed real gaps (a message table that was readable by anyone, a helper function exposed to the public API), and verified with database advisors that a leaked key exposes nothing. I learned that the hard, invisible engineering — security and data modeling — matters more than the visible UI.

---

## Demo video script (~3 minutes, film on your phone)
*Keep it real and conversational. You on camera > polished. Screen-record the app for the middle section.*

**[0:00–0:25] Hook + who you are (on camera)**
> "Hey, I'm Milan. I've played baseball most of my life, and like a lot of pitchers, I threw through elbow pain I never tracked — until it caught up with me. So I built an app to fix that. It's called ArmTrack, and it's free."

**[0:25–0:55] The problem (on camera)**
> "Most serious arm injuries don't come from one throw — they build up from overuse nobody's tracking. The warning signs are there every day, but no one writes them down. ArmTrack makes them visible."

**[0:55–1:50] Demo the app (screen recording)**
> "Here's how it works. Every day takes under a minute. You rate pain, soreness, stiffness…" *(drag the sliders)* "…and how much you threw. ArmTrack gives you a readiness score out of 10 and tells you exactly what to do — throw normally, take a light day, or rest." *(show the score + recommendation)* "And if you're a coach, you open one screen and see your whole team's readiness before practice — who's ready, who needs a light day, who hasn't checked in."

**[1:50–2:30] How I built it (on camera or voiceover)**
> "I built it with Next.js and TypeScript, Supabase for the database, and Capacitor to ship it to the App Store. The hardest part wasn't the design — it was the readiness model and locking down the database so a public key can't leak anyone's health data. I wrote up the model in a white paper on the site."

**[2:30–3:00] Mission + close (on camera)**
> "ArmTrack is completely free — no ads, no selling data. I make zero dollars from it. I just want fewer kids learning this the hard way like I did. Protect the arm, extend the career. Thanks for watching."

---

## Pre-submit checklist
- [ ] Verify your congressional district's portal + deadline (congressionalappchallenge.us)
- [ ] GitHub repo link ready (or a clean public repo / description of the code)
- [ ] Demo video recorded + uploaded (YouTube unlisted is fine)
- [ ] App is live/demonstrable (web app works without an App Store download — good for judges)
