import PasswordChangeModal from "./PasswordChangeModal.js";

import { API_BASE_URL } from '../config.js';

export default class Profile {
  constructor() {
    this.render();
    this.loadUserData();
  }

  render() {
    const main = document.getElementById("main-content");
    main.innerHTML = `
      <div class="profile-container">
        <div class="profile-header">
          <h1>Profile Settings</h1>
          <p class="header-subtitle">Manage your account and preferences</p>
        </div>

        <div class="profile-content">
          <!-- Loading State -->
          <div id="profile-loading" class="loading-state">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Loading your profile...</span>
          </div>

          <!-- Error State -->
          <div id="profile-error" class="error-state hidden">
            <i class="fas fa-exclamation-circle"></i>
            <h3>Unable to Load Profile</h3>
            <p class="error-message"></p>
            <button class="retry-button" id="retry-load-profile">
              <i class="fas fa-redo"></i> Try Again
            </button>
          </div>

          <!-- Profile Form -->
          <form id="profile-form" class="profile-form hidden">
            <div class="form-section">
              <h2>Personal Information</h2>
              <div class="form-group">
                <label for="username">Username</label>
                <input type="text" id="username" name="username" disabled>
              </div>
              <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" name="email" required>
              </div>
              <div class="form-group">
                <label for="name">Full Name</label>
                <input type="text" id="name" name="name">
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn-primary">
                <i class="fas fa-save"></i> Save Changes
              </button>
            </div>
          </form>

          <!-- Preferences Form -->
          <form id="preferences-form" class="preferences-form hidden">
            <div class="form-group">
              <label for="workout-reminder">Workout Reminder Time</label>
              <input type="time" id="workout-reminder" name="workoutReminder">
            </div>
            <div class="form-group">
              <label for="nutrition-reminder">Nutrition Reminder Time</label>
              <input type="time" id="nutrition-reminder" name="nutritionReminder">
            </div>
            <div class="form-group">
              <label for="weekly-goal">Weekly Workout Goal</label>
              <select id="weekly-goal" name="weeklyGoal">
                <option value="3">3 workouts/week</option>
                <option value="4">4 workouts/week</option>
                <option value="5">5 workouts/week</option>
                <option value="6">6 workouts/week</option>
                <option value="7">7 workouts/week</option>
              </select>
            </div>
            <div class="form-group">
              <label>
                <input type="checkbox" name="publicProfile">
                Make profile public
              </label>
            </div>
            <button type="submit" class="btn-primary">Save Preferences</button>
          </form>

          <div class="profile-section stats">
            <h3>Your Progress</h3>
            <div class="stats-grid">
              <div class="stat-card">
                <span class="stat-value" id="total-workouts">0</span>
                <span class="stat-label">Workouts</span>
              </div>
              <div class="stat-card">
                <span class="stat-value" id="avg-calories">0</span>
                <span class="stat-label">Avg. Daily Calories</span>
              </div>
              <div class="stat-card">
                <span class="stat-value" id="streak">0</span>
                <span class="stat-label">Day Streak</span>
              </div>
            </div>
          </div>

          <div class="profile-section achievements">
            <h3>Achievements</h3>
            <div class="achievements-grid">
              <div class="achievement-card locked" id="workout-streak">
                <span class="achievement-icon">🔥</span>
                <span class="achievement-title">Workout Streak</span>
                <span class="achievement-progress">0/7 days</span>
              </div>
              <div class="achievement-card locked" id="nutrition-master">
                <span class="achievement-icon">🥗</span>
                <span class="achievement-title">Nutrition Master</span>
                <span class="achievement-progress">0/30 days</span>
              </div>
              <div class="achievement-card locked" id="strength-gains">
                <span class="achievement-icon">💪</span>
                <span class="achievement-title">Strength Gains</span>
                <span class="achievement-progress">0/100 workouts</span>
              </div>
            </div>
          </div>

          <div class="profile-section monthly-progress">
            <h3>Monthly Progress</h3>
            <div class="progress-chart" id="monthly-chart">
              <!-- Chart will be rendered here -->
            </div>
            <div class="progress-stats">
              <div class="stat-row">
                <span class="stat-label">Active Days</span>
                <span class="stat-value" id="active-days">0</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">Total Duration</span>
                <span class="stat-value" id="total-duration">0 min</span>
              </div>
            </div>
          </div>

          <div class="profile-section favorite-exercises">
            <h3>Top Exercises</h3>
            <div class="exercise-list" id="top-exercises">
              <!-- Exercise list will be populated here -->
            </div>
          </div>

          <div class="profile-section additional-preferences">
            <h3>Additional Preferences</h3>
            <form id="additional-preferences-form" class="preferences-form">
              <div class="form-group">
                <label for="workout-reminder">Workout Reminder Time</label>
                <input type="time" id="workout-reminder" name="workoutReminder">
              </div>
              <div class="form-group">
                <label for="nutrition-reminder">Nutrition Reminder Time</label>
                <input type="time" id="nutrition-reminder" name="nutritionReminder">
              </div>
              <div class="form-group">
                <label for="weekly-goal">Weekly Workout Goal</label>
                <select id="weekly-goal" name="weeklyGoal">
                  <option value="3">3 workouts/week</option>
                  <option value="4">4 workouts/week</option>
                  <option value="5">5 workouts/week</option>
                  <option value="6">6 workouts/week</option>
                  <option value="7">7 workouts/week</option>
                </select>
              </div>
              <div class="form-group">
                <label>
                  <input type="checkbox" name="publicProfile">
                  Make profile public
                </label>
              </div>
              <button type="submit" class="btn-primary">Save Preferences</button>
            </form>
          </div>

          <div class="profile-section danger-zone">
            <h3>Account Management</h3>
            <div class="danger-zone-actions">
              <button id="change-password-btn" class="btn-secondary">
                Change Password
              </button>
              <button id="delete-account-btn" class="btn-danger">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  attachEventListeners() {
    const retryButton = document.getElementById('retry-load-profile');
    if (retryButton) {
      retryButton.addEventListener('click', () => this.loadUserData());
    }

    const profileForm = document.getElementById('profile-form');
    const preferencesForm = document.getElementById('preferences-form');
    const changePasswordBtn = document.getElementById("change-password-btn");
    const deleteAccountBtn = document.getElementById("delete-account-btn");

    if (profileForm) {
      profileForm.addEventListener('submit', (e) => this.handleProfileUpdate(e));
    }

    if (preferencesForm) {
      preferencesForm.addEventListener("submit", (e) => this.handlePreferencesUpdate(e));
    }

    if (changePasswordBtn) {
      changePasswordBtn.addEventListener("click", () => this.showChangePasswordModal());
    }

    if (deleteAccountBtn) {
      deleteAccountBtn.addEventListener("click", () => this.handleDeleteAccount());
    }
  }

  async loadUserData() {
    const loadingState = document.getElementById('profile-loading');
    const errorState = document.getElementById('profile-error');
    const profileForm = document.getElementById('profile-form');

    try {
      loadingState.classList.remove('hidden');
      errorState.classList.add('hidden');
      profileForm.classList.add('hidden');

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache',  // Prevent 304 responses
          'Pragma': 'no-cache'
        }
      });

      // Handle 304 Not Modified
      if (response.status === 304) {
        console.log("Profile not modified, using cached data");
        loadingState.classList.add('hidden');
        profileForm.classList.remove('hidden');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to load user data');
      }

      const userData = await response.json();
      this.populateUserData(userData);

      loadingState.classList.add('hidden');
      profileForm.classList.remove('hidden');

    } catch (error) {
      console.error('Error loading user data:', error);
      loadingState.classList.add('hidden');
      errorState.classList.remove('hidden');
      errorState.querySelector('.error-message').textContent = 
        error.message || 'Failed to load profile data';
    }
  }

  populateUserData(userData) {
    const form = document.getElementById('profile-form');
    if (!form) return; // Exit if form doesn't exist yet

    const fields = {
      username: form.querySelector('#username'),
      email: form.querySelector('#email'),
      name: form.querySelector('#name')
    };

    // Only set values if the elements exist
    if (fields.username) fields.username.value = userData.username || '';
    if (fields.email) fields.email.value = userData.email || '';
    if (fields.name) fields.name.value = userData.name || '';

    // Update preferences if they exist
    if (userData.preferences) {
      const prefs = userData.preferences;
      const prefsForm = document.getElementById('preferences-form');
      if (prefsForm) {
        const workoutReminder = prefsForm.querySelector('#workout-reminder');
        const nutritionReminder = prefsForm.querySelector('#nutrition-reminder');
        const weeklyGoal = prefsForm.querySelector('#weekly-goal');
        const publicProfile = prefsForm.querySelector('input[name="publicProfile"]');

        if (workoutReminder) workoutReminder.value = prefs.workout_reminder || '';
        if (nutritionReminder) nutritionReminder.value = prefs.nutrition_reminder || '';
        if (weeklyGoal) weeklyGoal.value = prefs.weekly_goal || '3';
        if (publicProfile) publicProfile.checked = prefs.public_profile || false;
      }
    }
  }

  async loadUserStats() {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/user/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user stats");
      }

      const stats = await response.json();
      this.updateStats(stats);
      this.updateAchievements(stats);
      this.displayTopExercises(stats.topExercises);
    } catch (error) {
      console.error("Error loading user stats:", error);
    }
  }

  updateStats(stats) {
    document.getElementById("total-workouts").textContent = stats.totalWorkouts;
    document.getElementById("avg-calories").textContent = Math.round(
      stats.avgCalories
    );
    document.getElementById("streak").textContent = stats.streak;
  }

  updateAchievements(stats) {
    const workoutStreak = document.getElementById("workout-streak");
    const nutritionMaster = document.getElementById("nutrition-master");
    const strengthGains = document.getElementById("strength-gains");

    if (stats.streak >= 7) {
      workoutStreak.classList.remove("locked");
      workoutStreak.querySelector(".achievement-progress").textContent =
        "Completed!";
    } else {
      workoutStreak.querySelector(
        ".achievement-progress"
      ).textContent = `${stats.streak}/7 days`;
    }

    if (stats.totalWorkouts >= 100) {
      strengthGains.classList.remove("locked");
      strengthGains.querySelector(".achievement-progress").textContent =
        "Completed!";
    } else {
      strengthGains.querySelector(
        ".achievement-progress"
      ).textContent = `${stats.totalWorkouts}/100 workouts`;
    }
  }

  displayTopExercises(exercises) {
    const container = document.getElementById("top-exercises");
    container.innerHTML = exercises
      .map(
        (exercise) => `
      <div class="exercise-stat-card">
        <div class="exercise-stat-header">
          <span class="exercise-name">${exercise.exercise_name}</span>
          <span class="exercise-count">${exercise.times_performed}x</span>
        </div>
        <div class="exercise-stat-details">
          <span>Avg. Weight: ${Math.round(exercise.avg_weight)}kg</span>
        </div>
      </div>
    `
      )
      .join("");
  }

  async handleProfileUpdate(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: formData.get('email'),
          name: formData.get('name')
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const data = await response.json();
      
      // Update stored user data
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({
        ...currentUser,
        ...data.user
      }));

      this.showSuccess('Profile updated successfully');
      
      // Reload user data to show updated values
      await this.loadUserData();

    } catch (error) {
      console.error('Error updating profile:', error);
      this.showError(error.message || 'Failed to update profile');
    }
  }

  async handlePreferencesUpdate(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/user/preferences`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          workout_reminder: formData.get("workoutReminder"),
          nutrition_reminder: formData.get("nutritionReminder"),
          theme: formData.get("theme"),
          units: formData.get("units"),
          notifications: formData.get("notifications") === "on",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update preferences");
      }

      this.showSuccess("Preferences updated successfully");
    } catch (error) {
      console.error("Error updating preferences:", error);
      this.showError("Failed to update preferences");
    }
  }

  showChangePasswordModal() {
    new PasswordChangeModal(() => {
      this.showSuccess("Password changed successfully");
    });
  }

  async handleDeleteAccount() {
    if (
      confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/api/user/account`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to delete account");
        }

        // Clear local storage and redirect to home
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.hash = "login";
        window.location.reload(); 
      } catch (error) {
        console.error("Error deleting account:", error);
        this.showError("Failed to delete account");
      }
    }
  }

  showSuccess(message) {
    const notification = document.createElement('div');
    notification.className = 'notification success';
    notification.innerHTML = `
      <i class="fas fa-check-circle"></i>
      <span>${message}</span>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  showError(message) {
    const notification = document.createElement('div');
    notification.className = 'notification error';
    notification.innerHTML = `
      <i class="fas fa-exclamation-circle"></i>
      <span>${message}</span>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
}
