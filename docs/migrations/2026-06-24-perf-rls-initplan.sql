-- Performance follow-up to the 2026-06-24 RLS hardening. APPLIED TO PROD
-- (trjazxklaraausqtbwkg) via the Supabase MCP after the performance advisor flagged
-- per-row auth.uid() re-evaluation on every non-arm_logs policy.
--
-- Change: wrap auth.uid() as (select auth.uid()) so Postgres evaluates it ONCE per
-- query instead of once per row. Access logic is IDENTICAL — each policy's
-- expression was read verbatim from pg_policies and only auth.uid() was changed.
-- Plus two missing foreign-key covering indexes. (arm_logs was already done in
-- 2026-06-24-rls-hardening.sql.)
--
-- Verified after apply: get_advisors(performance) shows zero auth_rls_initplan and
-- zero unindexed_foreign_keys findings. Remaining advisor notes are non-issues:
--   * unused_index — expected on a near-empty DB; clears once queries run.
--   * multiple_permissive_policies — the owner-OR-coach dual SELECT policies;
--     left as-is (correct + minor; consolidating is riskier than the gain here).

-- coach_messages
drop policy if exists "Coaches send messages" on public.coach_messages;
create policy "Coaches send messages" on public.coach_messages
  for all using ((select auth.uid()) = coach_id);

-- coach_recommendations
drop policy if exists "Coaches send recommendations" on public.coach_recommendations;
create policy "Coaches send recommendations" on public.coach_recommendations
  for all using ((select auth.uid()) = coach_id);

drop policy if exists "Players view their recommendations" on public.coach_recommendations;
create policy "Players view their recommendations" on public.coach_recommendations
  for select using ((select auth.uid()) = player_id);

-- follows
drop policy if exists follows_delete on public.follows;
create policy follows_delete on public.follows
  for delete using (follower_id = (select auth.uid()));

drop policy if exists follows_insert on public.follows;
create policy follows_insert on public.follows
  for insert with check (follower_id = (select auth.uid()));

-- profiles
drop policy if exists "Users can manage their own profile" on public.profiles;
create policy "Users can manage their own profile" on public.profiles
  for all
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- team_members
drop policy if exists "Coaches can manage members" on public.team_members;
create policy "Coaches can manage members" on public.team_members
  for all using (
    exists (
      select 1 from public.teams
      where teams.id = team_members.team_id
        and teams.coach_id = (select auth.uid())
    )
  );

drop policy if exists "Players can join teams" on public.team_members;
create policy "Players can join teams" on public.team_members
  for insert with check ((select auth.uid()) = player_id);

drop policy if exists "Players can view their team" on public.team_members;
create policy "Players can view their team" on public.team_members
  for select using ((select auth.uid()) = player_id);

-- teams
drop policy if exists "Coaches manage their teams" on public.teams;
create policy "Coaches manage their teams" on public.teams
  for all using ((select auth.uid()) = coach_id);

-- Missing foreign-key covering indexes
create index if not exists coach_messages_coach_idx on public.coach_messages (coach_id);
create index if not exists coach_recommendations_coach_idx on public.coach_recommendations (coach_id);
