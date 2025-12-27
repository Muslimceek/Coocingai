import React from 'react';
import { Ghost } from 'lucide-react';
import { GeneratedRecipe } from '../../types';
import RecipeCard from './RecipeCard';

interface SavedTabProps {
  savedRecipes: GeneratedRecipe[];
  t: (key: string) => string;
  onToggleFavorite: (recipe: GeneratedRecipe) => void;
  onStartCooking: () => void;
}

const SavedTab: React.FC<SavedTabProps> = ({ 
  savedRecipes, 
  t, 
  onToggleFavorite, 
  onStartCooking 
}) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {savedRecipes.length === 0 ? (
        <div className="text-center py-24 px-6 flex flex-col items-center justify-center min-h-[50vh]">
          <div className="w-24 h-24 bg-rose-50 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner rotate-3">
             <Ghost size={40} className="text-rose-300" />
          </div>
          <h3 className="text-3xl font-editorial italic text-stone-800 mb-2">{t('fridge_saved_empty')}</h3>
          <p className="text-stone-400 font-brutal uppercase tracking-widest text-xs max-w-xs leading-relaxed">{t('fridge_saved_empty_desc')}</p>
        </div>
      ) : (
        savedRecipes.map(savedRecipe => (
          <RecipeCard 
            key={savedRecipe.id} 
            recipe={savedRecipe} 
            t={t} 
            onToggleFavorite={() => onToggleFavorite(savedRecipe)}
            isSaved={true}
          />
        ))
      )}
    </div>
  );
};

export default SavedTab;