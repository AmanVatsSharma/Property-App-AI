/**
 * @file about.tsx
 * @module app/(tabs)/more
 * @description About Us screen
 * @author BharatERP
 * @created 2025-03-10
 */

import { ScrollView, View, Text } from 'react-native';

export default function AboutScreen() {
  return (
    <ScrollView className="flex-1 bg-night" contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <View className="bg-teal-dim px-3 py-1 rounded-full self-start mb-4">
        <Text className="text-teal font-bold text-xs">DPIIT Recognised Startup · Est. 2024</Text>
      </View>
      <Text className="text-white text-2xl font-bold mb-2">
        We're Rebuilding India's{'\n'}Real Estate Experience{' '}
        <Text className="text-teal">From Scratch</Text>
      </Text>
      <Text className="text-text-muted text-base leading-6 mb-6">
        The ₹30 trillion Indian real estate market is broken — opaque pricing, fake listings, zero transparency. We're fixing it with AI, trust, and radical transparency.
      </Text>

      <Text className="text-text-muted text-xs uppercase tracking-wider mb-2">Our Mission</Text>
      <Text className="text-white text-xl font-bold mb-2">Make Every Indian a Confident Homebuyer</Text>
      <Text className="text-text-muted text-sm leading-6 mb-4">
        UrbanNest.ai gives every Indian the same information advantage that insiders have always had.
      </Text>

      {[
        { title: 'Radical Transparency', text: 'Every listing shows price history, fair market value and red flags.' },
        { title: 'AI That Actually Works', text: 'Conversational AI that understands what you want.' },
        { title: 'Zero Fake Listings', text: '100% RERA-verified. Every listing reviewed before going live.' },
      ].map((item) => (
        <View key={item.title} className="flex-row gap-2 mb-3">
          <Text className="text-teal text-lg">✦</Text>
          <Text className="text-text-muted text-sm flex-1">
            <Text className="text-white font-semibold">{item.title}</Text> — {item.text}
          </Text>
        </View>
      ))}

      <View className="flex-row flex-wrap justify-between mt-6 gap-4">
        <View className="bg-dark rounded-xl p-4 border border-border flex-1 min-w-[140px]">
          <Text className="text-teal text-2xl font-bold">2.4M</Text>
          <Text className="text-text-muted text-xs">Active Listings</Text>
        </View>
        <View className="bg-dark rounded-xl p-4 border border-border flex-1 min-w-[140px]">
          <Text className="text-teal text-2xl font-bold">1.2L</Text>
          <Text className="text-text-muted text-xs">Families Helped</Text>
        </View>
        <View className="bg-dark rounded-xl p-4 border border-border flex-1 min-w-[140px]">
          <Text className="text-teal text-2xl font-bold">₹340Cr</Text>
          <Text className="text-text-muted text-xs">Deal Value</Text>
        </View>
      </View>
    </ScrollView>
  );
}
