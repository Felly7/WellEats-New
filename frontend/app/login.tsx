// File: app/login.tsx
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import Checkbox from 'expo-checkbox';
import Icon from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { loginUser } from '@/services/api';
import { useAuth } from '@/src/context/AuthContext';

export default function LoginScreen() {
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [showBioButton, setShowBioButton] = useState(false);
  const [bioType, setBioType]             = useState<string | null>(null);

  const navigation = router;
  const { login } = useAuth();

  // Detect biometric hardware and enrollment
  useEffect(() => {
    (async () => {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) return;
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      if (types.length === 0) return;
      const label = types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)
        ? 'Face ID'
        : 'Fingerprint';
      setBioType(label);
      setShowBioButton(true);
    })();
  }, []);

  // Biometric login handler with enrollment check and fallback
  const handleBiometricLogin = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        Alert.alert('Error', 'Biometric hardware not available');
        return;
      }
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        Alert.alert('No Biometrics', 'Please enroll Face ID or Fingerprint in your device settings.');
        return;
      }
      console.log('Starting biometric auth');
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `Login with ${bioType}`,
        cancelLabel: 'Cancel',
        fallbackLabel: 'Use Passcode',
      });
      console.log('Biometric auth result:', result);
      if (result.success) {
        const token = await AsyncStorage.getItem('USER_TOKEN');
        if (token) {
          await login(token);
          navigation.replace('tabs');
        } else {
          Alert.alert('No Credentials', 'Please login manually first.');
        }
      } else {
        Alert.alert('Authentication Failed', 'Biometric login was not successful.');
      }
    } catch (e) {
      console.log('Biometric error:', e);
      Alert.alert('Error', 'An error occurred during biometric authentication.');
    }
  };

  // Manual login
  const handleLogin = async () => {
    setLoading(true);
    try {
      const data = await loginUser(email, password);
      if (data.message === 'Login successful' && data.token) {
        await login(data.token);
        navigation.replace('tabs');
      } else {
        Alert.alert('Login failed', data.message || 'Invalid credentials');
      }
    } catch (e) {
      console.log('Login error:', e);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const iconName = bioType === 'Face ID' ? 'eye-outline' : 'finger-print-outline';

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <Text style={styles.title}>WellEats</Text>
        <Text style={styles.subtitle}>HEALTH FOCUSED FOOD APP</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Icon name="user" size={20} color="gray" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#000"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon name="lock" size={20} color="gray" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#000"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <View style={styles.optionsContainer}>
          <View style={styles.rememberContainer}>
            <Checkbox value={isChecked} onValueChange={setIsChecked} color={isChecked ? '#D62828' : undefined} />
            <Text style={styles.optionText}>Remember Me</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.optionText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
          <Text style={styles.loginButtonText}>{loading ? 'Logging in...' : 'Login'}</Text>
        </TouchableOpacity>

        {showBioButton && bioType && (
          <TouchableOpacity style={styles.bioButton} onPress={handleBiometricLogin}>            
            <Ionicons name={iconName} size={24} color="#FFF" />
            <Text style={styles.bioButtonText}>Login with {bioType}</Text>
          </TouchableOpacity>
        )}

        <View style={styles.footer}>
          <Text>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/register')}>
            <Text style={styles.registerText}>Create an account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8CC63F',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  topSection: {
    flex: 1,
    backgroundColor: '#FCEE21',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
  },
  subtitle: {
    fontSize: 14,
    color: '#A67C00',
    marginTop: 8,
  },
  formContainer: {
    flex: 2,
    backgroundColor: '#FFF',
    margin: 20,
    padding: 20,
    borderRadius: 20,
    elevation: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginVertical: 10,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    color: '#000',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    color: '#6A6A6A',
    fontSize: 12,
    marginLeft: 8,
  },
  loginButton: {
    backgroundColor: '#D62828',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 20,
  },
  loginButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  bioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E90FF',
    padding: 12,
    borderRadius: 8,
    marginVertical: 10,
  },
  bioButtonText: {
    color: '#FFF',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  registerText: {
    color: '#1E90FF',
  },
});
