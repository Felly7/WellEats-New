// File: services/foodRecommendation.ts

import { HealthProfile } from './healthProfile';

interface MealData {
  idMeal?: string;
  strMeal: string;
  strMealThumb: string;
  strCategory?: string;
  strArea?: string;
  strInstructions?: string;
  strTags?: string;
  // Add other meal properties as needed
}

interface LocalMeal {
  id: string;
  name: string;
  thumbnail: any;
  category?: string;
  tags?: string[];
  ingredients?: string[];
  // Add other local meal properties
}

// Food categories and their restrictions
const FOOD_CATEGORIES = {
  meat: ['beef', 'pork', 'lamb', 'chicken', 'turkey', 'duck'],
  seafood: ['fish', 'shrimp', 'crab', 'lobster', 'salmon', 'tuna'],
  dairy: ['milk', 'cheese', 'butter', 'cream', 'yogurt'],
  gluten: ['wheat', 'bread', 'pasta', 'flour', 'barley', 'rye'],
  nuts: ['peanut', 'almond', 'walnut', 'cashew', 'pistachio'],
  eggs: ['egg', 'mayonnaise'],
  soy: ['soy', 'tofu', 'tempeh', 'miso'],
};

// Keywords that might indicate dietary restrictions
const DIETARY_KEYWORDS = {
  vegetarian: ['vegetarian', 'veggie'],
  vegan: ['vegan'],
  glutenFree: ['gluten free', 'gluten-free'],
  dairyFree: ['dairy free', 'dairy-free', 'lactose free'],
  ketogenic: ['keto', 'ketogenic', 'low carb'],
  paleo: ['paleo', 'paleolithic'],
  lowSodium: ['low sodium', 'low salt'],
};

export const calculateMealScore = (meal: MealData | LocalMeal, profile: HealthProfile): number => {
  let score = 100; // Start with perfect score
  
  const mealName = 'strMeal' in meal ? meal.strMeal : meal.name;
  const mealCategory = 'strCategory' in meal ? meal.strCategory : meal.category;
  const mealTags = 'strTags' in meal ? meal.strTags : meal.tags?.join(' ');
  const mealInstructions = 'strInstructions' in meal ? meal.strInstructions : '';
  
  const searchText = `${mealName} ${mealCategory} ${mealTags} ${mealInstructions}`.toLowerCase();
  
  // Check dietary restrictions
  if (profile.dietary.vegetarian) {
    const hasMeat = FOOD_CATEGORIES.meat.some(meat => searchText.includes(meat));
    const hasSeafood = FOOD_CATEGORIES.seafood.some(seafood => searchText.includes(seafood));
    if (hasMeat || hasSeafood) score -= 50;
  }
  
  if (profile.dietary.vegan) {
    const hasMeat = FOOD_CATEGORIES.meat.some(meat => searchText.includes(meat));
    const hasSeafood = FOOD_CATEGORIES.seafood.some(seafood => searchText.includes(seafood));
    const hasDairy = FOOD_CATEGORIES.dairy.some(dairy => searchText.includes(dairy));
    const hasEggs = FOOD_CATEGORIES.eggs.some(egg => searchText.includes(egg));
    if (hasMeat || hasSeafood || hasDairy || hasEggs) score -= 60;
  }
  
  if (profile.dietary.glutenFree) {
    const hasGluten = FOOD_CATEGORIES.gluten.some(gluten => searchText.includes(gluten));
    if (hasGluten) score -= 40;
  }
  
  if (profile.dietary.dairyFree) {
    const hasDairy = FOOD_CATEGORIES.dairy.some(dairy => searchText.includes(dairy));
    if (hasDairy) score -= 40;
  }
  
  // Check allergies
  profile.allergies.forEach(allergy => {
    const allergyKeywords = FOOD_CATEGORIES[allergy.toLowerCase() as keyof typeof FOOD_CATEGORIES] || [allergy];
    const hasAllergen = allergyKeywords.some(keyword => searchText.includes(keyword.toLowerCase()));
    if (hasAllergen) score -= 100; // Allergies are deal-breakers
  });
  
  // Check preferences (positive scoring)
  if (!profile.preferences.seafood) {
    const hasSeafood = FOOD_CATEGORIES.seafood.some(seafood => searchText.includes(seafood));
    if (hasSeafood) score -= 20;
  }
  
  if (!profile.preferences.meat) {
    const hasMeat = FOOD_CATEGORIES.meat.some(meat => searchText.includes(meat));
    if (hasMeat) score -= 20;
  }
  
  if (!profile.preferences.sweets && (searchText.includes('dessert') || searchText.includes('sweet'))) {
    score -= 15;
  }
  
  // Bonus for matching dietary keywords
  Object.entries(DIETARY_KEYWORDS).forEach(([diet, keywords]) => {
    if (profile.dietary[diet as keyof typeof profile.dietary]) {
      const hasKeyword = keywords.some(keyword => searchText.includes(keyword));
      if (hasKeyword) score += 20;
    }
  });
  
  // Health goals bonuses
  if (profile.healthGoals.weightLoss) {
    if (searchText.includes('salad') || searchText.includes('light') || searchText.includes('healthy')) {
      score += 15;
    }
  }
  
  if (profile.healthGoals.heartHealth) {
    if (searchText.includes('salmon') || searchText.includes('avocado') || searchText.includes('oats')) {
      score += 15;
    }
  }
  
  return Math.max(0, score); // Ensure score doesn't go below 0
};

export const filterAndRankMeals = <T extends MealData | LocalMeal>(
  meals: T[],
  profile: HealthProfile,
  minScore: number = 50
): T[] => {
  return meals
    .map(meal => ({
      meal,
      score: calculateMealScore(meal, profile),
    }))
    .filter(item => item.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .map(item => item.meal);
};

export const getRecommendedCategories = (profile: HealthProfile): string[] => {
  const categories = [];
  
  if (profile.dietary.vegetarian || profile.dietary.vegan) {
    categories.push('Vegetarian');
  }
  
  if (profile.preferences.seafood && !profile.dietary.vegetarian && !profile.dietary.vegan) {
    categories.push('Seafood');
  }
  
  if (profile.preferences.sweets) {
    categories.push('Dessert');
  }
  
  if (profile.healthGoals.weightLoss) {
    categories.push('Side');
  }
  
  // Default categories if none match
  if (categories.length === 0) {
    categories.push('Breakfast', 'Chicken', 'Beef');
  }
  
  return categories;
};