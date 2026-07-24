-- Portfolio metadata + lifecycle. Run once in the Supabase SQL Editor, after
-- 0003_manual_and_source_tracking.sql. Safe to re-run: every column uses
-- "if not exists" and is nullable / defaulted so existing rows are untouched.
--
-- This turns a portfolio from a bare label into a real trading account:
--   • asset_class          — what the account mainly trades (optional)
--   • preferred_platforms  — default import sources (parser ids); a HINT only,
--                            broker auto-detection is unaffected
--   • description          — free-text note (optional)
--   • archived_at          — null = active, set = archived (hidden, not deleted)
--   • deleted_at           — null = live, set = in "Recently Deleted" (soft delete)
--
-- No RLS changes: the existing owner-only policies already cover new columns.

alter table public.portfolios
  add column if not exists asset_class         text,
  add column if not exists preferred_platforms text[] not null default '{}',
  add column if not exists description         text,
  add column if not exists archived_at         timestamptz,
  add column if not exists deleted_at          timestamptz;

-- The app lists live portfolios constantly (filtering deleted_at is null); a
-- partial index keeps that fast and lets the trash grow without cost.
create index if not exists portfolios_user_live_idx
  on public.portfolios (user_id, created_at)
  where deleted_at is null;
