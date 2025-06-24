import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

export default function HealthAdminSettingsScreen() {
  const router = useRouter();
  const isDarkMode = useColorScheme() === 'dark';
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [defaultDiet, setDefaultDiet] = useState('Balanced');
  const [recommendationThreshold, setRecommendationThreshold] = useState('75');

  const backgroundColor = isDarkMode ? '#121212' : '#ffffff';
  const textColor = isDarkMode ? '#ffffff' : '#000000';
  const inputBg = isDarkMode ? '#1e1e1e' : '#f2f2f2';

  const handleSaveDefaults = () => {
    // TODO: persist settings
  };

  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            await SecureStore.deleteItemAsync('userId');
            router.replace('/login');
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>      
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: textColor }]}>Admin Settings</Text>

        {/* Notifications */}
        <View style={styles.row}>
          <Text style={[styles.label, { color: textColor }]}>App Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={notificationsEnabled ? '#f5dd4b' : '#f4f3f4'}
          />
        </View>

        {/* Default Diet */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: textColor }]}>Default Diet Plan</Text>
          <TextInput
            style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
            value={defaultDiet}
            onChangeText={setDefaultDiet}
            placeholder="e.g., Vegan, Keto, Balanced"
            placeholderTextColor={isDarkMode ? '#888' : '#666'}
          />
        </View>

        {/* Recommendation Threshold */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: textColor }]}>Recommendation Confidence (%)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
            value={recommendationThreshold}
            onChangeText={setRecommendationThreshold}
            keyboardType="numeric"
          />
        </View>

        {/* Save Defaults */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#007aff' }]}
          onPress={handleSaveDefaults}
        >
          <Text style={styles.buttonText}>Save Defaults</Text>
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
        >
          <Ionicons name="exit-outline" size={20} color="#fff" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  label: { fontSize: 18 },
  section: { marginBottom: 20 },
  input: { padding: 12, borderRadius: 8, fontSize: 16 },
  button: { padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 20 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '500' },
  logoutBtn: { flexDirection: 'row', backgroundColor: '#ff3b30', padding: 15, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: '500', marginLeft: 8 },
});
