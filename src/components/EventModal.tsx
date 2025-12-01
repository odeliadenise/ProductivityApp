import React, { useState, useEffect } from "react";
import {
  X,
  Calendar,
  Clock,
  FileText,
  Folder,
  Bell,
  BellOff,
} from "lucide-react";
import { useCalendar } from "../context/CalendarContext";
import { CalendarEvent } from "../types";
import { format } from "date-fns";

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: CalendarEvent;
  selectedDate?: Date | null;
}

const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  event,
  selectedDate,
}) => {
  const { addEvent, updateEvent, events } = useCalendar();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    allDay: false,
    category: "",
    notificationEnabled: false,
    reminderTime: 15,
    notificationType: "browser" as "browser" | "email",
  });

  const isEditing = Boolean(event);

  // Get existing categories for suggestions
  const existingCategories = Array.from(
    new Set(events.map((e) => e.category).filter(Boolean))
  );

  useEffect(() => {
    if (event) {
      const startDate = new Date(event.startDate);
      const endDate = new Date(event.endDate);

      setFormData({
        title: event.title,
        description: event.description || "",
        startDate: format(startDate, "yyyy-MM-dd"),
        startTime: event.allDay ? "" : format(startDate, "HH:mm"),
        endDate: format(endDate, "yyyy-MM-dd"),
        endTime: event.allDay ? "" : format(endDate, "HH:mm"),
        allDay: event.allDay,
        category: event.category || "",
        notificationEnabled: event.notifications?.enabled || false,
        reminderTime: event.notifications?.reminderTime || 15,
        notificationType: event.notifications?.type || "browser",
      });
    } else {
      const defaultDate = selectedDate || new Date();
      const dateStr = format(defaultDate, "yyyy-MM-dd");

      setFormData({
        title: "",
        description: "",
        startDate: dateStr,
        startTime: "09:00",
        endDate: dateStr,
        endTime: "10:00",
        allDay: false,
        category: "",
        notificationEnabled: false,
        reminderTime: 15,
        notificationType: "browser",
      });
    }
  }, [event, selectedDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.startDate) return;

    let startDateTime: Date;
    let endDateTime: Date;

    if (formData.allDay) {
      startDateTime = new Date(formData.startDate);
      endDateTime = new Date(formData.endDate || formData.startDate);
      // Set to start and end of day for all-day events
      startDateTime.setHours(0, 0, 0, 0);
      endDateTime.setHours(23, 59, 59, 999);
    } else {
      startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      endDateTime = new Date(
        `${formData.endDate || formData.startDate}T${formData.endTime}`
      );
    }

    const eventData = {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      startDate: startDateTime,
      endDate: endDateTime,
      allDay: formData.allDay,
      category: formData.category.trim() || undefined,
      notifications: formData.notificationEnabled
        ? {
            enabled: true,
            reminderTime: formData.reminderTime,
            type: formData.notificationType,
          }
        : { enabled: false },
    };

    if (isEditing && event) {
      updateEvent(event.id, eventData);
    } else {
      addEvent(eventData);
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditing ? "Edit Event" : "Add New Event"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]"
        >
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Title *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="input"
              placeholder="Enter event title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                placeholder="Enter event description"
                rows={3}
              />
            </div>
          </div>

          {/* All Day Toggle */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="allDay"
              checked={formData.allDay}
              onChange={(e) =>
                setFormData({ ...formData, allDay: e.target.checked })
              }
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <label
              htmlFor="allDay"
              className="text-sm font-medium text-gray-700"
            >
              All Day Event
            </label>
          </div>

          {/* Start Date/Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="startDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Start Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="date"
                  id="startDate"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {!formData.allDay && (
              <div>
                <label
                  htmlFor="startTime"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Start Time
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="time"
                    id="startTime"
                    value={formData.startTime}
                    onChange={(e) =>
                      setFormData({ ...formData, startTime: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>

          {/* End Date/Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="endDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                End Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="date"
                  id="endDate"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {!formData.allDay && (
              <div>
                <label
                  htmlFor="endTime"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  End Time
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="time"
                    id="endTime"
                    value={formData.endTime}
                    onChange={(e) =>
                      setFormData({ ...formData, endTime: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Category
            </label>
            <div className="relative">
              <Folder className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                id="category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter category (optional)"
                list="eventCategories"
              />
              {existingCategories.length > 0 && (
                <datalist id="eventCategories">
                  {existingCategories.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              )}
            </div>
          </div>

          {/* Notification Settings */}
          <div className="space-y-4 border-t border-gray-200 pt-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="notificationEnabled"
                checked={formData.notificationEnabled}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    notificationEnabled: e.target.checked,
                  })
                }
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <div className="flex items-center space-x-2">
                {formData.notificationEnabled ? (
                  <Bell className="w-4 h-4 text-primary-600" />
                ) : (
                  <BellOff className="w-4 h-4 text-gray-400" />
                )}
                <label
                  htmlFor="notificationEnabled"
                  className="text-sm font-medium text-gray-700"
                >
                  Enable Event Notifications
                </label>
              </div>
            </div>

            {formData.notificationEnabled && (
              <>
                <div>
                  <label
                    htmlFor="reminderTime"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Remind me
                  </label>
                  <select
                    id="reminderTime"
                    value={formData.reminderTime}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        reminderTime: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value={5}>5 minutes before</option>
                    <option value={15}>15 minutes before</option>
                    <option value={30}>30 minutes before</option>
                    <option value={60}>1 hour before</option>
                    <option value={120}>2 hours before</option>
                    <option value={1440}>1 day before</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="notificationType"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Notification Type
                  </label>
                  <select
                    id="notificationType"
                    value={formData.notificationType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        notificationType: e.target.value as "browser" | "email",
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="browser">Browser Notification</option>
                    <option value="email">Email Notification</option>
                  </select>
                </div>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {isEditing ? "Update Event" : "Add Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;
