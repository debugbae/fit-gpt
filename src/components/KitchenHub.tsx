import React, { useState, useMemo } from 'react';
import { ShoppingBag, CheckCircle2, ClipboardList, PlusCircle, Copy } from 'lucide-react';
import { InventoryItem, UserStats, RecipeSuggestion } from '../types';
import Inventory from './Inventory';
import RecipeList from './RecipeList';

interface KitchenHubProps {
  inventory: InventoryItem[];
  stats: UserStats;
  onAddInventory: (item: InventoryItem) => void;
  onDeleteInventory: (id: string) => void;
}

// Explicitly define the tabs to prevent TypeScript guessing games
type TabID = 'inventory' | 'shop' | 'recipes';

const KitchenHub: React.FC<KitchenHubProps> = ({ inventory, stats, onAddInventory, onDeleteInventory }) => {
  const [activeTab, setActiveTab] = useState<TabID>('inventory');

  const shoppingList = useMemo(() => {
    try {
      const saved = localStorage.getItem('fitgpt_favorites');
      const favorites: RecipeSuggestion[] = saved ? JSON.parse(saved) : [];
      const missing = new Set<string>();
      
      favorites.forEach(recipe => {
        if (recipe.ingredientsMissing) {
          recipe.ingredientsMissing.forEach(ing => missing.add(ing));
        }
      });
      
      return Array.from(missing);
    } catch (e) {
      return [];
    }
  }, [activeTab]);

  const copyToClipboard = () => {
    if (shoppingList.length > 0) {
      navigator.clipboard.writeText(shoppingList.join(', '));
      alert('Shopping list copied!');
    }
  };

  // Helper to render the buttons without type errors
  const renderTabButton = (id: TabID, label: string) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
        activeTab === id 
          ? 'bg-blue-600 text-white shadow-lg' 
          : 'text-zinc-500 hover:text-zinc-300'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="px-1 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-zinc-100 tracking-tight">Kitchen Hub</h2>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Command Center</p>
        </div>
        
        <div className="flex bg-zinc-800 p-1 rounded-2xl border border-zinc-700">
          {renderTabButton('inventory', 'Stock')}
          {renderTabButton('shop', 'Shop')}
          {renderTabButton('recipes', 'Recipes')}
        </div>
      </header>

      {activeTab === 'inventory' && (
        <Inventory items={inventory} onAdd={onAddInventory} onDelete={onDeleteInventory} />
      )}

      {activeTab === 'shop' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
          <section className="bg-zinc-800 p-6 rounded-[2.5rem] border border-zinc-700 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/20">
                <ShoppingBag size={20} />
              </div>
              <div>
                <h3 className="text-zinc-100 font-black text-sm uppercase tracking-widest leading-none">Smart Shop List</h3>
                <p className="text-[10px] text-zinc-500 font-bold mt-1 uppercase">Targeted restock for Favorites</p>
              </div>
            </div>

            {shoppingList.length > 0 ? (
              <div className="space-y-3">
                {shoppingList.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4 bg-zinc-900 border border-zinc-800 rounded-2xl group transition-all hover:border-blue-500/30">
                    <div className="w-5 h-5 rounded-md border-2 border-zinc-700 flex items-center justify-center transition-all group-hover:border-blue-500">
                      <CheckCircle2 size={12} className="text-blue-500 opacity-0 group-active:opacity-100" />
                    </div>
                    <span className="text-sm font-bold text-zinc-300 uppercase tracking-wide">{item}</span>
                    <PlusCircle size={18} className="ml-auto text-zinc-700 group-hover:text-blue-500 transition-colors" />
                  </div>
                ))}
                
                <div className="pt-6 border-t border-zinc-700/50 mt-4">
                  <button 
                    onClick={copyToClipboard}
                    className="w-full py-4 bg-zinc-700 text-zinc-400 font-black uppercase text-[10px] tracking-widest rounded-2xl hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    <Copy size={14} />
                    Copy List to Clipboard
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-700">
                  <ClipboardList size={32} />
                </div>
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Your shopping list is clear</p>
                <p className="text-[8px] text-zinc-700 font-bold uppercase mt-2">Favorite recipes to see missing stock</p>
              </div>
            )}
          </section>
        </div>
      )}

      {activeTab === 'recipes' && (
        <RecipeList inventory={inventory} stats={stats} />
      )}
    </div>
  );
};

export default KitchenHub;
