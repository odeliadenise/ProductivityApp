import React, { useState } from "react";
import { Check, Edit2, Trash2, Clock, Flag } from "lucide-react";
import { useTasks } from "../context/TaskContext";
import { Task } from "../types";
import { formatDate } from "../utils/date";
import { clsx } from "clsx";
import TaskModal from "./TaskModal";

interface TaskListProps {
  tasks: Task[];
}

const TaskList: React.FC<TaskListProps> = ({ tasks }) => {
  const { toggleTask, deleteTask } = useTasks();
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleToggleTask = (taskId: string) => {
    toggleTask(taskId);
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTask(taskId);
    }
  };

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "low":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <Check className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No tasks found
        </h3>
        <p className="text-gray-500">Create your first task to get started!</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={clsx(
              "flex items-center space-x-4 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow",
              task.completed && "opacity-75"
            )}
          >
            {/* Checkbox */}
            <button
              onClick={() => handleToggleTask(task.id)}
              className={clsx(
                "flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                task.completed
                  ? "bg-primary-600 border-primary-600 text-white"
                  : "border-gray-300 hover:border-primary-500"
              )}
            >
              {task.completed && <Check className="w-3 h-3" />}
            </button>

            {/* Task Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3
                  className={clsx(
                    "font-medium",
                    task.completed
                      ? "line-through text-gray-500"
                      : "text-gray-900"
                  )}
                >
                  {task.title}
                </h3>
                <span
                  className={clsx(
                    "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                    getPriorityColor(task.priority)
                  )}
                >
                  <Flag className="w-3 h-3 mr-1" />
                  {task.priority}
                </span>
              </div>

              {task.description && (
                <p
                  className={clsx(
                    "text-sm mb-2",
                    task.completed ? "text-gray-400" : "text-gray-600"
                  )}
                >
                  {task.description}
                </p>
              )}

              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>Created {formatDate(task.createdAt)}</span>
                {task.dueDate && (
                  <span className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>Due {formatDate(task.dueDate)}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setEditingTask(task)}
                className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                title="Edit task"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteTask(task.id)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Task Modal */}
      {editingTask && (
        <TaskModal
          isOpen={true}
          onClose={() => setEditingTask(null)}
          task={editingTask}
        />
      )}
    </>
  );
};

export default TaskList;
