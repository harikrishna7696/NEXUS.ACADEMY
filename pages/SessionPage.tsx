
import React, { useState, useEffect } from 'react';
import { RoadmapDay } from '../types';
import { ICONS } from '../constants';

interface SessionPageProps {
  day: RoadmapDay | undefined;
  totalDays: number;
  onComplete: () => void;
  onNextDay: () => void;
  onConsultMentor: () => void;
}

const SessionPage: React.FC<SessionPageProps> = ({ day, totalDays, onComplete, onNextDay, onConsultMentor }) => {
  if (!day) {
    return (
      <div className="max-w-4xl mx-auto py-8 text-center glass p-10 rounded-3xl">
        <h2 className="text-2xl font-bold text-slate-300">Session not found</h2>
        <button onClick={onComplete} className="mt-4 text-sky-400 hover:underline">Return to Dashboard</button>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState<'learn' | 'quiz' | 'challenge'>('learn');
  const [quizResults, setQuizResults] = useState<Record<number, string>>({});
  const [quizDone, setQuizDone] = useState(false);
  const [isDayFinished, setIsDayFinished] = useState(false);

  // Reset completion state if the day object changes (e.g. when clicking "Next Day")
  useEffect(() => {
    setIsDayFinished(false);
    setActiveTab('learn');
    setQuizDone(false);
    setQuizResults({});
  }, [day.day]);

  const handleQuizSubmit = () => {
    setQuizDone(true);
  };

  const handleFinishDay = () => {
    setIsDayFinished(true);
  };

  const quizQuestions = day.quizQuestions ?? [];
  const hasNextDay = day.day < totalDays;

  return (
    <div className="max-w-4xl mx-auto py-8 animate-in slide-in-from-right-8 duration-700">
      {/* Session Navigation */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={onComplete}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div>
            <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">Day {day.day} Session</span>
            <h2 className="text-3xl font-space font-bold">{day.concept}</h2>
          </div>
        </div>
        
        <button 
          onClick={onConsultMentor}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-widest hover:bg-amber-500/20 transition-all"
        >
          <ICONS.Brain className="w-4 h-4" />
          Ask Mentor
        </button>
      </div>

      {/* Internal Tabs */}
      <div className="flex gap-2 p-1.5 glass rounded-2xl mb-8 w-fit">
        {(['learn', 'quiz', 'challenge'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-2.5 rounded-xl font-bold text-sm capitalize transition-all ${
              activeTab === tab ? 'bg-sky-500 text-white shadow-lg shadow-sky-950/20' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="glass p-10 rounded-[2.5rem] min-h-[500px] relative overflow-hidden">
        {activeTab === 'learn' && (
          <div className="space-y-10 animate-in fade-in duration-500">
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-sky-400">
                <ICONS.Zap className="w-5 h-5" />
                <h3 className="text-sm font-bold uppercase tracking-widest">Why it matters</h3>
              </div>
              <p className="text-xl leading-relaxed text-slate-300 font-medium">
                {day.relevance}
              </p>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-2 text-emerald-400">
                <ICONS.CheckCircle className="w-5 h-5" />
                <h3 className="text-sm font-bold uppercase tracking-widest">Hands-on Task</h3>
              </div>
              <div className="bg-slate-900/50 border border-emerald-500/20 rounded-3xl p-8 space-y-4">
                <p className="text-lg text-slate-200">
                  {day.handsOnTask}
                </p>
                <div className="flex items-center gap-4 text-xs font-mono text-slate-500 bg-slate-950/50 p-3 rounded-lg">
                  <span className="text-emerald-500">$</span>
                  <span>nexus dev run labs --session=day-{day.day}</span>
                </div>
              </div>
            </section>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={() => setActiveTab('quiz')}
                className="w-full py-5 rounded-2xl border-2 border-dashed border-sky-500/30 text-sky-400 hover:bg-sky-500/5 transition-all font-bold flex items-center justify-center gap-2"
              >
                Take the Quiz
                <ICONS.ArrowRight className="w-5 h-5" />
              </button>
              <button 
                onClick={onConsultMentor}
                className="w-full py-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 hover:bg-amber-500/20 transition-all font-bold flex items-center justify-center gap-2"
              >
                Confused? Consult Mentor
                <ICONS.Message className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {activeTab === 'quiz' && (
          <div className="space-y-8 animate-in fade-in duration-500">
             {quizQuestions.length === 0 ? (
               <div className="text-center py-10 text-slate-500">No quiz questions available for this session.</div>
             ) : (
               quizQuestions.map((q, idx) => (
                 <div key={idx} className="space-y-4">
                   <h4 className="text-lg font-medium text-slate-200">{q.question}</h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                     {q.options?.map((opt, oIdx) => (
                       <button
                         key={oIdx}
                         onClick={() => !quizDone && setQuizResults(prev => ({ ...prev, [idx]: opt }))}
                         className={`p-4 rounded-xl text-left border transition-all ${
                           quizResults[idx] === opt 
                            ? quizDone 
                              ? opt === q.answer ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-red-500/10 border-red-500 text-red-400'
                              : 'bg-sky-500/10 border-sky-500 text-sky-400'
                            : 'bg-slate-900/30 border-white/5 text-slate-500 hover:border-white/20'
                         }`}
                       >
                         {opt}
                       </button>
                     ))}
                   </div>
                 </div>
               ))
             )}
             {!quizDone ? (
               <button 
                 onClick={handleQuizSubmit}
                 disabled={quizQuestions.length === 0 || Object.keys(quizResults).length < quizQuestions.length}
                 className="w-full py-5 rounded-2xl bg-white text-slate-950 font-bold disabled:opacity-50 transition-all hover:bg-sky-400"
               >
                 Submit Quiz
               </button>
             ) : (
               <div className="p-8 rounded-3xl bg-sky-500/10 border border-sky-500/20 text-center space-y-4">
                 <ICONS.Trophy className="w-12 h-12 text-sky-500 mx-auto" />
                 <h4 className="text-2xl font-space font-bold">Quiz Verified!</h4>
                 <p className="text-slate-400">Great work. You've demonstrated deep conceptual clarity. Ready for the final challenge?</p>
                 <button 
                   onClick={() => setActiveTab('challenge')}
                   className="px-8 py-3 rounded-xl bg-sky-500 text-white font-bold"
                 >
                   Go to Challenge
                 </button>
               </div>
             )}
          </div>
        )}

        {activeTab === 'challenge' && (
          <div className="flex flex-col items-center justify-center h-full space-y-8 animate-in zoom-in duration-500 py-10">
            {isDayFinished ? (
              <div className="flex flex-col items-center justify-center space-y-8 text-center animate-in fade-in zoom-in duration-700">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <ICONS.CheckCircle className="w-12 h-12 text-emerald-400" />
                  </div>
                  <div className="absolute inset-0 w-24 h-24 border-2 border-emerald-500/50 rounded-full animate-ping opacity-20"></div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-4xl font-space font-bold text-white">Neural Sync Success</h3>
                  <p className="text-slate-400 max-w-md mx-auto">
                    You've mastered the architectural patterns for Day {day.day}. Your neural map has been updated.
                  </p>
                </div>

                <div className="flex flex-col w-full max-w-md gap-4">
                  {hasNextDay ? (
                    <button 
                      onClick={onNextDay}
                      className="w-full py-5 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 font-bold text-white shadow-xl shadow-sky-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                    >
                      <ICONS.Zap className="w-5 h-5 fill-white" />
                      Initiate Day {day.day + 1} Sync
                    </button>
                  ) : (
                    <div className="p-6 bg-purple-500/10 border border-purple-500/20 rounded-3xl text-purple-400 font-bold">
                      Roadmap Completion Reached. Elite Status Verified.
                    </div>
                  )}
                  
                  <button 
                    onClick={onComplete}
                    className="w-full py-4 rounded-2xl border border-white/10 text-slate-400 font-bold hover:bg-white/5 transition-all"
                  >
                    Return to Neural Dashboard
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="w-20 h-20 rounded-3xl bg-purple-500/10 flex items-center justify-center">
                  <ICONS.Trophy className="w-10 h-10 text-purple-400" />
                </div>
                <div className="text-center space-y-4">
                  <h3 className="text-3xl font-space font-bold">The Day {day.day} Boss Challenge</h3>
                  <p className="text-xl text-slate-400 max-w-lg mx-auto">
                    {day.challenge}
                  </p>
                </div>
                <div className="glass p-8 rounded-3xl w-full max-w-lg border-purple-500/20">
                   <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Challenge Instructions</h4>
                   <ul className="space-y-3 text-slate-300">
                     <li className="flex gap-3">
                       <div className="w-5 h-5 rounded-full bg-slate-800 flex-shrink-0 flex items-center justify-center text-[10px] font-bold">1</div>
                       <span>Open your terminal and initiate the nexus environment.</span>
                     </li>
                     <li className="flex gap-3">
                       <div className="w-5 h-5 rounded-full bg-slate-800 flex-shrink-0 flex items-center justify-center text-[10px] font-bold">2</div>
                       <span>Implement the architecture described above.</span>
                     </li>
                     <li className="flex gap-3">
                       <div className="w-5 h-5 rounded-full bg-slate-800 flex-shrink-0 flex items-center justify-center text-[10px] font-bold">3</div>
                       <span>Run nexus test --day={day.day} to verify your solution.</span>
                     </li>
                   </ul>
                </div>
                <div className="flex flex-col w-full max-w-lg gap-4">
                  <button 
                    onClick={handleFinishDay}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 font-bold text-white shadow-lg shadow-purple-950/20"
                  >
                    I've Completed the Challenge
                  </button>
                  <button 
                    onClick={onConsultMentor}
                    className="w-full py-4 rounded-2xl border border-white/10 text-slate-400 font-bold hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                  >
                    Need architectural advice? Consult Mentor
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionPage;
