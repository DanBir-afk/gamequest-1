-- ============================================================
-- GameQuest — хранение настроек профиля в аккаунте
-- Запусти в Supabase: Dashboard → SQL Editor → New query → Run
-- ============================================================

-- Добавляем колонки настроек в таблицу профилей (если их ещё нет)
alter table public.profiles add column if not exists bio text;
alter table public.profiles add column if not exists avatar text;
alter table public.profiles add column if not exists banner text;
alter table public.profiles add column if not exists favorite_games jsonb;
alter table public.profiles add column if not exists social_links jsonb default '{}'::jsonb;
alter table public.profiles add column if not exists pinned_achievements jsonb default '[]'::jsonb;

-- (политики чтения/записи профиля уже заданы в friends_setup.sql)
