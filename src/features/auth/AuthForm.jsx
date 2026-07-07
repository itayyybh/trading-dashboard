import { C } from "../trades/constants";

export default function AuthForm({ title, onSubmit, submitLabel, pending, error, footer }) {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <form
        onSubmit={onSubmit}
        style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12, padding: 32, width: 320, display: "flex", flexDirection: "column", gap: 14 }}
      >
        <h1 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 6px" }}>{title}</h1>

        <label style={{ fontSize: 12, color: C.muted, display: "flex", flexDirection: "column", gap: 6 }}>
          Email
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 10px", color: C.text, fontSize: 14 }}
          />
        </label>

        <label style={{ fontSize: 12, color: C.muted, display: "flex", flexDirection: "column", gap: 6 }}>
          Password
          <input
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete="current-password"
            style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 10px", color: C.text, fontSize: 14 }}
          />
        </label>

        {error && <div style={{ color: C.red, fontSize: 12 }}>{error}</div>}

        <button
          type="submit"
          disabled={pending}
          style={{
            marginTop: 6, padding: "9px 16px", borderRadius: 8, border: "none",
            background: pending ? C.border : C.accentDim, color: C.accent,
            fontWeight: 700, fontSize: 13, cursor: pending ? "default" : "pointer",
          }}
        >
          {pending ? "Please wait…" : submitLabel}
        </button>

        {footer}
      </form>
    </div>
  );
}
