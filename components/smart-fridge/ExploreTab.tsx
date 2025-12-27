
import React, { useState } from 'react';
import { Compass, Plus, ArrowLeft, X, Sparkles, MoveRight, ArrowUpRight } from 'lucide-react';
import { RecipeCollection, GeneratedRecipe } from '../../types';
import RecipeCard from './RecipeCard';

// Mock data (same as before but cleanly imported)
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
      }
    ]
  },
  {
    id: 'date',
    title: t('col_date'),
    description: t('col_date_desc'),
    gradient: 'from-purple-500 to-pink-500',
    icon: '🍷',
    recipes: []
  },
  {
    id: 'energy',
    title: t('col_energy'),
    description: t('col_energy_desc'),
    gradient: 'from-emerald-400 to-teal-500',
    icon: '🥑',
    recipes: []
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
  
  const collections = getMockCollections(t);
  const trendingRecipes = collections.flatMap(c => c.recipes).slice(0, 3);

  if (viewedRecipe) {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-10 duration-500 z-50 relative pb-24">
            <button 
                onClick={() => setViewedRecipe(null)} 
                className="group flex items-center gap-3 mb-4 px-5 py-3 bg-white/80 backdrop-blur-md rounded-full border border-stone-200/50 hover:bg-stone-900 hover:text-white transition-all shadow-sm"
            >
                <ArrowLeft size={18} />
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

  return (
    <div className="space-y-10 pb-24">
      
      {/* 1. TRENDING CAROUSEL */}
      <section>
         <div className="flex items-end justify-between mb-6 px-1">
             <div>
                 <span className="text-[10px] font-brutal font-black text-stone-400 uppercase tracking-widest">{t('explore_trending_subtitle')}</span>
                 <h2 className="text-3xl font-editorial italic text-stone-900">{t('explore_trending_title')}</h2>
             </div>
             <button className="w-10 h-10 rounded-full border border-stone-200 flex items-center justify-center hover:bg-stone-100 transition">
                 <ArrowUpRight size={18} />
             </button>
         </div>

         <div className="flex gap-4 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
             {trendingRecipes.map(r => (
                 <div 
                    key={r.id}
                    onClick={() => setViewedRecipe(r)}
                    className="min-w-[280px] snap-center relative group cursor-pointer"
                 >
                     <div className="aspect-[3/4] rounded-[2rem] overflow-hidden relative shadow-lg">
                         <img src={r.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={r.title} />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                         
                         <div className="absolute bottom-6 left-6 right-6 text-white">
                             <div className="bg-white/20 backdrop-blur-md self-start inline-block px-2 py-1 rounded-lg text-[10px] font-bold uppercase mb-2">{r.cuisine}</div>
                             <h3 className="font-editorial italic text-2xl leading-none mb-1">{r.title}</h3>
                             <p className="text-xs opacity-80 line-clamp-1">{r.description}</p>
                         </div>
                     </div>
                 </div>
             ))}
         </div>
      </section>

      {/* 2. COLLECTIONS GRID */}
      <section>
         <div className="flex items-center justify-between mb-6 px-1">
             <h3 className="font-brutal font-bold text-lg text-stone-900 flex items-center gap-2">
                 <Compass size={18} /> {t('explore_curated')}
             </h3>
         </div>

         <div className="grid grid-cols-2 gap-3">
             {collections.map((col, idx) => {
                 const isLarge = idx % 3 === 0;
                 return (
                     <div 
                        key={col.id}
                        className={`rounded-[2rem] p-5 relative overflow-hidden group cursor-pointer hover:shadow-xl transition-shadow bg-gradient-to-br ${col.gradient} ${isLarge ? 'col-span-2 h-48' : 'col-span-1 h-48'}`}
                        onClick={() => {}}
                     >
                         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
                         <div className={`absolute -right-4 -bottom-4 text-8xl opacity-30 group-hover:rotate-12 group-hover:scale-110 transition-transform duration-500`}>
                             {col.icon}
                         </div>
                         
                         <div className="relative z-10 h-full flex flex-col justify-between text-white">
                             <div className="bg-white/20 backdrop-blur-md self-start px-2 py-1 rounded-lg text-[10px] font-bold uppercase border border-white/10">
                                 {col.recipes.length} {t('explore_items')}
                             </div>
                             <div>
                                 <h4 className={`${isLarge ? 'text-3xl' : 'text-xl'} font-editorial italic leading-none mb-1`}>{col.title}</h4>
                                 <p className="text-[10px] opacity-80 uppercase tracking-widest font-bold">{col.description}</p>
                             </div>
                         </div>
                     </div>
                 )
             })}
         </div>
      </section>

    </div>
  );
};

export default ExploreTab;
