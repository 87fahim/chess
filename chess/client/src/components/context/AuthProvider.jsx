import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);           // { id, username, email, ... }
  const [roles, setRoles] = useState([]);           // [1000, 2000, ...]
  const [loading, setLoading] = useState(true);     // bootstrapping state

  // a small fetch wrapper with 401 -> refresh -> retry
  const apiFetch = useCallback(async (input, init = {}) => {
    const opts = { credentials: 'include', ...init }; // send cookies
    let res = await fetch(input, opts);
    if (res.status === 401) {
      // try refresh once
      const r = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' });
      if (r.ok) {
        res = await fetch(input, opts); // retry original
      }
    }
    return res;
  }, []);

  const me = useCallback(async () => {
    const res = await apiFetch('/api/auth/me');
    if (res.ok) {
      const data = await res.json();
      setUser(data.user ?? null);
      setRoles(Array.isArray(data.roles) ? data.roles : []);
    } else {
      setUser(null);
      setRoles([]);
    }
  }, [apiFetch]);

  const login = useCallback(async (username, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      credentials: 'include', // set HttpOnly refresh cookie
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    console.log(res.status)
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
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
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
    apiFetch,
    refresh: async () => { await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' }); await me(); },
  }), [user, roles, loading, login, logout, apiFetch, me]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
