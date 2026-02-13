
import React, { useState, useEffect, useMemo } from 'react';
import { UserStats, InventoryItem, RecipeSuggestion } from '../types';
import { suggestRecipes } from '../services/geminiService';

interface InsightsProps {
  stats: UserStats;
  inventory: InventoryItem[];
}

const Insights: React.FC<InsightsProps> = ({ stats, inventory }) => {
  const [smartCoachAdvice, setSmartCoachAdvice] = useState<RecipeSuggestion | null>(null);
  const [isCoachLoading, setIsCoachLoading] = useState(false);

  useEffect(() => {
    const fetchCoachAdvice = async () => {
      setIsCoachLoading(true);
      try {
        const results = await suggestRecipes(inventory, stats);
        // Take the highest waste prevention score recipe
        const best = results.sort((a, b) => b.wastePreventionScore - a.wastePreventionScore)[0];
        setSmartCoachAdvice(best || null);
      } catch (err) {
        console.error("Coach failed:", err);
      } finally {
        setIsCoachLoading(false);
      }
    };
    fetchCoachAdvice();
  }, [inventory, stats.consumedToday]);

  const caloriesRemaining = stats.dailyBudget.calories - stats.consumedToday.calories;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <header className="px-1">
        <h2 className="text-2xl font-black text-zinc-100 tracking-tight">Health Insights</h2>
        <p className="text-zinc-500 text-sm font-medium">Nutritional patterns & AI advice</p>
      </header>

      {/* Dynamic Daily Win - Smart Coach Card */}
      <section className="bg-zinc-800 rounded-[2.5rem] border border-zinc-700 shadow-xl overflow-hidden animate-in zoom-in-95 duration-700">
        <div className="p-7 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-500/10 rounded-[1.5rem] flex items-center justify-center text-emerald-500 border border-emerald-500/20">
              <i className="fas fa-award text-2xl"></i>
            </div>
            <div>
              <h3 className="font-black text-zinc-100 text-sm uppercase tracking-widest leading-none">Daily Priority Win</h3>
              <p className="text-[10px] text-zinc-500 font-bold mt-1 uppercase">Recommended Next Best Action</p>
            </div>
          </div>

          {isCoachLoading ? (
            <div className="py-8 flex flex-col items-center justify-center gap-4 opacity-50">
              <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
              <p className="text-[8px] font-black uppercase tracking-widest">Analyzing Budget & Stock...</p>
            </div>
          ) : smartCoachAdvice ? (
            <div className="space-y-4">
              <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-5 relative overflow-hidden group">
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-2">
                    <span className="bg-emerald-500/10 text-emerald-500 text-[8px] font-black px-2 py-1 rounded-lg uppercase border border-emerald-500/20 tracking-widest">
                      Ideal Recovery Meal
                    </span>
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{smartCoachAdvice.macros.calories} kcal</span>
                  </div>
                  <h4 className="text-lg font-black text-zinc-100 mb-1 leading-tight">{smartCoachAdvice.title}</h4>
                  <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-4">
                    Saves: {smartCoachAdvice.expiringIngredientsUsed.join(', ')}
                  </p>
                  
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Budget Remaining</span>
                      <span className="text-sm font-black text-blue-500">{caloriesRemaining} kcal</span>
                    </div>
                    <div className="w-px h-8 bg-zinc-800"></div>
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Protein Goal</span>
                      <span className="text-sm font-black text-sky-400">{smartCoachAdvice.macros.protein}g included</span>
                    </div>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
              </div>
              <button className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-950/40 hover:bg-emerald-500 transition-all active:scale-95">
                Prepare this Meal
              </button>
            </div>
          ) : (
            <div className="p-6 bg-zinc-900 rounded-3xl text-center border border-dashed border-zinc-700">
               <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">No stock matches found for your remaining macros</p>
            </div>
          )}
        </div>
      </section>

      <div className="bg-zinc-800 p-6 rounded-[2.5rem] border border-zinc-700 shadow-xl space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
            <i className="fas fa-brain text-xl"></i>
          </div>
          <div>
            <h3 className="font-bold text-zinc-100">Daily Tip</h3>
            <p className="text-zinc-500 text-xs">AI Generated Recommendation</p>
          </div>
        </div>

        <p className="text-zinc-300 text-sm leading-relaxed italic">
          "Your fiber intake seems consistent. To boost recovery, consider adding a source of Omega-3s like salmon or chia seeds to your dinner tonight."
        </p>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-700/50">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Streak</span>
            <div className="text-xl font-black text-zinc-100">12 Days</div>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Efficiency</span>
            <div className="text-xl font-black text-blue-500">94%</div>
          </div>
        </div>
      </div>

      <div className="bg-zinc-800 p-6 rounded-[2.5rem] border border-zinc-700 shadow-xl">
        <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Macro Balance</h3>
        <div className="space-y-4">
          <MacroTrend label="Protein" val={85} color="bg-sky-500" />
          <MacroTrend label="Carbs" val={60} color="bg-amber-500" />
          <MacroTrend label="Fats" val={45} color="bg-fuchsia-500" />
        </div>
      </div>
    </div>
  );
};

const MacroTrend: React.FC<{ label: string; val: number; color: string }> = ({ label, val, color }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-zinc-500">
      <span>{label}</span>
      <span>{val}%</span>
    </div>
    <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full`} style={{ width: `${val}%` }}></div>
    </div>
  </div>
);

export default Insights;
