
import React, { useState, useEffect } from 'react';
import { 
  Plus, X, Wand2, Sparkles, ArrowRight, Loader2, 
  ChefHat, Flame, Coffee, Moon, Sun, RefreshCw 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GeneratedRecipe } from '../../types';
import RecipeCard from './RecipeCard';

interface GeneratorTabProps {
  ingredients: string[];
  addIngredient: (val: string) => void;
  removeIngredient: (val: string) => void;
  onGenerate: (filters: { cuisine: string; mealType: string; mood: string }) => void;
  loading: boolean;
  recipe: GeneratedRecipe | null;
  imageLoading: boolean;
  t: (key: string) => string;
  onToggleFavorite: (recipe: GeneratedRecipe) => void;
  savedRecipeIds: string[];
}

// --- SMART SUGGESTIONS LOGIC ---
// "Anticipatory Design": Guesses what the user might have based on time of day.
const getTimeBasedSuggestions = (t: (key: string) => string) => {
    const hour = new Date().getHours();
    if (hour < 11) return [
        { label: t('ing_eggs'), icon: <Sun size={14} />, color: 'bg-amber-100 text-amber-700' },
        { label: 'Oats', icon: <Coffee size={14} />, color: 'bg-stone-100 text-stone-700' },
        { label: t('ing_milk'), icon: '🥛', color: 'bg-blue-50 text-blue-600' }
    ];
    if (hour < 17) return [
        { label: t('ing_rice'), icon: '🍚', color: 'bg-emerald-50 text-emerald-600' },
        { label: t('ing_chicken'), icon: <DrumstickIcon />, color: 'bg-orange-50 text-orange-600' },
        { label: 'Avocado', icon: '🥑', color: 'bg-green-100 text-green-700' }
    ];
    return [
        { label: t('ing_potatoes'), icon: '🥔', color: 'bg-amber-50 text-amber-700' },
        { label: 'Pasta', icon: '🍝', color: 'bg-yellow-50 text-yellow-600' },
        { label: t('ing_onion'), icon: '🧅', color: 'bg-purple-50 text-purple-600' }
    ];
};

const DrumstickIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.4 2.5c-.8 0-1.5.7-1.5 1.5v16c0 .8.7 1.5 1.5 1.5h9.1c.9 0 1.5-.7 1.5-1.5V4c0-.8-.7-1.5-1.5-1.5H7.4ZM11 2.5v17.5M7.4 7.6h9.1M7.4 12.7h9.1M7.4 17.8h9.1"/></svg>
)

