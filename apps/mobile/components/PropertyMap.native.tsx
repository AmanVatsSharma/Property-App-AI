/**
 * @file PropertyMap.native.tsx
 * @module components
 * @description Map view for property listings on iOS/Android using react-native-maps.
 * @author BharatERP
 * @created 2025-03-13
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { useRouter } from 'expo-router';

const INDIA_REGION = {
  latitude: 20.5937,
  longitude: 78.9629,
  latitudeDelta: 18,
  longitudeDelta: 18,
};

export interface PropertyMapItem {
  id: string;
  title: string;
  location: string;
  price: number;
  latitude: number;
  longitude: number;
}

function formatPrice(price: number): string {
  return price >= 1_00_00_000 ? `₹${(price / 1_00_00_000).toFixed(2)} Cr` : `₹${(price / 1_00_000).toFixed(0)} L`;
}

type Props = {
  properties: PropertyMapItem[];
  style?: object;
};

export function PropertyMap({ properties, style }: Props) {
  const router = useRouter();
  const withCoords = useMemo(
    () =>
      properties.filter(
        (p): p is PropertyMapItem =>
          p.latitude != null &&
          p.longitude != null &&
          Number.isFinite(p.latitude) &&
          Number.isFinite(p.longitude),
      ),
    [properties],
  );

  const initialRegion = useMemo(() => {
    if (withCoords.length === 0) return INDIA_REGION;
    const lats = withCoords.map((p) => p.latitude);
    const lngs = withCoords.map((p) => p.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const latDelta = Math.max((maxLat - minLat) * 1.2, 0.02);
    const lngDelta = Math.max((maxLng - minLng) * 1.2, 0.02);
    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: latDelta,
      longitudeDelta: lngDelta,
    };
  }, [withCoords]);

  if (withCoords.length === 0) {
    return (
      <View style={[styles.placeholder, style]}>
        <Text style={styles.placeholderText}>
          No properties with location data to show on map. Add coordinates when posting or enable geocoding.
        </Text>
      </View>
    );
  }

  return (
    <MapView
      style={[styles.map, style]}
      provider={PROVIDER_DEFAULT}
      initialRegion={initialRegion}
      showsUserLocation={false}
    >
      {withCoords.map((p) => (
        <Marker
          key={p.id}
          coordinate={{ latitude: p.latitude, longitude: p.longitude }}
          title={p.title}
          description={`${p.location} · ${formatPrice(p.price)}`}
          onCalloutPress={() => router.push(`/property/${p.id}`)}
        />
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: '100%',
    minHeight: 400,
  },
  placeholder: {
    minHeight: 400,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 24,
  },
  placeholderText: {
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    fontSize: 14,
  },
});
