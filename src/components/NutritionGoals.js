export default class NutritionGoals {
  constructor(onUpdate) {
    this.onUpdate = onUpdate;
    this.render();
    this.loadGoals();
  }

  async loadGoals() {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/nutrition/goals", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Failed to load nutrition goals");
      }

      const goals = await response.json();
      this.populateForm(goals);
    } catch (error) {
      console.error("Error loading goals:", error);
      this.showError("Failed to load nutrition goals");
    }
  }

  populateForm(goals) {
    const form = document.getElementById("nutrition-goals-form");
    if (form) {
      form.querySelector("#calorie-goal").value = goals.calorie_goal || 2000;
      form.querySelector("#protein-goal").value = goals.protein_goal || 50;
      form.querySelector("#carbs-goal").value = goals.carbs_goal || 250;
      form.querySelector("#fats-goal").value = goals.fats_goal || 70;
    }
  }

  render() {
    const modal = document.createElement("div");
    modal.className = "modal-overlay";
    modal.innerHTML = `
      <div class="modal-content nutrition-goals-modal">
        <div class="modal-header">
          <h3>Set Nutrition Goals</h3>
          <button class="close-modal">&times;</button>
        </div>
        
        <form id="nutrition-goals-form" class="goals-form">
          <div class="form-group">
            <label for="calorie-goal">Daily Calories (kcal)</label>
            <input type="number" id="calorie-goal" name="calorie_goal" min="0" required>
          </div>
          
          <div class="form-group">
            <label for="protein-goal">Protein (g)</label>
            <input type="number" id="protein-goal" name="protein_goal" min="0" required>
          </div>
          
          <div class="form-group">
            <label for="carbs-goal">Carbohydrates (g)</label>
            <input type="number" id="carbs-goal" name="carbs_goal" min="0" required>
          </div>
          
          <div class="form-group">
            <label for="fats-goal">Fats (g)</label>
            <input type="number" id="fats-goal" name="fats_goal" min="0" required>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-primary">Save Goals</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);
    this.addEventListeners(modal);
  }

  addEventListeners(modal) {
    const form = modal.querySelector("#nutrition-goals-form");
    const closeBtn = modal.querySelector(".close-modal");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      await this.handleSubmit(form);
    });

    closeBtn.addEventListener("click", () => {
      modal.remove();
    });
  }

  async handleSubmit(form) {
    try {
      const formData = new FormData(form);
      const goals = {
        calorie_goal: parseInt(formData.get("calorie_goal")),
        protein_goal: parseInt(formData.get("protein_goal")),
        carbs_goal: parseInt(formData.get("carbs_goal")),
        fats_goal: parseInt(formData.get("fats_goal"))
      };

      const token = localStorage.getItem("token");
      const response = await fetch("/api/nutrition/goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(goals)
      });

      if (!response.ok) {
        throw new Error("Failed to save nutrition goals");
      }

      this.onUpdate();
      document.querySelector(".modal-overlay").remove();
    } catch (error) {
      console.error("Error saving goals:", error);
      this.showError("Failed to save nutrition goals");
    }
  }

  showError(message) {
    const form = document.getElementById("nutrition-goals-form");
    const existingError = form.querySelector(".error-message");
    if (existingError) {
      existingError.remove();
    }

    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.textContent = message;
    form.insertBefore(errorDiv, form.firstChild);
  }
}
