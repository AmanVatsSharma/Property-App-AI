/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        night: '#080c14',
        dark: '#0f1623',
        'dark-2': '#161d2e',
        'dark-3': '#1e2740',
        glass: 'rgba(255,255,255,0.04)',
        'glass-border': 'rgba(255,255,255,0.08)',
        teal: '#00d4aa',
        'teal-dim': 'rgba(0,212,170,0.1)',
        'teal-glow': 'rgba(0,212,170,0.25)',
        coral: '#ff6b4a',
        'coral-dim': 'rgba(255,107,74,0.1)',
        gold: '#f5c842',
        'gold-dim': 'rgba(245,200,66,0.1)',
        green: '#4ade80',
        'green-dim': 'rgba(74,222,128,0.1)',
        white: '#ffffff',
        text: 'rgba(255,255,255,0.9)',
        'text-muted': 'rgba(255,255,255,0.45)',
        'text-dim': 'rgba(255,255,255,0.2)',
        border: 'rgba(255,255,255,0.06)',
      },
      borderRadius: {
        DEFAULT: 18,
        sm: 10,
      },
    },
  },
  plugins: [],
};
