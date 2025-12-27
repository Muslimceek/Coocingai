import React, { useState, useEffect } from 'react';
import { Compass, Plus, ArrowLeft, X, Zap, Sparkles, MoveRight } from 'lucide-react';
import { RecipeCollection, GeneratedRecipe } from '../../types';
import RecipeCard from './RecipeCard';

const getMockCollections = (t: (key: string) => string): RecipeCollection[] => [
  {
    id: 'quick',
    title: t('col_quick'),
    description: t('col_quick_desc'),
    gradient: 'from-orange-400 to-rose-400',
    icon: '⚡',
    recipes: [
      {
        id: 'ex-1', title: '15-Min Shrimp Stir Fry', description: 'Super fast and packed with protein.',
        ingredients: ['Shrimp', 'Snap Peas', 'Soy Sauce', 'Garlic'], instructions: ['Heat pan', 'Toss ingredients', 'Serve'],
        calories: 320, prepTimeMinutes: 15, cuisine: 'Asian', mealType: 'Dinner', difficulty: 'Easy', servings: 2,
        imageUrl: 'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=800&q=80', rating: 4.8, author: 'Chef Anna',
        tips: ['Use fresh ginger for extra kick.', 'Serve over cauliflower rice for lower carbs.'],
        cookCount: 1240, likesCount: 350
      },
      {
        id: 'ex-2', title: 'Caprese Chicken Salad', description: 'Fresh, light, and ready in minutes.',
        ingredients: ['Chicken Breast', 'Mozzarella', 'Tomatoes', 'Basil'], instructions: ['Grill chicken', 'Slice veg', 'Combine'],
        calories: 410, prepTimeMinutes: 20, cuisine: 'European', mealType: 'Lunch', difficulty: 'Easy', servings: 1,
        imageUrl: 'https://images.unsplash.com/photo-1529312266912-b33cf6227e24?auto=format&fit=crop&w=800&q=80', rating: 4.7, author: 'HealthyEats',
        tips: ['Drizzle with balsamic glaze.', 'Use cherry tomatoes for sweetness.'],
        cookCount: 890, likesCount: 210
      }
    ]
  },
  {
    id: 'date',
    title: t('col_date'),
    description: t('col_date_desc'),
    gradient: 'from-purple-500 to-pink-500',
    icon: '🍷',
    recipes: [
      {
        id: 'ex-3', title: 'Pan-Seared Scallops', description: 'Elegant and buttery scallops for a special night.',
        ingredients: ['Scallops', 'Butter', 'Lemon', 'Parsley'], instructions: ['Dry scallops', 'Sear in butter', 'Garnish'],
        calories: 280, prepTimeMinutes: 25, cuisine: 'European', mealType: 'Dinner', difficulty: 'Medium', servings: 2,
        imageUrl: 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?auto=format&fit=crop&w=800&q=80', rating: 4.9, author: 'RomanceKitchen',
        tips: ['Ensure pan is very hot before searing.', 'Do not overcrowd the pan.'],
        cookCount: 450, likesCount: 500
      }
    ]
  },
  {
    id: 'energy',
    title: t('col_energy'),
    description: t('col_energy_desc'),
    gradient: 'from-emerald-400 to-teal-500',
    icon: '🥑',
    recipes: [
        {
        id: 'ex-4', title: 'Avocado Toast Royale', description: 'The ultimate power breakfast.',
        ingredients: ['Bread', 'Avocado', 'Poached Egg', 'Chili Flakes'], instructions: ['Toast bread', 'Mash avo', 'Top with egg'],
        calories: 350, prepTimeMinutes: 10, cuisine: 'European', mealType: 'Breakfast', difficulty: 'Easy', servings: 1,
        imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414395d8?auto=format&fit=crop&w=800&q=80', rating: 4.6, author: 'FitGirl',
        tips: ['Use sourdough bread.', 'Add a squeeze of lemon juice.'],
        cookCount: 2300, likesCount: 1200
      }
    ]
  },
  {
    id: 'kids',
    title: t('col_kids'),
    description: t('col_kids_desc'),
    gradient: 'from-blue-400 to-indigo-400',
    icon: '🎈',
    recipes: []
  },
];

interface ExploreTabProps {
  t: (key: string) => string;
  onToggleFavorite: (recipe: GeneratedRecipe) => void;
  savedRecipeIds: string[];
}

