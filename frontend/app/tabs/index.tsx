import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  useColorScheme,
  Alert,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { getRecommendedFoods, getFoodData, API_URL } from '../../services/api';

const HomeScreen = () => {
  const isDarkMode = useColorScheme() === 'dark';

  // Loading & data state
  const [loadingProfile, setLoadingProfile]     = useState(true);
  const [loadingFoods,   setLoadingFoods]       = useState(false);
  const [allergies,      setAllergies]          = useState<string[]>([]);
  const [conditions,     setConditions]         = useState<string[]>([]);
  const [recommended,    setRecommended]        = useState<any[]>([]);
  const [fallbackRecipes,setFallbackRecipes]    = useState<any[]>([]);

  // 1️⃣ Load health profile
  useEffect(() => {
    (async () => {
      try {
        const token = await SecureStore.getItemAsync('USER_TOKEN');
        if (token) {
          const resp = await fetch(`${API_URL}/health-profile`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (resp.ok) {
            const profile = await resp.json();
            setAllergies(profile.allergies || []);
            setConditions(profile.conditions || []);
          }
        }
      } catch (e) {
        console.error('Profile load error', e);
      } finally {
        setLoadingProfile(false);
      }
    })();
  }, []);

  // 2️⃣ Once profile is loaded, fetch recommendations
  useEffect(() => {
    if (loadingProfile) return;
    (async () => {
      setLoadingFoods(true);
      try {
        const data = await getRecommendedFoods({ allergies, conditions });
        if (data.results?.length > 0) {
          setRecommended(data.results);
        } else {
          // fallback to general recipes from getFoodData
          const fb = await getFoodData(0);
          setFallbackRecipes(fb.results || []);
        }
      } catch (e) {
        console.error('Recommended fetch error', e);
        Alert.alert('Error', 'Could not load recommendations.');
      } finally {
        setLoadingFoods(false);
      }
    })();
  }, [loadingProfile, allergies, conditions]);

  // 3️⃣ Show spinner until profile+foods finish loading
  if (loadingProfile || loadingFoods) {
    return (
      <View style={[styles.loaderContainer, isDarkMode && styles.darkContainer]}>
        <ActivityIndicator size="large" color={isDarkMode ? '#FFF' : '#000'} />
      </View>
    );
  }

  const handleFoodDetails = (id: number) => {
    router.push(`/details?id=${id}`);
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity onPress={() => handleFoodDetails(item.id)} style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.overlay} />
      <Text style={styles.cardTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appName}>WellEats</Text>
        <TouchableOpacity onPress={() => router.push('/healthProfile')}>
          <Ionicons name="heart-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Recommended For You */}
        {recommended.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Recommended For You</Text>
            <FlatList
              data={recommended}
              renderItem={renderItem}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Popular Picks</Text>
            <FlatList
              data={fallbackRecipes}
              renderItem={renderItem}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#FFF', paddingTop: 40 },
  darkContainer:  { backgroundColor: '#121212' },
  loaderContainer:{ flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    backgroundColor:'#6B8E23',
    padding:        15,
  },
  appName:        { fontSize: 22, fontWeight: 'bold', color: 'white' },

  sectionTitle:   {
    fontSize:     18,
    fontWeight:   'bold',
    marginLeft:   10,
    marginTop:    20,
    color:        '#000',
  },

  card: {
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

export default HomeScreen;
