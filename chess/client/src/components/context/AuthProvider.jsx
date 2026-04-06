import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../../utils/api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);           // { id, username, email, ... }
  const [roles, setRoles] = useState([]);           // [1000, 2000, ...]
  const [loading, setLoading] = useState(true);     // bootstrapping state

  const requestWithRefresh = useCallback(async (input, init = {}) => {
    let res = await apiFetch(input, init);
    if (res.status === 401) {
      const r = await apiFetch('/api/auth/refresh', { method: 'POST' });
      if (r.ok) {
        res = await apiFetch(input, init);
      }
    }
    return res;
  }, []);

  const me = useCallback(async () => {
    const res = await requestWithRefresh('/api/auth/me');
    if (res.ok) {
      const data = await res.json();
      setUser(data.user ?? null);
      setRoles(Array.isArray(data.roles) ? data.roles : []);
    } else {
      setUser(null);
      setRoles([]);
    }
  }, [requestWithRefresh]);

  const login = useCallback(async (username, password) => {
    const res = await apiFetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || 'Invalid credentials');
    }
    
    // body returns { user, roles } (no tokens to store)
    const data = await res.json();
    setUser(data.user ?? null);
    setRoles(Array.isArray(data.roles) ? data.roles : []);
  }, []);

  const logout = useCallback(async () => {
    await apiFetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setRoles([]);
  }, []);

  // bootstrap on first load
  useEffect(() => {
    (async () => {
      try {
        await me();
      } finally {
        setLoading(false);
      }
    })();
  }, [me]);

  const value = useMemo(() => ({
    user,
    roles,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    apiFetch: requestWithRefresh,
    refresh: async () => { await apiFetch('/api/auth/refresh', { method: 'POST' }); await me(); },
  }), [user, roles, loading, login, logout, requestWithRefresh, me]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
