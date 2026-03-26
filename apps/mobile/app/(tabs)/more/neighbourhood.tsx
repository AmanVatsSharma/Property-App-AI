/**
 * @file neighbourhood.tsx
 * @module app/(tabs)/more
 * @description Neighbourhood Score Explorer — Coming Soon screen with waitlist CTA.
 * @author BharatERP
 * @created 2025-03-10
 * @updated 2026-03-26 Added waitlist notification CTA so users can register interest.
 */

import { useState } from 'react';
import { ScrollView, View, Text, TextInput, Pressable, Alert } from 'react-native';
import { useTheme } from '@/components/providers/ThemeProvider';

export default function NeighbourhoodScreen() {
  const { isDark } = useTheme();
  const bgMain = isDark ? 'bg-night' : 'bg-light-night';
  const bgCard = isDark ? 'bg-dark' : 'bg-light-dark';
  const bgCard2 = isDark ? 'bg-dark-2' : 'bg-light-dark-2';
  const borderCls = isDark ? 'border-border' : 'border-light-border';
  const textCls = isDark ? 'text-white' : 'text-light-heading';
  const textMuted = isDark ? 'text-text-muted' : 'text-light-text-muted';
  const tealCls = isDark ? 'text-teal' : 'text-light-teal';
  const tealBg = isDark ? 'bg-teal' : 'bg-light-teal';
  const greenCls = isDark ? 'text-green' : 'text-light-green';
  const btnPrimaryText = isDark ? 'text-night' : 'text-light-btn-primary-text';
  const placeholderColor = isDark ? 'rgba(255,255,255,0.45)' : '#5c6370';

  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleNotify = () => {
    if (!email.includes('@')) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }
    // [SonuRamTODO] Wire up to a real waitlist/newsletter API endpoint
    setSubmitted(true);
  };

  const features = [
    { icon: '🏫', label: 'Schools & Education' },
    { icon: '🏥', label: 'Hospitals & Healthcare' },
    { icon: '🚇', label: 'Metro & Transport' },
    { icon: '🛒', label: 'Markets & Malls' },
    { icon: '🌳', label: 'Parks & Open Spaces' },
    { icon: '🍽️', label: 'Restaurants & Cafes' },
  ];

  return (
    <ScrollView
      className={`flex-1 ${bgMain}`}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
    >
      <View className={`${bgCard} rounded-2xl p-6 border ${borderCls} items-center mb-6`}>
        <View
          className={`w-20 h-20 rounded-full ${isDark ? 'bg-teal/10' : 'bg-light-teal/10'} items-center justify-center mb-4`}
        >
          <Text style={{ fontSize: 40 }}>🏘️</Text>
        </View>
        <Text className={`${textCls} font-bold text-xl mb-2 text-center`}>
          Neighbourhood Explorer
        </Text>
        <View
          className={`px-3 py-1 rounded-full mb-3 ${isDark ? 'bg-teal-dim' : 'bg-light-teal-dim'} border ${isDark ? 'border-teal/30' : 'border-light-teal/30'}`}
        >
          <Text className={`${tealCls} text-xs font-bold uppercase tracking-wider`}>
            Coming Soon
          </Text>
        </View>
        <Text className={`${textMuted} text-sm text-center leading-6`}>
          AI-powered neighbourhood scoring is on its way. Compare localities by livability, connectivity, and amenity access in real time.
        </Text>
      </View>

      {/* Waitlist CTA */}
      <View className={`${bgCard} rounded-2xl p-5 border ${borderCls} mb-6`}>
        <Text className={`${textCls} font-bold text-base mb-1`}>Get early access</Text>
        <Text className={`${textMuted} text-sm mb-3`}>
          Be first to explore neighbourhood scores when we launch.
        </Text>
        {submitted ? (
          <Text className={`${greenCls} font-semibold text-sm`}>
            ✓ You're on the list! We'll notify you at launch.
          </Text>
        ) : (
          <View className="flex-row gap-2">
            <TextInput
              className={`flex-1 ${bgCard2} rounded-xl border ${borderCls} px-3 py-2.5 ${textCls} text-sm`}
              placeholder="your@email.com"
              placeholderTextColor={placeholderColor}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="send"
              onSubmitEditing={handleNotify}
            />
            <Pressable
              onPress={handleNotify}
              className={`${tealBg} px-4 rounded-xl items-center justify-center`}
            >
              <Text className={`${btnPrimaryText} font-semibold text-sm`}>Notify me</Text>
            </Pressable>
          </View>
        )}
      </View>

      <Text className={`${textCls} font-bold text-base mb-3`}>What you'll get</Text>
      <View className="flex-row flex-wrap gap-3">
        {features.map((f) => (
          <View
            key={f.label}
            className={`${bgCard2} rounded-xl px-4 py-3 border ${borderCls} flex-row items-center gap-2`}
            style={{ minWidth: '46%', flex: 1 }}
          >
            <Text style={{ fontSize: 20 }}>{f.icon}</Text>
            <Text className={`${textMuted} text-xs flex-1`}>{f.label}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
