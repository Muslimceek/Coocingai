import React, { useState, useEffect } from 'react';
import { User, Snowflake, Activity, Package } from 'lucide-react';
import Profile from './components/Profile';
import SmartFridge from './components/SmartFridge';
import Tracker from './components/Tracker';
import PantryScreen from './components/PantryScreen';
import AIChefChat from './components/AIChefChat';
import Onboarding from './components/Onboarding';
import { ViewState } from './types';
import { useLanguage } from './contexts/LanguageContext';
import { UserProvider, useUser } from './contexts/UserContext';

const AppContent = () => {
  const { t } = useLanguage();
  const { user, updateUser, isLoading } = useUser();
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.SMART_FRIDGE);
  
  // State for transferring ingredients from Pantry to Fridge
  const [transferIngredients, setTransferIngredients] = useState<string[]>([]);
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Show Loading Spinner until User is loaded
  if (!mounted || isLoading) {
    return (
        <div className="min-h-screen bg-[#F9F8F6] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full border-4 border-rose-200 border-t-rose-500 animate-spin"></div>
                <p className="text-stone-400 font-brutal uppercase tracking-widest text-xs animate-pulse">Loading Experience...</p>
            </div>
        </div>
    );
  }

  // Show Onboarding if new user
  if (!user.hasCompletedOnboarding) {
    return <Onboarding onComplete={() => updateUser({ hasCompletedOnboarding: true })} />;
  }

  const handleCookWithPantry = (ingredients: string[]) => {
    setTransferIngredients(ingredients);
    setCurrentView(ViewState.SMART_FRIDGE);
  };

  const renderView = () => {
    switch (currentView) {
      case ViewState.PROFILE: return <Profile />;
      case ViewState.TRACKER: return <Tracker />;
      case ViewState.PANTRY: return <PantryScreen onCookWithPantry={handleCookWithPantry} />;
      case ViewState.SMART_FRIDGE:
      default:
        return (
          <SmartFridge 
            initialIngredients={transferIngredients.length > 0 ? transferIngredients : undefined}
            clearInitialIngredients={() => setTransferIngredients([])} 
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-stone-900 font-sans pb-32 overflow-x-hidden relative selection:bg-rose-200">
      
      {/* Dynamic Background Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40 transition-opacity duration-1000">
          <div className={`absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] transition-colors duration-1000 ${currentView === ViewState.SMART_FRIDGE ? 'bg-rose-100' : currentView === ViewState.TRACKER ? 'bg-emerald-100' : 'bg-blue-100'}`} />
          <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-orange-50 rounded-full blur-[80px]" />
      </div>

      {/* Main Content Area */}
      <main className="w-full relative z-10">
        {renderView()}
      </main>

      {/* Floating Chat Widget */}
      <AIChefChat />

      {/* Navigation Island */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-[340px] px-2">
        <nav className="bg-white/80 backdrop-blur-2xl border border-white/50 rounded-[2.5rem] py-3 px-2 flex justify-between items-center shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] ring-1 ring-white/50">
          
          <NavButton 
            active={currentView === ViewState.SMART_FRIDGE}
            onClick={() => setCurrentView(ViewState.SMART_FRIDGE)}
            icon={<Snowflake size={22} strokeWidth={2.5} />}
            label={t('nav_fridge')}
          />

          <NavButton 
            active={currentView === ViewState.PANTRY}
            onClick={() => setCurrentView(ViewState.PANTRY)}
            icon={<Package size={22} strokeWidth={2.5} />}
            label={t('nav_pantry')}
          />

          <NavButton 
            active={currentView === ViewState.TRACKER}
            onClick={() => setCurrentView(ViewState.TRACKER)}
            icon={<Activity size={22} strokeWidth={2.5} />}
            label={t('nav_tracker')}
          />

          <NavButton 
            active={currentView === ViewState.PROFILE}
            onClick={() => setCurrentView(ViewState.PROFILE)}
            icon={<User size={22} strokeWidth={2.5} />}
            label={t('nav_profile')}
          />

        </nav>
      </div>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button 
    onClick={() => { onClick(); if(navigator.vibrate) navigator.vibrate(5); }}
    className="relative flex flex-col items-center justify-center w-16 h-14 group"
  >
    <div className={`
      relative z-10 w-12 h-12 rounded-[1.2rem] flex items-center justify-center transition-all duration-500 cubic-bezier(0.175, 0.885, 0.32, 1.275)
      ${active 
        ? 'bg-stone-900 text-white -translate-y-3 shadow-lg shadow-stone-300 rotate-3' 
        : 'text-stone-400 hover:text-stone-600 hover:bg-stone-100/50'}
    `}>
      {icon}
    </div>
    <span className={`absolute bottom-1 text-[9px] font-brutal font-bold uppercase tracking-widest text-stone-900 transition-all duration-300 ${active ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
      {label}
    </span>
    {active && <div className="absolute top-2 w-4 h-4 bg-stone-900 blur-md opacity-20 -z-10"></div>}
  </button>
);

export default function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}