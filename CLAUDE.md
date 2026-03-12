# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This App Is
ArmTrack (armtrack.app) is a mobile-first arm care platform for baseball and softball players.
Tagline: "Protect the arm. Extend the career."
Core promise: Know whether your arm is ready today based on your recent throwing and recovery logs.

## Commands
```bash
npm run dev    # Start dev server at http://localhost:3000
npm run build  # Production build (confirm this compiles before reporting done)
npm run lint   # Run ESLint
```

## Tech Stack
- Next.js + Tailwind CSS
- Supabase (auth + database)
- Vercel (hosting, auto-deploys on push)
- Recharts (trend charts)
- Framer Motion (animations)
- Lucide React (icons)

## Database
- `profiles` table: id, first_name, role, position, level, throws, goal, throw_frequency, injury_history, pain_zones, onboarding_complete, team_name, sport
- `arm_logs` table: id, user_id, date, pain_level, soreness_level, stiffness_level, throws_count, intensity, activity_type, recovery_done, notes

Supabase URL: https://trjazxklaraausqtbwkg.supabase.co
Env vars: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`

## Architecture
- `app/` — Next.js App Router pages (landing, auth, onboarding, dashboard, log)
- `app/auth/callback/route.ts` — OAuth callback handler
- `lib/supabase.ts` — Supabase client singleton
- `lib/readiness.ts` — Readiness score logic (pure functions, no side effects)

## Readiness Score
All logic lives in `lib/readiness.ts`:
```
weightedScore = (pain×3 + soreness×2 + stiffness×1) / 6
baseScore = 10 - weightedScore
Modifiers: -0.5 if last throws_count > 100
           -0.5 if last 2 sessions both > 75 throws
           -0.5 if pain trending up over 3 sessions
```

Readiness states: 8.5–10 Ready (green) · 7.0–8.4 Good to Go (green) · 5.5–6.9 Caution (amber) · 4.0–5.4 Light Day (amber) · 2.0–3.9 Rest Recommended (red) · 0–1.9 Throwing Not Recommended (red)

## Design System
- Background: `#000000` · Surface/cards: `#111111` · Border: `#222222`
- Accent: `#3B82F6` (electric blue) · Text: `#FFFFFF` / `#888888`
- Status: `#22C55E` healthy · `#F59E0B` warning · `#EF4444` danger
- Font: Inter · Mobile-first: design for 390px width

## Non-Negotiables
- Mobile-first on every screen
- Logging must complete in under 30 seconds
- Readiness is always "estimated" — never medical truth. Use: "estimated readiness", "based on your recent logs", "your data suggests"
- Never say "Do Not Throw" — use "Throwing Not Recommended"
- AI only for: weekly summaries, readiness explanations, pattern detection, recovery suggestions. No AI chat, no fake coach persona
- Athlete core loop is always free
- Cut anything that doesn't improve logging speed, trust, retention, or clarity

## Git Rules
- Always add files individually — never `git add .` (a `nul` file blocks it)
- Use Windows Terminal for git, not VS Code terminal
- Never commit: `nul`, `.env.local`

## Working Rules
- Read existing files before editing them
- Make targeted edits — don't rewrite entire files unless necessary
- Confirm `npm run build` compiles before reporting a task done
- Report what changed and which files were modified at the end of every task
