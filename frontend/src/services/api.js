import axios from "axios";

import { getAccessToken } from "../utils/tokenStorage";

/**
 * Shared Axios instance used by every service module. Base URL comes from
 * the environment so it can point at different backends per environment
 * without a code change.
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Attaches the stored access token to every outgoing request, once one
 * exists. tokenStorage stays empty in this phase (no login flow writes to
 * it yet), so this interceptor is inert today and only becomes active
 * once real authentication is wired up.
 */
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Response interceptor placeholder for future 401 handling.
 *
 * Once JWT integration lands, a 401 here should attempt a single token
 * refresh (via authService.refreshToken) and retry the original request,
 * falling back to a forced logout if the refresh itself fails. That
 * retry/refresh logic is intentionally NOT implemented yet: with no
 * access token ever set, no request in this phase can produce a 401 from
 * an expired token, so there's nothing for it to do safely. Leaving it as
 * a pass-through avoids building refresh logic that can't be exercised or
 * tested until the backend exists.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default apiClient;
