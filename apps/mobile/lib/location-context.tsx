/**
 * @file location-context.tsx
 * @module lib
 * @description App-level location state: city or "Current location"; used by header and search.
 * @author BharatERP
 * @created 2025-03-14
 */

import * as Location from 'expo-location';
import React, { createContext, useCallback, useContext, useState } from 'react';

export type LocationState = {
  locationLabel: string;
  city?: string;
  coords?: { latitude: number; longitude: number };
};

type LocationContextValue = LocationState & {
  setLocationByCity: (city: string, label?: string) => void;
  setLocationByCoords: (lat: number, lng: number) => void;
  useCurrentLocation: () => Promise<void>;
  openLocationSheet: () => void;
  closeLocationSheet: () => void;
  locationSheetVisible: boolean;
};

const LocationContext = createContext<LocationContextValue | null>(null);

const DEFAULT_LABEL = 'All India';

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<LocationState>({ locationLabel: DEFAULT_LABEL });
  const [sheetVisible, setSheetVisible] = useState(false);

  const setLocationByCity = useCallback((city: string, label?: string) => {
    setState({ locationLabel: label ?? city, city, coords: undefined });
  }, []);

  const setLocationByCoords = useCallback((latitude: number, longitude: number) => {
    setState({ locationLabel: 'Current location', coords: { latitude, longitude }, city: undefined });
  }, []);

  const useCurrentLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLocationByCoords(pos.coords.latitude, pos.coords.longitude);
    } catch {
      // ignore
    }
  }, [setLocationByCoords]);

  const openLocationSheet = useCallback(() => setSheetVisible(true), []);
  const closeLocationSheet = useCallback(() => setSheetVisible(false), []);

  const value: LocationContextValue = {
    ...state,
    setLocationByCity,
    setLocationByCoords,
    useCurrentLocation,
    openLocationSheet,
    closeLocationSheet,
    locationSheetVisible: sheetVisible,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation(): LocationContextValue {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocation must be used within LocationProvider');
  return ctx;
}
