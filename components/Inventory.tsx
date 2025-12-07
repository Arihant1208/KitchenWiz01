import React, { useState } from 'react';
import { Camera, Plus, Trash2, AlertTriangle, Search } from 'lucide-react';
import { Ingredient } from '../types';
import { parseReceiptImage } from '../services/geminiService';
import { Button } from './ui/Button';

interface InventoryProps {
  items: Ingredient[];
  setItems: React.Dispatch<React.SetStateAction<Ingredient[]>>;
}

export const Inventory: React.FC<InventoryProps> = ({ items, setItems }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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

  return (
    <div className="space-y-6 pb-24">
      <div className="flex justify-between items-center sticky top-0 bg-[#f8fafc] z-10 py-4">
        <h2 className="text-2xl font-bold text-slate-900">Kitchen Stock</h2>
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
      </div>

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
    </div>
  );
};