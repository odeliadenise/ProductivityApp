import React, { useState } from "react";
import { Edit2, Trash2, Tag, Calendar } from "lucide-react";
import { useNotes } from "../context/NoteContext";
import { Note } from "../types";
import { formatDate } from "../utils/date";
import NoteModal from "./NoteModal";

interface NoteListProps {
  notes: Note[];
}

const NoteList: React.FC<NoteListProps> = ({ notes }) => {
  const { deleteNote } = useNotes();
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const handleDeleteNote = (noteId: string) => {
    if (confirm("Are you sure you want to delete this note?")) {
      deleteNote(noteId);
    }
  };

  if (notes.length === 0) {
    return (
      <div className="text-center py-12">
        <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No notes found
        </h3>
        <p className="text-gray-500">Create your first note to get started!</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes.map((note) => (
          <div
            key={note.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            {/* Note Header */}
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1">
                {note.title}
              </h3>
              <div className="flex items-center space-x-1 ml-2">
                <button
                  onClick={() => setEditingNote(note)}
                  className="p-1 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                  title="Edit note"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteNote(note.id)}
                  className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Delete note"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Category */}
            {note.category && (
              <div className="mb-3">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                  {note.category}
                </span>
              </div>
            )}

            {/* Note Content */}
            <div className="mb-4">
              <p className="text-gray-600 text-sm line-clamp-4">
                {note.content}
              </p>
            </div>

            {/* Tags */}
            {note.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {note.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </span>
                ))}
                {note.tags.length > 3 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                    +{note.tags.length - 3} more
                  </span>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
              <span className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(note.updatedAt)}</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Note Modal */}
      {editingNote && (
        <NoteModal
          isOpen={true}
          onClose={() => setEditingNote(null)}
          note={editingNote}
        />
      )}
    </>
  );
};

export default NoteList;
