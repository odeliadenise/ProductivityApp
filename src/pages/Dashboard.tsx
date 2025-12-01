import React from "react";
import {
  CheckSquare,
  StickyNote,
  Calendar,
  Clock,
  TrendingUp,
} from "lucide-react";
import { useTasks } from "../context/TaskContext";
import { useNotes } from "../context/NoteContext";
import { useCalendar } from "../context/CalendarContext";
import { formatDate } from "../utils/date";

const Dashboard: React.FC = () => {
  const { tasks, getPendingTasks } = useTasks();
  const { notes } = useNotes();
  const { getUpcomingEvents } = useCalendar();

  const pendingTasks = getPendingTasks();
  const upcomingEvents = getUpcomingEvents();
  const recentNotes = notes.slice(-5).reverse();

  const stats = [
    {
      title: "Total Tasks",
      value: tasks.length,
      icon: CheckSquare,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Pending Tasks",
      value: pendingTasks.length,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Total Notes",
      value: notes.length,
      icon: StickyNote,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Upcoming Events",
      value: upcomingEvents.length,
      icon: Calendar,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Welcome back! Here's what's happening today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Tasks
            </h2>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {pendingTasks.slice(0, 5).map((task) => (
              <div
                key={task.id}
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  readOnly
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{task.title}</p>
                  {task.dueDate && (
                    <p className="text-sm text-gray-500">
                      Due {formatDate(task.dueDate)}
                    </p>
                  )}
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    task.priority === "high"
                      ? "bg-red-100 text-red-800"
                      : task.priority === "medium"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {task.priority}
                </span>
              </div>
            ))}
            {pendingTasks.length === 0 && (
              <p className="text-gray-500 text-center py-4">No pending tasks</p>
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Upcoming Events
            </h2>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">{event.title}</p>
                <p className="text-sm text-gray-500">
                  {formatDate(event.startDate)}
                </p>
                {event.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {event.description}
                  </p>
                )}
              </div>
            ))}
            {upcomingEvents.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                No upcoming events
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Notes */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Notes</h2>
          <StickyNote className="w-5 h-5 text-gray-400" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentNotes.map((note) => (
            <div key={note.id} className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">{note.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-3">
                {note.content.substring(0, 100)}...
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {note.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs bg-primary-100 text-primary-800 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
          {recentNotes.length === 0 && (
            <div className="col-span-full">
              <p className="text-gray-500 text-center py-4">No notes yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
