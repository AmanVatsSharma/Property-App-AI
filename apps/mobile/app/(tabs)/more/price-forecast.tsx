/**
 * @file price-forecast.tsx
 * @module app/(tabs)/more
 * @description AI Price Forecast — city + locality selector, forecast bars, demand signal, confidence.
 *              Full light + dark mode via isDark branching pattern.
 * @author BharatERP
 * @created 2025-03-10
 * @updated 2026-05-12
 */

import { useTheme } from '@/components/providers/ThemeProvider';
import { fetchPriceForecast, type PriceForecastData } from '@/lib/graphql-client';
import { useState, useEffect, useCallback } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const CITIES = ['Bangalore', 'Mumbai', 'Delhi', 'Chennai', 'Hyderabad', 'Pune'];

const LOCALITIES: Record<string, string[]> = {
  Bangalore: ['Whitefield', 'Koramangala', 'HSR Layout', 'Indiranagar', 'JP Nagar', 'Marathahalli', 'Electronic City', 'Hebbal'],
  Mumbai: ['Bandra', 'Andheri West', 'Powai', 'Thane', 'Navi Mumbai', 'Juhu', 'Malad', 'Borivali'],
  Delhi: ['Gurgaon', 'Noida', 'Dwarka', 'Rohini', 'Saket', 'Vasant Kunj', 'Lajpat Nagar', 'Karol Bagh'],
  Chennai: ['Anna Nagar', 'Adyar', 'T Nagar', 'Velachery', 'OMR', 'Ecr', 'Mylapore', 'Porur'],
  Hyderabad: ['Gachibowli', 'Kukatpally', 'Hitech City', 'Banjara Hills', 'Jubilee Hills', 'Madhapur', 'Manikonda', 'Ameerpet'],
  Pune: ['Kothrud', 'Hinjewadi', 'Viman Nagar', 'Kalyani Nagar', 'Baner', 'Aundh', 'Wakad', 'Hadapsar'],
};

const PROPERTY_TYPES = ['apartment', 'villa', 'plot', 'office'];

function formatPrice(price: number): string {
  return price >= 1_00_00_000
    ? `₹${(price / 1_00_00_000).toFixed(2)} Cr`
    : `₹${(price / 1_00_000).toFixed(0)} L`;
}

