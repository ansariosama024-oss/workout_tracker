import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import { AUTH_GUARD_ENABLED } from "./ProtectedRoute";

/**
 * Guards routes meant only for signed-out visitors (login, register,
 * forgot-password), redirecting already-authenticated users away from
 * them -- back to wherever they originally tried to go, if known,
 * otherwise /dashboard.
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
