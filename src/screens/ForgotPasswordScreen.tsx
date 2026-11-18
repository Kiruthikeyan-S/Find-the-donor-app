import { NativeStackScreenProps } from '@react-navigation/native-stack';
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
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../theme';

type Props = NativeStackScreenProps<any, 'ForgotPassword'>;

export function ForgotPasswordScreen({ navigation }: Props) {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    if (!email.trim()) {
      Alert.alert('Email Required', 'Please enter your registered email address.');
      return;
    }
    setSubmitting(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err: any) {
      Alert.alert('Reset Failed', err?.message ?? 'Could not send reset email.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.heading}>Forgot Password</Text>
          <Text style={styles.subheading}>
            Enter your email address and we&apos;ll send you a password reset link.
          </Text>

          {sent ? (
            <View style={styles.successBox}>
              <Text style={styles.successTitle}>Reset Email Sent</Text>
              <Text style={styles.successText}>
                Check your inbox ({email.trim()}) for the password reset link.
              </Text>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.primaryBtnText}>Back to Log In</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor={COLORS.textLight}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />

              <TouchableOpacity
                style={[styles.primaryBtn, submitting && styles.btnDisabled]}
                onPress={handleReset}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.primaryBtnText}>Send Reset Link</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          <View style={styles.footerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.linkText}>← Back to Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.bg },
  container: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  heading: { fontSize: 22, fontWeight: '700', color: COLORS.text },
  subheading: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
    backgroundColor: COLORS.bg,
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 28,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  btnDisabled: { opacity: 0.7 },
  primaryBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  successBox: {
    backgroundColor: COLORS.successLight,
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
  },
  successTitle: { fontSize: 15, fontWeight: '700', color: COLORS.success },
  successText: { fontSize: 13, color: COLORS.text, marginTop: 4, lineHeight: 19 },
  footerRow: { alignItems: 'center', marginTop: 18 },
  linkText: { color: COLORS.primary, fontWeight: '700', fontSize: 14 },
});
