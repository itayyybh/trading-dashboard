import { useState } from "react";
import Card from "./Card";
import { C, monoText, label as labelStyle, shadow } from "./theme";

// Premium KPI tile. Tone is encoded by the value color plus a small leading dot
// beside the label — no colored side-rail (that reads as decoration). A subtle
// hover lift makes the grid feel alive without motion for its own sake.
//   accent — the value/dot color (defaults to primary text)
//   sub    — small caption under the value
export default function MetricCard({ label, value, sub, accent = C.text }) {
  const [hover, setHover] = useState(false);

  return (
    <Card
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: "15px 18px",
        borderColor: hover ? C.panel2 : C.border,
        boxShadow: hover ? shadow.cardHover : shadow.card,
        transform: hover ? "translateY(-1px)" : "none",
        transition: "border-color 150ms, box-shadow 150ms, transform 150ms cubic-bezier(0.4,0,0.2,1)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 11 }}>
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: 999,
            background: accent,
            boxShadow: `0 0 0 3px ${accent}22`,
            flexShrink: 0,
          }}
        />
        <span style={labelStyle}>{label}</span>
      </div>
      <div style={{ ...monoText, fontSize: 26, fontWeight: 700, color: accent, lineHeight: 1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, color: C.muted, marginTop: 8 }}>{sub}</div>}
    </Card>
  );
}
