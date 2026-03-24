# Coach Dashboard — Design Spec
**Date:** 2026-03-23
**Status:** Approved

## Overview
Replace `/coach` with a full command-center dashboard at `/coach/dashboard`. Delete `app/coach/page.tsx`. Update all redirects. Build the most important page in ArmTrack: a roster view with per-player readiness, position-grouped sections, a notify modal, and a coach bottom nav.

---

## Route Changes (all `/coach` → `/coach/dashboard`)

| File | Change |
|---|---|
| `app/auth/callback/route.ts` | `${origin}/coach` → `${origin}/coach/dashboard` |
| `app/onboarding/page.tsx` | `router.push("/coach")` → `router.push("/coach/dashboard")` |
| `app/coach/invite/page.tsx` | **Two changes**: (1) `router.replace("/coach")` on line 77 (no-team fallback) → `router.replace("/coach/dashboard")` · (2) `<Link href="/coach"` on line 115 (nav logo) → `<Link href="/coach/dashboard"` · Also add `<CoachBottomNav />` |
| `app/coach/player/[id]/page.tsx` | `router.push("/coach")` → `router.push("/coach/dashboard")` |
| `app/coach/page.tsx` | **Delete** |

---

## New Files

### `app/coach/components/CoachBottomNav.tsx`
Shared bottom nav for **all coach routes**. Added to: `app/coach/dashboard/page.tsx`, `app/coach/invite/page.tsx`, and `app/coach/player/[id]/page.tsx`. Three tabs:
- **Home** (House icon) → `/coach/dashboard` — active when `pathname === '/coach/dashboard'`
- **Invite** (UserPlus icon) → `/coach/invite` — active when `pathname === '/coach/invite'`
- **Settings** (Settings icon) → placeholder, disabled/grayed (no route)

Uses `usePathname()` to highlight active tab. Active tab uses `#3B82F6` accent; inactive uses `#555555`.

### `app/coach/dashboard/page.tsx`
Main dashboard. See layout below.

---

## Data Architecture

Reuse patterns from `app/coach/page.tsx` (the file being deleted):
- `getTodayString()`, `shiftDay()`, `computeStreak()`, `daysSince()` helpers
- Same parallel Promise.all fetch: profiles + recent logs (14 days) + all log dates for streak
- `calculateEstimatedReadiness(logs)` from `lib/readiness.ts` with 3 most recent logs
- `getReadinessState(score)` from `lib/readiness.ts` for color/label

**Additional data fetched:**
- `last_name` field: `profiles` only has `first_name`. Use `formatName(name: string)` helper:
  - If name contains a space → `"John Smith"` → `"John S."`
  - Otherwise → `"John"` → `"John"`
- Today's log check: `logs[0]?.date === todayString`
- `coach_messages` table: insert `{ team_id, coach_id, player_id: null, message, created_at }` for team-wide notifications

**Player grouping:**
```
Pitchers: position === 'Pitcher' || position === 'Two-Way'
Catchers: position === 'Catcher'
Position Players: everything else (including null)
```

**Attention count** (for stat strip): players whose readiness score < 5.5, or logged today with score < 5.5. Excludes players with no logs.

---

## Page Layout

### Nav (sticky top)
- Left: `ArmTrack` wordmark — `Arm` white + `Track` blue, links to `/coach/dashboard`
- Right: coach `first_name` in gray + "Sign out" button

### Header block
- Team name: large bold white (H1)
- Sport badge: small gray pill (`#111111` bg, `#222222` border)

### Readiness Summary Strip
4 stat cards in a 2×2 grid on mobile, horizontal row on desktop (≥640px):
1. **Total** — total player count, white
2. **Logged today** — count, `#22C55E` green
3. **Not logged** — count, `#888888` gray
4. **Need attention** — count of players with readiness < 5.5, `#F59E0B` amber

Cards: `#111111` bg, `#222222` border, rounded-2xl, label in small gray uppercase, number in large bold.

### Player Sections
Three collapsible sections: **Pitchers**, **Catchers**, **Position Players**.
- Section header: `#111111` bg, section name bold white, player count badge in gray, chevron icon (rotates on open/close)
- Default: all open
- Empty section: not rendered at all

Each section renders its player cards in vertical stack.

