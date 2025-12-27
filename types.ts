export type Language = 'en' | 'ru';

export interface SubscriptionDetails {
  plan: 'free' | 'premium';
  status: 'active' | 'cancelled' | 'expired';
  nextBillingDate: string;
  price: string;
}

export interface UserSettings {
  notifications: {
    push: boolean;
    email: boolean;
    marketing: boolean;
  };
  theme: 'light' | 'dark';
}

export interface PlanHistoryItem {
  id: string;
  title: string;
  dateRange: string;
  description: string;
  caloriesAvg: number;
}

export interface DailyStats {
  waterMl: number; // Current water intake in ml
  waterGoalMl: number;
  calories: number; // Current calories
  caloriesGoal: number;
  weight?: number; // Current weight in kg
  weightGoal?: number;
  mood?: 'great' | 'good' | 'okay' | 'tired' | 'stressed'; // Daily mood
}

export interface GeneratedRecipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  calories: number;
  prepTimeMinutes: number;
  cuisine?: string;
  mealType?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard'; // New
  servings?: number; // New
  tips?: string[]; // New AI Tips
  createdAt?: string;
  imageUrl?: string; 
  rating?: number;
  author?: string;
  cookCount?: number; // New: Number of times cooked
  likesCount?: number; // New: Number of likes
}

export interface RecipeCollection {
  id: string;
  title: string;
  description: string;
  gradient: string;
  icon: string; // Emoji or icon name
  recipes: GeneratedRecipe[];
}

export interface PantryItem {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  expiryDate?: string; // ISO Date string
  category?: 'produce' | 'dairy' | 'protein' | 'pantry' | 'other';
}

// New Interface for AI Analysis
export interface PantryItemAnalysis {
  name: string;
  quantity: number;
  unit: string;
  expiryDate?: string;
  category: 'produce' | 'dairy' | 'protein' | 'pantry' | 'other';
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  goals: string[];
  dietaryPreferences: string[];
  subscription: SubscriptionDetails;
  settings: UserSettings;
  history: PlanHistoryItem[];
  dailyStats: DailyStats;
  hasCompletedOnboarding: boolean;
  savedRecipes: GeneratedRecipe[];
  pantry: PantryItem[]; // New field for Inventory
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export enum ViewState {
  PROFILE = 'PROFILE',
  SMART_FRIDGE = 'SMART_FRIDGE',
  TRACKER = 'TRACKER',
  PANTRY = 'PANTRY' // New View
}

export interface TrackerData {
  day: string;
  water: number; // in liters
  calories: number;
  weight?: number;
}