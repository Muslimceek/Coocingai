
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, ReferenceLine 
} from 'recharts';
import { 
  Droplets, Flame, Plus, X, Zap, Moon, Sun, 
  Activity, ArrowUp, ArrowDown, Sparkles, Wind, TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';

// --- TYPES ---
interface ForecastPoint {
  time: string;
  energy: number;
  isProjected: boolean;
}

// --- VISUAL TOKENS ---
const GLASS_PANEL = "bg-white/60 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.04)]";
const NEON_GRADIENT = "bg-gradient-to-br from-stone-900 to-stone-800";

const Tracker: React.FC = () => {
  const { t } = useLanguage();
  const { user, updateUser } = useUser();
  
  // State
  const [showMealModal, setShowMealModal] = useState(false);
  const [mealCals, setMealCals] = useState('');
  const [dragY, setDragY] = useState(0); // For water gesture
  const stats = user.dailyStats;

  // --- 1. METABOLIC FORECAST ENGINE (Innovation) ---
  const forecastData = useMemo(() => {
    const currentHour = new Date().getHours();
    const data: ForecastPoint[] = [];
    
    // Generate past 4 hours
    for (let i = 4; i > 0; i--) {
        data.push({ time: `${currentHour - i}:00`, energy: 60 + Math.random() * 20, isProjected: false });
    }
    // Current state
    const currentEnergy = Math.min(100, (stats.calories / stats.caloriesGoal) * 80 + 20);
    data.push({ time: 'Now', energy: currentEnergy, isProjected: false });

    // Project future (Simple logic: if deficit -> crash, if balanced -> sustain)
    const calRatio = stats.calories / stats.caloriesGoal;
    let projected = currentEnergy;
    
    for (let i = 1; i <= 3; i++) {
        if (calRatio < 0.4) projected -= 15; // Crash
        else if (calRatio > 1.1) projected -= 5; // Sluggish
        else projected -= 2; // Sustain
        
        data.push({ time: `${currentHour + i}:00`, energy: Math.max(10, projected), isProjected: true });
    }
    return data;
  }, [stats.calories, stats.caloriesGoal]);

  // --- 2. WELLNESS ORB LOGIC ---
  const wellnessScore = useMemo(() => {
      let score = 0;
      score += Math.min((stats.waterMl / stats.waterGoalMl) * 40, 40);
      const calRatio = stats.calories / stats.caloriesGoal;
      if (calRatio <= 1.1) score += Math.min(calRatio * 40, 40);
      else score += Math.max(40 - ((calRatio - 1.1) * 50), 0);
      if (stats.mood) score += 20;
      return Math.round(score);
  }, [stats]);

  // --- HANDLERS ---
  const vibrate = (pattern: number | number[] = 10) => { 
      if(navigator.vibrate) navigator.vibrate(pattern); 
  };

  const handleWaterDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      // Sensitivity factor
      const delta = info.delta.y * -5; 
      const newAmount = Math.max(0, stats.waterMl + delta);
      
      // Haptic feedback on increments of 50
      if (Math.floor(newAmount / 50) !== Math.floor(stats.waterMl / 50)) {
          vibrate(5);
      }
      updateUser({ dailyStats: { ...stats, waterMl: newAmount } });
  };

  const handleLogMeal = () => {
    if(!mealCals) return;
    vibrate([10, 30]);
    updateUser({ dailyStats: { ...stats, calories: stats.calories + parseInt(mealCals) } });
    setMealCals('');
    setShowMealModal(false);
  };

  return (
    <div className="min-h-screen pb-36 pt-8 px-4 md:px-6 font-sans relative overflow-x-hidden">
      
      {/* 0. CIRCADIAN LIGHTING OVERLAY */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-gradient-to-b from-rose-50/30 to-blue-50/10 mix-blend-overlay" />

      {/* 1. HEADER: BIO-METRIC SCORE */}
      <div className="flex justify-between items-end mb-8 relative z-10">
          <div>
              <div className="flex items-center gap-2 mb-1">
                  <Activity size={14} className="text-rose-500 animate-pulse" />
                  <span className="text-[10px] font-brutal font-black text-rose-500 uppercase tracking-[0.2em]">
                      Bio-Metric Status
                  </span>
              </div>
              <h1 className="text-4xl font-editorial italic text-stone-900 leading-[0.9]">
                  {wellnessScore >= 80 ? "Optimal State" : wellnessScore >= 50 ? "Balanced" : "Recovery Mode"}
              </h1>
          </div>
          
          {/* Holographic Orb */}
          <div className="relative group cursor-pointer">
              <div className={`w-16 h-16 rounded-full blur-2xl absolute inset-0 ${wellnessScore >= 80 ? 'bg-emerald-400' : 'bg-amber-400'} opacity-40 animate-pulse`} />
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/50 flex items-center justify-center relative shadow-lg overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/40 to-transparent opacity-50" />
                  <span className="text-xl font-bold font-brutal text-stone-900 relative z-10">{wellnessScore}</span>
                  {/* Liquid Fill */}
                  <div 
                    className={`absolute bottom-0 left-0 right-0 transition-all duration-1000 ${wellnessScore >= 80 ? 'bg-emerald-400' : 'bg-amber-400'} opacity-20`}
                    style={{ height: `${wellnessScore}%` }}
                  />
              </div>
          </div>
      </div>

      {/* 2. SPATIAL BENTO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 relative z-10">
          
          {/* A. CALORIE FURNACE (Interactive Ring) */}
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className={`md:col-span-7 h-[360px] rounded-[2.5rem] p-8 relative overflow-hidden text-white flex flex-col justify-between shadow-2xl ${NEON_GRADIENT}`}
          >
              {/* Animated Background Noise */}
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
              
              <div className="flex justify-between items-start z-10">
                  <div>
                      <span className="block text-[10px] font-brutal font-bold text-stone-400 uppercase tracking-widest mb-1">Metabolic Rate</span>
                      <div className="flex items-baseline gap-1">
                          <span className="text-5xl font-editorial italic">{stats.calories}</span>
                          <span className="text-sm font-bold text-stone-500">/ {stats.caloriesGoal} kcal</span>
                      </div>
                  </div>
                  <button onClick={() => setShowMealModal(true)} className="w-12 h-12 bg-rose-500 rounded-full flex items-center justify-center hover:bg-rose-400 transition shadow-lg shadow-rose-500/30 group">
                      <Plus className="group-hover:rotate-90 transition-transform" />
                  </button>
              </div>

              {/* The "Ring of Fire" Viz */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] pointer-events-none">
                  <svg className="w-full h-full transform -rotate-90">
                      {/* Track */}
                      <circle cx="140" cy="140" r="100" stroke="#333" strokeWidth="2" fill="none" strokeDasharray="4 4" />
                      {/* Active Arc */}
                      <motion.circle 
                          cx="140" cy="140" r="100" 
                          stroke="url(#fireGradient)" 
                          strokeWidth="16" 
                          fill="none" 
                          strokeDasharray={2 * Math.PI * 100}
                          initial={{ strokeDashoffset: 2 * Math.PI * 100 }}
                          animate={{ strokeDashoffset: 2 * Math.PI * 100 - ((stats.calories / stats.caloriesGoal) * 2 * Math.PI * 100) }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          strokeLinecap="round"
                          className="filter drop-shadow-[0_0_10px_rgba(244,63,94,0.6)]"
                      />
                      <defs>
                          <linearGradient id="fireGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#fbbf24" />
                              <stop offset="50%" stopColor="#f43f5e" />
                              <stop offset="100%" stopColor="#9f1239" />
                          </linearGradient>
                      </defs>
                  </svg>
                  {/* Inner Hologram */}
                  <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-40 h-40 bg-gradient-to-t from-rose-500/20 to-transparent rounded-full blur-2xl animate-pulse" />
                  </div>
              </div>

              <div className="z-10 bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/5 flex items-center gap-3">
                  <div className="p-2 bg-stone-800 rounded-full text-amber-400">
                      <TrendingUp size={16} />
                  </div>
                  <div>
                       <span className="block text-[10px] uppercase text-stone-400 font-bold">AI Forecast</span>
                       <span className="text-xs font-medium text-stone-200">
                           {stats.calories < stats.caloriesGoal * 0.4 ? "Energy crash predicted at 3PM. Refuel now." : "Energy levels sustainable."}
                       </span>
                  </div>
              </div>
          </motion.div>

          {/* B. HYDRO FLUX (Gesture Input) */}
          <motion.div 
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.05}
            onDrag={handleWaterDrag}
            whileHover={{ scale: 1.01 }}
            className={`md:col-span-5 h-[360px] rounded-[2.5rem] relative overflow-hidden shadow-xl border border-blue-100 bg-white group cursor-ns-resize select-none`}
          >
              <div className="absolute inset-0 pointer-events-none">
                  {/* Liquid Level */}
                  <motion.div 
                      className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500 to-cyan-400 transition-all duration-300 ease-linear"
                      style={{ height: `${Math.min((stats.waterMl / stats.waterGoalMl) * 100, 100)}%` }}
                  >
                      {/* Wave SVG */}
                      <div className="absolute top-0 left-0 right-0 -translate-y-[98%] w-full overflow-hidden leading-none">
                          <svg className="relative block w-[200%] h-[40px] animate-wave" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                              <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="#22d3ee" fillOpacity="0.5"></path>
                          </svg>
                      </div>
                  </motion.div>
              </div>
              
              <div className="absolute inset-0 z-20 p-8 flex flex-col justify-between pointer-events-none">
                  <div className="flex justify-between items-start">
                       <div>
                           <span className="text-[10px] font-brutal font-bold text-stone-400 uppercase tracking-widest">Hydration</span>
                           <h3 className="text-4xl font-editorial italic text-stone-900">
                               {(stats.waterMl / 1000).toFixed(1)}L
                           </h3>
                       </div>
                       <Droplets className="text-blue-500" />
                  </div>
                  
                  <div className="flex flex-col items-center gap-2 opacity-50">
                      <ArrowUp size={16} className="text-stone-400 animate-bounce" />
                      <span className="text-[9px] font-bold uppercase tracking-widest text-stone-400">Drag to Fill</span>
                  </div>
              </div>

              {/* Glass Overlay effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none mix-blend-overlay" />
          </motion.div>

          {/* C. METABOLIC PROJECTION (Chart) */}
          <div className="col-span-1 md:col-span-12 h-64 rounded-[2.5rem] p-6 relative overflow-hidden shadow-sm border border-stone-200 bg-white/80 backdrop-blur-xl">
               <div className="flex items-center gap-3 mb-4">
                   <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                       <Zap size={16} fill="currentColor" />
                   </div>
                   <h3 className="font-editorial italic text-xl text-stone-900">Energy Forecast</h3>
               </div>
               
               <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={forecastData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                       <defs>
                           <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                               <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                           </linearGradient>
                       </defs>
                       <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#a8a29e' }} />
                       <Tooltip 
                          contentStyle={{ backgroundColor: '#1c1917', border: 'none', borderRadius: '12px', color: '#fff' }}
                          itemStyle={{ color: '#fff' }}
                       />
                       <Area 
                          type="monotone" 
                          dataKey="energy" 
                          stroke="#10b981" 
                          strokeWidth={3} 
                          fillOpacity={1} 
                          fill="url(#energyGradient)" 
                       />
                       {/* Forecast divider */}
                       <ReferenceLine x="Now" stroke="#fbbf24" strokeDasharray="3 3" />
                   </AreaChart>
               </ResponsiveContainer>
          </div>

      </div>

      {/* 3. LOG MEAL PORTAL */}
      {createPortal(
        <AnimatePresence>
            {showMealModal && (
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center sm:p-4 bg-stone-900/60 backdrop-blur-sm"
                    onClick={() => setShowMealModal(false)}
                >
                    <motion.div 
                        initial={{ y: "100%", scale: 0.9 }} animate={{ y: 0, scale: 1 }} exit={{ y: "100%", scale: 0.9 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-[#F9F8F6] w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-rose-400 via-orange-400 to-amber-400" />
                        
                        <div className="flex justify-between items-center mb-10">
                            <h3 className="text-3xl font-editorial italic text-stone-900">Fuel Input</h3>
                            <button onClick={() => setShowMealModal(false)} className="w-10 h-10 bg-stone-200 rounded-full flex items-center justify-center hover:bg-stone-300 transition">
                                <X size={20} className="text-stone-600" />
                            </button>
                        </div>
                        
                        <div className="relative mb-8">
                            <input 
                                type="number" 
                                value={mealCals}
                                onChange={(e) => setMealCals(e.target.value)}
                                placeholder="0"
                                className="w-full text-center text-7xl font-editorial italic bg-transparent border-none outline-none text-stone-900 placeholder:text-stone-200"
                                autoFocus
                            />
                            <span className="block text-center text-xs font-bold uppercase tracking-widest text-stone-400 mt-2">kcal</span>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-8">
                            {[100, 300, 500].map(val => (
                                <button 
                                   key={val}
                                   onClick={() => { vibrate(); setMealCals(val.toString()) }}
                                   className="py-3 bg-white border border-stone-200 rounded-xl font-bold text-stone-600 shadow-sm hover:border-rose-400 hover:text-rose-500 transition-colors"
                                >
                                    +{val}
                                </button>
                            ))}
                        </div>

                        <button 
                            onClick={handleLogMeal}
                            disabled={!mealCals}
                            className="w-full py-5 bg-stone-900 text-white rounded-[1.5rem] font-bold text-lg shadow-xl shadow-stone-900/20 disabled:opacity-50 hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            Log Intake
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
      )}

      {/* CSS for custom animations */}
      <style>{`
        @keyframes wave {
          0% { transform: translateX(0) translateZ(0) scaleY(1) }
          50% { transform: translateX(-25%) translateZ(0) scaleY(0.8) }
          100% { transform: translateX(-50%) translateZ(0) scaleY(1) }
        }
        .animate-wave {
          animation: wave 10s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Tracker;
