// Single source of truth for design tokens consumed by the src/ui primitives.
// Colors live in the existing constants file (so older components keep working);
// this module re-exports them and adds the rest of the system.
import { C, ASSET_COLORS } from "../features/trades/constants";

export { C, ASSET_COLORS };

export const font = {
  sans: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
  // Numbers use a monospace with tabular figures so digits align in columns.
  mono: "'JetBrains Mono', 'SF Mono', ui-monospace, 'Menlo', monospace",
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
};

// Spacing scale (multiples of 4) — use for consistent rhythm.
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

export const shadow = {
  // Cards: a hairline top highlight (lifts the surface) + soft ambient drop.
  card: "inset 0 1px 0 rgba(255,255,255,0.04), 0 10px 28px -16px rgba(0,0,0,0.75)",
  cardHover: "inset 0 1px 0 rgba(255,255,255,0.07), 0 20px 44px -20px rgba(0,0,0,0.85)",
  // Floating layers (modals, dropdowns).
  overlay: "0 28px 64px -20px rgba(0,0,0,0.85)",
  // Focus ring for inputs — a soft brand halo (paired with a solid border).
  focus: "0 0 0 3px rgba(129,140,248,0.28)",
};

// Shared transition for interactive polish.
export const transition = "150ms cubic-bezier(0.4, 0, 0.2, 1)";

// Convenience style objects reused across components.
export const monoText = {
  fontFamily: font.mono,
  fontVariantNumeric: "tabular-nums",
  letterSpacing: "-0.02em",
};

export const label = {
  fontSize: 11,
  letterSpacing: 1.4,
  textTransform: "uppercase",
  color: C.muted,
  fontWeight: 600,
};
