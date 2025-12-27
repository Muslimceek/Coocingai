
import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Check, ChevronRight, Leaf, Zap, Clock, ChefHat, ArrowLeft, Target, Fingerprint, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';

interface OnboardingProps {
  onComplete: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const { t } = useLanguage();
  const { updateUser } = useUser();
  const [step, setStep] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);

  // Data Collection State
  const [name, setName] = useState('');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedDiet, setSelectedDiet] = useState<string[]>([]);

  // 1. Background Colors per step
  const stepColors = ['bg-[#F9F8F6]', 'bg-[#F9F8F6]', 'bg-stone-900', 'bg-[#F0FDF4]', 'bg-rose-50'];

  // Haptic feedback
  const vibrate = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  const toggleSelection = (
    item: string, 
    currentList: string[], 
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    vibrate();
    setList(prev => 
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const handleNext = () => {
    vibrate();
    if (step === 1 && !name.trim()) return;
    
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    vibrate();
    if (step > 0) setStep(step - 1);
  };

  const handleFinish = async () => {
    setIsFinishing(true);
    // Simulate generation of the "Identity Card"
    await new Promise(resolve => setTimeout(resolve, 3500));
    
    updateUser({
      name: name || 'Chef',
      goals: selectedGoals,
      dietaryPreferences: selectedDiet,
      hasCompletedOnboarding: true
    });
    onComplete();
  };

  // --- COMPONENT SLIDES ---

  // Step 0: The Manifesto (Hero)
  const SlideWelcome = () => (
    <div className="flex flex-col h-full justify-between pt-10 pb-4">
       <div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-stone-200 bg-white shadow-sm mb-6"
          >
              <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-[10px] font-brutal font-bold uppercase tracking-widest text-stone-500">System v2.0</span>
          </motion.div>
          
          <h1 className="text-6xl font-editorial italic text-stone-900 leading-[0.9] mb-6">
            Eat Smart.<br/>
            <span className="text-stone-300">Live Better.</span>
          </h1>
          
          <p className="text-lg font-brutal text-stone-500 max-w-xs leading-relaxed">
            {t('onb_welcome_desc')}
          </p>
       </div>
       
       <div className="relative h-64 w-full">
           <motion.div 
             animate={{ rotate: 360 }}
             transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
             className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-tr from-rose-200 to-orange-200 rounded-full blur-3xl opacity-60"
           />
           <div className="absolute inset-0 flex items-center justify-center">
              <ChefHat size={80} className="text-stone-900 drop-shadow-2xl" strokeWidth={1} />
           </div>
       </div>
    </div>
  );

  // Step 1: The Identity (Kinetic Input)
  const SlideIdentity = () => (
    <div className="flex flex-col h-full justify-center">
       <div className="mb-8">
           <Fingerprint size={32} className="text-rose-500 mb-4" />
           <h2 className="text-3xl font-editorial text-stone-900 leading-tight">
             First, let's establish<br/>your <span className="italic text-rose-500">identity</span>.
           </h2>
       </div>
       
       <div className="relative group">
           <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              className="w-full bg-transparent border-b-2 border-stone-200 py-4 text-5xl font-editorial italic text-stone-900 placeholder:text-stone-300 outline-none focus:border-stone-900 transition-colors"
              autoFocus
           />
           {!name && (
               <motion.span 
                  animate={{ opacity: [0, 1, 0] }} 
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="absolute left-0 top-4 h-12 w-1 bg-stone-900 pointer-events-none"
               />
           )}
       </div>
       <p className="mt-6 text-xs font-brutal font-bold uppercase tracking-widest text-stone-400 flex items-center gap-2">
          <Check size={12} className={name ? "text-emerald-500" : "text-stone-300"} />
          Required for personalization
       </p>
    </div>
  );

  // Step 2: The Focus (Dark Mode Bento Grid)
  const SlideGoals = () => {
    const goals = [
        { id: 'Weight Loss', label: t('goal_weight'), icon: <Target size={24} /> },
        { id: 'Energy', label: t('goal_energy'), icon: <Zap size={24} /> },
        { id: 'Save Time', label: t('goal_time'), icon: <Clock size={24} /> },
        { id: 'Skills', label: t('goal_skills'), icon: <ChefHat size={24} /> },
    ];

    return (
        <div className="flex flex-col h-full pt-6">
            <h2 className="text-white text-3xl font-editorial italic mb-8">
                Select your<br/>mission objectives.
            </h2>
            
            <div className="grid grid-cols-2 gap-3">
                {goals.map((goal, idx) => {
                    const isSelected = selectedGoals.includes(goal.id);
                    return (
                        <motion.button
                            key={goal.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            onClick={() => toggleSelection(goal.id, selectedGoals, setSelectedGoals)}
                            className={`
                                relative p-6 rounded-[2rem] flex flex-col justify-between h-40 transition-all duration-300 border
                                ${isSelected 
                                    ? 'bg-rose-500 border-rose-500 text-white' 
                                    : 'bg-stone-800 border-stone-700 text-stone-400 hover:bg-stone-700'}
                            `}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSelected ? 'bg-white/20' : 'bg-stone-900'}`}>
                                {goal.icon}
                            </div>
                            <span className="text-sm font-brutal font-bold uppercase tracking-wider text-left">
                                {goal.label}
                            </span>
                        </motion.button>
                    )
                })}
            </div>
        </div>
    );
  };

  // Step 3: The Exclusion (Eco/Green Vibe)
  const SlideDiet = () => {
      const diets = [
        { id: 'Vegetarian', label: t('diet_veg') },
        { id: 'Vegan', label: t('diet_vegan') },
        { id: 'Keto', label: t('diet_keto') },
        { id: 'Gluten Free', label: t('diet_gluten') },
        { id: 'None', label: t('diet_none') },
      ];
      
      return (
        <div className="flex flex-col h-full justify-center">
            <Leaf size={40} className="text-emerald-600 mb-6" />
            <h2 className="text-3xl font-editorial text-emerald-900 mb-2">Dietary Protocol</h2>
            <p className="text-emerald-700/60 mb-10 font-medium">Tap any constraints to configure your AI Chef.</p>

            <div className="flex flex-wrap gap-3">
                {diets.map((diet, idx) => {
                    const isSelected = selectedDiet.includes(diet.id);
                    return (
                        <motion.button
                            key={diet.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            onClick={() => toggleSelection(diet.id, selectedDiet, setSelectedDiet)}
                            className={`px-6 py-4 rounded-2xl text-lg font-bold transition-all duration-300 border-2 ${
                                isSelected
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xl shadow-emerald-200'
                                : 'bg-white text-emerald-800 border-emerald-100 hover:border-emerald-300'
                            }`}
                        >
                            {diet.label}
                        </motion.button>
                    )
                })}
            </div>
        </div>
      );
  }

  // --- FINALE: THE TICKET GENERATION ---
  
  if (isFinishing) {
      return (
        <div className="fixed inset-0 bg-stone-900 z-[100] flex flex-col items-center justify-center p-6 text-white font-sans overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
            
            {/* The Printing Ticket Animation */}
            <motion.div 
               initial={{ y: -500, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               transition={{ type: "spring", damping: 20, stiffness: 100 }}
               className="bg-[#F9F8F6] w-full max-w-xs p-6 rounded-3xl text-stone-900 relative shadow-2xl"
            >
                {/* Hole Punch for Ticket feel */}
                <div className="absolute -left-3 top-24 w-6 h-6 bg-stone-900 rounded-full" />
                <div className="absolute -right-3 top-24 w-6 h-6 bg-stone-900 rounded-full" />
                
                <div className="flex justify-between items-start mb-8 border-b-2 border-dashed border-stone-200 pb-6">
                    <div>
                        <span className="block text-[10px] font-brutal font-black uppercase tracking-widest text-stone-400">Identity</span>
                        <h2 className="text-3xl font-editorial italic font-bold">{name}</h2>
                    </div>
                    <div className="w-12 h-12 bg-rose-500 rounded-full flex items-center justify-center text-white">
                        <ChefHat size={20} />
                    </div>
                </div>

                <div className="space-y-4 mb-8">
                    <div>
                        <span className="block text-[10px] font-brutal font-bold uppercase tracking-widest text-stone-400 mb-1">Focus</span>
                        <div className="flex flex-wrap gap-1">
                            {selectedGoals.slice(0,3).map(g => (
                                <span key={g} className="px-2 py-1 bg-stone-100 rounded-md text-xs font-bold">{g}</span>
                            ))}
                        </div>
                    </div>
                    <div>
                        <span className="block text-[10px] font-brutal font-bold uppercase tracking-widest text-stone-400 mb-1">Protocol</span>
                        <span className="text-sm font-bold">{selectedDiet.length ? selectedDiet.join(', ') : 'Unrestricted'}</span>
                    </div>
                </div>

                <div className="bg-stone-900 text-white p-4 rounded-xl flex items-center justify-between">
                    <span className="font-brutal font-bold text-xs uppercase tracking-widest">Generating...</span>
                    <Activity size={16} className="text-rose-500 animate-pulse" />
                </div>
            </motion.div>

            <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-8 font-editorial italic text-stone-500"
            >
                Preparing your kitchen OS...
            </motion.p>
        </div>
      );
  }

  return (
    <motion.div 
        className={`fixed inset-0 z-50 flex flex-col font-sans overflow-hidden transition-colors duration-700 ease-in-out ${stepColors[step]}`}
    >
        {/* Progress Bar (Liquid) */}
        <div className="relative z-10 px-6 pt-8 pb-2">
             <div className="h-1 bg-stone-200/50 rounded-full overflow-hidden">
                 <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${((step + 1) / 4) * 100}%` }}
                    className={`h-full rounded-full ${step === 2 ? 'bg-white' : 'bg-stone-900'}`}
                 />
             </div>
        </div>

        {/* 3D Card Stack Layout */}
        <div className="flex-1 relative w-full perspective-1000 px-6 py-4">
             <AnimatePresence mode="popLayout" custom={step}>
                <motion.div
                   key={step}
                   custom={step}
                   initial={{ opacity: 0, x: 100, scale: 0.9, rotate: 2 }}
                   animate={{ opacity: 1, x: 0, scale: 1, rotate: 0 }}
                   exit={{ opacity: 0, x: -50, scale: 0.9, rotate: -2, filter: 'blur(4px)' }}
                   transition={{ type: "spring", stiffness: 300, damping: 30 }}
                   className="w-full h-full"
                >
                    {step === 0 && <SlideWelcome />}
                    {step === 1 && <SlideIdentity />}
                    {step === 2 && <SlideGoals />}
                    {step === 3 && <SlideDiet />}
                </motion.div>
             </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        <div className="relative z-20 p-6 pb-10 flex items-center justify-between">
            {step > 0 ? (
                <button 
                    onClick={handleBack} 
                    className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all ${step === 2 ? 'border-stone-700 text-stone-400 hover:text-white' : 'border-stone-200 text-stone-400 hover:text-stone-900'}`}
                >
                    <ArrowLeft size={20} />
                </button>
            ) : <div />}

            <button
                onClick={handleNext}
                disabled={step === 1 && !name.trim()}
                className={`
                    px-8 py-4 rounded-[2rem] flex items-center gap-4 font-brutal font-bold uppercase tracking-widest text-xs transition-all shadow-xl
                    ${step === 2 
                        ? 'bg-white text-stone-900 shadow-stone-900/20 hover:bg-stone-200' 
                        : step === 1 && !name.trim() ? 'bg-stone-200 text-stone-400 shadow-none cursor-not-allowed' : 'bg-stone-900 text-white shadow-stone-300 hover:scale-105 active:scale-95'}
                `}
            >
                {step === 0 ? "Initialize" : step === 3 ? "Complete" : "Next"}
                {step === 0 ? <Activity size={16} /> : <ArrowRight size={16} />}
            </button>
        </div>

    </motion.div>
  );
};

export default Onboarding;
