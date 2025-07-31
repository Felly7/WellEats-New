// app/favorites/index.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Animated,
  Dimensions,
  StatusBar,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const FAVORITES_KEY = 'FAVORITES';
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 60) / 2;

export default function FavoritesScreen() {
  const isDarkMode = useColorScheme() === 'dark';
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  const colors = {
    background: isDarkMode ? '#0d1117' : '#f8f9fa',
    cardBg: isDarkMode ? '#21262d' : '#ffffff',
    text: isDarkMode ? '#ffffff' : '#2c3e50',
    textSecondary: isDarkMode ? '#8b949e' : '#7f8c8d',
    headerBg: isDarkMode ? '#161b22' : '#ffffff',
    shadow: isDarkMode ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)',
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const json = await AsyncStorage.getItem(FAVORITES_KEY);
      const list = json ? JSON.parse(json) : [];
      setFavorites(list);
      
      // Start animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (itemId: string) => {
    try {
      const updatedFavorites = favorites.filter(item => item.idMeal !== itemId);
      setFavorites(updatedFavorites);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const renderFavoriteCard = ({ item, index }: { item: any; index: number }) => {
    const animatedValue = new Animated.Value(0);
    
    const animateCard = () => {
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    };

    const cardScale = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0.95],
    });

    return (
      <Animated.View
        style={[
          styles.favoriteCard,
          {
            backgroundColor: colors.cardBg,
            shadowColor: colors.shadow,
            transform: [
              { scale: cardScale },
              { 
                translateY: slideAnim.interpolate({
                  inputRange: [0, 50],
                  outputRange: [0, index * 10],
                })
              }
            ],
            opacity: fadeAnim,
          }
        ]}
      >
        <TouchableOpacity
          style={styles.cardTouchable}
          onPress={() => {
            animateCard();
            setTimeout(() => router.push(`/details/${item.idMeal}`), 200);
          }}
          activeOpacity={0.9}
        >
          <View style={styles.imageContainer}>
            <Image source={{ uri: item.strMealThumb }} style={styles.cardImage} />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.6)']}
              style={styles.imageGradient}
            />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeFavorite(item.idMeal)}
            >
              <BlurView intensity={80} style={styles.removeButtonBlur}>
                <Ionicons name="heart" size={18} color="#FF4757" />
              </BlurView>
            </TouchableOpacity>
          </View>
          
          <View style={styles.cardContent}>
            <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>
              {item.strMeal}
            </Text>
            <View style={styles.cardMeta}>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={14} color="#FFD700" />
                <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
                  4.8
                </Text>
              </View>
              <View style={styles.timeContainer}>
                <Ionicons name="time" size={14} color="#4ECDC4" />
                <Text style={[styles.timeText, { color: colors.textSecondary }]}>
                  30 min
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderEmptyState = () => (
    <Animated.View 
      style={[
        styles.emptyContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <LinearGradient
        colors={['#FF6B6B', '#4ECDC4']}
        style={styles.emptyIconContainer}
      >
        <Ionicons name="heart-outline" size={60} color="white" />
      </LinearGradient>
      
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        No Favorites Yet
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        Start exploring recipes and add your favorites by tapping the heart icon
      </Text>
      
      <TouchableOpacity
        style={styles.exploreButton}
        onPress={() => router.push('/')}
      >
        <LinearGradient
          colors={['#FF6B6B', '#4ECDC4']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.exploreButtonGradient}
        >
          <Ionicons name="compass" size={20} color="white" />
          <Text style={styles.exploreButtonText}>Explore Recipes</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <View style={styles.loaderContainer}>
          <LinearGradient
            colors={['#FF6B6B', '#4ECDC4']}
            style={styles.loaderGradient}
          >
            <Ionicons name="heart" size={30} color="white" />
          </LinearGradient>
          <ActivityIndicator size="large" color="#FF6B6B" style={styles.loader} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading your favorites...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <SafeAreaView>
        <Animated.View 
          style={[
            styles.header,
            { 
              backgroundColor: colors.headerBg,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <LinearGradient
              colors={['#FF6B6B', '#4ECDC4']}
              style={styles.headerIcon}
            >
              <Ionicons name="heart" size={20} color="white" />
            </LinearGradient>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              My Favorites
            </Text>
          </View>
          
          <View style={styles.headerRight}>
            <Text style={[styles.favoritesCount, { color: colors.textSecondary }]}>
              {favorites.length} {favorites.length === 1 ? 'recipe' : 'recipes'}
            </Text>
          </View>
        </Animated.View>
      </SafeAreaView>

      {/* Content */}
      <View style={styles.content}>
        {favorites.length === 0 ? (
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {renderEmptyState()}
          </ScrollView>
        ) : (
          <Animated.View style={{ opacity: fadeAnim }}>
            <FlatList
              data={favorites}
              renderItem={renderFavoriteCard}
              keyExtractor={(item) => item.idMeal}
              numColumns={2}
              contentContainerStyle={styles.favoritesGrid}
              columnWrapperStyle={styles.gridRow}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={
                <View style={styles.gridHeader}>
                  <Text style={[styles.gridHeaderText, { color: colors.textSecondary }]}>
                    Tap any recipe to view details or remove from favorites
                  </Text>
                </View>
              }
              ListFooterComponent={<View style={styles.gridFooter} />}
            />
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Loader
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loader: {
    marginVertical: 20,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  favoritesCount: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Content
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  exploreButton: {
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#FF6B6B',
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  exploreButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 15,
  },
  exploreButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },

  // Favorites Grid
  favoritesGrid: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  gridRow: {
    justifyContent: 'space-between',
  },
  gridHeader: {
    marginBottom: 20,
    paddingTop: 10,
  },
  gridHeaderText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  gridFooter: {
    height: 20,
  },

  // Favorite Cards
  favoriteCard: {
    width: CARD_WIDTH,
    borderRadius: 20,
    marginBottom: 20,
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
    overflow: 'hidden',
  },
  cardTouchable: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  removeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    borderRadius: 20,
    overflow: 'hidden',
  },
  removeButtonBlur: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: 10,
  },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
});