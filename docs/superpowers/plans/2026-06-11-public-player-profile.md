# Public Player Profile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a public, shareable player profile at a clean `/u/<username>` URL — identity + auto stats + PRs — as the first slice of ArmTrack's social vision.

**Architecture:** New columns on the existing `profiles` table; pure helpers (username validation + stats) in `lib/profile.ts` (unit-tested with vitest); an authed `/profile` edit page and a client-rendered public `/u/[username]` page. Because the app is `output: 'export'`, arbitrary `/u/*` paths are served via a built placeholder route + a `vercel.json` rewrite, with the handle read client-side from the URL.

**Tech Stack:** Next 16 (app router, static export), React 19, Supabase JS, Tailwind v4, vitest. Spec: `docs/superpowers/specs/2026-06-11-public-player-profile-design.md`.

**Verification approach:** Pure logic (Task 2) uses TDD with vitest (`npm test`). UI + Supabase integration (Tasks 3–6) is verified in the running dev server via the preview tools, matching how this app is normally verified.

---

## File Structure

- `lib/profile.ts` (create) — pure helpers: username validation, reserved list, stats computation, formatting. No I/O.
- `lib/profile.test.ts` (create) — vitest tests for `lib/profile.ts`.
- `app/profile/page.tsx` (create) — authed profile edit screen.
- `app/u/[username]/page.tsx` (create) — public profile view (client-rendered shell).
- `vercel.json` (create) — rewrite `/u/*` → the placeholder shell.
- `app/dashboard/page.tsx` (modify) — add a "Profile" entry point.
- Supabase migration (run in dashboard) — new columns + unique index.

---

## Task 0: Supabase migration (new columns + unique index)

**Files:** none in repo — run SQL in the Supabase dashboard (SQL editor). Capture the SQL in the PR description.

- [ ] **Step 1: Run the migration**

```sql
alter table profiles
  add column if not exists username text,
  add column if not exists bio text,
  add column if not exists visibility text not null default 'public',
  add column if not exists pr_velocity_mph integer,
  add column if not exists pr_pop_time_s numeric(3,1),
  add column if not exists pr_sixty_time_s numeric(3,1);

-- case-insensitive uniqueness on username (nulls allowed = not yet claimed)
create unique index if not exists profiles_username_lower_idx
  on profiles (lower(username));

-- constrain visibility values
alter table profiles
  add constraint profiles_visibility_chk
  check (visibility in ('public','unlisted','private'));
```

- [ ] **Step 2: Verify RLS allows public read of public/unlisted profiles**

The `/u/[username]` page reads with the anon key (viewer may be logged out). Ensure a SELECT policy exists. If `profiles` currently has no anon-read policy, add:

```sql
-- Anyone may read a profile row by username when it isn't private.
create policy "public_profiles_readable"
  on profiles for select
  using (visibility in ('public','unlisted') and username is not null);
```

Expected: with the anon key, `select username,first_name,position,level,throws,team_name,bio,visibility,pr_velocity_mph,pr_pop_time_s,pr_sixty_time_s from profiles where lower(username)=lower('<seed>')` returns the row for a public profile and nothing for a private one. (Players already have an authed self-update policy from existing onboarding writes — confirm a self-`update` policy exists so the edit page can save.)

- [ ] **Step 3: Seed one profile for testing**

In the SQL editor, set a username on an existing test profile: `update profiles set username='testpitcher', visibility='public', pr_velocity_mph=82 where id='<your test user id>';`

---

## Task 2: Pure helpers (`lib/profile.ts`) — TDD

**Files:**
- Create: `lib/profile.ts`
- Test: `lib/profile.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// lib/profile.test.ts
import { describe, it, expect } from "vitest";
import {
  normalizeUsername,
  validateUsername,
  RESERVED_USERNAMES,
  computeProfileStats,
} from "./profile";

describe("normalizeUsername", () => {
  it("lowercases and trims", () => {
    expect(normalizeUsername("  JakeThrows ")).toBe("jakethrows");
  });
});

describe("validateUsername", () => {
  it("accepts a valid handle", () => {
    expect(validateUsername("jake_throws22")).toEqual({ ok: true, value: "jake_throws22" });
  });
  it("rejects too short", () => {
    expect(validateUsername("ab").ok).toBe(false);
  });
  it("rejects too long (>20)", () => {
    expect(validateUsername("a".repeat(21)).ok).toBe(false);
  });
  it("rejects illegal characters", () => {
    expect(validateUsername("jake.throws").ok).toBe(false);
    expect(validateUsername("jake throws").ok).toBe(false);
  });
  it("rejects reserved words (case-insensitive)", () => {
    expect(validateUsername("Admin").ok).toBe(false);
    expect(RESERVED_USERNAMES.has("dashboard")).toBe(true);
  });
});

describe("computeProfileStats", () => {
  it("returns zeros for no logs", () => {
    expect(computeProfileStats([])).toEqual({ streak: 0, totalLogs: 0, trackingSince: null });
  });
  it("counts total logs and earliest date", () => {
    const stats = computeProfileStats(["2026-06-01", "2026-06-03", "2026-06-02"]);
    expect(stats.totalLogs).toBe(3);
    expect(stats.trackingSince).toBe("2026-06-01");
  });
});
```

