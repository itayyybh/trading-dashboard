import { useState } from "react";
import { C, radius, font } from "../../ui/theme";
import Brand from "../../ui/Brand";
import Button from "../../ui/Button";
import { useLocale } from "../../lib/i18n/LocaleContext";
import LocaleToggle from "../shared/LocaleToggle";

// Page/section heading — size + weight carry the hierarchy, not color.
const heading = {
  fontSize: 21,
  fontWeight: 700,
  letterSpacing: "-0.015em",
  lineHeight: 1.25,
  color: C.text,
};

const inputStyle = {
  width: "100%",
  background: C.bgElevated,
  border: `1px solid ${C.border}`,
  borderRadius: radius.sm,
  padding: "12px 14px",
  color: C.text,
  fontSize: 14,
  outline: "none",
};

// One field: label above a full-width input. `trailing` slots an inline control
// (e.g. the password show/hide toggle) inside the input's end padding.
export function Field({ label, trailing, style, ...inputProps }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      <span style={{ fontSize: 13, fontWeight: 500, color: C.textDim }}>{label}</span>
      <div style={{ position: "relative", display: "flex" }}>
        <input
          className="dash-input"
          style={{ ...inputStyle, paddingInlineEnd: trailing ? 44 : 14, ...style }}
          {...inputProps}
        />
        {trailing}
      </div>
    </label>
  );
}

// A Field that owns its own show/hide toggle. Used anywhere a password is
// entered (sign-in, sign-up, reset), so the eye control lives in one place.
export function PasswordField(props) {
  const { t } = useLocale();
  const [showPassword, setShowPassword] = useState(false);
  return (
    <Field
      {...props}
      type={showPassword ? "text" : "password"}
      trailing={
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          aria-label={showPassword ? t("hidePassword") : t("showPassword")}
          aria-pressed={showPassword}
          className="auth-eye"
          style={{
            position: "absolute",
            insetInlineEnd: 6,
            top: "50%",
            transform: "translateY(-50%)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 30,
            height: 30,
            padding: 0,
            border: "none",
            background: "transparent",
            color: C.muted,
            cursor: "pointer",
            borderRadius: radius.sm,
          }}
        >
          {showPassword ? <EyeOff /> : <Eye />}
        </button>
      }
    />
  );
}

export default function AuthForm({ title, subtitle, onSubmit, submitLabel, pending, error, footer, children }) {
  const { t } = useLocale();

  const trustPoints = [
    t("authTrustSecurity"),
    t("authTrustBrokers"),
    t("authTrustInsights"),
  ];

  return (
    <div className="auth-root" style={{ color: C.text, fontFamily: font.sans }}>
      <div className="auth-split">
        {/* Brand panel — desktop only. Establishes trust before the form. */}
        <aside className="auth-brand-panel">
          <Brand size="lg" />
          <div style={{ marginTop: "auto", paddingTop: 48 }}>
            <h2 style={{ ...heading, fontSize: 28, margin: 0 }}>
              {t("authHeadline")}
            </h2>
            <p style={{ fontSize: 14, color: C.muted, margin: "10px 0 0", lineHeight: 1.5 }}>
              {t("authTagline")}
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: "28px 0 0", display: "flex", flexDirection: "column", gap: 14 }}>
              {trustPoints.map((point) => (
                <li key={point} style={{ display: "flex", alignItems: "center", gap: 11, fontSize: 13.5, color: C.textDim }}>
                  <CheckMark />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Form panel */}
        <main className="auth-form-panel">
          <div className="auth-brand-mobile">
            <Brand size="md" />
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: subtitle ? 8 : 28 }}>
            <h1 style={{ ...heading, margin: 0 }}>{title}</h1>
            <LocaleToggle />
          </div>

          {subtitle && (
            <p style={{ fontSize: 13.5, color: C.muted, margin: "0 0 28px", lineHeight: 1.5 }}>
              {subtitle}
            </p>
          )}

          <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {children}

            {error && (
              <div
                role="alert"
                aria-live="polite"
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 9,
                  background: C.redDim,
                  border: `1px solid ${C.red}44`,
                  borderRadius: radius.sm,
                  padding: "10px 12px",
                  fontSize: 13,
                  color: C.red,
                  lineHeight: 1.4,
                }}
              >
                <AlertIcon />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              block
              disabled={pending}
              style={{ marginTop: 4, padding: "12px 16px", fontSize: 14 }}
            >
              {pending ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>
                  <span className="auth-spinner" aria-hidden="true" />
                  {t("pleaseWait")}
                </span>
              ) : (
                submitLabel
              )}
            </Button>

            <div style={{ marginTop: 6 }}>{footer}</div>
          </form>
        </main>
      </div>
    </div>
  );
}

function CheckMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ flexShrink: 0, color: C.brand }}>
      <path d="M13.5 4.5L6.5 11.5L3 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }}>
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 5v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="8" cy="11" r="0.9" fill="currentColor" />
    </svg>
  );
}

function Eye() {
  return (
    <svg width="17" height="17" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M2 10s3-5.5 8-5.5S18 10 18 10s-3 5.5-8 5.5S2 10 2 10Z" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="10" cy="10" r="2.25" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function EyeOff() {
  return (
    <svg width="17" height="17" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M8.2 4.7A7.6 7.6 0 0 1 10 4.5c5 0 8 5.5 8 5.5a13.6 13.6 0 0 1-2.2 2.8M5.1 5.9A13.4 13.4 0 0 0 2 10s3 5.5 8 5.5a7.7 7.7 0 0 0 3-.6M8.4 8.4a2.25 2.25 0 0 0 3.2 3.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 3l14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
