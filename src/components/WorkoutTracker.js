export default class WorkoutTracker {
  constructor() {
    this.render();
    this.currentView = "history"; // or "logging"
    this.searchTimeout = null;
  }

  render() {
    const main = document.getElementById("main-content");
    main.innerHTML = `
      <div class="workout-container">
        <div class="workout-header">
          <div class="header-content">
            <h1>Workout Tracker</h1>
            <p class="header-subtitle">Track your fitness journey and monitor your progress</p>
          </div>
          <div class="view-controls">
            <button id="view-history" class="view-btn ${
              this.currentView === "history" ? "active" : ""
            }">
              <i class="fas fa-history"></i>
              <span>History</span>
            </button>
            <button id="log-workout" class="view-btn ${
              this.currentView === "logging" ? "active" : ""
            }">
              <i class="fas fa-plus-circle"></i>
              <span>Log Workout</span>
            </button>
          </div>
        </div>

        <div class="workout-content">
          <div id="workout-history" class="workout-history ${
            this.currentView === "history" ? "" : "hidden"
          }">
            <div class="workout-stats">
              <div class="stat-card">
                <div class="stat-icon">
                  <i class="fas fa-dumbbell"></i>
                </div>
                <div class="stat-value" id="total-workouts">0</div>
                <div class="stat-label">Total Workouts</div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">
                  <i class="fas fa-calendar-check"></i>
                </div>
                <div class="stat-value" id="month-workouts">0</div>
                <div class="stat-label">This Month</div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">
                  <i class="fas fa-clock"></i>
                </div>
                <div class="stat-value" id="avg-duration">0</div>
                <div class="stat-label">Avg. Duration (min)</div>
              </div>
            </div>

            <div class="workout-filters">
              <div class="filter-group">
                <div class="date-range">
                  <div class="input-wrapper">
                    <i class="fas fa-calendar"></i>
                    <input type="date" id="start-date" class="date-input">
                  </div>
                  <span class="date-separator">to</span>
                  <div class="input-wrapper">
                    <i class="fas fa-calendar"></i>
                    <input type="date" id="end-date" class="date-input">
                  </div>
                </div>
              </div>
            </div>

            <div id="workout-list" class="workout-list">
              <div class="loading">
                <i class="fas fa-spinner fa-spin"></i>
                <span>Loading workouts...</span>
              </div>
            </div>
          </div>

          <div id="workout-form-container" class="workout-form-container ${
            this.currentView === "logging" ? "" : "hidden"
          }">
            <!-- Workout form will be rendered here -->
          </div>
        </div>
      </div>
    `;

    this.addEventListeners();
    if (this.currentView === "history") {
      this.loadWorkoutHistory();
    }
  }

  addEventListeners() {
    const viewHistoryBtn = document.getElementById("view-history");
    const logWorkoutBtn = document.getElementById("log-workout");
    const startDate = document.getElementById("start-date");
    const endDate = document.getElementById("end-date");

    viewHistoryBtn.addEventListener("click", () => this.switchView("history"));
    logWorkoutBtn.addEventListener("click", () => this.switchView("logging"));
    if (startDate) {
      startDate.value = this.getDefaultStartDate();
      startDate.addEventListener("change", () => {
        if (!endDate.value) {
          endDate.value = this.getCurrentDate();
        }
        this.loadWorkoutHistory();
      });
    }
    if (endDate) {
      endDate.value = this.getCurrentDate();
      endDate.addEventListener("change", () => {
        if (!startDate.value) {
          startDate.value = this.getDefaultStartDate();
        }
        this.loadWorkoutHistory();
      });
    }
  }

  async loadWorkoutHistory() {
    const workoutList = document.getElementById("workout-list");
    const startDate = document.getElementById("start-date")?.value;
    const endDate = document.getElementById("end-date")?.value;

    try {
      workoutList.innerHTML = `
        <div class="loading">
          <i class="fas fa-spinner fa-spin"></i>
          <span>Loading workouts...</span>
        </div>
      `;

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Build query parameters
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const url = `/api/workout/logs?${params.toString()}`;
      console.log('Fetching workouts from:', url); // Debug log

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
        console.error('Server response:', errorData); // Debug log
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const workouts = await response.json();
      console.log('Received workouts:', workouts); // Debug log
      
      if (!Array.isArray(workouts)) {
        throw new Error('Invalid response format: expected array of workouts');
      }

      if (workouts.length === 0) {
        workoutList.innerHTML = `
          <div class="empty-state">
            <i class="fas fa-clipboard-list"></i>
            <h3>No Workouts Found</h3>
            <p>No workouts found for the selected date range</p>
            <button id="start-logging" class="btn-primary">
              <i class="fas fa-plus-circle"></i>
              Log a Workout
            </button>
          </div>
        `;
        document.getElementById("start-logging")?.addEventListener("click", () => this.switchView("logging"));
        return;
      }

      this.displayWorkouts(workouts);
      this.updateStats(workouts);

    } catch (error) {
      console.error("Error loading workouts:", error);
      workoutList.innerHTML = `
        <div class="error-state">
          <i class="fas fa-exclamation-circle"></i>
          <h3>Unable to Load Workouts</h3>
          <p>${error.message}</p>
          <button class="retry-button" onclick="this.loadWorkoutHistory()">
            <i class="fas fa-redo"></i> Try Again
          </button>
        </div>
      `;
    }
  }

  displayWorkouts(workouts) {
    const workoutList = document.getElementById("workout-list");

    if (workouts.length === 0) {
      workoutList.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-clipboard-list"></i>
          <h3>No Workouts Found</h3>
          <p>Start logging your workouts to track your progress</p>
          <button id="start-logging" class="btn-primary">
            <i class="fas fa-plus-circle"></i>
            Start Logging
          </button>
        </div>
      `;
      document
        .getElementById("start-logging")
        ?.addEventListener("click", () => this.switchView("logging"));
      return;
    }

    workoutList.innerHTML = workouts
      .map(workout => `
        <div class="workout-card">
          <div class="workout-card-header">
            <div class="workout-info">
              <h3>${workout.name || "Workout"}</h3>
              <div class="workout-meta">
                <span><i class="far fa-calendar"></i> ${new Date(workout.date).toLocaleDateString()}</span>
                <span><i class="far fa-clock"></i> ${workout.duration} min</span>
                <span><i class="fas fa-fire"></i> ${workout.calories || 0} cal</span>
              </div>
            </div>
            <button class="delete-workout" data-id="${workout.id}">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
          
          <div class="exercise-list">
            ${workout.exercises.map(exercise => `
              <div class="exercise-item">
                <div class="exercise-info">
                  <span class="exercise-name">${exercise.exercise_name}</span>
                  <div class="exercise-details">
                    <span class="sets-reps">${exercise.sets}×${exercise.reps}</span>
                    ${exercise.weight ? `<span class="weight">${exercise.weight}kg</span>` : ''}
                  </div>
                </div>
                <div class="exercise-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: ${(exercise.completed_sets / exercise.sets) * 100}%"></div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
          
          ${workout.notes ? `
            <div class="workout-notes">
              <i class="fas fa-sticky-note"></i>
              <p>${workout.notes}</p>
            </div>
          ` : ''}
        </div>
      `)
      .join('');

    // Add delete handlers
    workoutList.querySelectorAll(".delete-workout").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        if (confirm("Are you sure you want to delete this workout?")) {
          this.deleteWorkout(btn.dataset.id);
        }
      });
    });
  }

  updateStats(workouts) {
    const totalWorkouts = workouts.length;
    const thisMonth = new Date().getMonth();
    const monthWorkouts = workouts.filter(
      (w) => new Date(w.date).getMonth() === thisMonth
    ).length;
    const avgDuration =
      workouts.reduce((sum, w) => sum + (w.duration || 0), 0) / totalWorkouts ||
      0;

    document.getElementById("total-workouts").textContent = totalWorkouts;
    document.getElementById("month-workouts").textContent = monthWorkouts;
    document.getElementById("avg-duration").textContent = `${Math.round(
      avgDuration
    )} min`;
  }

  async deleteWorkout(id) {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/workout/log/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete workout");
      }

      this.loadWorkoutHistory();
    } catch (error) {
      console.error("Error deleting workout:", error);
      alert("Failed to delete workout. Please try again.");
    }
  }

  switchView(view) {
    this.currentView = view;
    const historyView = document.getElementById("workout-history");
    const formView = document.getElementById("workout-form-container");
    const historyBtn = document.getElementById("view-history");
    const logBtn = document.getElementById("log-workout");

    if (view === "history") {
      historyView.classList.remove("hidden");
      formView.classList.add("hidden");
      historyBtn.classList.add("active");
      logBtn.classList.remove("active");
      this.loadWorkoutHistory();
    } else {
      historyView.classList.add("hidden");
      formView.classList.remove("hidden");
      historyBtn.classList.remove("active");
      logBtn.classList.add("active");
      // We'll implement this when we create the workout form
      // this.renderWorkoutForm();
    }
  }

  getCurrentDate() {
    return new Date().toISOString().split("T")[0];
  }

  getDefaultStartDate() {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split("T")[0];
  }
}
