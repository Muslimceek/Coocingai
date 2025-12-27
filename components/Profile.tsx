
import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Settings, Crown, ChevronRight, Globe, Camera, 
  Edit2, User, Sparkles, X, Shield, 
  MessageCircle, Scale, Activity, LogOut, Bell, Moon, Trash2, Check, Send, Plus, Zap, HeartPulse
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';
import { streamChatResponse } from '../services/geminiService';

// --- TYPES & CONFIG ---
type SheetType = 'settings' | 'language' | 'account' | 'privacy' | 'help' | 'weight' | 'goals' | null;

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
  const [activeSheet, setActiveSheet] = useState<SheetType>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- DERIVED STATE (AI WELLNESS PULSE) ---
  const wellnessStatus = React.useMemo(() => {
     const streak = 12; // In real app, calculate from user.history
     const mood = user.dailyStats.mood;
     const water = user.dailyStats.waterMl / user.dailyStats.waterGoalMl;
     
     if (streak > 7 && water > 0.8) return { 
         label: "Unstoppable Flow", 
         color: "from-rose-400 to-orange-400", 
         icon: <Zap size={18} />, 
         msg: "Your consistency is creating a new baseline." 
     };
     if (mood === 'stressed' || mood === 'tired') return { 
         label: "Rest & Restore", 
         color: "from-blue-400 to-indigo-400", 
         icon: <Moon size={18} />, 
         msg: "Prioritize sleep today. Your body needs it." 
     };
     return { 
         label: "Building Rhythm", 
         color: "from-emerald-400 to-teal-400", 
         icon: <HeartPulse size={18} />, 
         msg: "You are on the right path. Keep pushing." 
     };
  }, [user]);

  // --- HANDLERS ---
  const vibrate = () => { if(navigator.vibrate) navigator.vibrate(10); };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => updateUser({ avatarUrl: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen pt-8 px-4 md:px-8 max-w-4xl mx-auto pb-36 font-sans">
      
      {/* 1. HEADER (Spatial Typography) */}
      <div className="flex justify-between items-end mb-8 px-2 relative z-10">
        <div>
            <span className="text-[10px] font-brutal font-black text-stone-400 uppercase tracking-[0.2em] mb-1 block">Identity</span>
            <h1 className="text-5xl font-editorial italic font-bold text-stone-900 leading-[0.9]">
            {t('profile_myspace')}
            </h1>
        </div>
        <button 
            onClick={() => { vibrate(); setActiveSheet('settings'); }}
            className="w-12 h-12 bg-white/60 backdrop-blur-xl rounded-full border border-white/50 flex items-center justify-center text-stone-600 hover:rotate-90 transition-transform duration-500 shadow-sm"
        >
          <Settings size={22} strokeWidth={1.5} />
        </button>
      </div>

      {/* 2. HOLOGRAPHIC BENTO GRID */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 md:gap-4">
         
         {/* A. IDENTITY CARD (Glassmorphism 2.0) */}
         <motion.div 
            whileHover={{ y: -5 }}
            className="col-span-2 md:col-span-4 bg-white/60 backdrop-blur-2xl rounded-[2.5rem] p-6 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] border border-white/50 relative overflow-hidden group"
         >
            {/* Ambient Light Emitter */}
            <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-br ${wellnessStatus.color} rounded-full blur-[80px] opacity-30 -translate-y-1/2 translate-x-1/2`} />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
               <div className="relative cursor-pointer group/avatar" onClick={() => fileInputRef.current?.click()}>
                  <div className="w-24 h-24 rounded-[2rem] p-[3px] bg-gradient-to-br from-white to-stone-200 shadow-lg relative z-10">
                      {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt="Profile" className="w-full h-full rounded-[1.8rem] object-cover" />
                      ) : (
                          <div className="w-full h-full rounded-[1.8rem] bg-stone-100 flex items-center justify-center text-stone-300">
                              <User size={32} />
                          </div>
                      )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-stone-900 text-white p-2 rounded-xl shadow-lg border border-white/20 scale-90 opacity-0 group-hover/avatar:opacity-100 group-hover/avatar:scale-100 transition-all">
                     <Camera size={14} />
                  </div>
                  <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
               </div>
               
               <div className="flex-1 text-center md:text-left">
                   <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                       <h2 className="text-3xl font-editorial italic font-bold text-stone-900">{user.name}</h2>
                       <button onClick={() => setActiveSheet('account')} className="text-stone-300 hover:text-stone-900 transition-colors p-1"><Edit2 size={14} /></button>
                   </div>
                   <p className="text-xs font-brutal font-bold text-stone-400 uppercase tracking-widest mb-4">{user.email}</p>
                   
                   {/* Mini Stats Row */}
                   <div className="flex justify-center md:justify-start gap-3">
                       <div className="px-4 py-2 bg-white/50 rounded-xl border border-white/50 flex items-center gap-2">
                           <Activity size={14} className="text-rose-500" />
                           <span className="text-sm font-bold text-stone-800">12 Day Streak</span>
                       </div>
                       <div className="px-4 py-2 bg-white/50 rounded-xl border border-white/50 flex items-center gap-2">
                           <Crown size={14} className="text-amber-500" />
                           <span className="text-sm font-bold text-stone-800">Pro Member</span>
                       </div>
                   </div>
               </div>
            </div>
         </motion.div>

         {/* B. WELLNESS PULSE (AI Killer Feature) */}
         <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveSheet('help')}
            className="col-span-2 md:col-span-2 bg-stone-900 rounded-[2.5rem] p-6 relative overflow-hidden flex flex-col justify-between text-left group"
         >
             {/* Alive Background */}
             <div className={`absolute inset-0 bg-gradient-to-br ${wellnessStatus.color} opacity-20 group-hover:opacity-30 transition-opacity duration-700`} />
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
             
             <div className="relative z-10 flex justify-between items-start w-full">
                 <div className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white">
                     {wellnessStatus.icon}
                 </div>
                 <span className="text-[9px] font-brutal font-bold uppercase tracking-widest text-white/60">AI Analysis</span>
             </div>

             <div className="relative z-10 mt-4">
                 <h3 className="text-white text-xl font-editorial italic leading-none mb-2">{wellnessStatus.label}</h3>
                 <p className="text-white/70 text-xs font-medium leading-relaxed">{wellnessStatus.msg}</p>
             </div>
         </motion.button>

         {/* C. WEIGHT WIDGET */}
         <motion.button 
            whileHover={{ y: -5 }}
            onClick={() => setActiveSheet('weight')}
            className="col-span-1 md:col-span-2 bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-5 border border-white/50 shadow-sm flex flex-col items-center justify-center gap-1 group"
         >
            <Scale size={24} className="text-stone-300 group-hover:text-stone-900 transition-colors mb-2" strokeWidth={1.5} />
            <span className="text-3xl font-editorial italic text-stone-900">{user.dailyStats.weight || '--'}</span>
            <span className="text-[9px] font-brutal font-bold uppercase tracking-widest text-stone-400">Current Kg</span>
         </motion.button>

         {/* D. LANGUAGE TILE */}
         <motion.button 
           whileHover={{ y: -5 }}
           onClick={() => setActiveSheet('language')}
           className="col-span-1 md:col-span-2 bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-5 border border-white/50 shadow-sm flex flex-col items-center justify-center gap-2 group"
         >
            <Globe size={24} className="text-stone-300 group-hover:text-stone-900 transition-colors" strokeWidth={1.5} />
            <span className="text-sm font-brutal font-bold uppercase text-stone-900">{languages.find(l => l.code === language)?.label || language}</span>
         </motion.button>

         {/* E. GOALS & PRIVACY STRIP */}
         <div className="col-span-2 md:col-span-6 flex flex-col gap-2 mt-2">
             <MenuTile onClick={() => setActiveSheet('goals')} icon={<Sparkles size={18} />} label={t('profile_focus_areas')} count={user.goals.length} />
             <MenuTile onClick={() => setActiveSheet('privacy')} icon={<Shield size={18} />} label={t('profile_privacy')} />
             <MenuTile onClick={() => setActiveSheet('help')} icon={<MessageCircle size={18} />} label={t('profile_help')} />
         </div>
      </div>

      {/* --- BOTTOM SHEETS (Spatial Modals) --- */}
      <BottomSheet isOpen={!!activeSheet} onClose={() => setActiveSheet(null)} title={activeSheet ? t(`profile_${activeSheet}` as any) || activeSheet : ''}>
          {activeSheet === 'language' && <LanguageSheet />}
          {activeSheet === 'settings' && <SettingsSheet />}
          {activeSheet === 'account' && <AccountSheet onClose={() => setActiveSheet(null)} />}
          {activeSheet === 'weight' && <WeightSheet onClose={() => setActiveSheet(null)} />}
          {activeSheet === 'goals' && <GoalsSheet />}
          {activeSheet === 'privacy' && <PrivacySheet />}
          {activeSheet === 'help' && <HelpSheet />}
      </BottomSheet>

    </div>
  );
};

// --- SUB-COMPONENTS (ATOMS & MOLECULES) ---

const MenuTile = ({ icon, label, onClick, count }: { icon: React.ReactNode, label: string, onClick: () => void, count?: number }) => (
    <motion.button 
        whileTap={{ scale: 0.98 }}
        onClick={onClick} 
        className="w-full bg-white/70 backdrop-blur-md p-4 rounded-[1.5rem] flex items-center justify-between shadow-sm border border-white/50 hover:bg-white/90 transition-colors group"
    >
        <div className="flex items-center gap-4 text-stone-600 group-hover:text-stone-900">
            <div className="p-2 bg-white rounded-full shadow-sm text-stone-400 group-hover:text-stone-900 transition-colors">{icon}</div>
            <span className="font-bold text-sm">{label}</span>
        </div>
        <div className="flex items-center gap-3">
            {count !== undefined && <span className="text-xs font-bold text-stone-400 bg-stone-100 px-2 py-1 rounded-md">{count}</span>}
            <ChevronRight size={16} className="text-stone-300 group-hover:translate-x-1 transition-transform" />
        </div>
    </motion.button>
);

const BottomSheet = ({ isOpen, onClose, children, title }: { isOpen: boolean, onClose: () => void, children: React.ReactNode, title: string }) => {
    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-stone-900/40 backdrop-blur-[2px]"
                        onClick={onClose}
                    />
                    <motion.div 
                        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 z-[101] bg-[#F9F8F6] rounded-t-[2.5rem] p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] max-h-[90vh] flex flex-col"
                    >
                        <div className="flex justify-between items-center mb-6 shrink-0">
                             <h3 className="font-editorial italic text-2xl text-stone-900 capitalize">{title}</h3>
                             <button onClick={onClose} className="w-10 h-10 bg-stone-200 rounded-full flex items-center justify-center text-stone-500 hover:bg-stone-300 transition-colors">
                                 <X size={20} />
                             </button>
                        </div>
                        <div className="overflow-y-auto pb-8">{children}</div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
}

// --- SHEET CONTENTS ---

const LanguageSheet = () => {
    const { language, setLanguage } = useLanguage();
    return (
        <div className="grid grid-cols-1 gap-2">
            {languages.map(lang => (
                <button 
                    key={lang.code}
                    onClick={() => setLanguage(lang.code as any)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${language === lang.code ? 'bg-stone-900 text-white border-stone-900 shadow-md' : 'bg-white text-stone-600 border-stone-100'}`}
                >
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">{lang.flag}</span>
                        <span className="font-bold">{lang.label}</span>
                    </div>
                    {language === lang.code && <Check size={18} />}
                </button>
            ))}
        </div>
    );
};

