import React, { useState } from 'react';
import { Calendar, Wand2, Trash2, Plus, Edit3, Search, ChefHat } from 'lucide-react';
import { MealPlanDay, Recipe, UserProfile, Ingredient } from '../types';
import { generateWeeklyMealPlan } from '../services/geminiService';
import { Button } from './ui/Button';

interface PlannerProps {
  mealPlan: MealPlanDay[];
  setMealPlan: React.Dispatch<React.SetStateAction<MealPlanDay[]>>;
  user: UserProfile;
  inventory: Ingredient[];
  availableRecipes: Recipe[];
}

export const Planner: React.FC<PlannerProps> = ({ mealPlan, setMealPlan, user, inventory, availableRecipes }) => {
  const [loading, setLoading] = useState(false);
  const [editingSlot, setEditingSlot] = useState<{dayIndex: number, type: 'breakfast'|'lunch'|'dinner'} | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const newPlan = await generateWeeklyMealPlan(user, inventory);
      setMealPlan(newPlan);
    } catch (e) {
      alert("Failed to generate plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    if (window.confirm("Are you sure you want to clear the entire week's plan?")) {
      const emptyWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => ({ day }));
      setMealPlan(emptyWeek);
    }
  };

  const openEdit = (dayIndex: number, type: 'breakfast'|'lunch'|'dinner', currentMeal?: Recipe) => {
    setEditingSlot({ dayIndex, type });
    setSearchTerm(currentMeal?.title || '');
  };

  const updateMealSlot = (recipe: Recipe) => {
    if (!editingSlot) return;
    
    setMealPlan(prev => {
      const newPlan = [...prev];
      const day = { ...newPlan[editingSlot.dayIndex] };
      day[editingSlot.type] = recipe;
      newPlan[editingSlot.dayIndex] = day;
      return newPlan;
    });
    
    setEditingSlot(null);
    setSearchTerm('');
  };

  const saveManualEntry = () => {
    if (!editingSlot) return;
    if (!searchTerm.trim()) {
      // Clear slot if empty
      setMealPlan(prev => {
        const newPlan = [...prev];
        const day = { ...newPlan[editingSlot.dayIndex] };
        day[editingSlot.type] = undefined;
        newPlan[editingSlot.dayIndex] = day;
        return newPlan;
      });
      setEditingSlot(null);
      setSearchTerm('');
      return;
    }
    
    // Create a minimal recipe object for manual entry
    const manualRecipe: Recipe = {
      id: Math.random().toString(36).substring(7),
      title: searchTerm,
      calories: 0,
      description: 'Manually added meal',
      tags: ['manual']
    };
    
    updateMealSlot(manualRecipe);
  };

  const filteredRecipes = availableRecipes.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.ingredients?.some(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const displayPlan = days.map(d => {
    return mealPlan.find(m => m.day === d) || { day: d };
  });

  return (
    <div className="space-y-6 pb-24">
      <div className="flex justify-between items-center sticky top-0 bg-[#f8fafc] z-10 py-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Weekly Plan</h2>
          <p className="text-slate-500 text-sm">Organize your meals</p>
        </div>
        <div className="flex gap-2">
           <Button variant="secondary" size="sm" onClick={handleClear} disabled={loading || mealPlan.length === 0}>
             <Trash2 size={18} />
           </Button>
           <Button onClick={handleGenerate} size="sm" isLoading={loading}>
             <Wand2 size={18} className="mr-2" />
             Auto-Plan
           </Button>
        </div>
      </div>

      {editingSlot && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl max-h-[80vh] flex flex-col">
            <h3 className="font-bold text-lg mb-4">
              {days[editingSlot.dayIndex]} {editingSlot.type.charAt(0).toUpperCase() + editingSlot.type.slice(1)}
            </h3>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Search recipes or enter custom..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>

            <div className="flex-1 overflow-y-auto mb-4 space-y-2">
              {searchTerm && !filteredRecipes.find(r => r.title.toLowerCase() === searchTerm.toLowerCase()) && (
                <button 
                  onClick={saveManualEntry}
                  className="w-full text-left p-3 rounded-lg border border-dashed border-slate-300 hover:bg-slate-50 flex items-center gap-2 text-emerald-600 font-medium"
                >
                  <Plus size={16} />
                  Add "{searchTerm}" as custom meal
                </button>
              )}
              
              {filteredRecipes.map(recipe => (
                <button
                  key={recipe.id}
                  onClick={() => updateMealSlot(recipe)}
                  className="w-full text-left p-3 rounded-lg border border-slate-100 hover:bg-emerald-50 hover:border-emerald-200 transition-colors flex gap-3 items-center"
                >
                  <div className="w-10 h-10 bg-slate-200 rounded-md overflow-hidden flex-shrink-0">
                     <img src={`https://picsum.photos/seed/${recipe.id}/100`} alt="" className="w-full h-full object-cover"/>
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-slate-800 truncate">{recipe.title}</div>
                    <div className="text-xs text-slate-500">{recipe.calories || '?'} kcal • {recipe.prepTime && recipe.cookTime ? recipe.prepTime + recipe.cookTime : '?'} min</div>
                  </div>
                </button>
              ))}
              
              {filteredRecipes.length === 0 && !searchTerm && (
                <div className="text-center py-8 text-slate-400 text-sm">
                  <ChefHat size={32} className="mx-auto mb-2 opacity-50" />
                  <p>Type to search existing recipes.</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button variant="secondary" onClick={() => setEditingSlot(null)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {displayPlan.map((day, idx) => (
          <div key={day.day} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 font-semibold text-slate-700 flex justify-between items-center">
              <span>{day.day}</span>
              <span className="text-xs font-normal text-slate-400">
                {((day.breakfast?.calories || 0) + (day.lunch?.calories || 0) + (day.dinner?.calories || 0)) > 0 
                  ? `~${(day.breakfast?.calories || 0) + (day.lunch?.calories || 0) + (day.dinner?.calories || 0)} kcal`
                  : ''}
              </span>
            </div>
            <div className="divide-y divide-slate-50">
              {(['breakfast', 'lunch', 'dinner'] as const).map(type => (
                <div 
                  key={type} 
                  className="p-3 flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors group"
                  onClick={() => openEdit(idx, type, day[type])}
                >
                  <div className="w-16 text-xs text-slate-400 font-medium uppercase tracking-wider">{type}</div>
                  <div className="flex-1">
                    {day[type] ? (
                      <div>
                        <div className="font-medium text-slate-800">{day[type]?.title}</div>
                        <div className="flex gap-2 text-xs text-slate-400 mt-0.5">
                           {day[type]?.calories ? <span className="text-emerald-600 font-medium">{day[type]?.calories} kcal</span> : null}
                           {day[type]?.cookTime ? <span>• {day[type]?.cookTime} min</span> : null}
                        </div>
                      </div>
                    ) : (
                      <div className="text-slate-300 text-sm italic flex items-center gap-1">
                        <Plus size={14} /> Add meal
                      </div>
                    )}
                  </div>
                  <div className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Edit3 size={16} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};