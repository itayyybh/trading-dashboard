import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { C } from "../trades/constants";
import { useLocale } from "../../lib/i18n/LocaleContext";
import AuthForm, { PasswordField } from "./AuthForm";
import Card from "../../ui/Card";

// "checking"  — waiting for Supabase to process the recovery token in the URL
// "ready"     — recovery session established; show the new-password form
// "invalid"   — no session after the token was processed (link expired/used)
export default function ResetPasswordPage() {
  const [status, setStatus] = useState("checking");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { t } = useLocale();

  useEffect(() => {
    let settled = false;
    const ready = () => {
      settled = true;
      setStatus("ready");
    };

    // The recovery session may already be in place (client processed the hash
    // before this mounted), or arrive via the PASSWORD_RECOVERY event.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) ready();
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) ready();
    });

    // If no session materializes shortly, the link is invalid or expired.
    const timer = setTimeout(() => {
      if (!settled) setStatus("invalid");
    }, 3000);

    return () => {
      listener.subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    const form = new FormData(e.target);
    const password = form.get("password");
    const confirm = form.get("confirm");

    if (password !== confirm) {
      setError(t("passwordsDoNotMatch"));
      return;
    }

    setPending(true);
    const { error } = await supabase.auth.updateUser({ password });
    setPending(false);

    if (error) {
      setError(error.message);
      return;
    }

    // updateUser leaves the user signed in with a full session.
    navigate("/", { replace: true });
  }

  if (status !== "ready") {
    const message = status === "checking" ? t("verifyingResetLink") : t("resetLinkInvalid");
    return (
      <div style={{ minHeight: "100vh", color: C.text, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', system-ui, sans-serif", padding: 20 }}>
        <div style={{ width: 360, maxWidth: "100%" }}>
          <Card padding={32} style={{ textAlign: "center" }}>
            <p style={{ margin: 0, lineHeight: 1.55 }}>{message}</p>
            {status === "invalid" && (
              <p style={{ margin: "16px 0 0", fontSize: 13 }}>
                <Link to="/forgot-password" style={{ color: C.brand }}>{t("requestNewResetLink")}</Link>
              </p>
            )}
          </Card>
        </div>
      </div>
    );
  }

  return (
    <AuthForm
      title={t("resetPasswordTitle")}
      subtitle={t("resetPasswordSubtitle")}
      onSubmit={handleSubmit}
      submitLabel={t("updatePassword")}
      pending={pending}
      error={error}
    >
      <PasswordField
        label={t("newPassword")}
        name="password"
        required
        minLength={6}
        autoComplete="new-password"
        autoFocus
      />
      <PasswordField
        label={t("confirmPassword")}
        name="confirm"
        required
        minLength={6}
        autoComplete="new-password"
      />
    </AuthForm>
  );
}
