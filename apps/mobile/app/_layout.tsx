import '../global.css';

import { DarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { useTheme } from '@/components/providers/ThemeProvider';
import { LocationSheet } from '@/components/LocationSheet';
import { LocationProvider } from '@/lib/location-context';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const UrbanNestDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#00d4aa',
    background: '#080c14',
    card: '#0f1623',
    text: 'rgba(255,255,255,0.9)',
    border: 'rgba(255,255,255,0.06)',
  },
};

const UrbanNestLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#00b894',
    background: '#f5f7fa',
    card: '#eef1f5',
    text: '#1a1d24',
    border: 'rgba(0, 0, 0, 0.08)',
  },
};

function RootLayoutNav() {
  const { theme } = useTheme();
  const navTheme = theme === 'dark' ? UrbanNestDarkTheme : UrbanNestLightTheme;
  const isDark = theme === 'dark';

  return (
    <NavThemeProvider value={navTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: navTheme.colors.background },
          headerTintColor: navTheme.colors.primary,
          headerTitleStyle: { color: navTheme.colors.text },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ title: 'Sign in' }} />
        <Stack.Screen name="property/[id]" options={{ title: 'Property' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </NavThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <LocationProvider>
        <RootLayoutNav />
        <LocationSheet />
      </LocationProvider>
    </ThemeProvider>
  );
}
