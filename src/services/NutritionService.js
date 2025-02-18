const API_BASE_URL = import.meta.env.VITE_API_URL || "https://fitness-nutrition-backend.onrender.com";
export default class NutritionService {
  constructor() {
    this.baseUrl = `${API_BASE_URL}/nutrition`;
  }

  async searchFoods(query) {
    try {
      const response = await fetch(`${this.baseUrl}/search?query=${encodeURIComponent(query)}`);

      if (!response.ok) {
        throw new Error("Failed to search foods");
      }

      const data = await response.json();
      return this.formatSearchResults(data);
    } catch (error) {
      console.error("Error searching foods:", error);
      throw error;
    }
  }

  async getNutrients(query) {
    try {
      const response = await fetch(`${this.baseUrl}/nutrients`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ query })
      });

      if (!response.ok) {
        throw new Error("Failed to get nutrients");
      }

      const data = await response.json();
      return this.formatNutrientResults(data);
    } catch (error) {
      console.error("Error getting nutrients:", error);
      throw error;
    }
  }

  formatSearchResults(data) {
    return {
      common: data.common?.map(item => ({
        id: item.food_name,
        name: item.food_name,
        image: item.photo?.thumb,
        type: "common"
      })) || [],
      branded: data.branded?.map(item => ({
        id: item.nix_item_id,
        name: item.food_name,
        brand: item.brand_name,
        image: item.photo?.thumb,
        type: "branded"
      })) || []
    };
  }

  formatNutrientResults(data) {
    return data.foods.map(food => ({
      name: food.food_name,
      servingSize: {
        quantity: food.serving_qty,
        unit: food.serving_unit,
        grams: food.serving_weight_grams
      },
      nutrients: {
        calories: food.nf_calories,
        totalFat: food.nf_total_fat,
        saturatedFat: food.nf_saturated_fat,
        cholesterol: food.nf_cholesterol,
        sodium: food.nf_sodium,
        totalCarbs: food.nf_total_carbohydrate,
        dietaryFiber: food.nf_dietary_fiber,
        sugars: food.nf_sugars,
        protein: food.nf_protein,
        potassium: food.nf_potassium
      },
      altMeasures: food.alt_measures?.map(measure => ({
        serving: {
          quantity: measure.qty,
          unit: measure.measure,
          grams: measure.serving_weight
        }
      })),
      image: {
        thumb: food.photo?.thumb,
        highres: food.photo?.highres
      }
    }));
  }

  calculateNutrientsForServing(nutrients, originalWeight, newWeight) {
    const multiplier = newWeight / originalWeight;
    return Object.entries(nutrients).reduce((acc, [key, value]) => {
      acc[key] = value * multiplier;
      return acc;
    }, {});
  }
} 