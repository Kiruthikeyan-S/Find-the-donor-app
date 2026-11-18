import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { DonorMap } from '../components/DonorMap';
import { MEDICAL_FACILITIES } from '../data/facilities';
import { fetchAllDonors } from '../services/bloodService';
import { COLORS } from '../theme';
import { DonorRecord } from '../utils/bloodCompatibility';

type FilterType = 'all' | 'donor' | 'bank' | 'hospital';

export function MapScreen() {
  const [donors, setDonors] = useState<DonorRecord[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllDonors()
      .then(setDonors)
      .finally(() => setLoading(false));
  }, []);

  const locateMe = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Enable location access to center the map on you.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({});
      setUserCoords({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
    } catch (err: any) {
      Alert.alert('Location Error', err?.message ?? 'Could not get location.');
    }
  };

  const openGoogleMaps = (lat: number, lng: number, name: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}(${encodeURIComponent(name)})`;
    Linking.openURL(url);
  };

  const visibleFacilities = MEDICAL_FACILITIES.filter(
    (f) => filter === 'all' || f.type === filter
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>📍 Real-Time Donors & Blood Banks</Text>
      <Text style={styles.subtitle}>
        Explore registered donors, blood banks, and emergency hospitals.
      </Text>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.locateBtn} onPress={locateMe}>
          <Text style={styles.locateBtnText}>🎯 My Location</Text>
        </TouchableOpacity>
        {(['all', 'donor', 'bank', 'hospital'] as FilterType[]).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterPill, filter === f && styles.filterPillActive]}
            onPress={() => setFilter(f)}
          >
            <Text
              style={[
                styles.filterText,
                filter === f && styles.filterTextActive,
              ]}
            >
              {f === 'all'
                ? 'All'
                : f === 'donor'
                ? '🩸 Donors'
                : f === 'bank'
                ? '🏥 Blood Banks'
                : '🚑 Hospitals'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 24 }} />
      ) : (
        <DonorMap
          donors={donors}
          facilities={MEDICAL_FACILITIES}
          filter={filter}
          userCoords={userCoords}
        />
      )}

      <Text style={styles.sectionTitle}>Verified Medical Facilities</Text>
      {visibleFacilities.map((fac) => (
        <View key={fac.id} style={styles.card}>
          <Text style={styles.cardTitle}>
            {fac.type === 'bank' ? '🩸' : '🏥'} {fac.name}
          </Text>
          <Text style={styles.cardMeta}>{fac.address}</Text>
          <Text style={styles.cardStock}>Stock: {fac.stockInfo}</Text>
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.callBtn}
              onPress={() => Linking.openURL(`tel:${fac.phone}`)}
            >
              <Text style={styles.callBtnText}>📞 Call</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dirBtn}
              onPress={() => openGoogleMaps(fac.latitude, fac.longitude, fac.name)}
            >
              <Text style={styles.dirBtnText}>🗺️ Directions</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 21, fontWeight: '800', color: COLORS.text },
  subtitle: { fontSize: 13, color: COLORS.textLight, marginTop: 4, marginBottom: 12 },
  controls: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  locateBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  locateBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 12 },
  filterPill: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterPillActive: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
  filterText: { color: COLORS.text, fontWeight: '600', fontSize: 12 },
  filterTextActive: { color: COLORS.primaryDark },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 20,
    marginBottom: 10,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    marginBottom: 12,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  cardMeta: { fontSize: 13, color: COLORS.textLight, marginTop: 3 },
  cardStock: { fontSize: 13, color: COLORS.text, fontWeight: '600', marginTop: 6 },
  cardActions: { flexDirection: 'row', gap: 10, marginTop: 10 },
  callBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  callBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 13 },
  dirBtn: {
    backgroundColor: COLORS.secondaryLight,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  dirBtnText: { color: COLORS.secondary, fontWeight: '700', fontSize: 13 },
});
