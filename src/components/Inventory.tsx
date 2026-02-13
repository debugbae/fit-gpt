import React, { useState } from 'react';
import { 
  Refrigerator, 
  Search, 
  Trash2, 
  Package,
  Plus
} from 'lucide-react';
import { InventoryItem } from '../types';

interface InventoryProps {
  items: InventoryItem[];
  onAdd: (item: InventoryItem) => void;
  onDelete: (id: string) => void;
}

const Inventory: React.FC<InventoryProps> = ({ items = [], onAdd, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'fridge' | 'pantry'>('all');

  const filteredItems = (items || []).filter(item => {
    const name = item?.name?.toLowerCase() || '';
    const matchesSearch = name.includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'all' || (item?.location?.toLowerCase() === activeFilter);
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (expiryDate: string) => {
    const daysUntil = Math.ceil((new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntil < 0) return 'text-rose-400 bg-rose-400/5 border-rose-400/10';
    if (daysUntil < 3) return 'text-amber-400 bg-amber-400/5 border-amber-400/10';
    return 'text-emerald-400 bg-emerald-400/5 border-emerald-400/10';
  };

  return (
    <div className="space-y-6">
      {/* Search Bar - Slightly lighter background */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-500 transition-colors" size={18} />
        <input 
          type="text" 
          placeholder="Search items..." 
          className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-zinc-700 transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Header Section */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500 border border-emerald-500/20">
            <Refrigerator size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-lg font-black text-white tracking-tight uppercase">Food Inventory</h3>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-none">Stock Levels</p>
          </div>
        </div>
        
        <button 
          onClick={() => onAdd({ 
            id: Math.random().toString(36).substr(2, 9), 
            name: 'New Item', 
            expiryDate: new Date().toISOString().split('T')[0], 
            location: 'Fridge', 
            category: 'Other' 
          })}
          className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-900/40 hover:bg-blue-500 transition-all active:scale-95"
        >
          <Plus size={20} strokeWidth={3} />
        </button>
      </div>

      {/* Tabs - Lighter Zinc */}
      <div className="flex gap-2 p-1 bg-zinc-900/80 rounded-2xl border border-zinc-800">
        {(['all', 'fridge', 'pantry'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeFilter === filter 
                ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm' 
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Items List - Matches the "Card" style of the main app */}
      <div className="grid gap-3">
        {filteredItems.length > 0 ? (
          filteredItems.map(item => (
            <div key={item.id} className="bg-zinc-900/40 border border-zinc-800/50 p-4 rounded-[2rem] flex items-center justify-between group hover:border-zinc-700 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-zinc-800/50 rounded-2xl flex items-center justify-center text-zinc-500 group-hover:text-blue-500 transition-colors border border-zinc-800/50">
                  {item.location?.toLowerCase() === 'fridge' ? <Refrigerator size={20} /> : <Package size={20} />}
                </div>
                <div>
                  <h4 className="font-bold text-zinc-100 text-sm tracking-tight">{item.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-lg border ${getStatusColor(item.expiryDate)}`}>
                      {new Date(item.expiryDate) < new Date() ? 'Expired' : `Expires: ${item.expiryDate}`}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => onDelete(item.id)}
                className="p-2 text-zinc-700 hover:text-rose-500 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-zinc-900/20 rounded-[2.5rem] border border-dashed border-zinc-800/50">
            <Package size={32} className="mx-auto text-zinc-800 mb-2" />
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">No items found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;
