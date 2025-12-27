
import React, { useState, useRef, useEffect } from 'react';
import { 
  Compass, ArrowUpRight, Sparkles, ChefHat, 
  Flame, Clock, CloudRain, Sun, Moon, Wind, ArrowRight,
  Play
} from 'lucide-react';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import { RecipeCollection, GeneratedRecipe } from '../../types';
import RecipeCard from './RecipeCard';

// --- MOCK DATA ENHANCED FOR VIBE ---
const getMockCollections = (t: (key: string) => string): (RecipeCollection & { vibeColor: string, mood: string })[] => [
  {
    id: 'quick',
    title: t('col_quick'),
    description: t('col_quick_desc'),
    gradient: 'from-orange-400 to-rose-400',
    vibeColor: '#fb7185', // Rose
    mood: 'Energetic',
    icon: '⚡',
    recipes: [
      {
        id: 'ex-1', title: 'Neon Shrimp Stir Fry', description: 'Electric flavors in 15 mins.',
        ingredients: ['Shrimp', 'Snap Peas', 'Chili Oil', 'Garlic'], instructions: ['Sear', 'Toss', 'Serve'],
        calories: 320, prepTimeMinutes: 15, cuisine: 'Cyber-Asian', mealType: 'Dinner', difficulty: 'Easy', servings: 2,
        imageUrl: 'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=800&q=80', rating: 4.8, author: 'Chef Anna',
        tips: ['High heat is key.'], cookCount: 1240, likesCount: 350
      }
    ]
  },
  {
    id: 'cozy',
    title: "Rainy Day Comfort", // Dynamic Title
    description: "Warm your soul",
    gradient: 'from-stone-500 to-stone-700',
    vibeColor: '#78716c', // Stone
    mood: 'Cozy',
    icon: '🌧️',
    recipes: []
  },
  {
    id: 'green',
    title: "Deep Detox",
    description: "Reset your system",
    gradient: 'from-emerald-400 to-teal-600',
    vibeColor: '#34d399', // Emerald
    mood: 'Fresh',
    icon: '🌿',
    recipes: []
  },
   {
    id: 'sweet',
    title: "Midnight Cravings",
    description: "Guilt-free pleasures",
    gradient: 'from-violet-500 to-fuchsia-500',
    vibeColor: '#a78bfa', // Violet
    mood: 'Indulgent',
    icon: '🌙',
    recipes: []
  },
];

interface ExploreTabProps {
  t: (key: string) => string;
  onToggleFavorite: (recipe: GeneratedRecipe) => void;
  savedRecipeIds: string[];
}

const ExploreTab: React.FC<ExploreTabProps> = ({ t, onToggleFavorite, savedRecipeIds }) => {
  const [viewedRecipe, setViewedRecipe] = useState<GeneratedRecipe | null>(null);
  const [activeVibe, setActiveVibe] = useState<string>('#e7e5e4'); // Default stone-200
  
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ container: containerRef });
  
  const collections = getMockCollections(t);
  const trendingRecipes = collections.flatMap(c => c.recipes).slice(0, 1); // Hero item

  // --- TIME CONTEXT LOGIC ---
  const hour = new Date().getHours();
  let timeIcon = <Sun />;
  let greeting = "Good Morning";
  if (hour >= 12 && hour < 17) { greeting = "Good Afternoon"; timeIcon = <Wind />; }
  else if (hour >= 17) { greeting = "Good Evening"; timeIcon = <Moon />; }

  const handleRecipeOpen = (recipe: GeneratedRecipe) => {
      if(navigator.vibrate) navigator.vibrate(10);
      setViewedRecipe(recipe);
  };

  // --- RENDER ---
  if (viewedRecipe) {
    return (
        <div className="fixed inset-0 z-[60] bg-[#F9F8F6] overflow-y-auto">
            <motion.div 
                initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
                className="relative pb-24"
            >
                <button 
                    onClick={() => setViewedRecipe(null)} 
                    className="absolute top-6 left-6 z-50 w-12 h-12 bg-white/20 backdrop-blur-xl rounded-full border border-white/30 flex items-center justify-center text-white shadow-lg"
                >
                    <ArrowRight className="rotate-180" size={24} />
                </button>
                <RecipeCard 
                    recipe={viewedRecipe} 
                    t={t} 
                    onToggleFavorite={() => onToggleFavorite(viewedRecipe)}
                    isSaved={savedRecipeIds.includes(viewedRecipe.id)}
                />
            </motion.div>
        </div>
    )
  }

  return (
    <div ref={containerRef} className="h-full overflow-y-auto pb-32 relative no-scrollbar perspective-1000">
      
      {/* 1. ATMOSPHERIC BACKGROUND (Adaptive Liquid) */}
      <motion.div 
        animate={{ backgroundColor: activeVibe }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        className="fixed inset-0 opacity-10 blur-[100px] pointer-events-none z-0 transition-colors"
      />
      
      {/* 2. HEADER: CONTEXT AWARE */}
      <div className="pt-2 px-1 mb-8 relative z-10">
          <div className="flex items-center gap-2 mb-2 opacity-50">
              {timeIcon}
              <span className="text-[10px] font-brutal font-bold uppercase tracking-widest">{greeting}</span>
          </div>
          <h1 className="text-4xl font-editorial italic text-stone-900 leading-tight">
              Where will your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500">senses take you?</span>
          </h1>
      </div>

      {/* 3. HERO PORTAL (The "Window") */}
      {trendingRecipes.map(r => (
          <HeroPortal key={r.id} recipe={r} onClick={() => handleRecipeOpen(r)} />
      ))}

      {/* 4. AI SOMMELIER (Hyper-Innovation) */}
      <div className="my-10 px-2 relative z-10">
          <div className="p-[1px] rounded-[2rem] bg-gradient-to-r from-rose-300 via-purple-300 to-blue-300 shadow-xl shadow-rose-100/50">
              <button 
                onClick={() => { if(navigator.vibrate) navigator.vibrate([10, 50]); }}
                className="w-full bg-white/90 backdrop-blur-xl rounded-[2rem] p-6 flex items-center justify-between group active:scale-[0.98] transition-transform"
              >
                  <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-stone-900 text-white rounded-full flex items-center justify-center relative overflow-hidden">
                          <Sparkles size={20} className="relative z-10 animate-pulse" />
                          <div className="absolute inset-0 bg-gradient-to-tr from-rose-500 to-purple-500 opacity-50 animate-spin-slow" />
                      </div>
                      <div className="text-left">
                          <span className="block font-editorial italic text-xl">The AI Sommelier</span>
                          <span className="text-[10px] font-brutal font-bold text-stone-400 uppercase tracking-widest">
                              Picking for {hour < 12 ? 'Breakfast' : 'Dinner'} • Cloudy
                          </span>
                      </div>
                  </div>
                  <div className="w-10 h-10 rounded-full border border-stone-200 flex items-center justify-center group-hover:bg-stone-900 group-hover:text-white transition-colors">
                      <ArrowUpRight size={18} />
                  </div>
              </button>
          </div>
      </div>

      {/* 5. BENTO GRID 3.0 (Asymmetric Layout) */}
      <div className="relative z-10 px-1">
          <div className="flex items-center gap-2 mb-6">
              <Compass size={18} className="text-stone-900" />
              <h3 className="font-brutal font-bold text-lg text-stone-900 uppercase tracking-wide">Universes</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
              {collections.map((col, idx) => {
                  // Asymmetric Logic: Index 0 is wide, rest are standard
                  const isWide = idx === 0 || idx === 3;
                  
                  return (
                      <motion.div 
                         key={col.id}
                         onViewportEnter={() => setActiveVibe(col.vibeColor)}
                         className={`${isWide ? 'col-span-2 aspect-[2/1]' : 'col-span-1 aspect-[4/5]'} relative`}
                      >
                         <CollectionPortal collection={col} isWide={isWide} />
                      </motion.div>
                  )
              })}
          </div>
      </div>

      <div className="h-12" />
    </div>
  );
};

