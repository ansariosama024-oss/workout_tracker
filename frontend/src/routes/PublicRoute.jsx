import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import { AUTH_GUARD_ENABLED } from "./ProtectedRoute";

/**
 * Guards routes meant only for signed-out visitors (login, register,
 * forgot-password), redirecting already-authenticated users away from
 * them.
 *
 * Shares AUTH_GUARD_ENABLED with ProtectedRoute so both flip on together
 * once real authentication exists. In practice this component is safe to
 * leave "live" even before that: since AuthContext.isAuthenticated can
 * never be true without a real login, it always renders its children in
 * this phase regardless of the flag.
 */
export function PublicRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (AUTH_GUARD_ENABLED && isAuthenticated) {
    const redirectTo = location.state?.from?.pathname ?? "/dashboard";
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}
