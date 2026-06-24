-- FIX: coach onboarding silently failed to create a team because the app inserts
-- a `sport` value into `teams` (and the coach dashboard selects it), but the
-- `teams` table never had a `sport` column. PostgREST rejected the insert with
-- "Could not find the 'sport' column of 'teams'", leaving the coach with no team
-- and the misleading "Complete onboarding to create your team" empty state.
--
-- Run this once in the Supabase SQL editor. Safe / idempotent.

alter table public.teams add column if not exists sport text;
