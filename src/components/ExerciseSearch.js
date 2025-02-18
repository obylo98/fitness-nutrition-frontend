const API_BASE_URL = import.meta.env.VITE_API_URL || "https://fitness-nutrition-backend.onrender.com";

export default class ExerciseSearch {
  constructor(onSelect) {
    this.onSelect = onSelect;
    this.searchTimeout = null;
    this.selectedExercise = null;
  }

  render() {
    return `
      <div class="exercise-search">
        <div class="search-input-wrapper">
          <input 
            type="text" 
            class="exercise-search-input" 
            placeholder="Search exercises by name or target muscle..."
          >
          <div class="search-results"></div>
        </div>
        <div class="exercise-details"></div>
      </div>
    `;
  }

  attachTo(container) {
    container.insertAdjacentHTML("beforeend", this.render());
    this.addEventListeners(container);
  }

  addEventListeners(container) {
    const searchInput = container.querySelector(".exercise-search-input");
    const resultsContainer = container.querySelector(".search-results");

    searchInput.addEventListener("input", (e) => {
      clearTimeout(this.searchTimeout);
      const query = e.target.value.trim();

      if (query.length < 2) {
        resultsContainer.innerHTML = "";
        return;
      }

      this.searchTimeout = setTimeout(
        () => this.searchExercises(query, resultsContainer),
        300
      );
    });

    // Close results when clicking outside
    document.addEventListener("click", (e) => {
      if (!container.contains(e.target)) {
        resultsContainer.innerHTML = "";
      }
    });
  }

  async searchExercises(query, resultsContainer) {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/workout/exercises/search?query=${encodeURIComponent(query)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to search exercises");
      }

      const data = await response.json();
      this.displayResults(data, resultsContainer);
    } catch (error) {
      console.error("Error searching exercises:", error);
      resultsContainer.innerHTML = `
        <div class="search-error">
          Failed to search exercises. Please try again.
        </div>
      `;
    }
  }

  displayResults(data, container) {
    const { results: exercises, attribution } = data;

    if (exercises.length === 0) {
      container.innerHTML = `
        <div class="no-results">
          No exercises found. Try a different search term.
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="search-results-list">
        ${exercises.map(exercise => `
          <div class="search-result-item" data-id="${exercise.id}">
            <div class="exercise-info">
              <span class="exercise-name">${exercise.name}</span>
              <span class="exercise-category">${exercise.bodyPart} | ${exercise.equipment}</span>
            </div>
            <button class="view-details-btn">View Details</button>
          </div>
        `).join("")}
      </div>
      <div class="attribution">
        <span>${attribution.text}</span>
      </div>
    `;

    // Add click handlers for results
    container.querySelectorAll(".search-result-item").forEach((item) => {
      const viewDetailsBtn = item.querySelector(".view-details-btn");
      viewDetailsBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        await this.showExerciseDetails(item.dataset.id);
      });

      item.addEventListener("click", () => {
        this.onSelect(item.querySelector(".exercise-name").textContent);
        container.innerHTML = "";
      });
    });
  }

  async showExerciseDetails(exerciseId) {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/workout/exercises/${exerciseId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch exercise details");
      }

      const exercise = await response.json();
      const detailsContainer = document.querySelector(".exercise-details");
      
      detailsContainer.innerHTML = `
        <div class="exercise-detail-card">
          <h4>${exercise.name}</h4>
          <div class="exercise-media">
            <img src="${exercise.gifUrl}" alt="${exercise.name} demonstration" />
          </div>
          <div class="exercise-info-grid">
            <div class="info-item">
              <span class="label">Body Part:</span>
              <span class="value">${exercise.bodyPart}</span>
            </div>
            <div class="info-item">
              <span class="label">Target:</span>
              <span class="value">${exercise.target}</span>
            </div>
            <div class="info-item">
              <span class="label">Equipment:</span>
              <span class="value">${exercise.equipment}</span>
            </div>
          </div>
          <div class="exercise-instructions">
            <h5>Instructions:</h5>
            <ol>
              ${exercise.instructions.map(step => `<li>${step}</li>`).join("")}
            </ol>
          </div>
          <button class="select-exercise-btn">Select Exercise</button>
        </div>
      `;

      detailsContainer.querySelector(".select-exercise-btn").addEventListener("click", () => {
        this.onSelect(exercise.name);
        detailsContainer.innerHTML = "";
        document.querySelector(".search-results").innerHTML = "";
      });
    } catch (error) {
      console.error("Error fetching exercise details:", error);
    }
  }
}
