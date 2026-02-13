import React, { useState } from 'react';
import { Refrigerator, Plus, X, Package } from 'lucide-react';
import { InventoryItem } from '../types';

interface InventoryProps {
  items: InventoryItem[];
  onAdd: (item: InventoryItem) => void;
  onDelete: (id: string) => void;
}

const Inventory: React.FC<InventoryProps> = ({ items, onAdd, onDelete }) => {
  const [activeTab, setActiveTab] = useState<'Fridge' | 'Pantry'>('Fridge');
  const [showForm, setShowForm] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  // Default to 7 days from today in YYYY-MM-DD format for date input
  const getDefaultDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().split('T')[0];
  };
  const [expiry, setExpiry] = useState('');

  const filteredItems = items.filter(i => i.category === activeTab);

  const handleAdd = () => {
    if (!newItemName) return;
    const item: InventoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: newItemName,
      category: activeTab,
      expiryDate: expiry || new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
      quantity: '1 unit'
    };
    onAdd(item);
    setNewItemName('');
    setExpiry('');
    setShowForm(false);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <Refrigerator className="text-blue-500 shrink-0" size={24} strokeWidth={2.5} />
          <h2 className="text-2xl font-bold text-zinc-100 tracking-tight">Food Inventory</h2>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          aria-label={showForm ? 'Close add item' : 'Add item'}
          className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all shadow-lg border ${showForm ? 'bg-zinc-900/40 text-zinc-400 border-zinc-800/50' : 'bg-blue-500 text-white shadow-blue-950/20 border-blue-500/30'}`}
        >
          {showForm ? <X size={20} strokeWidth={2.5} /> : <Plus size={22} strokeWidth={2.5} />}
        </button>
      </div>

      {showForm && (
        <div className="bg-zinc-900/40 backdrop-blur-sm p-6 rounded-3xl shadow-2xl border border-zinc-800/50 space-y-5 animate-in zoom-in-95 duration-200">
          <div>
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2 ml-1">Label Name</label>
            <input
              className="w-full bg-zinc-700 border border-zinc-600 rounded-2xl px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-zinc-600"
              placeholder="e.g. Atlantic Salmon"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2 ml-1">Use By Date</label>
            <input
              type="date"
              className="w-full bg-zinc-700 border border-zinc-600 rounded-2xl px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 color-scheme-dark"
              style={{ colorScheme: 'dark' }}
              min={new Date().toISOString().split('T')[0]}
              placeholder={getDefaultDate()}
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
            />
            {!expiry && (
              <p className="text-[9px] text-zinc-500 mt-1 ml-1">Leave empty to default to 7 days from today</p>
            )}
          </div>
          <button
            onClick={handleAdd}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-950/40 hover:bg-blue-500 transition-all"
          >
            Add to {activeTab}
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex bg-zinc-900/40 backdrop-blur-sm p-1.5 rounded-[1.5rem] border border-zinc-800/50">
        {(['Fridge', 'Pantry'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-2xl transition-all ${activeTab === tab ? 'bg-zinc-800/60 text-blue-500 shadow-lg border border-zinc-800/50' : 'text-zinc-600 hover:text-zinc-400'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {filteredItems.length > 0 ? (
          filteredItems
            .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())
            .map(item => {
              // Calculate days left, ensuring we compare dates at midnight to avoid timezone issues
              const expiryDate = new Date(item.expiryDate);
              const today = new Date();
              expiryDate.setHours(0, 0, 0, 0);
              today.setHours(0, 0, 0, 0);
              const daysLeft = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
              const isExpired = daysLeft < 0;
              const isExpiringSoon = daysLeft >= 0 && daysLeft <= 2; // 1-2 days left
              const isFresh = daysLeft >= 3; // 3+ days left

              // Determine status text and colors
              let statusText: string;
              let statusBg: string;
              let statusTextColor: string;
              let statusBorder: string;
              let iconBg: string;
              let iconBorder: string;
              let iconColor: string;

              if (isExpired) {
                statusText = 'Expired';
                statusBg = 'bg-rose-500/20';
                statusTextColor = 'text-rose-400';
                statusBorder = 'border-rose-500/30';
                iconBg = 'bg-rose-500/10';
                iconBorder = 'border-rose-500/30';
                iconColor = 'text-rose-500';
              } else if (isExpiringSoon) {
                statusText = 'Expiring Soon';
                statusBg = 'bg-amber-500/20';
                statusTextColor = 'text-amber-400';
                statusBorder = 'border-amber-500/30';
                iconBg = 'bg-amber-500/10';
                iconBorder = 'border-amber-500/30';
                iconColor = 'text-amber-500';
              } else {
                statusText = 'Fresh';
                statusBg = 'bg-emerald-500/20';
                statusTextColor = 'text-emerald-400';
                statusBorder = 'border-emerald-500/30';
                iconBg = 'bg-emerald-500/10';
                iconBorder = 'border-emerald-500/30';
                iconColor = 'text-emerald-500';
              }

              return (
                <div key={item.id} className="group bg-zinc-900/40 backdrop-blur-sm p-4 rounded-3xl border border-zinc-800/50 flex items-center justify-between shadow-sm hover:border-zinc-700 transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${iconBg} ${iconBorder} ${iconColor}`}>
                      {item.category === 'Fridge' ? <Refrigerator size={20} strokeWidth={2} /> : <Package size={20} strokeWidth={2} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-zinc-100">{item.name}</h4>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest inline-block mt-1 border ${statusBg} ${statusTextColor} ${statusBorder}`}>
                        {isExpired ? statusText : `${daysLeft} days left`}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-600 hover:text-rose-500 transition-colors"
                    aria-label="Delete item"
                  >
                    <X size={18} strokeWidth={2.5} />
                  </button>
                </div>
              );
            })
        ) : (
          <div className="text-center py-16 rounded-3xl border border-zinc-800/50 bg-zinc-900/40 backdrop-blur-sm opacity-60">
            <div className="text-6xl mb-6">
              <Refrigerator size={48} className="mx-auto text-zinc-600" />
            </div>
            <p className="font-black uppercase text-xs tracking-widest">{activeTab} is Empty</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;
