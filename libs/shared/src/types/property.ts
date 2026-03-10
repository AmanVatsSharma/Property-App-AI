/**
 * @file property.ts
 * @module shared/types
 * @description Shared property-related types for web and mobile
 * @author BharatERP
 * @created 2025-03-10
 */

export interface PropertyCard {
  id: string;
  price: string;
  name: string;
  loc: string;
  specs: string[];
  tip?: string;
  badges: string[];
  badgeLabels: string[];
  score?: number;
  bg?: string;
}

export const SEARCH_TABS = [
  { id: 'buy', label: '🏠 Buy' },
  { id: 'rent', label: '🔑 Rent' },
  { id: 'new', label: '🏗️ New Projects' },
  { id: 'commercial', label: '🏢 Commercial' },
  { id: 'plot', label: '🌳 Plot / Land' },
] as const;
