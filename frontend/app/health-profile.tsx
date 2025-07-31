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
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { getHealthProfile, saveHealthProfile, HealthProfile } from '../services/healthProfile';

const { width } = Dimensions.get('window');

export default function HealthProfileScreen() {
  const isDark = useColorScheme() === 'dark';
  const [profile, setProfile] = useState<HealthProfile | null>(null);
  const [newAllergy, setNewAllergy] = useState('');
  const [loading, setLoading] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    loadProfile();
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
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
      Alert.alert('Success! 🎉', 'Your health profile has been saved and we\'ll personalize your meal recommendations!', [
        { text: 'Great!', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Oops! 😅', 'Failed to save your profile. Please try again.');
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

  const formatLabel = (key: string) => {
    return key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
  };

  const getSectionIcon = (section: string) => {
    switch (section) {
      case 'dietary': return 'leaf-outline';
      case 'allergies': return 'warning-outline';
      case 'preferences': return 'heart-outline';
      case 'healthGoals': return 'fitness-outline';
      default: return 'settings-outline';
    }
  };

  if (loading || !profile) {
    return (
      <View style={[styles.container, isDark && styles.darkBg]}>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={['#FF6B6B', '#4ECDC4']}
          style={styles.loadingGradient}
        >
          <View style={styles.loaderContent}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                style={styles.logoGradient}
              >
                <Ionicons name="person" size={40} color="white" />
              </LinearGradient>
            </View>
            <Text style={styles.loadingText}>Loading your profile...</Text>
            <Text style={styles.loadingSubtext}>Setting up your personalized experience</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDark && styles.darkBg]}>
      <StatusBar barStyle="light-content" />
      
      {/* Header with gradient background */}
      <LinearGradient
        colors={['#FF6B6B', '#4ECDC4']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContainer}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <BlurView intensity={20} style={styles.backButtonBlur}>
                <Ionicons name="chevron-back" size={24} color="#FFF" />
              </BlurView>
            </TouchableOpacity>
            
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Health Profile</Text>
              <Text style={styles.headerSubtitle}>Personalize your meals</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleSave}
              activeOpacity={0.7}
            >
              <BlurView intensity={20} style={styles.saveButtonBlur}>
                <Ionicons name="checkmark" size={24} color="#FFF" />
              </BlurView>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <Animated.ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
      >
        {/* Profile Stats Card */}
        <View style={[styles.statsCard, isDark && styles.statsCardDark]}>
          <LinearGradient
            colors={isDark ? ['#21262d', '#30363d'] : ['#ffffff', '#f8f9fa']}
            style={styles.statsGradient}
          >
            <View style={styles.statsContent}>
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: '#FF6B6B20' }]}>
                  <Ionicons name="restaurant" size={20} color="#FF6B6B" />
                </View>
                <Text style={[styles.statNumber, isDark && styles.textDark]}>
                  {Object.values(profile.dietary).filter(Boolean).length}
                </Text>
                <Text style={[styles.statLabel, isDark && styles.textSecondary]}>Dietary</Text>
              </View>
              
              <View style={styles.statDivider} />
              
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: '#4ECDC420' }]}>
                  <Ionicons name="heart" size={20} color="#4ECDC4" />
                </View>
                <Text style={[styles.statNumber, isDark && styles.textDark]}>
                  {Object.values(profile.preferences).filter(Boolean).length}
                </Text>
                <Text style={[styles.statLabel, isDark && styles.textSecondary]}>Preferences</Text>
              </View>
              
              <View style={styles.statDivider} />
              
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: '#FFD93D20' }]}>
                  <Ionicons name="fitness" size={20} color="#FFD93D" />
                </View>
                <Text style={[styles.statNumber, isDark && styles.textDark]}>
                  {Object.values(profile.healthGoals).filter(Boolean).length}
                </Text>
                <Text style={[styles.statLabel, isDark && styles.textSecondary]}>Goals</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Dietary Restrictions */}
        <View style={[styles.section, isDark && styles.sectionDark]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconContainer, { backgroundColor: '#FF6B6B20' }]}>
              <Ionicons name={getSectionIcon('dietary')} size={20} color="#FF6B6B" />
            </View>
            <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
              Dietary Restrictions
            </Text>
          </View>
          
          {Object.entries(profile.dietary).map(([key, value]) => (
            <View key={key} style={[styles.optionRow, isDark && styles.optionRowDark]}>
              <View style={styles.optionContent}>
                <Text style={[styles.optionText, isDark && styles.optionTextDark]}>
                  {formatLabel(key)}
                </Text>
                <Text style={[styles.optionDescription, isDark && styles.textSecondary]}>
                  {key === 'vegetarian' ? 'No meat or fish' :
                   key === 'vegan' ? 'No animal products' :
                   key === 'glutenFree' ? 'No gluten ingredients' :
                   key === 'dairyFree' ? 'No dairy products' :
                   key === 'nutFree' ? 'No nuts or tree nuts' : 'Dietary preference'}
                </Text>
              </View>
              <Switch
                value={value}
                onValueChange={() => toggleDietary(key as keyof HealthProfile['dietary'])}
                trackColor={{ false: isDark ? '#39424b' : '#E0E0E0', true: '#FF6B6B40' }}
                thumbColor={value ? '#FF6B6B' : isDark ? '#8b949e' : '#f4f3f4'}
                ios_backgroundColor={isDark ? '#39424b' : '#E0E0E0'}
              />
            </View>
          ))}
        </View>

        {/* Allergies */}
        <View style={[styles.section, isDark && styles.sectionDark]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconContainer, { backgroundColor: '#FF851B20' }]}>
              <Ionicons name={getSectionIcon('allergies')} size={20} color="#FF851B" />
            </View>
            <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
              Allergies & Intolerances
            </Text>
          </View>
          
          <View style={styles.addAllergyContainer}>
            <View style={[styles.allergyInputContainer, isDark && styles.allergyInputContainerDark]}>
              <Ionicons name="add-circle-outline" size={20} color={isDark ? '#8b949e' : '#666'} />
              <TextInput
                style={[styles.allergyInput, isDark && styles.allergyInputDark]}
                placeholder="Add an allergy (e.g., nuts, eggs, shellfish)"
                placeholderTextColor={isDark ? '#8b949e' : '#999'}
                value={newAllergy}
                onChangeText={setNewAllergy}
                onSubmitEditing={addAllergy}
              />
            </View>
            <TouchableOpacity style={styles.addButton} onPress={addAllergy}>
              <LinearGradient
                colors={['#4ECDC4', '#44A08D']}
                style={styles.addButtonGradient}
              >
                <Ionicons name="add" size={20} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.allergyTagsContainer}>
            {profile.allergies.map((allergy) => (
              <View key={allergy} style={[styles.allergyTag, isDark && styles.allergyTagDark]}>
                <Text style={[styles.allergyText, isDark && styles.allergyTextDark]}>
                  {allergy.charAt(0).toUpperCase() + allergy.slice(1)}
                </Text>
                <TouchableOpacity onPress={() => removeAllergy(allergy)} style={styles.removeAllergyButton}>
                  <Ionicons name="close" size={16} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Food Preferences */}
        <View style={[styles.section, isDark && styles.sectionDark]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconContainer, { backgroundColor: '#4ECDC420' }]}>
              <Ionicons name={getSectionIcon('preferences')} size={20} color="#4ECDC4" />
            </View>
            <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
              Food Preferences
            </Text>
          </View>
          
          {Object.entries(profile.preferences).map(([key, value]) => (
            <View key={key} style={[styles.optionRow, isDark && styles.optionRowDark]}>
              <View style={styles.optionContent}>
                <Text style={[styles.optionText, isDark && styles.optionTextDark]}>
                  {formatLabel(key)}
                </Text>
                <Text style={[styles.optionDescription, isDark && styles.textSecondary]}>
                  {key === 'spicy' ? 'Enjoys spicy foods' :
                   key === 'sweets' ? 'Prefers desserts & sweet treats' :
                   key === 'lowSodium' ? 'Reduced salt intake' :
                   key === 'organic' ? 'Prefers organic ingredients' : 'Food preference'}
                </Text>
              </View>
              <Switch
                value={value}
                onValueChange={() => togglePreference(key as keyof HealthProfile['preferences'])}
                trackColor={{ false: isDark ? '#39424b' : '#E0E0E0', true: '#4ECDC440' }}
                thumbColor={value ? '#4ECDC4' : isDark ? '#8b949e' : '#f4f3f4'}
                ios_backgroundColor={isDark ? '#39424b' : '#E0E0E0'}
              />
            </View>
          ))}
        </View>

        {/* Health Goals */}
        <View style={[styles.section, isDark && styles.sectionDark]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconContainer, { backgroundColor: '#FFD93D20' }]}>
              <Ionicons name={getSectionIcon('healthGoals')} size={20} color="#FFD93D" />
            </View>
            <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
              Health & Wellness Goals
            </Text>
          </View>
          
          {Object.entries(profile.healthGoals).map(([key, value]) => (
            <View key={key} style={[styles.optionRow, isDark && styles.optionRowDark]}>
              <View style={styles.optionContent}>
                <Text style={[styles.optionText, isDark && styles.optionTextDark]}>
                  {formatLabel(key)}
                </Text>
                <Text style={[styles.optionDescription, isDark && styles.textSecondary]}>
                  {key === 'weightLoss' ? 'Focus on calorie-conscious meals' :
                   key === 'muscleGain' ? 'High-protein meal options' :
                   key === 'heartHealth' ? 'Heart-healthy ingredients' :
                   key === 'diabeticFriendly' ? 'Blood sugar friendly options' : 'Health goal'}
                </Text>
              </View>
              <Switch
                value={value}
                onValueChange={() => toggleHealthGoal(key as keyof HealthProfile['healthGoals'])}
                trackColor={{ false: isDark ? '#39424b' : '#E0E0E0', true: '#FFD93D40' }}
                thumbColor={value ? '#FFD93D' : isDark ? '#8b949e' : '#f4f3f4'}
                ios_backgroundColor={isDark ? '#39424b' : '#E0E0E0'}
              />
            </View>
          ))}
        </View>

        {/* Info Card */}
        <View style={[styles.infoCard, isDark && styles.infoCardDark]}>
          <LinearGradient
            colors={['#4ECDC4', '#44A08D']}
            style={styles.infoGradient}
          >
            <View style={styles.infoContent}>
              <View style={styles.infoIcon}>
                <Ionicons name="information-circle" size={24} color="white" />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoTitle}>Your Privacy Matters</Text>
                <Text style={styles.infoText}>
                  All your health data is stored securely on your device and never shared with third parties.
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButtonMain} onPress={handleSave} activeOpacity={0.9}>
          <LinearGradient
            colors={['#FF6B6B', '#FF8E53']}
            style={styles.saveButtonGradient}
          >
            <Text style={styles.saveButtonText}>Save Profile & Get Recommendations</Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  darkBg: {
    backgroundColor: '#0d1117',
  },

  // Loading States
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderContent: {
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },

  // Header
  headerGradient: {
    paddingBottom: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    width: 44,
    height: 44,
  },
  backButtonBlur: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  saveButton: {
    width: 44,
    height: 44,
  },
  saveButtonBlur: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },

  // Content
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },

  // Stats Card
  statsCard: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  statsCardDark: {
    shadowColor: '#000',
    shadowOpacity: 0.3,
  },
  statsGradient: {
    padding: 20,
  },
  statsContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2c3e50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 20,
  },

  // Sections
  section: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
  },
  sectionDark: {
    backgroundColor: '#21262d',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2c3e50',
  },
  sectionTitleDark: {
    color: '#ffffff',
  },

  // Options
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionRowDark: {
    borderBottomColor: '#30363d',
  },
  optionContent: {
    flex: 1,
    marginRight: 16,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  optionTextDark: {
    color: '#ffffff',
  },
  optionDescription: {
    fontSize: 13,
    color: '#7f8c8d',
    lineHeight: 18,
  },

  // Allergies
  addAllergyContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  allergyInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
  },
  allergyInputContainerDark: {
    backgroundColor: '#30363d',
  },
  allergyInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#2c3e50',
  },
  allergyInputDark: {
    color: '#ffffff',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  addButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  allergyTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  allergyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#4ECDC4',
  },
  allergyTagDark: {
    backgroundColor: '#1e3a8a20',
    borderColor: '#4ECDC4',
  },
  allergyText: {
    fontSize: 14,
    color: '#4ECDC4',
    fontWeight: '600',
    marginRight: 8,
  },
  allergyTextDark: {
    color: '#4ECDC4',
  },
  removeAllergyButton: {
    padding: 2,
  },

  // Info Card
  infoCard: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  infoCardDark: {
    shadowColor: '#4ECDC4',
    shadowOpacity: 0.2,
  },
  infoGradient: {
    padding: 20,
  },
  infoContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoIcon: {
    marginRight: 16,
    marginTop: 2,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
  },

  // Main Save Button
  saveButtonMain: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#FF6B6B',
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
    marginBottom: 20,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginRight: 12,
  },

  // Text Colors
  textDark: {
    color: '#ffffff',
  },
  textSecondary: {
    color: '#8b949e',
  },

  bottomSpacer: {
    height: 20,
  },
});