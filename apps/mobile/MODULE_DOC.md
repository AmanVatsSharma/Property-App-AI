# mobile

Native iOS/Android application for UrbanNest.ai (Property-App-AI), built with Expo, React Native, NativeWind (Tailwind), and TypeScript.

## Purpose

- Deliver the same product flows as the web app (landing, search, property detail, post property, tools) on iOS and Android.
- Reuse branding and design tokens (dark/light theme, teal primary, radius) from web via NativeWind `tailwind.config.js`.
- Light/dark theme with persistence (urbannest-theme); shared header with location and profile/theme menu.

## Flows

1. **Home (Landing)** — Header (location + avatar); hero, search CTA, city cards, featured listing, bottom CTAs (Search, Post Property).
2. **Search** — Header; AI search bar, property list (filtered by selected location or current location); tap card → Property detail.
3. **Post** — Post property hero, benefits, steps, pricing, Step 1 form.
4. **More** — Tools list → About, EMI Calculator, Legal Checker, Neighbourhood Score, Price Forecast.
5. **Property detail** — Breadcrumb, gallery, specs, overview, AI score, contact (Call / WhatsApp).

## Navigation

- **Tabs:** Home, Search, Post, More (bottom tab bar); custom header (AppHeader) on all tab screens.
- **Stack (root):** (tabs), property/[id], modal.
- **Stack (More):** index (tools list), about, emi-calculator, legal-checker, neighbourhood, price-forecast.

## Key files

- `app/_layout.tsx` — Root layout; ThemeProvider + LocationProvider; UrbanNest dark/light theme; Stack (tabs + property + modal); StatusBar.
- `app/(tabs)/_layout.tsx` — Tab bar (theme-aware) and AppHeader.
- `app/(tabs)/index.tsx` — Landing (theme-aware).
- `app/(tabs)/search.tsx` — Search and property list (theme + location filter).
- `app/(tabs)/post.tsx` — Post property (theme-aware).
- `app/(tabs)/more/_layout.tsx` — More stack (theme-aware header).
- `app/(tabs)/more/index.tsx` — Tools list (theme-aware).
- `app/property/[id].tsx` — Property detail (theme-aware).
- `components/AppHeader.tsx` — Location (left) and avatar menu with theme toggle (right).
- `components/LocationSheet.tsx` — Modal: “Use your current location” and city list.
- `components/providers/ThemeProvider.tsx` — Theme context; persistence (AsyncStorage); NativeWind colorScheme sync.
- `lib/theme-storage.ts` — Persist/load theme (urbannest-theme).
- `lib/location-context.tsx` — Location state (city or coords); useCurrentLocation (expo-location).
- `constants/cities.ts` — Shared city list for home and location sheet.
- `global.css` — Tailwind base/components/utilities.
- `tailwind.config.js` — Theme (dark + light palette), darkMode: class.
- `metro.config.js` — NativeWind Metro integration.
- `babel.config.js` — NativeWind Babel preset.

## Build (APK)

- **Local debug APK:** From repo root: `npm run mobile:apk` (runs prebuild + `assembleDebug`). Output: `android/app/build/outputs/apk/debug/app-debug.apk`.
- **EAS Build (APK):** From `apps/mobile`: `eas build -p android --profile preview` (uses `eas.json` preview profile). Requires Expo account and `eas-cli`.

## Changelog

- 2025-03-14: Light/dark theme with persistence (ThemeProvider, theme-storage, urbannest-theme); NativeWind darkMode: class and light palette in tailwind; UrbanNestLightTheme in root layout; StatusBar and nav/tab theme-aware. AppHeader with location (left) and avatar (right); LocationProvider and LocationSheet (city list + “Use your current location” via expo-location); app.json location permissions. Avatar menu: theme toggle (Light/Dark). Search filter by location (city or coords bounding box). All tab and stack screens theme-aware (home, search, post, more, property detail). CITIES moved to constants/cities.ts.
- 2025-03-12: APK build: android.package in app.json; prebuild/build:apk:debug/release scripts; Nx build-apk target and root mobile:apk script; eas.json preview profile; README and MODULE_DOC updated.
- 2025-03-10: Initial module. Expo app with NativeWind; tabs and stack navigation; Landing, Search, Post, More (with tools), Property detail; design tokens aligned with web.
