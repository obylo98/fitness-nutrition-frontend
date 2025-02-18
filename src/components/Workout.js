const API_BASE_URL = import.meta.env.VITE_API_URL || "https://fitness-nutrition-backend.onrender.com";

export default class Workout {
  constructor() {
    this.render();
    this.addEventListeners();
  }

  render() {
    const main = document.getElementById("main-content");
    main.innerHTML = `
      <div class="workout-container">
        <div class="workout-header">
          <div class="header-content">
            <h1>New Workout</h1>
            <p class="header-subtitle">Log your workout session</p>
          </div>
        </div>

        <form id="workout-form" class="workout-form">
          <div class="form-section">
            <div class="form-group">
              <label for="workout-name">Workout Name</label>
              <input 
                type="text" 
                id="workout-name" 
                name="name" 
                placeholder="e.g., Morning Strength Training"
                required
              >
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="workout-date">Date</label>
                <input 
                  type="date" 
                  id="workout-date" 
                  name="date" 
                  required
                >
              </div>

              <div class="form-group">
                <label for="workout-duration">Duration (minutes)</label>
                <input 
                  type="number" 
                  id="workout-duration" 
                  name="duration" 
                  min="1"
                  required
                >
              </div>
            </div>
          </div>

          <div class="form-section">
            <h2>Exercises</h2>
            <div class="exercise-search-container">
              <div class="exercise-search">
                <input 
                  type="text" 
                  id="exercise-search" 
                  class="exercise-search-input" 
                  placeholder="Search for exercises..."
                >
                <div id="search-results" class="search-results hidden"></div>
              </div>
            </div>
            <div id="exercises-list" class="exercises-list">
              <!-- Exercise items will be added here -->
            </div>
            <button type="button" id="add-exercise" class="btn-secondary">
              <i class="fas fa-plus"></i> Add Custom Exercise
            </button>
          </div>

          <div class="form-section">
            <div class="form-group">
              <label for="workout-notes">Notes</label>
              <textarea 
                id="workout-notes" 
                name="notes" 
                rows="3"
                placeholder="Add any notes about your workout..."
              ></textarea>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-primary">
              <i class="fas fa-save"></i> Save Workout
            </button>
          </div>
        </form>
      </div>
    `;

    // Set default date to today
    const dateInput = document.getElementById('workout-date');
    if (dateInput) {
      dateInput.value = new Date().toISOString().split('T')[0];
    }
  }

