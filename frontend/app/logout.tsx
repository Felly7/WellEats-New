// LogoutButton.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/context/AuthContext'; 

const Logout = () => {
  const router = useRouter();
  // pull logout() from context
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      // clears both in-memory and persisted token
      await logout();
      console.log('✅ [logout] token cleared');

      // send user back to login
      router.replace('login');
    } catch (err) {
      console.error('❌ [logout] error:', err);
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
