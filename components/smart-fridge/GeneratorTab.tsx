
import React, { useState } from 'react';
import { Plus, X, ShoppingBasket, ChevronRight, Loader2, Sparkles, Wand2, Search } from 'lucide-react';
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
  const [cuisine, setCuisine] = useState('Any');
  const [mealType, setMealType] = useState('Any');
  const [mood, setMood] = useState('Any');

  const quickIngredients = [
    { label: t('ing_eggs'), icon: '🥚' },
    { label: t('ing_milk'), icon: '🥛' },
    { label: t('ing_chicken'), icon: '🍗' },
    { label: t('ing_rice'), icon: '🍚' },
    { label: t('ing_potatoes'), icon: '🥔' },
    { label: t('ing_tomatoes'), icon: '🍅' },
    { label: t('ing_onion'), icon: '🧅' },
    { label: t('ing_cheese'), icon: '🧀' },
  ];

  const cuisines = [
    { value: 'Any', label: t('cuisine_any') },
    { value: 'Uzbek', label: t('cuisine_uzbek') },
    { value: 'Russian', label: t('cuisine_russian') },
    { value: 'European', label: t('cuisine_euro') },
    { value: 'Kazakh', label: t('cuisine_kazakh') },
    { value: 'Tajik', label: t('cuisine_tajik') },
    { value: 'Kyrgyz', label: t('cuisine_kyrgyz') },
    { value: 'Asian', label: t('cuisine_asian') },
  ];

  const mealTypes = [
    { value: 'Breakfast', label: t('meal_breakfast') },
    { value: 'Lunch', label: t('meal_lunch') },
    { value: 'Dinner', label: t('meal_dinner') },
    { value: 'Snack', label: t('meal_snack') },
  ];

  const moods = [
    { value: 'Any', label: t('mood_any') },
    { value: 'Cozy', label: t('mood_cozy') },
    { value: 'Energetic', label: t('mood_energetic') },
    { value: 'Romantic', label: t('mood_romantic') },
    { value: 'Quick', label: t('mood_quick') },
    { value: 'Celebration', label: t('mood_celebration') },
  ];

  const handleAdd = () => {
    if (inputValue.trim()) {
      addIngredient(inputValue);
      setInputValue('');
      if (navigator.vibrate) navigator.vibrate(10);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32 animate-in fade-in duration-700">
      {/* --- SECTION: MAIN CANVAS --- */}
      <div className="relative group">
        
        <div className="relative bg-white/80 backdrop-blur-2xl rounded-[2.5rem] border border-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] p-6 md:p-8">
          
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-gradient-to-tr from-rose-400 to-orange-400 rounded-2xl shadow-lg shadow-rose-200 flex items-center justify-center rotate-3">
              <Wand2 className="text-white" size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-editorial italic font-bold text-stone-900">{t('gen_ai_chef')}</h2>
              <p className="text-stone-400 text-xs font-brutal font-bold uppercase tracking-widest">{t('gen_create_masterpiece')}</p>
            </div>
          </div>

          {/* INPUT BENTO BOX */}
          <div className="grid grid-cols-1 gap-6 mb-8">
            {/* Input Column */}
            <div className="space-y-4">
              <label className="text-[10px] font-brutal font-bold text-stone-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Search size={12} /> {t('fridge_placeholder')}
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                  className="w-full pl-6 pr-16 py-6 bg-stone-100/50 border-none rounded-[2rem] focus:ring-2 focus:ring-rose-400 focus:bg-white transition-all text-xl font-editorial italic text-stone-700 placeholder:text-stone-300 outline-none shadow-inner"
                  placeholder={t('fridge_placeholder')}
                />
                <button
                  onClick={handleAdd}
                  className="absolute right-2 p-4 bg-stone-900 text-white rounded-[1.5rem] hover:scale-105 active:scale-95 transition-all shadow-lg"
                >
                  <Plus size={20} />
                </button>
              </div>

              {/* Selected Ingredients (Chips) with Framer Motion */}
              <div className="flex flex-wrap gap-2 pt-2 min-h-[40px]">
                <AnimatePresence mode="popLayout">
                    {ingredients.length > 0 ? (
                        ingredients.map((ing) => (
                        <motion.div 
                            layout
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            key={ing} 
                            className="group flex items-center gap-2 px-4 py-2 bg-white border border-stone-100 rounded-full shadow-sm hover:border-rose-200 hover:shadow-md cursor-default transition-colors"
                        >
                            <span className="text-sm font-brutal font-bold text-stone-700">{ing}</span>
                            <button onClick={() => removeIngredient(ing)} className="text-stone-300 group-hover:text-rose-500 transition-colors bg-stone-50 rounded-full p-0.5 hover:bg-rose-50">
                                <X size={12} />
                            </button>
                        </motion.div>
                        ))
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-2 text-stone-300 text-sm px-2 italic font-editorial"
                        >
                            <ShoppingBasket size={16} />
                            {t('fridge_empty_title')}
                        </motion.div>
                    )}
                </AnimatePresence>
              </div>
            </div>

            {/* QUICK ADD BENTO */}
            <div className="bg-stone-50/50 backdrop-blur-sm rounded-[2rem] p-5 border border-stone-100/50">
              <p className="text-[10px] font-brutal font-black text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-1">
                 {t('fridge_quick_add')}
              </p>
              <div className="flex flex-wrap gap-2">
                {quickIngredients.slice(0, 6).map((item) => (
                  <button
                    key={item.label}
                    onClick={() => { addIngredient(item.label); if (navigator.vibrate) navigator.vibrate(10); }}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-white rounded-xl text-xs font-bold text-stone-600 border border-stone-100 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 transition-all shadow-sm active:scale-95"
                  >
                    <span>{item.icon}</span> {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* FILTERS: Visual Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            <FilterCard 
              label={t('filter_cuisine')} 
              value={cuisine} 
              options={cuisines} 
              onChange={setCuisine} 
            />
            <FilterCard 
              label={t('filter_meal')} 
              value={mealType} 
              options={mealTypes} 
              onChange={setMealType} 
            />
             <FilterCard 
              label={t('filter_mood')} 
              value={mood} 
              options={moods} 
              onChange={setMood} 
            />
          </div>

          {/* GENERATE BUTTON: The "Hero" Action */}
          <button
            onClick={() => onGenerate({ cuisine, mealType, mood })}
            disabled={ingredients.length === 0 || loading}
            className={`relative w-full py-6 rounded-[2rem] font-brutal font-bold text-lg uppercase tracking-widest overflow-hidden group transition-all transform active:scale-[0.98] shadow-xl ${
              ingredients.length === 0 ? 'bg-stone-100 text-stone-400 cursor-not-allowed shadow-none' : 'bg-stone-900 text-white hover:shadow-2xl hover:-translate-y-1'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-3">
                <Loader2 className="animate-spin text-rose-400" size={24} />
                <span className="animate-pulse">{t('gen_thinking')}</span>
              </div>
            ) : (
              <div className="relative z-10 flex items-center justify-center gap-3">
                <Sparkles size={20} className="text-amber-400 fill-amber-400 animate-pulse" />
                <span>{t('gen_create_btn')}</span>
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </div>
            )}
            
            {/* Animated Gradient on Hover */}
            {!loading && ingredients.length > 0 && (
              <div className="absolute inset-0 bg-gradient-to-r from-rose-500 via-purple-500 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay"></div>
            )}
          </button>
        </div>
      </div>

      {/* RECIPE VIEW */}
      {recipe && (
        <div className="animate-in fade-in zoom-in-95 duration-700 slide-in-from-bottom-10">
           <RecipeCard 
                recipe={recipe} 
                t={t} 
                onToggleFavorite={() => onToggleFavorite(recipe)} 
                isSaved={savedRecipeIds.includes(recipe.id)}
                imageLoading={imageLoading}
           />
        </div>
      )}
    </div>
  );
};

// Helper Component for Visual Filters
const FilterCard = ({ label, value, options, onChange }: { label: string, value: string, options: {value: string, label: string}[], onChange: (v: string) => void }) => (
  <div className="flex flex-col gap-2">
    <span className="text-[9px] font-brutal font-black text-stone-400 uppercase tracking-widest ml-2">{label}</span>
    <div className="relative group">
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none bg-stone-50 border border-stone-200 text-stone-800 py-4 px-5 rounded-2xl font-brutal font-bold text-sm focus:ring-2 focus:ring-rose-200 focus:bg-white transition-all cursor-pointer hover:bg-white hover:shadow-md"
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none group-hover:translate-x-1 transition-transform">
        <ChevronRight size={16} className="rotate-90 text-stone-400" />
      </div>
    </div>
  </div>
);

export default GeneratorTab;
