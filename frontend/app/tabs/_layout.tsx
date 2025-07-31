import { Tabs } from 'expo-router';
import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { BlurView } from 'expo-blur';

export default function TabLayout() {
  const isDarkMode = useColorScheme() === 'dark';
  
  const colors = {
    background: isDarkMode ? 'rgba(18, 18, 18, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    active: isDarkMode ? '#fff' : '#000',
    inactive: isDarkMode ? '#666' : '#999',
    accent: '#007AFF',
    shadow: isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.15)',
  };

  const TabIcon = ({ name, focused, isCenter = false }) => {
    const animatedScale = new Animated.Value(focused ? 1.1 : 1);
    const animatedOpacity = new Animated.Value(focused ? 1 : 0.7);

    React.useEffect(() => {
      Animated.parallel([
        Animated.spring(animatedScale, {
          toValue: focused ? 1.1 : 1,
          useNativeDriver: true,
          tension: 300,
          friction: 10,
        }),
        Animated.timing(animatedOpacity, {
          toValue: focused ? 1 : 0.7,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }, [focused]);

    if (isCenter) {
      return (
        <Animated.View 
          style={[
            styles.centerIconContainer,
            {
              backgroundColor: focused ? colors.accent : colors.background,
              transform: [{ scale: animatedScale }],
              opacity: animatedOpacity,
            }
          ]}
        >
          <Ionicons 
            name={name}
            size={24} 
            color={focused ? '#fff' : colors.active} 
          />
        </Animated.View>
      );
    }

    return (
      <Animated.View 
        style={[
          styles.iconContainer,
          {
            transform: [{ scale: animatedScale }],
            opacity: animatedOpacity,
          }
        ]}
      >
        <Ionicons 
          name={name}
          size={22} 
          color={focused ? colors.accent : colors.inactive} 
        />
        {focused && (
          <View style={[styles.activeIndicator, { backgroundColor: colors.accent }]} />
        )}
      </Animated.View>
    );
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: [
          styles.tabBar,
          {
            backgroundColor: colors.background,
            shadowColor: colors.shadow,
          }
        ],
        tabBarBackground: () => isDarkMode ? (
          <BlurView intensity={80} style={StyleSheet.absoluteFill} />
        ) : (
          <BlurView intensity={100} style={StyleSheet.absoluteFill} />
        ),
      }}>
      
      {/* Home Icon */}
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? "home" : "home-outline"} focused={focused} />
          ),
        }}
      />
      
      {/* Search Icon (Centered & Special) */}
      <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon 
              name={focused ? "search" : "search-outline"} 
              focused={focused} 
              isCenter={true} 
            />
          ),
        }}
      />

      {/* Profile Icon */}
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? "person" : "person-outline"} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    height: 60,
    borderRadius: 50,
    borderTopWidth: 0,
    elevation: 5,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    paddingTop: 10,
    marginHorizontal: 50,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    width: 50,
    position: 'relative',
  },
  centerIconContainer: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#007AFF',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 8,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});