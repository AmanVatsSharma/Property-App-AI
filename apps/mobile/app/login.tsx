/**
 * @file login.tsx
 * @module app
 * @description Sign-in screen: phone → send OTP → code → verify; stores token in SecureStore.
 * @author BharatERP
 * @created 2025-03-12
 */

import { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { sendOtp, verifyOtp } from '../lib/graphql-client';
import { setToken } from '../lib/auth-store';

export default function LoginScreen() {
  const router = useRouter();
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendOtp = async () => {
    const normalized = phone.replace(/\D/g, '');
    if (normalized.length < 10) {
      setError('Enter a valid 10-digit Indian mobile number');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await sendOtp(phone.trim());
      setStep('code');
      setCode('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send OTP');
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      setError('Enter the 6-digit code');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const { token: newToken } = await verifyOtp(phone.trim(), code.trim());
      await setToken(newToken);
      router.replace('/(tabs)');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid or expired OTP');
      Alert.alert('Error', e instanceof Error ? e.message : 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-night" edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24, justifyContent: 'center' }} keyboardShouldPersistTaps="handled">
          <Text className="text-white text-2xl font-bold mb-2">Sign in</Text>
          <Text className="text-text-muted mb-6">Use your mobile number to sign in with OTP.</Text>

          {step === 'phone' ? (
            <>
              <Text className="text-text-muted text-sm mb-2">Mobile number (10 digits)</Text>
              <TextInput
                className="bg-dark rounded-lg border border-border px-3 py-3 text-white mb-4"
                placeholder="e.g. 9876543210"
                placeholderTextColor="rgba(255,255,255,0.45)"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                editable={!loading}
              />
              {error ? <Text className="text-red-400 text-sm mb-3">{error}</Text> : null}
              <Pressable
                onPress={handleSendOtp}
                disabled={loading}
                className="bg-teal py-3 rounded-xl items-center"
              >
                {loading ? <ActivityIndicator color="#0f172a" /> : <Text className="text-night font-bold">Send OTP</Text>}
              </Pressable>
            </>
          ) : (
            <>
              <Text className="text-text-muted text-sm mb-2">Code sent to {phone.replace(/\D/g, '').slice(-10)}</Text>
              <TextInput
                className="bg-dark rounded-lg border border-border px-3 py-3 text-white mb-4"
                placeholder="000000"
                placeholderTextColor="rgba(255,255,255,0.45)"
                keyboardType="number-pad"
                maxLength={6}
                value={code}
                onChangeText={(t) => setCode(t.replace(/\D/g, '').slice(0, 6))}
                editable={!loading}
              />
              {error ? <Text className="text-red-400 text-sm mb-3">{error}</Text> : null}
              <Pressable
                onPress={handleVerify}
                disabled={loading || code.length !== 6}
                className="bg-teal py-3 rounded-xl items-center mb-3"
              >
                {loading ? <ActivityIndicator color="#0f172a" /> : <Text className="text-night font-bold">Verify</Text>}
              </Pressable>
              <Pressable onPress={() => { setStep('phone'); setError(null); }} disabled={loading}>
                <Text className="text-teal text-center">Change number</Text>
              </Pressable>
            </>
          )}

          <Pressable onPress={() => router.back()} className="mt-8">
            <Text className="text-text-muted text-center">Cancel</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
