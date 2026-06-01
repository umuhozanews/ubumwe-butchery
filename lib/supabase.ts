import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const supabaseUrl  = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

function getStorage() {
  if (Platform.OS !== 'web') {
    return {
      getItem:    (key: string) => SecureStore.getItemAsync(key),
      setItem:    (key: string, value: string) => SecureStore.setItemAsync(key, value),
      removeItem: (key: string) => SecureStore.deleteItemAsync(key),
    };
  }
  if (typeof localStorage !== 'undefined') {
    return {
      getItem:    (key: string) => Promise.resolve(localStorage.getItem(key)),
      setItem:    (key: string, value: string) => { localStorage.setItem(key, value); return Promise.resolve(undefined); },
      removeItem: (key: string) => { localStorage.removeItem(key); return Promise.resolve(undefined); },
    };
  }
  // SSR / Node.js context — no persistent storage available
  return {
    getItem:    (_key: string) => Promise.resolve(null),
    setItem:    (_key: string, _value: string) => Promise.resolve(undefined),
    removeItem: (_key: string) => Promise.resolve(undefined),
  };
}

export const supabase = createClient(supabaseUrl, supabaseAnon, {
  auth: {
    storage: getStorage(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
