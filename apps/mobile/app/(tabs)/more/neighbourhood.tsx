/**
 * @file neighbourhood.tsx
 * @module app/(tabs)/more
 * @description Neighbourhood Score Explorer screen
 * @author BharatERP
 * @created 2025-03-10
 */

import { useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';

const CITIES = ['Mumbai', 'Bangalore', 'Delhi NCR', 'Hyderabad', 'Pune', 'Chennai'];

export default function NeighbourhoodScreen() {
  const [city, setCity] = useState('Bangalore');

  return (
    <ScrollView className="flex-1 bg-night" contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <View className="flex-row flex-wrap gap-2 mb-6">
        {CITIES.map((c) => (
          <Pressable
            key={c}
            onPress={() => setCity(c)}
            className={`px-4 py-2 rounded-full ${city === c ? 'bg-teal-dim border border-teal/30' : 'bg-dark border border-border'}`}
          >
            <Text className={city === c ? 'text-teal font-semibold' : 'text-text-muted'}>{c}</Text>
          </Pressable>
        ))}
      </View>

      <View className="flex-row gap-4">
        <View className="flex-1 bg-dark rounded-xl p-4 border border-border">
          <Text className="text-white font-semibold mb-2">Locality A</Text>
          <Text className="text-text-muted text-sm mb-2">Whitefield, Bangalore</Text>
          <Text className="text-teal text-4xl font-bold">87</Text>
          <Text className="text-text-muted text-xs mt-1">Overall Livability Score</Text>
        </View>
        <View className="flex-1 bg-dark rounded-xl p-4 border border-border">
          <Text className="text-white font-semibold mb-2">Locality B</Text>
          <Text className="text-text-muted text-sm mb-2">Koramangala, Bangalore</Text>
          <Text className="text-teal text-4xl font-bold">84</Text>
          <Text className="text-text-muted text-xs mt-1">Overall Livability Score</Text>
        </View>
      </View>
    </ScrollView>
  );
}
