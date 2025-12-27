
import React, { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Utensils } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';
import { PantryItem } from '../types';

// Import sub-components
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
  
  // View State (Linked to Header Widgets)
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

        // 2. View Mode Filter (Header Widgets interaction)
        if (viewMode === 'expiring') {
            const d = getDaysUntilExpiry(item.expiryDate);
            // Show items expiring in 3 days or less (including expired)
            return d !== null && d <= 3;
        }

        // 3. Category Filter (only applies if viewMode is 'all')
        if (filterCategory !== 'all') {
            return item.category === filterCategory;
        }

        return true;
    });

    return items.sort((a, b) => {
        // Sort by expiry urgency first
        if (!a.expiryDate) return 1;
        if (!b.expiryDate) return -1;
        return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
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
     
     const ecoScore = Math.max(0, 100 - (expired * 10));
     return { total, expiring, expired, ecoScore };
  }, [user.pantry]);

  // --- Handlers ---

  const vibrate = () => {
    if(navigator.vibrate) navigator.vibrate(10);
  }

  const handleOpenAdd = () => {
    vibrate();
    setEditingItem(null);
    setShowModal(true);
  };

  const handleOpenEdit = (item: PantryItem) => {
    vibrate();
    setEditingItem(item);
    setShowModal(true);
  };

  const handleSaveItem = (itemData: Partial<PantryItem>) => {
    vibrate();
    const newItem: PantryItem = {
      id: editingItem ? editingItem.id : Date.now().toString(),
      name: itemData.name!,
      quantity: itemData.quantity!,
      unit: itemData.unit!,
      expiryDate: itemData.expiryDate,
      category: itemData.category
    };

    if (editingItem) {
      updateUser({ pantry: user.pantry.map(i => i.id === editingItem.id ? newItem : i) });
    } else {
      updateUser({ pantry: [newItem, ...user.pantry] });
    }
    setShowModal(false);
  };

  const handleDeleteItem = (id: string) => {
    vibrate();
    updateUser({ pantry: user.pantry.filter(item => item.id !== id) });
    setShowModal(false);
  };

  return (
    <div className="min-h-screen pb-32 pt-6 px-4 md:px-6 relative font-sans">
      
      <PantryHeader 
        stats={stats} 
        onAddClick={handleOpenAdd}
        activeView={viewMode}
        onViewChange={(mode) => {
            vibrate();
            setViewMode(mode);
            // Reset category filter when switching modes for clarity
            if(mode === 'expiring') setFilterCategory('all');
        }}
      />

      <PantryFilters 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterCategory={filterCategory}
        setFilterCategory={(cat) => {
            vibrate();
            setFilterCategory(cat);
            setViewMode('all'); // Switching category resets "Expiring Only" mode
        }}
        activeView={viewMode}
      />

      <PantryList 
        items={processedItems}
        onItemClick={handleOpenEdit}
      />

      {/* Floating Cook Bar */}
      <AnimatePresence>
          {user.pantry.length > 2 && viewMode === 'all' && (
             <motion.div 
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-28 left-4 right-4 z-30 pointer-events-none flex justify-center"
             >
                <button 
                   onClick={() => { vibrate(); onCookWithPantry(user.pantry.map(i => i.name)); }}
                   className="pointer-events-auto w-full max-w-md bg-stone-900/90 backdrop-blur-md text-white p-4 rounded-[2rem] shadow-2xl flex items-center justify-between group border border-white/20 transition-all hover:scale-[1.02] active:scale-95"
                >
                   <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-full bg-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Utensils size={18} />
                       </div>
                       <div className="text-left">
                           <span className="block text-sm font-bold">{t('pantry_cook_btn')}</span>
                           <span className="text-[10px] text-stone-400 uppercase tracking-wider">{user.pantry.length} {t('explore_items')}</span>
                       </div>
                   </div>
                   <div className="bg-white/10 rounded-full p-2 group-hover:bg-white/20 transition-colors">
                       <ArrowRight size={16} />
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
