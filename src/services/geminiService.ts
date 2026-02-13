import { GoogleGenerativeAI } from "@google/generative-ai";
import { FoodAnalysis, RecipeSuggestion, InventoryItem, UserStats } from "../types";
import { SYSTEM_INSTRUCTIONS } from "../constants";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

export const analyzeFoodImage = async (base64Image: string, userClarification?: string): Promise<FoodAnalysis> => {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    systemInstruction: SYSTEM_INSTRUCTIONS 
  });

  const prompt = userClarification 
    ? `The user clarified: ${userClarification}. Now provide the final nutritional breakdown.` 
    : "Analyze this meal and provide its nutritional breakdown.";

  const result = await model.generateContent({
    contents: [{
      role: 'user',
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
        { text: prompt }
      ]
    }],
    generationConfig: {
      responseMimeType: "application/json",
    }
  });

  return JSON.parse(result.response.text());
};

export const analyzeFridgeImage = async (base64Image: string): Promise<Partial<InventoryItem>[]> => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = "Analyze this image of a fridge. Identify items and estimate expiry dates.";
  
  const result = await model.generateContent([
    { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
    { text: prompt }
  ]);
  
  return JSON.parse(result.response.text());
};
