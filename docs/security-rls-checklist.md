# ArmTrack Security / RLS Audit Checklist

*5-minute check in the Supabase dashboard before real users. Your users are minors and you store health-adjacent data (pain/soreness) — RLS is the wall that keeps one player's data from being readable by anyone with the public anon key.*

> **The anon key is public by design** (it ships in the web app). Your security is RLS, not key secrecy. So: every table that holds user data MUST have RLS **enabled** AND have policies that scope access to the right people.

## Step 1 — RLS is ENABLED on every table
Supabase → **Table Editor** → click each table → confirm it shows **"RLS enabled"** (or Database → Tables shows a shield). If any is OFF, the anon key can read/write the whole table.

- [ ] `profiles` — RLS enabled
- [ ] `arm_logs` — RLS enabled ← **most important** (the health data)
- [ ] `teams` — RLS enabled
- [ ] `team_members` — RLS enabled

A table with **RLS enabled but zero policies** = nobody can access it (safe but the app breaks). A table with **RLS disabled** = everybody can access everything (the real danger). You want enabled **with** correct policies.

## Step 2 — Policies do the right thing
Supabase → **Authentication → Policies**. For each table, confirm roughly these rules exist:

### `arm_logs` (health data — be strict)
- [ ] A user can **insert / select / update / delete their OWN logs** — policy uses `user_id = auth.uid()`.
- [ ] A coach can **select** logs for **players on their team** only (not all players).
- [ ] **No `anon` / public read policy.** A logged-out visitor must get *nothing* from `arm_logs`. (The public profile reads the `public_profiles` view, never this table.)

### `profiles`
- [ ] A user can **select / update their OWN row** — `id = auth.uid()`.
- [ ] A coach can **select** profiles of **their team's players**.
- [ ] **No blanket `anon` read policy on the raw table.** Public profiles go through the `public_profiles` view (which exposes only safe columns). If you ever added a "profiles readable by anyone" policy, remove it — it would leak `injury_history` / `pain_zones`.

### `teams` / `team_members`
- [ ] A coach can manage (`insert/update/select`) their **own** team — scoped by `coach_id = auth.uid()`.
- [ ] A player can read the team(s) they belong to; joining inserts a `team_members` row for themselves.
- [ ] No anon write access.

### `public_profiles` (the view from the migration)
- [ ] Exists, `security_invoker = off`, exposes only the safe columns (no `injury_history` / `pain_zones`), and only `visibility in ('public','unlisted')`. `grant select ... to anon, authenticated`. This one is *supposed* to be anon-readable — that's the whole point.

## Step 3 — Fast sanity test (optional but reassuring)
In the SQL editor, run as the anon role to confirm health data is NOT exposed:
```sql
-- Should return ZERO rows (anon must not read raw logs)
set role anon;
select * from arm_logs limit 1;
reset role;
```
If that returns rows, `arm_logs` RLS is misconfigured — fix before launch.

## Step 4 — Secrets hygiene (already verified clean in the repo)
- [x] `.env.local` gitignored, never committed.
- [x] No `service_role` key in app code, no API keys in the repo.
- [ ] The **`service_role` key** lives only in the Supabase dashboard / server scripts — never paste it into the Next.js app or commit it.

---

**Bottom line:** the one check that matters most is **`arm_logs` has RLS on, scoped to owner + their coach, with no anon read.** Get that right and a leaked anon key can't expose a single kid's health data.
