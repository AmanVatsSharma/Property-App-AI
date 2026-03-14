/**
 * @file search.tsx
 * @module app/(tabs)
 * @description Search properties screen; list/map view; API only, no mock data.
 * @author BharatERP
 * @created 2025-03-10
 */

import { useTheme } from '@/components/providers/ThemeProvider';
import { useLocation } from '@/lib/location-context';
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
import { fetchProperties, type ApiProperty, type PropertyFilter } from '@/lib/graphql-client';
import { PropertyMap, type PropertyMapItem } from '@/components/PropertyMap';

const LOCATION_DELTA = 0.1;

function buildFilterFromLocation(location: ReturnType<typeof useLocation>): PropertyFilter {
  const base: PropertyFilter = { limit: 50 };
  if (location.coords) {
    const { latitude, longitude } = location.coords;
    base.minLat = latitude - LOCATION_DELTA;
    base.maxLat = latitude + LOCATION_DELTA;
    base.minLng = longitude - LOCATION_DELTA;
    base.maxLng = longitude + LOCATION_DELTA;
  } else if (location.city) {
    base.location = location.city;
  }
  return base;
}

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
  const { isDark } = useTheme();
  const location = useLocation();
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [apiList, setApiList] = useState<ApiProperty[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiUnavailable, setApiUnavailable] = useState(false);

  const bgMain = isDark ? 'bg-night' : 'bg-light-night';
  const bgCard = isDark ? 'bg-dark' : 'bg-light-dark';
  const bgCard2 = isDark ? 'bg-dark-2' : 'bg-light-dark-2';
  const borderCls = isDark ? 'border-border' : 'border-light-border';
  const textCls = isDark ? 'text-white' : 'text-light-heading';
  const textMuted = isDark ? 'text-text-muted' : 'text-light-text-muted';
  const tealCls = isDark ? 'text-teal' : 'text-light-teal';
  const tealBg = isDark ? 'bg-teal' : 'bg-light-teal';
  const btnPrimaryText = isDark ? 'text-night' : 'text-light-btn-primary-text';
  const placeholderColor = isDark ? 'rgba(255,255,255,0.45)' : '#5c6370';
  const indicatorColor = isDark ? '#00d4aa' : '#00b894';

  useEffect(() => {
    let cancelled = false;
    const filter = buildFilterFromLocation(location);
    (async () => {
      setLoading(true);
      setApiUnavailable(false);
      try {
        const list = await fetchProperties(filter);
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
  }, [location.city, location.coords?.latitude, location.coords?.longitude]);

  const listItems = apiList ?? [];
  const displayList = listItems.map(toCardItem);

  return (
    <SafeAreaView className={`flex-1 ${bgMain}`} edges={['top']}>
      <View className={`px-4 pt-2 pb-4 border-b ${borderCls}`}>
        <View className={`flex-row items-center gap-2 ${bgCard2} rounded-xl px-3 py-2 border ${borderCls}`}>
          <Text className={`${tealCls} text-base`}>✦</Text>
          <TextInput
            className={`flex-1 ${textCls} text-base py-1`}
            placeholder="AI Search: 3BHK near metro under ₹1Cr..."
            placeholderTextColor={placeholderColor}
          />
          <Pressable className={`${tealBg} px-3 py-1.5 rounded-lg`}>
            <Text className={`${btnPrimaryText} font-bold text-sm`}>Search</Text>
          </Pressable>
        </View>
        <View className="flex-row items-center justify-between mt-3">
          <Text className={`${textMuted} text-sm`}>
            {loading ? 'Loading…' : `Showing ${displayList.length} propert${displayList.length === 1 ? 'y' : 'ies'}`}
          </Text>
          <View className={`flex-row rounded-lg border ${borderCls} overflow-hidden`}>
            <Pressable
              onPress={() => setViewMode('list')}
              className={`px-3 py-1.5 ${viewMode === 'list' ? tealBg : bgCard2}`}
            >
              <Text className={viewMode === 'list' ? `${btnPrimaryText} font-semibold text-sm` : `${textMuted} text-sm`}>List</Text>
            </Pressable>
            <Pressable
              onPress={() => setViewMode('map')}
              className={`px-3 py-1.5 ${viewMode === 'map' ? tealBg : bgCard2}`}
            >
              <Text className={viewMode === 'map' ? `${btnPrimaryText} font-semibold text-sm` : `${textMuted} text-sm`}>Map</Text>
            </Pressable>
          </View>
        </View>
        {!loading && apiUnavailable && (
          <Text className={`${textMuted} text-xs mt-2`}>No properties. Connect server (EXPO_PUBLIC_API_URL or EXPO_PUBLIC_GRAPHQL_HTTP) or try again.</Text>
        )}
      </View>
      {loading ? (
        <View className="flex-1 items-center justify-center py-12">
          <ActivityIndicator size="large" color={indicatorColor} />
        </View>
      ) : displayList.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6 py-12">
          <Text className={`${textMuted} text-center`}>No properties found. Adjust filters or ensure the backend is connected.</Text>
        </View>
      ) : viewMode === 'map' ? (
        <View className="flex-1 px-4 pt-2" style={{ minHeight: 400 }}>
          <PropertyMap properties={apiToMapItems(listItems)} style={{ flex: 1, borderRadius: 12 }} />
        </View>
      ) : (
      <FlatList
        data={displayList}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/property/${item.id}`)}
            className={`${bgCard} rounded-2xl p-4 border ${borderCls} mb-3`}
          >
            <View className="flex-row justify-between items-start mb-2">
              <Text className={`${tealCls} font-bold text-lg`}>{item.price}</Text>
              <View className={`${isDark ? 'bg-teal-dim' : 'bg-light-teal-dim'} px-2 py-0.5 rounded`}>
                <Text className={`${tealCls} text-xs font-semibold`}>{item.score} AI</Text>
              </View>
            </View>
            <Text className={`${textCls} font-semibold mb-1`}>{item.name}</Text>
            <Text className={`${textMuted} text-sm`}>{item.loc}</Text>
            <View className="flex-row flex-wrap gap-1 mt-2">
              {item.badges.map((b) => (
                <Text key={b} className={`${textMuted} text-xs ${bgCard2} px-2 py-0.5 rounded`}>
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