const SettingsSheet = () => {
    const { updateUser } = useUser();
    return (
        <div className="space-y-3">
            <div className="bg-white p-5 rounded-3xl border border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-50 rounded-xl text-rose-500"><Bell size={20} /></div>
                    <div>
                        <span className="font-bold text-stone-900 block text-sm">Notifications</span>
                        <span className="text-xs text-stone-400 font-medium">Meal reminders & tips</span>
                    </div>
                </div>
                <div className="w-12 h-7 bg-emerald-500 rounded-full relative"><div className="absolute right-1 top-1 w-5 h-5 bg-white rounded-full shadow-sm" /></div>
            </div>
            
            <button 
                onClick={() => { if(confirm('Reset all data?')) { localStorage.clear(); window.location.reload(); } }} 
                className="w-full p-5 rounded-3xl bg-red-50 text-red-500 font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
            >
                <LogOut size={20} /> Reset App Data
            </button>
        </div>
    );
}

const AccountSheet = ({ onClose }: { onClose: () => void }) => {
    const { user, updateUser } = useUser();
    const [name, setName] = useState(user.name);
    
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <label className="text-[10px] font-brutal font-bold uppercase tracking-widest text-stone-400">Display Name</label>
                <input 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white p-4 rounded-2xl border border-stone-200 text-lg font-bold outline-none focus:border-stone-900 transition-colors" 
                />
            </div>
            <button 
                onClick={() => { updateUser({ name }); onClose(); }}
                className="w-full py-4 bg-stone-900 text-white rounded-2xl font-bold shadow-xl shadow-stone-200"
            >
                Save Changes
            </button>
        </div>
    )
}

