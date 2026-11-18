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
import { registerDonor } from '../services/bloodService';
import { COLORS, GENDERS } from '../theme';

export function DonateScreen() {
  const { user, profile } = useAuth();
  const [name, setName] = useState(profile?.username ?? '');
  const [gender, setGender] = useState<string>('Male');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [email, setEmail] = useState(profile?.email ?? user?.email ?? '');
  const [phone, setPhone] = useState('');
  const [bloodType, setBloodType] = useState('O+');
  const [medicalConditions, setMedicalConditions] = useState('');
  const [certUri, setCertUri] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleGetLocation = async () => {
    setLocLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is needed to pin you on the donor map.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({});
      setCoords({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
    } catch (err: any) {
      Alert.alert('Location Error', err?.message ?? 'Could not fetch GPS location.');
    } finally {
      setLocLoading(false);
    }
  };

  const handlePickCertificate = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    if (!res.canceled && res.assets[0]) {
      setCertUri(res.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    const parsedAge = parseInt(age, 10);
    const parsedWeight = parseInt(weight, 10);

    if (!name.trim() || !phone.trim() || !email.trim()) {
      Alert.alert('Missing Fields', 'Please fill in your name, email, and phone number.');
      return;
    }
    if (isNaN(parsedAge) || parsedAge < 18 || parsedAge > 65) {
      Alert.alert('Eligibility Check', 'Donors must be between 18 and 65 years old.');
      return;
    }
    if (isNaN(parsedWeight) || parsedWeight < 45) {
      Alert.alert('Eligibility Check', 'Donors must weigh at least 45 kg.');
      return;
    }
    if (!user) {
      Alert.alert('Sign In Required', 'Please log in to register as a donor.');
      return;
    }

    setSubmitting(true);
    try {
      await registerDonor({
        userId: user.id,
        name: name.trim(),
        gender,
        email: email.trim(),
        phone: phone.trim(),
        blood_type: bloodType,
        age: parsedAge,
        weight: parsedWeight,
        medical_conditions: medicalConditions.trim() || 'None',
        latitude: coords?.latitude ?? null,
        longitude: coords?.longitude ?? null,
      });
      Alert.alert(
        'Thank You for Registering! 🩸',
        'Your donor profile has been saved to Red Line. Patients in need can now match with you.'
      );
      setPhone('');
      setMedicalConditions('');
      setCertUri(null);
    } catch (err: any) {
      Alert.alert('Registration Failed', err?.message ?? 'Could not save donor details.');
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
          <Text style={styles.title}>🩸 Register as Blood Donor</Text>
          <Text style={styles.subtitle}>
            Help save lives by joining our verified donor network.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter full name"
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

          <View style={styles.row}>
            <View style={styles.half}>
              <Text style={styles.label}>Age (18–65) *</Text>
              <TextInput
                style={styles.input}
                value={age}
                onChangeText={setAge}
                keyboardType="number-pad"
              />
            </View>
            <View style={styles.half}>
              <Text style={styles.label}>Weight (kg ≥45) *</Text>
              <TextInput
                style={styles.input}
                value={weight}
                onChangeText={setWeight}
                keyboardType="number-pad"
              />
            </View>
          </View>

          <Text style={styles.label}>Blood Group *</Text>
          <BloodTypePicker selected={bloodType} onSelect={setBloodType} />

          <Text style={styles.label}>Phone Number *</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter phone number"
            placeholderTextColor={COLORS.textLight}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Medical Conditions (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={medicalConditions}
            onChangeText={setMedicalConditions}
            placeholder="e.g., None, recent surgery, medications..."
            placeholderTextColor={COLORS.textLight}
            multiline
          />

          <Text style={styles.label}>GPS Location (for Nearest Donor Matching)</Text>
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
                  ? `📍 Location Captured (${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)})`
                  : '📍 Capture My Current GPS Location'}
              </Text>
            )}
          </TouchableOpacity>

          <Text style={styles.label}>Doctor Certificate / ID (Optional)</Text>
          <TouchableOpacity style={styles.outlineBtn} onPress={handlePickCertificate}>
            <Text style={styles.outlineBtnText}>
              {certUri ? '✅ Certificate Selected' : '📎 Attach Medical Certificate'}
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
              <Text style={styles.submitBtnText}>Submit Donor Registration</Text>
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
  half: { flex: 1 },
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
