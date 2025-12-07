import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { PieChart, Pie } from 'recharts';
import { Ingredient } from '../types';
import { ShoppingBag, TrendingUp, AlertCircle } from 'lucide-react';

interface DashboardProps {
  inventory: Ingredient[];
}

export const Dashboard: React.FC<DashboardProps> = ({ inventory }) => {
  // Calculate category distribution
  const categoryData = inventory.reduce((acc, item) => {
    const existing = acc.find(x => x.name === item.category);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: item.category, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#64748b'];

  const expiringCount = inventory.filter(i => {
    const diff = new Date(i.expiryDate).getTime() - new Date().getTime();
    return diff < (1000 * 3600 * 24 * 3);
  }).length;

  return (
    <div className="space-y-6 pb-24">
      <div className="py-4">
        <h2 className="text-2xl font-bold text-slate-900">Kitchen Overview</h2>
        <p className="text-slate-500">Here's what's happening in your pantry.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-emerald-500 p-4 rounded-2xl text-white shadow-lg shadow-emerald-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-emerald-100 text-sm font-medium mb-1">Total Items</p>
              <h3 className="text-3xl font-bold">{inventory.length}</h3>
            </div>
            <ShoppingBag className="opacity-50" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-start justify-between">
             <div>
               <p className="text-slate-500 text-sm font-medium mb-1">Expiring Soon</p>
               <h3 className={`text-3xl font-bold ${expiringCount > 0 ? 'text-red-500' : 'text-slate-800'}`}>
                 {expiringCount}
               </h3>
             </div>
             <AlertCircle className="text-slate-300" />
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
           <TrendingUp size={18} className="text-emerald-500" />
           Inventory by Category
        </h3>
        <div className="h-64 w-full">
           {categoryData.length > 0 ? (
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
               </PieChart>
             </ResponsiveContainer>
           ) : (
             <div className="h-full flex items-center justify-center text-slate-400">
               No data available
             </div>
           )}
        </div>
        <div className="flex flex-wrap gap-2 justify-center mt-2">
           {categoryData.map((entry, index) => (
             <div key={index} className="flex items-center gap-1 text-xs text-slate-600">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                {entry.name}
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};