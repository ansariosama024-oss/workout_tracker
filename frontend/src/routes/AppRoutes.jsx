import { Navigate, Route, Routes } from "react-router-dom";

import { AppLayout } from "../layouts/AppLayout";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import WorkoutListPage from "../pages/workouts/WorkoutListPage";
import CreateWorkoutPage from "../pages/workouts/CreateWorkoutPage";
import WorkoutDetailsPage from "../pages/workouts/WorkoutDetailsPage";
import EditWorkoutPage from "../pages/workouts/EditWorkoutPage";
import ExerciseLibraryPage from "../pages/exercises/ExerciseLibraryPage";
import ReportsPage from "../pages/reports/ReportsPage";
import ProfilePage from "../pages/profile/ProfilePage";
import SettingsPage from "../pages/settings/SettingsPage";
import NotFoundPage from "../pages/NotFoundPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { PublicRoute } from "./PublicRoute";

/**
 * Central route table.
 *
 * Route protection is fully wired (ProtectedRoute/PublicRoute) but not
 * enforced yet -- see routes/ProtectedRoute.jsx's AUTH_GUARD_ENABLED flag
 * for why and how to turn it on once real authentication exists. Until
 * then every route below remains reachable so UI development isn't
 * blocked by a login wall that has nothing to log in to.
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />

          <Route path="/workouts" element={<WorkoutListPage />} />
          <Route path="/workouts/create" element={<CreateWorkoutPage />} />
          <Route path="/workouts/:id" element={<WorkoutDetailsPage />} />
          <Route path="/workouts/:id/edit" element={<EditWorkoutPage />} />

          <Route path="/exercises" element={<ExerciseLibraryPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
