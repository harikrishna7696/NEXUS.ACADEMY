
import React, { useState } from 'react';
import { LearningRoadmap, RoadmapDay } from '../types';
import { ICONS } from '../constants';
import { geminiService } from '../services/gemini';

interface ArenaPageProps {
  roadmap: LearningRoadmap;
  activeDay: number;
  onSelectDay: (day: number) => void;
}

const ArenaPage: React.FC<ArenaPageProps> = ({ roadmap, activeDay, onSelectDay }) => {
  const [selectedChallenge, setSelectedChallenge] = useState<RoadmapDay | null>(null);
  const [solution, setSolution] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<{ score: number; feedback: string; nextStep: string } | null>(null);

  if (!roadmap) return null;

  const totalChallenges = roadmap.days.length;
  const completedChallenges = Math.max(0, activeDay - 1);
  const progressPercentage = (completedChallenges / totalChallenges) * 100;

  const handleEnterChallenge = (day: RoadmapDay) => {
    setSelectedChallenge(day);
    setSolution('');
    setResult(null);
  };

  const handleVerify = async () => {
    if (!selectedChallenge || !solution.trim()) return;
    setVerifying(true);
    try {
      const verification = await geminiService.verifyChallenge(
        roadmap.skill,
        selectedChallenge.concept,
        selectedChallenge.challenge,
        solution
      );
      setResult(verification);
    } catch (error) {
      console.error(error);
      alert('Verification node failed to respond.');
    } finally {
      setVerifying(false);
    }
  };

  if (selectedChallenge) {
    return (
      <div className="py-8 animate-in slide-in-from-right-8 duration-500 max-w-4xl mx-auto">
        <button 
          onClick={() => setSelectedChallenge(null)}
          className="mb-8 flex items-center gap-2 text-slate-500 hover:text-white transition-colors group"
        >
          <div className="w-8 h-8 rounded-full border border-white/5 flex items-center justify-center group-hover:border-white/20">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </div>
          <span className="text-xs font-bold uppercase tracking-widest">Back to Arena</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Challenge Description */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass p-8 rounded-[2rem] border-purple-500/20">
              <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-4 block">Day {selectedChallenge.day} Objective</span>
              <h2 className="text-3xl font-space font-bold text-white mb-4">{selectedChallenge.concept}</h2>
              <div className="p-5 bg-slate-900/50 rounded-2xl border border-white/5 italic text-slate-400 text-sm leading-relaxed">
                "{selectedChallenge.challenge}"
              </div>
            </div>

            <div className="glass p-8 rounded-[2rem]">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Mastery Requirements</h3>
              <ul className="space-y-3">
                {['Architectural Integrity', 'Performance Considerations', 'Edge-case Handling'].map((req, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Interaction Area */}
          <div className="lg:col-span-3 space-y-6">
            <div className="glass p-8 rounded-[2rem] border-sky-500/10 flex flex-col h-full min-h-[400px]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-sky-400 uppercase tracking-widest">Neural Input Node</h3>
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                  <div className="w-2 h-2 rounded-full bg-amber-500/50"></div>
                  <div className="w-2 h-2 rounded-full bg-emerald-500/50"></div>
                </div>
              </div>
              
              <textarea 
                value={solution}
                onChange={(e) => setSolution(e.target.value)}
                placeholder="Describe your implementation logic, code structure, or architectural choices here..."
                className="flex-1 bg-slate-950/50 border border-white/5 rounded-2xl p-6 font-mono text-sm text-sky-100 focus:outline-none focus:ring-2 focus:ring-sky-500/30 transition-all resize-none"
              />

              <button 
                onClick={handleVerify}
                disabled={verifying || !solution.trim()}
                className="mt-6 w-full py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold text-lg shadow-lg shadow-purple-950/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale"
              >
                {verifying ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Verifying Neural Logic...
                  </div>
                ) : 'Submit for Neural Verification'}
              </button>
            </div>

            {/* Verification Result */}
            {result && (
              <div className="glass p-8 rounded-[2rem] border-emerald-500/20 animate-in zoom-in duration-500">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                      <ICONS.CheckCircle className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="font-space font-bold text-white">Verification Matrix Result</h4>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Analysis Complete</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-space font-bold text-emerald-400">{result.score}%</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Sync Level</div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <p className="text-sm text-slate-300 leading-relaxed border-l-2 border-emerald-500/30 pl-4 py-1">
                    {result.feedback}
                  </p>
                  <div className="p-4 bg-white/5 rounded-xl flex items-center gap-3">
                    <ICONS.Zap className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Next Step: {result.nextStep}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-[1.25rem] bg-purple-500/10 border border-purple-500/20 flex items-center justify-center neon-purple">
            <ICONS.Shield className="w-8 h-8 text-purple-400" />
          </div>
          <div>
            <h2 className="text-4xl font-space font-bold">Challenge Arena</h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">High-stakes architecture testing for <span className="text-purple-400">{roadmap.skill}</span></p>
          </div>
        </div>

        {/* Visual Progress Indicator */}
        <div className="min-w-[280px] space-y-3">
          <div className="flex justify-between items-end">
            <div>
              <span className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] block">Arena Completion</span>
              <span className="text-2xl font-space font-bold text-white">
                {completedChallenges} <span className="text-slate-600 text-lg">/ {totalChallenges}</span>
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-black text-slate-400">{Math.round(progressPercentage)}%</span>
            </div>
          </div>
          <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 shadow-[0_0_10px_rgba(168,85,247,0.4)] transition-all duration-1000 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {roadmap.days.map((day, idx) => {
          const isUnlocked = day.day <= activeDay;
          const isCompleted = day.day < activeDay;
          return (
            <div 
              key={idx}
              className={`glass p-10 rounded-[2.5rem] border-white/5 relative overflow-hidden group transition-all duration-500 ${
                isUnlocked ? 'hover:border-purple-500/30 cursor-pointer' : 'opacity-40 grayscale pointer-events-none'
              }`}
              onClick={() => isUnlocked && handleEnterChallenge(day)}
            >
              <div className="absolute top-0 right-0 p-8">
                <ICONS.Trophy className={`w-12 h-12 transition-colors duration-500 ${
                  isCompleted ? 'text-emerald-500/20' : isUnlocked ? 'text-purple-500/20 group-hover:text-purple-500/40' : 'text-slate-700'
                }`} />
              </div>
              
              <div className="flex items-center gap-3 mb-6">
                <span className={`text-xs font-black uppercase tracking-widest ${isCompleted ? 'text-emerald-400' : 'text-purple-400'}`}>
                  Day {day.day}
                </span>
                {!isUnlocked && (
                  <span className="text-[10px] bg-slate-800 text-slate-500 px-2 py-0.5 rounded uppercase font-bold tracking-widest">Locked</span>
                )}
                {isCompleted && (
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded uppercase font-bold tracking-widest border border-emerald-500/20">Verified</span>
                )}
              </div>

              <h3 className="text-2xl font-space font-bold text-white mb-4 group-hover:text-purple-400 transition-colors">
                {day.concept}
              </h3>
              
              <p className="text-slate-400 text-sm leading-relaxed mb-8 line-clamp-2">
                {day.challenge}
              </p>

              <div className="flex items-center justify-between pt-6 border-t border-white/5">
                <div className="flex items-center gap-2">
                   <div className={`w-2 h-2 rounded-full ${
                     isCompleted ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 
                     isUnlocked ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]' : 
                     'bg-slate-800'
                   }`}></div>
                   <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Node {idx + 1}</span>
                </div>
                <div className={`text-[10px] font-black uppercase tracking-widest group-hover:translate-x-1 transition-transform ${
                  isCompleted ? 'text-emerald-400' : 'text-purple-400'
                }`}>
                  {isCompleted ? 'Revisit Arena' : 'Enter Arena'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ArenaPage;
