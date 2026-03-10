/**
 * @file search.tsx
 * @module app/(tabs)
 * @description Search properties screen
 * @author BharatERP
 * @created 2025-03-10
 */

import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PROPERTIES = [
  {
    id: '1',
    price: '₹2.85 Cr',
    name: 'Sobha City Vista — 4 BHK Ultra Luxury',
    loc: 'Sector 108, Gurgaon · 2,850 sqft',
    score: 94,
    badges: ['⭐ Premium', '✦ AI Pick'],
  },
  {
    id: '2',
    price: '₹78 L',
    name: 'DLF MyPad — 2 BHK Studio, Noida',
    loc: 'Sector 59, Noida · 1,100 sqft',
    score: 88,
    badges: ['✓ Verified', '🔥 Hot'],
  },
  {
    id: '3',
    price: '₹1.45 Cr',
    name: 'M3M Golf Hills — 3 BHK Premium',
    loc: 'Sector 79, Gurgaon · 1,890 sqft',
    score: 91,
    badges: ['NEW', '✦ AI Pick'],
  },
];

export default function SearchScreen() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

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
        <Text className="text-text-muted text-sm mt-3">
          Showing <Text className="text-white font-semibold">2,847</Text> properties
        </Text>
      </View>
      <FlatList
        data={PROPERTIES}
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
    </SafeAreaView>
  );
}
