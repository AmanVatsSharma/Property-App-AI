/**
 * @file index.tsx
 * @module app/(tabs)
 * @description Landing / Home screen — UrbanNest.ai
 * @author BharatERP
 * @created 2025-03-10
 */

import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View, Text, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const CITIES = [
  { name: 'Mumbai', count: '4.2L+', emoji: '🌆' },
  { name: 'Bangalore', count: '3.8L+', emoji: '🏙️' },
  { name: 'Delhi NCR', count: '5.1L+', emoji: '🗼' },
  { name: 'Hyderabad', count: '2.6L+', emoji: '🌃' },
  { name: 'Pune', count: '1.9L+', emoji: '🌇' },
  { name: 'Chennai', count: '1.4L+', emoji: '🏛️' },
];

export default function HomeScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('buy');

  return (
    <SafeAreaView className="flex-1 bg-night" edges={['top']}>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View className="px-4 pt-6 pb-8">
          <View className="bg-teal/10 border border-teal/20 rounded-full px-3 py-1 self-start mb-4 flex-row items-center gap-2">
            <View className="w-2 h-2 rounded-full bg-teal" />
            <Text className="text-teal text-xs font-semibold">Live Market Data</Text>
          </View>
          <Text className="text-white text-3xl font-bold leading-tight mb-2">
            Search Smarter.{'\n'}
            <Text className="text-teal">Buy Better.</Text>{'\n'}
            <Text className="text-white/80">Live Richer.</Text>
          </Text>
          <Text className="text-text-muted text-base leading-6 mb-6">
            UrbanNest.ai is powered by AI that understands what you want. Verified listings, real price intelligence, and neighbourhood insights across 340+ Indian cities.
          </Text>

          {/* Search card */}
          <View className="bg-dark rounded-2xl p-4 border border-border">
            <View className="flex-row flex-wrap gap-2 mb-3">
              {['🏠 Buy', '🔑 Rent', '🏗️ New', '🏢 Commercial'].map((label, i) => (
                <Pressable
                  key={label}
                  onPress={() => setActiveTab(label)}
                  className={`px-3 py-2 rounded-full ${activeTab === label ? 'bg-teal-dim border border-teal/30' : 'bg-dark-2 border border-border'}`}
                >
                  <Text className={activeTab === label ? 'text-teal font-semibold text-sm' : 'text-text-muted text-sm'}>{label}</Text>
                </Pressable>
              ))}
            </View>
            <View className="flex-row items-center gap-2 bg-night rounded-xl px-3 py-2 border border-border mb-2">
              <Text className="text-teal">✦</Text>
              <TextInput
                className="flex-1 text-white py-2"
                placeholder="e.g. 3BHK near metro, budget ₹1.2Cr in Pune"
                placeholderTextColor="rgba(255,255,255,0.45)"
              />
            </View>
            <Pressable onPress={() => router.push('/(tabs)/search')} className="bg-teal py-3 rounded-xl">
              <Text className="text-night font-bold text-center">Search ✦</Text>
            </Pressable>
          </View>

          {/* Stats */}
          <View className="flex-row flex-wrap justify-between mt-6 gap-4">
            <View className="flex-1 min-w-[80px]">
              <Text className="text-teal text-xl font-bold">2.4<Text className="text-sm text-text-muted">M+</Text></Text>
              <Text className="text-text-muted text-xs">Active Listings</Text>
            </View>
            <View className="flex-1 min-w-[80px]">
              <Text className="text-teal text-xl font-bold">1.2<Text className="text-sm text-text-muted">L+</Text></Text>
              <Text className="text-text-muted text-xs">Happy Families</Text>
            </View>
            <View className="flex-1 min-w-[80px]">
              <Text className="text-teal text-xl font-bold">340<Text className="text-sm text-text-muted">+</Text></Text>
              <Text className="text-text-muted text-xs">Cities</Text>
            </View>
          </View>
        </View>

        {/* Trust bar */}
        <View className="flex-row flex-wrap items-center justify-center gap-3 py-4 border-y border-border mx-4">
          <Text className="text-text-muted text-xs">✅ RERA Verified</Text>
          <Text className="text-text-dim">|</Text>
          <Text className="text-text-muted text-xs">🔒 Zero Spam</Text>
          <Text className="text-text-dim">|</Text>
          <Text className="text-text-muted text-xs">🤖 AI Pricing</Text>
        </View>

        {/* Cities */}
        <View className="px-4 py-6">
          <Text className="text-text-muted text-xs uppercase tracking-wider mb-2">Explore by City</Text>
          <Text className="text-white text-xl font-bold mb-4">India's Hottest Markets</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-4">
            {CITIES.map((c) => (
              <Pressable
                key={c.name}
                onPress={() => router.push('/(tabs)/search')}
                className="bg-dark rounded-xl w-36 mr-3 p-4 border border-border"
              >
                <Text className="text-4xl mb-2">{c.emoji}</Text>
                <Text className="text-white font-semibold">{c.name}</Text>
                <Text className="text-text-muted text-xs">{c.count} listings</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Featured listing */}
        <View className="px-4 pb-6">
          <Text className="text-text-muted text-xs uppercase tracking-wider mb-2">AI-Curated For You</Text>
          <Text className="text-white text-xl font-bold mb-4">Properties You'll Love</Text>
          <Pressable
            onPress={() => router.push('/property/1')}
            className="bg-dark rounded-2xl overflow-hidden border border-border"
          >
            <View className="h-40 bg-dark-2 items-center justify-center">
              <Text className="text-6xl">🏡</Text>
              <View className="absolute top-2 left-2 flex-row gap-2">
                <View className="bg-gold-dim px-2 py-0.5 rounded">
                  <Text className="text-gold text-xs font-semibold">⭐ PREMIUM</Text>
                </View>
                <View className="bg-teal-dim px-2 py-0.5 rounded">
                  <Text className="text-teal text-xs font-semibold">✦ AI PICK</Text>
                </View>
              </View>
              <View className="absolute bottom-2 right-2 bg-teal-dim px-2 py-1 rounded">
                <Text className="text-teal font-bold">94</Text>
                <Text className="text-teal text-xs">AI Score</Text>
              </View>
            </View>
            <View className="p-4">
              <Text className="text-teal font-bold text-lg">₹2.85 Cr</Text>
              <Text className="text-white font-semibold mt-1">Sobha City Vista — 4 BHK Ultra Luxury, Gurgaon</Text>
              <Text className="text-text-muted text-sm mt-1">📍 Sector 108 · 2,850 sq.ft · Ready</Text>
            </View>
          </Pressable>
          <Pressable onPress={() => router.push('/(tabs)/search')} className="mt-3">
            <Text className="text-teal font-semibold text-center">View all 2.4M+ listings →</Text>
          </Pressable>
        </View>

        {/* CTA */}
        <View className="px-4 py-8 bg-dark">
          <Pressable onPress={() => router.push('/(tabs)/search')} className="bg-teal py-4 rounded-xl mb-3">
            <Text className="text-night font-bold text-center text-base">Start Your AI Search — Free →</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/(tabs)/post')} className="border border-teal py-4 rounded-xl">
            <Text className="text-teal font-bold text-center text-base">Post Property Free</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
