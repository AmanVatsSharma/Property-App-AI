# UrbanNest.ai — Mobile App

Native iOS/Android app for Property-App-AI, built with **Expo**, **React Native**, **NativeWind** (Tailwind), and **TypeScript**. Mirrors the web app flows and branding.

## Prerequisites

- Node.js 18+
- npm or pnpm (from repo root with workspaces)
- iOS: Xcode (macOS only)
- Android: Android Studio / SDK

## Run from repo root

```bash
# Start Expo dev server (then press i for iOS, a for Android)
npm run mobile

# Or with Nx
nx run mobile:start

# iOS simulator (macOS)
npm run mobile:ios
# or: nx run mobile:run-ios

# Android emulator
npm run mobile:android
# or: nx run mobile:run-android
```

## Run from this directory

```bash
cd apps/mobile
npm run start
# then: i (iOS), a (Android), or scan QR with Expo Go
```

## Project structure

- `app/` — Expo Router screens (file-based routing)
  - `(tabs)/` — Tab navigator: Home, Search, Post, More
  - `(tabs)/more/` — Stack: Tools list, About, EMI Calculator, Legal Checker, Neighbourhood, Price Forecast
  - `property/[id].tsx` — Property detail (stack)
- `components/` — Reusable UI (from template)
- `global.css` — Tailwind directives for NativeWind
- `tailwind.config.js` — Theme (colors, radius) aligned with web

## Tech stack

- **Expo** ~55 — React Native tooling and runtime
- **Expo Router** — File-based navigation (tabs + stack)
- **NativeWind** v4 — Tailwind CSS for React Native
- **TypeScript** — Strict mode, shared with web

Design tokens (colors, radius) mirror `apps/web` and optionally `libs/shared`.

## Build for production

```bash
cd apps/mobile
npx expo prebuild
npx expo run:ios    # or run:android
# For EAS Build: eas build --platform all
```

## Changelog

- 2025-03-10: Initial mobile app; Expo + NativeWind; tabs (Home, Search, Post, More); stack screens (property detail, tools); design aligned with web.
