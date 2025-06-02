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
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAllMeals, Meal } from '@/services/localData';

export default function AllLocalMealsScreen() {
  const isDarkMode = useColorScheme() === 'dark';
  const router     = useRouter();

  const [allMeals, setAllMeals]       = useState<Meal[]>([]);
  const [filteredMeals, setFilteredMeals] = useState<Meal[]>([]);
  const [loading, setLoading]         = useState(true);
  const [searchTerm, setSearchTerm]   = useState('');

  useEffect(() => {
    // Load all local meals on mount
    const data = getAllMeals();
    setAllMeals(data);
    setFilteredMeals(data);
    setLoading(false);
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

  if (loading) {
    return (
      <View style={[styles.center, isDarkMode && styles.darkBg]}>
        <ActivityIndicator size="large" color={isDarkMode ? '#FFF' : '#000'} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkBg]}>
      {/* Header with Back button and title */}
      <View style={[styles.header, isDarkMode && styles.headerDark]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={isDarkMode ? '#FFF' : '#000'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDarkMode && styles.headerTitleDark]}>
          All Local Meals
        </Text>
        {/* Placeholder to center title */}
        <View style={{ width: 24 }} />
      </View>

      {/* Search Bar */}
      <View style={[styles.searchBarContainer, isDarkMode && styles.searchBarContainerDark]}>
        <Ionicons
          name="search-outline"
          size={20}
          color={isDarkMode ? '#AAA' : '#666'}
        />
        <TextInput
          style={[styles.searchInput, isDarkMode && styles.searchInputDark]}
          placeholder="Search local meals..."
          placeholderTextColor={isDarkMode ? '#888' : '#AAA'}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      {/* List of meals */}
      {filteredMeals.length === 0 ? (
        <View style={styles.noResultsContainer}>
          <Text style={[styles.noResultsText, isDarkMode && styles.textDark]}>
            No meals match your search.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredMeals}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, isDarkMode && styles.cardDark]}
              onPress={() => router.push(`/details/${item.id}`)}
            >
              <Image source={item.thumbnail} style={styles.thumb} />
              <Text style={[styles.title, isDarkMode && styles.textDark]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#FFF' },
  darkBg:      { backgroundColor: '#121212' },

  header:      {
                flexDirection:    'row',
                alignItems:       'center',
                justifyContent:   'space-between',
                paddingHorizontal: 16,
                paddingVertical:   12,
                backgroundColor:   '#F0F0F0',
              },
  headerDark:  { backgroundColor: '#1E1E1E' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#000' },
  headerTitleDark: { color: '#FFF' },

  searchBarContainer: {
    flexDirection:    'row',
    alignItems:       'center',
    backgroundColor:  '#EFEFEF',
    margin:           16,
    paddingHorizontal:12,
    borderRadius:     25,
    height:           44,
  },
  searchBarContainerDark: {
    backgroundColor: '#2A2A2A',
  },
  searchInput:   {
    flex:           1,
    marginLeft:     8,
    fontSize:       16,
    color:          '#000',
  },
  searchInputDark: { color: '#FFF' },

  noResultsContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  noResultsText:      { fontSize: 16, color: '#666' },

  card:        {
                flexDirection: 'row',
                alignItems:     'center',
                padding:        12,
                marginBottom:   12,
                backgroundColor:'#FFF',
                borderRadius:   8,
                elevation:      2,
              },
  cardDark:    {
                backgroundColor: '#1E1E1E',
                elevation:       0,
              },
  thumb:       { width: 80, height: 80, borderRadius: 8, marginRight: 12 },
  title:       { fontSize: 18, flexShrink: 1, color: '#000' },

  textDark:    { color: '#FFF' },
  center:      { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
