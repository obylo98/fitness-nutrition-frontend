export default class HomePage {
  constructor() {
    this.render();
    this.addEventListeners();
  }

  render() {
    const main = document.getElementById("main-content");
    main.innerHTML = `
      <div class="home-container">
        <section class="hero-section">
          <h1>Welcome to FitTrack</h1>
          <p>Your personal fitness and nutrition companion</p>
        </section>

        <section class="features-grid">
          <div class="feature-card" data-route="workout/new">
            <div class="feature-icon">
              <i class="fas fa-dumbbell"></i>
            </div>
            <h3>Start Workout</h3>
            <p>Log your exercises and track your progress</p>
          </div>

          <div class="feature-card" data-route="nutrition">
            <div class="feature-icon">
              <i class="fas fa-apple-alt"></i>
            </div>
            <h3>Track Nutrition</h3>
            <p>Monitor your daily meals and calories</p>
          </div>

          <div class="feature-card" data-route="workout/history">
            <div class="feature-icon">
              <i class="fas fa-history"></i>
            </div>
            <h3>Workout History</h3>
            <p>View your past workouts and achievements</p>
          </div>

          <div class="feature-card" data-route="progress">
            <div class="feature-icon">
              <i class="fas fa-chart-line"></i>
            </div>
            <h3>Progress Tracker</h3>
            <p>Visualize your fitness journey</p>
          </div>
        </section>

        <section class="quick-actions">
          <h2>Quick Actions</h2>
          <div class="actions-grid">
            <button class="action-btn" data-route="workout/new">
              <i class="fas fa-plus-circle"></i>
              New Workout
            </button>
            <button class="action-btn" data-route="nutrition">
              <i class="fas fa-utensils"></i>
              Log Meal
            </button>
            <button class="action-btn" data-route="profile">
              <i class="fas fa-cog"></i>
              Settings
            </button>
          </div>
        </section>
      </div>
    `;
  }

  addEventListeners() {
    // Handle feature card clicks
    document.querySelectorAll('.feature-card').forEach(card => {
      card.addEventListener('click', () => {
        const route = card.dataset.route;
        if (route) {
          if (!localStorage.getItem('token')) {
            window.location.hash = 'login';
            return;
          }
          window.location.hash = route;
        }
      });
    });

    // Handle quick action button clicks
    document.querySelectorAll('.action-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const route = btn.dataset.route;
        if (route) {
          if (!localStorage.getItem('token')) {
            window.location.hash = 'login';
            return;
          }
          window.location.hash = route;
        }
      });
    });
  }
}
