// LogoutButton.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const Logout = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // 1. Remove the token (and any other persisted user data)
      await AsyncStorage.removeItem('userToken');
      // e.g. if you stored user info:
      // await AsyncStorage.removeItem('userInfo');

      console.log('✅ [logout] token cleared from storage');

      // 2. Navigate back to login (replace so user can't go “back” into a protected screen)
      router.replace('/login');
    } catch (err) {
      console.error('❌ [logout] error clearing token:', err);
      Alert.alert('Logout failed', 'Please try again.');
    }
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handleLogout}>
      <Text style={styles.text}>Logout</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 12,
    backgroundColor: '#D62828',
    borderRadius: 8,
    alignItems: 'center',
  },
  text: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default Logout;
