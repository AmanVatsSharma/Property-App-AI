/**
 * @file modal.tsx
 * @module app
 * @description Generic info modal — used for context-specific overlays via router params.
 * @author BharatERP
 * @created 2026-03-26
 */

import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, ScrollView, View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/components/providers/ThemeProvider';

export default function ModalScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { title, body } = useLocalSearchParams<{ title?: string; body?: string }>();

  const bgMain = isDark ? 'bg-night' : 'bg-light-night';
  const bgCard = isDark ? 'bg-dark' : 'bg-light-dark';
  const borderCls = isDark ? 'border-border' : 'border-light-border';
  const textCls = isDark ? 'text-white' : 'text-light-heading';
  const textMuted = isDark ? 'text-text-muted' : 'text-light-text-muted';
  const tealCls = isDark ? 'text-teal' : 'text-light-teal';

  return (
    <SafeAreaView className={`flex-1 ${bgMain}`} edges={['top', 'bottom']}>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />

      <View className={`flex-row items-center justify-between px-4 py-3 border-b ${borderCls}`}>
        <Text className={`${textCls} font-bold text-lg`}>{title ?? 'Info'}</Text>
        <Pressable onPress={() => router.back()} className="p-1">
          <Text className={`${tealCls} text-base font-semibold`}>Close</Text>
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      >
        <View className={`${bgCard} rounded-2xl p-4 border ${borderCls}`}>
          <Text className={`${textMuted} text-sm leading-6`}>
            {body ?? 'No additional information available.'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
