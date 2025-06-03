// File: app/profile/basic.tsx

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

// Define BasicInfo and UserInfo types here if not exported from '../profile'
type BasicInfo = {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  heightCm: string;
  weightKg: string;
};

type UserInfo = {
  basicInfo?: BasicInfo;
  // add other fields if needed
};
// import type { BasicInfo, UserInfo } from '../profile'; // adjust import path if needed

const USER_INFO_KEY = 'userInfo';

export default function BasicInfoScreen() {
  const isDark = useColorScheme() === 'dark';
  const router = useRouter();

  const [fullName, setFullName]   = useState('');
  const [dateOfBirth, setDOB]     = useState('');
  const [gender, setGender]       = useState('');
  const [heightCm, setHeightCm]   = useState('');
  const [weightKg, setWeightKg]   = useState('');

  // Load existing BasicInfo (if any)
  useEffect(() => {
    (async () => {
      try {
        const json = await AsyncStorage.getItem(USER_INFO_KEY);
        if (json) {
          const info: UserInfo = JSON.parse(json);
          if (info.basicInfo) {
            setFullName(info.basicInfo.fullName);
            setDOB(info.basicInfo.dateOfBirth);
            setGender(info.basicInfo.gender);
            setHeightCm(info.basicInfo.heightCm);
            setWeightKg(info.basicInfo.weightKg);
          }
        }
      } catch (e) {
        console.warn('Failed to load BasicInfo:', e);
      }
    })();
  }, []);

  const onSave = async () => {
    if (!fullName.trim() || !dateOfBirth.trim() || !gender.trim()) {
      Alert.alert('Validation', 'Name, Date of Birth, and Gender are required.');
      return;
    }
    const basicInfo: BasicInfo = {
      fullName: fullName.trim(),
      dateOfBirth: dateOfBirth.trim(),
      gender: gender.trim(),
      heightCm: heightCm.trim(),
      weightKg: weightKg.trim(),
    };
    try {
      await AsyncStorage.mergeItem(
        USER_INFO_KEY,
        JSON.stringify({ basicInfo })
      );
      Alert.alert('Saved', 'Basic Info updated.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e) {
      console.warn('Failed to save BasicInfo:', e);
      Alert.alert('Error', 'Could not save. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      style={[styles.container, isDark && styles.darkBg]}
    >
      <SafeAreaView>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20 }}>
        <Text style={[styles.label, isDark && styles.textLight]}>
          Full Name *
        </Text>
        <TextInput
          value={fullName}
          onChangeText={setFullName}
          style={[styles.input, isDark && styles.inputDark]}
          placeholder="John Doe"
          placeholderTextColor={isDark ? '#888' : '#AAA'}
        />

        <Text style={[styles.label, isDark && styles.textLight]}>
          Date of Birth (YYYY-MM-DD) *
        </Text>
        <TextInput
          value={dateOfBirth}
          onChangeText={setDOB}
          style={[styles.input, isDark && styles.inputDark]}
          placeholder="1990-01-01"
          placeholderTextColor={isDark ? '#888' : '#AAA'}
        />

        <Text style={[styles.label, isDark && styles.textLight]}>
          Gender *
        </Text>
        <TextInput
          value={gender}
          onChangeText={setGender}
          style={[styles.input, isDark && styles.inputDark]}
          placeholder="Male / Female / Other"
          placeholderTextColor={isDark ? '#888' : '#AAA'}
        />

        <Text style={[styles.label, isDark && styles.textLight]}>
          Height (cm)
        </Text>
        <TextInput
          value={heightCm}
          onChangeText={setHeightCm}
          style={[styles.input, isDark && styles.inputDark]}
          placeholder="e.g. 170"
          placeholderTextColor={isDark ? '#888' : '#AAA'}
          keyboardType="numeric"
        />

        <Text style={[styles.label, isDark && styles.textLight]}>
          Weight (kg)
        </Text>
        <TextInput
          value={weightKg}
          onChangeText={setWeightKg}
          style={[styles.input, isDark && styles.inputDark]}
          placeholder="e.g. 65"
          placeholderTextColor={isDark ? '#888' : '#AAA'}
          keyboardType="numeric"
        />

        <TouchableOpacity
          style={[styles.saveButton, isDark && styles.saveButtonDark]}
          onPress={onSave}
        >
          <Text style={styles.saveButtonText}>Save Basic Info</Text>
        </TouchableOpacity>

        <Text style={styles.subtitle}>All Fields with marker (*) are mandatory to fill. </Text>
      </ScrollView>
      </SafeAreaView>
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
    marginBottom: 10,
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
    fontWeight: '600',
  },
  subtitle: {
    color: '#912F40',    
  }
});
