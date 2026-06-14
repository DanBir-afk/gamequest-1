-- Together co-op: shared question progress and answers
-- Run after coop_quests_setup.sql

alter table public.coop_quest_invites
  add column if not exists together_q_idx int not null default 0,
  add column if not exists together_correct int not null default 0,
  add column if not exists together_pick jsonb;
