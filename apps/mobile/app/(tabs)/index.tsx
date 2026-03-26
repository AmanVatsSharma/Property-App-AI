/**
 * @file index.tsx
 * @module app/(tabs)
 * @description World-class Home screen — hero image card, animated stat counters,
 *              swipeable featured property carousel, gradient city cards, dual CTA.
 *              Full light + dark mode via isDark branching pattern.
 * @author BharatERP
 * @created 2025-03-10
 * @updated 2026-03-26
 */

import { useTheme } from '@/components/providers/ThemeProvider';
import { CITIES } from '@/constants/cities';
import { fetchProperties, type ApiProperty } from '@/lib/graphql-client';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = SCREEN_W - 48;

/* ── helpers ─────────────────────────────────────────────────────── */

function formatPrice(price: number): string {
  return price >= 1_00_00_000
    ? `₹${(price / 1_00_00_000).toFixed(2)} Cr`
    : `₹${(price / 1_00_000).toFixed(0)} L`;
}

function emiEstimate(price: number): string {
  const r = 0.085 / 12;
  const n = 240;
  const emi = (price * 0.8 * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  return emi >= 1_00_000
    ? `₹${(emi / 1_00_000).toFixed(1)}L/mo`
    : `₹${Math.round(emi / 1000)}K/mo`;
}

/* ── animated counter ────────────────────────────────────────────── */

function useCountUp(target: number, duration = 1600): number {
  const [value, setValue] = useState(0);
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const start = Date.now();
    animRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress >= 1 && animRef.current) clearInterval(animRef.current);
    }, 16);
    return () => { if (animRef.current) clearInterval(animRef.current); };
  }, [target, duration]);

  return value;
}

/* ── city gradient colours ───────────────────────────────────────── */

const CITY_COLORS: Record<string, { from: string; to: string; accent: string }> = {
  Mumbai:    { from: '#0ea5e933', to: '#0369a133', accent: '#0ea5e9' },
  Bangalore: { from: '#22c55e33', to: '#15803d33', accent: '#22c55e' },
  'Delhi NCR':{ from: '#a855f733', to: '#7e22ce33', accent: '#a855f7' },
  Hyderabad: { from: '#00d4aa33', to: '#00967833', accent: '#00d4aa' },
  Pune:      { from: '#f59e0b33', to: '#b4530033', accent: '#f59e0b' },
  Chennai:   { from: '#f9731633', to: '#c2410c33', accent: '#f97316' },
};

const SEARCH_TABS = [
  { id: 'buy',  label: 'Buy',  icon: '🏠' },
  { id: 'rent', label: 'Rent', icon: '🔑' },
  { id: 'new',  label: 'New',  icon: '🏗️' },
  { id: 'commercial', label: 'Commercial', icon: '🏢' },
];

const STATS = [
  { label: 'Verified\nListings', target: 24000, suffix: '+', format: (v: number) => `${(v / 1000).toFixed(0)}K` },
  { label: 'RERA\nVerified', target: 100, suffix: '%', format: (v: number) => `${v}%` },
  { label: 'Cities\nCovered', target: 340, suffix: '+', format: (v: number) => `${v}+` },
];

/* ── property carousel card ──────────────────────────────────────── */

interface PropertyCarouselCardProps {
  property: ApiProperty;
  isDark: boolean;
  onPress: () => void;
}

