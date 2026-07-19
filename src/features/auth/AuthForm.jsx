import { C, radius, shadow } from "../../ui/theme";
import Brand from "../../ui/Brand";
import Button from "../../ui/Button";
import { useLocale } from "../../lib/i18n/LocaleContext";
import LocaleToggle from "../shared/LocaleToggle";

const inputStyle = {
  background: C.bgElevated,
  border: `1px solid ${C.border}`,
  borderRadius: radius.sm,
  padding: "10px 12px",
  color: C.text,
  fontSize: 14,
  outline: "none",
};

export default function AuthForm({ title, onSubmit, submitLabel, pending, error, footer }) {
  const { t } = useLocale();

  return (
    <div
      style={{
        minHeight: "100vh",
        color: C.text,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Inter', system-ui, sans-serif",
        padding: 20,
      }}
    >
      <div style={{ width: 360, maxWidth: "100%" }}>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
          <LocaleToggle />
        </div>

        <div
          style={{
            background: C.panel,
            border: `1px solid ${C.border}`,
            borderRadius: radius.md,
            boxShadow: shadow.card,
            padding: 32,
          }}
        >
          {/* Brand lockup: logo mark + DאSH wordmark + tagline */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
            <Brand size="lg" showTagline />
          </div>

          <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <h1 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: C.text }}>{title}</h1>

            <label style={{ fontSize: 12, color: C.muted, display: "flex", flexDirection: "column", gap: 6 }}>
              {t("email")}
              <input name="email" type="email" required autoComplete="email" className="dash-input" style={inputStyle} />
            </label>

            <label style={{ fontSize: 12, color: C.muted, display: "flex", flexDirection: "column", gap: 6 }}>
              {t("password")}
              <input name="password" type="password" required minLength={6} autoComplete="current-password" className="dash-input" style={inputStyle} />
            </label>

            {error && <div style={{ color: C.red, fontSize: 12 }}>{error}</div>}

            <Button type="submit" variant="primary" block disabled={pending} style={{ marginTop: 6, padding: "11px 16px", fontSize: 13 }}>
              {pending ? t("pleaseWait") : submitLabel}
            </Button>

            {footer}
          </form>
        </div>
      </div>
    </div>
  );
}
