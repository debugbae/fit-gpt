import { GoogleGenerativeAI } from "@google/generative-ai";
import { FoodAnalysis, RecipeSuggestion, InventoryItem, UserStats } from "../types";
import { SYSTEM_INSTRUCTIONS } from "../constants";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

// 1. Function to analyze food photos
export const analyzeFoodImage = async (base64Image: string, userClarification?: string): Promise<FoodAnalysis> => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", systemInstruction: SYSTEM_INSTRUCTIONS });
  const result = await model.generateContent({
    contents: [{
      role: 'user',
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
        { text: userClarification || "Analyze this meal." }
      ]
    }],
    generationConfig: { responseMimeType: "application/json" }
  });
  return JSON.parse(result.response.text());
};

// 2. Function to analyze fridge photos
export const analyzeFridgeImage = async (base64Image: string): Promise<Partial<InventoryItem>[]> => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent([
    { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
    { text: "List items in this fridge." }
  ]);
  return JSON.parse(result.response.text());
};

// 3. Function to suggest recipes
export const suggestRecipes = async (
  items: InventoryItem[],
  userStats: UserStats,
  query?: string,
  diet?: string
): Promise<RecipeSuggestion[]> => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  let prompt = `Based on these ingredients: ${items.map(i => i.name).join(', ')}, suggest recipes for a user who needs ${userStats.dailyBudget.calories} calories.`;
  if (diet) prompt += ` The recipes MUST be ${diet}.`;
  if (query) prompt += ` Special request: ${query}.`;
  prompt += ' Return a JSON array of objects with: title, ingredientsUsed (string[]), ingredientsMissing (string[]), expiringIngredientsUsed (string[]), matchPercentage (number), instructions (string[]), macros (object with calories, protein, carbs, fats, sodium), wastePreventionScore (number 0-100).';

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: "application/json" }
  });

  return JSON.parse(result.response.text());
};

// 4. Dynamic Recipe Suggester: High-protein meals within remaining calorie limit
export const suggestHighProteinMeals = async (
  inventory: InventoryItem[],
  remainingCalories: number
): Promise<RecipeSuggestion[]> => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const ingredients = inventory.map(i => i.name).join(', ');
  
  const prompt = `You are a nutrition AI assistant. Based on these pantry ingredients: ${ingredients}, suggest exactly 3 high-protein meal recipes that:
1. Use ingredients from the pantry when possible
2. Each meal must be HIGH PROTEIN (at least 30g protein per meal)
3. Total calories per meal must be within ${remainingCalories} kcal limit
4. Prioritize meals that use expiring ingredients first
5. Include macros breakdown (calories, protein, carbs, fats, sodium)

Return a JSON array with exactly 3 objects, each containing:
- title: string
- ingredientsUsed: string[] (from pantry)
- ingredientsMissing: string[] (needed but not in pantry)
- expiringIngredientsUsed: string[] (items expiring within 3 days)
- matchPercentage: number (0-100, how much pantry is used)
- instructions: string[] (step-by-step cooking)
- macros: { calories: number, protein: number, carbs: number, fats: number, sodium: number }
- wastePreventionScore: number (0-100, higher if using expiring items)

Focus on protein-rich meals like chicken, eggs, fish, legumes, Greek yogurt, etc.`;

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    });
    return JSON.parse(result.response.text());
  } catch (error) {
    console.error("Recipe suggestion failed:", error);
    // Return mock data for testing
    return getMockHighProteinMeals(inventory, remainingCalories);
  }
};

// Mock fallback for testing
function getMockHighProteinMeals(inventory: InventoryItem[], remainingCalories: number): RecipeSuggestion[] {
  const hasChicken = inventory.some(i => i.name.toLowerCase().includes('chicken'));
  const hasEggs = inventory.some(i => i.name.toLowerCase().includes('egg'));
  const hasFish = inventory.some(i => i.name.toLowerCase().includes('salmon') || i.name.toLowerCase().includes('fish'));
  
  const meals: RecipeSuggestion[] = [];
  
  if (hasChicken) {
    meals.push({
      title: 'Grilled Chicken & Quinoa Bowl',
      ingredientsUsed: ['Chicken', 'Quinoa'],
      ingredientsMissing: ['Vegetables', 'Olive Oil'],
      expiringIngredientsUsed: [],
      matchPercentage: 60,
      instructions: ['Cook quinoa', 'Grill chicken breast', 'Add vegetables', 'Drizzle with olive oil'],
      macros: { calories: 450, protein: 42, carbs: 35, fats: 12, sodium: 320 },
      wastePreventionScore: 75
    });
  }
  
  if (hasEggs) {
    meals.push({
      title: 'Protein Power Scramble',
      ingredientsUsed: ['Eggs'],
      ingredientsMissing: ['Spinach', 'Cheese'],
      expiringIngredientsUsed: [],
      matchPercentage: 40,
      instructions: ['Scramble eggs', 'Add spinach', 'Top with cheese', 'Serve hot'],
      macros: { calories: 380, protein: 35, carbs: 8, fats: 24, sodium: 450 },
      wastePreventionScore: 60
    });
  }
  
  if (hasFish) {
    meals.push({
      title: 'Salmon & Sweet Potato',
      ingredientsUsed: ['Salmon'],
      ingredientsMissing: ['Sweet Potato', 'Broccoli'],
      expiringIngredientsUsed: [],
      matchPercentage: 50,
      instructions: ['Bake salmon', 'Roast sweet potato', 'Steam broccoli', 'Plate together'],
      macros: { calories: 520, protein: 38, carbs: 45, fats: 18, sodium: 280 },
      wastePreventionScore: 70
    });
  }
  
  // Fill remaining slots with generic high-protein meals
  while (meals.length < 3) {
    meals.push({
      title: 'High-Protein Power Bowl',
      ingredientsUsed: inventory.slice(0, 2).map(i => i.name),
      ingredientsMissing: ['Protein source', 'Vegetables'],
      expiringIngredientsUsed: [],
      matchPercentage: 30,
      instructions: ['Combine ingredients', 'Cook protein', 'Add vegetables', 'Season and serve'],
      macros: { calories: 400, protein: 32, carbs: 30, fats: 15, sodium: 350 },
      wastePreventionScore: 50
    });
  }
  
  return meals.slice(0, 3);
}
