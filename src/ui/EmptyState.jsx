import { C, radius } from "./theme";

// Unified empty / loading / error surface. One component, three moods via
// `variant` so the app never shows a bare "loading..." string again.
//   variant: "empty" | "loading" | "error"
//   icon:    optional glyph (defaults per variant)
//   action:  optional node (e.g. a <Button/>) shown under the copy
export default function EmptyState({ title, subtitle, icon, action, variant = "empty" }) {
  const accent =
    variant === "error" ? C.red : variant === "loading" ? C.textDim : C.brand;
  const defaultIcon = variant === "error" ? "!" : variant === "loading" ? null : "◇";

  return (
    <div
      style={{
        background: C.panel,
        border: `1px dashed ${variant === "error" ? C.red + "55" : C.border}`,
        borderRadius: radius.md,
        padding: "56px 28px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
      }}
    >
      {variant === "loading" ? (
        <Spinner color={accent} />
      ) : (
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: radius.md,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            fontWeight: 700,
            color: accent,
            background: variant === "error" ? C.redDim : C.brandSoft,
            border: `1px solid ${accent}44`,
            marginBottom: 8,
          }}
        >
          {icon ?? defaultIcon}
        </div>
      )}

      <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{title}</div>
      {subtitle && (
        <div style={{ fontSize: 13, color: C.muted, maxWidth: 380, lineHeight: 1.5 }}>{subtitle}</div>
      )}
      {action && <div style={{ marginTop: 14 }}>{action}</div>}
    </div>
  );
}

// Minimal CSS-free spinner (uses an inline keyframes injection once).
function Spinner({ color }) {
  return (
    <>
      <style>{"@keyframes dash-spin{to{transform:rotate(360deg)}}"}</style>
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: "50%",
          border: `2px solid ${color}33`,
          borderTopColor: color,
          animation: "dash-spin 0.7s linear infinite",
          marginBottom: 10,
        }}
      />
    </>
  );
}
