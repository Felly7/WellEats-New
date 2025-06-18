import { Tabs } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false, // No text under icons
        tabBarStyle: styles.tabBar, // Custom style
      }}>
      
      {/* Home Icon */}
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <Ionicons 
              name="home-outline" 
              size={20} 
              color={focused ? 'black' : '#888'} 
            />
          ),
        }}
      />
      

      
    </Tabs>
  );
}

// 🎨 **Styling**
const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 20, // Moves it up slightly
    left: 40,
    right: 40,
    height: 50,
    backgroundColor: '#FEFEFA', // Dark mode tab bar
    borderRadius:50, // Rounded edges
    borderTopWidth: 0, // No default border
    elevation: 5, // Android shadow
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginHorizontal: 100,
    paddingTop: 5,
  },
  // centerIcon: {
  //   width: 50,
  //   height: 50,
  //   borderRadius: 25,
  //   backgroundColor: '#222', // Slightly darker for contrast
  //   justifyContent: 'center',
  //   alignItems: 'center',
  // },
});

