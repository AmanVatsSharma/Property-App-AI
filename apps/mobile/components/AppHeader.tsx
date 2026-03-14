/**
 * @file AppHeader.tsx
 * @module components
 * @description Shared header for tab screens: location (left) and avatar menu with theme toggle (right); uses Ionicons.
 * @author BharatERP
 * @created 2025-03-14
 */

import { useTheme } from '@/components/providers/ThemeProvider';
import { useLocation } from '@/lib/location-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function AppHeader() {
  const insets = useSafeAreaInsets();
  const { theme, setTheme } = useTheme();
  const { locationLabel, openLocationSheet } = useLocation();
  const [avatarMenuVisible, setAvatarMenuVisible] = useState(false);

  const isDark = theme === 'dark';
  const bg = isDark ? 'bg-night' : 'bg-light-night';
  const borderCls = isDark ? 'border-border' : 'border-light-border';
  const textCls = isDark ? 'text-white' : 'text-light-heading';
  const textMuted = isDark ? 'text-text-muted' : 'text-light-text-muted';
  const tealCls = isDark ? 'text-teal' : 'text-light-teal';

  return (
    <View
      className={`${bg} border-b ${borderCls}`}
      style={{ paddingTop: insets.top, paddingBottom: 12, paddingHorizontal: 16 }}
    >
      <View className="flex-row items-center justify-between">
        <Pressable
          onPress={openLocationSheet}
          className="flex-row items-center gap-2 flex-1 mr-3"
          accessibilityLabel="Change location"
          accessibilityRole="button"
        >
          <Ionicons
            name="location-outline"
            size={20}
            color={isDark ? 'rgba(255,255,255,0.9)' : '#1a1d24'}
          />
          <Text className={`${textCls} font-medium flex-1`} numberOfLines={1}>
            {locationLabel}
          </Text>
          <Ionicons
            name="chevron-down"
            size={18}
            color={isDark ? 'rgba(255,255,255,0.45)' : '#5c6370'}
          />
        </Pressable>
        <Pressable
          onPress={() => setAvatarMenuVisible(true)}
          className="w-10 h-10 rounded-full bg-teal items-center justify-center"
          accessibilityLabel="Profile and settings"
          accessibilityRole="button"
        >
          <Ionicons
            name="person"
            size={22}
            color={isDark ? '#080c14' : '#ffffff'}
          />
        </Pressable>
      </View>

      <Modal
        visible={avatarMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAvatarMenuVisible(false)}
      >
        <Pressable
          className="flex-1 justify-end bg-black/50"
          onPress={() => setAvatarMenuVisible(false)}
        >
          <Pressable
            className={`${isDark ? 'bg-dark' : 'bg-light-dark'} rounded-t-2xl p-4 pb-8`}
            onPress={(e) => e.stopPropagation()}
            style={{ paddingBottom: Math.max(insets.bottom, 16) }}
          >
            <Text className={`${textCls} font-bold text-lg mb-4`}>Theme</Text>
            <View className="gap-2">
              <Pressable
                onPress={() => {
                  setTheme('light');
                  setAvatarMenuVisible(false);
                }}
                className={`flex-row items-center gap-3 py-3 px-4 rounded-xl ${theme === 'light' ? (isDark ? 'bg-teal-dim' : 'bg-light-teal-dim') : ''}`}
                accessibilityLabel="Switch to light theme"
                accessibilityRole="button"
              >
                <Ionicons
                  name="sunny"
                  size={20}
                  color={theme === 'light' ? (isDark ? '#00d4aa' : '#00b894') : (isDark ? 'rgba(255,255,255,0.45)' : '#5c6370')}
                />
                <Text className={theme === 'light' ? tealCls : textMuted}>Light</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setTheme('dark');
                  setAvatarMenuVisible(false);
                }}
                className={`flex-row items-center gap-3 py-3 px-4 rounded-xl ${theme === 'dark' ? (isDark ? 'bg-teal-dim' : 'bg-light-teal-dim') : ''}`}
                accessibilityLabel="Switch to dark theme"
                accessibilityRole="button"
              >
                <Ionicons
                  name="moon"
                  size={20}
                  color={theme === 'dark' ? (isDark ? '#00d4aa' : '#00b894') : (isDark ? 'rgba(255,255,255,0.45)' : '#5c6370')}
                />
                <Text className={theme === 'dark' ? tealCls : textMuted}>Dark</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
