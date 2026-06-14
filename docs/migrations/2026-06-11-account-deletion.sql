-- In-app account deletion — required by Apple App Store Guideline 5.1.1(v).
-- Run once in the Supabase SQL editor. The app calls this via supabase.rpc('delete_my_account').
--
-- A SECURITY DEFINER function runs with the owner's privileges, so it can remove
-- the caller's data AND their auth.users row. The caller is identified by auth.uid()
-- (read from their JWT), so a user can only ever delete THEMSELVES.

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;

  -- App data owned by this user
  delete from arm_logs     where user_id   = uid;
  delete from follows      where follower_id = uid or following_id = uid;
  delete from team_members where player_id = uid;
  delete from teams        where coach_id  = uid;
  delete from profiles     where id        = uid;

  -- Finally, the auth account itself
  delete from auth.users   where id        = uid;
end;
$$;

-- Only logged-in users may call it (and it only ever deletes the caller).
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

-- ───────────────────────────────────────────────────────────────────────────
-- TEST THIS BEFORE SUBMITTING. Create a throwaway account in the app, tap
-- "Delete account," then confirm in Supabase → Authentication → Users that the
-- user is gone. If you get a "permission denied for table users" error, your
-- project's postgres role can't delete from auth.users directly — use the Edge
-- Function fallback in docs/app-store-submission.md instead.
-- ───────────────────────────────────────────────────────────────────────────
