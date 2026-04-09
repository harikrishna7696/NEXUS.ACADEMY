
import { GoogleGenAI, Type, Chat, GenerateContentResponse } from "@google/genai";
import { SkillLevel, AssessmentQuestion, LearningRoadmap, ChatMessage } from "../types";

// Follow guidelines: Obtain API key directly from process.env.API_KEY and use it in named parameter.
export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // Correct initialization as per Google GenAI SDK guidelines.
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async generateAssessment(skill: string, level: SkillLevel): Promise<AssessmentQuestion[]> {
    const prompt = `Generate a set of 5 interactive, high-quality technical assessment questions for the skill "${skill}" at a ${level} level. 
    Focus on practical, scenario-based understanding rather than raw syntax. 
    Ensure one or two questions push the boundaries of the selected level to accurately verify competence.
    Avoid long typing-heavy answers, keep options clear and conceptual.`;

    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              question: { type: Type.STRING },
              options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING } 
              },
              correctIndex: { type: Type.INTEGER },
              explanation: { type: Type.STRING },
              category: { type: Type.STRING }
            },
            required: ["id", "question", "options", "correctIndex", "explanation", "category"]
          }
        }
      }
    });

    try {
      // Accessing response.text directly as a property, not a method.
      const text = response.text || "[]";
      const data = JSON.parse(text);
      return Array.isArray(data) ? data : [];
    } catch (e) {
      console.error("Failed to parse assessment response", e);
      return [];
    }
  }

  async generateRoadmap(skill: string, level: SkillLevel, duration: number, goal: string): Promise<LearningRoadmap> {
    const isNoIdea = level === SkillLevel.NO_IDEA;
    
    const prompt = `Act as an expert Learning Architect. Generate a ${duration}-day personalized, adaptive technical roadmap for learning "${skill}".
    The learner's current level is: ${level}.
    The learner's goal is: "${goal}".
    
    ${isNoIdea ? `
    CRITICAL INSTRUCTION for "No Idea / Just Start" level:
    - Zero-assumption content: Start from the very basics.
    - Focus on mental models and visual metaphors.
    - Avoid technical jargon in the first 2 days, or explain it immediately.
    - Include high-confidence building tasks.
    ` : `
    Adaptive instructions for ${level}:
    - Skip fundamentals that are beneath this level.
    - Focus on advanced patterns, performance, and real-world edge cases.
    `}

    Structure the roadmap day-by-day. For each day, include:
    - Concept: Clear, punchy learning objective.
    - Relevance: Why this matters in the real world (e.g. production scenarios).
    - Hands-on task: A practical mini-project or exercise.
    - Quiz questions: 2-3 interactive conceptual questions (Progressive disclosure style: Question -> Guess -> Explain).
    - Challenge: A "stretch" goal for the day.
    - Estimated time: Total hours for the day.

    Use a conversational, encouraging, yet technically precise tone. Avoid long paragraphs. Use bullet points for tasks.`;

    const response = await this.ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            skill: { type: Type.STRING },
            level: { type: Type.STRING },
            duration: { type: Type.INTEGER },
            goal: { type: Type.STRING },
            days: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.INTEGER },
                  concept: { type: Type.STRING },
                  relevance: { type: Type.STRING },
                  handsOnTask: { type: Type.STRING },
                  estimatedTime: { type: Type.STRING },
                  quizQuestions: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        question: { type: Type.STRING },
                        options: { type: Type.ARRAY, items: { type: Type.STRING } },
                        answer: { type: Type.STRING }
                      },
                      required: ["question", "options", "answer"]
                    }
                  },
                  challenge: { type: Type.STRING }
                },
                required: ["day", "concept", "relevance", "handsOnTask", "estimatedTime", "quizQuestions", "challenge"]
              }
            }
          },
          required: ["skill", "level", "duration", "goal", "days"]
        }
      }
    });

    try {
      const text = response.text || "{}";
      return JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse roadmap response", e);
      throw e;
    }
  }

  // Fix: Added nextStep to the return type of verifyChallenge to resolve the TypeScript error.
  async verifyChallenge(skill: string, concept: string, challenge: string, solution: string): Promise<{score: number, feedback: string, nextStep: string}> {
    const prompt = `Act as an elite technical interviewer. 
    Evaluate the following solution for a challenge about "${concept}" in the context of "${skill}".
    
    Challenge: ${challenge}
    User's Solution/Description: ${solution}
    
    Provide:
    1. A score from 0-100.
    2. Concrete technical feedback (strengths and areas for improvement).
    3. A "Next Step" suggestion.
    
    Keep the feedback professional, futuristic, and encouraging.`;

    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            feedback: { type: Type.STRING },
            nextStep: { type: Type.STRING }
          },
          required: ["score", "feedback", "nextStep"]
        }
      }
    });

    try {
      const text = response.text || "{}";
      return JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse verification response", e);
      return { score: 0, feedback: "Error verifying solution.", nextStep: "Try again." };
    }
  }

  createMentorChat(skill: string, level: SkillLevel, goal: string): Chat {
    return this.ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: `You are the world-class Neural Mentor for ${skill}. 
        Expertise context: Deep understanding of ${skill} internals, performance optimization, and related ecosystems (e.g., if ${skill} is LanceDB, you are an expert in vector databases, AI infrastructure, and Rust/Python integration).
        
        Student Context:
        - Current Level: ${level}
        - Learning Goal: ${goal}

        Operational Guidelines:
        1. Tone: Futuristic, sharp, and highly supportive.
        2. Content: Provide precise technical answers, code snippets, and architectural diagrams using Markdown.
        3. Scenarios: Always relate answers to real-world production challenges.
        4. Interaction: If the student asks a question, answer it and then challenge them with a "Micro-Task" to verify they understood.
        5. Visual Metaphors: Use analogies (e.g., "Vector search is like finding a needle in a haystack using a high-powered magnet instead of a magnifying glass").
        
        Stay strictly within the domain of ${skill} and its immediate technical orbit.`
      }
    });
  }
}

export const geminiService = new GeminiService();
