// File: app/profile/edit.tsx

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function EditProfileMenu() {
  const isDark = useColorScheme() === 'dark';
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.safeArea, isDark && styles.safeAreaDark]}>
      <View style={styles.container}>
        {/* Options Card */}
        <View style={[styles.card, isDark && styles.cardDark]}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/profile/basic')}
          >
            <Ionicons
              name="person-outline"
              size={24}
              color={isDark ? '#FFF' : '#6B8E23'}
            />
            <Text style={[styles.menuText, isDark && styles.textLight]}>
              Basic Info
            </Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={isDark ? '#FFF' : '#888'}
            />
          </TouchableOpacity>

          <View style={[styles.divider, isDark && styles.dividerDark]} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/profile/goals')}
          >
            <Ionicons
              name="barbell-outline"
              size={24}
              color={isDark ? '#FFF' : '#6B8E23'}
            />
            <Text style={[styles.menuText, isDark && styles.textLight]}>
              Health Goals
            </Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={isDark ? '#FFF' : '#888'}
            />
          </TouchableOpacity>

          <View style={[styles.divider, isDark && styles.dividerDark]} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/profile/dietary')}
          >
            <Ionicons
              name="restaurant-outline"
              size={24}
              color={isDark ? '#FFF' : '#6B8E23'}
            />
            <Text style={[styles.menuText, isDark && styles.textLight]}>
              Dietary Preferences
            </Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={isDark ? '#FFF' : '#888'}
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#8CC63F',
  },
  safeAreaDark: {
    backgroundColor: '#121212',
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start',  // card starts below the top
  },

  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    // lift off the screen
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardDark: {
    backgroundColor: '#1E1E1E',
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },

  divider: {
    height: 1,
    backgroundColor: '#EEE',
    marginHorizontal: 16,
  },
  dividerDark: {
    backgroundColor: '#333',
  },

  textLight: {
    color: '#FFF',
  },
});
