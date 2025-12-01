/**
 * Generate a unique ID string
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Generate a short ID (8 characters)
 */
export const generateShortId = (): string => {
  return Math.random().toString(36).substr(2, 8);
};