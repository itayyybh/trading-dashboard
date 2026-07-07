-- Portfolios: one row per user-created portfolio container.
-- Run this once in the Supabase SQL Editor (Dashboard -> SQL Editor -> New query).

create table if not exists public.portfolios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

alter table public.portfolios enable row level security;

-- Owner-only access. user_id is server-derived (DEFAULT auth.uid()) and re-checked
-- here so a client can never read/write another user's rows even if it tried to
-- pass a different user_id explicitly.
create policy "portfolios_select_own"
  on public.portfolios for select
  using (user_id = auth.uid());

create policy "portfolios_insert_own"
  on public.portfolios for insert
  with check (user_id = auth.uid());

create policy "portfolios_update_own"
  on public.portfolios for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "portfolios_delete_own"
  on public.portfolios for delete
  using (user_id = auth.uid());
