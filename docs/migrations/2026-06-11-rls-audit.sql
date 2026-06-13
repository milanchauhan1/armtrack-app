-- RLS AUDIT — read-only. Run the two SELECTs in the Supabase SQL editor to SEE
-- your current security state before changing anything. Nothing here modifies data.

-- 1. Which public tables have RLS enabled? (rls_enabled should be TRUE for every
--    table that holds user data: profiles, arm_logs, teams, team_members, follows)
select c.relname as table_name, c.relrowsecurity as rls_enabled
from pg_class c
where c.relnamespace = 'public'::regnamespace and c.relkind = 'r'
order by c.relname;

-- 2. What policies exist, and what do they allow?
select tablename, policyname, cmd as applies_to, qual as using_condition, with_check
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

-- ───────────────────────────────────────────────────────────────────────────
-- FIX TEMPLATES — only if query #1 shows a table with rls_enabled = FALSE.
-- These are COMMENTED OUT on purpose. Read each one, confirm the column names
-- match your schema, then uncomment and run ONE table at a time, testing the app
-- after each (especially the coach dashboard, which reads players' logs/profiles).
-- Do NOT run these blindly on a working database.
-- ───────────────────────────────────────────────────────────────────────────

-- arm_logs — the most important (minors' health data). A player owns their logs;
-- a coach may read logs of players on a team they own; nobody else (incl. anon).
--
-- alter table arm_logs enable row level security;
-- drop policy if exists arm_logs_self on arm_logs;
-- create policy arm_logs_self on arm_logs
--   for all using (user_id = auth.uid()) with check (user_id = auth.uid());
-- drop policy if exists arm_logs_coach_read on arm_logs;
-- create policy arm_logs_coach_read on arm_logs for select using (
--   exists (
--     select 1 from team_members tm
--     join teams t on t.id = tm.team_id
--     where tm.player_id = arm_logs.user_id and t.coach_id = auth.uid()
--   )
-- );

-- profiles — a user manages their own row; a coach may read their team players'
-- rows; players may read the coach of a team they belong to (for the join screen).
-- NOTE: public profile reads go through the `public_profiles` view, NOT this table.
--
-- alter table profiles enable row level security;
-- drop policy if exists profiles_self on profiles;
-- create policy profiles_self on profiles
--   for all using (id = auth.uid()) with check (id = auth.uid());
-- drop policy if exists profiles_coach_read on profiles;
-- create policy profiles_coach_read on profiles for select using (
--   exists (
--     select 1 from team_members tm
--     join teams t on t.id = tm.team_id
--     where tm.player_id = profiles.id and t.coach_id = auth.uid()
--   )
-- );

-- The cleanest path if anything is off: open the Supabase dashboard WITH the Mac's
-- Claude Code (it can see the policies) and reconcile table-by-table against how the
-- app actually queries. See docs/security-rls-checklist.md.