### Player Card
Horizontal layout, `#111111` bg, `#222222` border, `rounded-2xl`, `p-4`.

If player has **not logged today**: full card at **50% opacity**, no readiness score (show `—`), left side shows "Awaiting log" in `#555555`.

**Left column (flex-col, flex-1):**
- `formatName(first_name)` — white, `font-semibold`
- Position badge — small gray pill
- "Logged today ✓" in `#22C55E` if logged, "Awaiting log" in `#555555` if not

**Center column (flex-col, items-center):**
- Readiness score — `text-2xl font-black`, color from `getReadinessState(score).color`
- State label — `text-xs`, same color
- Three metric badges horizontally: `P[n]` `S[n]` `St[n]` from most recent log, tiny gray pills (`#1a1a1a` bg, `#333` border)
- If no log: show `—` in gray for score, no badges

**Right column (flex-col, items-end, gap-2):**
- Throws count from latest log: `[n] throws` in gray, or `—` if no log
- `<Link href="/coach/player/[player_id]">View</Link>` — small blue outlined button

Border color follows `getBorderColor()` from existing coach page: green/amber/red/gray based on readiness.

### Empty State
If team has no players: centered card with "Your roster is empty. Share your invite link to add players." + blue "Invite Players" button → `/coach/invite`.

### Notify FAB
Fixed bottom-right, above bottom nav (offset `bottom-20`). Blue circle button, Bell icon, `boxShadow: 0 4px 24px rgba(59,130,246,0.4)`.

On click: opens modal overlay.

### Notify Modal
Centered, `max-width: 420px`, `#111111` bg, `#222222` border, `rounded-2xl`, `p-6`.
- Title: "Notify Your Team"
- Close (X) button top-right
- Two option buttons:
  - "Remind players to log" (pre-fills textarea with default message)
  - "Custom message" (clears textarea, lets coach type)
- Textarea: `#0d0d0d` bg, `#222222` border, `min-height: 80px`
- "Send to Team" blue button → inserts into `coach_messages`: `{ team_id, coach_id, player_id: null, message, created_at: new Date().toISOString() }` → closes modal, brief "Sent!" state on FAB for 2s

### Bottom Nav
`CoachBottomNav` component, `fixed bottom-0`, full width, `bg-black`, `border-top: 1px solid #111`.
Three tabs: Home, Invite, Settings(disabled).

---

## Framer Motion
- Page fade-in: `motion.div` wrapping main content, `initial={{ opacity:0, y:16 }}`, `animate={{ opacity:1, y:0 }}`, `duration: 0.4`
- Summary strip cards: staggered `custom={i}` delay `i * 0.05`
- Player sections: staggered `custom={i}` delay `i * 0.08`
- Modal: `AnimatePresence` + scale+fade `initial={{ opacity:0, scale:0.95 }}`

---

## TypeScript Types

```typescript
interface CoachProfile { id: string; first_name: string }
interface Team { id: string; name: string; code: string; sport: string; coach_id: string }
interface PlayerProfile { id: string; first_name: string; position: string | null; level: string | null }
interface PlayerEntry {
  player_id: string
  profile: PlayerProfile
  logs: ArmLog[]           // sorted desc, up to 14 days; top 7 passed to calculateEstimatedReadiness (consistent with existing coach page)
  readiness: number | null
  loggedToday: boolean
  streak: number
  daysSinceLast: number | null   // days since most recent log; null if no logs
}
```

**Note on `daysSinceLast`:** Retained from the original `app/coach/page.tsx` interface. Used to support future "hasn't logged in N days" callouts. Not rendered in the initial card UI but kept in the type for completeness.

**Note on log count for readiness:** Pass `logs.slice(0, 7)` to `calculateEstimatedReadiness` (same as existing code, not 3). The function internally uses only the most recent 3 for modifier logic, so this is equivalent and consistent.

---

## Design Tokens
- Background: `#000000` · Cards: `#111111` · Border: `#222222`
- Accent: `#3B82F6` · Text: `#FFFFFF` / `#888888`
- Green: `#22C55E` · Amber: `#F59E0B` · Red: `#EF4444`
- Max-width: 900px · Mobile-first

## Out of Scope
- Real-time updates (no Supabase subscriptions)
- Per-player notifications (player_id non-null messages)
- Player notification card on player dashboard (separate task)
- Settings page content
