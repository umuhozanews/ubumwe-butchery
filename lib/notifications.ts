import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from './supabase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotifications(): Promise<string | null> {
  if (Platform.OS === 'web') return null;

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return null;

  try {
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    return token;
  } catch {
    return null;
  }
}

export async function savePushToken(userId: string, token: string) {
  await supabase
    .from('users')
    .update({ push_token: token })
    .eq('id', userId);
}

export function showLocalNotification(title: string, body: string) {
  Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger: null,
  });
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
    body: 'Itumba ryawe ryangirijwe. Wadutumanaheze kuri WhatsApp ufite ikibazo.',
  },
};
