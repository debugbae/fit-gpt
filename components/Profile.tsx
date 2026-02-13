
import React, { useState, useMemo } from 'react';
import { UserStats, NutrientProfile } from '../types';

interface ProfileProps {
  stats: UserStats;
  onUpdate: (stats: UserStats) => void;
}

const DIET_PREFERENCES = ['None', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Keto', 'Paleo', 'Low-Carb'];

const ACTIVITY_LEVELS = [
  { label: 'Sedentary', multiplier: 1.2, desc: 'Office job, little to no exercise' },
  { label: 'Light', multiplier: 1.375, desc: 'Exercise 1-3 days/week' },
  { label: 'Moderate', multiplier: 1.55, desc: 'Exercise 3-5 days/week' },
  { label: 'Active', multiplier: 1.725, desc: 'Exercise 6-7 days/week' },
  { label: 'Extra Active', multiplier: 1.9, desc: 'Physical job or 2x/day training' },
];

const GOALS = [
  { label: 'Weight Loss', deficit: -500, desc: 'Gradual fat loss' },
  { label: 'Maintenance', deficit: 0, desc: 'Keep current weight' },
  { label: 'Muscle Gain', deficit: 300, desc: 'Lean bulking' },
];

const STRATEGIES = [
  { label: 'Balanced', p: 0.30, c: 0.40, f: 0.30, desc: 'Standard 30/40/30 split' },
  { label: 'High Protein', p: 0.40, c: 0.30, f: 0.30, desc: 'Best for muscle retention' },
  { label: 'Low Carb', p: 0.35, c: 0.20, f: 0.45, desc: 'Keto-leaning high-fat approach' },
];

const Profile: React.FC<ProfileProps> = ({ stats, onUpdate }) => {
  const [budget, setBudget] = useState<NutrientProfile>(stats.dailyBudget);
  const [diet, setDiet] = useState<string>(stats.dietPreference || 'None');

  // Bio States
  const [weight, setWeight] = useState('75');
  const [height, setHeight] = useState('175');
  const [age, setAge] = useState('30');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [activity, setActivity] = useState(ACTIVITY_LEVELS[2]);
  const [goal, setGoal] = useState(GOALS[1]);
  const [strategy, setStrategy] = useState(STRATEGIES[0]);

  const recommendations = useMemo(() => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseFloat(age);

    if (isNaN(w) || isNaN(h) || isNaN(a)) return null;

    // Mifflin-St Jeor Equation
    let bmr = (10 * w) + (6.25 * h) - (5 * a);
    bmr = gender === 'male' ? bmr + 5 : bmr - 161;

    const tdee = Math.round(bmr * activity.multiplier);
    const targetCalories = Math.max(1200, tdee + goal.deficit);

    // Macro splits
    const protein = Math.round((targetCalories * strategy.p) / 4);
    const carbs = Math.round((targetCalories * strategy.c) / 4);
    const fats = Math.round((targetCalories * strategy.f) / 9);

    return {
      bmr,
      tdee,
      calories: targetCalories,
      protein,
      carbs,
      fats,
      sodium: 2300, // Default recommended
      water: (w * 0.033).toFixed(1) // General hydration guide
    };
  }, [weight, height, age, gender, activity, goal, strategy]);

  const handleApply = () => {
    if (recommendations) {
      const newBudget: NutrientProfile = {
        calories: recommendations.calories,
        protein: recommendations.protein,
        carbs: recommendations.carbs,
        fats: recommendations.fats,
        sodium: recommendations.sodium
      };
      setBudget(newBudget);
      onUpdate({ ...stats, dailyBudget: newBudget, dietPreference: diet });
    }
  };

  const handleSaveManually = () => {
    onUpdate({ ...stats, dailyBudget: budget, dietPreference: diet });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-12">
      {/* Header Profile */}
      <div className="flex items-center gap-6 px-1">
        <div className="w-24 h-24 rounded-[2.5rem] bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center overflow-hidden shadow-2xl">
          <img 
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${stats.dietPreference || 'User'}`} 
            alt="User Avatar" 
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h2 className="text-3xl font-black text-zinc-100 tracking-tight leading-none">Fitness Bio</h2>
          <p className="text-zinc-500 text-xs font-black mt-2 uppercase tracking-widest">Macro Architect v2.5</p>
          <div className="flex gap-2 mt-3">
             <span className="bg-blue-600/10 text-blue-500 text-[9px] font-black px-2 py-1 rounded-lg uppercase border border-blue-500/20">Active Plan</span>
          </div>
        </div>
      </div>

      {/* Goal Calculator Section */}
      <section className="bg-zinc-800 p-7 rounded-[2.5rem] border border-zinc-700 shadow-xl space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500">
            <i className="fas fa-calculator"></i>
          </div>
          <h3 className="font-black text-zinc-100 uppercase text-xs tracking-widest">AI Goal Architect</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <BioField label="Weight (kg)" value={weight} onChange={setWeight} />
          <BioField label="Height (cm)" value={height} onChange={setHeight} />
          <BioField label="Age (years)" value={age} onChange={setAge} />
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Gender</label>
            <div className="flex bg-zinc-900 rounded-2xl p-1 border border-zinc-700 h-[46px]">
              <button 
                onClick={() => setGender('male')}
                className={`flex-1 rounded-xl text-[10px] font-black uppercase transition-all ${gender === 'male' ? 'bg-blue-600 text-white' : 'text-zinc-500'}`}
              >
                Male
              </button>
              <button 
                onClick={() => setGender('female')}
                className={`flex-1 rounded-xl text-[10px] font-black uppercase transition-all ${gender === 'female' ? 'bg-blue-600 text-white' : 'text-zinc-500'}`}
              >
                Female
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <SelectField 
            label="Activity Level" 
            value={activity.label} 
            options={ACTIVITY_LEVELS} 
            onChange={(val) => setActivity(ACTIVITY_LEVELS.find(a => a.label === val)!)} 
          />
          <div className="grid grid-cols-2 gap-4">
             <SelectField 
              label="Primary Goal" 
              value={goal.label} 
              options={GOALS} 
              onChange={(val) => setGoal(GOALS.find(g => g.label === val)!)} 
            />
            <SelectField 
              label="Macro Strategy" 
              value={strategy.label} 
              options={STRATEGIES} 
              onChange={(val) => setStrategy(STRATEGIES.find(s => s.label === val)!)} 
            />
          </div>
        </div>

        {recommendations && (
          <div className="mt-8 bg-zinc-900/50 rounded-3xl border border-zinc-700 p-6 space-y-6 animate-in zoom-in-95">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest block mb-1">Recommended Daily Intake</span>
                <div className="text-2xl font-black text-zinc-100">{recommendations.calories} <span className="text-xs text-zinc-500 font-bold">kcal</span></div>
              </div>
              <button 
                onClick={handleApply}
                className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-900/40 active:scale-95 transition-all"
              >
                Apply
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <RecommendationMetric label="Protein" val={`${recommendations.protein}g`} color="text-sky-400" />
              <RecommendationMetric label="Carbs" val={`${recommendations.carbs}g`} color="text-amber-400" />
              <RecommendationMetric label="Fats" val={`${recommendations.fats}g`} color="text-fuchsia-400" />
            </div>

            <div className="pt-4 border-t border-zinc-800 space-y-2">
               <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-zinc-600">
                  <span>Basal Metabolism (BMR)</span>
                  <span className="text-zinc-400">{recommendations.bmr.toFixed(0)} kcal</span>
               </div>
               <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-zinc-600">
                  <span>Daily Expenditure (TDEE)</span>
                  <span className="text-zinc-400">{recommendations.tdee} kcal</span>
               </div>
            </div>
          </div>
        )}
      </section>

      {/* Manual Budget Override */}
      <section className="bg-zinc-800 p-7 rounded-[2.5rem] border border-zinc-700 shadow-xl space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500">
            <i className="fas fa-sliders"></i>
          </div>
          <h3 className="font-black text-zinc-100 uppercase text-xs tracking-widest">Active Budget Targets</h3>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2 ml-1">Calorie Goal</label>
            <input 
              type="number"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl px-5 py-3 text-xl font-black text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600/50"
              value={budget.calories}
              onChange={(e) => setBudget({...budget, calories: parseInt(e.target.value) || 0})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <BudgetInput label="Protein" val={budget.protein} unit="g" onChange={(v) => setBudget({...budget, protein: v})} />
            <BudgetInput label="Carbs" val={budget.carbs} unit="g" onChange={(v) => setBudget({...budget, carbs: v})} />
            <BudgetInput label="Fats" val={budget.fats} unit="g" onChange={(v) => setBudget({...budget, fats: v})} />
            <BudgetInput label="Sodium" val={budget.sodium} unit="mg" onChange={(v) => setBudget({...budget, sodium: v})} />
          </div>
        </div>

        <div className="space-y-3 pt-4">
           <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block ml-1">Dietary Preference</label>
           <div className="flex flex-wrap gap-2">
              {DIET_PREFERENCES.map(p => (
                <button
                  key={p}
                  onClick={() => setDiet(p)}
                  className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${diet === p ? 'bg-zinc-700 border-zinc-600 text-blue-500' : 'bg-zinc-900 border-zinc-800 text-zinc-600'}`}
                >
                  {p}
                </button>
              ))}
           </div>
        </div>
      </section>

      <button 
        onClick={handleSaveManually}
        className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-blue-950/50 active:scale-95 transition-all"
      >
        Save Profile & Plan
      </button>
    </div>
  );
};

