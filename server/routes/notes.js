const express = require("express");
const { getDb } = require("../database/init");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Get all notes for user
router.get("/", authenticateToken, (req, res) => {
  const db = getDb();

  db.all(
    "SELECT * FROM notes WHERE user_id = ? ORDER BY created_at DESC",
    [req.user.userId],
    (err, notes) => {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }

      const formattedNotes = notes.map((note) => ({
        ...note,
        tags: note.tags ? JSON.parse(note.tags) : [],
        created_at: new Date(note.created_at),
        updated_at: new Date(note.updated_at),
      }));

      res.json(formattedNotes);
    }
  );

  db.close();
});

// Create note
router.post("/", authenticateToken, (req, res) => {
  const { id, title, content, category, tags } = req.body;
  const db = getDb();

  db.run(
    "INSERT INTO notes (id, user_id, title, content, category, tags) VALUES (?, ?, ?, ?, ?, ?)",
    [
      id,
      req.user.userId,
      title,
      content,
      category || null,
      JSON.stringify(tags || []),
    ],
    function (err) {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }
      res.status(201).json({ message: "Note created successfully", id });
    }
  );

  db.close();
});

// Update note
router.put("/:id", authenticateToken, (req, res) => {
  const { title, content, category, tags } = req.body;
  const db = getDb();

  db.run(
    "UPDATE notes SET title = ?, content = ?, category = ?, tags = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?",
    [
      title,
      content,
      category,
      JSON.stringify(tags || []),
      req.params.id,
      req.user.userId,
    ],
    function (err) {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: "Note not found" });
      }
      res.json({ message: "Note updated successfully" });
    }
  );

  db.close();
});

// Delete note
router.delete("/:id", authenticateToken, (req, res) => {
  const db = getDb();

  db.run(
    "DELETE FROM notes WHERE id = ? AND user_id = ?",
    [req.params.id, req.user.userId],
    function (err) {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: "Note not found" });
      }
      res.json({ message: "Note deleted successfully" });
    }
  );

  db.close();
});

module.exports = router;
