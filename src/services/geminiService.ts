
import { GoogleGenAI, Type } from "@google/genai";
import { FoodAnalysis, RecipeSuggestion, InventoryItem, UserStats } from "../types";
import { SYSTEM_INSTRUCTIONS } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeFoodImage = async (base64Image: string, userClarification?: string): Promise<FoodAnalysis> => {
  const model = 'gemini-3-flash-preview';
  
  const prompt = userClarification 
    ? `The user clarified: ${userClarification}. Now provide the final nutritional breakdown for the food in the image.`
    : "Analyze this meal and provide its nutritional breakdown. If anything is ambiguous, ask the user.";

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
        { text: prompt }
      ]
    },
    config: {
      systemInstruction: SYSTEM_INSTRUCTIONS,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          itemName: { type: Type.STRING },
          macros: {
            type: Type.OBJECT,
            properties: {
              calories: { type: Type.NUMBER },
              protein: { type: Type.NUMBER },
              carbs: { type: Type.NUMBER },
              fats: { type: Type.NUMBER },
              sodium: { type: Type.NUMBER }
            },
            required: ['calories', 'protein', 'carbs', 'fats', 'sodium']
          },
          portionEstimate: { type: Type.STRING },
          ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
          isAmbiguous: { type: Type.BOOLEAN },
          ambiguityQuestion: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ['itemName', 'isAmbiguous']
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

export const analyzeFridgeImage = async (base64Image: string): Promise<Partial<InventoryItem>[]> => {
  const model = 'gemini-3-flash-preview';
  
  const prompt = "Analyze this image of a fridge or pantry. Identify all visible food items and estimate their shelf life. Return a list of items with name, category, and an estimated expiry date string (ISO format).";

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
        { text: prompt }
      ]
    },
    config: {
      systemInstruction: SYSTEM_INSTRUCTIONS,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            category: { type: Type.STRING, enum: ['Fridge', 'Pantry'] },
            expiryDate: { type: Type.STRING },
            quantity: { type: Type.STRING }
          },
          required: ['name', 'category', 'expiryDate', 'quantity']
        }
      }
    }
  });

  return JSON.parse(response.text || '[]');
};

export const suggestRecipes = async (
  inventory: InventoryItem[], 
  stats: UserStats,
  query?: string,
  diet?: string
): Promise<RecipeSuggestion[]> => {
  const model = 'gemini-3-flash-preview';
  
  // Sort inventory by expiry date ascending
  const sortedInventory = [...inventory].sort((a, b) => 
    new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
  );

  const now = new Date();
  const inventoryData = sortedInventory.map(i => {
    const daysLeft = Math.ceil((new Date(i.expiryDate).getTime() - now.getTime()) / (1000 * 3600 * 24));
    return {
      name: i.name,
      expiry: i.expiryDate,
      daysRemaining: daysLeft,
      urgency: daysLeft <= 3 ? "CRITICAL: USE IMMEDIATELY" : (daysLeft <= 7 ? "High priority" : "Stable")
    };
  });

  const remainingBudget = {
    calories: stats.dailyBudget.calories - stats.consumedToday.calories,
    protein: stats.dailyBudget.protein - stats.consumedToday.protein,
    carbs: stats.dailyBudget.carbs - stats.consumedToday.carbs,
    fats: stats.dailyBudget.fats - stats.consumedToday.fats,
    sodium: stats.dailyBudget.sodium - stats.consumedToday.sodium
  };

  const prompt = `You are the "Zero-Waste Chef". Your primary mission is to prevent food waste.
  Current Inventory (Sorted by most urgent): ${JSON.stringify(inventoryData)} 
  Remaining Daily Budget: ${JSON.stringify(remainingBudget)}

  CORE RULES:
  1. CRITICAL PRIORITY: Any item with "daysRemaining" <= 3 MUST be the centerpiece of your suggestions.
  2. MATCHING: Use at least 80% of items on hand.
  ${query ? `3. SPECIAL REQUEST: ${query}` : ''}
  ${diet ? `4. DIET: The recipes MUST be ${diet}.` : ''}
  5. WASTE PREVENTION SCORE: Calculate a score (0-100) based on how many "CRITICAL" or "High priority" items are used. A recipe using 3 critical items scores 100.
  
  Suggest 3 recipes that maximize the use of expiring items.`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTIONS,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            ingredientsUsed: { type: Type.ARRAY, items: { type: Type.STRING } },
            ingredientsMissing: { type: Type.ARRAY, items: { type: Type.STRING } },
            expiringIngredientsUsed: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "List names of ingredients used that have <= 3 days remaining."
            },
            matchPercentage: { type: Type.NUMBER },
            wastePreventionScore: { type: Type.NUMBER },
            instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
            macros: {
              type: Type.OBJECT,
              properties: {
                calories: { type: Type.NUMBER },
                protein: { type: Type.NUMBER },
                carbs: { type: Type.NUMBER },
                fats: { type: Type.NUMBER },
                sodium: { type: Type.NUMBER }
              }
            }
          },
          required: ['title', 'matchPercentage', 'macros', 'expiringIngredientsUsed', 'wastePreventionScore']
        }
      }
    }
  });

  return JSON.parse(response.text || '[]');
};
