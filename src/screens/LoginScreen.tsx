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

type Props = NativeStackScreenProps<any, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { signIn, signInWithOAuth, supabaseReady } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'apple' | null>(null);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing Fields', 'Please enter both email and password.');
      return;
    }
    setSubmitting(true);
    try {
      await signIn(email, password);
    } catch (err: any) {
      Alert.alert('Login Failed', err?.message ?? 'Invalid email or password.');
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
        `${provider === 'google' ? 'Google' : 'Apple'} Sign-In`,
        err?.message ?? 'Could not complete sign-in.'
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
        <View style={styles.brandBox}>
          <Text style={styles.logoEmoji}>🩸</Text>
          <Text style={styles.brandTitle}>FIND THE DONOR</Text>
          <Text style={styles.brandSubtitle}>
            Centralized Blood Donation Platform
          </Text>
        </View>

        {!supabaseReady && (
          <View style={styles.warningBox}>
            <Text style={styles.warningTitle}>Supabase Setup Needed</Text>
            <Text style={styles.warningText}>
              Copy .env.example to .env and add your Supabase URL and Anon Key
              to enable login and live database sync.
            </Text>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.heading}>Welcome Back</Text>
          <Text style={styles.subheading}>Sign in to continue</Text>

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
          <View style={styles.passwordWrap}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter your password"
              placeholderTextColor={COLORS.textLight}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setShowPassword((prev) => !prev)}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={COLORS.textLight}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.forgotRow}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryBtn, submitting && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={submitting || oauthLoading !== null}
          >
            {submitting ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.primaryBtnText}>Log In</Text>
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
                <Text style={styles.googleBtnText}>Continue with Google (Gmail)</Text>
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
                <Text style={styles.appleBtnText}>Continue with Apple</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don&apos;t have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.linkText}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.bg },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  brandBox: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoEmoji: { fontSize: 44, marginBottom: 4 },
  brandTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1.2,
  },
  brandSubtitle: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 4,
  },
  warningBox: {
    backgroundColor: COLORS.warningLight,
    borderColor: COLORS.warning,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  warningTitle: {
    fontWeight: '700',
    color: '#92400e',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 12,
    color: '#92400e',
    lineHeight: 18,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
  },
  subheading: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 14,
    marginTop: 2,
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
  passwordWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    backgroundColor: COLORS.bg,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
  },
  eyeBtn: {
    paddingHorizontal: 12,
  },
  forgotRow: {
    alignSelf: 'flex-end',
    marginTop: 10,
  },
  forgotText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 28,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  btnDisabled: { opacity: 0.7 },
  primaryBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textLight,
  },
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
  googleBtnText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  appleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#000000',
    borderRadius: 28,
    paddingVertical: 13,
  },
  appleBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
  },
  footerText: { color: COLORS.textLight, fontSize: 14 },
  linkText: { color: COLORS.primary, fontWeight: '700', fontSize: 14 },
});
