// app/search.tsx
import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

// 🔥 Define Categories with Local Images
const categories = [
  { title: 'Breakfast',     image: require('../../assets/images/search/breakfastSearch.jpg'),   color: '#0F5224' },
  { title: 'Starter',       image: require('../../assets/images/search/lunchSearch.jpg'),       color: '#C14926' },
  { title: 'Chicken',       image: require('../../assets/images/search/supperSearch.jpg'),     color: '#6D3B1B' },
  { title: 'Vegetarian',    image: require('../../assets/images/search/vegetables.jpg'),      color: '#A88C89' },
  { title: 'Pork',          image: require('../../assets/images/search/diaryfree.jpg'),       color: '#E5B8B8' },
  { title: 'Lamb',          image: require('../../assets/images/search/grain.jpg'),           color: '#A3AD85' },
  { title: 'Goat',          image: require('../../assets/images/search/starchyfood.jpg'),     color: '#96A8C8' },
  { title: 'Pasta',         image: require('../../assets/images/search/soup.jpg'),           color: '#787800' },
  { title: 'Seafood',       image: require('../../assets/images/search/meat.jpg'),           color: '#C5B29A' },
  { title: 'Side',          image: require('../../assets/images/search/egg.jpg'),            color: '#4536D8' },
  { title: 'Vegan',         image: require('../../assets/images/search/carbohydrates.jpg'),  color: '#2A2A2A' },
  { title: 'Beef',          image: require('../../assets/images/search/fish.jpg'),           color: '#B3B3B3' },
  { title: 'Dessert',       image: require('../../assets/images/search/cereal.jpg'),         color: '#D3D3D3' },
  { title: 'Miscellaneous', image: require('../../assets/images/search/stew.jpg'),           color: '#2F5EA1' },
];

export default function CategoryScreen() {
  const isDarkMode = useColorScheme() === 'dark';
  const router     = useRouter();

  const onSelect = (cat: string) => {
    // navigate to dynamic route /categories/[category]
    router.push(`/categories/${encodeURIComponent(cat)}`);
  };

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <SafeAreaView>
        {/* 🔍 Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#888" />
          <TextInput placeholder="Search" style={styles.searchInput} />
        </View>

        {/* 📦 Category Grid */}
        <FlatList
          data={categories}
          keyExtractor={(item) => item.title}
          numColumns={2}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.categoryItem}
              onPress={() => onSelect(item.title)}
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
      </SafeAreaView>
    </View>
  );
}

// 🎨 **Styles**
const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#FDFFF7', paddingBottom: 120 },
  darkContainer:  { backgroundColor: '#121212' },

  searchBar:      {
    flexDirection: 'row',
    alignItems:    'center',
    backgroundColor: '#D9D9D9',
    margin:        15,
    padding:       12,
    borderRadius:  20,
  },
  searchInput:    {
    flex:          1,
    marginLeft:    10,
    fontSize:      16,
    color:         '#333',
  },

  grid:           { paddingHorizontal: 10 },
  categoryItem:   {
    flex:          1,
    margin:        8,
    borderRadius:  10,
    overflow:      'hidden',
    height:        120,
  },
  image:          { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  overlay:        { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
  categoryText:   {
    color:         '#FFF',
    fontWeight:    'bold',
    fontSize:      18,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset:{ width: 1, height: 1 },
    textShadowRadius:3,
  },

  mealCard:       { width: 140, height: 100, marginHorizontal: 8, borderRadius: 8, overflow: 'hidden' },
  mealImage:      { flex: 1, justifyContent: 'flex-end' },
  mealOverlay:    { backgroundColor: 'rgba(0,0,0,0.4)', padding: 6 },
  mealTitle:      { color: '#FFF', fontSize: 12 },

  sectionHeader:  {
    fontSize:    20,
    fontWeight:  'bold',
    marginLeft:  16,
    marginTop:   20,
  },
});
