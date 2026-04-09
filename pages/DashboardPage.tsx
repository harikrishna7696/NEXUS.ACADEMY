
import React from 'react';
import { AppState } from '../types';
import { ICONS } from '../constants';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, PolarRadiusAxis } from 'recharts';

interface DashboardPageProps {
  state: AppState;
  onStartSkill: () => void;
  onSwitchSkill: (index: number) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ state, onStartSkill, onSwitchSkill }) => {
  const hasEnrollments = state.enrollments.length > 0;

  if (!hasEnrollments) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 animate-in fade-in zoom-in duration-700">
        <div className="relative">
          <div className="w-32 h-32 bg-sky-500/10 rounded-full blur-3xl absolute inset-0 -z-10 animate-pulse"></div>
          <ICONS.Brain className="w-24 h-24 text-slate-700 mx-auto" />
        </div>
        
        <div className="space-y-4 max-w-xl">
          <h2 className="text-4xl font-space font-bold text-white">404: Ambition Not Found</h2>
          <p className="text-xl text-slate-400 font-medium leading-relaxed italic">
            "Neural pathways currently resemble a deserted highway. Your expertise library is collecting digital dust. 
            Want to feed your brain some Kubernetes or Rust, or should we just wait for the AI takeover?"
          </p>
        </div>

        <button 
          onClick={onStartSkill}
          className="group px-10 py-5 bg-gradient-to-r from-sky-500 to-indigo-600 rounded-2xl text-white font-bold text-lg shadow-xl shadow-sky-950/20 hover:scale-105 transition-all flex items-center gap-3"
        >
          Initiate Neural Link
          <ICONS.ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    );
  }

  const radarData = [
    { subject: 'Theory', A: 65 },
    { subject: 'Practical', A: 45 },
    { subject: 'Logic', A: 85 },
    { subject: 'Scale', A: 30 },
    { subject: 'Architecture', A: 55 },
  ];

  return (
    <div className="py-8 animate-in fade-in duration-700 space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-space font-bold">Neural Dashboard</h2>
          <p className="text-slate-500 mt-1 uppercase tracking-widest text-xs font-bold">Synchronizing Multiple Mastery Streams...</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-orange-500/10 px-6 py-3 rounded-2xl border border-orange-500/20">
            <ICONS.Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
            <span className="font-bold text-orange-500">{state.streak} Day Neural Sync</span>
          </div>
          <button 
            onClick={onStartSkill}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-sky-500 text-white font-bold text-sm shadow-lg shadow-sky-950/30 hover:bg-sky-400 transition-all"
          >
            <ICONS.Zap className="w-4 h-4 fill-white" />
            Add New Skill
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Active Enrollments Grid */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {state.enrollments.map((enrollment, index) => {
              const progress = ((enrollment.activeDay - 1) / enrollment.roadmap.duration) * 100;
              const isActive = state.activeEnrollmentIndex === index;
              return (
                <div 
                  key={index}
                  onClick={() => onSwitchSkill(index)}
                  className={`glass p-8 rounded-[2.5rem] flex flex-col justify-between group transition-all cursor-pointer relative border-2 ${
                    isActive ? 'border-sky-500/50 bg-white/[0.05]' : 'border-white/5 hover:border-sky-500/30'
                  }`}
                >
                   {isActive && (
                     <div className="absolute top-6 right-6">
                        <span className="px-3 py-1 bg-sky-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-sky-950/40">Active</span>
                     </div>
                   )}
                   
                   <div>
                     <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Neural Path #{index + 1}</h3>
                     <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                          <ICONS.Zap className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <div className="text-xl font-bold text-white group-hover:text-sky-400 transition-colors">{enrollment.roadmap.skill}</div>
                          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{enrollment.roadmap.level} Phase</div>
                        </div>
                     </div>
                   </div>

                   <div className="mt-8 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Global Progress</span>
                        <span className="text-[10px] text-sky-400 font-black">{Math.round(progress)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-sky-400 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                      </div>
                      <button className="w-full py-4 rounded-xl bg-slate-900/50 hover:bg-slate-800 text-[10px] font-black text-white uppercase tracking-[0.2em] transition-colors border border-white/5">
                        Continue Session
                      </button>
                   </div>
                </div>
              );
            })}

            {/* Empty Slot / Add Skill Card */}
            <div 
              onClick={onStartSkill}
              className="border-2 border-dashed border-white/10 rounded-[2.5rem] p-8 flex flex-col items-center justify-center gap-4 group hover:border-sky-500/30 hover:bg-sky-500/5 cursor-pointer transition-all min-h-[300px]"
            >
              <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ICONS.Zap className="w-8 h-8 text-slate-700 group-hover:text-sky-500 transition-colors" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-space font-bold text-slate-500 group-hover:text-white transition-colors">Start Another Path</h3>
                <p className="text-xs text-slate-600 font-bold uppercase tracking-widest mt-1">Multi-tasking Neural Stream</p>
              </div>
            </div>
          </div>
        </div>

        {/* Global Analytics Sidebar */}
        <div className="space-y-8">
           <div className="glass p-8 rounded-[3rem] flex flex-col items-center border-white/5">
             <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 w-full text-left">Aggregated Mastery</h3>
             <div className="h-[280px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                   <PolarGrid stroke="#1e293b" />
                   <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} />
                   <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                   <Radar
                     name="Neural Score"
                     dataKey="A"
                     stroke="#0ea5e9"
                     fill="#0ea5e9"
                     fillOpacity={0.4}
                   />
                 </RadarChart>
               </ResponsiveContainer>
             </div>
             <p className="text-center text-[11px] text-slate-500 font-medium leading-relaxed mt-4 italic">
               Cross-domain analysis suggests healthy synapse formation between your active technical streams.
             </p>
           </div>

           <div className="glass p-8 rounded-[3rem] border-white/5 space-y-6">
             <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Neural Uptime</h3>
             <div className="grid grid-cols-2 gap-4">
               <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                 <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Total Time</div>
                 <div className="text-2xl font-space font-bold text-white">{state.totalTimeSpent} <span className="text-xs text-sky-400">min</span></div>
               </div>
               <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                 <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Streak</div>
                 <div className="text-2xl font-space font-bold text-orange-500">{state.streak} <span className="text-xs">days</span></div>
               </div>
             </div>
             
             <div className="pt-4 border-t border-white/5">
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-4">Activity Log (Last 7 Days)</div>
                <div className="flex items-end gap-1.5 h-16">
                  {[...Array(7)].map((_, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() - (6 - i));
                    const dateStr = d.toISOString().split('T')[0];
                    const activity = state.activityLog.find(a => a.date === dateStr);
                    const height = activity ? Math.min(100, (activity.timeSpent / 60) * 100) : 5;
                    return (
                      <div key={i} className="flex-1 bg-sky-500/20 rounded-t-sm relative group">
                        <div 
                          className="absolute bottom-0 left-0 w-full bg-sky-400 rounded-t-sm transition-all duration-1000" 
                          style={{ height: `${height}%` }}
                        ></div>
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-[8px] text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                          {activity?.timeSpent || 0} min
                        </div>
                      </div>
                    );
                  })}
                </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
