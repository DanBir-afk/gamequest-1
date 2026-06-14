-- ============================================================
-- GameQuest — Co-op quest invites
-- Run in Supabase: Dashboard → SQL Editor → New query → Run
-- Then: Database → Replication → add public.coop_quest_invites
-- ============================================================

create table if not exists public.coop_quest_invites (
  id            uuid primary key default gen_random_uuid(),
  quest_id      text not null,
  difficulty    text not null default 'medium'
                check (difficulty in ('easy', 'medium', 'hard')),
  host_id       uuid not null references auth.users(id) on delete cascade,
  guest_id      uuid not null references auth.users(id) on delete cascade,
  status        text not null default 'pending'
                check (status in ('pending', 'accepted', 'declined', 'cancelled', 'started', 'completed')),
  coop_type     text not null default 'together'
                check (coop_type in ('race', 'together')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint coop_invites_no_self check (host_id <> guest_id)
);

create index if not exists coop_invites_host_idx on public.coop_quest_invites (host_id);
create index if not exists coop_invites_guest_idx on public.coop_quest_invites (guest_id);
create index if not exists coop_invites_status_idx on public.coop_quest_invites (status);

alter table public.coop_quest_invites enable row level security;

drop policy if exists "View own coop invites" on public.coop_quest_invites;
create policy "View own coop invites"
  on public.coop_quest_invites for select
  to authenticated
  using (auth.uid() = host_id or auth.uid() = guest_id);

drop policy if exists "Host sends coop invite" on public.coop_quest_invites;
create policy "Host sends coop invite"
  on public.coop_quest_invites for insert
  to authenticated
  with check (auth.uid() = host_id);

drop policy if exists "Update own coop invites" on public.coop_quest_invites;
create policy "Update own coop invites"
  on public.coop_quest_invites for update
  to authenticated
  using (auth.uid() = host_id or auth.uid() = guest_id);

-- Realtime (optional but recommended)
alter publication supabase_realtime add table public.coop_quest_invites;
