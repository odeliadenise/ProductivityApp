import React, { useState } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { useNotes } from "../context/NoteContext";
import NoteList from "../components/NoteList";
import NoteModal from "../components/NoteModal";

const NotesPage: React.FC = () => {
  const { notes, searchNotes } = useNotes();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  // Get unique categories
  const categories = Array.from(
    new Set(notes.map((note) => note.category).filter(Boolean))
  );

  const filteredNotes = searchQuery
    ? searchNotes(searchQuery)
    : selectedCategory
    ? notes.filter((note) => note.category === selectedCategory)
    : notes;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Notes</h1>
          <p className="text-gray-600">Capture and organize your thoughts.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>New Note</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {categories.length > 0 && (
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Notes Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Total Notes</p>
          <p className="text-2xl font-bold text-gray-900">{notes.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Categories</p>
          <p className="text-2xl font-bold text-primary-600">
            {categories.length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Total Tags</p>
          <p className="text-2xl font-bold text-green-600">
            {Array.from(new Set(notes.flatMap((note) => note.tags))).length}
          </p>
        </div>
      </div>

      {/* Notes Grid */}
      <NoteList notes={filteredNotes} />

      {/* Add Note Modal */}
      <NoteModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default NotesPage;
