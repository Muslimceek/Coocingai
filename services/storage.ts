import { UserProfile } from "../types";

const STORAGE_KEY = 'nourishher_user_v4'; // Bump version for pantry schema

const DEFAULT_USER: UserProfile = {
  id: 'user_123',
  name: "Sarah",
  email: "sarah@example.com",
  avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  goals: ["Weight Loss", "More Energy"],
  dietaryPreferences: ["Low Carb", "High Protein"],
  subscription: {
    plan: 'premium',
    status: 'active',
    nextBillingDate: '2025-11-24',
    price: '$9.99/mo'
  },
  settings: {
    notifications: {
      push: true,
      email: true,
      marketing: false
    },
    theme: 'light'
  },
  dailyStats: {
    waterMl: 1250,
    waterGoalMl: 2500,
    calories: 1450,
    caloriesGoal: 2000
  },
  hasCompletedOnboarding: false,
  savedRecipes: [], 
  pantry: [
    { id: 'p1', name: 'Greek Yogurt', quantity: '1', unit: 'pot', expiryDate: new Date(Date.now() + 86400000 * 3).toISOString(), category: 'dairy' },
    { id: 'p2', name: 'Chicken Breast', quantity: '500', unit: 'g', expiryDate: new Date(Date.now() + 86400000 * 2).toISOString(), category: 'protein' },
    { id: 'p3', name: 'Spinach', quantity: '1', unit: 'bag', expiryDate: new Date(Date.now() - 86400000).toISOString(), category: 'produce' }, // Expired
    { id: 'p4', name: 'Pasta', quantity: '1', unit: 'box', expiryDate: new Date(Date.now() + 86400000 * 60).toISOString(), category: 'pantry' },
  ],
  history: [
    { id: '1', title: "Low Carb Week", dateRange: "Oct 24 - Oct 30", description: "Focus on keto-friendly meals.", caloriesAvg: 1800 },
    { id: '2', title: "Detox Green", dateRange: "Oct 17 - Oct 23", description: "High fiber and green smoothies.", caloriesAvg: 1600 },
    { id: '3', title: "Mediterranean Vibes", dateRange: "Oct 10 - Oct 16", description: "Olive oil rich diet.", caloriesAvg: 1950 }
  ]
};

export const getStoredUser = (): UserProfile => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_USER;
  } catch (e) {
    console.error("Failed to load user", e);
    return DEFAULT_USER;
  }
};

export const saveUserToStorage = (user: UserProfile): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch (e) {
    console.error("Failed to save user", e);
  }
};