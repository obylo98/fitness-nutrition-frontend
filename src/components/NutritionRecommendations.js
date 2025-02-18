export default class NutritionRecommendations {
  constructor(userData) {
    this.userData = userData;
    this.recommendations = this.calculateRecommendations();
  }

  calculateRecommendations() {
    const { weight, height, age, gender, activityLevel, goal } = this.userData;
    
    // Calculate BMR using Mifflin-St Jeor Equation
    let bmr = 10 * weight + 6.25 * height - 5 * age;
    bmr = gender === "male" ? bmr + 5 : bmr - 161;

    // Activity level multipliers with more precise values
    const activityMultipliers = {
      sedentary: 1.2,    // Little or no exercise
      light: 1.375,      // Light exercise 1-3 days/week
      moderate: 1.55,    // Moderate exercise 3-5 days/week
      active: 1.725,     // Heavy exercise 6-7 days/week
      veryActive: 1.9    // Very heavy exercise, physical job
    };

    // Calculate TDEE with activity level
    const tdee = bmr * activityMultipliers[activityLevel];

    // Goal-based calorie adjustments
    const goalAdjustments = {
      lose: {
        calories: -500,
        proteinMultiplier: 2.2,    // Higher protein for muscle preservation
        carbsPercentage: 0.35,     // Lower carbs for fat loss
        fatsPercentage: 0.30       // Moderate fats for hormone function
      },
      maintain: {
        calories: 0,
        proteinMultiplier: 1.6,    // Moderate protein for maintenance
        carbsPercentage: 0.45,     // Balanced carbs
        fatsPercentage: 0.30       // Balanced fats
      },
      gain: {
        calories: 500,
        proteinMultiplier: 1.8,    // High protein for muscle gain
        carbsPercentage: 0.50,     // Higher carbs for energy
        fatsPercentage: 0.25       // Moderate fats
      }
    };

    const goalSettings = goalAdjustments[goal];
    const recommendedCalories = tdee + goalSettings.calories;

    // Calculate macros based on goal
    const macros = this.calculateMacros(
      recommendedCalories,
      weight,
      goalSettings
    );

    return {
      calories: Math.round(recommendedCalories),
      ...macros,
      mealDistribution: this.getMealDistribution(recommendedCalories),
      micronutrients: this.getMicronutrientRecommendations(),
      hydration: this.getHydrationRecommendations(weight, activityLevel),
      supplementation: this.getSupplementationRecommendations(goal),
      timing: this.getMealTimingRecommendations(goal)
    };
  }

  calculateMacros(calories, weight, goalSettings) {
    // Calculate protein based on body weight
    const protein = weight * goalSettings.proteinMultiplier;
    
    // Calculate carbs and fats based on remaining calories
    const remainingCalories = calories - (protein * 4);
    const carbs = (calories * goalSettings.carbsPercentage) / 4;
    const fats = (calories * goalSettings.fatsPercentage) / 9;

    return {
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fats: Math.round(fats),
      distribution: {
        protein: Math.round((protein * 4 / calories) * 100),
        carbs: Math.round((carbs * 4 / calories) * 100),
        fats: Math.round((fats * 9 / calories) * 100)
      }
    };
  }

  getMealDistribution(calories) {
    return {
      breakfast: {
        calories: Math.round(calories * 0.25),
        timing: '7:00 - 9:00 AM',
        importance: 'Breaks overnight fast, kickstarts metabolism'
      },
      morningSnack: {
        calories: Math.round(calories * 0.1),
        timing: '10:30 - 11:30 AM',
        importance: 'Maintains energy levels between meals'
      },
      lunch: {
        calories: Math.round(calories * 0.3),
        timing: '12:30 - 2:00 PM',
        importance: 'Provides mid-day energy boost'
      },
      afternoonSnack: {
        calories: Math.round(calories * 0.1),
        timing: '3:30 - 4:30 PM',
        importance: 'Prevents pre-dinner hunger'
      },
      dinner: {
        calories: Math.round(calories * 0.25),
        timing: '6:30 - 8:00 PM',
        importance: 'Supports recovery and repair'
      }
    };
  }

  getMicronutrientRecommendations() {
    return {
      vitamins: [
        {
          name: "Vitamin D",
          amount: "600-800 IU",
          sources: ["Sunlight", "Fatty fish", "Egg yolks"],
          importance: "Bone health, immune function"
        },
        {
          name: "Vitamin B12",
          amount: "2.4 mcg",
          sources: ["Meat", "Fish", "Dairy"],
          importance: "Energy production, nerve function"
        },
        {
          name: "Vitamin C",
          amount: "65-90 mg",
          sources: ["Citrus fruits", "Berries", "Bell peppers"],
          importance: "Immune support, antioxidant"
        }
      ],
      minerals: [
        {
          name: "Iron",
          amount: "8-18 mg",
          sources: ["Red meat", "Spinach", "Legumes"],
          importance: "Oxygen transport, energy production"
        },
        {
          name: "Calcium",
          amount: "1000 mg",
          sources: ["Dairy", "Leafy greens", "Fortified foods"],
          importance: "Bone health, muscle function"
        },
        {
          name: "Magnesium",
          amount: "310-420 mg",
          sources: ["Nuts", "Seeds", "Whole grains"],
          importance: "Muscle recovery, energy metabolism"
        }
      ]
    };
  }

  getHydrationRecommendations(weight, activityLevel) {
    // Base water needs (in liters) based on weight
    const baseWater = weight * 0.033;
    
    // Additional water based on activity level
    const activityWater = {
      sedentary: 0,
      light: 0.5,
      moderate: 1,
      active: 1.5,
      veryActive: 2
    };

    return {
      dailyWater: Math.round((baseWater + activityWater[activityLevel]) * 10) / 10,
      schedule: [
        { time: "Upon waking", amount: "500ml" },
        { time: "Between breakfast and lunch", amount: "750ml" },
        { time: "Between lunch and dinner", amount: "750ml" },
        { time: "Evening", amount: "500ml" }
      ],
      tips: [
        "Drink a glass of water with every meal",
        "Keep a water bottle with you throughout the day",
        "Set reminders to drink water every 2 hours",
        "Monitor urine color (should be light yellow)"
      ]
    };
  }

  getSupplementationRecommendations(goal) {
    const baseSupplements = [
      {
        name: "Multivitamin",
        timing: "With breakfast",
        importance: "Insurance for micronutrient gaps"
      },
      {
        name: "Omega-3",
        timing: "With meals",
        importance: "Anti-inflammatory, brain health"
      }
    ];

    const goalSpecificSupplements = {
      lose: [
        {
          name: "Protein Powder",
          timing: "Post-workout or between meals",
          importance: "Muscle preservation during deficit"
        }
      ],
      gain: [
        {
          name: "Creatine Monohydrate",
          timing: "5g daily, any time",
          importance: "Muscle strength and growth"
        },
        {
          name: "Protein Powder",
          timing: "Post-workout or between meals",
          importance: "Muscle growth support"
        }
      ],
      maintain: [
        {
          name: "Protein Powder",
          timing: "As needed to meet protein goals",
          importance: "Convenient protein source"
        }
      ]
    };

    return [...baseSupplements, ...goalSpecificSupplements[goal]];
  }

  getMealTimingRecommendations(goal) {
    const baseRecommendations = {
      generalRules: [
        "Eat every 3-4 hours",
        "Don't skip breakfast",
        "Avoid large meals close to bedtime"
      ],
      workoutNutrition: {
        before: "1-2 hours before: Complex carbs + moderate protein",
        during: "Water + electrolytes for sessions > 1 hour",
        after: "Within 30 minutes: Protein + fast-digesting carbs"
      }
    };

    const goalSpecificTiming = {
      lose: {
        strategy: "Earlier eating window",
        lastMeal: "3-4 hours before bed",
        snacks: "Focus on protein-rich snacks"
      },
      gain: {
        strategy: "Frequent meals",
        lastMeal: "Casein protein before bed",
        snacks: "Calorie-dense snacks between meals"
      },
      maintain: {
        strategy: "Regular meal pattern",
        lastMeal: "2-3 hours before bed",
        snacks: "Balanced macro snacks"
      }
    };

    return {
      ...baseRecommendations,
      ...goalSpecificTiming[goal]
    };
  }

  generateMealSuggestions() {
    return {
      breakfast: [
        {
          name: "High-Protein Oatmeal",
          foods: [
            "Oatmeal - 1 cup",
            "Protein powder - 1 scoop",
            "Banana - 1 medium",
            "Almonds - 1oz",
          ],
        },
        // Add more breakfast suggestions
      ],
      lunch: [
        {
          name: "Lean Protein Bowl",
          foods: [
            "Grilled chicken breast - 6oz",
            "Brown rice - 1 cup",
            "Mixed vegetables - 2 cups",
            "Olive oil - 1 tbsp",
          ],
        },
        // Add more lunch suggestions
      ],
      // Add dinner and snacks suggestions
    };
  }

  getRecommendations() {
    return {
      ...this.recommendations,
      mealSuggestions: this.generateMealSuggestions(),
    };
  }
} 