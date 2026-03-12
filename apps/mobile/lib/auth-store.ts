/**
 * @file auth-store.ts
 * @module lib
 * @description Secure token storage for OTP sign-in; uses expo-secure-store.
 * @author BharatERP
 * @created 2025-03-12
 */

import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'urbannest_auth_token';

export async function getToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch {
    // ignore
  }
}

export async function getAuthHeaders(): Promise<Record<string, string> | undefined> {
  const token = await getToken();
  if (!token) return undefined;
  return { Authorization: `Bearer ${token}` };
}
