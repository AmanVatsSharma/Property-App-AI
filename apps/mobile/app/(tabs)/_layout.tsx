/**
 * @file _layout.tsx
 * @module app/(tabs)
 * @description Tab layout: Home, Search, Post, More
 * @author BharatERP
 * @created 2025-03-10
 */

import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#0f1623', borderTopColor: 'rgba(255,255,255,0.06)' },
        tabBarActiveTintColor: '#00d4aa',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.45)',
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
