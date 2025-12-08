import { GoogleGenAI, Type } from "@google/genai";
import { Ingredient, Recipe, MealPlanDay, UserProfile, ShoppingItem } from "../types";

const apiKey = process.env.API_KEY || ''; // In a real app, handle missing key gracefully
const ai = new GoogleGenAI({ apiKey });

const modelFlash = 'gemini-2.5-flash';

// Helper to clean JSON string if Markdown code blocks are present
const cleanJson = (text: string) => {
  return text.replace(/```json\n?|\n?```/g, '').trim();
};

export const parseReceiptImage = async (base64Image: string): Promise<Ingredient[]> => {
  try {
    const response = await ai.models.generateContent({
      model: modelFlash,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image
            }
          },
          {
            text: `Analyze this grocery receipt. Extract the items as ingredients. 
            For each item, determine a likely category (produce, dairy, meat, pantry, frozen, other), 
            a standard quantity (e.g., "1 unit", "500g"), and estimate an expiry date from today (YYYY-MM-DD) based on the type of food (e.g., fresh produce = 7 days, pantry = 180 days).
            Return a JSON array.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              quantity: { type: Type.STRING },
              category: { type: Type.STRING, enum: ['produce', 'dairy', 'meat', 'pantry', 'frozen', 'other'] },
              expiryDate: { type: Type.STRING, description: "YYYY-MM-DD" },
              caloriesPerUnit: { type: Type.NUMBER, description: "Approximate calories per unit/serving" }
            },
            required: ['name', 'quantity', 'category', 'expiryDate']
          }
        }
      }
    });

    const data = JSON.parse(cleanJson(response.text || '[]'));
    return data.map((item: any) => ({
      ...item,
      id: Math.random().toString(36).substring(7)
    }));
  } catch (error) {
    console.error("OCR Error:", error);
    throw new Error("Failed to read receipt.");
  }
};

export const generateRecipesFromInventory = async (inventory: Ingredient[], user: UserProfile): Promise<Recipe[]> => {
  const inventoryList = inventory.map(i => `${i.quantity} ${i.name}`).join(', ');
  
  const prompt = `
    I have these ingredients: ${inventoryList}.
    My profile: ${JSON.stringify(user)}.
    
    Suggest 3 creative recipes that prioritize using my existing stock to reduce waste.
    Take into account my cuisine preferences (${user.cuisinePreferences?.join(', ') || 'Any'}) and maximum cooking time (${user.maxCookingTime || 60} minutes).
    Rate each recipe with a 'matchScore' (0-100) based on how many ingredients I already have vs need to buy.
    Return JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelFlash,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              ingredients: { 
                type: Type.ARRAY, 
                items: { 
                  type: Type.OBJECT, 
                  properties: { name: {type: Type.STRING}, amount: {type: Type.STRING} } 
                } 
              },
              instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
              prepTime: { type: Type.NUMBER },
              cookTime: { type: Type.NUMBER },
              calories: { type: Type.NUMBER },
              matchScore: { type: Type.NUMBER },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          }
        }
      }
    });

    const recipes = JSON.parse(cleanJson(response.text || '[]'));
    return recipes.map((r: any) => ({ ...r, id: Math.random().toString(36).substring(7) }));
  } catch (error) {
    console.error("Recipe Gen Error:", error);
    return [];
  }
};

