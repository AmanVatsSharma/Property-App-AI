/**
 * @file navigation.ts
 * @module shared/types
 * @description Shared nav config and route types for web and mobile
 * @author BharatERP
 * @created 2025-03-10
 */

export const NAV_LINKS = [
  { href: '/search', label: 'Buy' },
  { href: '/search?mode=rent', label: 'Rent' },
  { href: '/search?type=new', label: 'New Projects' },
  { href: '/search?type=commercial', label: 'Commercial' },
  { href: '/search', label: 'AI Copilot ✦' },
  { href: '/price-forecast', label: 'Market Pulse' },
] as const;

export const FOOTER_LINKS = {
  discover: [
    { href: '/search', label: 'Buy Property' },
    { href: '/search?mode=rent', label: 'Rent Property' },
    { href: '/search?type=new', label: 'New Projects' },
    { href: '/search?type=commercial', label: 'Commercial' },
  ],
  tools: [
    { href: '/search', label: 'AI Copilot' },
    { href: '/emi-calculator', label: 'EMI Calculator' },
    { href: '/neighbourhood', label: 'Neighbourhood Score' },
    { href: '/price-forecast', label: 'Price Forecast' },
    { href: '/legal-checker', label: 'Legal Checker' },
  ],
  company: [
    { href: '/about', label: 'About Us' },
    { href: '/about#investors', label: 'Investors' },
    { href: '/post-property', label: 'For Builders' },
  ],
} as const;
