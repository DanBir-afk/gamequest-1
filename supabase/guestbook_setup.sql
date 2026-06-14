-- ============================================================
-- GameQuest — гостевая книга (стена профиля) + просмотр друзей
-- Запусти в Supabase: Dashboard → SQL Editor → New query → Run
-- ============================================================

-- 1) Разрешить видеть ПОДТВЕРЖДЁННЫЕ дружбы любого пользователя
--    (нужно, чтобы показывать список друзей в профиле другого игрока).
--    Заявки (pending) остаются приватными — их видят только участники.
drop policy if exists "View accepted friendships" on public.friendships;
create policy "View accepted friendships"
  on public.friendships for select
  to authenticated
  using (status = 'accepted');

-- 2) Гостевая книга: сообщения на стене конкретного профиля
create table if not exists public.guestbook (
  id            uuid primary key default gen_random_uuid(),
  profile_id    uuid not null references auth.users(id) on delete cascade, -- чья стена
  author_id     uuid not null references auth.users(id) on delete cascade, -- кто написал
  author_name   text not null,
  author_avatar text,
  text          text not null,
  likes         int  not null default 0,
  liked_by      jsonb not null default '[]'::jsonb,
  created_at    timestamptz not null default now()
);

create index if not exists guestbook_profile_idx on public.guestbook (profile_id, created_at desc);

alter table public.guestbook enable row level security;

-- Читать стену может любой авторизованный пользователь
drop policy if exists "Guestbook readable" on public.guestbook;
create policy "Guestbook readable"
  on public.guestbook for select
  to authenticated
  using (true);

-- Писать можно только от своего имени
drop policy if exists "Guestbook insert" on public.guestbook;
create policy "Guestbook insert"
  on public.guestbook for insert
  to authenticated
  with check (auth.uid() = author_id);

-- Обновлять (лайки) может любой авторизованный пользователь
drop policy if exists "Guestbook update" on public.guestbook;
create policy "Guestbook update"
  on public.guestbook for update
  to authenticated
  using (true);

-- Удалять сообщение может автор или владелец стены
drop policy if exists "Guestbook delete" on public.guestbook;
create policy "Guestbook delete"
  on public.guestbook for delete
  to authenticated
  using (auth.uid() = author_id or auth.uid() = profile_id);

-- 3) (Опционально) Realtime для мгновенного появления сообщений
alter publication supabase_realtime add table public.guestbook;
