/**
 * @file _layout.tsx
 * @module app/(tabs)
 * @description Tab layout: Home, Search, Post, More; theme-aware tab bar and AppHeader; Ionicons for tab icons.
 * @author BharatERP
 * @created 2025-03-10
 */

import { AppHeader } from '@/components/AppHeader';
import { useTheme } from '@/components/providers/ThemeProvider';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';

const TAB_ICON_SIZE = 22;

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
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={TAB_ICON_SIZE} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'search' : 'search-outline'} size={TAB_ICON_SIZE} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="post"
        options={{
          title: 'Post',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'add-circle' : 'add-circle-outline'} size={TAB_ICON_SIZE} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name="ellipsis-horizontal" size={TAB_ICON_SIZE} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
