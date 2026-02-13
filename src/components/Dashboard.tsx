import React, { useState, useEffect } from 'react';
import { UserStats, InventoryItem, RecipeSuggestion } from '../types';
import { suggestHighProteinMeals } from '../services/geminiService';
import { Sparkles, AlertTriangle, TrendingDown } from 'lucide-react';

interface DashboardProps {
  stats: UserStats;
  inventory: InventoryItem[];
}

const Dashboard: React.FC<DashboardProps> = ({ stats, inventory }) => {
  const { dailyBudget, consumedToday, mealHistory = [] } = stats;
  const [recipeSuggestions, setRecipeSuggestions] = useState<RecipeSuggestion[]>([]);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(false);

  const getPercentage = (consumed: number, total: number) => {
    const p = (consumed / total) * 100;
    return Math.min(p, 100);
  };

  const caloriesRemaining = Math.max(0, dailyBudget.calories - consumedToday.calories);
  
  // Calculate remaining macros
  const remainingMacros = {
    calories: caloriesRemaining,
    protein: Math.max(0, dailyBudget.protein - consumedToday.protein),
    carbs: Math.max(0, dailyBudget.carbs - consumedToday.carbs),
    fats: Math.max(0, dailyBudget.fats - consumedToday.fats),
    sodium: Math.max(0, dailyBudget.sodium - consumedToday.sodium),
  };

  // Check if over on any macro
  const isOverOnFats = consumedToday.fats > dailyBudget.fats;
  const isOverOnCarbs = consumedToday.carbs > dailyBudget.carbs;
  const isOverOnProtein = consumedToday.protein > dailyBudget.protein;
  const isOverOnSodium = consumedToday.sodium > dailyBudget.sodium;

  // Fetch high-protein recipe suggestions
  useEffect(() => {
    if (inventory.length > 0 && caloriesRemaining > 0) {
      setIsLoadingRecipes(true);
      suggestHighProteinMeals(inventory, Math.min(caloriesRemaining, 2200))
        .then(recipes => {
          setRecipeSuggestions(recipes.slice(0, 3));
          setIsLoadingRecipes(false);
        })
        .catch(err => {
          console.error("Failed to load recipes:", err);
          setIsLoadingRecipes(false);
        });
    }
  }, [inventory, caloriesRemaining]);

  // Filter meals for today
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayMeals = mealHistory.filter(m => new Date(m.timestamp) >= todayStart);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Main Calorie Card with Circular Progress */}
      <section className="bg-blue-600 rounded-3xl p-6 text-white shadow-2xl shadow-blue-950/40 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-blue-100 text-sm font-semibold mb-1 opacity-80">Remaining Calories</h2>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black tabular-nums">{caloriesRemaining.toLocaleString()}</span>
              <span className="text-blue-100 font-bold opacity-70">kcal</span>
            </div>
            {/* Circular Progress Ring */}
            <div className="relative w-24 h-24">
              <svg className="transform -rotate-90 w-24 h-24">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="6"
                  fill="none"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="white"
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - getPercentage(consumedToday.calories, dailyBudget.calories) / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-black text-blue-100 opacity-90">
                  {Math.round(getPercentage(consumedToday.calories, dailyBudget.calories))}%
                </span>
              </div>
            </div>
          </div>

          <div className="h-2.5 w-full bg-blue-900/40 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(255,255,255,0.5)]"
              style={{ width: `${getPercentage(consumedToday.calories, dailyBudget.calories)}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-3 text-xs font-bold text-blue-100">
            <span className="opacity-90">{consumedToday.calories} kcal consumed</span>
            <span className="opacity-90">{dailyBudget.calories} kcal goal</span>
          </div>
        </div>
        
        {/* Modern decorator */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl"></div>
      </section>

      {/* Smart Macro Adjustments - Alerts */}
      {(isOverOnFats || isOverOnCarbs || isOverOnSodium) && (
        <section className="bg-zinc-900/40 backdrop-blur-sm rounded-3xl p-4 border border-zinc-800/50 space-y-2">
          <div className="flex items-center gap-2 text-amber-400">
            <AlertTriangle size={18} strokeWidth={2} />
            <span className="text-xs font-black uppercase tracking-widest">Macro Adjustment Needed</span>
          </div>
          {isOverOnFats && (
            <div className="flex items-center gap-2 text-sm text-amber-300">
              <TrendingDown size={16} />
              <span className="font-medium">Fats exceeded by {Math.round(consumedToday.fats - dailyBudget.fats)}g. Next meal: <strong>Low-Fat</strong> options recommended.</span>
            </div>
          )}
          {isOverOnCarbs && (
            <div className="flex items-center gap-2 text-sm text-amber-300">
              <TrendingDown size={16} />
              <span className="font-medium">Carbs exceeded by {Math.round(consumedToday.carbs - dailyBudget.carbs)}g. Consider lower-carb options.</span>
            </div>
          )}
          {isOverOnSodium && (
            <div className="flex items-center gap-2 text-sm text-amber-300">
              <TrendingDown size={16} />
              <span className="font-medium">Sodium exceeded by {Math.round(consumedToday.sodium - dailyBudget.sodium)}mg. Choose low-sodium meals.</span>
            </div>
          )}
        </section>
      )}

      {/* Dynamic Recipe Suggester */}
      {recipeSuggestions.length > 0 && (
        <section className="bg-zinc-900/40 backdrop-blur-sm rounded-3xl p-5 border border-zinc-800/50 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={20} className="text-amber-400" strokeWidth={2} />
            <h3 className="font-bold text-zinc-100">High-Protein Meal Suggestions</h3>
            <span className="ml-auto text-[10px] font-black text-zinc-500 uppercase tracking-widest">
              {remainingMacros.calories.toFixed(0)} kcal remaining
            </span>
          </div>
          {isLoadingRecipes ? (
            <div className="text-center py-8 text-zinc-500">
              <div className="inline-block w-6 h-6 border-2 border-zinc-600 border-t-blue-500 rounded-full animate-spin"></div>
              <p className="text-xs mt-2 font-medium">Generating recipes...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recipeSuggestions.map((recipe, idx) => (
                <div key={idx} className="bg-zinc-800/60 rounded-2xl p-4 border border-zinc-700/50">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-bold text-zinc-100 text-sm">{recipe.title}</h4>
                    <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">
                      {recipe.macros.protein}g protein
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-zinc-400 mb-2">
                    <span>{recipe.macros.calories} kcal</span>
                    <span>{recipe.macros.carbs}g carbs</span>
                    <span>{recipe.macros.fats}g fats</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 font-medium">
                    Uses: {recipe.ingredientsUsed.slice(0, 3).join(', ')}
                    {recipe.ingredientsUsed.length > 3 && '...'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Visual Snap-Log Gallery */}
      <section className="bg-zinc-800 rounded-3xl p-5 border border-zinc-700 shadow-xl overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-zinc-100 flex items-center gap-2">
            <i className="fas fa-images text-blue-500"></i>
            Visual Snap-Log
          </h3>
          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{todayMeals.length} Today</span>
        </div>
        
        {todayMeals.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {todayMeals.map((meal) => (
              <div key={meal.id} className="flex-shrink-0 w-32 group relative">
                <div className="aspect-square rounded-2xl overflow-hidden border border-zinc-700 bg-zinc-900 shadow-inner">
                  {meal.photo ? (
                    <img src={meal.photo} alt={meal.itemName} className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-800">
                      <i className="fas fa-utensils text-2xl"></i>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-[8px] font-black text-white truncate uppercase tracking-widest">{meal.itemName}</p>
                    <p className="text-[7px] font-bold text-blue-400 uppercase">{meal.macros.calories} kcal</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 flex flex-col items-center justify-center text-center opacity-30">
            <i className="fas fa-camera-retro text-2xl mb-2"></i>
            <p className="text-[8px] font-black uppercase tracking-[0.2em]">Capture your first meal</p>
          </div>
        )}
      </section>

      {/* Macros Grid with Remaining Targets */}
      <section className="grid grid-cols-2 gap-4">
        <MacroCard 
          label="Protein" 
          current={consumedToday.protein} 
          target={dailyBudget.protein} 
          remaining={remainingMacros.protein}
          unit="g" 
          color="bg-sky-500" 
          bgColor="bg-sky-500/10" 
          isOver={isOverOnProtein}
        />
        <MacroCard 
          label="Carbs" 
          current={consumedToday.carbs} 
          target={dailyBudget.carbs} 
          remaining={remainingMacros.carbs}
          unit="g" 
          color="bg-amber-500" 
          bgColor="bg-amber-500/10" 
          isOver={isOverOnCarbs}
        />
        <MacroCard 
          label="Fats" 
          current={consumedToday.fats} 
          target={dailyBudget.fats} 
          remaining={remainingMacros.fats}
          unit="g" 
          color="bg-fuchsia-500" 
          bgColor="bg-fuchsia-500/10" 
          isOver={isOverOnFats}
        />
        <MacroCard 
          label="Sodium" 
          current={consumedToday.sodium} 
          target={dailyBudget.sodium} 
          remaining={remainingMacros.sodium}
          unit="mg" 
          color="bg-rose-500" 
          bgColor="bg-rose-500/10" 
          isOver={isOverOnSodium}
        />
      </section>

      {/* Quick Status */}
      <section className="bg-zinc-800 rounded-3xl p-5 border border-zinc-700 shadow-xl">
        <h3 className="font-bold text-zinc-100 mb-4 flex items-center gap-2">
          <i className="fas fa-layer-group text-blue-500"></i>
          Kitchen Pulse
        </h3>
        <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-hide">
          <StatusItem count={inventory.filter(i => i.category === 'Fridge').length} label="Fridge" />
          <StatusItem count={inventory.filter(i => i.category === 'Pantry').length} label="Pantry" />
          <StatusItem 
            count={inventory.filter(i => {
              const days = (new Date(i.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
              return days >= 0 && days < 3;
            }).length} 
            label="Expiring" 
            warning 
          />
        </div>
      </section>
    </div>
  );
};

const MacroCard: React.FC<{ 
  label: string; 
  current: number; 
  target: number; 
  remaining: number;
  unit: string; 
  color: string; 
  bgColor: string;
  isOver?: boolean;
}> = ({ label, current, target, remaining, unit, color, bgColor, isOver }) => {
  const percent = Math.min((current / target) * 100, 100);
  const remainingValue = isOver ? 0 : remaining;
  
  return (
    <div className={`bg-zinc-800 p-4 rounded-2xl border shadow-lg ${isOver ? 'border-rose-500/30 bg-rose-500/5' : 'border-zinc-700'}`}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{label}</span>
        <div className="text-right">
          <span className={`text-[10px] font-bold ${isOver ? 'text-rose-400' : 'text-zinc-400'}`}>
            {current.toFixed(0)}/{target.toFixed(0)}{unit}
          </span>
          {remainingValue > 0 && (
            <span className="text-[9px] text-emerald-400 font-medium block mt-0.5">
              {remainingValue.toFixed(0)} left
            </span>
          )}
        </div>
      </div>
      <div className={`h-1.5 w-full ${bgColor} rounded-full overflow-hidden`}>
        <div 
          className={`h-full ${color} rounded-full transition-all duration-700 ease-in-out ${isOver ? 'bg-rose-500' : ''}`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        ></div>
      </div>
      {isOver && (
        <p className="text-[8px] text-rose-400 font-medium mt-1.5">
          Over by {Math.abs(remaining).toFixed(0)}{unit}
        </p>
      )}
    </div>
  );
};

const StatusItem: React.FC<{ count: number; label: string; warning?: boolean }> = ({ count, label, warning }) => (
  <div className={`flex-shrink-0 flex flex-col items-center justify-center w-28 py-4 rounded-2xl border ${warning ? 'bg-blue-500/10 border-blue-500/30' : 'bg-zinc-700/40 border-zinc-600/50'}`}>
    <span className={`text-2xl font-black ${warning ? 'text-blue-500' : 'text-zinc-100'}`}>{count}</span>
    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter mt-1">{label}</span>
  </div>
);

export default Dashboard;
