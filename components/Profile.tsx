
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Settings, Crown, ChevronRight, Globe, Camera, 
  Edit2, User, Sparkles, X, Shield, 
  MessageCircle, Scale, Activity, LogOut, Bell, Moon, Trash2, Check, Send, Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';
import { streamChatResponse } from '../services/geminiService';

type ModalType = 'settings' | 'language' | 'account' | 'privacy' | 'help' | 'weight' | 'goals' | null;

const languages = [
  { code: 'uz', label: 'Oʻzbek', flag: '🇺🇿' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'kk', label: 'Қазақ', flag: '🇰🇿' },
  { code: 'ky', label: 'Кыргыз', flag: '🇰🇬' },
  { code: 'tg', label: 'Тоҷикӣ', flag: '🇹🇯' },
];

const Profile: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const { user, updateUser } = useUser();
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  // --- Modal Specific States ---
  
  // Account Data
  const [accName, setAccName] = useState(user.name);
  const [accEmail, setAccEmail] = useState(user.email);
  
  // Weight
  const [weightInput, setWeightInput] = useState(user.dailyStats.weight?.toString() || '');

  // Goals
  const [newGoal, setNewGoal] = useState('');

  // AI Help
  const [helpInput, setHelpInput] = useState('');
  const [helpMessages, setHelpMessages] = useState<{role: 'user' | 'model', text: string}[]>([
      { role: 'model', text: t('chat_welcome') } // Reusing welcome msg or custom
  ]);
  const [isHelpTyping, setIsHelpTyping] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Handlers ---

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => updateUser({ avatarUrl: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const saveAccountData = () => {
    updateUser({ name: accName, email: accEmail });
    setActiveModal(null);
  };

  const saveWeight = () => {
      const w = parseFloat(weightInput);
      if(!isNaN(w)) {
          updateUser({ dailyStats: { ...user.dailyStats, weight: w } });
      }
      setActiveModal(null);
  };

  const addGoal = () => {
      if(newGoal.trim()) {
          updateUser({ goals: [...user.goals, newGoal.trim()] });
          setNewGoal('');
      }
  };

  const removeGoal = (g: string) => {
      updateUser({ goals: user.goals.filter(goal => goal !== g) });
  };

  const sendHelpMessage = async () => {
      if(!helpInput.trim()) return;
      const userText = helpInput;
      setHelpMessages(prev => [...prev, { role: 'user', text: userText }]);
      setHelpInput('');
      setIsHelpTyping(true);

      // Simple AI Help Context
      const systemContext = "You are a helpful support assistant for the 'NourishHer' app. Help the user with app features like Pantry, Smart Fridge, and Tracker. Keep answers short.";
      const history = [{ role: 'user', parts: [{ text: systemContext }] }, ...helpMessages.map(m => ({ role: m.role, parts: [{ text: m.text }] }))];
      
      try {
          const stream = streamChatResponse(history, userText, language);
          let responseText = "";
          setHelpMessages(prev => [...prev, { role: 'model', text: "" }]);
          
          for await (const chunk of stream) {
              responseText += chunk;
              setHelpMessages(prev => {
                  const newArr = [...prev];
                  newArr[newArr.length - 1].text = responseText;
                  return newArr;
              });
          }
      } catch (e) {
          console.error(e);
      } finally {
          setIsHelpTyping(false);
      }
  };

  // --- Render ---

  return (
    <div className="min-h-screen pt-8 px-4 md:px-8 max-w-4xl mx-auto animate-in fade-in duration-700 pb-32">
      
      {/* Header */}
      <div className="flex justify-between items-end mb-8 px-2">
        <h1 className="text-5xl font-editorial italic font-bold text-stone-900 leading-[0.9]">
          {t('profile_myspace')}
        </h1>
        <button 
            onClick={() => setActiveModal('settings')}
            className="p-3 bg-white rounded-2xl shadow-sm border border-stone-100 text-stone-600 hover:rotate-90 transition-transform duration-500 active:scale-95"
        >
          <Settings size={22} />
        </button>
      </div>

      {/* BENTO GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-24">
         
         {/* 1. ID CARD */}
         <div className="col-span-2 bg-white rounded-[2.5rem] p-6 shadow-sm border border-stone-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-100 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10 flex items-center gap-5">
               <div className="relative cursor-pointer hover:scale-105 transition-transform" onClick={() => fileInputRef.current?.click()}>
                  {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt="Profile" className="w-20 h-20 rounded-2xl object-cover shadow-lg rotate-3 group-hover:rotate-0 transition-transform duration-500" />
                  ) : (
                      <div className="w-20 h-20 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-400 shadow-inner rotate-3 group-hover:rotate-0 transition-transform">
                          <User size={32} />
                      </div>
                  )}
                  <div className="absolute -bottom-2 -right-2 bg-white text-stone-900 p-1.5 rounded-lg shadow-sm border border-stone-100">
                     <Camera size={12} />
                  </div>
                  <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
               </div>
               
               <div className="flex-1">
                   <div className="flex items-center justify-between">
                       <h2 className="text-2xl font-editorial italic font-bold text-stone-900">{user.name}</h2>
                       <button onClick={() => setActiveModal('account')}><Edit2 size={14} className="text-stone-300 hover:text-stone-900 transition-colors" /></button>
                   </div>
                   <p className="text-[10px] font-brutal font-bold text-stone-400 uppercase tracking-widest mt-1 truncate max-w-[150px]">{user.email}</p>
               </div>
            </div>

            <div className="mt-6 flex gap-3">
               <button onClick={() => { if(navigator.vibrate) navigator.vibrate(10); }} className="flex-1 bg-stone-50 rounded-2xl p-3 flex flex-col items-center justify-center hover:bg-rose-50 hover:scale-[1.02] transition-all">
                  <Activity size={16} className="text-rose-400 mb-1" />
                  <span className="text-xl font-bold text-stone-900">12</span>
                  <span className="text-[9px] font-brutal uppercase tracking-wider text-stone-400">{t('profile_day_streak')}</span>
               </button>
               
               <button onClick={() => setActiveModal('weight')} className="flex-1 bg-stone-50 rounded-2xl p-3 flex flex-col items-center justify-center hover:bg-indigo-50 hover:scale-[1.02] transition-all">
                  <Scale size={16} className="text-indigo-400 mb-1" />
                  <span className="text-xl font-bold text-stone-900">{user.dailyStats?.weight || '--'}</span>
                  <span className="text-[9px] font-brutal uppercase tracking-wider text-stone-400">{t('profile_kg_curr')}</span>
               </button>
            </div>
         </div>

         {/* 2. SETTINGS TILES */}
         <button 
           onClick={() => setActiveModal('language')}
           className="col-span-1 bg-white rounded-[2rem] p-4 shadow-sm border border-stone-100 hover:scale-[1.02] active:scale-95 transition-all flex flex-col items-center justify-center gap-2 group"
         >
            <Globe size={24} className="text-stone-400 group-hover:text-stone-900 transition-colors" strokeWidth={1.5} />
            <span className="text-xs font-brutal font-bold uppercase">{languages.find(l => l.code === language)?.label || language}</span>
         </button>

         <button 
            onClick={() => setActiveModal('privacy')}
            className="col-span-1 bg-emerald-50 rounded-[2rem] p-4 shadow-sm border border-emerald-100 hover:scale-[1.02] active:scale-95 transition-all flex flex-col items-center justify-center gap-2 text-emerald-700"
         >
            <Shield size={24} strokeWidth={1.5} />
            <span className="text-xs font-brutal font-bold uppercase">{t('profile_privacy')}</span>
         </button>

         {/* 3. GOALS */}
         <div className="col-span-2 bg-white rounded-[2.5rem] p-6 shadow-sm border border-stone-100 relative overflow-hidden">
             <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-2">
                     <Sparkles size={16} className="text-amber-400" />
                     <h3 className="text-sm font-brutal font-bold uppercase tracking-widest text-stone-900">{t('profile_focus_areas')}</h3>
                 </div>
                 <button onClick={() => setActiveModal('goals')} className="text-stone-400 hover:text-stone-900"><Edit2 size={12} /></button>
             </div>
             <div className="flex flex-wrap gap-2">
                {user.goals?.map(goal => (
                   <span key={goal} className="px-4 py-2 bg-stone-50 rounded-xl text-xs font-bold text-stone-600 border border-stone-200">
                      {goal}
                   </span>
                ))}
                <button onClick={() => setActiveModal('goals')} className="w-8 h-8 rounded-full border border-dashed border-stone-300 flex items-center justify-center text-stone-400 hover:border-stone-500 hover:text-stone-600">
                   <Plus size={14} />
                </button>
             </div>
         </div>

         {/* 4. MENU ITEMS */}
         <div className="col-span-2 flex flex-col gap-2">
             <MenuItem onClick={() => setActiveModal('help')} icon={<MessageCircle size={18} />} label={t('profile_help')} />
             <MenuItem onClick={() => setActiveModal('account')} icon={<User size={18} />} label={t('profile_account_data')} />
         </div>
      </div>

      {/* --- MODALS (PORTALED) --- */}
      {createPortal(
        <AnimatePresence>
          {activeModal && (
              <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={() => setActiveModal(null)}
                  className="fixed inset-0 z-[150] bg-stone-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4 font-sans"
              >
                  <motion.div 
                      initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                      transition={{ type: "spring", damping: 25, stiffness: 300 }}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-[#F9F8F6] w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col relative"
                  >
                      {/* Modal Header */}
                      <div className="flex justify-between items-center mb-6 shrink-0">
                          <h3 className="font-editorial italic text-2xl text-stone-900 capitalize">
                              {activeModal === 'account' ? t('profile_account_data') : 
                               activeModal === 'help' ? t('profile_help') : 
                               activeModal}
                          </h3>
                          <button onClick={() => setActiveModal(null)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-stone-500 hover:bg-stone-100">
                              <X size={20} />
                          </button>
                      </div>

                      {/* Modal Content */}
                      <div className="overflow-y-auto pb-4 px-1">
                          
                          {/* LANGUAGE */}
                          {activeModal === 'language' && (
                              <div className="space-y-2">
                                  {languages.map(lang => (
                                      <button 
                                          key={lang.code}
                                          onClick={() => { setLanguage(lang.code as any); setActiveModal(null); }}
                                          className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${language === lang.code ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-600 border-stone-100 hover:border-stone-300'}`}
                                      >
                                          <div className="flex items-center gap-3">
                                              <span className="text-2xl">{lang.flag}</span>
                                              <span className="font-bold">{lang.label}</span>
                                          </div>
                                          {language === lang.code && <Check size={18} />}
                                      </button>
                                  ))}
                              </div>
                          )}

                          {/* SETTINGS */}
                          {activeModal === 'settings' && (
                              <div className="space-y-3">
                                  <div className="bg-white p-4 rounded-2xl border border-stone-100 flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                          <div className="p-2 bg-stone-100 rounded-lg"><Bell size={18} /></div>
                                          <span className="font-bold text-stone-700">Notifications</span>
                                      </div>
                                      <div className="w-10 h-6 bg-emerald-500 rounded-full relative"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" /></div>
                                  </div>
                                  <div className="bg-white p-4 rounded-2xl border border-stone-100 flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                          <div className="p-2 bg-stone-100 rounded-lg"><Moon size={18} /></div>
                                          <span className="font-bold text-stone-700">Dark Mode</span>
                                      </div>
                                      <div className="w-10 h-6 bg-stone-200 rounded-full relative"><div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full" /></div>
                                  </div>
                                  <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="w-full p-4 rounded-2xl bg-red-50 text-red-500 font-bold flex items-center justify-center gap-2 mt-4">
                                      <LogOut size={18} /> Reset App Data
                                  </button>
                              </div>
                          )}

                          {/* ACCOUNT DATA */}
                          {activeModal === 'account' && (
                              <div className="space-y-4">
                                  <div className="space-y-1">
                                      <label className="text-xs font-bold uppercase tracking-wider text-stone-400">Name</label>
                                      <input value={accName} onChange={(e) => setAccName(e.target.value)} className="w-full p-4 bg-white rounded-2xl border border-stone-200 font-bold outline-none focus:border-stone-900 transition-colors" />
                                  </div>
                                  <div className="space-y-1">
                                      <label className="text-xs font-bold uppercase tracking-wider text-stone-400">Email</label>
                                      <input value={accEmail} onChange={(e) => setAccEmail(e.target.value)} className="w-full p-4 bg-white rounded-2xl border border-stone-200 font-bold outline-none focus:border-stone-900 transition-colors" />
                                  </div>
                                  <button onClick={saveAccountData} className="w-full py-4 bg-stone-900 text-white rounded-2xl font-bold mt-4 shadow-lg">Save Changes</button>
                              </div>
                          )}

                          {/* WEIGHT */}
                          {activeModal === 'weight' && (
                              <div className="flex flex-col items-center">
                                  <div className="w-full bg-white rounded-[2.5rem] p-8 mb-6 flex flex-col items-center justify-center border border-stone-100 shadow-inner">
                                      <input 
                                          type="number" 
                                          value={weightInput} 
                                          onChange={(e) => setWeightInput(e.target.value)}
                                          className="text-6xl font-editorial italic text-stone-900 text-center w-full bg-transparent outline-none placeholder:text-stone-200"
                                          placeholder="0.0"
                                          autoFocus
                                      />
                                      <span className="text-stone-400 font-bold mt-2">kg</span>
                                  </div>
                                  <button onClick={saveWeight} className="w-full py-4 bg-indigo-500 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200">Update Weight</button>
                              </div>
                          )}

                          {/* GOALS */}
                          {activeModal === 'goals' && (
                              <div className="space-y-4">
                                  <div className="flex flex-wrap gap-2 mb-4">
                                      {user.goals.map(g => (
                                          <span key={g} className="px-4 py-2 bg-white border border-stone-200 rounded-xl font-bold text-stone-600 flex items-center gap-2">
                                              {g}
                                              <button onClick={() => removeGoal(g)} className="text-stone-300 hover:text-red-500"><X size={12} /></button>
                                          </span>
                                      ))}
                                  </div>
                                  <div className="flex gap-2">
                                      <input 
                                          value={newGoal} 
                                          onChange={(e) => setNewGoal(e.target.value)}
                                          placeholder="Add new goal..."
                                          className="flex-1 p-4 bg-white rounded-2xl border border-stone-200 font-bold outline-none"
                                          onKeyDown={(e) => e.key === 'Enter' && addGoal()}
                                      />
                                      <button onClick={addGoal} className="w-14 bg-stone-900 text-white rounded-2xl flex items-center justify-center"><Plus /></button>
                                  </div>
                              </div>
                          )}

                          {/* PRIVACY */}
                          {activeModal === 'privacy' && (
                              <div className="prose prose-stone prose-sm">
                                  <p className="font-bold">Privacy is our priority.</p>
                                  <p>All your data, including pantry items, photos, and chat history, is stored locally on your device or securely transmitted to our AI partners solely for processing your requests.</p>
                                  <p>We do not sell your personal data. You are in control.</p>
                                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-800 font-medium text-xs mt-4 flex gap-2">
                                      <Shield size={16} />
                                      Secured with End-to-End Encryption standards.
                                  </div>
                              </div>
                          )}

                          {/* AI HELP */}
                          {activeModal === 'help' && (
                              <div className="flex flex-col h-[50vh]">
                                  <div className="flex-1 overflow-y-auto space-y-3 mb-4 p-2">
                                      {helpMessages.map((msg, idx) => (
                                          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                              <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-stone-900 text-white rounded-br-sm' : 'bg-white border border-stone-200 text-stone-800 rounded-bl-sm'}`}>
                                                  {msg.text}
                                              </div>
                                          </div>
                                      ))}
                                      {isHelpTyping && <div className="text-xs text-stone-400 ml-2 animate-pulse">Typing...</div>}
                                  </div>
                                  <div className="flex gap-2 bg-white p-2 rounded-2xl border border-stone-200">
                                      <input 
                                          value={helpInput}
                                          onChange={(e) => setHelpInput(e.target.value)}
                                          placeholder="Ask a question..."
                                          className="flex-1 bg-transparent outline-none pl-2 text-sm"
                                          onKeyDown={(e) => e.key === 'Enter' && sendHelpMessage()}
                                      />
                                      <button onClick={sendHelpMessage} className="p-2 bg-rose-500 text-white rounded-xl"><Send size={16} /></button>
                                  </div>
                              </div>
                          )}

                      </div>
                  </motion.div>
              </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

    </div>
  );
};

const MenuItem = ({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) => (
    <button onClick={onClick} className="w-full bg-white p-4 rounded-[1.5rem] flex items-center justify-between shadow-sm border border-stone-100 hover:bg-stone-50 transition-colors group active:scale-[0.98]">
        <div className="flex items-center gap-3 text-stone-600 group-hover:text-stone-900">
            {icon}
            <span className="font-bold text-sm">{label}</span>
        </div>
        <ChevronRight size={16} className="text-stone-300 group-hover:translate-x-1 transition-transform" />
    </button>
);

export default Profile;
