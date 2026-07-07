import { Navigate } from "react-router-dom";
import { useSession } from "./useSession";
import { C } from "../trades/constants";

export default function ProtectedRoute({ children }) {
  const session = useSession();

  if (session === undefined) {
    return <div style={{ background: C.bg, minHeight: "100vh", color: C.text }}>loading...</div>;
  }

  if (session === null) {
    return <Navigate to="/sign-in" replace />;
  }

  return children;
}
