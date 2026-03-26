/**
 * @file favorites.tsx
 * @module app/(tabs)
 * @description Saved / Favorites screen; lists properties the user has saved.
 * @author BharatERP
 * @created 2026-03-26
 */

import { useTheme } from '@/components/providers/ThemeProvider';
import { useRouter } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchMyFavorites, type FavoriteWithProperty } from '@/lib/graphql-client';
import { getAuthHeaders } from '@/lib/auth-store';

function formatPrice(price: number): string {
  return price >= 1_00_00_000
    ? `₹${(price / 1_00_00_000).toFixed(2)} Cr`
    : `₹${(price / 1_00_000).toFixed(0)} L`;
}

export default function FavoritesScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [favorites, setFavorites] = useState<FavoriteWithProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  const bgMain = isDark ? 'bg-night' : 'bg-light-night';
  const bgCard = isDark ? 'bg-dark' : 'bg-light-dark';
  const bgCard2 = isDark ? 'bg-dark-2' : 'bg-light-dark-2';
  const borderCls = isDark ? 'border-border' : 'border-light-border';
  const textCls = isDark ? 'text-white' : 'text-light-heading';
  const textMuted = isDark ? 'text-text-muted' : 'text-light-text-muted';
  const tealCls = isDark ? 'text-teal' : 'text-light-teal';
  const tealBg = isDark ? 'bg-teal' : 'bg-light-teal';
  const btnPrimaryText = isDark ? 'text-night' : 'text-light-btn-primary-text';
  const indicatorColor = isDark ? '#00d4aa' : '#00b894';

  const loadFavorites = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    const headers = await getAuthHeaders();
    if (!headers) {
      setIsLoggedIn(false);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    setIsLoggedIn(true);
    const data = await fetchMyFavorites(headers);
    setFavorites(data);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  if (loading) {
    return (
      <SafeAreaView className={`flex-1 ${bgMain}`} edges={['top']}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={indicatorColor} />
        </View>
      </SafeAreaView>
    );
  }

  if (isLoggedIn === false) {
    return (
      <SafeAreaView className={`flex-1 ${bgMain}`} edges={['top']}>
        <View className="px-4 pt-4 pb-2">
          <Text className={`${textCls} text-2xl font-bold`}>Saved</Text>
        </View>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-5xl mb-4">❤️</Text>
          <Text className={`${textCls} text-xl font-bold text-center mb-2`}>
            Sign in to view saved properties
          </Text>
          <Text className={`${textMuted} text-sm text-center mb-6`}>
            Save properties while browsing to revisit them anytime.
          </Text>
          <Pressable
            onPress={() => router.push('/login')}
            className={`${tealBg} py-3 px-8 rounded-xl`}
          >
            <Text className={`${btnPrimaryText} font-semibold`}>Sign In</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (favorites.length === 0) {
    return (
      <SafeAreaView className={`flex-1 ${bgMain}`} edges={['top']}>
        <View className="px-4 pt-4 pb-2">
          <Text className={`${textCls} text-2xl font-bold`}>Saved</Text>
        </View>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-5xl mb-4">🏡</Text>
          <Text className={`${textCls} text-xl font-bold text-center mb-2`}>
            No saved properties yet
          </Text>
          <Text className={`${textMuted} text-sm text-center mb-6`}>
            Tap the Save button on any property to keep it here for later.
          </Text>
          <Pressable
            onPress={() => router.push('/(tabs)/search')}
            className={`${tealBg} py-3 px-8 rounded-xl`}
          >
            <Text className={`${btnPrimaryText} font-semibold`}>Browse Properties</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={`flex-1 ${bgMain}`} edges={['top']}>
      <View className="px-4 pt-4 pb-2">
        <Text className={`${textCls} text-2xl font-bold`}>Saved</Text>
        <Text className={`${textMuted} text-sm mt-1`}>
          {favorites.length} saved propert{favorites.length === 1 ? 'y' : 'ies'}
        </Text>
      </View>

      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadFavorites(true)}
            tintColor={indicatorColor}
          />
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/property/${item.property.id}`)}
            className={`${bgCard} rounded-2xl p-4 border ${borderCls} mb-3`}
          >
            <View className={`${bgCard2} rounded-xl h-32 overflow-hidden mb-3`}>
              {item.property.coverImageUrl ? (
                <Image
                  source={{ uri: item.property.coverImageUrl }}
                  className="w-full h-full"
                  resizeMode="cover"
                  accessibilityLabel={item.property.title}
                />
              ) : (
                <View className="flex-1 items-center justify-center">
                  <Text className="text-4xl">🏠</Text>
                </View>
              )}
            </View>
            <Text className={`${tealCls} font-bold text-lg mb-0.5`}>
              {formatPrice(item.property.price)}
            </Text>
            <Text className={`${textCls} font-semibold mb-1`}>{item.property.title}</Text>
            <Text className={`${textMuted} text-sm mb-2`}>📍 {item.property.location}</Text>
            <View className={`flex-row items-center gap-2`}>
              <View className={`${bgCard2} px-2 py-0.5 rounded border ${borderCls}`}>
                <Text className={`${textMuted} text-xs capitalize`}>{item.property.type}</Text>
              </View>
              <Text className={`${textMuted} text-xs`}>
                Saved {new Date(item.createdAt).toLocaleDateString('en-IN')}
              </Text>
            </View>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}
