import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { C } from "../trades/constants";
import { useLocale } from "../../lib/i18n/LocaleContext";
import AuthForm from "./AuthForm";

export default function SignInPage() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { t } = useLocale();

  async function handleSubmit(e) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const form = new FormData(e.target);
    const { error } = await supabase.auth.signInWithPassword({
      email: form.get("email"),
      password: form.get("password"),
    });

    setPending(false);

    if (error) {
      setError(error.message);
      return;
    }

    navigate("/", { replace: true });
  }

  return (
    <AuthForm
      title={t("signIn")}
      onSubmit={handleSubmit}
      submitLabel={t("signIn")}
      pending={pending}
      error={error}
      footer={
        <div style={{ fontSize: 12, color: C.muted, textAlign: "center" }}>
          {t("noAccountQuestion")} <Link to="/sign-up" style={{ color: C.accent }}>{t("signUp")}</Link>
        </div>
      }
    />
  );
}