- [ ] **Step 2: Run tests, verify they fail**

Run: `npm test -- profile`
Expected: FAIL (module `./profile` not found / exports undefined).

- [ ] **Step 3: Implement `lib/profile.ts`**

```ts
import { computeStreak } from "./readiness";

export const RESERVED_USERNAMES = new Set<string>([
  "admin", "api", "u", "profile", "login", "signup", "logout", "dashboard",
  "log", "history", "onboarding", "coach", "join", "blog", "settings",
  "reset-password", "update-password", "auth", "armtrack", "support", "help",
]);

export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

export type UsernameResult = { ok: true; value: string } | { ok: false; error: string };

export function validateUsername(raw: string): UsernameResult {
  const value = normalizeUsername(raw);
  if (value.length < 3) return { ok: false, error: "Username must be at least 3 characters." };
  if (value.length > 20) return { ok: false, error: "Username must be 20 characters or fewer." };
  if (!/^[a-z0-9_]+$/.test(value))
    return { ok: false, error: "Use only letters, numbers, and underscores." };
  if (RESERVED_USERNAMES.has(value)) return { ok: false, error: "That username isn't available." };
  return { ok: true, value };
}

export interface ProfileStats {
  streak: number;
  totalLogs: number;
  trackingSince: string | null; // earliest YYYY-MM-DD, or null
}

export function computeProfileStats(logDates: string[]): ProfileStats {
  if (logDates.length === 0) return { streak: 0, totalLogs: 0, trackingSince: null };
  const sorted = [...logDates].sort(); // ascending; YYYY-MM-DD sorts lexically
  return {
    streak: computeStreak(logDates),
    totalLogs: logDates.length,
    trackingSince: sorted[0],
  };
}
```

- [ ] **Step 4: Run tests, verify they pass**

Run: `npm test -- profile`
Expected: PASS (all cases).

- [ ] **Step 5: Commit**

```bash
git add lib/profile.ts lib/profile.test.ts
git commit -m "feat(profile): username + stats helpers with tests"
```

---

## Task 3: Public profile page `/u/[username]` (static-export shell)

**Files:**
- Create: `app/u/[username]/page.tsx`

The page is a **client component**. `generateStaticParams` returns a single placeholder so the static export emits one shell; the real handle is read from `window.location` at runtime and the profile fetched from Supabase.

- [ ] **Step 1: Create the page**

