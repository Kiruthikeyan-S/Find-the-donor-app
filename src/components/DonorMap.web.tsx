import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../theme';
import { DonorRecord } from '../utils/bloodCompatibility';

interface DonorMapProps {
  donors: DonorRecord[];
  userCoords: { latitude: number; longitude: number } | null;
}

export function DonorMap({ donors }: DonorMapProps) {
  const donorCount = donors.filter(
    (d) => d.latitude !== null && d.longitude !== null
  ).length;

  return (
    <View style={styles.webFallback}>
      <Text style={styles.title}>🗺️ Live Donor Map</Text>
      <Text style={styles.sub}>
        {donorCount} registered donor{donorCount === 1 ? '' : 's'} with GPS
        location. Open on Android or iOS Expo Go for the interactive map view.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  webFallback: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title: { fontSize: 15, fontWeight: '700', color: COLORS.primaryDark },
  sub: { fontSize: 13, color: COLORS.text, marginTop: 4, lineHeight: 18 },
});
