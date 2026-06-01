import Constants from 'expo-constants';
import { Platform } from 'react-native';

// expo-notifications push token registration was removed from Expo Go in SDK 53.
// We lazy-require the module only in real device builds to avoid the crash.
const IS_EXPO_GO = Constants.appOwnership === 'expo';

type Notifs = typeof import('expo-notifications');

function getNotifs(): Notifs | null {
  if (IS_EXPO_GO || Platform.OS === 'web') return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const N = require('expo-notifications') as Notifs;
    return N;
  } catch {
    return null;
  }
}

export function initNotifications() {
  const N = getNotifs();
  if (!N) return;
  N.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function registerForPushNotifications(): Promise<string | null> {
  const N = getNotifs();
  if (!N) return null;

  const { status: existing } = await N.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await N.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return null;

  try {
    const token = (await N.getExpoPushTokenAsync()).data;
    return token;
  } catch {
    return null;
  }
}

export async function savePushToken(userId: string, token: string) {
  const { supabase } = await import('./supabase');
  await supabase.from('users').update({ push_token: token }).eq('id', userId);
}

export function showLocalNotification(title: string, body: string) {
  const N = getNotifs();
  if (!N) return;
  N.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger: null,
  });
}

export function addNotificationResponseListener(
  cb: (orderId: string) => void,
): (() => void) | null {
  const N = getNotifs();
  if (!N) return null;
  const sub = N.addNotificationResponseReceivedListener((response) => {
    const orderId = response.notification.request.content.data?.orderId as string | undefined;
    if (orderId) cb(orderId);
  });
  return () => sub.remove();
}

export const ORDER_STATUS_MESSAGES = {
  approved: {
    title: 'Itumba Ryemejwe! ✅',
    body: 'Itumba ryawe ryemejwe. Tuzaribatwara vuba!',
  },
  delivered: {
    title: 'Itumba Ryatanzwe! 🎉',
    body: 'Itumba ryawe ryatanzwe neza. Murakoze guhitamo UBUMWE BUTCHERY!',
  },
  cancelled: {
    title: 'Itumba Ryangirijwe ❌',
    body: 'Itumba ryawe ryangirijwe. Wadutumanaheze kuri WhatsApp.',
  },
};
