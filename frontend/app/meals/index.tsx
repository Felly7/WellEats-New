// app/meals/index.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getAllMeals, Meal } from '@/services/localData';

export default function MealsListScreen() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const data = getAllMeals();
    setMeals(data);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6B8E23" />
      </View>
    );
  }

  return (
    <FlatList
      data={meals}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 16 }}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.row}
          onPress={() => router.push(`/details/${item.id}`)}
        >
          <Image source={{ uri: item.thumbnail }} style={styles.thumb} />
          <Text style={styles.title}>{item.name}</Text>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 8,
    elevation: 2,
  },
  thumb: { width: 80, height: 80, borderRadius: 8 },
  title: { marginLeft: 16, fontSize: 18, flexShrink: 1 },
});
