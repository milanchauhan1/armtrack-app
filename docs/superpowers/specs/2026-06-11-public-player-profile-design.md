# Public Player Profile — Design Spec

*Date: 2026-06-11 · Status: approved, ready for implementation plan*

## Summary

The first slice of ArmTrack's social/community vision: a **public, shareable player profile** = identity + auto-computed stats + player-entered PRs, reachable at a clean `/u/<username>` URL. This is a marketing/growth asset (every shared profile is an organic acquisition loop) and the foundation later social slices (follow graph, video, coins, badges, ranked league) build on.

This slice deliberately ships **no social interaction** (no follow, comments, DMs, video, coins, or badges) — those are later slices with their own specs.

## Goals

- A player can claim a unique username and have a public profile page.
- The profile shows who they are + real, auto-computed engagement stats + a few PRs.
- The profile is shareable via a clean link.
- Minors are protected by sensible defaults and a visibility control.

## Non-goals (explicitly deferred to later slices)

Follow/friend graph, "follow notable pitchers," photo/video upload, reels feed, comments/feedback, coins economy, profile decoration, badges, ranked league / mechanics comparison, per-profile SEO + rich link previews.

## Data model — new `profiles` columns

| Column | Type | Notes |
|--------|------|-------|
| `username` | text, unique | 3–20 chars, `[a-z0-9_]`, stored lowercase; the handle + URL slug |
| `bio` | text | optional, ≤160 chars |
| `visibility` | text | `public` \| `unlisted` \| `private`; default `public` |
| `pr_velocity_mph` | int | optional, player-editable |
| `pr_pop_time_s` | numeric(3,1) | optional (catchers) |
| `pr_sixty_time_s` | numeric(3,1) | optional (60-yard dash) |

- Add a unique, case-insensitive index on `username`.
- Reserved usernames blocklist (e.g., `admin`, `login`, `signup`, `dashboard`, `u`, `api`, `coach`) so handles can't collide with routes.
- Avatar: **initials only** (reuse the existing colored initial-avatar pattern; color seeded from username). No file storage in this slice.

## Auto-computed stats (read-only)

Derived from existing `logs` table + `lib/readiness.ts`:
- **Current logging streak** (reuse `computeStreak`)
- **Total logs**
- **Tracking since** (date of first log, or profile creation as fallback)

No new storage — computed on profile load.

## Routes & components

### Edit (in-app, authenticated) — `/profile`
- Claim/change `username` with live availability check (debounced query against `profiles`), format + reserved-word validation, clear errors.
- Edit `bio`, PRs (`pr_*`), and `visibility`.
- "Share my profile" button → native share / copy link to `/u/<username>`.
- First-time prompt to claim a username (entry point: a link/CTA from the dashboard or bottom nav — exact placement decided in the plan, following existing nav patterns).

### Public view — `/u/[username]`
- Renders: initials avatar, first name + `@username`, position / level / throwing arm, team name (if any), bio, PRs (only those set), and the auto stats.
- Visibility enforcement:
  - `private` → "This profile is private."
  - `unlisted` → renders, but emit `noindex`.
  - `public` → renders (indexing is moot in v1 — see constraint below).
- Read-only; no auth required to view.

## Architecture — static-export constraint (key decision)

The app builds with `output: 'export'`, so arbitrary `/u/<username>` paths cannot be pre-rendered at build time.

**Chosen approach: client-rendered shell + Vercel rewrite.**
- One `app/u/[username]/page.tsx` client component reads the handle from the path and fetches the profile from Supabase at runtime.
- `generateStaticParams` returns `[]` (no known handles at build).
- A `vercel.json` rewrite maps `/u/:handle` → the shell so the static host serves the page for any handle instead of 404ing.
- Loading and not-found states handled client-side.

**Known limitation (accepted for v1):** because the profile is client-rendered on a static export, per-profile **rich link previews** (Open Graph) and **Google indexing** are not available — a shared link shows a generic ArmTrack preview, not "Jake's profile." Upgrading to server-rendered profiles (per-profile OG + SEO) is a separate later slice that would split the web build to SSR. This is a deliberate tradeoff to ship v1 fast with zero backend/infra change.

## Safety (users are 12–18)

- Only **first name** is shown (last names aren't collected). No location, no contact info.
- **No social interaction** in this slice (no comments/DMs/follow), which removes the bulk of minor-safety risk.
- `visibility` control lets a player/parent set `unlisted` or `private`; `unlisted`/`private` get `noindex`.
- Default is `public` per product decision, but the control exists from day one.

## Testing

- Username validation: format, length, reserved words, uniqueness (case-insensitive).
- Visibility enforcement: `private` not viewable; `unlisted` renders with `noindex`; `public` renders.
- Stats: streak + total + "tracking since" compute correctly for a seeded log set (and empty state for zero logs).
- Edit round-trip: set username/bio/PRs/visibility, reload, values persist.
- Public render: a seeded profile renders all set fields and omits unset PRs.
- Route serving: `/u/<handle>` resolves via the rewrite (and the query-param fallback if used in dev).

## Rollout notes

- Supabase migration for the new columns + unique index (run in the Supabase dashboard; SQL captured in the plan).
- `vercel.json` added at repo root.
- No changes to the Capacitor/iOS static build behavior beyond the new client route.
