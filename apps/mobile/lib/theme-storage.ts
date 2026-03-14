/**
 * @file theme-storage.ts
 * @module lib
 * @description Persists theme preference (light/dark) to AsyncStorage; key matches web (urbannest-theme).
 * @author BharatERP
 * @created 2025-03-14
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_STORAGE_KEY = 'urbannest-theme';

export type ThemeMode = 'light' | 'dark';

export async function getStoredTheme(): Promise<ThemeMode | null> {
  try {
    const value = await AsyncStorage.getItem(THEME_STORAGE_KEY);
    if (value === 'light' || value === 'dark') return value;
    return null;
  } catch {
    return null;
  }
}

export async function setStoredTheme(theme: ThemeMode): Promise<void> {
  try {
    await AsyncStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // ignore
  }
}
