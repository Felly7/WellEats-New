// app/favorites/index.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
  ImageBackground,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const FAVORITES_KEY = 'FAVORITES';

export default function FavoritesScreen() {
  const isDarkMode = useColorScheme() === 'dark';
  const router     = useRouter();
  const [loading, setLoading]     = useState(true);
  const [favorites, setFavorites] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const json = await AsyncStorage.getItem(FAVORITES_KEY);
      const list = json ? JSON.parse(json) : [];
      setFavorites(list);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={[styles.loader, isDarkMode && styles.darkBg]}>
        <ActivityIndicator size="large" color={isDarkMode ? '#FFF' : '#000'} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkBg]}>
      {/* Header */}
      <View style={[styles.header, isDarkMode && styles.headerDark]}>
        <Ionicons name="heart" size={28} color="#D62828" />
        <Text style={[styles.headerTitle, { color: isDarkMode ? '#FFF' : '#000' }]}>
          My Favorites
        </Text>
        <Ionicons name="heart" size={28} color="transparent" />
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {favorites.length === 0 ? (
          <View style={styles.empty}>
            <ImageBackground
              source={require('../../assets/images/conditions.jpg')}
              style={styles.emptyImage}
              imageStyle={{ opacity: 0.3 }}
            >
              <Text style={[styles.emptyText, { color: isDarkMode ? '#FFF' : '#000' }]}>
                You haven’t added any favorites yet!
              </Text>
            </ImageBackground>
          </View>
        ) : (
          favorites.map(item => (
            <TouchableOpacity
              key={item.idMeal}
              style={[styles.row, isDarkMode && styles.rowDark]}
              onPress={() => router.push(`/details/${item.idMeal}`)}
            >
              <Image source={{ uri: item.strMealThumb }} style={styles.thumb} />
              <Text style={[styles.title, { color: isDarkMode ? '#FFF' : '#000' }]}>
                {item.strMeal}
              </Text>
            </TouchableOpacity>
          ))
        )}

        {/* Footer inscription */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: isDarkMode ? '#888' : '#666' }]}>
            Tap a meal to view details.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#FDFFF7' },
  darkBg:         { backgroundColor: '#121212' },

  header:         {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    padding:        16,
    backgroundColor:'#FFF',
  },
  headerDark:     { backgroundColor: '#1E1E1E' },
  headerTitle:    { fontSize: 22, fontWeight: 'bold' },

  scrollContainer:    { flex: 1 },
  contentContainer:   { padding: 16 },

  loader:         { flex: 1, justifyContent:'center', alignItems:'center' },

  empty:          { flex:1, justifyContent:'center', alignItems:'center', paddingVertical:40 },
  emptyImage:     {
    width: '80%',
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyText:      { fontSize:18, textAlign:'center', paddingHorizontal:20 },

  row:            {
    flexDirection:'row',
    alignItems:'center',
    marginBottom:12,
    backgroundColor:'#FFF',
    borderRadius:8,
    padding:8,
    elevation:2,
  },
  rowDark:        { backgroundColor:'#2A2A2A', elevation:0 },
  thumb:          { width:80, height:80, borderRadius:8 },
  title:          { marginLeft:16, fontSize:18, flexShrink:1 },

  footer:         { marginTop:24, alignItems:'center' },
  footerText:     { fontSize:14, fontStyle:'italic' },
});
