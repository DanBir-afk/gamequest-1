-- Migration: add coop_type to existing coop_quest_invites table
alter table public.coop_quest_invites
  add column if not exists coop_type text not null default 'together';

alter table public.coop_quest_invites
  drop constraint if exists coop_quest_invites_coop_type_check;

alter table public.coop_quest_invites
  add constraint coop_quest_invites_coop_type_check
  check (coop_type in ('race', 'together'));
