import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../theme';
import { BLOOD_COMPATIBILITY } from '../utils/bloodCompatibility';

export function AboutScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.title}>Why Donate Blood?</Text>
        <Text style={styles.body}>
          A blood donation occurs when a person voluntarily has blood drawn and
          used for transfusions or biopharmaceutical medications. Every single
          whole blood donation can help save up to three lives during medical
          emergencies, surgeries, and cancer treatments.
        </Text>
        <Text style={styles.body}>
          Red Line connects voluntary blood donors, patients, and healthcare
          facilities so urgent blood requirements can be matched with nearby
          compatible donors in minutes.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Blood Type Compatibility</Text>
        {Object.entries(BLOOD_COMPATIBILITY).map(([recipient, donors]) => (
          <View key={recipient} style={styles.compatRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{recipient}</Text>
            </View>
            <Text style={styles.compatText}>
              Can receive from: {donors.join(', ')}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 16, gap: 16, paddingBottom: 32 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title: { fontSize: 19, fontWeight: '800', color: COLORS.text, marginBottom: 10 },
  body: { fontSize: 14, color: COLORS.textLight, lineHeight: 21, marginBottom: 10 },
  compatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  badge: {
    width: 48,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
  },
  badgeText: { color: COLORS.primary, fontWeight: '800', fontSize: 13 },
  compatText: { flex: 1, fontSize: 13, color: COLORS.text },
});