function formatPct(current: number, forecast: number): string {
  const change = ((forecast - current) / current) * 100;
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(1)}%`;
}

/* ── Forecast bar ───────────────────────────────────────────────── */

function ForecastBar({
  label,
  current,
  forecast,
  color,
  isDark,
}: {
  label: string;
  current: number;
  forecast: number;
  color: string;
  isDark: boolean;
}) {
  const change = forecast - current;
  const pct = (change / current) * 100;
  const isUp = change >= 0;
  const bgCard2 = isDark ? '#161d2e' : '#e4e8ee';
  const textCls = isDark ? '#ffffff' : '#1a1d24';
  const textMuted = isDark ? 'rgba(255,255,255,0.45)' : '#5c6370';
  const maxBarWidth = 180;

  return (
    <View style={{ marginBottom: 20 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <View>
          <Text style={{ color: textCls, fontSize: 14, fontWeight: '700' }}>{label}</Text>
          <Text style={{ color: textMuted, fontSize: 11, marginTop: 2 }}>vs ₹{formatPrice(current)} today</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ color, fontSize: 16, fontWeight: '800' }}>{formatPrice(forecast)}</Text>
          <Text style={{ color, fontSize: 11, fontWeight: '600', marginTop: 2 }}>
            {isUp ? '↑' : '↓'} {formatPct(current, forecast)}
          </Text>
        </View>
      </View>
      <View style={{ height: 10, backgroundColor: bgCard2, borderRadius: 5, overflow: 'hidden' }}>
        <View
          style={{
            height: '100%',
            width: Math.min(maxBarWidth, Math.abs(pct) * 2),
            backgroundColor: color,
            borderRadius: 5,
            alignSelf: isUp ? 'flex-start' : 'flex-end',
          }}
        />
      </View>
    </View>
  );
}

/* ── demand badge ───────────────────────────────────────────────── */

function DemandBadge({ signal, isDark }: { signal: string; isDark: boolean }) {
  const signalLower = signal.toLowerCase();
  const isHigh = signalLower.includes('high') || signalLower.includes('strong') || signalLower.includes('rising');
  const isLow = signalLower.includes('low') || signalLower.includes('weak') || signalLower.includes('declining');

  const color = isHigh ? (isDark ? '#00d4aa' : '#00b894') : isLow ? '#ff6b4a' : '#f5c842';
  const bg = isDark ? `${color}18` : `${color}15`;
  const icon = isHigh ? '📈' : isLow ? '📉' : '↔️';

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Text style={{ fontSize: 20 }}>{icon}</Text>
      <View>
        <Text style={{ color, fontSize: 12, fontWeight: '700' }}>{signal}</Text>
        <Text style={{ color: isDark ? 'rgba(255,255,255,0.45)' : '#5c6370', fontSize: 10 }}>Demand Signal</Text>
      </View>
    </View>
  );
}

/* ── main component ─────────────────────────────────────────────── */

export default function PriceForecastScreen() {
  const { isDark } = useTheme();
  const [city, setCity] = useState('Bangalore');
  const [locality, setLocality] = useState('');
  const [inputText, setInputText] = useState('');
  const [propertyType, setPropertyType] = useState('apartment');
  const [data, setData] = useState<PriceForecastData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const bgMain = isDark ? '#080c14' : '#f5f7fa';
  const bgCard = isDark ? '#0f1623' : '#eef1f5';
  const bgCard2 = isDark ? '#161d2e' : '#e4e8ee';
  const borderColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';
  const textCls = isDark ? '#ffffff' : '#1a1d24';
  const textMuted = isDark ? 'rgba(255,255,255,0.45)' : '#5c6370';
  const tealColor = isDark ? '#00d4aa' : '#00b894';
  const btnText = isDark ? '#080c14' : '#ffffff';
  const placeholderColor = isDark ? 'rgba(255,255,255,0.3)' : '#aab0ba';

  const localities = LOCALITIES[city] ?? [];

  const handleSearch = useCallback(async () => {
    const target = inputText.trim() || locality;
    if (!target) {
      setError('Please select or type a locality');
      return;
    }
    setLocality(target);
    setLoading(true);
    setError(null);
    setData(null);
    setSearched(true);
    try {
      const result = await fetchPriceForecast(target, city, propertyType);
      if (result) {
        setData(result);
      } else {
        setError(`No forecast data for "${target}" in ${city}. Try another locality.`);
      }
    } catch {
      setError('Failed to load forecast. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [inputText, locality, city, propertyType]);

  useEffect(() => {
    if (localities.length > 0 && !searched) {
      const first = localities[0];
      setLocality(first);
      setInputText(first);
    }
  }, [city]);

  const forecastColor = data
    ? data.forecast12m >= data.currentPrice
      ? tealColor
      : '#ff6b4a'
    : tealColor;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgMain }} edges={['bottom']}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ color: tealColor, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
            AI-POWERED
          </Text>
          <Text style={{ color: textCls, fontSize: 22, fontWeight: '800' }}>Price Forecast</Text>
          <Text style={{ color: textMuted, fontSize: 13, marginTop: 4 }}>
            AI-driven price predictions for localities across India.
          </Text>
        </View>

        {/* City tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16, marginHorizontal: -16 }}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          {CITIES.map((c) => (
            <Pressable
              key={c}
              onPress={() => { setCity(c); setData(null); setSearched(false); }}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 100,
                borderWidth: 1,
                borderColor: city === c ? tealColor : borderColor,
                backgroundColor: city === c ? (isDark ? 'rgba(0,212,170,0.12)' : 'rgba(0,184,148,0.12)') : bgCard2,
              }}
            >
              <Text style={{ color: city === c ? tealColor : textMuted, fontSize: 13, fontWeight: city === c ? '700' : '500' }}>
                {c}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Property type tabs */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
          {PROPERTY_TYPES.map((pt) => (
            <Pressable
              key={pt}
              onPress={() => setPropertyType(pt)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 7,
                borderRadius: 100,
                borderWidth: 1,
                borderColor: propertyType === pt ? tealColor : borderColor,
                backgroundColor: propertyType === pt ? (isDark ? 'rgba(0,212,170,0.1)' : 'rgba(0,184,148,0.1)') : bgCard2,
              }}
            >
              <Text style={{ color: propertyType === pt ? tealColor : textMuted, fontSize: 12, fontWeight: propertyType === pt ? '700' : '500', textTransform: 'capitalize' }}>
                {pt}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Locality quick picks */}
        <View style={{ marginBottom: 14 }}>
          <Text style={{ color: textMuted, fontSize: 11, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
            Popular Localities
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {localities.map((loc) => (
              <Pressable
                key={loc}
                onPress={() => { setInputText(loc); setLocality(loc); }}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 7,
                  borderRadius: 100,
                  borderWidth: 1,
                  borderColor: locality === loc ? tealColor : borderColor,
                  backgroundColor: locality === loc ? (isDark ? 'rgba(0,212,170,0.1)' : 'rgba(0,184,148,0.1)') : bgCard2,
                }}
              >
                <Text style={{ color: locality === loc ? tealColor : textMuted, fontSize: 12, fontWeight: locality === loc ? '700' : '500' }}>
                  {loc}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Search input */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: bgCard2, borderRadius: 14, borderWidth: 1, borderColor, paddingHorizontal: 12 }}>
            <Text style={{ color: tealColor, fontSize: 14, marginRight: 8 }}>🔍</Text>
            <TextInput
              style={{ flex: 1, color: textCls, fontSize: 14, paddingVertical: 12 }}
              placeholder="Type any locality…"
              placeholderTextColor={placeholderColor}
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
          </View>
          <Pressable
            onPress={handleSearch}
            disabled={loading}
            style={{ backgroundColor: tealColor, paddingHorizontal: 20, borderRadius: 14, justifyContent: 'center' }}
          >
            {loading ? (
              <ActivityIndicator color={btnText} size="small" />
            ) : (
              <Text style={{ color: btnText, fontWeight: '800', fontSize: 14 }}>Get Forecast</Text>
            )}
          </Pressable>
        </View>

        {/* Loading state */}
        {loading && (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <ActivityIndicator size="large" color={tealColor} />
            <Text style={{ color: textMuted, fontSize: 13, marginTop: 12 }}>Generating forecast…</Text>
          </View>
        )}

        {/* Error state */}
        {!loading && error && (
          <View style={{ backgroundColor: bgCard, borderRadius: 16, padding: 20, borderWidth: 1, borderColor, alignItems: 'center' }}>
            <Text style={{ fontSize: 36, marginBottom: 12 }}>📊</Text>
            <Text style={{ color: textCls, fontWeight: '700', fontSize: 15, marginBottom: 6 }}>{error}</Text>
            <Text style={{ color: textMuted, fontSize: 13, textAlign: 'center' }}>Try a different locality, city, or property type.</Text>
          </View>
        )}

        {/* Results */}
        {!loading && data && (
          <>
            {/* Current price hero */}
            <View style={{ backgroundColor: bgCard, borderRadius: 20, borderWidth: 1, borderColor, padding: 24, alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ color: textMuted, fontSize: 11, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                Current Avg. Price ({data.propertyType})
              </Text>
              <Text style={{ fontSize: 36, fontWeight: '900', color: textCls, lineHeight: 44 }}>
                {formatPrice(data.currentPrice)}
              </Text>
              <Text style={{ color: textMuted, fontSize: 13, marginTop: 6 }}>
                {data.locality}, {data.city}
              </Text>

              {/* Demand + Confidence row */}
              <View style={{ flexDirection: 'row', gap: 20, marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: borderColor, alignSelf: 'stretch', justifyContent: 'center' }}>
                <DemandBadge signal={data.demandSignal} isDark={isDark} />
                <View style={{ width: 1, backgroundColor: borderColor }} />
                <View>
                  <Text style={{ color, fontSize: 12, fontWeight: '800' }}>{data.confidenceLevel}</Text>
                  <Text style={{ color: textMuted, fontSize: 10 }}>Confidence</Text>
                </View>
              </View>
            </View>

            {/* Forecast bars */}
            <View style={{ backgroundColor: bgCard, borderRadius: 20, borderWidth: 1, borderColor, padding: 20, marginBottom: 16 }}>
              <Text style={{ color: textCls, fontSize: 15, fontWeight: '700', marginBottom: 20 }}>Price Projections</Text>

              <ForecastBar
                label="12-Month Forecast"
                current={data.currentPrice}
                forecast={data.forecast12m}
                color={data.forecast12m >= data.currentPrice ? tealColor : '#ff6b4a'}
                isDark={isDark}
              />
              <ForecastBar
                label="24-Month Forecast"
                current={data.currentPrice}
                forecast={data.forecast24m}
                color={data.forecast24m >= data.currentPrice ? tealColor : '#ff6b4a'}
                isDark={isDark}
              />
              <ForecastBar
                label="36-Month Forecast"
                current={data.currentPrice}
                forecast={data.forecast36m}
                color={data.forecast36m >= data.currentPrice ? tealColor : '#ff6b4a'}
                isDark={isDark}
              />
            </View>

            {/* Disclaimer */}
            <View style={{ backgroundColor: bgCard2, borderRadius: 12, padding: 14, borderWidth: 1, borderColor }}>
              <Text style={{ color: textMuted, fontSize: 11, lineHeight: 17 }}>
                📋 Forecasts are AI-powered estimates based on historical trends, macro indicators, and market signals. They are not financial advice. Actual prices may vary. Last updated: {data.lastUpdated}
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}