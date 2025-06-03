// File: app/profile/edit.tsx

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function EditProfileMenu() {
  const isDark = useColorScheme() === 'dark';
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkBg]}>
      {/* Top Section */}
      <View style={[styles.topSection, isDark && styles.topSectionDark]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={isDark ? '#FFF' : '#000'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDark && styles.textLight]}>
          Edit Profile
        </Text>
      </View>

      {/* Options Card */}
      <View style={[styles.card, isDark && styles.cardDark]}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/profile/basic')}
        >
          <Ionicons name="person-outline" size={24} color={isDark ? '#FFF' : '#6B8E23'} />
          <Text style={[styles.menuText, isDark && styles.textLight]}>
            Basic Info
          </Text>
          <Ionicons name="chevron-forward" size={20} color={isDark ? '#FFF' : '#888'} />
        </TouchableOpacity>
        <View style={[styles.divider, isDark && styles.dividerDark]} />

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/profile/goals')}
        >
          <Ionicons name="barbell-outline" size={24} color={isDark ? '#FFF' : '#6B8E23'} />
          <Text style={[styles.menuText, isDark && styles.textLight]}>
            Health Goals
          </Text>
          <Ionicons name="chevron-forward" size={20} color={isDark ? '#FFF' : '#888'} />
        </TouchableOpacity>
        <View style={[styles.divider, isDark && styles.dividerDark]} />

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/profile/dietary')}
        >
          <Ionicons name="restaurant-outline" size={24} color={isDark ? '#FFF' : '#6B8E23'} />
          <Text style={[styles.menuText, isDark && styles.textLight]}>
            Dietary Preferences
          </Text>
          <Ionicons name="chevron-forward" size={20} color={isDark ? '#FFF' : '#888'} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8CC63F',
  },
  darkBg: {
    backgroundColor: '#121212',
  },

  topSection: {
    backgroundColor: '#FCEE21',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
  },
  topSectionDark: {
    backgroundColor: '#2A2A2A',
  },
  backBtn: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },

  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    margin: 20,
    elevation: 5,
  },
  cardDark: {
    backgroundColor: '#1E1E1E',
    elevation: 0,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
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
  },
  dividerDark: {
    backgroundColor: '#333',
  },

  textLight: {
    color: '#FFF',
  },
});
