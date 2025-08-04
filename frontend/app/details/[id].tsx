// File: app/details/[id].tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  getMealDetails,
  getNutritionByIngredient,
  getAllergenFlags,
} from '../../services/api';
import { getMealById, Meal } from '@/services/localData';
import FoodAIAssistant from '../components/FoodAIAssistant';

type IngredientInfo = {
  name: string;
  measure: string;
  nutrition: {
    calories: number;
    protein:  number;
    fat:      number;
    sugars:   number;
    sodium:   number;
  };
  allergens: string[];
};

const FAVORITES_KEY = 'FAVORITES';
const HISTORY_KEY   = 'HISTORY';
const MAX_HISTORY   = 50;
const { width } = Dimensions.get('window');

export default function DetailsScreen() {
  const { id }             = useLocalSearchParams<{ id: string }>();
  const isDarkMode         = useColorScheme() === 'dark';
  const router             = useRouter();

  const [dish, setDish]               = useState<any>(null);
  const [loadingDish, setLoadingDish] = useState(true);
  const [ingredients, setIngredients]     = useState<IngredientInfo[]>([]);
  const [loadingNutrition, setLoadingNut] = useState(true);
  const [isFavorite, setIsFavorite]       = useState(false);
  const [localMeal, setLocalMeal] = useState<Meal | null>(null);
  const [loadingLocal, setLoadingLocal] = useState(true);
  const [scrollY] = useState(new Animated.Value(0));

  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    // Animate content in
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
  }, []);

  // 1️⃣ Fetch meal: check local dataset first, then remote; check favorite & record history
  useEffect(() => {
    (async () => {
      // Try local dataset first
      const m = getMealById(id);
      if (m) {
        setLocalMeal(m);
        // Build a minimal `dish` object so UI code can rely on it if needed
        setDish({
          idMeal: m.id,
          strMeal: m.name,
          strMealThumb: m.thumbnail,
          strInstructions: m.instructions,
        });
        // Check favorites (using the same key logic as remote)
        const favJson = await AsyncStorage.getItem(FAVORITES_KEY);
        const favList = favJson ? JSON.parse(favJson) : [];
        setIsFavorite(favList.some((f: any) => f.idMeal === m.id));

        // Record to history for local meal
        const histJson = await AsyncStorage.getItem(HISTORY_KEY);
        let histList = histJson ? JSON.parse(histJson) : [];
        const newEntry = {
          idMeal:       m.id,
          strMeal:      m.name,
          strMealThumb: m.thumbnail,
          viewedAt:     Date.now(),
        };
        // Prepend and dedupe
        histList = [
          newEntry,
          ...histList.filter((h: any) => h.idMeal !== m.id),
        ];
        if (histList.length > MAX_HISTORY) {
          histList = histList.slice(0, MAX_HISTORY);
        }
        await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(histList));

        setLoadingLocal(false);
        // Skip remote fetch entirely
        return;
      }

      // If not local, fetch remote
      try {
        const data = await getMealDetails(id);
        setDish(data);

        // Favorite check for remote
        const favJson = await AsyncStorage.getItem(FAVORITES_KEY);
        const favList = favJson ? JSON.parse(favJson) : [];
        setIsFavorite(favList.some((f: any) => f.idMeal === data.idMeal));

        // Record remote to history
        const histJson = await AsyncStorage.getItem(HISTORY_KEY);
        let histList = histJson ? JSON.parse(histJson) : [];
        const newEntry = {
          idMeal:       data.idMeal,
          strMeal:      data.strMeal,
          strMealThumb: data.strMealThumb,
          viewedAt:     Date.now(),
        };
        histList = [
          newEntry,
          ...histList.filter((h: any) => h.idMeal !== data.idMeal),
        ];
        if (histList.length > MAX_HISTORY) {
          histList = histList.slice(0, MAX_HISTORY);
        }
        await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(histList));
      } catch (e) {
        console.error('Error fetching dish:', e);
      } finally {
        setLoadingDish(false);
      }
    })();
  }, [id]);

  // Toggle favorite (works for both local and remote)
  const toggleFavorite = async () => {
    const json = await AsyncStorage.getItem(FAVORITES_KEY);
    let list   = json ? JSON.parse(json) : [];
    if (isFavorite) {
      list = list.filter((f: any) => f.idMeal !== dish.idMeal);
    } else {
      list.push({
        idMeal:       dish.idMeal,
        strMeal:      dish.strMeal,
        strMealThumb: dish.strMealThumb,
      });
    }
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(list));
    setIsFavorite(!isFavorite);
  };

  // 2️⃣ If remote dish, parse ingredients + fetch nutrition/allergens
  useEffect(() => {
    if (!dish || localMeal) return;
    (async () => {
      const list: { name: string; measure: string }[] = [];
      for (let i = 1; i <= 20; i++) {
        const name    = dish[`strIngredient${i}`]?.trim();
        const measure = dish[`strMeasure${i}`]?.trim();
        if (name) list.push({ name, measure });
      }
      const enriched = await Promise.all(
        list.map(async ({ name, measure }) => {
          try {
            const nut  = await getNutritionByIngredient(name);
            const aler = await getAllergenFlags(name);
            return { name, measure, nutrition: nut, allergens: aler };
          } catch {
            return {
              name,
              measure,
              nutrition: { calories:0, protein:0, fat:0, sugars:0, sodium:0 },
              allergens: [],
            };
          }
        })
      );
      setIngredients(enriched);
      setLoadingNut(false);
    })();
  }, [dish, localMeal]);

  // Parallax effect for header image
  const headerImageScale = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [1.2, 1],
    extrapolateLeft: 'extend',
    extrapolateRight: 'clamp',
  });

  const headerImageOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [1, 0.8],
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Show loader until either local or remote data is ready
  if ((localMeal && loadingLocal) || (!localMeal && loadingDish)) {
    return (
      <View style={[styles.loader, isDarkMode && styles.darkBg]}>
        <View style={styles.loaderContent}>
          <ActivityIndicator size="large" color="#FF6B6B" />
          <Text style={[styles.loadingText, { color: isDarkMode ? '#FFF' : '#666' }]}>
            Loading delicious details...
          </Text>
        </View>
      </View>
    );
  }

  // If local meal found, render its details
