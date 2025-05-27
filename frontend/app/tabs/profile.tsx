// app/profile.tsx
import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

// Replace these names with your actual route names (folder/file under /app)
const menuItems = [
  { title: 'User Profile',    icon: 'person-outline',      route: '/profile' },
  { title: 'History',         icon: 'book-outline',        route: '/history' },
  { title: 'Security & Privacy', icon: 'shield-checkmark-outline', route: '/security' },
  { title: 'Notifications',   icon: 'notifications-outline', route: '/notifications' },
  { title: 'Need help?',      icon: 'help-circle-outline', route: '/help' },
  { title: 'Sign out',        icon: 'log-out-outline',     route: 'logout' }, // special-cased
];

export default function ProfileScreen() {
  const handleLogout = async () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            // Remove token
            await SecureStore.deleteItemAsync('USER_TOKEN');
            // Reset the navigation state to the login screen
            router.replace('/login');
          },
        },
      ],
      { cancelable: false }
    );
  };

  const onPressItem = (route: string) => {
    if (route === 'logout') {
      handleLogout();
    } else {
      router.push(route);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Profile</Text>
      </View>

      {/* Profile Info */}
      <View style={styles.profileSection}>
        <Image
          style={styles.profileImage}
          source={require('../../assets/images/profile.jpg')}
        />
        <Text style={styles.profileName}>Username</Text>
      </View>

      {/* Menu */}
      <FlatList
        data={menuItems}
        keyExtractor={(item) => item.title}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => onPressItem(item.route)}
          >
            <Ionicons name={item.icon} size={22} color="#5A4A42" />
            <Text style={styles.menuText}>{item.title}</Text>
            <MaterialIcons name="keyboard-arrow-right" size={24} color="#5A4A42" />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFFF7',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: 'center',
    backgroundColor: '#6B8E23',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
  },
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
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#6B8E23',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    marginLeft: 10,
    fontWeight: '500',
  },
});
