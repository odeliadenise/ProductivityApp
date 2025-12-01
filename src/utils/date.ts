import { format, isToday, isTomorrow, isYesterday, addDays, startOfWeek, endOfWeek } from 'date-fns';

/**
 * Formats a date for display
 */
export const formatDate = (date: Date): string => {
  if (isToday(date)) {
    return 'Today';
  }
  if (isTomorrow(date)) {
    return 'Tomorrow';
  }
  if (isYesterday(date)) {
    return 'Yesterday';
  }
  return format(date, 'MMM d, yyyy');
};

/**
 * Formats time for display
 */
export const formatTime = (date: Date): string => {
  return format(date, 'h:mm a');
};

/**
 * Formats date and time for display
 */
export const formatDateTime = (date: Date): string => {
  return `${formatDate(date)} at ${formatTime(date)}`;
};

/**
 * Gets the week range for a given date
 */
export const getWeekRange = (date: Date) => {
  return {
    start: startOfWeek(date, { weekStartsOn: 1 }),
    end: endOfWeek(date, { weekStartsOn: 1 })
  };
};

/**
 * Generates an array of dates for a week
 */
export const getWeekDays = (date: Date): Date[] => {
  const { start } = getWeekRange(date);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
};