import apiClient from "./api";

/**
 * Reporting/analytics service interface, ready for backend integration in
 * a later phase. Not yet called from any page -- Dashboard and Reports
 * currently render loading/empty states instead.
 */

export function getDashboardStats() {
  return apiClient.get("/reports/dashboard/").then((response) => response.data);
}

/** @param {Record<string, string>} [params] - e.g. { range: "8w" } */
export function getWeeklyWorkoutReport(params) {
  return apiClient
    .get("/reports/weekly/", { params })
    .then((response) => response.data);
}

/** @param {Record<string, string>} [params] - e.g. { range: "6m" } */
export function getMonthlyWorkoutReport(params) {
  return apiClient
    .get("/reports/monthly/", { params })
    .then((response) => response.data);
}

/** @param {Record<string, string>} [params] */
export function getTrainingVolumeReport(params) {
  return apiClient
    .get("/reports/training-volume/", { params })
    .then((response) => response.data);
}

export function getExerciseFrequencyReport() {
  return apiClient
    .get("/reports/exercise-frequency/")
    .then((response) => response.data);
}
