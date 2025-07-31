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
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getMealsByCategory } from '../../services/api';
import SearchResultsScreen from '../components/SearchResultsScreen';

export default function CategoriesScreen() {
  // grabs the [category] segment from the URL
  const { category }   = useLocalSearchParams<{ category: string }>();
  const isDarkMode     = useColorScheme() === 'dark';
  const router         = useRouter();

  const [loading,    setLoading]  = useState(true);
  const [meals,      setMeals]    = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  // AI Assistant states
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiMessages, setAIMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([
    { role: 'assistant', content: `Hi! I'm your cooking assistant. I can help you with recipes from the ${category} category. Ask me anything about cooking techniques, ingredients, or recipe suggestions!` }
  ]);
  const [userInput, setUserInput] = useState('');
  const [aiLoading, setAILoading] = useState(false);

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

  // Enhanced search - searches only in meal names for better performance
  const filtered = meals.filter(m => {
    const searchLower = searchTerm.toLowerCase();
    return m.strMeal.toLowerCase().includes(searchLower);
  });

  // Handle search input with debouncing effect
  const handleSearchChange = (text: string) => {
    setSearchTerm(text);
    if (text.trim().length > 0) {
      // Show search results after user types something
      setTimeout(() => {
        if (text.trim().length > 0) {
          setShowSearchResults(true);
        }
      }, 300);
    } else {
      setShowSearchResults(false);
    }
  };

  // Handle back from search results
  const handleBackFromSearch = () => {
    setShowSearchResults(false);
    setSearchTerm('');
  };

  // AI Assistant functionality
  const sendMessageToAI = async () => {
    if (!userInput.trim()) return;

    const newUserMessage = { role: 'user' as const, content: userInput };
    setAIMessages(prev => [...prev, newUserMessage]);
    setUserInput('');
    setAILoading(true);

    try {
      // Simulate AI response (replace with actual AI API call)
      const aiResponse = await simulateAIResponse(userInput, category, meals);
      setAIMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (error) {
      console.error('AI Error:', error);
      setAIMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setAILoading(false);
    }
  };

  // Simulate AI responses (replace with actual AI service)
  const simulateAIResponse = async (input: string, category: string, meals: any[]): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    
    const inputLower = input.toLowerCase();
    
    if (inputLower.includes('recipe') || inputLower.includes('how to make')) {
      const randomMeal = meals[Math.floor(Math.random() * meals.length)];
      return `I'd recommend trying ${randomMeal?.strMeal}! It's a great ${category} dish. Would you like me to help you find more details about it?`;
    }
    
    if (inputLower.includes('ingredient')) {
      return `For ${category} dishes, common ingredients include various spices, proteins, and vegetables. Each recipe in this category has its own unique combination. Is there a specific ingredient you're curious about?`;
    }
    
    if (inputLower.includes('cooking time') || inputLower.includes('how long')) {
      return `Cooking times for ${category} dishes can vary greatly depending on the recipe and cooking method. Most range from 30 minutes to 2 hours. Would you like suggestions for quick recipes in this category?`;
    }
    
    return `That's an interesting question about ${category} cooking! I can help you with recipe suggestions, cooking tips, ingredient substitutions, and more. What specific aspect would you like to know more about?`;
  };

  if (loading) {
    return (
      <View style={[styles.loader, isDarkMode && styles.darkBg]}>
        <ActivityIndicator size="large" color={isDarkMode ? '#FFF' : '#000'} />
      </View>
    );
  }

  const renderMeal = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.row, isDarkMode && styles.rowDark]}
      onPress={() => router.push(`/details/${item.idMeal}`)}
    >
      <Image source={{ uri: item.strMealThumb }} style={styles.thumb} />
      <View style={styles.mealInfo}>
        <Text style={[styles.title, { color: isDarkMode ? '#FFF' : '#000' }]}>
          {item.strMeal}
        </Text>
        {item.strArea && (
          <Text style={[styles.subtitle, { color: isDarkMode ? '#AAA' : '#666' }]}>
            {item.strArea} Cuisine
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderAIMessage = ({ item, index }: { item: typeof aiMessages[0], index: number }) => (
    <View
      key={index}
      style={[
        styles.messageContainer,
        item.role === 'user' ? styles.userMessage : styles.assistantMessage,
        isDarkMode && (item.role === 'user' ? styles.userMessageDark : styles.assistantMessageDark)
      ]}
    >
      <Text style={[
        styles.messageText,
        { color: item.role === 'user' ? '#FFF' : (isDarkMode ? '#FFF' : '#000') }
      ]}>
        {item.content}
      </Text>
    </View>
  );

  return (
    <>
      {showSearchResults ? (
        <SearchResultsScreen
          searchTerm={searchTerm}
          filteredMeals={filtered}
          onBackPress={handleBackFromSearch}
        />
      ) : (
        <SafeAreaView style={[styles.container, isDarkMode && styles.darkBg]}>
          <View style={styles.headerContainer}>
            <Text style={[styles.header, { color: isDarkMode ? '#FFF' : '#000' }]}>
              {category} Recipes
            </Text>
            <TouchableOpacity
              style={[styles.aiButton, isDarkMode && styles.aiButtonDark]}
              onPress={() => setShowAIAssistant(true)}
            >
              <Text style={[styles.aiButtonText, { color: isDarkMode ? '#000' : '#FFF' }]}>
                🤖 AI Assistant
              </Text>
            </TouchableOpacity>
          </View>

          {/* Enhanced search bar */}
          <View style={[styles.searchContainer, isDarkMode && styles.searchContainerDark]}>
            <Text style={[styles.searchIcon, { color: isDarkMode ? '#888' : '#666' }]}>🔍</Text>
            <TextInput
              value={searchTerm}
              onChangeText={handleSearchChange}
              placeholder="Search recipes by name..."
              placeholderTextColor={isDarkMode ? '#888' : '#AAA'}
              style={[styles.searchInput, isDarkMode && styles.searchInputDark]}
              returnKeyType="search"
              onSubmitEditing={() => {
                if (searchTerm.trim().length > 0) {
                  setShowSearchResults(true);
                }
              }}
            />
            {searchTerm.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchTerm('');
                  setShowSearchResults(false);
                }}
                style={styles.clearButton}
              >
                <Text style={[styles.clearButtonText, { color: isDarkMode ? '#888' : '#666' }]}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Recipe list */}
          <FlatList
            data={meals}
            renderItem={renderMeal}
            keyExtractor={(item, i) => (item.idMeal || i).toString()}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />

          {/* AI Assistant Modal */}
          <Modal
            visible={showAIAssistant}
            animationType="slide"
            presentationStyle="pageSheet"
          >
            <KeyboardAvoidingView
              style={[styles.modalContainer, isDarkMode && styles.darkBg]}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
              <SafeAreaView style={styles.modalContent}>
                {/* Modal Header */}
                <View style={[styles.modalHeader, isDarkMode && styles.modalHeaderDark]}>
                  <Text style={[styles.modalTitle, { color: isDarkMode ? '#FFF' : '#000' }]}>
                    🤖 Cooking Assistant
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowAIAssistant(false)}
                    style={styles.closeButton}
                  >
                    <Text style={[styles.closeButtonText, { color: isDarkMode ? '#FFF' : '#000' }]}>✕</Text>
                  </TouchableOpacity>
                </View>

                {/* Messages */}
                <ScrollView
                  style={styles.messagesContainer}
                  contentContainerStyle={styles.messagesContent}
                  showsVerticalScrollIndicator={false}
                >
                  {aiMessages.map((message, index) => renderAIMessage({ item: message, index }))}
                  {aiLoading && (
                    <View style={[styles.messageContainer, styles.assistantMessage, isDarkMode && styles.assistantMessageDark]}>
                      <Text style={[styles.messageText, { color: isDarkMode ? '#FFF' : '#000' }]}>
                        Thinking... 🤔
                      </Text>
                    </View>
                  )}
                </ScrollView>

                {/* Input */}
                <View style={[styles.inputContainer, isDarkMode && styles.inputContainerDark]}>
                  <TextInput
                    value={userInput}
                    onChangeText={setUserInput}
                    placeholder="Ask me about cooking, recipes, or ingredients..."
                    placeholderTextColor={isDarkMode ? '#888' : '#AAA'}
                    style={[styles.aiInput, isDarkMode && styles.aiInputDark]}
                    multiline
                    maxLength={500}
                  />
                  <TouchableOpacity
                    onPress={sendMessageToAI}
                    disabled={!userInput.trim() || aiLoading}
                    style={[
                      styles.sendButton,
                      (!userInput.trim() || aiLoading) && styles.sendButtonDisabled,
                      isDarkMode && styles.sendButtonDark
                    ]}
                  >
                    <Text style={[styles.sendButtonText, { color: isDarkMode ? '#000' : '#FFF' }]}>
                      Send
                    </Text>
                  </TouchableOpacity>
                </View>
              </SafeAreaView>
            </KeyboardAvoidingView>
          </Modal>
        </SafeAreaView>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container:           { flex: 1, backgroundColor: '#FDFFF7' },
  darkBg:              { backgroundColor: '#121212' },
  loader:              { flex: 1, justifyContent: 'center', alignItems: 'center' },

  headerContainer:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', margin: 16 },
  header:              { fontSize: 24, fontWeight: 'bold', flex: 1 },
  list:                { paddingHorizontal: 16 },

  row: {
    flexDirection:      'row',
    alignItems:         'center',
    paddingVertical:    12,
    borderBottomWidth:  1,
    borderColor:        '#DDD',
  },
  rowDark:             { borderColor: '#333' },
  thumb:               { width: 80, height: 80, borderRadius: 8 },
  mealInfo:            { flex: 1, marginLeft: 16 },
  title:               { fontSize: 18, fontWeight: '600' },
  subtitle:            { fontSize: 14, marginTop: 4 },

  searchContainer:     {
    flexDirection:      'row',
    alignItems:         'center',
    marginHorizontal:   16,
    marginBottom:       12,
    borderRadius:       8,
    backgroundColor:    '#EEE',
    paddingHorizontal:  12,
  },
  searchContainerDark: { backgroundColor: '#333' },
  searchIcon:          { marginRight: 8, fontSize: 16 },
  searchInput:         { flex: 1, height: 40, color: '#000' },
  searchInputDark:     { color: '#FFF' },
  clearButton:         { padding: 4 },
  clearButtonText:     { fontSize: 16, fontWeight: 'bold' },

  emptyContainer:      { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 40 },
  emptyText:           { fontSize: 18, textAlign: 'center', marginBottom: 16 },

  // AI Assistant styles
  aiButton:            { backgroundColor: '#007AFF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  aiButtonDark:        { backgroundColor: '#0A84FF' },
  aiButtonText:        { fontSize: 14, fontWeight: '600' },

  modalContainer:      { flex: 1 },
  modalContent:        { flex: 1 },
  modalHeader:         {
    flexDirection:      'row',
    justifyContent:     'space-between',
    alignItems:         'center',
    padding:            16,
    borderBottomWidth:  1,
    borderColor:        '#DDD',
  },
  modalHeaderDark:     { borderColor: '#333' },
  modalTitle:          { fontSize: 18, fontWeight: 'bold' },
  closeButton:         { padding: 8 },
  closeButtonText:     { fontSize: 18, fontWeight: 'bold' },

  messagesContainer:   { flex: 1 },
  messagesContent:     { padding: 16 },
  messageContainer:    { marginVertical: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, maxWidth: '80%' },
  userMessage:         { alignSelf: 'flex-end', backgroundColor: '#007AFF' },
  userMessageDark:     { backgroundColor: '#0A84FF' },
  assistantMessage:    { alignSelf: 'flex-start', backgroundColor: '#F0F0F0' },
  assistantMessageDark: { backgroundColor: '#333' },
  messageText:         { fontSize: 16, lineHeight: 20 },

  inputContainer:      {
    flexDirection:      'row',
    padding:            16,
    borderTopWidth:     1,
    borderColor:        '#DDD',
    alignItems:         'flex-end',
  },
  inputContainerDark:  { borderColor: '#333' },
  aiInput:             {
    flex:               1,
    borderWidth:        1,
    borderColor:        '#DDD',
    borderRadius:       20,
    paddingHorizontal:  16,
    paddingVertical:    12,
    marginRight:        12,
    maxHeight:          100,
    color:              '#000',
  },
  aiInputDark:         { borderColor: '#555', backgroundColor: '#333', color: '#FFF' },
  sendButton:          { backgroundColor: '#007AFF', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20 },
  sendButtonDark:      { backgroundColor: '#0A84FF' },
  sendButtonDisabled:  { backgroundColor: '#CCC', opacity: 0.6 },
  sendButtonText:      { fontSize: 16, fontWeight: '600' },
});