export const generateWeeklyMealPlan = async (user: UserProfile, inventory: Ingredient[]): Promise<MealPlanDay[]> => {
  const inventoryList = inventory.map(i => i.name).join(', ');
  const prompt = `
    Create a 7-day meal plan (Monday to Sunday) for a user with these attributes:
    - Goals: ${user.goals}
    - Diet: ${user.dietaryRestrictions.join(', ')}
    - Cuisines: ${user.cuisinePreferences?.join(', ') || 'Any'}
    - Max Cooking Time: ${user.maxCookingTime || 60} minutes per meal
    
    Available Ingredients: ${inventoryList}.
    Prioritize using available ingredients to reduce waste.
    Ensure meals are culturally relevant to the preferred cuisines and fit within the time limit.
    
    Return a JSON array of objects. 
    Each object must have: 
    - day (string)
    - breakfast (object with title, calories, prepTime, cookTime)
    - lunch (object with title, calories, prepTime, cookTime)
    - dinner (object with title, calories, prepTime, cookTime)
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelFlash,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              day: { type: Type.STRING },
              breakfast: { type: Type.OBJECT, properties: { title: {type: Type.STRING}, calories: {type: Type.NUMBER}, prepTime: {type: Type.NUMBER}, cookTime: {type: Type.NUMBER} } },
              lunch: { type: Type.OBJECT, properties: { title: {type: Type.STRING}, calories: {type: Type.NUMBER}, prepTime: {type: Type.NUMBER}, cookTime: {type: Type.NUMBER} } },
              dinner: { type: Type.OBJECT, properties: { title: {type: Type.STRING}, calories: {type: Type.NUMBER}, prepTime: {type: Type.NUMBER}, cookTime: {type: Type.NUMBER} } }
            }
          }
        }
      }
    });

    const rawPlan = JSON.parse(cleanJson(response.text || '[]'));
    
    // Enrich with IDs
    return rawPlan.map((day: any) => ({
      day: day.day,
      breakfast: day.breakfast ? { ...day.breakfast, id: Math.random().toString(36).substring(7) } : undefined,
      lunch: day.lunch ? { ...day.lunch, id: Math.random().toString(36).substring(7) } : undefined,
      dinner: day.dinner ? { ...day.dinner, id: Math.random().toString(36).substring(7) } : undefined,
    }));
  } catch (error) {
    console.error("Meal Plan Error:", error);
    throw error;
  }
};

export const generateShoppingList = async (inventory: Ingredient[], mealPlan: MealPlanDay[]): Promise<ShoppingItem[]> => {
  const inventoryList = inventory.map(i => `${i.quantity} ${i.name}`).join(', ');
  
  // Extract all ingredients from meal plan
  const planDetails = mealPlan.map(day => {
    const meals = [day.breakfast, day.lunch, day.dinner].filter(m => m);
    return `${day.day}: ${meals.map(m => `${m?.title} (${m?.ingredients?.map(i => i.name).join(', ') || 'ingredients unknown'})`).join('; ')}`;
  }).join('\n');

  const prompt = `
    I have this inventory: ${inventoryList}.
    
    I have this meal plan for the week:
    ${planDetails}
    
    Create a consolidated shopping list for items I am missing or likely don't have enough of to cook these meals.
    Do not include basic staples like water, salt, pepper unless explicitly needed in large quantities.
    Return a JSON array of objects with: name, quantity, category (produce, dairy, meat, pantry, frozen, other).
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelFlash,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              quantity: { type: Type.STRING },
              category: { type: Type.STRING, enum: ['produce', 'dairy', 'meat', 'pantry', 'frozen', 'other'] }
            },
            required: ['name', 'category']
          }
        }
      }
    });

    const list = JSON.parse(cleanJson(response.text || '[]'));
    return list.map((item: any) => ({
      ...item,
      id: Math.random().toString(36).substring(7),
      checked: false
    }));
  } catch (error) {
    console.error("Shopping List Error:", error);
    return [];
  }
};

export const chatWithChef = async (history: {role: string, parts: {text: string}[]}[], message: string, inventory: Ingredient[]) => {
  const inventoryContext = inventory.map(i => i.name).join(', ');
  const systemInstruction = `You are an expert Chef and Nutritionist AI. The user has these ingredients in stock: ${inventoryContext}. 
  Answer cooking questions, suggest substitutions, and help with techniques. Keep answers concise and helpful.`;

  try {
    const chat = ai.chats.create({
      model: modelFlash,
      config: { systemInstruction },
      history: history
    });

    const result = await chat.sendMessage({ message: message });
    return result.text;
  } catch (error) {
    console.error("Chat Error:", error);
    return "I'm having a little trouble in the kitchen right now. Ask me again in a moment!";
  }
};