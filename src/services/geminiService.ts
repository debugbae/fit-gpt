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

// 3. THE MISSING PIECE: Function to suggest recipes
export const suggestRecipes = async (items: InventoryItem[], userStats: UserStats): Promise<RecipeSuggestion[]> => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `Based on these ingredients: ${items.map(i => i.name).join(', ')}, suggest recipes for a user who needs ${userStats.dailyCalorieTarget} calories.`;
  
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: "application/json" }
  });
  
  return JSON.parse(result.response.text());
};
