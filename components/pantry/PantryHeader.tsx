
import React from 'react';
import { Leaf, AlertTriangle, Plus, Scan, Package, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';

interface PantryHeaderProps {
  stats: {
    total: number;
    expiring: number;
    expired: number;
    ecoScore: number;
  };
  onAddClick: () => void;
  activeView: 'all' | 'expiring';
  onViewChange: (mode: 'all' | 'expiring') => void;
}

const PantryHeader: React.FC<PantryHeaderProps> = ({ stats, onAddClick, activeView, onViewChange }) => {
  const { t } = useLanguage();

  // Circle config
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (stats.ecoScore / 100) * circumference;
  
  // Status logic
  const isExcellent = stats.ecoScore >= 80;
  const isCritical = stats.ecoScore < 50;
  
  // Dynamic Colors
  const scoreGradientId = isExcellent ? "gradExcel" : isCritical ? "gradCrit" : "gradNorm";

  return (
    <div className="mb-4 animate-in fade-in slide-in-from-top-4 duration-700 font-sans">
      
      {/* 1. TITLE & DATE */}
      <div className="flex justify-between items-end mb-6 px-1">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <span className="relative flex h-2 w-2">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
             </span>
             <span className="text-[10px] font-brutal font-bold text-stone-400 uppercase tracking-[0.2em]">
                {t('pantry_title')}
             </span>
          </div>
          <h1 className="text-5xl font-editorial italic text-stone-900 leading-[0.9]">
            {t('pantry_subtitle').split(' ')[0]}<br/>
            <span className="text-stone-300">{t('pantry_subtitle').split(' ').slice(1).join(' ')}</span>
          </h1>
        </div>
      </div>

      {/* 2. DASHBOARD GRID (Asymmetric) */}
      <div className="grid grid-cols-2 gap-3 h-[260px]">
        
        {/* A. ECO SCORE (Dark Premium Card - Informational) */}
        <div className="col-span-1 bg-stone-900 rounded-[2.5rem] p-5 relative overflow-hidden flex flex-col items-center justify-between shadow-2xl shadow-stone-200">
             {/* Gradient Orb Background */}
             <div className="absolute top-[-50%] right-[-50%] w-[150%] h-[150%] bg-gradient-to-br from-emerald-500/20 to-transparent rounded-full blur-3xl pointer-events-none" />
             
             <div className="w-full flex justify-between items-start z-10">
                 <span className="text-white/60 text-[10px] font-brutal font-bold uppercase tracking-widest">Eco Score</span>
                 <Leaf size={16} className={isExcellent ? "text-emerald-400" : "text-stone-400"} />
             </div>

             <div className="relative w-32 h-32 flex items-center justify-center z-10 my-2">
                 {/* Progress Circle */}
                 <svg className="w-full h-full transform -rotate-90 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                     <defs>
                        <linearGradient id="gradExcel" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#34d399" />
                            <stop offset="100%" stopColor="#10b981" />
                        </linearGradient>
                        <linearGradient id="gradNorm" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#fbbf24" />
                            <stop offset="100%" stopColor="#f59e0b" />
                        </linearGradient>
                        <linearGradient id="gradCrit" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#f43f5e" />
                            <stop offset="100%" stopColor="#e11d48" />
                        </linearGradient>
                     </defs>
                     <circle cx="64" cy="64" r={radius} stroke="#333" strokeWidth="6" fill="none" />
                     <motion.circle 
                        cx="64" cy="64" r={radius} 
                        stroke={`url(#${scoreGradientId})`}
                        strokeWidth="6" 
                        fill="none" 
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1.5, ease: "circOut" }}
                        strokeLinecap="round" 
                     />
                 </svg>
                 <div className="absolute flex flex-col items-center">
                     <span className="text-4xl font-editorial italic font-bold text-white">{stats.ecoScore}</span>
                 </div>
             </div>
             
             <div className="z-10 bg-white/10 backdrop-blur-md rounded-full px-3 py-1 border border-white/10">
                 <span className="text-[9px] font-brutal font-bold text-white uppercase tracking-wider">
                    {isExcellent ? 'Excellent' : isCritical ? 'Action Needed' : 'Good'}
                 </span>
             </div>
        </div>

        {/* B. RIGHT COLUMN - INTERACTIVE WIDGETS */}
        <div className="col-span-1 flex flex-col gap-3">
            
            {/* B1. EXPIRING (Clickable Filter) */}
            <button 
                onClick={() => onViewChange(activeView === 'expiring' ? 'all' : 'expiring')}
                className={`
                    flex-1 rounded-[2.5rem] p-5 relative overflow-hidden flex flex-col justify-between transition-all duration-300 text-left border-2
                    ${activeView === 'expiring' 
                        ? 'bg-orange-500 text-white border-orange-500 shadow-xl shadow-orange-200 scale-[1.02]' 
                        : stats.expiring > 0 
                            ? 'bg-orange-50 border-orange-100' 
                            : 'bg-white border-stone-100 shadow-sm'}
                `}
            >
                <div className="flex justify-between items-start w-full">
                    <span className={`text-[9px] font-brutal font-bold uppercase tracking-wider ${activeView === 'expiring' ? 'text-white/80' : stats.expiring > 0 ? 'text-orange-600' : 'text-stone-400'}`}>
                        {t('p_item_expiring')}
                    </span>
                    {stats.expiring > 0 ? (
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center animate-pulse ${activeView === 'expiring' ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-600'}`}>
                            <AlertTriangle size={12} />
                        </div>
                    ) : (
                        <CheckCircle2 size={16} className="text-emerald-500" />
                    )}
                </div>
                
                <div className="mt-auto">
                    <span className={`text-4xl font-editorial italic leading-none block mb-1 ${activeView === 'expiring' ? 'text-white' : stats.expiring > 0 ? 'text-orange-600' : 'text-stone-900'}`}>
                        {stats.expiring}
                    </span>
                    <span className={`text-[10px] font-bold ${activeView === 'expiring' ? 'text-white/80' : 'text-stone-400'}`}>
                        {activeView === 'expiring' ? 'Tap to clear' : stats.expiring > 0 ? 'Tap to view' : 'All fresh'}
                    </span>
                </div>
            </button>

            {/* B2. TOTAL STOCK (Clickable Reset) */}
            <button 
                onClick={() => onViewChange('all')}
                className={`
                    flex-1 rounded-[2.5rem] p-5 shadow-sm flex flex-col justify-center relative overflow-hidden group text-left transition-all duration-300 border
                    ${activeView === 'all' 
                        ? 'bg-stone-900 text-white border-stone-900' 
                        : 'bg-white text-stone-900 border-stone-100 hover:border-stone-200'}
                `}
            >
                <div className={`absolute right-[-10px] top-[-10px] opacity-5 group-hover:opacity-10 transition-opacity rotate-12 ${activeView === 'all' ? 'text-white' : 'text-stone-900'}`}>
                    <Package size={80} />
                </div>
                <span className={`text-[9px] font-brutal font-bold uppercase tracking-wider mb-1 ${activeView === 'all' ? 'text-stone-400' : 'text-stone-400'}`}>
                    {t('pantry_section_all')}
                </span>
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-editorial italic">{stats.total}</span>
                    <span className={`text-xs font-bold ${activeView === 'all' ? 'text-stone-500' : 'text-stone-300'}`}>items</span>
                </div>
            </button>

        </div>

      </div>

      {/* 3. COMMAND BAR (Floating Action) */}
      <div className="mt-4">
        <button 
            onClick={() => {
                if(navigator.vibrate) navigator.vibrate(10);
                onAddClick();
            }}
            className="w-full group relative overflow-hidden bg-white rounded-[2rem] p-2 shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-stone-100 active:scale-[0.98] transition-all duration-300"
        >
            <div className="flex items-center justify-between pl-6 pr-2 py-3">
                 <div className="flex flex-col items-start">
                     <span className="text-lg font-editorial italic font-bold text-stone-900 leading-none mb-1 group-hover:translate-x-1 transition-transform">{t('btn_add')}</span>
                     <span className="text-[9px] font-brutal font-bold uppercase tracking-wider text-stone-400">Scan code or manual entry</span>
                 </div>
                 
                 <div className="h-12 w-16 bg-stone-900 rounded-[1.5rem] flex items-center justify-center text-white relative overflow-hidden">
                     <div className="absolute inset-0 bg-gradient-to-r from-stone-800 to-stone-900" />
                     <Scan size={20} className="relative z-10 group-hover:scale-110 transition-transform" />
                     {/* Scanning Line Animation */}
                     <motion.div 
                        animate={{ top: ['0%', '100%', '0%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 right-0 h-[1px] bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)] z-10 opacity-50"
                     />
                 </div>
            </div>
        </button>
      </div>

    </div>
  );
};

export default PantryHeader;
