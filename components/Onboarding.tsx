import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';

interface OnboardingProps {
  onComplete: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const { t } = useLanguage();
  const { updateUser } = useUser();
  const [step, setStep] = useState(0);

  // Data Collection State
  const [name, setName] = useState('');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedDiet, setSelectedDiet] = useState<string[]>([]);

  // 0-3: Story, 4: Name, 5: Goals, 6: Diet
  const TOTAL_STEPS = 7;

  // Dynamic Background Gradient based on step
  const getGradientColor = (s: number) => {
    if (s === 0) return 'bg-rose-600'; // Welcome (Passion)
    if (s === 1) return 'bg-orange-500'; // Kitchen (Warmth)
    if (s === 2) return 'bg-emerald-600'; // Health (Vitality)
    if (s === 3) return 'bg-blue-600'; // Community (Trust)
    if (s === 4) return 'bg-purple-600'; // Name (Identity)
    if (s === 5) return 'bg-amber-500'; // Goals (Energy)
    return 'bg-teal-500'; // Diet (Balance)
  };

  const handleVibrate = () => {
    if (navigator.vibrate) navigator.vibrate(10);
  };

  const toggleGoal = (goal: string) => {
    handleVibrate();
    setSelectedGoals(prev => 
      prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
    );
  };

  const toggleDiet = (diet: string) => {
    handleVibrate();
    setSelectedDiet(prev => 
      prev.includes(diet) ? prev.filter(d => d !== diet) : [...prev, diet]
    );
  };

  const handleNext = () => {
    handleVibrate();
    if (step === 4 && !name.trim()) return;

    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
    } else {
      finishOnboarding();
    }
  };

  const finishOnboarding = () => {
    updateUser({
      name: name || 'Guest',
      goals: selectedGoals,
      dietaryPreferences: selectedDiet,
      hasCompletedOnboarding: true
    });
    onComplete();
  };

  // --- RENDERERS ---

  const renderStoryStep = (title: string, sub: string) => (
    <div className="flex flex-col justify-center h-full animate-in slide-in-from-bottom-10 fade-in duration-1000">
       <h1 className="text-6xl md:text-7xl font-editorial italic text-white leading-[0.9] tracking-tighter mb-8">
          {title}
       </h1>
       <div className="h-px w-24 bg-white/30 mb-8"></div>
       <p className="text-xl md:text-2xl font-light text-white/70 max-w-sm leading-relaxed">
          {sub}
       </p>
    </div>
  );

  const renderNameStep = () => (
    <div className="flex flex-col justify-center h-full animate-in slide-in-from-bottom-10 fade-in duration-700">
        <h2 className="text-sm font-brutal font-bold text-white/50 uppercase tracking-[0.2em] mb-4">
           {t('onb_q_name_title')}
        </h2>
        <h1 className="text-5xl font-editorial italic text-white mb-12">
           {t('onb_q_name_desc')}
        </h1>
        <input 
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('onb_q_name_placeholder')}
            className="w-full bg-transparent border-b border-white/30 py-4 text-4xl text-white font-brutal placeholder:text-white/20 focus:outline-none focus:border-white transition-colors"
            autoFocus
        />
    </div>
  );

  const renderSelectionStep = (
    title: string, 
    desc: string, 
    options: {key: string, label: string}[], 
    selected: string[], 
    toggle: (k: string) => void
  ) => (
    <div className="flex flex-col justify-center h-full animate-in slide-in-from-bottom-10 fade-in duration-700">
        <h2 className="text-sm font-brutal font-bold text-white/50 uppercase tracking-[0.2em] mb-4">
            Identity
        </h2>
        <h1 className="text-4xl md:text-5xl font-editorial italic text-white mb-4 leading-none">
            {title}
        </h1>
        <p className="text-white/60 mb-10">{desc}</p>
        
        <div className="flex flex-wrap gap-3">
            {options.map(opt => {
                const isActive = selected.includes(opt.key);
                return (
                    <button
                        key={opt.key}
                        onClick={() => toggle(opt.key)}
                        className={`px-6 py-4 rounded-full border transition-all duration-300 backdrop-blur-md ${
                            isActive 
                            ? 'bg-white text-black border-white scale-105 shadow-[0_0_30px_rgba(255,255,255,0.3)]' 
                            : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
                        }`}
                    >
                        <span className="text-sm font-brutal font-bold uppercase tracking-widest">{opt.label}</span>
                    </button>
                )
            })}
        </div>
    </div>
  );

  const getStepContent = () => {
      switch(step) {
          case 0: return renderStoryStep("Sensory Nutrition.", t('onb_welcome_desc'));
          case 1: return renderStoryStep("Smart Kitchen.", t('onb_fridge_desc'));
          case 2: return renderStoryStep("Body & Mind.", t('onb_tracker_desc'));
          case 3: return renderStoryStep("Collective Energy.", t('onb_chef_desc'));
          case 4: return renderNameStep();
          case 5: return renderSelectionStep(
              t('onb_q_goals_title'),
              t('onb_q_goals_desc'),
              [
                { key: 'Weight Loss', label: t('goal_weight') },
                { key: 'Energy', label: t('goal_energy') },
                { key: 'Save Time', label: t('goal_time') },
                { key: 'Cooking Skills', label: t('goal_skills') },
              ],
              selectedGoals,
              toggleGoal
          );
          case 6: return renderSelectionStep(
              t('onb_q_diet_title'),
              t('onb_q_diet_desc'),
              [
                { key: 'None', label: t('diet_none') },
                { key: 'Vegetarian', label: t('diet_veg') },
                { key: 'Vegan', label: t('diet_vegan') },
                { key: 'Keto', label: t('diet_keto') },
                { key: 'Gluten Free', label: t('diet_gluten') },
              ],
              selectedDiet,
              toggleDiet
          );
          default: return null;
      }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0a] text-white overflow-hidden font-sans">
      
      {/* 1. ATMOSPHERE: Dynamic Mesh Gradient Background */}
      <div className="absolute inset-0 opacity-40 transition-colors duration-1000 ease-in-out">
        <div className={`absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full blur-[150px] transition-colors duration-1000 ${getGradientColor(step)}`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] opacity-60 bg-indigo-900`} />
      </div>

      {/* 2. TEXTURE: Noise Overlay for "Tactile" feel */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      <div className="relative z-10 h-full flex flex-col p-6 md:p-12">
        
        {/* 3. NAVIGATION HEADER */}
        <header className="flex justify-between items-center mb-8">
            {/* Liquid Progress Bar */}
            <div className="h-1.5 w-24 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
                <div 
                    className="h-full bg-white transition-all duration-700 ease-out shadow-[0_0_10px_rgba(255,255,255,0.5)]" 
                    style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
                />
            </div>

            {step < 4 && (
                <button 
                    onClick={() => setStep(4)} 
                    className="text-[10px] font-brutal font-black uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors"
                >
                    Skip Story
                </button>
            )}
        </header>

        {/* 4. BACKGROUND GIANT NUMBER (Parallax feel) */}
        <div className="absolute top-24 left-[-20px] text-[14rem] font-brutal font-black text-white/[0.03] select-none leading-none pointer-events-none">
            0{step + 1}
        </div>

        {/* 5. MAIN CONTENT AREA */}
        <main className="flex-1 relative">
            {getStepContent()}
        </main>

        {/* 6. FOOTER CONTROLS (Thumb-Friendly Pill) */}
        <footer className="mt-8">
            <button 
                onClick={handleNext}
                disabled={step === 4 && !name.trim()}
                className={`group relative w-full h-20 rounded-full overflow-hidden transition-all duration-300 transform active:scale-95 ${
                    step === 4 && !name.trim() ? 'opacity-50 cursor-not-allowed' : 'opacity-100'
                }`}
            >
                {/* Background Fill Animation */}
                <div className={`absolute inset-0 transition-colors duration-500 ${step === 4 && !name.trim() ? 'bg-white/10' : 'bg-white'}`} />
                <div className={`absolute inset-0 bg-gradient-to-r from-rose-500 to-orange-500 translate-y-full group-hover:translate-y-0 transition-transform duration-500 opacity-90`} />

                {/* Text Content */}
                <div className="relative z-10 flex items-center justify-between px-8 h-full">
                    <span className={`text-sm font-brutal font-black uppercase tracking-[0.2em] ${step === 4 && !name.trim() ? 'text-white/50' : 'text-black group-hover:text-white transition-colors'}`}>
                        {step === TOTAL_STEPS - 1 ? 'Start Journey' : 'Continue'}
                    </span>
                    <span className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${step === 4 && !name.trim() ? 'bg-white/10 text-white/50' : 'bg-black text-white group-hover:bg-white group-hover:text-black'}`}>
                         {step === TOTAL_STEPS - 1 ? <Sparkles size={18} /> : <ArrowRight size={18} />}
                    </span>
                </div>
            </button>
        </footer>

      </div>
    </div>
  );
};

export default Onboarding;