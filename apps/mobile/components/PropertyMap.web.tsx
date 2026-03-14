/**
 * @file PropertyMap.web.tsx
 * @module components
 * @description Web fallback for PropertyMap; react-native-maps is native-only.
 * @author BharatERP
 * @created 2025-03-13
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface PropertyMapItem {
  id: string;
  title: string;
  location: string;
  price: number;
  latitude: number;
  longitude: number;
}

type Props = {
  properties: PropertyMapItem[];
  style?: object;
};

export function PropertyMap({ properties, style }: Props) {
  const hasCoords = properties.some(
    (p) =>
      p.latitude != null &&
      p.longitude != null &&
      Number.isFinite(p.latitude) &&
      Number.isFinite(p.longitude),
  );
  return (
    <View style={[styles.placeholder, style]}>
      <Text style={styles.placeholderText}>
        {hasCoords
          ? 'Map view is available in the iOS and Android app.'
          : 'No properties with location data to show on map. Add coordinates when posting or enable geocoding.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
