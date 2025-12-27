
import React, { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Utensils, ChefHat, ScanLine } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';
import { PantryItem } from '../types';

import PantryHeader from './pantry/PantryHeader';
import PantryFilters from './pantry/PantryFilters';
import PantryList from './pantry/PantryList';
import PantryEditModal from './pantry/PantryEditModal';

interface PantryScreenProps {
  onCookWithPantry: (ingredients: string[]) => void;
}

const PantryScreen: React.FC<PantryScreenProps> = ({ onCookWithPantry }) => {
  const { t } = useLanguage();
  const { user, updateUser } = useUser();
  
  // UI Logic State
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<PantryItem | null>(null);
  
  // View State
  const [viewMode, setViewMode] = useState<'all' | 'expiring'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // --- Calculations ---

  const getDaysUntilExpiry = (dateStr?: string) => {
    if (!dateStr) return null;
    const today = new Date();
    const expiry = new Date(dateStr);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  };

  const processedItems = useMemo(() => {
    let items = user.pantry.filter(item => {
        // 1. Search Filter
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        if (!matchesSearch) return false;

        // 2. View Mode Filter
        if (viewMode === 'expiring') {
            const d = getDaysUntilExpiry(item.expiryDate);
            return d !== null && d <= 3;
        }

        // 3. Category Filter
        if (filterCategory !== 'all') {
            return item.category === filterCategory;
        }

        return true;
    });

    // Smart Sort: Expiring Soon -> Categories -> Alphabetical
    return items.sort((a, b) => {
        const da = getDaysUntilExpiry(a.expiryDate) ?? 999;
        const db = getDaysUntilExpiry(b.expiryDate) ?? 999;
        return da - db;
    });
  }, [user.pantry, filterCategory, searchQuery, viewMode]);

  const stats = useMemo(() => {
     const total = user.pantry.length;
     const expiring = user.pantry.filter(i => {
         const d = getDaysUntilExpiry(i.expiryDate);
         return d !== null && d <= 3 && d >= 0;
     }).length;
     const expired = user.pantry.filter(i => {
         const d = getDaysUntilExpiry(i.expiryDate);
         return d !== null && d < 0;
     }).length;
     
     // Eco Score: Starts at 100, penalized by expired/expiring
     const ecoScore = Math.max(0, 100 - (expired * 15) - (expiring * 5));
     return { total, expiring, expired, ecoScore };
  }, [user.pantry]);

  // --- Handlers ---

  const vibrate = (pattern: number | number[] = 10) => {
    if(typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(pattern);
  }

  const handleOpenAdd = () => {
    vibrate(15);
    setEditingItem(null);
    setShowModal(true);
  };

  const handleOpenEdit = (item: PantryItem) => {
    vibrate(10);
    setEditingItem(item);
    setShowModal(true);
  };

  const handleSaveItem = (itemData: Partial<PantryItem>) => {
    vibrate([10, 30]);
    const newItem: PantryItem = {
      id: editingItem ? editingItem.id : Date.now().toString(),
      name: itemData.name!,
      quantity: itemData.quantity!,
      unit: itemData.unit!,
      expiryDate: itemData.expiryDate,
      category: itemData.category,
      calories: itemData.calories
    };

    if (editingItem) {
      updateUser({ pantry: user.pantry.map(i => i.id === editingItem.id ? newItem : i) });
    } else {
      updateUser({ pantry: [newItem, ...user.pantry] });
    }
    setShowModal(false);
  };

  const handleDeleteItem = (id: string) => {
    vibrate([20, 50]);
    updateUser({ pantry: user.pantry.filter(item => item.id !== id) });
    setShowModal(false);
  };

  // Quick Consume (from list)
  const handleConsumeItem = (id: string) => {
    vibrate([50]); // Heavy mechanical thud
    updateUser({ pantry: user.pantry.filter(item => item.id !== id) });
  };

  return (
    <div className="min-h-screen pb-32 pt-6 px-4 md:px-6 relative font-sans overflow-x-hidden">
      
      {/* Background Atmosphere */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#F9F8F6] to-stone-100 pointer-events-none -z-10" />
      <div className="fixed top-0 left-0 right-0 h-64 bg-gradient-to-b from-rose-50/50 to-transparent pointer-events-none -z-10" />

      {/* 1. DIGITAL TWIN DASHBOARD */}
      <PantryHeader 
        stats={stats} 
        onAddClick={handleOpenAdd}
        activeView={viewMode}
        onViewChange={(mode) => {
            vibrate(10);
            setViewMode(mode);
            if(mode === 'expiring') setFilterCategory('all');
        }}
      />

      {/* 2. MORPHING FILTERS */}
      <PantryFilters 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterCategory={filterCategory}
        setFilterCategory={(cat) => {
            vibrate(5);
            setFilterCategory(cat);
            setViewMode('all');
        }}
        activeView={viewMode}
      />

      {/* 3. MASONRY GRID INVENTORY */}
      <PantryList 
        items={processedItems}
        onItemClick={handleOpenEdit}
        onConsume={handleConsumeItem}
      />

      {/* 4. FLOATING 'CHEF MODE' DOCK */}
      <AnimatePresence>
          {user.pantry.length > 2 && viewMode === 'all' && (
             <motion.div 
                initial={{ y: 150, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 150, opacity: 0 }}
                transition={{ type: "spring", damping: 20 }}
                className="fixed bottom-28 left-4 right-4 z-30 pointer-events-none flex justify-center"
             >
                <button 
                   onClick={() => { vibrate([10, 50]); onCookWithPantry(user.pantry.map(i => i.name)); }}
                   className="pointer-events-auto w-full max-w-sm bg-stone-900/90 backdrop-blur-xl text-white p-2 rounded-[2.5rem] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] flex items-center justify-between group border border-white/20 transition-all hover:scale-[1.02] active:scale-95 pr-3 pl-3"
                >
                   <div className="flex items-center gap-3">
                       <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-rose-500 to-orange-500 flex items-center justify-center shadow-lg shadow-rose-900/30 group-hover:rotate-12 transition-transform">
                          <ChefHat size={20} className="text-white" />
                       </div>
                       <div className="text-left flex flex-col">
                           <span className="text-sm font-bold leading-tight">{t('pantry_cook_btn')}</span>
                           <span className="text-[10px] text-stone-400 font-brutal uppercase tracking-wider">
                              {user.pantry.length} items ready
                           </span>
                       </div>
                   </div>
                   
                   <div className="flex items-center gap-2">
                       <div className="h-8 w-[1px] bg-white/20" />
                       <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-stone-900 transition-colors">
                           <ArrowRight size={18} />
                       </div>
                   </div>
                </button>
             </motion.div>
          )}
      </AnimatePresence>

      <PantryEditModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveItem}
        onDelete={handleDeleteItem}
        initialItem={editingItem}
      />
    </div>
  );
};

export default PantryScreen;
