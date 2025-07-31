// app/search.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ImageBackground,
  Alert,
  useColorScheme,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

// 🔥 Define Categories with Local Images
const categories = [
  { title: 'Breakfast',     image: require('../../assets/images/search/breakfastSearch.jpg'),   color: '#0F5224' },
  { title: 'Starter',       image: require('../../assets/images/search/lunchSearch.jpg'),       color: '#C14926' },
  { title: 'Chicken',       image: require('../../assets/images/search/chicken.jpg'),     color: '#6D3B1B' },
  { title: 'Vegetarian',    image: require('../../assets/images/search/vegetables.jpg'),      color: '#A88C89' },
  { title: 'Pork',          image: require('../../assets/images/search/pork.jpg'),       color: '#E5B8B8' },
  { title: 'Lamb',          image: require('../../assets/images/search/lamb.jpg'),           color: '#A3AD85' },
  { title: 'Goat',          image: require('../../assets/images/search/goat.jpg'),     color: '#96A8C8' },
  { title: 'Pasta',         image: require('../../assets/images/search/pasta.jpg'),           color: '#787800' },
  { title: 'Seafood',       image: require('../../assets/images/search/seafood.jpg'),           color: '#C5B29A' },
  { title: 'Side',          image: require('../../assets/images/search/side.jpg'),            color: '#4536D8' },
  { title: 'Vegan',         image: require('../../assets/images/search/vegan.jpg'),  color: '#2A2A2A' },
  { title: 'Beef',          image: require('../../assets/images/search/beef.jpg'),           color: '#B3B3B3' },
  { title: 'Dessert',       image: require('../../assets/images/search/cereal.jpg'),         color: '#D3D3D3' },
  { title: 'Miscellaneous', image: require('../../assets/images/search/stew.jpg'),           color: '#2F5EA1' },
];

// Popular search suggestions
const popularSearches = [
  'Chicken', 'Pasta', 'Beef', 'Vegetarian', 'Dessert', 'Quick meals', 'Healthy', 'Spicy'
];

// Recent searches (in a real app, this would come from storage)
const recentSearches = [
  'Spaghetti', 'Pizza', 'Burger', 'Salad'
];

