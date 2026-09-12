/**
 * Maps a caught Axios error to a short, user-facing message, without ever
 * exposing raw backend stack traces or debugging output. Shared by every
 * service module so error rendering is consistent across auth, workouts,
 * and anything added later.
 *
 * @param {*} error - typically an Axios error
 * @param {{unauthorizedMessage?: string}} [options]
 */
export function parseApiErrorMessage(error, options = {}) {
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
    return detail || options.unauthorizedMessage || "Invalid email or password.";
  }
  if (status === 403) {
    return detail || "You don't have permission to do that.";
  }
  if (status === 404) {
    return detail || "That couldn't be found.";
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

/**
 * Extracts a { fieldName: "message" } map from a DRF 400 validation error,
 * for wiring backend errors directly into a form's own error state (e.g.
 * react-hook-form's setError). Non-field errors (arrays, non_field_errors)
 * are omitted here -- callers should fall back to parseApiErrorMessage
 * for those.
 */
export function getFieldErrors(error) {
  const status = error?.response?.status;
  const data = error?.response?.data;

  if (status !== 400 || !data || typeof data !== "object") {
    return {};
  }

  const fieldErrors = {};
  for (const [key, value] of Object.entries(data)) {
    if (key === "non_field_errors") continue;
    const message = Array.isArray(value) ? value[0] : value;
    if (typeof message === "string") {
      fieldErrors[key] = message;
    }
  }
  return fieldErrors;
}
