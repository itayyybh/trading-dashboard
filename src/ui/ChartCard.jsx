import { useState } from "react";
import Card from "./Card";
import { C } from "./theme";

// Titled container for charts and data panels. Replaces the old "panel div +
// SectionTitle" pattern so every chart shares one header treatment.
//   title            — section heading (uppercase micro-label with an accent tick)
//   right            — optional node rendered on the header's trailing side (e.g. a total)
//   dir              — set "ltr" for charts that must not mirror under RTL
//   collapsible      — when true, show a chevron that toggles the body
//   defaultCollapsed — start collapsed (only meaningful with collapsible)
export default function ChartCard({ title, right, children, dir, style, collapsible = false, defaultCollapsed = false }) {
  const [collapsed, setCollapsed] = useState(collapsible ? defaultCollapsed : false);

  return (
    <Card dir={dir} style={style}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: collapsed ? 0 : 16,
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
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {right}
          {collapsible && (
            <button
              type="button"
              onClick={() => setCollapsed((c) => !c)}
              aria-expanded={!collapsed}
              aria-label={title}
              style={{
                background: "transparent",
                border: `1px solid ${C.border}`,
                borderRadius: 6,
                color: C.textDim,
                cursor: "pointer",
                fontSize: 12,
                lineHeight: 1,
                padding: "4px 8px",
              }}
            >
              <span style={{ display: "inline-block", transform: collapsed ? "rotate(0deg)" : "rotate(180deg)", transition: "transform 150ms" }}>
                ⌄
              </span>
            </button>
          )}
        </div>
      </div>
      {!collapsed && children}
    </Card>
  );
}
