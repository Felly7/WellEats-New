import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  useColorScheme,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

const menuItems = [
  { title: 'User Profile', icon: 'person-outline', route: '/profile' },
  { title: 'History', icon: 'book-outline', route: '/history' },
  { title: 'Security & Privacy', icon: 'shield-checkmark-outline', route: '/security' },
  { title: 'Notifications', icon: 'notifications-outline', route: '/notifications' },
  { title: 'Need help?', icon: 'help-circle-outline', route: '/help' },
  { title: 'Sign out', icon: 'log-out-outline', route: 'logout' },
];

export default function ProfileScreen() {
  const isDarkMode = useColorScheme() === 'dark';

  const handleLogout = async () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            await SecureStore.deleteItemAsync('USER_TOKEN');
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

  const containerStyles = [styles.container, isDarkMode && styles.darkContainer];
  const headerStyles = [styles.header, isDarkMode && styles.darkHeader];
  const titleStyles = [styles.title, isDarkMode && styles.titleDark];
  const profileNameStyles = [styles.profileName, isDarkMode && styles.textDark];

  return (
    <View style={containerStyles}>
      {/* Header */}
      <View style={headerStyles}>
        <Text style={titleStyles}>My Profile</Text>
      </View>

      {/* Profile Info */}
      <View style={styles.profileSection}>
        <Image
          style={styles.profileImage}
          source={require('../../assets/images/profile.jpg')}
        />
        <Text style={profileNameStyles}>Username</Text>
      </View>

      {/* Menu */}
      <FlatList
        data={menuItems}
        keyExtractor={(item) => item.title}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.menuItem, isDarkMode && styles.menuItemDark]}
            onPress={() => onPressItem(item.route)}
          >
            <Ionicons
              name={item.icon}
              size={22}
              color={isDarkMode ? '#FFF' : '#5A4A42'}
            />
            <Text style={[styles.menuText, isDarkMode && styles.textDark]}>
              {item.title}
            </Text>
            <MaterialIcons
              name="keyboard-arrow-right"
              size={24}
              color={isDarkMode ? '#FFF' : '#5A4A42'}
            />
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
  registerText: {
    color: '#1E90FF',
  },
});
