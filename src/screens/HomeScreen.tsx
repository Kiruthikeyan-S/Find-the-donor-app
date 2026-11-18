import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../theme';

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const { profile } = useAuth();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heroCard}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>🩸 FIND THE DONOR</Text>
        </View>
        <Text style={styles.heroTitle}>
          Every Drop Counts.{'\n'}
          <Text style={styles.heroHighlight}>Save Lives Today.</Text>
        </Text>
        <Text style={styles.heroSubtitle}>
          Welcome{profile?.username ? `, ${profile.username}` : ''}! Connect
          with blood donors and emergency requests in real time.
        </Text>

        <View style={styles.heroButtons}>
          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Donate')}
          >
            <Ionicons name="water" size={18} color={COLORS.white} />
            <Text style={styles.primaryBtnText}>Register to Donate</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryBtn}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Request')}
          >
            <Ionicons name="alert-circle" size={18} color={COLORS.primary} />
            <Text style={styles.secondaryBtnText}>Request Blood</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Quick Actions</Text>

      <TouchableOpacity
        style={styles.actionCard}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('Donate')}
      >
        <View style={[styles.iconCircle, { backgroundColor: COLORS.primaryLight }]}>
          <Ionicons name="water" size={24} color={COLORS.primary} />
        </View>
        <View style={styles.actionBody}>
          <Text style={styles.actionTitle}>Become a Blood Donor</Text>
          <Text style={styles.actionDesc}>
            Register as a voluntary donor. One donation can save up to 3 lives.
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionCard}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('Request')}
      >
        <View style={[styles.iconCircle, { backgroundColor: COLORS.secondaryLight }]}>
          <Ionicons name="medkit" size={24} color={COLORS.secondary} />
        </View>
        <View style={styles.actionBody}>
          <Text style={styles.actionTitle}>Urgent Blood Request</Text>
          <Text style={styles.actionDesc}>
            Submit an emergency request and match with nearest compatible donors.
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionCard}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('Map')}
      >
        <View style={[styles.iconCircle, { backgroundColor: COLORS.successLight }]}>
          <Ionicons name="location" size={24} color={COLORS.success} />
        </View>
        <View style={styles.actionBody}>
          <Text style={styles.actionTitle}>Live Donors Map</Text>
          <Text style={styles.actionDesc}>
            Explore registered donors on the map and get instant directions.
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.infoBanner}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('About')}
      >
        <View style={styles.infoBannerRow}>
          <Ionicons name="information-circle" size={22} color={COLORS.primaryDark} />
          <View style={{ flex: 1 }}>
            <Text style={styles.infoBannerTitle}>Blood Compatibility & Guide</Text>
            <Text style={styles.infoBannerSub}>
              View eligibility rules and donor-recipient compatibility chart →
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 16, paddingBottom: 32 },
  heroCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 12,
  },
  badgeText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    lineHeight: 35,
    marginBottom: 10,
  },
  heroHighlight: { color: COLORS.primary },
  heroSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 21,
    marginBottom: 20,
  },
  heroButtons: { gap: 10 },
  primaryBtn: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 28,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryBtnText: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  secondaryBtn: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 28,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: { color: COLORS.primary, fontSize: 15, fontWeight: '700' },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 12,
  },
  actionCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
    alignItems: 'center',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBody: { flex: 1 },
  actionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 3 },
  actionDesc: { fontSize: 13, color: COLORS.textLight, lineHeight: 18 },
  infoBanner: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 16,
    padding: 16,
    marginTop: 6,
  },
  infoBannerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoBannerTitle: { fontSize: 15, fontWeight: '700', color: COLORS.primaryDark },
  infoBannerSub: { fontSize: 13, color: COLORS.primaryDark, marginTop: 3 },
});
