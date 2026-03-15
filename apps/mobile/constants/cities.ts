/**
 * @file cities.ts
 * @module constants
 * @description Shared list of cities for location picker and home screen (Explore by City).
 * No listing counts; display uses neutral label (e.g. "Explore") for strict no-mock MVP.
 * @author BharatERP
 * @created 2025-03-14
 */

export const CITIES = [
  { name: 'Mumbai', emoji: '🌆' },
  { name: 'Bangalore', emoji: '🏙️' },
  { name: 'Delhi NCR', emoji: '🗼' },
  { name: 'Hyderabad', emoji: '🌃' },
  { name: 'Pune', emoji: '🌇' },
  { name: 'Chennai', emoji: '🏛️' },
] as const;
