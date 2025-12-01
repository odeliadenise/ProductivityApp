import React, { createContext, useContext, useReducer, useEffect } from "react";
import { CalendarEvent } from "../types";
import { storage, STORAGE_KEYS } from "../utils/storage";
import { generateId } from "../utils/id";
import { isAfter, isBefore, isSameDay } from "date-fns";
import { useAuth } from "./AuthContext";

type CalendarAction =
  | { type: "ADD_EVENT"; payload: Omit<CalendarEvent, "id" | "createdAt"> }
  | {
      type: "UPDATE_EVENT";
      payload: { id: string; updates: Partial<CalendarEvent> };
    }
  | { type: "DELETE_EVENT"; payload: string }
  | { type: "SET_EVENTS"; payload: CalendarEvent[] };

interface CalendarContextType {
  events: CalendarEvent[];
  addEvent: (event: Omit<CalendarEvent, "id" | "userId" | "createdAt">) => void;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  getEventsForDate: (date: Date) => CalendarEvent[];
  getEventsInRange: (startDate: Date, endDate: Date) => CalendarEvent[];
  getUpcomingEvents: (limit?: number) => CalendarEvent[];
}

const CalendarContext = createContext<CalendarContextType | null>(null);

function calendarReducer(
  state: CalendarEvent[],
  action: CalendarAction
): CalendarEvent[] {
  switch (action.type) {
    case "SET_EVENTS":
      return action.payload;
    case "ADD_EVENT": {
      const newEvent: CalendarEvent = {
        ...action.payload,
        id: generateId(),
        createdAt: new Date(),
      };
      return [...state, newEvent];
    }
    case "UPDATE_EVENT":
      return state.map((event) =>
        event.id === action.payload.id
          ? { ...event, ...action.payload.updates }
          : event
      );
    case "DELETE_EVENT":
      return state.filter((event) => event.id !== action.payload);
    default:
      return state;
  }
}

export function CalendarProvider({ children }: { children: React.ReactNode }) {
  const [events, dispatch] = useReducer(calendarReducer, []);
  const { user, isAuthenticated } = useAuth();

  // Load events from localStorage when user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      const savedEvents = storage.get<CalendarEvent[]>(STORAGE_KEYS.EVENTS, []);
      const userEvents = savedEvents.filter(
        (event) => event.userId === user.id
      );
      const eventsWithDates = userEvents.map((event) => ({
        ...event,
        startDate: new Date(event.startDate),
        endDate: new Date(event.endDate),
        createdAt: new Date(event.createdAt),
      }));
      dispatch({ type: "SET_EVENTS", payload: eventsWithDates });
    } else {
      dispatch({ type: "SET_EVENTS", payload: [] });
    }
  }, [isAuthenticated, user]);

  // Save events to localStorage whenever events change
  useEffect(() => {
    if (isAuthenticated && user) {
      const allEvents = storage.get<CalendarEvent[]>(STORAGE_KEYS.EVENTS, []);
      const otherUserEvents = allEvents.filter(
        (event) => event.userId !== user.id
      );
      const updatedEvents = [...otherUserEvents, ...events];
      storage.set(STORAGE_KEYS.EVENTS, updatedEvents);
    }
  }, [events, isAuthenticated, user]);

  const addEvent = (
    event: Omit<CalendarEvent, "id" | "userId" | "createdAt">
  ) => {
    if (!user) return;
    const eventWithUserId = { ...event, userId: user.id };
    dispatch({ type: "ADD_EVENT", payload: eventWithUserId });
  };

  const updateEvent = (id: string, updates: Partial<CalendarEvent>) => {
    dispatch({ type: "UPDATE_EVENT", payload: { id, updates } });
  };

  const deleteEvent = (id: string) => {
    dispatch({ type: "DELETE_EVENT", payload: id });
  };

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      if (event.allDay) {
        return isSameDay(event.startDate, date);
      }
      return isSameDay(event.startDate, date) || isSameDay(event.endDate, date);
    });
  };

  const getEventsInRange = (startDate: Date, endDate: Date) => {
    return events.filter((event) => {
      return !(
        isAfter(event.startDate, endDate) || isBefore(event.endDate, startDate)
      );
    });
  };

  const getUpcomingEvents = (limit = 5) => {
    const now = new Date();
    return events
      .filter((event) => isAfter(event.startDate, now))
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
      .slice(0, limit);
  };

  const value: CalendarContextType = {
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventsForDate,
    getEventsInRange,
    getUpcomingEvents,
  };

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar() {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error("useCalendar must be used within a CalendarProvider");
  }
  return context;
}
