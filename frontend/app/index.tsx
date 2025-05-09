import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';

// Get screen width for FlatList paging
const { width } = Dimensions.get('window');

// Onboarding slides data
const slides = [
  {
    id: '1',
    subtitle: 'WellEats',
    // description: 'HEALTH FOCUSED FOOD APP',
    image: require('../assets/images/1.png'),
  },
  {
    id: '2',
    title: 'Personalised Nutrition for Your Health',
    description: 'Tell us about your health, and we’ll recommend the best foods for you!',
    image: require('../assets/images/2.png'),
  },
  {
    id: '3',
    title: 'Smart Food Recommendations',
    description: 'Get AI-powered food suggestions tailored to your dietary needs.',
    image: require('../assets/images/3.png'),
  },
  {
    id: '4',
    title: 'Plan, Eat, Stay Healthy!',
    description: 'Create meal plans, track your diet, and improve your well-being effortlessly.',
    image: require('../assets/images/4.png'),
  },
  {
    id: '5',
    // title: 'Get Started!',
    description: '',
    image: require('../assets/images/6.png'),
  },
];

// Main App Component
const App: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showLogin, setShowLogin] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Handle "Next" button click
  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentSlide + 1 });
      setCurrentSlide(currentSlide + 1);
    } else {
      setShowLogin(true); // Move to login screen
    }
  };

  // Render Onboarding Item
  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.slide}>
      <Text style={styles.title}>{item.title}</Text>
      <Image source={item.image} style={styles.image} />

      {/* {item.subtitle && <Text style={styles.subtitle}>{item.subtitle}</Text>} */}
      <Text style={styles.description}>{item.description}</Text>
      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>
          {currentSlide === slides.length - 1 ? 'GET STARTED!' : 'NEXT'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Render Login Screen
  if (showLogin) {
    return (
      <View style={styles.loginContainer}>
        <Text style={styles.loginText}>Welcome to WellEats!</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/login')}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      ref={flatListRef}
      data={slides}
      renderItem={renderItem}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.id}
      scrollEnabled={false} // Disable manual swiping
    />
  );
};

export default App;

// Styles
const styles = StyleSheet.create({
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    backgroundColor: '#D0CFCF',
  },
  image: {
    width: width,
    height: '60%',
    resizeMode: 'cover',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 20,
    color: '#000',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#000',
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#FFE600',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 20,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#D0CFCF',
  },
  loginText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
  },
});
