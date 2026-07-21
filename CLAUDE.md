# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a multi-tenant React + Vite SaaS app for trading journal management. Users authenticate via Supabase, manage multiple trading portfolios, import trades from CSV files (with broker-specific parsing), and view analytics on a dashboard powered by Recharts.

**Stack:** React 19 + Vite, Supabase (auth + RLS), React Router, Recharts, PapaParse (CSV), XLSX (Excel), i18n (custom Context-based system)

**Database:** Supabase Postgres with RLS (multi-tenancy via portfolio ownership), tables: `users`, `portfolios`, `trades`, `import_batches`, `mapping_templates`

## Development Commands

**Start dev server:** `npm run dev` (runs Vite on port 5173, watch-reloading)

**Build for production:** `npm run build` (creates dist/ directory)

**Preview production build locally:** `npm run preview` (serves dist/ directory on port 5173)

**Lint code:** `npm lint` (ESLint, no auto-fix by default; add `--fix` to auto-correct)

**Environment:** Copy `.env.local.example` to `.env.local` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. The app uses Vite's `import.meta.env.VITE_*` pattern for env vars.

## Architecture & Key Patterns

### Directory Structure

```
src/
├── features/               # Feature modules (auth, trades, portfolios, csvImport, shared)
│   ├── auth/               # Authentication (Supabase-driven)
│   ├── trades/             # Dashboard, trade log, trade stats/charts
│   │   ├── api/            # tradesApi.js (Supabase queries + toDisplayTrade normalization)
│   │   ├── components/     # Chart components (WinLossPie, EquityCurveChart, etc.)
│   │   ├── Dashboard.jsx   # Main dashboard page
│   │   ├── stats.js        # Trade statistics (win rate, avg PnL, etc.)
│   │   ├── format.js       # Number/date formatting utilities
│   │   └── constants.js    # Trade-related constants (field names, etc.)
│   ├── portfolios/         # Portfolio management (create, list, delete)
│   ├── csvImport/          # Multi-file CSV import flow with broker detection
│   │   ├── components/     # UI steps (SelectStep, MappingStep, ReviewStep, DoneStep)
│   │   ├── parsers/        # Broker-specific CSV parsers (genericMapping, etc.)
│   │   ├── importApi.js    # Inserts trades into Supabase via import_batches
│   │   ├── applyMapping.js # Applies user column mapping to CSV rows
│   │   ├── parseCsv.js     # PapaParse wrapper + preview logic
│   │   └── hashFile.js     # File deduplication via content hashing
│   └── shared/             # Shared components (LocaleToggle, etc.)
├── lib/
│   ├── supabaseClient.js   # Supabase client (createClient with env vars)
│   └── i18n/               # Locale context (LocaleContext.jsx, translations)
├── ui/                     # Reusable UI components (Button, Card, AppShell, Badge, MetricCard, theme.js)
└── App.jsx                 # Router setup (sign-in → sign-up → dashboard)
```

### Core Data Flows

**Authentication & Multi-Tenancy:**
- `ProtectedRoute.jsx` checks `useSession()` (calls Supabase auth state)
- Session includes `user.id` and active portfolio selection
- Supabase RLS policies ensure users see only their portfolios and trades
- Portfolio switching happens in `PortfolioTabs.jsx`

**Trade Data Loading:**
1. User selects a portfolio
2. `Dashboard.jsx` calls `tradesApi.getTrades(portfolioId)`
3. `tradesApi.js` queries Supabase and normalizes rows via `toDisplayTrade()` — maps Supabase column names (`trade_date`, `entry_time`, etc.) to display shape (`date`, `entry`, etc.)
4. Display shape is shared with stats.js and all chart components; the `raw` field holds editable fields
5. Mutations (edit/manual log) use `updateTrade()` or `logManualTrade()` and accept already-normalized fields

**CSV Import Pipeline:**
1. `ImportFlow.jsx` manages a multi-step flow: select → (mapping) → review → done
2. Files are batched; broker detection (`detectParser()`) auto-imports recognized files
3. Unrecognized files enter `MappingStep.jsx` (user maps columns)
4. Mapped rows are validated and previewed, then `importTrades()` inserts a batch into Supabase
5. Duplicate detection uses file hashing (`hashFile.js`) to skip re-imports of the same file
6. Trade rows are normalized (field name conversion, type coercion) before insertion

**Localization:**
- `LocaleContext.jsx` provides a `useLocale()` hook that returns `{ t(key), locale, setLocale }`
- `t()` function looks up keys in JSON translation files (English, Hebrew, etc.)
- No setup needed; just call `useLocale()` in any component

### Important Architectural Decisions

**API Normalization (tradesApi.js):**
The `toDisplayTrade()` function is the single point where Supabase rows are translated to the display shape. This keeps stats.js, charts, and the trade log decoupled from Supabase column names. If Supabase schema changes, only this one function needs updating.

**Import Batches:**
Trade imports are grouped into batches (stored in `import_batch_id`) so duplicate files and import history can be tracked. The batch includes metadata (file name, broker, source) for audit trails.

**Broker Parser Registry:**
When `src/features/csvImport/parsers/index.js` is imported, broker-specific parsers self-register via `createGenericMappingAdapter()`. New brokers are added by creating a new parser module and registering it in that index.

**Recharts Charts:**
All charts in `src/features/trades/components/` accept a normalized trades array and compute aggregations via stats.js. Charts are stateless — filtering/grouping happens upstream in Dashboard.jsx.

## Common Patterns

**Controlled Components:**
Form inputs in `LogTradeModal.jsx` and `MappingStep.jsx` use `useState` with onChange handlers — no useForm library.

**Error Handling:**
Supabase errors are caught and re-thrown; UI components display errors in `error` state with a message. No global error boundary is in place; add one if needed.

**Async Loading:**
Components use `useState(false)` for `pending` flag and `try/catch` in event handlers. No dedicated state-management lib; context providers are used for session and locale.

**Component Composition:**
UI components in `src/ui/` are styled inline with className patterns (e.g., `dash-input` applied by hooks). Theme.js exports color/spacing constants.

## Testing & Verification

No test suite is set up. Before adding tests, clarify the testing strategy (Jest + React Testing Library vs. Vitest vs. E2E via Playwright) and update this file.

## Known Limitations & Phase 5 Backlog

- No pagination on trade lists (may be needed for large portfolios)
- CSV import does not support xlsx files natively (XLSX lib is installed but not wired)
- No duplicate-import detection beyond file hashing (same data from different files is not flagged)
- Stripe billing is not implemented
- Design is functional but not visually refined (visual design upgrade is deferred for Phase 6)

## Performance Considerations

- Recharts is optimized for datasets up to ~10k trades (MAX_ROWS in ImportFlow.jsx)
- Large CSV imports are limited to 5MB files and 10k rows per file
- Vite optimizes Recharts dependency for HMR; no special build tuning needed
- RLS on Supabase should handle multi-tenant query isolation; monitor N+1 queries if performance degrades

## Deployment

The app is deployed to Vercel. Environment variables are set in Vercel's UI (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY). Build output is dist/, configured in vite.config.js.
