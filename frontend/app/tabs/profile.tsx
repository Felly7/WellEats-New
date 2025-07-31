// File: app/profile.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  useColorScheme,
  SafeAreaView,
  Dimensions,
  Alert,
  Animated,
  StatusBar,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { getUserData } from '@/services/api';

const USER_INFO_KEY = 'userInfo';
const { width: windowWidth, height: windowHeight } = Dimensions.get('window');

const menuSections = [
  {
    title: 'Account',
    items: [
      { title: 'User Profile', icon: 'person-outline', route: '/profile', color: '#4ECDC4' },
      { title: 'Health Goals', icon: 'fitness-outline', route: '/health-profile', color: '#FF6B6B' },
      { title: 'History', icon: 'time-outline', route: '/history', color: '#45B7D1' },
    ]
  },
  {
    title: 'Preferences',
    items: [
      { title: 'Notifications', icon: 'notifications-outline', route: '/notifications', color: '#96CEB4' },
      { title: 'Security & Privacy', icon: 'shield-checkmark-outline', route: '/security', color: '#FECA57' },
      { title: 'Appearance', icon: 'color-palette-outline', route: '/appearance', color: '#A55EEA' },
    ]
  },
  {
    title: 'Support',
    items: [
      { title: 'Help Center', icon: 'help-circle-outline', route: '/help', color: '#26C281' },
      { title: 'Contact Us', icon: 'mail-outline', route: '/contact', color: '#3742FA' },
      { title: 'Rate App', icon: 'star-outline', route: '/rate', color: '#FFD700' },
    ]
  },
  {
    title: 'Account Actions',
    items: [
      { title: 'Sign out', icon: 'log-out-outline', route: '/logout', color: '#FF3742' },
    ]
  }
];

