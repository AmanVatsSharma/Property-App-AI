/**
 * @file [id].tsx
 * @module app/property
 * @description Property detail screen; fetches from API when configured; theme-aware.
 * @author BharatERP
 * @created 2025-03-10
 */

import { useTheme } from '@/components/providers/ThemeProvider';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, View, Text, Pressable, ActivityIndicator, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchProperty, toggleFavorite, sendEnquiry, getMe, type ApiProperty } from '@/lib/graphql-client';
import { getAuthHeaders } from '@/lib/auth-store';

function formatPrice(price: number): string {
  return price >= 1_00_00_000 ? `₹${(price / 1_00_00_000).toFixed(2)} Cr` : `₹${(price / 1_00_000).toFixed(0)} L`;
}

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isDark } = useTheme();
  const [property, setProperty] = useState<ApiProperty | null | undefined>(undefined);
  const [saved, setSaved] = useState(false);
  const [enquireVisible, setEnquireVisible] = useState(false);
  const [enquiryMessage, setEnquiryMessage] = useState('');
  const [enquirySending, setEnquirySending] = useState(false);
  const [enquirySent, setEnquirySent] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const bgMain = isDark ? 'bg-night' : 'bg-light-night';
  const bgCard = isDark ? 'bg-dark' : 'bg-light-dark';
  const bgCard2 = isDark ? 'bg-dark-2' : 'bg-light-dark-2';
  const borderCls = isDark ? 'border-border' : 'border-light-border';
  const textCls = isDark ? 'text-white' : 'text-light-heading';
  const textMuted = isDark ? 'text-text-muted' : 'text-light-text-muted';
  const tealCls = isDark ? 'text-teal' : 'text-light-teal';
  const greenCls = isDark ? 'text-green' : 'text-light-green';
  const btnPrimaryText = isDark ? 'text-night' : 'text-light-btn-primary-text';
  const placeholderColor = isDark ? 'rgba(255,255,255,0.45)' : '#5c6370';
  const indicatorColor = isDark ? '#00d4aa' : '#00b894';

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      const p = await fetchProperty(id);
      if (!cancelled) setProperty(p ?? null);
    })();
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    getAuthHeaders().then((headers) => {
      if (!headers) return;
      getMe(headers).then((me) => {
        if (!cancelled && me) setUserId(me.id);
      });
    });
    return () => { cancelled = true; };
  }, []);

  const handleSave = async () => {
    if (!id) return;
    const headers = await getAuthHeaders();
    if (!headers) return;
    try {
      const res = await toggleFavorite(id, headers);
      setSaved(res.saved);
    } catch {
      // ignore
    }
  };

  const handleSendEnquiry = async () => {
    if (!id || !enquiryMessage.trim()) return;
    const headers = await getAuthHeaders();
    if (!headers) return;
    setEnquirySending(true);
    try {
      await sendEnquiry({ propertyId: id, message: enquiryMessage.trim() }, headers);
      setEnquirySent(true);
      setEnquiryMessage('');
    } catch {
      // ignore
    } finally {
      setEnquirySending(false);
    }
  };

  const isOwner = Boolean(property && userId && property.createdByUserId === userId);

  const loading = property === undefined && id != null;
  const notFound = id != null && property === null;

  if (loading) {
    return (
      <SafeAreaView className={`flex-1 ${bgMain}`} edges={['top']}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={indicatorColor} />
        </View>
      </SafeAreaView>
    );
  }

  if (notFound) {
    return (
      <SafeAreaView className={`flex-1 ${bgMain}`} edges={['top']}>
        <View className="flex-1 px-6 items-center justify-center">
          <Text className="text-6xl mb-4">🔍</Text>
          <Text className={`${textCls} text-xl font-bold text-center mb-2`}>Property not found</Text>
          <Text className={`${textMuted} text-sm text-center mb-6`}>
            This property may have been removed or the link is incorrect.
          </Text>
          <Pressable onPress={() => router.back()} className={`${isDark ? 'bg-teal' : 'bg-light-teal'} py-3 px-6 rounded-xl`}>
            <Text className={isDark ? 'text-night font-semibold' : 'text-light-btn-primary-text font-semibold'}>Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const p = property!;
  const priceStr = formatPrice(p.price);
  const pricePerSqft = p.areaSqft ? `₹${Math.round(p.price / p.areaSqft).toLocaleString()} / sq.ft` : null;
  const specs = [
    { icon: '🛏', val: `${p.bedrooms} BHK`, label: 'Bedrooms' },
    { icon: '🚿', val: String(p.bathrooms), label: 'Bathrooms' },
    { icon: '📐', val: p.areaSqft?.toLocaleString() ?? '—', label: 'Sq.ft' },
    { icon: '📅', val: p.status ?? '—', label: 'Status' },
  ];

  return (
    <SafeAreaView className={`flex-1 ${bgMain}`} edges={['top']}>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
        <View className={`px-4 pt-4 pb-4 border-b ${borderCls}`}>
          <Pressable onPress={() => router.back()}>
            <Text className={`${textMuted} text-sm`}>← Back</Text>
          </Pressable>
          <View className={`${bgCard2} rounded-2xl h-48 items-center justify-center mb-4 mt-2`}>
            <Text className="text-6xl">🏡</Text>
            <View className="flex-row gap-2 mt-2">
              <View className={`${bgCard} px-3 py-1.5 rounded-lg`}>
                <Text className={`${textCls} text-sm`}>📸 Photos</Text>
              </View>
              <View className={`${bgCard} px-3 py-1.5 rounded-lg`}>
                <Text className={`${textCls} text-sm`}>🎬 Video Tour</Text>
              </View>
            </View>
          </View>
        </View>

        <View className="px-4 pt-4">
          <View className="flex-row flex-wrap gap-2 mb-3">
            <View className={`${isDark ? 'bg-teal-dim' : 'bg-light-teal-dim'} px-2 py-0.5 rounded`}>
              <Text className={`${tealCls} text-xs font-semibold`}>✦ AI Pick</Text>
            </View>
            <View className={`${isDark ? 'bg-green-dim' : 'bg-light-teal-dim'} px-2 py-0.5 rounded`}>
              <Text className={`${greenCls} text-xs font-semibold`}>✓ RERA Verified</Text>
            </View>
          </View>
          <Text className={`${textCls} text-xl font-bold mb-1`}>{p.title}</Text>
          <Text className={`${textMuted} text-sm mb-3`}>📍 {p.location}</Text>
          <View className="flex-row justify-between items-start mb-4">
            <View>
              <Text className={`${tealCls} text-2xl font-bold`}>{priceStr}</Text>
              {pricePerSqft != null && <Text className={`${textMuted} text-sm`}>{pricePerSqft}</Text>}
            </View>
            <View className="flex-row gap-2">
              <Pressable onPress={handleSave} className={`${bgCard2} px-3 py-2 rounded-lg border ${borderCls}`}>
                <Text className={`${textCls} text-sm`}>{saved ? '❤️ Saved' : '♡ Save'}</Text>
              </Pressable>
              <Pressable onPress={() => setEnquireVisible(true)} className={`${bgCard2} px-3 py-2 rounded-lg border ${borderCls}`}>
                <Text className={`${textCls} text-sm`}>Enquire</Text>
              </Pressable>
              <Pressable className={`${bgCard2} px-3 py-2 rounded-lg border ${borderCls}`}>
                <Text className={`${textCls} text-sm`}>⤴ Share</Text>
              </Pressable>
            </View>
          </View>

          <View className="flex-row flex-wrap gap-3 mb-6">
            {specs.map((s) => (
              <View key={s.label} className={`${bgCard} rounded-xl px-3 py-2 border ${borderCls} items-center min-w-[70px]`}>
                <Text className="text-lg">{s.icon}</Text>
                <Text className={`${textCls} font-semibold text-sm`}>{s.val}</Text>
                <Text className={`${textMuted} text-xs`}>{s.label}</Text>
              </View>
            ))}
          </View>

          <View className={`${bgCard} rounded-xl p-4 border ${borderCls} mb-4`}>
            <Text className={`${textCls} font-bold text-lg mb-3`}>Overview</Text>
            <View className={`flex-row justify-between py-2 border-b ${borderCls}`}>
              <Text className={`${textMuted} text-sm`}>Project</Text>
              <Text className={`text-sm font-medium ${textCls}`}>{p.title}</Text>
            </View>
            <View className={`flex-row justify-between py-2 border-b ${borderCls}`}>
              <Text className={`${textMuted} text-sm`}>Location</Text>
              <Text className={`text-sm font-medium ${textCls}`}>{p.location}</Text>
            </View>
          </View>

          {p.aiScore != null && (
            <View className={`${isDark ? 'bg-teal-dim' : 'bg-light-teal-dim'} rounded-xl p-4 border ${isDark ? 'border-teal/30' : 'border-light-teal/30'} mb-4`}>
              <View className="flex-row items-center gap-3">
                <View className={`w-14 h-14 rounded-full ${isDark ? 'bg-teal/20' : 'bg-light-teal/20'} items-center justify-center`}>
                  <Text className={`${tealCls} text-xl font-bold`}>{p.aiScore}</Text>
                </View>
                <View>
                  <Text className={`${tealCls} font-bold`}>AI Score</Text>
                  {p.aiTip != null && <Text className={`${textMuted} text-xs`}>{p.aiTip}</Text>}
                </View>
              </View>
            </View>
          )}

          <View className={`${bgCard} rounded-xl p-4 border ${borderCls}`}>
            <Text className={`${textCls} font-bold mb-2`}>Contact Owner</Text>
            <Text className={`${textMuted} text-sm mb-3`}>Get in touch for site visits and negotiations</Text>
            <Pressable className="bg-green py-3 rounded-xl mb-2">
              <Text className="text-white font-semibold text-center">📞 Call Now</Text>
            </Pressable>
            <Pressable className="bg-green/80 py-3 rounded-xl">
              <Text className="text-white font-semibold text-center">WhatsApp</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <Modal visible={enquireVisible} transparent animationType="fade">
        <Pressable className="flex-1 bg-black/50 justify-center p-4" onPress={() => setEnquireVisible(false)}>
          <Pressable className={`${bgCard} rounded-2xl p-4 border ${borderCls}`} onPress={(e) => e.stopPropagation()}>
            <Text className={`${textCls} font-bold text-lg mb-2`}>Send enquiry</Text>
            <TextInput
              className={`${bgCard2} rounded-lg border ${borderCls} px-3 py-2 ${textCls} text-sm min-h-[80px]`}
              placeholder="Your message..."
              placeholderTextColor={placeholderColor}
              value={enquiryMessage}
              onChangeText={setEnquiryMessage}
              multiline
              maxLength={1000}
            />
            <View className="flex-row gap-2 mt-3">
              <Pressable
                onPress={handleSendEnquiry}
                disabled={enquirySending || !enquiryMessage.trim()}
                className={`flex-1 py-3 rounded-xl ${isDark ? 'bg-teal' : 'bg-light-teal'} items-center`}
              >
                <Text className={btnPrimaryText}>{enquirySending ? 'Sending…' : 'Send'}</Text>
              </Pressable>
              <Pressable onPress={() => { setEnquireVisible(false); setEnquirySent(false); }} className={`flex-1 py-3 rounded-xl border ${borderCls} items-center`}>
                <Text className={textCls}>Cancel</Text>
              </Pressable>
            </View>
            {enquirySent && <Text className={`${greenCls} text-sm mt-2`}>Enquiry sent.</Text>}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
