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
  'waakye2.jpg': require('../assets/images/local/waakye2.jpg'),
  'grilledtilapia': require('../assets/images/local/grilledtilapia.jpg'),
  'fufu2.jpg': require('../assets/images/local/fufu.jpg'),
  'hausakoko.jpg': require('../assets/images/local/hausakoko.jpg'),
  'bankuandtilapia.png': require('../assets/images/local/bankuandtilapia.png'),
  'kenkey2.jpg': require('../assets/images/local/kenkey2.jpg'),
  'fries.jpg': require('../assets/images/local/fries.jpg'),
  'grilledtilapia.jpg': require('../assets/images/local/grilledtilapia.jpg'),
  'bankuwithokra.png': require('../assets/images/local/bankuwithokra.png'),
  'beansstew.jpg': require('../assets/images/local/beansstew.jpg'),
  'kontomirestew.jpg': require('../assets/images/local/kontomirestew.jpg'),
  'riceandeggstew.jpg': require('../assets/images/local/riceandeggstew.jpg'),
  'riceandkontomirestew.jpg': require('../assets/images/local/riceandkontomirestew.jpg'),
  'sandwich.jpg': require('../assets/images/local/sandwich.jpg'),
  'stirfriedspaghetti.png': require('../assets/images/local/stirfriedspaghetti.png'),
  'tomatostew.jpg': require('../assets/images/local/tomatostew.jpg'),
  'vegetablefruitsalad.jpg': require('../assets/images/local/vegetablefruitsalad.jpg'),
  'yamandstew.jpg': require('../assets/images/local/yamandstew.jpg'),
  'palmnutsoup.jpg': require('../assets/images/local/palmnutsoup.jpg'),

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
