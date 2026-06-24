# ArmTrack — Users, Scaling & Security (pre-growth audit)
*Written June 2026. The triple-check on everything user-related before real traffic.*

## Architecture in one paragraph
ArmTrack is a **Next.js static export** (`output: 'export'`, see `next.config.ts`) — the whole
frontend is static HTML/JS served by Vercel's CDN, so the **website itself scales infinitely** and
loads instantly. There is **no server/backend of our own**. Every piece of data goes **straight from
the browser to Supabase using the public anon key.** That means two things: (1) all scaling limits are
**Supabase** limits, not ours; (2) **security = Row-Level Security (RLS)**, because the anon key is
public by design (it ships in the static site). Readiness is computed client-side in `lib/readiness.ts`
(pure functions), so it costs nothing at the database.

---

## 1. SECURITY — do this BEFORE real users (highest priority)
The anon key is in the shipped app. Anyone can grab it. The ONLY thing stopping a stranger from
reading every kid's pain/soreness data is RLS being **enabled with correct policies** on each table.

**Verify the live state** (can't be checked from the repo — must query the DB). Run the read-only
audit in `docs/migrations/2026-06-11-rls-audit.sql` in the Supabase SQL editor. Confirm `rls_enabled =
true` for: `profiles`, `arm_logs`, `teams`, `team_members`, `follows`, `waitlist`, and any
`coach_messages` / `coach_recommendations` / `coach_recs` tables.

Then confirm policies match `docs/security-rls-checklist.md`:
- **`arm_logs`** (most important — health data): owner full access via `user_id = auth.uid()`; coach
  read-only for players on a team they own; **no anon read**.
- **`profiles`**: self read/update via `id = auth.uid()`; coach read for their team's players; **no
  blanket anon read** (public profiles go through the `public_profiles` view only).
- **`teams` / `team_members`**: coach manages own team (`coach_id = auth.uid()`); player reads teams
  they belong to; no anon writes.
- **`waitlist`** (new): insert-only for anon/authenticated, no read (already set this way).
- **`public_profiles` view**: intentionally anon-readable, exposes only safe columns. (This is the
  source of the Supabase "SECURITY DEFINER" CRITICAL lint — it's **by design and safe**; do NOT switch
  it to `security_invoker` or you'd have to open anon read on the base table. Acknowledge the lint, or
  later convert it to a SECURITY DEFINER **function** to clear it cleanly.)

**One-line proof it's safe** (run in SQL editor):
```sql
set role anon; select * from arm_logs limit 1; reset role;  -- MUST return zero rows
```
Account deletion (Apple requirement) is already handled — see `docs/migrations/2026-06-11-account-deletion.sql`.

---

## 2. LOADING TIMES — where the wins are
The static shell is already fast (CDN). Perceived speed after login = the client→Supabase queries and
image weight. In priority order:

1. **Add database indexes** (biggest query win, and it protects concurrency). Confirm these exist:
   ```sql
   create index if not exists arm_logs_user_date_idx on arm_logs (user_id, date desc);
   create index if not exists team_members_team_idx   on team_members (team_id);
   create index if not exists team_members_player_idx on team_members (player_id);
   create index if not exists profiles_team_idx       on profiles (team_id);
   create index if not exists teams_coach_idx         on teams (coach_id);
   ```
   `follows` already has indexes; `profiles(lower(username))` already unique-indexed.
2. **Bound the coach roster log query.** `app/coach/dashboard/page.tsx` pulls `arm_logs` for all
   players via a batched `.in("user_id", playerIds)` (good — not N+1), but it isn't date-limited.
   Readiness only needs recent logs — add `.gte("date", <~30 days ago>)` so a roster of veterans
   doesn't drag years of rows. Low effort, scales the heaviest screen.
3. **Compress the screenshots.** `public/screenshots/01-dashboard-readiness.png` is ~317 KB; because
   static export forces `images.unoptimized`, that full PNG ships as-is on the hero. Convert to WebP
   (~60–90 KB) for a faster first paint. (`02-log.png` / `03-log-entry.png` are currently unused —
   drop them or use them in a features section.)
4. **Already good:** queries mostly `select` only needed columns; readiness math is client-side;
   batched roster reads. Don't over-optimize beyond the above yet.

---

## 3. HANDLING MANY USERS — concurrency
- **Frontend:** static files on Vercel's CDN. Effectively unlimited concurrent visitors; not a concern.
- **Database:** Supabase fronts Postgres with **PgBouncer connection pooling**, so thousands of
  concurrent browser clients are fine — *as long as queries are fast* (slow queries hold connections).
  That's why the **indexes in §2 are the real concurrency lever.**
- **Auth:** Supabase Auth handles signups/logins; no work needed from us.
- **Realtime:** not used (no live subscriptions), so no realtime connection limits to worry about.
- Net: with RLS correct + indexes in place, this design comfortably handles your first thousands of
  users without code changes.

---

## 4. SUPABASE FREE vs PRO — when to upgrade
*(Verify current numbers on supabase.com/pricing — tiers shift.)*

**Free** is right for launch and early traction. Rough limits: ~500 MB database, ~50k monthly active
users, limited egress/compute, **no daily backups**, and projects **pause after ~7 days of
inactivity** (a non-issue once you have daily users).

**Upgrade to Pro (~$25/mo) when any of these is true** — and for a health app storing minors' data,
#1 alone justifies it:
1. **You want daily backups / point-in-time recovery.** You do not want to lose users' data. This is
   the single best reason to upgrade.
2. You have **steady real daily users** (removes pause risk entirely, more compute/egress headroom).
3. You approach the free DB size / MAU / bandwidth ceilings.
4. You want better email deliverability and support.

**Recommendation:** launch on Free; flip to **Pro at public launch or the first week of real daily
use**, primarily for **backups + no auto-pause + headroom**. $25/mo is cheap insurance, and since the
app makes $0, there's no rush *until* people actually depend on it daily — then upgrade immediately.

---

## 5. WHAT TO DO ON YOUR MAC'S CLAUDE CODE (the handoff)
Most of §1–2 requires *touching the database*, which Claude Code here can't reach. On your Mac, give
Claude Code direct Supabase access via the **official Supabase MCP server**, then hand it the tasks.

**A. Connect Claude Code to Supabase (one-time).** In a terminal on your Mac:
```bash
claude mcp add supabase --scope user -- \
  npx -y @supabase/mcp-server-supabase@latest --read-only --project-ref=<YOUR_PROJECT_REF>
```
- Get `<YOUR_PROJECT_REF>` from your Supabase project URL (`https://<ref>.supabase.co`).
- It will prompt for a **Supabase personal access token** (create one at Supabase → Account →
  Access Tokens). Start with `--read-only` so it can *inspect* safely; drop `--read-only` later only
  when you want it to apply migrations/indexes.
- Restart Claude Code so the server connects.

**B. Paste this prompt into Claude Code on the Mac:**
> Read `docs/users-scaling-security.md`, `docs/security-rls-checklist.md`, and
> `docs/migrations/2026-06-11-rls-audit.sql`. Using the Supabase MCP, (1) run the RLS audit and report
> which tables have RLS enabled and what policies exist; (2) verify `arm_logs` returns zero rows as the
> anon role; (3) check whether the indexes in §2 exist and create any missing ones; (4) tell me exactly
> what (if anything) is misconfigured before I get real users. Don't change anything destructive without
> showing me the plan first.

**C. At App Store launch:** set `APP_STORE_URL` in `lib/appStore.ts` to the real link and redeploy —
the landing's badge + "coming soon" section auto-flip to live download mode.

---

## 6. iOS BUILD — what needs a resubmit, what doesn't
`capacitor.config.ts` uses `webDir: 'out'` with **no `server.url`**, so the iOS app **bundles the
static build inside the app**. Consequence — two change types:

- **Supabase / database changes** (RLS, indexes, Pro upgrade, data) → apply to the **already-installed
  app instantly**. No rebuild, no App Store resubmit. *Most of §1–4 is here.* Do these anytime.
- **App code changes** (anything in `app/dashboard`, `app/log`, `lib/readiness.ts`, UI, etc.) → are
  baked into the bundle, so they require a full rebuild + Apple review:
  ```bash
  npm run build      # rebuild static export → out/
  npm run cap:sync   # copy out/ into the iOS project
  npm run cap:open   # Xcode → Archive → upload to App Store Connect → wait for review
  ```
  **Xcode is Mac-only**, so app rebuilds/resubmits happen on the Mac.
- The marketing **landing page is web-only** — the native app redirects past it to login/dashboard
  (`app/page.tsx`), so landing changes never need an app resubmit.
- **Pending in the app:** the em-dash cleanup in `lib/readiness.ts` is bundled, so it only reaches iOS
  users on the next resubmit (web already has it). Batch it with the next app update.
- **Skip-resubmit option for web-code tweaks:** Capacitor live-update services (Capgo, Ionic Appflow)
  push JS/HTML/CSS to installed apps without review, allowed by Apple for non-core changes. Optional.

---

### TL;DR
Architecture scales fine. Three things before real users: **(1) verify RLS on the live DB** (run the
audit on your Mac), **(2) add the indexes in §2**, **(3) compress the hero screenshot.** Go **Supabase
Pro** when people use it daily (mainly for backups). **DB changes are instant (no resubmit); app *code*
changes need `build → cap:sync → Xcode → review` on the Mac.** Connect the Mac's Claude Code to Supabase
via the MCP and hand it the prompt in §5 to do the DB work I can't reach from here.
