// File: app/profile.tsx

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  useColorScheme,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';

type BasicInfo = {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  heightCm: string;
  weightKg: string;
};
type HealthGoals = {
  goalType: 'Lose' | 'Maintain' | 'Gain';
  targetWeightKg: string;
  activityLevel: 'Low' | 'Moderate' | 'High';
};
type DietaryPreferences = {
  restrictions: string[];
  allergies: string[];
  preferredCuisines: string[];
};

type UserInfo = {
  email: string;
  username: string;
  basicInfo?: BasicInfo;
  healthGoals?: HealthGoals;
  dietaryPreferences?: DietaryPreferences;
};

const USER_INFO_KEY = 'userInfo';

// Menu items that navigate to sub-screens
const menuItems = [
  {
    title: 'Basic Info',
    icon: 'person-outline',
    route: '/profile/basic',
    subtitleKey: (u: UserInfo) =>
      u.basicInfo ? u.basicInfo.fullName : 'Set up basic info',
  },
  {
    title: 'Health Goals',
    icon: 'barbell-outline',
    route: '/profile/goals',
    subtitleKey: (u: UserInfo) =>
      u.healthGoals ? u.healthGoals.goalType : 'Set up health goals',
  },
  {
    title: 'Dietary Preferences',
    icon: 'restaurant-outline',
    route: '/profile/dietary',
    subtitleKey: (u: UserInfo) =>
      u.dietaryPreferences
        ? u.dietaryPreferences.restrictions.join(', ')
        : 'Set up dietary preferences',
  },
];

export default function ProfileScreen() {
  const isDarkMode = useColorScheme() === 'dark';
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [user, setUser]       = useState<UserInfo | null>(null);

  const loadUser = useCallback(async () => {
    setLoading(true);
    try {
      const json = await AsyncStorage.getItem(USER_INFO_KEY);
      if (json) setUser(JSON.parse(json));
    } catch (e) {
      console.warn('Failed to load user info:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useFocusEffect(
    useCallback(() => {
      loadUser();
    }, [loadUser])
  );

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            await AsyncStorage.removeItem('USER_TOKEN');
            router.replace('/login');
          },
        },
      ],
      { cancelable: false }
    );
  };

  const onPressItem = (route: string) => {
    router.push(route);
  };

  if (loading || !user) {
    return (
      <SafeAreaView
        style={[styles.darkContainer, isDarkMode && styles.darkContainer]}
      >
        <ActivityIndicator
          size="large"
          color={isDarkMode ? '#FFF' : '#000'}
          style={{ marginTop: 200 }}
        />
      </SafeAreaView>
    );
  }

  const containerStyles = [styles.container, isDarkMode && styles.darkContainer];
  const headerStyles = [styles.header, isDarkMode && styles.darkHeader];
  const titleStyles = [styles.title, isDarkMode && styles.titleDark];
  const profileNameStyles = [styles.profileName, isDarkMode && styles.textDark];
  const subtitleStyles = [styles.subtitle, isDarkMode && styles.subtitleDark];

  return (
    <SafeAreaView style={containerStyles}>

      {/* Profile Info */}
      <View style={styles.profileSection}>
         <Ionicons name="person-circle" size={80} color="#1E90FF" />
        <Text style={profileNameStyles}>{user.username}</Text>
                <Text style={[styles.email, isDarkMode && styles.textLight]}>
          {user.email}
        </Text>
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
              name={item.icon as any}
              size={22}
              color={isDarkMode ? '#FFF' : '#5A4A42'}
            />
            <View style={styles.textContainer}>
              <Text style={[styles.menuText, isDarkMode && styles.textDark]}>
                {item.title}
              </Text>
              <Text style={subtitleStyles}>{item.subtitleKey(user)}</Text>
            </View>
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
  textContainer: {
    flex: 1,
    marginLeft: 10,
  },
  menuText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  subtitleDark: {
    color: '#AAA',
  },
    email: {
    fontSize: 14,
    color: '#555',
    marginVertical: 4,
  },
    textLight: {
    color: '#FFF',
  },
});
