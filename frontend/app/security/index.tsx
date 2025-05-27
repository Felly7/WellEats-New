import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { useColorScheme } from 'react-native';

const BIOMETRIC_KEY = 'use_biometric';

export default function SecurityScreen() {
  const isDarkMode = useColorScheme() === 'dark';

  // Feature availability
  const [hasHardware, setHasHardware] = useState<boolean>(false);
  const [biometricTypes, setBiometricTypes] = useState<string[]>([]);

  // User toggles
  const [biometricEnabled, setBiometricEnabled] = useState<boolean>(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean>(false);

  // On mount: detect hardware and load preferences
  useEffect(() => {
    (async () => {
      const hardware = await LocalAuthentication.hasHardwareAsync();
      setHasHardware(hardware);
      if (hardware) {
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        const labels = types.map(t =>
          t === LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
            ? 'Face ID'
            : 'Fingerprint'
        );
        setBiometricTypes(labels);
      }
      // load saved biometric preference
      const saved = await SecureStore.getItemAsync(BIOMETRIC_KEY);
      setBiometricEnabled(saved === 'true');
    })();
  }, []);

  // Handle biometric toggle
  const onToggleBiometric = async (value: boolean) => {
    if (value) {
      if (!hasHardware) {
        Alert.alert('Not supported', 'Your device does not support biometric authentication.');
        return;
      }
      // prompt to authenticate/enroll
      const { success } = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Confirm to enable biometric login',
      });
      if (success) {
        await SecureStore.setItemAsync(BIOMETRIC_KEY, 'true');
        setBiometricEnabled(true);
        Alert.alert('Enabled', 'Biometric login has been enabled.');
      } else {
        Alert.alert('Failed', 'Biometric setup was not completed.');
      }
    } else {
      await SecureStore.deleteItemAsync(BIOMETRIC_KEY);
      setBiometricEnabled(false);
      Alert.alert('Disabled', 'Biometric login has been disabled.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkBg]}>
      <Text style={[styles.header, isDarkMode && styles.headerDark]}>Security & Privacy</Text>

      <View style={styles.row}>
        <Text style={[styles.label, isDarkMode && styles.labelDark]}>Two-Factor Authentication</Text>
        <Switch
          value={twoFactorEnabled}
          onValueChange={setTwoFactorEnabled}
          trackColor={{ true: '#6B8E23' }}
        />
      </View>

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.label, isDarkMode && styles.labelDark]}>Biometric Login</Text>
          {hasHardware && (
            <Text style={[styles.subtitle, isDarkMode && styles.subtitleDark]}>
              Supported: {biometricTypes.join(', ')}
            </Text>
          )}
        </View>
        <Switch
          value={biometricEnabled}
          onValueChange={onToggleBiometric}
          disabled={!hasHardware}
          trackColor={{ true: '#6B8E23' }}
        />
      </View>

      {Platform.OS === 'ios' && !hasHardware && (
        <Text style={styles.infoText}>
          Face ID / Touch ID not available
        </Text>
      )}
      {Platform.OS === 'android' && !hasHardware && (
        <Text style={styles.infoText}>
          Fingerprint sensor not available
        </Text>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#FFF' },
  darkBg: { backgroundColor: '#121212' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, color: '#000' },
  headerDark: { color: '#FFF' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  label: { fontSize: 18, color: '#000' },
  labelDark: { color: '#FFF' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 4 },
  subtitleDark: { color: '#AAA' },
  infoText: { fontSize: 14, color: '#888', marginTop: 16, textAlign: 'center' },
});
