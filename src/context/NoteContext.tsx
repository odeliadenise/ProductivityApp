import React, { createContext, useContext, useReducer, useEffect } from "react";
import { Note } from "../types";
import { storage, STORAGE_KEYS } from "../utils/storage";
import { generateId } from "../utils/id";
import { useAuth } from "./AuthContext";

type NoteAction =
  | { type: "ADD_NOTE"; payload: Omit<Note, "id" | "createdAt" | "updatedAt"> }
  | { type: "UPDATE_NOTE"; payload: { id: string; updates: Partial<Note> } }
  | { type: "DELETE_NOTE"; payload: string }
  | { type: "SET_NOTES"; payload: Note[] };

interface NoteContextType {
  notes: Note[];
  addNote: (
    note: Omit<Note, "id" | "userId" | "createdAt" | "updatedAt">
  ) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  getNotesByCategory: (category: string) => Note[];
  getNotesByTag: (tag: string) => Note[];
  searchNotes: (query: string) => Note[];
}

const NoteContext = createContext<NoteContextType | null>(null);

function noteReducer(state: Note[], action: NoteAction): Note[] {
  switch (action.type) {
    case "SET_NOTES":
      return action.payload;
    case "ADD_NOTE": {
      const newNote: Note = {
        ...action.payload,
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return [...state, newNote];
    }
    case "UPDATE_NOTE":
      return state.map((note) =>
        note.id === action.payload.id
          ? { ...note, ...action.payload.updates, updatedAt: new Date() }
          : note
      );
    case "DELETE_NOTE":
      return state.filter((note) => note.id !== action.payload);
    default:
      return state;
  }
}

export function NoteProvider({ children }: { children: React.ReactNode }) {
  const [notes, dispatch] = useReducer(noteReducer, []);
  const { user, isAuthenticated } = useAuth();

  // Load notes from localStorage when user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      const savedNotes = storage.get<Note[]>(STORAGE_KEYS.NOTES, []);
      const userNotes = savedNotes.filter((note) => note.userId === user.id);
      const notesWithDates = userNotes.map((note) => ({
        ...note,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt),
      }));
      dispatch({ type: "SET_NOTES", payload: notesWithDates });
    } else {
      dispatch({ type: "SET_NOTES", payload: [] });
    }
  }, [isAuthenticated, user]);

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    if (isAuthenticated && user) {
      const allNotes = storage.get<Note[]>(STORAGE_KEYS.NOTES, []);
      const otherUserNotes = allNotes.filter((note) => note.userId !== user.id);
      const updatedNotes = [...otherUserNotes, ...notes];
      storage.set(STORAGE_KEYS.NOTES, updatedNotes);
    }
  }, [notes, isAuthenticated, user]);

  const addNote = (
    note: Omit<Note, "id" | "userId" | "createdAt" | "updatedAt">
  ) => {
    if (!user) return;
    const noteWithUserId = { ...note, userId: user.id };
    dispatch({ type: "ADD_NOTE", payload: noteWithUserId });
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    dispatch({ type: "UPDATE_NOTE", payload: { id, updates } });
  };

  const deleteNote = (id: string) => {
    dispatch({ type: "DELETE_NOTE", payload: id });
  };

  const getNotesByCategory = (category: string) => {
    return notes.filter((note) => note.category === category);
  };

  const getNotesByTag = (tag: string) => {
    return notes.filter((note) => note.tags.includes(tag));
  };

  const searchNotes = (query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(lowercaseQuery) ||
        note.content.toLowerCase().includes(lowercaseQuery) ||
        note.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery))
    );
  };

  const value: NoteContextType = {
    notes,
    addNote,
    updateNote,
    deleteNote,
    getNotesByCategory,
    getNotesByTag,
    searchNotes,
  };

  return <NoteContext.Provider value={value}>{children}</NoteContext.Provider>;
}

export function useNotes() {
  const context = useContext(NoteContext);
  if (!context) {
    throw new Error("useNotes must be used within a NoteProvider");
  }
  return context;
}
