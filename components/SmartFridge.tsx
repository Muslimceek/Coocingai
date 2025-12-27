import React, { useState, useEffect } from 'react';
import { Sparkles, Compass, Heart } from 'lucide-react';
import { generateRecipeFromIngredients, generateDishImage } from '../services/geminiService';
import { GeneratedRecipe } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';
import GeneratorTab from './smart-fridge/GeneratorTab';
import ExploreTab from './smart-fridge/ExploreTab';
import SavedTab from './smart-fridge/SavedTab';

interface SmartFridgeProps {
  initialIngredients?: string[];
  clearInitialIngredients?: () => void;
}

const SmartFridge: React.FC<SmartFridgeProps> = ({ initialIngredients, clearInitialIngredients }) => {
  const { t, language } = useLanguage();
  const { user, updateUser } = useUser();
  
  // State
  const [activeTab, setActiveTab] = useState<'generate' | 'saved' | 'explore'>('generate');
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [recipe, setRecipe] = useState<GeneratedRecipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [timeGreeting, setTimeGreeting] = useState('');
  
  // Handle Initial Ingredients from Pantry
  useEffect(() => {
    if (initialIngredients && initialIngredients.length > 0) {
      setIngredients(prev => Array.from(new Set([...prev, ...initialIngredients])));
      setActiveTab('generate');
      if(clearInitialIngredients) clearInitialIngredients();
    }
  }, [initialIngredients, clearInitialIngredients]);

  // Initialize Greetings
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setTimeGreeting(t('fridge_greeting_morning'));
    } else if (hour < 17) {
      setTimeGreeting(t('fridge_greeting_afternoon'));
    } else {
      setTimeGreeting(t('fridge_greeting_evening'));
    }
  }, [t]);

  const addIngredient = (value: string) => {
    const cleanVal = value.trim();
    if (cleanVal && !ingredients.includes(cleanVal)) {
      setIngredients([...ingredients, cleanVal]);
    }
  };

  const removeIngredient = (ing: string) => {
    setIngredients(ingredients.filter(i => i !== ing));
  };

  const handleGenerate = async (filters: { cuisine: string; mealType: string; mood: string }) => {
    if (ingredients.length === 0) return;
    setLoading(true);
    setRecipe(null);
    setImageLoading(false);

    // 1. Generate Text Recipe
    const result = await generateRecipeFromIngredients(
      ingredients, 
      language, 
      { 
          cuisine: filters.cuisine === 'Any' ? undefined : filters.cuisine, 
          mealType: filters.mealType === 'Any' ? undefined : filters.mealType,
          mood: filters.mood === 'Any' ? undefined : filters.mood
      }
    );
    
    setLoading(false);
    
    if (result) {
      setRecipe(result);
      
      // 2. Trigger Image Generation in background
      setImageLoading(true);
      generateDishImage(result.title, ingredients).then((imgUrl) => {
        if (imgUrl) {
          setRecipe(prev => prev ? ({ ...prev, imageUrl: imgUrl }) : null);
        }
        setImageLoading(false);
      });
    }
  };

  const toggleFavorite = (targetRecipe: GeneratedRecipe) => {
    const exists = user.savedRecipes.some(r => r.id === targetRecipe.id);
    let newSaved;
    if (exists) {
      newSaved = user.savedRecipes.filter(r => r.id !== targetRecipe.id);
    } else {
      newSaved = [targetRecipe, ...user.savedRecipes];
    }
    updateUser({ savedRecipes: newSaved });
  };

  return (
    <div className="pb-24 pt-6 px-4 md:px-8 max-w-4xl mx-auto animate-in fade-in duration-500">
      
      {/* Header with Greeting */}
      <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-rose-500 font-bold uppercase tracking-wide text-xs mb-1">{t('fridge_title')}</p>
            <h2 className="text-3xl font-bold text-stone-800">{timeGreeting}, {user.name.split(' ')[0]}!</h2>
            <p className="text-stone-500 mt-1">{t('fridge_subtitle')}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-rose-100 p-1">
              <img src={user.avatarUrl} alt="User" className="w-full h-full rounded-full object-cover" />
          </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1.5 bg-white rounded-2xl mb-6 w-full max-w-md mx-auto md:mx-0 shadow-sm border border-stone-100">
          <button 
          onClick={() => setActiveTab('generate')}
          className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'generate' ? 'bg-rose-50 text-rose-600 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
          >
          <Sparkles size={16} /> {t('fridge_tab_gen')}
          </button>
          <button 
          onClick={() => setActiveTab('explore')}
          className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'explore' ? 'bg-rose-50 text-rose-600 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
          >
          <Compass size={16} /> {t('fridge_tab_explore')}
          </button>
          <button 
          onClick={() => setActiveTab('saved')}
          className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'saved' ? 'bg-rose-50 text-rose-600 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
          >
          <Heart size={16} /> {t('fridge_tab_saved')}
          </button>
      </div>

      {/* CONTENT SWITCHER */}
      {activeTab === 'explore' ? (
         <ExploreTab 
            t={t} 
            onToggleFavorite={toggleFavorite} 
            savedRecipeIds={user.savedRecipes.map(r => r.id)}
         />
      ) : activeTab === 'generate' ? (
        <GeneratorTab 
          ingredients={ingredients}
          addIngredient={addIngredient}
          removeIngredient={removeIngredient}
          onGenerate={handleGenerate}
          loading={loading}
          recipe={recipe}
          imageLoading={imageLoading}
          t={t}
          onToggleFavorite={toggleFavorite}
          savedRecipeIds={user.savedRecipes.map(r => r.id)}
        />
      ) : (
        <SavedTab 
          savedRecipes={user.savedRecipes} 
          t={t} 
          onToggleFavorite={toggleFavorite}
          onStartCooking={() => setActiveTab('generate')}
        />
      )}
    </div>
  );
};

export default SmartFridge;