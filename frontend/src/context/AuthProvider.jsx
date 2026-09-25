import { useCallback, useEffect, useMemo, useState } from 'react';
import { authApi } from '../services/api';
import { clearAuth, getStoredUser, getToken, setAuth, setStoredUser } from '../utils/token';
import { AuthContext } from './AuthContext';

/**
 * Holds the current session (user + JWT), re-validates the stored token
 * against the backend on mount, and exposes login/register/logout actions.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [token, setToken] = useState(getToken);
  const [initializing, setInitializing] = useState(true);

  // Re-validate a persisted token so a refresh keeps the session valid
  // (and kicks out users whose token was revoked/expired).
  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      if (!getToken()) {
        setInitializing(false);
        return;
      }
      try {
        const { data } = await authApi.me();
        if (cancelled) return;
        setStoredUser(data.data);
        setUser(data.data);
      } catch {
        if (cancelled) return;
        clearAuth();
        setToken(null);
        setUser(null);
      } finally {
        if (!cancelled) setInitializing(false);
      }
    }

    restoreSession();

    // Any 401 emitted by the axios interceptor clears the session.
    const onUnauthorized = () => {
      setToken(null);
      setUser(null);
    };
    window.addEventListener('auth:unauthorized', onUnauthorized);

    return () => {
      cancelled = true;
      window.removeEventListener('auth:unauthorized', onUnauthorized);
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const { data } = await authApi.login(credentials);
    setAuth(data.token, data.user);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await authApi.register(payload);
    return data.data;
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      initializing,
      isAuthenticated: Boolean(token && user),
      isAdmin: user?.role === 'ADMIN',
      login,
      register,
      logout,
    }),
    [user, token, initializing, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}