```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { computeProfileStats, type ProfileStats } from "@/lib/profile";

// Static export: emit one placeholder shell; vercel.json rewrites /u/* to it.
export function generateStaticParams() {
  return [{ username: "_" }];
}

interface PublicProfile {
  username: string;
  first_name: string | null;
  position: string | null;
  level: string | null;
  throws: string | null;
  team_name: string | null;
  bio: string | null;
  visibility: "public" | "unlisted" | "private";
  pr_velocity_mph: number | null;
  pr_pop_time_s: number | null;
  pr_sixty_time_s: number | null;
}

function handleFromPath(): string {
  if (typeof window === "undefined") return "";
  return window.location.pathname.replace(/\/+$/, "").split("/").pop() ?? "";
}

export default function PublicProfilePage() {
  const [state, setState] = useState<"loading" | "ok" | "private" | "notfound">("loading");
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [stats, setStats] = useState<ProfileStats>({ streak: 0, totalLogs: 0, trackingSince: null });

  useEffect(() => {
    const handle = handleFromPath();
    if (!handle || handle === "_") { setState("notfound"); return; }

    (async () => {
      const { data: prof } = await supabase
        .from("profiles")
        .select("id, username, first_name, position, level, throws, team_name, bio, visibility, pr_velocity_mph, pr_pop_time_s, pr_sixty_time_s")
        .ilike("username", handle)
        .maybeSingle();

      if (!prof || !prof.username) { setState("notfound"); return; }
      if (prof.visibility === "private") { setState("private"); return; }

      // noindex for unlisted/private (private already returned)
      if (prof.visibility !== "public") {
        const m = document.createElement("meta");
        m.name = "robots"; m.content = "noindex";
        document.head.appendChild(m);
      }

      const { data: logs } = await supabase
        .from("arm_logs").select("date").eq("user_id", prof.id);
      setStats(computeProfileStats((logs ?? []).map((l) => l.date as string)));
      setProfile(prof as PublicProfile);
      setState("ok");
    })();
  }, []);

  if (state === "loading")
    return <Centered><div className="h-6 w-6 animate-spin rounded-full border-2 border-white/10 border-t-blue-500" /></Centered>;
  if (state === "notfound")
    return <Centered><p className="text-gray-400 text-sm">This profile doesn&apos;t exist.</p></Centered>;
  if (state === "private")
    return <Centered><p className="text-gray-400 text-sm">This profile is private.</p></Centered>;

  const p = profile!;
  const initial = (p.first_name || p.username).charAt(0).toUpperCase();
  return (
    <Centered>
      <div className="w-full max-w-md rounded-2xl p-8 text-center" style={{ backgroundColor: "#111111", border: "1px solid #222222" }}>
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full text-2xl font-extrabold text-white"
             style={{ background: "linear-gradient(145deg,#3B82F6,#1d4ed8)" }}>
          {initial}
        </div>
        <h1 className="text-xl font-extrabold text-white">{p.first_name || "Player"}</h1>
        <p className="text-sm text-blue-400">@{p.username}</p>
        {p.bio && <p className="mt-3 text-sm text-gray-400">{p.bio}</p>}

        {/* meta chips: position / level / throws / team — render only those present */}
        {/* stats row: streak, totalLogs, trackingSince */}
        {/* PR row: velocity / pop time / 60 — render only those set */}

        <Link href="/signup" className="mt-6 inline-block rounded-xl bg-blue-500 px-5 py-3 text-sm font-semibold text-white">
          Track your arm on ArmTrack — free
        </Link>
      </div>
    </Centered>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-screen items-center justify-center bg-black px-4 py-12">{children}</div>;
}
```

Fill the three commented rows following the chip/stat styling already used on the dashboard (colored pills on `#1a1a1a`, labels `text-gray-400`). Render a field only when present (e.g. `{p.position && <Chip>{p.position}</Chip>}`). Stats: `{stats.streak}🔥`, `{stats.totalLogs} logs`, and "Tracking since {month year}" derived from `stats.trackingSince`.

- [ ] **Step 2: Verify in the browser**

Start the dev server (`armtrack-dev`). Visit `http://localhost:3000/u/testpitcher` (the seeded handle from Task 0).
Expected: profile renders with name, @handle, chips, stats, PRs, and the signup CTA. Visit `/u/doesnotexist` → "doesn't exist." Set the seed to `visibility='private'` and reload → "private." Check `preview_console_logs` for errors (expect none).

- [ ] **Step 3: Commit**

```bash
git add app/u/[username]/page.tsx
git commit -m "feat(profile): public /u/[username] view"
```

---

## Task 4: Vercel rewrite for arbitrary handles

**Files:**
- Create: `vercel.json`

- [ ] **Step 1: Create `vercel.json`**

```json
{
  "rewrites": [
    { "source": "/u/:handle", "destination": "/u/_/" },
    { "source": "/u/:handle/", "destination": "/u/_/" }
  ]
}
```

This makes the static host serve the placeholder shell (`/u/_/index.html`) for any `/u/<handle>`; the client reads the real handle from the path. (Local `next dev` serves the dynamic route directly, so the rewrite only matters on Vercel — verify the local route works regardless.)

- [ ] **Step 2: Commit**

```bash
git add vercel.json
git commit -m "feat(profile): vercel rewrite so /u/* serves the profile shell"
```

> After deploy, manually verify `https://armtrack.app/u/testpitcher` resolves (not 404). If Vercel doesn't apply the rewrite for the export, fall back to a query-param URL (`/u/?handle=`) — documented in the spec.

---

## Task 5: Profile edit page `/profile`

**Files:**
- Create: `app/profile/page.tsx`

Authed client page modeled on `app/signup/page.tsx` styling (centered card on `#111`, labels, blue CTA). Behavior:

