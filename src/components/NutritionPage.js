import FoodSearch from "./FoodSearch.js";
import NutritionGoals from "./NutritionGoals.js";
import MealTemplate from "./MealTemplate.js";
import NutritionRecommendations from "./NutritionRecommendations.js";

export default class NutritionPage {
  constructor() {
    this.userData = this.getUserData();
    this.recommendations = new NutritionRecommendations(this.userData);
    this.render();
    this.addEventListeners();
    this.loadDailyLogs();
  }

  getUserData() {
    // Get user data from localStorage or use default values
    const userData = JSON.parse(localStorage.getItem("user")) || {};
    return {
      weight: userData.weight || 70, // kg
      height: userData.height || 170, // cm
      age: userData.age || 30,
      gender: userData.gender || "male",
      activityLevel: userData.activityLevel || "moderate",
      goal: userData.goal || "maintain"
    };
  }

  render() {
    const main = document.getElementById("main-content");
    const recommendations = this.recommendations.getRecommendations();

    main.innerHTML = `
      <div class="nutrition-container">
        <section class="nutrition-header">
          <h1>Nutrition Dashboard</h1>
          <p class="header-subtitle">Personalized nutrition recommendations based on your goals</p>
          
          <!-- Add missing action buttons -->
          <div class="nutrition-actions">
            <button id="add-food-btn" class="btn primary">Add Food</button>
            <button id="view-templates-btn" class="btn">View Templates</button>
            <button id="set-goals-btn" class="btn">Set Goals</button>
          </div>
        </section>

        <!-- Add food log section -->
        <section class="food-log-section">
          <h2>Today's Food Log</h2>
          <div id="food-log-list" class="food-log-list">
            <!-- Food logs will be inserted here -->
          </div>
          
          <!-- Add nutrition totals -->
          <div class="nutrition-totals">
            <h3>Daily Totals</h3>
            <div class="totals-grid">
              <div class="total-item">
                <span class="label">Calories</span>
                <span id="total-calories" class="value">0</span>
              </div>
              <div class="total-item">
                <span class="label">Protein</span>
                <span id="total-protein" class="value">0g</span>
              </div>
              <div class="total-item">
                <span class="label">Carbs</span>
                <span id="total-carbs" class="value">0g</span>
              </div>
              <div class="total-item">
                <span class="label">Fats</span>
                <span id="total-fats" class="value">0g</span>
              </div>
            </div>
          </div>
        </section>

        <div class="nutrition-grid">
          <!-- Daily Targets Card -->
          <div class="nutrition-card daily-targets">
            <h2>Daily Targets</h2>
            <div class="macro-circles">
              <div class="macro-circle calories">
                <span class="macro-value">${recommendations.calories}</span>
                <span class="macro-label">Calories</span>
              </div>
              <div class="macro-distribution">
                <div class="macro-item protein" style="width: ${recommendations.distribution.protein}%">
                  <span class="macro-value">${recommendations.protein}g</span>
                  <span class="macro-label">Protein</span>
                </div>
                <div class="macro-item carbs" style="width: ${recommendations.distribution.carbs}%">
                  <span class="macro-value">${recommendations.carbs}g</span>
                  <span class="macro-label">Carbs</span>
                </div>
                <div class="macro-item fats" style="width: ${recommendations.distribution.fats}%">
                  <span class="macro-value">${recommendations.fats}g</span>
                  <span class="macro-label">Fats</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Meal Timing Card -->
          <div class="nutrition-card meal-timing">
            <h2>Meal Schedule</h2>
            <div class="meal-timeline">
              ${Object.entries(recommendations.mealDistribution)
                .map(([meal, details]) => `
                  <div class="meal-item">
                    <div class="meal-time">${details.timing}</div>
                    <div class="meal-name">${meal.replace(/([A-Z])/g, ' $1').trim()}</div>
                    <div class="meal-calories">${details.calories} calories</div>
                    <div class="meal-importance">${details.importance}</div>
                  </div>
                `).join('')}
            </div>
          </div>

          <!-- Hydration Card -->
          <div class="nutrition-card hydration">
            <h2>Hydration Guide</h2>
            <div class="daily-water">
              <i class="fas fa-tint"></i>
              <span>${recommendations.hydration.dailyWater}L daily</span>
            </div>
            <div class="water-schedule">
              ${recommendations.hydration.schedule
                .map(item => `
                  <div class="water-item">
                    <span class="water-time">${item.time}</span>
                    <span class="water-amount">${item.amount}</span>
                  </div>
                `).join('')}
            </div>
            <div class="hydration-tips">
              <h3>Tips</h3>
              <ul>
                ${recommendations.hydration.tips
                  .map(tip => `<li>${tip}</li>`)
                  .join('')}
              </ul>
            </div>
          </div>

          <!-- Supplementation Card -->
          <div class="nutrition-card supplements">
            <h2>Recommended Supplements</h2>
            <div class="supplements-list">
              ${recommendations.supplementation
                .map(supp => `
                  <div class="supplement-item">
                    <h3>${supp.name}</h3>
                    <div class="supplement-timing">
                      <i class="fas fa-clock"></i> ${supp.timing}
                    </div>
                    <div class="supplement-importance">
                      ${supp.importance}
                    </div>
                  </div>
                `).join('')}
            </div>
          </div>

          <!-- Micronutrients Card -->
          <div class="nutrition-card micronutrients">
            <h2>Essential Nutrients</h2>
            <div class="nutrients-grid">
              <div class="vitamins">
                <h3>Vitamins</h3>
                ${recommendations.micronutrients.vitamins
                  .map(vitamin => `
                    <div class="nutrient-item">
                      <div class="nutrient-header">
                        <h4>${vitamin.name}</h4>
                        <span>${vitamin.amount}</span>
                      </div>
                      <div class="nutrient-sources">
                        Sources: ${vitamin.sources.join(', ')}
                      </div>
                      <div class="nutrient-importance">
                        ${vitamin.importance}
                      </div>
                    </div>
                  `).join('')}
              </div>
              <div class="minerals">
                <h3>Minerals</h3>
                ${recommendations.micronutrients.minerals
                  .map(mineral => `
                    <div class="nutrient-item">
                      <div class="nutrient-header">
                        <h4>${mineral.name}</h4>
                        <span>${mineral.amount}</span>
                      </div>
                      <div class="nutrient-sources">
                        Sources: ${mineral.sources.join(', ')}
                      </div>
                      <div class="nutrient-importance">
                        ${mineral.importance}
                      </div>
                    </div>
                  `).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  addEventListeners() {
    document.getElementById("add-food-btn").addEventListener("click", () => {
      new FoodSearch(this.handleFoodAdd.bind(this));
    });

    document
      .getElementById("view-templates-btn")
      .addEventListener("click", () => {
        new MealTemplate(this.handleTemplateApply.bind(this));
      });

    document.getElementById("set-goals-btn").addEventListener("click", () => {
      new NutritionGoals(this.handleGoalsUpdate.bind(this));
    });

    // Add event listeners for interactive elements
    document.querySelectorAll('.meal-item').forEach(item => {
      item.addEventListener('click', () => {
        // Show meal details or suggestions
        this.showMealDetails(item.dataset.meal);
      });
    });

    // Add water tracking functionality
    document.querySelectorAll('.water-item').forEach(item => {
      item.addEventListener('click', () => {
        item.classList.toggle('completed');
        this.updateWaterProgress();
      });
    });
  }

  async loadDailyLogs() {
    try {
      const token = localStorage.getItem("token");
      const today = new Date().toISOString().split("T")[0];

      const response = await fetch(`/api/nutrition/logs/${today}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load food logs");
      }

