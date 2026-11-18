import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { BloodTypePicker } from '../components/BloodTypePicker';
import { useAuth } from '../context/AuthContext';
import { fetchAllDonors, submitBloodRequest } from '../services/bloodService';
import { COLORS, GENDERS } from '../theme';
import { matchAndSortDonors } from '../utils/bloodCompatibility';

export function RequestBloodScreen() {
  const navigation = useNavigation<any>();
  const { user, profile } = useAuth();
  const [name, setName] = useState(profile?.username ?? '');
  const [gender, setGender] = useState<string>('Male');
  const [email, setEmail] = useState(profile?.email ?? user?.email ?? '');
  const [phone, setPhone] = useState('');
  const [bloodType, setBloodType] = useState('O+');
  const [address, setAddress] = useState('');
  const [idProofUri, setIdProofUri] = useState('');
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleGetLocation = async () => {
    setLocLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission helps us find the nearest donors.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({});
      setCoords({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
    } catch (err: any) {
      Alert.alert('Location Error', err?.message ?? 'Could not get GPS coordinates.');
    } finally {
      setLocLoading(false);
    }
  };

  const handlePickIdProof = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    if (!res.canceled && res.assets[0]) {
      setIdProofUri(res.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim() || !address.trim()) {
      Alert.alert('Missing Fields', 'Please enter patient/requester name, phone, and hospital/address.');
      return;
    }

    setSubmitting(true);
    try {
      if (user) {
        await submitBloodRequest({
          userId: user.id,
          name: name.trim(),
          gender,
          email: email.trim(),
          phone: phone.trim(),
          blood_type: bloodType,
          address: address.trim(),
          id_proof_uri: idProofUri,
          latitude: coords?.latitude ?? null,
          longitude: coords?.longitude ?? null,
        });
      }

      const allDonors = await fetchAllDonors();
      const matched = matchAndSortDonors(
        allDonors,
        bloodType,
        coords?.latitude ?? null,
        coords?.longitude ?? null
      );

      navigation.navigate('MatchingDonors', {
        recipientBloodType: bloodType,
        donors: matched,
        reqLat: coords?.latitude ?? null,
        reqLng: coords?.longitude ?? null,
      });
    } catch (err: any) {
      Alert.alert('Request Error', err?.message ?? 'Could not submit blood request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.headerBox}>
          <Text style={styles.title}>🚨 Urgent Blood Request</Text>
          <Text style={styles.subtitle}>
            Submit patient details to find compatible donors sorted by nearest
            distance.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Patient / Requester Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Full name"
            placeholderTextColor={COLORS.textLight}
          />

          <Text style={styles.label}>Gender</Text>
          <View style={styles.row}>
            {GENDERS.map((g) => (
              <TouchableOpacity
                key={g}
                style={[styles.chip, gender === g && styles.chipActive]}
                onPress={() => setGender(g)}
              >
                <Text style={[styles.chipText, gender === g && styles.chipTextActive]}>
                  {g}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Required Blood Group *</Text>
          <BloodTypePicker selected={bloodType} onSelect={setBloodType} />

          <Text style={styles.label}>Contact Phone *</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="+91 98765 43210"
            placeholderTextColor={COLORS.textLight}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Hospital / Delivery Address *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={address}
            onChangeText={setAddress}
            placeholder="Hospital name, ward, and street address"
            placeholderTextColor={COLORS.textLight}
            multiline
          />

          <Text style={styles.label}>Your GPS Location (for Shortest-Path Sorting)</Text>
          <TouchableOpacity
            style={styles.outlineBtn}
            onPress={handleGetLocation}
            disabled={locLoading}
          >
            {locLoading ? (
              <ActivityIndicator color={COLORS.primary} />
            ) : (
              <Text style={styles.outlineBtnText}>
                {coords
                  ? `📍 Location Ready (${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)})`
                  : '📍 Use My Current Location'}
              </Text>
            )}
          </TouchableOpacity>

          <Text style={styles.label}>Hospital / ID Proof (Optional)</Text>
          <TouchableOpacity style={styles.outlineBtn} onPress={handlePickIdProof}>
            <Text style={styles.outlineBtnText}>
              {idProofUri ? '✅ ID Proof Attached' : '📎 Attach ID / Hospital Slip'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.submitBtn, submitting && styles.btnDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.submitBtnText}>Find Matching Donors</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 16, paddingBottom: 32 },
  headerBox: { marginBottom: 14 },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  subtitle: { fontSize: 13, color: COLORS.textLight, marginTop: 4 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.text,
    backgroundColor: COLORS.bg,
  },
  textArea: { minHeight: 72, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 10 },
  chip: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    backgroundColor: COLORS.bg,
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontWeight: '600', color: COLORS.text },
  chipTextActive: { color: COLORS.white },
  outlineBtn: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 12,
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
  },
  outlineBtnText: { color: COLORS.primaryDark, fontWeight: '600', fontSize: 13 },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 28,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 22,
  },
  btnDisabled: { opacity: 0.7 },
  submitBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
});
