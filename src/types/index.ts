export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  category?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CalendarEvent {
  id: string;
  userId: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  allDay: boolean;
  category?: string;
  notifications?: {
    enabled: boolean;
    reminderTime?: number; // minutes before event
    type?: "browser" | "email";
  };
  createdAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  preferences: {
    theme: "light" | "dark";
    defaultView: "dashboard" | "tasks" | "notes" | "calendar";
  };
}
