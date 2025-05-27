import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIF_IDS_KEY = 'NOTIFICATION_IDS';

// Set default notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request push notification permissions
 * @returns boolean indicating if granted
 */
export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  return finalStatus === 'granted';
}

/**
 * Schedule three daily meal suggestion notifications
 */
export async function scheduleDailyNotifications(): Promise<void> {
  const granted = await requestNotificationPermission();
  if (!granted) throw new Error('Notification permissions not granted');

  await cancelScheduledNotifications();

  const times = [
    { hour: 8, minute: 0 },
    { hour: 12, minute: 0 },
    { hour: 18, minute: 0 },
  ];

  const ids: string[] = [];
  for (const t of times) {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Meal Suggestion 🍽',
        body: "Tap to view today's recommended healthy meal!",
        data: { feature: 'meal-suggestion' },
      },
      trigger: { type: 'calendar', hour: t.hour, minute: t.minute, repeats: true },
    });
    ids.push(id);
  }

  await AsyncStorage.setItem(NOTIF_IDS_KEY, JSON.stringify(ids));
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelScheduledNotifications(): Promise<void> {
  const json = await AsyncStorage.getItem(NOTIF_IDS_KEY);
  const ids: string[] = json ? JSON.parse(json) : [];
  for (const id of ids) {
    await Notifications.cancelScheduledNotificationAsync(id);
  }
  await AsyncStorage.removeItem(NOTIF_IDS_KEY);
}

/**
 * Get all scheduled notifications for preview
 */
export async function getScheduledNotifications(): Promise<Notifications.ScheduledNotificationResponse[]> {
  return Notifications.getAllScheduledNotificationsAsync();
}

/**
 * Send a test notification in 5 seconds
 */
export async function sendTestNotification(): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Test Meal Notification',
      body: 'This is a test. Tap to view a meal suggestion!',
    },
    trigger: { type: 'timeInterval', seconds: 5 },
  });
}