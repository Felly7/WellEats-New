// app/search-results.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  useColorScheme,
  SafeAreaView,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

// You'll need to create this API function
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

// Alternative search by ingredient
const searchByIngredient = async (ingredient: string) => {
  try {
    const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(ingredient)}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Ingredient search error:', error);
    throw error;
  }
};

export default function SearchResultsScreen() {
  const { query } = useLocalSearchParams<{ query: string }>();
  const isDarkMode = useColorScheme() === 'dark';
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [meals, setMeals] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState(query || '');
  const [searchMode, setSearchMode] = useState<'name' | 'ingredient'>('name');

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      let data;
      if (searchMode === 'name') {
        data = await searchMeals(searchQuery);
      } else {
        data = await searchByIngredient(searchQuery);
      }
      setMeals(data.meals || []);
    } catch (error) {
      console.error('Search failed:', error);
      Alert.alert('Error', 'Failed to search recipes. Please try again.');
      setMeals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      performSearch(searchTerm);
    }
  };

  const toggleSearchMode = () => {
    setSearchMode(prev => prev === 'name' ? 'ingredient' : 'name');
    if (searchTerm.trim()) {
      performSearch(searchTerm);
    }
  };

  const renderMeal = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.mealCard, isDarkMode && styles.mealCardDark]}
      onPress={() => router.push(`/details/${item.idMeal}`)}
    >
      <Image source={{ uri: item.strMealThumb }} style={styles.mealImage} />
      <View style={styles.mealContent}>
        <Text style={[styles.mealTitle, { color: isDarkMode ? '#FFF' : '#000' }]} numberOfLines={2}>
          {item.strMeal}
        </Text>
        {item.strArea && (
          <Text style={[styles.mealSubtitle, { color: isDarkMode ? '#AAA' : '#666' }]}>
            {item.strArea} Cuisine
          </Text>
        )}
        {item.strCategory && (
          <View style={[styles.categoryBadge, isDarkMode && styles.categoryBadgeDark]}>
            <Text style={[styles.categoryText, { color: isDarkMode ? '#FFF' : '#007AFF' }]}>
              {item.strCategory}
            </Text>
          </View>
        )}
        {/* Show first few ingredients if available */}
        {(item.strIngredient1 || item.strIngredient2) && (
          <Text style={[styles.ingredientsText, { color: isDarkMode ? '#CCC' : '#888' }]} numberOfLines={1}>
            {[item.strIngredient1, item.strIngredient2, item.strIngredient3]
              .filter(Boolean)
              .slice(0, 3)
              .join(', ')}
            {item.strIngredient4 && '...'}
          </Text>
        )}
      </View>
      <View style={styles.arrowContainer}>
        <Ionicons 
          name="chevron-forward" 
          size={20} 
          color={isDarkMode ? '#AAA' : '#666'} 
        />
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons 
        name="search-outline" 
        size={64} 
        color={isDarkMode ? '#555' : '#CCC'} 
      />
      <Text style={[styles.emptyTitle, { color: isDarkMode ? '#FFF' : '#000' }]}>
        {searchTerm ? 'No recipes found' : 'Start searching'}
      </Text>
      <Text style={[styles.emptySubtitle, { color: isDarkMode ? '#AAA' : '#666' }]}>
        {searchTerm 
          ? `No recipes match "${searchTerm}"\nTry different keywords or search by ${searchMode === 'name' ? 'ingredient' : 'name'}`
          : 'Enter a recipe name or ingredient to search'
        }
      </Text>
      {searchTerm && (
        <TouchableOpacity
          style={[styles.switchModeButton, isDarkMode && styles.switchModeButtonDark]}
          onPress={toggleSearchMode}
        >
          <Text style={[styles.switchModeText, { color: isDarkMode ? '#000' : '#FFF' }]}>
            Search by {searchMode === 'name' ? 'Ingredient' : 'Recipe Name'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {meals.length > 0 && (
        <Text style={[styles.resultsCount, { color: isDarkMode ? '#AAA' : '#666' }]}>
          {meals.length} recipe{meals.length !== 1 ? 's' : ''} found
        </Text>
      )}
      <TouchableOpacity
        style={[styles.searchModeToggle, isDarkMode && styles.searchModeToggleDark]}
        onPress={toggleSearchMode}
      >
        <Ionicons 
          name={searchMode === 'name' ? 'restaurant-outline' : 'leaf-outline'} 
          size={16} 
          color={isDarkMode ? '#FFF' : '#007AFF'} 
        />
        <Text style={[styles.searchModeText, { color: isDarkMode ? '#FFF' : '#007AFF' }]}>
          {searchMode === 'name' ? 'By Name' : 'By Ingredient'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkBg]}>
      {/* Header with back button and search */}
      <View style={[styles.header, isDarkMode && styles.headerDark]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#FFF' : '#000'} />
        </TouchableOpacity>
        
        <View style={[styles.searchContainer, isDarkMode && styles.searchContainerDark]}>
          <Ionicons name="search-outline" size={20} color={isDarkMode ? '#888' : '#666'} />
          <TextInput
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholder={`Search ${searchMode === 'name' ? 'recipes' : 'by ingredient'}...`}
            placeholderTextColor={isDarkMode ? '#888' : '#AAA'}
            style={[styles.searchInput, { color: isDarkMode ? '#FFF' : '#000' }]}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoFocus
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchTerm('');
                setMeals([]);
              }}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color={isDarkMode ? '#888' : '#666'} />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity
          style={[styles.searchButton, isDarkMode && styles.searchButtonDark]}
          onPress={handleSearch}
          disabled={!searchTerm.trim() || loading}
        >
          <Text style={[styles.searchButtonText, { color: isDarkMode ? '#000' : '#FFF' }]}>
            Search
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={isDarkMode ? '#FFF' : '#007AFF'} />
          <Text style={[styles.loadingText, { color: isDarkMode ? '#FFF' : '#000' }]}>
            Searching recipes...
          </Text>
        </View>
      ) : meals.length > 0 ? (
        <FlatList
          data={meals}
          renderItem={renderMeal}
          keyExtractor={(item, index) => item.idMeal || index.toString()}
          contentContainerStyle={styles.listContainer}
          ListHeaderComponent={renderHeader}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => (
            <View style={[styles.separator, isDarkMode && styles.separatorDark]} />
          )}
        />
      ) : (
        renderEmptyState()
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFFF7',
  },
  darkBg: {
    backgroundColor: '#121212',
  },

  // Header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    gap: 12,
  },
  headerDark: {
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 4,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 40,
  },
  searchContainerDark: {
    backgroundColor: '#333',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  searchButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  searchButtonDark: {
    backgroundColor: '#0A84FF',
  },
  searchButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Header content styles
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  resultsCount: {
    fontSize: 14,
  },
  searchModeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  searchModeToggleDark: {
    backgroundColor: '#1A237E',
  },
  searchModeText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Loading styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },

  // List styles
  listContainer: {
    padding: 16,
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: 8,
  },
  separatorDark: {
    backgroundColor: '#333',
  },

  // Meal card styles
  mealCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mealCardDark: {
    backgroundColor: '#1E1E1E',
    shadowColor: '#FFF',
    shadowOpacity: 0.05,
  },
  mealImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  mealContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  mealSubtitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  categoryBadgeDark: {
    backgroundColor: '#1A237E',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  ingredientsText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  arrowContainer: {
    justifyContent: 'center',
    paddingHorizontal: 8,
  },

  // Empty state styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  switchModeButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  switchModeButtonDark: {
    backgroundColor: '#0A84FF',
  },
  switchModeText: {
    fontSize: 16,
    fontWeight: '600',
  },
});