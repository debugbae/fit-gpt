import React, { useState } from 'react';
import { 
  Refrigerator, 
  Search, 
  Trash2, 
  Package
} from 'lucide-react';
import { InventoryItem } from '../types';

interface InventoryProps {
  items: InventoryItem[];
  onAdd: (item: InventoryItem) => void;
  onDelete: (id: string) => void;
}

const Inventory: React.FC<InventoryProps> = ({ items, onAdd, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'fridge' | 'pantry'>('all');

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'all' || item.location.toLowerCase() === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (expiryDate: string) => {
    const daysUntil = Math.ceil((new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntil < 0) return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
    if (daysUntil < 3) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-500 transition-colors" size={18} />
        <input 
          type="text" 
          placeholder="Search your kitchen..." 
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all text-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* HEADER WITH THE MISSING ICON */}
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500 border border-emerald-500/20">
          {/* This is the icon that was missing */}
          <Refrigerator size={24} /> 
        </div>
        <div>
          <h3 className="text-lg font-black text-white tracking-tight">Food Inventory</h3>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-none">Stock Levels</p>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 p-1 bg-zinc-900 rounded-2xl border border-zinc-800">
        {(['all', 'fridge', 'pantry'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeFilter === filter ? 'bg-zinc-800 text-white shadow-lg border border-zinc-700' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Inventory List */}
      <div className="grid gap-3">
        {filteredItems.length > 0 ? (
          filteredItems.map(item => (
            <div key={item.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-3xl flex items-center justify-between group hover:border-zinc-700 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-400 group-hover:text-blue-500 transition-colors">
                  {item.location.toLowerCase() === 'fridge' ? <Refrigerator size={20} /> : <Package size={20} />}
                </div>
                <div>
                  <h4 className="font-bold text-zinc-100">{item.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${getStatusColor(item.expiryDate)}`}>
                      {new Date(item.expiryDate) < new Date() ? 'Expired' : `Expires ${item.expiryDate}`}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={() => onDelete(item.id)} className="p-2 text-zinc-600 hover:text-rose-500 transition-colors">
                <Trash2 size={18} />
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-zinc-900/50 rounded-[2.5rem] border border-dashed border-zinc-800">
            <Package size={32} className="mx-auto text-zinc-800 mb-2" />
            <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest">No items found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;
