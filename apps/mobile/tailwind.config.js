/**
 * @file tailwind.config.js
 * @module mobile
 * @description NativeWind Tailwind config — KonKreet design tokens.
 *              Includes indigo/purple accents, shadow utilities, refined radii,
 *              and full light/* counterparts for every dark token.
 * @author BharatERP
 * @created 2025-03-10
 * @updated 2026-03-26
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        /* ── Dark theme (default) ─────────────────────── */
        night: '#080c14',
        dark: '#0f1623',
        'dark-2': '#161d2e',
        'dark-3': '#1e2740',
        glass: 'rgba(255,255,255,0.04)',
        'glass-border': 'rgba(255,255,255,0.08)',

        teal: '#00d4aa',
        'teal-dim': 'rgba(0,212,170,0.12)',
        'teal-glow': 'rgba(0,212,170,0.25)',

        coral: '#ff6b4a',
        'coral-dim': 'rgba(255,107,74,0.12)',

        gold: '#f5c842',
        'gold-dim': 'rgba(245,200,66,0.12)',

        green: '#4ade80',
        'green-dim': 'rgba(74,222,128,0.12)',

        indigo: '#6366f1',
        'indigo-dim': 'rgba(99,102,241,0.12)',
        'indigo-glow': 'rgba(99,102,241,0.25)',

        purple: '#a855f7',
        'purple-dim': 'rgba(168,85,247,0.12)',

        white: '#ffffff',
        text: 'rgba(255,255,255,0.9)',
        'text-muted': 'rgba(255,255,255,0.45)',
        'text-dim': 'rgba(255,255,255,0.2)',
        border: 'rgba(255,255,255,0.06)',
        heading: '#ffffff',
        'btn-primary-text': '#080c14',

        /* ── Light theme counterparts ─────────────────── */
        'light-night': '#f5f7fa',
        'light-dark': '#eef1f5',
        'light-dark-2': '#e4e8ee',
        'light-dark-3': '#d8dde5',
        'light-glass': 'rgba(0,0,0,0.04)',
        'light-glass-border': 'rgba(0,0,0,0.08)',

        'light-teal': '#00b894',
        'light-teal-dim': 'rgba(0,184,148,0.12)',
        'light-teal-glow': 'rgba(0,184,148,0.2)',

        'light-coral': '#e85d4c',
        'light-coral-dim': 'rgba(232,93,76,0.12)',

        'light-gold': '#d4a82e',
        'light-gold-dim': 'rgba(212,168,46,0.12)',

        'light-green': '#2ecc71',
        'light-green-dim': 'rgba(46,204,113,0.12)',

        'light-indigo': '#4f46e5',
        'light-indigo-dim': 'rgba(79,70,229,0.10)',
        'light-indigo-glow': 'rgba(79,70,229,0.18)',

        'light-purple': '#9333ea',
        'light-purple-dim': 'rgba(147,51,234,0.10)',

        'light-text': '#1a1d24',
        'light-text-muted': '#5c6370',
        'light-text-dim': '#8b92a0',
        'light-border': 'rgba(0,0,0,0.08)',
        'light-heading': '#1a1d24',
        'light-btn-primary-text': '#ffffff',
      },

      borderRadius: {
        DEFAULT: 18,
        sm: 10,
        md: 14,
        lg: 20,
        xl: 24,
        '2xl': 28,
        '3xl': 32,
        sheet: 24,   // bottom-sheet handle radius
        full: 9999,
      },

      /* Shadow utilities for cards (used via boxShadow style prop in RN) */
      boxShadow: {
        card: '0 4px 16px rgba(0,0,0,0.35)',
        'card-hover': '0 12px 40px rgba(0,212,170,0.18)',
        'card-light': '0 4px 16px rgba(0,0,0,0.08)',
        teal: '0 0 20px rgba(0,212,170,0.3)',
        indigo: '0 0 20px rgba(99,102,241,0.3)',
      },

      spacing: {
        'safe-bottom': 'env(safe-area-inset-bottom, 0px)',
        'safe-top': 'env(safe-area-inset-top, 0px)',
      },
    },
  },
  plugins: [],
};
