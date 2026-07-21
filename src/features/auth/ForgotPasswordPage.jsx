import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { C } from "../trades/constants";
import { useLocale } from "../../lib/i18n/LocaleContext";
import AuthForm, { Field } from "./AuthForm";
import Card from "../../ui/Card";

export default function ForgotPasswordPage() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const [sentTo, setSentTo] = useState(null);
  const { t } = useLocale();

  async function handleSubmit(e) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const form = new FormData(e.target);
    const email = form.get("email");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setPending(false);

    if (error) {
      setError(error.message);
      return;
    }

    // Don't reveal whether the address has an account — always show success.
    setSentTo(email);
  }

  if (sentTo) {
    return (
      <div style={{ minHeight: "100vh", color: C.text, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', system-ui, sans-serif", padding: 20 }}>
        <div style={{ width: 360, maxWidth: "100%" }}>
          <Card padding={32} style={{ textAlign: "center" }}>
            <p style={{ margin: 0, lineHeight: 1.55 }}>{t("resetLinkSent")(sentTo)}</p>
            <p style={{ margin: "16px 0 0", fontSize: 13 }}>
              <Link to="/sign-in" style={{ color: C.brand }}>{t("backToSignIn")}</Link>
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <AuthForm
      title={t("forgotPasswordTitle")}
      subtitle={t("forgotPasswordSubtitle")}
      onSubmit={handleSubmit}
      submitLabel={t("sendResetLink")}
      pending={pending}
      error={error}
      footer={
        <div style={{ fontSize: 12, color: C.muted, textAlign: "center" }}>
          <Link to="/sign-in" style={{ color: C.brand }}>{t("backToSignIn")}</Link>
        </div>
      }
    >
      <Field
        label={t("email")}
        name="email"
        type="email"
        required
        autoComplete="email"
        autoFocus
      />
    </AuthForm>
  );
}
