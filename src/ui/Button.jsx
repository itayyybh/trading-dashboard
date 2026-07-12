import { useState } from "react";
import { C, radius, transition } from "./theme";

// One button to cover every action in the app.
//   variant: "primary" | "secondary" | "ghost" | "danger"
//   size:    "sm" | "md"
// Supports an optional leading `icon` and a `block` (full-width) layout.
export default function Button({
  children,
  variant = "secondary",
  size = "md",
  icon = null,
  block = false,
  disabled = false,
  style,
  ...rest
}) {
  const [hover, setHover] = useState(false);

  const sizes = {
    sm: { padding: "6px 12px", fontSize: 12 },
    md: { padding: "8px 16px", fontSize: 13 },
  };

  const variants = {
    // Calm translucent fill instead of a solid neon block — reads premium, not cheap.
    primary: {
      background: hover ? "#2aa77f26" : C.accentDim,
      color: C.accent,
      border: `1px solid ${hover ? C.accent : "#2aa77f66"}`,
    },
    secondary: {
      background: hover ? C.panel2 : "transparent",
      color: hover ? C.text : C.textDim,
      border: `1px solid ${C.border}`,
    },
    ghost: {
      background: hover ? C.panel2 : "transparent",
      color: hover ? C.text : C.muted,
      border: "1px solid transparent",
    },
    danger: {
      background: hover ? C.redDim : "transparent",
      color: C.red,
      border: `1px solid ${hover ? C.red : C.border}`,
    },
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
        width: block ? "100%" : undefined,
        borderRadius: radius.pill,
        fontWeight: 600,
        lineHeight: 1,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: `background ${transition}, color ${transition}, border-color ${transition}`,
        whiteSpace: "nowrap",
        ...sizes[size],
        ...variants[variant],
        ...style,
      }}
      {...rest}
    >
      {icon && <span style={{ display: "inline-flex", fontSize: "1.05em" }}>{icon}</span>}
      {children}
    </button>
  );
}
