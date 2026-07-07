-- Trades + CSV import support. Run once in the Supabase SQL Editor, after 0001_portfolios.sql.
-- Safe to re-run: tables use "if not exists" and every policy is dropped
-- before being recreated (plain CREATE POLICY has no IF NOT EXISTS in Postgres).

-- Reusable per-broker column mapping, so a user doesn't remap the same
-- broker's export every time.
create table if not exists public.broker_mapping_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  broker_label text not null,
  column_mapping jsonb not null,
  created_at timestamptz not null default now()
);

-- One row per upload, for a lightweight audit trail (not the raw file itself).
create table if not exists public.import_batches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  portfolio_id uuid not null references public.portfolios(id) on delete cascade,
  mapping_template_id uuid references public.broker_mapping_templates(id) on delete set null,
  original_filename text,
  row_count int not null default 0,
  status text not null default 'success' check (status in ('success', 'partial', 'failed')),
  created_at timestamptz not null default now()
);

-- entry_time/exit_time are stored as plain text (not timestamptz) because
-- broker CSVs commonly export a bare time-of-day ("14:45") with no date
-- component, which timestamptz can't represent without inventing a date.
create table if not exists public.trades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  portfolio_id uuid not null references public.portfolios(id) on delete cascade,
  import_batch_id uuid references public.import_batches(id) on delete set null,
  trade_date date not null,
  entry_time text,
  exit_time text,
  direction text not null check (direction in ('long', 'short')),
  symbol text not null,
  quantity numeric,
  entry_price numeric,
  exit_price numeric,
  pnl numeric not null,
  fees numeric not null default 0,
  raw_row jsonb,
  created_at timestamptz not null default now()
);

alter table public.broker_mapping_templates enable row level security;
alter table public.import_batches enable row level security;
alter table public.trades enable row level security;

-- broker_mapping_templates: owner-only, same pattern as portfolios.
drop policy if exists "mapping_templates_select_own" on public.broker_mapping_templates;
create policy "mapping_templates_select_own"
  on public.broker_mapping_templates for select
  using (user_id = auth.uid());

drop policy if exists "mapping_templates_insert_own" on public.broker_mapping_templates;
create policy "mapping_templates_insert_own"
  on public.broker_mapping_templates for insert
  with check (user_id = auth.uid());

drop policy if exists "mapping_templates_delete_own" on public.broker_mapping_templates;
create policy "mapping_templates_delete_own"
  on public.broker_mapping_templates for delete
  using (user_id = auth.uid());

-- import_batches: owner-only AND the referenced portfolio must belong to the
-- same user, so a client can't attach an import batch to someone else's
-- portfolio even if it guessed the id.
drop policy if exists "import_batches_select_own" on public.import_batches;
create policy "import_batches_select_own"
  on public.import_batches for select
  using (user_id = auth.uid());

drop policy if exists "import_batches_insert_own" on public.import_batches;
create policy "import_batches_insert_own"
  on public.import_batches for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.portfolios p
      where p.id = portfolio_id and p.user_id = auth.uid()
    )
  );

-- trades: same pattern as import_batches - owner-only AND portfolio ownership
-- re-checked on every insert.
drop policy if exists "trades_select_own" on public.trades;
create policy "trades_select_own"
  on public.trades for select
  using (user_id = auth.uid());

drop policy if exists "trades_insert_own" on public.trades;
create policy "trades_insert_own"
  on public.trades for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.portfolios p
      where p.id = portfolio_id and p.user_id = auth.uid()
    )
  );

drop policy if exists "trades_delete_own" on public.trades;
create policy "trades_delete_own"
  on public.trades for delete
  using (user_id = auth.uid());
