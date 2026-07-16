import { createContext, useCallback, useEffect, useState } from 'react';
import { getMeRequest, loginRequest, logoutRequest, registerRequest } from '../api/auth';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // initial "am I logged in?" check

  // On app load, if we have a stored token, verify it against /auth/me
  // to implement persistent login. If there's no token, don't even try.
  useEffect(() => {
    const token = localStorage.getItem('ig_token');
    if (!token) {
      setLoading(false);
      return;
    }
    getMeRequest()
      .then((res) => setUser(res.data.user))
      .catch(() => {
        localStorage.removeItem('ig_token');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (identifier, password) => {
    const res = await loginRequest({ identifier, password });
    localStorage.setItem('ig_token', res.data.token);
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const res = await registerRequest(payload);
    localStorage.setItem('ig_token', res.data.token);
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } catch {
      // even if the network call fails, clear local session
    }
    localStorage.removeItem('ig_token');
    setUser(null);
  }, []);

  // Lets pages patch the cached user (e.g. after editing profile or
  // avatar) without a full refetch.
  const updateUser = useCallback((patch) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, isAuthenticated: !!user, login, register, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}
