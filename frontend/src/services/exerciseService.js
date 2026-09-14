import apiClient from "./api";

/**
 * Exercise service: read-only wrapper around the Django Exercise catalog
 * API.
 */

/** @param {Record<string, string|number>} [params] - search/filter query */
export function getExercises(params) {
  return apiClient
    .get("/exercises/", { params })
    .then((response) => response.data);
}

/** @param {string|number} id */
export function getExercise(id) {
  return apiClient
    .get(`/exercises/${id}/`)
    .then((response) => response.data);
}

/**
 * Convert exercise API errors into a user-friendly message.
 */
export function getExerciseErrorMessage(error) {
  if (error?.response?.data) {
    const data = error.response.data;

    if (typeof data === "string") {
      return data;
    }

    if (data.detail) {
      return data.detail;
    }

    if (data.message) {
      return data.message;
    }

    if (data.error) {
      return data.error;
    }

    if (typeof data === "object") {
      const firstError = Object.values(data).flat().find(Boolean);

      if (firstError) {
        return String(firstError);
      }
    }
  }

  if (error?.message) {
    return error.message;
  }

  return "Unable to load exercises. Please try again.";
}