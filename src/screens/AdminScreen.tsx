import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  BloodRequestDoc,
  DonationDoc,
  fetchAllDonationsAdmin,
  fetchAllRequestsAdmin,
  updateRequestStatus,
} from '../services/bloodService';
import { COLORS } from '../theme';

export function AdminScreen() {
  const [donations, setDonations] = useState<DonationDoc[]>([]);
  const [requests, setRequests] = useState<BloodRequestDoc[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [d, r] = await Promise.all([
        fetchAllDonationsAdmin(),
        fetchAllRequestsAdmin(),
      ]);
      setDonations(d);
      setRequests(r);
    } catch (err: any) {
      Alert.alert('Admin Load Error', err?.message ?? 'Could not load records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFulfill = async (id: string) => {
    await updateRequestStatus(id, 'fulfilled');
    loadData();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Blood Requests ({requests.length})</Text>
      {requests.map((r) => (
        <View key={r.id} style={styles.card}>
          <Text style={styles.cardTitle}>
            🚨 {r.blood_type} • {r.name} ({r.status.toUpperCase()})
          </Text>
          <Text style={styles.cardMeta}>
            {r.phone} • {r.address}
          </Text>
          {r.status === 'open' && (
            <TouchableOpacity
              style={styles.fulfillBtn}
              onPress={() => handleFulfill(r.id)}
            >
              <Text style={styles.fulfillText}>✅ Mark Fulfilled</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}

      <Text style={styles.sectionTitle}>Registered Donors ({donations.length})</Text>
      {donations.map((d) => (
        <View key={d.id} style={styles.card}>
          <Text style={styles.cardTitle}>
            🩸 {d.blood_type} • {d.name}
          </Text>
          <Text style={styles.cardMeta}>
            {d.phone} • Age {d.age} • {d.weight} kg
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 16, paddingBottom: 32 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 10,
    marginBottom: 10,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  cardMeta: { fontSize: 13, color: COLORS.textLight, marginTop: 4 },
  fulfillBtn: {
    marginTop: 10,
    backgroundColor: COLORS.successLight,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  fulfillText: { color: COLORS.success, fontWeight: '700', fontSize: 12 },
});