const WeightSheet = ({ onClose }: { onClose: () => void }) => {
    const { user, updateUser } = useUser();
    const [weight, setWeight] = useState(user.dailyStats.weight?.toString() || '');
    
    return (
        <div className="flex flex-col items-center">
            <div className="w-full bg-white rounded-[2.5rem] p-10 mb-6 flex flex-col items-center justify-center border border-stone-100 shadow-inner relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
                <input 
                    type="number" 
                    value={weight} 
                    onChange={(e) => setWeight(e.target.value)}
                    className="text-7xl font-editorial italic text-stone-900 text-center w-full bg-transparent outline-none placeholder:text-stone-200 relative z-10"
                    placeholder="0.0"
                    autoFocus
                />
                <span className="text-stone-400 font-bold mt-2 font-brutal uppercase tracking-widest relative z-10">kilograms</span>
            </div>
            <button 
                onClick={() => { 
                    const w = parseFloat(weight);
                    if(!isNaN(w)) { updateUser({ dailyStats: { ...user.dailyStats, weight: w } }); onClose(); }
                }} 
                className="w-full py-4 bg-indigo-500 text-white rounded-2xl font-bold shadow-xl shadow-indigo-200"
            >
                Update Weight
            </button>
        </div>
    )
}

const GoalsSheet = () => {
    const { user, updateUser } = useUser();
    const [newGoal, setNewGoal] = useState('');
    
    const add = () => { if(newGoal.trim()) { updateUser({ goals: [...user.goals, newGoal.trim()] }); setNewGoal(''); } };
    
    return (
        <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
                {user.goals.map(g => (
                    <span key={g} className="px-4 py-3 bg-white border border-stone-200 rounded-xl font-bold text-stone-600 flex items-center gap-2 shadow-sm">
                        {g}
                        <button onClick={() => updateUser({ goals: user.goals.filter(gx => gx !== g) })} className="text-stone-300 hover:text-red-500"><X size={14} /></button>
                    </span>
                ))}
            </div>
            <div className="flex gap-2">
                <input 
                    value={newGoal} 
                    onChange={(e) => setNewGoal(e.target.value)}
                    placeholder="Add new goal..."
                    className="flex-1 p-4 bg-white rounded-2xl border border-stone-200 font-bold outline-none focus:ring-2 ring-stone-900/10"
                    onKeyDown={(e) => e.key === 'Enter' && add()}
                />
                <button onClick={add} className="w-14 bg-stone-900 text-white rounded-2xl flex items-center justify-center shadow-lg"><Plus /></button>
            </div>
        </div>
    )
}

