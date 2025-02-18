import GoalsModal from "./GoalsModal.js";
import FoodSearch from "./FoodSearch.js";
import NutritionGoals from "./NutritionGoals.js";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://fitness-nutrition-backend.onrender.com";

export default class NutritionTracker {
  constructor() {
    this.render();
    this.searchTimeout = null;
    this.loadDailyLogs();
  }

  render() {
    const main = document.getElementById("main-content");
    main.innerHTML = `
      <div class="nutrition-container">
        <div class="nutrition-header">
          <h2>Nutrition Tracking</h2>
          <div class="date-selector">
            <button class="btn-date prev-date">&lt;</button>
            <input type="date" id="log-date" value="${this.formatDate(
              new Date()
            )}">
            <button class="btn-date next-date">&gt;</button>
          </div>
        </div>

        <div class="nutrition-content">
          <div class="nutrition-summary">
            <div class="macro-circles">
              <div class="macro-circle calories">
                <svg viewBox="0 0 36 36" class="circular-chart">
                  <path class="circle-bg" d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"></path>
                  <path class="circle" stroke-dasharray="0, 100" d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"></path>
                </svg>
                <div class="macro-info">
                  <span class="macro-value" id="calories-value">0</span>
                  <span class="macro-label">Calories</span>
                  <span class="macro-goal" id="calories-goal"></span>
                </div>
              </div>
              <div class="macro-circle protein">
                <!-- Similar SVG structure for protein -->
              </div>
              <div class="macro-circle carbs">
                <!-- Similar SVG structure for carbs -->
              </div>
              <div class="macro-circle fats">
                <!-- Similar SVG structure for fats -->
              </div>
            </div>
          </div>

          <div class="food-logging">
            <div class="meal-section breakfast">
              <h3>Breakfast</h3>
              <div class="meal-items" data-meal="breakfast"></div>
              <button class="btn-add-food" data-meal="breakfast">Add Food</button>
            </div>
            <div class="meal-section lunch">
              <h3>Lunch</h3>
              <div class="meal-items" data-meal="lunch"></div>
              <button class="btn-add-food" data-meal="lunch">Add Food</button>
            </div>
            <div class="meal-section dinner">
              <h3>Dinner</h3>
              <div class="meal-items" data-meal="dinner"></div>
              <button class="btn-add-food" data-meal="dinner">Add Food</button>
            </div>
            <div class="meal-section snacks">
              <h3>Snacks</h3>
              <div class="meal-items" data-meal="snacks"></div>
              <button class="btn-add-food" data-meal="snacks">Add Food</button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.addEventListeners();
    this.initializeNutritionGoals();
  }

  addEventListeners() {
    const dateInput = document.getElementById("log-date");
    dateInput.addEventListener("change", () =>
      this.loadDailyLogs(dateInput.value)
    );

    document.querySelector(".prev-date").addEventListener("click", () => {
      const date = new Date(dateInput.value);
      date.setDate(date.getDate() - 1);
      dateInput.value = this.formatDate(date);
      this.loadDailyLogs(dateInput.value);
    });

    document.querySelector(".next-date").addEventListener("click", () => {
      const date = new Date(dateInput.value);
      date.setDate(date.getDate() + 1);
      dateInput.value = this.formatDate(date);
      this.loadDailyLogs(dateInput.value);
    });

    document.querySelectorAll(".btn-add-food").forEach((button) => {
      button.addEventListener("click", () => {
        this.showFoodSearch(button.dataset.meal);
      });
    });
  }

  async loadDailyLogs(date = this.formatDate(new Date())) {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/nutrition/logs/${date}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load nutrition logs");
      }

      const data = await response.json();
      this.updateNutritionDisplay(data);
    } catch (error) {
      console.error("Error loading nutrition logs:", error);
    }
  }

  updateNutritionDisplay(data) {
    // Update macro circles
    this.updateMacroCircle(
      "calories",
      data.totals.calories,
      data.goals.calories
    );
    this.updateMacroCircle("protein", data.totals.protein, data.goals.protein);
    this.updateMacroCircle("carbs", data.totals.carbs, data.goals.carbs);
    this.updateMacroCircle("fats", data.totals.fats, data.goals.fats);

    // Update meal sections
    ["breakfast", "lunch", "dinner", "snacks"].forEach((meal) => {
      const mealItems = document.querySelector(
        `.meal-items[data-meal="${meal}"]`
      );
      mealItems.innerHTML = data.meals[meal]
        .map(
          (item) => `
          <div class="food-item">
            <div class="food-info">
              <span class="food-name">${item.name}</span>
              <span class="food-amount">${item.amount}g</span>
            </div>
            <div class="food-macros">
              <span>${item.calories} cal</span>
              <span>${item.protein}p</span>
              <span>${item.carbs}c</span>
              <span>${item.fats}f</span>
            </div>
            <button class="btn-remove-food" data-id="${item.id}">&times;</button>
          </div>
        `
        )
        .join("");
    });

    // Add event listeners for remove buttons
    document.querySelectorAll(".btn-remove-food").forEach((button) => {
      button.addEventListener("click", () =>
        this.removeFood(button.dataset.id)
      );
    });
  }

  updateMacroCircle(macro, value, goal) {
    const percentage = Math.min((value / goal) * 100, 100);
    const circle = document.querySelector(`.macro-circle.${macro} .circle`);
    circle.setAttribute("stroke-dasharray", `${percentage}, 100`);

    document.getElementById(`${macro}-value`).textContent = Math.round(value);
    document.getElementById(`${macro}-goal`).textContent = `/${goal}`;
  }

  showFoodSearch(meal) {
    const foodSearch = new FoodSearch(async (food) => {
      await this.addFood(food, meal);
      this.loadDailyLogs(document.getElementById("log-date").value);
    });
  }

  async addFood(food, meal) {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/nutrition/logs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: document.getElementById("log-date").value,
          meal,
          food,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add food");
      }
    } catch (error) {
      console.error("Error adding food:", error);
    }
  }

  async removeFood(id) {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/nutrition/logs/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to remove food");
      }

      this.loadDailyLogs(document.getElementById("log-date").value);
    } catch (error) {
      console.error("Error removing food:", error);
    }
  }

  initializeNutritionGoals() {
    new NutritionGoals(() => {
      this.loadDailyLogs(document.getElementById("log-date").value);
    });
  }

  formatDate(date) {
    return date.toISOString().split("T")[0];
  }

  async handleSearch(event) {
    const searchInput = document.getElementById("food-search");
    const query = searchInput.value.trim();

    if (query.length < 2) {
      document.getElementById("search-results").innerHTML = "";
      return;
    }

    // Clear previous timeout
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    // Add debounce to prevent too many API calls
    this.searchTimeout = setTimeout(async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/nutrition/search/${query}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to search foods");
        }

        const data = await response.json();
        this.displaySearchResults(data.common || []);
      } catch (error) {
        console.error("Search error:", error);
        this.showError("Failed to search foods");
      }
    }, 300);
  }

  displaySearchResults(foods) {
    const resultsDiv = document.getElementById("search-results");
    resultsDiv.innerHTML = foods
      .map(
        (food) => `
        <div class="food-item" data-food='${JSON.stringify(food)}'>
          <div class="food-info">
            <span class="food-name">${food.food_name}</span>
            <span class="serving-size">Serving: ${food.serving_qty} ${
          food.serving_unit
        }</span>
          </div>
          <button class="add-food-btn">Add</button>
        </div>
      `
      )
      .join("");

    // Add click handlers for the Add buttons
    resultsDiv.querySelectorAll(".add-food-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const foodData = JSON.parse(
          e.target.closest(".food-item").dataset.food
        );
        this.logFood(foodData);
      });
    });
  }

  async logFood(foodData) {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/nutrition/log`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          food_name: foodData.food_name,
          calories: foodData.nf_calories,
          protein: foodData.nf_protein,
          carbs: foodData.nf_total_carbohydrate,
          fats: foodData.nf_total_fat,
          serving_size: `${foodData.serving_qty} ${foodData.serving_unit}`,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to log food");
      }

