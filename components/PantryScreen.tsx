import React, { useState, useMemo, useRef } from 'react';
import { Plus, X, Search, Filter, AlertCircle, ShoppingBag, Leaf, Trash2, Calendar, Utensils, Check, Package, Scan, Camera, Edit2, Minus, Tag, Milk, Drumstick, Cookie, Loader2, Sparkles } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';
import { PantryItem } from '../types';
import { identifyPantryItem } from '../services/geminiService';

interface PantryScreenProps {
  onCookWithPantry: (ingredients: string[]) => void;
}

const PantryScreen: React.FC<PantryScreenProps> = ({ onCookWithPantry }) => {
  const { t, language } = useLanguage();
  const { user, updateUser } = useUser();
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Item Form State (New & Edit)
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemName, setItemName] = useState('');
  const [itemQty, setItemQty] = useState('');
  const [itemUnit, setItemUnit] = useState('pcs');
  const [itemExpiry, setItemExpiry] = useState('');
  const [itemCategory, setItemCategory] = useState<PantryItem['category']>('other');
  
  // AI Scanning State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Seasonal Items Widget Data
  const seasonalItems = [
    { name: 'Pumpkin', icon: '🎃' },
    { name: 'Apples', icon: '🍎' },
    { name: 'Brussels Sprouts', icon: '🥬' },
    { name: 'Pomegranates', icon: '🔴' }
  ];

  const units = ['pcs', 'g', 'kg', 'ml', 'l', 'cup', 'tbsp', 'tsp', 'pack'];

  // --- Handlers ---

  const openAddModal = () => {
    setEditingItemId(null);
    setItemName('');
    setItemQty('');
    setItemUnit('pcs');
    setItemExpiry('');
    setItemCategory('other');
    setShowAddModal(true);
  };

  const openEditModal = (item: PantryItem) => {
    setEditingItemId(item.id);
    setItemName(item.name);
    setItemQty(item.quantity);
    setItemUnit(item.unit);
    setItemExpiry(item.expiryDate ? item.expiryDate.split('T')[0] : '');
    setItemCategory(item.category || 'other');
    setShowAddModal(true);
  };

  const suggestCategory = () => {
     const lower = itemName.toLowerCase();
     if (['milk', 'cheese', 'yogurt', 'butter', 'cream'].some(k => lower.includes(k))) setItemCategory('dairy');
     else if (['chicken', 'beef', 'egg', 'fish', 'meat', 'tofu'].some(k => lower.includes(k))) setItemCategory('protein');
     else if (['apple', 'banana', 'spinach', 'carrot', 'onion', 'tomato', 'fruit', 'veg'].some(k => lower.includes(k))) setItemCategory('produce');
     else if (['pasta', 'rice', 'flour', 'sugar', 'oil', 'can'].some(k => lower.includes(k))) setItemCategory('pantry');
  };

  const handleSaveItem = () => {
    if (!itemName) return;

    const newItem: PantryItem = {
      id: editingItemId || Date.now().toString(),
      name: itemName,
      quantity: itemQty || '1',
      unit: itemUnit,
      expiryDate: itemExpiry ? new Date(itemExpiry).toISOString() : undefined,
      category: itemCategory
    };

    if (editingItemId) {
      updateUser({ pantry: user.pantry.map(i => i.id === editingItemId ? newItem : i) });
    } else {
      updateUser({ pantry: [newItem, ...user.pantry] });
    }
    
    setShowAddModal(false);
  };

  const deleteItem = (id: string) => {
    updateUser({ pantry: user.pantry.filter(item => item.id !== id) });
  };

  const decrementItem = (item: PantryItem) => {
     // Simple logic: if number, subtract 1. If 1, ask to delete (or just delete). 
     // For demo simplicity: if it parses as int, sub 1.
     const qtyNum = parseFloat(item.quantity);
     if (!isNaN(qtyNum) && qtyNum > 1) {
         const newItem = { ...item, quantity: (qtyNum - 1).toString() };
         updateUser({ pantry: user.pantry.map(i => i.id === item.id ? newItem : i) });
     } else {
         // If 1 or string, verify delete
         if(confirm("Item quantity is low. Remove from pantry?")) {
             deleteItem(item.id);
         }
     }
  };

  // --- AI Scan Handler ---
  const handleScanClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const analysis = await identifyPantryItem(base64String, language);
        
        if (analysis) {
          setItemName(analysis.name);
          setItemQty(analysis.quantity.toString());
          setItemUnit(analysis.unit);
          setItemCategory(analysis.category);
          if (analysis.expiryDate) {
            setItemExpiry(analysis.expiryDate);
          }
        } else {
          alert(t('pantry_analyzing_error'));
        }
        setIsAnalyzing(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setIsAnalyzing(false);
      alert(t('pantry_analyzing_error'));
    }
  };

  // --- Logic for Display ---

  const getDaysUntilExpiry = (dateStr?: string) => {
    if (!dateStr) return null;
    const today = new Date();
    const expiry = new Date(dateStr);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  };

  const getExpiryStatus = (days: number | null) => {
    if (days === null) return { 
        label: '', 
        style: 'bg-white border-slate-100', 
        iconColor: 'text-slate-300' 
    };
    if (days < 0) return { 
        label: t('p_item_expired'), 
        style: 'bg-gradient-to-r from-red-50 to-white border-l-4 border-l-red-500 shadow-red-100', 
        iconColor: 'text-red-500' 
    };
    if (days <= 2) return { 
        label: t('p_item_today'), 
        style: 'bg-gradient-to-r from-orange-50 to-white border-l-4 border-l-orange-500 shadow-orange-100', 
        iconColor: 'text-orange-500' 
    };
    if (days <= 5) return { 
        label: `${t('p_item_expiring')} (${days} ${t('p_item_days')})`, 
        style: 'bg-gradient-to-r from-amber-50 to-white border-l-4 border-l-amber-400 shadow-amber-100', 
        iconColor: 'text-amber-500' 
    };
    return { 
        label: `${days} ${t('p_item_days')}`, 
        style: 'bg-white border-slate-100', 
        iconColor: 'text-emerald-500' 
    };
  };

  // Processing Items
  const processedItems = useMemo(() => {
    let items = user.pantry.filter(item => {
        const matchesCat = filterCategory === 'all' || item.category === filterCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCat && matchesSearch;
    });

    // Sort by expiry (nulls last)
    items.sort((a, b) => {
        if (!a.expiryDate) return 1;
        if (!b.expiryDate) return -1;
        return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
    });

    const expiringSoon = items.filter(i => {
        const days = getDaysUntilExpiry(i.expiryDate);
        return days !== null && days <= 5;
    });
    
    // Grouping for the main list (excluding expiring soon if we want separate sections, 
    // but typically users want to see everything in categories, highlighting urgent ones).
    // Let's separate "Urgent" vs "Rest".
    
    const others = items.filter(i => !expiringSoon.includes(i));
    
    return { expiringSoon, others };

  }, [user.pantry, filterCategory, searchQuery]);


  const categories = [
    { id: 'all', label: 'All' },
    { id: 'produce', label: t('cat_produce') },
    { id: 'protein', label: t('cat_protein') },
    { id: 'dairy', label: t('cat_dairy') },
    { id: 'pantry', label: t('cat_pantry') },
  ];

  // Group helper
  const groupBy = (items: PantryItem[]) => {
      return items.reduce((groups, item) => {
          const cat = item.category || 'other';
          if (!groups[cat]) groups[cat] = [];
          groups[cat].push(item);
          return groups;
      }, {} as Record<string, PantryItem[]>);
  };

  const groupedOthers = groupBy(processedItems.others);

  const getCategoryIcon = (cat: string) => {
      switch(cat) {
          case 'produce': return <Leaf size={20} className="text-emerald-500" />;
          case 'dairy': return <Milk size={20} className="text-blue-500" />;
          case 'protein': return <Drumstick size={20} className="text-rose-500" />;
          case 'pantry': return <Cookie size={20} className="text-amber-500" />;
          default: return <Tag size={20} className="text-slate-400" />;
      }
  };

  const getCategoryLabel = (cat: string) => {
      switch(cat) {
          case 'produce': return t('cat_produce');
          case 'dairy': return t('cat_dairy');
          case 'protein': return t('cat_protein');
          case 'pantry': return t('cat_pantry');
          default: return t('cat_other');
      }
  };

  // --- Render Item Card ---
  const renderItemCard = (item: PantryItem) => {
    const daysLeft = getDaysUntilExpiry(item.expiryDate);
    const status = getExpiryStatus(daysLeft);

    return (
        <div key={item.id} className={`rounded-2xl p-4 mb-3 flex items-center justify-between group transition-all duration-300 relative overflow-hidden ${status.style} shadow-sm hover:shadow-md border`}>
            <div className="flex items-center gap-4 z-10">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl bg-slate-50 border border-slate-100 shadow-sm`}>
                    {item.category === 'produce' ? '🥦' : 
                    item.category === 'dairy' ? '🥛' :
                    item.category === 'protein' ? '🍗' : 
                    item.category === 'pantry' ? '🥫' : '📦'}
                </div>
                <div>
                    <h4 className="font-bold text-slate-800">{item.name}</h4>
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                        <span className="bg-slate-100 px-2 py-0.5 rounded-md">{item.quantity} {t(`unit_${item.unit}` as any)}</span>
                        {item.expiryDate && (
                            <span className={`${status.iconColor} flex items-center gap-1`}>
                                <AlertCircle size={10} /> {status.label}
                            </span>
                        )}
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-2 z-10 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => decrementItem(item)}
                  className="p-2 bg-white text-slate-400 hover:text-slate-600 border border-slate-100 rounded-xl shadow-sm hover:bg-slate-50 transition"
                  title={t('action_consume')}
                >
                    <Minus size={16} />
                </button>
                <button 
                  onClick={() => openEditModal(item)}
                  className="p-2 bg-white text-slate-400 hover:text-blue-500 border border-slate-100 rounded-xl shadow-sm hover:bg-blue-50 transition"
                  title={t('action_edit')}
                >
                    <Edit2 size={16} />
                </button>
            </div>
        </div>
    );
  };

  return (
    <div className="pb-28 pt-6 px-4 md:px-8 max-w-4xl mx-auto animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">{t('pantry_title')}</h2>
          <p className="text-slate-500 mt-1">{t('pantry_subtitle')}</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-slate-900 text-white p-3 rounded-2xl hover:bg-slate-700 transition shadow-lg active:scale-95 shadow-slate-300"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Seasonal Widget */}
      <div className="bg-gradient-to-r from-amber-200 to-orange-100 rounded-3xl p-6 mb-8 relative overflow-hidden shadow-sm">
         <div className="relative z-10">
            <h3 className="font-bold text-amber-900 flex items-center gap-2 mb-3">
               <Leaf size={18} /> {t('pantry_seasonal')}
            </h3>
            <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-hide">
               {seasonalItems.map(item => (
                  <div key={item.name} className="flex flex-col items-center bg-white/60 backdrop-blur-sm p-3 rounded-2xl min-w-[80px] shadow-sm">
                     <span className="text-2xl mb-1">{item.icon}</span>
                     <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wide text-center">{item.name}</span>
                  </div>
               ))}
            </div>
         </div>
         <div className="absolute right-0 bottom-0 opacity-10">
            <Leaf size={120} className="text-amber-900 translate-x-10 translate-y-10" />
         </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
         <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('pantry_search')}
            className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-12 pr-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-200 text-slate-700"
         />
         <Search className="absolute left-4 top-4 text-slate-400" size={20} />
      </div>

      {/* Categories Filter */}
      <div className="flex overflow-x-auto gap-2 mb-6 pb-2 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setFilterCategory(cat.id)}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              filterCategory === cat.id 
              ? 'bg-slate-800 text-white shadow-md transform scale-105' 
              : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* --- INVENTORY CONTENT --- */}
      
      {user.pantry.length === 0 ? (
          <div className="text-center py-16 opacity-60">
             <Package size={64} className="mx-auto mb-4 text-slate-200" />
             <h3 className="text-lg font-bold text-slate-700">{t('pantry_empty')}</h3>
             <p className="text-slate-500 text-sm max-w-xs mx-auto mt-2">{t('pantry_empty_sub')}</p>
          </div>
      ) : (
          <div className="space-y-8 pb-20">
             
             {/* Expiring Soon Section */}
             {processedItems.expiringSoon.length > 0 && (
                 <div className="animate-in slide-in-from-bottom-5 duration-500">
                     <h3 className="text-sm font-bold text-rose-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <AlertCircle size={16} /> {t('pantry_section_expiring')}
                     </h3>
                     <div>
                        {processedItems.expiringSoon.map(item => renderItemCard(item))}
                     </div>
                 </div>
             )}

             {/* Main List Grouped */}
             {Object.keys(groupedOthers).length > 0 && (
                 <div>
                    {Object.entries(groupedOthers).map(([cat, items]) => (
                        <div key={cat} className="mb-6 animate-in slide-in-from-bottom-5 duration-700">
                            {/* Only show headers if showing All categories */}
                            {filterCategory === 'all' && (
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2 pl-1">
                                    {getCategoryIcon(cat)} {getCategoryLabel(cat)}
                                </h3>
                            )}
                            {items.map(item => renderItemCard(item))}
                        </div>
                    ))}
                 </div>
             )}
          </div>
      )}

      {/* Floating Action Button */}
      {user.pantry.length > 0 && (
         <div className="fixed bottom-24 left-0 right-0 px-4 flex justify-center z-30 pointer-events-none">
            <button 
              onClick={() => onCookWithPantry(user.pantry.map(i => i.name))}
              className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-4 rounded-full font-bold shadow-xl shadow-rose-200 flex items-center gap-2 pointer-events-auto transition-transform hover:scale-105 active:scale-95 group"
            >
               <Utensils size={20} className="group-hover:rotate-12 transition-transform" /> {t('pantry_cook_btn')}
            </button>
         </div>
      )}

      {/* Add/Edit Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto relative">
              
              {/* Loading Overlay */}
              {isAnalyzing && (
                  <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center rounded-3xl">
                      <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-4 relative">
                          <Sparkles className="text-rose-500 animate-spin" size={32} />
                      </div>
                      <h4 className="font-bold text-slate-800 text-lg">{t('pantry_analyzing')}</h4>
                  </div>
              )}

              <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-slate-800">{editingItemId ? t('modal_edit_item') : t('modal_add_item')}</h3>
                  <button onClick={() => setShowAddModal(false)}><X size={20} className="text-slate-400" /></button>
              </div>

              {/* Scan Buttons (Both trigger same logic for MVP) */}
              {!editingItemId && (
                  <div className="grid grid-cols-2 gap-3 mb-6">
                      <input 
                         type="file" 
                         accept="image/*" 
                         capture="environment" 
                         className="hidden" 
                         ref={fileInputRef}
                         onChange={handleFileChange}
                      />
                      <button 
                         onClick={handleScanClick}
                         className="flex items-center justify-center gap-2 py-3 bg-slate-50 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-100 transition border border-slate-100 active:scale-95"
                      >
                          <Scan size={16} /> {t('pantry_scan_barcode')}
                      </button>
                      <button 
                         onClick={handleScanClick}
                         className="flex items-center justify-center gap-2 py-3 bg-slate-50 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-100 transition border border-slate-100 active:scale-95"
                      >
                          <Camera size={16} /> {t('pantry_scan_photo')}
                      </button>
                  </div>
              )}

              <div className="space-y-4">
                 <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">{t('lbl_name')}</label>
                    <input 
                      type="text" 
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      onBlur={suggestCategory}
                      placeholder="e.g., Milk, Apples"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-rose-200 outline-none transition" 
                    />
                 </div>
                 
                 <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">{t('lbl_qty')}</label>
                        <input 
                          type="number" 
                          value={itemQty}
                          onChange={(e) => setItemQty(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-rose-200 outline-none transition" 
                        />
                    </div>
                    <div className="w-1/3">
                        <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">{t('lbl_unit')}</label>
                        <select 
                          value={itemUnit}
                          onChange={(e) => setItemUnit(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-rose-200 outline-none h-[50px] transition"
                        >
                           {units.map(u => (
                               <option key={u} value={u}>{t(`unit_${u}` as any)}</option>
                           ))}
                        </select>
                    </div>
                 </div>

                 <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">{t('lbl_category')}</label>
                    <div className="grid grid-cols-2 gap-2">
                       {['produce', 'protein', 'dairy', 'pantry', 'other'].map(cat => (
                          <button 
                             key={cat}
                             onClick={() => setItemCategory(cat as any)}
                             className={`p-2 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-2 ${
                               itemCategory === cat 
                               ? 'bg-slate-800 text-white border-slate-800 shadow-md' 
                               : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50'
                             }`}
                          >
                             {getCategoryIcon(cat)} {t(`cat_${cat}` as any)}
                          </button>
                       ))}
                    </div>
                 </div>

                 <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">{t('lbl_expiry')}</label>
                    <div className="relative">
                      <input 
                        type="date" 
                        value={itemExpiry}
                        onChange={(e) => setItemExpiry(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 pl-10 focus:ring-2 focus:ring-rose-200 outline-none transition" 
                      />
                      <Calendar size={18} className="absolute left-3 top-4 text-slate-400 pointer-events-none" />
                    </div>
                 </div>

                 <div className="flex gap-3 pt-4">
                     {editingItemId && (
                         <button 
                            onClick={() => { deleteItem(editingItemId); setShowAddModal(false); }}
                            className="p-4 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition"
                         >
                             <Trash2 size={20} />
                         </button>
                     )}
                    <button 
                        onClick={handleSaveItem}
                        disabled={!itemName}
                        className="flex-1 bg-rose-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-rose-600 transition shadow-lg disabled:opacity-50 disabled:shadow-none"
                    >
                        {editingItemId ? t('btn_update') : t('btn_add')}
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default PantryScreen;