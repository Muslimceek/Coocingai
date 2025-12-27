import { GoogleGenAI, Type, GenerateContentResponse, Chat } from "@google/genai";
import { GeneratedRecipe, Language, PantryItemAnalysis } from "../types";

// --- CONFIGURATION ---
// We do NOT initialize the client at the top level. This prevents the "White Screen"
// if the environment variables are missing or the library fails to load immediately.

const RECIPE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    description: { type: Type.STRING },
    ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
    instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
    calories: { type: Type.NUMBER },
    prepTimeMinutes: { type: Type.NUMBER },
    cuisine: { type: Type.STRING },
    mealType: { type: Type.STRING },
    difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard"] },
    servings: { type: Type.NUMBER },
    tips: { type: Type.ARRAY, items: { type: Type.STRING } }
  },
  required: ["title", "description", "ingredients", "instructions", "calories", "prepTimeMinutes", "difficulty", "servings"]
};

const PANTRY_ITEM_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    quantity: { type: Type.NUMBER },
    unit: { type: Type.STRING },
    expiryDate: { type: Type.STRING },
    category: { type: Type.STRING, enum: ["produce", "dairy", "protein", "pantry", "other"] }
  },
  required: ["name", "quantity", "unit", "category"]
};

// --- CORE FUNCTION ---
// The service is now just a collection of async functions that instantiate the client ON DEMAND.

export const generateRecipeFromIngredients = async (
  ingredients: string[], 
  language: Language,
  filters?: { cuisine?: string, mealType?: string, mood?: string }
): Promise<GeneratedRecipe | null> => {
  
  // Use process.env.API_KEY exclusively as per guidelines.
  const apiKey = process.env.API_KEY;
  
  // 1. Immediate Mock Fallback if no key
  if (!apiKey || apiKey.length < 5) {
    console.log("Using Mock Data (No API Key)");
    await new Promise(r => setTimeout(r, 1500)); // Fake network delay
    return getMockRecipe(ingredients, language);
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const langInstruction = language === 'ru' ? 'Respond in Russian.' : 'Respond in English.';
    
    let prompt = `Create a healthy recipe using: ${ingredients.join(', ')}. `;
    if (filters?.mealType && filters.mealType !== 'Any') prompt += ` Type: ${filters.mealType}.`;
    if (filters?.cuisine && filters.cuisine !== 'Any') prompt += ` Cuisine: ${filters.cuisine}.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt + " " + langInstruction,
      config: {
        responseMimeType: "application/json",
        responseSchema: RECIPE_SCHEMA,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response text");
    
    const parsed = JSON.parse(text) as GeneratedRecipe;
    parsed.id = Date.now().toString(); 
    parsed.createdAt = new Date().toLocaleDateString();
    parsed.imageUrl = await generateDishImage(parsed.title, parsed.ingredients) || getMockImage(parsed.title);
    
    return parsed;

  } catch (error) {
    console.error("Recipe Generation Failed. Falling back to Mock.", error);
    return getMockRecipe(ingredients, language);
  }
};

export const generateDishImage = async (title: string, ingredients: string[]): Promise<string | null> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return getMockImage(title);

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `A delicious professional food photography shot of ${title}, high quality, appetizing.` }]
      }
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64EncodeString: string = part.inlineData.data;
          return `data:image/png;base64,${base64EncodeString}`;
        }
      }
    }
    
    return null; 
  } catch (error) {
    return getMockImage(title);
  }
};

export const identifyPantryItem = async (base64Image: string, language: Language): Promise<PantryItemAnalysis | null> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    await new Promise(r => setTimeout(r, 1000));
    return getMockPantryItem();
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const base64Data = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Data } },
          { text: `Identify this food item. Return JSON.` }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: PANTRY_ITEM_SCHEMA
      }
    });
    
    if(!response.text) throw new Error("No text");
    return JSON.parse(response.text) as PantryItemAnalysis;
  } catch (error) {
    console.error("Scan failed", error);
    return getMockPantryItem();
  }
};

export const streamChatResponse = async function* (
  history: { role: string; parts: { text: string }[] }[],
  newMessage: string,
  language: Language
) {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    yield language === 'ru' 
      ? "Я работаю в оффлайн-режиме. Проверьте API ключ." 
      : "I am currently in offline mode. Please check your API settings.";
    return;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const chat: Chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      history: history.map(h => ({ role: h.role, parts: [{ text: h.parts[0].text }] })) as any,
    });
    
    const result = await chat.sendMessageStream({ message: newMessage });
    for await (const chunk of result) {
      if (chunk.text) yield chunk.text;
    }
  } catch (error) {
    console.error("Chat error", error);
    yield "Connection error. Please try again.";
  }
};

// --- MOCK GENERATORS ---

const getMockImage = (seed: string) => `https://picsum.photos/seed/${seed.replace(/\s/g, '')}/1200/800`;

const getMockRecipe = (ingredients: string[], lang: Language): GeneratedRecipe => {
  const isRu = lang === 'ru';
  return {
    id: 'mock-' + Date.now(),
    title: isRu ? "Летний Салат (Оффлайн)" : "Summer Fresh Salad (Offline)",
    description: isRu 
      ? "Мы не смогли связаться с сервером, но вот отличный рецепт из того, что есть." 
      : "We couldn't reach the server, but here is a great recipe based on your ingredients.",
    ingredients: ingredients.length ? ingredients : ["Tomatoes", "Cucumbers", "Oil"],
    instructions: isRu 
      ? ["Нарежьте овощи.", "Смешайте в миске.", "Добавьте масло и специи."]
      : ["Chop the vegetables.", "Mix in a large bowl.", "Add oil and spices."],
    calories: 250,
    prepTimeMinutes: 10,
    difficulty: "Easy",
    servings: 2,
    cuisine: "Universal",
    mealType: "Lunch",
    tips: ["Serve chilled."],
    imageUrl: getMockImage("salad"),
    createdAt: new Date().toLocaleDateString()
  };
};

const getMockPantryItem = (): PantryItemAnalysis => ({
  name: "Apple (Demo)",
  quantity: 1,
  unit: "pcs",
  expiryDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
  category: "produce"
});