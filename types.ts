
export enum SkillLevel {
  NO_IDEA = 'No Idea / Just Start',
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced',
  EXPERT = 'Expert'
}

export interface SkillGoal {
  id: string;
  label: string;
}

export interface AssessmentQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  category: string;
}

export interface RoadmapDay {
  day: number;
  concept: string;
  relevance: string;
  handsOnTask: string;
  estimatedTime: string;
  quizQuestions: {
    question: string;
    options: string[];
    answer: string;
  }[];
  challenge: string;
}

export interface LearningRoadmap {
  skill: string;
  level: SkillLevel;
  duration: number;
  goal: string;
  days: RoadmapDay[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface Enrollment {
  roadmap: LearningRoadmap;
  activeDay: number;
  confidenceScore: number;
  chatHistory: ChatMessage[];
}

export interface User {
  id: string;
  username: string;
  isGuest: boolean;
  avatar?: string;
}

export interface AppState {
  currentStep: 'auth' | 'discovery' | 'assessment' | 'result' | 'roadmap' | 'dashboard' | 'session' | 'mentor' | 'arena';
  user: User | null;
  // Discovery Flow State
  skillName: string;
  selectedGoal: string;
  initialLevel: SkillLevel;
  verifiedLevel: SkillLevel | null;
  assessmentQuestions: AssessmentQuestion[];
  assessmentResults: { questionId: string; selectedIndex: number; isCorrect: boolean }[];
  assessmentCurrentIndex: number;
  
  // Persistence State
  enrollments: Enrollment[];
  activeEnrollmentIndex: number | null;
  streak: number;
}
