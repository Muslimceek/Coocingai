
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

  if (!mounted || isLoading) {
    return (
        <div className="min-h-screen bg-[#F9F8F6] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full border-4 border-rose-200 border-t-rose-500 animate-spin"></div>
            </div>
        </div>
    );
  }

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
    <div className="min-h-screen bg-[#F9F8F6] text-stone-900 font-sans relative selection:bg-rose-200 overflow-hidden">
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-rose-100/40 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-orange-100/40 rounded-full blur-[80px]" />
      </div>

      {/* Main Content */}
      <main className="w-full h-full relative z-10 overflow-y-auto pb-32">
        {renderView()}
      </main>

      {/* Chat Widget */}
      <AIChefChat />

      {/* Modern Floating Island Navigation */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-auto">
        <nav className="bg-white/90 backdrop-blur-2xl border border-white/50 rounded-[2.5rem] py-3 px-6 flex items-center gap-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] ring-1 ring-black/5">
          
          <NavButton 
            active={currentView === ViewState.SMART_FRIDGE}
            onClick={() => setCurrentView(ViewState.SMART_FRIDGE)}
            icon={<Snowflake size={24} strokeWidth={currentView === ViewState.SMART_FRIDGE ? 2.5 : 2} />}
          />

          <NavButton 
            active={currentView === ViewState.PANTRY}
            onClick={() => setCurrentView(ViewState.PANTRY)}
            icon={<Package size={24} strokeWidth={currentView === ViewState.PANTRY ? 2.5 : 2} />}
          />

          <div className="w-px h-8 bg-stone-100 mx-2"></div>

          <NavButton 
            active={currentView === ViewState.TRACKER}
            onClick={() => setCurrentView(ViewState.TRACKER)}
            icon={<Activity size={24} strokeWidth={currentView === ViewState.TRACKER ? 2.5 : 2} />}
          />

          <NavButton 
            active={currentView === ViewState.PROFILE}
            onClick={() => setCurrentView(ViewState.PROFILE)}
            icon={<User size={24} strokeWidth={currentView === ViewState.PROFILE ? 2.5 : 2} />}
          />

        </nav>
      </div>
    </div>
  );
};

const NavButton = ({ active, onClick, icon }: { active: boolean, onClick: () => void, icon: React.ReactNode }) => (
  <button 
    onClick={() => { onClick(); if(navigator.vibrate) navigator.vibrate(10); }}
    className={`relative p-2 rounded-2xl transition-all duration-300 group hover:bg-stone-50 ${active ? 'text-stone-900 -translate-y-1' : 'text-stone-400'}`}
  >
    {icon}
    {active && (
      <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-stone-900 rounded-full" />
    )}
  </button>
);

export default function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}
