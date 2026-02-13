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

const Inventory: React.FC<InventoryProps> = ({ items = [], onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'fridge' | 'pantry'>('all');

  // Filter logic with safety checks
  const filteredItems = (items || []).filter(item => {
    const name = item?.name?.toLowerCase() || '';
    const matchesSearch = name.includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'all' || (item?.location?.toLowerCase() === activeFilter);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
        <input 
          type="text" 
          placeholder="Search items..." 
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Title Section with the Refrigerator Icon */}
      <div className="flex items-center gap-3 px-1">
        <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-500 border border-emerald-500/20">
          <Refrigerator size={24} strokeWidth={2.5} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white leading-none">Food Inventory</h3>
          <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-1">Current Stock</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 p-1 bg-zinc-900 rounded-2xl border border-zinc-800">
        {(['all', 'fridge', 'pantry'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeFilter === filter 
                ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm' 
                : 'text-zinc-500 hover:text-zinc-400'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Items List */}
      <div className="space-y-3">
        {filteredItems.length > 0 ? (
          filteredItems.map(item => (
            <div key={item.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-3xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-500">
                  {item.location?.toLowerCase() === 'fridge' ? <Refrigerator size={18} /> : <Package size={18} />}
                </div>
                <div>
                  <h4 className="font-bold text-zinc-100 text-sm">{item.name}</h4>
                  <p className="text-[10px] text-zinc-500 font-medium">Expires: {item.expiryDate}</p>
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
          <div className="text-center py-10 border border-dashed border-zinc-800 rounded-[2rem]">
            <Package size={30} className="mx-auto text-zinc-800 mb-2" />
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">No Items Found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;
