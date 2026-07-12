import { C, radius, shadow } from "./theme";

// The base elevated surface every panel is built from. MetricCard and ChartCard
// compose this so all cards share one look (border, radius, shadow, padding).
export default function Card({ children, padding = 20, interactive = false, style, ...rest }) {
  return (
    <div
      style={{
        background: C.panel,
        border: `1px solid ${C.border}`,
        borderRadius: radius.md,
        boxShadow: shadow.card,
        padding,
        transition: interactive ? "border-color 150ms, box-shadow 150ms" : undefined,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
