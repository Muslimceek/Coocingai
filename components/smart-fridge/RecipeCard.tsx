import React, { useState, useEffect, useRef } from 'react';
import { 
  PlayCircle, Heart, ChefHat, Clock, Flame, Utensils, Sparkles, 
  Check, Share2, ArrowLeft, X, ChevronRight, ChevronLeft, RotateCcw
} from 'lucide-react';
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
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Cooking Mode States
  const [cookingMode, setCookingMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showStartButton, setShowStartButton] = useState(true);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const toggleIngredient = (idx: number) => {
      const newSet = new Set(checkedIngredients);
      if(newSet.has(idx)) newSet.delete(idx); else newSet.add(idx);
      setCheckedIngredients(newSet);
      if(navigator.vibrate) navigator.vibrate(10);
  };

  const toggleStep = (idx: number) => {
      if (cookingMode) {
          // In cooking mode, clicking a step sets it as current
          setCurrentStep(idx);
          if(navigator.vibrate) navigator.vibrate(10);
          return;
      }
      const newSet = new Set(checkedSteps);
      if(newSet.has(idx)) newSet.delete(idx); else newSet.add(idx);
      setCheckedSteps(newSet);
      if(navigator.vibrate) navigator.vibrate([10, 30, 10]);
  };

  const handleStartCooking = () => {
    setCookingMode(true);
    setCurrentStep(0);
    setShowStartButton(false);
    // Smooth scroll to first step
    setTimeout(() => {
        const el = document.getElementById(`step-${recipe.id}-0`);
        if(el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleNextStep = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentStep < recipe.instructions.length - 1) {
        const next = currentStep + 1;
        setCurrentStep(next);
        const el = document.getElementById(`step-${recipe.id}-${next}`);
        if(el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if(navigator.vibrate) navigator.vibrate(10);
    } else {
        // Finish
        setCookingMode(false);
        setShowStartButton(true);
        // Mark all as done
        const allSteps = new Set(recipe.instructions.map((_, i) => i));
        setCheckedSteps(allSteps);
    }
  };

  const handlePrevStep = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentStep > 0) {
        const prev = currentStep - 1;
        setCurrentStep(prev);
        const el = document.getElementById(`step-${recipe.id}-${prev}`);
        if(el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleExitCooking = (e: React.MouseEvent) => {
      e.stopPropagation();
      setCookingMode(false);
      setShowStartButton(true);
  };

  return (
    <div className={`relative w-full bg-[#F9F8F6] text-stone-900 overflow-hidden mb-12 rounded-[2.5rem] shadow-2xl transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
       
       {/* 1. IMMERSIVE HERO: Borderless & Full Bleed */}
       <div className={`relative w-full overflow-hidden group transition-all duration-700 ${cookingMode ? 'h-[20vh]' : 'h-[65vh]'}`}>
         <div className="absolute inset-0 bg-stone-200 animate-pulse" /> {/* Placeholder */}
         
         <img 
           src={recipe.imageUrl || `https://picsum.photos/seed/${recipe.id}/800/1200`} 
           alt={recipe.title} 
           className={`w-full h-full object-cover transition-all duration-[2s] ease-out will-change-transform ${imageLoading ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}`}
           loading="lazy"
         />
         
         {/* Organic Gradient Mask */}
         <div className="absolute inset-0 bg-gradient-to-t from-[#F9F8F6] via-[#F9F8F6]/20 to-black/20" />
         
         {/* Top Navigation / Status (Floating) */}
         <div className="absolute top-6 left-6 right-6 flex justify-between items-start z-20">
            <div className="flex gap-2">
                {recipe.cuisine && (
                    <span className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 text-white font-brutal font-bold text-[10px] uppercase tracking-widest shadow-lg">
                        {recipe.cuisine}
                    </span>
                )}
            </div>
            
            {/* Floating Glass Controls */}
            <div className="flex flex-col gap-3">
                <button 
                    onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
                    className={`w-12 h-12 rounded-full backdrop-blur-3xl border border-white/20 flex items-center justify-center shadow-lg transition-all duration-300 active:scale-90 hover:scale-105 ${isSaved ? 'bg-rose-500 text-white' : 'bg-black/20 text-white hover:bg-black/30'}`}
                >
                    <Heart size={20} fill={isSaved ? "currentColor" : "none"} strokeWidth={isSaved ? 0 : 2} />
                </button>
                
                {/* Reveal Start Button if Hidden */}
                {!showStartButton && !cookingMode && (
                    <button 
                        onClick={() => setShowStartButton(true)}
                        className="w-12 h-12 rounded-full bg-stone-900 text-white flex items-center justify-center shadow-lg hover:scale-105 transition-all animate-in fade-in zoom-in"
                    >
                        <ChefHat size={20} />
                    </button>
                )}
            </div>
         </div>

         {/* Parallax Typography Title */}
         <div className={`absolute bottom-0 left-0 w-full px-6 transition-all duration-700 z-10 pointer-events-none ${cookingMode ? 'pb-4 opacity-0 md:opacity-100' : 'pb-20'}`}>
            <h1 className={`font-editorial italic tracking-tight text-stone-900 drop-shadow-sm mb-4 transition-all duration-700 ${cookingMode ? 'text-3xl' : 'text-5xl md:text-7xl leading-[0.9]'}`}>
              {recipe.title}
            </h1>
            {!cookingMode && recipe.author && (
                 <div className="flex items-center gap-3">
                     <div className="h-[1px] w-8 bg-stone-900"></div>
                     <p className="text-stone-600 text-xs font-brutal font-bold uppercase tracking-widest">
                        {recipe.author}
                     </p>
                 </div>
             )}
         </div>
       </div>

       {/* 2. KINETIC STATS: Bento-Stretch (Hidden in Cooking Mode) */}
       {!cookingMode && (
        <div className="relative px-6 -mt-12 z-20 animate-in fade-in duration-500">
            <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-[2rem] p-3 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] flex justify-between items-center">
                
                <div className="flex-1 py-3 text-center border-r border-stone-200/50">
                    <span className="block text-[9px] font-brutal font-bold text-stone-400 uppercase tracking-widest mb-1">Time</span>
                    <span className="text-xl font-editorial italic text-stone-900">{recipe.prepTimeMinutes}<span className="text-xs not-italic ml-0.5 opacity-50 font-sans">m</span></span>
                </div>

                <div className="flex-1 py-3 text-center border-r border-stone-200/50">
                    <span className="block text-[9px] font-brutal font-bold text-stone-400 uppercase tracking-widest mb-1">Cals</span>
                    <span className="text-xl font-editorial italic text-stone-900">{recipe.calories}</span>
                </div>

                <div className="flex-1 py-3 text-center">
                    <span className="block text-[9px] font-brutal font-bold text-stone-400 uppercase tracking-widest mb-1">Serves</span>
                    <span className="text-xl font-editorial italic text-stone-900">{recipe.servings || 2}</span>
                </div>

            </div>
        </div>
       )}

       {/* 3. CONTENT STREAM */}
       <div className={`p-6 md:p-8 pb-32 space-y-16 bg-[#F9F8F6] transition-all duration-700 ${cookingMode ? '-mt-6 rounded-t-[3rem] z-30 relative shadow-[0_-20px_40px_rgba(0,0,0,0.05)]' : ''}`}>
          
          {!cookingMode && (
              <p className="text-lg font-light leading-relaxed text-stone-600 first-letter:text-5xl first-letter:font-editorial first-letter:float-left first-letter:mr-3 first-letter:mt-[-4px]">
                {recipe.description}
              </p>
          )}

          {/* AI Tips */}
          {!cookingMode && recipe.tips && recipe.tips.length > 0 && (
             <div className="relative bg-gradient-to-br from-rose-100/50 to-orange-100/50 p-8 rounded-[2rem] border border-white/50 overflow-hidden">
                <div className="absolute -top-4 -right-4 text-rose-200 opacity-20 rotate-12">
                    <Sparkles size={120} />
                </div>
                <h4 className="font-brutal font-bold text-xs uppercase tracking-[0.2em] text-rose-500 mb-6 flex items-center gap-2 relative z-10">
                    <Sparkles size={14} /> Chef's Secret
                </h4>
                <ul className="space-y-4 relative z-10">
                    {recipe.tips.map((tip, idx) => (
                        <li key={idx} className="flex gap-4 text-stone-800 text-lg font-editorial italic leading-tight">
                            <span className="text-rose-400 font-brutal not-italic text-xs font-bold mt-1.5">0{idx+1}</span>
                            {tip}
                        </li>
                    ))}
                </ul>
             </div>
          )}
          
          {/* Ingredients - "The Elements" */}
          <section className={cookingMode ? 'opacity-40 hover:opacity-100 transition-opacity' : ''}>
            <div className="flex items-center justify-between mb-6 sticky top-0 bg-[#F9F8F6]/90 backdrop-blur-md py-4 z-10">
                <h2 className="text-xs font-brutal font-black uppercase tracking-[0.2em] flex items-center gap-3 text-stone-400">
                    The Elements
                    <span className="w-8 h-px bg-stone-300"></span>
                </h2>
                <span className="bg-stone-900 text-white text-[9px] font-bold px-2 py-1 rounded-lg">{recipe.ingredients.length}</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
                {recipe.ingredients.map((ing, i) => (
                    <div 
                        key={i} 
                        onClick={() => toggleIngredient(i)}
                        className={`group flex items-baseline gap-5 p-4 rounded-2xl transition-all duration-300 cursor-pointer border border-transparent ${checkedIngredients.has(i) ? 'opacity-40 grayscale bg-stone-100' : 'bg-white shadow-sm hover:border-rose-100'}`}
                    >
                        <span className={`font-brutal font-bold text-xs ${checkedIngredients.has(i) ? 'text-stone-400' : 'text-rose-400'}`}>
                            {(i+1).toString().padStart(2, '0')}
                        </span>
                        <p className={`text-lg font-editorial italic group-hover:translate-x-1 transition-transform duration-300 ${checkedIngredients.has(i) ? 'line-through decoration-stone-300' : 'text-stone-800'}`}>
                            {ing}
                        </p>
                        <div className={`ml-auto w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${checkedIngredients.has(i) ? 'bg-stone-400 border-stone-400' : 'border-stone-200'}`}>
                            <Check size={12} className="text-white" />
                        </div>
                    </div>
                ))}
            </div>
          </section>

          {/* Instructions - "The Process" */}
          <section id="instructions-start">
             <h2 className="text-xs font-brutal font-black uppercase tracking-[0.2em] flex items-center gap-3 text-stone-400 mb-8">
                The Process
                <span className="w-8 h-px bg-stone-300"></span>
             </h2>

             <div className="space-y-10 pl-2">
                {recipe.instructions.map((step, idx) => {
                    const isActive = cookingMode && idx === currentStep;
                    const isDone = cookingMode && idx < currentStep;
                    
                    return (
                        <div 
                            key={idx} 
                            id={`step-${recipe.id}-${idx}`}
                            onClick={() => toggleStep(idx)}
                            className={`
                                relative pl-8 cursor-pointer group transition-all duration-700 ease-in-out
                                ${cookingMode && !isActive ? 'opacity-30 scale-[0.98] blur-[1px]' : 'opacity-100 scale-100'}
                                ${checkedSteps.has(idx) && !cookingMode ? 'opacity-40' : ''}
                            `}
                        >
                            {/* Connection Line */}
                            {idx !== recipe.instructions.length - 1 && (
                                <div className="absolute left-[11px] top-8 bottom-[-40px] w-px bg-stone-200 group-hover:bg-rose-200 transition-colors" />
                            )}

                            {/* Timeline Node */}
                            <div className={`
                                absolute -left-[4px] top-1 w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-brutal font-bold transition-all duration-500
                                ${isActive ? 'bg-rose-500 border-rose-500 text-white scale-125 shadow-lg shadow-rose-200' : 'bg-white border-[#F9F8F6] ring-1 ring-stone-100 text-stone-400'}
                                ${isDone ? 'bg-stone-900 border-stone-900 text-white' : ''}
                                ${checkedSteps.has(idx) && !cookingMode ? 'bg-stone-900 text-white scale-90 border-stone-900' : ''}
                            `}>
                            {idx + 1}
                            </div>
                            
                            <p className={`
                                text-xl leading-relaxed font-light transition-all duration-500
                                ${isActive ? 'text-stone-900 font-normal scale-[1.02] origin-left' : 'text-stone-800'}
                                ${checkedSteps.has(idx) && !cookingMode ? 'line-through decoration-stone-300' : ''}
                            `}>
                                {step}
                            </p>
                        </div>
                    );
                })}
             </div>
          </section>

          {/* Floating Action Buttons */}
          <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-40 w-full max-w-sm px-4 flex justify-center pointer-events-none">
             
             {/* 1. START COOKING BUTTON (Dismissible) */}
             {!cookingMode && showStartButton && (
                 <div className="relative pointer-events-auto animate-in slide-in-from-bottom-5 duration-500">
                     <button 
                        onClick={handleStartCooking}
                        className="bg-stone-900 text-white pl-6 pr-8 py-4 rounded-full font-brutal font-bold uppercase tracking-[0.2em] text-[10px] flex items-center gap-3 shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-95 transition-all duration-300 group ring-4 ring-white/50"
                     >
                        <span className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center group-hover:rotate-90 transition-transform duration-500">
                            <PlayCircle size={16} className="text-rose-400 fill-current" />
                        </span>
                        Start Cooking
                     </button>
                     <button 
                        onClick={() => setShowStartButton(false)}
                        className="absolute -top-2 -right-2 bg-stone-200 text-stone-500 hover:bg-rose-500 hover:text-white rounded-full p-1.5 shadow-sm transition-colors"
                     >
                        <X size={12} />
                     </button>
                 </div>
             )}

             {/* 2. COOKING MODE CONTROLS */}
             {cookingMode && (
                 <div className="pointer-events-auto bg-stone-900/90 backdrop-blur-xl text-white p-2 rounded-full shadow-2xl flex items-center gap-2 ring-1 ring-white/20 animate-in slide-in-from-bottom-10 fade-in duration-500">
                     <button 
                        onClick={handlePrevStep}
                        disabled={currentStep === 0}
                        className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 flex items-center justify-center transition"
                     >
                        <ChevronLeft size={20} />
                     </button>
                     
                     <div className="px-4 flex flex-col items-center">
                         <span className="text-[10px] font-brutal font-bold uppercase tracking-widest text-stone-400">Step</span>
                         <span className="text-xl font-editorial italic leading-none">{currentStep + 1}<span className="text-sm opacity-50 not-italic">/{recipe.instructions.length}</span></span>
                     </div>

                     <button 
                        onClick={handleNextStep}
                        className="w-12 h-12 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center transition shadow-lg shadow-rose-900/50"
                     >
                        {currentStep === recipe.instructions.length - 1 ? <Check size={20} /> : <ChevronRight size={20} />}
                     </button>

                     <div className="w-px h-8 bg-white/10 mx-1"></div>

                     <button 
                        onClick={handleExitCooking}
                        className="w-10 h-10 rounded-full bg-transparent hover:bg-white/10 text-stone-400 hover:text-white flex items-center justify-center transition"
                     >
                        <X size={18} />
                     </button>
                 </div>
             )}

          </div>

       </div>
    </div>
  );
};

export default RecipeCard;