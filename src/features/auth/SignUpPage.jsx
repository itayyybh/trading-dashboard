import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { C } from "../trades/constants";
import { useLocale } from "../../lib/i18n/LocaleContext";
import AuthForm from "./AuthForm";

export default function SignUpPage() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const [confirmSent, setConfirmSent] = useState(false);
  const navigate = useNavigate();
  const { t } = useLocale();

  async function handleSubmit(e) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const form = new FormData(e.target);
    const { data, error } = await supabase.auth.signUp({
      email: form.get("email"),
      password: form.get("password"),
    });

    setPending(false);

    if (error) {
      setError(error.message);
      return;
    }

    // With email confirmation enabled, sign-up succeeds but there's no session yet.
    if (!data.session) {
      setConfirmSent(true);
      return;
    }

    navigate("/", { replace: true });
  }

  if (confirmSent) {
    return (
      <div style={{ background: C.bg, minHeight: "100vh", color: C.text, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12, padding: 32, width: 320, textAlign: "center" }}>
          {t("confirmEmailPrefix")} <Link to="/sign-in" style={{ color: C.brand }}>{t("signIn").toLowerCase()}</Link>.
        </div>
      </div>
    );
  }

  return (
    <AuthForm
      title={t("createAccount")}
      onSubmit={handleSubmit}
      submitLabel={t("signUp")}
      pending={pending}
      error={error}
      footer={
        <div style={{ fontSize: 12, color: C.muted, textAlign: "center" }}>
          {t("alreadyHaveAccountQuestion")} <Link to="/sign-in" style={{ color: C.brand }}>{t("signIn")}</Link>
        </div>
      }
    />
  );
}
