
import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, Sparkles, Check, ChevronRight, Leaf, Zap, Clock, 
  ChefHat, ArrowLeft, Target, Fingerprint, Activity, Wind, Heart 
} from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';

interface OnboardingProps {
  onComplete: () => void;
}

// --- VISUAL TOKENS ---
const VARIANTS = {
  enter: (direction: number) => ({
    x: direction > 0 ? 50 : -50,
    opacity: 0,
    scale: 0.95,
    filter: 'blur(10px)'
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)'
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 50 : -50,
    opacity: 0,
    scale: 1.05,
    filter: 'blur(10px)'
  })
};

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const { t } = useLanguage();
  const { updateUser } = useUser();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);

  // Data State
  const [name, setName] = useState('');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedDiet, setSelectedDiet] = useState<string[]>([]);

  // Haptics
  const vibrate = (pattern: number | number[] = 10) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(pattern);
  };

  const nextStep = () => {
    if (step === 1 && !name.trim()) {
        vibrate([50, 50, 50]); // Error vibration
        return;
    }
    vibrate(20);
    setDirection(1);
    if (step < 3) setStep(s => s + 1);
    else handleFinish();
  };

  const prevStep = () => {
    vibrate(10);
    setDirection(-1);
    if (step > 0) setStep(s => s - 1);
  };

  const handleFinish = async () => {
    setIsFinishing(true);
    vibrate([20, 30, 40, 50]); // Success ramp
    // Artificial delay for "Computation" effect
    await new Promise(resolve => setTimeout(resolve, 3800));
    
    updateUser({
      name: name || 'Chef',
      goals: selectedGoals,
      dietaryPreferences: selectedDiet,
      hasCompletedOnboarding: true
    });
    onComplete();
  };

  // --- 3D GYRO TICKET COMPONENT ---
  const HolographicTicket = () => {
      const x = useMotionValue(0);
      const y = useMotionValue(0);
      const rotateX = useTransform(y, [-100, 100], [15, -15]);
      const rotateY = useTransform(x, [-100, 100], [-15, 15]);
      
      function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
        const rect = event.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        x.set(event.clientX - centerX);
        y.set(event.clientY - centerY);
      }

      return (
        <motion.div 
            className="perspective-1000 cursor-grab active:cursor-grabbing"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => { x.set(0); y.set(0); }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 1.5 }}
        >
            <motion.div 
                style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                className="w-[320px] h-[500px] bg-stone-900 rounded-[2.5rem] relative overflow-hidden shadow-2xl shadow-stone-900/50 border border-white/10"
            >
                {/* Holographic Sheen */}
                <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/20 via-transparent to-blue-500/20 z-20 pointer-events-none mix-blend-overlay" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 z-10 pointer-events-none" />

                {/* Content */}
                <div className="relative z-30 p-8 h-full flex flex-col justify-between text-white transform translate-z-10">
                    <div>
                        <div className="flex justify-between items-start mb-8">
                            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10">
                                <ChefHat size={20} />
                            </div>
                            <span className="font-brutal font-bold text-[10px] uppercase tracking-widest opacity-50 border border-white/20 px-2 py-1 rounded-full">
                                Access Granted
                            </span>
                        </div>
                        <h2 className="text-4xl font-editorial italic mb-1">{name}</h2>
                        <p className="text-sm opacity-60 font-brutal uppercase tracking-wider">Kitchen OS • v2.0</p>
                    </div>

                    <div className="space-y-6">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                            <span className="block text-[9px] uppercase tracking-widest opacity-50 mb-2">Directives</span>
                            <div className="flex flex-wrap gap-2">
                                {selectedGoals.slice(0, 3).map(g => (
                                    <span key={g} className="px-2 py-1 bg-rose-500 text-white text-[10px] font-bold rounded-md">{g}</span>
                                ))}
                            </div>
                        </div>
                        
                        <div className="flex justify-between items-end">
                            <div>
                                <span className="block text-[9px] uppercase tracking-widest opacity-50">Issued</span>
                                <span className="text-lg font-mono">{new Date().toLocaleDateString()}</span>
                            </div>
                            <div className="w-16 h-16 bg-white p-1 rounded-lg">
                                <div className="w-full h-full bg-stone-900 rounded-md flex items-center justify-center">
                                    <Fingerprint className="text-white/50" size={32} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="text-center mt-8"
            >
                <p className="text-stone-500 font-editorial italic text-lg">Initializing Environment...</p>
            </motion.div>
        </motion.div>
      )
  }

  // --- SLIDE 1: WELCOME (The Orb) ---
  const SlideWelcome = () => (
    <div className="flex flex-col h-full justify-center relative">
        <div className="absolute top-0 right-0 left-0 h-[60%] flex items-center justify-center pointer-events-none">
             {/* The Living Orb */}
             <motion.div 
                animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 90, 180],
                    filter: ["hue-rotate(0deg)", "hue-rotate(30deg)", "hue-rotate(0deg)"]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="w-64 h-64 rounded-full bg-gradient-to-tr from-rose-300 via-orange-200 to-amber-200 blur-[60px] opacity-60"
             />
        </div>

        <div className="relative z-10 text-center">
             <motion.h1 
                initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
                className="text-6xl md:text-8xl font-editorial italic text-stone-900 mb-6"
             >
                Genesis
             </motion.h1>
             <motion.p 
                initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
                className="text-lg text-stone-500 max-w-xs mx-auto font-medium leading-relaxed"
             >
                {t('onb_welcome_desc')}
             </motion.p>
        </div>
    </div>
  );

  // --- SLIDE 2: IDENTITY (Spatial Input) ---
  const SlideIdentity = () => (
      <div className="flex flex-col h-full justify-center px-4">
          <label className="text-xs font-brutal font-bold uppercase tracking-widest text-stone-400 mb-6 text-center block">
              Identification Protocol
          </label>
          <div className="relative">
              <input 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && nextStep()}
                  className="w-full bg-transparent text-center text-5xl md:text-6xl font-editorial italic text-stone-900 placeholder:text-stone-200 outline-none border-b-2 border-transparent focus:border-stone-900/10 transition-colors pb-4"
                  placeholder="Your Name"
                  autoFocus
              />
              {/* Dynamic Underline */}
              <motion.div 
                 layoutId="underline"
                 className={`h-1 w-24 bg-rose-500 mx-auto rounded-full mt-2 transition-all duration-500 ${name ? 'w-full opacity-100' : 'w-12 opacity-30'}`}
              />
          </div>
          <p className="text-center mt-8 text-stone-400 text-sm">
             We use this to calibrate your AI Chef.
          </p>
      </div>
  );

  // --- SLIDE 3: GOALS (Bento Grid) ---
  const SlideGoals = () => {
      const goals = [
          { id: 'Weight Loss', label: t('goal_weight'), icon: <Target />, color: 'bg-rose-100 text-rose-600' },
          { id: 'Energy', label: t('goal_energy'), icon: <Zap />, color: 'bg-amber-100 text-amber-600' },
          { id: 'Save Time', label: t('goal_time'), icon: <Clock />, color: 'bg-blue-100 text-blue-600' },
          { id: 'Skills', label: t('goal_skills'), icon: <ChefHat />, color: 'bg-emerald-100 text-emerald-600' },
      ];

      const toggle = (id: string) => {
          vibrate();
          setSelectedGoals(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
      };

      return (
          <div className="h-full flex flex-col pt-10">
              <h2 className="text-4xl font-editorial italic text-stone-900 mb-8 px-2">
                  Prime Directive
              </h2>
              <div className="grid grid-cols-2 gap-4">
                  {goals.map((goal, i) => {
                      const active = selectedGoals.includes(goal.id);
                      return (
                          <motion.button
                              key={goal.id}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: i * 0.1 }}
                              onClick={() => toggle(goal.id)}
                              className={`
                                  relative p-6 rounded-[2rem] flex flex-col justify-between h-44 text-left border-2 transition-all duration-300
                                  ${active ? 'border-stone-900 bg-stone-900 text-white' : 'border-transparent bg-white shadow-sm hover:scale-[1.02]'}
                              `}
                          >
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${active ? 'bg-white/20' : goal.color}`}>
                                  {React.cloneElement(goal.icon as any, { size: 24 })}
                              </div>
                              <span className="font-brutal font-bold text-sm uppercase tracking-wider">
                                  {goal.label}
                              </span>
                              {active && (
                                  <div className="absolute top-4 right-4 text-emerald-400">
                                      <Check size={20} />
                                  </div>
                              )}
                          </motion.button>
                      )
                  })}
              </div>
          </div>
      )
  }

  // --- SLIDE 4: DIET (Magnetic Tags) ---
  const SlideDiet = () => {
      const diets = [
        { id: 'None', label: t('diet_none') },
        { id: 'Vegetarian', label: t('diet_veg') },
        { id: 'Vegan', label: t('diet_vegan') },
        { id: 'Keto', label: t('diet_keto') },
        { id: 'Gluten Free', label: t('diet_gluten') },
      ];

      const toggle = (id: string) => {
          vibrate();
          setSelectedDiet(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
      };

      return (
          <div className="h-full flex flex-col justify-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6 text-emerald-600">
                  <Leaf size={32} />
              </div>
              <h2 className="text-4xl font-editorial italic text-stone-900 mb-2">
                  Parameters
              </h2>
              <p className="text-stone-500 mb-10">Select any dietary constraints.</p>
              
              <div className="flex flex-wrap gap-3">
                  {diets.map((diet, i) => {
                      const active = selectedDiet.includes(diet.id);
                      return (
                          <motion.button
                             key={diet.id}
                             initial={{ opacity: 0, y: 20 }}
                             animate={{ opacity: 1, y: 0 }}
                             transition={{ delay: i * 0.05 }}
                             onClick={() => toggle(diet.id)}
                             className={`
                                px-6 py-4 rounded-full text-sm font-bold border-2 transition-all duration-200
                                ${active 
                                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-200' 
                                    : 'bg-white border-stone-200 text-stone-600 hover:border-emerald-300'}
                             `}
                          >
                              {diet.label}
                          </motion.button>
                      )
                  })}
              </div>
          </div>
      )
  }

  if (isFinishing) {
      return (
          <div className="fixed inset-0 bg-[#0F0F0F] z-50 flex flex-col items-center justify-center overflow-hidden">
              <HolographicTicket />
          </div>
      )
  }

  return (
    <div className="fixed inset-0 bg-[#F9F8F6] z-50 overflow-hidden font-sans">
        {/* Dynamic Background Mesh */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
            <motion.div 
               animate={{ 
                   background: step === 0 ? 'radial-gradient(circle at 50% 50%, #fecdd3 0%, transparent 50%)' 
                             : step === 1 ? 'radial-gradient(circle at 80% 20%, #bfdbfe 0%, transparent 50%)'
                             : 'radial-gradient(circle at 20% 80%, #bbf7d0 0%, transparent 50%)'
               }}
               transition={{ duration: 1 }}
               className="w-full h-full"
            />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-60 mix-blend-overlay" />
        </div>

        {/* Progress Pill */}
        <div className="absolute top-8 left-0 right-0 z-20 flex justify-center">
            <div className="bg-white/50 backdrop-blur-md p-1 rounded-full flex gap-2 border border-white/50">
                {[0, 1, 2, 3].map(i => (
                    <motion.div 
                        key={i}
                        animate={{ 
                            width: i === step ? 24 : 8,
                            backgroundColor: i <= step ? '#1c1917' : '#e7e5e4'
                        }}
                        className="h-2 rounded-full"
                    />
                ))}
            </div>
        </div>

        {/* Main Content Stage */}
        <div className="relative z-10 w-full h-full max-w-lg mx-auto px-6 py-24 flex flex-col">
            <AnimatePresence custom={direction} mode="wait">
                <motion.div
                    key={step}
                    custom={direction}
                    variants={VARIANTS}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="flex-1"
                >
                    {step === 0 && <SlideWelcome />}
                    {step === 1 && <SlideIdentity />}
                    {step === 2 && <SlideGoals />}
                    {step === 3 && <SlideDiet />}
                </motion.div>
            </AnimatePresence>
        </div>

        {/* Smart Navigation Bar */}
        <div className="absolute bottom-0 left-0 right-0 p-8 z-20 flex justify-between items-center bg-gradient-to-t from-[#F9F8F6] to-transparent">
            <button 
                onClick={prevStep}
                disabled={step === 0}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-opacity ${step === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100 bg-stone-200 text-stone-500'}`}
            >
                <ArrowLeft size={20} />
            </button>

            <button
                onClick={nextStep}
                className={`
                    group relative px-8 py-4 bg-stone-900 text-white rounded-[2rem] font-brutal font-bold uppercase tracking-widest overflow-hidden shadow-xl shadow-stone-300 transition-transform active:scale-95
                    ${step === 1 && !name ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}
                `}
            >
                <span className="relative z-10 flex items-center gap-3">
                    {step === 0 ? "Initialize" : step === 3 ? "Complete" : "Next"}
                    <ChevronRight size={16} />
                </span>
                {/* Liquid Fill Effect on Hover */}
                <div className="absolute inset-0 bg-stone-800 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </button>
        </div>
    </div>
  );
};

export default Onboarding;
