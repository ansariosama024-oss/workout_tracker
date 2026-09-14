import { Route, Routes } from "react-router-dom";

import { AppLayout } from "../layouts/AppLayout";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";

import LandingPage from "../pages/LandingPage";

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

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Public Authentication */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      {/* Protected Application */}
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

      {/* 404 */}
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}