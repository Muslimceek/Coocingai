
import React from 'react';
import { Search } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface PantryFiltersProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  filterCategory: string;
  setFilterCategory: (val: string) => void;
}

const PantryFilters: React.FC<PantryFiltersProps> = ({ 
  searchQuery, 
  setSearchQuery, 
  filterCategory, 
  setFilterCategory 
}) => {
  const { t } = useLanguage();

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'produce', label: t('cat_produce') },
    { id: 'protein', label: t('cat_protein') },
    { id: 'dairy', label: t('cat_dairy') },
    { id: 'pantry', label: t('cat_pantry') },
  ];

  return (
    <div className="sticky top-0 z-20 bg-[#F9F8F6]/95 backdrop-blur-md py-2 -mx-4 px-4 mb-4 space-y-3 transition-all duration-300">
      <div className="relative group">
        <input 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('pantry_search')}
          className="w-full bg-white border border-stone-200 rounded-2xl py-3 pl-10 pr-4 shadow-sm text-sm font-medium focus:ring-2 focus:ring-rose-200 outline-none transition-all group-hover:border-stone-300"
        />
        <Search className="absolute left-3 top-3.5 text-stone-400 group-hover:text-stone-600 transition-colors" size={16} />
      </div>
      
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => { 
                if(navigator.vibrate) navigator.vibrate(10);
                setFilterCategory(cat.id); 
            }}
            className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-300 ${
              filterCategory === cat.id 
              ? 'bg-stone-900 text-white border-stone-900 shadow-md transform scale-105' 
              : 'bg-white text-stone-500 border-stone-100 hover:border-stone-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PantryFilters;
