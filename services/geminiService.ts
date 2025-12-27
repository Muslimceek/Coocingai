import { GoogleGenAI, Type, GenerateContentResponse, Chat } from "@google/genai";
import { GeneratedRecipe, Language, PantryItemAnalysis } from "../types";

// Initialize Gemini Client
// Using process.env.API_KEY as per standard conventions for this environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || process.env.VITE_GEMINI_API_KEY });

const RECIPE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    description: { type: Type.STRING },
    ingredients: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    instructions: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    calories: { type: Type.NUMBER },
    prepTimeMinutes: { type: Type.NUMBER },
    cuisine: { type: Type.STRING },
    mealType: { type: Type.STRING },
    difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard"] },
    servings: { type: Type.NUMBER },
    tips: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "Short, helpful chef tips or substitutions"
    }
  },
  required: ["title", "description", "ingredients", "instructions", "calories", "prepTimeMinutes", "difficulty", "servings"]
};

// Schema for Pantry Analysis
const PANTRY_ITEM_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    quantity: { type: Type.NUMBER },
    unit: { type: Type.STRING },
    expiryDate: { type: Type.STRING, description: "YYYY-MM-DD or null if not found" },
    category: { type: Type.STRING, enum: ["produce", "dairy", "protein", "pantry", "other"] }
  },
  required: ["name", "quantity", "unit", "category"]
};

export const generateRecipeFromIngredients = async (
  ingredients: string[], 
  language: Language,
  filters?: { cuisine?: string, mealType?: string, mood?: string }
): Promise<GeneratedRecipe | null> => {
  const apiKey = process.env.API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.error("API Key missing");
    return getMockRecipe();
  }

  try {
    const langInstruction = language === 'ru' ? 'Respond in Russian.' : 'Respond in English.';
    
    let prompt = `Create a healthy, delicious recipe using these ingredients: ${ingredients.join(', ')}. 
    You can assume basic pantry staples (oil, salt, pepper) are available. 
    Focus on a meal suitable for a woman's nutritional needs.`;

    if (filters?.mealType && filters.mealType !== 'Any') {
      prompt += ` The meal must be a ${filters.mealType}.`;
    }

    if (filters?.cuisine && filters.cuisine !== 'Any') {
      prompt += ` The recipe must be in the style of ${filters.cuisine} cuisine.`;
    }
    
    if (filters?.mood && filters.mood !== 'Any') {
      prompt += ` The recipe should fit a "${filters.mood}" mood/occasion.`;
    }

    prompt += ` ${langInstruction}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: `You are a world-class nutritionist and chef designed to help women cook healthy meals easily. 
        Provide 2-3 helpful tips (substitutions, nutritional benefits) in the 'tips' field.
        If the cuisine is Central Asian (Uzbek, Tajik, etc.), suggest an adapted healthier version if traditional versions are too heavy, 
        but keep the authentic flavor profile. ${langInstruction}`,
        responseMimeType: "application/json",
        responseSchema: RECIPE_SCHEMA,
      }
    });

    const text = response.text;
    if (!text) return null;
    
    const parsed = JSON.parse(text) as GeneratedRecipe;
    parsed.id = Date.now().toString(); 
    parsed.createdAt = new Date().toLocaleDateString();
    return parsed;

  } catch (error) {
    console.error("Gemini Recipe Error:", error);
    return getMockRecipe();
  }
};

const getMockRecipe = (): GeneratedRecipe => ({
  id: 'mock-id-' + Date.now(),
  title: "Avocado & Egg Toast (Mock)",
  description: "A quick mock recipe because API Key is missing or error occurred.",
  ingredients: ["Avocado", "Bread", "Egg"],
  instructions: ["Toast bread", "Mash avocado", "Fry egg", "Combine"],
  calories: 350,
  prepTimeMinutes: 10,
  cuisine: 'European',
  mealType: 'Breakfast',
  difficulty: 'Easy',
  servings: 1,
  tips: ["Add some chili flakes for heat!", "Use sourdough for better texture."],
  createdAt: new Date().toLocaleDateString()
});

export const generateDishImage = async (title: string, ingredients: string[]): Promise<string | null> => {
  const apiKey = process.env.API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const prompt = `A professional food photography shot of a dish called "${title}". 
    The dish MUST visibly contain these ingredients: ${ingredients.join(', ')}.
    High resolution, appetizing, soft lighting, 4k, overhead or 45-degree angle view, restaurant quality.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: prompt,
      config: {
        imageConfig: {
          aspectRatio: "16:9"
        }
      }
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          const mimeType = part.inlineData.mimeType || 'image/png';
          return `data:${mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Image Gen Error:", error);
    return null;
  }
};

export const identifyPantryItem = async (base64Image: string, language: Language): Promise<PantryItemAnalysis | null> => {
  const apiKey = process.env.API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const base64Data = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
    
    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64Data
      }
    };

    const prompt = `Identify the food product in this image. 
    If you see a barcode or text on packaging, use it to identify the item name accurately.
    Estimate quantity (e.g. 1 for a pack/bottle, or grams if visible).
    Suggest a unit (pcs, g, kg, ml, l, cup, pack).
    If an expiration date is clearly visible on the packaging, extract it (YYYY-MM-DD). If not, leave expiryDate null.
    Categorize into: produce, dairy, protein, pantry, other.
    ${language === 'ru' ? 'Return the name in Russian.' : 'Return the name in English.'}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [imagePart, { text: prompt }]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: PANTRY_ITEM_SCHEMA
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as PantryItemAnalysis;

  } catch (error) {
    console.error("Pantry Scan Error:", error);
    return null;
  }
};

export const streamChatResponse = async function* (
  history: { role: string; parts: { text: string }[] }[],
  newMessage: string,
  language: Language
) {
  const apiKey = process.env.API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    yield "I'm sorry, I cannot connect to the AI service right now (Missing API Key).";
    return;
  }

  try {
    const langInstruction = language === 'ru' ? 'Respond in Russian.' : 'Respond in English.';
    
    // Filter history to strictly ensure it starts with 'user' role if needed, 
    // although the new SDK is more forgiving, sticking to clean history is good practice.
    const filteredHistory = history.filter((msg, index) => {
      // Very basic filtering, usually handled by caller, but ensure no empty parts
      return msg.parts.length > 0;
    });
    
    const chat: Chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      history: filteredHistory as any,
      config: {
        systemInstruction: `You are a friendly, supportive AI Chef and Nutritionist for a women's health app. Keep answers concise, encouraging, and helpful. You help with ingredient substitutions, cooking tips, and quick healthy snack ideas. ${langInstruction}`
      }
    });

    const result = await chat.sendMessageStream({ message: newMessage });

    for await (const chunk of result) {
      const c = chunk as GenerateContentResponse;
      if (c.text) {
        yield c.text;
      }
    }
  } catch (error) {
    console.error("Chat Error:", error);
    yield "I'm having a little trouble thinking right now. Please try again.";
  }
};