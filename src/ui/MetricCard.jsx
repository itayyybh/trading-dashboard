import { C, monoText, type } from "./theme";

// A bare stat block — label + value + optional caption, no card chrome.
// KPI numbers read as typography directly on the page: size and weight
// (via `size`) carry importance, not a border or a colored dot.
//   size   — "hero" (the one number that matters most) | "default"
//   accent — the value's color (defaults to primary text)
export default function MetricCard({ label, value, sub, accent = C.text, size = "default" }) {
  const hero = size === "hero";

  return (
    <div>
      <div style={{ ...type.caption, marginBottom: hero ? 8 : 6 }}>{label}</div>
      <div style={{ ...monoText, fontSize: hero ? 40 : 22, fontWeight: 700, color: accent, lineHeight: 1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 12.5, color: C.muted, marginTop: 6 }}>{sub}</div>}
    </div>
  );
}
