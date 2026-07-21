import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LocaleProvider } from "./lib/i18n/LocaleContext";
import ProtectedRoute from "./features/auth/ProtectedRoute";
import SignInPage from "./features/auth/SignInPage";
import SignUpPage from "./features/auth/SignUpPage";
import ForgotPasswordPage from "./features/auth/ForgotPasswordPage";
import ResetPasswordPage from "./features/auth/ResetPasswordPage";
import Dashboard from "./features/trades/Dashboard";

export default function App() {
  return (
    <LocaleProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </LocaleProvider>
  );
}
