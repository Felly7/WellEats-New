import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getFoodDetails } from '../services/api'; // Import API function

export default function DetailsScreen() {
  const navigation = useNavigation(); // Get navigation object
  const route = useRoute(); // Get route parameters
  const { id } = route.params; // Extract the food item ID

  const [dish, setDish] = useState(null); // Store food details
  const [loading, setLoading] = useState(true); // Track loading state


  // Fetch dish details when component loads
  useEffect(() => {
    const fetchDish = async () => {
      try {
        const data = await getFoodDetails(id);
        setDish(data);
      } catch (error) {
        console.error('Error fetching dish:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDish();
  }, [id]);


    // Show a loading spinner while data is being fetched
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#D4A857" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <Image
        source={{ uri: dish?.image }}
        style={styles.image}
      />

      {/* Back Button */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="chevron-back" size={24} color="white" />
      </TouchableOpacity>

      {/* Content Overlay */}
      <View style={styles.overlay}>
        <Text style={styles.title}>{dish?.title || 'Unknown Dish'}</Text>
        <Text style={styles.description}>{dish?.summary?.replace(/<[^>]+>/g, '')}</Text>

        {/* Button */}
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Favorite</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// 🎨 **Styles**
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '50%',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    resizeMode: 'cover',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 20,
  },
  overlay: {
    flex: 1,
    marginTop: -40,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'white',
  },
  description: {
    fontSize: 14,
    color: '#ccc',
    marginVertical: 10,
  },
  button: {
    backgroundColor: '#D4A857',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

