/**
 * Temporary, local-only exercise options for building the workout form UI.
 *
 * These are NOT real data and are not persisted anywhere. Once the Exercise
 * API is wired up (a later phase), the exercise selector in
 * components/workout/WorkoutExerciseRow.jsx will fetch its options from
 * exerciseService.getExercises() instead of this file, and this file
 * should be deleted.
 */
export const TEMP_LOCAL_EXERCISE_OPTIONS = [
  { id: "temp-1", name: "Bench Press", category: "strength", muscle_group: "chest" },
  { id: "temp-2", name: "Back Squat", category: "strength", muscle_group: "legs" },
  { id: "temp-3", name: "Deadlift", category: "strength", muscle_group: "back" },
  { id: "temp-4", name: "Overhead Press", category: "strength", muscle_group: "shoulders" },
  { id: "temp-5", name: "Pull-Up", category: "strength", muscle_group: "back" },
  { id: "temp-6", name: "Treadmill Run", category: "cardio", muscle_group: "full_body" },
  { id: "temp-7", name: "Plank", category: "flexibility", muscle_group: "core" },
];
