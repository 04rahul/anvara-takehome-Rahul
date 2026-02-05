'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'anvara.theme';

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
}

function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // IMPORTANT: keep initial state identical on server + client to avoid hydration mismatches.
  // We then sync to the pre-hydration <html data-theme="..."> in an effect.
  const [theme, setThemeState] = useState<Theme>('light');

  useEffect(() => {
    // Initialize theme on the client.
    const domTheme = document.documentElement.dataset.theme;
    const fromDom: Theme | null =
      domTheme === 'light' || domTheme === 'dark' ? domTheme : null;
    const saved = (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? null;
    const fromStorage: Theme | null = saved === 'light' || saved === 'dark' ? saved : null;
    const initial = fromDom ?? fromStorage ?? getSystemTheme();
    setThemeState(initial);
    applyTheme(initial);
    localStorage.setItem(STORAGE_KEY, initial);
  }, []);

  const setTheme = (next: Theme) => {
    setThemeState(next);
    applyTheme(next);
    localStorage.setItem(STORAGE_KEY, next);
  };

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme,
      toggleTheme: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within <ThemeProvider>');
  }
  return ctx;
}

