import axios from 'axios';
                   

export const API_URL = 'http://172.20.10.3:5000/api';
export const baseURL = 'http://172.20.10.3:5000';
const FDC_SEARCH_URL     = 'https://api.nal.usda.gov/fdc/v1/foods/search';
const USDA_API_KEY       = 'q5erpaBFFqJmzGzu9H6zF7sfRoG2pjVoXzdChwdu'; // hard-code key
const THEMEALDB_BASE     = 'https://www.themealdb.com/api/json/v1/1';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


// const SPOONACULAR_URL = 'https://api.spoonacular.com/recipes/complexSearch';
// const SPOONACULAR_DETAILS_URL = 'https://api.spoonacular.com/recipes/{id}/information';


// const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY || 'f57cba535cdb427bae6873cffc117686';


// Register User

// Function to handle user signup
export const registerUser = async (email: string, fullName: string, username: string, password: string) => {
  try {
    const response = await api.post('/auth/register', {fullName, email, username, password});
    return response.data;
  } catch (error:any) {
    if (error.response) {
      // Backend returned a response with an error
      console.error('Server Error:', error.response.data);
    } else {
      // Other error (network issues, timeout, etc.)
      console.error('Error signing up:', error.message);
    }
    throw error;
  }
};

// Function to handle user login
export const loginUser = async (email: string, password: string) => {
  try {

    const response = await api.post('/auth/login', { email, password });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

// TheMealDB endpoints

/** Fetch all meals for a given category (e.g. "Seafood") */
export async function getMealsByCategory(category: string): Promise<{ meals: any[] }> {
  const url = `${THEMEALDB_BASE}/filter.php?c=${encodeURIComponent(category)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`MealDB category error ${res.status}`);
  return res.json();
}

 //Lookup full meal details (ingredients, instructions, image)
export async function getMealDetails(id: string): Promise<any> {
  const url = `${THEMEALDB_BASE}/lookup.php?i=${id}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`MealDB lookup error ${res.status}`);
  const json = await res.json();
  return json.meals?.[0];
}

// USDA FDC: nutrient lookup by ingredient name


/**
 * Search FDC by food name, return the top match's key nutrients.
 * You can call this per-ingredient to build a nutrition breakdown.
 */
export async function getNutritionByIngredient(ingredient: string): Promise<{
  calories: number;
  protein:  number;
  fat:      number;
  sugars:   number;
  sodium:   number;
}> {
  const url = `${FDC_SEARCH_URL}?api_key=${USDA_API_KEY}&query=${encodeURIComponent(ingredient)}&pageSize=1`;
  const res = await fetch(url);
  const json = await res.json();
  const food = json.foods?.[0];
  if (!food) throw new Error(`No FDC match for "${ingredient}"`);

  // pull out the nutrients we care about
  const map: any = {};
  for (const n of food.foodNutrients || []) {
    switch (n.nutrientName) {
      case 'Energy':       map.calories = Math.round(n.value); break;
      case 'Protein':      map.protein  = Math.round(n.value); break;
      case 'Total lipid (fat)': map.fat = Math.round(n.value); break;
      case 'Sugars, total':    map.sugars = Math.round(n.value); break;
      case 'Sodium, Na':       map.sodium = Math.round(n.value); break;
    }
  }
  return {
    calories: map.calories || 0,
    protein:  map.protein  || 0,
    fat:      map.fat      || 0,
    sugars:   map.sugars   || 0,
    sodium:   map.sodium   || 0,
  };
}

// Open Food Facts: allergen flags



  //Search OFF by ingredient, return its allergen_tags array.
 
export async function getAllergenFlags(ingredient: string): Promise<string[]> {
  const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(ingredient)}&search_simple=1&json=1&page_size=1`;
  const res = await fetch(url);
  const json = await res.json();
  const prod = json.products?.[0];
  return prod?.allergens_tags || [];
}
