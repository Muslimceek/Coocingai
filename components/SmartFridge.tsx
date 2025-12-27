
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
    <div className="min-h-screen pt-4 pb-28 px-4 md:px-6 max-w-lg mx-auto relative animate-in fade-in duration-500 font-sans" onClick={() => setShowLangMenu(false)}>
      
      {/* --- HEADER: 2025 Style --- */}
      <div className="bg-gradient-to-b from-rose-50 to-white/0 rounded-[2.5rem] p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
              <div className="flex flex-col">
                  {/* Micro-Interaction: Label */}
                  <span className="text-[10px] font-brutal font-black text-rose-500 uppercase tracking-[0.2em] mb-1">
                      {t('fridge_title')}
                  </span>
                  
                  {/* Large Typography Greeting */}
                  <h1 className="text-4xl font-editorial italic text-stone-900 leading-[1.1]">
                      {timeGreeting},<br />
                      <span className="underline decoration-rose-300 decoration-2 underline-offset-4">{user.name.split(' ')[0]}</span>!
                  </h1>
                  <p className="text-stone-400 text-xs font-medium mt-2 max-w-[200px] leading-relaxed">
                      {t('fridge_subtitle')}
                  </p>
              </div>

              {/* Top Right Actions */}
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
                  <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-rose-300 to-orange-200">
                      <img src={user.avatarUrl} alt="User" className="w-full h-full rounded-full object-cover border-2 border-white" />
                  </div>
              </div>
          </div>

          {/* --- TABS: Segmented Control Style --- */}
          <div className="flex p-1.5 bg-stone-100/80 backdrop-blur-sm rounded-2xl w-full shadow-inner relative">
               {/* Animated Background for Active Tab could go here, but strictly following design: */}
               <TabButton 
                  isActive={activeTab === 'generate'} 
                  onClick={() => setActiveTab('generate')} 
                  icon={<Sparkles size={14} />} 
                  label={t('fridge_tab_gen')} 
               />
               <TabButton 
                  isActive={activeTab === 'explore'} 
                  onClick={() => setActiveTab('explore')} 
                  icon={<Compass size={14} />} 
                  label={t('fridge_tab_explore')} 
               />
               <TabButton 
                  isActive={activeTab === 'saved'} 
                  onClick={() => setActiveTab('saved')} 
                  icon={<Heart size={14} />} 
                  label={t('fridge_tab_saved')} 
               />
          </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="mt-2 min-h-[50vh]">
          <AnimatePresence mode="wait">
              <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
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

const TabButton = ({ isActive, onClick, icon, label }: { isActive: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
    <button
        onClick={onClick}
        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-wide transition-all duration-300 ${
            isActive 
            ? 'bg-white text-rose-500 shadow-[0_4px_12px_rgba(0,0,0,0.05)] scale-[1.02]' 
            : 'text-stone-400 hover:text-stone-600'
        }`}
    >
        {icon}
        <span className="hidden sm:inline">{label}</span>
    </button>
);

export default SmartFridge;
