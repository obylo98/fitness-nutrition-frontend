import ProgressChart from "./ProgressChart.js";

export default class ComparisonView {
  constructor(container, metric) {
    this.container = container;
    this.metric = metric;
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="comparison-view">
        <div class="comparison-header">
          <h3>Compare Periods</h3>
          <div class="period-selectors">
            <div class="period-group">
              <label>Period 1</label>
              <input type="date" id="period1-start">
              <input type="date" id="period1-end">
            </div>
            <div class="period-group">
              <label>Period 2</label>
              <input type="date" id="period2-start">
              <input type="date" id="period2-end">
            </div>
            <button class="btn-compare">Compare</button>
          </div>
        </div>

        <div class="comparison-content">
          <div class="comparison-chart" id="comparison-chart"></div>
          
          <div class="comparison-stats">
            <div class="comparison-card period1">
              <h4>Period 1</h4>
              <div class="stat-rows"></div>
            </div>
            <div class="comparison-card difference">
              <h4>Difference</h4>
              <div class="stat-rows"></div>
            </div>
            <div class="comparison-card period2">
              <h4>Period 2</h4>
              <div class="stat-rows"></div>
            </div>
          </div>

          <div class="insights-panel">
            <h4>Key Insights</h4>
            <ul id="insights-list"></ul>
          </div>
        </div>
      </div>
    `;

    this.addEventListeners();
  }

  addEventListeners() {
    const compareBtn = this.container.querySelector(".btn-compare");
    compareBtn.addEventListener("click", () => this.compareData());

    // Set default date ranges (last month vs current month)
    const today = new Date();
    const firstDayThisMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );
    const lastDayThisMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0
    );
    const firstDayLastMonth = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1
    );
    const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    this.container.querySelector("#period1-start").value =
      this.formatDate(firstDayLastMonth);
    this.container.querySelector("#period1-end").value =
      this.formatDate(lastDayLastMonth);
    this.container.querySelector("#period2-start").value =
      this.formatDate(firstDayThisMonth);
    this.container.querySelector("#period2-end").value =
      this.formatDate(lastDayThisMonth);
  }

  async compareData() {
    const period1Start = this.container.querySelector("#period1-start").value;
    const period1End = this.container.querySelector("#period1-end").value;
    const period2Start = this.container.querySelector("#period2-start").value;
    const period2End = this.container.querySelector("#period2-end").value;

    try {
      const data = await this.fetchComparisonData(
        period1Start,
        period1End,
        period2Start,
        period2End
      );
      this.updateComparison(data);
    } catch (error) {
      console.error("Error comparing data:", error);
    }
  }

  async fetchComparisonData(start1, end1, start2, end2) {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `/api/metrics/${this.metric}/compare?start1=${start1}&end1=${end1}&start2=${start2}&end2=${end2}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch comparison data");
    }

    return await response.json();
  }

  updateComparison(data) {
    this.updateChart(data);
    this.updateStats(data);
    this.updateInsights(data);
  }

  updateChart(data) {
    new ProgressChart(
      document.getElementById("comparison-chart"),
      {
        labels: [...data.period1.dates, ...data.period2.dates],
        datasets: [
          {
            label: "Period 1",
            data: [
              ...data.period1.values,
              ...new Array(data.period2.dates.length).fill(null),
            ],
          },
          {
            label: "Period 2",
            data: [
              ...new Array(data.period1.dates.length).fill(null),
              ...data.period2.values,
            ],
          },
        ],
      },
      { type: "line" }
    );
  }

  updateStats(data) {
    const stats = this.calculateStats(data);

    ["period1", "period2", "difference"].forEach((period) => {
      const container = this.container.querySelector(`.${period} .stat-rows`);
      container.innerHTML = this.generateStatsHTML(stats[period]);
    });
  }

  calculateStats(data) {
    const period1Stats = this.calculatePeriodStats(data.period1.values);
    const period2Stats = this.calculatePeriodStats(data.period2.values);

    return {
      period1: period1Stats,
      period2: period2Stats,
      difference: {
        average: period2Stats.average - period1Stats.average,
        peak: period2Stats.peak - period1Stats.peak,
        total: period2Stats.total - period1Stats.total,
        consistency: period2Stats.consistency - period1Stats.consistency,
      },
    };
  }

  calculatePeriodStats(values) {
    return {
      average: values.reduce((a, b) => a + b, 0) / values.length,
      peak: Math.max(...values),
      total: values.reduce((a, b) => a + b, 0),
      consistency: this.calculateConsistency(values),
    };
  }

  calculateConsistency(values) {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance =
      values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    return (1 - Math.sqrt(variance) / mean) * 100;
  }

  generateStatsHTML(stats) {
    return `
      <div class="stat-row">
        <span class="stat-label">Average</span>
        <span class="stat-value">${this.formatValue(stats.average)}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Peak</span>
        <span class="stat-value">${this.formatValue(stats.peak)}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Total</span>
        <span class="stat-value">${this.formatValue(stats.total)}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Consistency</span>
        <span class="stat-value">${stats.consistency.toFixed(1)}%</span>
      </div>
    `;
  }

  updateInsights(data) {
    const insights = this.generateInsights(data);
    const insightsList = this.container.querySelector("#insights-list");
    insightsList.innerHTML = insights
      .map(
        (insight) => `
      <li class="insight-item ${insight.type}">
        <span class="insight-icon">${this.getInsightIcon(insight.type)}</span>
        <span class="insight-text">${insight.text}</span>
      </li>
    `
      )
      .join("");
  }

  generateInsights(data) {
    const stats = this.calculateStats(data);
    const insights = [];

    // Average comparison
    const avgDiff = stats.difference.average;
    insights.push({
      type: avgDiff > 0 ? "positive" : avgDiff < 0 ? "negative" : "neutral",
      text: `Average ${this.metric} ${Math.abs(avgDiff).toFixed(1)}${
        avgDiff > 0 ? " higher" : " lower"
      } in Period 2`,
    });

    // Consistency comparison
    const consistencyDiff = stats.difference.consistency;
    if (Math.abs(consistencyDiff) > 5) {
      insights.push({
        type: consistencyDiff > 0 ? "positive" : "negative",
        text: `${Math.abs(consistencyDiff).toFixed(1)}% ${
          consistencyDiff > 0 ? "more" : "less"
        } consistent in Period 2`,
      });
    }

    return insights;
  }

  getInsightIcon(type) {
    const icons = {
      positive: "📈",
      negative: "📉",
      neutral: "📊",
    };
    return icons[type] || "📋";
  }

  formatDate(date) {
    return date.toISOString().split("T")[0];
  }

  formatValue(value) {
    const formats = {
      weight: (v) => `${v.toFixed(1)} kg`,
      calories: (v) => `${Math.round(v)} kcal`,
      workouts: (v) => `${Math.round(v)} sessions`,
      duration: (v) => `${Math.round(v)} min`,
    };
    return (formats[this.metric] || ((v) => v.toFixed(1)))(value);
  }
}
