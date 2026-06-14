-- ============================================================
-- GameQuest — XP and level columns on profiles
-- Run in Supabase: Dashboard → SQL Editor → New query → Run
-- ============================================================

alter table public.profiles add column if not exists xp integer not null default 0;
alter table public.profiles add column if not exists level integer not null default 0;

-- Optional: keep quests_completed in sync for rank badges
alter table public.profiles add column if not exists quests_completed integer not null default 0;
