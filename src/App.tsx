import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { TaskProvider } from "./context/TaskContext";
import { NoteProvider } from "./context/NoteContext";
import { CalendarProvider } from "./context/CalendarContext";
import { NotificationProvider } from "./context/NotificationContext";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import TasksPage from "./pages/TasksPage";
import NotesPage from "./pages/NotesPage";
import CalendarPage from "./pages/CalendarPage";
import LoginPage from "./components/LoginPage";
import QuickAdd from "./components/QuickAdd";

type View = "dashboard" | "tasks" | "notes" | "calendar";

function AppContent() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Apply theme based on user preferences
  useEffect(() => {
    const theme = user?.preferences?.theme || "light";
    setIsDarkMode(theme === "dark");

    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [user?.preferences?.theme]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div
        className={`h-screen flex items-center justify-center ${
          isDarkMode ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case "dashboard":
        return <Dashboard />;
      case "tasks":
        return <TasksPage />;
      case "notes":
        return <NotesPage />;
      case "calendar":
        return <CalendarPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <TaskProvider>
      <NoteProvider>
        <CalendarProvider>
          <NotificationProvider>
            <div
              className={`h-screen flex ${
                isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50"
              }`}
            >
              <Sidebar
                currentView={currentView}
                onViewChange={setCurrentView}
                onQuickAdd={() => setIsQuickAddOpen(true)}
              />
              <div className="flex-1 flex flex-col">
                <Header />
                <main className="flex-1 p-6 overflow-auto">
                  {renderCurrentView()}
                </main>
              </div>
            </div>

            {/* Quick Add Modal */}
            <QuickAdd
              isOpen={isQuickAddOpen}
              onClose={() => setIsQuickAddOpen(false)}
            />
          </NotificationProvider>
        </CalendarProvider>
      </NoteProvider>
    </TaskProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
