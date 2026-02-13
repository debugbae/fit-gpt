
import React from 'react';
import { UserStats, InventoryItem } from '../types';

interface DashboardProps {
  stats: UserStats;
  inventory: InventoryItem[];
}

const Dashboard: React.FC<DashboardProps> = ({ stats, inventory }) => {
  const { dailyBudget, consumedToday, mealHistory = [] } = stats;

  const getPercentage = (consumed: number, total: number) => {
    const p = (consumed / total) * 100;
    return Math.min(p, 100);
  };

  const caloriesRemaining = dailyBudget.calories - consumedToday.calories;

  // Filter meals for today
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayMeals = mealHistory.filter(m => new Date(m.timestamp) >= todayStart);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Main Calorie Card */}
      <section className="bg-blue-600 rounded-3xl p-6 text-white shadow-2xl shadow-blue-950/40 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-blue-100 text-sm font-semibold mb-1 opacity-80">Remaining Calories</h2>
          <div className="flex items-baseline gap-2 mb-6">
            <span className="text-5xl font-black tabular-nums">{caloriesRemaining.toLocaleString()}</span>
            <span className="text-blue-100 font-bold opacity-70">kcal</span>
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

      {/* Macros Grid */}
      <section className="grid grid-cols-2 gap-4">
        <MacroCard 
          label="Protein" 
          current={consumedToday.protein} 
          target={dailyBudget.protein} 
          unit="g" 
          color="bg-sky-500" 
          bgColor="bg-sky-500/10" 
        />
        <MacroCard 
          label="Carbs" 
          current={consumedToday.carbs} 
          target={dailyBudget.carbs} 
          unit="g" 
          color="bg-amber-500" 
          bgColor="bg-amber-500/10" 
        />
        <MacroCard 
          label="Fats" 
          current={consumedToday.fats} 
          target={dailyBudget.fats} 
          unit="g" 
          color="bg-fuchsia-500" 
          bgColor="bg-fuchsia-500/10" 
        />
        <MacroCard 
          label="Sodium" 
          current={consumedToday.sodium} 
          target={dailyBudget.sodium} 
          unit="mg" 
          color="bg-rose-500" 
          bgColor="bg-rose-500/10" 
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

const MacroCard: React.FC<{ label: string; current: number; target: number; unit: string; color: string; bgColor: string }> = ({ label, current, target, unit, color, bgColor }) => {
  const percent = Math.min((current / target) * 100, 100);
  return (
    <div className="bg-zinc-800 p-4 rounded-2xl border border-zinc-700 shadow-lg">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{label}</span>
        <span className="text-[10px] font-bold text-zinc-400">{current}/{target}{unit}</span>
      </div>
      <div className={`h-1.5 w-full ${bgColor} rounded-full overflow-hidden`}>
        <div 
          className={`h-full ${color} rounded-full transition-all duration-700 ease-in-out`}
          style={{ width: `${percent}%` }}
        ></div>
      </div>
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
