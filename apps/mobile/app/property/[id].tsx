/**
 * @file [id].tsx
 * @module app/property
 * @description World-class property detail: paginated image carousel with dot indicators,
 *              animated SVG AI score ring, sticky bottom CTA bar, haptic feedback on save,
 *              spec grid with icons, AI insights panel. Light + dark mode via isDark.
 * @author BharatERP
 * @created 2025-03-10
 * @updated 2026-03-26
 */

import { useTheme } from '@/components/providers/ThemeProvider';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Share,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Svg, { Circle } from 'react-native-svg';
import { fetchProperty, toggleFavorite, sendEnquiry, getMe, fetchMyFavorites, type ApiProperty } from '@/lib/graphql-client';
import { getAuthHeaders } from '@/lib/auth-store';

/* ── helpers ──────────────────────────────────────────────────────── */

const SCREEN_WIDTH = Dimensions.get('window').width;

function formatPrice(price: number): string {
  return price >= 1_00_00_000
    ? `₹${(price / 1_00_00_000).toFixed(2)} Cr`
    : `₹${(price / 1_00_000).toFixed(0)} L`;
}

function emiEstimate(price: number): string {
  const r = 0.085 / 12;
  const n = 240;
  const loan = price * 0.8;
  const emi = (loan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  return emi >= 1_00_000
    ? `₹${(emi / 1_00_000).toFixed(1)}L/mo`
    : `₹${Math.round(emi / 1000)}K/mo`;
}

/* ── animated score ring ──────────────────────────────────────────── */

function ScoreRing({ score, color, size = 64 }: { score: number; color: string; size?: number }) {
  const r = (size - 10) / 2;
  const circumference = 2 * Math.PI * r;
  const animatedDash = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedDash, {
      toValue: (score / 100) * circumference,
      duration: 1200,
      delay: 300,
      useNativeDriver: false,
    }).start();
  }, [score, circumference]);

  const AnimatedCircle = Animated.createAnimatedComponent(Circle);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={7}
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={7}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={animatedDash.interpolate({
            inputRange: [0, circumference],
            outputRange: [circumference, 0],
          })}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <Text style={{ color, fontSize: 17, fontWeight: '800' }}>{score}</Text>
    </View>
  );
}

