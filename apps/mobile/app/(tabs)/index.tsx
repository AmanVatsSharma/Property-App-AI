/**
 * @file index.tsx
 * @module app/(tabs)
 * @description Landing / Home screen — UrbanNest.ai; theme-aware (light/dark).
 * @author BharatERP
 * @created 2025-03-10
 */

import { useTheme } from '@/components/providers/ThemeProvider';
import { CITIES } from '@/constants/cities';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View, Text, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('buy');
  const { isDark } = useTheme();

  const bgMain = isDark ? 'bg-night' : 'bg-light-night';
  const bgCard = isDark ? 'bg-dark' : 'bg-light-dark';
  const bgCard2 = isDark ? 'bg-dark-2' : 'bg-light-dark-2';
  const borderCls = isDark ? 'border-border' : 'border-light-border';
  const textHeading = isDark ? 'text-white' : 'text-light-heading';
  const textMuted = isDark ? 'text-text-muted' : 'text-light-text-muted';
  const textDim = isDark ? 'text-text-dim' : 'text-light-text-dim';
  const tealCls = isDark ? 'text-teal' : 'text-light-teal';
  const btnPrimaryText = isDark ? 'text-night' : 'text-light-btn-primary-text';
  const badgeTealCls = isDark ? 'bg-teal-dim' : 'bg-light-teal-dim';
  const placeholderColor = isDark ? 'rgba(255,255,255,0.45)' : '#5c6370';

  return (
    <SafeAreaView className={`flex-1 ${bgMain}`} edges={['top']}>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View className="px-4 pt-6 pb-8">
          <View className={`${isDark ? 'bg-teal/10 border-teal/20' : 'bg-light-teal/10 border-light-teal/20'} border rounded-full px-3 py-1 self-start mb-4 flex-row items-center gap-2`}>
            <View className={`w-2 h-2 rounded-full ${isDark ? 'bg-teal' : 'bg-light-teal'}`} />
            <Text className={`${tealCls} text-xs font-semibold`}>Live Market Data</Text>
          </View>
          <Text className={`${textHeading} text-3xl font-bold leading-tight mb-2`}>
            Search Smarter.{'\n'}
            <Text className={tealCls}>Buy Better.</Text>{'\n'}
            <Text className={isDark ? 'text-white/80' : 'text-light-text-dim'}>Live Richer.</Text>
          </Text>
          <Text className={`${textMuted} text-base leading-6 mb-6`}>
            UrbanNest.ai is powered by AI that understands what you want. Verified listings, real price intelligence, and neighbourhood insights across 340+ Indian cities.
          </Text>

          {/* Search card */}
          <View className={`${bgCard} rounded-2xl p-4 border ${borderCls}`}>
            <View className="flex-row flex-wrap gap-2 mb-3">
              {['🏠 Buy', '🔑 Rent', '🏗️ New', '🏢 Commercial'].map((label) => (
                <Pressable
                  key={label}
                  onPress={() => setActiveTab(label)}
                  className={`px-3 py-2 rounded-full ${activeTab === label ? `bg-teal-dim border border-teal/30` : `${bgCard2} border ${borderCls}`}`}
                >
                  <Text className={activeTab === label ? `${tealCls} font-semibold text-sm` : `${textMuted} text-sm`}>{label}</Text>
                </Pressable>
              ))}
            </View>
            <View className={`flex-row items-center gap-2 ${isDark ? 'bg-night' : 'bg-light-night'} rounded-xl px-3 py-2 border ${borderCls} mb-2`}>
              <Text className={tealCls}>✦</Text>
              <TextInput
                className={`flex-1 ${textHeading} py-2`}
                placeholder="e.g. 3BHK near metro, budget ₹1.2Cr in Pune"
                placeholderTextColor={placeholderColor}
              />
            </View>
            <Pressable onPress={() => router.push('/(tabs)/search')} className={`${isDark ? 'bg-teal' : 'bg-light-teal'} py-3 rounded-xl`}>
              <Text className={`${btnPrimaryText} font-bold text-center`}>Search ✦</Text>
            </Pressable>
          </View>

          {/* Stats */}
          <View className="flex-row flex-wrap justify-between mt-6 gap-4">
            <View className="flex-1 min-w-[80px]">
              <Text className={`${tealCls} text-xl font-bold`}>2.4<Text className={`text-sm ${textMuted}`}>M+</Text></Text>
              <Text className={`${textMuted} text-xs`}>Active Listings</Text>
            </View>
            <View className="flex-1 min-w-[80px]">
              <Text className={`${tealCls} text-xl font-bold`}>1.2<Text className={`text-sm ${textMuted}`}>L+</Text></Text>
              <Text className={`${textMuted} text-xs`}>Happy Families</Text>
            </View>
            <View className="flex-1 min-w-[80px]">
              <Text className={`${tealCls} text-xl font-bold`}>340<Text className={`text-sm ${textMuted}`}>+</Text></Text>
              <Text className={`${textMuted} text-xs`}>Cities</Text>
            </View>
          </View>
        </View>

        {/* Trust bar */}
        <View className={`flex-row flex-wrap items-center justify-center gap-3 py-4 border-y ${borderCls} mx-4`}>
          <Text className={`${textMuted} text-xs`}>✅ RERA Verified</Text>
          <Text className={textDim}>|</Text>
          <Text className={`${textMuted} text-xs`}>🔒 Zero Spam</Text>
          <Text className={textDim}>|</Text>
          <Text className={`${textMuted} text-xs`}>🤖 AI Pricing</Text>
        </View>

        {/* Cities */}
        <View className="px-4 py-6">
          <Text className={`${textMuted} text-xs uppercase tracking-wider mb-2`}>Explore by City</Text>
          <Text className={`${textHeading} text-xl font-bold mb-4`}>India's Hottest Markets</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-4">
            {CITIES.map((c) => (
              <Pressable
                key={c.name}
                onPress={() => router.push('/(tabs)/search')}
                className={`${bgCard} rounded-xl w-36 mr-3 p-4 border ${borderCls}`}
              >
                <Text className="text-4xl mb-2">{c.emoji}</Text>
                <Text className={`${textHeading} font-semibold`}>{c.name}</Text>
                <Text className={`${textMuted} text-xs`}>{c.count} listings</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Featured listing */}
        <View className="px-4 pb-6">
          <Text className={`${textMuted} text-xs uppercase tracking-wider mb-2`}>AI-Curated For You</Text>
          <Text className={`${textHeading} text-xl font-bold mb-4`}>Properties You'll Love</Text>
          <Pressable
            onPress={() => router.push('/property/1')}
            className={`${bgCard} rounded-2xl overflow-hidden border ${borderCls}`}
          >
            <View className={`h-40 ${bgCard2} items-center justify-center`}>
              <Text className="text-6xl">🏡</Text>
              <View className="absolute top-2 left-2 flex-row gap-2">
                <View className={`${isDark ? 'bg-gold-dim' : 'bg-light-teal-dim'} px-2 py-0.5 rounded`}>
                  <Text className={`${isDark ? 'text-gold' : 'text-light-teal'} text-xs font-semibold`}>⭐ PREMIUM</Text>
                </View>
                <View className={`${badgeTealCls} border px-2 py-0.5 rounded ${isDark ? 'border-teal/30' : 'border-light-teal/30'}`}>
                  <Text className={`${tealCls} text-xs font-semibold`}>✦ AI PICK</Text>
                </View>
              </View>
              <View className={`absolute bottom-2 right-2 ${badgeTealCls} px-2 py-1 rounded`}>
                <Text className={`${tealCls} font-bold`}>94</Text>
                <Text className={`${tealCls} text-xs`}>AI Score</Text>
              </View>
            </View>
            <View className="p-4">
              <Text className={`${tealCls} font-bold text-lg`}>₹2.85 Cr</Text>
              <Text className={`${textHeading} font-semibold mt-1`}>Sobha City Vista — 4 BHK Ultra Luxury, Gurgaon</Text>
              <Text className={`${textMuted} text-sm mt-1`}>📍 Sector 108 · 2,850 sq.ft · Ready</Text>
            </View>
          </Pressable>
          <Pressable onPress={() => router.push('/(tabs)/search')} className="mt-3">
            <Text className={`${tealCls} font-semibold text-center`}>View all 2.4M+ listings →</Text>
          </Pressable>
        </View>

        {/* CTA */}
        <View className={`px-4 py-8 ${bgCard}`}>
          <Pressable onPress={() => router.push('/(tabs)/search')} className={`${isDark ? 'bg-teal' : 'bg-light-teal'} py-4 rounded-xl mb-3`}>
            <Text className={`${btnPrimaryText} font-bold text-center text-base`}>Start Your AI Search — Free →</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/(tabs)/post')} className={`border ${isDark ? 'border-teal' : 'border-light-teal'} py-4 rounded-xl`}>
            <Text className={`${tealCls} font-bold text-center text-base`}>Post Property Free</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
