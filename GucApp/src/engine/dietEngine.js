/**
 * NAIM Diet Planner — Local Diet Generation Engine
 * Copyright (C) 2024  NAIM Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * All computation happens 100% on-device. No data ever leaves your phone.
 */

// NAIM Iteration 1 — Core diet engine: TDEE + 7-day local generation — 30kg

// ─────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────

const ACTIVITY_MULTIPLIER = {
  sedentary:   1.2,    // desk job, no exercise
  light:       1.375,  // 1-3 days/week light exercise
  moderate:    1.55,   // 3-5 days/week moderate
  active:      1.725,  // 6-7 days/week hard exercise
  very_active: 1.9,    // physical job + daily training
};

const GOAL_DELTA = {
  lose:     -500,   // ~0.5 kg/week deficit
  maintain:    0,
  gain:      300,   // ~0.3 kg/week surplus
};

// Meal calorie distribution per day
const MEAL_SPLIT = {
  breakfast: 0.28,
  lunch:     0.37,
  dinner:    0.35,
};

// ─────────────────────────────────────────────────────────────────
// TDEE Calculation (Mifflin-St Jeor)
// ─────────────────────────────────────────────────────────────────

/**
 * @param {object} profile - { gender, age, heightCm, weightKg, activity, goal }
 * @returns {{ bmr, tdee, dailyTarget, macros }}
 */
export function calculateNutrition(profile) {
  const { gender, age, heightCm, weightKg, activity, goal } = profile;

  // BMR
  let bmr;
  if (gender === 'male') {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }

  const tdee = Math.round(bmr * (ACTIVITY_MULTIPLIER[activity] || 1.55));
  const dailyTarget = Math.max(1200, tdee + (GOAL_DELTA[goal] || 0));

  // Macro targets (protein-first approach)
  const proteinG  = Math.round(weightKg * (goal === 'gain' ? 2.2 : 1.8));
  const fatG      = Math.round((dailyTarget * 0.28) / 9);
  const carbG     = Math.round((dailyTarget - proteinG * 4 - fatG * 9) / 4);

  return {
    bmr:         Math.round(bmr),
    tdee,
    dailyTarget,
    macros: { proteinG, fatG, carbG },
  };
}

// ─────────────────────────────────────────────────────────────────
// Food Database
// Tags: 'vegan' | 'vegetarian' | 'keto' | 'mediterranean' | 'omnivore'
// Note: vegan ⊆ vegetarian ⊆ omnivore (additive inclusion)
// ─────────────────────────────────────────────────────────────────

const ALL_DIETS = ['vegan', 'vegetarian', 'keto', 'mediterranean', 'omnivore'];

