/**
 * Centralized token storage.
 *
 * All access-token/refresh-token reads and writes go through this file so
 * no other module talks to localStorage directly. That keeps the storage
 * mechanism swappable later -- e.g. moving to an httpOnly cookie set by
 * the backend, which would change this file's internals without touching
 * any caller.
 *
 * Nothing is written here until a real login/register response exists.
 * There is no backend integration in this phase, so in practice these
 * keys stay empty for the lifetime of the app.
 */

const ACCESS_TOKEN_KEY = "workout_tracker.access_token";
const REFRESH_TOKEN_KEY = "workout_tracker.refresh_token";

export function getAccessToken() {
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token) {
  if (token) {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
  } else {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
}

export function getRefreshToken() {
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setRefreshToken(token) {
  if (token) {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, token);
  } else {
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

/** Convenience helper for setting both tokens after a successful login. */
export function setTokens({ access, refresh } = {}) {
  setAccessToken(access ?? null);
  setRefreshToken(refresh ?? null);
}

export function clearTokens() {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
}
