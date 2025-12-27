
import React from 'react';
import { Leaf, Milk, Drumstick, Cookie, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import { PantryItem } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

interface PantryListProps {
  items: PantryItem[];
  onItemClick: (item: PantryItem) => void;
}

const PantryList: React.FC<PantryListProps> = ({ items, onItemClick }) => {
  const { t } = useLanguage();

  const getDaysUntilExpiry = (dateStr?: string) => {
    if (!dateStr) return null;
    const today = new Date();
    const expiry = new Date(dateStr);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  };

  const getCategoryIcon = (cat: string) => {
    switch(cat) {
      case 'produce': return <Leaf size={16} className="text-emerald-500" />;
      case 'dairy': return <Milk size={16} className="text-blue-500" />;
      case 'protein': return <Drumstick size={16} className="text-rose-500" />;
      case 'pantry': return <Cookie size={16} className="text-amber-500" />;
      default: return <Tag size={16} className="text-slate-400" />;
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 opacity-50 animate-in fade-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-stone-200 rounded-full flex items-center justify-center mb-4">
          <Leaf size={32} className="text-stone-400" />
        </div>
        <p className="font-editorial italic text-xl text-stone-600">{t('pantry_empty')}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 pb-24">
      {items.map(item => {
        const days = getDaysUntilExpiry(item.expiryDate);
        let ringColor = 'border-stone-100';
        let iconBg = 'bg-stone-50';
        let statusBadge = null;
        
        if (days !== null) {
          if (days < 0) { 
              ringColor = 'border-red-400 shadow-red-100'; 
              iconBg = 'bg-red-50 text-red-500'; 
              statusBadge = 'EXP';
          } else if (days <= 3) { 
              ringColor = 'border-orange-400 shadow-orange-100'; 
              iconBg = 'bg-orange-50 text-orange-500';
              statusBadge = `${days}d`;
          } else { 
              ringColor = 'border-emerald-400 shadow-emerald-100'; 
              iconBg = 'bg-emerald-50 text-emerald-500'; 
          }
        }

        return (
          <motion.div 
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            key={item.id}
            onClick={() => onItemClick(item)}
            className="bg-white rounded-[1.5rem] p-4 border border-stone-100 shadow-sm relative overflow-hidden group active:scale-95 transition-transform cursor-pointer"
          >
            <div className="flex justify-between items-start mb-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${ringColor} ${iconBg} transition-colors duration-300`}>
                {getCategoryIcon(item.category || 'other')}
              </div>
              {statusBadge && (
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${days && days < 0 ? 'bg-red-500 text-white' : 'bg-stone-900 text-white'}`}>
                  {statusBadge}
                </span>
              )}
            </div>
            
            <h4 className="font-bold text-stone-800 leading-tight mb-1 truncate">{item.name}</h4>
            <p className="text-xs text-stone-400 font-medium">{item.quantity} {item.unit}</p>
            
            {/* Watermark Icon */}
            <div className="absolute -bottom-4 -right-4 text-stone-50 opacity-20 pointer-events-none transform rotate-12 group-hover:scale-110 transition-transform duration-500">
              {getCategoryIcon(item.category || 'other')}
            </div>
          </motion.div>
        )
      })}
    </div>
  );
};

export default PantryList;
