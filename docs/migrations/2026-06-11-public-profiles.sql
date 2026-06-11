-- Public Player Profile — run once in the Supabase SQL editor.
-- Safe to re-run (idempotent guards). See:
--   docs/superpowers/specs/2026-06-11-public-player-profile-design.md

-- 1. New profile columns ------------------------------------------------------
alter table profiles
  add column if not exists username        text,
  add column if not exists bio             text,
  add column if not exists visibility      text not null default 'public',
  add column if not exists pr_velocity_mph integer,
  add column if not exists pr_pop_time_s   numeric(3,1),
  add column if not exists pr_sixty_time_s numeric(3,1);

-- 2. Unique, case-insensitive handle (NULL allowed = unclaimed) ---------------
create unique index if not exists profiles_username_lower_idx
  on profiles (lower(username));

-- 3. Constrain visibility values ---------------------------------------------
alter table profiles drop constraint if exists profiles_visibility_chk;
alter table profiles add constraint profiles_visibility_chk
  check (visibility in ('public','unlisted','private'));

-- 4. Column-safe public view --------------------------------------------------
-- Exposes ONLY non-sensitive columns (never injury_history / pain_zones) and
-- only non-private, claimed profiles. security_invoker = off means it runs with
-- the view owner's rights, so anonymous visitors can read it without a blanket
-- read policy on the profiles table.
create or replace view public_profiles
  with (security_invoker = off) as
  select id, username, first_name, position, level, throws, team_name, bio,
         visibility, pr_velocity_mph, pr_pop_time_s, pr_sixty_time_s
  from profiles
  where username is not null
    and visibility in ('public', 'unlisted');

grant select on public_profiles to anon, authenticated;

-- 5. (optional) seed a test handle on your own profile -----------------------
-- update profiles set username = 'testpitcher', visibility = 'public',
--   pr_velocity_mph = 82 where id = '<your-user-id>';

-- Note: the /profile editor updates the player's OWN profiles row, which is
-- already covered by the existing self-update RLS policy (used by onboarding).
-- No additional policy is needed for editing.