      const logs = await response.json();
      this.displayFoodLogs(logs);
    } catch (error) {
      console.error("Error loading food logs:", error);
      this.showNoLogsMessage();
    }
  }

  displayFoodLogs(logs) {
    const logList = document.getElementById("food-log-list");
    if (!logs || logs.length === 0) {
      this.showNoLogsMessage();
      return;
    }

    let totalNutrition = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
    };

    const logHTML = logs
      .map((log) => {
        // Update totals
        totalNutrition.calories += log.calories;
        totalNutrition.protein += log.protein;
        totalNutrition.carbs += log.carbs;
        totalNutrition.fats += log.fats;

        return `
          <div class="food-log-item" data-id="${log.id}">
            <div class="food-info">
              <span class="food-name">${log.food_name}</span>
              <span class="serving-size">${log.serving_size}</span>
            </div>
            <div class="nutrition-info">
              <span class="calories">${log.calories} cal</span>
              <span class="macros">
                P: ${log.protein}g | C: ${log.carbs}g | F: ${log.fats}g
              </span>
            </div>
            <button class="delete-log" data-id="${log.id}">×</button>
          </div>
        `;
      })
      .join("");

    logList.innerHTML = logHTML;

    // Update summary
    document.getElementById("total-calories").textContent =
      totalNutrition.calories.toLocaleString();
    document.getElementById("total-protein").textContent = `${Math.round(
      totalNutrition.protein
    )}g`;
    document.getElementById("total-carbs").textContent = `${Math.round(
      totalNutrition.carbs
    )}g`;
    document.getElementById("total-fats").textContent = `${Math.round(
      totalNutrition.fats
    )}g`;

    // Add delete handlers
    logList.querySelectorAll(".delete-log").forEach((btn) => {
      btn.addEventListener("click", () => this.handleDeleteLog(btn.dataset.id));
    });
  }

  showNoLogsMessage() {
    const logList = document.getElementById("food-log-list");
    logList.innerHTML = `
      <div class="no-logs-message">
        <p>No food logged today</p>
        <p>Click "Add Food" to start tracking your nutrition</p>
      </div>
    `;
  }

  async handleFoodAdd(food) {
    try {
      const token = localStorage.getItem("token");
      // Format the food data to match our database structure
      const foodData = {
        food_name: food.food_name,
        serving_size: `${food.serving_qty} ${food.serving_unit}`,
        nutrients: {
          calories: food.nf_calories,
          protein: food.nf_protein,
          totalCarbs: food.nf_total_carbohydrate,
          totalFat: food.nf_total_fat
        }
      };

      const response = await fetch("/api/nutrition/log", {  // Note: changed from /logs to /log
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(foodData),
      });

      if (!response.ok) {
        throw new Error("Failed to add food");
      }

      await this.loadDailyLogs(); // Refresh the logs
    } catch (error) {
      console.error("Error adding food:", error);
      alert("Failed to add food");
    }
  }

  async handleDeleteLog(logId) {
    if (confirm("Are you sure you want to delete this food log?")) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`/api/nutrition/logs/${logId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to delete food log");
        }

        // Only refresh the logs if deletion was successful
        await this.loadDailyLogs();
        
      } catch (error) {
        console.error("Error deleting food log:", error);
        // Show user-friendly error message
        alert(error.message || "Failed to delete food log");
      }
    }
  }

  handleTemplateApply(foods) {
    foods.forEach((food) => this.handleFoodAdd(food));
  }

  handleGoalsUpdate() {
    this.loadDailyLogs(); // Refresh to show updated goals
  }

  showMealDetails(meal) {
    // Implementation for showing meal details modal
  }

  updateWaterProgress() {
    // Implementation for updating water tracking progress
  }
}
