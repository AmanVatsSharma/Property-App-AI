/**
 * @file _layout.tsx
 * @module app/(tabs)/more
 * @description Stack layout for More (tools + about)
 * @author BharatERP
 * @created 2025-03-10
 */

import { Stack } from 'expo-router';

export default function MoreLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#080c14' },
        headerTintColor: '#00d4aa',
        headerTitleStyle: { color: 'rgba(255,255,255,0.9)', fontWeight: '600' },
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