export default function ProfileScreen() {
  const isDarkMode = useColorScheme() === 'dark';
  const [user, setUser] = useState({ name: '', email: '' });
  const [confirmVisible, setConfirmVisible] = useState(false);
  
  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [profileScale] = useState(new Animated.Value(0.8));
  const scrollY = new Animated.Value(0);

  useEffect(() => {
    // Animate content in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(profileScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Header opacity based on scroll
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  // Load username from AsyncStorage on mount
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = await SecureStore.getItemAsync('userId');
        if (!token) throw new Error('No auth token found');

        const response = await getUserData(token);
        console.log('Fetched user details:', response);

        setUser({
          name: response.fullName || response.username,
          email: response.email,
        });
      } catch (error) {
        console.warn('Failed to fetch user details:', error);
        Alert.alert(
          'Error',
          'Unable to load user details. Please try again later.'
        );
      } 
    };

    fetchUserDetails();
  }, []);

  // Show overlay instead of default Alert
  const handleLogout = () => {
    setConfirmVisible(true);
  };

  // Actual sign‐out: clear token & navigate away
  const doSignOut = async () => {
    await SecureStore.deleteItemAsync('userId');
    setConfirmVisible(false);
    router.replace('/login');
  };

  // Menu item taps
  const onPressItem = (route: string) => {
    if (route === '/logout') {
      handleLogout();
    } else {
      router.push(route);
    }
  };

  const renderMenuItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.menuItem, isDarkMode && styles.menuItemDark]}
      onPress={() => onPressItem(item.route)}
      activeOpacity={0.7}
    >
      <View style={[styles.menuIconContainer, { backgroundColor: `${item.color}15` }]}>
        <Ionicons
          name={item.icon}
          size={22}
          color={item.color}
        />
      </View>
      <View style={styles.menuContent}>
        <Text style={[styles.menuText, isDarkMode && styles.textDark]}>
          {item.title}
        </Text>
        {item.route === '/logout' && (
          <Text style={[styles.menuSubtext, isDarkMode && styles.textSecondary]}>
            Sign out of your account
          </Text>
        )}
        {item.route === '/health-profile' && (
          <Text style={[styles.menuSubtext, isDarkMode && styles.textSecondary]}>
            Manage your dietary preferences
          </Text>
        )}
      </View>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={isDarkMode ? '#8b949e' : '#888'}
      />
    </TouchableOpacity>
  );

  const renderSection = ({ item }: { item: any }) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, isDarkMode && styles.textDark]}>
        {item.title}
      </Text>
      <View style={[styles.sectionContainer, isDarkMode && styles.sectionContainerDark]}>
        {item.items.map((menuItem: any, index: number) => (
          <View key={menuItem.title}>
            {renderMenuItem({ item: menuItem })}
            {index < item.items.length - 1 && (
              <View style={[styles.separator, isDarkMode && styles.separatorDark]} />
            )}
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <StatusBar barStyle="light-content" />
      
      {/* Animated Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <LinearGradient
          colors={['#FF6B6B', '#4ECDC4']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerGradient}
        >
          <SafeAreaView>
            <View style={styles.headerContent}>
              <TouchableOpacity 
                onPress={() => router.back()}
                style={styles.backButton}
              >
                <Ionicons name="chevron-back" size={24} color="white" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Profile</Text>
              <TouchableOpacity style={styles.editButton}>
                <Ionicons name="create-outline" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Profile Section */}
        <Animated.View 
          style={[
            styles.profileSection,
            isDarkMode && styles.profileSectionDark,
            { 
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: profileScale }
              ]
            }
          ]}
        >
          <View style={styles.profileImageContainer}>
            <Image
              style={styles.profileImage}
              source={require('../../assets/images/profile.jpg')}
            />
            <View style={styles.onlineIndicator} />
            <TouchableOpacity style={styles.cameraButton}>
              <Ionicons name="camera" size={16} color="white" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, isDarkMode && styles.textDark]}>
              {user.name || 'Loading...'}
            </Text>
            <Text style={[styles.profileEmail, isDarkMode && styles.textSecondary]}>
              {user.email || 'user@example.com'}
            </Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, isDarkMode && styles.textDark]}>24</Text>
              <Text style={[styles.statLabel, isDarkMode && styles.textSecondary]}>Recipes</Text>
            </View>
            <View style={[styles.statDivider, isDarkMode && styles.statDividerDark]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, isDarkMode && styles.textDark]}>12</Text>
              <Text style={[styles.statLabel, isDarkMode && styles.textSecondary]}>Favorites</Text>
            </View>
            <View style={[styles.statDivider, isDarkMode && styles.statDividerDark]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, isDarkMode && styles.textDark]}>8</Text>
              <Text style={[styles.statLabel, isDarkMode && styles.textSecondary]}>Days Streak</Text>
            </View>
          </View>
        </Animated.View>

        {/* Achievement Badge */}
        <Animated.View 
          style={[
            styles.achievementBadge,
            isDarkMode && styles.achievementBadgeDark,
            { opacity: fadeAnim }
          ]}
        >
          <LinearGradient
            colors={['#FFD700', '#FFA500']}
            style={styles.badgeGradient}
          >
            <Ionicons name="trophy" size={20} color="white" />
            <Text style={styles.badgeText}>Healthy Eater</Text>
          </LinearGradient>
        </Animated.View>

        {/* Menu Sections */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <FlatList
            data={menuSections}
            keyExtractor={(item) => item.title}
            renderItem={renderSection}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        </Animated.View>

        {/* App Version */}
        <Text style={[styles.appVersion, isDarkMode && styles.textSecondary]}>
          WellEats v2.1.0
        </Text>
      </Animated.ScrollView>

      {/* Logout Confirmation Modal */}
      {confirmVisible && (
        <BlurView intensity={95} tint={isDarkMode ? 'dark' : 'light'} style={styles.blurOverlay}>
          <Animated.View 
            style={[
              styles.modalContainer,
              {
                transform: [{
                  scale: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1]
                  })
                }]
              }
            ]}
          >
            <View style={[styles.confirmModal, isDarkMode && styles.confirmModalDark]}>
              <View style={styles.modalIcon}>
                <Ionicons name="log-out-outline" size={40} color="#FF6B6B" />
              </View>
              
              <Text style={[styles.modalTitle, isDarkMode && styles.textDark]}>
                Sign Out?
              </Text>
              <Text style={[styles.modalMessage, isDarkMode && styles.textSecondary]}>
                Are you sure you want to sign out of your account? You'll need to sign in again to access your personalized content.
              </Text>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelModalButton]}
                  onPress={() => setConfirmVisible(false)}
                >
                  <Text style={styles.cancelModalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.signOutModalButton]}
                  onPress={doSignOut}
                >
                  <Text style={styles.signOutModalButtonText}>Sign Out</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </BlurView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  darkContainer: {
    backgroundColor: '#0d1117',
  },

  // Header
  header: {
    zIndex: 10,
  },
  headerGradient: {
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Scroll Content
  scrollContent: {
    paddingBottom: 40,
  },

  // Profile Section
  profileSection: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: -10,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  profileSectionDark: {
    backgroundColor: '#21262d',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#FF6B6B',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4ECDC4',
    borderWidth: 3,
    borderColor: 'white',
  },
  cameraButton: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  textDark: {
    color: '#ffffff',
  },
  textSecondary: {
    color: '#8b949e',
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#f0f0f0',
  },
  statDividerDark: {
    backgroundColor: '#333',
  },

  // Achievement Badge
  achievementBadge: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  achievementBadgeDark: {
    shadowColor: '#FFD700',
    shadowOpacity: 0.3,
  },
  badgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  badgeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 8,
  },

  // Menu Sections
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginLeft: 20,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
  },
  sectionContainerDark: {
    backgroundColor: '#21262d',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  menuItemDark: {
    borderBottomColor: '#333',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 2,
  },
  menuSubtext: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginLeft: 76,
  },
  separatorDark: {
    backgroundColor: '#333',
  },

  // App Version
  appVersion: {
    textAlign: 'center',
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 30,
    marginBottom: 20,
  },

  // Modal
  blurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContainer: {
    width: '85%',
    maxWidth: 400,
  },
  confirmModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 10,
  },
  confirmModalDark: {
    backgroundColor: '#21262d',
  },
  modalIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFE5E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelModalButton: {
    backgroundColor: '#f8f9fa',
    marginRight: 8,
  },
  cancelModalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6c757d',
  },
  signOutModalButton: {
    backgroundColor: '#FF6B6B',
    marginLeft: 8,
  },
  signOutModalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});