/**
 * @file search.tsx
 * @module app/(tabs)
 * @description World-class search screen: premium filter bar with bottom-sheet style
 *              filter drawer, horizontal card view, animated search with AI sparkle,
 *              sort pills, loading skeleton. Light + dark mode via isDark.
 * @author BharatERP
 * @created 2025-03-10
 * @updated 2026-03-26
 */

import { useTheme } from '@/components/providers/ThemeProvider';
import { useLocation } from '@/lib/location-context';
import { useRouter } from 'expo-router';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchProperties, searchPropertiesByQuery, type ApiProperty, type PropertyFilter } from '@/lib/graphql-client';
import { PropertyMap, type PropertyMapItem } from '@/components/PropertyMap';

/* ── helpers ──────────────────────────────────────────────────────── */

const SCREEN_WIDTH = Dimensions.get('window').width;
const LOCATION_DELTA = 0.1;

function buildFilterFromLocation(location: ReturnType<typeof useLocation>, extras?: Partial<PropertyFilter>): PropertyFilter {
  const base: PropertyFilter = { limit: 50, ...extras };
  if (location.coords) {
    const { latitude, longitude } = location.coords;
    base.minLat = latitude - LOCATION_DELTA;
    base.maxLat = latitude + LOCATION_DELTA;
    base.minLng = longitude - LOCATION_DELTA;
    base.maxLng = longitude + LOCATION_DELTA;
  } else if (location.city) {
    base.location = location.city;
  }
  return base;
}

function formatPrice(price: number): string {
  return price >= 1_00_00_000
    ? `₹${(price / 1_00_00_000).toFixed(2)} Cr`
    : `₹${(price / 1_00_000).toFixed(0)} L`;
}

function apiToMapItems(list: ApiProperty[]): PropertyMapItem[] {
  return list
    .filter((p): p is ApiProperty & { latitude: number; longitude: number } =>
      p.latitude != null && p.longitude != null && Number.isFinite(p.latitude) && Number.isFinite(p.longitude),
    )
    .map((p) => ({ id: p.id, title: p.title, location: p.location, price: p.price, latitude: p.latitude, longitude: p.longitude }));
}

/* ── sort options ─────────────────────────────────────────────────── */

const SORT_OPTIONS = [
  { id: 'relevance', label: 'Relevance' },
  { id: 'ai-score', label: '✦ AI Score' },
  { id: 'price-asc', label: 'Price ↑' },
  { id: 'price-desc', label: 'Price ↓' },
  { id: 'newest', label: 'Newest' },
];

/* ── filter types ─────────────────────────────────────────────────── */

const TYPE_OPTIONS = [
  { label: 'Apartment', value: 'apartment', icon: '🏢' },
  { label: 'Villa', value: 'villa', icon: '🏡' },
  { label: 'Plot', value: 'plot', icon: '🌳' },
  { label: 'Office', value: 'office', icon: '💼' },
];

const BHK_OPTIONS = ['1', '2', '3', '4+'];

/* ── property list card ───────────────────────────────────────────── */

