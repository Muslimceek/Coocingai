
import React, { useState, useMemo } from 'react';
import { 
  Ghost, Search, Clock, Flame, Utensils, Zap, 
  ArrowUpRight, Grid, List, Sparkles, Plus, Shuffle, X, Split
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GeneratedRecipe } from '../../types';
import RecipeCard from './RecipeCard';

interface SavedTabProps {
  savedRecipes: GeneratedRecipe[];
  t: (key: string) => string;
  onToggleFavorite: (recipe: GeneratedRecipe) => void;
  onStartCooking: () => void;
}

// --- VISUAL TOKENS ---
const GLASS_CARD = "bg-white/70 backdrop-blur-xl border border-white/60 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300";
const FUSION_ACTIVE = "ring-2 ring-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.3)] scale-[0.98]";

const SavedTab: React.FC<SavedTabProps> = ({ 
  savedRecipes, 
  t, 
  onToggleFavorite, 
  onStartCooking 
}) => {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [fusionMode, setFusionMode] = useState(false);
  const [fusionSelection, setFusionSelection] = useState<string[]>([]);
  const [expandedRecipeId, setExpandedRecipeId] = useState<string | null>(null);

  // Time-of-Day Logic for Sorting (Circadian UI)
  const currentHour = new Date().getHours();
  const timeContext = currentHour < 11 ? 'Breakfast' : currentHour < 16 ? 'Lunch' : 'Dinner';

  // --- LOGIC: FILTER & SORT ---
  const filteredRecipes = useMemo(() => {
    let result = savedRecipes.filter(r => 
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.ingredients.some(i => i.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Circadian Sort: Bubble up recipes matching current timeContext
    result.sort((a, b) => {
        const aScore = a.mealType === timeContext ? 2 : 1;
        const bScore = b.mealType === timeContext ? 2 : 1;
        return bScore - aScore;
    });

    return result;
  }, [savedRecipes, searchQuery, timeContext]);

  // --- HANDLERS ---
  const vibrate = (pattern: number | number[] = 10) => {
    if(typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(pattern);
  };

  const toggleFusionSelect = (id: string) => {
    vibrate(15);
    setFusionSelection(prev => {
        if (prev.includes(id)) return prev.filter(pid => pid !== id);
        if (prev.length < 2) return [...prev, id];
        return [prev[1], id]; // Keep only last 2
    });
  };

  const handleFuse = () => {
      vibrate([50, 20, 50]);
      alert("Fusion Protocol Initiated: Blending culinary DNA... (This would trigger AI generation)");
      setFusionMode(false);
      setFusionSelection([]);
  };

  // --- SUB-COMPONENT: EMPTY STATE (The Void) ---
  if (savedRecipes.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6 animate-in fade-in zoom-in duration-700">
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-rose-200 blur-3xl opacity-30 animate-pulse" />
                <div className="w-32 h-32 bg-white/50 backdrop-blur-2xl rounded-full flex items-center justify-center border border-white/50 shadow-xl relative z-10">
                    <Ghost size={48} className="text-stone-300" strokeWidth={1.5} />
                    <motion.div 
                        animate={{ rotate: 360 }} 
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 border-t border-rose-300 rounded-full opacity-50"
                    />
                </div>
            </div>
            <h3 className="text-4xl font-editorial italic text-stone-800 mb-3">{t('fridge_saved_empty')}</h3>
            <p className="text-stone-400 font-brutal uppercase tracking-widest text-xs max-w-xs leading-relaxed">
                {t('fridge_saved_empty_desc')}
            </p>
        </div>
    );
  }

  return (
    <div className="pb-32 relative min-h-screen">
      
      {/* 1. CONTROL DECK (Floating Header) */}
      <div className="sticky top-0 z-30 py-4 -mx-4 px-4 bg-[#F9F8F6]/90 backdrop-blur-xl border-b border-white/20 mb-6 transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-100 to-orange-100 rounded-2xl blur opacity-0 group-focus-within:opacity-50 transition-opacity" />
                  <div className="bg-white/80 rounded-2xl flex items-center px-4 py-3 border border-stone-200 relative shadow-sm">
                      <Search size={18} className="text-stone-400 mr-3" />
                      <input 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search your grimoire..."
                          className="flex-1 bg-transparent outline-none text-sm font-bold text-stone-800 placeholder:text-stone-300"
                      />
                  </div>
              </div>
              
              <button 
                  onClick={() => { vibrate(); setViewMode(prev => prev === 'grid' ? 'list' : 'grid'); }}
                  className="w-12 h-12 bg-white/80 rounded-2xl flex items-center justify-center border border-stone-200 text-stone-500 hover:text-stone-900 transition-colors shadow-sm"
              >
                  {viewMode === 'grid' ? <List size={20} /> : <Grid size={20} />}
              </button>
          </div>

          <div className="flex justify-between items-center">
               <span className="text-[10px] font-brutal font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2">
                   {timeContext} Collection <div className="w-1 h-1 bg-rose-500 rounded-full animate-ping" />
               </span>
               
               {/* FUSION TOGGLE */}
               <button 
                  onClick={() => { vibrate(); setFusionMode(!fusionMode); setFusionSelection([]); }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${fusionMode ? 'bg-stone-900 text-white shadow-lg' : 'bg-stone-100 text-stone-500'}`}
               >
                   <Split size={12} />
                   {fusionMode ? "Fusion Active" : "Remix Recipes"}
               </button>
          </div>
      </div>

      {/* 2. THE CRYSTAL GRID (Masonry) */}
      <motion.div 
         layout 
         className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-2' : 'grid-cols-1'}`}
      >
         <AnimatePresence>
            {filteredRecipes.map((recipe) => {
                const isSelected = fusionSelection.includes(recipe.id);
                const isDimmed = fusionMode && !isSelected && fusionSelection.length === 2;

                return (
                    <motion.div
                        layout
                        key={recipe.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: isDimmed ? 0.4 : 1, scale: isSelected ? 0.98 : 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className={`relative group ${viewMode === 'list' ? 'col-span-2 aspect-[3/1]' : 'aspect-[3/4]'}`}
                        onClick={() => {
                            if (fusionMode) toggleFusionSelect(recipe.id);
                            else setExpandedRecipeId(recipe.id);
                        }}
                    >
                        {/* THE CARD */}
                        <div className={`w-full h-full rounded-[2rem] overflow-hidden relative cursor-pointer ${GLASS_CARD} ${isSelected ? FUSION_ACTIVE : ''}`}>
                            
                            {/* Image Layer */}
                            <div className="absolute inset-0 bg-stone-200">
                                <img 
                                    src={recipe.imageUrl || `https://picsum.photos/seed/${recipe.id}/500/500`} 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    alt={recipe.title}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                            </div>

                            {/* Content Layer */}
                            <div className="absolute inset-0 p-5 flex flex-col justify-end text-white">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="px-2 py-0.5 bg-white/20 backdrop-blur-md rounded-md text-[9px] font-bold uppercase tracking-wider border border-white/20">
                                        {recipe.mealType || 'Dish'}
                                    </span>
                                    {recipe.calories < 400 && (
                                        <span className="px-2 py-0.5 bg-emerald-500/20 backdrop-blur-md rounded-md text-[9px] font-bold uppercase tracking-wider text-emerald-300 border border-emerald-500/20">
                                            Light
                                        </span>
                                    )}
                                </div>
                                <h3 className={`font-editorial italic leading-none mb-1 ${viewMode === 'list' ? 'text-3xl' : 'text-xl'}`}>
                                    {recipe.title}
                                </h3>
                                
                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/20">
                                    <div className="flex items-center gap-3 text-xs font-medium text-white/80">
                                        <span className="flex items-center gap-1"><Clock size={12} /> {recipe.prepTimeMinutes}m</span>
                                        <span className="flex items-center gap-1"><Flame size={12} /> {recipe.calories}</span>
                                    </div>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onToggleFavorite(recipe); }}
                                        className="text-white/50 hover:text-rose-400 transition-colors"
                                    >
                                        <ArrowUpRight size={16} />
                                    </button>
                                </div>
                            </div>
                            
                            {/* Fusion Selection Indicator */}
                            {isSelected && (
                                <div className="absolute top-4 right-4 w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center text-white shadow-lg animate-in zoom-in">
                                    <Plus size={16} />
                                </div>
                            )}
                        </div>
                    </motion.div>
                )
            })}
         </AnimatePresence>
      </motion.div>

      {/* 3. FUSION FLOATING ACTION BUTTON (The Collider) */}
      <AnimatePresence>
          {fusionMode && fusionSelection.length === 2 && (
              <motion.div 
                 initial={{ y: 100, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 exit={{ y: 100, opacity: 0 }}
                 className="fixed bottom-28 left-4 right-4 z-50 flex justify-center"
              >
                  <button 
                      onClick={handleFuse}
                      className="bg-stone-900 text-white pl-6 pr-8 py-4 rounded-[2rem] shadow-2xl shadow-rose-900/40 flex items-center gap-4 relative overflow-hidden group"
                  >
                      {/* Animated Liquid Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-r from-rose-500 via-purple-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      <span className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center relative z-10">
                          <Sparkles size={20} className="animate-spin-slow" />
                      </span>
                      <div className="flex flex-col items-start relative z-10">
                          <span className="font-editorial italic text-xl leading-none">Fuse Recipes</span>
                          <span className="text-[9px] font-brutal uppercase tracking-widest text-stone-400 group-hover:text-white/80">
                              Create AI Hybrid
                          </span>
                      </div>
                  </button>
              </motion.div>
          )}
      </AnimatePresence>

      {/* 4. EXPANDED RECIPE MODAL (Full Screen Warp) */}
      <AnimatePresence>
          {expandedRecipeId && (
              <motion.div 
                 initial={{ opacity: 0, y: 50 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: 50 }}
                 className="fixed inset-0 z-[100] bg-[#F9F8F6] overflow-y-auto"
              >
                  <div className="relative pb-24">
                      <button 
                          onClick={() => setExpandedRecipeId(null)}
                          className="absolute top-6 left-6 z-50 w-12 h-12 bg-white/20 backdrop-blur-xl rounded-full border border-white/30 flex items-center justify-center text-white shadow-lg"
                      >
                          <X size={24} />
                      </button>
                      
                      {/* Find the recipe object */}
                      {(() => {
                          const r = savedRecipes.find(s => s.id === expandedRecipeId);
                          if (!r) return null;
                          return (
                              <RecipeCard 
                                  recipe={r} 
                                  t={t} 
                                  onToggleFavorite={() => onToggleFavorite(r)} 
                                  isSaved={true} 
                              />
                          );
                      })()}
                  </div>
              </motion.div>
          )}
      </AnimatePresence>

    </div>
  );
};

export default SavedTab;
