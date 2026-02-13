
import React, { useState, useEffect, useMemo } from 'react';
import { suggestRecipes } from '../services/geminiService';
import { InventoryItem, UserStats, RecipeSuggestion } from '../types';

interface RecipeListProps {
  inventory: InventoryItem[];
  stats: UserStats;
}

const DIET_OPTIONS = ['Vegetarian', 'Vegan', 'Gluten-Free'];
type SortField = 'matchPercentage' | 'calories' | 'protein' | 'wastePreventionScore';

const RecipeList: React.FC<RecipeListProps> = ({ inventory, stats }) => {
  const [recipes, setRecipes] = useState<RecipeSuggestion[]>([]);
  // Use lazy initializer to read from localStorage only once on mount
  const [favorites, setFavorites] = useState<RecipeSuggestion[]>(() => {
    const saved = localStorage.getItem('fitgpt_favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDiet, setActiveDiet] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortField>('wastePreventionScore');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Persist favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('fitgpt_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const fetchRecipes = async (query?: string, diet?: string | null) => {
    if (showFavoritesOnly) return;
    
    setIsLoading(true);
    try {
      const results = await suggestRecipes(inventory, stats, query, diet || undefined);
      setRecipes(results);
    } catch (error) {
      console.error("Failed to fetch recipes", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes(searchQuery, activeDiet);
  }, [inventory, activeDiet, showFavoritesOnly]);

  const toggleDiet = (diet: string) => {
    setShowFavoritesOnly(false);
    const nextDiet = activeDiet === diet ? null : diet;
    setActiveDiet(nextDiet);
  };

  const isFavorite = (title: string) => favorites.some(f => f.title === title);

  const toggleFavorite = (recipe: RecipeSuggestion) => {
    setFavorites(prev => {
      const exists = prev.some(f => f.title === recipe.title);
      if (exists) {
        return prev.filter(f => f.title !== recipe.title);
      } else {
        return [...prev, recipe];
      }
    });
  };

  const handleShare = (recipe: RecipeSuggestion) => {
    const subject = encodeURIComponent(`FitGPT Recipe: ${recipe.title}`);
    const bodyText = `Check out this recipe: ${recipe.title}\n\nCalories: ${recipe.macros.calories}kcal\nProtein: ${recipe.macros.protein}g\n\nInstructions:\n${recipe.instructions.join('\n')}`;
    const body = encodeURIComponent(bodyText);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const displayedRecipes = useMemo(() => {
    let baseList = showFavoritesOnly ? favorites : recipes;
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      baseList = baseList.filter(r => 
        r.title.toLowerCase().includes(q) || 
        r.ingredientsUsed.some(i => i.toLowerCase().includes(q))
      );
    }

    return [...baseList].sort((a, b) => {
      let valA: number;
      let valB: number;

      switch (sortBy) {
        case 'calories':
          valA = a.macros.calories;
          valB = b.macros.calories;
          break;
        case 'protein':
          valA = a.macros.protein;
          valB = b.macros.protein;
          break;
        case 'wastePreventionScore':
          valA = a.wastePreventionScore;
          valB = b.wastePreventionScore;
          break;
        default:
          valA = a.matchPercentage;
          valB = b.matchPercentage;
      }

      return sortOrder === 'desc' ? valB - valA : valA - valB;
    });
  }, [recipes, favorites, showFavoritesOnly, sortBy, sortOrder, searchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-8">
      <div className="px-1 flex flex-col gap-4">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-16 h-16 bg-blue-600/10 rounded-3xl flex items-center justify-center text-blue-500 border border-blue-500/20">
            <i className="fas fa-hat-chef text-3xl"></i>
          </div>
          <div>
            <h2 className="text-3xl font-black text-zinc-100 tracking-tight">
              {showFavoritesOnly ? 'Saved Recipes' : "Kitchen Cook"}
            </h2>
            <p className="text-zinc-500 text-sm font-medium uppercase tracking-widest">
              {showFavoritesOnly ? `${favorites.length} bookmarked` : 'AI Culinary Logic'}
            </p>
          </div>
        </div>

        {/* Sorting Controls */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <div className="flex items-center bg-zinc-800 border border-zinc-700 rounded-xl px-2">
            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest pl-2 pr-1">Sort:</span>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as SortField)}
              className="bg-transparent py-2.5 pr-2 text-[10px] font-black uppercase tracking-widest text-zinc-300 focus:outline-none cursor-pointer"
            >
              <option value="wastePreventionScore">Zero Waste Priority</option>
              <option value="matchPercentage">Inventory Match</option>
              <option value="calories">Calories</option>
              <option value="protein">Protein</option>
            </select>
          </div>
          
          <button 
            onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
            className="bg-zinc-800 border border-zinc-700 p-2.5 rounded-xl text-zinc-400 hover:text-blue-500 transition-colors flex items-center gap-2 text-[10px] font-black uppercase tracking-widest flex-shrink-0"
          >
            <i className={`fas fa-sort-amount-${sortOrder === 'desc' ? 'down' : 'up'} text-sm`}></i>
            {sortOrder === 'desc' ? 'High' : 'Low'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => {
              setShowFavoritesOnly(!showFavoritesOnly);
              setActiveDiet(null);
            }}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all flex items-center gap-2 ${
              showFavoritesOnly 
              ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-900/40' 
              : 'bg-zinc-800 border-zinc-700 text-zinc-500 hover:text-rose-400'
            }`}
          >
            <i className={`fas fa-heart ${showFavoritesOnly ? 'text-white' : 'text-rose-500'}`}></i>
            Favorites {favorites.length > 0 && <span className="ml-1 opacity-70">({favorites.length})</span>}
          </button>
          {DIET_OPTIONS.map(diet => (
            <button
              key={diet}
              onClick={() => toggleDiet(diet)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${
                activeDiet === diet 
                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/40' 
                : 'bg-zinc-800 border-zinc-700 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {diet}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <div className="flex-1 relative">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"></i>
            <input 
              className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl pl-12 pr-4 py-4 text-sm text-zinc-200 shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder:text-zinc-600"
              placeholder={showFavoritesOnly ? "Search saved..." : "Search ingredients..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {!showFavoritesOnly && (
            <button 
              onClick={() => fetchRecipes(searchQuery, activeDiet)}
              className="bg-blue-600 text-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-950/40 transition-transform active:scale-90"
            >
              <i className="fas fa-sync-alt text-lg"></i>
            </button>
          )}
        </div>
      </div>

      {isLoading && !showFavoritesOnly ? (
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-zinc-800 rounded-[2.5rem] animate-pulse border border-zinc-700"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {displayedRecipes.length > 0 ? (
            displayedRecipes.map((recipe, idx) => (
              <div key={idx} className="bg-zinc-800 rounded-[2.5rem] overflow-hidden shadow-2xl border border-zinc-700 group hover:border-blue-500/30 transition-all">
                <div className="p-7">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {recipe.wastePreventionScore > 70 && (
                          <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-black px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
                            <i className="fas fa-leaf"></i>
                            Zero Waste Champion
                          </span>
                        )}
                        <span className="bg-blue-500/10 text-blue-500 text-[10px] font-black px-3 py-1 rounded-full border border-blue-500/20 uppercase tracking-widest">
                          {recipe.matchPercentage}% optimized
                        </span>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => toggleFavorite(recipe)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-125 ${isFavorite(recipe.title) ? 'bg-rose-500 text-white shadow-lg shadow-rose-900/40' : 'bg-zinc-700 text-zinc-500 hover:text-rose-400'}`}
                            title={isFavorite(recipe.title) ? "Remove from Favorites" : "Save to Favorites"}
                          >
                            <i className={`${isFavorite(recipe.title) ? 'fas' : 'far'} fa-heart`}></i>
                          </button>
                        </div>
                      </div>
                      <h3 className="text-2xl font-black text-zinc-100 leading-tight">{recipe.title}</h3>
                      {recipe.expiringIngredientsUsed?.length > 0 && (
                        <p className="text-[9px] font-black text-emerald-500 uppercase mt-2 tracking-widest">
                          Saves: {recipe.expiringIngredientsUsed.join(', ')}
                        </p>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <span className="text-2xl font-black text-blue-500 tabular-nums">{recipe.macros.calories}</span>
                      <span className="text-[10px] block text-zinc-600 font-black tracking-widest uppercase">kcal</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-8">
                    {recipe.ingredientsUsed.map(ing => (
                      <span key={ing} className="bg-zinc-700/80 text-zinc-400 text-[10px] font-bold px-3 py-1.5 rounded-xl border border-zinc-700">
                        <i className="fas fa-check text-blue-500 mr-2"></i>
                        {ing}
                      </span>
                    ))}
                    {recipe.ingredientsMissing.map(ing => (
                      <span key={ing} className="bg-zinc-700/40 text-zinc-600 text-[10px] font-bold px-3 py-1.5 rounded-xl border border-zinc-700 italic">
                        + {ing}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-4 gap-3 mb-8">
                    <RecipeMacro val={recipe.macros.protein} label="Protein" unit="g" />
                    <RecipeMacro val={recipe.macros.carbs} label="Carbs" unit="g" />
                    <RecipeMacro val={recipe.macros.fats} label="Fats" unit="g" />
                    <RecipeMacro val={recipe.macros.sodium} label="Sodium" unit="mg" />
                  </div>

                  <details className="group/details">
                    <summary className="list-none flex items-center justify-between py-4 px-6 bg-zinc-700/40 rounded-3xl cursor-pointer hover:bg-zinc-700 transition-all border border-zinc-700">
                      <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">Preparation Guide</span>
                      <i className="fas fa-chevron-down text-zinc-600 group-open/details:rotate-180 transition-transform"></i>
                    </summary>
                    <div className="pt-6 px-4 space-y-4">
                      {recipe.instructions.map((step, sIdx) => (
                        <div key={sIdx} className="flex gap-5">
                          <span className="text-blue-500 font-black text-sm mt-0.5">{sIdx + 1}</span>
                          <p className="text-sm text-zinc-400 leading-relaxed font-medium">{step}</p>
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 animate-in fade-in zoom-in duration-300">
              <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6 border border-zinc-700">
                <i className={`fas ${showFavoritesOnly ? 'fa-heart text-rose-500/30' : 'fa-utensils-slash text-zinc-700'} text-3xl`}></i>
              </div>
              <h3 className="text-zinc-400 font-black uppercase text-xs tracking-widest">
                {showFavoritesOnly ? "No saved recipes yet" : "No results found"}
              </h3>
              <p className="text-zinc-600 text-[10px] mt-2 font-bold uppercase tracking-tight">
                {showFavoritesOnly ? "Save recipes to view them offline later" : "Try a different search query"}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const RecipeMacro: React.FC<{ val: number; label: string; unit: string }> = ({ val, label, unit }) => (
  <div className="text-center p-3 rounded-2xl bg-zinc-700/30 border border-zinc-700/50">
    <div className="text-[10px] font-black text-zinc-200 tabular-nums">{val}{unit}</div>
    <div className="text-[8px] text-zinc-600 font-black uppercase tracking-widest mt-0.5">{label}</div>
  </div>
);

export default RecipeList;
