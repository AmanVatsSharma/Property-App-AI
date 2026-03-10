/**
 * @file post.tsx
 * @module app/(tabs)
 * @description Post property screen
 * @author BharatERP
 * @created 2025-03-10
 */

import { ScrollView, View, Text, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PostPropertyScreen() {
  return (
    <SafeAreaView className="flex-1 bg-night" edges={['top']}>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="px-4 pt-6 pb-8">
          <View className="bg-teal-dim px-3 py-1 rounded-full self-start mb-4">
            <Text className="text-teal font-bold text-xs">✦ 100% Free for Owners</Text>
          </View>
          <Text className="text-white text-2xl font-bold mb-2">
            Post Your Property.{'\n'}
            <Text className="text-teal">Reach Millions.</Text>
          </Text>
          <Text className="text-text-muted text-base leading-6 mb-6 max-w-md">
            2.4 million active buyers on UrbanNest.ai. Verified leads. AI-matched to your property.
          </Text>
          <Pressable className="bg-teal py-3 px-5 rounded-xl self-start">
            <Text className="text-night font-bold">Post Property Free →</Text>
          </Pressable>
        </View>

        <View className="flex-row flex-wrap justify-around py-6 border-y border-border">
          <View className="items-center mb-4">
            <Text className="text-2xl mb-1">👥</Text>
            <Text className="text-white font-bold">2.4M+</Text>
            <Text className="text-text-muted text-xs">Active Buyers</Text>
          </View>
          <View className="items-center mb-4">
            <Text className="text-2xl mb-1">⚡</Text>
            <Text className="text-white font-bold">4 hrs</Text>
            <Text className="text-text-muted text-xs">Avg. First Lead</Text>
          </View>
          <View className="items-center mb-4">
            <Text className="text-2xl mb-1">✅</Text>
            <Text className="text-white font-bold">98%</Text>
            <Text className="text-text-muted text-xs">Lead Quality</Text>
          </View>
        </View>

        <View className="px-4 py-8">
          <Text className="text-text-muted text-xs uppercase tracking-wider mb-2">How It Works</Text>
          <Text className="text-white text-xl font-bold mb-6">Listed in 4 Simple Steps</Text>
          {[
            { n: 1, title: 'Create Listing', desc: 'Add property details, photos and price.' },
            { n: 2, title: 'AI Enhancement', desc: 'Our AI auto-improves your listing.' },
            { n: 3, title: 'Get Matched', desc: 'AI matches your property to buyers.' },
            { n: 4, title: 'Close the Deal', desc: 'Receive verified enquiries.' },
          ].map((s) => (
            <View key={s.n} className="bg-dark rounded-xl p-4 border border-border mb-3 flex-row items-center gap-4">
              <View className="w-10 h-10 rounded-full bg-teal-dim items-center justify-center">
                <Text className="text-teal font-bold">{s.n}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-white font-semibold">{s.title}</Text>
                <Text className="text-text-muted text-sm">{s.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <View className="px-4 py-6 bg-dark">
          <Text className="text-text-muted text-xs uppercase tracking-wider mb-2">Post Now</Text>
          <Text className="text-white text-xl font-bold mb-4">Create Your Listing</Text>
          <View className="bg-dark-2 rounded-xl p-4 border border-border">
            <Text className="text-white font-medium mb-2">Step 1 — Basic Details</Text>
            <View className="gap-3">
              <Text className="text-text-muted text-sm">Listing For</Text>
              <View className="bg-night rounded-lg border border-border px-3 py-2">
                <Text className="text-white">Sell</Text>
              </View>
              <Text className="text-text-muted text-sm">Property Type</Text>
              <View className="bg-night rounded-lg border border-border px-3 py-2">
                <Text className="text-white">Apartment</Text>
              </View>
              <Text className="text-text-muted text-sm">Address</Text>
              <TextInput
                className="bg-night rounded-lg border border-border px-3 py-2 text-white"
                placeholder="City, locality, project name"
                placeholderTextColor="rgba(255,255,255,0.45)"
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
