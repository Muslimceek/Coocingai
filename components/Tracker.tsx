
import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Droplets, Flame, Plus, X, Zap, Moon, Sun, Coffee, Utensils, Activity, ArrowUp, ArrowDown, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DailyStats } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';

// Mock data for graphs (would ideally come from user.history)
const WEEKLY_DATA = [
  { day: 'M', cal: 1800, water: 1.5 },
  { day: 'T', cal: 1950, water: 2.0 },
  { day: 'W', cal: 1700, water: 1.8 },
  { day: 'T', cal: 2100, water: 2.2 },
  { day: 'F', cal: 1600, water: 1.6 },
  { day: 'S', cal: 2300, water: 2.5 },
  { day: 'S', cal: 1900, water: 2.0 },
];

const Tracker: React.FC = () => {
  const { t } = useLanguage();
  const { user, updateUser } = useUser();
  const [showMealModal, setShowMealModal] = useState(false);
  const [mealType, setMealType] = useState('Lunch');
  const [mealCals, setMealCals] = useState('');

  const stats = user.dailyStats;

  // --- Logic: Wellness Score Calculation ---
  const wellnessScore = useMemo(() => {
      let score = 0;
      // Water (max 40 pts)
      score += Math.min((stats.waterMl / stats.waterGoalMl) * 40, 40);
      // Calories (max 40 pts) - penalize if over significantly, simplified here
      const calRatio = stats.calories / stats.caloriesGoal;
      if (calRatio <= 1.1) score += Math.min(calRatio * 40, 40);
      else score += Math.max(40 - ((calRatio - 1.1) * 50), 0);
      // Mood (max 20 pts)
      if (stats.mood) score += 20;
      
      return Math.round(score);
  }, [stats]);

  // --- Handlers ---
  const vibrate = () => { if(navigator.vibrate) navigator.vibrate(10); }

  const handleAddWater = (amount: number) => {
    vibrate();
    updateUser({ dailyStats: { ...stats, waterMl: stats.waterMl + amount } });
  };

  const handleLogMeal = () => {
    if(!mealCals) return;
    vibrate();
    updateUser({ dailyStats: { ...stats, calories: stats.calories + parseInt(mealCals) } });
    setMealCals('');
    setShowMealModal(false);
  };

  const handleMood = (mood: DailyStats['mood']) => {
      vibrate();
      updateUser({ dailyStats: { ...stats, mood } });
  };

  // --- Visual Helpers ---
  const waterFillHeight = Math.min((stats.waterMl / stats.waterGoalMl) * 100, 100);
  const calPercentage = Math.min((stats.calories / stats.caloriesGoal) * 100, 100);
  const circumference = 2 * Math.PI * 52; // for radius 52
  const strokeDashoffset = circumference - (calPercentage / 100) * circumference;

  return (
    <div className="min-h-screen pb-32 pt-6 px-4 md:px-6 animate-in fade-in duration-500 font-sans">
      
      {/* 1. HEADER: WELLNESS SCORE */}
      <div className="flex justify-between items-end mb-6">
          <div>
              <span className="text-[10px] font-brutal font-black text-rose-500 uppercase tracking-[0.2em] mb-1">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric' })}
              </span>
              <h1 className="text-4xl font-editorial italic text-stone-900 leading-[0.9]">
                  {t('tracker_daily_wellness')}
              </h1>
          </div>
          <div className="bg-white border border-stone-200 rounded-[2rem] px-5 py-2 flex items-center gap-3 shadow-sm">
             <div className="flex flex-col items-end">
                 <span className="text-[9px] font-brutal font-bold text-stone-400 uppercase tracking-wider">Score</span>
                 <span className={`text-2xl font-bold leading-none ${wellnessScore >= 80 ? 'text-emerald-500' : wellnessScore >= 50 ? 'text-amber-500' : 'text-stone-900'}`}>
                     {wellnessScore}
                 </span>
             </div>
             <div className="w-10 h-10 relative">
                 <svg className="w-full h-full transform -rotate-90">
                     <circle cx="20" cy="20" r="16" stroke="#f5f5f4" strokeWidth="4" fill="none" />
                     <circle cx="20" cy="20" r="16" stroke={wellnessScore >= 80 ? '#10b981' : wellnessScore >= 50 ? '#f59e0b' : '#1c1917'} strokeWidth="4" fill="none" strokeDasharray="100" strokeDashoffset={100 - wellnessScore} strokeLinecap="round" />
                 </svg>
             </div>
          </div>
      </div>

      {/* 2. BENTO GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          
          {/* A. CALORIE RADIAL CARD (Large Square) */}
          <div className="col-span-2 md:col-span-1 bg-stone-900 text-white rounded-[2.5rem] p-6 relative overflow-hidden flex flex-col justify-between h-[340px] shadow-2xl">
              <div className="flex justify-between items-start z-10">
                  <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-brutal font-bold uppercase tracking-widest border border-white/10">
                      {t('tracker_energy')}
                  </span>
                  <button onClick={() => setShowMealModal(true)} className="w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform text-white shadow-lg shadow-rose-900/50">
                      <Plus size={20} />
                  </button>
              </div>

              {/* Radial Progress */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 flex items-center justify-center">
                  {/* Background Circle */}
                  <svg className="w-full h-full transform -rotate-90 drop-shadow-2xl">
                      <circle cx="96" cy="96" r="88" stroke="#333" strokeWidth="12" fill="none" />
                      <circle 
                          cx="96" cy="96" r="88" 
                          stroke="url(#gradientCal)" 
                          strokeWidth="12" 
                          fill="none" 
                          strokeDasharray={circumference} 
                          strokeDashoffset={strokeDashoffset} 
                          strokeLinecap="round"
                          className="transition-all duration-1000 ease-out"
                      />
                      <defs>
                          <linearGradient id="gradientCal" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#f43f5e" />
                              <stop offset="100%" stopColor="#fbbf24" />
                          </linearGradient>
                      </defs>
                  </svg>
                  <div className="absolute flex flex-col items-center">
                      <Flame size={24} className="text-rose-500 mb-1 animate-pulse" />
                      <span className="text-4xl font-editorial italic font-bold">{stats.calories}</span>
                      <span className="text-xs text-stone-500 font-bold">/ {stats.caloriesGoal}</span>
                  </div>
              </div>

              <div className="z-10 mt-auto">
                 <p className="text-stone-400 text-xs font-medium text-center">{Math.round(stats.caloriesGoal - stats.calories)} kcal remaining</p>
              </div>
          </div>

          {/* B. WATER TANK (Tall vertical on mobile) */}
          <div className="col-span-1 md:col-span-1 bg-white rounded-[2.5rem] relative overflow-hidden h-[340px] shadow-sm border border-stone-100 group">
               {/* Content Layer */}
               <div className="absolute inset-0 z-20 p-5 flex flex-col justify-between pointer-events-none">
                    <div className="flex justify-between items-start">
                         <span className="bg-blue-50/80 backdrop-blur-sm text-blue-600 px-3 py-1 rounded-full text-[10px] font-brutal font-bold uppercase tracking-widest">
                            H2O
                         </span>
                    </div>
                    <div>
                        <h3 className="text-4xl font-editorial italic text-stone-900">
                           {(stats.waterMl / 1000).toFixed(1)}<span className="text-lg text-stone-400 not-italic font-sans font-bold">L</span>
                        </h3>
                        <p className="text-[10px] font-brutal font-bold text-stone-400 uppercase tracking-widest">Goal: {(stats.waterGoalMl / 1000).toFixed(1)}L</p>
                    </div>
               </div>

               {/* Interaction Layer (Buttons) */}
               <div className="absolute bottom-4 right-4 z-30 flex flex-col gap-2">
                   <button onClick={() => handleAddWater(250)} className="w-10 h-10 bg-white/50 backdrop-blur-md border border-white/50 rounded-full flex items-center justify-center text-blue-600 hover:bg-white hover:scale-110 transition-all shadow-sm">
                       <Plus size={16} />
                   </button>
               </div>

               {/* LIQUID ANIMATION */}
               <div className="absolute bottom-0 left-0 w-full bg-blue-50 transition-all duration-1000 ease-in-out" style={{ height: `${waterFillHeight}%` }}>
                   <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-300 to-cyan-300 opacity-50" />
                   {/* Bubbles */}
                   <motion.div 
                      animate={{ y: [0, -200], opacity: [0, 1, 0] }}
                      transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                      className="absolute bottom-0 left-1/4 w-2 h-2 bg-blue-200 rounded-full"
                   />
                   <motion.div 
                      animate={{ y: [0, -150], opacity: [0, 1, 0] }}
                      transition={{ repeat: Infinity, duration: 4, delay: 1, ease: "linear" }}
                      className="absolute bottom-0 left-3/4 w-3 h-3 bg-blue-200 rounded-full"
                   />
               </div>
               
               {/* Background Water Icon */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03]">
                   <Droplets size={140} />
               </div>
          </div>

          {/* C. RIGHT COLUMN STACK */}
          <div className="col-span-1 md:col-span-1 flex flex-col gap-3 h-[340px]">
              
              {/* Mood Aura Selector */}
              <div className="flex-1 bg-white rounded-[2.5rem] p-5 shadow-sm border border-stone-100 flex flex-col relative overflow-hidden">
                  <span className="text-[10px] font-brutal font-bold text-stone-400 uppercase tracking-widest mb-3 z-10">{t('filter_mood')}</span>
                  
                  <div className="flex-1 flex flex-col items-center justify-center gap-3 z-10">
                      {stats.mood ? (
                         <div className="text-center">
                             <div className={`w-16 h-16 rounded-full blur-xl mb-2 animate-pulse ${
                                 stats.mood === 'great' ? 'bg-amber-400' : 
                                 stats.mood === 'good' ? 'bg-emerald-400' :
                                 stats.mood === 'stressed' ? 'bg-rose-500' : 'bg-blue-400'
                             }`} />
                             <span className="font-editorial italic text-xl capitalize">{stats.mood}</span>
                         </div>
                      ) : (
                          <span className="text-xs text-stone-400 text-center">How do you feel?</span>
                      )}
                  </div>

                  {/* Aura Selection Row */}
                  <div className="flex justify-between items-center gap-1 z-20">
                      {[
                          { k: 'great', c: 'bg-amber-400' },
                          { k: 'good', c: 'bg-emerald-400' },
                          { k: 'tired', c: 'bg-indigo-400' },
                          { k: 'stressed', c: 'bg-rose-500' }
                      ].map(m => (
                          <button 
                            key={m.k} 
                            onClick={() => handleMood(m.k as any)}
                            className={`w-8 h-8 rounded-full border-2 border-white shadow-sm transition-transform hover:scale-125 ${m.c} ${stats.mood === m.k ? 'ring-2 ring-stone-900 ring-offset-2' : ''}`}
                          />
                      ))}
                  </div>
              </div>

              {/* Weight Sparkline */}
              <div className="flex-1 bg-[#F5F5F4] rounded-[2.5rem] p-5 flex flex-col justify-between relative overflow-hidden">
                  <div className="flex justify-between items-start z-10">
                      <span className="text-[10px] font-brutal font-bold text-stone-400 uppercase tracking-widest">{t('profile_kg_curr')}</span>
                      <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
                          <ArrowDown size={12} /> 0.4
                      </div>
                  </div>
                  <div className="z-10">
                      <span className="text-3xl font-editorial italic text-stone-900">{stats.weight || 64.5}</span>
                      <span className="text-sm text-stone-500 font-bold ml-1">kg</span>
                  </div>
                  {/* Decor Line Chart */}
                  <div className="absolute bottom-0 left-0 right-0 h-16 opacity-50">
                      <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={[{v:65}, {v:64.8}, {v:64.9}, {v:64.5}, {v:64.2}, {v:64.5}]}>
                              <defs>
                                  <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#1c1917" stopOpacity={0.1}/>
                                      <stop offset="95%" stopColor="#1c1917" stopOpacity={0}/>
                                  </linearGradient>
                              </defs>
                              <Area type="monotone" dataKey="v" stroke="#1c1917" strokeWidth={2} fill="url(#colorWeight)" />
                          </AreaChart>
                      </ResponsiveContainer>
                  </div>
              </div>
          </div>

          {/* D. WEEKLY RHYTHM (Wide) */}
          <div className="col-span-2 bg-white rounded-[2.5rem] p-6 shadow-sm border border-stone-100">
               <div className="flex items-center justify-between mb-4">
                   <div className="flex items-center gap-2">
                       <Activity size={18} className="text-stone-400" />
                       <h3 className="text-sm font-brutal font-bold uppercase tracking-widest text-stone-900">{t('tracker_weekly_rhythm')}</h3>
                   </div>
                   <div className="flex gap-2">
                       <span className="flex items-center gap-1 text-[10px] font-bold text-stone-400"><div className="w-2 h-2 rounded-full bg-stone-900" /> Cals</span>
                       <span className="flex items-center gap-1 text-[10px] font-bold text-stone-400"><div className="w-2 h-2 rounded-full bg-blue-400" /> Water</span>
                   </div>
               </div>
               <div className="h-32 w-full">
                   <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={WEEKLY_DATA} barGap={4}>
                           <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#a8a29e', fontWeight: 'bold'}} dy={10} />
                           <Tooltip 
                              cursor={{fill: '#f5f5f4', radius: 8}}
                              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', padding: '12px' }}
                              labelStyle={{ display: 'none' }}
                           />
                           <Bar dataKey="cal" fill="#1c1917" radius={[4, 4, 4, 4]} barSize={12} />
                           <Bar dataKey="water" fill="#60a5fa" radius={[4, 4, 4, 4]} barSize={12} />
                       </BarChart>
                   </ResponsiveContainer>
               </div>
          </div>

      </div>

      {/* 3. LOG MEAL MODAL (PORTALED) */}
      {createPortal(
        <AnimatePresence>
            {showMealModal && (
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center sm:p-4 bg-stone-900/60 backdrop-blur-sm font-sans"
                    onClick={() => setShowMealModal(false)}
                >
                    <motion.div 
                        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-[#F9F8F6] w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 shadow-2xl"
                    >
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-2xl font-editorial italic text-stone-900 flex items-center gap-2">
                            <Utensils size={24} className="text-rose-500" />
                            {t('tracker_log_meal_title')}
                        </h3>
                        <button onClick={() => setShowMealModal(false)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-stone-500">
                            <X size={20} />
                        </button>
                    </div>
                    
                    <div className="space-y-6">
                        {/* Meal Type Selector */}
                        <div className="grid grid-cols-4 gap-2">
                            {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map(type => (
                                <button 
                                    key={type} 
                                    onClick={() => { vibrate(); setMealType(type); }}
                                    className={`py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all ${
                                        mealType === type 
                                        ? 'bg-stone-900 text-white border-stone-900 shadow-lg scale-105' 
                                        : 'bg-white border-stone-200 text-stone-400'
                                    }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                        
                        {/* Numeric Input */}
                        <div className="relative bg-white rounded-[2rem] p-4 shadow-inner border border-stone-100 flex items-center justify-center h-32">
                            <input 
                            type="number" 
                            value={mealCals} 
                            onChange={(e) => setMealCals(e.target.value)}
                            className="w-full bg-transparent border-none outline-none text-6xl font-editorial italic text-stone-900 text-center placeholder:text-stone-200"
                            placeholder="0" 
                            autoFocus
                            />
                            <span className="absolute bottom-4 text-xs font-brutal font-bold text-stone-400 uppercase tracking-widest">calories</span>
                        </div>

                        <button 
                            onClick={handleLogMeal} 
                            disabled={!mealCals} 
                            className="w-full bg-rose-500 text-white py-5 rounded-[1.5rem] font-bold text-lg hover:bg-rose-600 active:scale-95 transition-all shadow-xl shadow-rose-200/50 disabled:opacity-50 disabled:shadow-none"
                        >
                            {t('tracker_add_to_log')}
                        </button>
                    </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
      )}

    </div>
  );
};

export default Tracker;