const GeneratorTab: React.FC<GeneratorTabProps> = ({
  ingredients,
  addIngredient,
  removeIngredient,
  onGenerate,
  loading,
  recipe,
  imageLoading,
  t,
  onToggleFavorite,
  savedRecipeIds
}) => {
  const [inputValue, setInputValue] = useState('');
  const [activeCuisine, setActiveCuisine] = useState('Any');
  const suggestions = getTimeBasedSuggestions(t);

  // Haptics Helper
  const vibrate = (pattern: number | number[] = 10) => {
      if(navigator.vibrate) navigator.vibrate(pattern);
  }

  const handleAdd = (val?: string) => {
    const item = val || inputValue;
    if (item.trim()) {
      addIngredient(item);
      setInputValue('');
      vibrate(15);
    }
  };

  const handleGenerateClick = () => {
      vibrate([20, 50]); // Heavy mechanical thud
      onGenerate({ cuisine: activeCuisine, mealType: 'Any', mood: 'Any' });
  }

  return (
    <div className="w-full space-y-6 pb-24">
      
      {/* 1. THE COMMAND CENTER (Input) */}
      <motion.div 
         initial={{ y: 20, opacity: 0 }}
         animate={{ y: 0, opacity: 1 }}
         className="relative group z-20"
      >
          {/* Ambient Glow / Focus State */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-300 via-orange-300 to-amber-300 rounded-[2rem] blur opacity-20 group-focus-within:opacity-60 transition duration-500" />
          
          <div className="relative bg-white/80 backdrop-blur-xl rounded-[2rem] p-2 pr-3 shadow-lg border border-white/60 flex items-center gap-2">
              <div className="w-12 h-12 bg-stone-100 rounded-[1.5rem] flex items-center justify-center text-stone-400">
                  <Wand2 size={20} />
              </div>
              <input 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                  placeholder={t('fridge_placeholder')}
                  className="flex-1 bg-transparent border-none outline-none text-lg font-medium text-stone-800 placeholder:text-stone-300 h-12 px-2"
              />
              <button 
                  onClick={() => handleAdd()}
                  className="w-10 h-10 bg-stone-900 rounded-full flex items-center justify-center text-white shadow-md active:scale-90 transition-transform"
              >
                  <Plus size={20} />
              </button>
          </div>
      </motion.div>

      {/* 2. CONTEXTUAL SUGGESTIONS (Bento Row) */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mask-gradient-right">
          {suggestions.map((item, i) => (
              <motion.button
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAdd(item.label)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-2xl border border-white/50 shadow-sm ${item.color} backdrop-blur-sm`}
              >
                  <span className="opacity-70">{item.icon}</span>
                  <span className="text-xs font-bold uppercase tracking-wide">{item.label}</span>
              </motion.button>
          ))}
      </div>

      {/* 3. INGREDIENT CLOUD (Physics Feel) */}
      <AnimatePresence>
          {ingredients.length > 0 && (
              <motion.div className="flex flex-wrap gap-2 px-1">
                  {ingredients.map((ing) => (
                      <motion.div
                          key={ing}
                          layout
                          initial={{ scale: 0, rotate: -10 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, opacity: 0 }}
                          className="group relative"
                      >
                          <div className="pl-4 pr-10 py-2.5 bg-white border border-stone-200 rounded-2xl text-sm font-bold text-stone-700 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex items-center gap-2">
                              {ing}
                              <button 
                                  onClick={() => { vibrate(10); removeIngredient(ing); }}
                                  className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-xl bg-stone-100 text-stone-400 flex items-center justify-center hover:bg-rose-100 hover:text-rose-500 transition-colors"
                              >
                                  <X size={14} />
                              </button>
                          </div>
                      </motion.div>
                  ))}
              </motion.div>
          )}
      </AnimatePresence>

      {/* 4. CUISINE REMIXER (Filter - The Agentic Modifier) */}
      <AnimatePresence>
          {ingredients.length > 0 && (
              <motion.div 
                 initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                 className="overflow-hidden"
              >
                  <div className="flex items-center gap-2 mb-2 px-1">
                      <Sparkles size={12} className="text-stone-400" />
                      <span className="text-[10px] font-brutal font-bold text-stone-400 uppercase tracking-widest">Style (Optional)</span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                      {['Any', 'Italian', 'Asian', 'Mexican', 'Healthy'].map(c => (
                          <button
                              key={c}
                              onClick={() => { vibrate(5); setActiveCuisine(c); }}
                              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${activeCuisine === c ? 'bg-stone-800 text-white border-stone-800' : 'bg-white border-stone-200 text-stone-500'}`}
                          >
                              {c}
                          </button>
                      ))}
                  </div>
              </motion.div>
          )}
      </AnimatePresence>

      {/* 5. GENERATE BUTTON (The Trigger) */}
      <div className="sticky bottom-4 z-30 pt-4">
          <button
              onClick={handleGenerateClick}
              disabled={ingredients.length === 0 || loading}
              className={`w-full h-16 rounded-[2rem] relative overflow-hidden transition-all duration-500 ${
                  ingredients.length === 0 
                  ? 'bg-stone-200 cursor-not-allowed opacity-50 scale-95' 
                  : 'bg-stone-900 shadow-2xl shadow-stone-900/30 hover:scale-[1.02] active:scale-95'
              }`}
          >
              {/* Liquid Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500 opacity-0 transition-opacity duration-500 ${ingredients.length > 0 && !loading ? 'opacity-100' : ''}`} />
              
              {loading ? (
                   <div className="absolute inset-0 bg-stone-900 flex items-center justify-center gap-3">
                       <Loader2 className="animate-spin text-rose-500" size={24} />
                       <span className="font-brutal font-bold uppercase tracking-widest text-xs text-white animate-pulse">{t('gen_thinking')}</span>
                   </div>
              ) : (
                  <div className="absolute inset-0 flex items-center justify-between px-8 text-white">
                      <div className="flex flex-col items-start">
                          <span className="font-editorial italic text-xl leading-none">{recipe ? "Remix Recipe" : t('gen_create_btn')}</span>
                          {ingredients.length > 0 && <span className="text-[9px] font-brutal uppercase opacity-80">{ingredients.length} items ready</span>}
                      </div>
                      {recipe ? <RefreshCw size={24} /> : <ArrowRight size={24} />}
                  </div>
              )}
          </button>
      </div>

      {/* 6. RESULT CARD */}
      <AnimatePresence mode="wait">
          {recipe && (
              <motion.div 
                  key={recipe.id}
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                  className="pb-24 pt-2"
              >
                 <RecipeCard 
                      recipe={recipe} 
                      t={t} 
                      onToggleFavorite={() => onToggleFavorite(recipe)} 
                      isSaved={savedRecipeIds.includes(recipe.id)}
                      imageLoading={imageLoading}
                 />
              </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
};

export default GeneratorTab;
