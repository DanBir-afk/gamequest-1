-- Co-op race mode: who finished first
-- Run after coop_quests_setup.sql

alter table public.coop_quest_invites
  add column if not exists winner_id uuid references auth.users(id),
  add column if not exists winner_correct int,
  add column if not exists winner_total int;
