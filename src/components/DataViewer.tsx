import { useState, useEffect } from "react";
import {
  X,
  User,
  CheckSquare,
  FileText,
  Calendar,
  Download,
  Trash2,
} from "lucide-react";

interface DataViewerProps {
  onClose: () => void;
}

export default function DataViewer({ onClose }: DataViewerProps) {
  const [activeTab, setActiveTab] = useState<
    "users" | "tasks" | "notes" | "events"
  >("users");
  const [data, setData] = useState<any>({
    users: [],
    tasks: [],
    notes: [],
    events: [],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
    const notes = JSON.parse(localStorage.getItem("notes") || "[]");
    const events = JSON.parse(localStorage.getItem("events") || "[]");

    setData({ users, tasks, notes, events });
  };

  const exportData = () => {
    const allData = {
      users: data.users,
      tasks: data.tasks,
      notes: data.notes,
      events: data.events,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(allData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `productivity-app-data-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearAllData = () => {
    if (
      confirm("Are you sure you want to clear all data? This cannot be undone.")
    ) {
      localStorage.removeItem("users");
      localStorage.removeItem("tasks");
      localStorage.removeItem("notes");
      localStorage.removeItem("events");
      localStorage.removeItem("currentUser");
      setData({ users: [], tasks: [], notes: [], events: [] });
      alert("All data has been cleared.");
    }
  };

  const tabs = [
    { key: "users", label: "Users", icon: User, count: data.users.length },
    {
      key: "tasks",
      label: "Tasks",
      icon: CheckSquare,
      count: data.tasks.length,
    },
    { key: "notes", label: "Notes", icon: FileText, count: data.notes.length },
    {
      key: "events",
      label: "Events",
      icon: Calendar,
      count: data.events.length,
    },
  ];

  const renderUserData = () => (
    <div className="space-y-4">
      {data.users.map((user: any) => (
        <div key={user.id} className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg">{user.name}</h3>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-sm text-gray-500">ID: {user.id}</p>
            </div>
            <div className="text-right text-sm text-gray-500">
              <p>Theme: {user.preferences?.theme || "light"}</p>
              <p>
                Notifications: {user.preferences?.notifications ? "On" : "Off"}
              </p>
              <p>
                Default View: {user.preferences?.defaultView || "dashboard"}
              </p>
            </div>
          </div>
        </div>
      ))}
      {data.users.length === 0 && (
        <p className="text-gray-500 text-center py-8">No users found</p>
      )}
    </div>
  );

  const renderTaskData = () => (
    <div className="space-y-4">
      {data.tasks.map((task: any) => (
        <div key={task.id} className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-semibold">{task.title}</h3>
              {task.description && (
                <p className="text-gray-600 mt-1">{task.description}</p>
              )}
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span
                  className={`px-2 py-1 rounded ${
                    task.priority === "high"
                      ? "bg-red-100 text-red-800"
                      : task.priority === "medium"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {task.priority} priority
                </span>
                <span
                  className={`px-2 py-1 rounded ${
                    task.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : task.status === "in-progress"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {task.status}
                </span>
                {task.dueDate && (
                  <span>
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right text-sm text-gray-500">
              <p>User ID: {task.userId}</p>
              <p>Created: {new Date(task.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      ))}
      {data.tasks.length === 0 && (
        <p className="text-gray-500 text-center py-8">No tasks found</p>
      )}
    </div>
  );

  const renderNoteData = () => (
    <div className="space-y-4">
      {data.notes.map((note: any) => (
        <div key={note.id} className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-semibold">{note.title}</h3>
              <p className="text-gray-600 mt-1 line-clamp-3">{note.content}</p>
              {note.category && (
                <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                  {note.category}
                </span>
              )}
            </div>
            <div className="text-right text-sm text-gray-500">
              <p>User ID: {note.userId}</p>
              <p>Created: {new Date(note.createdAt).toLocaleDateString()}</p>
              <p>Updated: {new Date(note.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      ))}
      {data.notes.length === 0 && (
        <p className="text-gray-500 text-center py-8">No notes found</p>
      )}
    </div>
  );

  const renderEventData = () => (
    <div className="space-y-4">
      {data.events.map((event: any) => (
        <div key={event.id} className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-semibold">{event.title}</h3>
              {event.description && (
                <p className="text-gray-600 mt-1">{event.description}</p>
              )}
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span>Date: {new Date(event.date).toLocaleDateString()}</span>
                {event.time && <span>Time: {event.time}</span>}
                {event.location && <span>Location: {event.location}</span>}
              </div>
            </div>
            <div className="text-right text-sm text-gray-500">
              <p>User ID: {event.userId}</p>
              <p>Created: {new Date(event.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      ))}
      {data.events.length === 0 && (
        <p className="text-gray-500 text-center py-8">No events found</p>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl h-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold">Data Viewer</h2>
            <p className="text-gray-600">
              View and manage stored application data
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={exportData}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Download className="w-4 h-4" />
              Export Data
            </button>
            <button
              onClick={clearAllData}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4" />
              Clear All Data
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "border-blue-600 bg-blue-50 text-blue-600"
                    : "border-transparent hover:bg-gray-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {activeTab === "users" && renderUserData()}
          {activeTab === "tasks" && renderTaskData()}
          {activeTab === "notes" && renderNoteData()}
          {activeTab === "events" && renderEventData()}
        </div>
      </div>
    </div>
  );
}
