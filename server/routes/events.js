const express = require("express");
const { getDb } = require("../database/init");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Get all events for user
router.get("/", authenticateToken, (req, res) => {
  const db = getDb();

  db.all(
    "SELECT * FROM events WHERE user_id = ? ORDER BY start_date ASC",
    [req.user.userId],
    (err, events) => {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }

      const formattedEvents = events.map((event) => ({
        ...event,
        all_day: Boolean(event.all_day),
        start_date: new Date(event.start_date),
        end_date: new Date(event.end_date),
        created_at: new Date(event.created_at),
      }));

      res.json(formattedEvents);
    }
  );

  db.close();
});

// Create event
router.post("/", authenticateToken, (req, res) => {
  const { id, title, description, start_date, end_date, all_day, category } =
    req.body;
  const db = getDb();

  db.run(
    "INSERT INTO events (id, user_id, title, description, start_date, end_date, all_day, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [
      id,
      req.user.userId,
      title,
      description || null,
      start_date,
      end_date,
      all_day ? 1 : 0,
      category || null,
    ],
    function (err) {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }
      res.status(201).json({ message: "Event created successfully", id });
    }
  );

  db.close();
});

// Update event
router.put("/:id", authenticateToken, (req, res) => {
  const { title, description, start_date, end_date, all_day, category } =
    req.body;
  const db = getDb();

  db.run(
    "UPDATE events SET title = ?, description = ?, start_date = ?, end_date = ?, all_day = ?, category = ? WHERE id = ? AND user_id = ?",
    [
      title,
      description,
      start_date,
      end_date,
      all_day ? 1 : 0,
      category,
      req.params.id,
      req.user.userId,
    ],
    function (err) {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: "Event not found" });
      }
      res.json({ message: "Event updated successfully" });
    }
  );

  db.close();
});

// Delete event
router.delete("/:id", authenticateToken, (req, res) => {
  const db = getDb();

  db.run(
    "DELETE FROM events WHERE id = ? AND user_id = ?",
    [req.params.id, req.user.userId],
    function (err) {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: "Event not found" });
      }
      res.json({ message: "Event deleted successfully" });
    }
  );

  db.close();
});

module.exports = router;
