
import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Heart, ChefHat, Clock, Flame, Utensils, Sparkles, 
  Check, Share2, ArrowLeft, ArrowRight, X, ChevronRight, ChevronLeft, RotateCcw,
  Maximize2, Minimize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GeneratedRecipe } from '../../types';

interface RecipeCardProps {
  recipe: GeneratedRecipe;
  t: (key: string) => string;
  onToggleFavorite: () => void;
  isSaved: boolean;
  imageLoading?: boolean;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ 
  recipe, 
  t, 
  onToggleFavorite, 
  isSaved, 
  imageLoading = false 
}) => {
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());
  
  // Cooking Mode States
  const [cookingMode, setCookingMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Haptics
  const vibrate = (pattern: number | number[] = 10) => {
    if(typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(pattern);
  };

  const toggleIngredient = (idx: number) => {
      vibrate(10);
      const newSet = new Set(checkedIngredients);
      if(newSet.has(idx)) newSet.delete(idx); else newSet.add(idx);
      setCheckedIngredients(newSet);
  };

  const handleStartCooking = () => {
    vibrate([20, 30]); // Engage "Engine" vibration
    setCookingMode(true);
    setCurrentStep(0);
    // Request Wake Lock if available (Innovation: Keeps screen on while cooking)
    if ('wakeLock' in navigator) {
        try { (navigator as any).wakeLock.request('screen'); } catch(e) {}
    }
  };

  const handleStepChange = (newStep: number) => {
      if (newStep >= 0 && newStep < recipe.instructions.length) {
          vibrate(15);
          setCurrentStep(newStep);
      } else if (newStep === recipe.instructions.length) {
          // Finish
          vibrate([50, 50, 50]);
          setCookingMode(false);
      }
  };

  // --- COOKING MODE OVERLAY (IMMERSIVE "FOCUS" UI) ---
  if (cookingMode) {
      return (
          <motion.div 
             initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
             className="fixed inset-0 z-[100] bg-[#1a1918] text-[#F9F8F6] flex flex-col overflow-hidden"
          >
              {/* Progress Bar */}
              <div className="h-1.5 w-full bg-white/10">
                  <motion.div 
                     animate={{ width: `${((currentStep + 1) / recipe.instructions.length) * 100}%` }}
                     className="h-full bg-rose-500"
                  />
              </div>

              {/* Header */}
              <div className="flex justify-between items-center p-6">
                  <button onClick={() => setCookingMode(false)} className="p-2 bg-white/10 rounded-full text-white/60 hover:text-white">
                      <X size={20} />
                  </button>
                  <div className="flex flex-col items-center">
                      <span className="text-[10px] font-brutal font-bold uppercase tracking-widest text-white/50">STEP {currentStep + 1} OF {recipe.instructions.length}</span>
                  </div>
                  <div className="w-10" /> {/* Spacer */}
              </div>

              {/* Main Step Content */}
              <div className="flex-1 flex flex-col justify-center px-8 relative">
                  <AnimatePresence mode="wait">
                      <motion.div
                         key={currentStep}
                         initial={{ opacity: 0, x: 50 }}
                         animate={{ opacity: 1, x: 0 }}
                         exit={{ opacity: 0, x: -50 }}
                         transition={{ type: "spring", stiffness: 300, damping: 30 }}
                         className="space-y-6"
                      >
                          <h2 className="text-3xl md:text-5xl font-editorial leading-tight">
                              {recipe.instructions[currentStep]}
                          </h2>
                          
                          {/* Ingredients needed for this step? (Advanced AI feature placeholder) */}
                          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 inline-block">
                              <span className="text-[10px] uppercase tracking-widest text-rose-400 font-bold block mb-1">Focus</span>
                              <p className="text-sm text-white/70">Read carefully before proceeding.</p>
                          </div>
                      </motion.div>
                  </AnimatePresence>
              </div>

              {/* Controls - Bottom Heavy for Thumb Reach */}
              <div className="p-8 pb-12 flex justify-between items-center bg-gradient-to-t from-black/50 to-transparent">
                  <button 
                      onClick={() => handleStepChange(currentStep - 1)}
                      disabled={currentStep === 0}
                      className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center text-white disabled:opacity-20"
                  >
                      <ChevronLeft size={24} />
                  </button>
                  
                  <button 
                      onClick={() => handleStepChange(currentStep + 1)}
                      className="flex-1 mx-6 h-20 bg-white text-black rounded-[2rem] font-bold text-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
                  >
                      {currentStep === recipe.instructions.length - 1 ? 'Finish' : 'Next Step'}
                      {currentStep !== recipe.instructions.length - 1 && <ArrowRight size={20} />}
                  </button>
              </div>
          </motion.div>
      )
  }

  // --- STANDARD CARD VIEW ---
  return (
    <div className="relative w-full bg-white rounded-[2.5rem] overflow-hidden shadow-xl shadow-stone-200/50 border border-white/60">
       
       {/* 1. HERO IMAGE (Parallax Effect) */}
       <div className="relative h-[400px] w-full group overflow-hidden">
           <img 
             src={recipe.imageUrl || `https://picsum.photos/seed/${recipe.id}/800/1200`} 
             alt={recipe.title} 
             className={`w-full h-full object-cover transition-all duration-[2s] ${imageLoading ? 'opacity-0 scale-110 blur-md' : 'opacity-100 scale-100 blur-0'}`}
           />
           
           {/* Gradient Overlay */}
           <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/10 opacity-80" />
           
           {/* Top Badges */}
           <div className="absolute top-6 left-6 right-6 flex justify-between items-start z-10">
               <span className="px-3 py-1 bg-white/20 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-bold text-white uppercase tracking-widest">
                   {recipe.cuisine || 'Global'}
               </span>
               <button 
                  onClick={(e) => { e.stopPropagation(); vibrate(10); onToggleFavorite(); }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all active:scale-90 ${isSaved ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/40' : 'bg-black/30 text-white'}`}
               >
                   <Heart size={18} fill={isSaved ? "currentColor" : "none"} />
               </button>
           </div>

           {/* Title Block */}
           <div className="absolute bottom-0 left-0 right-0 p-6 z-10 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
               <h1 className="font-editorial italic text-4xl text-white mb-2 leading-[0.9] drop-shadow-md">
                   {recipe.title}
               </h1>
               <div className="flex items-center gap-4 text-white/80 text-xs font-medium">
                   <span className="flex items-center gap-1"><Clock size={14} className="text-rose-400" /> {recipe.prepTimeMinutes}m</span>
                   <span className="flex items-center gap-1"><Flame size={14} className="text-orange-400" /> {recipe.calories} kcal</span>
               </div>
           </div>
       </div>

       {/* 2. INGREDIENTS (Checklist) */}
       <div className="p-6">
           <div className="flex items-center justify-between mb-4">
               <h3 className="font-brutal font-bold text-xs uppercase tracking-widest text-stone-400">Inventory</h3>
               <span className="text-xs font-bold bg-stone-100 px-2 py-1 rounded-md text-stone-600">{recipe.ingredients.length} items</span>
           </div>
           
           <div className="space-y-2 mb-8">
               {recipe.ingredients.map((ing, i) => (
                   <button 
                       key={i} 
                       onClick={() => toggleIngredient(i)}
                       className={`w-full flex items-center gap-4 p-3 rounded-xl border transition-all text-left group active:scale-[0.99]
                           ${checkedIngredients.has(i) ? 'bg-stone-50 border-transparent opacity-60' : 'bg-white border-stone-100 hover:border-rose-100 shadow-sm'}
                       `}
                   >
                       <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${checkedIngredients.has(i) ? 'bg-stone-300 border-stone-300' : 'border-stone-300 group-hover:border-rose-300'}`}>
                           {checkedIngredients.has(i) && <Check size={12} className="text-white" />}
                       </div>
                       <span className={`flex-1 font-medium ${checkedIngredients.has(i) ? 'line-through text-stone-400' : 'text-stone-800'}`}>
                           {ing}
                       </span>
                   </button>
               ))}
           </div>

           {/* 3. START ACTION */}
           <button 
               onClick={handleStartCooking}
               className="w-full bg-stone-900 text-white py-4 rounded-[1.5rem] font-brutal font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-xl shadow-stone-900/20 active:scale-95 transition-transform group"
           >
               <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-rose-500 transition-colors">
                   <Play size={10} fill="currentColor" />
               </div>
               Start Cooking Mode
           </button>
       </div>

    </div>
  );
};

export default RecipeCard;
