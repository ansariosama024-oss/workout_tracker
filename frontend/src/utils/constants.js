import {
  LayoutDashboard,
  Dumbbell,
  ListChecks,
  BarChart3,
  UserCircle,
  Settings as SettingsIcon,
} from "lucide-react";

/**
 * Primary sidebar/drawer navigation. Shared by Sidebar, MobileSidebar, and
 * any future breadcrumb logic so route labels/icons are defined once.
 */
export const NAV_ITEMS = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Workouts", to: "/workouts", icon: Dumbbell },
  { label: "Exercises", to: "/exercises", icon: ListChecks },
  { label: "Reports", to: "/reports", icon: BarChart3 },
  { label: "Profile", to: "/profile", icon: UserCircle },
  { label: "Settings", to: "/settings", icon: SettingsIcon },
];

/** Workout status values, matching the backend Workout.Status choices. */
export const WORKOUT_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

/** Visual variant mapping for <Badge /> by workout status. */
export const WORKOUT_STATUS_BADGE_VARIANT = {
  pending: "warning",
  completed: "success",
  cancelled: "danger",
};

/** Exercise category values, matching the backend Exercise.Category choices. */
export const EXERCISE_CATEGORY_OPTIONS = [
  { value: "strength", label: "Strength" },
  { value: "cardio", label: "Cardio" },
  { value: "flexibility", label: "Flexibility" },
];

/** Exercise muscle group values, matching Exercise.MuscleGroup choices. */
export const MUSCLE_GROUP_OPTIONS = [
  { value: "chest", label: "Chest" },
  { value: "back", label: "Back" },
  { value: "shoulders", label: "Shoulders" },
  { value: "arms", label: "Arms" },
  { value: "legs", label: "Legs" },
  { value: "core", label: "Core" },
  { value: "full_body", label: "Full Body" },
];

/** LocalStorage key used to persist the selected theme. */
export const THEME_STORAGE_KEY = "workout-tracker-theme";
