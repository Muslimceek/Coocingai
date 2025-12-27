
import React from 'react';
import { Leaf, AlertCircle, Plus } from 'lucide-react';
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

  return (
    <div className="mb-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex justify-between items-end px-1">
        <div>
          <span className="text-[10px] font-brutal font-black text-rose-500 uppercase tracking-[0.2em] mb-1">
            {t('pantry_title')}
          </span>
          <h1 className="text-4xl font-editorial italic text-stone-900 leading-[0.9]">
            {t('pantry_subtitle')}
          </h1>
        </div>
        <div className="bg-white rounded-full p-2 border border-stone-100 shadow-sm">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
            stats.ecoScore > 80 ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
          }`}>
            {stats.ecoScore}
          </div>
        </div>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-3 gap-2">
        {/* Total Items Card */}
        <div className="bg-stone-900 text-white rounded-[1.5rem] p-4 flex flex-col justify-between h-24 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Leaf size={40} />
          </div>
          <span className="text-[9px] font-brutal font-bold uppercase tracking-wider opacity-60">
            {t('pantry_section_all')}
          </span>
          <span className="text-3xl font-editorial italic">{stats.total}</span>
        </div>

        {/* Expiring Card */}
        <div className="bg-orange-100 text-orange-900 rounded-[1.5rem] p-4 flex flex-col justify-between h-24 relative overflow-hidden">
          <div className="absolute -bottom-2 -right-2 p-3 opacity-10">
            <AlertCircle size={40} />
          </div>
          <span className="text-[9px] font-brutal font-bold uppercase tracking-wider opacity-60">
            {t('p_item_expiring')}
          </span>
          <span className="text-3xl font-editorial italic">{stats.expiring}</span>
        </div>

        {/* Add Button */}
        <button 
          onClick={onAddClick} 
          className="bg-white border border-stone-200 text-stone-900 rounded-[1.5rem] p-4 flex flex-col items-center justify-center h-24 gap-2 hover:bg-stone-50 active:scale-95 transition-transform shadow-sm"
        >
          <div className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center shadow-lg shadow-stone-200">
            <Plus size={18} />
          </div>
          <span className="text-[9px] font-brutal font-bold uppercase tracking-wider">
            {t('btn_add')}
          </span>
        </button>
      </div>
    </div>
  );
};

export default PantryHeader;