const BioField: React.FC<{ label: string; value: string; onChange: (v: string) => void }> = ({ label, value, onChange }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">{label}</label>
    <input 
      type="number"
      className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl px-4 py-3 text-sm font-black text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const SelectField: React.FC<{ label: string; value: string; options: any[]; onChange: (v: string) => void }> = ({ label, value, options, onChange }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">{label}</label>
    <select 
      className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl px-4 py-3 text-sm font-bold text-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map(opt => (
        <option key={opt.label} value={opt.label}>{opt.label} — {opt.desc}</option>
      ))}
    </select>
  </div>
);

const RecommendationMetric: React.FC<{ label: string; val: string; color: string }> = ({ label, val, color }) => (
  <div className="text-center p-3 rounded-2xl bg-zinc-800 border border-zinc-700/50">
    <div className={`text-sm font-black ${color}`}>{val}</div>
    <div className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mt-1">{label}</div>
  </div>
);

const BudgetInput: React.FC<{ label: string; val: number; unit: string; onChange: (v: number) => void }> = ({ label, val, unit, onChange }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">{label} ({unit})</label>
    <input 
      type="number"
      className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl px-4 py-2.5 text-sm font-black text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
      value={val}
      onChange={(e) => onChange(parseInt(e.target.value) || 0)}
    />
  </div>
);

export default Profile;
