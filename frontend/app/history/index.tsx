// app/history/index.tsx
import React, { useEffect, useState, useCallback } from 'react';
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
  RefreshControl,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const HISTORY_KEY = 'HISTORY';

export default function HistoryScreen() {
  const isDarkMode = useColorScheme() === 'dark';
  const router     = useRouter();
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [history, setHistory]     = useState<any[]>([]);

  const loadHistory = useCallback(async () => {
    const json = await AsyncStorage.getItem(HISTORY_KEY);
    const list = json ? JSON.parse(json) : [];
    setHistory(list);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  }, [loadHistory]);

  const onClear = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to remove all history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem(HISTORY_KEY);
            setHistory([]);
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.loader, isDarkMode && styles.darkBg]}>
        <ActivityIndicator size="large" color={isDarkMode ? '#FFF' : '#000'} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkBg]}>
      {/* Header with Clear button */}
      <View style={[styles.header, isDarkMode && styles.headerDark]}>
        <Ionicons name="time" size={28} color="#6B8E23" />
        <Text style={[styles.headerTitle, { color: isDarkMode ? '#FFF' : '#000' }]}>
          Recently Viewed
        </Text>
        <TouchableOpacity onPress={onClear}>
          <Ionicons name="trash" size={24} color={isDarkMode ? '#FFF' : '#000'} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={isDarkMode ? '#FFF' : '#000'} />
        }
      >
        {history.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="restaurant-outline"
              size={80}
              color={isDarkMode ? '#666' : '#CCC'}
            />
            <Text style={[styles.emptyTitle, isDarkMode && styles.emptyTitleDark]}>
              No Recipes Yet
            </Text>
            <Text style={[styles.emptySubtitle, isDarkMode && styles.emptySubtitleDark]}>
              Browse meals and we’ll save them here for you to revisit later.
            </Text>
          </View>
        ) : (
          history.map(item => (
            <TouchableOpacity
              key={item.idMeal}
              style={[styles.row, isDarkMode && styles.rowDark]}
              onPress={() => router.push(`/details/${item.idMeal}`)}
            >
              <Image source={{ uri: item.strMealThumb }} style={styles.thumb} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.title, { color: isDarkMode ? '#FFF' : '#000' }]}>
                  {item.strMeal}
                </Text>
                {/* Viewed timestamp */}
                <Text style={[styles.date, { color: isDarkMode ? '#AAA' : '#666' }]}>
                  Viewed {new Date(item.viewedAt).toLocaleString()}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: isDarkMode ? '#888' : '#666' }]}>
            Your last {history.length} viewed recipes appear here.
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

  scrollContainer:  { flex: 1 },
  contentContainer: { padding: 16 },

  loader:         { flex:1, justifyContent:'center', alignItems:'center' },

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
  title:          { fontSize:18, flexShrink:1 },
  date:           { fontSize:12, marginTop:4 },

  footer:         { marginTop:24, alignItems:'center' },
  footerText:     { fontSize:14, fontStyle:'italic' },
  emptyContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: 20,
},
emptyTitle: {
  fontSize: 24,
  fontWeight: '600',
  marginTop: 16,
  color: '#333',
  
},
emptyTitleDark: {
  color: '#DDD',
},
emptySubtitle: {
  fontSize: 16,
  marginTop: 8,
  color: '#666',
  textAlign: 'center',
  lineHeight: 22,
},
emptySubtitleDark: {
  color: '#AAA',
},
});