if (localMeal) {
  return (
    <View style={[styles.container, isDarkMode && styles.darkBg]}>
      <Animated.ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* All your existing hero, content, etc. - keep exactly as is */}
        <View style={styles.heroContainer}>
          <Animated.Image 
            source={localMeal.thumbnail} 
            style={[
              styles.heroImage,
              {
                transform: [{ scale: headerImageScale }],
                opacity: headerImageOpacity,
              }
            ]} 
          />
          <View style={styles.heroOverlay} />
          
          {/* Floating Action Buttons */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.favoriteButton} onPress={toggleFavorite}>
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={isFavorite ? '#FF6B6B' : 'white'}
            />
          </TouchableOpacity>
        </View>

        {/* Content Section - keep all existing content */}
        <Animated.View 
          style={[
            styles.contentContainer, 
            { backgroundColor: isDarkMode ? '#1a1a1a' : '#FFF' },
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          {/* All your existing content sections - keep as is */}
          <View style={styles.titleSection}>
            <Text style={[styles.title, isDarkMode && styles.textDark]}>
              {localMeal.name}
            </Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{localMeal.category}</Text>
            </View>
          </View>

          {/* Nutrition Cards */}
          <View style={styles.nutritionGrid}>
            <View style={[styles.nutritionCard, isDarkMode && styles.darkCard]}>
              <Ionicons name="flame" size={20} color="#FF6B6B" />
              <Text style={[styles.nutritionValue, isDarkMode && styles.textDark]}>
                {localMeal.nutrition.calories}
              </Text>
              <Text style={[styles.nutritionLabel, isDarkMode && styles.textSecondary]}>
                Calories
              </Text>
            </View>
            <View style={[styles.nutritionCard, isDarkMode && styles.darkCard]}>
              <Ionicons name="fitness" size={20} color="#4ECDC4" />
              <Text style={[styles.nutritionValue, isDarkMode && styles.textDark]}>
                {localMeal.nutrition.protein}g
              </Text>
              <Text style={[styles.nutritionLabel, isDarkMode && styles.textSecondary]}>
                Protein
              </Text>
            </View>
            <View style={[styles.nutritionCard, isDarkMode && styles.darkCard]}>
              <Ionicons name="water" size={20} color="#45B7D1" />
              <Text style={[styles.nutritionValue, isDarkMode && styles.textDark]}>
                {localMeal.nutrition.fat}g
              </Text>
              <Text style={[styles.nutritionLabel, isDarkMode && styles.textSecondary]}>
                Fat
              </Text>
            </View>
            <View style={[styles.nutritionCard, isDarkMode && styles.darkCard]}>
              <Ionicons name="leaf" size={20} color="#96CEB4" />
              <Text style={[styles.nutritionValue, isDarkMode && styles.textDark]}>
                {localMeal.nutrition.carbs}g
              </Text>
              <Text style={[styles.nutritionLabel, isDarkMode && styles.textSecondary]}>
                Carbs
              </Text>
            </View>
          </View>

          {/* Instructions Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="book" size={20} color="#FF6B6B" />
              <Text style={[styles.sectionTitle, isDarkMode && styles.textDark]}>
                Instructions
              </Text>
            </View>
            <Text style={[styles.instructions, isDarkMode && styles.textSecondary]}>
              {localMeal.instructions}
            </Text>
          </View>

          {/* Ingredients Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="list" size={20} color="#4ECDC4" />
              <Text style={[styles.sectionTitle, isDarkMode && styles.textDark]}>
                Ingredients
              </Text>
            </View>
            <View style={styles.ingredientsList}>
              {localMeal.ingredients.map((ing, idx) => (
                <View key={idx} style={[styles.ingredientItem, isDarkMode && styles.darkCard]}>
                  <View style={styles.ingredientDot} />
                  <Text style={[styles.ingredientText, isDarkMode && styles.textDark]}>
                    {ing}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>
      </Animated.ScrollView>

      {/* ADD THE AI COMPONENT HERE */}
      <FoodAIAssistant 
        foodName={localMeal.name}
        mealId={localMeal.id}
        isVisible={true}
      />
    </View>
  );
}

// For REMOTE MEAL section, replace the return statement with:
return (
  <View style={[styles.container, isDarkMode && styles.darkBg]}>
    <Animated.ScrollView
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: false }
      )}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
    >
      {/* All your existing content - keep exactly as is */}
      <View style={styles.heroContainer}>
        <Animated.Image 
          source={{ uri: dish.strMealThumb }} 
          style={[
            styles.heroImage,
            {
              transform: [{ scale: headerImageScale }],
              opacity: headerImageOpacity,
            }
          ]} 
        />
        <View style={styles.heroOverlay} />
        
        {/* Floating Action Buttons */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.favoriteButton} onPress={toggleFavorite}>
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={24}
            color={isFavorite ? '#FF6B6B' : 'white'}
          />
        </TouchableOpacity>
      </View>

      {/* Content Section - keep all existing content */}
      <Animated.View 
        style={[
          styles.contentContainer, 
          { backgroundColor: isDarkMode ? '#1a1a1a' : '#FFF' },
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}
      >
        {/* All your existing sections - keep exactly as is */}
        <View style={styles.titleSection}>
          <Text style={[styles.title, isDarkMode && styles.textDark]}>
            {dish.strMeal}
          </Text>
        </View>

        {/* Instructions Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="book" size={20} color="#FF6B6B" />
            <Text style={[styles.sectionTitle, isDarkMode && styles.textDark]}>
              Instructions
            </Text>
          </View>
          <Text style={[styles.instructions, isDarkMode && styles.textSecondary]}>
            {dish.strInstructions}
          </Text>
        </View>

        {/* Ingredients & Nutrition Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="nutrition" size={20} color="#4ECDC4" />
            <Text style={[styles.sectionTitle, isDarkMode && styles.textDark]}>
              Ingredients & Nutrition
            </Text>
          </View>

          {loadingNutrition ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#FF6B6B" />
              <Text style={[styles.loadingText, isDarkMode && styles.textSecondary]}>
                Loading nutrition data...
              </Text>
            </View>
          ) : ingredients.length > 0 ? (
            <View style={styles.ingredientsGrid}>
              {ingredients.map((ing, idx) => (
                <View key={idx} style={[styles.ingredientCard, isDarkMode && styles.darkCard]}>
                  <View style={styles.ingredientHeader}>
                    <Text style={[styles.ingredientName, isDarkMode && styles.textDark]}>
                      {ing.name}
                    </Text>
                    <Text style={[styles.ingredientMeasure, isDarkMode && styles.textSecondary]}>
                      {ing.measure}
                    </Text>
                  </View>
                  
                  <View style={styles.nutritionRow}>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionNumber}>{ing.nutrition.calories}</Text>
                      <Text style={styles.nutritionUnit}>cal</Text>
                    </View>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionNumber}>{ing.nutrition.protein}</Text>
                      <Text style={styles.nutritionUnit}>p</Text>
                    </View>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionNumber}>{ing.nutrition.fat}</Text>
                      <Text style={styles.nutritionUnit}>f</Text>
                    </View>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionNumber}>{ing.nutrition.sugars}</Text>
                      <Text style={styles.nutritionUnit}>s</Text>
                    </View>
                  </View>

                  {ing.allergens.length > 0 && (
                    <View style={styles.allergensContainer}>
                      {ing.allergens.map((allergen, i) => (
                        <View key={i} style={styles.allergenTag}>
                          <Text style={styles.allergenText}>
                            {allergen.replace('en:', '')}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="sad" size={40} color="#ccc" />
              <Text style={[styles.emptyText, isDarkMode && styles.textSecondary]}>
                No ingredient data available
              </Text>
            </View>
          )}
        </View>
      </Animated.View>
    </Animated.ScrollView>

    {/* ADD THE AI COMPONENT HERE */}
    <FoodAIAssistant 
      foodName={dish.strMeal}
      mealId={dish.idMeal}
      isVisible={true}
    />
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
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loaderContent: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },

  // Hero Section
  heroContainer: {
    height: 320,
    position: 'relative',
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  favoriteButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },

  // Content Section
  contentContainer: {
    marginTop: -30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
    minHeight: 600,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },

  // Title Section
  titleSection: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
    lineHeight: 34,
  },
  textDark: {
    color: '#ffffff',
  },
  textSecondary: {
    color: '#8b949e',
  },
  categoryBadge: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  categoryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Nutrition Grid
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  nutritionCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    marginHorizontal: 4,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  darkCard: {
    backgroundColor: '#21262d',
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 8,
  },
  nutritionLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
    fontWeight: '500',
  },

  // Sections
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginLeft: 8,
  },
  instructions: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
  },

  // Ingredients List (Local)
  ingredientsList: {
    marginTop: 8,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  ingredientDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ECDC4',
    marginRight: 12,
  },
  ingredientText: {
    fontSize: 16,
    color: '#2c3e50',
    flex: 1,
  },

  // Ingredients Grid (Remote)
  ingredientsGrid: {
    marginTop: 8,
  },
  ingredientCard: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  ingredientHeader: {
    marginBottom: 12,
  },
  ingredientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  ingredientMeasure: {
    fontSize: 14,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  nutritionUnit: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },

  // Allergens
  allergensContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  allergenTag: {
    backgroundColor: '#FFE5E5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  allergenText: {
    fontSize: 10,
    color: '#E63946',
    fontWeight: '600',
    textTransform: 'uppercase',
  },

  // Loading and Empty States
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 12,
    textAlign: 'center',
  },
});