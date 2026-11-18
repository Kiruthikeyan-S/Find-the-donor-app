import React from 'react';
import {
  FlatList,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { COLORS } from '../theme';
import {
  DonorRecord,
  MEDICAL_MATCHING_DISCLAIMER,
} from '../utils/bloodCompatibility';

type Props = NativeStackScreenProps<any, 'MatchingDonors'>;

export function MatchingDonorsScreen({ route }: Props) {
  const { recipientBloodType, donors } = route.params as {
    recipientBloodType: string;
    donors: DonorRecord[];
  };

  const openMaps = (lat: number, lng: number, label: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}(${encodeURIComponent(label)})`;
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>
          Compatible Donors for {recipientBloodType}
        </Text>
        <Text style={styles.bannerSub}>
          Found {donors.length} compatible donor{donors.length === 1 ? '' : 's'}{' '}
          (sorted nearest first when GPS is available)
        </Text>
      </View>

      <View style={styles.disclaimerBox}>
        <Text style={styles.disclaimerText}>{MEDICAL_MATCHING_DISCLAIMER}</Text>
      </View>

      <FlatList
        data={donors}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>
              No compatible donors found right now. Try checking the Live Map
              for nearby blood banks.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.bloodBadge}>
                <Text style={styles.bloodText}>{item.blood_type}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.meta}>
                  {item.distance_km !== null && item.distance_km !== undefined
                    ? `📍 ${item.distance_km} km away`
                    : '📍 Location not shared'}
                </Text>
              </View>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.callBtn}
                onPress={() => Linking.openURL(`tel:${item.phone}`)}
              >
                <Text style={styles.callBtnText}>📞 Call {item.phone}</Text>
              </TouchableOpacity>
              {item.latitude !== null && item.longitude !== null && (
                <TouchableOpacity
                  style={styles.mapBtn}
                  onPress={() =>
                    openMaps(item.latitude!, item.longitude!, item.name)
                  }
                >
                  <Text style={styles.mapBtnText}>🗺️ Directions</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  banner: {
    backgroundColor: COLORS.primary,
    padding: 16,
  },
  bannerTitle: { color: COLORS.white, fontSize: 18, fontWeight: '800' },
  bannerSub: { color: COLORS.primaryLight, fontSize: 13, marginTop: 4 },
  disclaimerBox: {
    backgroundColor: COLORS.warningLight,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#92400e',
    lineHeight: 17,
    fontWeight: '600',
  },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bloodBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bloodText: { color: COLORS.primary, fontWeight: '800', fontSize: 16 },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  meta: { fontSize: 13, color: COLORS.textLight, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  callBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  callBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 13 },
  mapBtn: {
    backgroundColor: COLORS.secondaryLight,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  mapBtnText: { color: COLORS.secondary, fontWeight: '700', fontSize: 13 },
  emptyBox: { padding: 24, alignItems: 'center' },
  emptyText: { color: COLORS.textLight, textAlign: 'center', lineHeight: 20 },
});
