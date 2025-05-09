import React from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, Image, TouchableOpacity, ImageBackground, useColorScheme} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

// 🔥 Define Categories with Local Images
const categories = [
  { title: 'Breakfast', image: require('../../assets/images/search/breakfastSearch.jpg'), color: '#0F5224' },
  { title: 'Lunch', image: require('../../assets/images/search/lunchSearch.jpg'), color: '#C14926' },
  { title: 'Supper', image: require('../../assets/images/search/supperSearch.jpg'), color: '#6D3B1B' },
  { title: 'Vegetables', image: require('../../assets/images/search/vegetables.jpg'), color: '#A88C89' },
  { title: 'Dairy-free', image: require('../../assets/images/search/diaryfree.jpg'), color: '#E5B8B8' },
  { title: 'Grain', image: require('../../assets/images/search/grain.jpg'), color: '#A3AD85' },
  { title: 'Starchy food', image: require('../../assets/images/search/starchyfood.jpg'), color: '#96A8C8' },
  { title: 'Soup', image: require('../../assets/images/search/soup.jpg'), color: '#787800' },
  { title: 'Meat', image: require('../../assets/images/search/meat.jpg'), color: '#C5B29A' },
  { title: 'Egg', image: require('../../assets/images/search/egg.jpg'), color: '#4536D8' },
  { title: 'Carbohydrates', image: require('../../assets/images/search/carbohydrates.jpg'), color: '#2A2A2A' },
  { title: 'Fish', image: require('../../assets/images/search/fish.jpg'), color: '#B3B3B3' },
  { title: 'Cereal', image: require('../../assets/images/search/cereal.jpg'), color: '#D3D3D3' },
  { title: 'Stew', image: require('../../assets/images/search/stew.jpg'), color: '#2F5EA1' },
];
  const isDarkMode = useColorScheme() === 'dark';


export default function CategoryScreen() {
  return (
  <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      {/* 🔍 Search Bar */}
      <SafeAreaView>
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
          <TouchableOpacity style={styles.categoryItem}>
            <ImageBackground source={item.image} style={styles.image} imageStyle={{ opacity: 1.0 }}>
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
  container: {
    flex: 1,
    backgroundColor: '#FDFFF7', // Baby powder Background for better contrast
    paddingBottom: 120,
  },
  darkContainer: {
     backgroundColor: '#121212' 
    },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D9D9D9', //  Darker Search Bar
    margin: 15,
    padding: 12,
    borderRadius: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333', //  Darker text for readability
  },
  grid: {
    paddingHorizontal: 10,
  },
  categoryItem: {
    flex: 1,
    margin: 8,
    borderRadius: 10,
    overflow: 'hidden',
    height: 120,
  },
  image: {
    width: '100%', // Full width
    height: '100%', // Full height
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 18,
    textShadowColor: 'rgba(0, 0, 0, 0.3)', // Text Shadow for visibility
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});

export default CategoryScreen;