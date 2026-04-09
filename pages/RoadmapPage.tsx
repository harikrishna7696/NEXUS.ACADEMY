
import React from 'react';
import { LearningRoadmap } from '../types';
import { ICONS } from '../constants';

interface RoadmapPageProps {
  roadmap: LearningRoadmap;
  activeDay: number;
  onSelectDay: (day: number) => void;
}

const RoadmapPage: React.FC<RoadmapPageProps> = ({ roadmap, activeDay, onSelectDay }) => {
  const days = roadmap?.days ?? [];
  const totalDays = roadmap?.duration ?? days.length;
  const progressPercent = Math.min(100, Math.max(0, ((activeDay - 1) / totalDays) * 100));

  return (
    <div className="py-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 max-w-5xl mx-auto">
      {/* Header Section */}
      <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8 px-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 text-[10px] font-black uppercase tracking-[0.2em] border border-sky-500/20">
              Personalized Architecture
            </span>
          </div>
          <h2 className="text-5xl md:text-6xl font-space font-bold tracking-tighter">
            Mastering <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-500">{roadmap?.skill}</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">
            Your {roadmap?.duration}-day journey from <span className="text-slate-200 font-semibold">{roadmap?.level}</span> to professional mastery, optimized for <span className="text-slate-200 font-semibold">{roadmap?.goal?.replace('-', ' ')}</span>.
          </p>
        </div>
        
        <div className="flex flex-col gap-4 min-w-[240px]">
          <div className="glass p-6 rounded-3xl border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 left-0 h-1 bg-sky-500 transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Global Progress</span>
              <span className="text-xs font-black text-sky-400">{Math.round(progressPercent)}%</span>
            </div>
            <div className="text-2xl font-space font-bold text-white">Day {activeDay} <span className="text-slate-600">/ {totalDays}</span></div>
          </div>
        </div>
      </div>

      {/* Vertical Timeline Section */}
      <div className="relative px-4 pb-20">
        {/* Main Timeline Spine */}
        <div className="absolute left-[31px] md:left-1/2 top-0 bottom-0 w-[2px] bg-slate-800/50 -translate-x-1/2 hidden md:block"></div>
        <div className="absolute left-[31px] top-0 bottom-0 w-[2px] bg-slate-800/50 block md:hidden"></div>

        {/* Progress Fill Spine */}
        <div 
          className="absolute left-[31px] md:left-1/2 top-0 w-[2px] bg-gradient-to-b from-sky-400 to-indigo-500 -translate-x-1/2 z-10 transition-all duration-1000 hidden md:block"
          style={{ height: `${progressPercent}%` }}
        >
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-sky-400 rounded-full blur-md animate-pulse"></div>
        </div>
        <div 
          className="absolute left-[31px] top-0 w-[2px] bg-gradient-to-b from-sky-400 to-indigo-500 z-10 transition-all duration-1000 block md:hidden"
          style={{ height: `${progressPercent}%` }}
        >
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-sky-400 rounded-full blur-sm animate-pulse"></div>
        </div>

        {days.length === 0 ? (
          <div className="col-span-full glass p-12 text-center rounded-[2.5rem] border-dashed border-white/10 text-slate-500">
            <ICONS.Zap className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-space italic">The architecture engine is still processing...</p>
          </div>
        ) : (
          <div className="space-y-24">
            {days.map((day, idx) => {
              const isCompleted = day.day < activeDay;
              const isActive = day.day === activeDay;
              const isLocked = day.day > activeDay;

              return (
                <div 
                  key={idx}
                  className={`relative flex flex-col md:flex-row items-center gap-8 group transition-all duration-500 ${isLocked ? 'opacity-40 grayscale' : 'opacity-100'}`}
                >
                  {/* Day Marker */}
                  <div className={`z-20 w-16 h-16 rounded-[1.25rem] border-4 flex items-center justify-center font-space font-black text-xl transition-all duration-500 flex-shrink-0 md:absolute md:left-1/2 md:-translate-x-1/2 shadow-xl ${
                    isCompleted ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' :
                    isActive ? 'bg-sky-500 border-white text-white scale-110 neon-blue' :
                    'bg-slate-900 border-slate-800 text-slate-600'
                  }`}>
                    {isCompleted ? (
                      <ICONS.CheckCircle className="w-8 h-8" />
                    ) : day.day}
                  </div>

                  {/* Content Card (Alternate Left/Right on Desktop) */}
                  <div className={`w-full md:w-[45%] ${idx % 2 === 0 ? 'md:mr-auto md:text-right md:items-end' : 'md:ml-auto md:text-left md:items-start'} flex flex-col`}>
                    <div 
                      onClick={() => !isLocked && onSelectDay(day.day)}
                      className={`glass p-8 rounded-[2rem] border-white/5 transition-all duration-500 text-left w-full hover:scale-[1.02] cursor-pointer group-hover:border-sky-500/30 relative overflow-hidden ${
                        isActive ? 'border-sky-500/40 bg-white/[0.05]' : ''
                      }`}
                    >
                      {isActive && (
                        <div className="absolute top-0 right-0 p-4">
                          <span className="flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-3 mb-6">
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isActive ? 'text-sky-400' : 'text-slate-500'}`}>
                          {isActive ? 'Current Phase' : isCompleted ? 'Verified' : 'Incoming Sync'}
                        </span>
                        <div className="h-[1px] flex-1 bg-white/5"></div>
                      </div>

                      <div className="flex items-center gap-2 mb-2 text-sky-400/90 font-bold">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-base tracking-wide uppercase">{day.estimatedTime}</span>
                      </div>

                      <h3 className={`text-2xl font-space font-bold mb-4 transition-colors ${isActive ? 'text-white' : 'text-slate-300'}`}>
                        {day.concept}
                      </h3>
                      
                      <p className="text-slate-400 text-sm mb-6 leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all duration-500">
                        {day.relevance}
                      </p>

                      <div className="space-y-4">
                        <div className="flex items-center gap-3 bg-slate-900/40 p-4 rounded-2xl border border-white/5 group-hover:border-sky-500/20 transition-all">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isCompleted ? 'bg-emerald-500/10' : 'bg-slate-800'}`}>
                            <ICONS.Zap className={`w-4 h-4 ${isCompleted ? 'text-emerald-500' : 'text-slate-500'}`} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Task</span>
                            <span className="text-xs text-slate-300 font-medium line-clamp-1">{day.handsOnTask}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4">
                          <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${isLocked ? 'text-slate-700' : 'text-sky-500 group-hover:text-sky-400'}`}>
                            {isLocked ? 'Locked Core' : 'Initiate Session'}
                          </span>
                          {!isLocked && <ICONS.ArrowRight className="w-4 h-4 text-sky-500 group-hover:translate-x-1 transition-transform" />}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Completion CTA */}
      <div className="mt-32 text-center pb-20">
        <div className="inline-flex flex-col items-center gap-6 glass p-12 rounded-[3rem] border-white/10 max-w-2xl">
          <div className="w-20 h-20 rounded-3xl bg-sky-500/10 flex items-center justify-center animate-pulse">
            <ICONS.Trophy className="w-10 h-10 text-sky-400" />
          </div>
          <h3 className="text-3xl font-space font-bold">The Mastery Horizon</h3>
          <p className="text-slate-400 leading-relaxed italic">
            "Education is not the learning of facts, but the training of the mind to think."
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-sky-500 to-transparent"></div>
        </div>
      </div>
    </div>
  );
};

export default RoadmapPage;
