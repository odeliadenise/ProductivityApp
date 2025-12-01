import { useState } from "react";
import { X, User, Bell, Eye, Save, Database } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import DataViewer from "./DataViewer";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<
    "profile" | "notifications" | "privacy" | "data"
  >("profile");
  const [showDataViewer, setShowDataViewer] = useState(false);
  const { user, updateUser } = useAuth();
  const { requestPermission, clearHistory } = useNotifications();
  const [notificationPermission, setNotificationPermission] = useState(
    typeof window !== "undefined" ? Notification.permission : "default"
  );

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    theme: user?.preferences?.theme || "light",
    notifications: user?.preferences?.notifications ?? true,
    emailNotifications: user?.preferences?.emailNotifications ?? true,
    defaultView: user?.preferences?.defaultView || "dashboard",
  });

  const tabs = [
    { key: "profile", label: "Profile", icon: User },
    { key: "notifications", label: "Notifications", icon: Bell },
    { key: "privacy", label: "Privacy", icon: Eye },
    { key: "data", label: "Data", icon: Database },
  ];

  const handleSave = (section: string) => {
    const updates: any = {};

    if (section === "profile") {
      updates.name = formData.name;
      updates.email = formData.email;
    } else if (section === "notifications") {
      updates.preferences = {
        ...user?.preferences,
        notifications: formData.notifications,
        emailNotifications: formData.emailNotifications,
      };
    }

    updateUser(updates);
    alert("Settings saved successfully!");
  };

  const exportData = () => {
    const allData = {
      users: JSON.parse(localStorage.getItem("users") || "[]"),
      tasks: JSON.parse(localStorage.getItem("tasks") || "[]"),
      notes: JSON.parse(localStorage.getItem("notes") || "[]"),
      events: JSON.parse(localStorage.getItem("events") || "[]"),
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
      confirm(
        "Are you sure you want to delete your account and all data? This cannot be undone."
      )
    ) {
      localStorage.clear();
      alert("Account deleted. You will be redirected to the login page.");
      window.location.reload();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-4xl h-full max-h-[80vh] flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-1/3 border-r flex-shrink-0">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Settings</h2>
            </div>
            <nav className="p-4">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                      activeTab === tab.key
                        ? "bg-blue-100 text-blue-600"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
              <h3 className="text-lg font-semibold capitalize">{activeTab}</h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your email"
                    />
                  </div>

                  <button
                    onClick={() => handleSave("profile")}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    {/* Browser Notifications */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium mb-3">
                        Browser Notifications
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              Permission Status
                            </p>
                            <p className="text-xs text-gray-500">
                              {notificationPermission === "granted" &&
                                "✅ Notifications enabled"}
                              {notificationPermission === "denied" &&
                                "❌ Notifications blocked"}
                              {notificationPermission === "default" &&
                                "⚪ Permission not requested"}
                            </p>
                          </div>
                          {notificationPermission !== "granted" && (
                            <button
                              onClick={async () => {
                                const granted = await requestPermission();
                                setNotificationPermission(
                                  granted ? "granted" : "denied"
                                );
                              }}
                              className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                              Enable Notifications
                            </button>
                          )}
                        </div>

                        {notificationPermission === "granted" && (
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                Clear Notification History
                              </p>
                              <p className="text-xs text-gray-500">
                                Reset which notifications have been shown
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                clearHistory();
                                alert("Notification history cleared!");
                              }}
                              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                              Clear History
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* App Notifications */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">App Notifications</h4>
                        <p className="text-sm text-gray-600">
                          Show notifications in the app's notification panel
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={formData.notifications}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              notifications: e.target.checked,
                            })
                          }
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Email Notifications</h4>
                        <p className="text-sm text-gray-600">
                          Receive email updates about your tasks (currently
                          disabled)
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer opacity-50">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={false}
                          disabled
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSave("notifications")}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Save className="w-4 h-4" />
                    Save Preferences
                  </button>
                </div>
              )}

              {activeTab === "privacy" && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-2">Data Management</h4>
                      <div className="space-y-3">
                        <button
                          onClick={exportData}
                          className="w-full text-left px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          Export My Data
                        </button>
                        <button
                          onClick={clearAllData}
                          className="w-full text-left px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                        >
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "data" && (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-4">Data Storage</h4>
                    <p className="text-sm text-gray-600 mb-6">
                      Your data is stored locally in your browser. You can view,
                      export, or clear your data below.
                    </p>

                    <div className="grid gap-3 mb-6">
                      <button
                        onClick={() => setShowDataViewer(true)}
                        className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-medium">View Stored Data</span>
                        <Database className="w-5 h-5 text-gray-500" />
                      </button>

                      <button
                        onClick={exportData}
                        className="w-full px-4 py-3 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                      >
                        Export All Data (JSON)
                      </button>

                      <button
                        onClick={clearAllData}
                        className="w-full px-4 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
                      >
                        Clear All Data (Destructive)
                      </button>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 overflow-hidden">
                    <h5 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <Database className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0" />
                      Storage Information
                    </h5>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <p className="text-sm text-gray-700 leading-relaxed flex-1 break-words">
                          Data is stored locally in your browser's localStorage
                        </p>
                      </div>
                      <div className="flex items-start">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <p className="text-sm text-gray-700 leading-relaxed flex-1 break-words">
                          No data is sent to external servers
                        </p>
                      </div>
                      <div className="flex items-start">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <p className="text-sm text-gray-700 leading-relaxed flex-1 break-words">
                          Clearing browser data will remove all information
                        </p>
                      </div>
                      <div className="flex items-start">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <p className="text-sm text-gray-700 leading-relaxed flex-1 break-words">
                          Export your data regularly as backup
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showDataViewer && (
        <DataViewer onClose={() => setShowDataViewer(false)} />
      )}
    </>
  );
}
