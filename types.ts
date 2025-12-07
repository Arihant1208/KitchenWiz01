export interface Ingredient {
  id: string;
  name: string;
  quantity: string;
  category: 'produce' | 'dairy' | 'meat' | 'pantry' | 'frozen' | 'other';
  expiryDate: string; // ISO date string
  caloriesPerUnit?: number;
}

export interface UserProfile {
  name: string;
  dietaryRestrictions: string[];
  allergies: string[];
  goals: 'weight-loss' | 'muscle-gain' | 'maintenance' | 'budget-friendly';
  cookingSkill: 'beginner' | 'intermediate' | 'advanced';
  householdSize: number;
  cuisinePreferences: string[];
  maxCookingTime: number; // minutes
}

export interface Recipe {
  id: string;
  title: string;
  description?: string;
  ingredients?: { name: string; amount: string }[];
  instructions?: string[];
  prepTime?: number; // minutes
  cookTime?: number; // minutes
  calories?: number;
  matchScore?: number; // 0-100 based on inventory
  tags?: string[];
}

export interface MealPlanDay {
  day: string;
  breakfast?: Recipe;
  lunch?: Recipe;
  dinner?: Recipe;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isTyping?: boolean;
}

export type ViewState = 'dashboard' | 'inventory' | 'recipes' | 'planner' | 'assistant' | 'profile';