const ExploreTab: React.FC<ExploreTabProps> = ({ t, onToggleFavorite, savedRecipeIds }) => {
  const [selectedCollection, setSelectedCollection] = useState<RecipeCollection | null>(null);
  const [viewedRecipe, setViewedRecipe] = useState<GeneratedRecipe | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const collections = getMockCollections(t);
  const trendingRecipes = collections.flatMap(c => c.recipes).slice(0, 3);

  // --- VIEW: SINGLE RECIPE ---
  if (viewedRecipe) {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-10 duration-500 z-50 relative">
            <button 
                onClick={() => setViewedRecipe(null)} 
                className="group flex items-center gap-3 mb-8 px-5 py-3 bg-white/80 backdrop-blur-md rounded-full border border-stone-200/50 hover:bg-stone-900 hover:text-white transition-all duration-300 shadow-lg sticky top-4 z-50"
            >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                <span className="font-brutal font-bold text-xs uppercase tracking-widest">{t('back_to_collections')}</span>
            </button>
            <RecipeCard 
                recipe={viewedRecipe} 
                t={t} 
                onToggleFavorite={() => onToggleFavorite(viewedRecipe)}
                isSaved={savedRecipeIds.includes(viewedRecipe.id)}
            />
        </div>
    )
  }

  // --- VIEW: COLLECTION DETAIL ---
  if (selectedCollection) {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-20 duration-500">
             <button 
                onClick={() => setSelectedCollection(null)} 
                className="group flex items-center gap-3 mb-6 px-4 py-2 hover:bg-white/50 rounded-full transition-all"
            >
                <ArrowLeft size={24} className="text-stone-800" />
            </button>

            <div className={`rounded-[3rem] p-12 mb-12 bg-gradient-to-br ${selectedCollection.gradient} text-white shadow-2xl relative overflow-hidden group`}>
                <div className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
                <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/4 opacity-40 transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-1000 blur-sm">
                    <span className="text-[12rem]">{selectedCollection.icon}</span>
                </div>
                
                <h2 className="font-editorial italic text-6xl relative z-10 mb-4 drop-shadow-md">{selectedCollection.title}</h2>
                <p className="font-brutal text-white/90 text-xl uppercase tracking-widest relative z-10 max-w-xl">{selectedCollection.description}</p>
            </div>

            <div className="space-y-8">
                {selectedCollection.recipes.length > 0 ? (
                    selectedCollection.recipes.map((r, idx) => (
                        <div key={r.id} className="animate-in slide-in-from-bottom-10 duration-700" style={{ animationDelay: `${idx * 150}ms` }}>
                            <RecipeCard 
                                recipe={r} 
                                t={t} 
                                onToggleFavorite={() => onToggleFavorite(r)}
                                isSaved={savedRecipeIds.includes(r.id)}
                            />
                        </div>
                    ))
                ) : (
                    <div className="text-center py-24 border border-dashed border-stone-300 rounded-[3rem] bg-stone-50/50">
                        <p className="text-stone-400 font-brutal font-bold text-lg">{t('collection_empty_desc')}</p>
                    </div>
                )}
            </div>
        </div>
    );
  }

  // --- VIEW: THE LIVING CANVAS DASHBOARD ---
  return (
    <div className="relative -mx-4 md:-mx-8 px-4 md:px-8 pb-32 pt-4">
      
      {/* 1. HERO TRENDING (Parallax Snap) */}
      <section className="mb-16">
        <div className="flex items-end justify-between mb-8 px-2">
           <h2 className="font-editorial italic text-5xl text-stone-900 leading-tight">
             What's Cooking<br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500 not-italic font-brutal font-bold tracking-tighter">THIS WEEK</span>
           </h2>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide px-2">
             {trendingRecipes.map((r, idx) => (
                <div 
                  key={r.id} 
                  onClick={() => setViewedRecipe(r)}
                  className="min-w-[85vw] md:min-w-[400px] snap-center group cursor-pointer relative"
                >
                  <div className="relative h-[450px] rounded-[2.5rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] transition-all duration-700 group-hover:scale-[0.98]">
                    <img src={r.imageUrl} alt={r.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90" />
                    
                    {/* Floating Info Tag */}
                    <div className="absolute top-6 right-6 w-14 h-14 bg-white/20 backdrop-blur-xl rounded-full border border-white/30 flex flex-col items-center justify-center text-white shadow-xl animate-bounce-slow">
                       <span className="font-brutal font-bold text-lg">{r.prepTimeMinutes}</span>
                       <span className="text-[8px] uppercase font-bold tracking-wider">MIN</span>
                    </div>

                    <div className="absolute bottom-8 left-8 right-8 text-white">
                      <div className="flex gap-2 mb-3">
                         <span className="bg-white/10 backdrop-blur-sm text-white border border-white/20 px-3 py-1 rounded-full font-brutal font-bold text-[10px] uppercase tracking-widest">{r.cuisine}</span>
                      </div>
                      <h3 className="font-editorial italic text-4xl mb-3 leading-none group-hover:text-rose-200 transition-colors">{r.title}</h3>
                      <div className="flex items-center gap-2 text-xs font-brutal font-bold uppercase tracking-widest opacity-80">
                         View Recipe <MoveRight size={14} />
                      </div>
                    </div>
                  </div>
                </div>
             ))}
        </div>
      </section>

      {/* 2. FLUID MASONRY COLLECTIONS */}
      <section>
        <div className="flex items-center justify-between mb-8 px-2">
            <h3 className="font-brutal font-bold text-xl text-stone-900 uppercase tracking-tight flex items-center gap-2">
              <Compass className="text-stone-900" size={20} strokeWidth={2.5} /> Curated Lists
            </h3>
            
            <button 
              onClick={() => setShowCreateModal(true)}
              className="w-10 h-10 bg-stone-900 rounded-full flex items-center justify-center text-white shadow-lg shadow-stone-300 hover:scale-110 transition-transform"
            >
              <Plus size={18} />
            </button>
        </div>

        <div className="grid grid-cols-2 gap-3 px-2 auto-rows-[200px]">
             {collections.map((col, idx) => {
                // Fluid Grid Logic: 1st item spans 2 cols, others alternate
                const isWide = idx % 3 === 0;
                
                return (
                  <div 
                    key={col.id}
                    onClick={() => { setSelectedCollection(col); if (navigator.vibrate) navigator.vibrate(10); }}
                    className={`group relative overflow-hidden rounded-[2.5rem] p-6 flex flex-col justify-end transition-all duration-500 hover:shadow-2xl cursor-pointer ${
                      isWide ? 'col-span-2' : 'col-span-1'
                    } bg-gradient-to-br ${col.gradient}`}
                  >
                    {/* Animated Texture Background */}
                    <div className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
                    
                    {/* Parallax Icon */}
                    <div className={`absolute transition-all duration-1000 group-hover:rotate-12 group-hover:scale-125 ${
                      isWide ? 'top-4 right-10 text-8xl opacity-40 group-hover:translate-x-4' : 'top-2 right-2 text-5xl opacity-30'
                    }`}>
                      {col.icon}
                    </div>

                    <div className="relative z-10 transform transition-transform duration-500 group-hover:-translate-y-2">
                      <h4 className={`${isWide ? 'text-4xl' : 'text-xl'} font-editorial italic text-white leading-[0.9] mb-2`}>
                        {col.title}
                      </h4>
                      <div className="flex items-center gap-2">
                         <span className="bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-brutal font-bold uppercase text-white tracking-widest border border-white/20">{col.recipes.length} ITEMS</span>
                      </div>
                    </div>
                  </div>
                );
             })}
        </div>
      </section>

      {/* 3. FLOATING MODAL (Bottom Sheet) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-4">
           <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-xl animate-in fade-in duration-500" onClick={() => setShowCreateModal(false)} />
           <div className="relative bg-white rounded-[3rem] w-full max-w-lg p-10 shadow-2xl animate-in slide-in-from-bottom-20 duration-500 border border-stone-100">
              <div className="absolute top-6 right-6">
                <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
                  <X size={24} className="text-stone-400" />
                </button>
              </div>
              
              <div className="mb-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-tr from-rose-400 to-orange-400 rounded-[2rem] flex items-center justify-center shadow-xl shadow-rose-200 mb-6 mx-auto rotate-6">
                   <Sparkles className="text-white" size={40} />
                </div>
                <h3 className="text-4xl font-editorial italic text-stone-900 mb-2">New Collection</h3>
                <p className="font-brutal text-stone-500 text-sm uppercase tracking-widest">Curate your flavors</p>
              </div>

              <div className="space-y-6">
                 <div>
                    <input type="text" placeholder="e.g. Sunday Brunch" className="w-full mt-2 p-6 bg-stone-50 border-none rounded-[2rem] focus:ring-2 focus:ring-stone-900 transition-all font-editorial italic text-2xl text-center placeholder:text-stone-300 outline-none" autoFocus />
                 </div>
                 <button onClick={() => setShowCreateModal(false)} className="w-full bg-stone-900 text-white py-6 rounded-[2rem] font-brutal font-bold text-lg hover:scale-[1.02] transition-all shadow-xl active:scale-[0.98]">
                    CREATE
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ExploreTab;