import { useState } from "react";
import { C, type, space } from "./theme";

// Header + content, no box chrome. The shared building block for every
// titled area on a page (charts, tables, groups of KPIs) so they speak one
// visual language without each being boxed identically. Hierarchy comes from
// typography (`type.subsectionLabel`), not a colored tick or a forced border.
// Wrap in <Card> when something genuinely needs to read as a self-contained,
// potentially-idle object (the trade log, a modal) — Section still supplies
// the header either way.
//   title            — heading text
//   tier             — "section" (page-level narrative beat) | "subsection" (a chart/table's own title)
//   caption          — optional one-line description under the title
//   right            — optional node on the header's trailing side (a total, a legend)
//   collapsible      — show a chevron that toggles the body
//   defaultCollapsed — start collapsed (only meaningful with collapsible)
export default function Section({
  title,
  tier = "subsection",
  caption,
  right,
  children,
  collapsible = false,
  defaultCollapsed = false,
  dir,
  style,
}) {
  const [collapsed, setCollapsed] = useState(collapsible ? defaultCollapsed : false);

  return (
    <div dir={dir} style={style}>
      {(title || right) && (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: collapsed ? 0 : space.md,
          }}
        >
          <div>
            {title && <div style={tier === "section" ? type.sectionHeader : type.subsectionLabel}>{title}</div>}
            {caption && (
              <div style={{ fontSize: 12.5, color: C.muted, marginTop: 3, lineHeight: 1.4 }}>{caption}</div>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
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
                <span
                  style={{
                    display: "inline-block",
                    transform: collapsed ? "rotate(0deg)" : "rotate(180deg)",
                    transition: "transform 150ms",
                  }}
                >
                  ⌄
                </span>
              </button>
            )}
          </div>
        </div>
      )}
      {!collapsed && children}
    </div>
  );
}
