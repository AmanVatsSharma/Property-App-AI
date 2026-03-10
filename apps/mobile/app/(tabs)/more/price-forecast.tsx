/**
 * @file price-forecast.tsx
 * @module app/(tabs)/more
 * @description Price Forecast — AI-powered property price prediction
 * @author BharatERP
 * @created 2025-03-10
 */

import { useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';

const HORIZONS = ['12 months', '24 months', '36 months'];
const FORECAST = [
  { year: 'Current', price: '₹12,500', gain: '' },
  { year: '12 mo', price: '₹13,200', gain: '+5.6%' },
  { year: '24 mo', price: '₹14,100', gain: '+12.8%', highlight: true },
  { year: '36 mo', price: '₹15,200', gain: '+21.6%' },
];

export default function PriceForecastScreen() {
  const [horizon, setHorizon] = useState(1);

  return (
    <ScrollView className="flex-1 bg-night" contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <View className="bg-dark rounded-xl p-4 border border-border mb-4">
        <Text className="text-white font-bold text-lg mb-3">Select Locality</Text>
        <View className="mb-3">
          <Text className="text-text-muted text-sm mb-1">City</Text>
          <View className="bg-night rounded-lg border border-border px-3 py-2">
            <Text className="text-white">Bangalore</Text>
          </View>
        </View>
        <View className="mb-3">
          <Text className="text-text-muted text-sm mb-1">Locality</Text>
          <View className="bg-night rounded-lg border border-border px-3 py-2">
            <Text className="text-white">Whitefield</Text>
          </View>
        </View>
        <Text className="text-text-muted text-sm mb-2">Forecast Horizon</Text>
        <View className="flex-row gap-2">
          {HORIZONS.map((h, i) => (
            <Pressable
              key={h}
              onPress={() => setHorizon(i)}
              className={`flex-1 py-2 rounded-lg ${horizon === i ? 'bg-teal-dim border border-teal/30' : 'bg-night border border-border'}`}
            >
              <Text className={`text-center text-sm ${horizon === i ? 'text-teal font-semibold' : 'text-text-muted'}`}>{h}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View className="bg-dark rounded-xl p-4 border border-border">
        <Text className="text-text-muted text-xs uppercase tracking-wider mb-1">Forecast Result</Text>
        <Text className="text-white font-bold text-lg mb-1">Whitefield, Bangalore</Text>
        <Text className="text-text-muted text-sm mb-4">24-month outlook</Text>
        <View className="flex-row flex-wrap gap-2">
          {FORECAST.map((r) => (
            <View
              key={r.year}
              className={`flex-1 min-w-[70px] rounded-xl p-3 items-center ${
                r.highlight ? 'bg-teal-dim border border-teal/30' : 'bg-dark-2 border border-border'
              }`}
            >
              <Text className="text-text-muted text-xs uppercase">{r.year}</Text>
              <Text className={`font-bold text-base mt-1 ${r.highlight ? 'text-teal' : 'text-white'}`}>{r.price}</Text>
              {r.gain ? <Text className="text-teal text-xs font-semibold mt-1">{r.gain}</Text> : null}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