- [ ] **Step 1: Build the page**

On mount: `supabase.auth.getUser()`; if no user → `router.replace("/login")`. Load the current row:
```ts
const { data } = await supabase.from("profiles")
  .select("username, bio, visibility, pr_velocity_mph, pr_pop_time_s, pr_sixty_time_s, first_name")
  .eq("id", user.id).single();
```
Form fields (controlled state, prefilled): username, bio (≤160, show counter), pr_velocity_mph / pr_pop_time_s / pr_sixty_time_s (number inputs), visibility (3-way segmented control: Public / Unlisted / Private).

Username field uses `validateUsername` for format, plus a **debounced availability check** (300ms) that ignores the user's own current handle:
```ts
const v = validateUsername(input);
if (!v.ok) { setUsernameError(v.error); return; }
const { data: taken } = await supabase.from("profiles")
  .select("id").ilike("username", v.value).neq("id", user.id).maybeSingle();
setUsernameError(taken ? "That username is taken." : null);
```
Save button (disabled while a username error exists):
```ts
await supabase.from("profiles").update({
  username: v.value, bio, visibility,
  pr_velocity_mph: velo ? Number(velo) : null,
  pr_pop_time_s: pop ? Number(pop) : null,
  pr_sixty_time_s: sixty ? Number(sixty) : null,
}).eq("id", user.id);
```
Handle the unique-index race: if `update` returns a Postgres error code `23505`, show "That username was just taken." After a successful save, show a "Share my profile" button:
```ts
const url = `${location.origin}/u/${v.value}`;
if (navigator.share) navigator.share({ url, title: "My ArmTrack profile" });
else { navigator.clipboard.writeText(url); /* show "Copied!" */ }
```

- [ ] **Step 2: Verify in the browser**

Log in as the test user, go to `/profile`. Try an invalid username (`ab`, `jake.x`, `admin`) → inline error. Type a free handle → "available". Save PRs + bio + set Public. Reload → values persist. Click Share → copies `/u/<handle>`. Open that link in a new tab → matches Task 3 output. Check console for errors.

- [ ] **Step 3: Commit**

```bash
git add app/profile/page.tsx
git commit -m "feat(profile): /profile edit screen with username, PRs, visibility, share"
```

---

## Task 6: Entry point from the dashboard

**Files:**
- Modify: `app/dashboard/page.tsx`

- [ ] **Step 1: Add a Profile link**

Find the dashboard greeting/name element (renders `first_name`). Wrap it (or add a small avatar/`@` button next to it) in `<Link href="/profile">`. If the player has no `username` yet, the link still goes to `/profile` (where they claim one). Keep styling minimal and consistent with the existing header.

- [ ] **Step 2: Verify**

On `/dashboard`, the name/avatar is tappable → navigates to `/profile`. Console clean.

- [ ] **Step 3: Commit**

```bash
git add app/dashboard/page.tsx
git commit -m "feat(profile): dashboard entry point to /profile"
```

---

## Final verification & push

- [ ] `npm test` passes (profile + existing readiness tests).
- [ ] Dev server: `/profile` edit round-trips; `/u/<handle>` renders public, hides private, 404s unknown; dashboard link works; no console errors.
- [ ] `git fetch origin` → confirm 0 behind, then `git push origin main`.
- [ ] After Vercel deploy, manually confirm `armtrack.app/u/<handle>` resolves.

---

## Self-Review

**Spec coverage:** username (Task 2 validate + Task 5 claim) ✓; bio/PRs/visibility (Task 0 columns, Task 5 edit, Task 3 render) ✓; initials avatar (Task 3) ✓; auto stats from logs+readiness (Task 2 `computeProfileStats`, Task 3 fetch) ✓; `/u/[username]` public view + visibility enforcement + noindex (Task 3) ✓; static-export serving (Task 3 placeholder + Task 4 rewrite) ✓; safety = first-name-only, no location, no social, visibility control (Task 3 render + Task 5 control) ✓; share (Task 5) ✓; entry point (Task 6) ✓.

**Placeholders:** UI JSX in Tasks 3/5 is specified structurally with all logic code given; the only "fill in" is presentational chips/inputs that follow the existing signup/dashboard styling — no behavioral ambiguity.

**Type consistency:** `ProfileStats` / `computeProfileStats` / `validateUsername` signatures match between Task 2 definitions and Tasks 3/5 usage. `arm_logs.user_id` + `.date`, `profiles` columns match Task 0 + codebase reads.
