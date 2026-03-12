# UrbanNest.ai — Mobile App

Native iOS/Android app for Property-App-AI, built with **Expo**, **React Native**, **NativeWind** (Tailwind), and **TypeScript**. Mirrors the web app flows and branding.

## Prerequisites

- Node.js 18+
- npm or pnpm (from repo root with workspaces)
- iOS: Xcode (macOS only)
- Android: Android Studio / SDK

## Environment (API URL)

The app calls the NestJS API for properties and property detail. Set one of:

- **EXPO_PUBLIC_API_URL** — base URL (e.g. `http://localhost:3333`). The client will append `/graphql` for GraphQL.
- **EXPO_PUBLIC_GRAPHQL_HTTP** — full GraphQL endpoint (e.g. `http://localhost:3333/graphql`).

Without these, the app shows fallback demo data. For local dev, create a `.env` in `apps/mobile` (or set in shell) with `EXPO_PUBLIC_API_URL=http://localhost:3333` (use your machine’s IP if testing on a device). For production, point to your deployed API URL.

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

## Build APK

**Prerequisites:** Node.js 18+, Android SDK, JDK 17 (for local build). For release APK you also need a keystore and signing config.

### Local debug APK (no signing)

From repo root:

```bash
npm run mobile:apk
# or: nx run mobile:build-apk
```

From this directory (prebuild generates Gradle 9; we patch to 8.10.2 to avoid `JvmVendorSpec.IBM_SEMERU` removal):

```bash
npm run prebuild
node scripts/patch-gradle-version.js
npm run build:apk:debug
```

Or use the root command above—it runs prebuild, patch, and build in one step.

Output: `apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk`

### Local release APK

Configure signing in `android/gradle.properties` and `android/app/build.gradle` (keystore path, credentials), then:

```bash
npm run prebuild
npm run build:apk:release
```

Output: `apps/mobile/android/app/build/outputs/apk/release/app-release.apk`

### EAS Build (APK)

Requires [Expo account](https://expo.dev) and `eas-cli` (`npm i -g eas-cli`). From `apps/mobile`:

```bash
eas build -p android --profile preview
```

The `preview` profile in `eas.json` is set to produce an APK. Download the APK from the build page or the link printed when the build completes. See [Expo: Build APKs](https://docs.expo.dev/build-reference/apk/).

## Changelog

- 2025-03-12: APK build support: `android.package` in app.json; scripts `prebuild`, `build:apk:debug`, `build:apk:release`; Nx target `build-apk` and root script `mobile:apk`; eas.json with preview profile for APK; docs for local and EAS APK build. Added `scripts/patch-gradle-version.js` to pin Gradle to 8.10.2 (avoids Gradle 9 `IBM_SEMERU` removal).
- 2025-03-10: Initial mobile app; Expo + NativeWind; tabs (Home, Search, Post, More); stack screens (property detail, tools); design aligned with web.