const PrivacySheet = () => (
    <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100">
        <div className="flex items-center gap-3 mb-4 text-emerald-800">
            <Shield size={24} />
            <h4 className="font-bold text-lg">Data Encrypted</h4>
        </div>
        <p className="text-emerald-800/80 text-sm leading-relaxed">
            All your pantry items, photos, and chat history are stored locally on your device or securely transmitted to our AI partners solely for processing. We do not sell your personal data.
        </p>
    </div>
)

const HelpSheet = () => {
    const { t, language } = useLanguage();
    const [input, setInput] = useState('');
    const [msgs, setMsgs] = useState<{role: 'user' | 'model', text: string}[]>([{ role: 'model', text: "How can I help you with the app today?" }]);
    const [typing, setTyping] = useState(false);
    
    const send = async () => {
        if(!input.trim()) return;
        const txt = input;
        setMsgs(p => [...p, { role: 'user', text: txt }]);
        setInput('');
        setTyping(true);
        
        try {
            // Simplified AI Call for help
            const history = [{ role: 'user', parts: [{ text: "You are app support." }] }, ...msgs.map(m => ({ role: m.role, parts: [{ text: m.text }] }))];
            const stream = streamChatResponse(history, txt, language);
            let resp = "";
            setMsgs(p => [...p, { role: 'model', text: "" }]);
            for await (const chunk of stream) {
                resp += chunk;
                setMsgs(p => { const n = [...p]; n[n.length-1].text = resp; return n; });
            }
        } catch(e) { console.error(e); } finally { setTyping(false); }
    }

    return (
        <div className="flex flex-col h-[50vh]">
            <div className="flex-1 overflow-y-auto space-y-3 mb-4 p-1">
                {msgs.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-stone-900 text-white rounded-br-sm' : 'bg-white border border-stone-200 text-stone-800 rounded-bl-sm'}`}>
                            {m.text}
                        </div>
                    </div>
                ))}
                {typing && <div className="text-xs text-stone-400 ml-4 animate-pulse">Typing...</div>}
            </div>
            <div className="flex gap-2 bg-white p-2 rounded-[1.5rem] border border-stone-200 shadow-sm">
                <input 
                    value={input} onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a question..."
                    className="flex-1 bg-transparent outline-none pl-4 text-sm font-medium"
                    onKeyDown={(e) => e.key === 'Enter' && send()}
                />
                <button onClick={send} className="w-10 h-10 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-md"><Send size={16} /></button>
            </div>
        </div>
    )
}

export default Profile;
