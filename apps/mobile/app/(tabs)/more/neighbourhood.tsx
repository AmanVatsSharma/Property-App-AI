/**
 * @file neighbourhood.tsx
 * @module app/(tabs)/more
 * @description Neighbourhood Score Explorer — city tabs, locality selector, score cards with rings.
 *              Full light + dark mode via isDark branching pattern.
 * @author BharatERP
 * @created 2025-03-10
 * @updated 2026-05-12
 */

import { useTheme } from '@/components/providers/ThemeProvider';
import { fetchNeighbourhoodScore, type NeighbourhoodScoreData } from '@/lib/graphql-client';
import { useState, useEffect, useCallback } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
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

const SCORE_LABELS: { key: keyof NeighbourhoodScoreData; label: string; icon: string }[] = [
  { key: 'livability', label: 'Livability', icon: '🏡' },
  { key: 'connectivity', label: 'Connectivity', icon: '🚇' },
  { key: 'schools', label: 'Schools', icon: '🏫' },
  { key: 'safety', label: 'Safety', icon: '🛡️' },
];

/* ── Score ring ─────────────────────────────────────────────────── */

function ScoreRing({ score, label, icon, isDark }: { score: number; label: string; icon: string; isDark: boolean }) {
  const pct = Math.min(100, Math.max(0, score));
  const color = score >= 80 ? (isDark ? '#00d4aa' : '#00b894') : score >= 60 ? '#f5c842' : '#ff6b4a';
  const bgCard = isDark ? '#0f1623' : '#eef1f5';
  const bgCard2 = isDark ? '#161d2e' : '#e4e8ee';
  const textCls = isDark ? '#ffffff' : '#1a1d24';
  const textMuted = isDark ? 'rgba(255,255,255,0.45)' : '#5c6370';

  return (
    <View style={{ alignItems: 'center', width: 80 }}>
      <View style={{ position: 'relative', width: 64, height: 64, alignItems: 'center', justifyContent: 'center' }}>
        {/* Background circle */}
        <View
          style={{
            position: 'absolute',
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: bgCard2,
          }}
        />
        {/* Progress arc (simplified with View) */}
        <View
          style={{
            position: 'absolute',
            width: 64,
            height: 64,
            borderRadius: 32,
            borderWidth: 4,
            borderColor: color,
            borderTopColor: pct < 25 ? 'transparent' : color,
            borderRightColor: pct < 50 ? 'transparent' : color,
            borderBottomColor: pct < 75 ? 'transparent' : color,
            borderLeftColor: color,
            opacity: 0.9,
          }}
        />
        <Text style={{ fontSize: 16, fontWeight: '800', color }}>{Math.round(score)}</Text>
      </View>
      <Text style={{ fontSize: 10, marginTop: 6, color: textMuted, fontWeight: '600' }}>{icon}</Text>
      <Text style={{ fontSize: 11, color: textCls, fontWeight: '600', marginTop: 2 }}>{label}</Text>
    </View>
  );
}

/* ── score bar row ─────────────────────────────────────────────── */

