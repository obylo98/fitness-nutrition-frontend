export default class NotificationService {
  constructor() {
    this.hasPermission = false;
    this.checkPermission();
    this.activeNotifications = new Set();
  }

  async checkPermission() {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      return;
    }

    if (Notification.permission === "granted") {
      this.hasPermission = true;
    } else if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      this.hasPermission = permission === "granted";
    }
  }

  async requestPermission() {
    try {
      const permission = await Notification.requestPermission();
      this.hasPermission = permission === "granted";
      return this.hasPermission;
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  }

  scheduleWorkoutReminder(time) {
    if (!this.hasPermission) return;

    const [hours, minutes] = time.split(":");
    const now = new Date();
    const reminderTime = new Date();
    reminderTime.setHours(parseInt(hours), parseInt(minutes), 0);

    if (reminderTime < now) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }

    const timeUntilReminder = reminderTime.getTime() - now.getTime();
    setTimeout(() => {
      this.showNotification("Workout Reminder", "Time for your workout! 💪", {
        icon: "/src/assets/workout-icon.png",
      });
    }, timeUntilReminder);
  }

  scheduleNutritionReminder(time) {
    if (!this.hasPermission) return;

    const [hours, minutes] = time.split(":");
    const now = new Date();
    const reminderTime = new Date();
    reminderTime.setHours(parseInt(hours), parseInt(minutes), 0);

    if (reminderTime < now) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }

    const timeUntilReminder = reminderTime.getTime() - now.getTime();
    setTimeout(() => {
      this.showNotification(
        "Nutrition Reminder",
        "Time to log your meals! 🥗",
        { icon: "/src/assets/nutrition-icon.png" }
      );
    }, timeUntilReminder);
  }

  scheduleGoalReminder(goalType, progress, target) {
    if (!this.hasPermission) return;

    const percentage = (progress / target) * 100;
    if (percentage >= 80 && percentage < 100) {
      this.showNotification(
        "Goal Almost Reached! 🎯",
        `You're at ${Math.round(percentage)}% of your ${goalType} goal!`,
        { tag: `${goalType}-goal-reminder` }
      );
    }
  }

  scheduleInactivityReminder(daysInactive) {
    if (!this.hasPermission || daysInactive < 2) return;

    const notificationId = `inactivity-${Date.now()}`;
    this.showNotification(
      "Missing Your Workouts? 💪",
      `It's been ${daysInactive} days since your last workout. Keep up your momentum!`,
      {
        tag: "inactivity-reminder",
        requireInteraction: true,
        actions: [
          {
            action: "workout",
            title: "Start Workout",
          },
        ],
      }
    );
  }

  scheduleHydrationReminders() {
    if (!this.hasPermission) return;

    // Schedule reminders every 2 hours between 8 AM and 8 PM
    const now = new Date();
    const startHour = 8;
    const endHour = 20;
    const interval = 2;

    for (let hour = startHour; hour <= endHour; hour += interval) {
      const reminderTime = new Date(now);
      reminderTime.setHours(hour, 0, 0);

      if (reminderTime > now) {
        const timeUntilReminder = reminderTime.getTime() - now.getTime();
        setTimeout(() => {
          this.showNotification(
            "Hydration Reminder 💧",
            "Time to drink some water!",
            { tag: `hydration-${hour}` }
          );
        }, timeUntilReminder);
      }
    }
  }

  scheduleWeeklyRecap(stats) {
    if (!this.hasPermission) return;

    this.showNotification(
      "Weekly Progress Recap 📊",
      `This week:
      • ${stats.workouts} workouts completed
      • ${stats.calories} calories burned
      • ${stats.streak} day streak
      Keep it up! 🎉`,
      {
        tag: "weekly-recap",
        requireInteraction: true,
        silent: false,
      }
    );
  }

  scheduleAchievementNotification(achievement) {
    if (!this.hasPermission) return;

    const achievements = {
      streak: {
        title: "Streak Master 🔥",
        message: (days) =>
          `Amazing! You've worked out for ${days} days in a row!`,
      },
      calories: {
        title: "Calorie Crusher 💪",
        message: (amount) =>
          `You've burned over ${amount} calories this month!`,
      },
      workouts: {
        title: "Workout Warrior 🏆",
        message: (count) => `Congratulations on completing ${count} workouts!`,
      },
    };

    const { type, value } = achievement;
    const achievementConfig = achievements[type];

    if (achievementConfig) {
      this.showNotification(
        achievementConfig.title,
        achievementConfig.message(value),
        {
          tag: `achievement-${type}`,
          icon: "/src/assets/achievement-icon.png",
          badge: "/src/assets/badge-icon.png",
          requireInteraction: true,
        }
      );
    }
  }

  scheduleMealPlanningReminder() {
    if (!this.hasPermission) return;

    // Schedule for Sunday evening
    const now = new Date();
    const nextSunday = new Date();
    nextSunday.setDate(now.getDate() + (7 - now.getDay()));
    nextSunday.setHours(18, 0, 0);

    if (nextSunday > now) {
      const timeUntilReminder = nextSunday.getTime() - now.getTime();
      setTimeout(() => {
        this.showNotification(
          "Meal Planning Reminder 📝",
          "Plan your meals for the upcoming week!",
          {
            tag: "meal-planning",
            actions: [
              {
                action: "plan",
                title: "Start Planning",
              },
            ],
          }
        );
      }, timeUntilReminder);
    }
  }

  showNotification(title, body, options = {}) {
    if (!this.hasPermission) return;

    // Clear existing notification with same tag if it exists
    if (options.tag && this.activeNotifications.has(options.tag)) {
      return;
    }

    const notification = new Notification(title, {
      body,
      badge: "/src/assets/notification-badge.png",
      icon: options.icon || "/src/assets/default-icon.png",
      silent: options.silent ?? true,
      ...options,
    });

    if (options.tag) {
      this.activeNotifications.add(options.tag);
    }

    notification.onclick = () => {
      window.focus();
      if (options.onClick) {
        options.onClick();
      }
      notification.close();
    };

    notification.onclose = () => {
      if (options.tag) {
        this.activeNotifications.delete(options.tag);
      }
    };

    // Auto-close notification after 5 seconds unless requireInteraction is true
    if (!options.requireInteraction) {
      setTimeout(() => {
        notification.close();
      }, 5000);
    }
  }
}
