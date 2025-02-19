import { API_BASE_URL } from '../config.js';
export default class FoodSearch {
  constructor(onSelect) {
    this.onSelect = onSelect;
    this.searchTimeout = null;
    this.filters = {
      type: "all",
      category: "all",
      maxCalories: "",
      minProtein: "",
      dietaryRestrictions: [],
      mealType: "all",
      preparationTime: "all",
    };
    this.render();
    this.addEventListeners();
  }

  render() {
    const modal = document.createElement("div");
    modal.className = "modal-overlay";
    modal.innerHTML = `
      <div class="modal-content food-search-modal">
        <div class="modal-header">
          <h3>Search Foods</h3>
          <button class="close-modal">&times;</button>
        </div>
        
        <div class="search-container">
          <div class="search-box">
            <input 
              type="text" 
              id="food-search-input"
              class="search-input" 
              placeholder="Search for foods..."
              autocomplete="off"
            >
          </div>

          <div id="search-results" class="search-results">
            <div class="initial-message">
              Start typing to search for foods...
            </div>
          </div>

          <div class="nutritionix-attribution">
            <span>Powered by</span>
            <img src="https://www.nutritionix.com/images/attribute_logo_white.png" alt="Nutritionix">
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  addEventListeners() {
    const modal = document.querySelector(".modal-overlay");
    const searchInput = document.getElementById("food-search-input");
    const closeBtn = modal.querySelector(".close-modal");

    searchInput.addEventListener("input", (e) => {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.handleSearch(e.target.value);
      }, 300);
    });

    closeBtn.addEventListener("click", () => this.closeModal(modal));
  }

  async handleSearch(query) {
    if (!query) {
      this.showInitialMessage();
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/nutrition/search?query=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Failed to search foods");
      }

      const data = await response.json();
      this.displayResults(data);
    } catch (error) {
      console.error("Error searching foods:", error);
      this.showError("Failed to search foods");
    }
  }

  displayResults(data) {
    const resultsContainer = document.getElementById("search-results");
    const { common = [], branded = [] } = data;

    if (common.length === 0 && branded.length === 0) {
      resultsContainer.innerHTML = `
        <div class="no-results">
          No foods found matching your search
        </div>
      `;
      return;
    }

    const commonResults = common.map(food => this.createFoodItem(food, 'common'));
    const brandedResults = branded.map(food => this.createFoodItem(food, 'branded'));

    resultsContainer.innerHTML = `
      ${common.length ? `
        <div class="results-section">
          <h4>Common Foods</h4>
          ${commonResults.join('')}
        </div>
      ` : ''}
      
      ${branded.length ? `
        <div class="results-section">
          <h4>Branded Foods</h4>
          ${brandedResults.join('')}
        </div>
      ` : ''}
    `;

    // Add click handlers
    resultsContainer.querySelectorAll('.food-result-item').forEach(item => {
      item.addEventListener('click', () => this.handleFoodSelect(item.dataset));
    });
  }

  createFoodItem(food, type) {
    const isBranded = type === 'branded';
    return `
      <div class="food-result-item" 
           data-food-name="${food.food_name}"
           data-food-id="${isBranded ? food.nix_item_id : food.food_name}"
           data-type="${type}">
        <div class="food-result-info">
          <span class="food-result-name">${food.food_name}</span>
          ${isBranded ? `<span class="food-result-brand">${food.brand_name}</span>` : ''}
        </div>
        ${food.photo?.thumb ? `
          <img src="${food.photo.thumb}" alt="${food.food_name}" class="food-thumbnail">
        ` : ''}
      </div>
    `;
  }

  async handleFoodSelect(foodData) {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/nutrition/nutrients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          query: foodData.foodName
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get food nutrients');
      }

      const nutrientData = await response.json();
      if (nutrientData.foods && nutrientData.foods.length > 0) {
        this.onSelect(nutrientData.foods[0]);
        this.closeModal(document.querySelector(".modal-overlay"));
      } else {
        throw new Error('No nutrient data found for this food');
      }
    } catch (error) {
      console.error('Error getting food nutrients:', error);
      this.showError('Failed to get food nutrients');
    }
  }

  showError(message) {
    const resultsContainer = document.getElementById("search-results");
    resultsContainer.innerHTML = `
      <div class="error-message">
        ${message}
      </div>
    `;
  }

  showInitialMessage() {
    const resultsContainer = document.getElementById("search-results");
    resultsContainer.innerHTML = `
      <div class="initial-message">
        Start typing to search for foods...
      </div>
    `;
  }

  closeModal(modal) {
    if (modal) {
      modal.remove();
    }
  }
}
