// File: src/services/localData.ts
import ghanaMeals from '../app/data/ghanaMeals.json';

export interface Meal {
  id: string;
  name: string;
  category: string;
  thumbnail: any; // will be a require-imported image
  ingredients: string[];
  instructions: string;
  nutrition: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
}

// Map each JSON thumbnail identifier to a static require() call
const imageMap: Record<string, any> = {
  'jollof.jpg': require('../assets/images/local/jollof.jpg'),
  'friedrice.jpg': require('../assets/images/local/friedrice.jpg'),
  'spaghetti.jpg': require('../assets/images/local/spaghetti.jpg'),
  'salad.jpg': require('../assets/images/local/salad.jpg'),
  'springrolls.jpg': require('../assets/images/local/springrolls.jpg'),
  // Add more mappings for each image file you have
};

/**
 * Return the full array of Ghanaian meals, replacing JSON paths with actual require() images.
 */
export function getAllMeals(): Meal[] {
  return (ghanaMeals as any[]).map((m) => ({
    ...m,
    thumbnail: imageMap[m.thumbnail],
  }));
}

/**
 * Look up a single meal by its id.
 * Note: this returns the JSON data; you can also replace thumbnail if needed.
 */
export function getMealById(id: string): Meal | undefined {
  const m = (ghanaMeals as any[]).find((x) => x.id === id);
  if (!m) return undefined;
  return {
    ...m,
    thumbnail: imageMap[m.thumbnail],
  } as Meal;
}

/**
 * Filter meals by category string and replace thumbnail.
 */
export function getMealsByCategory(category: string): Meal[] {
  return (ghanaMeals as any[])
    .filter((m) => m.category === category)
    .map((m) => ({
      ...m,
      thumbnail: imageMap[m.thumbnail],
    } as Meal));
}
