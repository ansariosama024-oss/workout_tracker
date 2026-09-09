import apiClient from "./api";

/**
 * Authentication service interface.
 *
 * Thin wrappers around the Django JWT endpoints implemented in Backend
 * Phase 3. Each function returns the parsed response body; error handling
 * (mapping to a user-facing message) lives in getAuthErrorMessage below,
 * not here, so callers (AuthContext, the auth pages) stay simple.
 */

/** @param {{email: string, password: string}} credentials */
export function login(credentials) {
  return apiClient
    .post("/auth/login/", credentials)
    .then((response) => response.data); // -> { access, refresh, user }
}

/**
 * @param {{
 *   first_name: string,
 *   last_name: string,
 *   username: string,
 *   email: string,
 *   password: string,
 *   password_confirm: string,
 * }} data
 */
export function register(data) {
  return apiClient
    .post("/auth/register/", data)
    .then((response) => response.data); // -> { id, username, email, first_name, last_name }
}

/** @param {string|null} refreshTokenValue */
export function logout(refreshTokenValue) {
  return apiClient
    .post("/auth/logout/", { refresh: refreshTokenValue })
    .then((response) => response.data);
}

export function getCurrentUser() {
  return apiClient.get("/auth/me/").then((response) => response.data);
}

/** @param {string|null} refreshTokenValue */
export function refreshToken(refreshTokenValue) {
  return apiClient
    .post("/auth/token/refresh/", { refresh: refreshTokenValue })
    .then((response) => response.data); // -> { access, refresh? }
}

/**
 * Maps a caught error (typically an Axios error from one of the calls
 * above) to a short, user-facing message. Centralizing this means
 * Login/Register/ForgotPassword all render backend errors -- invalid
 * credentials, duplicate email, server errors, etc. -- consistently.
 */
export function getAuthErrorMessage(error) {
  const status = error?.response?.status;
  const data = error?.response?.data;

  if (status === 400 && data && typeof data === "object") {
    // DRF validation errors come back as { field: ["message", ...] } or
    // { non_field_errors: ["message"] }. Surface the first one found.
    const firstKey = Object.keys(data)[0];
    const firstValue = data[firstKey];
    const message = Array.isArray(firstValue) ? firstValue[0] : firstValue;
    if (message) return String(message);
  }

  const detail = data?.detail ?? data?.message;

  if (status === 401) {
    return detail || "Invalid email or password.";
  }
  if (status === 409) {
    return detail || "An account with these details already exists.";
  }
  if (status && status >= 500) {
    return "The server is temporarily unavailable. Please try again shortly.";
  }
  if (error?.message === "Network Error") {
    return "Couldn't reach the server. Check your connection and try again.";
  }

  return detail || "Something went wrong. Please try again.";
}
