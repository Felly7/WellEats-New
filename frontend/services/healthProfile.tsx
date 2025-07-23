// File: services/healthProfile.tsx

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface HealthProfile {
  dietary: {
    vegetarian: boolean;
    vegan: boolean;
    glutenFree: boolean;
    dairyFree: boolean;
    ketogenic: boolean;
    paleo: boolean;
    lowCarb: boolean;
    lowSodium: boolean;
  };
  allergies: string[]; // e.g., ['nuts', 'eggs', 'shellfish']
  preferences: {
    spicyFoods: boolean;
    seafood: boolean;
    meat: boolean;
    sweets: boolean;
  };
  healthGoals: {
    weightLoss: boolean;
    muscleGain: boolean;
    heartHealth: boolean;
    diabeticFriendly: boolean;
  };
  restrictions: string[]; // custom restrictions
}

const DEFAULT_PROFILE: HealthProfile = {
  dietary: {
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    dairyFree: false,
    ketogenic: false,
    paleo: false,
    lowCarb: false,
    lowSodium: false,
  },
  allergies: [],
  preferences: {
    spicyFoods: true,
    seafood: true,
    meat: true,
    sweets: true,
  },
  healthGoals: {
    weightLoss: false,
    muscleGain: false,
    heartHealth: false,
    diabeticFriendly: false,
  },
  restrictions: [],
};

const STORAGE_KEY = '@WellEats:healthProfile';

export const getHealthProfile = async (): Promise<HealthProfile> => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_PROFILE;
  } catch (error) {
    console.error('Error loading health profile:', error);
    return DEFAULT_PROFILE;
  }
};

export const saveHealthProfile = async (profile: HealthProfile): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error('Error saving health profile:', error);
  }
};

export const updateHealthProfile = async (updates: Partial<HealthProfile>): Promise<void> => {
  const current = await getHealthProfile();
  const updated = { ...current, ...updates };
  await saveHealthProfile(updated);
};