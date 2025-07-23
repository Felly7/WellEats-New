// File: app/health-profile.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Switch,
  TextInput,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { getHealthProfile, saveHealthProfile, HealthProfile } from '../services/healthProfile';

export default function HealthProfileScreen() {
  const isDark = useColorScheme() === 'dark';
  const [profile, setProfile] = useState<HealthProfile | null>(null);
  const [newAllergy, setNewAllergy] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const healthProfile = await getHealthProfile();
      setProfile(healthProfile);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    
    try {
      await saveHealthProfile(profile);
      Alert.alert('Success', 'Your health profile has been saved!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save your profile. Please try again.');
    }
  };

  const toggleDietary = (key: keyof HealthProfile['dietary']) => {
    if (!profile) return;
    setProfile({
      ...profile,
      dietary: {
        ...profile.dietary,
        [key]: !profile.dietary[key],
      },
    });
  };

  const togglePreference = (key: keyof HealthProfile['preferences']) => {
    if (!profile) return;
    setProfile({
      ...profile,
      preferences: {
        ...profile.preferences,
        [key]: !profile.preferences[key],
      },
    });
  };

  const toggleHealthGoal = (key: keyof HealthProfile['healthGoals']) => {
    if (!profile) return;
    setProfile({
      ...profile,
      healthGoals: {
        ...profile.healthGoals,
        [key]: !profile.healthGoals[key],
      },
    });
  };

  const addAllergy = () => {
    if (!profile || !newAllergy.trim()) return;
    
    const allergy = newAllergy.trim().toLowerCase();
    if (profile.allergies.includes(allergy)) {
      Alert.alert('Already Added', 'This allergy is already in your list.');
      return;
    }

    setProfile({
      ...profile,
      allergies: [...profile.allergies, allergy],
    });
    setNewAllergy('');
  };

  const removeAllergy = (allergy: string) => {
    if (!profile) return;
    setProfile({
      ...profile,
      allergies: profile.allergies.filter(a => a !== allergy),
    });
  };

  if (loading || !profile) {
    return (
      <SafeAreaView style={[styles.container, isDark && styles.darkBg]}>
        <View style={styles.loader}>
          <Text style={[styles.loadingText, { color: isDark ? '#FFF' : '#000' }]}>
            Loading your profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkBg]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Health Profile</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveButton}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Dietary Restrictions */}
        <View style={[styles.section, isDark && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            Dietary Restrictions
          </Text>
          
          {Object.entries(profile.dietary).map(([key, value]) => (
            <View key={key} style={styles.optionRow}>
              <Text style={[styles.optionText, isDark && styles.optionTextDark]}>
                {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
              </Text>
              <Switch
                value={value}
                onValueChange={() => toggleDietary(key as keyof HealthProfile['dietary'])}
                trackColor={{ false: '#767577', true: '#6B8E23' }}
                thumbColor={value ? '#FFF' : '#f4f3f4'}
              />
            </View>
          ))}
        </View>

        {/* Allergies */}
        <View style={[styles.section, isDark && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            Allergies
          </Text>
          
          <View style={styles.addAllergyContainer}>
            <TextInput
              style={[styles.allergyInput, isDark && styles.allergyInputDark]}
              placeholder="Add an allergy (e.g., nuts, eggs)"
              placeholderTextColor={isDark ? '#888' : '#AAA'}
              value={newAllergy}
              onChangeText={setNewAllergy}
              onSubmitEditing={addAllergy}
            />
            <TouchableOpacity style={styles.addButton} onPress={addAllergy}>
              <Ionicons name="add" size={20} color="white" />
            </TouchableOpacity>
          </View>

          {profile.allergies.map((allergy) => (
            <View key={allergy} style={styles.allergyTag}>
              <Text style={styles.allergyText}>
                {allergy.charAt(0).toUpperCase() + allergy.slice(1)}
              </Text>
              <TouchableOpacity onPress={() => removeAllergy(allergy)}>
                <Ionicons name="close" size={16} color="#6B8E23" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Food Preferences */}
        <View style={[styles.section, isDark && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            Food Preferences
          </Text>
          
          {Object.entries(profile.preferences).map(([key, value]) => (
            <View key={key} style={styles.optionRow}>
              <Text style={[styles.optionText, isDark && styles.optionTextDark]}>
                {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
              </Text>
              <Switch
                value={value}
                onValueChange={() => togglePreference(key as keyof HealthProfile['preferences'])}
                trackColor={{ false: '#767577', true: '#6B8E23' }}
                thumbColor={value ? '#FFF' : '#f4f3f4'}
              />
            </View>
          ))}
        </View>

        {/* Health Goals */}
        <View style={[styles.section, isDark && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            Health Goals
          </Text>
          
          {Object.entries(profile.healthGoals).map(([key, value]) => (
            <View key={key} style={styles.optionRow}>
              <Text style={[styles.optionText, isDark && styles.optionTextDark]}>
                {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
              </Text>
              <Switch
                value={value}
                onValueChange={() => toggleHealthGoal(key as keyof HealthProfile['healthGoals'])}
                trackColor={{ false: '#767577', true: '#6B8E23' }}
                thumbColor={value ? '#FFF' : '#f4f3f4'}
              />
            </View>
          ))}
        </View>

        {/* Info */}
        <View style={[styles.infoSection, isDark && styles.infoSectionDark]}>
          <Ionicons name="information-circle" size={20} color="#6B8E23" />
          <Text style={[styles.infoText, isDark && styles.infoTextDark]}>
            Your health profile helps us recommend meals that match your dietary needs and preferences.
            All data is stored locally on your device.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#6B8E23',
    padding: 15,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  saveButton: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    backgroundColor: '#FFF',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionDark: {
    backgroundColor: '#1E1E1E',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  sectionTitleDark: {
    color: '#FFF',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  optionText: {
    fontSize: 16,
    color: '#000',
    flex: 1,
  },
  optionTextDark: {
    color: '#FFF',
  },
  addAllergyContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  allergyInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    fontSize: 16,
    color: '#000',
  },
  allergyInputDark: {
    borderColor: '#333',
    backgroundColor: '#2A2A2A',
    color: '#FFF',
  },
  addButton: {
    backgroundColor: '#6B8E23',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  allergyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  allergyText: {
    fontSize: 14,
    color: '#6B8E23',
    marginRight: 8,
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0F8E8',
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  infoSectionDark: {
    backgroundColor: '#1E2A1E',
  },
  infoText: {
    fontSize: 14,
    color: '#5A7A3A',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  infoTextDark: {
    color: '#8FA86F',
  },
});