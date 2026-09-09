import { createContext, useCallback, useEffect, useMemo, useState } from "react";

import * as authService from "../services/authService";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from "../utils/tokenStorage";

export const AuthContext = createContext(undefined);

/**
 * Authentication context.
 *
 * Wraps the real Django JWT endpoints (see services/authService.js):
 * register/login/logout/refresh/me. Session state (user + tokens) is
 * restored on startup from tokenStorage, and kept in sync with a single
 * source of truth here so every consumer (Sidebar, ProtectedRoute,
 * ProfilePage, ...) sees the same authenticated/unauthenticated state.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessTokenState] = useState(() => getAccessToken());
  const [refreshTokenValue, setRefreshTokenValue] = useState(() =>
    getRefreshToken()
  );
  const [isLoading, setIsLoading] = useState(true);

  const applySession = useCallback((data) => {
    setTokens({ access: data?.access, refresh: data?.refresh });
    setAccessTokenState(data?.access ?? null);
    setRefreshTokenValue(data?.refresh ?? null);
    setUser(data?.user ?? null);
  }, []);

  const clearSession = useCallback(() => {
    clearTokens();
    setAccessTokenState(null);
    setRefreshTokenValue(null);
    setUser(null);
  }, []);

  // On startup: if a token is already stored, validate it by fetching the
  // current user. api.js's response interceptor transparently refreshes
  // an expired access token and retries once, so this single call covers
  // "token still valid", "token expired but refresh works", and "nothing
  // works -> log out" in one path. With no stored token at all, this
  // resolves to unauthenticated immediately, with no network call.
  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      if (!getAccessToken()) {
        setIsLoading(false);
        return;
      }

      try {
        const currentUser = await authService.getCurrentUser();
        if (!cancelled) setUser(currentUser);
      } catch {
        if (!cancelled) clearSession();
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    initialize();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // api.js dispatches this when a background request's silent token
  // refresh fails (refresh token expired/blacklisted). Resetting session
  // state here is what makes ProtectedRoute redirect to /login on the
  // next render -- no other wiring is needed.
  useEffect(() => {
    window.addEventListener("auth:session-expired", clearSession);
    return () => window.removeEventListener("auth:session-expired", clearSession);
  }, [clearSession]);

  /** @param {{email: string, password: string}} credentials */
  const login = useCallback(
    async (credentials) => {
      const data = await authService.login(credentials);
      applySession(data);
      // The login response's user is intentionally minimal (id, username,
      // email, first_name, last_name). Fetch the full profile
      // (date_joined, updated_at) in the background; if it fails, the
      // minimal user from above is still in place.
      authService
        .getCurrentUser()
        .then(setUser)
        .catch(() => {});
      return data;
    },
    [applySession]
  );

  /** @param {object} payload */
  const register = useCallback(async (payload) => {
    // Registration never logs the user in (see backend RegisterView) --
    // it only returns the created user, with no tokens. The caller
    // (RegisterPage) is responsible for redirecting to /login afterward.
    return authService.register(payload);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout(getRefreshToken());
    } catch {
      // Best-effort: even if the backend call fails (token already
      // expired, network error, etc.), the local session still clears.
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const refreshAccessToken = useCallback(async () => {
    const data = await authService.refreshToken(getRefreshToken());
    // The backend rotates refresh tokens, so store the new one when
    // present rather than assuming the old one is still valid.
    setTokens({ access: data?.access, refresh: data?.refresh ?? refreshTokenValue });
    setAccessTokenState(data?.access ?? null);
    if (data?.refresh) setRefreshTokenValue(data.refresh);
    return data;
  }, [refreshTokenValue]);

  const fetchCurrentUser = useCallback(async () => {
    const data = await authService.getCurrentUser();
    setUser(data ?? null);
    return data;
  }, []);

  const value = useMemo(
    () => ({
      user,
      accessToken,
      refreshToken: refreshTokenValue,
      isAuthenticated: Boolean(user && accessToken),
      isLoading,
      login,
      register,
      logout,
      refreshAccessToken,
      fetchCurrentUser,
    }),
    [
      user,
      accessToken,
      refreshTokenValue,
      isLoading,
      login,
      register,
      logout,
      refreshAccessToken,
      fetchCurrentUser,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