/* ── main ─────────────────────────────────────────────────────────── */

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [property, setProperty] = useState<ApiProperty | null | undefined>(undefined);
  const [saved, setSaved] = useState(false);
  const [saveAnim] = useState(new Animated.Value(1));
  const [enquireVisible, setEnquireVisible] = useState(false);
  const [enquiryMessage, setEnquiryMessage] = useState('');
  const [enquirySending, setEnquirySending] = useState(false);
  const [enquirySent, setEnquirySent] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'ai' | 'emi'>('overview');

  /* Colors */
  const bgMain = isDark ? '#080c14' : '#f5f7fa';
  const bgCard = isDark ? '#0f1623' : '#eef1f5';
  const bgCard2 = isDark ? '#161d2e' : '#e4e8ee';
  const borderColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';
  const textHead = isDark ? '#ffffff' : '#1a1d24';
  const textMuted = isDark ? 'rgba(255,255,255,0.45)' : '#5c6370';
  const tealColor = isDark ? '#00d4aa' : '#00b894';
  const btnText = isDark ? '#080c14' : '#ffffff';
  const placeholderColor = isDark ? 'rgba(255,255,255,0.3)' : '#aab0ba';
  const greenColor = isDark ? '#4ade80' : '#2ecc71';

  const scoreColor =
    (property?.aiScore ?? 0) >= 85 ? tealColor : (property?.aiScore ?? 0) >= 70 ? '#f5c842' : '#ff6b4a';

  /* Load property */
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      const p = await fetchProperty(id);
      if (!cancelled) setProperty(p ?? null);
    })();
    return () => { cancelled = true; };
  }, [id]);

  /* Load auth + favorites */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const headers = await getAuthHeaders();
      if (!headers || cancelled) return;
      const favorites = await fetchMyFavorites(headers).catch(() => []);
      if (!cancelled && id && favorites.some((f) => f.propertyId === id)) setSaved(true);
    })();
    return () => { cancelled = true; };
  }, [id]);

  const handleSave = async () => {
    if (!id) return;
    const headers = await getAuthHeaders();
    if (!headers) return;
    try {
      const res = await toggleFavorite(id, headers);
      setSaved(res.saved);
      /* Haptic feedback + bounce animation */
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Animated.sequence([
        Animated.spring(saveAnim, { toValue: 1.3, useNativeDriver: true, speed: 40 }),
        Animated.spring(saveAnim, { toValue: 1, useNativeDriver: true, speed: 40 }),
      ]).start();
    } catch {
      // ignore
    }
  };

  const handleShare = async () => {
    if (!property) return;
    const siteUrl = process.env.EXPO_PUBLIC_SITE_URL ?? 'https://urbannest.ai';
    try {
      await Share.share({
        title: property.title,
        message: `${property.title} in ${property.location} — ${formatPrice(property.price)}\n${siteUrl}/property/${property.id}`,
        url: `${siteUrl}/property/${property.id}`,
      });
    } catch { /* user cancelled */ }
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
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch { /* ignore */ }
    finally { setEnquirySending(false); }
  };

  /* Loading state */
  if (property === undefined && id != null) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: bgMain }} edges={['top']}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={tealColor} />
          <Text style={{ color: textMuted, fontSize: 13, marginTop: 12 }}>Loading property…</Text>
        </View>
      </SafeAreaView>
    );
  }

  /* Not found */
  if (id != null && property === null) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: bgMain }} edges={['top']}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
          <Text style={{ fontSize: 52, marginBottom: 16 }}>🔍</Text>
          <Text style={{ color: textHead, fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 8 }}>
            Property Not Found
          </Text>
          <Text style={{ color: textMuted, fontSize: 13, textAlign: 'center', marginBottom: 24 }}>
            This property may have been removed.
          </Text>
          <Pressable
            onPress={() => router.back()}
            style={{ backgroundColor: tealColor, paddingHorizontal: 24, paddingVertical: 13, borderRadius: 14 }}
          >
            <Text style={{ color: btnText, fontWeight: '700' }}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const p = property!;
  const priceStr = formatPrice(p.price);
  const pricePerSqft = p.areaSqft ? `₹${Math.round(p.price / p.areaSqft).toLocaleString()} / sq.ft` : null;
  const emi = emiEstimate(p.price);

  /* Image list — use real images or placeholder */
  const images = p.imageUrls && p.imageUrls.length > 0
    ? p.imageUrls
    : p.coverImageUrl
      ? [p.coverImageUrl]
      : [];

  const specs = [
    { icon: '🛏', val: `${p.bedrooms} BHK`, label: 'Bedrooms' },
    { icon: '🚿', val: String(p.bathrooms), label: 'Bathrooms' },
    { icon: '📐', val: p.areaSqft ? `${p.areaSqft.toLocaleString()} sqft` : '—', label: 'Area' },
    { icon: '📅', val: p.status ?? 'Active', label: 'Status' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgMain }} edges={['top']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Back + Image carousel ──────────────────────── */}
        <View style={{ position: 'relative' }}>
          {/* Image carousel */}
          {images.length > 0 ? (
            <FlatList
              data={images}
              keyExtractor={(img, i) => `img-${i}`}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={(e: NativeSyntheticEvent<NativeScrollEvent>) => {
                const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
                setImageIndex(idx);
              }}
              scrollEventThrottle={16}
              renderItem={({ item }) => (
                <Image
                  source={{ uri: item }}
                  style={{ width: SCREEN_WIDTH, height: 260 }}
                  resizeMode="cover"
                />
              )}
            />
          ) : (
            <View style={{ width: SCREEN_WIDTH, height: 260, backgroundColor: bgCard2, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 64 }}>🏡</Text>
            </View>
          )}

          {/* Gradient overlay on image */}
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 120,
              background: 'transparent',
            }}
            pointerEvents="none"
          />

          {/* Back button */}
          <Pressable
            onPress={() => router.back()}
            style={{
              position: 'absolute',
              top: 12,
              left: 16,
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(8,12,20,0.8)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>←</Text>
          </Pressable>

          {/* Action buttons */}
          <View style={{ position: 'absolute', top: 12, right: 16, flexDirection: 'row', gap: 8 }}>
            <Animated.View style={{ transform: [{ scale: saveAnim }] }}>
              <Pressable
                onPress={handleSave}
                style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(8,12,20,0.8)', alignItems: 'center', justifyContent: 'center' }}
              >
                <Text style={{ fontSize: 18 }}>{saved ? '❤️' : '🤍'}</Text>
              </Pressable>
            </Animated.View>
            <Pressable
              onPress={handleShare}
              style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(8,12,20,0.8)', alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ color: '#fff', fontSize: 16 }}>↗</Text>
            </Pressable>
          </View>

          {/* Image dots */}
          {images.length > 1 && (
            <View style={{ position: 'absolute', bottom: 12, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
              {images.map((_, i) => (
                <View
                  key={i}
                  style={{
                    width: i === imageIndex ? 16 : 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: i === imageIndex ? '#fff' : 'rgba(255,255,255,0.4)',
                  }}
                />
              ))}
            </View>
          )}

          {/* Image count badge */}
          {images.length > 0 && (
            <View
              style={{
                position: 'absolute',
                bottom: 14,
                right: 16,
                backgroundColor: 'rgba(8,12,20,0.8)',
                borderRadius: 8,
                paddingHorizontal: 8,
                paddingVertical: 4,
              }}
            >
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: '600' }}>
                {imageIndex + 1}/{images.length}
              </Text>
            </View>
          )}
        </View>

        {/* ── Property info ─────────────────────────────── */}
        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          {/* Badges */}
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
            {(p.aiScore ?? 0) >= 90 && (
              <View style={{ backgroundColor: isDark ? 'rgba(0,212,170,0.1)' : 'rgba(0,184,148,0.12)', borderWidth: 1, borderColor: isDark ? 'rgba(0,212,170,0.3)' : 'rgba(0,184,148,0.3)', borderRadius: 100, paddingHorizontal: 10, paddingVertical: 4 }}>
                <Text style={{ color: tealColor, fontSize: 11, fontWeight: '700' }}>✦ AI Pick</Text>
              </View>
            )}
            {p.listingFor && (
              <View style={{ backgroundColor: bgCard2, borderWidth: 1, borderColor, borderRadius: 100, paddingHorizontal: 10, paddingVertical: 4 }}>
                <Text style={{ color: textMuted, fontSize: 11, textTransform: 'capitalize' }}>{p.listingFor}</Text>
              </View>
            )}
          </View>

          <Text style={{ color: textHead, fontSize: 20, fontWeight: '800', marginBottom: 6, lineHeight: 26 }}>
            {p.title}
          </Text>
          <Text style={{ color: textMuted, fontSize: 13, marginBottom: 12 }}>
            📍 {p.location}
          </Text>

          {/* Price row */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
            <View>
              <Text style={{ color: tealColor, fontSize: 28, fontWeight: '900', lineHeight: 32 }}>{priceStr}</Text>
              {pricePerSqft && <Text style={{ color: textMuted, fontSize: 12, marginTop: 2 }}>{pricePerSqft}</Text>}
              <Text style={{ color: textMuted, fontSize: 11, marginTop: 2 }}>≈ {emi} EMI</Text>
            </View>
            {p.aiScore != null && <ScoreRing score={p.aiScore} color={scoreColor} size={64} />}
          </View>

          {/* Spec grid */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
            {specs.map((s) => (
              <View
                key={s.label}
                style={{
                  flex: 1,
                  minWidth: 70,
                  backgroundColor: bgCard,
                  borderRadius: 14,
                  padding: 14,
                  borderWidth: 1,
                  borderColor,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 20, marginBottom: 6 }}>{s.icon}</Text>
                <Text style={{ color: textHead, fontWeight: '700', fontSize: 13 }}>{s.val}</Text>
                <Text style={{ color: textMuted, fontSize: 10, marginTop: 2 }}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* Tabs */}
          <View
            style={{
              flexDirection: 'row',
              borderBottomWidth: 1,
              borderBottomColor: borderColor,
              marginBottom: 20,
            }}
          >
            {([
              { id: 'overview', label: 'Overview' },
              { id: 'ai', label: '✦ AI Insights' },
              { id: 'emi', label: 'EMI Calc' },
            ] as const).map((tab) => (
              <Pressable
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  paddingBottom: 12,
                  alignItems: 'center',
                  borderBottomWidth: 2,
                  borderBottomColor: activeTab === tab.id ? tealColor : 'transparent',
                }}
              >
                <Text style={{ color: activeTab === tab.id ? tealColor : textMuted, fontSize: 12, fontWeight: activeTab === tab.id ? '700' : '400' }}>
                  {tab.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Tab content */}
          {activeTab === 'overview' && (
            <View
              style={{
                backgroundColor: bgCard,
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor,
                marginBottom: 20,
              }}
            >
              <Text style={{ color: textHead, fontWeight: '700', fontSize: 16, marginBottom: 12 }}>Overview</Text>
              {[
                { label: 'Project', val: p.title },
                { label: 'Location', val: p.location },
                { label: 'Type', val: p.type ?? '—' },
                { label: 'Listing For', val: p.listingFor ?? 'Sale' },
              ].map((row) => (
                <View key={row.label} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: borderColor }}>
                  <Text style={{ color: textMuted, fontSize: 13 }}>{row.label}</Text>
                  <Text style={{ color: textHead, fontSize: 13, fontWeight: '500', maxWidth: '60%', textAlign: 'right' }} numberOfLines={1}>
                    {row.val}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {activeTab === 'ai' && p.aiScore != null && (
            <View
              style={{
                backgroundColor: isDark ? 'rgba(0,212,170,0.06)' : 'rgba(0,184,148,0.06)',
                borderWidth: 1,
                borderColor: isDark ? 'rgba(0,212,170,0.2)' : 'rgba(0,184,148,0.2)',
                borderRadius: 16,
                padding: 20,
                marginBottom: 20,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <ScoreRing score={p.aiScore} color={scoreColor} size={72} />
                <View>
                  <Text style={{ color: textMuted, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>AI Score</Text>
                  <Text style={{ color: scoreColor, fontSize: 20, fontWeight: '800' }}>
                    {p.aiScore >= 90 ? 'Excellent' : p.aiScore >= 80 ? 'Very Good' : p.aiScore >= 70 ? 'Good' : 'Fair'}
                  </Text>
                  <Text style={{ color: textMuted, fontSize: 12, marginTop: 2 }}>Top {101 - p.aiScore}% in area</Text>
                </View>
              </View>
              {p.aiTip && (
                <Text style={{ color: textMuted, fontSize: 13, lineHeight: 20, borderTopWidth: 1, borderTopColor: isDark ? 'rgba(0,212,170,0.15)' : 'rgba(0,184,148,0.15)', paddingTop: 14 }}>
                  ✦ {p.aiTip}
                </Text>
              )}
              {[
                { label: '12-Month Forecast', val: '+8-12%', color: greenColor },
                { label: 'Rental Yield', val: '3.2-4.1%', color: tealColor },
                { label: 'Market Demand', val: 'High', color: tealColor },
              ].map((item) => (
                <View key={item.label} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: isDark ? 'rgba(0,212,170,0.1)' : 'rgba(0,184,148,0.1)' }}>
                  <Text style={{ color: textMuted, fontSize: 12 }}>{item.label}</Text>
                  <Text style={{ color: item.color, fontSize: 13, fontWeight: '700' }}>{item.val}</Text>
                </View>
              ))}
            </View>
          )}

          {activeTab === 'emi' && (
            <View
              style={{
                backgroundColor: bgCard,
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor,
                marginBottom: 20,
              }}
            >
              <Text style={{ color: textHead, fontWeight: '700', fontSize: 16, marginBottom: 14 }}>🏦 EMI Calculator</Text>
              {[
                { label: `Property: ${formatPrice(p.price)}`, val: formatPrice(p.price) },
                { label: 'Down Payment: 20%', val: formatPrice(p.price * 0.2) },
                { label: 'Loan Amount: 80%', val: formatPrice(p.price * 0.8) },
                { label: 'Interest Rate: 8.5%', val: '8.5% p.a.' },
                { label: 'Tenure: 20 years', val: '20 years' },
              ].map((row) => (
                <View key={row.label} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: borderColor }}>
                  <Text style={{ color: textMuted, fontSize: 12 }}>{row.label}</Text>
                  <Text style={{ color: textHead, fontSize: 12, fontWeight: '600' }}>{row.val}</Text>
                </View>
              ))}
              <View style={{ marginTop: 16, padding: 14, backgroundColor: isDark ? 'rgba(0,212,170,0.08)' : 'rgba(0,184,148,0.08)', borderRadius: 12 }}>
                <Text style={{ color: textMuted, fontSize: 11, marginBottom: 4 }}>Estimated Monthly EMI</Text>
                <Text style={{ color: tealColor, fontSize: 28, fontWeight: '900' }}>{emi}</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* ── Sticky bottom CTA bar ─────────────────────────── */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingBottom: insets.bottom + 8,
          paddingTop: 12,
          paddingHorizontal: 16,
          backgroundColor: bgCard,
          borderTopWidth: 1,
          borderTopColor: borderColor,
          flexDirection: 'row',
          gap: 10,
        }}
      >
        <Pressable
          onPress={handleSave}
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: saved ? tealColor : borderColor,
            backgroundColor: saved ? (isDark ? 'rgba(0,212,170,0.1)' : 'rgba(0,184,148,0.1)') : bgCard2,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Animated.Text style={{ fontSize: 20, transform: [{ scale: saveAnim }] }}>
            {saved ? '❤️' : '🤍'}
          </Animated.Text>
        </Pressable>

        <Pressable
          onPress={() => setEnquireVisible(true)}
          style={{
            flex: 1,
            backgroundColor: tealColor,
            borderRadius: 14,
            alignItems: 'center',
            justifyContent: 'center',
            height: 48,
          }}
        >
          <Text style={{ color: btnText, fontWeight: '800', fontSize: 15 }}>
            📞 Enquire Now
          </Text>
        </Pressable>

        <Pressable
          onPress={handleShare}
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            borderWidth: 1,
            borderColor,
            backgroundColor: bgCard2,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: textHead, fontSize: 18 }}>↗</Text>
        </Pressable>
      </View>

      {/* ── Enquiry modal ──────────────────────────────────── */}
      <Modal visible={enquireVisible} transparent animationType="slide" presentationStyle="overFullScreen">
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Pressable
            style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)' }}
            onPress={() => setEnquireVisible(false)}
          />
          <View
            style={{
              backgroundColor: bgCard,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 24,
              paddingBottom: insets.bottom + 20,
              borderTopWidth: 1,
              borderTopColor: borderColor,
            }}
          >
            <View style={{ width: 36, height: 4, backgroundColor: borderColor, borderRadius: 2, alignSelf: 'center', marginBottom: 20 }} />
            <Text style={{ color: textHead, fontSize: 18, fontWeight: '700', marginBottom: 16 }}>Send Enquiry</Text>

            <TextInput
              style={{
                backgroundColor: bgCard2,
                borderRadius: 12,
                borderWidth: 1,
                borderColor,
                color: textHead,
                fontSize: 14,
                padding: 12,
                minHeight: 100,
                marginBottom: 12,
                textAlignVertical: 'top',
              }}
              placeholder="Your message…"
              placeholderTextColor={placeholderColor}
              value={enquiryMessage}
              onChangeText={setEnquiryMessage}
              multiline
              maxLength={1000}
            />

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Pressable
                onPress={handleSendEnquiry}
                disabled={enquirySending || !enquiryMessage.trim()}
                style={{ flex: 1, backgroundColor: tealColor, borderRadius: 14, paddingVertical: 14, alignItems: 'center', opacity: enquiryMessage.trim() ? 1 : 0.5 }}
              >
                <Text style={{ color: btnText, fontWeight: '800', fontSize: 15 }}>
                  {enquirySending ? 'Sending…' : 'Send Message'}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => { setEnquireVisible(false); setEnquirySent(false); }}
                style={{ flex: 1, borderWidth: 1, borderColor, borderRadius: 14, paddingVertical: 14, alignItems: 'center' }}
              >
                <Text style={{ color: textMuted, fontSize: 15 }}>Cancel</Text>
              </Pressable>
            </View>

            {enquirySent && (
              <Text style={{ color: greenColor, fontSize: 13, marginTop: 10, textAlign: 'center' }}>
                ✓ Enquiry sent! The owner will contact you soon.
              </Text>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
