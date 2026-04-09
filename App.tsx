
import React, { useState, useEffect } from 'react';
import { AppState, SkillLevel, ChatMessage, Enrollment, User } from './types';
import { GOALS, ICONS } from './constants';
import { geminiService } from './services/gemini';
import { storageService } from './services/storage';

// Components
import DiscoveryPage from './pages/DiscoveryPage';
import AssessmentPage from './pages/AssessmentPage';
import ResultPage from './pages/ResultPage';
import RoadmapPage from './pages/RoadmapPage';
import DashboardPage from './pages/DashboardPage';
import SessionPage from './pages/SessionPage';
import MentorPage from './pages/MentorPage';
import ArenaPage from './pages/ArenaPage';

const DEFAULT_STATE: AppState = {
  currentStep: 'auth',
  user: null,
  skillName: '',
  selectedGoal: GOALS[0].id,
  initialLevel: SkillLevel.BEGINNER,
  verifiedLevel: null,
  assessmentQuestions: [],
  assessmentResults: [],
  assessmentCurrentIndex: 0,
  enrollments: [],
  activeEnrollmentIndex: null,
  streak: 0,
  totalTimeSpent: 0,
  lastLoginDate: null,
  activityLog: []
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(DEFAULT_STATE);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');

  // Re-hydrate session on mount
  useEffect(() => {
    const config = localStorage.getItem('nexus_global_config');
    if (config) {
      try {
        const { lastUser } = JSON.parse(config);
        if (lastUser) {
          handleLogin(lastUser, false);
        }
      } catch (e) {
        console.error("Failed to re-hydrate session", e);
      }
    }
  }, []);

  // Auto-save whenever state changes AND a user is logged in
  useEffect(() => {
    if (state.user) {
      storageService.saveUserState(state.user.username, state);
    }
  }, [state]);

  // Time tracking effect
  useEffect(() => {
    if (!state.user || state.currentStep === 'auth') return;

    const interval = setInterval(() => {
      const today = new Date().toISOString().split('T')[0];
      
      setState(prev => {
        const newActivityLog = [...prev.activityLog];
        const todayIndex = newActivityLog.findIndex(a => a.date === today);
        
        if (todayIndex >= 0) {
          newActivityLog[todayIndex] = {
            ...newActivityLog[todayIndex],
            timeSpent: newActivityLog[todayIndex].timeSpent + 1
          };
        } else {
          newActivityLog.push({ date: today, timeSpent: 1 });
        }

        return {
          ...prev,
          totalTimeSpent: prev.totalTimeSpent + 1,
          activityLog: newActivityLog
        };
      });
    }, 60000); // Every minute

    return () => clearInterval(interval);
  }, [state.user, state.currentStep]);

  const activeEnrollment = state.activeEnrollmentIndex !== null ? state.enrollments[state.activeEnrollmentIndex] : null;

  const handleLogin = (username: string, isGuest: boolean) => {
    const alias = username.trim() || (isGuest ? 'Guest_Traveler' : 'Neural_Pioneer');
    
    // Check if this user already has data in the vault
    const existingData = storageService.loadUserState(alias);
    const today = new Date().toISOString().split('T')[0];
    
    if (existingData) {
      let newStreak = existingData.streak || 0;
      const lastLogin = existingData.lastLoginDate;
      
      if (lastLogin) {
        const lastDate = new Date(lastLogin);
        const currentDate = new Date(today);
        const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          newStreak += 1;
        } else if (diffDays > 1) {
          newStreak = 1;
        }
      } else {
        newStreak = 1;
      }

      // Re-hydrate the existing user session
      setState({
        ...DEFAULT_STATE,
        ...existingData,
        streak: newStreak,
        lastLoginDate: today,
        currentStep: existingData.currentStep && existingData.currentStep !== 'auth' 
          ? existingData.currentStep 
          : 'dashboard'
      });
      storageService.logEvent(existingData.user?.id || 'unknown', 'auth_sync_restored', { alias });
    } else {
      // Create new neural profile
      const newUser: User = {
        id: isGuest ? `guest_${Math.random().toString(36).substr(2, 9)}` : `user_${Date.now()}`,
        username: alias,
        isGuest
      };
      setState({
        ...DEFAULT_STATE,
        user: newUser,
        streak: 1,
        lastLoginDate: today,
        currentStep: 'dashboard'
      });
      storageService.logEvent(newUser.id, 'auth_new_profile', { isGuest });
    }
  };

  const handleLogout = () => {
    if (state.user) storageService.logEvent(state.user.id, 'auth_disconnect');
    
    // 1. Clear session marker (removes "active" user)
    storageService.clearSession();
    
    // 2. Reset React memory state to defaults
    // This allows the "Login" page to appear fresh but keeps data in localStorage for next time
    setState(DEFAULT_STATE);
  };

  const handleStartDiscovery = async (skill: string, goal: string, level: SkillLevel) => {
    setState(prev => ({ ...prev, skillName: skill, selectedGoal: goal, initialLevel: level }));

    if (level === SkillLevel.NO_IDEA) {
      await generateRoadmapInternal(skill, level, goal);
    } else {
      setLoading(true);
      setLoadingMsg('Scanning knowledge nodes...');
      try {
        const questions = await geminiService.generateAssessment(skill, level);
        setState(prev => ({ ...prev, assessmentQuestions: questions, currentStep: 'assessment' }));
      } catch (error) {
        console.error(error);
        alert(`Neural scan failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAssessmentUpdate = (results: { questionId: string; selectedIndex: number; isCorrect: boolean }[], nextIndex: number) => {
    setState(prev => ({ ...prev, assessmentResults: results, assessmentCurrentIndex: nextIndex }));
  };

  const handleAssessmentComplete = (results: { questionId: string; selectedIndex: number; isCorrect: boolean }[]) => {
    const correctCount = results.filter(r => r.isCorrect).length;
    let verified = state.initialLevel;
    
    const levels = [SkillLevel.BEGINNER, SkillLevel.INTERMEDIATE, SkillLevel.ADVANCED, SkillLevel.EXPERT];
    if (correctCount < 3) {
      const currentIndex = levels.indexOf(state.initialLevel);
      verified = currentIndex > 0 ? levels[currentIndex - 1] : SkillLevel.NO_IDEA;
    }

    setState(prev => ({ 
      ...prev, 
      assessmentResults: results, 
      verifiedLevel: verified, 
      currentStep: 'result',
      assessmentCurrentIndex: 0 // Reset for next time
    }));
    if (state.user) storageService.logEvent(state.user.id, 'assessment_verified', { score: correctCount });
  };

  const generateRoadmapInternal = async (skill: string, level: SkillLevel, goal: string) => {
    setLoading(true);
    setLoadingMsg('Architecting adaptive roadmap...');
    try {
      const duration = goal === 'interview' ? 14 : 30;
      const roadmap = await geminiService.generateRoadmap(skill, level, duration, goal);
      
      const newEnrollment: Enrollment = { roadmap, activeDay: 1, confidenceScore: 0, chatHistory: [] };
      setState(prev => ({
        ...prev,
        enrollments: [...prev.enrollments, newEnrollment],
        activeEnrollmentIndex: prev.enrollments.length,
        currentStep: 'roadmap'
      }));
      if (state.user) storageService.logEvent(state.user.id, 'roadmap_deployed', { skill });
    } catch (error) {
      console.error(error);
      alert(`Architectural generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRoadmap = async () => {
    await generateRoadmapInternal(state.skillName, state.verifiedLevel || state.initialLevel, state.selectedGoal);
  };

  const navigateTo = (step: AppState['currentStep'], payload?: Partial<AppState>) => {
    setState(prev => ({ ...prev, currentStep: step, ...payload }));
  };

  const updateChatHistory = (history: ChatMessage[]) => {
    if (state.activeEnrollmentIndex === null) return;
    setState(prev => {
      const newEnrollments = [...prev.enrollments];
      newEnrollments[prev.activeEnrollmentIndex!] = {
        ...newEnrollments[prev.activeEnrollmentIndex!],
        chatHistory: history
      };
      return { ...prev, enrollments: newEnrollments };
    });
  };

  const handleSwitchSkill = (index: number) => {
    setState(prev => ({ ...prev, activeEnrollmentIndex: index, currentStep: 'roadmap' }));
  };

  const handleUpdateActiveDay = (day: number) => {
    if (state.activeEnrollmentIndex === null) return;
    setState(prev => {
      const newEnrollments = [...prev.enrollments];
      const enrollment = newEnrollments[prev.activeEnrollmentIndex!];
      const targetDay = Math.min(day, enrollment.roadmap.duration);
      newEnrollments[prev.activeEnrollmentIndex!] = { ...enrollment, activeDay: targetDay };
      return { ...prev, enrollments: newEnrollments, currentStep: 'session' };
    });
    if (state.user) storageService.logEvent(state.user.id, 'day_mastered', { day });
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col bg-slate-950 text-slate-50">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-500/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full"></div>
      
      <nav className="z-50 px-6 py-4 flex justify-between items-center border-b border-white/5 bg-slate-950/50 backdrop-blur-md sticky top-0">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => state.user && navigateTo('dashboard')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-purple-600 flex items-center justify-center neon-blue">
            <ICONS.Brain className="w-6 h-6 text-white" />
          </div>
          <span className="font-space text-xl font-bold tracking-tight">NEXUS<span className="text-sky-400">.</span>ACADEMY</span>
        </div>
        
        {state.user && (
          <div className="flex gap-4 items-center">
            {activeEnrollment && (
              <div className="hidden lg:flex gap-2">
                <button onClick={() => navigateTo('roadmap')} className={`px-4 py-2 rounded-lg transition-all text-xs font-bold uppercase tracking-widest ${state.currentStep === 'roadmap' ? 'bg-sky-500/10 text-sky-400' : 'text-slate-500 hover:text-slate-300'}`}>Roadmap</button>
                <button onClick={() => navigateTo('arena')} className={`px-4 py-2 rounded-lg transition-all text-xs font-bold uppercase tracking-widest ${state.currentStep === 'arena' ? 'bg-purple-500/10 text-purple-400' : 'text-slate-500 hover:text-slate-300'}`}>Arena</button>
                <button onClick={() => navigateTo('mentor')} className={`px-4 py-2 rounded-lg transition-all text-xs font-bold uppercase tracking-widest ${state.currentStep === 'mentor' ? 'bg-amber-500/10 text-amber-400' : 'text-slate-500 hover:text-slate-300'}`}>Mentor</button>
              </div>
            )}
            <div className="flex items-center gap-3 pl-4 border-l border-white/10">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-white leading-none mb-1">{state.user.username}</div>
                <div className="text-[9px] text-sky-500 font-bold uppercase tracking-widest">{state.user.isGuest ? 'Neural Guest' : 'Synced Pilot'}</div>
              </div>
              <button onClick={handleLogout} className="p-2.5 bg-white/5 hover:bg-red-500/10 rounded-xl text-slate-500 hover:text-red-400 transition-all border border-white/5">
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </button>
            </div>
          </div>
        )}
      </nav>

      <main className="flex-1 z-10 p-6 max-w-7xl mx-auto w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[60vh] gap-6">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-sky-400/20 border-t-sky-400 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center"><ICONS.Brain className="w-8 h-8 text-sky-400 animate-pulse" /></div>
            </div>
            <p className="text-xl font-space text-slate-300 animate-pulse-soft">{loadingMsg}</p>
          </div>
        ) : (
          <>
            {state.currentStep === 'auth' && (
              <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-8 animate-in zoom-in duration-500">
                <div className="text-center space-y-4">
                  <h1 className="text-6xl font-space font-bold tracking-tighter leading-tight">Neural <span className="text-sky-400">Sync</span></h1>
                  <p className="text-slate-400 max-w-md mx-auto text-lg">Enter your Neural Alias to restore your learning clusters.</p>
                </div>
                <div className="glass p-10 rounded-[3rem] w-full max-w-md border-white/5 space-y-8 shadow-2xl">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Neuro-Alias Identity</label>
                    <input 
                      type="text" 
                      id="alias"
                      placeholder="e.g. user1"
                      className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all text-lg font-space"
                      onKeyPress={(e) => e.key === 'Enter' && handleLogin((document.getElementById('alias') as HTMLInputElement).value, false)}
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <button 
                      onClick={() => {
                        const val = (document.getElementById('alias') as HTMLInputElement).value;
                        if (!val) return alert("Alias required for neural sync.");
                        handleLogin(val, false);
                      }}
                      className="w-full py-5 rounded-2xl bg-white text-slate-950 font-bold hover:bg-sky-400 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 text-lg"
                    >
                      Establish Link
                      <ICONS.Zap className="w-5 h-5 fill-slate-950" />
                    </button>
                    <button 
                      onClick={() => handleLogin(`Guest_${Date.now().toString().slice(-4)}`, true)}
                      className="w-full py-5 rounded-2xl border border-white/10 text-slate-400 font-bold hover:bg-white/5 hover:text-white transition-all text-lg"
                    >
                      Anonymous Entry
                    </button>
                  </div>
                </div>
              </div>
            )}
            {state.currentStep === 'discovery' && <DiscoveryPage onStart={handleStartDiscovery} />}
            {state.currentStep === 'assessment' && (
              <AssessmentPage 
                questions={state.assessmentQuestions} 
                currentIndex={state.assessmentCurrentIndex}
                results={state.assessmentResults}
                onUpdate={handleAssessmentUpdate}
                onComplete={handleAssessmentComplete} 
                skill={state.skillName} 
              />
            )}
            {state.currentStep === 'result' && <ResultPage results={state.assessmentResults} initialLevel={state.initialLevel} verifiedLevel={state.verifiedLevel!} onProceed={handleGenerateRoadmap} />}
            {state.currentStep === 'roadmap' && activeEnrollment && <RoadmapPage roadmap={activeEnrollment.roadmap} activeDay={activeEnrollment.activeDay} onSelectDay={handleUpdateActiveDay} />}
            {state.currentStep === 'session' && activeEnrollment && (
              <SessionPage 
                day={activeEnrollment.roadmap.days.find(d => d.day === activeEnrollment.activeDay)}
                totalDays={activeEnrollment.roadmap.duration}
                onComplete={() => navigateTo('dashboard')}
                onNextDay={() => handleUpdateActiveDay(activeEnrollment.activeDay + 1)}
                onConsultMentor={() => navigateTo('mentor')}
              />
            )}
            {state.currentStep === 'dashboard' && <DashboardPage state={state} onStartSkill={() => navigateTo('discovery')} onSwitchSkill={handleSwitchSkill} />}
            {state.currentStep === 'mentor' && activeEnrollment && (
              <MentorPage skillName={activeEnrollment.roadmap.skill} level={activeEnrollment.roadmap.level} goal={activeEnrollment.roadmap.goal} chatHistory={activeEnrollment.chatHistory} updateChatHistory={updateChatHistory} />
            )}
            {state.currentStep === 'arena' && activeEnrollment && <ArenaPage roadmap={activeEnrollment.roadmap} activeDay={activeEnrollment.activeDay} onSelectDay={handleUpdateActiveDay} />}
          </>
        )}
      </main>
      
      <footer className="z-10 py-6 border-t border-white/5 text-center text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em]">
        <p>© 2024 Nexus Academy | Neural Cluster Verification: Active</p>
      </footer>
    </div>
  );
};

export default App;
