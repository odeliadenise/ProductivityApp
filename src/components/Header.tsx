import React, { useState } from "react";
import { Bell, Search, Settings, User, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCalendar } from "../context/CalendarContext";
import { useTasks } from "../context/TaskContext";
import SettingsModal from "./SettingsModal";
import NotificationDropdown from "./NotificationDropdown";
import { isAfter, isBefore, addMinutes } from "date-fns";

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { events } = useCalendar();
  const { tasks } = useTasks();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      logout();
    }
  };

  // Count unread notifications
  const getNotificationCount = () => {
    const now = new Date();
    let count = 0;

    // Count upcoming events with notifications
    events.forEach((event) => {
      if (event.notifications?.enabled && event.notifications.reminderTime) {
        const reminderTime = new Date(
          event.startDate.getTime() - event.notifications.reminderTime * 60000
        );
        if (
          isAfter(reminderTime, now) &&
          isBefore(reminderTime, addMinutes(now, 1440))
        ) {
          count++;
        }
      }
    });

    // Count overdue tasks
    tasks.forEach((task) => {
      if (task.dueDate && !task.completed) {
        const dueDate = new Date(task.dueDate);
        const timeDiff = dueDate.getTime() - now.getTime();
        const hoursUntilDue = timeDiff / (1000 * 60 * 60);
        if (hoursUntilDue > 0 && hoursUntilDue <= 24) {
          count++;
        }
      }
    });

    return count;
  };

  const notificationCount = getNotificationCount();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">Productivity App</h1>
          {user && (
            <span className="text-sm text-gray-500">
              Welcome back,{" "}
              <span className="font-medium text-gray-700">{user.name}</span>
            </span>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent w-64"
            />
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5" />
              {notificationCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>

            <NotificationDropdown
              isOpen={isNotificationOpen}
              onClose={() => setIsNotificationOpen(false)}
            />
          </div>

          {/* Settings */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* User Profile */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <User className="w-5 h-5" />
              <div className="text-left hidden sm:block">
                <div className="font-medium text-sm">{user?.name}</div>
                <div className="text-xs text-gray-500">{user?.email}</div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </header>
  );
};

export default Header;
