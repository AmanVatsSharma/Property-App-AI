/**
 * @file post.tsx
 * @module app/(tabs)
 * @description Post property screen with form; submits via GraphQL createProperty.
 * @author BharatERP
 * @created 2025-03-10
 */

import { useState } from 'react';
import { ScrollView, View, Text, Pressable, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createProperty, type CreatePropertyInput } from '../../lib/graphql-client';
import { getAuthHeaders } from '../../lib/auth-store';

const LISTING_FOR_OPTIONS = [
  { value: 'sell', label: 'Sell' },
  { value: 'rent', label: 'Rent / Lease' },
] as const;

const PROPERTY_TYPE_OPTIONS = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'villa', label: 'Villa' },
  { value: 'plot', label: 'Plot' },
  { value: 'builder-floor', label: 'Builder Floor' },
  { value: 'office', label: 'Office' },
] as const;

export default function PostPropertyScreen() {
  const [title, setTitle] = useState('');
  const [listingFor, setListingFor] = useState<'sell' | 'rent'>('sell');
  const [propertyType, setPropertyType] = useState<string>('apartment');
  const [address, setAddress] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? process.env.EXPO_PUBLIC_GRAPHQL_HTTP;
    if (!apiUrl) {
      setError('Set EXPO_PUBLIC_API_URL or EXPO_PUBLIC_GRAPHQL_HTTP to submit.');
      return;
    }
    const trimmedTitle = title.trim();
    const trimmedAddress = address.trim();
    const priceNum = Number(price);
    if (!trimmedTitle || trimmedTitle.length < 3) {
      setError('Title must be at least 3 characters');
      return;
    }
    if (!trimmedAddress || trimmedAddress.length < 5) {
      setError('Address must be at least 5 characters');
      return;
    }
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      setError('Enter a valid price (0 or more)');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const input: CreatePropertyInput = {
        title: trimmedTitle,
        location: trimmedAddress,
        price: priceNum,
        type: propertyType,
        listingFor,
      };
      const headers = await getAuthHeaders();
      await createProperty(input, headers);
      setSuccess(true);
    } catch (e) {
      const raw = e instanceof Error ? e.message : 'Failed to create listing';
      const isAuthError = /Unauthorized|401|authorization|invalid.*token/i.test(raw);
      const message = isAuthError ? 'Sign in to post a listing. Go to More → Sign in.' : raw;
      setError(message);
      Alert.alert(isAuthError ? 'Sign in required' : 'Error', message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <SafeAreaView className="flex-1 bg-night" edges={['top']}>
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-4xl mb-4">✅</Text>
          <Text className="text-white text-xl font-bold mb-2">Listing created</Text>
          <Text className="text-text-muted text-center">
            Your property has been created. You can view it in Search.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-night" edges={['top']}>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }} keyboardShouldPersistTaps="handled">
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
        </View>

        <View className="px-4 py-6 bg-dark border-t border-border">
          <Text className="text-text-muted text-xs uppercase tracking-wider mb-2">Create Listing</Text>
          <Text className="text-white text-xl font-bold mb-4">Basic Details</Text>
          <View className="bg-dark-2 rounded-xl p-4 border border-border gap-4">
            <View>
              <Text className="text-text-muted text-sm mb-1">Title *</Text>
              <TextInput
                className="bg-night rounded-lg border border-border px-3 py-2 text-white"
                placeholder="e.g. 2BHK Apartment in Koramangala"
                placeholderTextColor="rgba(255,255,255,0.45)"
                value={title}
                onChangeText={setTitle}
                editable={!loading}
              />
            </View>
            <View>
              <Text className="text-text-muted text-sm mb-1">Listing For</Text>
              <View className="flex-row gap-2">
                {LISTING_FOR_OPTIONS.map((o) => (
                  <Pressable
                    key={o.value}
                    onPress={() => setListingFor(o.value)}
                    className={`flex-1 py-2 rounded-lg border ${listingFor === o.value ? 'bg-teal-dim border-teal' : 'bg-night border-border'}`}
                  >
                    <Text className={`text-center font-medium ${listingFor === o.value ? 'text-teal' : 'text-white'}`}>{o.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
            <View>
              <Text className="text-text-muted text-sm mb-1">Property Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
                {PROPERTY_TYPE_OPTIONS.map((o) => (
                  <Pressable
                    key={o.value}
                    onPress={() => setPropertyType(o.value)}
                    className={`px-3 py-2 rounded-lg border ${propertyType === o.value ? 'bg-teal-dim border-teal' : 'bg-night border-border'}`}
                  >
                    <Text className={propertyType === o.value ? 'text-teal font-medium' : 'text-white'}>{o.label}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
            <View>
              <Text className="text-text-muted text-sm mb-1">Address / Location *</Text>
              <TextInput
                className="bg-night rounded-lg border border-border px-3 py-2 text-white"
                placeholder="City, locality, project name"
                placeholderTextColor="rgba(255,255,255,0.45)"
                value={address}
                onChangeText={setAddress}
                editable={!loading}
              />
            </View>
            <View>
              <Text className="text-text-muted text-sm mb-1">Price (₹) *</Text>
              <TextInput
                className="bg-night rounded-lg border border-border px-3 py-2 text-white"
                placeholder="0"
                placeholderTextColor="rgba(255,255,255,0.45)"
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
                editable={!loading}
              />
            </View>
            {error ? (
              <Text className="text-red-400 text-sm">{error}</Text>
            ) : null}
            <Pressable
              onPress={handleSubmit}
              disabled={loading}
              className="bg-teal py-3 rounded-xl items-center mt-2"
            >
              {loading ? (
                <ActivityIndicator color="#0f172a" />
              ) : (
                <Text className="text-night font-bold">Submit listing</Text>
              )}
            </Pressable>
          </View>
          {!process.env.EXPO_PUBLIC_API_URL && !process.env.EXPO_PUBLIC_GRAPHQL_HTTP ? (
            <Text className="text-text-muted text-sm mt-3">Set EXPO_PUBLIC_API_URL or EXPO_PUBLIC_GRAPHQL_HTTP to submit to the backend.</Text>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
