import Card from "./Card";
import { C, monoText, label as labelStyle } from "./theme";

// Premium KPI tile. The big number uses tabular mono; a thin accent rail on the
// left encodes tone (green/red/gold) at a glance without shouting.
//   accent — the value/rail color (defaults to primary text)
//   sub    — small caption under the value
export default function MetricCard({ label, value, sub, accent = C.text }) {
  return (
    <Card padding={0} style={{ position: "relative", overflow: "hidden" }}>
      {/* tone rail */}
      <div
        style={{
          position: "absolute",
          insetInlineStart: 0,
          top: 0,
          bottom: 0,
          width: 3,
          background: accent,
          opacity: 0.9,
        }}
      />
      <div style={{ padding: "16px 18px 16px 20px" }}>
        <div style={{ ...labelStyle, marginBottom: 10 }}>{label}</div>
        <div style={{ ...monoText, fontSize: 26, fontWeight: 700, color: accent, lineHeight: 1 }}>
          {value}
        </div>
        {sub && <div style={{ fontSize: 12, color: C.muted, marginTop: 8 }}>{sub}</div>}
      </div>
    </Card>
  );
}
