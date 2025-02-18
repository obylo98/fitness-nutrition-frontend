import NotificationService from "./NotificationService.js";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://fitness-nutrition-backend.onrender.com";

export default class ReminderManager {
  constructor() {
    this.notificationService = new NotificationService();
    this.loadReminders().catch(error => {
      console.warn('Failed to load initial reminders:', error);
      // Continue initialization even if reminders fail to load
    });
  }

  async loadReminders() {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No authentication token found");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/user/reminders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',  // Prevent 304 responses
          'Pragma': 'no-cache'
        },
      });

      // Handle 304 Not Modified
      if (response.status === 304) {
        console.log("Reminders not modified, using cached data");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to load reminders");
      }

      const reminders = await response.json();

      // Only schedule reminders if they exist and are valid
      if (reminders.workoutReminder && this.isValidTimeString(reminders.workoutReminder)) {
        this.notificationService.scheduleWorkoutReminder(reminders.workoutReminder);
      }

      if (reminders.nutritionReminder && this.isValidTimeString(reminders.nutritionReminder)) {
        this.notificationService.scheduleNutritionReminder(reminders.nutritionReminder);
      }

      // Check inactivity only if lastWorkout is a valid date
      if (reminders.lastWorkout && !isNaN(new Date(reminders.lastWorkout))) {
        const lastWorkoutDate = new Date(reminders.lastWorkout);
        const daysInactive = Math.floor(
          (new Date() - lastWorkoutDate) / (1000 * 60 * 60 * 24)
        );
        if (daysInactive > 3) {
          this.notificationService.scheduleInactivityReminder(daysInactive);
        }
      }

      // Check nutrition tracking only if lastNutrition is a valid date
      if (reminders.lastNutrition && !isNaN(new Date(reminders.lastNutrition))) {
        const lastNutritionDate = new Date(reminders.lastNutrition);
        const daysWithoutLogging = Math.floor(
          (new Date() - lastNutritionDate) / (1000 * 60 * 60 * 24)
        );
        if (daysWithoutLogging > 1) {
          this.notificationService.scheduleNutritionTrackingReminder(daysWithoutLogging);
        }
      }

    } catch (error) {
      console.error("Error loading reminders:", error);
      // Don't throw error, just log it - reminders are not critical functionality
    }
  }

  isValidTimeString(timeStr) {
    if (!timeStr) return false;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return !isNaN(hours) && !isNaN(minutes) && 
           hours >= 0 && hours < 24 && 
           minutes >= 0 && minutes < 60;
  }

  async updateReminders(workoutTime, nutritionTime) {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/user/reminders`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          workoutReminder: workoutTime,
          nutritionReminder: nutritionTime,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update reminders");
      }

      // Reload reminders after update
      this.loadReminders();
    } catch (error) {
      console.error("Error updating reminders:", error);
      throw error;
    }
  }

  scheduleAllReminders() {
    // Schedule hydration reminders
    this.notificationService.scheduleHydrationReminders();

    // Schedule weekly recap for Sunday evening
    const now = new Date();
    if (now.getDay() === 0 && now.getHours() >= 18) {
      this.loadWeeklyStats().then((stats) => {
        this.notificationService.scheduleWeeklyRecap(stats);
      });
    }

    // Schedule meal planning reminder
    this.notificationService.scheduleMealPlanningReminder();

    // Check for inactivity
    this.checkInactivity();
  }

  async loadWeeklyStats() {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/user/weekly-stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load weekly stats");
      }

      return await response.json();
    } catch (error) {
      console.error("Error loading weekly stats:", error);
      return {
        workouts: 0,
        calories: 0,
        streak: 0,
      };
    }
  }

  async checkInactivity() {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/user/last-workout`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to check last workout");
      }

      const { lastWorkout } = await response.json();
      if (lastWorkout) {
        const daysInactive = Math.floor(
          (new Date() - new Date(lastWorkout)) / (1000 * 60 * 60 * 24)
        );
        this.notificationService.scheduleInactivityReminder(daysInactive);
      }
    } catch (error) {
      console.error("Error checking inactivity:", error);
    }
  }

  checkGoalProgress(goalType, progress, target) {
    this.notificationService.scheduleGoalReminder(goalType, progress, target);
  }

  notifyAchievement(type, value) {
    this.notificationService.scheduleAchievementNotification({ type, value });
  }
}
