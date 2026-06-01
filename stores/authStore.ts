import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { UserProfile } from '../lib/types';
import { registerForPushNotifications, savePushToken } from '../lib/notifications';

type PendingRoute = { pathname: string; params?: Record<string, string> };

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  pendingRoute: PendingRoute | null;
  setPendingRoute: (route: PendingRoute | null) => void;
  loadSession: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: { email: string; password: string; fullName: string; phone: string }) => Promise<void>;
  signOut: () => Promise<void>;
  setSession: (session: Session | null) => void;
  updateProfile: (updates: Partial<Pick<UserProfile, 'full_name' | 'phone'>>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  return data ?? null;
}

async function registerPushToken(userId: string) {
  const token = await registerForPushNotifications();
  if (token) await savePushToken(userId, token);
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  isLoading: true,
  pendingRoute: null,
  setPendingRoute: (route) => set({ pendingRoute: route }),

  loadSession: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const profile = await fetchProfile(session.user.id);
        set({ session, user: session.user, profile, isLoading: false });
        registerPushToken(session.user.id);
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    const profile = await fetchProfile(data.user.id);
    set({ session: data.session, user: data.user, profile });
    registerPushToken(data.user.id);
  },

  signUp: async ({ email, password, fullName, phone }) => {
    // Sign up the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: undefined },
    });
    if (error) throw error;

    const authUser = data.user;
    if (!authUser) throw new Error('Signup failed — try again.');

    // Insert profile row
    await supabase.from('users').upsert({
      id: authUser.id,
      email,
      phone,
      full_name: fullName,
      role: 'customer',
    });

    // If Supabase returned a session immediately (email confirmation OFF),
    // log the user in right away instead of asking them to confirm.
    if (data.session) {
      const profile = await fetchProfile(authUser.id);
      set({ session: data.session, user: authUser, profile });
      registerPushToken(authUser.id);
    }
    // If no session, email confirmation is still ON in Supabase dashboard.
    // The signup screen will show the "check your email" alert.
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, profile: null });
  },

  setSession: (session) => {
    set({ session, user: session?.user ?? null });
    if (session?.user) {
      const existing = get().profile;
      if (!existing || existing.id !== session.user.id) {
        fetchProfile(session.user.id).then((profile) => {
          if (profile) set({ profile });
        });
      }
    } else {
      set({ profile: null });
    }
  },

  updateProfile: async (updates) => {
    const { user } = get();
    if (!user) return;
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();
    if (error) throw error;
    set({ profile: data });
  },

  refreshProfile: async () => {
    const { user } = get();
    if (!user) return;
    const profile = await fetchProfile(user.id);
    if (profile) set({ profile });
  },
}));
