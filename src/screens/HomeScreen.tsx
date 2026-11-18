import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../theme';

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const { profile } = useAuth();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>🩸 CENTRALIZED BLOOD DONATION</Text>
        </View>
        <Text style={styles.heroTitle}>
          Every Drop Counts.{'\n'}
          <Text style={styles.heroHighlight}>Save Lives Today.</Text>
        </Text>
        <Text style={styles.heroSubtitle}>
          Welcome{profile?.username ? `, ${profile.username}` : ''}! Red Line
          connects volunteer blood donors, patients, and healthcare providers in
          real time.
        </Text>

        <View style={styles.heroButtons}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.navigate('Donate')}
          >
            <Text style={styles.primaryBtnText}>🩸 Register to Donate</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => navigation.navigate('Request')}
          >
            <Text style={styles.secondaryBtnText}>🚨 Request Blood</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.sectionTitle}>How Can We Help You?</Text>

      <TouchableOpacity
        style={styles.actionCard}
        onPress={() => navigation.navigate('Donate')}
      >
        <View style={[styles.iconCircle, { backgroundColor: COLORS.primaryLight }]}>
          <Text style={styles.iconEmoji}>🩸</Text>
        </View>
        <View style={styles.actionBody}>
          <Text style={styles.actionTitle}>Become a Blood Donor</Text>
          <Text style={styles.actionDesc}>
            Register as a voluntary donor. Your single donation can save up to 3
            lives.
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionCard}
        onPress={() => navigation.navigate('Request')}
      >
        <View style={[styles.iconCircle, { backgroundColor: COLORS.secondaryLight }]}>
          <Text style={styles.iconEmoji}>🏥</Text>
        </View>
        <View style={styles.actionBody}>
          <Text style={styles.actionTitle}>Urgent Blood Request</Text>
          <Text style={styles.actionDesc}>
            Submit an emergency request and match with the nearest compatible
            donors.
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionCard}
        onPress={() => navigation.navigate('Map')}
      >
        <View style={[styles.iconCircle, { backgroundColor: COLORS.successLight }]}>
          <Text style={styles.iconEmoji}>📍</Text>
        </View>
        <View style={styles.actionBody}>
          <Text style={styles.actionTitle}>Live Donors & Blood Banks Map</Text>
          <Text style={styles.actionDesc}>
            Explore nearby registered donors, blood banks, and emergency
            hospitals.
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.infoBanner}
        onPress={() => navigation.navigate('About')}
      >
        <Text style={styles.infoBannerTitle}>ℹ️ Learn About Blood Donation</Text>
        <Text style={styles.infoBannerSub}>
          View eligibility guidelines and blood type compatibility chart →
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 16, paddingBottom: 32 },
  heroCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 22,
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
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    lineHeight: 34,
    marginBottom: 10,
  },
  heroHighlight: { color: COLORS.primary },
  heroSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 21,
    marginBottom: 18,
  },
  heroButtons: {
    gap: 10,
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 28,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryBtnText: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  secondaryBtn: {
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 28,
    paddingVertical: 13,
    alignItems: 'center',
  },
  secondaryBtnText: { color: COLORS.primary, fontSize: 15, fontWeight: '700' },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  actionCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
    alignItems: 'center',
    gap: 14,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: { fontSize: 24 },
  actionBody: { flex: 1 },
  actionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 3 },
  actionDesc: { fontSize: 13, color: COLORS.textLight, lineHeight: 18 },
  infoBanner: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 14,
    padding: 16,
    marginTop: 6,
  },
  infoBannerTitle: { fontSize: 15, fontWeight: '700', color: COLORS.primaryDark },
  infoBannerSub: { fontSize: 13, color: COLORS.primaryDark, marginTop: 4 },
});
