
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Scan, QrCode, Calendar, Trash2, Leaf, Milk, Drumstick, Cookie, Tag, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PantryItem } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { identifyPantryItem } from '../../services/geminiService';

interface PantryEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Partial<PantryItem>) => void;
  onDelete: (id: string) => void;
  initialItem?: PantryItem | null;
}

const PantryEditModal: React.FC<PantryEditModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  onDelete, 
  initialItem 
}) => {
  const { t, language } = useLanguage();
  
  // Form State
  const [name, setName] = useState('');
  const [qty, setQty] = useState('');
  const [unit, setUnit] = useState('pcs');
  const [expiry, setExpiry] = useState('');
  const [category, setCategory] = useState<PantryItem['category']>('other');
  const [calories, setCalories] = useState('');
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const units = ['pcs', 'g', 'kg', 'ml', 'l', 'cup', 'tbsp', 'tsp', 'pack'];
  const categories = ['produce', 'protein', 'dairy', 'pantry', 'other'];

  useEffect(() => {
    if (isOpen) {
      if (initialItem) {
        setName(initialItem.name);
        setQty(initialItem.quantity);
        setUnit(initialItem.unit);
        setExpiry(initialItem.expiryDate ? initialItem.expiryDate.split('T')[0] : '');
        setCategory(initialItem.category || 'other');
        setCalories(initialItem.calories ? initialItem.calories.toString() : '');
      } else {
        // Reset defaults for new item
        setName('');
        setQty('');
        setUnit('pcs');
        setExpiry('');
        setCategory('other');
        setCalories('');
      }
    }
  }, [isOpen, initialItem]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      name,
      quantity: qty || '1',
      unit,
      expiryDate: expiry ? new Date(expiry).toISOString() : undefined,
      category,
      calories: calories ? parseInt(calories) : undefined
    });
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
          setName(analysis.name);
          setQty(analysis.quantity.toString());
          setUnit(analysis.unit);
          setCategory(analysis.category);
          if (analysis.calories) setCalories(analysis.calories.toString());
          if (analysis.expiryDate) setExpiry(analysis.expiryDate);
        } else {
          alert("AI Scan failed or API Key is missing. Please enter details manually.");
        }
        setIsAnalyzing(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setIsAnalyzing(false);
      alert("Error reading file.");
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch(cat) {
      case 'produce': return <Leaf size={14} />;
      case 'dairy': return <Milk size={14} />;
      case 'protein': return <Drumstick size={14} />;
      case 'pantry': return <Cookie size={14} />;
      default: return <Tag size={14} />;
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center sm:p-4 bg-stone-900/60 backdrop-blur-sm font-sans"
        >
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-[#F9F8F6] w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 shadow-2xl overflow-hidden relative max-h-[90vh] overflow-y-auto pb-10"
          >
            {/* Loading AI Overlay */}
            {isAnalyzing && (
              <div className="absolute inset-0 z-50 bg-white/95 flex flex-col items-center justify-center">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  className="w-20 h-20 border-4 border-rose-100 border-t-rose-500 rounded-full mb-4"
                />
                <h4 className="font-editorial italic text-xl animate-pulse text-stone-900">{t('pantry_analyzing')}</h4>
              </div>
            )}

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-editorial italic text-2xl text-stone-900">
                {initialItem ? t('modal_edit_item') : t('modal_add_item')}
              </h3>
              <button 
                onClick={onClose} 
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:rotate-90 transition-transform"
              >
                <X size={20} className="text-stone-500" />
              </button>
            </div>

            {/* AI Scanner Buttons (Only for new items) */}
            {!initialItem && (
              <div className="flex gap-3 mb-6">
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                <button 
                  onClick={() => { if(navigator.vibrate) navigator.vibrate(10); fileInputRef.current?.click(); }} 
                  className="flex-1 bg-stone-900 text-white py-4 rounded-2xl flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform shadow-lg shadow-stone-300"
                >
                  <Scan size={24} className="text-rose-400" />
                  <span className="text-[10px] font-brutal font-bold uppercase tracking-widest">{t('pantry_scan_photo')}</span>
                </button>
                <button 
                   onClick={() => { if(navigator.vibrate) navigator.vibrate(10); fileInputRef.current?.click(); }}
                   className="flex-1 bg-white border border-stone-200 text-stone-600 py-4 rounded-2xl flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform"
                >
                  <QrCode size={24} />
                  <span className="text-[10px] font-brutal font-bold uppercase tracking-widest">{t('pantry_scan_barcode')}</span>
                </button>
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Name */}
              <div className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm focus-within:ring-2 ring-rose-200 transition-all">
                <label className="text-[10px] font-brutal font-bold text-stone-400 uppercase tracking-widest block mb-1">
                    {t('lbl_name')}
                </label>
                <input 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    className="w-full text-lg font-bold outline-none text-stone-800 placeholder:text-stone-300 bg-transparent" 
                    placeholder="e.g. Bounty, Avocado"
                    autoFocus={!initialItem}
                />
              </div>

              {/* Qty & Unit */}
              <div className="flex gap-3">
                <div className="flex-1 bg-white p-4 rounded-2xl border border-stone-100 shadow-sm">
                  <label className="text-[10px] font-brutal font-bold text-stone-400 uppercase tracking-widest block mb-1">
                    {t('lbl_qty')}
                  </label>
                  <input 
                    type="number" 
                    value={qty} 
                    onChange={e => setQty(e.target.value)} 
                    className="w-full text-lg font-bold outline-none text-stone-800 bg-transparent" 
                    placeholder="1" 
                  />
                </div>
                <div className="w-1/3 bg-white p-4 rounded-2xl border border-stone-100 shadow-sm">
                  <label className="text-[10px] font-brutal font-bold text-stone-400 uppercase tracking-widest block mb-1">
                    {t('lbl_unit')}
                  </label>
                  <select 
                    value={unit} 
                    onChange={e => setUnit(e.target.value)} 
                    className="w-full text-sm font-bold outline-none text-stone-800 bg-transparent appearance-none"
                  >
                    {units.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              {/* Calories (New Field) */}
              <div className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm flex items-center gap-3">
                <Flame size={20} className="text-orange-400" />
                <div className="flex-1">
                  <label className="text-[10px] font-brutal font-bold text-stone-400 uppercase tracking-widest block">
                    Calories (kcal)
                  </label>
                  <input 
                    type="number"
                    value={calories} 
                    onChange={e => setCalories(e.target.value)} 
                    className="w-full text-lg font-bold outline-none text-stone-800 bg-transparent mt-1"
                    placeholder="e.g. 250" 
                  />
                </div>
              </div>
              
              {/* Category Chips */}
              <div className="overflow-x-auto pb-2 flex gap-2 scrollbar-hide">
                {categories.map(cat => (
                  <button 
                    key={cat} 
                    onClick={() => setCategory(cat as any)}
                    className={`px-4 py-3 rounded-xl text-xs font-bold border flex-shrink-0 flex items-center gap-2 transition-all duration-300 ${
                        category === cat 
                        ? 'bg-stone-900 text-white border-stone-900 shadow-md' 
                        : 'bg-white text-stone-500 border-stone-100'
                    }`}
                  >
                    {getCategoryIcon(cat)} {t(`cat_${cat}` as any)}
                  </button>
                ))}
              </div>

              {/* Expiry Date */}
              <div className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm flex items-center gap-3">
                <Calendar size={20} className="text-stone-400" />
                <div className="flex-1">
                  <label className="text-[10px] font-brutal font-bold text-stone-400 uppercase tracking-widest block">
                    {t('lbl_expiry')}
                  </label>
                  <input 
                    type="date" 
                    value={expiry} 
                    onChange={e => setExpiry(e.target.value)} 
                    className="w-full text-sm font-bold outline-none text-stone-800 bg-transparent mt-1" 
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex gap-3">
                {initialItem && (
                  <button 
                    onClick={() => onDelete(initialItem.id)} 
                    className="p-4 rounded-[1.5rem] bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                  >
                    <Trash2 size={24} />
                  </button>
                )}
                <button 
                    onClick={handleSave} 
                    disabled={!name} 
                    className="flex-1 bg-rose-500 text-white py-4 rounded-[1.5rem] font-bold text-lg shadow-xl shadow-rose-200 active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none hover:bg-rose-600"
                >
                  {initialItem ? t('btn_update') : t('btn_add')}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default PantryEditModal;
