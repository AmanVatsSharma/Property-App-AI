/**
 * @file ThemeProvider.tsx
 * @module providers
 * @description Theme context with persistence (urbannest-theme); syncs with NativeWind colorScheme.
 * @author BharatERP
 * @created 2025-03-14
 */

import { useColorScheme } from 'nativewind';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getStoredTheme, setStoredTheme, type ThemeMode } from '@/lib/theme-storage';

type ThemeContextValue = {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  isDark: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('dark');
  const [hydrated, setHydrated] = useState(false);
  const { setColorScheme, colorScheme } = useColorScheme();

  useEffect(() => {
    getStoredTheme().then((stored) => {
      if (stored) {
        setThemeState(stored);
        setColorScheme(stored);
      }
      setHydrated(true);
    });
  }, [setColorScheme]);

  const setTheme = useCallback(
    (next: ThemeMode) => {
      setThemeState(next);
      setColorScheme(next);
      setStoredTheme(next);
    },
    [setColorScheme]
  );

  const resolvedScheme = hydrated ? theme : (colorScheme ?? 'dark');
  const isDark = resolvedScheme === 'dark';

  const value: ThemeContextValue = {
    theme: resolvedScheme,
    setTheme,
    isDark,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
