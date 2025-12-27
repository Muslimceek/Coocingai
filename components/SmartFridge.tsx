
import React, { useState, useEffect } from 'react';
import { Sparkles, Compass, Heart, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateRecipeFromIngredients, generateDishImage } from '../services/geminiService';
import { GeneratedRecipe, Language } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';
import GeneratorTab from './smart-fridge/GeneratorTab';
import ExploreTab from './smart-fridge/ExploreTab';
import SavedTab from './smart-fridge/SavedTab';

interface SmartFridgeProps {
  initialIngredients?: string[];
  clearInitialIngredients?: () => void;
}

const languages = [
  { code: 'uz', label: 'Oʻzbek', flag: '🇺🇿' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'kk', label: 'Қазақ', flag: '🇰🇿' },
  { code: 'ky', label: 'Кыргыз', flag: '🇰🇬' },
  { code: 'tg', label: 'Тоҷикӣ', flag: '🇹🇯' },
];

const SmartFridge: React.FC<SmartFridgeProps> = ({ initialIngredients, clearInitialIngredients }) => {
  const { t, language, setLanguage } = useLanguage();
  const { user, updateUser } = useUser();
  
  // State
  const [activeTab, setActiveTab] = useState<'generate' | 'saved' | 'explore'>('generate');
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [recipe, setRecipe] = useState<GeneratedRecipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [timeGreeting, setTimeGreeting] = useState('');
  const [showLangMenu, setShowLangMenu] = useState(false);
  
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

  // Get current language flag
  const currentLang = languages.find(l => l.code === language);

  return (
    <div className="min-h-screen pb-28 font-sans relative" onClick={() => setShowLangMenu(false)}>
      
      {/* --- 2025 STICKY GLASS HEADER --- */}
      <header className="sticky top-0 z-40 px-4 md:px-6 pt-4 pb-2 bg-[#F9F8F6]/80 backdrop-blur-xl border-b border-white/20 transition-all duration-500">
        <div className="max-w-lg mx-auto">
            
            {/* Top Row: Greetings & Profile */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col">
                    <motion.span 
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                        className="text-[10px] font-brutal font-black text-rose-500 uppercase tracking-[0.2em] mb-1"
                    >
                        {t('fridge_title')}
                    </motion.span>
                    
                    <h1 className="text-3xl font-editorial italic text-stone-900 leading-[1.1]">
                        {timeGreeting}, <span className="underline decoration-rose-300 decoration-2 underline-offset-4">{user.name.split(' ')[0]}</span>
                    </h1>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2">
                    {/* Language Pill */}
                    <div className="relative z-50">
                        <button 
                            onClick={(e) => { e.stopPropagation(); setShowLangMenu(!showLangMenu); }}
                            className="flex items-center gap-1.5 bg-white/60 backdrop-blur-md border border-white/40 shadow-sm pl-2 pr-3 py-1.5 rounded-full hover:bg-white transition-all active:scale-95"
                        >
                            <span className="text-lg leading-none">{currentLang?.flag}</span>
                            <ChevronDown size={12} className={`text-stone-400 transition-transform duration-300 ${showLangMenu ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {showLangMenu && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                                    className="absolute top-full right-0 mt-2 w-40 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 overflow-hidden py-1 z-50"
                                >
                                    {languages.map((lang) => (
                                        <button
                                            key={lang.code}
                                            onClick={() => setLanguage(lang.code as Language)}
                                            className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-rose-50 transition-colors ${language === lang.code ? 'bg-rose-50/50 text-rose-600' : 'text-stone-600'}`}
                                        >
                                            <span className="text-lg">{lang.flag}</span>
                                            <span className="text-xs font-bold uppercase tracking-wider">{lang.label}</span>
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-rose-300 to-orange-200 shadow-md">
                        <img src={user.avatarUrl} alt="User" className="w-full h-full rounded-full object-cover border-2 border-white" />
                    </div>
                </div>
            </div>

            {/* --- SLIDING CAPSULE TABS --- */}
            <div className="flex p-1 bg-stone-200/50 backdrop-blur-md rounded-full w-full relative">
                {[
                    { id: 'generate', icon: <Sparkles size={14} />, label: t('fridge_tab_gen') },
                    { id: 'explore', icon: <Compass size={14} />, label: t('fridge_tab_explore') },
                    { id: 'saved', icon: <Heart size={14} />, label: t('fridge_tab_saved') }
                ].map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => {
                                if(navigator.vibrate) navigator.vibrate(10);
                                setActiveTab(tab.id as any);
                            }}
                            className={`flex-1 relative flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-bold uppercase tracking-wide transition-colors duration-300 z-10 ${isActive ? 'text-stone-900' : 'text-stone-500 hover:text-stone-700'}`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-white rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.08)] border border-white/50"
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                />
                            )}
                            <span className="relative z-10 flex items-center gap-2">
                                {tab.icon} {tab.label}
                            </span>
                        </button>
                    )
                })}
            </div>

        </div>
      </header>

      {/* --- CONTENT --- */}
      <div className="px-4 md:px-6 mt-6 max-w-lg mx-auto">
          <AnimatePresence mode="wait">
              <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10, filter: 'blur(5px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -10, filter: 'blur(5px)' }}
                  transition={{ duration: 0.3 }}
              >
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
              </motion.div>
          </AnimatePresence>
      </div>
    </div>
  );
};

export default SmartFridge;
