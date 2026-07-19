import Brand from "./Brand";
import { C } from "./theme";

// App frame: a sticky, blurred top bar (brand + trailing actions) over a
// width-constrained content column. Keeps page chrome consistent everywhere.
//   topRight — node on the trailing edge of the bar (locale toggle, sign out…)
//   subtitle — optional line shown under the page area title (via `title`)
export default function AppShell({ topRight, title, subtitle, children }) {
  return (
    <div style={{ minHeight: "100vh", color: C.text, fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Sticky top bar */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          borderBottom: `1px solid ${C.border}`,
          background: "rgba(10, 13, 21, 0.72)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <div
          className="dash-bar"
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <Brand />
          {topRight && <div style={{ display: "flex", alignItems: "center", gap: 10 }}>{topRight}</div>}
        </div>
      </header>

      {/* Content column */}
      <main className="dash-main" style={{ maxWidth: 1200, margin: "0 auto" }}>
        {title && (
          <div style={{ marginBottom: 22 }}>
            <h1 className="dash-page-title" style={{ fontWeight: 800, letterSpacing: "-0.02em", margin: 0 }}>{title}</h1>
            {subtitle && <div style={{ fontSize: 13, color: C.muted, marginTop: 6 }}>{subtitle}</div>}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
