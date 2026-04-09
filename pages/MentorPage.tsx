
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, SkillLevel } from '../types';
import { ICONS } from '../constants';
import { geminiService } from '../services/gemini';
import { Chat, GenerateContentResponse } from '@google/genai';

interface MentorPageProps {
  skillName: string;
  level: SkillLevel;
  goal: string;
  chatHistory: ChatMessage[];
  updateChatHistory: (messages: ChatMessage[]) => void;
}

const MentorPage: React.FC<MentorPageProps> = ({ skillName, level, goal, chatHistory, updateChatHistory }) => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<Chat | null>(null);

  useEffect(() => {
    // Re-initialize chat if the skill changes
    chatRef.current = geminiService.createMentorChat(skillName, level, goal);
  }, [skillName, level, goal]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [chatHistory]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage: ChatMessage = { role: 'user', text: input };
    const updatedHistory = [...chatHistory, userMessage];
    updateChatHistory(updatedHistory);
    setInput('');
    setIsTyping(true);

    try {
      if (chatRef.current) {
        const stream = await chatRef.current.sendMessageStream({ message: input });
        let modelText = '';
        
        // Explicitly type intermediateHistory as ChatMessage[] to satisfy the role literal type requirement
        const intermediateHistory: ChatMessage[] = [...updatedHistory, { role: 'model', text: '' }];
        updateChatHistory(intermediateHistory);
        
        for await (const chunk of stream) {
          const c = chunk as GenerateContentResponse;
          modelText += c.text;
          // Explicitly type currentHistory as ChatMessage[] to ensure the model role is correctly inferred
          const currentHistory: ChatMessage[] = [...updatedHistory, { role: 'model', text: modelText }];
          updateChatHistory(currentHistory);
        }
      }
    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = { role: 'model', text: "Apologies, neural sync lost. Please retry link." };
      updateChatHistory([...updatedHistory, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[75vh] animate-in fade-in duration-700">
      <div className="flex items-center justify-between mb-6 px-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <ICONS.Brain className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h2 className="text-2xl font-space font-bold">{skillName} Specialist</h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Neural Expert Locked & Loaded
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 glass rounded-[2.5rem] overflow-hidden flex flex-col relative">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide"
        >
          {chatHistory.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
              <ICONS.Message className="w-12 h-12 text-slate-600" />
              <p className="text-slate-400 font-space italic">
                "Initiating expertise in {skillName}. <br/>Whether it's architectural scaling or specific syntax, I am here to optimize your learning path."
              </p>
            </div>
          )}
          
          {chatHistory.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
            >
              <div className={`max-w-[85%] p-5 rounded-2xl font-medium leading-relaxed prose prose-invert prose-sm ${
                msg.role === 'user' 
                  ? 'bg-sky-500 text-white shadow-lg shadow-sky-950/20 rounded-tr-none' 
                  : 'bg-slate-900/80 border border-white/5 text-slate-200 rounded-tl-none'
              }`}>
                {msg.text.split('\n').map((line, i) => (
                  <p key={i} className="mb-2 last:mb-0">{line}</p>
                ))}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="p-4 bg-slate-900/50 rounded-2xl flex gap-1 items-center">
                <div className="w-1 h-1 bg-sky-400 rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-sky-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1 h-1 bg-sky-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSend} className="p-6 bg-slate-950/50 border-t border-white/5 flex gap-4">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Query about ${skillName}...`}
            className="flex-1 bg-slate-900/50 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all font-space"
          />
          <button 
            disabled={!input.trim() || isTyping}
            className="w-14 h-14 rounded-2xl bg-sky-500 flex items-center justify-center text-white hover:bg-sky-400 transition-all shadow-lg shadow-sky-950/20 disabled:opacity-50"
          >
            <ICONS.ArrowRight className="w-6 h-6" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default MentorPage;
