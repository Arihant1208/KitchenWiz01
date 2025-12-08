import React, { useState, useEffect } from 'react';
import { LayoutGrid, List, UtensilsCrossed, MessageSquare, User, Calendar, Bot } from 'lucide-react';
import { Inventory } from './components/Inventory';
import { Dashboard } from './components/Dashboard';
import { Recipes } from './components/Recipes';
import { Assistant } from './components/Assistant';
import { Profile } from './components/Profile';
import { Planner } from './components/Planner';
import { Ingredient, UserProfile, ViewState, MealPlanDay, Recipe, ShoppingItem } from './types';

// Initial Mock Data
const INITIAL_INVENTORY: Ingredient[] = [
  { id: '1', name: 'Eggs', quantity: '12', category: 'dairy', expiryDate: '2023-12-10' },
  { id: '2', name: 'Spinach', quantity: '200g', category: 'produce', expiryDate: '2023-12-05' },
  { id: '3', name: 'Chicken Breast', quantity: '500g', category: 'meat', expiryDate: '2023-12-07' },
  { id: '4', name: 'Rice', quantity: '1kg', category: 'pantry', expiryDate: '2024-06-01' },
];

const INITIAL_USER: UserProfile = {
  name: 'Chef',
  dietaryRestrictions: [],
  allergies: [],
  goals: 'maintenance',
  cookingSkill: 'intermediate',
  householdSize: 2,
  cuisinePreferences: ['Italian'],
  maxCookingTime: 45
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  
  const [inventory, setInventory] = useState<Ingredient[]>(() => {
    const saved = localStorage.getItem('inventory');
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
  });
  
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

  const [mealPlan, setMealPlan] = useState<MealPlanDay[]>(() => {
    const saved = localStorage.getItem('mealPlan');
    return saved ? JSON.parse(saved) : [];
  });

  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    const saved = localStorage.getItem('recipes');
    return saved ? JSON.parse(saved) : [];
  });

  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>(() => {
    const saved = localStorage.getItem('savedRecipes');
    return saved ? JSON.parse(saved) : [];
  });

  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>(() => {
    const saved = localStorage.getItem('shoppingList');
    return saved ? JSON.parse(saved) : [];
  });

  // Persistence
  useEffect(() => {
    localStorage.setItem('inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('mealPlan', JSON.stringify(mealPlan));
  }, [mealPlan]);

  useEffect(() => {
    localStorage.setItem('recipes', JSON.stringify(recipes));
  }, [recipes]);

  useEffect(() => {
    localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes));
  }, [savedRecipes]);

  useEffect(() => {
    localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
  }, [shoppingList]);

  // Notifications for expiring items
  useEffect(() => {
    const checkExpiryAndNotify = async () => {
      if (!("Notification" in window)) return;
      
      let permission = Notification.permission;
      if (permission === 'default') {
        try {
          permission = await Notification.requestPermission();
        } catch (e) {
          console.error("Failed to request notification permission", e);
        }
      }
      
      if (permission === 'granted') {
        const today = new Date();
        const expiringItems = inventory.filter(item => {
          const expiry = new Date(item.expiryDate);
          const diffTime = expiry.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= 3 && diffDays >= 0;
        });

        if (expiringItems.length > 0) {
          const hasNotified = sessionStorage.getItem('notifiedExpiry');
          // Only notify once per session to avoid spam
          if (!hasNotified) {
             new Notification('KitchenWiz Alert', {
               body: `${expiringItems.length} items are expiring soon! Check your inventory to avoid waste.`,
             });
             sessionStorage.setItem('notifiedExpiry', 'true');
          }
        }
      }
    };
    
    checkExpiryAndNotify();
  }, [inventory]);

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard inventory={inventory} />;
      case 'inventory': 
        return (
          <Inventory 
            items={inventory} 
            setItems={setInventory} 
            shoppingList={shoppingList}
            setShoppingList={setShoppingList}
            mealPlan={mealPlan}
          />
        );
      case 'recipes': return <Recipes 
        inventory={inventory} 
        user={user} 
        recipes={recipes} 
        setRecipes={setRecipes}
        savedRecipes={savedRecipes}
        setSavedRecipes={setSavedRecipes}
      />;
      case 'planner': return <Planner mealPlan={mealPlan} setMealPlan={setMealPlan} user={user} inventory={inventory} availableRecipes={recipes} />;
      case 'assistant': return <Assistant inventory={inventory} />;
      case 'profile': return <Profile user={user} setUser={setUser} />;
      default: return <Dashboard inventory={inventory} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-800">
      <main className="max-w-md mx-auto min-h-screen bg-white shadow-2xl overflow-hidden relative">
        <div className="px-6 min-h-screen pb-20">
           {renderContent()}
        </div>

        {/* Floating Assistant Button - Visible unless already on assistant view */}
        {currentView !== 'assistant' && (
          <button
            onClick={() => setCurrentView('assistant')}
            className="fixed bottom-24 right-6 w-14 h-14 bg-emerald-600 rounded-full shadow-lg shadow-emerald-200 flex items-center justify-center text-white hover:scale-105 transition-transform z-40"
          >
            <Bot size={28} />
          </button>
        )}

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center z-50">
          <button 
            onClick={() => setCurrentView('dashboard')}
            className={`flex flex-col items-center gap-1 transition-colors ${currentView === 'dashboard' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <LayoutGrid size={24} strokeWidth={currentView === 'dashboard' ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Home</span>
          </button>

          <button 
            onClick={() => setCurrentView('inventory')}
            className={`flex flex-col items-center gap-1 transition-colors ${currentView === 'inventory' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <List size={24} strokeWidth={currentView === 'inventory' ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Stock</span>
          </button>

          <div className="relative -top-6">
             <button 
                onClick={() => setCurrentView('recipes')}
                className="bg-emerald-600 text-white p-4 rounded-full shadow-lg shadow-emerald-200 hover:scale-105 transition-transform"
             >
                <UtensilsCrossed size={28} />
             </button>
          </div>

          <button 
            onClick={() => setCurrentView('planner')}
            className={`flex flex-col items-center gap-1 transition-colors ${currentView === 'planner' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Calendar size={24} strokeWidth={currentView === 'planner' ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Plan</span>
          </button>

          <button 
            onClick={() => setCurrentView('profile')}
            className={`flex flex-col items-center gap-1 transition-colors ${currentView === 'profile' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <User size={24} strokeWidth={currentView === 'profile' ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Me</span>
          </button>
        </nav>
      </main>
    </div>
  );
};

export default App;