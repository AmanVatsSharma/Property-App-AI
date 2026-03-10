/**
 * @file index.tsx
 * @module app/(tabs)/more
 * @description More / Tools list screen
 * @author BharatERP
 * @created 2025-03-10
 */

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

  return (
    <ScrollView className="flex-1 bg-night" contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      {TOOLS.map((item) => (
        <Pressable
          key={item.route}
          onPress={() => router.push(`/more/${item.route}`)}
          className="bg-dark rounded-xl p-4 border border-border mb-3 flex-row items-center gap-4"
        >
          <Text className="text-2xl">{item.icon}</Text>
          <View className="flex-1">
            <Text className="text-white font-semibold">{item.label}</Text>
            <Text className="text-text-muted text-sm">{item.desc}</Text>
          </View>
          <Text className="text-teal">→</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
