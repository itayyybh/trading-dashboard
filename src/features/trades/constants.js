// Design tokens for the whole app. Every component reads colors from `C`, so
// enriching this palette upgrades the entire UI at once.
//
// The palette separates two roles that used to share one color:
//   • BRAND (indigo)  — interactive/brand: buttons, focus, selection, active tabs.
//   • SEMANTIC (green/red/amber) — data meaning: P&L up, P&L down, warnings.
// This is the senior "brand ≠ data" split: a profit is green because it's a
// profit, not because it's the brand color.
//
// Back-compat: `accent*` historically meant BOTH brand and "positive". It now
// resolves to the semantic positive (green) so every existing P&L call site
// (charts, tables, calendar) stays correct untouched; interactive sites were
// migrated to `brand*`.
export const C = {
  // Surfaces — a deeper, cooler, deliberately-stepped elevation ramp:
  // canvas → inset → panel → raised. Even contrast between steps reads as
  // hierarchy instead of murk.
  bg: "#0a0d15", // app canvas (mirrored in index.css to avoid a mount flash)
  bgElevated: "#0e1119", // inputs / inset wells sitting on a panel
  panel: "#12151f", // default card surface
  panel2: "#1a1e2b", // hover / raised surface
  border: "#262b3d", // default hairline border
  borderSoft: "#1b2030", // quieter divider

  // Brand accent — a refined indigo/periwinkle. Interactive, selection, focus,
  // brand marks. Never used to encode data meaning.
  brand: "#818cf8",
  brandDim: "#818cf82e",
  brandSoft: "#818cf814",

  // Semantic P&L colors.
  pos: "#34d399", // profit / up
  posDim: "#34d39926",
  posSoft: "#34d39914",
  red: "#f2646f", // loss / down
  redDim: "#f2646f22",
  gold: "#eab35a", // warning / neutral-caution
  goldDim: "#eab35a20",

  // Back-compat aliases → semantic positive (green). Keeps P&L sites correct.
  accent: "#34d399",
  accentDim: "#34d39926",
  accentSoft: "#34d39914",

  // Text ramp — brighter labels than before so 11px uppercase micro-copy clears
  // the 4.5:1 contrast bar on the dark canvas.
  text: "#e8edf5", // primary
  textDim: "#9fb0c9", // secondary
  muted: "#7c8aa3", // labels / tertiary

  // Chart series (kept distinct: green primary, indigo secondary).
  p1: "#34d399",
  p2: "#818cf8",

  // Semantic aliases (readability at call sites).
  warn: "#eab35a",
  neg: "#f2646f",
};

export const ASSET_COLORS = { MGC: C.gold, MES: "#60a5fa", MNQ: "#c084fc", MCL: "#fb923c" };
