import React from "react";
import {
  LayoutDashboard,
  CheckSquare,
  StickyNote,
  Calendar,
  Zap,
} from "lucide-react";
import { clsx } from "clsx";

type View = "dashboard" | "tasks" | "notes" | "calendar";

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
  onQuickAdd: () => void;
}

const navigationItems = [
  {
    id: "dashboard" as const,
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "tasks" as const,
    label: "Tasks",
    icon: CheckSquare,
  },
  {
    id: "notes" as const,
    label: "Notes",
    icon: StickyNote,
  },
  {
    id: "calendar" as const,
    label: "Calendar",
    icon: Calendar,
  },
];

const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  onQuickAdd,
}) => {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={clsx(
                "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors",
                isActive
                  ? "bg-primary-100 text-primary-700 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Quick Actions */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <button
          onClick={onQuickAdd}
          className="w-full flex items-center space-x-3 px-3 py-3 text-left bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <div className="bg-white bg-opacity-20 p-1 rounded">
            <Zap className="w-4 h-4" />
          </div>
          <span className="font-medium">Quick Add</span>
        </button>

        <div className="text-xs text-gray-500 px-3">
          <p>
            Press <kbd className="bg-gray-100 px-1 rounded text-xs">Ctrl+K</kbd>{" "}
            for quick add
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
