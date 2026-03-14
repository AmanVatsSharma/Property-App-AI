/**
 * @file index.tsx
 * @module app/(tabs)/more
 * @description More / Tools list screen; theme-aware.
 * @author BharatERP
 * @created 2025-03-10
 */

import { useTheme } from '@/components/providers/ThemeProvider';
import { useRouter } from 'expo-router';
import { View, Text, Pressable, ScrollView } from 'react-native';

const TOOLS = [
  { route: 'about' as const, label: 'About Us', desc: 'Mission, team, investors', icon: '🏢' },
  { route: 'emi-calculator' as const, label: 'EMI Calculator', desc: 'Loan & EMI calculator', icon: '📊' },
  { route: 'legal-checker' as const, label: 'Legal Checker', desc: 'RERA & document verification', icon: '📋' },
  { route: 'neighbourhood' as const, label: 'Neighbourhood Score', desc: 'Compare localities', icon: '📍' },
  { route: 'price-forecast' as const, label: 'Price Forecast', desc: 'AI price predictions', icon: '📈' },
];

export default function MoreIndexScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const bgMain = isDark ? 'bg-night' : 'bg-light-night';
  const bgCard = isDark ? 'bg-dark' : 'bg-light-dark';
  const borderCls = isDark ? 'border-border' : 'border-light-border';
  const textCls = isDark ? 'text-white' : 'text-light-heading';
  const textMuted = isDark ? 'text-text-muted' : 'text-light-text-muted';
  const tealCls = isDark ? 'text-teal' : 'text-light-teal';
  const signInCard = isDark ? 'bg-teal-dim border-teal/30' : 'bg-light-teal-dim border-light-teal/30';

  return (
    <ScrollView className={`flex-1 ${bgMain}`} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <Pressable
        onPress={() => router.push('/login')}
        className={`${signInCard} border rounded-xl p-4 mb-4 flex-row items-center gap-4`}
      >
        <Text className="text-2xl">🔐</Text>
        <View className="flex-1">
          <Text className={textCls + ' font-semibold'}>Sign in</Text>
          <Text className={`${textMuted} text-sm`}>Sign in with mobile OTP</Text>
        </View>
        <Text className={tealCls}>→</Text>
      </Pressable>
      {TOOLS.map((item) => (
        <Pressable
          key={item.route}
          onPress={() => router.push(`/more/${item.route}`)}
          className={`${bgCard} rounded-xl p-4 border ${borderCls} mb-3 flex-row items-center gap-4`}
        >
          <Text className="text-2xl">{item.icon}</Text>
          <View className="flex-1">
            <Text className={`${textCls} font-semibold`}>{item.label}</Text>
            <Text className={`${textMuted} text-sm`}>{item.desc}</Text>
          </View>
          <Text className={tealCls}>→</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
