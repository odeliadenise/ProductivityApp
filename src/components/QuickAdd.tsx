import { useState } from "react";
import { Plus, CheckSquare, StickyNote, Calendar, Send, X } from "lucide-react";
import { useTasks } from "../context/TaskContext";
import { useNotes } from "../context/NoteContext";
import { useCalendar } from "../context/CalendarContext";

interface QuickAddProps {
  isOpen: boolean;
  onClose: () => void;
}

type QuickAddType = "task" | "note" | "event";

const QuickAdd: React.FC<QuickAddProps> = ({ isOpen, onClose }) => {
  const { addTask } = useTasks();
  const { addNote } = useNotes();
  const { addEvent } = useCalendar();

  const [activeType, setActiveType] = useState<QuickAddType>("task");
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsSubmitting(true);

    try {
      switch (activeType) {
        case "task":
          await addTask({
            title: input.trim(),
            description: "",
            completed: false,
            priority: "medium",
          });
          break;

        case "note":
          await addNote({
            title: input.trim().split("\n")[0] || "Quick Note",
            content: input.trim(),
            category: "Quick Notes",
            tags: ["quick"],
          });
          break;

        case "event":
          const today = new Date();
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);

          await addEvent({
            title: input.trim(),
            description: "",
            startDate: today,
            endDate: tomorrow,
            allDay: true,
            category: "Quick Events",
          });
          break;
      }

      setInput("");
      onClose();
    } catch (error) {
      console.error("Error creating item:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickAddTypes = [
    {
      type: "task" as const,
      label: "Task",
      icon: CheckSquare,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      placeholder: "What needs to be done?",
    },
    {
      type: "note" as const,
      label: "Note",
      icon: StickyNote,
      color: "text-green-600",
      bgColor: "bg-green-100",
      placeholder: "Capture your thoughts...",
    },
    {
      type: "event" as const,
      label: "Event",
      icon: Calendar,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      placeholder: "What's happening?",
    },
  ];

  if (!isOpen) return null;

  const activeTypeData = quickAddTypes.find((t) => t.type === activeType);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Plus className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Quick Add</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Type Selector */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex space-x-2">
            {quickAddTypes.map((type) => {
              const Icon = type.icon;
              const isActive = activeType === type.type;

              return (
                <button
                  key={type.type}
                  onClick={() => setActiveType(type.type)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                    isActive
                      ? `${type.bgColor} ${type.color} font-medium`
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            <div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={activeTypeData?.placeholder}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                rows={activeType === "note" ? 4 : 2}
                autoFocus
              />
            </div>

            <div className="flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!input.trim() || isSubmitting}
                className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>
                  {isSubmitting
                    ? "Creating..."
                    : `Add ${activeTypeData?.label}`}
                </span>
              </button>
            </div>
          </div>
        </form>

        {/* Shortcuts Hint */}
        <div className="px-4 pb-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-600">
              <span className="font-medium">Tip:</span> Use this for quick
              capture. You can edit details later from the respective sections.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickAdd;
