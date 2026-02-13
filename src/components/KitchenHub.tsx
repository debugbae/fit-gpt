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

const KitchenHub: React.FC<KitchenHubProps> = ({ inventory, stats, onAddInventory, onDeleteInventory }) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'recipes' | 'shop'>('inventory');

  const shoppingList = useMemo(() => {
    const saved = localStorage.getItem('fitgpt_favorites');
    const favorites: RecipeSuggestion[] = saved ? JSON.parse(saved) : [];
    const missing = new Set<string>();
    
    favorites.forEach(recipe => {
      recipe.ingredientsMissing.forEach(ing => missing.add(ing));
    });
    
    return Array.from(missing);
  }, [activeTab]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shoppingList.join(', '));
    alert('Shopping list copied!');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="px-1 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-zinc-100 tracking-tight">Kitchen Hub</h2>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Command Center</p>
        </div>
        
        <div className="flex bg-zinc-800 p-1 rounded-2xl border border-zinc-700">
          {(['inventory', 'shop', 'recipes'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab === 'inventory' ? 'Stock' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </header>

      {activeTab === 'inventory' && (
        <Inventory items={inventory} onAdd={onAddInventory} onDelete={onDeleteInventory} />
      )}

      {activeTab === 'shop' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
          <section className="bg-zinc-800 p-6 rounded-[2.5rem] border border-zinc-700 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
