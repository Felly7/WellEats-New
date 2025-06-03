// File: app/profile/dietary.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

// Define the types here or import them from the correct file if available
type DietaryPreferences = {
  restrictions: string[];
  allergies: string[];
  preferredCuisines: string[];
};

type UserInfo = {
  dietaryPreferences?: DietaryPreferences;
  // add other user info fields if needed
};

const USER_INFO_KEY = 'userInfo';

export default function DietaryPreferencesScreen() {
  const isDark = useColorScheme() === 'dark';
  const router = useRouter();

  const [restrictionsText, setRestrictionsText] = useState(''); // comma-separated
  const [allergiesText, setAllergiesText] = useState('');
  const [preferredCuisinesText, setPreferredCuisinesText] = useState('');

  // Load existing DietaryPreferences
  useEffect(() => {
    (async () => {
      try {
        const json = await AsyncStorage.getItem(USER_INFO_KEY);
        if (json) {
          const info: UserInfo = JSON.parse(json);
          if (info.dietaryPreferences) {
            setRestrictionsText(
              info.dietaryPreferences.restrictions.join(', ')
            );
            setAllergiesText(info.dietaryPreferences.allergies.join(', '));
            setPreferredCuisinesText(
              info.dietaryPreferences.preferredCuisines.join(', ')
            );
          }
        }
      } catch (e) {
        console.warn('Failed to load DietaryPreferences:', e);
      }
    })();
  }, []);

  const onSave = async () => {
    // Split on commas and trim whitespace, filter out empty
    const restrictions = restrictionsText
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    const allergies = allergiesText
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    const preferredCuisines = preferredCuisinesText
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const dietaryPreferences: DietaryPreferences = {
      restrictions,
      allergies,
      preferredCuisines,
    };

    try {
      await AsyncStorage.mergeItem(
        USER_INFO_KEY,
        JSON.stringify({ dietaryPreferences })
      );
      Alert.alert('Saved', 'Dietary Preferences updated.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e) {
      console.warn('Failed to save DietaryPreferences:', e);
      Alert.alert('Error', 'Could not save. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      style={[styles.container, isDark && styles.darkBg]}
    >
      <SafeAreaView />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 40 }}
      >
        <Text style={[styles.label, isDark && styles.textLight]}>
          Dietary Restrictions (comma-separated)
        </Text>
        <TextInput
          value={restrictionsText}
          onChangeText={setRestrictionsText}
          style={[styles.input, isDark && styles.inputDark]}
          placeholder="e.g. Vegetarian, Gluten-Free"
          placeholderTextColor={isDark ? '#888' : '#AAA'}
        />

        <Text style={[styles.label, isDark && styles.textLight]}>
          Allergies (comma-separated)
        </Text>
        <TextInput
          value={allergiesText}
          onChangeText={setAllergiesText}
          style={[styles.input, isDark && styles.inputDark]}
          placeholder="e.g. Peanuts, Shellfish"
          placeholderTextColor={isDark ? '#888' : '#AAA'}
        />

        <Text style={[styles.label, isDark && styles.textLight]}>
          Preferred Cuisines (comma-separated)
        </Text>
        <TextInput
          value={preferredCuisinesText}
          onChangeText={setPreferredCuisinesText}
          style={[styles.input, isDark && styles.inputDark]}
          placeholder="e.g. Ghanaian, Italian"
          placeholderTextColor={isDark ? '#888' : '#AAA'}
        />

        <TouchableOpacity
          style={[styles.saveButton, isDark && styles.saveButtonDark]}
          onPress={onSave}
        >
          <Text style={styles.saveButtonText}>
            Save Dietary Preferences
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  darkBg: {
    backgroundColor: '#121212',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    color: '#000',
    backgroundColor: '#FFF',
  },
  inputDark: {
    backgroundColor: '#1E1E1E',
    borderColor: '#333',
    color: '#FFF',
  },
  saveButton: {
    backgroundColor: '#6B8E23',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 20,
  },
  saveButtonDark: {
    backgroundColor: '#6B8E23',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  textLight: {
    color: '#FFF',
  },
});
