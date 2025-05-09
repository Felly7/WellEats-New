import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ImageBackground,
} from 'react-native';
import Checkbox from 'expo-checkbox';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

// Section background images
const IMG_ALLERGIES  = require('../assets/images/allergies.jpg');
const IMG_CONDITIONS = require('../assets/images/conditions.jpg');
const IMG_DIETARY    = require('../assets/images/dietary.jpg');
const IMG_NOTES      = require('../assets/images/notes.jpg');

// Must match your backend enums
const ALLERGIES  = ['peanuts','tree_nuts','shellfish','dairy','gluten','soy','eggs','other'];
const CONDITIONS = ['diabetes','hypertension','kidney_disease','celiac','ibs','none'];
const DIETARY    = ['vegetarian','vegan','low_sodium','low_carb','gluten_free','none'];

export default function HealthProfileScreen() {
  // ─── Hooks (always at top) ─────────────────────────────────────────────
  const isDark = useColorScheme() === 'dark';

  const [selectedAllergies,   setSelectedAllergies]   = useState<string[]>([]);
  const [otherAllergyText,    setOtherAllergyText]    = useState('');
  const [selectedConditions,  setSelectedConditions]  = useState<string[]>([]);
  const [otherConditionText,  setOtherConditionText]  = useState('');
  const [selectedDietary,     setSelectedDietary]     = useState<string[]>([]);
  const [notes,               setNotes]               = useState('');
  const [loading,             setLoading]             = useState(true);

  const toggleItem = (arr: string[], setArr: (v:string[])=>void, item: string) =>
    setArr(arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item]);

  useEffect(() => {
    (async () => {
      try {
        const token = await SecureStore.getItemAsync('USER_TOKEN');
        if (!token) return;
        const resp = await fetch(`${API_URL}/health-profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!resp.ok) return;
        const profile = await resp.json();
        setSelectedAllergies(profile.allergies || []);
        setSelectedConditions(profile.conditions || []);
        setSelectedDietary(profile.dietaryRestrictions || []);
        setNotes(profile.notes || '');
        if (profile.allergies?.includes('other'))   setOtherAllergyText(profile.notes || '');
        if (profile.conditions?.includes('other')) setOtherConditionText(profile.notes || '');
      } catch (e) {
        console.error('Load profile error', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

const handleSave = async () => {
  setLoading(true);
  const body = {
    allergies: selectedAllergies,
    conditions: selectedConditions,
    dietaryRestrictions: selectedDietary,
    notes: otherAllergyText || otherConditionText || notes,
  };

  try {
    const token = await SecureStore.getItemAsync('USER_TOKEN');
    const url   = `${API_URL}/health-profile`;
    console.log('POSTing to:', url, 'body:', body);

    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`Server returned ${resp.status}: ${text}`);
    }

    Alert.alert('Saved', 'Your health profile has been updated.');
    router.back();

  } catch (err: any) {
    console.error('Save profile error', err);
    Alert.alert('Error', err.message);
  } finally {
    setLoading(false);
  }
};


  // ─── Loading state ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={[styles.loaderContainer, isDark && styles.darkBackground]}>
        <ActivityIndicator size="large" color={isDark ? '#FFF' : '#000'} />
      </View>
    );
  }

  // ─── Main UI ────────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={[styles.container, isDark && styles.darkBackground]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <SafeAreaView style={styles.flex}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Health Profile</Text>
          <View style={styles.headerIcons}>
            <Ionicons name="heart-outline" size={24} color="transparent" />
          </View>
        </View>

        {/* Scrollable Sections */}
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.contentContainer}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
          >
            {/* Allergies */}
            <ImageBackground
              source={IMG_ALLERGIES}
              style={styles.sectionBackground}
              imageStyle={styles.backgroundImage}
            >
              <Text style={[
                styles.sectionTitle,
                isDark ? styles.sectionTitleDark : styles.sectionTitleLight
              ]}>
                Allergies
              </Text>
              {ALLERGIES.map(a => (
                <View key={a} style={styles.optionRow}>
                  <Checkbox
                    value={selectedAllergies.includes(a)}
                    onValueChange={() => toggleItem(selectedAllergies, setSelectedAllergies, a)}
                    color={isDark ? '#FFF' : '#000'}
                  />
                  <Text style={[
                    styles.optionText,
                    isDark ? styles.optionTextDark : styles.optionTextLight
                  ]}>
                    {a.replace('_',' ')}
                  </Text>
                </View>
              ))}
              {selectedAllergies.includes('other') && (
                <TextInput
                  style={[styles.textInput,styles.multilineInput]}
                  placeholder="Describe other allergy"
                  placeholderTextColor={isDark?'#aaa':'#555'}
                  value={otherAllergyText}
                  onChangeText={setOtherAllergyText}
                  multiline
                />
              )}
            </ImageBackground>

            {/* Conditions */}
            <ImageBackground
              source={IMG_CONDITIONS}
              style={styles.sectionBackground}
              imageStyle={styles.backgroundImage}
            >
              <Text style={[
                styles.sectionTitle,
                isDark ? styles.sectionTitleDark : styles.sectionTitleLight
              ]}>
                Chronic Conditions
              </Text>
              {CONDITIONS.map(c => (
                <View key={c} style={styles.optionRow}>
                  <Checkbox
                    value={selectedConditions.includes(c)}
                    onValueChange={() => toggleItem(selectedConditions, setSelectedConditions, c)}
                    color={isDark ? '#FFF' : '#000'}
                  />
                  <Text style={[
                    styles.optionText,
                    isDark ? styles.optionTextDark : styles.optionTextLight
                  ]}>
                    {c.replace('_',' ')}
                  </Text>
                </View>
              ))}
              {selectedConditions.includes('other') && (
                <TextInput
                  style={[styles.textInput,styles.multilineInput]}
                  placeholder="Describe other condition"
                  placeholderTextColor={isDark?'#aaa':'#555'}
                  value={otherConditionText}
                  onChangeText={setOtherConditionText}
                  multiline
                />
              )}
            </ImageBackground>

            {/* Dietary Restrictions */}
            <ImageBackground
              source={IMG_DIETARY}
              style={styles.sectionBackground}
              imageStyle={styles.backgroundImage}
            >
              <Text style={[
                styles.sectionTitle,
                isDark ? styles.sectionTitleDark : styles.sectionTitleLight
              ]}>
                Dietary Restrictions
              </Text>
              {DIETARY.map(d => (
                <View key={d} style={styles.optionRow}>
                  <Checkbox
                    value={selectedDietary.includes(d)}
                    onValueChange={() => toggleItem(selectedDietary, setSelectedDietary, d)}
                    color={isDark ? '#FFF' : '#000'}
                  />
                  <Text style={[
                    styles.optionText,
                    isDark ? styles.optionTextDark : styles.optionTextLight
                  ]}>
                    {d.replace('_',' ')}
                  </Text>
                </View>
              ))}
            </ImageBackground>

            {/* Notes */}
            <ImageBackground
              source={IMG_NOTES}
              style={styles.sectionBackground}
              imageStyle={styles.backgroundImage}
            >
              <Text style={[
                styles.sectionTitle,
                isDark ? styles.sectionTitleDark : styles.sectionTitleLight
              ]}>
                Notes
              </Text>
              <TextInput
                style={[styles.textInput,styles.multilineInput]}
                placeholder="Any other info"
                placeholderTextColor={isDark?'#aaa':'#555'}
                value={notes}
                onChangeText={setNotes}
                multiline
              />
            </ImageBackground>

            {/* Save Button */}
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Profile</Text>
            </TouchableOpacity>
          </ScrollView>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex:               { flex: 1 },
  container:          { flex: 1, backgroundColor: '#FFF' },
  darkBackground:     { backgroundColor: '#121212' },
  loaderContainer:    { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header:             { flexDirection:'row', justifyContent:'space-between', alignItems:'center', backgroundColor:'#6B8E23', padding:15 },
  headerTitle:        { fontSize:22, fontWeight:'bold', color:'white' },
  headerIcons:        { width:24, alignItems:'flex-end' },

  scrollView:         { flex: 1 },
  contentContainer:  { flexGrow:1, padding:16, paddingBottom:120 },

  sectionBackground:  { marginBottom:20, padding:16, borderRadius:12, overflow:'hidden' },
  backgroundImage:    { resizeMode:'cover', borderRadius:12, opacity:0.2 },

  sectionTitle:       { fontWeight:'bold', marginBottom:12 },
  sectionTitleLight:  { color:'#000', fontSize:20 },
  sectionTitleDark:   { color:'#FFF', fontSize:20 },

  optionRow:          { flexDirection:'row', alignItems:'center', marginBottom:8 },
  optionText:         { marginLeft:8 },
  optionTextLight:    { color:'#000', fontSize:18 },
  optionTextDark:     { color:'#FFF', fontSize:18 },

  textInput:          { backgroundColor:'#E5E5E5', borderRadius:8, paddingHorizontal:12, marginTop:8, color:'#000' },
  multilineInput:     { height:80, textAlignVertical:'top' },

  saveButton:         { backgroundColor:'#D62828', paddingVertical:15, borderRadius:8, alignItems:'center', marginBottom:40 },
  saveButtonText:     { color:'#FFF', fontSize:16, fontWeight:'bold' },
});
