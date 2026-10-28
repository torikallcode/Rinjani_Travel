import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api, { clearAuth, getStoredUser, getToken, storeAuth } from '../services/api';

const AuthContext = createContext(null);

export const ADMIN_ROLES = ['admin_ops', 'admin_content', 'super_admin'];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [loading, setLoading] = useState(Boolean(getToken()));

  const refresh = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      setLoading(false);
      return null;
    }
    try {
      const data = await api.get('/me');
      const nextUser = data?.user || null;
      setUser(nextUser);
      if (nextUser) storeAuth(getToken(), nextUser);
      return nextUser;
    } catch {
      clearAuth();
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const onUnauthorized = () => setUser(null);
    window.addEventListener('rinjani:unauthorized', onUnauthorized);
    return () => window.removeEventListener('rinjani:unauthorized', onUnauthorized);
  }, [refresh]);

  const login = useCallback(async (email, password) => {
    const data = await api.post('/auth/login', { email, password }, { auth: false });
    storeAuth(data.token, data.user);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const data = await api.post('/auth/register', payload, { auth: false });
    storeAuth(data.token, data.user);
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
  }, []);

  const updateUser = useCallback((nextUser) => {
    setUser(nextUser);
    storeAuth(getToken(), nextUser);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      isAdmin: Boolean(user && ADMIN_ROLES.includes(user.role)),
      isSuperAdmin: user?.role === 'super_admin',
      login,
      register,
      logout,
      refresh,
      updateUser,
    }),
    [user, loading, login, register, logout, refresh, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
