/**
 * @file _layout.tsx
 * @module app/(tabs)/more
 * @description Stack layout for More (tools + about); theme-aware header.
 * @author BharatERP
 * @created 2025-03-10
 */

import { useTheme } from '@/components/providers/ThemeProvider';
import { Stack } from 'expo-router';

export default function MoreLayout() {
  const { isDark } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: isDark ? '#080c14' : '#f5f7fa' },
        headerTintColor: isDark ? '#00d4aa' : '#00b894',
        headerTitleStyle: { color: isDark ? 'rgba(255,255,255,0.9)' : '#1a1d24', fontWeight: '600' },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Tools & More' }} />
      <Stack.Screen name="about" options={{ title: 'About Us' }} />
      <Stack.Screen name="emi-calculator" options={{ title: 'EMI Calculator' }} />
      <Stack.Screen name="legal-checker" options={{ title: 'Legal Checker' }} />
      <Stack.Screen name="neighbourhood" options={{ title: 'Neighbourhood Score' }} />
      <Stack.Screen name="price-forecast" options={{ title: 'Price Forecast' }} />
    </Stack>
  );
}
