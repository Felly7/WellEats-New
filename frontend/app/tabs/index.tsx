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
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { getNutritionByIngredient } from '../../services/api';
import { getAllMeals, Meal as LocalMeal } from '../../services/localData';

type ApiMeal = { idMeal: string; strMeal: string; strMealThumb: string };
type Suggestion = {
  id: string;
  title: string;
  image: any;
  local: boolean;
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLIDE_WIDTH = SCREEN_WIDTH * (4 / 6);
const SIDE_MARGIN = (SCREEN_WIDTH - SLIDE_WIDTH) / 2;

export default function HomeScreen() {
  const isDark = useColorScheme() === 'dark';

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
  const [breakfastMeals, setBreakfastMeals]     = useState<ApiMeal[]>([]);
  const [recommendedMeals, setRecommendedMeals] = useState<ApiMeal[]>([]);
  const [exploreMeals, setExploreMeals]         = useState<ApiMeal[]>([]);

  // 1️⃣ Local + carousel
  useEffect(() => {
    const locals = getAllMeals();
    setAllLocal(locals);
    const pick = locals
      .sort(() => Math.random() - 0.5)
      .slice(0, 4)
      .map(m => ({ id: m.id, title: m.name, image: m.thumbnail }));
    setFeaturedData(pick);
  }, []);

  // 2️⃣ Fetch API categories
  useEffect(() => {
    (async () => {
      try {
        const [bRes, rRes, eRes] = await Promise.all([
          fetch('https://www.themealdb.com/api/json/v1/1/filter.php?c=Breakfast'),
          fetch('https://www.themealdb.com/api/json/v1/1/filter.php?c=Seafood'),
          fetch('https://www.themealdb.com/api/json/v1/1/filter.php?c=Dessert'),
        ]);
        const bJson = await bRes.json();
        const rJson = await rRes.json();
        const eJson = await eRes.json();
        setBreakfastMeals(bJson.meals || []);
        setRecommendedMeals(rJson.meals || []);
        setExploreMeals(eJson.meals || []);
      } catch (err) {
        console.error(err);
        Alert.alert('Error', 'Could not load meals.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 3️⃣ Carousel auto-advance
  useEffect(() => {
    if (!featuredData.length) return;
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

  // 4️⃣ Suggestions logic
  useEffect(() => {
    const q = search.trim();
    if (!q) {
      setSuggestions([]);
      return;
    }
    (async () => {
      // local matches
      const locs = allLocal
        .filter(m => m.name.toLowerCase().includes(q.toLowerCase()))
        .map(m => ({ id: m.id, title: m.name, image: m.thumbnail, local: true }));

      // API search
      try {
        const res = await fetch(
          `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(q)}`
        );
        const json = await res.json();
        const apis: Suggestion[] = (json.meals || []).map((m: ApiMeal) => ({
          id: m.idMeal,
          title: m.strMeal,
          image: { uri: m.strMealThumb },
          local: false,
        }));
        setSuggestions([...locs, ...apis].slice(0, 6));
      } catch {
        setSuggestions(locs.slice(0, 6));
      }
    })();
  }, [search, allLocal]);

  if (loading) {
    return (
      <View style={[styles.loader, isDark && styles.darkBg]}>
        <ActivityIndicator size="large" color={isDark ? '#FFF' : '#000'} />
      </View>
    );
  }

  const renderSlide = (item: any, idx: number) => {
    const active = idx === slideIndex;
    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.slide,
          { width: SLIDE_WIDTH, marginHorizontal: 8, transform: [{ scale: active ? 1.05 : 0.9 }] },
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

  const renderCard = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.card} onPress={() => router.push(`/details/${item.idMeal}`)}>
      <Image source={{ uri: item.strMealThumb }} style={styles.image} />
      <View style={styles.overlay} />
      <Text style={styles.cardTitle}>{item.strMeal}</Text>
    </TouchableOpacity>
  );

  return (
    <View
      style={[styles.container, isDark && styles.darkBg]}
      // any tap on this view (outside dropdown) will clear suggestions:
      onStartShouldSetResponder={() => {
        if (suggestions.length) {
          setSuggestions([]);
        }
        return false;
      }}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appName}>WellEats</Text>
        <TouchableOpacity onPress={() => router.push('/favorites')}>
          <Ionicons name="heart" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchBar, isDark && styles.searchBarDark, { zIndex: 20 }]}>
        <Ionicons name="search-outline" size={20} color={isDark ? '#AAA' : '#666'} />
        <TextInput
          style={[styles.searchInput, isDark && styles.searchInputDark]}
          placeholder="Search foods and recipes..."
          placeholderTextColor={isDark ? '#888' : '#AAA'}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Blur under dropdown */}
      {suggestions.length > 0 && (
        <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
      )}

      {/* Suggestions Dropdown */}
      {suggestions.length > 0 && (
        <View style={[styles.dropdown, isDark && styles.dropdownDark]}>
          <FlatList
            data={suggestions}
            keyExtractor={i => (i.local ? `L-${i.id}` : `A-${i.id}`)}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.dropdownRow}
                onPress={() => {
                  setSuggestions([]);
                  router.push(`/details/${item.id}`);
                }}
              >
                <Image source={item.image} style={styles.dropdownThumb} />
                <Text style={[styles.dropdownText, isDark && styles.dropdownTextDark]}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Carousel */}
        <View>
          <ScrollView
            ref={scrollRef}
            horizontal
            snapToInterval={SLIDE_WIDTH + 16}
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: SIDE_MARGIN }}
          >
            {featuredData.map(renderSlide)}
          </ScrollView>
          <View style={styles.indicator}>
            <Text style={styles.indicatorText}>
              {slideIndex + 1}/{featuredData.length}
            </Text>
          </View>
        </View>

        {/* See All Local Meals */}
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
  // dropdown
  dropdown:       {
    position: 'absolute',
    top: 150,
    left: 16,
    right: 16,
    backgroundColor: '#FFF',
    borderRadius: 8,
    maxHeight: 240,
    zIndex: 10,
    elevation: 6,
  },
  dropdownDark:   { backgroundColor: '#1E1E1E' },
  dropdownRow:    {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#CCC',
  },
  dropdownThumb:  { width: 32, height: 32, borderRadius: 4, marginRight: 12 },
  dropdownText:   { fontSize: 14, color: '#000' },
  dropdownTextDark:{ color: '#FFF' },
  // Carousel
  slide:          {
    position:     'relative',
    borderRadius: 12,
    overflow:     'hidden',
    backgroundColor: '#FFF',
    elevation:   4,
  },
  slideDark:      {
    backgroundColor: '#1E1E1E',
    elevation:     0,
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
    position:  'absolute',
    bottom:    8,
    right:     16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical:   2,
    borderRadius:      12,
  },
  indicatorText:  { color: '#FFF', fontSize: 12 },
  // See All Local Meals
  allMealsContainer: { alignItems: 'center', paddingTop: 10 },
  allMealsButton:    {
    backgroundColor:  '#6B8E23',
    paddingVertical:  10,
    paddingHorizontal:14,
    borderRadius:     30,
  },
  allMealsButtonDark:{ backgroundColor: '#6B8E23' },
  allMealsText:      { color: '#FFF', fontSize: 13, fontWeight: '600' },
  allMealsTextDark:  { color: '#FFF' },
  // Sections
  sectionTitle:   {
    fontSize:   18,
    fontWeight: 'bold',
    marginLeft: 10,
    marginTop:  20,
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