function PropertyListCard({ p, isDark, onPress }: { p: ApiProperty; isDark: boolean; onPress: () => void }) {
  const tealColor = isDark ? '#00d4aa' : '#00b894';
  const bgCard = isDark ? '#0f1623' : '#eef1f5';
  const bgCard2 = isDark ? '#161d2e' : '#e4e8ee';
  const borderColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';
  const textHead = isDark ? '#ffffff' : '#1a1d24';
  const textMuted = isDark ? 'rgba(255,255,255,0.45)' : '#5c6370';
  const scoreColor = p.aiScore != null
    ? p.aiScore >= 85 ? tealColor : p.aiScore >= 70 ? '#f5c842' : '#ff6b4a'
    : textMuted;

  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        backgroundColor: bgCard,
        borderRadius: 16,
        borderWidth: 1,
        borderColor,
        marginBottom: 10,
        overflow: 'hidden',
      }}
    >
      {/* Thumbnail */}
      <View style={{ width: 110, height: 110, backgroundColor: bgCard2, flexShrink: 0 }}>
        {p.coverImageUrl ? (
          <Image source={{ uri: p.coverImageUrl }} style={{ width: 110, height: 110 }} resizeMode="cover" />
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 36 }}>🏡</Text>
          </View>
        )}
        {/* AI Score badge */}
        {p.aiScore != null && (
          <View
            style={{
              position: 'absolute',
              bottom: 6,
              left: 6,
              backgroundColor: 'rgba(8,12,20,0.88)',
              borderRadius: 6,
              paddingHorizontal: 6,
              paddingVertical: 3,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: scoreColor, fontSize: 12, fontWeight: '800' }}>{p.aiScore}</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={{ flex: 1, padding: 12, justifyContent: 'space-between' }}>
        <View>
          <Text style={{ color: tealColor, fontWeight: '800', fontSize: 16, marginBottom: 2 }}>
            {formatPrice(p.price)}
          </Text>
          <Text style={{ color: textHead, fontWeight: '600', fontSize: 13, marginBottom: 4 }} numberOfLines={2}>
            {p.title}
          </Text>
          <Text style={{ color: textMuted, fontSize: 11 }} numberOfLines={1}>
            📍 {p.location.split(',')[0]?.trim()}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
          {p.bedrooms > 0 && (
            <Text style={{ color: textMuted, fontSize: 10, backgroundColor: bgCard2, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 }}>
              {p.bedrooms} BHK
            </Text>
          )}
          {p.areaSqft != null && p.areaSqft > 0 && (
            <Text style={{ color: textMuted, fontSize: 10, backgroundColor: bgCard2, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 }}>
              {Math.round(p.areaSqft).toLocaleString()} sqft
            </Text>
          )}
          {p.aiScore != null && p.aiScore >= 90 && (
            <Text style={{ color: tealColor, fontSize: 10, backgroundColor: isDark ? 'rgba(0,212,170,0.1)' : 'rgba(0,184,148,0.12)', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 }}>
              ✦ AI Pick
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

/* ── filter modal ─────────────────────────────────────────────────── */

interface FilterState {
  type: string;
  bhk: string;
  sortBy: string;
}

function FilterModal({
  visible,
  filters,
  onChange,
  onClose,
  isDark,
}: {
  visible: boolean;
  filters: FilterState;
  onChange: (f: Partial<FilterState>) => void;
  onClose: () => void;
  isDark: boolean;
}) {
  const insets = useSafeAreaInsets();
  const bgCard = isDark ? '#0f1623' : '#eef1f5';
  const bgCard2 = isDark ? '#161d2e' : '#e4e8ee';
  const bgMain = isDark ? '#080c14' : '#f5f7fa';
  const borderColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';
  const textHead = isDark ? '#ffffff' : '#1a1d24';
  const textMuted = isDark ? 'rgba(255,255,255,0.45)' : '#5c6370';
  const tealColor = isDark ? '#00d4aa' : '#00b894';
  const btnText = isDark ? '#080c14' : '#ffffff';

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        {/* Backdrop */}
        <Pressable
          style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)' }}
          onPress={onClose}
        />
        {/* Sheet */}
        <View
          style={{
            backgroundColor: bgCard,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingTop: 12,
            paddingBottom: insets.bottom + 20,
            borderTopWidth: 1,
            borderColor,
            maxHeight: '85%',
          }}
        >
          {/* Handle */}
          <View style={{ width: 36, height: 4, backgroundColor: borderColor, borderRadius: 2, alignSelf: 'center', marginBottom: 16 }} />

          <View style={{ paddingHorizontal: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <Text style={{ color: textHead, fontSize: 18, fontWeight: '700' }}>Filters</Text>
              <Pressable onPress={onClose}>
                <Text style={{ color: textMuted, fontSize: 22 }}>✕</Text>
              </Pressable>
            </View>

            {/* Property type */}
            <Text style={{ color: textMuted, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
              Property Type
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
              {TYPE_OPTIONS.map((t) => (
                <Pressable
                  key={t.value}
                  onPress={() => onChange({ type: filters.type === t.value ? '' : t.value })}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    paddingHorizontal: 14,
                    paddingVertical: 9,
                    borderRadius: 100,
                    borderWidth: 1,
                    borderColor: filters.type === t.value ? tealColor : borderColor,
                    backgroundColor: filters.type === t.value
                      ? (isDark ? 'rgba(0,212,170,0.12)' : 'rgba(0,184,148,0.12)')
                      : bgCard2,
                  }}
                >
                  <Text>{t.icon}</Text>
                  <Text style={{ color: filters.type === t.value ? tealColor : textMuted, fontSize: 13, fontWeight: filters.type === t.value ? '700' : '400' }}>
                    {t.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* BHK */}
            <Text style={{ color: textMuted, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
              Bedrooms (BHK)
            </Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
              {BHK_OPTIONS.map((b) => {
                const val = b === '4+' ? '4' : b;
                return (
                  <Pressable
                    key={b}
                    onPress={() => onChange({ bhk: filters.bhk === val ? '' : val })}
                    style={{
                      flex: 1,
                      paddingVertical: 11,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: filters.bhk === val ? tealColor : borderColor,
                      backgroundColor: filters.bhk === val
                        ? (isDark ? 'rgba(0,212,170,0.12)' : 'rgba(0,184,148,0.12)')
                        : bgCard2,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: filters.bhk === val ? tealColor : textMuted, fontSize: 14, fontWeight: '700' }}>{b}</Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Sort by */}
            <Text style={{ color: textMuted, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
              Sort By
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
              {SORT_OPTIONS.map((s) => (
                <Pressable
                  key={s.id}
                  onPress={() => onChange({ sortBy: s.id })}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 100,
                    borderWidth: 1,
                    borderColor: filters.sortBy === s.id ? tealColor : borderColor,
                    backgroundColor: filters.sortBy === s.id
                      ? (isDark ? 'rgba(0,212,170,0.12)' : 'rgba(0,184,148,0.12)')
                      : bgCard2,
                  }}
                >
                  <Text style={{ color: filters.sortBy === s.id ? tealColor : textMuted, fontSize: 12, fontWeight: filters.sortBy === s.id ? '700' : '400' }}>
                    {s.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Apply button */}
            <Pressable
              onPress={onClose}
              style={{ backgroundColor: tealColor, borderRadius: 14, paddingVertical: 15 }}
            >
              <Text style={{ color: btnText, fontWeight: '800', textAlign: 'center', fontSize: 15 }}>
                Apply Filters
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

/* ── main ─────────────────────────────────────────────────────────── */

export default function SearchScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const location = useLocation();
  const insets = useSafeAreaInsets();

  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [apiList, setApiList] = useState<ApiProperty[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [nlSearching, setNlSearching] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({ type: '', bhk: '', sortBy: 'relevance' });

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
  const indicatorColor = tealColor;

  /* Active filter count */
  const activeFilterCount = [filters.type, filters.bhk].filter(Boolean).length;

  /* Load properties */
  useEffect(() => {
    let cancelled = false;
    const sortMap: Record<string, { sortBy?: 'createdAt' | 'price' | 'aiScore'; sortOrder?: 'asc' | 'desc' }> = {
      relevance: { sortBy: 'createdAt', sortOrder: 'desc' },
      newest: { sortBy: 'createdAt', sortOrder: 'desc' },
      'price-asc': { sortBy: 'price', sortOrder: 'asc' },
      'price-desc': { sortBy: 'price', sortOrder: 'desc' },
      'ai-score': { sortBy: 'aiScore', sortOrder: 'desc' },
    };
    const sortConfig = sortMap[filters.sortBy] ?? {};
    const extras: Partial<PropertyFilter> = {
      ...(filters.type && { type: filters.type }),
      ...(filters.bhk && { bedrooms: parseInt(filters.bhk, 10) }),
      ...sortConfig,
    };
    const filter = buildFilterFromLocation(location, extras);
    setLoading(true);
    (async () => {
      try {
        const list = await fetchProperties(filter);
        if (!cancelled) setApiList(list ?? []);
      } catch {
        if (!cancelled) setApiList([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [location.city, location.coords?.latitude, location.coords?.longitude, filters.type, filters.bhk, filters.sortBy]);

  const handleNLSearch = async () => {
    const query = searchText.trim();
    if (!query) return;
    setNlSearching(true);
    try {
      const results = await searchPropertiesByQuery(query);
      setApiList(results ?? []);
    } catch {
      setApiList([]);
    } finally {
      setNlSearching(false);
    }
  };

  const listItems = apiList ?? [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgMain }} edges={['top']}>
      {/* ── Search header ──────────────────────────────────── */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: borderColor,
          backgroundColor: bgMain,
        }}
      >
        {/* Search row */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: bgCard2,
            borderRadius: 14,
            borderWidth: 1,
            borderColor,
            paddingHorizontal: 12,
            paddingVertical: 4,
            marginBottom: 10,
          }}
        >
          <Animated.Text style={{ color: tealColor, fontSize: 16, marginRight: 8 }}>
            {nlSearching ? '⟳' : '✦'}
          </Animated.Text>
          <TextInput
            style={{ flex: 1, color: textHead, fontSize: 14, paddingVertical: 8 }}
            placeholder="AI Search: 3BHK near metro under ₹1Cr…"
            placeholderTextColor={placeholderColor}
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleNLSearch}
            returnKeyType="search"
          />
          <Pressable
            onPress={handleNLSearch}
            disabled={nlSearching}
            style={{ backgroundColor: tealColor, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 }}
          >
            <Text style={{ color: btnText, fontWeight: '700', fontSize: 12 }}>
              {nlSearching ? '…' : 'Search'}
            </Text>
          </Pressable>
        </View>

        {/* Filter + sort bar */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {/* Filter button */}
          <Pressable
            onPress={() => setFilterOpen(true)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 100,
              borderWidth: 1,
              borderColor: activeFilterCount > 0 ? tealColor : borderColor,
              backgroundColor: activeFilterCount > 0
                ? (isDark ? 'rgba(0,212,170,0.1)' : 'rgba(0,184,148,0.1)')
                : bgCard2,
            }}
          >
            <Text style={{ fontSize: 12 }}>⚙️</Text>
            <Text style={{ color: activeFilterCount > 0 ? tealColor : textMuted, fontSize: 12, fontWeight: '600' }}>
              Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
            </Text>
          </Pressable>

          {/* Sort pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ flex: 1 }}
            contentContainerStyle={{ gap: 6 }}
          >
            {SORT_OPTIONS.slice(0, 3).map((s) => (
              <Pressable
                key={s.id}
                onPress={() => setFilters((f) => ({ ...f, sortBy: s.id }))}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 7,
                  borderRadius: 100,
                  borderWidth: 1,
                  borderColor: filters.sortBy === s.id ? tealColor : borderColor,
                  backgroundColor: filters.sortBy === s.id
                    ? (isDark ? 'rgba(0,212,170,0.1)' : 'rgba(0,184,148,0.1)')
                    : bgCard2,
                }}
              >
                <Text style={{ color: filters.sortBy === s.id ? tealColor : textMuted, fontSize: 11, fontWeight: filters.sortBy === s.id ? '700' : '400' }}>
                  {s.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* View toggle */}
          <View style={{ flexDirection: 'row', borderRadius: 10, borderWidth: 1, borderColor, overflow: 'hidden' }}>
            {(['list', 'map'] as const).map((mode) => (
              <Pressable
                key={mode}
                onPress={() => setViewMode(mode)}
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 7,
                  backgroundColor: viewMode === mode ? tealColor : bgCard2,
                }}
              >
                <Text style={{ color: viewMode === mode ? btnText : textMuted, fontSize: 12, fontWeight: '600' }}>
                  {mode === 'list' ? '☰' : '🗺️'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Result count */}
        <Text style={{ color: textMuted, fontSize: 11, marginTop: 8 }}>
          {loading ? 'Searching…' : `${listItems.length} propert${listItems.length !== 1 ? 'ies' : 'y'} found`}
        </Text>
      </View>

      {/* ── Content ────────────────────────────────────────── */}
      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={indicatorColor} />
          <Text style={{ color: textMuted, fontSize: 13, marginTop: 12 }}>Finding properties…</Text>
        </View>
      ) : listItems.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>🔍</Text>
          <Text style={{ color: textHead, fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 8 }}>No properties found</Text>
          <Text style={{ color: textMuted, fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: 24 }}>
            Try adjusting your filters or use AI search to describe what you want.
          </Text>
          <Pressable
            onPress={() => setFilters({ type: '', bhk: '', sortBy: 'relevance' })}
            style={{ borderWidth: 1, borderColor: tealColor, borderRadius: 100, paddingHorizontal: 20, paddingVertical: 11 }}
          >
            <Text style={{ color: tealColor, fontWeight: '700' }}>Clear Filters</Text>
          </Pressable>
        </View>
      ) : viewMode === 'map' ? (
        <View style={{ flex: 1, margin: 12, borderRadius: 16, overflow: 'hidden', minHeight: 400 }}>
          <PropertyMap properties={apiToMapItems(listItems)} style={{ flex: 1 }} />
        </View>
      ) : (
        <FlatList
          data={listItems}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <PropertyListCard
              p={item}
              isDark={isDark}
              onPress={() => router.push(`/property/${item.id}` as never)}
            />
          )}
        />
      )}

      {/* Filter modal */}
      <FilterModal
        visible={filterOpen}
        filters={filters}
        onChange={(patch) => setFilters((f) => ({ ...f, ...patch }))}
        onClose={() => setFilterOpen(false)}
        isDark={isDark}
      />
    </SafeAreaView>
  );
}
