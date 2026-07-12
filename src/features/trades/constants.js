// Design tokens for the whole app. Every component reads colors from `C`, so
// enriching this palette upgrades the entire UI at once. Existing keys are kept
// (nothing that imports them breaks); new keys add depth, semantics and polish.
export const C = {
  // Surfaces — a layered dark stack: canvas → panel → raised.
  bg: "#0a0d14", // app canvas (mirrored in index.css to avoid a mount flash)
  bgElevated: "#0c1018", // inputs / inset wells sitting on a panel
  panel: "#10141f", // default card surface
  panel2: "#151a28", // hover / raised surface
  border: "#1e2535", // default hairline border
  borderSoft: "#171d2b", // quieter divider

  // Brand accent — a muted, institutional emerald (not neon), reserved for
  // positive/brand signals. Desaturated so it reads calm and premium on dark.
  accent: "#2aa77f",
  accentDim: "#2aa77f2e",
  accentSoft: "#2aa77f14",

  // Semantic P&L colors — softened away from the earlier neon set.
  red: "#e0565f",
  redDim: "#e0565f22",
  gold: "#c99a3a",
  goldDim: "#c99a3a20",

  // Text ramp.
  text: "#e6ebf2", // primary
  textDim: "#9aa7bd", // secondary
  muted: "#64748b", // labels / tertiary

  // Chart series.
  p1: "#2aa77f",
  p2: "#7986cb", // slightly desaturated indigo to match the calmer palette

  // Semantic aliases (readability at call sites).
  pos: "#2aa77f",
  neg: "#e0565f",
  warn: "#c99a3a",
};

export const ASSET_COLORS = { MGC: C.gold, MES: "#60a5fa", MNQ: "#c084fc", MCL: "#fb923c" };
