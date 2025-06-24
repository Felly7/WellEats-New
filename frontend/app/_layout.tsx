import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/useColorScheme';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, StyleSheet } from 'react-native';

function InnerLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Hide splash screen after fonts are loaded
  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="tabs" />
            <Stack.Screen name="admin" />
            <Stack.Screen name="login" />
            <Stack.Screen name="profile" />
            <Stack.Screen name="register" />
            <Stack.Screen name="index" />
            <Stack.Screen name="allocal" />
            <Stack.Screen name="notifications" />
            <Stack.Screen name="meals" />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </View>
    </SafeAreaProvider>
  );
}

export default InnerLayout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
