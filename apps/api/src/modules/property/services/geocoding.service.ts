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
import { LoggerService } from '../../../shared/logger';

const MAPBOX_GEOCODE_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places';

export interface GeocodeResult {
  lat: number;
  lng: number;
  formattedAddress?: string;
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
      const res = await axios.get<{
        features?: Array<{
          center?: [number, number];
          place_name?: string;
        }>;
      }>(url, { timeout: 5000 });
      const features = res.data?.features;
      if (!features?.length || !features[0].center) {
        this.logger.debug('geocode no results', {
          method: 'geocode',
          address: trimmed.substring(0, 50),
        });
        return null;
      }
      const [lng, lat] = features[0].center;
      const result: GeocodeResult = {
        lat,
        lng,
        formattedAddress: features[0].place_name ?? undefined,
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
}
