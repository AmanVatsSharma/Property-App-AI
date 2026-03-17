/**
 * @file geocoding.service.ts
 * @module property
 * @description Geocodes address strings to lat/lng via Mapbox Geocoding API; used when creating/updating properties without coordinates.
 * @author BharatERP
 * @created 2025-03-13
 */

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { LoggerService } from '@api/shared/logger';
import { withRetry } from '@api/shared/retry';

const MAPBOX_GEOCODE_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places';

export interface GeocodeResult {
  lat: number;
  lng: number;
  formattedAddress?: string;
  locality?: string;
  city?: string;
}

export interface ReverseGeocodeResult {
  locality: string;
  city: string;
}

interface MapboxFeature {
  center?: [number, number];
  place_name?: string;
  context?: Array<{ id: string; text: string }>;
}

@Injectable()
export class GeocodingService {
  private readonly accessToken: string | undefined;

  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
  ) {
    this.accessToken = this.config.get<string>('MAPBOX_ACCESS_TOKEN');
  }

  isConfigured(): boolean {
    return Boolean(this.accessToken?.trim());
  }

  /**
   * Geocode an address string to latitude/longitude using Mapbox.
   * Returns null if token not configured, address empty, or API error.
   */
  async geocode(address: string): Promise<GeocodeResult | null> {
    const trimmed = address?.trim();
    if (!trimmed) {
      this.logger.debug('geocode skipped: empty address', { method: 'geocode' });
      return null;
    }
    if (!this.isConfigured()) {
      this.logger.debug('geocode skipped: MAPBOX_ACCESS_TOKEN not set', {
        method: 'geocode',
      });
      return null;
    }
    try {
      const encoded = encodeURIComponent(trimmed);
      const url = `${MAPBOX_GEOCODE_URL}/${encoded}.json?access_token=${this.accessToken}&limit=1`;
      const res = await withRetry(
        () => axios.get<{ features?: MapboxFeature[] }>(url, { timeout: 5000 }),
        { maxRetries: 2, initialMs: 300 },
      );
      const features = res.data?.features;
      if (!features?.length || !features[0].center) {
        this.logger.debug('geocode no results', {
          method: 'geocode',
          address: trimmed.substring(0, 50),
        });
        return null;
      }
      const [lng, lat] = features[0].center;
      const { locality, city } = this.parseLocalityCityFromContext(features[0].context);
      const result: GeocodeResult = {
        lat,
        lng,
        formattedAddress: features[0].place_name ?? undefined,
        locality: locality ?? undefined,
        city: city ?? undefined,
      };
      this.logger.debug('geocode success', {
        method: 'geocode',
        lat,
        lng,
      });
      return result;
    } catch (err) {
      this.logger.warn('geocode failed', {
        method: 'geocode',
        address: trimmed.substring(0, 50),
        message: err instanceof Error ? err.message : String(err),
      });
      return null;
    }
  }

  /**
   * Reverse geocode lat/lng to locality and city using Mapbox.
   * Returns default strings when not configured or no results.
   */
  async reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResult | null> {
    if (!this.isConfigured()) {
      this.logger.debug('reverseGeocode skipped: MAPBOX_ACCESS_TOKEN not set', { method: 'reverseGeocode' });
      return null;
    }
    try {
      const url = `${MAPBOX_GEOCODE_URL}/${lng},${lat}.json?access_token=${this.accessToken}&limit=1`;
      const res = await withRetry(
        () => axios.get<{ features?: MapboxFeature[] }>(url, { timeout: 5000 }),
        { maxRetries: 2, initialMs: 300 },
      );
      const features = res.data?.features;
      if (!features?.length) {
        this.logger.debug('reverseGeocode no results', { method: 'reverseGeocode', lat, lng });
        return null;
      }
      const { locality, city } = this.parseLocalityCityFromContext(features[0].context);
      return {
        locality: locality ?? 'Unknown',
        city: city ?? '',
      };
    } catch (err) {
      this.logger.warn('reverseGeocode failed', {
        method: 'reverseGeocode',
        lat,
        lng,
        message: err instanceof Error ? err.message : String(err),
      });
      return null;
    }
  }

  private parseLocalityCityFromContext(
    context: MapboxFeature['context'],
  ): { locality: string | null; city: string | null } {
    let locality: string | null = null;
    let city: string | null = null;
    if (!context?.length) return { locality, city };
    for (const c of context) {
      const id = c?.id ?? '';
      const text = (c?.text ?? '').trim();
      if (!text) continue;
      if (id.startsWith('neighborhood.') || id.startsWith('locality.')) locality = text;
      if (id.startsWith('place.') && !city) city = text;
    }
    return { locality, city };
  }
}
