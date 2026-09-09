import { Navigate, Outlet, useLocation } from "react-router-dom";

import { Spinner } from "../components/ui/Spinner";
import { useAuth } from "../hooks/useAuth";

/**
 * Master switch for route protection.
 *
 * Real Django JWT authentication is connected as of Frontend Phase 4, so
 * this is enabled: unauthenticated visitors are redirected to /login, and
 * the route they originally requested is preserved via location state so
 * login can return them there afterward.
 */
export const AUTH_GUARD_ENABLED = true;

/**
 * Guards authenticated-only routes. Use as a layout route wrapping
 * <AppLayout /> (or any protected page) in AppRoutes:
 *
 *   <Route element={<ProtectedRoute />}>
 *     <Route element={<AppLayout />}>
 *       <Route path="/dashboard" element={<DashboardPage />} />
 *     </Route>
 *   </Route>
 */
export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (!AUTH_GUARD_ENABLED) {
    return <Outlet />;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Preserve the originally requested route so login can return here.
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
