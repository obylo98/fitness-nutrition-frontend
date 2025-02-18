export default class WorkoutPage {
  constructor() {
    this.render();
    this.addEventListeners();
  }

  render() {
    const main = document.getElementById("main-content");
    main.innerHTML = `
      <div class="workout-container">
        <div class="workout-header">
          <h1>Workouts</h1>
          <div class="workout-actions">
            <button class="action-button primary">
              <i class="fas fa-plus"></i>
              New Workout
            </button>
            <button class="action-button secondary">
              <i class="fas fa-calendar-alt"></i>
              Calendar View
            </button>
          </div>
        </div>

        <div class="workout-stats">
          <div class="stat-card">
            <div class="stat-value">24</div>
            <div class="stat-label">Workouts This Month</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">1,250</div>
            <div class="stat-label">Total Minutes</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">8,500</div>
            <div class="stat-label">Calories Burned</div>
          </div>
        </div>

        <div class="workout-filters">
          <div class="filter-group">
            <select class="filter-select">
              <option value="all">All Types</option>
              <option value="strength">Strength</option>
              <option value="cardio">Cardio</option>
              <option value="hiit">HIIT</option>
            </select>
          </div>
          <div class="filter-group">
            <select class="filter-select">
              <option value="all">All Time</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>

        <div class="workouts-grid">
          <!-- Sample Workout Card -->
          <div class="workout-card">
            <div class="workout-card-header">
              <div class="workout-info">
                <h3>Morning Strength</h3>
                <div class="workout-meta">
                  <span><i class="far fa-clock"></i> 45 min</span>
                  <span><i class="fas fa-fire"></i> 320 cal</span>
                </div>
              </div>
              <span class="workout-type">Strength</span>
            </div>
            <div class="exercise-list">
              <div class="exercise-item">
                <span class="exercise-name">Bench Press</span>
                <div class="exercise-details">
                  <span>3 × 12</span>
                  <span>50 kg</span>
                </div>
              </div>
              <!-- More exercises... -->
            </div>
          </div>
          <!-- More workout cards... -->
        </div>
      </div>
    `;
  }

  addEventListeners() {
    // Add your event listeners here
  }
} 