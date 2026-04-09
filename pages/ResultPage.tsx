
import React from 'react';
import { SkillLevel } from '../types';
import { ICONS } from '../constants';

interface ResultPageProps {
  results: { questionId: string; selectedIndex: number; isCorrect: boolean }[];
  initialLevel: SkillLevel;
  verifiedLevel: SkillLevel;
  onProceed: () => void;
}

const ResultPage: React.FC<ResultPageProps> = ({ results, initialLevel, verifiedLevel, onProceed }) => {
  const correctCount = results.filter(r => r.isCorrect).length;
  const isDowngraded = initialLevel !== verifiedLevel;

  return (
    <div className="max-w-4xl mx-auto py-12 animate-in zoom-in duration-500">
      <div className="text-center space-y-4 mb-12">
        <h2 className="text-4xl md:text-5xl font-space font-bold">Assessment Complete</h2>
        <p className="text-slate-400 text-xl">We've analyzed your responses to calculate your starting point.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="glass p-8 rounded-3xl border-sky-500/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4">
            <ICONS.Zap className="w-12 h-12 text-sky-500/20 group-hover:scale-110 transition-transform" />
          </div>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Verification Score</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-7xl font-space font-bold text-sky-400">{correctCount}</span>
            <span className="text-3xl font-space font-bold text-slate-600">/ {results.length}</span>
          </div>
          <p className="mt-4 text-slate-300">
            {correctCount >= 4 
              ? "Impressive! You have a solid foundational understanding of the core concepts." 
              : "There are some gaps in the conceptual framework that we'll address in the roadmap."}
          </p>
        </div>

        <div className="glass p-8 rounded-3xl border-purple-500/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4">
            <ICONS.Trophy className="w-12 h-12 text-purple-500/20 group-hover:scale-110 transition-transform" />
          </div>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Calculated Skill Level</h3>
          <div className="flex items-center gap-4">
            <span className={`text-5xl font-space font-bold ${isDowngraded ? 'text-amber-400' : 'text-purple-400'}`}>
              {verifiedLevel}
            </span>
          </div>
          {isDowngraded ? (
            <p className="mt-4 text-slate-300">
              We've adjusted your starting level to <span className="text-amber-400 font-bold">{verifiedLevel}</span> based on specific conceptual misses. This will ensure your foundations are rock-solid.
            </p>
          ) : (
            <p className="mt-4 text-slate-300">
              Your self-assessment matches your verified performance. We will build a path starting from <span className="text-purple-400 font-bold">{verifiedLevel}</span>.
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center gap-6">
        <button
          onClick={onProceed}
          className="px-12 py-5 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:scale-105 transition-all text-white font-bold text-xl shadow-xl shadow-sky-500/20 flex items-center gap-3"
        >
          Generate My Personalized Roadmap
          <ICONS.ArrowRight className="w-6 h-6" />
        </button>
        <p className="text-slate-500 text-sm">Takes about 10-15 seconds to architect your path</p>
      </div>
    </div>
  );
};

export default ResultPage;
