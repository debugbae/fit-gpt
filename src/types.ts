
export interface NutrientProfile {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  sodium: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Fridge' | 'Pantry';
  expiryDate: string; // ISO string
  quantity: string;
}

export interface FoodAnalysis {
  itemName: string;
  macros: NutrientProfile;
  portionEstimate: string;
  ingredients: string[];
  isAmbiguous: boolean;
  ambiguityQuestion?: string;
  options?: string[];
}

export interface AnalyzedMeal {
  id: string;
  photo: string;
  timestamp: string;
  itemName: string;
  macros: NutrientProfile;
}

export interface RecipeSuggestion {
  title: string;
  ingredientsUsed: string[];
  ingredientsMissing: string[];
  expiringIngredientsUsed: string[]; // New field to track saved items
  matchPercentage: number;
  instructions: string[];
  macros: NutrientProfile;
  wastePreventionScore: number; // 0-100 score based on urgency of items used
}

export interface UserStats {
  dailyBudget: NutrientProfile;
  consumedToday: NutrientProfile;
  dietPreference?: string;
  mealHistory?: AnalyzedMeal[];
}

export type AppView = 'Dashboard' | 'MealScanner' | 'FridgeScanner' | 'KitchenHub' | 'Profile' | 'Insights' | 'Community';
