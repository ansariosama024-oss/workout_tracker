import apiClient from "./api";
import { parseApiErrorMessage } from "../utils/apiErrors";

/**
 * Workout service: thin wrappers around the Django Workout CRUD API
 * (Backend Phase 5). Every request automatically carries the JWT
 * Authorization header and transparent token refresh via api.js -- no
 * auth logic is duplicated here.
 */

/** @param {Record<string, string|number>} [params] - e.g. { status, scheduled_date, ordering } */
export function getWorkouts(params) {
  return apiClient
    .get("/workouts/", { params })
    .then((response) => response.data); // -> { count, next, previous, results }
}

/** @param {string|number} id */
export function getWorkout(id) {
  return apiClient.get(`/workouts/${id}/`).then((response) => response.data);
}

/** @param {object} payload - see components/workout/WorkoutForm.jsx for shape */
export function createWorkout(payload) {
  return apiClient
    .post("/workouts/", payload)
    .then((response) => response.data);
}

/**
 * Full replace (PUT). @param {string|number} id @param {object} payload
 */
export function updateWorkout(id, payload) {
  return apiClient
    .put(`/workouts/${id}/`, payload)
    .then((response) => response.data);
}

/**
 * Partial update (PATCH). @param {string|number} id @param {object} payload
 */
export function patchWorkout(id, payload) {
  return apiClient
    .patch(`/workouts/${id}/`, payload)
    .then((response) => response.data);
}

/** @param {string|number} id */
export function deleteWorkout(id) {
  return apiClient.delete(`/workouts/${id}/`).then((response) => response.data);
}

/**
 * Marks a workout complete. There is no dedicated "complete" endpoint on
 * the backend -- this is a partial update that satisfies the Workout
 * model's own status/completed_at consistency rule (completed_at must be
 * set once status is "completed").
 * @param {string|number} id
 */
export function markWorkoutComplete(id) {
  return patchWorkout(id, {
    status: "completed",
    completed_at: new Date().toISOString(),
  });
}

/**
 * Maps a caught error to a short, user-facing message, using a
 * workout-appropriate fallback for 401s (session expiry rather than
 * "wrong password", which wouldn't make sense here).
 */
export function getWorkoutErrorMessage(error) {
  return parseApiErrorMessage(error, {
    unauthorizedMessage: "Your session has expired. Please sign in again.",
  });
}
