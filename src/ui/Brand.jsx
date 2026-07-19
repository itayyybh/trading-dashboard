import { C, font } from "./theme";

// The DאSH wordmark. The Hebrew aleph (א) stands in for the "A" — a small,
// memorable nod to the app's built-in Hebrew support, rendered in the accent.
// `mark` draws a compact logo glyph (a rising bar motif) next to the word.
export default function Brand({ size = "md", showMark = true, showTagline = false }) {
  const scale = size === "sm" ? 0.85 : size === "lg" ? 1.25 : 1;
  const fontSize = 20 * scale;

  return (
    <div dir="ltr" style={{ display: "flex", alignItems: "center", gap: 10 * scale }}>
      {showMark && <Mark size={26 * scale} />}
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
        <div
          style={{
            fontSize,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: C.text,
            display: "flex",
            alignItems: "baseline",
          }}
        >
          D
          <span style={{ color: C.brand, fontFamily: font.mono, fontWeight: 700, margin: "0 0.02em" }}>א</span>
          SH
        </div>
        {showTagline && (
          <div style={{ fontSize: 10.5, color: C.muted, letterSpacing: 0.2, marginTop: 5 }}>
            trading performance insights
          </div>
        )}
      </div>
    </div>
  );
}

// A minimal "rising bars" glyph inside a rounded chip — reads as data/finance.
function Mark({ size = 26 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.28,
        background: `linear-gradient(160deg, ${C.panel2}, ${C.panel})`,
        border: `1px solid ${C.border}`,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        gap: size * 0.09,
        padding: size * 0.22,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
    >
      {[0.4, 0.7, 1].map((h, i) => (
        <span
          key={i}
          style={{
            width: size * 0.12,
            height: `${h * 100}%`,
            borderRadius: 2,
            background: i === 2 ? C.brand : C.muted,
          }}
        />
      ))}
    </div>
  );
}
