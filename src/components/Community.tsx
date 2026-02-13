
import React from 'react';
import { InventoryItem, UserStats } from '../types';

interface CommunityProps {
  inventory: InventoryItem[];
  stats: UserStats;
}

const Community: React.FC<CommunityProps> = ({ inventory, stats }) => {
  // Mock data for community logic
  const pantrySimilarity = 78;
  const commonIngredients = inventory.slice(0, 3).map(i => i.name);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-8">
      <header className="px-1">
        <h2 className="text-2xl font-black text-zinc-100 tracking-tight">Community Pulse</h2>
        <p className="text-zinc-500 text-sm font-medium">Global trends & local neighbors</p>
      </header>

      {/* Similarity Score */}
      <div className="bg-zinc-800 p-7 rounded-[2.5rem] border border-zinc-700 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-16 h-16 bg-blue-600/10 rounded-3xl flex items-center justify-center border border-blue-500/20 text-blue-500">
            <i className="fas fa-people-arrows text-2xl"></i>
          </div>
          <div>
            <h3 className="text-zinc-100 font-black uppercase text-xs tracking-widest">Pantry Similarity</h3>
            <div className="text-3xl font-black text-blue-500">{pantrySimilarity}% Match</div>
            <p className="text-zinc-500 text-[10px] font-bold mt-1 uppercase">With local FitGPT users</p>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
      </div>

      {/* What others are cooking with your ingredients */}
      <div className="bg-zinc-800 p-7 rounded-[2.5rem] border border-zinc-700 shadow-xl space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-zinc-100 font-black uppercase text-xs tracking-widest">Trending with your Stock</h3>
          <span className="text-[10px] font-black text-blue-500 px-2 py-0.5 bg-blue-500/10 rounded-lg">LIVE</span>
        </div>
        
        <div className="space-y-4">
          <CommunityCreation 
            dish="Mediterranean Spinach Bowl" 
            ingredients={['Spinach', 'Feta', 'Quinoa']} 
            likes={241} 
            user="Chef_Julia"
          />
          <CommunityCreation 
            dish="Zesty Egg & Quinoa Scramble" 
            ingredients={['Eggs', 'Quinoa']} 
            likes={185} 
            user="PowerUser_Alex"
          />
          <CommunityCreation 
            dish="Feta Stuffed Spinach Omelette" 
            ingredients={['Eggs', 'Spinach', 'Feta']} 
            likes={92} 
            user="GreenGourmet"
          />
        </div>
      </div>

      {/* Nutrition Benchmarking */}
      <div className="bg-zinc-800 p-7 rounded-[2.5rem] border border-zinc-700 shadow-xl space-y-6">
        <h3 className="text-zinc-100 font-black uppercase text-xs tracking-widest">Goal Benchmarking</h3>
        
        <div className="space-y-4">
          <BenchmarkItem 
            label="Protein Intake" 
            userVal={stats.dailyBudget.protein} 
            avgVal={110} 
            percentile={92} 
            unit="g"
          />
          <BenchmarkItem 
            label="Daily Calories" 
            userVal={stats.dailyBudget.calories} 
            avgVal={2100} 
            percentile={55} 
            unit="kcal"
          />
        </div>

        <div className="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
          <p className="text-zinc-400 text-[10px] font-medium leading-relaxed italic">
            <i className="fas fa-medal text-amber-500 mr-2"></i>
            You are in the top 10% of users for protein consistency this month. High protein helps with muscle retention during weight loss.
          </p>
        </div>
      </div>
    </div>
  );
};

const CommunityCreation: React.FC<{ dish: string; ingredients: string[]; likes: number; user: string }> = ({ dish, ingredients, likes, user }) => (
  <div className="flex gap-4 p-4 bg-zinc-900 rounded-3xl border border-zinc-700/50">
    <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex-shrink-0 flex items-center justify-center text-zinc-600">
      <i className="fas fa-image text-xs"></i>
    </div>
    <div className="flex-1">
      <div className="flex justify-between items-start">
        <h4 className="text-sm font-black text-zinc-100 leading-tight">{dish}</h4>
        <div className="flex items-center gap-1 text-rose-500 text-[10px] font-black">
          <i className="fas fa-heart"></i>
          {likes}
        </div>
      </div>
      <div className="flex flex-wrap gap-1 mt-1">
        {ingredients.map(ing => (
          <span key={ing} className="text-[8px] font-black uppercase text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded-md border border-zinc-700">{ing}</span>
        ))}
      </div>
      <div className="text-[8px] font-bold text-blue-500 uppercase mt-2 tracking-widest">by @{user}</div>
    </div>
  </div>
);

const BenchmarkItem: React.FC<{ label: string; userVal: number; avgVal: number; percentile: number; unit: string }> = ({ label, userVal, avgVal, percentile, unit }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-end">
      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{label}</span>
      <span className="text-xs font-black text-blue-500">{percentile}th Percentile</span>
    </div>
    <div className="relative h-2 bg-zinc-900 rounded-full overflow-hidden">
      <div 
        className="absolute top-0 bottom-0 left-0 bg-blue-600 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)]"
        style={{ width: `${percentile}%` }}
      ></div>
      {/* Average Marker */}
      <div 
        className="absolute top-0 bottom-0 w-0.5 bg-zinc-500 z-10"
        style={{ left: `${(avgVal / (userVal * 1.5)) * 100}%` }}
      ></div>
    </div>
    <div className="flex justify-between text-[8px] font-bold uppercase text-zinc-600">
      <span>Average: {avgVal}{unit}</span>
      <span>You: {userVal}{unit}</span>
    </div>
  </div>
);

export default Community;