// API functions
const searchMeals = async (query: string) => {
  try {
    const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
};

export default function CategoryScreen() {
  const isDarkMode = useColorScheme() === 'dark';
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Generate suggestions based on search input
  useEffect(() => {
    if (searchQuery.length > 2) {
      getSuggestions(searchQuery);
    } else {
      setSearchSuggestions([]);
    }
  }, [searchQuery]);

  const getSuggestions = async (query: string) => {
    setLoadingSuggestions(true);
    try {
      const data = await searchMeals(query);
      setSearchSuggestions(data.meals ? data.meals.slice(0, 5) : []);
    } catch (error) {
      console.error('Failed to get suggestions:', error);
      setSearchSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const onSelectCategory = (cat: string) => {
    // navigate to dynamic route /categories/[category]
    router.push(`/categories/${encodeURIComponent(cat)}`);
  };

  const handleSearch = (query: string = searchQuery) => {
    if (query.trim()) {
      router.push(`/search-results?query=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSearchPress = (searchTerm: string) => {
    setSearchQuery(searchTerm);
    handleSearch(searchTerm);
  };

  const renderSearchSuggestion = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.suggestionItem, isDarkMode && styles.suggestionItemDark]}
      onPress={() => handleSearchPress(item.strMeal)}
    >
      <Image source={{ uri: item.strMealThumb }} style={styles.suggestionImage} />
      <View style={styles.suggestionContent}>
        <Text style={[styles.suggestionTitle, { color: isDarkMode ? '#FFF' : '#000' }]}>
          {item.strMeal}
        </Text>
        {item.strArea && (
          <Text style={[styles.suggestionSubtitle, { color: isDarkMode ? '#AAA' : '#666' }]}>
            {item.strArea} • {item.strCategory}
          </Text>
        )}
      </View>
      <Ionicons name="arrow-up-outline" size={16} color={isDarkMode ? '#AAA' : '#666'} />
    </TouchableOpacity>
  );

  const renderPopularSearch = (item: string, index: number) => (
    <TouchableOpacity
      key={index}
      style={[styles.popularTag, isDarkMode && styles.popularTagDark]}
      onPress={() => handleSearchPress(item)}
    >
      <Text style={[styles.popularTagText, { color: isDarkMode ? '#FFF' : '#007AFF' }]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderRecentSearch = (item: string, index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.recentItem}
      onPress={() => handleSearchPress(item)}
    >
      <Ionicons name="time-outline" size={16} color={isDarkMode ? '#AAA' : '#666'} />
      <Text style={[styles.recentText, { color: isDarkMode ? '#FFF' : '#000' }]}>
        {item}
      </Text>
      <View style={styles.recentArrow}>
        <Ionicons name="arrow-up-outline" size={14} color={isDarkMode ? '#AAA' : '#666'} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* 🔍 Enhanced Search Bar */}
        <View style={[styles.searchBarContainer, isDarkMode && styles.searchBarContainerDark]}>
          <View style={[styles.searchBar, isDarkMode && styles.searchBarDark, isSearchFocused && styles.searchBarFocused]}>
            <Ionicons name="search-outline" size={20} color={isDarkMode ? '#AAA' : '#888'} />
            <TextInput
              placeholder="Search recipes, ingredients..."
              style={[styles.searchInput, { color: isDarkMode ? '#FFF' : '#333' }]}
              placeholderTextColor={isDarkMode ? '#888' : '#AAA'}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              onSubmitEditing={() => handleSearch()}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={20} color={isDarkMode ? '#888' : '#666'} />
              </TouchableOpacity>
            )}
          </View>
          
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={[styles.searchButton, isDarkMode && styles.searchButtonDark]}
              onPress={() => handleSearch()}
            >
              <Text style={[styles.searchButtonText, { color: isDarkMode ? '#000' : '#FFF' }]}>
                Search
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Search Suggestions */}
          {(isSearchFocused || searchQuery.length > 0) && (
            <View style={styles.suggestionsContainer}>
              {loadingSuggestions ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={isDarkMode ? '#FFF' : '#007AFF'} />
                  <Text style={[styles.loadingText, { color: isDarkMode ? '#AAA' : '#666' }]}>
                    Finding suggestions...
                  </Text>
                </View>
              ) : searchSuggestions.length > 0 ? (
                <>
                  <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FFF' : '#000' }]}>
                    Recipe Suggestions
                  </Text>
                  <FlatList
                    data={searchSuggestions}
                    renderItem={renderSearchSuggestion}
                    keyExtractor={(item) => item.idMeal}
                    scrollEnabled={false}
                  />
                </>
              ) : searchQuery.length > 2 ? (
                <View style={styles.noSuggestionsContainer}>
                  <Text style={[styles.noSuggestionsText, { color: isDarkMode ? '#AAA' : '#666' }]}>
                    No suggestions found for "{searchQuery}"
                  </Text>
                  <TouchableOpacity
                    style={[styles.searchAnywayButton, isDarkMode && styles.searchAnywayButtonDark]}
                    onPress={() => handleSearch()}
                  >
                    <Text style={[styles.searchAnywayText, { color: isDarkMode ? '#000' : '#FFF' }]}>
                      Search anyway
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>
          )}

          {/* Popular Searches */}
          {!isSearchFocused && searchQuery.length === 0 && (
            <>
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FFF' : '#000' }]}>
                  🔥 Popular Searches
                </Text>
                <View style={styles.popularContainer}>
                  {popularSearches.map(renderPopularSearch)}
                </View>
              </View>

              {/* Recent Searches */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FFF' : '#000' }]}>
                  🕐 Recent Searches
                </Text>
                <View style={styles.recentContainer}>
                  {recentSearches.map(renderRecentSearch)}
                </View>
              </View>

              {/* 📦 Category Grid */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FFF' : '#000' }]}>
                  🍽️ Browse Categories
                </Text>
                <FlatList
                  data={categories}
                  keyExtractor={(item) => item.title}
                  numColumns={2}
                  contentContainerStyle={styles.grid}
                  scrollEnabled={false}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.categoryItem}
                      onPress={() => onSelectCategory(item.title)}
                    >
                      <ImageBackground
                        source={item.image}
                        style={styles.image}
                        imageStyle={{ opacity: 1.0 }}
                      >
                        <View style={styles.overlay}>
                          <Text style={styles.categoryText}>{item.title}</Text>
                        </View>
                      </ImageBackground>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// 🎨 **Styles**
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FDFFF7', 
    paddingBottom: 30 
  },
  darkContainer: { 
    backgroundColor: '#121212' 
  },

  // Search bar styles
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  searchBarContainerDark: {
    borderBottomColor: '#333',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D9D9D9',
    padding: 12,
    borderRadius: 20,
  },
  searchBarDark: {
    backgroundColor: '#333',
  },
  searchBarFocused: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  clearButton: {
    padding: 2,
  },
  searchButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  searchButtonDark: {
    backgroundColor: '#0A84FF',
  },
  searchButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Section styles
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
    marginBottom: 12,
  },

  // Suggestions styles
  suggestionsContainer: {
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  suggestionItemDark: {
    backgroundColor: '#1E1E1E',
  },
  suggestionImage: {
    width: 40,
    height: 40,
    borderRadius: 6,
  },
  suggestionContent: {
    flex: 1,
    marginLeft: 12,
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  suggestionSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
  },
  noSuggestionsContainer: {
    alignItems: 'center',
    padding: 20,
  },
  noSuggestionsText: {
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  searchAnywayButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  searchAnywayButtonDark: {
    backgroundColor: '#0A84FF',
  },
  searchAnywayText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Popular searches styles
  popularContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 8,
  },
  popularTag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  popularTagDark: {
    backgroundColor: '#1A237E',
  },
  popularTagText: {
    fontSize: 14,
    fontWeight: '500',
  },

  // Recent searches styles
  recentContainer: {
    paddingHorizontal: 16,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    gap: 12,
  },
  recentText: {
    flex: 1,
    fontSize: 16,
  },
  recentArrow: {
    padding: 4,
  },

  // Category grid styles
  grid: { 
    paddingHorizontal: 10 
  },
  categoryItem: {
    flex: 1,
    margin: 8,
    borderRadius: 10,
    overflow: 'hidden',
    height: 120,
  },
  image: { 
    width: '100%', 
    height: '100%', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  overlay: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  categoryText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 18,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});