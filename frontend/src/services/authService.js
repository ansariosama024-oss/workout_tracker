/**
 * Thrown by every function in this file while the Django JWT endpoints
 * aren't connected yet. AuthContext catches this specific error and
 * surfaces an honest "not connected" message instead of ever pretending
 * an authentication operation succeeded.
 */
export class AuthNotConnectedError extends Error {
  constructor(
    message = "Authentication isn't connected to the backend yet."
  ) {
    super(message);
    this.name = "AuthNotConnectedError";
  }
}

/**
 * Authentication service interface.
 *
 * Every function below is shaped exactly like its future implementation
 * (same name, same params, same return shape) but does not perform any
 * network request in this phase -- each one rejects with
 * AuthNotConnectedError instead. The real Axios call each function will
 * make is written out in a comment directly above the rejection, so
 * enabling backend integration later is a one-line swap per function.
 */

/** @param {{email: string, password: string}} credentials */
export function login(credentials) {
  void credentials;
  // return apiClient
  //   .post("/auth/login/", credentials)
  //   .then((response) => response.data); // -> { user, access, refresh }
  return Promise.reject(new AuthNotConnectedError());
}

/**
 * @param {{
 *   first_name: string,
 *   last_name: string,
 *   username: string,
 *   email: string,
 *   password: string,
 * }} data
 */
export function register(data) {
  void data;
  // return apiClient
  //   .post("/auth/register/", data)
  //   .then((response) => response.data); // -> { user, access, refresh }
  return Promise.reject(new AuthNotConnectedError());
}

/** @param {string|null} refreshToken */
export function logout(refreshToken) {
  void refreshToken;
  // return apiClient
  //   .post("/auth/logout/", { refresh: refreshToken })
  //   .then((response) => response.data);
  return Promise.reject(new AuthNotConnectedError());
}

export function getCurrentUser() {
  // return apiClient.get("/auth/me/").then((response) => response.data);
  return Promise.reject(new AuthNotConnectedError());
}

/** @param {string|null} refreshToken */
export function refreshToken(refreshToken_) {
  void refreshToken_;
  // return apiClient
  //   .post("/auth/token/refresh/", { refresh: refreshToken_ })
  //   .then((response) => response.data); // -> { access }
  return Promise.reject(new AuthNotConnectedError());
}

/**
 * Maps a caught error (an AuthNotConnectedError today, or a real Axios
 * error once the backend is connected) to a short, user-facing message.
 * Centralizing this means Login/Register/ForgotPassword all render
 * backend errors -- invalid credentials, duplicate email, server errors,
 * etc. -- consistently once those errors can actually occur.
 */
export function getAuthErrorMessage(error) {
  if (error instanceof AuthNotConnectedError) {
    return error.message;
  }

  const status = error?.response?.status;
  const detail =
    error?.response?.data?.detail ?? error?.response?.data?.message;

  if (status === 400) {
    return detail || "Please check the highlighted fields and try again.";
  }
  if (status === 401) {
    return "Invalid email or password.";
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
