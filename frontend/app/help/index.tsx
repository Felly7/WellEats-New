// File: app/help/index.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';

export default function HelpScreen() {
  const isDark = useColorScheme() === 'dark';

  // Placeholder handlers – update these URLs as appropriate for your app
  const openFAQs = () => {
    // Replace with your actual FAQ URL
    Linking.openURL('https://welleats.app/faqs');
  };
  const contactSupport = () => {
    Linking.openURL('mailto:support@welleats.app');
  };
  const openVideoGuides = () => {
    // Replace with your actual tutorial/video URL
    Linking.openURL('https://welleats.app/tutorials');
  };
  const reportProblem = () => {
    // Opens email composer with subject “Feedback”
    Linking.openURL('mailto:support@welleats.app?subject=App Feedback');
  };
  const openHelpfulLinks = () => {
    // Replace with your actual helpful links page
    Linking.openURL('https://welleats.app/helpful-links');
  };
  const onDone = () => {
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkBg]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.headerContainer}>
          <Text style={[styles.headerText, isDark && styles.textLight]}>
            Help & Support
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={[styles.button, isDark && styles.buttonDark]}
            onPress={openFAQs}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonText, isDark && styles.textLight]}>
              Top FAQs / Quick Answers
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, isDark && styles.buttonDark]}
            onPress={contactSupport}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonText, isDark && styles.textLight]}>
              Contact Support
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, isDark && styles.buttonDark]}
            onPress={openVideoGuides}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonText, isDark && styles.textLight]}>
              Video Guides / Tutorials
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, isDark && styles.buttonDark]}
            onPress={reportProblem}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonText, isDark && styles.textLight]}>
              Report a Problem / Give Feedback
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, isDark && styles.buttonDark]}
            onPress={openHelpfulLinks}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonText, isDark && styles.textLight]}>
              Helpful Links
            </Text>
          </TouchableOpacity>
        </ScrollView>

        <TouchableOpacity
          style={[styles.doneButton, isDark && styles.doneButtonDark]}
          onPress={onDone}
          activeOpacity={0.8}
        >
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFFF7',
  },
  darkBg: {
    backgroundColor: '#121212',
  },
  headerContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
  },
  textLight: {
    color: '#FFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    backgroundColor: '#F2F2F2',
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  searchInputDark: {
    backgroundColor: '#1E1E1E',
    color: '#FFF',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  button: {
    backgroundColor: '#555',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonDark: {
    backgroundColor: '#2A2A2A',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
  doneButton: {
    backgroundColor: '#1E90FF',
    borderRadius: 8,
    paddingVertical: 14,
    marginHorizontal: 16,
    alignItems: 'center',
    marginVertical: 20,
  },
  doneButtonDark: {
    backgroundColor: '#3586FF',
  },
  doneText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