      // Clear search and reload logs
      document.getElementById("food-search").value = "";
      document.getElementById("search-results").innerHTML = "";
      this.loadFoodLogs();
    } catch (error) {
      console.error("Error logging food:", error);
      this.showError("Failed to log food");
    }
  }

  async loadFoodLogs() {
    try {
      const date = document.getElementById("log-date").value;
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/nutrition/logs/${date}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch food logs");
      }

      const logs = await response.json();
      this.displayFoodLogs(logs);
      this.updateNutritionTotals(logs);
    } catch (error) {
      console.error("Error loading food logs:", error);
      this.showError("Failed to load food logs");
    }
  }

  displayFoodLogs(logs) {
    const entriesDiv = document.getElementById("food-entries");
    entriesDiv.innerHTML = logs
      .map(
        (log) => `
        <div class="food-entry">
          <div class="food-entry-info">
            <span class="entry-name">${log.food_name}</span>
            <span class="entry-serving">${log.serving_size}</span>
          </div>
          <div class="entry-nutrients">
            <span>${Math.round(log.calories)} cal</span>
            <span>${log.protein}g protein</span>
            <span>${log.carbs}g carbs</span>
            <span>${log.fats}g fats</span>
          </div>
          <button class="delete-entry" data-id="${log.id}">&times;</button>
        </div>
      `
      )
      .join("");

    // Add delete handlers
    entriesDiv.querySelectorAll(".delete-entry").forEach((btn) => {
      btn.addEventListener("click", () => this.deleteEntry(btn.dataset.id));
    });
  }

  updateNutritionTotals(logs) {
    const totals = logs.reduce(
      (acc, log) => ({
        calories: acc.calories + Number(log.calories),
        protein: acc.protein + Number(log.protein),
        carbs: acc.carbs + Number(log.carbs),
        fats: acc.fats + Number(log.fats),
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );

    document.getElementById("total-calories").textContent = Math.round(
      totals.calories
    );
    document.getElementById(
      "total-protein"
    ).textContent = `${totals.protein.toFixed(1)}g`;
    document.getElementById(
      "total-carbs"
    ).textContent = `${totals.carbs.toFixed(1)}g`;
    document.getElementById("total-fats").textContent = `${totals.fats.toFixed(
      1
    )}g`;
  }

  async loadNutritionGoals() {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/nutrition/goals`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch nutrition goals");
      }

      const goals = await response.json();
      this.displayNutritionGoals(goals);
    } catch (error) {
      console.error("Error loading nutrition goals:", error);
    }
  }

  displayNutritionGoals(goals) {
    if (goals) {
      document.getElementById(
        "calorie-goal"
      ).textContent = `/${goals.calorie_goal}`;
      document.getElementById(
        "protein-goal"
      ).textContent = `/${goals.protein_goal}g`;
      document.getElementById(
        "carbs-goal"
      ).textContent = `/${goals.carbs_goal}g`;
      document.getElementById("fats-goal").textContent = `/${goals.fats_goal}g`;
    }
  }

  async deleteEntry(id) {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/nutrition/log/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete entry");
      }

      this.loadFoodLogs();
    } catch (error) {
      console.error("Error deleting entry:", error);
      this.showError("Failed to delete entry");
    }
  }

  showError(message) {
    // You could implement a more sophisticated error display system
    alert(message);
  }

  async showGoalsModal() {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/nutrition/goals`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      let currentGoals = null;
      if (response.ok) {
        currentGoals = await response.json();
      }

      new GoalsModal(currentGoals, (goals) => this.saveGoals(goals));
    } catch (error) {
      console.error("Error fetching current goals:", error);
      this.showError("Failed to load current goals");
    }
  }

  async saveGoals(goals) {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/nutrition/goals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(goals),
      });

      if (!response.ok) {
        throw new Error("Failed to save goals");
      }

      const savedGoals = await response.json();
      this.displayNutritionGoals(savedGoals);
      this.showSuccess("Goals updated successfully");
    } catch (error) {
      console.error("Error saving goals:", error);
      this.showError("Failed to save goals");
    }
  }

  showSuccess(message) {
    // Implement a success message display
    alert(message); // Replace with a better UI notification
  }
}
