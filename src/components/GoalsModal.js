export default class GoalsModal {
  constructor(currentGoals, onSave) {
    this.currentGoals = currentGoals || {
      calorie_goal: 2000,
      protein_goal: 150,
      carbs_goal: 250,
      fats_goal: 65,
    };
    this.onSave = onSave;
    this.render();
  }

  render() {
    const modal = document.createElement("div");
    modal.className = "modal-overlay";
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Set Nutrition Goals</h3>
          <button class="close-modal">&times;</button>
        </div>
        <form id="goals-form" class="goals-form">
          <div class="form-group">
            <label for="calorie-goal">Daily Calorie Goal</label>
            <div class="input-with-unit">
              <input 
                type="number" 
                id="calorie-goal" 
                name="calorie_goal" 
                value="${this.currentGoals.calorie_goal}"
                min="1000"
                max="10000"
                required
              >
              <span class="unit">calories</span>
            </div>
          </div>
          
          <div class="form-group">
            <label for="protein-goal">Daily Protein Goal</label>
            <div class="input-with-unit">
              <input 
                type="number" 
                id="protein-goal" 
                name="protein_goal" 
                value="${this.currentGoals.protein_goal}"
                min="20"
                max="400"
                required
              >
              <span class="unit">grams</span>
            </div>
          </div>
          
          <div class="form-group">
            <label for="carbs-goal">Daily Carbs Goal</label>
            <div class="input-with-unit">
              <input 
                type="number" 
                id="carbs-goal" 
                name="carbs_goal" 
                value="${this.currentGoals.carbs_goal}"
                min="50"
                max="600"
                required
              >
              <span class="unit">grams</span>
            </div>
          </div>
          
          <div class="form-group">
            <label for="fats-goal">Daily Fats Goal</label>
            <div class="input-with-unit">
              <input 
                type="number" 
                id="fats-goal" 
                name="fats_goal" 
                value="${this.currentGoals.fats_goal}"
                min="20"
                max="200"
                required
              >
              <span class="unit">grams</span>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary cancel-btn">Cancel</button>
            <button type="submit" class="btn-primary">Save Goals</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);
    this.addEventListeners(modal);
  }

  addEventListeners(modal) {
    const form = modal.querySelector("#goals-form");
    const closeBtn = modal.querySelector(".close-modal");
    const cancelBtn = modal.querySelector(".cancel-btn");

    form.addEventListener("submit", (e) => this.handleSubmit(e, modal));
    closeBtn.addEventListener("click", () => this.closeModal(modal));
    cancelBtn.addEventListener("click", () => this.closeModal(modal));
    modal.addEventListener("click", (e) => {
      if (e.target === modal) this.closeModal(modal);
    });
  }

  async handleSubmit(e, modal) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const goals = {
      calorie_goal: parseInt(formData.get("calorie_goal")),
      protein_goal: parseInt(formData.get("protein_goal")),
      carbs_goal: parseInt(formData.get("carbs_goal")),
      fats_goal: parseInt(formData.get("fats_goal")),
    };

    await this.onSave(goals);
    this.closeModal(modal);
  }

  closeModal(modal) {
    modal.remove();
  }
}
