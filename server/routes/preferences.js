const express = require("express");
const { getDb } = require("../database/init");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Get user preferences
router.get("/", authenticateToken, (req, res) => {
  const db = getDb();

  db.get(
    "SELECT * FROM user_preferences WHERE user_id = ?",
    [req.user.userId],
    (err, preferences) => {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }

      // Return default preferences if none exist
      if (!preferences) {
        return res.json({
          email_notifications: true,
          task_reminders: true,
          event_reminders: true,
          theme: "light",
          timezone: "UTC",
        });
      }

      res.json({
        email_notifications: Boolean(preferences.email_notifications),
        task_reminders: Boolean(preferences.task_reminders),
        event_reminders: Boolean(preferences.event_reminders),
        theme: preferences.theme,
        timezone: preferences.timezone,
      });
    }
  );

  db.close();
});

// Update user preferences
router.put("/", authenticateToken, (req, res) => {
  const {
    email_notifications,
    task_reminders,
    event_reminders,
    theme,
    timezone,
  } = req.body;

  const db = getDb();

  // Insert or update preferences
  db.run(
    `INSERT OR REPLACE INTO user_preferences 
     (user_id, email_notifications, task_reminders, event_reminders, theme, timezone, updated_at) 
     VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    [
      req.user.userId,
      email_notifications ? 1 : 0,
      task_reminders ? 1 : 0,
      event_reminders ? 1 : 0,
      theme || "light",
      timezone || "UTC",
    ],
    function (err) {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }
      res.json({ message: "Preferences updated successfully" });
    }
  );

  db.close();
});

// Test notification endpoint
router.post("/test-notification", authenticateToken, async (req, res) => {
  const {
    sendTaskReminder,
    sendEventReminder,
  } = require("../services/notifications");
  const { type } = req.body;

  const db = getDb();

  try {
    // Get user info
    db.get(
      "SELECT name, email FROM users WHERE id = ?",
      [req.user.userId],
      async (err, user) => {
        if (err || !user) {
          return res.status(500).json({ error: "User not found" });
        }

        let sent = false;

        if (type === "task") {
          const testTask = {
            title: "Test Task Reminder",
            description:
              "This is a test notification from your productivity app.",
            due_date: new Date(),
            priority: "medium",
          };
          sent = await sendTaskReminder(user, testTask);
        } else if (type === "event") {
          const testEvent = {
            title: "Test Event Reminder",
            description: "This is a test event notification.",
            start_date: new Date(),
            all_day: false,
            category: "Test",
          };
          sent = await sendEventReminder(user, testEvent);
        }

        if (sent) {
          res.json({ message: "Test notification sent successfully" });
        } else {
          res
            .status(400)
            .json({
              error: "Failed to send notification. Check email configuration.",
            });
        }
      }
    );
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  } finally {
    db.close();
  }
});

module.exports = router;
