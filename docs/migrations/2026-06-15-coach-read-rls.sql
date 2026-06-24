-- FIX: coaches could read their team_members rows but NOT the linked players'
-- `profiles` or `arm_logs` — those tables only had a "self" RLS policy
-- (id/user_id = auth.uid()), so the coach dashboard saw a roster count but no
-- names, readiness, or logs. This makes the entire coach view non-functional.
--
-- Adds SELECT policies letting a coach read the profiles + arm_logs of players on
-- a team they own. Uses a SECURITY DEFINER helper so the membership lookup bypasses
-- RLS on team_members/teams (prevents policy recursion). Additive only — the
-- existing self-access policies are untouched.
--
-- Run once in the Supabase SQL editor.

create or replace function public.coach_owns_player(p_player uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from team_members tm
    join teams t on t.id = tm.team_id
    where tm.player_id = p_player
      and t.coach_id = auth.uid()
  );
$$;

-- profiles: a coach may read their team players' profile rows
drop policy if exists profiles_coach_read on public.profiles;
create policy profiles_coach_read on public.profiles
  for select
  using (public.coach_owns_player(id));

-- arm_logs: a coach may read their team players' logs
drop policy if exists arm_logs_coach_read on public.arm_logs;
create policy arm_logs_coach_read on public.arm_logs
  for select
  using (public.coach_owns_player(user_id));