// --- SUB-COMPONENTS (ATOMS) ---

const HeroPortal = ({ recipe, onClick }: { recipe: GeneratedRecipe, onClick: () => void }) => {
    // Parallax logic would ideally use scroll hook, keeping simple for reliability
    return (
        <motion.div 
            onClick={onClick}
            whileTap={{ scale: 0.98 }}
            className="w-full h-[65vh] rounded-[2.5rem] relative overflow-hidden shadow-2xl shadow-stone-900/10 group cursor-pointer"
        >
            <div className="absolute inset-0 bg-stone-900">
                <img 
                    src={recipe.imageUrl} 
                    alt={recipe.title}
                    className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-[1.5s] ease-out"
                />
            </div>
            
            {/* Cinematic Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/10" />
            
            <div className="absolute top-6 right-6">
                <div className="px-3 py-1 bg-white/20 backdrop-blur-md border border-white/20 rounded-full text-white text-[10px] font-bold uppercase tracking-widest">
                    Trending Now
                </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-8 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <div className="flex items-center gap-2 mb-3 text-rose-300">
                    <Flame size={16} fill="currentColor" />
                    <span className="text-xs font-bold uppercase tracking-wider">{recipe.calories} kcal</span>
                    <span className="w-1 h-1 bg-white/50 rounded-full" />
                    <Clock size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">{recipe.prepTimeMinutes} min</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-editorial italic leading-[0.9] mb-2">{recipe.title}</h2>
                <p className="text-white/70 line-clamp-2 font-light text-sm max-w-xs">{recipe.description}</p>
                
                <div className="mt-6 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                    <span className="text-xs font-bold uppercase tracking-widest border-b border-white">Read Recipe</span>
                    <ArrowRight size={14} />
                </div>
            </div>
        </motion.div>
    )
}

const CollectionPortal = ({ collection, isWide }: { collection: any, isWide: boolean }) => {
    return (
        <motion.div 
            whileHover={{ y: -5 }}
            className="w-full h-full rounded-[2rem] relative overflow-hidden group cursor-pointer border border-white/50"
        >
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${collection.gradient} opacity-90 transition-all duration-500 group-hover:opacity-100`} />
            
            {/* Noise Texture */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
            
            {/* Icon Floating */}
            <div className={`absolute ${isWide ? 'right-4 top-1/2 -translate-y-1/2' : 'right-[-10px] bottom-[-10px]'} text-8xl opacity-20 transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-700`}>
                {collection.icon}
            </div>

            <div className="relative z-10 h-full flex flex-col justify-between p-6 text-white">
                <div className="flex items-start justify-between">
                    <span className="px-2 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[9px] font-bold uppercase tracking-widest border border-white/10">
                        {collection.mood}
                    </span>
                    {isWide && <ArrowUpRight className="opacity-50" />}
                </div>

                <div>
                    <h3 className={`${isWide ? 'text-3xl' : 'text-2xl'} font-editorial italic leading-none mb-1`}>{collection.title}</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 group-hover:opacity-100 transition-opacity">
                        {collection.recipes.length > 0 ? `${collection.recipes.length} Curations` : 'Coming Soon'}
                    </p>
                </div>
            </div>
        </motion.div>
    )
}

export default ExploreTab;
