import { useEffect, useRef, useState } from "react";
import { C, radius, shadow, transition } from "../../ui/theme";

// A quiet "⋯" trigger that opens a small actions popover. Replaces the old
// destructive "×" so management scales (Rename / Edit / Archive / Delete) and
// deletion is no longer one stray click away. Closes on outside-click and Escape.
//
// items: Array<{ label, onClick, danger?, hidden? }>
export default function PortfolioActionsMenu({ items, align = "right", label = "Portfolio actions" }) {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const visible = items.filter((it) => !it.hidden);

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-flex" }}>
      <button
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 28,
          height: 28,
          borderRadius: radius.sm,
          border: "1px solid transparent",
          background: open || hover ? C.panel2 : "transparent",
          color: open || hover ? C.text : C.muted,
          cursor: "pointer",
          fontSize: 16,
          lineHeight: 1,
          transition: `background ${transition}, color ${transition}`,
        }}
      >
        ⋯
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            [align]: 0,
            minWidth: 168,
            background: C.panel,
            border: `1px solid ${C.border}`,
            borderRadius: radius.md,
            boxShadow: shadow.overlay,
            padding: 5,
            zIndex: 40,
            animation: "dash-menu-in 120ms ease-out",
          }}
        >
          <style>{"@keyframes dash-menu-in{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}"}</style>
          {visible.map((it, i) => (
            <MenuItem
              key={i}
              danger={it.danger}
              onClick={() => {
                setOpen(false);
                it.onClick();
              }}
            >
              {it.label}
            </MenuItem>
          ))}
        </div>
      )}
    </div>
  );
}

function MenuItem({ children, danger, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "block",
        width: "100%",
        textAlign: "left",
        padding: "8px 10px",
        borderRadius: radius.sm,
        border: "none",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 600,
        background: hover ? (danger ? C.redDim : C.panel2) : "transparent",
        color: danger ? C.red : hover ? C.text : C.textDim,
        transition: `background ${transition}, color ${transition}`,
      }}
    >
      {children}
    </button>
  );
}
