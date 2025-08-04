// File: components/FoodAIAssistant.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  useColorScheme,
  Dimensions,
  Animated,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { researchFood, findOrderingLinks } from '../../services/huggingfaceService'; // Updated import
const { width, height } = Dimensions.get('window');

interface FoodAIAssistantProps {
  foodName: string;
  mealId: string;
  isVisible?: boolean;
}

interface ResearchData {
  healthBenefits: string[];
  cookingMethods: string[];
  suitableFor: string[];
  nutritionPer100g: {
    calories: number;
    protein: string;
    fat: string;
    carbs: string;
  };
}

interface OrderingLink {
  name: string;
  url: string;
  price: string;
  rating: number;
  deliveryTime: string;
}

export default function FoodAIAssistant({ foodName, mealId, isVisible = true }: FoodAIAssistantProps) {
  const isDarkMode = useColorScheme() === 'dark';
  const [activeModal, setActiveModal] = useState<'research' | 'ordering' | null>(null);
  const [loading, setLoading] = useState(false);
  const [researchData, setResearchData] = useState<ResearchData | null>(null);
  const [orderingLinks, setOrderingLinks] = useState<OrderingLink[] | null>(null);
  const [buttonScale] = useState(new Animated.Value(1));
  const [error, setError] = useState<string | null>(null);

  // Quick Gemini test function
  const testGeminiQuick = async () => {
    console.log('🧪 Quick Hugging Face test starting...');
    
    // Debug: Check environment variables
    console.log('🔍 Debug Info:');
    console.log('- API Key exists:', !!process.env.EXPO_PUBLIC_HUGGINGFACE_API_KEY);
    console.log('- API Key preview:', process.env.EXPO_PUBLIC_HUGGINGFACE_API_KEY?.substring(0, 8) + '...');
    console.log('- All HF env vars:', Object.keys(process.env).filter(key => key.includes('HUGGINGFACE') || key.includes('HF')));
    console.log('- All env vars containing "API":', Object.keys(process.env).filter(key => key.includes('API')));
    console.log('- Full process.env keys:', Object.keys(process.env).sort());
    
    try {
      // Test the actual research function
      const result = await researchFood('apple');
      
      console.log('✅ Test Result:', result);
      
      Alert.alert(
        result.success ? 'Hugging Face Working! 🎉' : 'Hugging Face Failed ❌',
        result.success 
          ? `API connection successful!\n\nFound ${result.data?.healthBenefits?.length || 0} health benefits for apple`
          : `Error: ${result.error}\n\nCheck console for debug info`,
        [
          { text: 'View Console', onPress: () => console.log('Full result:', result) },
          { text: 'OK' }
        ]
      );
    } catch (error) {
      console.error('❌ Test failed:', error);
      Alert.alert(
        'Test Error ❌', 
        `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}\n\nCheck console for details`,
        [
          { text: 'Check Console', onPress: () => console.log('Error details:', error) },
          { text: 'OK' }
        ]
      );
    }
  };

  // Animate button press
  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleResearch = async () => {
    animateButton();
    setLoading(true);
    setError(null);
    setActiveModal('research');
    
    try {
      console.log('🔍 Starting Hugging Face food research for:', foodName);
      
      // Call Gemini AI service
      const result = await researchFood(foodName);
      
      if (result.success && result.data) {
        console.log('✅ Research successful:', result.data);
        setResearchData(result.data);
      } else {
        throw new Error(result.error || 'Failed to get research data');
      }
    } catch (error) {
      console.error('❌ Hugging Face Research failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Research failed: ${errorMessage}`);
      
      Alert.alert(
        'Research Failed', 
        `Unable to fetch food research using Hugging Face AI.\n\nError: ${errorMessage}\n\nPlease check your API key and try again.`,
        [
          { text: 'Retry', onPress: () => handleResearch() },
          { text: 'Cancel', onPress: () => setActiveModal(null) }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFindOrders = async () => {
    animateButton();
    setLoading(true);
    setError(null);
    setActiveModal('ordering');
    
    try {
      console.log('🛒 Starting Hugging Face ordering search for:', foodName);
      
      // Call Gemini AI service
      const result = await findOrderingLinks(foodName);
      
      if (result.success && result.data) {
        console.log('✅ Ordering search successful:', result.data);
        setOrderingLinks(result.data);
      } else {
        throw new Error(result.error || 'Failed to get ordering data');
      }
    } catch (error) {
      console.error('❌ Hugging Face Ordering search failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Ordering search failed: ${errorMessage}`);
      
      Alert.alert(
        'Search Failed', 
        `Unable to find ordering options using Hugging Face AI.\n\nError: ${errorMessage}\n\nPlease check your API key and try again.`,
        [
          { text: 'Retry', onPress: () => handleFindOrders() },
          { text: 'Cancel', onPress: () => setActiveModal(null) }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setActiveModal(null);
    setResearchData(null);
    setOrderingLinks(null);
    setError(null);
  };

  const openLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", "Cannot open this link");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to open link");
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Ionicons key={i} name="star" size={16} color="#FFD700" />);
    }
    if (hasHalfStar) {
      stars.push(<Ionicons key="half" name="star-half" size={16} color="#FFD700" />);
    }
    return stars;
  };

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Ionicons name="warning" size={48} color="#FF6B6B" />
      <Text style={[styles.errorTitle, isDarkMode && styles.textDark]}>
        Oops! Something went wrong
      </Text>
      <Text style={[styles.errorText, isDarkMode && styles.textSecondary]}>
        {error}
      </Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={() => {
          if (activeModal === 'research') {
            handleResearch();
          } else if (activeModal === 'ordering') {
            handleFindOrders();
          }
        }}
      >
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  if (!isVisible) return null;

  return (
    <>
      {/* Floating AI Buttons */}
      <View style={styles.floatingContainer}>
        {/* Test Button - Remove after testing */}
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity
            style={[styles.floatingButton, styles.testButton]}
            onPress={testGeminiQuick}
            activeOpacity={0.8}
          >
            <Ionicons name="flask" size={20} color="white" />
            <Text style={styles.testButtonLabel}>TEST</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Research Button */}
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity
            style={[styles.floatingButton, styles.researchButton]}
            onPress={handleResearch}
            activeOpacity={0.8}
          >
            <Ionicons name="library" size={24} color="white" />
          </TouchableOpacity>
        </Animated.View>

        {/* Order Button */}
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity
            style={[styles.floatingButton, styles.orderButton]}
            onPress={handleFindOrders}
            activeOpacity={0.8}
          >
            <Ionicons name="storefront" size={24} color="white" />
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Modal */}
      <Modal
        visible={activeModal !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <View style={[styles.modalContainer, isDarkMode && styles.darkBg]}>
          {/* Modal Header */}
          <View style={[styles.modalHeader, isDarkMode && styles.darkCard]}>
            <Text style={[styles.modalTitle, isDarkMode && styles.textDark]}>
              {activeModal === 'research' ? '🤖 Hugging Face Research' : '🛒 Order Locations'}
            </Text>
            <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={isDarkMode ? "#fff" : "#666"} />
            </TouchableOpacity>
          </View>

          {/* Modal Content */}
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4ECDC4" />
                <Text style={[styles.loadingText, isDarkMode && styles.textSecondary]}>
                  {activeModal === 'research' 
                    ? `Hugging Face is researching ${foodName}...` 
                    : `Hugging Face is finding places to order ${foodName}...`
                  }
                </Text>
                <Text style={[styles.loadingSubtext, isDarkMode && styles.textSecondary]}>
                  Powered by Hugging Face 🤗
                </Text>
              </View>
            ) : error ? (
              renderErrorState()
            ) : (
              <>
                {/* Research Modal Content */}
                {activeModal === 'research' && researchData && (
                  <View style={styles.researchContent}>
                    {/* AI Attribution */}
                    <View style={styles.aiAttribution}>
                      <Ionicons name="sparkles" size={16} color="#4ECDC4" />
                      <Text style={[styles.attributionText, isDarkMode && styles.textSecondary]}>
                        Research powered by Hugging Face 🤗
                      </Text>
                    </View>

                    {/* Nutrition Summary */}
                    <View style={[styles.section, styles.nutritionSummary]}>
                      <View style={styles.sectionHeader}>
                        <Ionicons name="fitness" size={20} color="#FF6B6B" />
                        <Text style={[styles.sectionTitle, isDarkMode && styles.textDark]}>
                          Nutrition per 100g
                        </Text>
                      </View>
                      <View style={styles.nutritionGrid}>
                        <View style={styles.nutritionItem}>
                          <Text style={[styles.nutritionValue, isDarkMode && styles.textDark]}>
                            {researchData.nutritionPer100g.calories}
                          </Text>
                          <Text style={[styles.nutritionLabel, isDarkMode && styles.textSecondary]}>
                            Calories
                          </Text>
                        </View>
                        <View style={styles.nutritionItem}>
                          <Text style={[styles.nutritionValue, isDarkMode && styles.textDark]}>
                            {researchData.nutritionPer100g.protein}
                          </Text>
                          <Text style={[styles.nutritionLabel, isDarkMode && styles.textSecondary]}>
                            Protein
                          </Text>
                        </View>
                        <View style={styles.nutritionItem}>
                          <Text style={[styles.nutritionValue, isDarkMode && styles.textDark]}>
                            {researchData.nutritionPer100g.fat}
                          </Text>
                          <Text style={[styles.nutritionLabel, isDarkMode && styles.textSecondary]}>
                            Fat
                          </Text>
                        </View>
                        <View style={styles.nutritionItem}>
                          <Text style={[styles.nutritionValue, isDarkMode && styles.textDark]}>
                            {researchData.nutritionPer100g.carbs}
                          </Text>
                          <Text style={[styles.nutritionLabel, isDarkMode && styles.textSecondary]}>
                            Carbs
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Health Benefits */}
                    <View style={styles.section}>
                      <View style={styles.sectionHeader}>
                        <Ionicons name="heart" size={20} color="#4ECDC4" />
                        <Text style={[styles.sectionTitle, isDarkMode && styles.textDark]}>
                          Health Benefits
                        </Text>
                      </View>
                      {researchData.healthBenefits.map((benefit, index) => (
                        <View key={index} style={styles.listItem}>
                          <View style={[styles.bulletPoint, { backgroundColor: '#4ECDC4' }]} />
                          <Text style={[styles.listText, isDarkMode && styles.textSecondary]}>
                            {benefit}
                          </Text>
                        </View>
                      ))}
                    </View>

                    {/* Cooking Methods */}
                    <View style={styles.section}>
                      <View style={styles.sectionHeader}>
                        <Ionicons name="flame" size={20} color="#FFA500" />
                        <Text style={[styles.sectionTitle, isDarkMode && styles.textDark]}>
                          Cooking Methods
                        </Text>
                      </View>
                      {researchData.cookingMethods.map((method, index) => (
                        <View key={index} style={styles.listItem}>
                          <View style={[styles.bulletPoint, { backgroundColor: '#FFA500' }]} />
                          <Text style={[styles.listText, isDarkMode && styles.textSecondary]}>
                            {method}
                          </Text>
                        </View>
                      ))}
                    </View>

                    {/* Suitable For */}
                    <View style={styles.section}>
                      <View style={styles.sectionHeader}>
                        <Ionicons name="people" size={20} color="#9B59B6" />
                        <Text style={[styles.sectionTitle, isDarkMode && styles.textDark]}>
                          Suitable For
                        </Text>
                      </View>
                      {researchData.suitableFor.map((condition, index) => (
                        <View key={index} style={styles.listItem}>
                          <View style={[styles.bulletPoint, { backgroundColor: '#9B59B6' }]} />
                          <Text style={[styles.listText, isDarkMode && styles.textSecondary]}>
                            {condition}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Ordering Modal Content */}
                {activeModal === 'ordering' && orderingLinks && (
                  <View style={styles.orderingContent}>
                    {/* AI Attribution */}
                    <View style={styles.aiAttribution}>
                      <Ionicons name="sparkles" size={16} color="#4ECDC4" />
                      <Text style={[styles.attributionText, isDarkMode && styles.textSecondary]}>
                        Results powered by Hugging Face 🤗
                      </Text>
                    </View>

                    <Text style={[styles.subtitle, isDarkMode && styles.textSecondary]}>
                      Here are the best places to order {foodName}:
                    </Text>
                    {orderingLinks.map((link, index) => (
                      <View key={index} style={[styles.orderCard, isDarkMode && styles.darkCard]}>
                        <View style={styles.orderHeader}>
                          <Text style={[styles.orderName, isDarkMode && styles.textDark]}>
                            {link.name}
                          </Text>
                          <Text style={styles.orderPrice}>{link.price}</Text>
                        </View>
                        <View style={styles.orderMeta}>
                          <View style={styles.orderRating}>
                            {renderStars(link.rating)}
                            <Text style={[styles.ratingText, isDarkMode && styles.textSecondary]}>
                              {link.rating}
                            </Text>
                          </View>
                          <Text style={[styles.deliveryTime, isDarkMode && styles.textSecondary]}>
                            • {link.deliveryTime}
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={styles.orderButton}
                          onPress={() => openLink(link.url)}
                        >
                          <Text style={styles.orderButtonText}>Order Now</Text>
                          <Ionicons name="arrow-forward" size={16} color="white" style={{ marginLeft: 8 }} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    right: 20,
    bottom: 40,
    zIndex: 1000,
  },
  floatingButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  researchButton: {
    backgroundColor: '#4ECDC4',
  },
  orderButton: {
    backgroundColor: '#FF6B6B',
  },
  testButton: {
    backgroundColor: '#9B59B6',
    width: 65,
    height: 50,
    borderRadius: 25,
    flexDirection: 'column',
    paddingVertical: 4,
  },
  testButtonLabel: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
    marginTop: 2,
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  darkBg: {
    backgroundColor: '#0d1117',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  darkCard: {
    backgroundColor: '#21262d',
    borderBottomColor: '#30363d',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  textDark: {
    color: '#ffffff',
  },
  textSecondary: {
    color: '#8b949e',
  },
  closeButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },

  // AI Attribution
  aiAttribution: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    padding: 12,
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    borderRadius: 8,
  },
  attributionText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
    fontStyle: 'italic',
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 12,
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
  },

  // Error State
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Research Content
  researchContent: {
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginLeft: 8,
  },
  nutritionSummary: {
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    padding: 20,
    borderRadius: 16,
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  nutritionLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bulletPoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
    marginTop: 6,
  },
  listText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
    flex: 1,
  },

  // Ordering Content
  orderingContent: {
    paddingBottom: 40,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  orderCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  orderPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#27AE60',
  },
  orderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  orderRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  deliveryTime: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  orderButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});