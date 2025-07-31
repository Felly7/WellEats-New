// File: app/alllocal.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  useColorScheme,
  TextInput,
  StatusBar,
  Dimensions,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAllMeals, Meal } from '@/services/localData';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

export default function AllLocalMealsScreen() {
  const isDarkMode = useColorScheme() === 'dark';
  const router = useRouter();

  const [allMeals, setAllMeals] = useState<Meal[]>([]);
  const [filteredMeals, setFilteredMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));

  useEffect(() => {
    // Load all local meals on mount
    const data = getAllMeals();
    setAllMeals(data);
    setFilteredMeals(data);
    setLoading(false);
    
    // Animate entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Update filtered list when searchTerm changes
  useEffect(() => {
    const term = searchTerm.trim().toLowerCase();
    if (term === '') {
      setFilteredMeals(allMeals);
    } else {
      setFilteredMeals(
        allMeals.filter((meal) =>
          meal.name.toLowerCase().includes(term)
        )
      );
    }
  }, [searchTerm, allMeals]);

  const renderMealCard = ({ item, index }: { item: Meal; index: number }) => (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <TouchableOpacity
        style={[styles.mealCard, isDarkMode && styles.mealCardDark]}
        onPress={() => router.push(`/details/${item.id}`)}
        activeOpacity={0.8}
      >
        <View style={styles.imageContainer}>
          <Image source={item.thumbnail} style={styles.mealImage} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.imageOverlay}
          />
          <View style={styles.favoriteButton}>
            <TouchableOpacity activeOpacity={0.7}>
              <Ionicons name="heart-outline" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>
          <View style={styles.categoryBadge}>
            <BlurView intensity={80} style={styles.categoryBlur}>
              <Text style={styles.categoryText}>Local</Text>
            </BlurView>
          </View>
        </View>
        
        <View style={styles.cardContent}>
          <Text style={[styles.mealTitle, isDarkMode && styles.textDark]} numberOfLines={2}>
            {item.name}
          </Text>
          <View style={styles.cardFooter}>
            <View style={styles.metaRow}>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={12} color="#FFD700" />
                <Text style={[styles.ratingText, isDarkMode && styles.textSecondaryDark]}>
                  4.{Math.floor(Math.random() * 4) + 5}
                </Text>
              </View>
              <View style={styles.timeContainer}>
                <Ionicons name="time-outline" size={12} color="#4ECDC4" />
                <Text style={[styles.timeText, isDarkMode && styles.textSecondaryDark]}>
                  {Math.floor(Math.random() * 30) + 15}m
                </Text>
              </View>
            </View>
            <View style={styles.difficultyContainer}>
              <View style={[styles.difficultyDot, { opacity: 1 }]} />
              <View style={[styles.difficultyDot, { opacity: Math.random() > 0.5 ? 1 : 0.3 }]} />
              <View style={[styles.difficultyDot, { opacity: Math.random() > 0.7 ? 1 : 0.3 }]} />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderHeader = () => (
    <Animated.View 
      style={[
        styles.headerContent,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <View style={styles.titleSection}>
        <LinearGradient
          colors={['#FF6B6B', '#4ECDC4']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.titleGradient}
        >
          <Text style={styles.gradientTitle}>Back to Your Roots</Text>
        </LinearGradient>
        <Text style={[styles.subtitle, isDarkMode && styles.textSecondaryDark]}>
          {filteredMeals.length} authentic local recipes from your heritage
        </Text>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, isDarkMode && styles.statCardDark]}>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: '#FF6B6B20' }]}>
                <Ionicons name="restaurant" size={16} color="#FF6B6B" />
              </View>
              <Text style={[styles.statNumber, isDarkMode && styles.textDark]}>{allMeals.length}</Text>
              <Text style={[styles.statLabel, isDarkMode && styles.textSecondaryDark]}>Recipes</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: '#4ECDC420' }]}>
                <Ionicons name="location" size={16} color="#4ECDC4" />
              </View>
              <Text style={[styles.statNumber, isDarkMode && styles.textDark]}>12</Text>
              <Text style={[styles.statLabel, isDarkMode && styles.textSecondaryDark]}>Regions</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: '#FFD93D20' }]}>
                <Ionicons name="heart" size={16} color="#FFD93D" />
              </View>
              <Text style={[styles.statNumber, isDarkMode && styles.textDark]}>98%</Text>
              <Text style={[styles.statLabel, isDarkMode && styles.textSecondaryDark]}>Loved</Text>
            </View>
          </View>
        </View>
      </View>
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={[styles.container, isDarkMode && styles.darkBg]}>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={['#FF6B6B', '#4ECDC4']}
          style={styles.loadingGradient}
        >
          <View style={styles.loaderContent}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                style={styles.logoGradient}
              >
                <Ionicons name="location" size={40} color="white" />
              </LinearGradient>
            </View>
            <Text style={styles.loadingText}>Discovering Local Flavors...</Text>
            <Text style={styles.loadingSubtext}>Gathering authentic recipes from your region</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDarkMode && styles.darkBg]}>
      <StatusBar barStyle="light-content" />
      
      {/* Header with gradient background */}
      <LinearGradient
        colors={['#FF6B6B', '#4ECDC4']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContainer}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <BlurView intensity={20} style={styles.backButtonBlur}>
                <Ionicons name="chevron-back" size={24} color="#FFF" />
              </BlurView>
            </TouchableOpacity>
            
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Local Cuisine</Text>
              <Text style={styles.headerSubtitle}>Authentic & Traditional</Text>
            </View>
            
            <TouchableOpacity style={styles.menuButton} activeOpacity={0.7}>
              <BlurView intensity={20} style={styles.menuButtonBlur}>
                <Ionicons name="filter" size={22} color="#FFF" />
              </BlurView>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Search Bar */}
      <Animated.View 
        style={[
          styles.searchContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <BlurView 
          intensity={isDarkMode ? 20 : 30} 
          style={[styles.searchBar, isDarkMode && styles.searchBarDark]}
        >
          <View style={styles.searchIconContainer}>
            <Ionicons name="search-outline" size={20} color="#FF6B6B" />
          </View>
          <TextInput
            style={[styles.searchInput, isDarkMode && styles.searchInputDark]}
            placeholder="Search local recipes..."
            placeholderTextColor={isDarkMode ? '#8b949e' : '#7f8c8d'}
            value={searchTerm}
            onChangeText={setSearchTerm}
            selectionColor="#FF6B6B"
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity 
              onPress={() => setSearchTerm('')}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color={isDarkMode ? '#8b949e' : '#7f8c8d'} />
            </TouchableOpacity>
          )}
        </BlurView>
      </Animated.View>

      {/* Content */}
      {filteredMeals.length === 0 ? (
        <Animated.View 
          style={[
            styles.emptyContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.emptyIconContainer}>
            <LinearGradient
              colors={['#FF6B6B20', '#4ECDC420']}
              style={styles.emptyIconGradient}
            >
              <Ionicons name="restaurant-outline" size={60} color={isDarkMode ? '#8b949e' : '#7f8c8d'} />
            </LinearGradient>
          </View>
          <Text style={[styles.emptyTitle, isDarkMode && styles.textDark]}>
            {searchTerm ? 'No matching recipes' : 'No local meals yet'}
          </Text>
          <Text style={[styles.emptySubtitle, isDarkMode && styles.textSecondaryDark]}>
            {searchTerm 
              ? 'Try adjusting your search terms or explore our full collection' 
              : 'Start building your collection of authentic local recipes'}
          </Text>
          {searchTerm && (
            <TouchableOpacity 
              style={styles.clearSearchButton}
              onPress={() => setSearchTerm('')}
            >
              <LinearGradient
                colors={['#4ECDC4', '#44A08D']}
                style={styles.clearSearchGradient}
              >
                <Text style={styles.clearSearchText}>Clear Search</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </Animated.View>
      ) : (
        <FlatList
          data={filteredMeals}
          keyExtractor={(item) => item.id}
          renderItem={renderMealCard}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          numColumns={2}
          columnWrapperStyle={styles.row}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  darkBg: {
    backgroundColor: '#0d1117',
  },

  // Loading States
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderContent: {
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    paddingHorizontal: 40,
  },

  // Header Styles
  headerGradient: {
    paddingBottom: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    width: 44,
    height: 44,
  },
  backButtonBlur: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  menuButton: {
    width: 44,
    height: 44,
  },
  menuButtonBlur: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },

  // Search Styles
  searchContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    zIndex: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 25,
    paddingHorizontal: 6,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  searchBarDark: {
    backgroundColor: 'rgba(33,38,45,0.95)',
  },
  searchIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FF6B6B20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  searchInputDark: {
    color: '#ffffff',
  },
  clearButton: {
    padding: 8,
  },

  // Header Content
  headerContent: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  titleSection: {
    marginBottom: 20,
  },
  titleGradient: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
  },
  gradientTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    fontWeight: '500',
    lineHeight: 22,
  },

  // Stats Container
  statsContainer: {
    marginTop: 4,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
  },
  statCardDark: {
    backgroundColor: '#21262d',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2c3e50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 20,
  },

  // List Styles
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  row: {
    justifyContent: 'space-between',
  },
  cardWrapper: {
    width: (width - 60) / 2,
    marginBottom: 20,
  },

  // Meal Card Styles
  mealCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  mealCardDark: {
    backgroundColor: '#21262d',
    shadowColor: '#000',
    shadowOpacity: 0.3,
  },
  imageContainer: {
    position: 'relative',
    height: 140,
  },
  mealImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  categoryBlur: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  categoryText: {
    fontSize: 11,
    color: 'white',
    fontWeight: '700',
  },
  cardContent: {
    padding: 16,
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 12,
    lineHeight: 22,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7f8c8d',
    marginLeft: 4,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7f8c8d',
    marginLeft: 4,
  },
  difficultyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ECDC4',
    marginLeft: 2,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    marginBottom: 24,
  },
  emptyIconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2c3e50',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  clearSearchButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  clearSearchGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  clearSearchText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },

  // Text Colors
  textDark: {
    color: '#ffffff',
  },
  textSecondaryDark: {
    color: '#8b949e',
  },
});