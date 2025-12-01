import React, { useState, useEffect, useRef } from "react";
import { Bell, Calendar, CheckSquare, Clock, X } from "lucide-react";
import { useCalendar } from "../context/CalendarContext";
import { useTasks } from "../context/TaskContext";
import { formatDistanceToNow, isAfter, isBefore, addMinutes } from "date-fns";

interface Notification {
  id: string;
  type: "event" | "task";
  title: string;
  message: string;
  time: Date;
  read: boolean;
  itemId: string;
}

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
}) => {
  const { events } = useCalendar();
  const { tasks } = useTasks();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Generate notifications based on events and tasks
  useEffect(() => {
    const now = new Date();
    const upcomingNotifications: Notification[] = [];

    // Event notifications
    events.forEach((event) => {
      if (event.notifications?.enabled && event.notifications.reminderTime) {
        const reminderTime = new Date(
          event.startDate.getTime() - event.notifications.reminderTime * 60000
        );

        if (
          isAfter(reminderTime, now) &&
          isBefore(reminderTime, addMinutes(now, 1440))
        ) {
          upcomingNotifications.push({
            id: `event-${event.id}`,
            type: "event",
            title: event.title,
            message: `Event starting ${formatDistanceToNow(event.startDate, {
              addSuffix: true,
            })}`,
            time: reminderTime,
            read: false,
            itemId: event.id,
          });
        }
      }
    });

    // Task due date notifications
    tasks.forEach((task) => {
      if (task.dueDate && !task.completed) {
        const now = new Date();
        const dueDate = new Date(task.dueDate);
        const timeDiff = dueDate.getTime() - now.getTime();
        const hoursUntilDue = timeDiff / (1000 * 60 * 60);

        // Notify if task is due within 24 hours
        if (hoursUntilDue > 0 && hoursUntilDue <= 24) {
          upcomingNotifications.push({
            id: `task-${task.id}`,
            type: "task",
            title: task.title,
            message: `Task due ${formatDistanceToNow(dueDate, {
              addSuffix: true,
            })}`,
            time: dueDate,
            read: false,
            itemId: task.id,
          });
        }
      }
    });

    // Sort by time
    upcomingNotifications.sort((a, b) => a.time.getTime() - b.time.getTime());

    setNotifications(upcomingNotifications);
  }, [events, tasks]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onClose]);

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Notifications</h3>
        <div className="flex items-center space-x-2">
          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Clear all
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-6 text-center">
            <Bell className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No new notifications</p>
          </div>
        ) : (
          <div className="space-y-1">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                  !notification.read ? "bg-blue-50" : ""
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {notification.type === "event" ? (
                      <Calendar className="w-4 h-4 text-blue-500" />
                    ) : (
                      <CheckSquare className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {notification.message}
                    </p>
                    <div className="flex items-center space-x-1 mt-2">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(notification.time, {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                  {!notification.read && (
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;
