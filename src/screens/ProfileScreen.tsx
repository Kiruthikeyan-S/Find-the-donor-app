import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import {
  BloodRequestDoc,
  DonationDoc,
  fetchUserActivity,
} from '../services/bloodService';
import { COLORS } from '../theme';

export function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { user, profile, signOut } = useAuth();
  const [donations, setDonations] = useState<DonationDoc[]>([]);
  const [requests, setRequests] = useState<BloodRequestDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      fetchUserActivity(user.id)
        .then((res) => {
          setDonations(res.donations);
          setRequests(res.requests);
        })
        .catch((err: any) => {
          Alert.alert('Load Error', err?.message ?? 'Could not load your activity.');
        })
        .finally(() => setLoading(false));
    }, [user])
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(profile?.username?.[0] ?? 'U').toUpperCase()}
          </Text>
        </View>
        <Text style={styles.name}>{profile?.username ?? 'Red Line User'}</Text>
        <Text style={styles.email}>{profile?.email ?? user?.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>
            {profile?.role === 'admin' ? '🛡️ Admin' : '🩸 Donor / Member'}
          </Text>
        </View>
      </View>

      {profile?.role === 'admin' && (
        <TouchableOpacity
          style={styles.adminBtn}
          onPress={() => navigation.navigate('Admin')}
        >
          <Text style={styles.adminBtnText}>🛡️ Open Admin Dashboard</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.aboutBtn}
        onPress={() => navigation.navigate('About')}
      >
        <Text style={styles.aboutBtnText}>ℹ️ About Blood Donation & Compatibility</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>My Donor Registrations ({donations.length})</Text>
      {loading ? (
        <ActivityIndicator color={COLORS.primary} />
      ) : donations.length === 0 ? (
        <Text style={styles.emptyText}>No donor registrations yet.</Text>
      ) : (
        donations.map((d) => (
          <View key={d.id} style={styles.itemCard}>
            <Text style={styles.itemTitle}>
              🩸 {d.blood_type} • {d.name}
            </Text>
            <Text style={styles.itemSub}>
              Age {d.age} • {d.weight} kg • {d.phone}
            </Text>
          </View>
        ))
      )}

      <Text style={styles.sectionTitle}>My Blood Requests ({requests.length})</Text>
      {loading ? (
        <ActivityIndicator color={COLORS.primary} />
      ) : requests.length === 0 ? (
        <Text style={styles.emptyText}>No blood requests submitted yet.</Text>
      ) : (
        requests.map((r) => (
          <View key={r.id} style={styles.itemCard}>
            <Text style={styles.itemTitle}>
              🚨 Need {r.blood_type} • {r.name}
            </Text>
            <Text style={styles.itemSub}>
              {r.address} • Status: {r.status.toUpperCase()}
            </Text>
          </View>
        ))
      )}

      <TouchableOpacity style={styles.logoutBtn} onPress={signOut}>
        <Text style={styles.logoutBtnText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 16, paddingBottom: 32 },
  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarText: { fontSize: 26, fontWeight: '800', color: COLORS.primary },
  name: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  email: { fontSize: 13, color: COLORS.textLight, marginTop: 2 },
  roleBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    marginTop: 10,
  },
  roleText: { color: COLORS.primaryDark, fontWeight: '700', fontSize: 12 },
  adminBtn: {
    backgroundColor: COLORS.text,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  adminBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
  aboutBtn: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginBottom: 18,
  },
  aboutBtnText: { color: COLORS.text, fontWeight: '600', fontSize: 14 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
    marginTop: 8,
  },
  emptyText: { color: COLORS.textLight, fontSize: 13, marginBottom: 12 },
  itemCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 8,
  },
  itemTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  itemSub: { fontSize: 13, color: COLORS.textLight, marginTop: 3 },
  logoutBtn: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 28,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  logoutBtnText: { color: COLORS.primaryDark, fontWeight: '700', fontSize: 15 },
});