function PropertyCarouselCard({ property: p, isDark, onPress }: PropertyCarouselCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const bgCard = isDark ? '#0f1623' : '#eef1f5';
  const teal = isDark ? '#00d4aa' : '#00b894';
  const textColor = isDark ? 'rgba(255,255,255,0.9)' : '#1a1d24';
  const textMuted = isDark ? 'rgba(255,255,255,0.45)' : '#5c6370';
  const borderColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';

  const handlePressIn = () => Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true }).start();
  const handlePressOut = () => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();

  return (
    <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View
        style={[
          styles.carouselCard,
          { backgroundColor: bgCard, borderColor, transform: [{ scale: scaleAnim }] },
        ]}
      >
        {/* Property image */}
        <View style={styles.carouselImgWrap}>
          {p.coverImageUrl ? (
            <Image source={{ uri: p.coverImageUrl }} style={styles.carouselImg} resizeMode="cover" />
          ) : (
            <View style={[styles.carouselImgPlaceholder, { backgroundColor: isDark ? '#161d2e' : '#e4e8ee' }]}>
              <Text style={{ fontSize: 48 }}>🏡</Text>
            </View>
          )}

          {/* Gradient overlay */}
          <View style={styles.carouselImgGradient} />

          {/* Price overlay */}
          <View style={styles.priceTag}>
            <Text style={[styles.priceTagText, { color: '#fff' }]}>{formatPrice(p.price)}</Text>
          </View>

          {/* AI pick badge */}
          {p.aiScore != null && p.aiScore >= 90 && (
            <View style={[styles.aiBadge, { backgroundColor: `${teal}22`, borderColor: `${teal}44` }]}>
              <Text style={[styles.aiBadgeText, { color: teal }]}>✦ AI PICK</Text>
            </View>
          )}

          {/* AI score circle */}
          {p.aiScore != null && (
            <View style={[styles.scoreCircle, { backgroundColor: `${teal}22`, borderColor: `${teal}44` }]}>
              <Text style={[styles.scoreCircleNum, { color: teal }]}>{p.aiScore}</Text>
              <Text style={[styles.scoreCircleLabel, { color: teal }]}>AI</Text>
            </View>
          )}
        </View>

        {/* Card body */}
        <View style={styles.carouselBody}>
          <Text style={[styles.carouselPrice, { color: teal }]}>{formatPrice(p.price)}</Text>
          <Text style={[styles.carouselEmi, { color: textMuted }]}>≈ {emiEstimate(p.price)} EMI est.</Text>
          <Text style={[styles.carouselTitle, { color: textColor }]} numberOfLines={1}>{p.title}</Text>
          <View style={styles.carouselSpecRow}>
            <Text style={[styles.carouselSpec, { color: textMuted }]}>📍 {p.location.split(',')[0]?.trim()}</Text>
            {p.bedrooms > 0 && <Text style={[styles.carouselSpec, { color: textMuted }]}>· {p.bedrooms} BHK</Text>}
            {p.areaSqft != null && <Text style={[styles.carouselSpec, { color: textMuted }]}>· {p.areaSqft.toLocaleString()} sqft</Text>}
          </View>
          {p.aiTip && (
            <View style={[styles.aiTipRow, { backgroundColor: `${teal}10` }]}>
              <Text style={[styles.aiTipText, { color: teal }]}>✦ {p.aiTip.length > 70 ? `${p.aiTip.slice(0, 67)}…` : p.aiTip}</Text>
            </View>
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
}

/* ── main component ──────────────────────────────────────────────── */

export default function HomeScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('buy');
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredProperties, setFeaturedProperties] = useState<ApiProperty[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [carouselIndex, setCarouselIndex] = useState(0);

  /* Theme-derived classes */
  const bgMain = isDark ? 'bg-night' : 'bg-light-night';
  const bgCard = isDark ? '#0f1623' : '#eef1f5';
  const bgCard2 = isDark ? '#161d2e' : '#e4e8ee';
  const teal = isDark ? '#00d4aa' : '#00b894';
  const tealDim = isDark ? 'rgba(0,212,170,0.12)' : 'rgba(0,184,148,0.12)';
  const tealBorder = isDark ? 'rgba(0,212,170,0.25)' : 'rgba(0,184,148,0.25)';
  const textColor = isDark ? 'rgba(255,255,255,0.9)' : '#1a1d24';
  const textMuted = isDark ? 'rgba(255,255,255,0.45)' : '#5c6370';
  const textDim = isDark ? 'rgba(255,255,255,0.2)' : '#8b92a0';
  const borderColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';
  const bgNight = isDark ? '#080c14' : '#f5f7fa';

  /* Load featured properties */
  useEffect(() => {
    let cancelled = false;
    setLoadingProperties(true);
    fetchProperties({ limit: 6 })
      .then((list) => { if (!cancelled) { setFeaturedProperties(list ?? []); setLoadingProperties(false); } })
      .catch(() => { if (!cancelled) { setFeaturedProperties([]); setLoadingProperties(false); } });
    return () => { cancelled = true; };
  }, []);

  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      router.push(`/(tabs)/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/(tabs)/search');
    }
  }, [searchQuery, router]);

  /* Stats with animated counters */
  const stat0 = useCountUp(24000);
  const stat1 = useCountUp(100);
  const stat2 = useCountUp(340);
  const statValues = [stat0, stat1, stat2];

  return (
    <SafeAreaView className={`flex-1 ${bgMain}`} edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── HERO ─────────────────────────────────────────── */}
        <View className="px-5 pt-5 pb-6">
          {/* Live pill */}
          <View
            style={{
              alignSelf: 'flex-start',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              backgroundColor: tealDim,
              borderWidth: 1,
              borderColor: tealBorder,
              borderRadius: 100,
              paddingHorizontal: 12,
              paddingVertical: 5,
              marginBottom: 18,
            }}
          >
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: teal }} />
            <Text style={{ fontSize: 11, fontWeight: '700', color: teal, letterSpacing: 0.5 }}>
              LIVE MARKET DATA
            </Text>
          </View>

          {/* Headline */}
          <Text style={{ fontSize: 32, fontWeight: '800', color: textColor, lineHeight: 38, marginBottom: 6 }}>
            Search Smarter.{'\n'}
            <Text style={{ color: teal }}>Buy Better.</Text>{'\n'}
            <Text style={{ color: textMuted, fontWeight: '300' }}>Live Richer.</Text>
          </Text>
          <Text style={{ fontSize: 14, color: textMuted, lineHeight: 21, marginBottom: 24, maxWidth: 300 }}>
            AI-powered real estate across 340+ Indian cities. Verified listings, real price intelligence.
          </Text>

          {/* Search card */}
          <View
            style={{
              backgroundColor: bgCard,
              borderRadius: 20,
              borderWidth: 1,
              borderColor,
              padding: 14,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: isDark ? 0.4 : 0.1,
              shadowRadius: 16,
              elevation: 8,
            }}
          >
            {/* Type tabs */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              {SEARCH_TABS.map((tab) => (
                <Pressable
                  key={tab.id}
                  onPress={() => setActiveTab(tab.id)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 7,
                    borderRadius: 100,
                    backgroundColor: activeTab === tab.id ? tealDim : bgCard2,
                    borderWidth: 1,
                    borderColor: activeTab === tab.id ? tealBorder : borderColor,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Text style={{ fontSize: 12 }}>{tab.icon}</Text>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: activeTab === tab.id ? '700' : '500',
                      color: activeTab === tab.id ? teal : textMuted,
                    }}
                  >
                    {tab.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Input row */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: bgNight,
                borderRadius: 14,
                borderWidth: 1,
                borderColor,
                paddingHorizontal: 12,
                paddingVertical: 4,
                marginBottom: 10,
              }}
            >
              <Text style={{ color: teal, fontSize: 15, marginRight: 8 }}>✦</Text>
              <TextInput
                style={{ flex: 1, color: textColor, fontSize: 14, paddingVertical: 10 }}
                placeholder="3BHK near metro in Pune under ₹1.2Cr"
                placeholderTextColor={textDim}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
              />
            </View>

            <Pressable
              onPress={handleSearch}
              style={({ pressed }) => ({
                backgroundColor: teal,
                borderRadius: 14,
                paddingVertical: 13,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Text
                style={{
                  color: isDark ? '#080c14' : '#ffffff',
                  fontWeight: '800',
                  textAlign: 'center',
                  fontSize: 15,
                  letterSpacing: 0.3,
                }}
              >
                Search ✦
              </Text>
            </Pressable>
          </View>
        </View>

        {/* ── TRUST BAR ─────────────────────────────────────── */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
            paddingVertical: 14,
            paddingHorizontal: 20,
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor,
            backgroundColor: bgCard,
            marginBottom: 8,
          }}
        >
          {['✅ RERA Verified', '🔒 Zero Spam', '🤖 AI Pricing', '🇮🇳 Made for India'].map((item) => (
            <Text key={item} style={{ fontSize: 11, color: textMuted, fontWeight: '500' }}>{item}</Text>
          ))}
        </View>

        {/* ── ANIMATED STATS ────────────────────────────────── */}
        <View className="px-5 py-5">
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              backgroundColor: bgCard,
              borderRadius: 18,
              borderWidth: 1,
              borderColor,
              overflow: 'hidden',
            }}
          >
            {STATS.map((s, i) => (
              <View
                key={s.label}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  paddingVertical: 16,
                  borderRightWidth: i < STATS.length - 1 ? 1 : 0,
                  borderRightColor: borderColor,
                }}
              >
                <Text style={{ fontSize: 22, fontWeight: '800', color: teal, lineHeight: 26 }}>
                  {s.format(statValues[i])}
                </Text>
                <Text style={{ fontSize: 10, color: textMuted, textAlign: 'center', marginTop: 3, lineHeight: 14 }}>
                  {s.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── FEATURED PROPERTIES CAROUSEL ──────────────────── */}
        <View className="py-4">
          <View className="px-5 mb-4" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <View>
              <Text style={{ fontSize: 10, fontWeight: '700', color: teal, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 }}>
                AI-CURATED FOR YOU
              </Text>
              <Text style={{ fontSize: 20, fontWeight: '800', color: textColor }}>Properties You'll Love</Text>
            </View>
            <Pressable onPress={() => router.push('/(tabs)/search')}>
              <Text style={{ fontSize: 13, color: teal, fontWeight: '600' }}>View all →</Text>
            </Pressable>
          </View>

          {loadingProperties ? (
            <View className="px-5">
              <View
                style={{ height: 280, backgroundColor: bgCard2, borderRadius: 20, borderWidth: 1, borderColor, justifyContent: 'center', alignItems: 'center' }}
              >
                <Text style={{ color: textMuted, fontSize: 13 }}>Loading listings…</Text>
              </View>
            </View>
          ) : featuredProperties.length === 0 ? (
            <View className="px-5">
              <View
                style={{ backgroundColor: bgCard, borderRadius: 20, borderWidth: 1, borderColor, padding: 28, alignItems: 'center' }}
              >
                <Text style={{ fontSize: 40, marginBottom: 12 }}>🏠</Text>
                <Text style={{ color: textColor, fontWeight: '700', fontSize: 15, marginBottom: 6 }}>No listings yet</Text>
                <Text style={{ color: textMuted, fontSize: 13, textAlign: 'center', marginBottom: 16 }}>Connect the backend to see live properties.</Text>
                <Pressable
                  onPress={() => router.push('/(tabs)/search')}
                  style={{ backgroundColor: teal, borderRadius: 14, paddingHorizontal: 24, paddingVertical: 11 }}
                >
                  <Text style={{ color: isDark ? '#080c14' : '#fff', fontWeight: '700', fontSize: 14 }}>Explore Search</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <>
              <FlatList
                data={featuredProperties}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={CARD_W + 16}
                decelerationRate="fast"
                contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}
                onMomentumScrollEnd={(e) => {
                  const idx = Math.round(e.nativeEvent.contentOffset.x / (CARD_W + 16));
                  setCarouselIndex(idx);
                }}
                renderItem={({ item }) => (
                  <View style={{ width: CARD_W }}>
                    <PropertyCarouselCard
                      property={item}
                      isDark={isDark}
                      onPress={() => router.push(`/property/${item.id}`)}
                    />
                  </View>
                )}
              />
              {/* Dot indicators */}
              <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 12 }}>
                {featuredProperties.map((_, i) => (
                  <View
                    key={i}
                    style={{
                      width: i === carouselIndex ? 20 : 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: i === carouselIndex ? teal : borderColor,
                      transition: 'width 0.3s',
                    }}
                  />
                ))}
              </View>
            </>
          )}
        </View>

        {/* ── CITY GRID ─────────────────────────────────────── */}
        <View className="px-5 py-4">
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14 }}>
            <View>
              <Text style={{ fontSize: 10, fontWeight: '700', color: teal, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 }}>
                EXPLORE BY CITY
              </Text>
              <Text style={{ fontSize: 20, fontWeight: '800', color: textColor }}>India's Hottest Markets</Text>
            </View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20 }} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
            {CITIES.map((c, i) => {
              const cityColors = CITY_COLORS[c.name] ?? { from: `${teal}22`, to: `${teal}11`, accent: teal };
              return (
                <Pressable
                  key={c.name}
                  onPress={() => router.push(`/(tabs)/search?location=${encodeURIComponent(c.name)}`)}
                  style={({ pressed }) => ({
                    width: 140,
                    borderRadius: 16,
                    overflow: 'hidden',
                    borderWidth: 1,
                    borderColor: pressed ? cityColors.accent : borderColor,
                    backgroundColor: bgCard,
                    opacity: pressed ? 0.9 : 1,
                  })}
                >
                  {/* Gradient header */}
                  <View
                    style={{
                      height: 80,
                      backgroundColor: cityColors.from,
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                    }}
                  >
                    {/* Hot badge for top 3 */}
                    {i < 3 && (
                      <View
                        style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          backgroundColor: `${cityColors.accent}33`,
                          borderRadius: 100,
                          paddingHorizontal: 7,
                          paddingVertical: 2,
                          borderWidth: 1,
                          borderColor: `${cityColors.accent}55`,
                        }}
                      >
                        <Text style={{ fontSize: 9, fontWeight: '700', color: cityColors.accent }}>🔥 Hot</Text>
                      </View>
                    )}
                    <Text style={{ fontSize: 36 }}>{c.emoji}</Text>
                  </View>
                  {/* City info */}
                  <View style={{ padding: 12 }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: textColor }}>{c.name}</Text>
                    <Text style={{ fontSize: 11, color: textMuted, marginTop: 2 }}>{c.count} listings</Text>
                    <Text style={{ fontSize: 10, fontWeight: '600', color: cityColors.accent, marginTop: 4 }}>
                      {c.trend}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* ── AI FEATURES STRIP ─────────────────────────────── */}
        <View className="px-5 py-4">
          <Text style={{ fontSize: 10, fontWeight: '700', color: teal, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 }}>
            WHY URBANNEST.AI
          </Text>
          <Text style={{ fontSize: 20, fontWeight: '800', color: textColor, marginBottom: 16 }}>AI That Actually Works</Text>
          {[
            { icon: '🧠', title: 'Conversational AI Search', desc: 'Describe your dream home in plain English. GPT-4 powered.', color: teal },
            { icon: '📊', title: 'Price Intelligence', desc: 'Know if a property is over/underpriced. 10M+ data points.', color: isDark ? '#f5c842' : '#d4a82e' },
            { icon: '🗺️', title: 'Neighbourhood AI', desc: 'Safety, schools, commute, hospitals — 40+ signals scored.', color: isDark ? '#ff6b4a' : '#e85d4c' },
          ].map((f) => (
            <View
              key={f.title}
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: 14,
                backgroundColor: bgCard,
                borderRadius: 16,
                borderWidth: 1,
                borderColor,
                padding: 16,
                marginBottom: 10,
              }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: `${f.color}18`,
                  borderWidth: 1,
                  borderColor: `${f.color}30`,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Text style={{ fontSize: 22 }}>{f.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: textColor, marginBottom: 3 }}>{f.title}</Text>
                <Text style={{ fontSize: 12, color: textMuted, lineHeight: 17 }}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── DUAL CTA ──────────────────────────────────────── */}
        <View
          style={{
            margin: 20,
            backgroundColor: bgCard,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: tealBorder,
            padding: 20,
            overflow: 'hidden',
          }}
        >
          {/* Glow accent */}
          <View style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: tealDim }} />
          <Text style={{ fontSize: 12, fontWeight: '700', color: teal, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>
            Get Started Today
          </Text>
          <Text style={{ fontSize: 18, fontWeight: '800', color: textColor, marginBottom: 4 }}>
            Your Dream Home Awaits
          </Text>
          <Text style={{ fontSize: 13, color: textMuted, marginBottom: 18, lineHeight: 19 }}>
            Join 1.2L+ families who found their perfect property with UrbanNest.ai — free forever.
          </Text>
          <Pressable
            onPress={() => router.push('/(tabs)/search')}
            style={({ pressed }) => ({
              backgroundColor: teal,
              borderRadius: 14,
              paddingVertical: 13,
              marginBottom: 10,
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Text style={{ color: isDark ? '#080c14' : '#fff', fontWeight: '800', textAlign: 'center', fontSize: 15 }}>
              Start AI Search — Free ✦
            </Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/(tabs)/post')}
            style={({ pressed }) => ({
              borderRadius: 14,
              paddingVertical: 12,
              borderWidth: 1.5,
              borderColor: tealBorder,
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Text style={{ color: teal, fontWeight: '700', textAlign: 'center', fontSize: 14 }}>
              Post Property Free
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ── styles ──────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  carouselCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  carouselImgWrap: {
    height: 180,
    position: 'relative',
    overflow: 'hidden',
  },
  carouselImg: {
    width: '100%',
    height: '100%',
  },
  carouselImgPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  carouselImgGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    backgroundColor: 'transparent',
  },
  priceTag: {
    position: 'absolute',
    bottom: 10,
    left: 12,
    backgroundColor: 'rgba(8,12,20,0.85)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  priceTagText: {
    fontSize: 15,
    fontWeight: '800',
  },
  aiBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    borderRadius: 100,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  aiBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  scoreCircle: {
    position: 'absolute',
    top: 10,
    right: 10,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
  },
  scoreCircleNum: {
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 18,
  },
  scoreCircleLabel: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  carouselBody: {
    padding: 14,
  },
  carouselPrice: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 1,
  },
  carouselEmi: {
    fontSize: 11,
    marginBottom: 6,
  },
  carouselTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  carouselSpecRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  carouselSpec: {
    fontSize: 12,
  },
  aiTipRow: {
    marginTop: 8,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  aiTipText: {
    fontSize: 11,
    lineHeight: 16,
  },
});
