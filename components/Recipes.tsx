import React, { useState } from 'react';
import { ChefHat, Clock, Flame, ChevronRight, Wand2, Heart } from 'lucide-react';
import { Ingredient, Recipe, UserProfile } from '../types';
import { generateRecipesFromInventory } from '../services/geminiService';
import { Button } from './ui/Button';

interface RecipesProps {
  inventory: Ingredient[];
  user: UserProfile;
  recipes: Recipe[];
  setRecipes: React.Dispatch<React.SetStateAction<Recipe[]>>;
  savedRecipes: Recipe[];
  setSavedRecipes: React.Dispatch<React.SetStateAction<Recipe[]>>;
}

export const Recipes: React.FC<RecipesProps> = ({ inventory, user, recipes, setRecipes, savedRecipes, setSavedRecipes }) => {
  const [loading, setLoading] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [activeTab, setActiveTab] = useState<'discover' | 'saved'>('discover');

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

  const isRecipeSaved = (id: string) => savedRecipes.some(r => r.id === id);

  const toggleSave = (e: React.MouseEvent, recipe: Recipe) => {
    e.stopPropagation(); // Prevent opening details if clicked from list
    const isSaved = isRecipeSaved(recipe.id);
    if (isSaved) {
      setSavedRecipes(prev => prev.filter(r => r.id !== recipe.id));
    } else {
      setSavedRecipes(prev => [...prev, recipe]);
    }
  };

  if (selectedRecipe) {
    const isSaved = isRecipeSaved(selectedRecipe.id);
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
             <button 
                onClick={(e) => toggleSave(e, selectedRecipe)}
                className="absolute top-4 left-4 p-2 rounded-full bg-white/90 backdrop-blur text-rose-500 shadow-sm transition-transform hover:scale-110 active:scale-95"
             >
                <Heart size={20} className={isSaved ? "fill-current" : ""} />
             </button>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="flex justify-between items-start gap-3">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 leading-tight mb-2">{selectedRecipe.title}</h1>
                <div className="flex gap-4 text-slate-500 text-sm">
                  <span className="flex items-center gap-1"><Clock size={16}/> {selectedRecipe.prepTime && selectedRecipe.cookTime ? selectedRecipe.prepTime + selectedRecipe.cookTime : '30'}m</span>
                  <span className="flex items-center gap-1"><Flame size={16}/> {selectedRecipe.calories || '400'} kcal</span>
                </div>
              </div>
              <button 
                 onClick={(e) => toggleSave(e, selectedRecipe)}
                 className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl border font-medium transition-colors ${
                     isSaved 
                     ? 'bg-rose-50 border-rose-200 text-rose-600' 
                     : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                 }`}
              >
                  <Heart size={18} className={isSaved ? "fill-current" : ""} />
                  {isSaved ? 'Saved' : 'Save'}
              </button>
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

  const recipesToDisplay = activeTab === 'discover' ? recipes : savedRecipes;

  return (
    <div className="space-y-6 pb-24">
      <div className="sticky top-0 bg-[#f8fafc] z-10 pt-4 pb-2">
         <div className="flex items-center justify-between mb-4">
           <h2 className="text-2xl font-bold text-slate-900">Recipes</h2>
           {activeTab === 'discover' && (
             <Button onClick={handleGenerate} size="sm" isLoading={loading}>
                <Wand2 size={16} className="mr-2" />
                Generate
             </Button>
           )}
         </div>

         <div className="flex p-1 bg-slate-200 rounded-xl">
            <button 
              onClick={() => setActiveTab('discover')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'discover' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Discover
            </button>
            <button 
               onClick={() => setActiveTab('saved')}
               className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                 activeTab === 'saved' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
               }`}
            >
              Saved ({savedRecipes.length})
            </button>
         </div>
      </div>

      {activeTab === 'discover' && recipes.length === 0 && !loading && (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
          <ChefHat size={48} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-lg font-medium text-slate-900">Hungry?</h3>
          <p className="text-slate-500 max-w-xs mx-auto mt-2">
            Tap generate to get AI recipes based on what's currently in your kitchen.
          </p>
        </div>
      )}

      {activeTab === 'saved' && savedRecipes.length === 0 && (
         <div className="text-center py-12 text-slate-400">
            <Heart size={48} className="mx-auto mb-3 opacity-50" />
            <p>No saved recipes yet.</p>
            <p className="text-xs mt-1">Generate recipes to save your favorites.</p>
         </div>
      )}

      <div className="grid gap-4">
        {recipesToDisplay.map(recipe => {
           const isSaved = isRecipeSaved(recipe.id);
           return (
            <div 
              key={recipe.id} 
              onClick={() => setSelectedRecipe(recipe)}
              className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex gap-4 cursor-pointer hover:border-emerald-200 transition-all relative group"
            >
              <div className="w-24 h-24 bg-slate-200 rounded-lg flex-shrink-0 overflow-hidden relative">
                 <img 
                   src={`https://picsum.photos/seed/${recipe.id}/200`} 
                   alt="Recipe" 
                   className="w-full h-full object-cover"
                 />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-slate-800 truncate pr-6">{recipe.title}</h3>
                </div>
                {recipe.matchScore && (
                    <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mb-1">
                      {recipe.matchScore}% Match
                    </span>
                )}
                <p className="text-xs text-slate-500 line-clamp-2">{recipe.description}</p>
                
                <div className="flex items-center gap-3 mt-3">
                   <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-md flex items-center gap-1">
                     <Clock size={12}/> {recipe.prepTime && recipe.cookTime ? recipe.prepTime + recipe.cookTime : '30'}m
                   </span>
                   <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-md flex items-center gap-1">
                     <Flame size={12}/> {recipe.calories || '400'}
                   </span>
                </div>
              </div>
              <div className="flex flex-col justify-between items-end">
                  <button 
                    onClick={(e) => toggleSave(e, recipe)}
                    className={`p-1.5 rounded-full transition-colors ${isSaved ? 'text-rose-500 bg-rose-50' : 'text-slate-300 hover:text-rose-400 hover:bg-slate-50'}`}
                  >
                     <Heart size={18} className={isSaved ? "fill-current" : ""} />
                  </button>
                  <ChevronRight size={20} className="text-slate-300" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};