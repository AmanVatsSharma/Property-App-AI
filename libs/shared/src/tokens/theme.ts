/**
 * @file theme.ts
 * @module shared/tokens
 * @description Design tokens mirroring web globals.css for web/mobile consistency
 * @author BharatERP
 * @created 2025-03-10
 */

export const colors = {
  night: '#080c14',
  dark: '#0f1623',
  dark2: '#161d2e',
  dark3: '#1e2740',
  glass: 'rgba(255,255,255,0.04)',
  glassBorder: 'rgba(255,255,255,0.08)',
  teal: '#00d4aa',
  tealDim: 'rgba(0,212,170,0.1)',
  tealGlow: 'rgba(0,212,170,0.25)',
  coral: '#ff6b4a',
  coralDim: 'rgba(255,107,74,0.1)',
  gold: '#f5c842',
  goldDim: 'rgba(245,200,66,0.1)',
  green: '#4ade80',
  greenDim: 'rgba(74,222,128,0.1)',
  white: '#ffffff',
  heading: '#ffffff',
  btnPrimaryText: '#080c14',
  text: 'rgba(255,255,255,0.9)',
  textMuted: 'rgba(255,255,255,0.45)',
  textDim: 'rgba(255,255,255,0.2)',
  border: 'rgba(255,255,255,0.06)',
} as const;

/** Light theme palette — mirrors .light CSS variables in apps/web globals.css */
export const colorsLight = {
  night: '#f5f7fa',
  dark: '#eef1f5',
  dark2: '#e4e8ee',
  dark3: '#d8dde5',
  glass: 'rgba(0, 0, 0, 0.04)',
  glassBorder: 'rgba(0, 0, 0, 0.08)',
  teal: '#00b894',
  tealDim: 'rgba(0, 184, 148, 0.12)',
  tealGlow: 'rgba(0, 184, 148, 0.2)',
  coral: '#e85d4c',
  coralDim: 'rgba(232, 93, 76, 0.12)',
  gold: '#d4a82e',
  goldDim: 'rgba(212, 168, 46, 0.12)',
  green: '#2ecc71',
  greenDim: 'rgba(46, 204, 113, 0.12)',
  white: '#ffffff',
  heading: '#1a1d24',
  btnPrimaryText: '#ffffff',
  text: '#1a1d24',
  textMuted: '#5c6370',
  textDim: '#8b92a0',
  border: 'rgba(0, 0, 0, 0.08)',
} as const;

export const radius = {
  DEFAULT: 18,
  sm: 10,
} as const;

export const theme = {
  colors,
  radius,
} as const;

export const themeLight = {
  colors: colorsLight,
  radius,
} as const;
