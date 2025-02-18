export default class ServingSize {
  constructor(foodItem, onChange) {
    this.foodItem = foodItem;
    this.onChange = onChange;
    this.render();
  }

  render() {
    const container = document.createElement('div');
    container.className = 'serving-size-controls';
    container.innerHTML = `
      <div class="serving-input">
        <input 
          type="number" 
          class="serving-amount" 
          value="1" 
          min="0.1" 
          step="0.1"
        >
        <select class="serving-unit">
          <option value="serving">serving</option>
          <option value="g">grams</option>
          <option value="oz">ounces</option>
          <option value="cup">cups</option>
          <option value="tbsp">tablespoons</option>
        </select>
      </div>
      <div class="nutrition-preview">
        <span class="calories">${this.foodItem.calories} cal</span>
        <span class="protein">${this.foodItem.protein}g protein</span>
        <span class="carbs">${this.foodItem.carbs}g carbs</span>
        <span class="fats">${this.foodItem.fats}g fats</span>
      </div>
    `;

    this.addEventListeners(container);
    return container;
  }

  addEventListeners(container) {
    const amountInput = container.querySelector('.serving-amount');
    const unitSelect = container.querySelector('.serving-unit');

    [amountInput, unitSelect].forEach(el => {
      el.addEventListener('change', () => this.updateNutrition(container));
    });
  }

  updateNutrition(container) {
    const amount = parseFloat(container.querySelector('.serving-amount').value);
    const unit = container.querySelector('.serving-unit').value;
    
    // Convert to base unit (grams) if necessary
    const multiplier = this.getUnitMultiplier(unit);
    const totalMultiplier = amount * multiplier;

    const updatedNutrition = {
      calories: Math.round(this.foodItem.calories * totalMultiplier),
      protein: Math.round(this.foodItem.protein * totalMultiplier * 10) / 10,
      carbs: Math.round(this.foodItem.carbs * totalMultiplier * 10) / 10,
      fats: Math.round(this.foodItem.fats * totalMultiplier * 10) / 10,
      serving_size: `${amount} ${unit}`
    };

    // Update preview
    container.querySelector('.calories').textContent = `${updatedNutrition.calories} cal`;
    container.querySelector('.protein').textContent = `${updatedNutrition.protein}g protein`;
    container.querySelector('.carbs').textContent = `${updatedNutrition.carbs}g carbs`;
    container.querySelector('.fats').textContent = `${updatedNutrition.fats}g fats`;

    this.onChange(updatedNutrition);
  }

  getUnitMultiplier(unit) {
    const conversions = {
      serving: 1,
      g: 0.01,
      oz: 0.28,
      cup: 2.4,
      tbsp: 0.15
    };
    return conversions[unit] || 1;
  }
} 