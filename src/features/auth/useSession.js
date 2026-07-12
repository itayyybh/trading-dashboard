import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

// session is undefined while the initial check is in flight, null when signed out
export function useSession() {
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    // On failure, fall through to signed-out (null) rather than leaving
    // session === undefined forever, which would hang ProtectedRoute on
    // an infinite "loading..." state.
    supabase.auth
      .getSession()
      .then(({ data }) => setSession(data.session))
      .catch((err) => {
        console.error("getSession failed:", err);
        setSession(null);
      });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return session;
}
