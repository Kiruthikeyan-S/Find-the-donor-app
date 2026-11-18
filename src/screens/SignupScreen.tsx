import { Ionicons } from '@expo/vector-icons';
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

type Props = NativeStackScreenProps<any, 'Signup'>;

export function SignupScreen({ navigation }: Props) {
  const { signUp, signInWithOAuth } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'apple' | null>(null);

  const handleSignup = async () => {
    if (!username.trim() || !email.trim() || password.length < 6) {
      Alert.alert(
        'Invalid Input',
        'Please enter a username, valid email, and password (at least 6 characters).'
      );
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      const { needsEmailConfirmation } = await signUp(username, email, password);
      if (needsEmailConfirmation) {
        Alert.alert(
          'Verify Your Email',
          'Account created! Please check your email and click the confirmation link before logging in.'
        );
        navigation.navigate('Login');
      }
    } catch (err: any) {
      Alert.alert('Sign Up Failed', err?.message ?? 'Could not create account.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'apple') => {
    setOauthLoading(provider);
    try {
      await signInWithOAuth(provider);
    } catch (err: any) {
      Alert.alert(
        `${provider === 'google' ? 'Google' : 'Apple'} Sign-Up`,
        err?.message ?? 'Could not complete sign-up.'
      );
    } finally {
      setOauthLoading(null);
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
          <Text style={styles.heading}>Create Account</Text>
          <Text style={styles.subheading}>
            Sign up to donate or request blood
          </Text>

          <Text style={styles.label}>Full Name / Username</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            placeholderTextColor={COLORS.textLight}
            value={username}
            onChangeText={setUsername}
          />

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

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Minimum 6 characters"
            placeholderTextColor={COLORS.textLight}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Re-enter password"
            placeholderTextColor={COLORS.textLight}
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <TouchableOpacity
            style={[styles.primaryBtn, submitting && styles.btnDisabled]}
            onPress={handleSignup}
            disabled={submitting || oauthLoading !== null}
          >
            {submitting ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.primaryBtnText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.googleBtn}
            onPress={() => handleOAuth('google')}
            disabled={submitting || oauthLoading !== null}
          >
            {oauthLoading === 'google' ? (
              <ActivityIndicator color={COLORS.text} />
            ) : (
              <>
                <Ionicons name="logo-google" size={18} color="#DB4437" />
                <Text style={styles.googleBtnText}>Sign up with Google (Gmail)</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.appleBtn}
            onPress={() => handleOAuth('apple')}
            disabled={submitting || oauthLoading !== null}
          >
            {oauthLoading === 'apple' ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <Ionicons name="logo-apple" size={19} color={COLORS.white} />
                <Text style={styles.appleBtnText}>Sign up with Apple</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.linkText}>Log In</Text>
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
  subheading: { fontSize: 14, color: COLORS.textLight, marginTop: 2, marginBottom: 14 },
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
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
    gap: 10,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: { fontSize: 12, fontWeight: '600', color: COLORS.textLight },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 28,
    paddingVertical: 13,
    marginBottom: 10,
  },
  googleBtnText: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  appleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#000000',
    borderRadius: 28,
    paddingVertical: 13,
  },
  appleBtnText: { color: COLORS.white, fontSize: 14, fontWeight: '600' },
  footerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 18 },
  footerText: { color: COLORS.textLight, fontSize: 14 },
  linkText: { color: COLORS.primary, fontWeight: '700', fontSize: 14 },
});
