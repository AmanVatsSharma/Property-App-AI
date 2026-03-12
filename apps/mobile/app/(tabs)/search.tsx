/**
 * @file search.tsx
 * @module app/(tabs)
 * @description Search properties screen; list/map view; uses API when configured, fallback mock otherwise
 * @author BharatERP
 * @created 2025-03-10
 */

import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchProperties, type ApiProperty } from '@/lib/graphql-client';
import { PropertyMap, type PropertyMapItem } from '@/components/PropertyMap';

const FALLBACK_PROPERTIES: Array<{ id: string; price: string; name: string; loc: string; score: number; badges: string[] }> = [
  { id: '1', price: '₹2.85 Cr', name: 'Sobha City Vista — 4 BHK Ultra Luxury', loc: 'Sector 108, Gurgaon · 2,850 sqft', score: 94, badges: ['⭐ Premium', '✦ AI Pick'] },
  { id: '2', price: '₹78 L', name: 'DLF MyPad — 2 BHK Studio, Noida', loc: 'Sector 59, Noida · 1,100 sqft', score: 88, badges: ['✓ Verified', '🔥 Hot'] },
  { id: '3', price: '₹1.45 Cr', name: 'M3M Golf Hills — 3 BHK Premium', loc: 'Sector 79, Gurgaon · 1,890 sqft', score: 91, badges: ['NEW', '✦ AI Pick'] },
];

function formatPrice(price: number): string {
  return price >= 1_00_00_000 ? `₹${(price / 1_00_00_000).toFixed(2)} Cr` : `₹${(price / 1_00_000).toFixed(0)} L`;
}

function toCardItem(p: ApiProperty): { id: string; price: string; name: string; loc: string; score: number; badges: string[] } {
  const sqft = p.areaSqft ? ` · ${p.areaSqft.toLocaleString()} sqft` : '';
  return {
    id: p.id,
    price: formatPrice(p.price),
    name: p.title,
    loc: `${p.location}${sqft}`,
    score: p.aiScore ?? 0,
    badges: p.aiScore && p.aiScore >= 90 ? ['✦ AI Pick'] : [],
  };
}

function apiToMapItems(list: ApiProperty[]): PropertyMapItem[] {
  return list
    .filter(
      (p): p is ApiProperty & { latitude: number; longitude: number } =>
        p.latitude != null &&
        p.longitude != null &&
        Number.isFinite(p.latitude) &&
        Number.isFinite(p.longitude),
    )
    .map((p) => ({
      id: p.id,
      title: p.title,
      location: p.location,
      price: p.price,
      latitude: p.latitude,
      longitude: p.longitude,
    }));
}

export default function SearchScreen() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [apiList, setApiList] = useState<ApiProperty[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiUnavailable, setApiUnavailable] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setApiUnavailable(false);
      try {
        const list = await fetchProperties({ limit: 50 });
        if (!cancelled) {
          setApiList(list);
          if (list.length === 0) setApiUnavailable(true);
        }
      } catch {
        if (!cancelled) {
          setApiList([]);
          setApiUnavailable(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const listItems = apiList != null && apiList.length > 0 ? apiList.map(toCardItem) : FALLBACK_PROPERTIES;

  return (
    <SafeAreaView className="flex-1 bg-night" edges={['top']}>
      <View className="px-4 pt-2 pb-4 border-b border-border">
        <View className="flex-row items-center gap-2 bg-dark-2 rounded-xl px-3 py-2 border border-glass-border">
          <Text className="text-teal text-base">✦</Text>
          <TextInput
            className="flex-1 text-white text-base py-1"
            placeholder="AI Search: 3BHK near metro under ₹1Cr..."
            placeholderTextColor="rgba(255,255,255,0.45)"
          />
          <Pressable className="bg-teal px-3 py-1.5 rounded-lg">
            <Text className="text-night font-bold text-sm">Search</Text>
          </Pressable>
        </View>
        <View className="flex-row items-center justify-between mt-3">
          <Text className="text-text-muted text-sm">
            Showing <Text className="text-white font-semibold">{listItems.length}</Text> properties
          </Text>
          <View className="flex-row rounded-lg border border-border overflow-hidden">
            <Pressable
              onPress={() => setViewMode('list')}
              className={`px-3 py-1.5 ${viewMode === 'list' ? 'bg-teal' : 'bg-dark-2'}`}
            >
              <Text className={viewMode === 'list' ? 'text-night font-semibold text-sm' : 'text-text-muted text-sm'}>List</Text>
            </Pressable>
            <Pressable
              onPress={() => setViewMode('map')}
              className={`px-3 py-1.5 ${viewMode === 'map' ? 'bg-teal' : 'bg-dark-2'}`}
            >
              <Text className={viewMode === 'map' ? 'text-night font-semibold text-sm' : 'text-text-muted text-sm'}>Map</Text>
            </Pressable>
          </View>
        </View>
        {apiUnavailable && (
          <Text className="text-text-muted text-xs mt-2">Showing demo data (server unavailable)</Text>
        )}
      </View>
      {loading ? (
        <View className="flex-1 items-center justify-center py-12">
          <ActivityIndicator size="large" color="#00d4aa" />
        </View>
      ) : viewMode === 'map' ? (
        <View className="flex-1 px-4 pt-2" style={{ minHeight: 400 }}>
          <PropertyMap properties={apiToMapItems(apiList ?? [])} style={{ flex: 1, borderRadius: 12 }} />
        </View>
      ) : (
      <FlatList
        data={listItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/property/${item.id}`)}
            className="bg-dark rounded-2xl p-4 border border-border mb-3"
          >
            <View className="flex-row justify-between items-start mb-2">
              <Text className="text-teal font-bold text-lg">{item.price}</Text>
              <View className="bg-teal-dim px-2 py-0.5 rounded">
                <Text className="text-teal text-xs font-semibold">{item.score} AI</Text>
              </View>
            </View>
            <Text className="text-white font-semibold mb-1">{item.name}</Text>
            <Text className="text-text-muted text-sm">{item.loc}</Text>
            <View className="flex-row flex-wrap gap-1 mt-2">
              {item.badges.map((b) => (
                <Text key={b} className="text-text-muted text-xs bg-dark-2 px-2 py-0.5 rounded">
                  {b}
                </Text>
              ))}
            </View>
          </Pressable>
        )}
      />
      )}
    </SafeAreaView>
  );
}
