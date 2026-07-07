import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { C } from "../trades/constants";
import AuthForm from "./AuthForm";

export default function SignInPage() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
      title="Sign in"
      onSubmit={handleSubmit}
      submitLabel="Sign in"
      pending={pending}
      error={error}
      footer={
        <div style={{ fontSize: 12, color: C.muted, textAlign: "center" }}>
          No account? <Link to="/sign-up" style={{ color: C.accent }}>Sign up</Link>
        </div>
      }
    />
  );
}
