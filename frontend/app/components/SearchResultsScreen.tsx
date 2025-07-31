// components/SearchResultsScreen.tsx

import React from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';

interface SearchResultsScreenProps {
  searchTerm: string;
  filteredMeals: any[];
  onBackPress: () => void;
}

export default function SearchResultsScreen({ 
  searchTerm, 
  filteredMeals, 
  onBackPress 
}: SearchResultsScreenProps) {
  const isDarkMode = useColorScheme() === 'dark';
  const router = useRouter();

  const renderMeal = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.mealCard, isDarkMode && styles.mealCardDark]}
      onPress={() => router.push(`/details/${item.idMeal}`)}
    >
      <Image source={{ uri: item.strMealThumb }} style={styles.mealImage} />
      <View style={styles.mealContent}>
        <Text style={[styles.mealTitle, { color: isDarkMode ? '#FFF' : '#000' }]}>
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
      </View>
      <View style={styles.arrowContainer}>
        <Text style={[styles.arrow, { color: isDarkMode ? '#AAA' : '#666' }]}>›</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🔍</Text>
      <Text style={[styles.emptyTitle, { color: isDarkMode ? '#FFF' : '#000' }]}>
        No recipes found
      </Text>
      <Text style={[styles.emptySubtitle, { color: isDarkMode ? '#AAA' : '#666' }]}>
        No recipes match "{searchTerm}"{'\n'}
        Try searching with different keywords
      </Text>
      <TouchableOpacity
        style={[styles.backButton, isDarkMode && styles.backButtonDark]}
        onPress={onBackPress}
      >
        <Text style={[styles.backButtonText, { color: isDarkMode ? '#000' : '#FFF' }]}>
          Back to Recipes
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkBg]}>
      {/* Header */}
      <View style={[styles.header, isDarkMode && styles.headerDark]}>
        <TouchableOpacity
          onPress={onBackPress}
          style={styles.backIconButton}
        >
          <Text style={[styles.backIcon, { color: isDarkMode ? '#FFF' : '#000' }]}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: isDarkMode ? '#FFF' : '#000' }]}>
            Search Results
          </Text>
          <Text style={[styles.headerSubtitle, { color: isDarkMode ? '#AAA' : '#666' }]}>
            {filteredMeals.length} result{filteredMeals.length !== 1 ? 's' : ''} for "{searchTerm}"
          </Text>
        </View>
      </View>

      {/* Results */}
      {filteredMeals.length > 0 ? (
        <FlatList
          data={filteredMeals}
          renderItem={renderMeal}
          keyExtractor={(item, index) => item.idMeal || index.toString()}
          contentContainerStyle={styles.listContainer}
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
  },
  headerDark: {
    borderBottomColor: '#333',
  },
  backIconButton: {
    padding: 8,
    marginRight: 8,
  },
  backIcon: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
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
    marginBottom: 6,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeDark: {
    backgroundColor: '#1A237E',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  arrowContainer: {
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  arrow: {
    fontSize: 20,
    fontWeight: 'bold',
  },

  // Empty state styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonDark: {
    backgroundColor: '#0A84FF',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});