import { Tabs } from 'expo-router';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
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
              size={24} 
              color={focused ? 'black' : '#888'} 
            />
          ),
        }}
      />
      
      {/* Search Icon (Centered & Bigger) */}
      <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.centerIcon}>
              <Ionicons 
                name="search" 
                size={30} 
                color={focused ? 'black' : '#888'} 
              />
            </View>
          ),
        }}
      />

      {/* Profile Icon */}
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <Ionicons 
              name="person-outline" 
              size={24} 
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
    left: 20,
    right: 20,
    height: 60,
    backgroundColor: '#FEFEFA', // Dark mode tab bar
    borderRadius: 15, // Rounded edges
    borderTopWidth: 
    0, // No default border
    elevation: 5, // Android shadow
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    marginHorizontal: 100,
    paddingTop: 10,
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

