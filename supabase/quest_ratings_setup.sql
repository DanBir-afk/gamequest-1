-- ============================================================
-- GameQuest — рейтинги квестов (оценки 1–5 от игроков)
-- Запусти в Supabase: Dashboard → SQL Editor → New query → Run
-- ============================================================

create table if not exists public.quest_ratings (
  quest_id    text not null,
  user_id     uuid not null references auth.users(id) on delete cascade,
  rating      smallint not null check (rating between 1 and 5),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  primary key (quest_id, user_id)
);

create index if not exists quest_ratings_quest_idx on public.quest_ratings (quest_id);

alter table public.quest_ratings enable row level security;

-- Все авторизованные видят оценки (для среднего рейтинга)
drop policy if exists "Quest ratings readable" on public.quest_ratings;
create policy "Quest ratings readable"
  on public.quest_ratings for select
  to authenticated
  using (true);

-- Писать и обновлять только свою оценку
drop policy if exists "Quest ratings upsert own" on public.quest_ratings;
create policy "Quest ratings upsert own"
  on public.quest_ratings for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Quest ratings update own" on public.quest_ratings;
create policy "Quest ratings update own"
  on public.quest_ratings for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
