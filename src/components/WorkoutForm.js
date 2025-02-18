import ExerciseSearch from "./ExerciseSearch.js";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://fitness-nutrition-backend.onrender.com";

export default class WorkoutForm {
  constructor(onSave) {
    this.onSave = onSave;
    this.exercises = [];
    this.render();
  }

  render() {
    const modal = document.createElement("div");
    modal.className = "modal-overlay";
    modal.innerHTML = `
      <div class="modal-content workout-form">
        <div class="modal-header">
          <h3>Log Workout</h3>
          <button class="close-modal">&times;</button>
        </div>
        
        <form id="workout-form">
          <div class="form-group">
            <label for="workout-name">Workout Name</label>
            <input type="text" id="workout-name" name="name" placeholder="e.g., Morning Cardio">
          </div>

          <div class="form-group">
            <label for="workout-date">Date</label>
            <input type="date" id="workout-date" name="date" required value="${
              new Date().toISOString().split("T")[0]
            }">
          </div>

          <div class="form-group">
            <label for="workout-duration">Duration (minutes)</label>
            <input type="number" id="workout-duration" name="duration" min="1" required>
          </div>

          <div class="exercises-section">
            <div class="section-header">
              <h4>Exercises</h4>
              <button type="button" id="add-exercise-btn" class="btn-secondary">
                Add Exercise
              </button>
            </div>
            <div id="exercise-list"></div>
          </div>

          <div class="form-group">
            <label for="workout-notes">Notes</label>
            <textarea id="workout-notes" name="notes" rows="3"></textarea>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary cancel-btn">Cancel</button>
            <button type="submit" class="btn-primary">Save Workout</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);
    this.addEventListeners(modal);
    this.addExercise(); // Add first exercise by default
  }

  addEventListeners(modal) {
    const form = modal.querySelector("#workout-form");
    const closeBtn = modal.querySelector(".close-modal");
    const cancelBtn = modal.querySelector(".cancel-btn");
    const addExerciseBtn = modal.querySelector("#add-exercise-btn");

    form.addEventListener("submit", (e) => this.handleSubmit(e, modal));
    closeBtn.addEventListener("click", () => this.closeModal(modal));
    cancelBtn.addEventListener("click", () => this.closeModal(modal));
    addExerciseBtn.addEventListener("click", () => this.addExercise());
    modal.addEventListener("click", (e) => {
      if (e.target === modal) this.closeModal(modal);
    });
  }

  addExercise() {
    const exerciseList = document.getElementById("exercise-list");
    const exerciseId = Date.now();

    const exerciseHtml = `
      <div class="exercise-form" data-id="${exerciseId}">
        <div class="exercise-form-header">
          <h5>Exercise ${this.exercises.length + 1}</h5>
          <button type="button" class="remove-exercise" data-id="${exerciseId}">&times;</button>
        </div>
        
        <div class="exercise-form-content">
          <div class="form-group exercise-name-group">
            <label>Exercise Name</label>
            <div class="exercise-search-container"></div>
          </div>
          
          <div class="exercise-details">
            <div class="form-group">
              <label>Sets</label>
              <input type="number" class="exercise-sets" min="1">
            </div>
            
            <div class="form-group">
              <label>Reps</label>
              <input type="number" class="exercise-reps" min="1">
            </div>
            
            <div class="form-group">
              <label>Weight (kg)</label>
              <input type="number" class="exercise-weight" min="0" step="0.5">
            </div>
          </div>
          
          <div class="form-group">
            <label>Notes</label>
            <input type="text" class="exercise-notes">
          </div>
        </div>
      </div>
    `;

    exerciseList.insertAdjacentHTML("beforeend", exerciseHtml);

    // Initialize exercise search
    const searchContainer = exerciseList.querySelector(
      `.exercise-form[data-id="${exerciseId}"] .exercise-search-container`
    );
    const exerciseSearch = new ExerciseSearch((exerciseName) => {
      const nameInput = searchContainer.querySelector(".exercise-name");
      nameInput.value = exerciseName;
    });
    exerciseSearch.attachTo(searchContainer);

    // Add remove handler
    const removeBtn = exerciseList.querySelector(
      `.remove-exercise[data-id="${exerciseId}"]`
    );
    removeBtn.addEventListener("click", () => this.removeExercise(exerciseId));

    this.exercises.push(exerciseId);
  }

  removeExercise(id) {
    const exercise = document.querySelector(`.exercise-form[data-id="${id}"]`);
    exercise.remove();
    this.exercises = this.exercises.filter((eId) => eId !== id);

    // Update exercise numbers
    document.querySelectorAll(".exercise-form h5").forEach((h5, index) => {
      h5.textContent = `Exercise ${index + 1}`;
    });
  }

  async handleSubmit(e, modal) {
    e.preventDefault();
    const formData = new FormData(e.target);

    // Gather exercise data
    const exercises = Array.from(
      document.querySelectorAll(".exercise-form")
    ).map((form) => ({
      name: form.querySelector(".exercise-name").value,
      sets: parseInt(form.querySelector(".exercise-sets").value) || null,
      reps: parseInt(form.querySelector(".exercise-reps").value) || null,
      weight: parseFloat(form.querySelector(".exercise-weight").value) || null,
      notes: form.querySelector(".exercise-notes").value,
    }));

    const workoutData = {
      name: formData.get("name"),
      date: formData.get("date"),
      duration: parseInt(formData.get("duration")),
      notes: formData.get("notes"),
      exercises,
    };

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/workout/log`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(workoutData),
      });

      if (!response.ok) {
        throw new Error("Failed to save workout");
      }

      this.onSave();
      this.closeModal(modal);
    } catch (error) {
      console.error("Error saving workout:", error);
      alert("Failed to save workout");
    }
  }

  closeModal(modal) {
    modal.remove();
  }
}
