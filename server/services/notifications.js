const nodemailer = require("nodemailer");
const cron = require("node-cron");
const { getDb } = require("../database/init");

// Email transporter configuration
let transporter;

const initializeEmailService = () => {
  if (
    process.env.EMAIL_SERVICE &&
    process.env.EMAIL_USER &&
    process.env.EMAIL_PASS
  ) {
    transporter = nodemailer.createTransporter({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    console.log("Email service initialized");
    return true;
  } else {
    console.log("Email service not configured - skipping email features");
    return false;
  }
};

// Send email notification
const sendEmail = async (to, subject, html) => {
  if (!transporter) {
    console.log("Email service not configured");
    return false;
  }

  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", result.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

// Send task reminder email
const sendTaskReminder = async (user, task) => {
  const subject = `📋 Task Reminder: ${task.title}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #3b82f6; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
        .task { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #3b82f6; }
        .priority { display: inline-block; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: bold; }
        .high { background: #fef2f2; color: #dc2626; }
        .medium { background: #fefce8; color: #d97706; }
        .low { background: #f0f9ff; color: #0284c7; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📋 Task Reminder</h1>
          <p>Hello ${user.name}! You have an upcoming task.</p>
        </div>
        <div class="content">
          <div class="task">
            <h2>${task.title}</h2>
            ${
              task.description
                ? `<p><strong>Description:</strong> ${task.description}</p>`
                : ""
            }
            <p><strong>Due Date:</strong> ${new Date(
              task.due_date
            ).toLocaleDateString()}</p>
            <span class="priority ${
              task.priority
            }">${task.priority.toUpperCase()}</span>
          </div>
          <p>Don't forget to complete this task before the due date!</p>
        </div>
        <div class="footer">
          <p>This reminder was sent from your Productivity App</p>
          <p>Log in to mark this task as complete</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail(user.email, subject, html);
};

// Send event reminder email
const sendEventReminder = async (user, event) => {
  const subject = `📅 Event Reminder: ${event.title}`;
  const eventDate = new Date(event.start_date);
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #7c3aed; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
        .event { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #7c3aed; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📅 Event Reminder</h1>
          <p>Hello ${user.name}! You have an upcoming event.</p>
        </div>
        <div class="content">
          <div class="event">
            <h2>${event.title}</h2>
            ${
              event.description
                ? `<p><strong>Description:</strong> ${event.description}</p>`
                : ""
            }
            <p><strong>Date:</strong> ${eventDate.toLocaleDateString()}</p>
            ${
              !event.all_day
                ? `<p><strong>Time:</strong> ${eventDate.toLocaleTimeString()}</p>`
                : "<p><strong>All Day Event</strong></p>"
            }
            ${
              event.category
                ? `<p><strong>Category:</strong> ${event.category}</p>`
                : ""
            }
          </div>
          <p>Don't miss your scheduled event!</p>
        </div>
        <div class="footer">
          <p>This reminder was sent from your Productivity App</p>
          <p>Log in to view more details</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail(user.email, subject, html);
};

// Check for tasks due within the next 24 hours
const checkTaskReminders = async () => {
  const db = getDb();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(23, 59, 59, 999);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    db.all(
      `SELECT t.*, u.name, u.email 
       FROM tasks t 
       JOIN users u ON t.user_id = u.id 
       WHERE t.due_date BETWEEN ? AND ? 
       AND t.completed = 0 
       AND t.reminder_sent != 1`,
      [today.toISOString(), tomorrow.toISOString()],
      async (err, tasks) => {
        if (err) {
          console.error("Error checking task reminders:", err);
          return;
        }

        for (const task of tasks) {
          const user = { name: task.name, email: task.email };
          const sent = await sendTaskReminder(user, task);

          if (sent) {
            // Mark reminder as sent
            db.run("UPDATE tasks SET reminder_sent = 1 WHERE id = ?", [
              task.id,
            ]);
          }
        }
      }
    );
  } catch (error) {
    console.error("Error in checkTaskReminders:", error);
  }

  db.close();
};

// Check for events starting within the next 2 hours
const checkEventReminders = async () => {
  const db = getDb();
  const now = new Date();
  const twoHoursLater = new Date();
  twoHoursLater.setHours(twoHoursLater.getHours() + 2);

  try {
    db.all(
      `SELECT e.*, u.name, u.email 
       FROM events e 
       JOIN users u ON e.user_id = u.id 
       WHERE e.start_date BETWEEN ? AND ? 
       AND e.reminder_sent != 1`,
      [now.toISOString(), twoHoursLater.toISOString()],
      async (err, events) => {
        if (err) {
          console.error("Error checking event reminders:", err);
          return;
        }

        for (const event of events) {
          const user = { name: event.name, email: event.email };
          const sent = await sendEventReminder(user, event);

          if (sent) {
            // Mark reminder as sent
            db.run("UPDATE events SET reminder_sent = 1 WHERE id = ?", [
              event.id,
            ]);
          }
        }
      }
    );
  } catch (error) {
    console.error("Error in checkEventReminders:", error);
  }

  db.close();
};

// Initialize email service and set up cron jobs
const startNotificationService = () => {
  const emailConfigured = initializeEmailService();

  if (emailConfigured) {
    // Check for task reminders every hour
    cron.schedule("0 * * * *", () => {
      console.log("Checking for task reminders...");
      checkTaskReminders();
    });

    // Check for event reminders every 30 minutes
    cron.schedule("*/30 * * * *", () => {
      console.log("Checking for event reminders...");
      checkEventReminders();
    });

    console.log("Notification service started with email reminders");
  } else {
    console.log(
      "Notification service started without email (configure EMAIL_* env vars to enable)"
    );
  }
};

module.exports = {
  startNotificationService,
  sendEmail,
  sendTaskReminder,
  sendEventReminder,
  checkTaskReminders,
  checkEventReminders,
};
