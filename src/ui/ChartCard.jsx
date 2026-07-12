import Card from "./Card";
import { C } from "./theme";

// Titled container for charts and data panels. Replaces the old "panel div +
// SectionTitle" pattern so every chart shares one header treatment.
//   title    — section heading (uppercase micro-label with an accent tick)
//   right     — optional node rendered on the header's trailing side (e.g. a total)
//   dir       — set "ltr" for charts that must not mirror under RTL
export default function ChartCard({ title, right, children, dir, style }) {
  return (
    <Card dir={dir} style={style}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 3, height: 14, background: C.accent, borderRadius: 2 }} />
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              color: C.textDim,
            }}
          >
            {title}
          </span>
        </div>
        {right}
      </div>
      {children}
    </Card>
  );
}
