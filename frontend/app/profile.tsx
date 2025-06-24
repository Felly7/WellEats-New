// File: app/profile.tsx

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { getUserData } from '@/services/api';

type BasicInfo = { fullName: string /*…*/ };
type HealthGoals = { goalType: string /*…*/ };
type DietaryPreferences = { restrictions: string[] /*…*/ };

type UserInfo = {
  email: string;
  username: string;
  basicInfo?: BasicInfo;
  healthGoals?: HealthGoals;
  dietaryPreferences?: DietaryPreferences;
};

const menuItems = [
  {
    title: 'Basic Info',
    icon: 'person-outline',
    route: '/profile/basic',
    subtitle: (u: UserInfo) =>
      u.basicInfo?.fullName ?? 'Set up basic info',
  },
  {
    title: 'Health Goals',
    icon: 'barbell-outline',
    route: '/profile/goals',
    subtitle: (u: UserInfo) =>
      u.healthGoals?.goalType ?? 'Set up health goals',
  },
  {
    title: 'Dietary Preferences',
    icon: 'restaurant-outline',
    route: '/profile/dietary',
    subtitle: (u: UserInfo) =>
      u.dietaryPreferences?.restrictions.join(', ') ??
      'Set up dietary preferences',
  },
];

export default function ProfileScreen() {
  const isDark = useColorScheme() === 'dark';
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    setLoading(true);
    try {
      const userId = await SecureStore.getItemAsync('userId');
      if (!userId) throw new Error('Not logged in');
      const resp = await getUserData(userId);
      setUser({
        email: resp.email,
        username: resp.username,
        basicInfo: resp.basicInfo,
        healthGoals: resp.healthGoals,
        dietaryPreferences: resp.dietaryPreferences,
      });
    } catch (e) {
      console.warn('Failed to load user:', e);
      Alert.alert('Error', 'Could not load profile data.');
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
            await SecureStore.deleteItemAsync('userId');
            router.replace('/login');
          },
        },
      ],
      { cancelable: false }
    );
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, isDark && styles.darkContainer]}
      >
        <ActivityIndicator
          size="large"
          color={isDark ? '#FFF' : '#000'}
          style={{ marginTop: 200 }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, isDark && styles.darkContainer]}
    >
      {/* Page Heading */}
      <View style={styles.titleContainer}>
        <Text
          style={[
            styles.pageTitle,
            isDark && styles.pageTitleDark,
          ]}
        >
          Profile
        </Text>
      </View>

      <FlatList
        data={menuItems}
        keyExtractor={(it) => it.title}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => (
          <View
            style={[
              styles.divider,
              isDark && styles.dividerDark,
            ]}
          />
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.menuItem,
              isDark && styles.menuItemDark,
            ]}
            onPress={() => router.push(item.route as any)}
          >
            <Ionicons
              name={item.icon as any}
              size={22}
              color={isDark ? '#FFF' : '#6B8E23'}
            />
            <View style={styles.textContainer}>
              <Text
                style={[
                  styles.menuText,
                  isDark && styles.textDark,
                ]}
              >
                {item.title}
              </Text>
              <Text
                style={[
                  styles.subtitle,
                  isDark && styles.subtitleDark,
                ]}
              >
                {user ? item.subtitle(user) : ''}
              </Text>
            </View>
            <MaterialIcons
              name="keyboard-arrow-right"
              size={24}
              color={isDark ? '#FFF' : '#888'}
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

  // Heading
  titleContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  pageTitleDark: {
    color: '#FFF',
  },

  // Push list down a bit
  listContent: {
    paddingTop: 20,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuItemDark: {},

  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  textDark: {
    color: '#FFF',
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  subtitleDark: {
    color: '#AAA',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEE',
    marginHorizontal: 16,
  },
  dividerDark: {
    backgroundColor: '#333',
  },
  logoutButton: {
    padding: 16,
    alignItems: 'center',
  },
  logoutText: {
    color: '#D62828',
    fontWeight: '600',
  },
});
