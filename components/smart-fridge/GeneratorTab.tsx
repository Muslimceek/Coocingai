
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
  // Simple defaults for filters
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
    <div className="w-full space-y-6">
      
      {/* 1. MAGIC INPUT CONTAINER */}
      <div className="bg-white rounded-[2rem] p-5 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] border border-stone-50 relative overflow-hidden group">
          
          {/* Header Icon */}
          <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-tr from-rose-400 to-orange-400 rounded-xl flex items-center justify-center shadow-lg shadow-rose-100">
                  <Wand2 className="text-white" size={20} />
              </div>
              <div>
                  <h3 className="font-editorial italic text-2xl text-stone-900 leading-none">{t('gen_ai_chef')}</h3>
                  <p className="text-[10px] font-brutal uppercase tracking-widest text-stone-400">{t('gen_create_masterpiece')}</p>
              </div>
          </div>

          {/* Interactive Input Area */}
          <div className="bg-stone-50 rounded-3xl p-4 transition-all focus-within:bg-white focus-within:ring-2 ring-rose-100">
              
              {/* Chip Cloud */}
              <div className="flex flex-wrap gap-2 mb-3 min-h-[30px]">
                  <AnimatePresence>
                      {ingredients.length > 0 ? (
                          ingredients.map((ing) => (
                              <motion.span
                                  key={ing}
                                  initial={{ scale: 0.8, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0.5, opacity: 0 }}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-200 rounded-full text-xs font-bold text-stone-700 shadow-sm"
                              >
                                  {ing}
                                  <button onClick={() => removeIngredient(ing)} className="p-0.5 rounded-full hover:bg-stone-100 text-stone-400">
                                      <X size={10} />
                                  </button>
                              </motion.span>
                          ))
                      ) : (
                          <span className="text-stone-300 text-sm italic pl-1 flex items-center gap-2">
                              <Search size={14} /> {t('fridge_empty')}
                          </span>
                      )}
                  </AnimatePresence>
              </div>

              {/* Input Field + FAB */}
              <div className="relative flex items-center">
                  <input 
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                      placeholder={t('fridge_placeholder')}
                      className="w-full bg-transparent border-none outline-none text-lg font-editorial italic text-stone-800 placeholder:text-stone-300 pr-12"
                  />
                  <button 
                      onClick={handleAdd}
                      className="absolute right-0 w-10 h-10 bg-stone-900 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-105 active:scale-95 transition-transform"
                  >
                      <Plus size={20} />
                  </button>
              </div>
          </div>

          {/* Quick Add Scroll */}
          <div className="mt-4 pt-4 border-t border-stone-100">
              <p className="text-[9px] font-brutal font-bold text-stone-300 uppercase tracking-widest mb-2">{t('fridge_quick_add')}</p>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {quickIngredients.map((item) => (
                      <button
                          key={item.label}
                          onClick={() => addIngredient(item.label)}
                          className="flex items-center gap-1 px-3 py-2 bg-stone-50 rounded-xl text-xs font-bold text-stone-600 border border-stone-100 hover:bg-rose-50 hover:border-rose-100 hover:text-rose-500 whitespace-nowrap transition-colors"
                      >
                          <span>{item.icon}</span> {item.label}
                      </button>
                  ))}
              </div>
          </div>
      </div>

      {/* 2. MAIN ACTION: FLOATING GENERATE BUTTON */}
      <div className="relative z-10">
          <button
              onClick={() => onGenerate(filters)}
              disabled={ingredients.length === 0 || loading}
              className={`w-full py-5 rounded-[2rem] relative overflow-hidden group shadow-2xl transition-all active:scale-95 ${
                  ingredients.length === 0 
                  ? 'bg-stone-100 text-stone-400 cursor-not-allowed' 
                  : 'bg-stone-900 text-white hover:shadow-rose-200 hover:-translate-y-1'
              }`}
          >
              {loading ? (
                  <div className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin text-rose-400" size={24} />
                      <span className="font-brutal font-bold uppercase tracking-widest text-xs animate-pulse">{t('gen_thinking')}</span>
                  </div>
              ) : (
                  <div className="flex items-center justify-between px-8">
                      <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                              <Sparkles size={18} className="text-amber-300 fill-amber-300" />
                          </div>
                          <div className="text-left">
                              <span className="block font-brutal font-bold uppercase tracking-widest text-xs opacity-70">Ready?</span>
                              <span className="block font-editorial italic text-xl leading-none">{t('gen_create_btn')}</span>
                          </div>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <ArrowRight size={20} />
                      </div>
                  </div>
              )}
              
              {/* Animated Gradient Shine */}
              {!loading && ingredients.length > 0 && (
                  <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-shine skew-x-12" />
              )}
          </button>
      </div>

      {/* RECIPE RESULT */}
      <AnimatePresence>
          {recipe && (
              <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="pb-24"
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
