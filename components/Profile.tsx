
import React, { useState, useRef } from 'react';
import { 
  Settings, Crown, ChevronRight, Globe, Camera, 
  Edit2, User, Sparkles, X, Shield, 
  MessageCircle, Scale, Activity
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';

const Profile: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const { user, updateUser } = useUser();
  
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(user.name);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateUser({ avatarUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProfile = () => {
    updateUser({ name: tempName });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen pt-8 px-4 md:px-8 max-w-4xl mx-auto animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="flex justify-between items-end mb-8 px-2">
        <h1 className="text-5xl font-editorial italic font-bold text-stone-900 leading-[0.9]">
          {t('profile_myspace')}
        </h1>
        <button className="p-3 bg-white rounded-2xl shadow-sm border border-stone-100 text-stone-600 hover:rotate-90 transition-transform duration-500">
          <Settings size={22} />
        </button>
      </div>

      {/* BENTO GRID LAYOUT */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-24">
         
         {/* 1. MAIN ID CARD (Spans 2 cols) */}
         <div className="col-span-2 bg-white rounded-[2.5rem] p-6 shadow-sm border border-stone-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-100 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10 flex items-center gap-5">
               <div className="relative cursor-pointer hover:scale-105 transition-transform" onClick={handleAvatarClick}>
                  <img src={user.avatarUrl} alt="Profile" className="w-20 h-20 rounded-2xl object-cover shadow-lg rotate-3 group-hover:rotate-0 transition-transform duration-500" />
                  {user.subscription?.plan === 'premium' && (
                     <div className="absolute -top-2 -right-2 bg-stone-900 text-white p-1.5 rounded-lg rotate-12 shadow-sm">
                        <Crown size={12} fill="currentColor" />
                     </div>
                  )}
                  <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
               </div>
               
               <div className="flex-1">
                   {isEditing ? (
                       <div className="flex items-center gap-2">
                           <input value={tempName} onChange={(e) => setTempName(e.target.value)} className="w-full text-xl font-bold bg-stone-50 rounded-lg px-2 py-1 outline-none" autoFocus />
                           <button onClick={saveProfile} className="text-emerald-500 font-bold">OK</button>
                       </div>
                   ) : (
                       <div className="flex items-center justify-between">
                           <h2 className="text-2xl font-editorial italic font-bold text-stone-900">{user.name}</h2>
                           <button onClick={() => setIsEditing(true)}><Edit2 size={14} className="text-stone-300 hover:text-stone-900 transition-colors" /></button>
                       </div>
                   )}
                   <p className="text-[10px] font-brutal font-bold text-stone-400 uppercase tracking-widest mt-1">{user.email}</p>
               </div>
            </div>

            <div className="mt-6 flex gap-3">
               <div className="flex-1 bg-stone-50 rounded-2xl p-3 flex flex-col items-center justify-center">
                  <Activity size={16} className="text-rose-400 mb-1" />
                  <span className="text-xl font-bold text-stone-900">12</span>
                  <span className="text-[9px] font-brutal uppercase tracking-wider text-stone-400">{t('profile_day_streak')}</span>
               </div>
               <div className="flex-1 bg-stone-50 rounded-2xl p-3 flex flex-col items-center justify-center">
                  <Scale size={16} className="text-indigo-400 mb-1" />
                  <span className="text-xl font-bold text-stone-900">{user.dailyStats?.weight || 64}</span>
                  <span className="text-[9px] font-brutal uppercase tracking-wider text-stone-400">{t('profile_kg_curr')}</span>
               </div>
            </div>
         </div>

         {/* 2. SUBSCRIPTION CARD (Spans 2 cols on mobile, 1 on desktop) */}
         <div className="col-span-2 md:col-span-1 bg-stone-900 text-white rounded-[2.5rem] p-6 relative overflow-hidden flex flex-col justify-between group">
             <div>
                <div className="flex justify-between items-start">
                   <Crown size={24} className="text-amber-300" fill="currentColor" />
                   <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                </div>
                <h3 className="mt-4 text-xl font-editorial italic">{user.subscription?.plan === 'premium' ? t('profile_premium') : t('profile_free_plan')}</h3>
                <p className="text-stone-400 text-xs mt-1">{t('profile_next_bill')} {user.subscription?.nextBillingDate}</p>
             </div>
             <button className="mt-4 w-full py-2 bg-white/10 backdrop-blur-md rounded-xl text-xs font-bold hover:bg-white hover:text-stone-900 transition-colors">
                {t('profile_manage_sub')}
             </button>
             {/* Decor */}
             <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-gradient-to-br from-amber-400 to-rose-500 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
         </div>

         {/* 3. SETTINGS GRID ITEMS */}
         <button 
           onClick={() => {
              // Cycle through languages or open menu (simple cycle here for demo, though main menu is better)
              const nextLang = {
                  en: 'ru', ru: 'uz', uz: 'kk', kk: 'ky', ky: 'tg', tg: 'en'
              }[language] as any;
              setLanguage(nextLang);
           }}
           className="col-span-1 bg-white rounded-[2rem] p-4 shadow-sm border border-stone-100 hover:scale-[1.02] transition-transform flex flex-col items-center justify-center gap-2"
         >
            <Globe size={24} className="text-stone-800" strokeWidth={1.5} />
            <span className="text-xs font-brutal font-bold uppercase">{language.toUpperCase()}</span>
         </button>

         <button className="col-span-1 bg-emerald-50 rounded-[2rem] p-4 shadow-sm border border-emerald-100 hover:scale-[1.02] transition-transform flex flex-col items-center justify-center gap-2 text-emerald-700">
            <Shield size={24} strokeWidth={1.5} />
            <span className="text-xs font-brutal font-bold uppercase">{t('profile_privacy')}</span>
         </button>

         {/* 4. GOALS (Spans full width or 2 cols) */}
         <div className="col-span-2 bg-white rounded-[2.5rem] p-6 shadow-sm border border-stone-100">
             <div className="flex items-center gap-2 mb-4">
                 <Sparkles size={16} className="text-amber-400" />
                 <h3 className="text-sm font-brutal font-bold uppercase tracking-widest text-stone-900">{t('profile_focus_areas')}</h3>
             </div>
             <div className="flex flex-wrap gap-2">
                {user.goals?.map(goal => (
                   <span key={goal} className="px-4 py-2 bg-stone-50 rounded-xl text-xs font-bold text-stone-600 border border-stone-200">
                      {goal}
                   </span>
                ))}
                <button className="w-8 h-8 rounded-full border border-dashed border-stone-300 flex items-center justify-center text-stone-400 hover:border-stone-500 hover:text-stone-600">
                   <PlusIcon />
                </button>
             </div>
         </div>

         {/* 5. MENU ITEMS */}
         <div className="col-span-2 flex flex-col gap-2">
             <MenuItem icon={<MessageCircle size={18} />} label={t('profile_help')} />
             <MenuItem icon={<User size={18} />} label={t('profile_account_data')} />
         </div>

      </div>
    </div>
  );
};

const MenuItem = ({ icon, label }: { icon: React.ReactNode, label: string }) => (
    <button className="w-full bg-white p-4 rounded-[1.5rem] flex items-center justify-between shadow-sm border border-stone-100 hover:bg-stone-50 transition-colors group">
        <div className="flex items-center gap-3 text-stone-600 group-hover:text-stone-900">
            {icon}
            <span className="font-bold text-sm">{label}</span>
        </div>
        <ChevronRight size={16} className="text-stone-300 group-hover:translate-x-1 transition-transform" />
    </button>
);

const PlusIcon = () => (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

export default Profile;
