import React, { createContext, useContext, useReducer, useEffect } from "react";
import { Task } from "../types";
import { storage, STORAGE_KEYS } from "../utils/storage";
import { generateId } from "../utils/id";
import { useAuth } from "./AuthContext";

type TaskAction =
  | { type: "ADD_TASK"; payload: Omit<Task, "id" | "createdAt" | "updatedAt"> }
  | { type: "UPDATE_TASK"; payload: { id: string; updates: Partial<Task> } }
  | { type: "DELETE_TASK"; payload: string }
  | { type: "TOGGLE_TASK"; payload: string }
  | { type: "SET_TASKS"; payload: Task[] };

interface TaskContextType {
  tasks: Task[];
  addTask: (
    task: Omit<Task, "id" | "userId" | "createdAt" | "updatedAt">
  ) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  getTasksByPriority: (priority: Task["priority"]) => Task[];
  getPendingTasks: () => Task[];
  getCompletedTasks: () => Task[];
}

const TaskContext = createContext<TaskContextType | null>(null);

function taskReducer(state: Task[], action: TaskAction): Task[] {
  switch (action.type) {
    case "SET_TASKS":
      return action.payload;
    case "ADD_TASK": {
      const newTask: Task = {
        ...action.payload,
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return [...state, newTask];
    }
    case "UPDATE_TASK":
      return state.map((task) =>
        task.id === action.payload.id
          ? { ...task, ...action.payload.updates, updatedAt: new Date() }
          : task
      );
    case "DELETE_TASK":
      return state.filter((task) => task.id !== action.payload);
    case "TOGGLE_TASK":
      return state.map((task) =>
        task.id === action.payload
          ? { ...task, completed: !task.completed, updatedAt: new Date() }
          : task
      );
    default:
      return state;
  }
}

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, dispatch] = useReducer(taskReducer, []);
  const { user, isAuthenticated } = useAuth();

  // Load tasks from localStorage when user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      const savedTasks = storage.get<Task[]>(STORAGE_KEYS.TASKS, []);
      const userTasks = savedTasks.filter((task) => task.userId === user.id);
      const tasksWithDates = userTasks.map((task) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
      }));
      dispatch({ type: "SET_TASKS", payload: tasksWithDates });
    } else {
      dispatch({ type: "SET_TASKS", payload: [] });
    }
  }, [isAuthenticated, user]);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    if (isAuthenticated && user) {
      const allTasks = storage.get<Task[]>(STORAGE_KEYS.TASKS, []);
      const otherUserTasks = allTasks.filter((task) => task.userId !== user.id);
      const updatedTasks = [...otherUserTasks, ...tasks];
      storage.set(STORAGE_KEYS.TASKS, updatedTasks);
    }
  }, [tasks, isAuthenticated, user]);

  const addTask = (
    task: Omit<Task, "id" | "userId" | "createdAt" | "updatedAt">
  ) => {
    if (!user) return;
    const taskWithUserId = { ...task, userId: user.id };
    dispatch({ type: "ADD_TASK", payload: taskWithUserId });
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    dispatch({ type: "UPDATE_TASK", payload: { id, updates } });
  };

  const deleteTask = (id: string) => {
    dispatch({ type: "DELETE_TASK", payload: id });
  };

  const toggleTask = (id: string) => {
    dispatch({ type: "TOGGLE_TASK", payload: id });
  };

  const getTasksByPriority = (priority: Task["priority"]) => {
    return tasks.filter((task) => task.priority === priority);
  };

  const getPendingTasks = () => {
    return tasks.filter((task) => !task.completed);
  };

  const getCompletedTasks = () => {
    return tasks.filter((task) => task.completed);
  };

  const value: TaskContextType = {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    getTasksByPriority,
    getPendingTasks,
    getCompletedTasks,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTasks must be used within a TaskProvider");
  }
  return context;
}
