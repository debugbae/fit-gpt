import React, { useState, useMemo } from 'react';
import { ShoppingBag, CheckCircle2, ClipboardList, PlusCircle, Copy, Sparkles, X } from 'lucide-react';
import { InventoryItem, UserStats, RecipeSuggestion } from '../types';
import Inventory from './Inventory';
import RecipeList from './RecipeList';

// Mock AI recipe generator based on current inventory (no API call)
function getMockRecipeFromIngredients(items: InventoryItem[]): { title: string; ingredientsUsed: string[]; instructions: string[] } {
  const names = items.map(i => i.name.toLowerCase());
  if (names.some(n => n.includes('spinach')) && names.some(n => n.includes('egg'))) {
    return {
      title: 'Protein Power Omelette',
      ingredientsUsed: ['Spinach', 'Eggs'],
      instructions: ['Beat eggs with a pinch of salt.', 'Sauté spinach until wilted.', 'Pour eggs into pan, add spinach, fold when set.', 'Serve with a side of toast.'],
    };
  }
  if (names.some(n => n.includes('tomato')) && names.some(n => n.includes('basil') || n.includes('mozzarella'))) {
    return {
      title: 'Caprese-Style Bruschetta',
      ingredientsUsed: ['Tomatoes', 'Basil', 'Mozzarella'],
      instructions: ['Dice tomatoes and tear basil.', 'Layer tomato, mozzarella, and basil on toasted bread.', 'Drizzle with olive oil and balsamic.'],
    };
  }
  if (names.some(n => n.includes('chicken')) && names.some(n => n.includes('lemon') || n.includes('garlic'))) {
    return {
      title: 'Lemon Garlic Chicken',
      ingredientsUsed: ['Chicken', 'Lemon', 'Garlic'],
      instructions: ['Season chicken and sear until golden.', 'Add minced garlic and lemon juice to the pan.', 'Finish in the oven until cooked through.'],
    };
  }
  if (names.some(n => n.includes('oat')) || names.some(n => n.includes('banana'))) {
    return {
      title: 'Quick Banana Oat Bowl',
      ingredientsUsed: names.filter(n => n.includes('oat') || n.includes('banana')).map(n => n.charAt(0).toUpperCase() + n.slice(1)),
      instructions: ['Mash banana and mix with oats.', 'Add milk or yogurt and microwave 2 min.', 'Top with honey and nuts if you have them.'],
    };
  }
  // Generic fallback
  const used = items.slice(0, 5).map(i => i.name);
  return {
    title: used.length > 0 ? 'Kitchen Sink Surprise' : 'Empty Kitchen Inspiration',
    ingredientsUsed: used.length > 0 ? used : ['Add items to your inventory for tailored ideas!'],
    instructions: ['Chop your ingredients roughly.', 'Sauté in a pan with oil until tender.', 'Season with salt, pepper, and herbs.', 'Serve hot and enjoy!'],
  };
}

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
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<{ title: string; ingredientsUsed: string[]; instructions: string[] } | null>(null);

  const openSuggestRecipe = () => {
    setGeneratedRecipe(getMockRecipeFromIngredients(inventory));
    setShowRecipeModal(true);
  };

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
      <header className="px-1 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-zinc-100 tracking-tight">Kitchen Hub</h2>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Command Center</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openSuggestRecipe}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/50 text-zinc-200 hover:text-white hover:border-zinc-700/50 transition-all text-xs font-bold uppercase tracking-widest shadow-sm"
          >
            <Sparkles size={16} strokeWidth={2} className="text-amber-400/90" />
            Suggest Recipe
          </button>
          <div className="flex bg-zinc-900/40 backdrop-blur-sm p-1 rounded-2xl border border-zinc-800/50">
            {renderTabButton('inventory', 'Stock')}
            {renderTabButton('shop', 'Shop')}
            {renderTabButton('recipes', 'Recipes')}
          </div>
        </div>
      </header>

      {activeTab === 'inventory' && (
        <Inventory items={inventory} onAdd={onAddInventory} onDelete={onDeleteInventory} />
      )}

      {activeTab === 'shop' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
          <section className="bg-zinc-900/40 backdrop-blur-sm p-6 rounded-[2.5rem] border border-zinc-800/50 shadow-xl">
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
                  <div key={idx} className="flex items-center gap-4 p-4 bg-zinc-900/40 border border-zinc-800/50 rounded-2xl group transition-all hover:border-blue-500/30 backdrop-blur-sm">
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
              <div className="text-center py-12 rounded-3xl border border-zinc-800/50 bg-zinc-900/40 backdrop-blur-sm">
                <div className="w-16 h-16 bg-zinc-900/60 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-600 border border-zinc-800/50">
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

      {/* AI Recipe Suggestion Modal */}
      {showRecipeModal && generatedRecipe && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowRecipeModal(false)}
        >
          <div
            className="w-full max-w-md max-h-[85vh] overflow-y-auto rounded-[2rem] border border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <Sparkles size={20} className="text-amber-400" strokeWidth={2} />
                  </div>
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Generated Recipe</span>
                </div>
                <button
                  onClick={() => setShowRecipeModal(false)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 border border-transparent hover:border-zinc-700/50 transition-all"
                  aria-label="Close"
                >
                  <X size={20} strokeWidth={2} />
                </button>
              </div>
              <h3 className="text-xl font-black text-zinc-100 tracking-tight">{generatedRecipe.title}</h3>
              <div className="space-y-2">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Ingredients used</p>
                <p className="text-sm text-zinc-300">{generatedRecipe.ingredientsUsed.join(', ')}</p>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Instructions</p>
                <ol className="list-decimal list-inside space-y-1.5 text-sm text-zinc-300">
                  {generatedRecipe.instructions.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>
              <button
                onClick={() => setShowRecipeModal(false)}
                className="w-full py-4 rounded-2xl bg-zinc-800/60 border border-zinc-800/50 text-zinc-200 font-black text-xs uppercase tracking-widest hover:bg-zinc-700/50 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KitchenHub;
