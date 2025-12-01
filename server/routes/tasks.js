const express = require("express");
const { getDb } = require("../database/init");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Get all tasks for user
router.get("/", authenticateToken, (req, res) => {
  const db = getDb();

  db.all(
    "SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC",
    [req.user.userId],
    (err, tasks) => {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }

      // Convert boolean and date fields
      const formattedTasks = tasks.map((task) => ({
        ...task,
        completed: Boolean(task.completed),
        due_date: task.due_date ? new Date(task.due_date) : null,
        created_at: new Date(task.created_at),
        updated_at: new Date(task.updated_at),
      }));

      res.json(formattedTasks);
    }
  );

  db.close();
});

// Create task
router.post("/", authenticateToken, (req, res) => {
  const { id, title, description, priority, due_date } = req.body;
  const db = getDb();

  db.run(
    "INSERT INTO tasks (id, user_id, title, description, priority, due_date) VALUES (?, ?, ?, ?, ?, ?)",
    [
      id,
      req.user.userId,
      title,
      description || null,
      priority || "medium",
      due_date || null,
    ],
    function (err) {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }
      res.status(201).json({ message: "Task created successfully", id });
    }
  );

  db.close();
});

// Update task
router.put("/:id", authenticateToken, (req, res) => {
  const { title, description, completed, priority, due_date } = req.body;
  const db = getDb();

  db.run(
    "UPDATE tasks SET title = ?, description = ?, completed = ?, priority = ?, due_date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?",
    [
      title,
      description,
      completed ? 1 : 0,
      priority,
      due_date,
      req.params.id,
      req.user.userId,
    ],
    function (err) {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.json({ message: "Task updated successfully" });
    }
  );

  db.close();
});

// Delete task
router.delete("/:id", authenticateToken, (req, res) => {
  const db = getDb();

  db.run(
    "DELETE FROM tasks WHERE id = ? AND user_id = ?",
    [req.params.id, req.user.userId],
    function (err) {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.json({ message: "Task deleted successfully" });
    }
  );

  db.close();
});

module.exports = router;
