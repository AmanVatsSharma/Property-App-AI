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

Without these, the app shows fallback demo data. Copy `apps/mobile/.env.example` to `apps/mobile/.env` and set `EXPO_PUBLIC_API_URL` and/or `EXPO_PUBLIC_GRAPHQL_HTTP` (e.g. `http://localhost:3333` for local dev; use your machine’s IP if testing on a device). For production, point to your deployed API URL.

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

### Prerequisites (local build)

| Requirement       | Purpose                                                    |
|-------------------|------------------------------------------------------------|
| Node.js 18+       | Run Expo and scripts                                      |
| Android SDK       | Build the native Android project (set `ANDROID_HOME`)      |
| JDK 17            | Gradle uses it to compile (`JAVA_HOME` → JDK 17)           |

For release APK you also need a keystore and signing config.

### Local debug APK (no signing)

From repo root (runs prebuild, Gradle patch, assembleDebug, and copies APK):

```bash
npm run mobile:apk
# or: nx run mobile:build-apk
```

From this directory:

```bash
npm run prebuild
node scripts/patch-gradle-version.js
npm run build:apk:debug
node scripts/copy-apk.js
```

**Output:** `apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk`  
**Copied to:** `apps/mobile/app-debug.apk` (when using `npm run mobile:apk`)

Install on device or emulator:

```bash
adb install apps/mobile/app-debug.apk
```

### Local release APK

Configure signing in `android/gradle.properties` and `android/app/build.gradle` (keystore path, credentials), then:

```bash
npm run prebuild
npm run build:apk:release
```

Output: `apps/mobile/android/app/build/outputs/apk/release/app-release.apk`

### EAS Build (APK, no local SDK)

1. Install EAS CLI: `npm i -g eas-cli`
2. Log in: `eas login` (Expo account)
3. From `apps/mobile`: `eas build -p android --profile preview`

The `preview` profile in `eas.json` produces an APK. Download from the Expo dashboard or the link printed when the build completes. See [Expo: Build APKs](https://docs.expo.dev/build-reference/apk/).

### Summary

| Goal                | Command                                              | Output |
|---------------------|------------------------------------------------------|--------|
| Debug APK (local)   | `npm run mobile:apk` from repo root                 | `apps/mobile/app-debug.apk` (and Gradle output path) |
| Release APK (local) | Prebuild + signing config + `npm run build:apk:release` | `apps/mobile/android/.../release/app-release.apk` |
| APK without local SDK | `eas build -p android --profile preview` from apps/mobile | Download from Expo dashboard |

## Changelog

- 2025-03-14: APK build: added `scripts/copy-apk.js` to copy debug APK to `apps/mobile/app-debug.apk`; `build-apk` target runs copy after assembleDebug; README Build APK section updated with prerequisites table, copy output location, adb install, and summary table.
- 2025-03-12: APK build support: `android.package` in app.json; scripts `prebuild`, `build:apk:debug`, `build:apk:release`; Nx target `build-apk` and root script `mobile:apk`; eas.json with preview profile for APK; docs for local and EAS APK build. Added `scripts/patch-gradle-version.js` to pin Gradle to 8.10.2 (avoids Gradle 9 `IBM_SEMERU` removal).
- 2025-03-10: Initial mobile app; Expo + NativeWind; tabs (Home, Search, Post, More); stack screens (property detail, tools); design aligned with web.
