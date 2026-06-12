-- Follow graph — run once in the Supabase SQL editor. Idempotent.
-- Asymmetric follow (like Twitter/IG): A follows B, no approval. Public graph.

create table if not exists follows (
  follower_id  uuid not null references auth.users(id) on delete cascade,
  following_id uuid not null references auth.users(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (follower_id, following_id),
  constraint follows_no_self check (follower_id <> following_id)
);

create index if not exists follows_following_idx on follows (following_id);
create index if not exists follows_follower_idx  on follows (follower_id);

alter table follows enable row level security;

-- The follow graph is public, so counts and follow-state are readable by anyone.
drop policy if exists follows_select on follows;
create policy follows_select on follows
  for select using (true);

-- You may only create follows where YOU are the follower.
drop policy if exists follows_insert on follows;
create policy follows_insert on follows
  for insert with check (follower_id = auth.uid());

-- You may only remove your OWN follows.
drop policy if exists follows_delete on follows;
create policy follows_delete on follows
  for delete using (follower_id = auth.uid());
