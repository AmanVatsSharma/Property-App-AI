/**
 * @file legal-checker.tsx
 * @module app/(tabs)/more
 * @description Legal Checker & RERA screen
 * @author BharatERP
 * @created 2025-03-10
 */

import { ScrollView, View, Text, TextInput, Pressable } from 'react-native';

export default function LegalCheckerScreen() {
  return (
    <ScrollView className="flex-1 bg-night" contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <View className="bg-dark rounded-xl p-4 border border-border mb-4">
        <Text className="text-white font-bold text-lg mb-1">RERA Project Search</Text>
        <Text className="text-text-muted text-sm mb-3">Enter project name or RERA registration number to verify status</Text>
        <View className="flex-row gap-2">
          <TextInput
            className="flex-1 bg-night rounded-lg border border-border px-3 py-2 text-white"
            placeholder="e.g. Sobha City Vista or HRERA-PKL-..."
            placeholderTextColor="rgba(255,255,255,0.45)"
          />
          <Pressable className="bg-teal px-4 py-2 rounded-lg justify-center">
            <Text className="text-night font-bold">Search</Text>
          </Pressable>
        </View>
      </View>

      <View className="bg-dark rounded-xl p-4 border border-border mb-4">
        <Text className="text-white font-semibold mb-2">Document Checklist</Text>
        <Text className="text-text-muted text-sm mb-3">Upload sale deed, title report, or NOC to get an AI-powered legal risk score.</Text>
        <View className="border-2 border-dashed border-border rounded-xl p-8 items-center bg-dark-2">
          <Text className="text-4xl mb-2">📄</Text>
          <Text className="text-white font-semibold mb-1">Drop files or tap to upload</Text>
          <Text className="text-text-muted text-sm">PDF, JPG up to 10MB</Text>
        </View>
      </View>

      <View className="bg-dark rounded-xl p-4 border border-border">
        <Text className="text-white font-semibold mb-2">Why verify?</Text>
        <Text className="text-text-muted text-sm leading-6">✓ RERA compliance ensures builder accountability</Text>
        <Text className="text-text-muted text-sm leading-6">✓ Reduces risk of fraud and delayed possession</Text>
        <Text className="text-text-muted text-sm leading-6">✓ Legal clarity score for every listing</Text>
      </View>
    </ScrollView>
  );
}