const MEALS_DB = {

  // ── BREAKFASTS ──────────────────────────────────────────────────
  breakfast: [
    {
      id: 'overnight_oats',
      name: 'Overnight Oats & Berries',
      emoji: '🫙',
      cal: 390, protein: 14, carbs: 68, fat: 7, fiber: 9,
      serving: '80g rolled oats + 180ml oat milk + 120g mixed berries',
      measurement: '½ cup oats, ¾ cup oat milk, 1 cup berries',
      tags: ['vegan', 'vegetarian', 'mediterranean', 'omnivore'],
      prep: '5 min prep (night before)',
    },
    {
      id: 'avocado_toast',
      name: 'Avocado Toast with Hemp Seeds',
      emoji: '🥑',
      cal: 400, protein: 12, carbs: 44, fat: 21, fiber: 10,
      serving: '2 slices whole-wheat bread (80g) + 100g avocado + 20g hemp seeds',
      measurement: '2 slices bread, ½ avocado, 3 tbsp hemp seeds',
      tags: ['vegan', 'vegetarian', 'mediterranean', 'omnivore'],
      prep: '5 min',
    },
    {
      id: 'chia_pudding',
      name: 'Chia Pudding with Mango',
      emoji: '🥭',
      cal: 360, protein: 11, carbs: 52, fat: 13, fiber: 14,
      serving: '45g chia seeds + 250ml coconut milk (light) + 100g fresh mango',
      measurement: '3 tbsp chia, 1 cup coconut milk, ¾ cup mango cubes',
      tags: ['vegan', 'vegetarian', 'mediterranean', 'omnivore'],
      prep: '5 min prep (night before)',
    },
    {
      id: 'tofu_scramble',
      name: 'Spiced Tofu Scramble',
      emoji: '🍳',
      cal: 330, protein: 24, carbs: 14, fat: 20, fiber: 4,
      serving: '200g firm tofu + 50g spinach + 40g bell pepper + 10ml olive oil + turmeric',
      measurement: '200g tofu, 1 cup spinach, ¼ pepper, 2 tsp olive oil',
      tags: ['vegan', 'vegetarian', 'omnivore'],
      prep: '10 min',
    },
    {
      id: 'smoothie_bowl',
      name: 'Acai Smoothie Bowl',
      emoji: '🫐',
      cal: 420, protein: 9, carbs: 72, fat: 11, fiber: 12,
      serving: '200g frozen mixed berries + 150ml almond milk + 30g granola + 20g pumpkin seeds',
      measurement: '1½ cups frozen berries, ½ cup almond milk, ¼ cup granola, 2 tbsp seeds',
      tags: ['vegan', 'vegetarian', 'omnivore'],
      prep: '5 min',
    },
    {
      id: 'pb_banana_toast',
      name: 'Peanut Butter Banana Toast',
      emoji: '🍌',
      cal: 460, protein: 17, carbs: 60, fat: 18, fiber: 8,
      serving: '2 slices whole-wheat bread (80g) + 30g natural peanut butter + 1 medium banana (120g)',
      measurement: '2 slices bread, 2 tbsp PB, 1 banana',
      tags: ['vegan', 'vegetarian', 'omnivore'],
      prep: '3 min',
    },
    {
      id: 'greek_yogurt_parfait',
      name: 'Greek Yogurt Parfait',
      emoji: '🍓',
      cal: 375, protein: 22, carbs: 54, fat: 7, fiber: 5,
      serving: '200g 0%-fat Greek yogurt + 80g granola + 100g strawberries + 10g honey',
      measurement: '¾ cup yogurt, ⅓ cup granola, ¾ cup strawberries, 2 tsp honey',
      tags: ['vegetarian', 'omnivore'],
      prep: '3 min',
    },
    {
      id: 'veggie_omelet',
      name: 'Spinach & Feta Omelet',
      emoji: '🥚',
      cal: 360, protein: 26, carbs: 6, fat: 26, fiber: 2,
      serving: '3 large eggs + 80g baby spinach + 40g feta cheese + 10ml olive oil',
      measurement: '3 eggs, 1 cup spinach, 3 tbsp feta, 2 tsp olive oil',
      tags: ['vegetarian', 'keto', 'omnivore'],
      prep: '8 min',
    },
    {
      id: 'salmon_bagel',
      name: 'Smoked Salmon & Cream Cheese Bagel',
      emoji: '🫓',
      cal: 450, protein: 28, carbs: 44, fat: 16, fiber: 3,
      serving: '1 whole-grain bagel (90g) + 80g smoked salmon + 30g cream cheese + capers',
      measurement: '1 bagel, 3 slices salmon, 2 tbsp cream cheese',
      tags: ['mediterranean', 'omnivore'],
      prep: '5 min',
    },
    {
      id: 'keto_egg_cups',
      name: 'Bacon & Cheese Egg Cups',
      emoji: '🧀',
      cal: 390, protein: 28, carbs: 3, fat: 30, fiber: 0,
      serving: '4 large eggs + 60g turkey bacon + 40g cheddar cheese, baked in muffin tin',
      measurement: '4 eggs, 3 strips turkey bacon, ⅓ cup cheddar',
      tags: ['keto', 'omnivore'],
      prep: '20 min',
    },
    {
      id: 'quinoa_porridge',
      name: 'Warm Quinoa Porridge',
      emoji: '🌾',
      cal: 380, protein: 14, carbs: 66, fat: 8, fiber: 7,
      serving: '80g quinoa (dry) + 250ml almond milk + 1 tbsp maple syrup + cinnamon + 50g walnuts',
      measurement: '⅓ cup dry quinoa, 1 cup almond milk, 1 tbsp syrup, handful walnuts',
      tags: ['vegan', 'vegetarian', 'omnivore'],
      prep: '15 min',
    },
    {
      id: 'hummus_toast',
      name: 'Hummus Toast with Cherry Tomatoes',
      emoji: '🍅',
      cal: 340, protein: 12, carbs: 48, fat: 12, fiber: 8,
      serving: '2 slices sourdough (80g) + 60g hummus + 100g cherry tomatoes + za\'atar',
      measurement: '2 slices bread, ¼ cup hummus, 6-8 cherry tomatoes',
      tags: ['vegan', 'vegetarian', 'mediterranean', 'omnivore'],
      prep: '4 min',
    },
  ],

  // ── LUNCHES ─────────────────────────────────────────────────────
  lunch: [
    {
      id: 'lentil_soup',
      name: 'Red Lentil Soup with Flatbread',
      emoji: '🍜',
      cal: 480, protein: 22, carbs: 78, fat: 8, fiber: 18,
      serving: '150g dry red lentils + 1 whole-wheat pita (60g) + cumin, paprika, lemon',
      measurement: '¾ cup dry lentils, 1 pita, spices to taste',
      tags: ['vegan', 'vegetarian', 'mediterranean', 'omnivore'],
      prep: '25 min',
    },
    {
      id: 'quinoa_buddha_bowl',
      name: 'Quinoa Buddha Bowl',
      emoji: '🥗',
      cal: 520, protein: 20, carbs: 72, fat: 18, fiber: 12,
      serving: '120g quinoa (cooked 240g) + 80g roasted chickpeas + 100g cucumber + 50g avocado + tahini',
      measurement: '1 cup cooked quinoa, ½ cup chickpeas, 1 mini cucumber, ¼ avocado',
      tags: ['vegan', 'vegetarian', 'mediterranean', 'omnivore'],
      prep: '20 min',
    },
    {
      id: 'chickpea_wrap',
      name: 'Chickpea & Roasted Veggie Wrap',
      emoji: '🌯',
      cal: 490, protein: 18, carbs: 70, fat: 14, fiber: 13,
      serving: '1 whole-wheat tortilla (60g) + 130g chickpeas + 80g roasted bell pepper + 60g hummus',
      measurement: '1 large tortilla, ½ cup chickpeas, 1 pepper, ¼ cup hummus',
      tags: ['vegan', 'vegetarian', 'mediterranean', 'omnivore'],
      prep: '15 min',
    },
    {
      id: 'falafel_pita',
      name: 'Falafel Pita with Tzatziki',
      emoji: '🧆',
      cal: 510, protein: 19, carbs: 68, fat: 18, fiber: 10,
      serving: '4 falafel patties (~120g) + 1 whole-wheat pita + 40g tzatziki + lettuce + tomato',
      measurement: '4 falafel, 1 pita, 3 tbsp tzatziki',
      tags: ['vegetarian', 'mediterranean', 'omnivore'],
      prep: '10 min (pre-made falafel)',
    },
    {
      id: 'tofu_stir_fry',
      name: 'Tofu Stir-Fry with Brown Rice',
      emoji: '🍚',
      cal: 530, protein: 26, carbs: 68, fat: 16, fiber: 6,
      serving: '200g firm tofu + 150g cooked brown rice + 100g broccoli + soy sauce + sesame oil',
      measurement: '200g tofu, ¾ cup cooked rice, 1 cup broccoli, 2 tbsp soy sauce',
      tags: ['vegan', 'vegetarian', 'omnivore'],
      prep: '20 min',
    },
    {
      id: 'black_bean_bowl',
      name: 'Black Bean & Corn Bowl',
      emoji: '🌽',
      cal: 500, protein: 20, carbs: 80, fat: 10, fiber: 16,
      serving: '130g black beans + 120g brown rice (cooked) + 80g corn + salsa + lime',
      measurement: '½ cup beans, ½ cup rice, ½ cup corn, 2 tbsp salsa',
      tags: ['vegan', 'vegetarian', 'omnivore'],
      prep: '10 min',
    },
    {
      id: 'caprese_salad',
      name: 'Caprese Salad with Whole-Grain Bread',
      emoji: '🫒',
      cal: 470, protein: 20, carbs: 42, fat: 24, fiber: 4,
      serving: '150g fresh mozzarella + 200g tomatoes + basil + 2 tbsp olive oil + 2 slices ciabatta',
      measurement: '150g mozzarella, 2 medium tomatoes, 2 tbsp olive oil, 2 slices bread',
      tags: ['vegetarian', 'mediterranean', 'omnivore'],
      prep: '8 min',
    },
    {
      id: 'tuna_salad_sandwich',
      name: 'Tuna Salad Sandwich',
      emoji: '🥪',
      cal: 490, protein: 34, carbs: 44, fat: 18, fiber: 5,
      serving: '2 slices whole-wheat bread + 150g canned tuna (drained) + 1 tbsp Greek yogurt + celery',
      measurement: '2 slices bread, 1 can tuna, 1 tbsp yogurt, 2 stalks celery',
      tags: ['mediterranean', 'omnivore'],
      prep: '8 min',
    },
    {
      id: 'grilled_chicken_salad',
      name: 'Grilled Chicken & Avocado Salad',
      emoji: '🥙',
      cal: 480, protein: 42, carbs: 14, fat: 28, fiber: 8,
      serving: '150g grilled chicken breast + 60g avocado + 100g mixed greens + olive oil + lemon',
      measurement: '150g chicken, ½ avocado, 2 cups greens, 2 tsp olive oil',
      tags: ['keto', 'mediterranean', 'omnivore'],
      prep: '15 min',
    },
    {
      id: 'salmon_poke_bowl',
      name: 'Salmon Poke Bowl',
      emoji: '🐟',
      cal: 560, protein: 36, carbs: 60, fat: 18, fiber: 5,
      serving: '150g sashimi-grade salmon + 120g cooked sushi rice + cucumber + edamame + soy sauce',
      measurement: '150g salmon, ½ cup rice, ½ cucumber, ¼ cup edamame',
      tags: ['mediterranean', 'omnivore'],
      prep: '10 min',
    },
    {
      id: 'turkey_wrap',
      name: 'Turkey & Hummus Wrap',
      emoji: '🦃',
      cal: 500, protein: 36, carbs: 52, fat: 14, fiber: 7,
      serving: '1 whole-wheat tortilla + 130g turkey slices + 50g hummus + 60g cucumber + spinach',
      measurement: '1 tortilla, 4 slices turkey, 3 tbsp hummus',
      tags: ['omnivore'],
      prep: '5 min',
    },
    {
      id: 'keto_lettuce_wrap',
      name: 'Keto BLT Lettuce Wraps',
      emoji: '🥬',
      cal: 440, protein: 28, carbs: 6, fat: 34, fiber: 2,
      serving: '4 large romaine leaves + 100g turkey bacon + 100g cherry tomatoes + 60g avocado + mayo',
      measurement: '4 lettuce cups, 4 strips bacon, 6 tomatoes, ¼ avocado',
      tags: ['keto', 'omnivore'],
      prep: '10 min',
    },
    {
      id: 'med_hummus_platter',
      name: 'Mediterranean Mezze Platter',
      emoji: '🫙',
      cal: 490, protein: 16, carbs: 56, fat: 22, fiber: 12,
      serving: '80g hummus + 60g tzatziki + 1 pita + olives + cucumber + cherry tomatoes + bell pepper',
      measurement: '⅓ cup hummus, ¼ cup tzatziki, 1 pita, assorted veg',
      tags: ['vegetarian', 'mediterranean', 'omnivore'],
      prep: '5 min (assembly)',
    },
  ],

  // ── DINNERS ─────────────────────────────────────────────────────
  dinner: [
    {
      id: 'lentil_dahl',
      name: 'Red Lentil Dahl with Basmati',
      emoji: '🍛',
      cal: 580, protein: 26, carbs: 96, fat: 10, fiber: 18,
      serving: '130g dry red lentils + 100g cooked basmati + 200ml light coconut milk + spices',
      measurement: '½ cup dry lentils, ½ cup rice, ¾ cup coconut milk, curry powder',
      tags: ['vegan', 'vegetarian', 'mediterranean', 'omnivore'],
      prep: '30 min',
    },
    {
      id: 'tofu_noodles',
      name: 'Teriyaki Tofu with Soba Noodles',
      emoji: '🍝',
      cal: 560, protein: 28, carbs: 78, fat: 14, fiber: 5,
      serving: '200g firm tofu + 90g dry soba noodles + broccoli + teriyaki sauce (25ml)',
      measurement: '200g tofu, 90g soba, 1 cup broccoli, 2 tbsp teriyaki',
      tags: ['vegan', 'vegetarian', 'omnivore'],
      prep: '20 min',
    },
    {
      id: 'chickpea_tikka',
      name: 'Chickpea Tikka Masala',
      emoji: '🥘',
      cal: 540, protein: 20, carbs: 86, fat: 12, fiber: 14,
      serving: '200g chickpeas + 100g cooked basmati + 150ml tomato-cream sauce + garam masala',
      measurement: '1 cup chickpeas, ½ cup rice, ½ cup sauce',
      tags: ['vegan', 'vegetarian', 'mediterranean', 'omnivore'],
      prep: '25 min',
    },
    {
      id: 'black_bean_tacos',
      name: 'Smoky Black Bean Tacos',
      emoji: '🌮',
      cal: 520, protein: 18, carbs: 76, fat: 14, fiber: 14,
      serving: '3 corn tortillas (90g) + 150g black beans + salsa + 50g avocado + lime + cilantro',
      measurement: '3 tortillas, ½ cup beans, 2 tbsp salsa, ¼ avocado',
      tags: ['vegan', 'vegetarian', 'omnivore'],
      prep: '15 min',
    },
    {
      id: 'lentil_bolognese',
      name: 'Lentil Bolognese Pasta',
      emoji: '🍝',
      cal: 570, protein: 26, carbs: 92, fat: 9, fiber: 14,
      serving: '90g whole-wheat spaghetti + 130g dry green lentils + 200g tomato passata + herbs',
      measurement: '90g pasta, ½ cup lentils, ¾ cup passata',
      tags: ['vegan', 'vegetarian', 'omnivore'],
      prep: '35 min',
    },
    {
      id: 'mushroom_risotto',
      name: 'Porcini Mushroom Risotto',
      emoji: '🍄',
      cal: 550, protein: 16, carbs: 88, fat: 14, fiber: 4,
      serving: '100g arborio rice + 200g mixed mushrooms + 30g parmesan + 10ml olive oil + white wine',
      measurement: '½ cup arborio, 2 cups mushrooms, 2 tbsp parmesan',
      tags: ['vegetarian', 'mediterranean', 'omnivore'],
      prep: '30 min',
    },
    {
      id: 'shakshuka',
      name: 'Shakshuka with Crusty Bread',
      emoji: '🍳',
      cal: 480, protein: 26, carbs: 48, fat: 22, fiber: 8,
      serving: '3 eggs poached in 300g spiced tomato sauce + 1 slice sourdough + feta',
      measurement: '3 eggs, 300g tomato sauce, 1 slice bread, 30g feta',
      tags: ['vegetarian', 'mediterranean', 'omnivore'],
      prep: '20 min',
    },
    {
      id: 'baked_cod',
      name: 'Mediterranean Baked Cod',
      emoji: '🐟',
      cal: 490, protein: 44, carbs: 36, fat: 18, fiber: 6,
      serving: '200g cod fillet + 150g roasted cherry tomatoes + olives + 15ml olive oil + quinoa',
      measurement: '200g cod, 1 cup cherry tomatoes, 10 olives, 2 tbsp olive oil',
      tags: ['keto', 'mediterranean', 'omnivore'],
      prep: '25 min',
    },
    {
      id: 'grilled_salmon',
      name: 'Grilled Salmon with Asparagus',
      emoji: '🐠',
      cal: 520, protein: 46, carbs: 20, fat: 28, fiber: 6,
      serving: '180g salmon fillet + 200g asparagus + 120g sweet potato + lemon + herbs',
      measurement: '180g salmon, 1 bunch asparagus, 1 small sweet potato',
      tags: ['keto', 'mediterranean', 'omnivore'],
      prep: '20 min',
    },
    {
      id: 'chicken_stir_fry',
      name: 'Ginger Chicken Stir-Fry with Rice',
      emoji: '🍗',
      cal: 570, protein: 44, carbs: 62, fat: 14, fiber: 5,
      serving: '180g chicken breast + 120g cooked jasmine rice + broccoli + snap peas + ginger sauce',
      measurement: '180g chicken, ½ cup rice, 1 cup mixed veg',
      tags: ['omnivore'],
      prep: '20 min',
    },
    {
      id: 'turkey_meatballs',
      name: 'Turkey Meatballs with Zucchini Noodles',
      emoji: '🍖',
      cal: 490, protein: 44, carbs: 18, fat: 26, fiber: 5,
      serving: '200g turkey mince + 2 medium zucchini spiralised + 150g tomato sauce + herbs',
      measurement: '200g turkey, 2 zucchini, ½ cup tomato sauce',
      tags: ['keto', 'omnivore'],
      prep: '25 min',
    },
    {
      id: 'beef_sweet_potato',
      name: 'Lean Beef with Roasted Sweet Potato',
      emoji: '🥩',
      cal: 580, protein: 48, carbs: 44, fat: 22, fiber: 7,
      serving: '180g lean beef sirloin + 200g sweet potato + 150g broccoli + 10ml olive oil',
      measurement: '180g steak, 1 medium sweet potato, 1 cup broccoli',
      tags: ['omnivore'],
      prep: '30 min',
    },
    {
      id: 'keto_cauli_rice',
      name: 'Keto Cauliflower Fried Rice',
      emoji: '🥦',
      cal: 470, protein: 36, carbs: 14, fat: 30, fiber: 7,
      serving: '300g cauliflower rice + 150g chicken + 3 eggs + soy sauce + sesame oil + spring onion',
      measurement: '2 cups cauli rice, 150g chicken, 2 eggs scrambled',
      tags: ['keto', 'omnivore'],
      prep: '20 min',
    },
    {
      id: 'eggplant_parmesan',
      name: 'Baked Eggplant Parmesan',
      emoji: '🍆',
      cal: 500, protein: 22, carbs: 52, fat: 22, fiber: 10,
      serving: '400g eggplant + 100g mozzarella + 200g tomato sauce + 60g whole-wheat breadcrumbs',
      measurement: '1 large eggplant, 100g mozzarella, ¾ cup sauce',
      tags: ['vegetarian', 'mediterranean', 'omnivore'],
      prep: '40 min',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────
// Diet compatibility map
// ─────────────────────────────────────────────────────────────────

// Which tags a diet profile can eat (superset logic)
const DIET_ALLOWED = {
  vegan:         ['vegan'],
  vegetarian:    ['vegan', 'vegetarian'],
  keto:          ['keto'],
  mediterranean: ['vegan', 'vegetarian', 'mediterranean'],
  omnivore:      ['vegan', 'vegetarian', 'keto', 'mediterranean', 'omnivore'],
  pescatarian:   ['vegan', 'vegetarian', 'mediterranean', 'omnivore'],
};

function dietFilter(meals, diet, dislikedIds = []) {
  const allowed = DIET_ALLOWED[diet] || DIET_ALLOWED.omnivore;
  return meals.filter(
    (m) => m.tags.some((t) => allowed.includes(t)) && !dislikedIds.includes(m.id)
  );
}

// ─────────────────────────────────────────────────────────────────
// Meal selection & calorie scaling
// ─────────────────────────────────────────────────────────────────

function pickMeal(pool, targetCal, usedIds) {
  const available = pool.filter((m) => !usedIds.has(m.id));
  const source = available.length > 0 ? available : pool; // fallback: allow reuse

  // Sort by proximity to target calories, add a tiny seeded jitter for variety
  return source.slice().sort((a, b) => {
    const da = Math.abs(a.cal - targetCal);
    const db = Math.abs(b.cal - targetCal);
    return da - db;
  })[0];
}

function scaleMeal(meal, targetCal) {
  const ratio = targetCal / meal.cal;
  return {
    ...meal,
    calories:  Math.round(meal.cal  * ratio),
    protein:   Math.round(meal.protein * ratio),
    carbs:     Math.round(meal.carbs   * ratio),
    fat:       Math.round(meal.fat     * ratio),
    fiber:     Math.round((meal.fiber || 0) * ratio),
    scaleFactor: parseFloat(ratio.toFixed(2)),
    // Human-readable portion note
    portionNote: ratio > 1.15
      ? `Increase portions by ${Math.round((ratio - 1) * 100)}%`
      : ratio < 0.85
      ? `Reduce portions by ${Math.round((1 - ratio) * 100)}%`
      : 'Standard portion',
  };
}

// ─────────────────────────────────────────────────────────────────
// Main generator
// ─────────────────────────────────────────────────────────────────

/**
 * Generate a 7-day meal plan.
 * @param {object} profile  - user profile (from onboarding)
 * @param {number} iteration - current iteration number (1-based)
 * @param {string[]} dislikedIds - meal IDs user rated poorly
 * @returns {object} plan
 */
export function generateWeekPlan(profile, iteration = 1, dislikedIds = []) {
  const nutrition = calculateNutrition(profile);
  const { dailyTarget } = nutrition;

  const bfCal     = Math.round(dailyTarget * MEAL_SPLIT.breakfast);
  const lunchCal  = Math.round(dailyTarget * MEAL_SPLIT.lunch);
  const dinnerCal = Math.round(dailyTarget * MEAL_SPLIT.dinner);

  // Filter meals by dietary preference
  const bfPool     = dietFilter(MEALS_DB.breakfast, profile.diet, dislikedIds);
  const lunchPool  = dietFilter(MEALS_DB.lunch,     profile.diet, dislikedIds);
  const dinnerPool = dietFilter(MEALS_DB.dinner,    profile.diet, dislikedIds);

  const usedBf     = new Set();
  const usedLunch  = new Set();
  const usedDinner = new Set();

  const days = [];
  const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  for (let d = 0; d < 7; d++) {
    const bf     = scaleMeal(pickMeal(bfPool,     bfCal,     usedBf),     bfCal);
    const lunch  = scaleMeal(pickMeal(lunchPool,  lunchCal,  usedLunch),  lunchCal);
    const dinner = scaleMeal(pickMeal(dinnerPool, dinnerCal, usedDinner), dinnerCal);

    usedBf.add(bf.id);
    usedLunch.add(lunch.id);
    usedDinner.add(dinner.id);

    const dayTotal = bf.calories + lunch.calories + dinner.calories;
    const dayProtein = bf.protein + lunch.protein + dinner.protein;
    const dayCarbs   = bf.carbs   + lunch.carbs   + dinner.carbs;
    const dayFat     = bf.fat     + lunch.fat     + dinner.fat;

    days.push({
      dayIndex: d,
      dayName:  DAY_NAMES[d],
      meals: { breakfast: bf, lunch, dinner },
      totals: {
        calories: dayTotal,
        protein:  dayProtein,
        carbs:    dayCarbs,
        fat:      dayFat,
      },
    });
  }

  return {
    version: iteration,
    generatedAt: Date.now(),
    nutrition,
    days,
    meta: {
      totalMeals: 21,
      avgDailyCalories: Math.round(days.reduce((s, d) => s + d.totals.calories, 0) / 7),
    },
  };
}

// ─────────────────────────────────────────────────────────────────
// Evolution — produce next iteration from ratings
// ─────────────────────────────────────────────────────────────────

/**
 * Given a plan and a ratings map { mealId: 1-5 }, return updated dislikedIds
 * for use in the next generation.
 */
export function evolvePlan(currentDislikedIds, ratings) {
  const newDislikes = new Set(currentDislikedIds);
  Object.entries(ratings).forEach(([id, score]) => {
    if (score <= 2) newDislikes.add(id);
    if (score >= 4) newDislikes.delete(id); // forgive previously disliked meals if now liked
  });
  return [...newDislikes];
}

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────

export const DIET_OPTIONS = [
  { id: 'omnivore',      label: 'No Restrictions',  emoji: '🍽️',  desc: 'Eats everything' },
  { id: 'mediterranean', label: 'Mediterranean',     emoji: '🫒',  desc: 'Fish, veg, olive oil' },
  { id: 'vegetarian',    label: 'Vegetarian',        emoji: '🥚',  desc: 'No meat or fish' },
  { id: 'vegan',         label: 'Vegan',             emoji: '🌱',  desc: '100% plant-based' },
  { id: 'pescatarian',   label: 'Pescatarian',       emoji: '🐟',  desc: 'Fish + plant foods' },
  { id: 'keto',          label: 'Ketogenic',         emoji: '🥑',  desc: 'High fat, low carbs' },
];

export const ACTIVITY_OPTIONS = [
  { id: 'sedentary',   label: 'Sedentary',   emoji: '💺', desc: 'Desk job, minimal exercise' },
  { id: 'light',       label: 'Light',       emoji: '🚶', desc: '1-3 days/week exercise' },
  { id: 'moderate',    label: 'Moderate',    emoji: '🏃', desc: '3-5 days/week exercise' },
  { id: 'active',      label: 'Active',      emoji: '🏋️', desc: '6-7 days/week hard training' },
  { id: 'very_active', label: 'Very Active', emoji: '⚡', desc: 'Physical job + daily training' },
];

export const GOAL_OPTIONS = [
  { id: 'lose',     label: 'Lose Weight',  emoji: '📉', desc: '500 kcal deficit/day' },
  { id: 'maintain', label: 'Stay Fit',     emoji: '⚖️',  desc: 'Maintain current weight' },
  { id: 'gain',     label: 'Build Muscle', emoji: '💪', desc: '300 kcal surplus/day' },
];

export const MEAL_EMOJIS = { breakfast: '🌅', lunch: '☀️', dinner: '🌙' };
export const MEAL_LABELS = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner' };
