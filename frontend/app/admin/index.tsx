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
  Dimensions,
  RefreshControl,
} from 'react-native';
import {
  getUserData,
  getAdminUsers,
  updateUserRole,
  deleteUser,
  getAppStats,
} from '@/services/api';
import * as SecureStore from 'expo-secure-store';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function AdminDashboard() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  type User = {
    _id: string;
    name: string;
    email: string;
    role: string;
  };

  const [adminUser, setAdminUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

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
    console.log('Fetched users:', usersArray); // <- Add this
    setUsers(usersArray);
  } catch (error) {
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
      const data = await getAppStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
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

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchAdminDetails(), fetchAllUsers(), fetchStats()]);
    setRefreshing(false);
  };

  useEffect(() => {
    Promise.all([fetchAdminDetails(), fetchAllUsers(), fetchStats()])
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: isDarkMode ? '#0a0a0a' : '#f8f9fa' }]}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={[styles.loadingText, { color: isDarkMode ? '#fff' : '#333' }]}>
          Loading Dashboard...
        </Text>
      </View>
    );
  }

  const TabButton = ({ id, title, icon, isActive, onPress }) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        isActive && styles.activeTab,
        { backgroundColor: isActive ? '#6366f1' : 'transparent' }
      ]}
      onPress={onPress}
    >
      <Ionicons 
        name={icon} 
        size={20} 
        color={isActive ? '#fff' : (isDarkMode ? '#9ca3af' : '#6b7280')} 
      />
      <Text style={[
        styles.tabText,
        { color: isActive ? '#fff' : (isDarkMode ? '#9ca3af' : '#6b7280') }
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const StatCard = ({ title, value, icon, gradient, change }) => (
    <LinearGradient
      colors={gradient}
      style={styles.statCard}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.statCardContent}>
        <View style={styles.statCardHeader}>
          <Text style={styles.statCardTitle}>{title}</Text>
          <Ionicons name={icon} size={24} color="#fff" style={styles.statCardIcon} />
        </View>
        <Text style={styles.statCardValue}>{value}</Text>
        {change && (
          <Text style={styles.statCardChange}>
            {change > 0 ? '↗' : '↘'} {Math.abs(change)}% from last month
          </Text>
        )}
      </View>
    </LinearGradient>
  );

  const renderOverview = () => (
    <View style={styles.tabContent}>
      {/* Welcome Header */}
      <View style={[styles.welcomeCard, { backgroundColor: isDarkMode ? '#1f2937' : '#fff' }]}>
        <View style={styles.welcomeContent}>
          <Text style={[styles.welcomeTitle, { color: isDarkMode ? '#fff' : '#1f2937' }]}>
            Welcome back,Admin {adminUser?.name}!
          </Text>
          <Text style={[styles.welcomeSubtitle, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>
            Here's what's happening with your app today.
          </Text>
        </View>
        <View style={styles.welcomeIcon}>
          <Ionicons name="person-circle" size={60} color="#6366f1" />
        </View>
      </View>

      {/* Stats Grid */}
      {stats && (
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Users"
            value={stats.totalUsers?.toLocaleString() || '0'}
            icon="people"
            gradient={['#6366f1', '#8b5cf6']}
            change={12}
          />
          <StatCard
            title="Daily Active"
            value={stats.dau?.toLocaleString() || '0'}
            icon="trending-up"
            gradient={['#10b981', '#059669']}
            change={8}
          />
          <StatCard
            title="Weekly Active"
            value={stats.wau?.toLocaleString() || '0'}
            icon="calendar"
            gradient={['#f59e0b', '#d97706']}
            change={-3}
          />
          <StatCard
            title="Monthly Active"
            value={stats.mau?.toLocaleString() || '0'}
            icon="bar-chart"
            gradient={['#ef4444', '#dc2626']}
            change={15}
          />
        </View>
      )}

      {/* Quick Actions */}
      <View style={[styles.quickActionsCard, { backgroundColor: isDarkMode ? '#1f2937' : '#fff' }]}>
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#1f2937' }]}>
          Quick Actions
        </Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity 
            style={[styles.quickActionButton, { backgroundColor: isDarkMode ? '#374151' : '#f3f4f6' }]}
            onPress={() => setActiveTab('users')}
          >
            <Ionicons name="people" size={24} color="#6366f1" />
            <Text style={[styles.quickActionText, { color: isDarkMode ? '#fff' : '#1f2937' }]}>
              Manage Users
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.quickActionButton, { backgroundColor: isDarkMode ? '#374151' : '#f3f4f6' }]}
            onPress={() => setActiveTab('analytics')}
          >
            <Ionicons name="analytics" size={24} color="#10b981" />
            <Text style={[styles.quickActionText, { color: isDarkMode ? '#fff' : '#1f2937' }]}>
              View Analytics
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderUsers = () => (
    <View style={styles.tabContent}>
      <View style={[styles.usersHeader, { backgroundColor: isDarkMode ? '#1f2937' : '#fff' }]}>
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#1f2937' }]}>
          User Management
        </Text>
        <Text style={[styles.usersCount, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>
          {users.length} total users
        </Text>
      </View>

      {users.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: isDarkMode ? '#1f2937' : '#fff' }]}>
          <Ionicons name="people-outline" size={60} color={isDarkMode ? '#6b7280' : '#9ca3af'} />
          <Text style={[styles.emptyStateText, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>
            No users found
          </Text>
        </View>
      ) : (
        users.map((user) => (
          <View
            key={user._id}
            style={[styles.userCard, { backgroundColor: isDarkMode ? '#1f2937' : '#fff' }]}
          >
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>
                 {typeof user.fullName === 'string' && user.fullName.trim().length > 0
                    ? user.fullName.trim().charAt(0).toUpperCase()
               : '?'}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: isDarkMode ? '#fff' : '#1f2937' }]}>
                {user.fullName}
              </Text>
              <Text style={[styles.userEmail, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>
                {user.email}
              </Text>
              <View style={[
                styles.roleBadge,
                { backgroundColor: (user.role || 'user') === 'admin' ? '#ef4444' : '#6366f1' }
              ]}>
                <Text style={styles.roleBadgeText}> 
                   {(user.role || 'user').toUpperCase()}
              </Text>
              </View>
            </View>
            <View style={styles.userActions}>
              <TouchableOpacity
                onPress={() => handleUpdateRole(user._id, user.role === 'admin' ? 'user' : 'admin')}
                style={[styles.actionButton, styles.primaryAction]}
              >
                <Ionicons
                  name={user.role === 'admin' ? 'person' : 'shield-checkmark'}
                  size={20}
                  color="#fff"
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDeleteUser(user._id)}
                style={[styles.actionButton, styles.dangerAction]}
              >
                <Ionicons name="trash" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </View>
  );

  const renderAnalytics = () => (
    <View style={styles.tabContent}>
      {stats && (
        <>
          {/* Engagement Metrics */}
          <View style={[styles.analyticsCard, { backgroundColor: isDarkMode ? '#1f2937' : '#fff' }]}>
            <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#1f2937' }]}>
              User Engagement
            </Text>
            <View style={styles.engagementMetrics}>
              <View style={styles.metricItem}>
                <Text style={[styles.metricValue, { color: isDarkMode ? '#10b981' : '#059669' }]}>
                  {stats.yau || 0}
                </Text>
                <Text style={[styles.metricLabel, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>
                  Yearly Active Users
                </Text>
              </View>
            </View>
          </View>

          {/* Top Content */}
          <View style={styles.topContentContainer}>
            <View style={[styles.topContentCard, { backgroundColor: isDarkMode ? '#1f2937' : '#fff' }]}>
              <Text style={[styles.cardTitle, { color: isDarkMode ? '#fff' : '#1f2937' }]}>
                Top Foods
              </Text>
              {stats.topFoods?.slice(0, 5).map((food, index) => (
                <View key={food.name} style={styles.topItem}>
                  <View style={styles.topItemRank}>
                    <Text style={styles.rankText}>{index + 1}</Text>
                  </View>
                  <View style={styles.topItemContent}>
                    <Text style={[styles.topItemTitle, { color: isDarkMode ? '#fff' : '#1f2937' }]}>
                      {food.description}
                    </Text>
                    <Text style={[styles.topItemViews, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>
                      {food.views} views
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={[styles.topContentCard, { backgroundColor: isDarkMode ? '#1f2937' : '#fff' }]}>
              <Text style={[styles.cardTitle, { color: isDarkMode ? '#fff' : '#1f2937' }]}>
                Top Categories
              </Text>
              {stats.topCategories?.slice(0, 5).map((category, index) => (
                <View key={category.name} style={styles.topItem}>
                  <View style={styles.topItemRank}>
                    <Text style={styles.rankText}>{index + 1}</Text>
                  </View>
                  <View style={styles.topItemContent}>
                    <Text style={[styles.topItemTitle, { color: isDarkMode ? '#fff' : '#1f2937' }]}>
                      {category.name}
                    </Text>
                    <Text style={[styles.topItemViews, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>
                      {category.views} views
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#0a0a0a' : '#f8f9fa' }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDarkMode ? '#1f2937' : '#fff' }]}>
        <Text style={[styles.headerTitle, { color: isDarkMode ? '#fff' : '#1f2937' }]}>
          Admin Dashboard
        </Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <Ionicons 
            name="refresh" 
            size={24} 
            color={isDarkMode ? '#9ca3af' : '#6b7280'} 
          />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={[styles.tabContainer, { backgroundColor: isDarkMode ? '#1f2937' : '#fff' }]}>
        <TabButton
          id="overview"
          title="Overview"
          icon="grid"
          isActive={activeTab === 'overview'}
          onPress={() => setActiveTab('overview')}
        />
        <TabButton
          id="users"
          title="Users"
          icon="people"
          isActive={activeTab === 'users'}
          onPress={() => setActiveTab('users')}
        />
        <TabButton
          id="analytics"
          title="Analytics"
          icon="analytics"
          isActive={activeTab === 'analytics'}
          onPress={() => setActiveTab('analytics')}
        />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'analytics' && renderAnalytics()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#3d5584ff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  refreshButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#3d5584ff',
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: '#6366f1',
  },
  tabText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 18,
  },
  welcomeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  welcomeContent: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
  },
  welcomeIcon: {
    marginLeft: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: (width - 60) / 2,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  statCardContent: {
    padding: 16,
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statCardTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.9,
  },
  statCardIcon: {
    opacity: 0.8,
  },
  statCardValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statCardChange: {
    color: '#fff',
    fontSize: 11,
    opacity: 0.8,
  },
  quickActionsCard: {
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  quickActionButton: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 8,
  },
  quickActionText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  usersHeader: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  usersCount: {
    fontSize: 14,
    marginTop: 4,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userAvatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
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
    marginBottom: 8,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  userActions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  primaryAction: {
    backgroundColor: '#6366f1',
  },
  dangerAction: {
    backgroundColor: '#ef4444',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  analyticsCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  engagementMetrics: {
    alignItems: 'center',
  },
  metricItem: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 32,
    fontWeight: '700',
  },
  metricLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  topContentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  topContentCard: {
    width: (width - 60) / 2,
    padding: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  topItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  topItemRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  topItemContent: {
    flex: 1,
  },
  topItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  topItemViews: {
    fontSize: 12,
  },
});