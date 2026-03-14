/**
 * @file [id].tsx
 * @module app/property
 * @description Property detail screen; fetches from API when configured; theme-aware.
 * @author BharatERP
 * @created 2025-03-10
 */

import { useTheme } from '@/components/providers/ThemeProvider';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, View, Text, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchProperty, type ApiProperty } from '@/lib/graphql-client';

function formatPrice(price: number): string {
  return price >= 1_00_00_000 ? `₹${(price / 1_00_00_000).toFixed(2)} Cr` : `₹${(price / 1_00_000).toFixed(0)} L`;
}

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isDark } = useTheme();
  const [property, setProperty] = useState<ApiProperty | null | undefined>(undefined);

  const bgMain = isDark ? 'bg-night' : 'bg-light-night';
  const bgCard = isDark ? 'bg-dark' : 'bg-light-dark';
  const bgCard2 = isDark ? 'bg-dark-2' : 'bg-light-dark-2';
  const borderCls = isDark ? 'border-border' : 'border-light-border';
  const textCls = isDark ? 'text-white' : 'text-light-heading';
  const textMuted = isDark ? 'text-text-muted' : 'text-light-text-muted';
  const tealCls = isDark ? 'text-teal' : 'text-light-teal';
  const greenCls = isDark ? 'text-green' : 'text-light-green';
  const goldCls = isDark ? 'text-gold' : 'text-light-gold';
  const indicatorColor = isDark ? '#00d4aa' : '#00b894';

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      const p = await fetchProperty(id);
      if (!cancelled) setProperty(p ?? null);
    })();
    return () => { cancelled = true; };
  }, [id]);

  const p = property ?? undefined;
  const loading = property === undefined && id != null;
  const title = p?.title ?? 'Sobha City Vista — 4 BHK Ultra Luxury Apartment';
  const location = p?.location ?? 'Sector 108, Dwarka Expressway, Gurgaon';
  const priceStr = p ? formatPrice(p.price) : '₹2.85 Cr';
  const pricePerSqft = p?.areaSqft ? `₹${Math.round(p.price / p.areaSqft).toLocaleString()} / sq.ft` : '₹10,000 / sq.ft';
  const aiScore = p?.aiScore ?? 94;
  const aiTip = p?.aiTip ?? 'Top 6% in locality';
  const specs = p
    ? [
        { icon: '🛏', val: `${p.bedrooms} BHK`, label: 'Bedrooms' },
        { icon: '🚿', val: String(p.bathrooms), label: 'Bathrooms' },
        { icon: '📐', val: p.areaSqft?.toLocaleString() ?? '—', label: 'Sq.ft' },
        { icon: '📅', val: p.status ?? 'Ready', label: 'Status' },
      ]
    : [
        { icon: '🛏', val: '4 BHK', label: 'Bedrooms' },
        { icon: '🚿', val: '4', label: 'Bathrooms' },
        { icon: '📐', val: '2,850', label: 'Sq.ft' },
        { icon: '📅', val: 'Ready', label: 'Status' },
      ];
  const overview = [
    { label: 'Project', val: p?.title ?? 'Sobha City Vista', green: false },
    { label: 'Location', val: p?.location ?? 'Sector 108', green: false },
    { label: 'RERA No.', val: 'HRERA-PKL-NOV-...', green: true },
  ];

  if (loading) {
    return (
      <SafeAreaView className={`flex-1 ${bgMain}`} edges={['top']}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={indicatorColor} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={`flex-1 ${bgMain}`} edges={['top']}>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
        <View className={`px-4 pt-4 pb-4 border-b ${borderCls}`}>
          <View className="flex-row flex-wrap gap-1 mb-2">
            <Text className={`${textMuted} text-sm`} onPress={() => router.back()}>
              Home / Buy in Gurgaon / Sector 108 /
            </Text>
            <Text className={`${textMuted} text-sm`}>{title}</Text>
          </View>
          <View className={`${bgCard2} rounded-2xl h-48 items-center justify-center mb-4`}>
            <Text className="text-6xl">🏡</Text>
            <View className="flex-row gap-2 mt-2">
              <Pressable className={`${bgCard} px-3 py-1.5 rounded-lg`}>
                <Text className={`${textCls} text-sm`}>📸 All Photos (24)</Text>
              </Pressable>
              <Pressable className={`${bgCard} px-3 py-1.5 rounded-lg`}>
                <Text className={`${textCls} text-sm`}>🎬 Video Tour</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View className="px-4 pt-4">
          <View className="flex-row flex-wrap gap-2 mb-3">
            <View className={`${isDark ? 'bg-gold-dim' : 'bg-light-teal-dim'} px-2 py-0.5 rounded`}>
              <Text className={`${goldCls} text-xs font-semibold`}>⭐ Premium</Text>
            </View>
            <View className={`${isDark ? 'bg-teal-dim' : 'bg-light-teal-dim'} px-2 py-0.5 rounded`}>
              <Text className={`${tealCls} text-xs font-semibold`}>✦ AI Pick</Text>
            </View>
            <View className={`${isDark ? 'bg-green-dim' : 'bg-light-teal-dim'} px-2 py-0.5 rounded`}>
              <Text className={`${greenCls} text-xs font-semibold`}>✓ RERA Verified</Text>
            </View>
          </View>
          <Text className={`${textCls} text-xl font-bold mb-1`}>{title}</Text>
          <Text className={`${textMuted} text-sm mb-3`}>📍 {location}</Text>
          <View className="flex-row justify-between items-start mb-4">
            <View>
              <Text className={`${tealCls} text-2xl font-bold`}>{priceStr}</Text>
              <Text className={`${textMuted} text-sm`}>{pricePerSqft}</Text>
            </View>
            <View className="flex-row gap-2">
              <Pressable className={`${bgCard2} px-3 py-2 rounded-lg border ${borderCls}`}>
                <Text className={`${textCls} text-sm`}>♡ Save</Text>
              </Pressable>
              <Pressable className={`${bgCard2} px-3 py-2 rounded-lg border ${borderCls}`}>
                <Text className={`${textCls} text-sm`}>⤴ Share</Text>
              </Pressable>
            </View>
          </View>

          <View className="flex-row flex-wrap gap-3 mb-6">
            {specs.map((s) => (
              <View key={s.label} className={`${bgCard} rounded-xl px-3 py-2 border ${borderCls} items-center min-w-[70px]`}>
                <Text className="text-lg">{s.icon}</Text>
                <Text className={`${textCls} font-semibold text-sm`}>{s.val}</Text>
                <Text className={`${textMuted} text-xs`}>{s.label}</Text>
              </View>
            ))}
          </View>

          <View className={`${bgCard} rounded-xl p-4 border ${borderCls} mb-4`}>
            <Text className={`${textCls} font-bold text-lg mb-3`}>Overview</Text>
            {overview.map((o) => (
              <View key={o.label} className={`flex-row justify-between py-2 border-b ${borderCls} last:border-0`}>
                <Text className={`${textMuted} text-sm`}>{o.label}</Text>
                <Text className={`text-sm font-medium ${o.green ? greenCls : textCls}`}>{o.val}</Text>
              </View>
            ))}
          </View>

          <View className={`${isDark ? 'bg-teal-dim' : 'bg-light-teal-dim'} rounded-xl p-4 border ${isDark ? 'border-teal/30' : 'border-light-teal/30'} mb-4`}>
            <View className="flex-row items-center gap-3">
              <View className={`w-14 h-14 rounded-full ${isDark ? 'bg-teal/20' : 'bg-light-teal/20'} items-center justify-center`}>
                <Text className={`${tealCls} text-xl font-bold`}>{aiScore}</Text>
              </View>
              <View>
                <Text className={`${tealCls} font-bold`}>AI Score: Excellent</Text>
                <Text className={`${textMuted} text-xs`}>{aiTip}</Text>
              </View>
            </View>
          </View>

          <View className={`${bgCard} rounded-xl p-4 border ${borderCls}`}>
            <Text className={`${textCls} font-bold mb-2`}>Contact Owner</Text>
            <Text className={`${textMuted} text-sm mb-3`}>Get in touch for site visits and negotiations</Text>
            <Pressable className="bg-green py-3 rounded-xl mb-2">
              <Text className="text-white font-semibold text-center">📞 Call Now</Text>
            </Pressable>
            <Pressable className="bg-green/80 py-3 rounded-xl">
              <Text className="text-white font-semibold text-center">WhatsApp</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
