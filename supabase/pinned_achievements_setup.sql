-- ============================================================
-- GameQuest — закреплённые достижения в профиле
-- Запусти в Supabase: Dashboard → SQL Editor → New query → Run
-- ============================================================

alter table public.profiles add column if not exists pinned_achievements jsonb default '[]'::jsonb;
