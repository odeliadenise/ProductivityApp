class NotificationService {
  private static instance: NotificationService;
  private checkInterval: number | null = null;
  private notifiedEvents: Set<string> = new Set();
  private notifiedTasks: Set<string> = new Set();

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async requestPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission === "denied") {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  private showNotification(title: string, body: string, icon?: string): void {
    if (Notification.permission === "granted") {
      const notification = new Notification(title, {
        body,
        icon: icon || "/favicon.ico",
        badge: "/favicon.ico",
        requireInteraction: true,
      });

      // Auto-close after 10 seconds
      setTimeout(() => {
        notification.close();
      }, 10000);

      // Handle click
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  }

  private checkEventReminders(events: any[]): void {
    const now = new Date();

    events.forEach((event) => {
      if (!event.notifications?.enabled || !event.notifications.reminderTime) {
        return;
      }

      const reminderTime = new Date(
        event.startDate.getTime() - event.notifications.reminderTime * 60000
      );

      // Check if it's time for the reminder (within 1 minute of reminder time)
      const timeDiff = Math.abs(now.getTime() - reminderTime.getTime());
      const isReminderTime = timeDiff <= 60000; // Within 1 minute

      if (isReminderTime && !this.notifiedEvents.has(event.id)) {
        this.notifiedEvents.add(event.id);

        const timeUntilEvent = Math.round(
          (event.startDate.getTime() - now.getTime()) / (1000 * 60)
        );

        let timeText = "";
        if (timeUntilEvent <= 0) {
          timeText = "now";
        } else if (timeUntilEvent < 60) {
          timeText = `in ${timeUntilEvent} minute${
            timeUntilEvent !== 1 ? "s" : ""
          }`;
        } else {
          const hours = Math.floor(timeUntilEvent / 60);
          timeText = `in ${hours} hour${hours !== 1 ? "s" : ""}`;
        }

        this.showNotification(
          `📅 Event Reminder: ${event.title}`,
          `Your event "${event.title}" is starting ${timeText}${
            event.description ? `\n\n${event.description}` : ""
          }`
        );
      }
    });
  }

  private checkTaskDeadlines(tasks: any[]): void {
    const now = new Date();

    tasks.forEach((task) => {
      if (!task.dueDate || task.completed) {
        return;
      }

      const dueDate = new Date(task.dueDate);
      const timeUntilDue = dueDate.getTime() - now.getTime();
      const hoursUntilDue = timeUntilDue / (1000 * 60 * 60);

      // Notify for tasks due in 1 hour, 30 minutes, or overdue
      const shouldNotify =
        (hoursUntilDue <= 1 && hoursUntilDue > 0.5) || // 1 hour before
        (hoursUntilDue <= 0.5 && hoursUntilDue > 0) || // 30 minutes before
        hoursUntilDue <= 0; // Overdue

      if (
        shouldNotify &&
        !this.notifiedTasks.has(`${task.id}-${Math.floor(hoursUntilDue * 10)}`)
      ) {
        // Use a compound key to allow multiple notifications per task
        this.notifiedTasks.add(`${task.id}-${Math.floor(hoursUntilDue * 10)}`);

        let message = "";
        if (hoursUntilDue <= 0) {
          const minutesOverdue = Math.abs(Math.round(hoursUntilDue * 60));
          message = `Task "${task.title}" is ${minutesOverdue} minute${
            minutesOverdue !== 1 ? "s" : ""
          } overdue!`;
        } else if (hoursUntilDue <= 0.5) {
          message = `Task "${task.title}" is due in 30 minutes`;
        } else {
          message = `Task "${task.title}" is due in 1 hour`;
        }

        this.showNotification(
          `⚠️ Task Deadline: ${task.title}`,
          `${message}${task.description ? `\n\n${task.description}` : ""}`
        );
      }
    });
  }

  startMonitoring(events: any[], tasks: any[]): void {
    // Clear existing interval
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    // Check every 30 seconds
    this.checkInterval = setInterval(() => {
      this.checkEventReminders(events);
      this.checkTaskDeadlines(tasks);
    }, 30000);

    // Also check immediately
    this.checkEventReminders(events);
    this.checkTaskDeadlines(tasks);
  }

  stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  clearNotificationHistory(): void {
    this.notifiedEvents.clear();
    this.notifiedTasks.clear();
  }
}

export default NotificationService;
