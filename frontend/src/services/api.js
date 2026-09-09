import axios from "axios";

import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "../utils/tokenStorage";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Shared Axios instance used by every service module. Base URL comes from
 * the environment so it can point at different backends per environment
 * without a code change.
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/** Attaches the stored access token to every outgoing request, once one exists. */
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Endpoints that should never trigger a refresh-and-retry cycle on 401:
// login/register are public (a 401 there just means "check your input"),
// and retrying the refresh endpoint itself on its own failure would loop.
const AUTH_ENDPOINTS_WITHOUT_REFRESH = [
  "/auth/login/",
  "/auth/register/",
  "/auth/token/refresh/",
];

function isAuthEndpointWithoutRefresh(url = "") {
  return AUTH_ENDPOINTS_WITHOUT_REFRESH.some((path) => url.includes(path));
}

// Multiple requests can 401 at roughly the same time (e.g. a page that
// fires several API calls at once after the access token has expired).
// Sharing one in-flight refresh promise means they all wait on a single
// POST /auth/token/refresh/ call instead of each firing their own.
let refreshPromise = null;

function performTokenRefresh() {
  const refreshValue = getRefreshToken();
  if (!refreshValue) {
    return Promise.reject(new Error("No refresh token available."));
  }

  // Plain axios (not apiClient) so this call never runs through the
  // response interceptor below -- it must not be able to trigger another
  // refresh attempt on its own failure.
  return axios
    .post(`${API_BASE_URL}/auth/token/refresh/`, { refresh: refreshValue })
    .then((response) => {
      const { access, refresh } = response.data;
      // The backend rotates refresh tokens (ROTATE_REFRESH_TOKENS=True),
      // so a new refresh value is normally returned too; fall back to the
      // existing one if not.
      setTokens({ access, refresh: refresh ?? refreshValue });
      return access;
    });
}

/**
 * On a 401 from an expired access token, attempt exactly one silent
 * refresh-and-retry per request (guarded by `_retry`), then give up.
 * If the refresh itself fails (expired/blacklisted refresh token),
 * clear stored tokens and notify the rest of the app via a DOM event --
 * AuthContext listens for this to reset to a logged-out state, which in
 * turn makes ProtectedRoute redirect to /login on the next render.
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (
      status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isAuthEndpointWithoutRefresh(originalRequest.url ?? "") ||
      !getRefreshToken()
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = performTokenRefresh().finally(() => {
          refreshPromise = null;
        });
      }
      const newAccessToken = await refreshPromise;
      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      clearTokens();
      window.dispatchEvent(new Event("auth:session-expired"));
      return Promise.reject(refreshError);
    }
  }
);

export default apiClient;
