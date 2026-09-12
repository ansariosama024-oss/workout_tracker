import apiClient from "./api";

/**
 * Exercise service: read-only wrapper around the Django Exercise catalog
 * API. Used by the workout builder's exercise selector to look up real
 * Exercise IDs (see components/workout/WorkoutForm.jsx).
 */

/** @param {Record<string, string|number>} [params] - search/filter query */
export function getExercises(params) {
  return apiClient
    .get("/exercises/", { params })
    .then((response) => response.data);
}

/** @param {string|number} id */
export function getExercise(id) {
  return apiClient.get(`/exercises/${id}/`).then((response) => response.data);
}
