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
import { fetchDonorMapMarkers } from '../services/bloodService';
import { COLORS } from '../theme';
import { DonorRecord } from '../utils/bloodCompatibility';

export function MapScreen() {
  const [donors, setDonors] = useState<DonorRecord[]>([]);
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadDonors = () => {
    setLoading(true);
    setErrorMsg(null);
    fetchDonorMapMarkers()
      .then(setDonors)
      .catch((err: any) => {
        setErrorMsg(err?.message ?? 'Could not load donor locations.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDonors();
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>📍 Live Donors Map</Text>
      <Text style={styles.subtitle}>
        View registered donors from your Supabase database.
      </Text>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.locateBtn} onPress={locateMe}>
          <Text style={styles.locateBtnText}>🎯 My Location</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.refreshBtn} onPress={loadDonors}>
          <Text style={styles.refreshBtnText}>↻ Refresh</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 24 }} />
      ) : errorMsg ? (
        <View style={styles.emptyCard}>
          <Text style={[styles.emptyText, { color: COLORS.danger }]}>{errorMsg}</Text>
        </View>
      ) : (
        <DonorMap donors={donors} userCoords={userCoords} />
      )}

      <Text style={styles.sectionTitle}>Registered Donors ({donors.length})</Text>
      {donors.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            No donors registered yet. Donors added through the Donate tab will
            appear here.
          </Text>
        </View>
      ) : (
        donors.map((d) => (
          <View key={d.id} style={styles.card}>
            <Text style={styles.cardTitle}>
              🩸 {d.blood_type} • {d.name}
            </Text>
            <View style={styles.cardActions}>
              {Boolean(d.phone) && (
                <TouchableOpacity
                  style={styles.callBtn}
                  onPress={() => Linking.openURL(`tel:${d.phone}`)}
                >
                  <Text style={styles.callBtnText}>📞 Call</Text>
                </TouchableOpacity>
              )}
              {d.latitude !== null && d.longitude !== null && (
                <TouchableOpacity
                  style={styles.dirBtn}
                  onPress={() => openGoogleMaps(d.latitude!, d.longitude!, d.name)}
                >
                  <Text style={styles.dirBtnText}>🗺️ Directions</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 21, fontWeight: '800', color: COLORS.text },
  subtitle: { fontSize: 13, color: COLORS.textLight, marginTop: 4, marginBottom: 12 },
  controls: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  locateBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
  },
  locateBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 13 },
  refreshBtn: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
  },
  refreshBtnText: { color: COLORS.text, fontWeight: '600', fontSize: 13 },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 20,
    marginBottom: 10,
  },
  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyText: { fontSize: 13, color: COLORS.textLight, lineHeight: 19 },
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