  addEventListeners() {
    const form = document.getElementById('workout-form');
    const addExerciseBtn = document.getElementById('add-exercise');
    const exerciseSearch = document.getElementById('exercise-search');
    const searchResults = document.getElementById('search-results');

    if (form) {
      form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    if (addExerciseBtn) {
      addExerciseBtn.addEventListener('click', () => this.addExerciseField());
    }

    if (exerciseSearch) {
      let debounceTimeout;
      exerciseSearch.addEventListener('input', (e) => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => this.searchExercises(e.target.value), 300);
      });

      // Close search results when clicking outside
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.exercise-search')) {
          searchResults?.classList.add('hidden');
        }
      });
    }
  }

  async searchExercises(query) {
    const searchResults = document.getElementById('search-results');
    if (!searchResults || query.length < 2) {
      searchResults?.classList.add('hidden');
      return;
    }

    try {
      searchResults.innerHTML = `
        <div class="loading">
          <i class="fas fa-spinner fa-spin"></i>
          Searching...
        </div>
      `;
      searchResults.classList.remove('hidden');

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/workout/exercises/search?query=${encodeURIComponent(query)}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to search exercises');
      }

      const exercises = await response.json();
      
      // Ensure exercises is an array
      if (!Array.isArray(exercises)) {
        console.error('Expected array of exercises, got:', typeof exercises);
        throw new Error('Invalid response format');
      }

      if (exercises.length === 0) {
        searchResults.innerHTML = `
          <div class="no-results">
            No exercises found matching "${query}"
          </div>
        `;
        return;
      }

      searchResults.innerHTML = exercises.map(exercise => `
        <div class="search-result-item" data-exercise='${JSON.stringify(exercise)}'>
          <div class="exercise-name">${exercise.name}</div>
          <div class="exercise-details">
            ${exercise.bodyPart ? `<span><i class="fas fa-child"></i> ${exercise.bodyPart}</span>` : ''}
            ${exercise.equipment ? `<span><i class="fas fa-dumbbell"></i> ${exercise.equipment}</span>` : ''}
            ${exercise.target ? `<span><i class="fas fa-bullseye"></i> ${exercise.target}</span>` : ''}
          </div>
        </div>
      `).join('');

      // Add click handlers for search results
      searchResults.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', () => {
          try {
            const exercise = JSON.parse(item.dataset.exercise);
            this.addExerciseFromSearch(exercise);
            searchResults.classList.add('hidden');
          } catch (error) {
            console.error('Error parsing exercise data:', error);
          }
        });
      });

    } catch (error) {
      console.error('Error searching exercises:', error);
      searchResults.innerHTML = `
        <div class="error">
          <i class="fas fa-exclamation-circle"></i>
          Failed to search exercises. Please try again.
        </div>
      `;
    }
  }

  addExerciseFromSearch(exercise) {
    const exercisesList = document.getElementById('exercises-list');
    const exerciseId = Date.now();

    const exerciseHtml = `
      <div class="exercise-item" data-id="${exerciseId}">
        <div class="exercise-header">
          <h3>Exercise ${exercisesList.children.length + 1}</h3>
          <button type="button" class="btn-icon remove-exercise" data-id="${exerciseId}">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="exercise-fields">
          <div class="form-group">
            <label>Exercise Name</label>
            <input 
              type="text" 
              name="exercises[${exerciseId}][name]" 
              value="${exercise.name}"
              class="exercise-name-input"
              readonly
            >
          </div>
          ${exercise.gifUrl ? `
            <div class="exercise-image">
              <img src="${exercise.gifUrl}" alt="${exercise.name} demonstration" loading="lazy">
            </div>
          ` : ''}
          ${exercise.instructions ? `
            <div class="exercise-instructions">
              <button type="button" class="btn-secondary toggle-instructions">
                <i class="fas fa-info-circle"></i>
                View Instructions
              </button>
              <div class="instructions-content hidden">
                ${exercise.instructions}
              </div>
            </div>
          ` : ''}
          <div class="exercise-details">
            <span class="detail-item">
              <i class="fas fa-dumbbell"></i>
              ${exercise.equipment}
            </span>
            <span class="detail-item">
              <i class="fas fa-bullseye"></i>
              ${exercise.target}
            </span>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Sets</label>
              <input 
                type="number" 
                name="exercises[${exerciseId}][sets]" 
                min="1" 
                required
                value="3"
              >
            </div>
            <div class="form-group">
              <label>Reps</label>
              <input 
                type="number" 
                name="exercises[${exerciseId}][reps]" 
                min="1" 
                required
                value="12"
              >
            </div>
            <div class="form-group">
              <label>Weight (kg)</label>
              <input 
                type="number" 
                name="exercises[${exerciseId}][weight]" 
                min="0" 
                step="0.5"
              >
            </div>
          </div>
        </div>
      </div>
    `;

    exercisesList.insertAdjacentHTML('beforeend', exerciseHtml);
    
    // Add event listeners
    const newExercise = exercisesList.querySelector(`[data-id="${exerciseId}"]`);
    
    // Remove button handler
    const removeBtn = newExercise.querySelector('.remove-exercise');
    removeBtn?.addEventListener('click', () => {
      newExercise.remove();
    });

    // Instructions toggle handler
    const toggleBtn = newExercise.querySelector('.toggle-instructions');
    const instructions = newExercise.querySelector('.instructions-content');
    if (toggleBtn && instructions) {
      toggleBtn.addEventListener('click', () => {
        instructions.classList.toggle('hidden');
        toggleBtn.innerHTML = instructions.classList.contains('hidden')
          ? '<i class="fas fa-info-circle"></i> View Instructions'
          : '<i class="fas fa-times-circle"></i> Hide Instructions';
      });
    }

    // Clear and hide search results
    const searchInput = document.getElementById('exercise-search');
    const searchResults = document.getElementById('search-results');
    if (searchInput) searchInput.value = '';
    if (searchResults) searchResults.classList.add('hidden');
  }

  addExerciseField() {
    const exercisesList = document.getElementById('exercises-list');
    const exerciseId = Date.now(); // Unique ID for the exercise

    const exerciseHtml = `
      <div class="exercise-item" data-id="${exerciseId}">
        <div class="exercise-header">
          <h3>Exercise ${exercisesList.children.length + 1}</h3>
          <button type="button" class="btn-icon remove-exercise" data-id="${exerciseId}">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="exercise-fields">
          <div class="form-group">
            <label>Exercise Name</label>
            <input 
              type="text" 
              name="exercises[${exerciseId}][name]" 
              required
              placeholder="e.g., Bench Press"
              class="exercise-name-input"
            >
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Sets</label>
              <input 
                type="number" 
                name="exercises[${exerciseId}][sets]" 
                min="1" 
                required
                value="3"
              >
            </div>
            <div class="form-group">
              <label>Reps</label>
              <input 
                type="number" 
                name="exercises[${exerciseId}][reps]" 
                min="1" 
                required
                value="12"
              >
            </div>
            <div class="form-group">
              <label>Weight (kg)</label>
              <input 
                type="number" 
                name="exercises[${exerciseId}][weight]" 
                min="0" 
                step="0.5"
              >
            </div>
          </div>
        </div>
      </div>
    `;

    exercisesList.insertAdjacentHTML('beforeend', exerciseHtml);
    
    // Focus the new exercise name input
    const newExercise = exercisesList.querySelector(`[data-id="${exerciseId}"]`);
    const nameInput = newExercise.querySelector('.exercise-name-input');
    nameInput?.focus();

    // Add remove handler
    const removeBtn = newExercise.querySelector('.remove-exercise');
    removeBtn?.addEventListener('click', () => {
      newExercise.remove();
    });
  }

  async handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    
    try {
      const formData = new FormData(form);
      const workoutData = {
        name: formData.get('name'),
        date: formData.get('date'),
        duration: parseInt(formData.get('duration')),
        notes: formData.get('notes') || '',
        exercises: []
      };

      // Process exercises
      const exerciseItems = form.querySelectorAll('.exercise-item');
      exerciseItems.forEach(item => {
        const id = item.dataset.id;
        // Get the exercise name input
        const nameInput = item.querySelector(`input[name="exercises[${id}][name]"]`);
        const setsInput = item.querySelector(`input[name="exercises[${id}][sets]"]`);
        const repsInput = item.querySelector(`input[name="exercises[${id}][reps]"]`);
        const weightInput = item.querySelector(`input[name="exercises[${id}][weight]"]`);

        if (!nameInput || !nameInput.value.trim()) {
          throw new Error('Exercise name is required');
        }

        const exercise = {
          name: nameInput.value.trim(),
          sets: parseInt(setsInput.value) || 0,
          reps: parseInt(repsInput.value) || 0,
          weight: weightInput.value ? parseFloat(weightInput.value) : null
        };

        // Validate exercise data
        if (exercise.sets <= 0) throw new Error('Sets must be greater than 0');
        if (exercise.reps <= 0) throw new Error('Reps must be greater than 0');
        if (exercise.weight !== null && exercise.weight < 0) {
          throw new Error('Weight must be a non-negative number');
        }

        console.log('Exercise data:', exercise);
        workoutData.exercises.push(exercise);
      });

      if (workoutData.exercises.length === 0) {
        throw new Error('At least one exercise is required');
      }

      console.log('Sending workout data:', workoutData);

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/workout/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(workoutData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.details || 'Failed to save workout');
      }

      // Show success message and redirect
      alert('Workout saved successfully!');
      window.location.hash = 'workout/tracker';

    } catch (error) {
      console.error('Error saving workout:', error);
      alert(error.message || 'Failed to save workout. Please try again.');
    }
  }
} 