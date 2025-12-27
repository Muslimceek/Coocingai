
import React from 'react';
import { Leaf, AlertTriangle, Plus, Scan, ArrowUpRight, Package } from 'lucide-react';
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
}

const PantryHeader: React.FC<PantryHeaderProps> = ({ stats, onAddClick }) => {
  const { t } = useLanguage();

  // Calculate circle logic for Eco Score
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (stats.ecoScore / 100) * circumference;
  
  // Determine status color and text based on score
  const isGood = stats.ecoScore > 70;
  const isCritical = stats.ecoScore < 40;
  
  const statusColor = isGood ? 'text-emerald-500' : isCritical ? 'text-rose-500' : 'text-amber-500';
  const statusBg = isGood ? 'bg-emerald-500' : isCritical ? 'bg-rose-500' : 'bg-amber-500';
  const statusText = isGood ? 'Eco Warrior' : isCritical ? 'Waste Alert' : 'Balanced';

  return (
    <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-700 font-sans">
      
      {/* 1. TOP TITLE ROW */}
      <div className="flex justify-between items-start mb-5 px-1">
        <div>
          <motion.div 
             initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
             className="flex items-center gap-2 mb-1"
          >
             <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
             <span className="text-[10px] font-brutal font-black text-stone-400 uppercase tracking-[0.2em]">
                {t('pantry_title')}
             </span>
          </motion.div>
          <h1 className="text-4xl font-editorial italic text-stone-900 leading-[0.9]">
            {t('pantry_subtitle')}
          </h1>
        </div>
      </div>

      {/* 2. BENTO GRID DASHBOARD */}
      <div className="grid grid-cols-2 gap-3 h-[240px]">
        
        {/* BLOCK A: ECO SCORE (Large Square) */}
        <div className="col-span-1 bg-white rounded-[2rem] p-4 relative overflow-hidden shadow-sm border border-stone-100 flex flex-col items-center justify-center">
             {/* Background Decor */}
             <div className={`absolute top-0 left-0 w-full h-1 ${statusBg} opacity-20`} />
             
             <div className="relative w-28 h-28 flex items-center justify-center mb-2">
                 {/* SVG Circle Graph */}
                 <svg className="w-full h-full transform -rotate-90">
                     <circle cx="56" cy="56" r={radius} stroke="#f5f5f4" strokeWidth="8" fill="none" />
                     <motion.circle 
                        cx="56" cy="56" r={radius} 
                        stroke="currentColor" 
                        strokeWidth="8" 
                        fill="none" 
                        className={statusColor}
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        strokeLinecap="round" 
                     />
                 </svg>
                 <div className="absolute flex flex-col items-center">
                     <Leaf size={18} className={`${statusColor} mb-1`} />
                     <span className="text-3xl font-editorial italic font-bold text-stone-900">{stats.ecoScore}</span>
                 </div>
             </div>
             <p className={`text-xs font-brutal font-bold uppercase tracking-widest ${statusColor}`}>{statusText}</p>
        </div>

        {/* BLOCK B: RIGHT COLUMN (Stacked) */}
        <div className="col-span-1 flex flex-col gap-3">
            
            {/* B1. EXPIRING ALERT */}
            <div className={`flex-1 rounded-[2rem] p-4 relative overflow-hidden flex flex-col justify-between transition-colors ${stats.expiring > 0 ? 'bg-orange-50 border border-orange-100' : 'bg-[#F9F8F6] border border-stone-100'}`}>
                <div className="flex justify-between items-start">
                    <span className="text-[9px] font-brutal font-bold uppercase tracking-wider text-stone-500">{t('p_item_expiring')}</span>
                    {stats.expiring > 0 && <AlertTriangle size={16} className="text-orange-500 animate-bounce" />}
                </div>
                <div className="flex items-end gap-2">
                    <span className={`text-4xl font-editorial italic leading-none ${stats.expiring > 0 ? 'text-orange-600' : 'text-stone-300'}`}>
                        {stats.expiring}
                    </span>
                    <span className="text-xs font-bold text-stone-400 mb-1">{t('explore_items').toLowerCase()}</span>
                </div>
            </div>

            {/* B2. TOTAL STOCK */}
            <div className="flex-1 bg-stone-900 rounded-[2rem] p-4 relative overflow-hidden flex items-center justify-between text-white group">
                <div>
                    <span className="block text-[9px] font-brutal font-bold uppercase tracking-wider text-stone-400 mb-1">{t('pantry_section_all')}</span>
                    <span className="text-3xl font-editorial italic leading-none">{stats.total}</span>
                </div>
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors">
                    <Package size={20} className="text-stone-200" />
                </div>
            </div>

        </div>

        {/* BLOCK C: BIG ACTION BUTTON (Wide Bottom) */}
        <button 
            onClick={() => {
                if(navigator.vibrate) navigator.vibrate(10);
                onAddClick();
            }}
            className="col-span-2 bg-gradient-to-r from-stone-100 to-white rounded-[2rem] p-1.5 shadow-sm border border-stone-200 active:scale-95 transition-transform group"
        >
            <div className="w-full h-full bg-white rounded-[1.7rem] border border-stone-100 flex items-center justify-between px-6 py-4">
                 <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-stone-900 rounded-full flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                         <Plus size={20} />
                     </div>
                     <div className="text-left">
                         <span className="block font-editorial italic text-lg text-stone-900 leading-none">{t('btn_add')}</span>
                         <span className="text-[10px] font-brutal font-bold uppercase tracking-wider text-stone-400">Scan or Manual</span>
                     </div>
                 </div>
                 <Scan size={20} className="text-stone-300 group-hover:text-rose-500 transition-colors" />
            </div>
        </button>

      </div>
    </div>
  );
};

export default PantryHeader;
