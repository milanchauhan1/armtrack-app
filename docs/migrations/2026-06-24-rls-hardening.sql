-- RLS / security hardening — applied 2026-06-24 to the live project
-- (trjazxklaraausqtbwkg) via the Supabase SQL editor, after the pre-launch
-- audit (see docs/security-rls-checklist.md, docs/users-scaling-security.md).
--
-- Context: users are minors and we store self-reported arm-health data, so the
-- bar is "a leaked anon key exposes nothing." This file is the record of what
-- was run; it is idempotent enough to re-apply, but it already ran in prod.

-- ───────────────────────────────────────────────────────────────────────────
-- Finding 1 (CRITICAL): coach_messages team-broadcasts (player_id IS NULL) were
-- readable by anon AND by any signed-in user regardless of team. Scope reads to
-- the message's own recipient, or to members of that message's team only.
-- ───────────────────────────────────────────────────────────────────────────
drop policy if exists "Players view their messages" on public.coach_messages;
create policy "Players view their messages" on public.coach_messages
  for select to authenticated
  using (
    player_id = (select auth.uid())
    or (
      player_id is null
      and exists (
        select 1 from public.team_members tm
        where tm.team_id = coach_messages.team_id
          and tm.player_id = (select auth.uid())
      )
    )
  );

-- ───────────────────────────────────────────────────────────────────────────
-- Finding 2: follows social graph was readable by anon (USING (true), public).
-- Restrict to signed-in users.
-- ───────────────────────────────────────────────────────────────────────────
drop policy if exists follows_select on public.follows;
create policy follows_select on public.follows
  for select to authenticated using (true);

-- ───────────────────────────────────────────────────────────────────────────
-- Finding 3: coach_owns_player() is a SECURITY DEFINER helper meant only for use
-- inside RLS policies, but EXECUTE was granted to PUBLIC (so anon/authenticated
-- could call it directly via /rest/v1/rpc). Revoke from PUBLIC. RLS still works
-- (the policy system runs it regardless of caller EXECUTE).
-- NOTE: revoking from anon/authenticated alone is a no-op when the grant is to
-- PUBLIC — must revoke from PUBLIC.
-- ───────────────────────────────────────────────────────────────────────────
revoke execute on function public.coach_owns_player(uuid) from public;

-- ───────────────────────────────────────────────────────────────────────────
-- Finding 4: missing indexes (query perf + unindexed foreign keys).
-- team_members(team_id) is already covered by the composite unique
-- (team_id, player_id), so it is intentionally omitted.
-- ───────────────────────────────────────────────────────────────────────────
create index if not exists arm_logs_user_date_idx           on public.arm_logs (user_id, date desc);
create index if not exists team_members_player_idx          on public.team_members (player_id);
create index if not exists profiles_team_idx                on public.profiles (team_id);
create index if not exists teams_coach_idx                  on public.teams (coach_id);
create index if not exists coach_messages_team_idx          on public.coach_messages (team_id);
create index if not exists coach_recommendations_player_idx on public.coach_recommendations (player_id);

-- ───────────────────────────────────────────────────────────────────────────
-- Finding 6 (perf): wrap auth.uid() as (select auth.uid()) so RLS doesn't
-- re-evaluate it per row. Applied to the hottest table (arm_logs); the same
-- pattern can be applied to the other policies later.
-- ───────────────────────────────────────────────────────────────────────────
drop policy if exists "Users can manage their own logs" on public.arm_logs;
create policy "Users can manage their own logs" on public.arm_logs
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- ───────────────────────────────────────────────────────────────────────────
-- Finding 5 (NOT SQL — dashboard toggle): enable leaked-password protection at
-- Authentication → Sign In / Providers → Password → "Check against HaveIBeenPwned".
--
-- ACCEPTED BY DESIGN (left as-is):
--   * public_profiles view is SECURITY DEFINER — anon-readable, safe columns only
--     (no injury_history / pain_zones).
--   * waitlist INSERT WITH CHECK (true) — intentional open waitlist, no read policy.
--   * delete_my_account() executable by authenticated — intentional (account-deletion RPC).
-- ───────────────────────────────────────────────────────────────────────────

-- Verify anon sees no health data (run in SQL editor, which can set role):
--   set local role anon;
--   select count(*) from arm_logs;       -- expect 0
--   select count(*) from coach_messages; -- expect 0
--   reset role;
