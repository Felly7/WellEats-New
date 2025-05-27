import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  requestNotificationPermission,
  scheduleDailyNotifications,
  cancelScheduledNotifications,
  getScheduledNotifications,
  sendTestNotification,
} from '../../src/services/notification';

export default function NotificationSettingsScreen() {
  const [enabled, setEnabled] = useState<boolean>(false);
  const [scheduled, setScheduled] = useState<Notifications.ScheduledNotificationResponse[]>([]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;

  // Fade-in effect on mount
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [fadeAnim]);

  // Load initial permission & schedules
  useEffect(() => {
    (async () => {
      const granted = await requestNotificationPermission();
      setEnabled(granted);
      const notifs = await getScheduledNotifications();
      setScheduled(notifs);
    })();
  }, []);

  // Slide-down or up the scheduled section
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: enabled ? 0 : -100,
      duration: 400,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [enabled, slideAnim]);

  const toggleSwitch = useCallback(async (value: boolean) => {
    if (value) {
      try {
        await scheduleDailyNotifications();
        const notifs = await getScheduledNotifications();
        setScheduled(notifs);
        setEnabled(true);
      } catch (e) {
        Alert.alert('Error', 'Cannot schedule notifications. Check permissions.');
        setEnabled(false);
      }
    } else {
      await cancelScheduledNotifications();
      setScheduled([]);
      setEnabled(false);
    }
  }, []);

  const renderTime = useCallback(({ item }: { item: Notifications.ScheduledNotificationResponse }) => {
    const { hour, minute } = item.trigger as any;
    const hh = String(hour).padStart(2, '0');
    const mm = String(minute).padStart(2, '0');
    return (
      <View style={styles.timeRow}>
        <Ionicons name="alarm-outline" size={24} color="#6B8E23" />
        <Text style={styles.timeText}>{`${hh}:${mm}`}</Text>
      </View>
    );
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>        
        <View style={styles.header}>
          <Ionicons name="notifications-outline" size={28} color="#6B8E23" />
          <Text style={styles.headerTitle}>Notifications</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Push Notifications</Text>
          <Switch value={enabled} onValueChange={toggleSwitch} trackColor={{ true: '#6B8E23' }} />
        </View>

        <Animated.View style={[styles.scheduledContainer, { transform: [{ translateY: slideAnim }] }]}>          
          <Text style={styles.sectionTitle}>Scheduled Times</Text>
          <FlatList
            data={scheduled}
            keyExtractor={item => item.identifier}
            renderItem={renderTime}
            style={styles.list}
          />

          <TouchableOpacity
            style={styles.testButton}
            onPress={() => sendTestNotification().then(() => Alert.alert('Test notification sent!'))}
          >
            <Text style={styles.testButtonText}>Send Test Notification</Text>
          </TouchableOpacity>        
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FDFFF7' },
  container: { flex: 1, padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', marginLeft: 8 },

  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  label: { fontSize: 18 },

  scheduledContainer: { overflow: 'hidden' },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  list: { marginBottom: 24, maxHeight: 150 },

  timeRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  timeText: { fontSize: 16, marginLeft: 12 },

  testButton: { backgroundColor: '#6B8E23', padding: 12, borderRadius: 8, alignItems: 'center' },
  testButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});