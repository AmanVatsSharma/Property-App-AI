/**
 * @file LocationSheet.tsx
 * @module components
 * @description Modal sheet for location: "Use your current location" and city list.
 * @author BharatERP
 * @created 2025-03-14
 */

import { useTheme } from '@/components/providers/ThemeProvider';
import { CITIES } from '@/constants/cities';
import { useLocation } from '@/lib/location-context';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function LocationSheet() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const {
    locationSheetVisible,
    closeLocationSheet,
    setLocationByCity,
    setLocationByCoords,
    useCurrentLocation,
  } = useLocation();

  const isDark = theme === 'dark';
  const bg = isDark ? 'bg-dark' : 'bg-light-dark';
  const bgCard = isDark ? 'bg-night' : 'bg-light-night';
  const borderCls = isDark ? 'border-border' : 'border-light-border';
  const textCls = isDark ? 'text-white' : 'text-light-heading';
  const textMuted = isDark ? 'text-text-muted' : 'text-light-text-muted';
  const tealCls = isDark ? 'text-teal' : 'text-light-teal';

  if (!locationSheetVisible) return null;

  return (
    <Modal visible transparent animationType="slide" onRequestClose={closeLocationSheet}>
      <Pressable className="flex-1 justify-end bg-black/50" onPress={closeLocationSheet}>
        <Pressable
          className={`${bg} rounded-t-2xl max-h-[80%]`}
          onPress={(e) => e.stopPropagation()}
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        >
          <View className={`p-4 border-b ${borderCls}`}>
            <Text className={`${textCls} font-bold text-lg`}>Change location</Text>
          </View>
          <ScrollView className="p-4">
            <Pressable
              onPress={async () => {
                await useCurrentLocation();
                closeLocationSheet();
              }}
              className={`${bgCard} border ${borderCls} rounded-xl p-4 mb-4 flex-row items-center gap-3`}
              accessibilityLabel="Use your current location"
              accessibilityRole="button"
            >
              <Text className="text-2xl">📍</Text>
              <View className="flex-1">
                <Text className={`${tealCls} font-semibold`}>Use your current location</Text>
                <Text className={`${textMuted} text-sm`}>Search near you</Text>
              </View>
            </Pressable>
            <Text className={`${textMuted} text-xs uppercase tracking-wider mb-2`}>Or pick a city</Text>
            {CITIES.map((c) => (
              <Pressable
                key={c.name}
                onPress={() => {
                  setLocationByCity(c.name);
                  closeLocationSheet();
                }}
                className={`${bgCard} border ${borderCls} rounded-xl p-4 mb-2 flex-row items-center gap-3`}
              >
                <Text className="text-2xl">{c.emoji}</Text>
                <Text className={`${textCls} font-medium flex-1`}>{c.name}</Text>
                <Text className={textMuted}>{c.count}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
