import ProgressChart from "./ProgressChart.js";

export default class ProgressTracker {
  constructor() {
    this.render();
    this.loadData();
  }

  render() {
    const main = document.getElementById("main-content");
    main.innerHTML = `
      <div class="progress-container">
        <div class="progress-header">
          <h2>Progress Tracking</h2>
          <div class="date-range">
            <select id="time-range">
              <option value="week">Last Week</option>
              <option value="month" selected>Last Month</option>
              <option value="3months">Last 3 Months</option>
              <option value="year">Last Year</option>
            </select>
          </div>
        </div>

        <div class="charts-grid">
          <div class="chart-card">
            <h3>Workout Progress</h3>
            <div id="workout-chart" class="chart-container"></div>
          </div>

          <div class="chart-card">
            <h3>Nutrition Overview</h3>
            <div id="nutrition-chart" class="chart-container"></div>
          </div>

          <div class="chart-card">
            <h3>Body Metrics</h3>
            <div id="metrics-chart" class="chart-container"></div>
          </div>

          <div class="chart-card">
            <h3>Goal Completion</h3>
            <div id="goals-chart" class="chart-container"></div>
          </div>
        </div>

        <div class="metrics-grid">
          <div class="metric-card">
            <span class="metric-value" id="total-workouts">0</span>
            <span class="metric-label">Total Workouts</span>
          </div>
          <div class="metric-card">
            <span class="metric-value" id="avg-duration">0</span>
            <span class="metric-label">Avg. Duration (min)</span>
          </div>
          <div class="metric-card">
            <span class="metric-value" id="calories-burned">0</span>
            <span class="metric-label">Calories Burned</span>
          </div>
          <div class="metric-card">
            <span class="metric-value" id="completion-rate">0%</span>
            <span class="metric-label">Goal Completion Rate</span>
          </div>
        </div>
      </div>
    `;

    this.addEventListeners();
  }

  addEventListeners() {
    const timeRange = document.getElementById("time-range");
    timeRange.addEventListener("change", () => this.loadData(timeRange.value));
  }

  async loadData(timeRange = "month") {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/progress?range=${timeRange}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      // Check if we have any data to display
      if (
        data.workouts.dates.length === 0 &&
        data.nutrition.dates.length === 0
      ) {
        this.showNoDataMessage();
        return;
      }

      this.updateCharts(data);
      this.updateMetrics(data.metrics);
    } catch (error) {
      console.error("Error loading progress data:", error);
      this.showNoDataMessage();
    }
  }

  updateCharts(data) {
    // Workout Progress Chart
    new ProgressChart(
      document.getElementById("workout-chart"),
      {
        labels: data.workouts.dates,
        datasets: [
          {
            label: "Duration",
            data: data.workouts.durations,
          },
          {
            label: "Intensity",
            data: data.workouts.intensities,
          },
        ],
      },
      { type: "line" }
    );

    // Nutrition Overview Chart
    new ProgressChart(
      document.getElementById("nutrition-chart"),
      {
        labels: ["Protein", "Carbs", "Fats"],
        datasets: [
          {
            label: "Macronutrients",
            data: [
              data.nutrition.protein,
              data.nutrition.carbs,
              data.nutrition.fats,
            ],
          },
        ],
      },
      { type: "pie" }
    );

    // Body Metrics Chart
    new ProgressChart(
      document.getElementById("metrics-chart"),
      {
        labels: data.metrics.dates,
        datasets: [
          {
            label: "Weight",
            data: data.metrics.weights,
          },
        ],
      },
      { type: "line" }
    );

    // Goal Completion Chart
    new ProgressChart(
      document.getElementById("goals-chart"),
      {
        labels: data.goals.categories,
        datasets: [
          {
            label: "Completion Rate",
            data: data.goals.completionRates,
          },
        ],
      },
      { type: "bar" }
    );
  }

  updateMetrics(data) {
    document.getElementById("total-workouts").textContent = data.totalWorkouts;
    document.getElementById("avg-duration").textContent = Math.round(
      data.avgDuration
    );
    document.getElementById("calories-burned").textContent =
      data.totalCalories.toLocaleString();
    document.getElementById("completion-rate").textContent = `${Math.round(
      data.goalCompletionRate
    )}%`;
  }

  showNoDataMessage() {
    const container = document.querySelector(".progress-container");
    if (container) {
      container.innerHTML = `
        <div class="no-data-message">
          <h3>No data available</h3>
          <p>Start logging your workouts and meals to see your progress!</p>
        </div>
      `;
    }
  }
}
