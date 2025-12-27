
import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Check, ChevronRight, Leaf, Zap, Clock, ChefHat, ArrowLeft } from 'lucide-react';
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

  // Haptic feedback helper
  const vibrate = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10); // Light tap
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
    if (step === 1 && !name.trim()) return; // Name validation
    
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
    // Simulate AI "Processing" delay for UX effect
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    updateUser({
      name: name || 'Gourmet',
      goals: selectedGoals,
      dietaryPreferences: selectedDiet,
      hasCompletedOnboarding: true
    });
    onComplete();
  };

  // --- STEPS CONTENT ---

  // Step 0: Welcome (Kinetic Typography)
  const StepWelcome = () => (
    <div className="flex flex-col justify-end h-full pb-10">
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <span className="inline-block px-3 py-1 mb-4 rounded-full border border-stone-800 text-[10px] font-brutal font-bold uppercase tracking-[0.2em] text-stone-600">
           AI Kitchen OS
        </span>
        <h1 className="text-7xl font-editorial italic text-stone-900 leading-[0.9] mb-4">
          Nourish<br/><span className="text-rose-500">Her.</span>
        </h1>
        <p className="text-xl font-brutal text-stone-500 leading-relaxed max-w-[80%]">
          {t('onb_welcome_desc')}
        </p>
      </motion.div>
    </div>
  );

  // Step 1: Identity (Interactive Input)
  const StepName = () => (
    <div className="flex flex-col justify-center h-full">
       <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <h2 className="text-sm font-brutal font-bold text-stone-400 uppercase tracking-widest mb-6">01 — Identity</h2>
          <h1 className="text-4xl font-editorial text-stone-900 mb-8 leading-tight">
             {t('onb_q_name_desc')}
          </h1>
          
          <div className="relative group">
             <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name..."
                className="w-full bg-transparent border-b-2 border-stone-200 py-4 text-5xl font-editorial italic text-stone-900 placeholder:text-stone-300 outline-none focus:border-rose-500 transition-colors"
                autoFocus
             />
             <motion.div 
                className="absolute right-0 top-1/2 -translate-y-1/2 text-stone-300"
                animate={{ x: name ? 0 : 10, opacity: name ? 1 : 0 }}
             >
                <Check className="text-emerald-500" size={32} />
             </motion.div>
          </div>
          <p className="mt-4 text-xs font-brutal text-stone-400">This is how your AI Chef will address you.</p>
       </motion.div>
    </div>
  );

  // Step 2: Goals (Bento Grid)
  const StepGoals = () => {
    const goals = [
        { id: 'Weight Loss', label: t('goal_weight'), icon: <Leaf size={20} />, color: 'bg-emerald-100 text-emerald-700' },
        { id: 'Energy', label: t('goal_energy'), icon: <Zap size={20} />, color: 'bg-amber-100 text-amber-700' },
        { id: 'Save Time', label: t('goal_time'), icon: <Clock size={20} />, color: 'bg-blue-100 text-blue-700' },
        { id: 'Cooking Skills', label: t('goal_skills'), icon: <ChefHat size={20} />, color: 'bg-rose-100 text-rose-700' },
    ];

    return (
        <div className="flex flex-col h-full pt-10">
            <h2 className="text-sm font-brutal font-bold text-stone-400 uppercase tracking-widest mb-4">02 — Focus</h2>
            <h1 className="text-4xl font-editorial text-stone-900 mb-8">{t('onb_q_goals_title')}</h1>
            
            <div className="grid grid-cols-1 gap-4 overflow-y-auto pb-4">
                {goals.map((goal, idx) => {
                    const isSelected = selectedGoals.includes(goal.id);
                    return (
                        <motion.button
                            key={goal.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            onClick={() => toggleSelection(goal.id, selectedGoals, setSelectedGoals)}
                            className={`relative p-6 rounded-[2rem] text-left transition-all duration-300 border ${
                                isSelected 
                                ? `${goal.color} border-transparent shadow-lg scale-[1.02]` 
                                : 'bg-white border-stone-100 text-stone-500 hover:bg-stone-50'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isSelected ? 'bg-white/50' : 'bg-stone-100'}`}>
                                        {goal.icon}
                                    </div>
                                    <span className={`text-lg font-bold font-brutal ${isSelected ? 'text-stone-900' : 'text-stone-600'}`}>
                                        {goal.label}
                                    </span>
                                </div>
                                {isSelected && (
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                        <div className="w-8 h-8 bg-stone-900 rounded-full flex items-center justify-center text-white">
                                            <Check size={16} />
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </motion.button>
                    )
                })}
            </div>
        </div>
    );
  };

  // Step 3: Diet (Fluid Tags)
  const StepDiet = () => {
      const diets = [
        { id: 'None', label: t('diet_none') },
        { id: 'Vegetarian', label: t('diet_veg') },
        { id: 'Vegan', label: t('diet_vegan') },
        { id: 'Keto', label: t('diet_keto') },
        { id: 'Gluten Free', label: t('diet_gluten') },
      ];
      
      return (
        <div className="flex flex-col justify-center h-full">
            <h2 className="text-sm font-brutal font-bold text-stone-400 uppercase tracking-widest mb-6">03 — Preferences</h2>
            <h1 className="text-4xl font-editorial text-stone-900 mb-2">{t('onb_q_diet_title')}</h1>
            <p className="text-stone-400 mb-10">{t('onb_q_diet_desc')}</p>

            <div className="flex flex-wrap gap-3">
                {diets.map((diet, idx) => {
                    const isSelected = selectedDiet.includes(diet.id);
                    return (
                        <motion.button
                            key={diet.id}
                            layout
                            onClick={() => toggleSelection(diet.id, selectedDiet, setSelectedDiet)}
                            className={`px-6 py-4 rounded-full text-lg font-medium transition-all duration-300 border ${
                                isSelected
                                ? 'bg-stone-900 text-white border-stone-900 shadow-xl'
                                : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'
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

  // Loading Screen (Finishing)
  if (isFinishing) {
      return (
          <div className="fixed inset-0 bg-[#F9F8F6] z-50 flex flex-col items-center justify-center p-8">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="w-32 h-32 rounded-full border border-dashed border-stone-300 mb-8 relative flex items-center justify-center"
              >
                 <motion.div 
                    animate={{ scale: [1, 1.2, 1] }} 
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-16 h-16 bg-rose-500 rounded-full blur-xl opacity-20" 
                 />
              </motion.div>
              <h2 className="text-2xl font-editorial italic text-stone-900 mb-2">Personalizing your experience...</h2>
              <div className="flex gap-1">
                  <span className="w-2 h-2 bg-stone-900 rounded-full animate-bounce" style={{ animationDelay: '0ms'}}></span>
                  <span className="w-2 h-2 bg-stone-900 rounded-full animate-bounce" style={{ animationDelay: '150ms'}}></span>
                  <span className="w-2 h-2 bg-stone-900 rounded-full animate-bounce" style={{ animationDelay: '300ms'}}></span>
              </div>
          </div>
      )
  }

  return (
    <div className="fixed inset-0 bg-[#F9F8F6] z-50 flex flex-col font-sans overflow-hidden">
        
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-100 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 opacity-60 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-100 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 opacity-60 pointer-events-none" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />

        {/* Header Progress */}
        <div className="relative z-10 px-6 pt-8 pb-4 flex justify-between items-center">
            <div className="flex gap-2">
                {[0,1,2,3].map(i => (
                    <motion.div 
                        key={i}
                        initial={false}
                        animate={{ 
                            width: step >= i ? 30 : 8,
                            backgroundColor: step >= i ? '#1c1917' : '#e7e5e4'
                        }}
                        className="h-2 rounded-full"
                    />
                ))}
            </div>
            {step > 0 && (
                <button onClick={handleBack} className="p-2 rounded-full hover:bg-stone-100 text-stone-500 transition-colors">
                    <ArrowLeft size={20} />
                </button>
            )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 px-6 relative z-10">
            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full"
                >
                    {step === 0 && <StepWelcome />}
                    {step === 1 && <StepName />}
                    {step === 2 && <StepGoals />}
                    {step === 3 && <StepDiet />}
                </motion.div>
            </AnimatePresence>
        </div>

        {/* Footer Action */}
        <div className="relative z-10 p-6 pb-10">
            <button
                onClick={handleNext}
                disabled={step === 1 && !name.trim()}
                className={`w-full h-16 rounded-[2rem] flex items-center justify-between px-8 transition-all duration-300 shadow-xl ${
                    step === 1 && !name.trim() 
                    ? 'bg-stone-200 text-stone-400 cursor-not-allowed' 
                    : 'bg-stone-900 text-white shadow-stone-300 hover:scale-[1.02] active:scale-95'
                }`}
            >
                <span className="font-brutal font-bold uppercase tracking-[0.2em] text-sm">
                    {step === 0 ? t('onb_start') : step === 3 ? t('onb_finish_btn') : t('onb_next')}
                </span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 1 && !name.trim() ? 'bg-stone-300' : 'bg-white text-stone-900'}`}>
                    {step === 3 ? <Sparkles size={16} /> : <ArrowRight size={16} />}
                </div>
            </button>
        </div>

    </div>
  );
};

export default Onboarding;
