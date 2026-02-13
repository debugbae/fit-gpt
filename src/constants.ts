
import { UserStats, InventoryItem } from './types';

export const INITIAL_STATS: UserStats = {
  dailyBudget: {
    calories: 2200,
    protein: 150,
    carbs: 250,
    fats: 70,
    sodium: 2300,
  },
  consumedToday: {
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    sodium: 0,
  },
  dietPreference: 'None'
};

export const INITIAL_INVENTORY: InventoryItem[] = [
  { id: '1', name: 'Large Eggs', category: 'Fridge', expiryDate: '2023-12-01', quantity: '6 pcs' },
  { id: '2', name: 'Baby Spinach', category: 'Fridge', expiryDate: '2023-10-25', quantity: '1 bag' },
  { id: '3', name: 'Feta Cheese', category: 'Fridge', expiryDate: '2023-11-10', quantity: '200g' },
  { id: '4', name: 'Olive Oil', category: 'Pantry', expiryDate: '2024-05-10', quantity: '500ml' },
  { id: '5', name: 'Quinoa', category: 'Pantry', expiryDate: '2024-12-20', quantity: '1kg' },
];

export const SYSTEM_INSTRUCTIONS = `
You are FitGPT, a nutrition expert and zero-waste kitchen assistant.
1. VISION: Analyze food images. Estimate portion size and identify ingredients accurately.
2. CALCULATION: Provide Calories, Protein, Carbs, Fats, and Sodium based on the visual portion.
3. AMBIGUITY: If a food item or component is unclear (e.g. mystery sauce), set 'isAmbiguous' to true and provide an 'ambiguityQuestion'.
4. RECIPES: When given a pantry list, your primary goal is to suggest recipes that use at least 80% of items on hand. HIGHEST PRIORITY: You MUST prioritize ingredients that are closest to their expiry date to prevent waste.
5. COACHING: Adjust suggestions based on daily macros. If the user is near their sodium limit, strictly suggest low-sodium options.
6. JSON: Always respond in the requested JSON format.
`;
