import apiClient from "./api";

/**
 * Exercise library service interface, ready for backend integration in a
 * later phase. Not yet called from any page -- the workout form currently
 * uses utils/tempExerciseOptions.js instead.
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