function ScoreBar({ label, value, isDark }: { label: string; value: number; isDark: boolean }) {
  const pct = Math.min(100, Math.max(0, value));
  const color = value >= 80 ? (isDark ? '#00d4aa' : '#00b894') : value >= 60 ? '#f5c842' : '#ff6b4a';
  const bgCard2 = isDark ? '#161d2e' : '#e4e8ee';
  const textCls = isDark ? '#ffffff' : '#1a1d24';
  const textMuted = isDark ? 'rgba(255,255,255,0.45)' : '#5c6370';

  return (
    <View style={{ marginBottom: 14 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
        <Text style={{ color: textCls, fontSize: 13, fontWeight: '600' }}>{label}</Text>
        <Text style={{ color, fontSize: 13, fontWeight: '800' }}>{Math.round(value)}/100</Text>
      </View>
      <View style={{ height: 8, backgroundColor: bgCard2, borderRadius: 4, overflow: 'hidden' }}>
        <View
          style={{
            height: '100%',
            width: `${pct}%`,
            backgroundColor: color,
            borderRadius: 4,
          }}
        />
      </View>
    </View>
  );
}

/* ── main component ────────────────────────────────────────────── */

export default function NeighbourhoodScreen() {
  const { isDark } = useTheme();
  const [city, setCity] = useState('Bangalore');
  const [locality, setLocality] = useState('');
  const [inputText, setInputText] = useState('');
  const [data, setData] = useState<NeighbourhoodScoreData | null>(null);
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
      const result = await fetchNeighbourhoodScore(target, city);
      if (result) {
        setData(result);
      } else {
        setError(`No data found for "${target}" in ${city}. Try another locality.`);
      }
    } catch {
      setError('Failed to load neighbourhood data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [inputText, locality, city]);

  // Auto-load first locality on city change
  useEffect(() => {
    if (localities.length > 0 && !searched) {
      const first = localities[0];
      setLocality(first);
      setInputText(first);
    }
  }, [city]);

  const overallScore = data?.overallScore ?? 0;
  const overallColor = overallScore >= 80 ? tealColor : overallScore >= 60 ? '#f5c842' : '#ff6b4a';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgMain }} edges={['bottom']}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ color: tealColor, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
            AI-POWERED
          </Text>
          <Text style={{ color: textCls, fontSize: 22, fontWeight: '800' }}>Neighbourhood Explorer</Text>
          <Text style={{ color: textMuted, fontSize: 13, marginTop: 4 }}>
            Compare localities by livability, connectivity, schools & safety.
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
              placeholder="Or type any locality…"
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
              <Text style={{ color: btnText, fontWeight: '800', fontSize: 14 }}>Search</Text>
            )}
          </Pressable>
        </View>

        {/* Loading state */}
        {loading && (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <ActivityIndicator size="large" color={tealColor} />
            <Text style={{ color: textMuted, fontSize: 13, marginTop: 12 }}>Scoring neighbourhood…</Text>
          </View>
        )}

        {/* Error state */}
        {!loading && error && (
          <View style={{ backgroundColor: bgCard, borderRadius: 16, padding: 20, borderWidth: 1, borderColor, alignItems: 'center' }}>
            <Text style={{ fontSize: 36, marginBottom: 12 }}>🔍</Text>
            <Text style={{ color: textCls, fontWeight: '700', fontSize: 15, marginBottom: 6 }}>{error}</Text>
            <Text style={{ color: textMuted, fontSize: 13, textAlign: 'center' }}>Try a different locality or city.</Text>
          </View>
        )}

        {/* Results */}
        {!loading && data && (
          <>
            {/* Overall score hero */}
            <View style={{ backgroundColor: bgCard, borderRadius: 20, borderWidth: 1, borderColor, padding: 24, alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ color: textMuted, fontSize: 12, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                Overall Score
              </Text>
              <Text style={{ fontSize: 56, fontWeight: '900', color: overallColor, lineHeight: 64 }}>
                {Math.round(data.overallScore)}
              </Text>
              <Text style={{ color: overallColor, fontSize: 13, fontWeight: '700', marginBottom: 4 }}>
                /100
              </Text>
              <Text style={{ color: textMuted, fontSize: 13, marginTop: 4 }}>
                {data.locality}, {data.city}
              </Text>
            </View>

            {/* Score rings */}
            <View style={{ backgroundColor: bgCard, borderRadius: 20, borderWidth: 1, borderColor, padding: 20, marginBottom: 16 }}>
              <Text style={{ color: textCls, fontSize: 15, fontWeight: '700', marginBottom: 20 }}>Dimension Breakdown</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                {SCORE_LABELS.map((s) => (
                  <ScoreRing
                    key={s.key}
                    score={data[s.key] as number}
                    label={s.label}
                    icon={s.icon}
                    isDark={isDark}
                  />
                ))}
              </View>
            </View>

            {/* Score bars */}
            <View style={{ backgroundColor: bgCard, borderRadius: 20, borderWidth: 1, borderColor, padding: 20, marginBottom: 16 }}>
              <Text style={{ color: textCls, fontSize: 15, fontWeight: '700', marginBottom: 16 }}>Detailed Scores</Text>
              <ScoreBar label="Livability" value={data.livability} isDark={isDark} />
              <ScoreBar label="Connectivity" value={data.connectivity} isDark={isDark} />
              <ScoreBar label="Schools & Education" value={data.schools} isDark={isDark} />
              <ScoreBar label="Safety & Security" value={data.safety} isDark={isDark} />
            </View>

            {/* CTA card */}
            <View style={{ backgroundColor: bgCard, borderRadius: 16, borderWidth: 1, borderColor: tealColor + '40', padding: 16 }}>
              <Text style={{ color: textCls, fontWeight: '700', fontSize: 14, marginBottom: 4 }}>Want property recommendations in {data.locality}?</Text>
              <Text style={{ color: textMuted, fontSize: 12, marginBottom: 12 }}>
                Browse verified listings with AI scores in this area.
              </Text>
              <Pressable style={{ backgroundColor: tealColor, borderRadius: 12, paddingVertical: 12, alignItems: 'center' }}>
                <Text style={{ color: btnText, fontWeight: '800', fontSize: 14 }}>View Properties in {data.locality}</Text>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}