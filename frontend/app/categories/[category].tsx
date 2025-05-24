// app/categories/[category].tsx

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
  Alert,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getMealsByCategory } from '../../services/api';

export default function CategoriesScreen() {
  // grabs the [category] segment from the URL
  const { category }   = useLocalSearchParams<{ category: string }>();
  const isDarkMode     = useColorScheme() === 'dark';
  const router         = useRouter();

  const [loading,    setLoading]  = useState(true);
  const [meals,      setMeals]    = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!category) return;
    (async () => {
      try {
        const data = await getMealsByCategory(category);
        setMeals(data.meals || []);
      } catch (e) {
        console.error(`Error loading ${category}`, e);
        Alert.alert('Error', `Could not load ${category} recipes.`);
      } finally {
        setLoading(false);
      }
    })();
  }, [category]);

  // filter client‐side
  const filtered = meals.filter(m =>
    m.strMeal.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <View style={[styles.loader, isDarkMode && styles.darkBg]}>
        <ActivityIndicator size="large" color={isDarkMode ? '#FFF' : '#000'} />
      </View>
    );
  }

  const renderMeal = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.row}
      onPress={() => router.push(`/details/${item.idMeal}`)}
    >
      <Image source={{ uri: item.strMealThumb }} style={styles.thumb} />
      <Text style={[styles.title, { color: isDarkMode ? '#FFF' : '#000' }]}>
        {item.strMeal}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkBg]}>
      <Text style={[styles.header, { color: isDarkMode ? '#FFF' : '#000' }]}>
        {category} Recipes
      </Text>

      {/* search‐filter */}
      <View style={[styles.searchContainer, isDarkMode && styles.searchContainerDark]}>
        <TextInput
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholder="Filter recipes…"
          placeholderTextColor={isDarkMode ? '#888' : '#AAA'}
          style={[styles.searchInput, isDarkMode && styles.searchInputDark]}
        />
      </View>

      {filtered.length > 0 ? (
        <FlatList
          data={filtered}
          renderItem={renderMeal}
          keyExtractor={(item, i) => (item.idMeal || i).toString()}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: isDarkMode ? '#FFF' : '#000' }]}>
            No recipes found for “{searchTerm}”
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:           { flex: 1, backgroundColor: '#FDFFF7' },
  darkBg:              { backgroundColor: '#121212' },
  loader:              { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header:              { fontSize: 24, fontWeight: 'bold', margin: 16 },
  list:                { paddingHorizontal: 16 },

  row: {
    flexDirection:      'row',
    alignItems:         'center',
    paddingVertical:    12,
    borderBottomWidth:  1,
    borderColor:        '#DDD',
  },
  thumb:               { width: 80, height: 80, borderRadius: 8 },
  title:               { marginLeft: 16, fontSize: 18, flexShrink: 1 },

  searchContainer:     {
    marginHorizontal:   16,
    marginBottom:       12,
    borderRadius:       8,
    backgroundColor:    '#EEE',
    paddingHorizontal:  12,
  },
  searchContainerDark: { backgroundColor: '#333' },
  searchInput:         { height: 40, color: '#000' },
  searchInputDark:     { color: '#FFF' },

  emptyContainer:      { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 40 },
  emptyText:           { fontSize: 18 },
});
