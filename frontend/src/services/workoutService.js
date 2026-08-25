import apiClient from "./api";

/**
 * Workout service interface, ready for backend integration in a later
 * phase. Not yet called from any page.
 */

/** @param {Record<string, string|number>} [params] - query filters */
export function getWorkouts(params) {
  return apiClient
    .get("/workouts/", { params })
    .then((response) => response.data);
}

/** @param {string|number} id */
export function getWorkout(id) {
  return apiClient.get(`/workouts/${id}/`).then((response) => response.data);
}

/** @param {object} payload */
export function createWorkout(payload) {
  return apiClient
    .post("/workouts/", payload)
    .then((response) => response.data);
}

/**
 * @param {string|number} id
 * @param {object} payload
 */
export function updateWorkout(id, payload) {
  return apiClient
    .patch(`/workouts/${id}/`, payload)
    .then((response) => response.data);
}

/** @param {string|number} id */
export function deleteWorkout(id) {
  return apiClient.delete(`/workouts/${id}/`).then((response) => response.data);
}

/** @param {string|number} id */
export function markWorkoutComplete(id) {
  return apiClient
    .post(`/workouts/${id}/complete/`)
    .then((response) => response.data);
}
