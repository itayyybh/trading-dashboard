import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

// session is undefined while the initial check is in flight, null when signed out
export function useSession() {
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return session;
}
