import React, { useState } from 'react';
import { ChefHat, Clock, Flame, ChevronRight, Wand2 } from 'lucide-react';
import { Ingredient, Recipe, UserProfile } from '../types';
import { generateRecipesFromInventory } from '../services/geminiService';
import { Button } from './ui/Button';

interface RecipesProps {
  inventory: Ingredient[];
  user: UserProfile;
  recipes: Recipe[];
  setRecipes: React.Dispatch<React.SetStateAction<Recipe[]>>;
}

export const Recipes: React.FC<RecipesProps> = ({ inventory, user, recipes, setRecipes }) => {
  const [loading, setLoading] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const handleGenerate = async () => {
    if (inventory.length === 0) {
      alert("Add some ingredients to your inventory first!");
      return;
    }
    setLoading(true);
    try {
      const result = await generateRecipesFromInventory(inventory, user);
      setRecipes(prev => [...result, ...prev]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (selectedRecipe) {
    return (
      <div className="pb-24 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <button 
          onClick={() => setSelectedRecipe(null)}
          className="mb-4 text-emerald-600 font-medium flex items-center"
        >
          ← Back to Recipes
        </button>
        
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="h-48 bg-slate-200 w-full relative">
             <img 
               src={`https://picsum.photos/seed/${selectedRecipe.id}/800/400`} 
               alt={selectedRecipe.title}
               className="w-full h-full object-cover"
             />
             <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-emerald-700 shadow-sm">
               {selectedRecipe.matchScore ? `${selectedRecipe.matchScore}% Match` : 'Recipe'}
             </div>
          </div>
          
          <div className="p-6 space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 leading-tight mb-2">{selectedRecipe.title}</h1>
              <div className="flex gap-4 text-slate-500 text-sm">
                <span className="flex items-center gap-1"><Clock size={16}/> {selectedRecipe.prepTime && selectedRecipe.cookTime ? selectedRecipe.prepTime + selectedRecipe.cookTime : '30'}m</span>
                <span className="flex items-center gap-1"><Flame size={16}/> {selectedRecipe.calories || '400'} kcal</span>
              </div>
            </div>

            {selectedRecipe.ingredients && (
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <h3 className="font-semibold text-emerald-900 mb-3 flex items-center gap-2">
                  <ChefHat size={18}/> Ingredients
                </h3>
                <ul className="space-y-2">
                  {selectedRecipe.ingredients.map((ing, idx) => (
                    <li key={idx} className="flex justify-between text-sm text-emerald-800">
                      <span>{ing.name}</span>
                      <span className="font-medium opacity-75">{ing.amount}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selectedRecipe.instructions && (
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Instructions</h3>
                <ol className="space-y-4">
                  {selectedRecipe.instructions.map((step, idx) => (
                    <li key={idx} className="flex gap-4">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </span>
                      <p className="text-slate-600 text-sm leading-relaxed">{step}</p>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      <div className="flex justify-between items-center py-4">
        <h2 className="text-2xl font-bold text-slate-900">Recommended</h2>
        <Button onClick={handleGenerate} size="sm" isLoading={loading}>
          <Wand2 size={16} className="mr-2" />
          Generate
        </Button>
      </div>

      {recipes.length === 0 && !loading && (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
          <ChefHat size={48} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-lg font-medium text-slate-900">Hungry?</h3>
          <p className="text-slate-500 max-w-xs mx-auto mt-2">
            Tap generate to get AI recipes based on what's currently in your kitchen.
          </p>
        </div>
      )}

      <div className="grid gap-4">
        {recipes.map(recipe => (
          <div 
            key={recipe.id} 
            onClick={() => setSelectedRecipe(recipe)}
            className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex gap-4 cursor-pointer hover:border-emerald-200 transition-all"
          >
            <div className="w-24 h-24 bg-slate-200 rounded-lg flex-shrink-0 overflow-hidden">
               <img 
                 src={`https://picsum.photos/seed/${recipe.id}/200`} 
                 alt="Recipe" 
                 className="w-full h-full object-cover"
               />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-slate-800 truncate pr-2">{recipe.title}</h3>
                {recipe.matchScore && (
                  <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {recipe.matchScore}% Match
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{recipe.description}</p>
              
              <div className="flex items-center gap-3 mt-3">
                 <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-md flex items-center gap-1">
                   <Clock size={12}/> {recipe.prepTime && recipe.cookTime ? recipe.prepTime + recipe.cookTime : '30'}m
                 </span>
                 <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-md flex items-center gap-1">
                   <Flame size={12}/> {recipe.calories || '400'}
                 </span>
              </div>
            </div>
            <div className="flex items-center text-slate-300">
              <ChevronRight size={20} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};