
import React, { useState } from 'react';
import { Plus, X, ShoppingBasket, ChevronRight, Loader2, Sparkles, Wand2, Search, ArrowRight } from 'lucide-react';
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
  const [filters, setFilters] = useState({ cuisine: 'Any', mealType: 'Any', mood: 'Any' });

  const quickIngredients = [
    { label: t('ing_eggs'), icon: '🥚' },
    { label: t('ing_chicken'), icon: '🍗' },
    { label: t('ing_rice'), icon: '🍚' },
    { label: t('ing_potatoes'), icon: '🥔' },
    { label: t('ing_tomatoes'), icon: '🍅' },
  ];

  const handleAdd = () => {
    if (inputValue.trim()) {
      addIngredient(inputValue);
      setInputValue('');
      if (navigator.vibrate) navigator.vibrate(10);
    }
  };

  return (
    <div className="w-full space-y-8">
      
      {/* 1. THE MAGIC INPUT (Glassmorphic Molecule) */}
      <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-rose-200 via-orange-200 to-amber-200 rounded-[2.5rem] blur opacity-25 group-focus-within:opacity-75 transition duration-1000 group-hover:duration-200" />
          
          <div className="relative bg-white rounded-[2.5rem] p-6 shadow-xl shadow-stone-200/50 border border-white/50">
              
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-rose-50 rounded-full flex items-center justify-center">
                      <Wand2 className="text-rose-500" size={20} />
                  </div>
                  <div>
                      <h3 className="font-editorial italic text-2xl text-stone-900 leading-none">{t('gen_ai_chef')}</h3>
                      <p className="text-[10px] font-brutal uppercase tracking-widest text-stone-400 mt-1">{t('gen_create_masterpiece')}</p>
                  </div>
              </div>

              {/* Input Area */}
              <div className="bg-stone-50/50 rounded-2xl p-2 flex items-center gap-2 border border-stone-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-rose-100 transition-all">
                  <input 
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                      placeholder={t('fridge_placeholder')}
                      className="flex-1 bg-transparent border-none outline-none text-lg font-editorial italic text-stone-800 placeholder:text-stone-300 px-4 h-12"
                  />
                  <button 
                      onClick={handleAdd}
                      className="w-12 h-12 bg-stone-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-stone-900/20 hover:scale-105 active:scale-95 transition-transform"
                  >
                      <Plus size={24} />
                  </button>
              </div>

              {/* Quick Suggestions (Horizontal Scroll) */}
              <div className="mt-6">
                  <p className="text-[9px] font-brutal font-bold text-stone-300 uppercase tracking-widest mb-3 pl-1">{t('fridge_quick_add')}</p>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mask-gradient-right">
                      {quickIngredients.map((item) => (
                          <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              key={item.label}
                              onClick={() => addIngredient(item.label)}
                              className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl text-xs font-bold text-stone-600 border border-stone-100 shadow-sm hover:shadow-md hover:border-rose-100 whitespace-nowrap transition-all"
                          >
                              <span className="text-sm">{item.icon}</span> {item.label}
                          </motion.button>
                      ))}
                  </div>
              </div>

          </div>
      </div>

      {/* 2. INGREDIENT CLOUD (Spatial UI) */}
      <AnimatePresence>
          {ingredients.length > 0 && (
              <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
              >
                  <div className="flex justify-between items-end px-2">
                       <span className="text-[10px] font-brutal font-bold text-stone-400 uppercase tracking-widest">Your Basket ({ingredients.length})</span>
                       <button onClick={() => {}} className="text-[10px] font-bold text-rose-500 hover:underline">Clear All</button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                      <AnimatePresence>
                          {ingredients.map((ing) => (
                              <motion.div
                                  key={ing}
                                  layout
                                  initial={{ scale: 0.8, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0.5, opacity: 0 }}
                                  className="group relative"
                              >
                                  <div className="pl-4 pr-10 py-3 bg-white border border-stone-200 rounded-2xl text-sm font-bold text-stone-700 shadow-sm flex items-center gap-2 relative z-10">
                                      {ing}
                                      <button 
                                          onClick={() => removeIngredient(ing)}
                                          className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center hover:bg-rose-100 hover:text-rose-500 transition-colors"
                                      >
                                          <X size={12} />
                                      </button>
                                  </div>
                                  {/* Shadow Layer for Depth */}
                                  <div className="absolute inset-0 bg-stone-200 rounded-2xl transform translate-y-1 translate-x-1 -z-10 group-hover:translate-y-1.5 group-hover:translate-x-1.5 transition-transform" />
                              </motion.div>
                          ))}
                      </AnimatePresence>
                  </div>
              </motion.div>
          )}
      </AnimatePresence>

      {/* 3. GENERATE BUTTON (Liquid Animation) */}
      <div className="sticky bottom-4 z-30 pt-4">
          <button
              onClick={() => onGenerate(filters)}
              disabled={ingredients.length === 0 || loading}
              className={`w-full h-16 rounded-[2rem] relative overflow-hidden transition-all duration-500 ${
                  ingredients.length === 0 
                  ? 'bg-stone-200 cursor-not-allowed opacity-50 scale-95' 
                  : 'bg-stone-900 shadow-2xl shadow-stone-900/30 hover:scale-[1.02] active:scale-95'
              }`}
          >
              {/* Liquid Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 opacity-0 transition-opacity duration-500 ${ingredients.length > 0 && !loading ? 'opacity-100' : ''}`} />
              
              {/* Loading Animation Layer */}
              {loading && (
                   <div className="absolute inset-0 bg-stone-900 flex items-center justify-center gap-3">
                       <Loader2 className="animate-spin text-rose-500" size={24} />
                       <span className="font-brutal font-bold uppercase tracking-widest text-xs text-white animate-pulse">{t('gen_thinking')}</span>
                   </div>
              )}

              {/* Content Layer */}
              {!loading && (
                  <div className="absolute inset-0 flex items-center justify-between px-8 text-white">
                      <div className="flex items-center gap-3">
                          <Sparkles size={20} className={ingredients.length > 0 ? "animate-pulse" : ""} />
                          <div className="flex flex-col items-start">
                              <span className="font-editorial italic text-xl leading-none">{t('gen_create_btn')}</span>
                              {ingredients.length > 0 && <span className="text-[9px] font-brutal uppercase opacity-80">{ingredients.length} items selected</span>}
                          </div>
                      </div>
                      <ArrowRight size={24} />
                  </div>
              )}
          </button>
      </div>

      {/* RECIPE RESULT */}
      <AnimatePresence>
          {recipe && (
              <motion.div 
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="pb-24 pt-4"
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
