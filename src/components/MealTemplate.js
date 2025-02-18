const API_BASE_URL = import.meta.env.VITE_API_URL || "https://fitness-nutrition-backend.onrender.com";

export default class MealTemplate {
  constructor(onApply) {
    this.onApply = onApply;
    this.render();
    this.loadTemplates();
  }

  render() {
    const modal = document.createElement("div");
    modal.className = "modal-overlay";
    modal.innerHTML = `
      <div class="modal-content meal-template-modal">
        <div class="modal-header">
          <h3>Meal Templates</h3>
          <button class="close-modal">&times;</button>
        </div>
        
        <div class="template-container">
          <div class="template-actions">
            <button id="create-template-btn" class="btn-primary">
              Create New Template
            </button>
          </div>

          <div id="templates-list" class="templates-list">
            <div class="loading">Loading templates...</div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.addEventListeners(modal);
  }

  addEventListeners(modal) {
    const closeBtn = modal.querySelector(".close-modal");
    const createBtn = modal.querySelector("#create-template-btn");

    closeBtn.addEventListener("click", () => {
      modal.remove();
    });

    createBtn.addEventListener("click", () => {
      this.showCreateTemplateForm();
    });
  }

  showCreateTemplateForm() {
    const container = document.querySelector(".template-container");
    container.innerHTML = `
      <form id="template-form" class="template-form">
        <div class="form-group">
          <label for="template-name">Template Name</label>
          <input type="text" id="template-name" name="name" required>
        </div>

        <div class="foods-container">
          <h4>Add Foods</h4>
          <div id="template-foods" class="template-foods"></div>
          <button type="button" id="add-food-btn" class="btn-secondary">
            Add Food
          </button>
        </div>

        <div class="form-actions">
          <button type="button" id="cancel-template" class="btn-secondary">Cancel</button>
          <button type="submit" class="btn-primary">Save Template</button>
        </div>
      </form>
    `;

    this.addTemplateFormListeners();
  }

  addTemplateFormListeners() {
    const form = document.getElementById("template-form");
    const addFoodBtn = document.getElementById("add-food-btn");
    const cancelBtn = document.getElementById("cancel-template");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      await this.handleTemplateSubmit(form);
    });

    addFoodBtn.addEventListener("click", () => {
      new FoodSearch((food) => this.addFoodToTemplate(food));
    });

    cancelBtn.addEventListener("click", () => {
      this.loadTemplates();
    });
  }

  async loadTemplates() {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/nutrition/templates`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Failed to load templates");
      }

      const templates = await response.json();
      this.displayTemplates(templates);
    } catch (error) {
      console.error("Error loading templates:", error);
      this.showError("Failed to load templates");
    }
  }

  displayTemplates(templates) {
    const container = document.querySelector(".template-container");
    
    if (templates.length === 0) {
      container.innerHTML = `
        <div class="template-actions">
          <button id="create-template-btn" class="btn-primary">
            Create New Template
          </button>
        </div>
        <div class="no-templates">
          <p>No meal templates found</p>
          <p>Create a template to save your favorite meal combinations</p>
        </div>
      `;
      
      container.querySelector("#create-template-btn")
        .addEventListener("click", () => this.showCreateTemplateForm());
      return;
    }

    const templatesList = templates.map(template => `
      <div class="template-item" data-id="${template.id}">
        <div class="template-info">
          <h4>${template.name}</h4>
          <div class="template-stats">
            ${this.getTemplateStats(template.foods)}
          </div>
        </div>
        <div class="template-actions">
          <button class="apply-template" data-id="${template.id}">Apply</button>
          <button class="delete-template" data-id="${template.id}">&times;</button>
        </div>
      </div>
    `).join("");

    container.innerHTML = `
      <div class="template-actions">
        <button id="create-template-btn" class="btn-primary">
          Create New Template
        </button>
      </div>
      <div class="templates-list">
        ${templatesList}
      </div>
    `;

    this.addTemplateListeners();
  }

  getTemplateStats(foods) {
    const totals = foods.reduce((acc, food) => ({
      calories: acc.calories + food.calories,
      protein: acc.protein + food.protein,
      carbs: acc.carbs + food.carbs,
      fats: acc.fats + food.fats
    }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

    return `
      <span>${Math.round(totals.calories)} cal</span>
      <span>P: ${Math.round(totals.protein)}g</span>
      <span>C: ${Math.round(totals.carbs)}g</span>
      <span>F: ${Math.round(totals.fats)}g</span>
    `;
  }

  addTemplateListeners() {
    const createBtn = document.getElementById("create-template-btn");
    const applyBtns = document.querySelectorAll(".apply-template");
    const deleteBtns = document.querySelectorAll(".delete-template");

    createBtn.addEventListener("click", () => this.showCreateTemplateForm());

    applyBtns.forEach(btn => {
      btn.addEventListener("click", () => this.applyTemplate(btn.dataset.id));
    });

    deleteBtns.forEach(btn => {
      btn.addEventListener("click", () => this.deleteTemplate(btn.dataset.id));
    });
  }

  async handleTemplateSubmit(form) {
    try {
      const formData = new FormData(form);
      const template = {
        name: formData.get("name"),
        foods: this.templateFoods || []
      };

      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/nutrition/templates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(template)
      });

      if (!response.ok) {
        throw new Error("Failed to save template");
      }

      await this.loadTemplates();
    } catch (error) {
      console.error("Error saving template:", error);
      this.showError("Failed to save template");
    }
  }

  addFoodToTemplate(food) {
    const foodsContainer = document.getElementById("template-foods");
    const foodItem = document.createElement("div");
    foodItem.className = "template-food-item";
    foodItem.innerHTML = `
      <span>${food.food_name}</span>
      <span>${food.serving_size}</span>
      <button type="button" class="remove-food">&times;</button>
    `;

    foodsContainer.appendChild(foodItem);

    foodItem.querySelector(".remove-food").addEventListener("click", () => {
      foodItem.remove();
    });

    this.templateFoods = this.templateFoods || [];
    this.templateFoods.push(food);
  }

  async applyTemplate(templateId) {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/nutrition/templates/${templateId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Failed to load template");
      }

      const template = await response.json();
      this.onApply(template.foods);
      document.querySelector(".modal-overlay").remove();
    } catch (error) {
      console.error("Error applying template:", error);
      this.showError("Failed to apply template");
    }
  }

  async deleteTemplate(templateId) {
    if (confirm("Are you sure you want to delete this template?")) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/nutrition/templates/${templateId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error("Failed to delete template");
        }

        await this.loadTemplates();
      } catch (error) {
        console.error("Error deleting template:", error);
        this.showError("Failed to delete template");
      }
    }
  }

  showError(message) {
    const container = document.querySelector(".template-container");
    const existingError = container.querySelector(".error-message");
    if (existingError) {
      existingError.remove();
    }

    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.textContent = message;
    container.insertBefore(errorDiv, container.firstChild);
  }
}
