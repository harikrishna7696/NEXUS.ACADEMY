
import React, { useState } from 'react';
import { AssessmentQuestion } from '../types';
import { ICONS } from '../constants';

interface AssessmentPageProps {
  skill: string;
  questions: AssessmentQuestion[];
  onComplete: (results: { questionId: string; selectedIndex: number; isCorrect: boolean }[]) => void;
}

const AssessmentPage: React.FC<AssessmentPageProps> = ({ skill, questions, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<{ questionId: string; selectedIndex: number; isCorrect: boolean }[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const safeQuestions = questions ?? [];
  const currentQuestion = safeQuestions[currentIndex];

  const handleNext = () => {
    if (selectedOption === null || !currentQuestion) return;

    const isCorrect = selectedOption === currentQuestion.correctIndex;
    const newResults = [...results, { 
      questionId: currentQuestion.id, 
      selectedIndex: selectedOption, 
      isCorrect 
    }];

    if (currentIndex < safeQuestions.length - 1) {
      setResults(newResults);
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
    } else {
      onComplete(newResults);
    }
  };

  if (safeQuestions.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-10 glass p-10 text-center rounded-3xl">
        <h2 className="text-2xl font-bold text-slate-300">No questions available.</h2>
        <p className="text-slate-500 mt-2">The architecture flow encountered an error generating the assessment.</p>
      </div>
    );
  }

  if (!currentQuestion) {
    return <div className="text-center py-20 text-slate-500">Loading question...</div>;
  }

  const progress = ((currentIndex + 1) / safeQuestions.length) * 100;
  const options = currentQuestion.options ?? [];

  return (
    <div className="max-w-3xl mx-auto py-10 animate-in fade-in duration-700">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-space font-bold mb-1">Skill Verification: <span className="text-sky-400">{skill}</span></h2>
          <p className="text-slate-400">Question {currentIndex + 1} of {safeQuestions.length}</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">Verification Status</span>
          <div className="flex gap-1 mt-2">
            {safeQuestions.map((_, idx) => (
              <div 
                key={idx} 
                className={`w-8 h-1.5 rounded-full transition-all duration-500 ${
                  idx < currentIndex ? 'bg-sky-500' : idx === currentIndex ? 'bg-sky-400 animate-pulse' : 'bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="glass p-10 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-slate-800">
          <div 
            className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-4">
          <span className="inline-block px-3 py-1 bg-sky-500/10 text-sky-400 text-xs font-bold rounded-full mb-4 border border-sky-500/20 uppercase">
            {currentQuestion.category}
          </span>
          <h3 className="text-2xl font-medium leading-relaxed text-slate-100 mb-8">
            {currentQuestion.question}
          </h3>

          <div className="space-y-4">
            {options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedOption(idx)}
                className={`w-full text-left p-6 rounded-2xl border transition-all flex items-center justify-between group ${
                  selectedOption === idx 
                    ? 'bg-sky-500/10 border-sky-500 text-sky-400 ring-2 ring-sky-500/20 shadow-lg' 
                    : 'bg-slate-900/30 border-white/5 text-slate-400 hover:border-white/20 hover:bg-slate-900/50'
                }`}
              >
                <span className="flex-1 text-lg">{option}</span>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  selectedOption === idx ? 'border-sky-500' : 'border-slate-700 group-hover:border-slate-500'
                }`}>
                  {selectedOption === idx && <div className="w-3 h-3 bg-sky-500 rounded-full" />}
                </div>
              </button>
            ))}
          </div>

          <div className="mt-10 flex justify-end">
            <button
              onClick={handleNext}
              disabled={selectedOption === null}
              className={`px-10 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all ${
                selectedOption === null 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                  : 'bg-white text-slate-950 hover:bg-sky-400 shadow-xl shadow-sky-950/20'
              }`}
            >
              {currentIndex === safeQuestions.length - 1 ? 'Finalize' : 'Continue'}
              <ICONS.ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentPage;
