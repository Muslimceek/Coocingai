
import React from 'react';
import { Leaf, Milk, Drumstick, Cookie, Tag, Utensils } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PantryItem } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

interface PantryListProps {
  items: PantryItem[];
  onItemClick: (item: PantryItem) => void;
  onConsume?: (id: string) => void;
}

const PantryList: React.FC<PantryListProps> = ({ items, onItemClick, onConsume }) => {
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
      case 'produce': return <Leaf size={16} className="text-emerald-600" />;
      case 'dairy': return <Milk size={16} className="text-blue-500" />;
      case 'protein': return <Drumstick size={16} className="text-rose-500" />;
      case 'pantry': return <Cookie size={16} className="text-amber-500" />;
      default: return <Tag size={16} className="text-slate-400" />;
    }
  };

  // Helper to visualize the lifespan timeline (Innovation Feature)
  const getTimelineWidth = (days: number | null) => {
      if (days === null) return 0;
      // Assume max life tracked is 14 days for visual relevance (clamped)
      const maxDays = 14; 
      const percentage = Math.max(0, Math.min(100, (days / maxDays) * 100));
      return percentage;
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 opacity-50 animate-in fade-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-stone-200 rounded-full flex items-center justify-center mb-6 relative">
          <Leaf size={40} className="text-stone-400" />
          <div className="absolute top-0 right-0 w-8 h-8 bg-stone-300 rounded-full animate-pulse" />
        </div>
        <p className="font-editorial italic text-2xl text-stone-600 mb-2">{t('pantry_empty')}</p>
        <p className="text-xs font-brutal uppercase tracking-widest text-stone-400">Time to restock the assets</p>
      </div>
    );
  }

  return (
    <motion.ul 
        layout 
        className="grid grid-cols-2 gap-3 pb-32"
    >
      <AnimatePresence>
      {items.map(item => {
        const days = getDaysUntilExpiry(item.expiryDate);
        
        // VISUAL DECAY LOGIC
        // Fresh = White, Expiring = Orange Tint, Expired = Red Tint
        let bgStyle = 'bg-white';
        let borderColor = 'border-white/60';
        let timelineColor = 'bg-emerald-400';
        let statusText = null;
        let opacityClass = 'opacity-100';
        
        if (days !== null) {
          if (days < 0) { 
              bgStyle = 'bg-gradient-to-br from-red-50 to-stone-50'; 
              borderColor = 'border-red-200'; 
              timelineColor = 'bg-red-500';
              statusText = 'Expired';
              opacityClass = 'opacity-70 grayscale-[0.5]'; // Visual Decay: looks "old"
          } else if (days <= 3) { 
              bgStyle = 'bg-gradient-to-br from-orange-50 to-amber-50';
              borderColor = 'border-orange-200';
              timelineColor = 'bg-orange-400';
              statusText = `${days}d left`;
          } else { 
              bgStyle = 'bg-white';
              borderColor = 'border-white/60';
              timelineColor = 'bg-emerald-400';
          }
        }

        const timelineWidth = getTimelineWidth(days);

        return (
          <motion.li 
            layout
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, filter: 'blur(10px)' }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            key={item.id}
            className={`
                relative rounded-[1.8rem] p-4 border shadow-sm overflow-hidden cursor-pointer group hover:shadow-md transition-all
                ${bgStyle} ${borderColor} ${opacityClass}
            `}
            onClick={() => onItemClick(item)}
          >
             {/* Background Decoration */}
             <div className="absolute -right-4 -top-4 w-20 h-20 bg-gradient-to-br from-white to-transparent opacity-50 rounded-full blur-xl pointer-events-none" />

             {/* Header: Icon & Qty */}
             <div className="flex justify-between items-start mb-3 relative z-10">
                <div className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center border border-stone-100 text-stone-600">
                    {getCategoryIcon(item.category || 'other')}
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-xl font-editorial italic font-bold text-stone-900 leading-none">{item.quantity}</span>
                    <span className="text-[9px] font-brutal uppercase text-stone-400">{item.unit}</span>
                </div>
             </div>
             
             {/* Name */}
             <h4 className="font-bold text-stone-800 leading-tight mb-4 truncate pr-2 relative z-10 text-lg">
                {item.name}
             </h4>
             
             {/* FRESHNESS TIMELINE (Innovation) */}
             <div className="relative z-10 mt-auto">
                 <div className="flex justify-between items-end mb-1">
                     <span className={`text-[9px] font-black uppercase tracking-wider ${days && days <= 3 ? 'text-orange-500' : 'text-stone-400'}`}>
                         {statusText || 'Fresh'}
                     </span>
                     {/* Quick Consume Action (Mini Button) */}
                     {onConsume && (
                         <button 
                            onClick={(e) => { e.stopPropagation(); onConsume(item.id); }}
                            className="w-6 h-6 rounded-full bg-stone-100 hover:bg-emerald-500 hover:text-white flex items-center justify-center text-stone-400 transition-colors shadow-sm"
                         >
                             <Utensils size={10} />
                         </button>
                     )}
                 </div>
                 
                 {/* The Timeline Bar */}
                 <div className="h-1.5 w-full bg-stone-200/50 rounded-full overflow-hidden">
                     <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${days === null ? 100 : timelineWidth}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className={`h-full rounded-full ${timelineColor}`}
                     />
                 </div>
             </div>

             {/* Watermark for Depth */}
             <div className="absolute -bottom-6 -right-6 opacity-5 pointer-events-none transform rotate-12 scale-150 text-stone-900">
                {getCategoryIcon(item.category || 'other')}
             </div>

          </motion.li>
        )
      })}
      </AnimatePresence>
    </motion.ul>
  );
};

export default PantryList;
