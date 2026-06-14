-- ============================================================
-- GameQuest — online presence (last_seen_at on profiles)
-- Run in Supabase: Dashboard → SQL Editor → New query → Run
-- ============================================================

alter table public.profiles
  add column if not exists last_seen_at timestamptz;

comment on column public.profiles.last_seen_at is
  'Updated by client heartbeat while user is active; used for online/offline status.';

create index if not exists profiles_last_seen_at_idx
  on public.profiles (last_seen_at desc nulls last);

-- Realtime so friends see presence updates instantly
-- (skip manually in Dashboard → Database → Replication if this errors: table already added)
alter publication supabase_realtime add table public.profiles;
