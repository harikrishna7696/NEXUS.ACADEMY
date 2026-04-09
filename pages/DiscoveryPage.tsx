
import React, { useState } from 'react';
import { SkillLevel } from '../types';
import { GOALS, LEVELS_CONFIG, ICONS } from '../constants';

interface DiscoveryPageProps {
  onStart: (skill: string, goal: string, level: SkillLevel) => void;
}

const DiscoveryPage: React.FC<DiscoveryPageProps> = ({ onStart }) => {
  const [skill, setSkill] = useState('');
  const [goal, setGoal] = useState(GOALS[0].id);
  const [level, setLevel] = useState<SkillLevel>(SkillLevel.BEGINNER);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skill.trim()) return;
    onStart(skill, goal, level);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="max-w-4xl w-full text-center space-y-12">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-8xl font-space font-bold tracking-tighter leading-tight">
            Infinite <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-purple-500">Learning</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-xl mx-auto">
            Experience the next generation of adaptive technical education. Personalized, interactive, verified.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10 text-left">
          <div className="glass p-10 rounded-[2.5rem] space-y-10 border-white/5 shadow-2xl">
            {/* Step 1: Skill */}
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border border-sky-500/50 flex items-center justify-center text-[8px] text-sky-400">1</span>
                What do you want to master?
              </label>
              <div className="relative group">
                <input 
                  type="text" 
                  value={skill}
                  onChange={(e) => setSkill(e.target.value)}
                  placeholder="e.g. Kubernetes, Redis internals, Rust optimization..."
                  className="w-full bg-slate-900/40 border border-white/10 rounded-2xl px-8 py-5 text-2xl font-space focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500/50 transition-all placeholder:text-slate-700"
                  required
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-sky-500 transition-colors">
                  <ICONS.Zap className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-10">
              {/* Experience Selection */}
              <div className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border border-purple-500/50 flex items-center justify-center text-[8px] text-purple-400">2</span>
                  Your Experience level
                </label>
                <div className="flex flex-col gap-3">
                  {LEVELS_CONFIG.map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => setLevel(l.id as SkillLevel)}
                      className={`group relative px-5 py-4 rounded-2xl text-left transition-all border flex items-center justify-between ${
                        level === l.id 
                          ? `bg-${l.color}-500/10 border-${l.color}-500/50 ring-2 ring-${l.color}-500/10` 
                          : 'bg-slate-900/30 border-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className={`font-bold text-sm ${level === l.id ? `text-${l.color}-400` : 'text-slate-300 group-hover:text-white'}`}>
                          {l.label}
                        </span>
                        <span className="text-[10px] text-slate-500 group-hover:text-slate-400 transition-colors uppercase tracking-wider font-medium">
                          {l.desc}
                        </span>
                      </div>
                      <div className={`w-2 h-2 rounded-full transition-all ${level === l.id ? `bg-${l.color}-400 shadow-[0_0_8px_rgba(var(--${l.color}-400),0.8)]` : 'bg-slate-800'}`}></div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Goal Selection */}
              <div className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border border-emerald-500/50 flex items-center justify-center text-[8px] text-emerald-400">3</span>
                  Learning Goal
                </label>
                <div className="space-y-3">
                  {GOALS.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setGoal(g.id)}
                      className={`w-full px-5 py-4 rounded-2xl text-left text-sm font-medium transition-all border ${
                        goal === g.id 
                          ? 'bg-white/10 border-white/20 text-white shadow-lg' 
                          : 'bg-slate-900/20 border-white/5 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full group bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:scale-[1.02] active:scale-[0.98] text-white font-bold py-6 rounded-3xl flex items-center justify-center gap-4 transition-all shadow-xl shadow-sky-500/20 text-xl font-space"
            >
              Initiate Neural Path
              <ICONS.ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        </form>

        <div className="flex flex-wrap justify-center gap-12 text-slate-500 pt-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center group-hover:border-sky-500/30">
              <ICONS.Zap className="w-5 h-5 text-yellow-500" />
            </div>
            <span className="text-sm font-bold tracking-widest uppercase">Adaptive Flow</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center">
              <ICONS.CheckCircle className="w-5 h-5 text-emerald-500" />
            </div>
            <span className="text-sm font-bold tracking-widest uppercase">Verified Skillset</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center">
              <ICONS.Brain className="w-5 h-5 text-purple-500" />
            </div>
            <span className="text-sm font-bold tracking-widest uppercase">AI Architected</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscoveryPage;
