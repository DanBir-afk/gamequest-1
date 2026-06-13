-- ============================================================
-- GameQuest — настройка системы друзей в Supabase
-- Запусти этот скрипт в Supabase: Dashboard → SQL Editor → New query → Run
-- ============================================================

-- 1) Профили должны быть доступны для чтения авторизованным пользователям
--    (нужно для поиска людей по имени)
alter table public.profiles enable row level security;

drop policy if exists "Profiles are viewable by authenticated users" on public.profiles;
create policy "Profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = user_id);

-- Ускоряем поиск по имени (регистронезависимо)
create index if not exists profiles_username_idx
  on public.profiles (lower(username));

-- 2) Таблица дружбы / заявок
create table if not exists public.friendships (
  id            uuid primary key default gen_random_uuid(),
  requester_id  uuid not null references auth.users(id) on delete cascade,
  addressee_id  uuid not null references auth.users(id) on delete cascade,
  status        text not null default 'pending' check (status in ('pending','accepted')),
  created_at    timestamptz not null default now(),
  constraint friendships_unique unique (requester_id, addressee_id),
  constraint friendships_no_self check (requester_id <> addressee_id)
);

create index if not exists friendships_requester_idx on public.friendships (requester_id);
create index if not exists friendships_addressee_idx on public.friendships (addressee_id);

alter table public.friendships enable row level security;

-- Видеть можно только свои связи (где ты отправитель или получатель)
drop policy if exists "View own friendships" on public.friendships;
create policy "View own friendships"
  on public.friendships for select
  to authenticated
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

-- Отправлять заявку можно только от своего имени
drop policy if exists "Send friend request" on public.friendships;
create policy "Send friend request"
  on public.friendships for insert
  to authenticated
  with check (auth.uid() = requester_id);

-- Принять / изменить заявку может любая из сторон
drop policy if exists "Respond to friendship" on public.friendships;
create policy "Respond to friendship"
  on public.friendships for update
  to authenticated
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

-- Удалить дружбу / заявку может любая из сторон
drop policy if exists "Delete friendship" on public.friendships;
create policy "Delete friendship"
  on public.friendships for delete
  to authenticated
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

-- 3) (Опционально) включить Realtime, чтобы заявки прилетали мгновенно
--    Dashboard → Database → Replication → добавить public.friendships
alter publication supabase_realtime add table public.friendships;
