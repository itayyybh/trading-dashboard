import { C, radius, font } from "./theme";

// Small status pill. `tone` picks the color; `mono` renders the label with the
// tabular numeric font (handy for +$ values inside tables).
const TONES = {
  neutral: { bg: C.panel2, fg: C.textDim, bd: C.border },
  accent: { bg: C.accentDim, fg: C.accent, bd: "transparent" },
  pos: { bg: C.accentDim, fg: C.accent, bd: "transparent" },
  neg: { bg: C.redDim, fg: C.red, bd: "transparent" },
  gold: { bg: C.goldDim, fg: C.gold, bd: "transparent" },
};

export default function Badge({ children, tone = "neutral", mono = false, style }) {
  const c = TONES[tone] ?? TONES.neutral;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 9px",
        borderRadius: radius.pill,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 0.3,
        background: c.bg,
        color: c.fg,
        border: `1px solid ${c.bd}`,
        fontFamily: mono ? font.mono : "inherit",
        ...style,
      }}
    >
      {children}
    </span>
  );
}
