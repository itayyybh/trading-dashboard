import { C } from "../constants";

export default function EmptyState({ title, subtitle }) {
  return (
    <div style={{ background: C.panel, border: `1px dashed ${C.border}`, borderRadius: 12, padding: "48px 24px", textAlign: "center" }}>
      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{title}</div>
      {subtitle && <div style={{ fontSize: 13, color: C.muted }}>{subtitle}</div>}
    </div>
  );
}
