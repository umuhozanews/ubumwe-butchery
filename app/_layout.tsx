import { Stack, useRouter, useSegments } from 'expo-router';
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';

SplashScreen.preventAutoHideAsync();

function AuthGate() {
  const { session, profile, isLoading, loadSession, setSession, pendingRoute, setPendingRoute } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const notifListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => { loadSession(); }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Notification tap handler — navigate to tracking
  useEffect(() => {
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const orderId = response.notification.request.content.data?.orderId as string | undefined;
      if (orderId) {
        router.push({ pathname: '/tracking', params: { orderId } } as any);
      }
    });
    return () => {
      responseListener.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuth  = segments[0] === 'auth';
    const inAdmin = segments[0] === 'admin';

    if (session) {
      if (inAuth) {
        if (profile?.role === 'admin') {
          router.replace('/admin');
        } else if (pendingRoute) {
          const dest = pendingRoute;
          setPendingRoute(null);
          router.replace(dest as any);
        } else {
          router.replace('/');
        }
      }
      if (inAdmin && profile?.role !== 'admin') {
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
