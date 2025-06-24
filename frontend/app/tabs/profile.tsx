// File: app/profile.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  useColorScheme,
  SafeAreaView,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { getUserData } from '@/services/api';

const USER_INFO_KEY = 'userInfo';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const menuItems = [
  { title: 'User Profile', icon: 'person-outline', route: '/profile' },
  { title: 'History', icon: 'book-outline', route: '/history' },
  { title: 'Security & Privacy', icon: 'shield-checkmark-outline', route: '/security' },
  { title: 'Notifications', icon: 'notifications-outline', route: '/notifications' },
  { title: 'Need help?', icon: 'help-circle-outline', route: '/help' },
  { title: 'Sign out', icon: 'log-out-outline', route: '/logout' },
];

export default function ProfileScreen() {
  const isDarkMode = useColorScheme() === 'dark';
  const [user, setUser] = useState({ name: '', email: '' });
  const [confirmVisible, setConfirmVisible] = useState(false);

  // Load username from AsyncStorage on mount
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = await SecureStore.getItemAsync('userId');
        if (!token) throw new Error('No auth token found');

        const response = await getUserData(token);
        console.log('Fetched user details:', response);

        setUser({
          name: response.fullName || response.username, // prioritize full name
          email: response.email,
        });
      } catch (error) {
        console.warn('Failed to fetch user details:', error);
        Alert.alert(
          'Error',
          'Unable to load user details. Please try again later.'
        );
      } 
    };

    fetchUserDetails();
  }, []);
  // Show overlay instead of default Alert
  const handleLogout = () => {
    setConfirmVisible(true);
  };

  // Actual sign‐out: clear token & navigate away
  const doSignOut = async () => {
    await SecureStore.deleteItemAsync('userId');
    setConfirmVisible(false);
    router.replace('/login');
  };

  // Menu item taps
  const onPressItem = (route: string) => {
    if (route === '/logout') {
      handleLogout();
    } else {
      router.push(route);
    }
  };

  // Styles toggling
  const containerStyles = [styles.container, isDarkMode && styles.darkContainer];
  const headerStyles = [styles.header, isDarkMode && styles.darkHeader];
  const titleStyles = [styles.title, isDarkMode && styles.titleDark];
  const profileNameStyles = [styles.profileName, isDarkMode && styles.textDark];
  const menuItemStyles = [styles.menuItem, isDarkMode && styles.menuItemDark];
  const menuTextStyles = [styles.menuText, isDarkMode && styles.textDark];

  return (
    <SafeAreaView style={containerStyles}>
      {/* Header */}
      <View style={headerStyles}>
        <Text style={titleStyles}>Settings</Text>
      </View>

      {/* Profile Info */}
      <View style={styles.profileSection}>
        <Image
          style={styles.profileImage}
          source={require('../../assets/images/profile.jpg')}
        />
        <Text style={profileNameStyles}>{user.name}</Text>
      </View>

      {/* Floating Confirmation Overlay */}
      {confirmVisible && (
        <View style={styles.overlayContainer}>
          <View style={styles.confirmCard}>
            <Text style={styles.confirmText}>
              Are you sure you want to log out?
            </Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.signOutButton}
                onPress={doSignOut}
              >
                <Text style={styles.signOutButtonText}>Sign Out</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setConfirmVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Menu List */}
      <FlatList
        data={menuItems}
        keyExtractor={(item) => item.title}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={menuItemStyles}
            onPress={() => onPressItem(item.route)}
          >
            <Ionicons
              name={item.icon}
              size={22}
              color={isDarkMode ? '#FFF' : '#5A4A42'}
            />
            <Text style={menuTextStyles}>{item.title}</Text>
            <MaterialIcons
              name="keyboard-arrow-right"
              size={24}
              color={isDarkMode ? '#FFF' : '#5A4A42'}
            />
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // === Container & Header ===
  container: {
    flex: 1,
    backgroundColor: '#FDFFF7',
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: 'center',
    backgroundColor: '#6B8E23',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  darkHeader: {
    backgroundColor: '#2A2A2A',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
  },
  titleDark: {
    color: '#FFF',
  },

  // === Profile Info ===
  profileSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: '#6B8E23',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginTop: 8,
  },
  textDark: {
    color: '#FFF',
  },

  // === Confirmation Overlay (floating) ===
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: windowWidth,
    height: windowHeight,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10, // ensure it floats on top
  },
  confirmCard: {
    width: '80%',
    backgroundColor: '#FDFFF7',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    textAlign: 'center',
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signOutButton: {
    flex: 1,
    backgroundColor: '#D62828',
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  signOutButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#1E90FF',
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // === Menu Items ===
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#6B8E23',
  },
  menuItemDark: {
    borderBottomColor: '#444',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    marginLeft: 10,
    fontWeight: '500',
  },
});
