import { Stack, useRouter, useSegments } from 'expo-router';
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { initNotifications, addNotificationResponseListener } from '../lib/notifications';

SplashScreen.preventAutoHideAsync();

function AuthGate() {
  const { session, profile, isLoading, loadSession, setSession, pendingRoute, setPendingRoute } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const cleanupNotif = useRef<(() => void) | null>(null);

  useEffect(() => { loadSession(); }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Set up notification tap handler (only runs in real builds, not Expo Go)
  useEffect(() => {
    initNotifications();
    cleanupNotif.current = addNotificationResponseListener((orderId) => {
      router.push({ pathname: '/tracking', params: { orderId } } as any);
    });
    return () => {
      cleanupNotif.current?.();
    };
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuth  = segments[0] === 'auth';
    const inAdmin = segments[0] === 'admin';

    if (session) {
      // Wait until profile is loaded before deciding where to send the user
      if (!profile) return;

      if (inAuth) {
        if (profile.role === 'admin') {
          router.replace('/admin');
        } else if (pendingRoute) {
          const dest = pendingRoute;
          setPendingRoute(null);
          router.replace(dest as any);
        } else {
          router.replace('/');
        }
      }
      if (inAdmin && profile.role !== 'admin') {
        router.replace('/');
      }
    }
  }, [session, profile, isLoading, segments]);

  return null;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <>
      <AuthGate />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
