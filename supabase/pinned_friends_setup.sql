-- ============================================================
-- GameQuest — хранение закреплённых друзей в аккаунте
-- Запусти в Supabase: Dashboard → SQL Editor → New query → Run
-- ============================================================

-- Список id закреплённых друзей (массив user_id)
alter table public.profiles add column if not exists pinned_friends jsonb;

-- (политики чтения/записи профиля уже заданы в friends_setup.sql)
