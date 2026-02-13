
import React, { useState } from 'react';
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
        <h2 className="text-2xl font-bold text-zinc-100 tracking-tight">Food Inventory</h2>
        <button 
          onClick={() => setShowForm(!showForm)}
          className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all shadow-lg ${showForm ? 'bg-zinc-700 text-zinc-400' : 'bg-blue-500 text-white shadow-blue-950/20'}`}
        >
          <i className={`fas ${showForm ? 'fa-times' : 'fa-plus'}`}></i>
        </button>
      </div>

      {showForm && (
        <div className="bg-zinc-800 p-6 rounded-3xl shadow-2xl border border-zinc-700 space-y-5 animate-in zoom-in-95 duration-200">
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
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
            />
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
      <div className="flex bg-zinc-800 p-1.5 rounded-[1.5rem] border border-zinc-700">
        {(['Fridge', 'Pantry'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-2xl transition-all ${activeTab === tab ? 'bg-zinc-700 text-blue-500 shadow-lg' : 'text-zinc-600 hover:text-zinc-400'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {filteredItems.length > 0 ? (
          filteredItems.sort((a,b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()).map(item => {
            const daysLeft = Math.ceil((new Date(item.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
            const isCritical = daysLeft >= 0 && daysLeft < 3;
            const isExpired = daysLeft < 0;
            
            return (
              <div key={item.id} className="group bg-zinc-800/60 p-4 rounded-3xl border border-zinc-700 flex items-center justify-between shadow-sm hover:border-zinc-600 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${isCritical || isExpired ? 'bg-blue-500/10 border-blue-500/30 text-blue-500' : 'bg-zinc-700 border-zinc-600 text-zinc-500'}`}>
                    <i className={`fas ${item.category === 'Fridge' ? 'fa-snowflake' : 'fa-box-open'}`}></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-100">{item.name}</h4>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest inline-block mt-1 ${isExpired ? 'bg-zinc-700 text-zinc-600' : isCritical ? 'bg-blue-600/20 text-blue-500' : 'bg-zinc-700 text-zinc-500'}`}>
                      {isExpired ? 'Expired' : `${daysLeft} days left`}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => onDelete(item.id)}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-600 hover:text-blue-500 transition-colors"
                >
                  <i className="fas fa-trash-alt text-sm"></i>
                </button>
              </div>
            );
          })
        ) : (
          <div className="text-center py-16 opacity-30">
            <div className="text-6xl mb-6">
              <i className="fas fa-barcode-read"></i>
            </div>
            <p className="font-black uppercase text-xs tracking-widest">{activeTab} is Empty</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;