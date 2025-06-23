import { Alert, StyleSheet, Text, View, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { getUserData, getAdminUsers, updateUserRole, deleteUser } from '@/services/api';
import * as SecureStore from 'expo-secure-store';
import { MaterialIcons } from '@expo/vector-icons';

const AdminDashboard = () => {
  const [adminUser, setAdminUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAdminDetails = async () => {
    try {
      const token = await SecureStore.getItemAsync('userId');
      if (!token) throw new Error('No auth token found');

      const response = await getUserData(token);
      setAdminUser({
        name: response.name,
        email: response.email,
        role: response.role
      });
    } catch (error) {
      console.error('Failed to fetch admin details:', error);
      Alert.alert('Error', 'Unable to load admin details.');
    }
  };

  const fetchAllUsers = async () => {
    try {
      setRefreshing(true);
      const response = await getAdminUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      Alert.alert('Error', 'Unable to load user data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      await updateUserRole(userId, newRole);
      fetchAllUsers(); // Refresh the list
      Alert.alert('Success', 'User role updated successfully');
    } catch (error) {
      console.error('Failed to update role:', error);
      Alert.alert('Error', 'Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this user?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUser(userId);
              fetchAllUsers(); // Refresh the list
              Alert.alert('Success', 'User deleted successfully');
            } catch (error) {
              console.error('Failed to delete user:', error);
              Alert.alert('Error', 'Failed to delete user');
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    fetchAdminDetails();
    fetchAllUsers();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Admin Profile Section */}
      <View style={styles.adminSection}>
        <Text style={styles.sectionTitle}>Admin Profile</Text>
        {adminUser && (
          <View style={styles.profileCard}>
            <Text style={styles.profileName}>{adminUser.name}</Text>
            <Text style={styles.profileEmail}>{adminUser.email}</Text>
            <Text style={styles.profileRole}>Role: {adminUser.role}</Text>
          </View>
        )}
      </View>

      {/* User Management Section */}
      <View style={styles.usersSection}>
        <Text style={styles.sectionTitle}>User Management</Text>
        
        {refreshing && <ActivityIndicator style={styles.refreshIndicator} />}
        
        {users.length === 0 ? (
          <Text style={styles.noUsersText}>No users found</Text>
        ) : (
          users.map(user => (
            <View key={user._id} style={styles.userCard}>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
                <Text style={styles.userRole}>Role: {user.role}</Text>
              </View>
              
              <View style={styles.actionsContainer}>
                <TouchableOpacity 
                  onPress={() => handleUpdateRole(user._id, user.role === 'admin' ? 'user' : 'admin')}
                  style={styles.actionButton}
                >
                  <MaterialIcons 
                    name={user.role === 'admin' ? 'admin-panel-settings' : 'person'} 
                    size={24} 
                    color="#4CAF50" 
                  />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={() => handleDeleteUser(user._id)}
                  style={styles.actionButton}
                >
                  <MaterialIcons name="delete" size={24} color="#F44336" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adminSection: {
    marginBottom: 24,
  },
  usersSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    elevation: 2,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 1,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: '#2196F3',
  },
  actionsContainer: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 12,
    padding: 8,
  },
  noUsersText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 16,
  },
  refreshIndicator: {
    marginVertical: 16,
  },
});

export default AdminDashboard;