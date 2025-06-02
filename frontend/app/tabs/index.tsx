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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { getMealsByCategory } from '../../services/api';
import { getAllMeals, Meal } from '../../services/localData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
// make each slide 4/6 of screen width
const SLIDE_WIDTH = SCREEN_WIDTH * (4 / 6);
const SIDE_MARGIN = (SCREEN_WIDTH - SLIDE_WIDTH) / 2;

// Simple Fisher–Yates shuffle for randomizing meals
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function HomeScreen() {
  const isDark = useColorScheme() === 'dark';

  // Search
  const [search, setSearch] = useState('');
  // State to hold exactly three random featured cards
  const [featuredData, setFeaturedData] = useState<
    { id: string; title: string; image: any }[]
  >([]);

  // Carousel
  const scrollRef = useRef<ScrollView>(null);
  const [slideIndex, setSlideIndex] = useState(0);

  // On mount: pick three random meals for featured carousel
  useEffect(() => {
    const allLocalMeals = getAllMeals(); // entire array from JSON
    const randomThree: Meal[] = shuffleArray(allLocalMeals).slice(0, 4);

    // Map them to the shape our carousel expects:
    const threeCards = randomThree.map((m) => ({
      id:    m.id,
      title: m.name,
      image: m.thumbnail, // already a require(...) from localData.ts
    }));

    setFeaturedData(threeCards);
  }, []);

  // Auto‐advance the carousel every 3 seconds
  useEffect(() => {
    if (featuredData.length === 0) return;
    const iv = setInterval(() => {
      const next = (slideIndex + 1) % featuredData.length;
      setSlideIndex(next);
      scrollRef.current?.scrollTo({
        x: next * (SLIDE_WIDTH + 16),
        animated: true,
      });
    }, 3000);
    return () => clearInterval(iv);
  }, [slideIndex, featuredData]);

  // Meals
  const [loading, setLoading] = useState(true);
  const [breakfastMeals, setBreakfastMeals]     = useState<any[]>([]);
  const [recommendedMeals, setRecommendedMeals] = useState<any[]>([]);
  const [exploreMeals, setExploreMeals]         = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const b = await getMealsByCategory('Breakfast');
        const r = await getMealsByCategory('Seafood');
        const e = await getMealsByCategory('Dessert');
        setBreakfastMeals(b.meals || []);
        setRecommendedMeals(r.meals || []);
        setExploreMeals(e.meals || []);
      } catch (err) {
        console.error(err);
        Alert.alert('Error', 'Could not load meals.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Show loader if category‐based meals still loading OR featuredData isn’t ready
  if (loading || featuredData.length === 0) {
    return (
      <View style={[styles.loader, isDark && styles.darkBg]}>
        <ActivityIndicator size="large" color={isDark ? '#FFF' : '#000'} />
      </View>
    );
  }

  // Render a carousel slide
  const renderSlide = (
    item: { id: string; title: string; image: any },
    idx: number
  ) => {
    const active = idx === slideIndex;
    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.slide,
          {
            width: SLIDE_WIDTH,
            marginHorizontal: 8,
            transform: [{ scale: active ? 1.05 : 0.9 }],
          },
          isDark && styles.slideDark,
        ]}
        activeOpacity={0.9}
        onPress={() => router.push(`/details/${item.id}`)}
      >
        <Image source={item.image} style={styles.slideImage} />
        <View style={styles.slideOverlay} />
        <Text style={styles.slideTitle}>{item.title}</Text>
      </TouchableOpacity>
    );
  };

  // Render a recipe card for Popular/Trending/Sweet sections
  const renderCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/details/${item.idMeal}`)}
    >
      <Image source={{ uri: item.strMealThumb }} style={styles.image} />
      <View style={styles.overlay} />
      <Text style={styles.cardTitle}>{item.strMeal}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, isDark && styles.darkBg]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appName}>WellEats</Text>
        <TouchableOpacity onPress={() => router.push('/favorites')}>
          <Ionicons name="heart" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchBar, isDark && styles.searchBarDark]}>
        <Ionicons name="search-outline" size={20} color={isDark ? '#AAA' : '#666'} />
        <TextInput
          style={[styles.searchInput, isDark && styles.searchInputDark]}
          placeholder="Search foods and recipes..."
          placeholderTextColor={isDark ? '#888' : '#AAA'}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Everything below scrolls */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Carousel */}
        <View>
          <ScrollView
            ref={scrollRef}
            horizontal
            snapToInterval={SLIDE_WIDTH + 16}
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: SIDE_MARGIN,
            }}
          >
            {featuredData.map((item, idx) => renderSlide(item, idx))}
          </ScrollView>
          <View style={styles.indicator}>
            <Text style={styles.indicatorText}>
              {slideIndex + 1}/{featuredData.length}
            </Text>
          </View>
        </View>

        {/* “See All Local Meals” button centered beneath carousel */}
        <View style={styles.allMealsContainer}>
          <TouchableOpacity
            style={[styles.allMealsButton, isDark && styles.allMealsButtonDark]}
            onPress={() => router.push('/alllocal')}
          >
            <Text style={[styles.allMealsText, isDark && styles.allMealsTextDark]}>
              See All Local Meals
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sections */}
        <Text style={[styles.sectionTitle, { color: isDark ? '#FFF' : '#000' }]}>
          Popular Breakfast
        </Text>
        <FlatList
          data={breakfastMeals}
          renderItem={renderCard}
          keyExtractor={(item, idx) => (item.idMeal ?? idx).toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
        />

        <Text style={[styles.sectionTitle, { color: isDark ? '#FFF' : '#000' }]}>
          Trending Meals
        </Text>
        <FlatList
          data={recommendedMeals}
          renderItem={renderCard}
          keyExtractor={(item, idx) => (item.idMeal ?? idx).toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
        />

        <Text style={[styles.sectionTitle, { color: isDark ? '#FFF' : '#000' }]}>
          Sweet Treats
        </Text>
        <FlatList
          data={exploreMeals}
          renderItem={renderCard}
          keyExtractor={(item, idx) => (item.idMeal ?? idx).toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#FFF', paddingTop: 40 },
  darkBg:         { backgroundColor: '#121212' },
  loader:         { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header:         {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    backgroundColor:'#6B8E23',
    padding:        15,
  },
  appName:        { fontSize: 22, fontWeight: 'bold', color: 'white' },

  // Search
  searchBar:      {
    flexDirection:    'row',
    alignItems:       'center',
    backgroundColor:  '#F0F0F0',
    marginHorizontal: 16,
    marginBottom:     10,
    paddingHorizontal:12,
    borderRadius:     30,
    height:           44,
    marginTop:        10,
    // glow
    shadowColor:   '#6B8E23',
    shadowOffset:  { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius:  12,
    elevation:     10,
  },
  searchBarDark:  {
    backgroundColor: '#1E1E1E',
    shadowColor:   '#6B8E23',
    shadowOffset:  { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius:  12,
    elevation:     10,
  },
  searchInput:    { flex: 1, marginLeft: 8, fontSize: 16, color: '#000' },
  searchInputDark:{ color: '#FFF' },

  // Carousel
  slide:          {
    position:        'relative',
    borderRadius:    12,
    overflow:        'hidden',
    backgroundColor: '#FFF',
    elevation:       4,
  },
  slideDark:      {
    backgroundColor: '#1E1E1E',
    elevation:       0,
  },
  slideImage:     { width: '100%', height: 180 },
  slideOverlay:   {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  slideTitle:     {
    position:   'absolute',
    bottom:     16,
    left:       16,
    fontSize:   18,
    fontWeight: 'bold',
    color:      '#FFF',
  },
  indicator:      {
    position:          'absolute',
    bottom:            8,
    right:             16,
    backgroundColor:   'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical:   2,
    borderRadius:      12,
  },
  indicatorText:  { color: '#FFF', fontSize: 12 },

  // “See All Local Meals” button styles
  allMealsContainer: {
    alignItems:     'center',
    paddingTop: 10,
  },
  allMealsButton: {
    backgroundColor:  '#6B8E23',
    paddingVertical:  10,
    paddingHorizontal: 14,
    borderRadius:     30,
  },
  allMealsButtonDark: {
    backgroundColor: '#6B8E23',
  },
  allMealsText: {
    color:      '#FFF',
    fontSize:   13,
    fontWeight: '600',
  },
  allMealsTextDark: {
    color: '#FFF',
  },

  // Sections
  sectionTitle:   {
    fontSize:     18,
    fontWeight:   'bold',
    marginLeft:   10,
    marginTop:    20,
  },

  // Recipe cards
  card:           {
    margin:       10,
    borderRadius: 10,
    overflow:     'hidden',
    width:        140,
    position:     'relative',
  },
  image:          { width: '100%', height: 100 },
  overlay:        {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  cardTitle:      {
    position:   'absolute',
    bottom:     10,
    left:       10,
    fontSize:   14,
    fontWeight: 'bold',
    color:      '#FFF',
  },
});
