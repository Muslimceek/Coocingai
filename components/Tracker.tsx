
import React, { useState } from 'react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Droplets, Flame, Plus, X, Smile, Frown, Meh, Zap, Moon, Sun, Coffee, Utensils } from 'lucide-react';
import { TrackerData, DailyStats } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';

const historicalData: TrackerData[] = [
  { day: 'M', water: 1.5, calories: 1800 },
  { day: 'T', water: 2.0, calories: 1950 },
  { day: 'W', water: 1.8, calories: 1700 },
  { day: 'T', water: 2.2, calories: 2100 },
  { day: 'F', water: 1.6, calories: 1600 },
  { day: 'S', water: 2.5, calories: 2300 },
  { day: 'S', water: 2.0, calories: 1900 },
];

const Tracker: React.FC = () => {
  const { t } = useLanguage();
  const { user, updateUser } = useUser();
  const [showMealModal, setShowMealModal] = useState(false);
  const [mealType, setMealType] = useState('Lunch');
  const [mealCals, setMealCals] = useState('');

  const stats = user.dailyStats;
  const waterPercentage = Math.min((stats.waterMl / stats.waterGoalMl) * 100, 100);
  const caloriePercentage = Math.min((stats.calories / stats.caloriesGoal) * 100, 100);

  const handleAddWater = (amount: number) => {
    updateUser({ dailyStats: { ...stats, waterMl: stats.waterMl + amount } });
  };

  const handleLogMeal = () => {
    if(!mealCals) return;
    updateUser({ dailyStats: { ...stats, calories: stats.calories + parseInt(mealCals) } });
    setMealCals('');
    setShowMealModal(false);
  };

  return (
    <div className="pb-24 pt-6 px-4 md:px-8 max-w-4xl mx-auto animate-in fade-in duration-500">
      
      {/* Editorial Header */}
      <div className="mb-10 px-2">
        <h2 className="text-xs font-brutal font-bold uppercase tracking-[0.2em] text-stone-400 mb-2">{t('tracker_daily_wellness')}</h2>
        <h1 className="text-5xl font-editorial italic text-stone-900 leading-none">
          {t('tracker_body_soul')}
        </h1>
      </div>

      {/* LIQUID CARDS GRID */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        
        {/* Hydration - Liquid Blue */}
        <div className="relative overflow-hidden bg-white rounded-[2.5rem] p-8 shadow-sm border border-stone-100 group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
             <Droplets size={120} className="text-blue-500 rotate-12" />
          </div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
                <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-brutal font-bold uppercase tracking-widest">{t('tracker_hydration')}</span>
            </div>
            
            <div className="flex items-baseline gap-1 mb-8">
               <h3 className="text-6xl font-editorial italic text-stone-900">{(stats.waterMl / 1000).toFixed(1)}</h3>
               <span className="text-lg font-brutal font-bold text-stone-400">/ {(stats.waterGoalMl / 1000).toFixed(1)}L</span>
            </div>

            {/* Liquid Bar */}
            <div className="h-4 bg-stone-100 rounded-full overflow-hidden mb-6 border border-stone-200/50">
               <div className="h-full bg-gradient-to-r from-blue-400 to-cyan-300 rounded-full transition-all duration-1000 ease-out" style={{ width: `${waterPercentage}%` }} />
            </div>

            <div className="flex gap-2">
               <button onClick={() => handleAddWater(250)} className="flex-1 py-3 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-2xl font-bold text-xs transition">+ 250ml</button>
            </div>
          </div>
        </div>

        {/* Calories - Liquid Rose */}
        <div className="relative overflow-hidden bg-stone-900 rounded-[2.5rem] p-8 shadow-xl text-white group">
           <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
             <Flame size={120} className="text-rose-500 -rotate-12" />
          </div>

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
                <span className="bg-white/10 backdrop-blur-md text-rose-300 px-3 py-1 rounded-full text-[10px] font-brutal font-bold uppercase tracking-widest border border-white/10">{t('tracker_energy')}</span>
            </div>
            
            <div className="flex items-baseline gap-1 mb-8">
               <h3 className="text-6xl font-editorial italic text-white">{stats.calories}</h3>
               <span className="text-lg font-brutal font-bold text-stone-500">/ {stats.caloriesGoal}</span>
            </div>

             {/* Liquid Bar */}
            <div className="h-4 bg-white/10 rounded-full overflow-hidden mb-6 border border-white/5">
               <div className="h-full bg-gradient-to-r from-rose-500 to-orange-400 rounded-full transition-all duration-1000 ease-out" style={{ width: `${caloriePercentage}%` }} />
            </div>

            <button onClick={() => setShowMealModal(true)} className="w-full py-3 bg-white text-stone-900 hover:bg-stone-200 rounded-2xl font-bold text-xs transition">
                {t('tracker_log_meal_btn')}
            </button>
          </div>
        </div>

      </div>

      {/* Charts & Mood */}
      <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-stone-100 mb-8">
          <div className="flex items-center justify-between mb-6">
             <h3 className="text-xl font-editorial italic text-stone-900">{t('tracker_weekly_rhythm')}</h3>
             <div className="flex gap-2">
                {['M','T','W','T','F','S','S'].map((d,i) => (
                    <div key={i} className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${i===4 ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-400'}`}>{d}</div>
                ))}
             </div>
          </div>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historicalData}>
                <defs>
                    <linearGradient id="colorCals" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1c1917" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#1c1917" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                <XAxis dataKey="day" hide />
                <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', padding: '10px' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#1c1917' }}
                />
                <Area type="monotone" dataKey="calories" stroke="#1c1917" strokeWidth={2} fillOpacity={1} fill="url(#colorCals)" />
                </AreaChart>
            </ResponsiveContainer>
          </div>
      </div>

      {/* Mood Selector */}
      <div className="flex justify-between bg-white rounded-[2rem] p-4 shadow-sm border border-stone-100 overflow-x-auto gap-2 scrollbar-hide">
         {[
             { k: 'great', i: <Zap size={20} />, c: 'text-amber-500 bg-amber-50' },
             { k: 'good', i: <Smile size={20} />, c: 'text-emerald-500 bg-emerald-50' },
             { k: 'okay', i: <Meh size={20} />, c: 'text-blue-500 bg-blue-50' },
             { k: 'tired', i: <Moon size={20} />, c: 'text-indigo-500 bg-indigo-50' },
             { k: 'stressed', i: <Frown size={20} />, c: 'text-rose-500 bg-rose-50' }
         ].map(m => (
             <button key={m.k} onClick={() => updateUser({ dailyStats: { ...stats, mood: m.k as any } })} 
                className={`flex-1 min-w-[60px] h-[60px] rounded-2xl flex items-center justify-center transition-all ${stats.mood === m.k ? m.c + ' ring-2 ring-offset-2 ring-stone-200' : 'bg-stone-50 text-stone-400 grayscale hover:grayscale-0'}`}>
                 {m.i}
             </button>
         ))}
      </div>

       {/* Meal Entry Modal */}
       {showMealModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-md animate-in fade-in duration-200">
           <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 shadow-2xl animate-in zoom-in-95 duration-200">
               <div className="flex justify-between items-center mb-8">
                 <h3 className="text-2xl font-editorial italic text-stone-900">{t('tracker_log_meal_title')}</h3>
                 <button onClick={() => setShowMealModal(false)} className="p-2 bg-stone-100 rounded-full hover:bg-stone-200"><X size={20} /></button>
               </div>
               
               <div className="space-y-6">
                   <div className="grid grid-cols-2 gap-3">
                       {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map(type => (
                           <button 
                             key={type} onClick={() => setMealType(type)}
                             className={`p-4 rounded-2xl text-sm font-bold border transition ${mealType === type ? 'bg-stone-900 text-white border-stone-900' : 'bg-white border-stone-200 text-stone-500'}`}
                           >
                              {t(`meal_${type.toLowerCase()}` as any) || type}
                           </button>
                       ))}
                   </div>
                   
                   <div className="relative">
                     <input 
                       type="number" value={mealCals} onChange={(e) => setMealCals(e.target.value)}
                       className="w-full bg-stone-50 border-none rounded-2xl p-6 text-3xl font-bold text-stone-900 focus:ring-2 focus:ring-stone-900 outline-none text-center"
                       placeholder="0" autoFocus
                     />
                     <span className="absolute right-6 top-1/2 -translate-y-1/2 text-sm font-bold text-stone-400">kcal</span>
                   </div>

                   <button onClick={handleLogMeal} disabled={!mealCals} className="w-full bg-rose-500 text-white py-5 rounded-[1.5rem] font-bold text-lg hover:bg-rose-600 transition shadow-xl shadow-rose-200/50 disabled:opacity-50">
                     {t('tracker_add_to_log')}
                   </button>
               </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Tracker;
