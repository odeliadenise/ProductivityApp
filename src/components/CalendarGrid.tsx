import React from "react";
import {
  format,
  isSameMonth,
  isSameDay,
  isToday,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
} from "date-fns";
import { CalendarEvent } from "../types";
import { clsx } from "clsx";

interface CalendarGridProps {
  currentDate: Date;
  events: CalendarEvent[];
  onDateSelect: (date: Date) => void;
  onEventEdit?: (event: CalendarEvent) => void;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  currentDate,
  events,
  onDateSelect,
  onEventEdit,
}) => {
  const monthStart = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  const monthEnd = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.startDate);
      return isSameDay(eventDate, date);
    });
  };

  return (
    <div className="bg-white">
      {/* Week day headers */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {weekDays.map((day) => (
          <div key={day} className="px-4 py-3 text-center">
            <span className="text-sm font-medium text-gray-700">{day}</span>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {days.map((day, index) => {
          const dayEvents = getEventsForDate(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isDayToday = isToday(day);

          return (
            <div
              key={index}
              className={clsx(
                "min-h-[120px] border-r border-b border-gray-200 p-2 cursor-pointer hover:bg-gray-50 transition-colors",
                !isCurrentMonth && "bg-gray-50 text-gray-400"
              )}
              onClick={() => onDateSelect(day)}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={clsx(
                    "text-sm font-medium",
                    isDayToday &&
                      "bg-primary-600 text-white w-6 h-6 rounded-full flex items-center justify-center"
                  )}
                >
                  {format(day, "d")}
                </span>
              </div>

              {/* Events */}
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    className={clsx(
                      "text-xs p-1 rounded truncate cursor-pointer hover:opacity-80 transition-opacity",
                      event.allDay
                        ? "bg-primary-100 text-primary-800"
                        : "bg-green-100 text-green-800"
                    )}
                    title={event.title}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventEdit?.(event);
                    }}
                  >
                    {event.title}
                  </div>
                ))}

                {dayEvents.length > 3 && (
                  <div className="text-xs text-gray-500 font-medium">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarGrid;
