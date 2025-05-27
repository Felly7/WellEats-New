// app/_layout.tsx  (or wherever your RootLayout lives)
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider, useAuth } from '@/src/context/AuthContext';

// Split into two components so we can call useAuth() *inside* the provider
function InnerLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const { userToken, isLoading } = useAuth();

  // hide splash as before
  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  // wait for fonts AND auth state
  if (!loaded || isLoading) return null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* gate initial screen based on token */}
        <Stack.Screen name={userToken ? 'tabs' : 'login'} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <InnerLayout />
    </AuthProvider>
  );
}