import { useEffect } from "react";
import { C, radius, shadow } from "./theme";

// The single overlay surface for every dialog in the app (wizard, edit form,
// confirmations). One place owns the scrim, centering, Escape-to-close, scroll
// lock and the panel chrome — so dialogs never re-implement it inconsistently.
//   width    — panel max width (px)
//   onClose  — called on scrim click + Escape (omit to make the dialog modal-locked)
//   closeOnBackdrop — allow scrim click to close (default true)
//   labelledBy — id of the element that titles the dialog (a11y)
export default function Modal({
  children,
  width = 420,
  onClose,
  closeOnBackdrop = true,
  labelledBy,
}) {
  // Escape closes; body scroll is locked while open.
  useEffect(() => {
    if (!onClose) return undefined;
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      onMouseDown={(e) => {
        if (closeOnBackdrop && onClose && e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(6,8,14,0.66)",
        backdropFilter: "blur(3px)",
        WebkitBackdropFilter: "blur(3px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: 16,
        animation: "dash-modal-in 140ms ease-out",
      }}
    >
      <style>
        {"@keyframes dash-modal-in{from{opacity:0}to{opacity:1}}" +
          "@keyframes dash-panel-in{from{opacity:0;transform:translateY(6px) scale(0.99)}to{opacity:1;transform:none}}"}
      </style>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        style={{
          background: C.panel,
          border: `1px solid ${C.border}`,
          borderRadius: radius.lg,
          boxShadow: shadow.overlay,
          width,
          maxWidth: "100%",
          maxHeight: "calc(100vh - 32px)",
          overflowY: "auto",
          animation: "dash-panel-in 160ms cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
