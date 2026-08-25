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
 * Shape is fully built out for the real Django JWT flow (user, tokens,
 * login/register/logout, token refresh, fetching the current user), but
 * nothing here fakes success:
 *
 *   - Initial state is always unauthenticated (user: null, no tokens).
 *   - login()/register()/refreshAccessToken()/fetchCurrentUser() all call
 *     authService, which rejects with AuthNotConnectedError in this
 *     phase -- so none of them can ever mark the app as authenticated.
 *   - logout() clears local state and best-effort notifies the backend,
 *     but never pretends a session existed.
 *
 * Initialization (the `isLoading` flag below) stands in for the future
 * "check stored tokens -> refresh if needed -> fetch /auth/me/" sequence.
 * Since no tokens are ever stored yet, it resolves to unauthenticated
 * immediately, without making any network calls.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessTokenState] = useState(() => getAccessToken());
  const [refreshTokenValue, setRefreshTokenValue] = useState(() =>
    getRefreshToken()
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Future: if an access token is already stored, this is where it
    // would be validated (and refreshed if expired) before calling
    // fetchCurrentUser() to repopulate `user`. There is nothing to
    // validate yet since tokenStorage is never written to in this phase,
    // so initialization always settles on "unauthenticated".
    setIsLoading(false);
  }, []);

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

  /** @param {{email: string, password: string}} credentials */
  const login = useCallback(
    async (credentials) => {
      const data = await authService.login(credentials);
      // Only reached once the backend is connected and login succeeds.
      applySession(data);
      return data;
    },
    [applySession]
  );

  /** @param {object} payload */
  const register = useCallback(
    async (payload) => {
      const data = await authService.register(payload);
      // Only reached once the backend is connected and registration
      // succeeds. Some APIs log the user in immediately on register and
      // some don't; if the response includes tokens, honor them.
      if (data?.access) {
        applySession(data);
      }
      return data;
    },
    [applySession]
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout(getRefreshToken());
    } catch {
      // Best-effort: even if the backend call fails (or, in this phase,
      // is never actually connected), the local session still clears.
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const refreshAccessToken = useCallback(async () => {
    const data = await authService.refreshToken(getRefreshToken());
    setTokens({ access: data?.access, refresh: refreshTokenValue });
    setAccessTokenState(data?.access ?? null);
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
