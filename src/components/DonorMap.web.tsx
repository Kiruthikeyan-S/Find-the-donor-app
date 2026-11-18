import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MedicalFacility } from '../data/facilities';
import { COLORS } from '../theme';
import { DonorRecord } from '../utils/bloodCompatibility';

interface DonorMapProps {
  donors: DonorRecord[];
  facilities: MedicalFacility[];
  filter: 'all' | 'donor' | 'bank' | 'hospital';
  userCoords: { latitude: number; longitude: number } | null;
}

export function DonorMap({ donors, facilities, filter }: DonorMapProps) {
  const donorCount =
    filter === 'all' || filter === 'donor'
      ? donors.filter((d) => d.latitude !== null && d.longitude !== null).length
      : 0;
  const facCount = facilities.filter(
    (f) => filter === 'all' || f.type === filter
  ).length;

  return (
    <View style={styles.webFallback}>
      <Text style={styles.title}>🗺️ Interactive Map (Mobile Native View)</Text>
      <Text style={styles.sub}>
        Showing {donorCount} geolocated donors and {facCount} medical centers
        below. Open on Android/iOS Expo Go for the full native map view.
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
