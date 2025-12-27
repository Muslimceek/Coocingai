
import React, { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

interface PantryFiltersProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  filterCategory: string;
  setFilterCategory: (val: string) => void;
  activeView: 'all' | 'expiring';
}

const PantryFilters: React.FC<PantryFiltersProps> = ({ 
  searchQuery, 
  setSearchQuery, 
  filterCategory, 
  setFilterCategory,
  activeView
}) => {
  const { t } = useLanguage();
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'produce', label: t('cat_produce') },
    { id: 'protein', label: t('cat_protein') },
    { id: 'dairy', label: t('cat_dairy') },
    { id: 'pantry', label: t('cat_pantry') },
  ];

  if (activeView === 'expiring') {
      return (
          <div className="sticky top-0 z-20 bg-[#F9F8F6]/95 backdrop-blur-md py-4 -mx-4 px-4 mb-2 flex items-center justify-center">
              <span className="text-xs font-brutal font-bold uppercase tracking-widest text-orange-500 animate-pulse bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
                  ⚠️ Showing Expiring Items Only
              </span>
          </div>
      );
  }

  return (
    <div className="sticky top-0 z-20 bg-[#F9F8F6]/95 backdrop-blur-md py-2 -mx-4 px-4 mb-4 space-y-3 transition-all duration-300">
      
      {/* 1. MORPHING SEARCH BAR */}
      <div className={`relative transition-all duration-300 ${isSearchFocused ? 'scale-[1.02]' : 'scale-100'}`}>
        <div className={`
             absolute inset-0 bg-gradient-to-r from-rose-200 via-orange-200 to-amber-200 rounded-2xl blur-md opacity-0 transition-opacity duration-500
             ${isSearchFocused ? 'opacity-40' : 'opacity-0'}
        `} />
        
        <div className="relative bg-white rounded-2xl shadow-sm border border-stone-200 flex items-center overflow-hidden">
             <div className="pl-4 text-stone-400">
                 <Search size={18} />
             </div>
             <input 
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('pantry_search')}
                className="w-full bg-transparent border-none outline-none text-sm font-medium text-stone-800 placeholder:text-stone-300 py-3.5 px-3"
             />
             <AnimatePresence>
                 {searchQuery && (
                     <motion.button 
                        initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                        onClick={() => setSearchQuery('')}
                        className="mr-3 p-1 bg-stone-100 rounded-full text-stone-500 hover:bg-stone-200"
                     >
                        <X size={14} />
                     </motion.button>
                 )}
             </AnimatePresence>
        </div>
      </div>
      
      {/* 2. TECH CHIPS (Scrollable) */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide mask-gradient-right">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setFilterCategory(cat.id)}
            className={`
                whitespace-nowrap px-4 py-2 rounded-xl text-[10px] font-brutal font-bold uppercase tracking-widest border transition-all duration-300
                ${filterCategory === cat.id 
                ? 'bg-stone-900 text-white border-stone-900 shadow-lg shadow-stone-200 transform scale-105' 
                : 'bg-white text-stone-400 border-stone-100 hover:border-stone-300 hover:text-stone-600'}
            `}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PantryFilters;
