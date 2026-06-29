-- HOTFIX 2026-06-28 — restore EXECUTE on coach_owns_player.
--
-- The 2026-06-24 hardening (Finding 3) revoked EXECUTE on coach_owns_player from
-- PUBLIC to satisfy a Supabase advisor. That was WRONG: the RLS SELECT policies
-- on `profiles` (profiles_coach_read) and `arm_logs` (arm_logs_coach_read) CALL
-- this function, and Postgres checks EXECUTE against the *calling* role
-- (authenticated / anon), not the function owner — SECURITY DEFINER only changes
-- what runs *inside* the function. With EXECUTE revoked, any signed-in user
-- reading/writing profiles or arm_logs hit:
--     ERROR: permission denied for function coach_owns_player
-- which broke onboarding completion (and dashboard/log reads) on the live app.
--
-- Fix: grant EXECUTE back to the app roles. The advisor warning
-- ("anon/authenticated can execute this SECURITY DEFINER function") is a FALSE
-- POSITIVE here — the function is required by RLS and only returns a boolean
-- derived from auth.uid(); it exposes no data. Accept the warning.

grant execute on function public.coach_owns_player(uuid) to authenticated, anon;
