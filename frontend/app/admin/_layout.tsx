import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, useColorScheme,View, TouchableOpacity } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';


export default function TabLayout() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const bgColor = isDarkMode ? '#000' : '#FEFEFA';

  return (
    <SafeAreaProvider>
      {/* 
        Only pad top/left/right for notch/status bar.
        Excluding 'bottom' lets our tabBar sit flush at the bottom. 
      */}
      <SafeAreaView 
        style={[styles.container, { backgroundColor: bgColor }]} 
        edges={['top', 'left', 'right']}
      >
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarShowLabel: false,

            // ensure each screen’s content flexes to fill
            sceneContainerStyle: {
              flex: 1,
              backgroundColor: bgColor,
            },

            tabBarStyle: [
              styles.tabBar,
              { backgroundColor: isDarkMode ? '#111' : '#FEFEFA' },
            ],
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              tabBarIcon: ({ focused }) => (
                <Ionicons
                  name="home-outline"
                  size={20}
                  color={focused ? (isDarkMode ? 'white' : 'black') : '#888'}
                />
              ),
            }}
          />

        <Tabs.Screen
          name="settings"
          options={{
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name="settings-outline"
                size={20}
                color={focused ? (isDarkMode ? 'white' : 'black') : '#888'}
              />
            ),
            tabBarButton: (props) => (
              <TouchableOpacity
                {...props}
                onPress={() => router.push('/admin/settings')}
                style={props.style}
              />
            ),
          }}
        />
      </Tabs>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,      // fill the full area minus the bottom inset
  },
  tabBar: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    height: 50,
    borderRadius: 50,
    marginHorizontal: 100,
    borderTopWidth: 0,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    paddingTop: 5,
  },
});
