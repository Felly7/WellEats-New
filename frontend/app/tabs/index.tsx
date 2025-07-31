// File: app/tabs/index.tsx

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  useColorScheme,
  Alert,
  Dimensions,
  Animated,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { getNutritionByIngredient } from '../../services/api';
import { getAllMeals, Meal as LocalMeal } from '../../services/localData';
import { getHealthProfile, HealthProfile } from '../../services/healthProfile';
import { filterAndRankMeals, getRecommendedCategories } from '../../services/foodRecommendation';

type ApiMeal = { idMeal: string; strMeal: string; strMealThumb: string; strCategory?: string; strTags?: string };
type Suggestion = {
  id: string;
  title: string;
  image: any;
  local: boolean;
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SLIDE_WIDTH = SCREEN_WIDTH * 0.85;
const CARD_WIDTH = SCREEN_WIDTH * 0.42;

export default function HomeScreen() {
  const isDark = useColorScheme() === 'dark';

  // Health profile
  const [healthProfile, setHealthProfile] = useState<HealthProfile | null>(null);

  // Search + suggestions
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [allLocal, setAllLocal] = useState<LocalMeal[]>([]);

  // Carousel
  const [featuredData, setFeaturedData] = useState<{ id: string; title: string; image: any }[]>([]);
  const scrollRef = useRef<ScrollView>(null);
  const [slideIndex, setSlideIndex] = useState(0);

  // Categories
  const [loading, setLoading] = useState(true);
  const [personalizedMeals, setPersonalizedMeals] = useState<ApiMeal[]>([]);
  const [recommendedMeals, setRecommendedMeals] = useState<ApiMeal[]>([]);
  const [exploreMeals, setExploreMeals] = useState<ApiMeal[]>([]);

  // Animations
  const [fadeAnim] = useState(new Animated.Value(0));
  const scrollY = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  // Header opacity based on scroll
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  // 1️⃣ Load health profile
  useEffect(() => {
    const loadHealthProfile = async () => {
      try {
        const profile = await getHealthProfile();
        setHealthProfile(profile);
      } catch (error) {
        console.error('Error loading health profile:', error);
      }
    };
    loadHealthProfile();
  }, []);

  // 2️⃣ Local + carousel (now filtered by health profile)
  useEffect(() => {
    const locals = getAllMeals();
    setAllLocal(locals);
    
    if (healthProfile) {
      // Filter local meals based on health profile
      const filteredLocals = filterAndRankMeals(locals, healthProfile);
      const pick = filteredLocals
        .slice(0, 6) // Take top 6 recommended
        .sort(() => Math.random() - 0.5) // Shuffle for variety
        .slice(0, 4) // Take 4 for carousel
        .map(m => ({ id: m.id, title: m.name, image: m.thumbnail }));
      setFeaturedData(pick);
    } else {
      // Fallback to random selection if no profile
      const pick = locals
        .sort(() => Math.random() - 0.5)
        .slice(0, 4)
        .map(m => ({ id: m.id, title: m.name, image: m.thumbnail }));
      setFeaturedData(pick);
    }
  }, [healthProfile]);

  // 3️⃣ Fetch API categories based on health profile
  useEffect(() => {
    if (!healthProfile) return;

    const fetchPersonalizedMeals = async () => {
      try {
        const recommendedCategories = getRecommendedCategories(healthProfile);
        
        // Fetch meals from recommended categories
        const categoryPromises = recommendedCategories.slice(0, 3).map(category =>
          fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`)
            .then(res => res.json())
            .catch(() => ({ meals: [] }))
        );

        const [cat1, cat2, cat3] = await Promise.all(categoryPromises);
        
        // Combine and filter meals based on health profile
        const allMeals = [
          ...(cat1.meals || []),
          ...(cat2.meals || []),
          ...(cat3.meals || [])
        ];

        const filteredMeals = filterAndRankMeals(allMeals, healthProfile);
        
        // Distribute meals across sections
        setPersonalizedMeals(filteredMeals.slice(0, 10));
        setRecommendedMeals(filteredMeals.slice(10, 20));
        setExploreMeals(filteredMeals.slice(20, 30));

      } catch (err) {
        console.error('Error fetching personalized meals:', err);
        // Fallback to default categories
        await fetchDefaultMeals();
      } finally {
        setLoading(false);
      }
    };

    const fetchDefaultMeals = async () => {
      try {
        const [bRes, rRes, eRes] = await Promise.all([
          fetch('https://www.themealdb.com/api/json/v1/1/filter.php?c=Breakfast'),
          fetch('https://www.themealdb.com/api/json/v1/1/filter.php?c=Seafood'),
          fetch('https://www.themealdb.com/api/json/v1/1/filter.php?c=Dessert'),
        ]);
        const bJson = await bRes.json();
        const rJson = await rRes.json();
        const eJson = await eRes.json();
        
        const breakfastMeals = filterAndRankMeals(bJson.meals || [], healthProfile);
        const seafoodMeals = filterAndRankMeals(rJson.meals || [], healthProfile);
        const dessertMeals = filterAndRankMeals(eJson.meals || [], healthProfile);
        
        setPersonalizedMeals(breakfastMeals);
        setRecommendedMeals(seafoodMeals);
        setExploreMeals(dessertMeals);
      } catch (err) {
        console.error(err);
        Alert.alert('Error', 'Could not load meals.');
      }
    };

    fetchPersonalizedMeals();
  }, [healthProfile]);

  // 4️⃣ Carousel auto-advance
  useEffect(() => {
    if (!featuredData.length) return;
    const iv = setInterval(() => {
      const next = (slideIndex + 1) % featuredData.length;
      setSlideIndex(next);
      scrollRef.current?.scrollTo({
        x: next * SLIDE_WIDTH,
        animated: true,
      });
    }, 4000);
    return () => clearInterval(iv);
  }, [slideIndex, featuredData]);

  // 5️⃣ Suggestions logic (now filtered by health profile)
  useEffect(() => {
    const q = search.trim();
    if (!q) {
      setSuggestions([]);
      return;
    }
    (async () => {
      // local matches
      let locs = allLocal
        .filter(m => m.name.toLowerCase().includes(q.toLowerCase()))
        .map(m => ({ id: m.id, title: m.name, image: m.thumbnail, local: true }));

      // Filter by health profile if available
      if (healthProfile) {
        const filteredLocalMeals = filterAndRankMeals(
          allLocal.filter(m => m.name.toLowerCase().includes(q.toLowerCase())),
          healthProfile
        );
        locs = filteredLocalMeals.map(m => ({ 
          id: m.id, 
          title: m.name, 
          image: m.thumbnail, 
          local: true 
        }));
      }

      // API search
      try {
        const res = await fetch(
          `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(q)}`
        );
        const json = await res.json();
        let apiMeals = json.meals || [];
        
        // Filter API results by health profile
        if (healthProfile) {
          apiMeals = filterAndRankMeals(apiMeals, healthProfile);
        }
        
        const apis: Suggestion[] = apiMeals.map((m: ApiMeal) => ({
          id: m.idMeal,
          title: m.strMeal,
          image: { uri: m.strMealThumb },
          local: false,
        }));
        
        setSuggestions([...locs, ...apis].slice(0, 8));
      } catch {
        setSuggestions(locs.slice(0, 8));
      }
    })();
  }, [search, allLocal, healthProfile]);

  if (loading || !healthProfile) {
    return (
      <View style={[styles.container, styles.loader, isDark && styles.darkBg]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <View style={styles.loaderContent}>
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={['#FF6B6B', '#4ECDC4']}
              style={styles.logoGradient}
            >
              <Ionicons name="restaurant" size={40} color="white" />
            </LinearGradient>
          </View>
          <ActivityIndicator size="large" color="#FF6B6B" style={styles.loadingSpinner} />
          <Text style={[styles.loadingText, isDark && styles.textDark]}>
            {!healthProfile ? 'Loading your preferences...' : 'Finding personalized meals...'}
          </Text>
          <Text style={[styles.loadingSubtext, isDark && styles.textSecondary]}>
            Creating your perfect meal experience
          </Text>
        </View>
      </View>
    );
  }

  const getSectionTitle = (section: string) => {
    switch (section) {
      case 'personalized':
        return healthProfile.dietary.vegetarian ? 'Perfect for Vegetarians' :
               healthProfile.dietary.vegan ? 'Vegan Favorites' :
               healthProfile.healthGoals.weightLoss ? 'Healthy Choices' :
               'Personalized for You';
      case 'recommended':
        return 'Trending & Recommended';
      case 'explore':
        return healthProfile.preferences.sweets ? 'Sweet Treats' : 'Explore New Flavors';
      default:
        return section;
    }
  };

  const getSectionIcon = (section: string) => {
    switch (section) {
      case 'personalized':
        return healthProfile.dietary.vegetarian ? 'leaf' : 
               healthProfile.dietary.vegan ? 'flower' :
               healthProfile.healthGoals.weightLoss ? 'fitness' : 'person';
      case 'recommended':
        return 'trending-up';
      case 'explore':
        return healthProfile.preferences.sweets ? 'ice-cream' : 'compass';
      default:
        return 'grid';
    }
  };

  const renderSlide = (item: any, idx: number) => {
    const active = idx === slideIndex;
    return (
      <Animated.View
        key={item.id}
        style={[
          styles.slide,
          { 
            width: SLIDE_WIDTH,
            transform: [
              { scale: active ? 1 : 0.92 },
              { translateY: active ? 0 : 10 }
            ]
          }
        ]}
      >
        <TouchableOpacity
          style={styles.slideContent}
          activeOpacity={0.9}
          onPress={() => router.push(`/details/${item.id}`)}
        >
          <Image source={item.image} style={styles.slideImage} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.slideGradient}
          />
          <View style={styles.slideTextContainer}>
            <Text style={styles.slideTitle}>{item.title}</Text>
            <View style={styles.slideMetadata}>
              <Ionicons name="time" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.slideTime}>Ready in 30 min</Text>
            </View>
          </View>
          {active && (
            <View style={styles.playButton}>
              <Ionicons name="play" size={16} color="white" />
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderCard = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[styles.card, isDark && styles.cardDark]} 
      onPress={() => router.push(`/details/${item.idMeal}`)}
      activeOpacity={0.9}
    >
      <Image source={{ uri: item.strMealThumb }} style={styles.cardImage} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.6)']}
        style={styles.cardGradient}
      />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={2}>{item.strMeal}</Text>
        <View style={styles.cardMeta}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={styles.ratingText}>4.8</Text>
          </View>
          <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.7)" />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, isDark && styles.darkBg]}>
      <StatusBar barStyle="light-content" />
      
      {/* Animated Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <LinearGradient
          colors={['#FF6B6B', '#4ECDC4']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <View style={styles.logoSmall}>
                <Ionicons name="restaurant" size={24} color="white" />
              </View>
              <View>
                <Text style={styles.appName}>WellEats</Text>
                <Text style={styles.appSubtitle}>Eat Better, Live Better</Text>
              </View>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity 
                onPress={() => router.push('/health-profile')}
                style={styles.headerButton}
              >
                <Ionicons name="person-circle-outline" size={26} color="white" />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => router.push('/favorites')}
                style={styles.headerButton}
              >
                <Ionicons name="heart" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        onStartShouldSetResponder={() => false}
      >
        {/* Health Profile Status */}
        <Animated.View style={[styles.profileStatus, isDark && styles.profileStatusDark, { opacity: fadeAnim }]}>
          <View style={styles.statusIndicator}>
            <Ionicons name="checkmark-circle" size={18} color="#4ECDC4" />
          </View>
          <View style={styles.statusContent}>
            <Text style={[styles.profileStatusText, isDark && styles.profileStatusTextDark]}>
              Personalized for your {healthProfile.dietary.vegetarian ? 'vegetarian' : 
                                    healthProfile.dietary.vegan ? 'vegan' : 
                                    healthProfile.healthGoals.weightLoss ? 'weight loss' : 'health'} goals
            </Text>
            <Text style={[styles.profileStatusSubtext, isDark && styles.textSecondary]}>
              Tap your profile to update preferences
            </Text>
          </View>
        </Animated.View>

        {/* Search Bar */}
        <Animated.View style={[styles.searchContainer, { opacity: fadeAnim }]}>
          <View style={[styles.searchBar, isDark && styles.searchBarDark]}>
            <Ionicons name="search" size={20} color="#FF6B6B" />
            <TextInput
              style={[styles.searchInput, isDark && styles.searchInputDark]}
              placeholder="What are you craving today?"
              placeholderTextColor={isDark ? '#888' : '#AAA'}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={20} color="#ccc" />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        {/* Modern Search Results */}
        {suggestions.length > 0 && (
          <Animated.View style={[styles.searchResults, isDark && styles.searchResultsDark, { opacity: fadeAnim }]}>
            <View style={styles.searchResultsHeader}>
              <Text style={[styles.searchResultsTitle, isDark && styles.textDark]}>
                Search Results ({suggestions.length})
              </Text>
              <TouchableOpacity 
                onPress={() => setSuggestions([])}
                style={[styles.closeSearchButton, isDark && styles.closeSearchButtonDark]}
              >
                <Ionicons name="close" size={18} color="#FF6B6B" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={suggestions}
              keyExtractor={i => (i.local ? `L-${i.id}` : `A-${i.id}`)}
              numColumns={2}
              columnWrapperStyle={styles.searchResultsRow}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.searchResultCard, isDark && styles.searchResultCardDark]}
                  onPress={() => {
                    setSuggestions([]);
                    setSearch('');
                    router.push(`/details/${item.id}`);
                  }}
                  activeOpacity={0.8}
                >
                  <Image source={item.image} style={styles.searchResultImage} />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.75)']}
                    style={styles.searchResultGradient}
                  />
                  <View style={styles.searchResultContent}>
                    <Text style={styles.searchResultTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <View style={styles.searchResultMeta}>
                      <View style={[
                        styles.searchResultBadge,
                        item.local ? styles.localBadge : styles.onlineBadge
                      ]}>
                        <Ionicons 
                          name={item.local ? "location" : "globe"} 
                          size={10} 
                          color="white" 
                        />
                        <Text style={styles.badgeText}>
                          {item.local ? 'Local' : 'Online'}
                        </Text>
                      </View>
                      <View style={styles.searchResultRating}>
                        <Ionicons name="star" size={10} color="#FFD700" />
                        <Text style={styles.searchRatingText}>4.8</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
          </Animated.View>
        )}

        {/* Featured Carousel */}
        <View style={styles.carouselSection}>
          <View style={styles.sectionHeaderContainer}>
            <Ionicons name="star" size={20} color="#FF6B6B" />
            <Text style={[styles.carouselTitle, isDark && styles.textDark]}>
              Featured for You
            </Text>
          </View>
          
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContainer}
            onMomentumScrollEnd={(event) => {
              const newIndex = Math.round(event.nativeEvent.contentOffset.x / SLIDE_WIDTH);
              setSlideIndex(newIndex);
            }}
          >
            {featuredData.map(renderSlide)}
          </ScrollView>
          
          <View style={styles.paginationContainer}>
            {featuredData.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  { backgroundColor: index === slideIndex ? '#FF6B6B' : '#E0E0E0' }
                ]}
              />
            ))}
          </View>
        </View>

        {/* Local Meals CTA */}
        <TouchableOpacity
          style={[styles.localMealsCTA, isDark && styles.localMealsCTADark]}
          onPress={() => router.push('/alllocal')}
        >
          <LinearGradient
            colors={['#4ECDC4', '#44A08D']}
            style={styles.ctaGradient}
          >
            <View style={styles.ctaContent}>
              <View style={styles.ctaIcon}>
                <Ionicons name="location" size={24} color="white" />
              </View>
              <View style={styles.ctaText}>
                <Text style={styles.ctaTitle}>Explore Local Cuisine</Text>
                <Text style={styles.ctaSubtitle}>Discover authentic recipes from your region</Text>
              </View>
              <Ionicons name="arrow-forward" size={20} color="white" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Meal Sections */}
        {[
          { data: personalizedMeals, key: 'personalized' },
          { data: recommendedMeals, key: 'recommended' },
          { data: exploreMeals, key: 'explore' }
        ].map(({ data, key }) => (
          <View key={key} style={styles.section}>
            <View style={styles.sectionHeaderContainer}>
              <Ionicons name={getSectionIcon(key)} size={20} color="#FF6B6B" />
              <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
                {getSectionTitle(key)}
              </Text>
            </View>
            <FlatList
              data={data}
              renderItem={renderCard}
              keyExtractor={(item, idx) => (item.idMeal ?? idx).toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.cardsList}
            />
          </View>
        ))}

        {/* Footer Spacer */}
        <View style={styles.footerSpacer} />
      </Animated.ScrollView>
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
  
  // Loader
  loader: {
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
  loadingSpinner: {
    marginVertical: 20,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  textDark: {
    color: '#ffffff',
  },
  textSecondary: {
    color: '#8b949e',
  },

  // Header
  header: {
    paddingTop: 50,
      zIndex: 10,
  },
  headerGradient: {
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  appSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    marginLeft: 16,
    padding: 4,
  },

  // Scroll Content
  scrollContent: {
    paddingBottom: 120,
  },

  // Profile Status
  profileStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 10,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  profileStatusDark: {
    backgroundColor: '#21262d',
  },
  statusIndicator: {
    marginRight: 12,
  },
  statusContent: {
    flex: 1,
  },
  profileStatusText: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '600',
  },
  profileStatusTextDark: {
    color: '#ffffff',
  },
  profileStatusSubtext: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },

  // Search
  searchContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#FF6B6B',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  searchBarDark: {
    backgroundColor: '#21262d',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#2c3e50',
  },
  searchInputDark: {
    color: '#ffffff',
  },

  // Modern Search Results
  searchResultCard: {
    width: '47%',
    height: 150,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'white',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  searchResultCardDark: {
    backgroundColor: '#30363d',
  },
  searchResultImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  searchResultGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
  },
  searchResultContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 14,
  },
  searchResultTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
    lineHeight: 16,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  searchResultMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  searchResultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  localBadge: {
    backgroundColor: 'rgba(76, 205, 196, 0.9)',
  },
  onlineBadge: {
    backgroundColor: 'rgba(255, 107, 107, 0.9)',
  },
  badgeText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
    marginLeft: 3,
  },
  searchResultRating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
  },
  searchRatingText: {
    fontSize: 10,
    color: 'white',
    marginLeft: 3,
    fontWeight: '600',
  },

  // Carousel
  carouselSection: {
    marginTop: 30,
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  carouselTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginLeft: 8,
  },
  carouselContainer: {
    paddingHorizontal: (SCREEN_WIDTH - SLIDE_WIDTH) / 2,
  },
  slide: {
    marginHorizontal: 8,
  },
  slideContent: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 25,
    elevation: 8,
  },
  slideImage: {
    width: '100%',
    height: 240,
    resizeMode: 'cover',
  },
  slideGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  slideTextContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  slideTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  slideMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slideTime: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 6,
  },
  playButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,107,107,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },

  // Local Meals CTA
  localMealsCTA: {
    marginHorizontal: 20,
    marginTop: 30,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 25,
    elevation: 8,
  },
  localMealsCTADark: {
    shadowColor: '#4ECDC4',
    shadowOpacity: 0.3,
  },
  ctaGradient: {
    padding: 20,
  },
  ctaContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ctaIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  ctaText: {
    flex: 1,
  },
  ctaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  ctaSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },

  // Section Styling
  section: {
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginLeft: 8,
  },
  cardsList: {
    paddingHorizontal: 12,
  },

  // Recipe Cards
  card: {
    width: CARD_WIDTH,
    marginHorizontal: 8,
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  cardDark: {
    backgroundColor: '#21262d',
  },
  cardImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  cardGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    lineHeight: 18,
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
    color: 'rgba(255,255,255,0.9)',
    marginLeft: 4,
    fontWeight: '500',
  },

  // Footer
  footerSpacer: {
    height: 40,
  },
searchResults: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 20,
    padding: 20,
    maxHeight: 420,
    shadowColor: '#FF6B6B',
    shadowOpacity: 0.12,
    shadowRadius: 25,
    elevation: 8,
  },
  searchResultsDark: {
    backgroundColor: '#21262d',
  },
  searchResultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchResultsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
  },
  closeSearchButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeSearchButtonDark: {
    backgroundColor: '#30363d',
  },
  searchResultsRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
});