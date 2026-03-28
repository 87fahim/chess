import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export const ThemeContext = createContext(null);

const THEME_OPTIONS = ['light', 'dark'];

function safeTheme(name) {
  return THEME_OPTIONS.includes(name) ? name : 'light';
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      const saved = window.localStorage.getItem('theme');
      if (THEME_OPTIONS.includes(saved)) return saved;
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  const setTheme = useCallback((newTheme) => {
    const next = safeTheme(newTheme);
    setThemeState(next);
    document.body.setAttribute('data-theme', next);
    try {
      window.localStorage.setItem('theme', next);
    } catch {
      // ignore storage errors
    }
  }, []);

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  const [themeColors, setThemeColors] = useState({
    accent: 'hsl(209, 80%, 46%)',
    bg: 'hsl(0 0% 90%)',
    text: 'hsl(0 0% 5%)'
  });

  useEffect(() => {
    const style = getComputedStyle(document.body);
    setThemeColors({
      accent: style.getPropertyValue('--accent').trim() || '#0066cc',
      bg: style.getPropertyValue('--bg').trim() || '#ffffff',
      text: style.getPropertyValue('--text').trim() || '#000000',
      border: style.getPropertyValue('--border').trim() || '#ddd'
    });
  }, [theme]);

  const value = useMemo(() => ({ theme, setTheme, themeColors }), [theme, setTheme, themeColors]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}
