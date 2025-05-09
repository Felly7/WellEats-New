import { router } from 'expo-router';
import { useNavigation } from '@react-navigation/native'   // ← change here
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Checkbox from 'expo-checkbox';
import AsyncStorage from '@react-native-async-storage/async-storage'
import Icon from 'react-native-vector-icons/FontAwesome';
import { loginUser } from '@/services/api'; // Import login function from API

const LoginScreen = () => {
    // State variables for managing email, password, and "Remember Me" checkbox
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [loading, setLoading]   = useState(false)


  const navigation = useNavigation()   // ← useNavigation instead of useRouter

  // On mount: auto-login if token exists
  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem('USER_TOKEN')
        if (token) {
          // Replace the stack so user can't go back to login
          navigation.replace('tabs')  
        }
      } catch (err) {
        console.log('Error reading token', err)
      }
    }
    checkToken()
  }, [navigation])

  // Handle login tap
const handleLogin = async () => {
  setLoading(true)
  try {
    const data = await loginUser(email, password)
    console.log('Login success:', data)

    if (data.message === 'Login successful') {
      if (isChecked && data.token) {
        await AsyncStorage.setItem('USER_TOKEN', data.token)
      }
      navigation.replace('tabs')
    } else {
      // server responded 200 but with a failure message
      alert(data.message || 'Login failed')
    }

  } catch (err: any) {
    // Log out the full response so you can see exactly what the server returned
    if (err.isAxiosError && err.response) {
      console.log('Status:', err.response.status)
      console.log('Headers:', err.response.headers)
      console.log('Body:', err.response.data)
      // Often err.response.data will have a helpful error message
      alert(err.response.data.error || 'Invalid login credentials')
    } else {
      console.log('Unexpected error:', err)
      alert('An unexpected error occurred')
    }
  } finally {
    setLoading(false)
  }
}

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
            placeholderTextColor={'#000'}
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
            placeholderTextColor={'#000'}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        {/* Remember Me */}
        <View style={styles.optionsContainer}>
          <View style={styles.rememberContainer}>
            <Checkbox value={isChecked} onValueChange={setIsChecked} color={isChecked ? '#D62828' : undefined} />
            <Text style={styles.optionText}>Remember Me</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.optionText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        {/* Login Button */}
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>

        {/* Register Link */}
        <View style={styles.footer}>
          <Text>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/register')}>
            <Text style={styles.registerText}>Create an account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// Styles
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  registerText: {
    color: '#1E90FF',
  },
});

export default LoginScreen;
