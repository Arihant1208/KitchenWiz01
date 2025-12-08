import React, { useState } from 'react';
import { Camera, Plus, Trash2, AlertTriangle, Search, ShoppingCart, CheckCircle, Circle, ArrowRight, Wand2 } from 'lucide-react';
import { Ingredient, ShoppingItem, MealPlanDay } from '../types';
import { parseReceiptImage, generateShoppingList } from '../services/geminiService';
import { Button } from './ui/Button';

interface InventoryProps {
  items: Ingredient[];
  setItems: React.Dispatch<React.SetStateAction<Ingredient[]>>;
  shoppingList: ShoppingItem[];
  setShoppingList: React.Dispatch<React.SetStateAction<ShoppingItem[]>>;
  mealPlan: MealPlanDay[];
}

export const Inventory: React.FC<InventoryProps> = ({ items, setItems, shoppingList, setShoppingList, mealPlan }) => {
  const [activeTab, setActiveTab] = useState<'stock' | 'shopping'>('stock');
  const [isScanning, setIsScanning] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // --- Stock Logic ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64 = (reader.result as string).split(',')[1];
        const newItems = await parseReceiptImage(base64);
        setItems(prev => [...prev, ...newItems]);
      } catch (error) {
        alert("Failed to scan receipt. Please try again.");
      } finally {
        setIsScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const getDaysUntilExpiry = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  };

  const filteredItems = items.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryColor = (cat: string) => {
    switch(cat) {
      case 'produce': return 'bg-green-100 text-green-800';
      case 'meat': return 'bg-red-100 text-red-800';
      case 'dairy': return 'bg-yellow-100 text-yellow-800';
      case 'pantry': return 'bg-orange-100 text-orange-800';
      case 'frozen': return 'bg-blue-100 text-blue-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  // --- Shopping List Logic ---
  const handleGenerateShoppingList = async () => {
    if (mealPlan.length === 0) {
      alert("Please generate a meal plan first!");
      return;
    }
    setIsGenerating(true);
    try {
      const newList = await generateShoppingList(items, mealPlan);
      // Merge logic: append new items, don't duplicate exact matches if possible, 
      // but for simplicity we'll just append and let user manage.
      setShoppingList(prev => [...prev, ...newList]);
    } catch (e) {
      alert("Failed to generate list");
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleCheck = (id: string) => {
    setShoppingList(prev => prev.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const removeShoppingItem = (id: string) => {
    setShoppingList(prev => prev.filter(item => item.id !== id));
  };

  const moveCheckedToStock = () => {
    const checked = shoppingList.filter(i => i.checked);
    if (checked.length === 0) return;

    const today = new Date();
    // Default expiry estimate (e.g., 7 days) if we don't know
    const defaultExpiry = new Date(today.setDate(today.getDate() + 7)).toISOString().split('T')[0];

    const newStockItems: Ingredient[] = checked.map(item => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      category: item.category,
      expiryDate: defaultExpiry // Ideally user would edit this, but for auto-move we guess
    }));

    setItems(prev => [...prev, ...newStockItems]);
    setShoppingList(prev => prev.filter(i => !i.checked));
    alert(`Moved ${checked.length} items to your Stock!`);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header with Tabs */}
      <div className="sticky top-0 bg-[#f8fafc] z-10 pt-4 pb-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-slate-900">Kitchen Manager</h2>
          {activeTab === 'stock' && (
             <div className="flex gap-2">
                <label className="cursor-pointer">
                   <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileUpload} />
                   <div className={`p-2 rounded-full ${isScanning ? 'bg-slate-200' : 'bg-emerald-100 text-emerald-600'}`}>
                      {isScanning ? <span className="animate-spin block w-6 h-6 border-2 border-emerald-500 rounded-full border-t-transparent"></span> : <Camera size={24} />}
                   </div>
                </label>
                <button className="p-2 rounded-full bg-slate-200 text-slate-700" onClick={() => alert("Manual add feature coming soon!")}>
                  <Plus size={24} />
                </button>
             </div>
          )}
          {activeTab === 'shopping' && (
             <button className="p-2 rounded-full bg-slate-200 text-slate-700" onClick={() => alert("Manual add feature coming soon!")}>
               <Plus size={24} />
             </button>
          )}
        </div>

        <div className="flex p-1 bg-slate-200 rounded-xl">
          <button 
            onClick={() => setActiveTab('stock')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'stock' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            My Stock ({items.length})
          </button>
          <button 
             onClick={() => setActiveTab('shopping')}
             className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
               activeTab === 'shopping' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
             }`}
          >
            Shopping List ({shoppingList.length})
          </button>
        </div>
      </div>

      {activeTab === 'stock' ? (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search ingredients..." 
              className="w-full pl-10 pr-4 py-3 rounded-xl border-none bg-white shadow-sm focus:ring-2 focus:ring-emerald-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid gap-3">
            {filteredItems.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <p>No items found.</p>
                <p className="text-sm">Scan a receipt to get started!</p>
              </div>
            ) : (
              filteredItems.map(item => {
                const daysLeft = getDaysUntilExpiry(item.expiryDate);
                const isExpiring = daysLeft <= 3;

                return (
                  <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between border border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold uppercase ${getCategoryColor(item.category)}`}>
                        {item.category.substring(0, 2)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800">{item.name}</h3>
                        <p className="text-sm text-slate-500">{item.quantity} • Expires in {daysLeft} days</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {isExpiring && <AlertTriangle size={18} className="text-amber-500" />}
                      <button onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-red-500">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-col min-h-[50vh]">
          {shoppingList.length === 0 && !isGenerating ? (
            <div className="text-center py-12 flex flex-col items-center">
              <ShoppingCart size={48} className="text-slate-300 mb-3" />
              <h3 className="text-lg font-medium text-slate-900">Your list is empty</h3>
              <p className="text-slate-500 max-w-xs mb-6">
                Generate a shopping list based on your weekly meal plan and current inventory.
              </p>
              <Button onClick={handleGenerateShoppingList} isLoading={isGenerating}>
                 <Wand2 size={18} className="mr-2" />
                 Generate from Plan
              </Button>
            </div>
          ) : (
            <>
               <div className="flex justify-between items-center mb-2">
                 <span className="text-sm text-slate-500">{shoppingList.filter(i => i.checked).length} checked</span>
                 <button onClick={handleGenerateShoppingList} disabled={isGenerating} className="text-emerald-600 text-sm font-medium flex items-center gap-1">
                   {isGenerating ? 'Generating...' : <><Wand2 size={14}/> Refresh from Plan</>}
                 </button>
               </div>
               
               <div className="space-y-2 mb-20">
                 {shoppingList.map(item => (
                   <div 
                     key={item.id} 
                     className={`p-3 rounded-xl border flex items-center gap-3 transition-colors cursor-pointer ${
                       item.checked 
                         ? 'bg-emerald-50 border-emerald-100' 
                         : 'bg-white border-slate-100 shadow-sm'
                     }`}
                     onClick={() => toggleCheck(item.id)}
                   >
                     <div className={`flex-shrink-0 ${item.checked ? 'text-emerald-500' : 'text-slate-300'}`}>
                       {item.checked ? <CheckCircle size={24} /> : <Circle size={24} />}
                     </div>
                     <div className="flex-1 min-w-0">
                       <h3 className={`font-medium truncate ${item.checked ? 'text-emerald-800 line-through' : 'text-slate-800'}`}>
                         {item.name}
                       </h3>
                       <p className={`text-xs ${item.checked ? 'text-emerald-600' : 'text-slate-500'}`}>
                         {item.quantity} • {item.category}
                       </p>
                     </div>
                     <button 
                       onClick={(e) => { e.stopPropagation(); removeShoppingItem(item.id); }} 
                       className="p-2 text-slate-300 hover:text-red-500"
                     >
                       <Trash2 size={18} />
                     </button>
                   </div>
                 ))}
               </div>

               {shoppingList.some(i => i.checked) && (
                 <div className="fixed bottom-24 left-6 right-6 z-20">
                   <Button onClick={moveCheckedToStock} className="w-full shadow-lg shadow-emerald-200">
                     <ArrowRight size={18} className="mr-2" />
                     Move Checked to Stock
                   </Button>
                 </div>
               )}
            </>
          )}
        </div>
      )}
    </div>
  );
};