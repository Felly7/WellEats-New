import { router } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Keyboard, TouchableWithoutFeedback, Platform } from 'react-native';
import { registerUser } from '../services/api'; // Import API function to register a user
import { Ionicons } from '@expo/vector-icons';


const RegisterScreen = () => {
   // State variables to store user input
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');
    const [healthCondition, setHealthCondition] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [repeatPasswordVisible, setRepeatPasswordVisible] = useState(false);
  
     // Function to handle user registration
    const handleRegister = async () => {
      // Validate password match
      if (password !== repeatPassword) {
        alert('Passwords do not match');
        return;
      }
      try {
        // Call register API function
        const data = await registerUser(
          email,
          fullName,
          username,
          password,
        );
         // If registration is successful, navigate to login screen
        if (data.message == "Registration successful"){
          router.push('/login');
        }
        else{
          console.log('Registration failed');
        }
      } catch (error: any) {
        alert(error.message || 'Registration failed');
      }
    };
  
    return (
      <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={{flexGrow: 1}}>
      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Create your account</Text>
        </View>
  
        {/* Input Fields */}
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={'#000'}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          placeholderTextColor={'#000'}
          value={fullName}
          onChangeText={setFullName}
        />
        <TextInput
          style={styles.input}
          placeholderTextColor={'#000'}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
        />
  
        {/* Password Input with Visibility Toggle */}
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password"
            placeholderTextColor={'#000'}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!passwordVisible}
          />
          <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
            <Ionicons
              name={passwordVisible ? 'eye' : 'eye-off'}
              size={24}
              color="#aaa"
            />
          </TouchableOpacity>
        </View>
  
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Repeat Password"
            placeholderTextColor={'#000'}
            value={repeatPassword}
            onChangeText={setRepeatPassword}
            secureTextEntry={!repeatPasswordVisible}
          />
          <TouchableOpacity
            onPress={() => setRepeatPasswordVisible(!repeatPasswordVisible)}>
            <Ionicons
              name={repeatPasswordVisible ? 'eye' : 'eye-off'}
              size={24}
              color="#aaa"
            />
          </TouchableOpacity>
        </View>
  
        {/* <TextInput
          style={styles.input}
          placeholder="Select Health Condition(s)"
          placeholderTextColor={'#000'}
          value={healthCondition}
          onChangeText={setHealthCondition}
        /> */}
  
        {/* Submit Button */}
        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Create Account</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FFEB00',
      padding: 24,
      justifyContent: 'center',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 32,
      backgroundColor: '#8DC63F',
      paddingVertical: 20,
      paddingHorizontal: 16,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
    headerText: {
      fontSize: 24,
      color: '#fff',
      marginLeft: 16,
      fontWeight: '600',
    },
    input: {
      height: 50,
      backgroundColor: '#fff',
      borderRadius: 12,
      paddingHorizontal: 16,
      fontSize: 16,
      marginBottom: 12,
    },
    passwordContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#fff',
      borderRadius: 12,
      paddingHorizontal: 16,
      marginBottom: 12,
    },
    passwordInput: {
      flex: 1,
      height: 50,
      fontSize: 16,
      borderTopLeftRadius: 20, 
      borderTopRightRadius: 20,
      borderBottomLeftRadius: 12,
      borderBottomRightRadius: 12,
    },
    button: {
      height: 50,
      backgroundColor: '#D92D20',
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 20,
    },
    buttonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: '600',
    },
  });
  
  export default RegisterScreen;