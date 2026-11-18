import { User } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../config/supabase';

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
  signUp: (username: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function loadProfile(user: User): Promise<UserProfile> {
  const fallback: UserProfile = {
    id: user.id,
    username:
      (user.user_metadata?.username as string | undefined) ??
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
      setProfile({
        id: data.user.id,
        username: cleanUsername,
        email: cleanEmail,
        role: 'client',
      });
    }
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, supabaseReady, signIn, signUp, signOut }}
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
