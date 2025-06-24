import React, { useEffect, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import {
  getUserData,
  getAdminUsers,
  updateUserRole,
  deleteUser,
  getAppStats,             // <- new import
} from '@/services/api';
import * as SecureStore from 'expo-secure-store';
import { MaterialIcons } from '@expo/vector-icons';

export default function AdminDashboard() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const [adminUser, setAdminUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);        // <- new state
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
        role: response.role,
      });
    } catch (error) {
      console.error('Failed to fetch admin details:', error);
      Alert.alert('Error', 'Unable to load admin details.');
    }
  };

 const fetchAllUsers = async () => {
   setRefreshing(true);
   try {
     const usersArray = await getAdminUsers();
     setUsers(usersArray);
   } catch (error: any) {
     console.error('Raw getAdminUsers error:', error);
     Alert.alert(
       'Error loading users',
       error.response?.data?.message || error.message || 'Unknown error'
     );
   } finally {
     setRefreshing(false);
     setLoading(false);
   }
 };


  const fetchStats = async () => {
    try {
      const data = await getAppStats();      // <- fetch stats
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      // not critical: no alert
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      await Promise.all([fetchAllUsers(), fetchStats()]);
      Alert.alert('Success', 'User role updated successfully');
    } catch (error) {
      console.error('Failed to update role:', error);
      Alert.alert('Error', 'Failed to update user role');
    }
  };

  const handleDeleteUser = (userId) => {
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
              await Promise.all([fetchAllUsers(), fetchStats()]);
              Alert.alert('Success', 'User deleted successfully');
            } catch (error) {
              console.error('Failed to delete user:', error);
              Alert.alert('Error', 'Failed to delete user');
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    Promise.all([fetchAdminDetails(), fetchAllUsers(), fetchStats()])
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: isDarkMode ? '#000' : '#f5f5f5' },
        ]}
      >
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? '#121212' : '#f5f5f5' },
      ]}
    >
      {/* Admin Profile */}
      <View style={styles.adminSection}>
        <Text
          style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#333' }]}
        >
          Admin Profile
        </Text>
        {adminUser && (
          <View
            style={[
              styles.profileCard,
              { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' },
            ]}
          >
            <Text
              style={[
                styles.profileName,
                { color: isDarkMode ? '#fff' : '#000' },
              ]}
            >
              {adminUser.name}
            </Text>
            <Text
              style={[
                styles.profileEmail,
                { color: isDarkMode ? '#aaa' : '#666' },
              ]}
            >
              {adminUser.email}
            </Text>
            <Text
              style={[
                styles.profileRole,
                { color: isDarkMode ? '#81b0ff' : '#4CAF50' },
              ]}
            >
              Role: {adminUser.role}
            </Text>
          </View>
        )}
      </View>

      {/* User Management */}
      <View style={styles.usersSection}>
        <Text
          style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#333' }]}
        >
          User Management
        </Text>
        {refreshing && <ActivityIndicator style={styles.refreshIndicator} />}
        {users.length === 0 ? (
          <Text
            style={[
              styles.noUsersText,
              { color: isDarkMode ? '#aaa' : '#666' },
            ]}
          >
            No users found
          </Text>
        ) : (
          users.map((user) => (
            <View
              key={user._id}
              style={[
                styles.userCard,
                { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' },
              ]}
            >
              <View style={styles.userInfo}>
                <Text
                  style={[
                    styles.userName,
                    { color: isDarkMode ? '#fff' : '#000' },
                  ]}
                >
                  {user.name}
                </Text>
                <Text
                  style={[
                    styles.userEmail,
                    { color: isDarkMode ? '#aaa' : '#666' },
                  ]}
                >
                  {user.email}
                </Text>
                <Text
                  style={[
                    styles.userRole,
                    { color: isDarkMode ? '#81b0ff' : '#2196F3' },
                  ]}
                >
                  Role: {user.role}
                </Text>
              </View>
              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  onPress={() =>
                    handleUpdateRole(
                      user._id,
                      user.role === 'admin' ? 'user' : 'admin'
                    )
                  }
                  style={styles.actionButton}
                >
                  <MaterialIcons
                    name={
                      user.role === 'admin'
                        ? 'admin-panel-settings'
                        : 'person'
                    }
                    size={24}
                    color={isDarkMode ? '#81b0ff' : '#4CAF50'}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDeleteUser(user._id)}
                  style={styles.actionButton}
                >
                  <MaterialIcons
                    name="delete"
                    size={24}
                    color={isDarkMode ? '#f55' : '#F44336'}
                  />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>

      {/* App Statistics */}
      {stats && (
        <View style={styles.statsSection}>
          <Text
            style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#333' }]}
          >
            App Statistics
          </Text>

          {/* Top row of KPI cards */}
          <View style={styles.kpiRow}>
            {[
              { label: 'Total Users', value: stats.totalUsers },
              { label: 'DAU', value: stats.dau },
              { label: 'WAU', value: stats.wau },
              { label: 'MAU', value: stats.mau },
              { label: 'YAU', value: stats.yau },
            ].map((kpi) => (
              <View
                key={kpi.label}
                style={[
                  styles.kpiCard,
                  { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' },
                ]}
              >
                <Text
                  style={[
                    styles.kpiValue,
                    { color: isDarkMode ? '#fff' : '#000' },
                  ]}
                >
                  {kpi.value}
                </Text>
                <Text
                  style={[
                    styles.kpiLabel,
                    { color: isDarkMode ? '#aaa' : '#666' },
                  ]}
                >
                  {kpi.label}
                </Text>
              </View>
            ))}
          </View>

          {/* Top Foods & Categories */}
          <View style={styles.topListsRow}>
            <View style={styles.listContainer}>
              <Text
                style={[
                  styles.listTitle,
                  { color: isDarkMode ? '#fff' : '#333' },
                ]}
              >
                Top Foods
              </Text>
              {stats.topFoods.map((f) => (
                <Text
                  key={f.name}
                  style={[
                    styles.listItem,
                    { color: isDarkMode ? '#ddd' : '#444' },
                  ]}
                >
                  {f.description} ({f.views})
                </Text>
              ))}
            </View>
            <View style={styles.listContainer}>
              <Text
                style={[
                  styles.listTitle,
                  { color: isDarkMode ? '#fff' : '#333' },
                ]}
              >
                Top Categories
              </Text>
              {stats.topCategories.map((c) => (
                <Text
                  key={c.name}
                  style={[
                    styles.listItem,
                    { color: isDarkMode ? '#ddd' : '#444' },
                  ]}
                >
                  {c.name} ({c.views})
                </Text>
              ))}
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, marginTop: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },

  adminSection: { marginBottom: 24 },
  profileCard: { borderRadius: 8, padding: 16, elevation: 2 },
  profileName: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
  profileEmail: { fontSize: 14, marginBottom: 4 },
  profileRole: { fontSize: 14, fontWeight: '500' },

  usersSection: { marginBottom: 24 },
  userCard: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 1,
  },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  userEmail: { fontSize: 14, marginBottom: 4 },
  userRole: { fontSize: 14, fontWeight: '500' },
  actionsContainer: { flexDirection: 'row' },
  actionButton: { marginLeft: 12, padding: 8 },
  noUsersText: { textAlign: 'center', marginTop: 16 },
  refreshIndicator: { marginVertical: 16 },

  // New stats section
  statsSection: { marginBottom: 24 },
  kpiRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  kpiCard: {
    width: '30%',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  kpiValue: { fontSize: 18, fontWeight: '700' },
  kpiLabel: { fontSize: 12 },

  topListsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  listContainer: { width: '48%' },
  listTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  listItem: { fontSize: 14, marginBottom: 4 },
});
