/**
 * @file _layout.tsx
 * @module app/(tabs)
 * @description Tab layout: Home, Search, Post, More; theme-aware tab bar and AppHeader.
 * @author BharatERP
 * @created 2025-03-10
 */

import { AppHeader } from '@/components/AppHeader';
import { useTheme } from '@/components/providers/ThemeProvider';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function TabLayout() {
  const { isDark } = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        header: () => <AppHeader />,
        tabBarStyle: {
          backgroundColor: isDark ? '#0f1623' : '#eef1f5',
          borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)',
        },
        tabBarActiveTintColor: isDark ? '#00d4aa' : '#00b894',
        tabBarInactiveTintColor: isDark ? 'rgba(255,255,255,0.45)' : '#5c6370',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🔍</Text>,
        }}
      />
      <Tabs.Screen
        name="post"
        options={{
          title: 'Post',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>📝</Text>,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>⋯</Text>,
        }}
      />
    </Tabs>
  );
}
