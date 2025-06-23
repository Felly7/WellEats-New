import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/useColorScheme';

// Split into two components so we can call useAuth() *inside* the provider
function InnerLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // hide splash as before
  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  // wait for fonts AND auth state
  if (!loaded) return null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* gate initial screen based on token */}
        <Stack.Screen name='tabs' />
        <Stack.Screen name='admin' />
        <Stack.Screen name='login' />
        <Stack.Screen name='profile' />
        <Stack.Screen name='register' />
        <Stack.Screen name='index' />
        <Stack.Screen name='allocal' />
        <Stack.Screen name='notifications' />
        <Stack.Screen name='meals' />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}