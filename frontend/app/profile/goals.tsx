// File: app/profile/goals.tsx

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
import { Ionicons } from '@expo/vector-icons';

import type { HealthGoals, UserInfo } from '../profile'; // adjust path if needed

const USER_INFO_KEY = 'userInfo';

export default function HealthGoalsScreen() {
  const isDark = useColorScheme() === 'dark';
  const router = useRouter();

  const [goalType, setGoalType] = useState<HealthGoals['goalType']>(
    'Maintain'
  );
  const [targetWeightKg, setTargetWeightKg] = useState('');
  const [activityLevel, setActivityLevel] = useState<
    HealthGoals['activityLevel']
  >('Moderate');

  // Load existing HealthGoals
  useEffect(() => {
    (async () => {
      try {
        const json = await AsyncStorage.getItem(USER_INFO_KEY);
        if (json) {
          const info: UserInfo = JSON.parse(json);
          if (info.healthGoals) {
            setGoalType(info.healthGoals.goalType);
            setTargetWeightKg(info.healthGoals.targetWeightKg);
            setActivityLevel(info.healthGoals.activityLevel);
          }
        }
      } catch (e) {
        console.warn('Failed to load HealthGoals:', e);
      }
    })();
  }, []);

  const onSave = async () => {
    if (!targetWeightKg.trim()) {
      Alert.alert('Validation', 'Please enter a target weight.');
      return;
    }
    const healthGoals: HealthGoals = {
      goalType,
      targetWeightKg: targetWeightKg.trim(),
      activityLevel,
    };
    try {
      await AsyncStorage.mergeItem(
        USER_INFO_KEY,
        JSON.stringify({ healthGoals })
      );
      Alert.alert('Saved', 'Health Goals updated.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e) {
      console.warn('Failed to save HealthGoals:', e);
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
          Goal Type
        </Text>
        <View style={styles.radioGroup}>
          {['Lose', 'Maintain', 'Gain'].map((option) => (
            <TouchableOpacity
              key={option}
              style={styles.radioOption}
              onPress={() =>
                setGoalType(option as HealthGoals['goalType'])
              }
            >
              <View style={styles.radioCircle}>
                {goalType === option && <View style={styles.radioFilled} />}
              </View>
              <Text style={[styles.radioLabel, isDark && styles.textLight]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.label, isDark && styles.textLight]}>
          Target Weight (kg)
        </Text>
        <TextInput
          value={targetWeightKg}
          onChangeText={setTargetWeightKg}
          style={[styles.input, isDark && styles.inputDark]}
          placeholder="e.g. 60"
          placeholderTextColor={isDark ? '#888' : '#AAA'}
          keyboardType="numeric"
        />

        <Text style={[styles.label, isDark && styles.textLight]}>
          Activity Level
        </Text>
        <View style={styles.radioGroup}>
          {['Low', 'Moderate', 'High'].map((option) => (
            <TouchableOpacity
              key={option}
              style={styles.radioOption}
              onPress={() =>
                setActivityLevel(
                  option as HealthGoals['activityLevel']
                )
              }
            >
              <View style={styles.radioCircle}>
                {activityLevel === option && (
                  <View style={styles.radioFilled} />
                )}
              </View>
              <Text style={[styles.radioLabel, isDark && styles.textLight]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.saveButton, isDark && styles.saveButtonDark]}
          onPress={onSave}
        >
          <Text style={styles.saveButtonText}>Save Health Goals</Text>
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
  radioGroup: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#6B8E23',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioFilled: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: '#6B8E23',
  },
  radioLabel: {
    marginLeft: 6,
    fontSize: 14,
    color: '#333',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 20,
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
