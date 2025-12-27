import React from 'react';
import { Heart, Clock, Flame, Star, Utensils, CalendarPlus } from 'lucide-react';
import { GeneratedRecipe } from '../../types';

interface RecipePreviewCardProps {
  recipe: GeneratedRecipe;
  onClick: () => void;
  onToggleFavorite: () => void;
  isSaved: boolean;
  t: (key: string) => string;
}

const RecipePreviewCard: React.FC<RecipePreviewCardProps> = ({
  recipe,
  onClick,
  onToggleFavorite,
  isSaved,
  t
}) => {
  return (
    <div 
        onClick={onClick}
        className="min-w-[300px] w-[300px] bg-white rounded-3xl shadow-lg shadow-stone-200/50 border border-stone-50 overflow-hidden cursor-pointer snap-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative group"
    >
        {/* Image Container with Overlay */}
        <div className="h-48 bg-stone-200 overflow-hidden relative">
            <img 
              src={recipe.imageUrl || `https://picsum.photos/seed/${recipe.id}/800/400`} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              alt={recipe.title} 
            />
            {/* Dark Overlay on Hover */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                 <span className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full font-bold text-sm border border-white/30 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    View Recipe
                 </span>
            </div>
            
            {/* Tags (Cuisine / Meal Type) */}
            <div className="absolute top-4 left-4 flex gap-1.5 z-10">
               {recipe.cuisine && (
                 <span className="bg-white/80 backdrop-blur-md text-stone-700 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm">
                   {recipe.cuisine}
                 </span>
               )}
            </div>

            {/* Favorite Button */}
            <button 
              onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
              className="absolute top-3 right-3 bg-white/30 backdrop-blur-md p-2 rounded-full shadow-sm border border-white/20 transition-all hover:bg-white active:scale-95 group/heart"
            >
                <Heart 
                  size={18} 
                  className={`transition-colors ${isSaved ? 'text-rose-500 fill-rose-500' : 'text-white group-hover:text-rose-500 group-hover/heart:text-rose-500'}`} 
                />
            </button>
        </div>

        {/* Content */}
        <div className="p-5">
            <div className="flex justify-between items-start mb-2">
               <h4 className="font-bold text-stone-800 line-clamp-1 text-lg flex-1 mr-2">{recipe.title}</h4>
               <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-lg font-bold text-xs shrink-0">
                  <Star size={12} className="fill-amber-500"/> {recipe.rating || 4.5}
               </div>
            </div>
            
            <p className="text-xs text-stone-400 mb-4 font-medium flex items-center gap-1">
               by <span className="text-stone-600 font-bold">{recipe.author || 'AI Chef'}</span>
            </p>

            {/* Stats Row */}
            <div className="flex items-center justify-between text-xs text-stone-500 font-medium pt-3 border-t border-stone-50">
                <div className="flex items-center gap-3">
                   <span className="flex items-center gap-1"><Clock size={14} className="text-stone-300"/> {recipe.prepTimeMinutes} m</span>
                   <span className="flex items-center gap-1"><Flame size={14} className="text-stone-300"/> {recipe.calories}</span>
                </div>
                {/* Popularity / Cook Count */}
                {recipe.cookCount && (
                   <span className="text-rose-400 font-bold flex items-center gap-1">
                      <Utensils size={12} /> {recipe.cookCount} {t('recipe_cooked_x_times')}
                   </span>
                )}
            </div>
        </div>
        
        {/* Quick Action: Add to Plan (Hover only) */}
        <button 
           className="absolute bottom-24 right-4 bg-rose-500 text-white p-2.5 rounded-full shadow-lg shadow-rose-200 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-rose-600 active:scale-90"
           title="Add to Plan"
           onClick={(e) => { e.stopPropagation(); /* Logic to add to plan */ }}
        >
            <CalendarPlus size={18} />
        </button>
    </div>
  );
};

export default RecipePreviewCard;