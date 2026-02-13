import React, { useState, useEffect } from 'react';
import {
  Utensils,
  Lock,
  LayoutDashboard,
  Users,
  Camera,
  BarChart3,
  Refrigerator,
  X,
  AlertCircle,
} from 'lucide-react';
import { AppView, UserStats, InventoryItem, FoodAnalysis, AnalyzedMeal } from './types';
import { INITIAL_STATS, INITIAL_INVENTORY } from './constants';
import Dashboard from './components/Dashboard';
import FoodScanner from './components/FoodScanner';
import FridgeScanner from './components/FridgeScanner';
import KitchenHub from './components/KitchenHub';
import Profile from './components/Profile';
import Insights from './components/Insights';
import Community from './components/Community';

const PASSCODE = 'debugbaeApp';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('fitgpt_authenticated') === 'true';
  });
  const [passcodeInput, setPasscodeInput] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [activeView, setActiveView] = useState<AppView>('Dashboard');
  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('fitgpt_stats');
    return saved ? JSON.parse(saved) : INITIAL_STATS;
  });
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('fitgpt_inventory');
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
  });
  const [showNotification, setShowNotification] = useState<string | null>(null);
  const [isCameraMenuOpen, setIsCameraMenuOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('fitgpt_stats', JSON.stringify(stats));
    localStorage.setItem('fitgpt_inventory', JSON.stringify(inventory));
  }, [stats, inventory]);

  useEffect(() => {
    if (stats.consumedToday.sodium > stats.dailyBudget.sodium * 0.8) {
      setShowNotification("Sodium alert! You've used 80% of your limit.");
    } else {
      setShowNotification(null);
    }
  }, [stats]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcodeInput === PASSCODE) {
      setIsAuthenticated(true);
      localStorage.setItem('fitgpt_authenticated', 'true');
      setLoginError(false);
    } else {
      setLoginError(true);
      setPasscodeInput('');
    }
  };

  const addMeal = (analysis: FoodAnalysis, photo?: string) => {
    const newMeal: AnalyzedMeal = {
      id: Math.random().toString(36).substr(2, 9),
      photo: photo || '',
      timestamp: new Date().toISOString(),
      itemName: analysis.itemName,
      macros: analysis.macros
    };
    setStats(prev => ({
      ...prev,
      consumedToday: {
        calories: prev.consumedToday.calories + analysis.macros.calories,
        protein: prev.consumedToday.protein + analysis.macros.protein,
        carbs: prev.consumedToday.carbs + analysis.macros.carbs,
        fats: prev.consumedToday.fats + analysis.macros.fats,
        sodium: prev.consumedToday.sodium + analysis.macros.sodium,
      },
      mealHistory: [newMeal, ...(prev.mealHistory || [])]
    }));
    setActiveView('Dashboard');
  };

  const updateInventoryBulk = (newItems: InventoryItem[]) => {
    setInventory(prev => [...prev, ...newItems]);
    setActiveView('KitchenHub');
  };

  const updateInventory = (newItem: InventoryItem) => {
    setInventory(prev => [...prev, newItem]);
  };

  const deleteInventoryItem = (id: string) => {
    setInventory(prev => prev.filter(item => item.id !== id));
  };

  const updateStats = (newStats: UserStats) => {
    setStats(newStats);
    setActiveView('Dashboard');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-zinc-100 font-sans">
        <div className="w-full max-w-sm space-y-12 animate-in fade-in zoom-in-95 duration-500">
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-blue-600 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl shadow-blue-900/40 rotate-12">
              <Utensils size={40} />
            </div>
            <div className="text-center">
              <h1 className="text-4xl font-black tracking-tighter text-white">FitGPT</h1>
              <p className="text-blue-500 font-black uppercase text-[10px] tracking-[0.3em] mt-2">Private Access Only</p>
            </div>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Passcode Required</label>
              <div className="relative">
                <input 
                  type="password" 
                  autoFocus 
                  className={`w-full bg-zinc-900 border ${loginError ? 'border-rose-500/50 ring-2 ring-rose-500/10' : 'border-zinc-800 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-600/10'} rounded-3xl px-6 py-5 text-center text-2xl font-black tracking-[0.5em] text-white transition-all outline-none placeholder:text-zinc-800`} 
                  placeholder="••••••••" 
                  value={passcodeInput}
                  onChange={(e) => {
                    setPasscodeInput(e.target.value);
                    if (loginError) setLoginError(false);
                  }} 
                />
                {loginError && <p className="absolute -bottom-8 left-0 right-0 text-center text-[10px] font-black uppercase text-rose-500 animate-bounce">Access Denied</p>}
              </div>
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-blue-950/50 active:scale-95 transition-all flex items-center justify-center gap-3">
              <span>Unlock Gateway</span>
              <Lock size={16} className="opacity-50" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 bg-zinc-950 text-zinc-100 font-sans">
      <header className="sticky top-0 z-40 bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-800/50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveView('Dashboard')}>
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-900/20">
            <Utensils size={20} />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">FitGPT</h1>
        </div>
        <button onClick={() => setActiveView('Profile')} className={`w-10 h-10 rounded-full overflow-hidden border-2 ${activeView === 'Profile' ? 'border-blue-600' : 'border-zinc-700'}`}>
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=FitGPT" alt="Profile" className="w-full h-full object-cover" />
        </button>
      </header>

      <main className="max-w-md mx-auto p-4">
        {showNotification && activeView !== 'Profile' && (
          <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-400 text-sm flex items-start gap-3">
            <AlertCircle size={18} className="shrink-0" />
            <p className="font-medium">{showNotification}</p>
          </div>
        )}
        
        {activeView === 'Dashboard' && <Dashboard stats={stats} inventory={inventory} />}
        {activeView === 'MealScanner' && <FoodScanner onLogMeal={addMeal} />}
        {activeView === 'FridgeScanner' && <FridgeScanner onAddItems={updateInventoryBulk} onCancel={() => setActiveView('Dashboard')} />}
        {activeView === 'KitchenHub' && <KitchenHub inventory={inventory} stats={stats} onAddInventory={updateInventory} onDeleteInventory={deleteInventoryItem} />}
        {activeView === 'Profile' && <Profile stats={stats} onUpdate={updateStats} />}
        {activeView === 'Insights' && <Insights stats={stats} inventory={inventory} />}
        {activeView === 'Community' && <Community inventory={inventory} stats={stats} />}
      </main>

      {isCameraMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end justify-center pb-32 px-6 animate-in fade-in" onClick={() => setIsCameraMenuOpen(false)}>
          <div className="w-full max-w-xs space-y-3" onClick={e => e.stopPropagation()}>
            <button onClick={() => { setActiveView('MealScanner'); setIsCameraMenuOpen(false); }} className="w-full bg-zinc-900 border border-zinc-800 p-5 rounded-3xl flex items-center gap-4 text-white">
              <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
                <Utensils size={24} />
              </div>
              <div className="text-left">
                <div className="font-bold">Analyze Meal</div>
                <div className="text-xs text-zinc-500">Portion & Macros</div>
              </div>
            </button>
            <button onClick={() => { setActiveView('FridgeScanner'); setIsCameraMenuOpen(false); }} className="w-full bg-zinc-900 border border-zinc-800 p-5 rounded-3xl flex items-center gap-4 text-white">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                <Refrigerator size={24} strokeWidth={2.5} />
              </div>
              <div className="text-left">
                <div className="font-bold">Stock Auditor</div>
                <div className="text-xs text-zinc-500">Auto-update pantry list</div>
              </div>
            </button>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-900/80 backdrop-blur-xl border-t border-zinc-800/50 flex justify-around items-center h-20 px-2">
        <NavButton active={activeView === 'Dashboard'} icon={<LayoutDashboard size={20}/>} label="Track" onClick={() => setActiveView('Dashboard')} />
        <NavButton active={activeView === 'Community'} icon={<Users size={20}/>} label="Social" onClick={() => setActiveView('Community')} />
        <div className="relative -mt-10">
          <button 
            onClick={() => setIsCameraMenuOpen(!isCameraMenuOpen)} 
            className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all border-4 border-zinc-950 ${isCameraMenuOpen ? 'bg-zinc-800 text-blue-500' : 'bg-blue-600 text-white'}`}
          >
            {isCameraMenuOpen ? <X size={24} /> : <Camera size={24} />}
          </button>
        </div>
        <NavButton active={activeView === 'Insights'} icon={<BarChart3 size={20}/>} label="Stats" onClick={() => setActiveView('Insights')} />
        <NavButton active={activeView === 'KitchenHub'} icon={<Utensils size={20}/>} label="Kitchen" onClick={() => setActiveView('KitchenHub')} />
      </nav>
    </div>
  );
};

const NavButton: React.FC<{ active: boolean; icon: React.ReactNode; label: string; onClick: () => void }> = ({ active, icon, label, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all flex-1 ${active ? 'text-blue-500' : 'text-zinc-500 hover:text-zinc-300'}`}>
    {icon}
    <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
  </button>
);

export default App;
