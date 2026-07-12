-- Manual trade entry + multi-file CSV import support. Run once in the
-- Supabase SQL Editor, after 0001_portfolios.sql and 0002_trades_import.sql.
-- Safe to re-run: columns/index use "if not exists" guards.

alter table public.trades
  add column if not exists source text not null default 'csv_upload' check (source in ('manual', 'csv_upload')),
  add column if not exists source_file text;

alter table public.import_batches
  add column if not exists file_hash text;

-- Enforces "the same file can't be imported twice into the same portfolio"
-- at the database level (the client does a friendlier pre-check first, but
-- this is what actually prevents it, including races between two tabs).
create unique index if not exists import_batches_unique_file_per_portfolio
  on public.import_batches (portfolio_id, file_hash)
  where file_hash is not null;
