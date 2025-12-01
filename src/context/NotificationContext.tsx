import React, { createContext, useContext, useEffect, useRef } from "react";
import { useCalendar } from "./CalendarContext";
import { useTasks } from "./TaskContext";
import { useAuth } from "./AuthContext";
import NotificationService from "../services/NotificationService";

interface NotificationContextType {
  requestPermission: () => Promise<boolean>;
  clearHistory: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { events } = useCalendar();
  const { tasks } = useTasks();
  const { isAuthenticated, user } = useAuth();
  const notificationService = useRef(NotificationService.getInstance());
  const permissionRequested = useRef(false);

  // Request permission on first load (only once per session)
  useEffect(() => {
    if (isAuthenticated && user && !permissionRequested.current) {
      permissionRequested.current = true;

      // Request permission after a brief delay to avoid blocking the UI
      setTimeout(async () => {
        const granted = await notificationService.current.requestPermission();
        if (granted) {
          console.log("Notification permission granted");
        } else {
          console.log("Notification permission denied");
        }
      }, 2000);
    }
  }, [isAuthenticated, user]);

  // Start/stop monitoring based on authentication and data
  useEffect(() => {
    if (isAuthenticated && user && events.length >= 0 && tasks.length >= 0) {
      // Start monitoring notifications
      notificationService.current.startMonitoring(events, tasks);

      // Cleanup on unmount
      return () => {
        notificationService.current.stopMonitoring();
      };
    } else {
      notificationService.current.stopMonitoring();
    }
  }, [isAuthenticated, user, events, tasks]);

  const requestPermission = async (): Promise<boolean> => {
    return notificationService.current.requestPermission();
  };

  const clearHistory = (): void => {
    notificationService.current.clearNotificationHistory();
  };

  const value: NotificationContextType = {
    requestPermission,
    clearHistory,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
}
