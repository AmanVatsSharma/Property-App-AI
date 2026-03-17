/**
 * @file nearby.service.ts
 * @module property
 * @description Fetches nearby POIs (metro, school, hospital) via Mapbox Geocoding proximity search; used for listing enrichment.
 * @author BharatERP
 * @created 2026-03-17
 */

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { LoggerService } from '@api/shared/logger';

const MAPBOX_GEOCODE_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places';
const CATEGORIES = [
  { query: 'metro station', tag: 'metro' },
  { query: 'school', tag: 'school' },
  { query: 'hospital', tag: 'hospital' },
] as const;

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
}

@Injectable()
export class NearbyService {
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
   * Returns nearby amenities as strings e.g. ["metro:1.2km", "school:800m"].
   * Uses Mapbox Geocoding proximity search per category; returns empty when not configured.
   */
  async getNearby(lat: number, lng: number): Promise<string[]> {
    if (!this.isConfigured()) {
      this.logger.debug('getNearby skipped: MAPBOX_ACCESS_TOKEN not set', { method: 'getNearby' });
      return [];
    }
    const results: string[] = [];
    for (const { query, tag } of CATEGORIES) {
      try {
        const encoded = encodeURIComponent(query);
        const url = `${MAPBOX_GEOCODE_URL}/${encoded}.json?access_token=${this.accessToken}&proximity=${lng},${lat}&limit=1`;
        const res = await axios.get<{ features?: Array<{ center?: [number, number] }> }>(url, {
          timeout: 5000,
        });
        const features = res.data?.features;
        if (features?.length && features[0].center) {
          const [lng2, lat2] = features[0].center;
          const km = haversineKm(lat, lng, lat2, lng2);
          results.push(`${tag}:${formatDistance(km)}`);
        }
      } catch (err) {
        this.logger.debug('getNearby category failed', {
          method: 'getNearby',
          tag,
          message: err instanceof Error ? err.message : String(err),
        });
      }
    }
    this.logger.debug('getNearby done', { method: 'getNearby', count: results.length });
    return results;
  }
}
