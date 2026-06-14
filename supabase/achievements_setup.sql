-- GameQuest — достижения игрока
-- Хранит карту разблокированных достижений { "achievement_id": timestamp_ms }.
-- Нужно, чтобы достижения сохранялись между устройствами и корректно
-- отображались на профиле другого игрока.
alter table public.profiles
  add column if not exists achievements jsonb not null default '{}'::jsonb;
