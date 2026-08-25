import { Navigate, Outlet, useLocation } from "react-router-dom";

import { Spinner } from "../components/ui/Spinner";
import { useAuth } from "../hooks/useAuth";

/**
 * Master switch for route protection.
 *
 * There is no backend to authenticate against yet, so every visitor is
 * "not signed in" by design in this phase (see AuthContext). If this
 * guard enforced login today, nobody -- including us, during UI
 * development -- could reach /dashboard, /workouts, etc.
 *
 * HOW TO ENABLE LATER: once Django JWT login/register are connected and
 * AuthContext.isAuthenticated can actually become true, flip this to
 * `true` (or wire it to an env flag, e.g.
 * `import.meta.env.VITE_ENFORCE_AUTH === "true"`). No other change is
 * needed -- the redirect/loading logic below is already fully wired, it
 * just doesn't run while this is false.
 */
export const AUTH_GUARD_ENABLED = false;

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
