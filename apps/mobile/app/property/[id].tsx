/**
 * @file [id].tsx
 * @module app/property
 * @description Property detail screen; fetches from API when configured
 * @author BharatERP
 * @created 2025-03-10
 */

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
  const [property, setProperty] = useState<ApiProperty | null | undefined>(undefined);

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
      <SafeAreaView className="flex-1 bg-night" edges={['top']}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#00d4aa" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-night" edges={['top']}>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="px-4 pt-4 pb-4 border-b border-border">
          <View className="flex-row flex-wrap gap-1 mb-2">
            <Text className="text-text-muted text-sm" onPress={() => router.back()}>
              Home / Buy in Gurgaon / Sector 108 /
            </Text>
            <Text className="text-text-muted text-sm">{title}</Text>
          </View>
          <View className="bg-dark-2 rounded-2xl h-48 items-center justify-center mb-4">
            <Text className="text-6xl">🏡</Text>
            <View className="flex-row gap-2 mt-2">
              <Pressable className="bg-dark px-3 py-1.5 rounded-lg">
                <Text className="text-white text-sm">📸 All Photos (24)</Text>
              </Pressable>
              <Pressable className="bg-dark px-3 py-1.5 rounded-lg">
                <Text className="text-white text-sm">🎬 Video Tour</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View className="px-4 pt-4">
          <View className="flex-row flex-wrap gap-2 mb-3">
            <View className="bg-gold-dim px-2 py-0.5 rounded">
              <Text className="text-gold text-xs font-semibold">⭐ Premium</Text>
            </View>
            <View className="bg-teal-dim px-2 py-0.5 rounded">
              <Text className="text-teal text-xs font-semibold">✦ AI Pick</Text>
            </View>
            <View className="bg-green-dim px-2 py-0.5 rounded">
              <Text className="text-green text-xs font-semibold">✓ RERA Verified</Text>
            </View>
          </View>
          <Text className="text-white text-xl font-bold mb-1">{title}</Text>
          <Text className="text-text-muted text-sm mb-3">📍 {location}</Text>
          <View className="flex-row justify-between items-start mb-4">
            <View>
              <Text className="text-teal text-2xl font-bold">{priceStr}</Text>
              <Text className="text-text-muted text-sm">{pricePerSqft}</Text>
            </View>
            <View className="flex-row gap-2">
              <Pressable className="bg-dark-2 px-3 py-2 rounded-lg border border-border">
                <Text className="text-white text-sm">♡ Save</Text>
              </Pressable>
              <Pressable className="bg-dark-2 px-3 py-2 rounded-lg border border-border">
                <Text className="text-white text-sm">⤴ Share</Text>
              </Pressable>
            </View>
          </View>

          <View className="flex-row flex-wrap gap-3 mb-6">
            {specs.map((s) => (
              <View key={s.label} className="bg-dark rounded-xl px-3 py-2 border border-border items-center min-w-[70px]">
                <Text className="text-lg">{s.icon}</Text>
                <Text className="text-white font-semibold text-sm">{s.val}</Text>
                <Text className="text-text-muted text-xs">{s.label}</Text>
              </View>
            ))}
          </View>

          <View className="bg-dark rounded-xl p-4 border border-border mb-4">
            <Text className="text-white font-bold text-lg mb-3">Overview</Text>
            {overview.map((o) => (
              <View key={o.label} className="flex-row justify-between py-2 border-b border-border last:border-0">
                <Text className="text-text-muted text-sm">{o.label}</Text>
                <Text className={`text-sm font-medium ${o.green ? 'text-green' : 'text-white'}`}>{o.val}</Text>
              </View>
            ))}
          </View>

          <View className="bg-teal-dim rounded-xl p-4 border border-teal/30 mb-4">
            <View className="flex-row items-center gap-3">
              <View className="w-14 h-14 rounded-full bg-teal/20 items-center justify-center">
                <Text className="text-teal text-xl font-bold">{aiScore}</Text>
              </View>
              <View>
                <Text className="text-teal font-bold">AI Score: Excellent</Text>
                <Text className="text-text-muted text-xs">{aiTip}</Text>
              </View>
            </View>
          </View>

          <View className="bg-dark rounded-xl p-4 border border-border">
            <Text className="text-white font-bold mb-2">Contact Owner</Text>
            <Text className="text-text-muted text-sm mb-3">Get in touch for site visits and negotiations</Text>
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
