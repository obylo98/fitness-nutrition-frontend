import ProgressChart from "./ProgressChart.js";
import DataExporter from "../services/DataExporter.js";

export default class MetricBreakdown {
  constructor(container, metric) {
    this.container = container;
    this.metric = metric;
    this.exporter = new DataExporter();
    this.render();
    this.loadData();
  }

  render() {
    this.container.innerHTML = `
      <div class="metric-breakdown">
        <div class="breakdown-header">
          <h3>${this.getMetricTitle()}</h3>
          <div class="breakdown-actions">
            <select id="breakdown-period">
              <option value="daily">Daily</option>
              <option value="weekly" selected>Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <div class="export-options">
              <button class="btn-export" data-format="csv">Export CSV</button>
              <button class="btn-export" data-format="json">Export JSON</button>
            </div>
          </div>
        </div>

        <div class="breakdown-content">
          <div class="trend-chart" id="trend-chart-${this.metric}"></div>
          
          <div class="breakdown-stats">
            <div class="stat-group">
              <div class="stat-item">
                <span class="stat-label">Current</span>
                <span class="stat-value" id="current-value">-</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Average</span>
                <span class="stat-value" id="average-value">-</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Peak</span>
                <span class="stat-value" id="peak-value">-</span>
              </div>
            </div>
            
            <div class="progress-indicator">
              <div class="progress-bar">
                <div class="progress-fill" id="progress-fill"></div>
              </div>
              <span class="progress-text" id="progress-text">0% of goal</span>
            </div>
          </div>

          <div class="breakdown-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Value</th>
                  <th>Change</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody id="breakdown-data">
                <tr>
                  <td colspan="4">Loading data...</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    this.addEventListeners();
  }

  addEventListeners() {
    const periodSelect = this.container.querySelector("#breakdown-period");
    periodSelect.addEventListener("change", () =>
      this.loadData(periodSelect.value)
    );

    this.container.querySelectorAll(".btn-export").forEach((btn) => {
      btn.addEventListener("click", () =>
        this.handleExport(btn.dataset.format)
      );
    });
  }

  async loadData(period = "weekly") {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/api/metrics/${this.metric}?period=${period}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load metric data");
      }

      const data = await response.json();
      this.updateDisplay(data);
    } catch (error) {
      console.error("Error loading metric data:", error);
    }
  }

  updateDisplay(data) {
    this.updateChart(data);
    this.updateStats(data);
    this.updateTable(data);
  }

  updateChart(data) {
    new ProgressChart(
      document.getElementById(`trend-chart-${this.metric}`),
      {
        labels: data.dates,
        datasets: [
          {
            label: this.getMetricTitle(),
            data: data.values,
          },
        ],
      },
      { type: "line" }
    );
  }

  updateStats(data) {
    const current = data.values[data.values.length - 1];
    const average = data.values.reduce((a, b) => a + b, 0) / data.values.length;
    const peak = Math.max(...data.values);
    const progress = (current / data.goal) * 100;

    document.getElementById("current-value").textContent =
      this.formatValue(current);
    document.getElementById("average-value").textContent =
      this.formatValue(average);
    document.getElementById("peak-value").textContent = this.formatValue(peak);

    document.getElementById("progress-fill").style.width = `${Math.min(
      progress,
      100
    )}%`;
    document.getElementById("progress-text").textContent = `${Math.round(
      progress
    )}% of goal`;
  }

  updateTable(data) {
    const tbody = document.getElementById("breakdown-data");
    tbody.innerHTML = data.dates
      .map((date, i) => {
        const change = i > 0 ? data.values[i] - data.values[i - 1] : 0;
        const changeClass =
          change > 0 ? "positive" : change < 0 ? "negative" : "";

        return `
        <tr>
          <td>${date}</td>
          <td>${this.formatValue(data.values[i])}</td>
          <td class="${changeClass}">${this.formatChange(change)}</td>
          <td>${data.notes[i] || "-"}</td>
        </tr>
      `;
      })
      .join("");
  }

  async handleExport(format) {
    try {
      await this.exporter.exportWorkouts(format);
    } catch (error) {
      console.error("Export failed:", error);
    }
  }

  getMetricTitle() {
    const titles = {
      weight: "Body Weight",
      calories: "Daily Calories",
      workouts: "Workout Frequency",
      duration: "Workout Duration",
    };
    return titles[this.metric] || this.metric;
  }

  formatValue(value) {
    const formats = {
      weight: (v) => `${v.toFixed(1)} kg`,
      calories: (v) => `${Math.round(v)} kcal`,
      workouts: (v) => `${v} sessions`,
      duration: (v) => `${Math.round(v)} min`,
    };
    return (formats[this.metric] || ((v) => v))(value);
  }

  formatChange(value) {
    if (value === 0) return "-";
    return value > 0 ? `+${this.formatValue(value)}` : this.formatValue(value);
  }
}
