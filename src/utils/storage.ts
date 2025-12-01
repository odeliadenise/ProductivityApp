/**
 * Local storage utility functions for persisting app data
 */

export const storage = {
  /**
   * Get item from localStorage
   */
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Error getting ${key} from localStorage:`, error);
      return defaultValue;
    }
  },

  /**
   * Set item in localStorage
   */
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Error setting ${key} in localStorage:`, error);
    }
  },

  /**
   * Remove item from localStorage
   */
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Error removing ${key} from localStorage:`, error);
    }
  },

  /**
   * Clear all items from localStorage
   */
  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.warn('Error clearing localStorage:', error);
    }
  }
};

// Storage keys
export const STORAGE_KEYS = {
  TASKS: 'productivity-app-tasks',
  NOTES: 'productivity-app-notes',
  EVENTS: 'productivity-app-events',
  USER_PREFERENCES: 'productivity-app-preferences'
} as const;