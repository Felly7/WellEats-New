import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

// List of menu options for the profile screen

//const profileImage = '';

const menuItems = [
    { title: 'User Profile', icon: 'receipt-outline', screen: 'Profile' },
    { title: 'Security and Privacy', icon: 'person-outline', screen: 'Security and Privacy' },
    { title: 'Notifications', icon: 'notifications-outline', screen: 'Notifications' },
    { title: 'Need help?', icon: 'help-circle-outline', screen: 'Help' },
    { title: 'Rate this app', icon: 'star-outline', screen: 'Rate' },
    { title: 'Help improve the app', icon: 'info-outline', screen: 'Improve' },
    { title: 'Sign out', icon: 'log-out-outline', screen: 'logout' },
];
export default function ProfileScreen() {
    // Function to handle logout confirmation

    // const user = useUser();
  
    const handleLogout = () => {
      Alert.alert(
        "Log Out",
        "Are you sure you want to log out?",
        [
          {
            text: "No",
            onPress: () => console.log("Cancel Pressed"),
            style: "cancel"
          },
          { text: "Yes", onPress: () => router.push('/') } // Redirects to home screen after logout
        ],
        { cancelable: false }
      );
    };
  
    // if (!user) {
    //   return (
    //     <View style={styles.container}>
    //       <Text>Loading...</Text>
    //     </View>
    //   );
    // }
    return (
      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.title}>My Profile</Text>
        </View>
  
        {/* Profile Info */}
        <View style={styles.profileSection}>
          <Image style={styles.profileImage} source={require('../../assets/images/profile.jpg')} />
          <Text style={styles.profileName}>Username</Text>
        </View>
  
        {/* Menu List */}
        <FlatList
          data={menuItems}
          keyExtractor={(item) => item.title}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.menuItem} onPress={() => router.push(item.screen)}>
              <Ionicons name={item.icon} size={22} color="#5A4A42" />
              <Text style={styles.menuText}>{item.title}</Text>
              <MaterialIcons name="keyboard-arrow-right" size={24} color="#5A4A42" />
            </TouchableOpacity>
          )}
        />
      </View>
    );
  }
  
  // 🎨 **Styles**
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#D0CFCF',  // Light gray background
    },
    header: {
      paddingTop: 60,
      paddingBottom: 20,
      alignItems: 'center',
      backgroundColor: '#358600', // Green header
      borderBottomLeftRadius: 30,
      borderBottomRightRadius: 30,
    },
    title: {
      fontSize: 22,
      fontWeight: 'bold',
      color: '#000',
    },
    profileSection: {
      alignItems: 'center',
      marginVertical: 20,
    },
    profileImage: {
      width: 90,
      height: 90,
      borderRadius: 45,
      borderWidth: 3,
      borderColor: '#358600',
    },
    profileName: {
      fontSize: 18,
      fontWeight: '600',
      color: '#000',
      marginTop: 8,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 15,
      paddingHorizontal: 20,
      borderBottomWidth: 0.5,
      borderBottomColor: '#358600',
    },
    menuText: {
      flex: 1,
      fontSize: 16,
      color: '#000',
      marginLeft: 10,
    },
  });