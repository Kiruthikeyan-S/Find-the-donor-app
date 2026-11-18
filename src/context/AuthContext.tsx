import { User } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { isSupabaseConfigured, supabase } from '../config/supabase';

WebBrowser.maybeCompleteAuthSession();

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: 'client' | 'admin';
}

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  supabaseReady: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (username: string, email: string, password: string) => Promise<{ needsEmailConfirmation: boolean }>;
  signInWithOAuth: (provider: 'google' | 'apple') => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function loadProfile(user: User): Promise<UserProfile> {
  const fallback: UserProfile = {
    id: user.id,
    username:
      (user.user_metadata?.username as string | undefined) ??
      (user.user_metadata?.full_name as string | undefined) ??
      user.email?.split('@')[0] ??
      'User',
    email: user.email ?? '',
    role: 'client',
  };

  if (!supabase) return fallback;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, email, role')
      .eq('id', user.id)
      .maybeSingle();

    if (error || !data) return fallback;
    return {
      id: data.id,
      username: data.username ?? fallback.username,
      email: data.email ?? fallback.email,
      role: data.role === 'admin' ? 'admin' : 'client',
    };
  } catch {
    return fallback;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const supabaseReady = isSupabaseConfigured();

  useEffect(() => {
    if (!supabaseReady || !supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        setProfile(await loadProfile(currentUser));
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        setProfile(await loadProfile(currentUser));
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabaseReady]);

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      throw new Error('Supabase is not configured. Add your .env credentials.');
    }
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) throw error;
  };

  const signUp = async (username: string, email: string, password: string) => {
    if (!supabase) {
      throw new Error('Supabase is not configured. Add your .env credentials.');
    }
    const cleanUsername = username.trim();
    const cleanEmail = email.trim();
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: { username: cleanUsername },
      },
    });
    if (error) throw error;

    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        username: cleanUsername,
        email: cleanEmail,
        role: 'client',
      });
      if (data.session) {
        setProfile({
          id: data.user.id,
          username: cleanUsername,
          email: cleanEmail,
          role: 'client',
        });
      }
    }
    return { needsEmailConfirmation: !data.session };
  };

  const signInWithOAuth = async (provider: 'google' | 'apple') => {
    if (!supabase) {
      throw new Error('Supabase is not configured. Add your .env credentials.');
    }

    const redirectTo = Linking.createURL('auth/callback', {
      scheme: 'findthedonor',
    });

    if (Platform.OS === 'web') {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo },
      });
      if (error) throw error;
      return;
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    });
    if (error) throw error;
    if (!data?.url) throw new Error('Could not start OAuth sign-in.');

    const res = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (res.type === 'success' && res.url) {
      const parsed = Linking.parse(res.url);
      const code = parsed.queryParams?.code as string | undefined;
      if (code) {
        const { error: exchangeErr } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeErr) throw exchangeErr;
        return;
      }

      const hashPart = res.url.split('#')[1];
      if (hashPart) {
        const params = new URLSearchParams(hashPart);
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');
        if (access_token && refresh_token) {
          const { error: sessionErr } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          if (sessionErr) throw sessionErr;
        }
      }
    }
  };

  const resetPassword = async (email: string) => {
    if (!supabase) {
      throw new Error('Supabase is not configured. Add your .env credentials.');
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
    if (error) throw error;
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        supabaseReady,
        signIn,
        signUp,
        signInWithOAuth,
        resetPassword,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
