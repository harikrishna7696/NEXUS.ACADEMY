
import { AppState, User } from '../types';

const GLOBAL_CONFIG_KEY = 'nexus_global_config';
const USER_PREFIX = 'nexus_user_v1_';
const LOG_KEY = 'nexus_event_logs';

export const storageService = {
  // Save specific user data
  saveUserState: (username: string, state: AppState) => {
    const key = `${USER_PREFIX}${username.toLowerCase().trim()}`;
    localStorage.setItem(key, JSON.stringify(state));
    // Also track which user was last active
    localStorage.setItem(GLOBAL_CONFIG_KEY, JSON.stringify({ lastUser: username }));
  },

  // Load specific user data
  loadUserState: (username: string): Partial<AppState> | null => {
    const key = `${USER_PREFIX}${username.toLowerCase().trim()}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  },

  // Log events with specific user context
  logEvent: (userId: string, eventType: string, data: any = {}) => {
    const logs = JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
    const newLog = {
      userId,
      eventType,
      data,
      timestamp: new Date().toISOString()
    };
    logs.push(newLog);
    // Keep a buffer of the last 500 events
    localStorage.setItem(LOG_KEY, JSON.stringify(logs.slice(-500)));
    console.debug(`[NEXUS NEURAL LOG]: ${eventType}`, newLog);
  },

  // Clear session only (don't delete the user's data)
  clearSession: () => {
    localStorage.removeItem(GLOBAL_CONFIG_KEY);
  },

  // Helper to get all registered aliases (useful for debugging or selection)
  getRegisteredAliases: (): string[] => {
    return Object.keys(localStorage)
      .filter(key => key.startsWith(USER_PREFIX))
      .map(key => key.replace(USER_PREFIX, ''));
  }
};
