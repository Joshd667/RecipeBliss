import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  ChefHat, 
  ShoppingCart, 
  Search, 
  ArrowLeft, 
  Clock, 
  Users, 
  CheckCircle2, 
  Circle, 
  MoreHorizontal, 
  ArrowRight, 
  Play, 
  FileText,
  ListFilter,
  Trash2,
  Plus,
  Check,
  Scale,
  Lightbulb,
  Globe,
  Download
} from 'lucide-react';

// --- Mock Data ---

const INITIAL_RECIPES = [
  {
    id: 1,
    title: "Creamy Chicken & Rice Casserole with Herbed Crust",
    origin: "USA / UK 🇺🇸🇬🇧",
    description: "A refined take on the classic one-pot comfort meal. Juicy chicken thighs, aromatic rice, and tender veggies baked in a rich cream sauce, finished with a savoury stuffing crumble.",
    image: "/api/placeholder/400/300",
    prepTime: "10 min",
    cookTime: "50 min",
    servings: 4,
    category: "Dinner",
    calories: 650,
    ingredients: [
      { name: "Chicken Thighs (boneless)", amount: "1.5 lbs", amountMetric: "700g", category: "Meat", aisle: "12" },
      { name: "Long Grain Rice", amount: "1.5 cups", amountMetric: "1.5 cups", category: "Pantry", aisle: "4" },
      { name: "Cream of Chicken Soup", amount: "10.5 oz can", amountMetric: "300g can", category: "Pantry", aisle: "2" },
      { name: "Chicken Stock", amount: "2 cups", amountMetric: "475ml", category: "Pantry", aisle: "2" },
      { name: "Sour Cream", amount: "1/2 cup", amountMetric: "1/2 cup", category: "Dairy", aisle: "10" },
      { name: "Onion", amount: "1 large", amountMetric: "1 large", category: "Produce", aisle: "1" },
      { name: "Broccoli", amount: "1 head", amountMetric: "1 head", category: "Produce", aisle: "1" },
      { name: "Mushrooms", amount: "8 oz", amountMetric: "225g", category: "Produce", aisle: "1" },
      { name: "Sweetcorn (canned)", amount: "1 cup", amountMetric: "1 cup", category: "Pantry", aisle: "3" },
      { name: "Stuffing Mix", amount: "1 cup", amountMetric: "1 cup", category: "Pantry", aisle: "4" },
      { name: "Cheddar Cheese", amount: "1 cup", amountMetric: "1 cup", category: "Dairy", aisle: "10" },
      { name: "Butter", amount: "2 tbsp", amountMetric: "2 tbsp", category: "Dairy", aisle: "10" }
    ],
    steps: [
      "Preheat oven to 375°F (190°C). Grease a 9x13 baking dish.",
      "In a bowl, whisk together Condensed Soup, Sour Cream, and Hot Stock until smooth.",
      "Stir in Uncooked Rice, Diced Onion, Sliced Mushrooms, Sweetcorn, and Chicken chunks. Pour into baking dish.",
      "Tuck Broccoli florets into the mixture so they are mostly submerged. Cover tightly with foil.",
      "Bake for 35 minutes.",
      "Mix Crushed Stuffing, Grated Cheese, and Melted Butter.",
      "Remove foil. Sprinkle topping over the casserole. Bake uncovered for 15 minutes until golden."
    ],
    tips: [
      "Why Thighs? We use thighs because they withstand the long bake time without drying out, keeping the dish juicy.",
      "The Sauce: Sour cream is used instead of mayonnaise as it provides stability and tang without separating in the oven heat.",
      "The Steam: The foil must be sealed tightly! This traps the steam which is essential to cook the rice perfectly."
    ]
  },
  {
    id: 2,
    title: "Smoked Chorizo & Beef Chilli con Carne",
    origin: "Tex-Mex 🇲🇽🇺🇸",
    description: "A complex, thick stovetop ragu. The smoky paprika from the chorizo permeates the beef, while a secret addition adds a glossy richness found in top restaurants.",
    image: "/api/placeholder/400/300",
    prepTime: "15 min",
    cookTime: "60 min",
    servings: 6,
    category: "Dinner",
    calories: 580,
    ingredients: [
      { name: "Beef Mince (Lean)", amount: "1 lb", amountMetric: "500g", category: "Meat", aisle: "12" },
      { name: "Cooking Chorizo (Ring)", amount: "8 oz", amountMetric: "225g", category: "Meat", aisle: "12" },
      { name: "Onions", amount: "2", amountMetric: "2", category: "Produce", aisle: "1" },
      { name: "Red Peppers", amount: "2", amountMetric: "2", category: "Produce", aisle: "1" },
      { name: "Garlic Cloves", amount: "3", amountMetric: "3", category: "Produce", aisle: "1" },
      { name: "Tomato Puree", amount: "2 tbsp", amountMetric: "2 tbsp", category: "Pantry", aisle: "3" },
      { name: "Chopped Tomatoes", amount: "14 oz can", amountMetric: "400g can", category: "Pantry", aisle: "3" },
      { name: "Kidney Beans", amount: "14 oz can", amountMetric: "400g can", category: "Pantry", aisle: "3" },
      { name: "Beef Stock", amount: "1.5 cups", amountMetric: "300ml", category: "Pantry", aisle: "2" },
      { name: "Dark Chocolate (70%)", amount: "1 square", amountMetric: "1 square", category: "Pantry", aisle: "4" },
      { name: "Smoked Paprika", amount: "2 tsp", amountMetric: "2 tsp", category: "Pantry", aisle: "5" },
      { name: "Ground Cumin", amount: "2 tsp", amountMetric: "2 tsp", category: "Pantry", aisle: "5" },
      { name: "Mild Chilli Powder", amount: "1 tsp", amountMetric: "1 tsp", category: "Pantry", aisle: "5" },
      { name: "Dried Oregano", amount: "1 tsp", amountMetric: "1 tsp", category: "Pantry", aisle: "5" }
    ],
    steps: [
      "Dice the Chorizo (peel off skin if tough). In a large pot over medium heat, fry Chorizo until crispy and oil is released. Remove meat, leave oil.",
      "Fry diced Onions and Peppers in the chorizo oil for 8 mins until soft. Add crushed Garlic for 1 min.",
      "Turn heat up. Add Beef Mince. Break up and fry until browned.",
      "Stir in Tomato Puree, Paprika, Cumin, Chilli Powder, Oregano. Cook for 2 mins to toast spices.",
      "Add Chopped Tomatoes, Beef Stock, drained Kidney Beans, and the crispy Chorizo back to the pot.",
      "Bring to boil, then simmer UNCOVERED for 45 mins. The sauce should reduce and become thick.",
      "Turn off heat. Stir in the Dark Chocolate until melted. Season with salt/pepper."
    ],
    tips: [
      "The Secret Ingredient: Dark chocolate doesn't make it a dessert. It adds a deep, glossy finish and a richness that enhances the savoury beef.",
      "Texture: We cook this with the lid OFF to allow evaporation. This concentrates the flavor and creates a thick ragu that clings to food.",
      "Flavor Balance: Red peppers are used instead of green to add a natural sweetness that balances the acidity of the tomatoes and the heat of the spice."
    ]
  },
  {
    id: 3,
    title: "Vegetarian Pastel Azteca (Tortilla Pie)",
    origin: "Mexico 🇲🇽",
    description: "A Mexican Lasagna baked in a round pot. Layers of soft tortillas, creamy refried beans, and a saucy roasted veggie filling, all crowned with melted cheese.",
    image: "/api/placeholder/400/300",
    prepTime: "15 min",
    cookTime: "30 min",
    servings: 4,
    category: "Dinner",
    calories: 450,
    ingredients: [
      { name: "Large Soft Flour Tortillas", amount: "5", amountMetric: "5", category: "Bakery", aisle: "9" },
      { name: "Cheddar/Mozzarella Mix", amount: "7 oz", amountMetric: "200g", category: "Dairy", aisle: "10" },
      { name: "Mixed Bell Peppers", amount: "3", amountMetric: "3", category: "Produce", aisle: "1" },
      { name: "Red Onions", amount: "2", amountMetric: "2", category: "Produce", aisle: "1" },
      { name: "Courgette (Zucchini)", amount: "1 large", amountMetric: "1 large", category: "Produce", aisle: "1" },
      { name: "Black Beans (tinned)", amount: "14 oz can", amountMetric: "400g can", category: "Pantry", aisle: "3" },
      { name: "Refried Beans", amount: "14 oz can", amountMetric: "400g can", category: "Pantry", aisle: "3" },
      { name: "Passata (Sieved Tomatoes)", amount: "17 oz carton", amountMetric: "500g carton", category: "Pantry", aisle: "3" },
      { name: "House Blend Fajita Seasoning", amount: "2 tbsp", amountMetric: "2 tbsp", category: "Pantry", aisle: "5" }
    ],
    steps: [
      "Preheat oven to 350°F (180°C). Grease your round Dutch oven or baking dish.",
      "Slice Peppers and Onions. Grate the Courgette. Sauté peppers/onions in a pan for 5 mins until soft.",
      "Add Grated Courgette, drained Black Beans, Passata, and Fajita Seasoning to the pan. Simmer for 5 mins into a thick stew.",
      "ASSEMBLY: Place a Tortilla in the pot. Spread with a thin layer of Refried Beans. Ladle over 1/4 of the Veggie Stew. Sprinkle cheese.",
      "Repeat layers 3 times. Place final Tortilla on top.",
      "Spread remaining Refried Beans on the TOP tortilla (to prevent burning) and cover with remaining Cheese.",
      "Bake for 25 mins until bubbling and golden. Let stand for 5 mins before slicing."
    ],
    tips: [
      "Moisture Control: We grate courgette into the sauce because as it cooks, it releases water, ensuring the stack stays moist from the inside out.",
      "The 'Glue': Refried beans are essential here. They act as a barrier to stop the sauce soaking into the tortilla too quickly, keeping the layers distinct.",
      "The Gravy: We simmer the veg in passata first to soften the tortillas gently, rather than just using dry fried vegetables which would result in a chewy texture."
    ]
  },
  {
    id: 6,
    title: "Nasu Buta Miso Yaki (Sticky Miso Pork & Aubergine)",
    origin: "Japan 🇯🇵",
    description: "An authentic, easy-to-cook traybake. Pork shoulder steaks and aubergine chunks roasted in a sweet, savory miso glaze until sticky and tender.",
    image: "/api/placeholder/400/300",
    prepTime: "10 min",
    cookTime: "30 min",
    servings: 4,
    category: "Dinner",
    calories: 520,
    ingredients: [
      { name: "Pork Shoulder Steaks", amount: "4", amountMetric: "4 (600g)", category: "Meat", aisle: "12" },
      { name: "Aubergines (Eggplant)", amount: "2 large", amountMetric: "2 large", category: "Produce", aisle: "1" },
      { name: "Spring Onions", amount: "1 bunch", amountMetric: "1 bunch", category: "Produce", aisle: "1" },
      { name: "Fresh Ginger", amount: "1 thumb", amountMetric: "1 thumb", category: "Produce", aisle: "1" },
      { name: "Garlic Cloves", amount: "2", amountMetric: "2", category: "Produce", aisle: "1" },
      { name: "White Miso Paste", amount: "3 tbsp", amountMetric: "3 tbsp", category: "World Foods", aisle: "5" },
      { name: "Soy Sauce", amount: "2 tbsp", amountMetric: "2 tbsp", category: "World Foods", aisle: "5" },
      { name: "Honey", amount: "2 tbsp", amountMetric: "2 tbsp", category: "Pantry", aisle: "4" },
      { name: "Sesame Oil", amount: "1 tbsp", amountMetric: "1 tbsp", category: "World Foods", aisle: "5" },
      { name: "Mirin (or 1tsp sugar+water)", amount: "1 tbsp", amountMetric: "1 tbsp", category: "World Foods", aisle: "5" },
      { name: "Toasted Sesame Seeds", amount: "1 tbsp", amountMetric: "1 tbsp", category: "Pantry", aisle: "5" }
    ],
    steps: [
      "Preheat oven to 200°C (180°C Fan) / 400°F. Grab a deep baking tray.",
      "THE GLAZE: In a small bowl, whisk Miso, Soy Sauce, Honey, Sesame Oil, Mirin, Grated Ginger, and Crushed Garlic into a thick paste.",
      "Cut Aubergines into bite-sized chunks. Place them and the Pork Steaks into the tray.",
      "Pour over the glaze. Massage it into the meat and veg with your hands so everything is well coated.",
      "Spread the aubergines out around the pork. Bake for 30 minutes.",
      "Halfway through (15 mins), flip the steaks and stir the veg.",
      "Finish by sprinkling generously with sliced Spring Onions and Sesame Seeds. Serve with plain rice."
    ],
    tips: [
      "The Meat Cut: Do NOT use pork loin steaks. They are too lean and will become dry in the oven. Shoulder steaks have the necessary fat content to stay juicy and baste the vegetables.",
      "The Umami Secret: White Miso is a fermented soybean paste. It adds a deep savoury richness that salt alone cannot achieve.",
      "Mirin Alternative: If you cannot find Mirin (Japanese rice wine), you can substitute it with 1 tsp of sugar dissolved in 1 tbsp of water."
    ]
  },
  {
    id: 7,
    title: "Pulled Tamarind Chicken & Sweet Potato One-Pot",
    origin: "SE Asian Fusion 🌏",
    description: "A vibrant, sticky braise. Chicken thighs are cooked slowly in a sour-sweet tamarind sauce until tender enough to pull apart, served alongside caramelised sweet potatoes.",
    image: "/api/placeholder/400/300",
    prepTime: "15 min",
    cookTime: "1 hr 5 min",
    servings: 4,
    category: "Dinner",
    calories: 540,
    ingredients: [
      { name: "Chicken Thighs (boneless/skinless)", amount: "8", amountMetric: "8 (800g)", category: "Meat", aisle: "12" },
      { name: "Sweet Potatoes (Large)", amount: "2", amountMetric: "2 (800g total)", category: "Produce", aisle: "1" },
      { name: "Red Onions", amount: "2", amountMetric: "2", category: "Produce", aisle: "1" },
      { name: "Fresh Ginger", amount: "1 thumb", amountMetric: "1 thumb", category: "Produce", aisle: "1" },
      { name: "Garlic Cloves", amount: "3", amountMetric: "3", category: "Produce", aisle: "1" },
      { name: "Fresh Red Chilli", amount: "1", amountMetric: "1", category: "Produce", aisle: "1" },
      { name: "Tamarind Paste (Concentrate)", amount: "3 tbsp", amountMetric: "3 tbsp", category: "World Foods", aisle: "5" },
      { name: "Light Brown Sugar", amount: "3 tbsp", amountMetric: "3 tbsp", category: "Pantry", aisle: "4" },
      { name: "Soy Sauce", amount: "2 tbsp", amountMetric: "2 tbsp", category: "Pantry", aisle: "5" },
      { name: "Fish Sauce (or Miso)", amount: "1 tbsp", amountMetric: "1 tbsp", category: "World Foods", aisle: "5" },
      { name: "Fresh Coriander", amount: "1 bunch", amountMetric: "1 bunch", category: "Produce", aisle: "1" }
    ],
    steps: [
      "Preheat oven to 180°C (350°F).",
      "THE SAUCE: Whisk Tamarind, Sugar, Soy Sauce, Fish Sauce (or Miso), Grated Ginger, Crushed Garlic, Sliced Chilli, and 1/2 cup Water.",
      "Peel Sweet Potatoes and cut into large 3cm (1 inch) chunks. Cut onions into wedges. Place in deep baking dish.",
      "Nestle the Chicken Thighs among the vegetables.",
      "Pour the sauce over everything. Toss to coat.",
      "Cover tightly with foil. Bake for 45 minutes.",
      "Remove foil. Bake UNCOVERED for 20 mins to reduce sauce and darken.",
      "Use two forks to shred (pull) the chicken directly in the pot. Stir to mix with the sticky sauce and soft potatoes. Top with Coriander."
    ],
    tips: [
      "Potato Size: Ensure your sweet potato chunks are large (approx 3cm). If they are too small, they will turn to mush during the long braise.",
      "Fish Sauce Alternative: If you don't like Fish Sauce, substitute it with 1 tbsp of White Miso Paste. It adds the same necessary salty 'umami' depth without the smell.",
      "Tamarind Potency: Different brands of tamarind paste vary in strength. Taste your sauce before cooking—it should be pleasantly sour but balanced by the sugar."
    ]
  },
  {
    id: 8,
    title: "Bahian Coconut & Lime Fish Bake (Moqueca)",
    origin: "Brazil 🇧🇷",
    description: "A vibrant, golden seafood stew. Mild white fish is 'cured' in lime to remove any fishiness, then baked in a creamy, aromatic coconut and turmeric sauce.",
    image: "/api/placeholder/400/300",
    prepTime: "10 min",
    cookTime: "25 min",
    servings: 4,
    category: "Dinner",
    calories: 420,
    ingredients: [
      { name: "Cod or Haddock Loins", amount: "4 (thick)", amountMetric: "4 (600g)", category: "Seafood", aisle: "12" },
      { name: "Limes (Juice of)", amount: "2", amountMetric: "2", category: "Produce", aisle: "1" },
      { name: "Coconut Milk (Full Fat)", amount: "1 can", amountMetric: "400ml can", category: "Pantry", aisle: "3" },
      { name: "Red Pepper", amount: "1", amountMetric: "1", category: "Produce", aisle: "1" },
      { name: "Yellow Pepper", amount: "1", amountMetric: "1", category: "Produce", aisle: "1" },
      { name: "Large Onion", amount: "1", amountMetric: "1", category: "Produce", aisle: "1" },
      { name: "Tomatoes", amount: "2", amountMetric: "2", category: "Produce", aisle: "1" },
      { name: "Garlic Cloves", amount: "2", amountMetric: "2", category: "Produce", aisle: "1" },
      { name: "Ground Turmeric", amount: "1 tsp", amountMetric: "1 tsp", category: "Pantry", aisle: "5" },
      { name: "Sweet Paprika", amount: "1 tsp", amountMetric: "1 tsp", category: "Pantry", aisle: "5" },
      { name: "Fresh Coriander", amount: "1 bunch", amountMetric: "1 bunch", category: "Produce", aisle: "1" },
      { name: "Sea Salt", amount: "1 tsp", amountMetric: "1 tsp", category: "Pantry", aisle: "5" }
    ],
    steps: [
      "THE CURE: Place fish loins in a bowl. Rub with Lime Juice, Crushed Garlic, and Salt. Let sit for 10 mins while you chop veg.",
      "Preheat oven to 200°C (180°C Fan) / 400°F.",
      "Slice Onions and Peppers into rings. Slice Tomatoes into rounds. Layer them in the bottom of a deep baking dish.",
      "Place the marinated fish loins on top of the veg. Pour any leftover lime juice over them.",
      "THE GOLDEN SAUCE: Whisk Coconut Milk, Turmeric, and Paprika in a jug. Pour over the fish and veg.",
      "Bake UNCOVERED for 20-25 minutes until the sauce bubbles and fish flakes easily.",
      "Top with a huge handful of chopped Coriander. Serve with white rice."
    ],
    tips: [
      "Fish Alternatives: If you want to splash out, Monkfish is excellent as it holds its shape perfectly. For a special treat, add King Prawns for the last 10 minutes of cooking.",
      "The Lime Cure: Don't skip the marinating step! The acid in the lime starts to 'cook' the fish (like ceviche) and neutralizes the amines that cause 'fishy' smells, leaving just a fresh, clean taste.",
      "Coconut Milk: Use full-fat coconut milk. Light versions will split in the oven and won't give you that luxurious, creamy sauce texture."
    ]
  },
  {
    id: 9,
    title: "Perfect Fluffy Rice (Master Method)",
    origin: "Global 🌎",
    description: "The fail-safe absorption technique for Basmati or Long Grain. Rinsing and steaming are the secrets to perfectly separated grains without a rice cooker.",
    image: "/api/placeholder/400/300",
    prepTime: "5 min",
    cookTime: "25 min",
    servings: 4,
    category: "Side",
    calories: 200,
    ingredients: [
      { name: "Basmati OR Long Grain Rice", amount: "1.5 cups", amountMetric: "300g", category: "Pantry", aisle: "4" },
      { name: "Water (Boiling)", amount: "2.25 cups", amountMetric: "540ml", category: "Pantry", aisle: "0" },
      { name: "Salt", amount: "1/2 tsp", amountMetric: "1/2 tsp", category: "Pantry", aisle: "5" },
      { name: "Butter (Optional)", amount: "1 tsp", amountMetric: "1 tsp", category: "Dairy", aisle: "10" }
    ],
    steps: [
      "THE RINSE (CRUCIAL): Place rice in a sieve. Wash under cold tap until the water runs CLEAR. This removes starch that causes gluey rice.",
      "Place rinsed rice, Boiling Water, Salt, and Butter in a pot with a tight-fitting lid.",
      "Bring to a boil (this should be fast).",
      "LID ON. Turn heat to LOWEST possible setting. Cook for 12 minutes. NO PEEKING!",
      "Turn heat OFF. Leave the pot on the burner (if gas) or move to a warm spot (if electric). Let STEAM for 10 minutes. Do not remove lid.",
      "Remove lid. Fluff gently with a fork. Serve immediately."
    ],
    tips: [
      "Ratio Rule: For Basmati, use 1 cup rice to 1.5 cups water. For American Long Grain, use 1 cup rice to 1.75 cups water. The recipe above uses the Basmati ratio.",
      "The Steam: The 10-minute steam with the heat off is what finishes the cooking gently. If you skip this, the rice may be wet at the bottom.",
      "No Peeking: Lifting the lid lets the steam escape and ruins the cooking process. Trust the timer!"
    ]
  },
  {
    id: 4,
    title: "Zesty Chilli-Lime Dressing",
    origin: "Global 🌎",
    description: "A sharp, acidic, and spicy macerated dressing designed to cut through rich meat sauces. Essential for the Smoky Chilli.",
    image: "/api/placeholder/400/300",
    prepTime: "5 min",
    cookTime: "0 min",
    servings: 6,
    category: "Side",
    calories: 45,
    ingredients: [
      { name: "Fresh Red Chillies", amount: "2", amountMetric: "2", category: "Produce", aisle: "1" },
      { name: "Dried Chilli Flakes (Alternative)", amount: "1 tsp", amountMetric: "1 tsp", category: "Pantry", aisle: "5" },
      { name: "Limes", amount: "2", amountMetric: "2", category: "Produce", aisle: "1" },
      { name: "Sea Salt", amount: "1 pinch", amountMetric: "1 pinch", category: "Pantry", aisle: "5" },
      { name: "Olive Oil", amount: "1 tsp", amountMetric: "1 tsp", category: "Pantry", aisle: "4" }
    ],
    steps: [
      "If using FRESH: Finely slice the chillies (keep seeds for heat). Place in a small bowl.",
      "If using DRIED: Place flakes in a small bowl.",
      "Squeeze the juice of 2 limes over the chilli. Add a pinch of salt and the oil.",
      "Mix well and press down with a spoon.",
      "Let sit for at least 10 minutes before serving. This 'cures' the chilli and extracts the heat into the juice."
    ],
    tips: [
      "Curing: The acid in the lime juice 'cures' fresh chillies, softening their bite, or rehydrates dried flakes so they aren't papery.",
      "Balance: This side is designed to add acid. The main Chilli con Carne is rich and savory; this dressing cuts through that fat for a balanced palate."
    ]
  },
  {
    id: 5,
    title: "House Blend Fajita Seasoning",
    origin: "Tex-Mex 🇲🇽🇺🇸",
    description: "A robust, smoky spice blend. Far superior to store-bought packets and free from preservatives. Make a batch and store it.",
    image: "/api/placeholder/400/300",
    prepTime: "5 min",
    cookTime: "0 min",
    servings: 12,
    category: "Spice Mix",
    calories: 10,
    ingredients: [
      { name: "Smoked Paprika", amount: "1 tbsp", amountMetric: "1 tbsp", category: "Pantry", aisle: "5" },
      { name: "Ground Cumin", amount: "1 tsp", amountMetric: "1 tsp", category: "Pantry", aisle: "5" },
      { name: "Garlic Powder", amount: "1 tsp", amountMetric: "1 tsp", category: "Pantry", aisle: "5" },
      { name: "Onion Powder", amount: "1 tsp", amountMetric: "1 tsp", category: "Pantry", aisle: "5" },
      { name: "Dried Oregano", amount: "1 tsp", amountMetric: "1 tsp", category: "Pantry", aisle: "5" },
      { name: "Chilli Powder (Medium)", amount: "1/2 tsp", amountMetric: "1/2 tsp", category: "Pantry", aisle: "5" },
      { name: "Salt", amount: "1 tsp", amountMetric: "1 tsp", category: "Pantry", aisle: "5" },
      { name: "Sugar", amount: "1 pinch", amountMetric: "1 pinch", category: "Pantry", aisle: "4" }
    ],
    steps: [
      "Measure all spices into a small jar or bowl.",
      "Shake or whisk vigorously to combine.",
      "Store in an airtight container.",
      "Usage: Use 2 tbsp of this mix for the Vegetarian Pastel Azteca."
    ],
    tips: [
      "Control: Making your own mix allows you to control the salt content, which is often very high in pre-mixed packets.",
      "Freshness: Spices release oil when mixed. This blend will taste significantly more potent than a packet that has been sitting on a shelf for months."
    ]
  }
];

// --- Scaling Helper ---

// Simple parser to extract the number from strings like "1.5 lbs", "2 large", "1/2 cup"
const parseAmount = (str) => {
  if (!str) return { val: 0, text: str, hasNumber: false };
  const match = str.match(/^(\d+(?:\.\d+)?|\d+\/\d+)(.*)$/);
  if (!match) return { val: 1, text: str, hasNumber: false }; 
  
  let val = match[1];
  if (val.includes('/')) {
    const [n, d] = val.split('/');
    val = parseFloat(n) / parseFloat(d);
  } else {
    val = parseFloat(val);
  }
  return { val, text: match[2], hasNumber: true };
};

const scaleString = (str, factor) => {
  const { val, text, hasNumber } = parseAmount(str);
  if (!hasNumber) return str;
  const scaled = Math.round(val * factor * 100) / 100;
  return `${scaled}${text}`;
};

// --- Components ---

const Card = ({ children, className = "", onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} ${className}`}
  >
    {children}
  </div>
);

const Button = ({ children, onClick, variant = "primary", className = "", icon: Icon }) => {
  const baseStyle = "flex items-center justify-center font-medium rounded-xl transition-all active:scale-95";
  const variants = {
    primary: "bg-emerald-600 text-white hover:bg-emerald-700 py-3 px-6 shadow-emerald-200 shadow-lg",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200 py-2 px-4",
    ghost: "text-slate-500 hover:bg-slate-50 hover:text-slate-900 py-2 px-3",
    outline: "border border-slate-200 text-slate-700 hover:bg-slate-50 py-2 px-4"
  };

  return (
    <button onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {Icon && <Icon size={18} className="mr-2" />}
      {children}
    </button>
  );
};

// --- Main App Component ---

export default function App() {
  const [activeTab, setActiveTab] = useState('recipes'); 
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [shoppingList, setShoppingList] = useState([]);
  const [sortMode, setSortMode] = useState('aisle');
  const [useMetric, setUseMetric] = useState(true);
  
  // Selection State: Maps recipeId -> number of servings selected
  const [selectedRecipes, setSelectedRecipes] = useState({}); 

  // PWA Install State
  const [installPrompt, setInstallPrompt] = useState(null);

  // Recipe Detail State
  const [recipeViewMode, setRecipeViewMode] = useState('overview'); 
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // --- Effects ---

  // PWA Install Listener
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // --- Actions ---

  const handleInstallClick = () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    installPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        setInstallPrompt(null);
      }
    });
  };

  const toggleRecipeSelection = (e, id, defaultServings) => {
    e.stopPropagation();
    const newSelected = { ...selectedRecipes };
    
    if (newSelected[id]) {
      delete newSelected[id];
    } else {
      newSelected[id] = defaultServings;
    }
    setSelectedRecipes(newSelected);
  };

  const updateServingCount = (e, id, change) => {
    e.stopPropagation();
    const newSelected = { ...selectedRecipes };
    if (!newSelected[id]) return;

    const newCount = newSelected[id] + change;
    if (newCount < 1) {
      delete newSelected[id]; 
    } else {
      newSelected[id] = newCount;
    }
    setSelectedRecipes(newSelected);
  };

  const addIngredientsToShoppingList = (ingredients) => {
    const newItems = ingredients.map(ing => ({
      ...ing,
      id: Date.now() + Math.random(),
      checked: false
    }));
    setShoppingList(prev => [...prev, ...newItems]);
  };

  const addSelectedRecipesToShopping = () => {
    let allIngredients = [];

    // Iterate through selected recipe IDs
    Object.keys(selectedRecipes).forEach(idStr => {
      const id = parseInt(idStr);
      const recipe = INITIAL_RECIPES.find(r => r.id === id);
      if (!recipe) return;

      const selectedCount = selectedRecipes[id];
      const originalServings = recipe.servings;
      const factor = selectedCount / originalServings;

      // Scale ingredients
      const scaledIngredients = recipe.ingredients.map(ing => ({
        ...ing,
        amount: scaleString(ing.amount, factor),
        amountMetric: scaleString(ing.amountMetric, factor),
      }));

      allIngredients = [...allIngredients, ...scaledIngredients];
    });

    addIngredientsToShoppingList(allIngredients);
    setSelectedRecipes({});
    setActiveTab('shopping');
  };

  const toggleShoppingItem = (id) => {
    setShoppingList(prev => prev.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const clearCheckedItems = () => {
    setShoppingList(prev => prev.filter(item => !item.checked));
  };

  const getAmount = (item) => useMetric ? item.amountMetric : item.amount;

  // --- Components ---

  const CountControl = ({ count, onIncrement, onDecrement }) => {
    const timerRef = useRef(null);
    const isLongPress = useRef(false);

    const handlePointerDown = (e) => {
      e.stopPropagation();
      isLongPress.current = false;
      timerRef.current = setTimeout(() => {
        isLongPress.current = true;
        onDecrement();
      }, 500); // 500ms hold to decrease
    };

    const handlePointerUp = (e) => {
      e.stopPropagation();
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (!isLongPress.current) {
        onIncrement();
      }
    };

    return (
      <button
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => clearTimeout(timerRef.current)}
        onContextMenu={(e) => e.preventDefault()} // prevent context menu on mobile
        className="absolute top-3 right-12 bg-white/90 backdrop-blur-md text-emerald-600 font-bold text-xs h-8 px-3 rounded-full flex items-center shadow-sm hover:bg-white transition-all active:scale-95"
      >
        <Users size={12} className="mr-1" />
        {count} pp
      </button>
    );
  };

  const HeaderToggle = () => (
    <div className="flex gap-2">
      {installPrompt && (
        <button 
          onClick={handleInstallClick}
          className="flex items-center justify-center bg-emerald-600 text-white rounded-full p-2 h-8 w-8 shadow hover:bg-emerald-700 transition-all"
        >
          <Download size={14} />
        </button>
      )}
      <div 
        onClick={() => setUseMetric(!useMetric)}
        className="flex items-center bg-slate-100 rounded-full p-1 cursor-pointer select-none border border-slate-200 h-8"
      >
        <div className={`px-3 py-0.5 rounded-full text-[10px] font-bold transition-all ${!useMetric ? 'bg-white shadow text-slate-900' : 'text-slate-400'}`}>
          US
        </div>
        <div className={`px-3 py-0.5 rounded-full text-[10px] font-bold transition-all ${useMetric ? 'bg-emerald-500 shadow text-white' : 'text-slate-400'}`}>
          UK
        </div>
      </div>
    </div>
  );

  const RecipeCard = ({ recipe, selectedCount, onToggleSelect, onUpdateCount }) => (
    <Card onClick={() => { setSelectedRecipe(recipe); setRecipeViewMode('overview'); }} className={`group relative ${selectedCount ? 'ring-2 ring-emerald-500' : ''}`}>
      <div className="h-48 bg-slate-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-300 to-slate-400 group-hover:scale-105 transition-transform duration-500" />
        
        {/* Origin Badge */}
        {recipe.origin && (
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-semibold text-white flex items-center shadow-sm z-10">
            <Globe size={10} className="mr-1" /> {recipe.origin}
          </div>
        )}
        
        {/* Count Control (Only if selected) */}
        {selectedCount && (
          <CountControl 
            count={selectedCount} 
            onIncrement={() => onUpdateCount(recipe.id, 1)}
            onDecrement={() => onUpdateCount(recipe.id, -1)}
          />
        )}

        {/* Selection Toggle Button */}
        <button 
          onClick={(e) => onToggleSelect(e, recipe.id, recipe.servings)}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-sm backdrop-blur-md transition-all ${selectedCount ? 'bg-emerald-500 text-white' : 'bg-white/90 text-slate-400 hover:bg-white'}`}
        >
          {selectedCount ? <Check size={16} /> : <Plus size={16} />}
        </button>

        {/* Info Overlay */}
        <div className="absolute bottom-3 left-3 flex gap-2">
          <div className="bg-black/40 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-semibold text-white flex items-center shadow-sm">
            <Clock size={12} className="mr-1" /> {recipe.cookTime}
          </div>
          <div className="bg-black/40 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-semibold text-white flex items-center shadow-sm">
            <Users size={12} className="mr-1" /> {recipe.servings}
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">{recipe.category}</div>
        <h3 className="text-lg font-bold text-slate-900 leading-tight mb-2">{recipe.title}</h3>
        <div className="flex items-center text-slate-500 text-sm">
          <span className="mr-4">{recipe.ingredients.length} ingredients</span>
          <span>{recipe.calories} kcal</span>
        </div>
      </div>
    </Card>
  );

  const StepByStepView = ({ recipe }) => {
    const step = recipe.steps[currentStepIndex];
    const progress = ((currentStepIndex + 1) / recipe.steps.length) * 100;

    return (
      <div className="flex flex-col h-full bg-slate-50">
        <div className="bg-white p-4 flex items-center justify-between border-b border-slate-100 shadow-sm z-10">
          <button onClick={() => setRecipeViewMode('overview')} className="p-2 -ml-2 text-slate-500 hover:text-slate-900">
            <ArrowLeft />
          </button>
          <div className="text-sm font-semibold text-slate-500">
            Step {currentStepIndex + 1} of {recipe.steps.length}
          </div>
          <div className="w-8" /> 
        </div>

        <div className="h-1 bg-slate-200 w-full">
          <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center overflow-y-auto">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold text-2xl mb-6 shadow-sm">
            {currentStepIndex + 1}
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 leading-snug mb-8">
            {step}
          </h2>
        </div>

        <div className="bg-white p-6 border-t border-slate-100 flex justify-between items-center pb-8">
          <Button 
            variant="secondary" 
            onClick={() => setCurrentStepIndex(prev => Math.max(0, prev - 1))}
            className={currentStepIndex === 0 ? 'opacity-50 pointer-events-none' : ''}
          >
            Previous
          </Button>

          {currentStepIndex < recipe.steps.length - 1 ? (
            <Button 
              onClick={() => setCurrentStepIndex(prev => prev + 1)}
              icon={ArrowRight}
            >
              Next Step
            </Button>
          ) : (
            <Button 
              onClick={() => { setRecipeViewMode('overview'); }}
              className="bg-slate-900 hover:bg-slate-800 shadow-slate-200"
              icon={CheckCircle2}
            >
              Finish
            </Button>
          )}
        </div>
      </div>
    );
  };

  const RecipeDetail = ({ recipe }) => {
    if (recipeViewMode === 'step') return <StepByStepView recipe={recipe} />;

    return (
      <div className="pb-24 bg-white min-h-screen">
        <div className="h-64 bg-slate-200 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50" />
          <button 
            onClick={() => setSelectedRecipe(null)}
            className="absolute top-4 left-4 bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/30 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="absolute top-4 right-4">
             <HeaderToggle />
          </div>
          <div className="absolute bottom-6 left-6 text-white">
            <div className="flex items-center gap-2 mb-2">
              <div className="inline-block px-2 py-0.5 bg-emerald-500 rounded text-xs font-bold uppercase tracking-wide">
                {recipe.category}
              </div>
              {recipe.origin && (
                <div className="inline-block px-2 py-0.5 bg-white/20 backdrop-blur-md rounded text-xs font-bold uppercase tracking-wide border border-white/20">
                  {recipe.origin}
                </div>
              )}
            </div>
            <h1 className="text-3xl font-bold leading-tight">{recipe.title}</h1>
          </div>
        </div>

        <div className="flex justify-around p-4 border-b border-slate-100 bg-white">
          <div className="flex flex-col items-center">
            <Clock size={20} className="text-emerald-600 mb-1" />
            <span className="text-xs text-slate-500 font-medium">TOTAL</span>
            <span className="text-sm font-bold text-slate-800">{recipe.cookTime}</span>
          </div>
          <div className="flex flex-col items-center">
            <Users size={20} className="text-emerald-600 mb-1" />
            <span className="text-xs text-slate-500 font-medium">SERVES</span>
            <span className="text-sm font-bold text-slate-800">{recipe.servings} pp</span>
          </div>
          <div className="flex flex-col items-center">
            <FileText size={20} className="text-emerald-600 mb-1" />
            <span className="text-xs text-slate-500 font-medium">STEPS</span>
            <span className="text-sm font-bold text-slate-800">{recipe.steps.length}</span>
          </div>
        </div>

        <div className="p-6 max-w-3xl mx-auto">
          <p className="text-slate-600 mb-8 leading-relaxed">{recipe.description}</p>

          <div className="flex gap-3 mb-8">
            <Button 
              className="flex-1" 
              icon={Play}
              onClick={() => { setCurrentStepIndex(0); setRecipeViewMode('step'); }}
            >
              Start Cooking
            </Button>
            <Button 
              variant="outline"
              icon={ShoppingCart}
              onClick={() => {
                addIngredientsToShoppingList(recipe.ingredients);
                setActiveTab('shopping');
                setSelectedRecipe(null);
              }}
            >
              Add Items
            </Button>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
              Ingredients <span className="text-sm font-normal text-slate-400 ml-2">({recipe.ingredients.length})</span>
            </h2>
            <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
              {recipe.ingredients.map((ing, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-200 last:border-0">
                  <span className="text-slate-700 font-medium">{ing.name}</span>
                  <span className="text-slate-500 font-bold">{getAmount(ing)}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Method</h2>
            <div className="space-y-6">
              {recipe.steps.map((step, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 text-slate-500 font-bold flex items-center justify-center text-sm">
                    {idx + 1}
                  </div>
                  <p className="text-slate-600 pt-1 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Chef's Tips Section */}
          {recipe.tips && (
            <div className="mt-8 bg-amber-50 border border-amber-100 p-6 rounded-2xl animate-in fade-in duration-500">
              <h3 className="text-lg font-bold text-amber-800 mb-3 flex items-center">
                <Lightbulb className="mr-2" size={20} /> Chef's Tips
              </h3>
              <ul className="space-y-3">
                {recipe.tips.map((tip, idx) => (
                  <li key={idx} className="text-amber-900/80 text-sm leading-relaxed flex items-start">
                    <span className="mr-2 mt-1.5 w-1.5 h-1.5 bg-amber-400 rounded-full flex-shrink-0" /> 
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>
      </div>
    );
  };

  const ShoppingList = () => {
    const sortedList = useMemo(() => {
      let sorted = [...shoppingList];
      if (sortMode === 'alpha') {
        sorted.sort((a, b) => a.name.localeCompare(b.name));
      } else if (sortMode === 'category') {
        sorted.sort((a, b) => a.category.localeCompare(b.category));
      } else if (sortMode === 'aisle') {
        sorted.sort((a, b) => {
          const aisleA = parseInt(a.aisle) || 99;
          const aisleB = parseInt(b.aisle) || 99;
          return aisleA - aisleB;
        });
      }
      return sorted;
    }, [shoppingList, sortMode]);

    const groups = useMemo(() => {
      if (sortedList.length === 0) return {};
      
      const grouped = {};
      sortedList.forEach(item => {
        let key = 'All Items';
        if (sortMode === 'category') key = item.category;
        if (sortMode === 'aisle') key = `Aisle ${item.aisle || '?'}`;
        if (sortMode === 'alpha') key = item.name[0].toUpperCase();
        
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(item);
      });
      return grouped;
    }, [sortedList, sortMode]);

    if (shoppingList.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-slate-50/50">
          <div className="absolute top-4 right-4">
             <HeaderToggle />
          </div>
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
            <ShoppingCart size={40} />
          </div>
          <h2 className="text-xl font-bold text-slate-700 mb-2">Your list is empty</h2>
          <p className="text-slate-500 max-w-xs mb-6">Start browsing recipes and add ingredients to build your shopping plan.</p>
          <Button onClick={() => setActiveTab('recipes')}>Browse Recipes</Button>
        </div>
      );
    }

    return (
      <div className="pb-24 bg-white min-h-screen">
        <div className="p-6 sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-slate-900">Shopping List</h1>
            <div className="flex items-center gap-3">
              <HeaderToggle />
              <div className="text-sm text-slate-500 font-medium">
                {shoppingList.filter(i => i.checked).length}/{shoppingList.length}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {[
              { id: 'aisle', label: 'By Aisle' },
              { id: 'category', label: 'By Type' },
              { id: 'alpha', label: 'A-Z' }
            ].map(mode => (
              <button
                key={mode.id}
                onClick={() => setSortMode(mode.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  sortMode === mode.id 
                    ? 'bg-slate-900 text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {Object.entries(groups).map(([groupName, items]) => (
            <div key={groupName} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 pl-1">
                {groupName}
              </h3>
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                {items.map(item => (
                  <div 
                    key={item.id}
                    onClick={() => toggleShoppingItem(item.id)}
                    className={`
                      flex items-center p-4 cursor-pointer border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors
                      ${item.checked ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'}
                    `}
                  >
                    <div className={`
                      w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center transition-all duration-300
                      ${item.checked ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'}
                    `}>
                      {item.checked && <CheckCircle2 size={14} className="text-white" />}
                    </div>
                    <div className="flex-1">
                      <div className={`font-medium text-slate-800 transition-all ${item.checked ? 'text-slate-400 line-through' : ''}`}>
                        {item.name}
                      </div>
                      <div className="text-xs text-slate-400">
                        {getAmount(item)} • {item.category}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {shoppingList.some(i => i.checked) && (
          <div className="fixed bottom-24 right-6 animate-in zoom-in duration-300">
            <button 
              onClick={clearCheckedItems}
              className="bg-red-50 text-red-600 border border-red-100 shadow-lg px-4 py-3 rounded-full font-medium flex items-center hover:bg-red-100 transition-colors"
            >
              <Trash2 size={18} className="mr-2" />
              Clear Checked
            </button>
          </div>
        )}
      </div>
    );
  };

  const RecipesGrid = () => (
    <div className="pb-24 p-6 bg-slate-50/50 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Discover</h1>
          <p className="text-slate-500">What are we cooking today?</p>
        </div>
        <div className="flex gap-4 items-center">
          <HeaderToggle />
          <div className="w-10 h-10 bg-slate-200 rounded-full overflow-hidden border-2 border-white shadow-sm">
             <div className="w-full h-full bg-gradient-to-tr from-emerald-400 to-cyan-500" />
          </div>
        </div>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Search recipes, ingredients..." 
          className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {INITIAL_RECIPES.map(recipe => (
          <RecipeCard 
            key={recipe.id} 
            recipe={recipe} 
            selectedCount={selectedRecipes[recipe.id]}
            onToggleSelect={toggleRecipeSelection}
            onUpdateCount={updateServingCount}
          />
        ))}
      </div>
      
      {Object.keys(selectedRecipes).length > 0 && (
        <div className="fixed bottom-24 left-6 right-6 animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-2xl flex items-center justify-between">
             <div className="pl-2">
               <span className="font-bold text-emerald-400">{Object.keys(selectedRecipes).length}</span>
               <span className="text-slate-300 ml-1">recipes selected</span>
             </div>
             <Button onClick={addSelectedRecipesToShopping} className="bg-emerald-500 hover:bg-emerald-400 text-white py-2 px-4 text-sm shadow-none">
               Add Ingredients
             </Button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white min-h-screen font-sans text-slate-900 mx-auto max-w-md md:max-w-full relative shadow-2xl md:shadow-none overflow-hidden">
      
      {selectedRecipe ? (
        <RecipeDetail recipe={selectedRecipe} />
      ) : activeTab === 'recipes' ? (
        <RecipesGrid />
      ) : (
        <ShoppingList />
      )}

      {!selectedRecipe && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 flex justify-around p-3 pb-6 z-50">
          <button 
            onClick={() => setActiveTab('recipes')}
            className={`flex flex-col items-center p-2 rounded-xl transition-all ${activeTab === 'recipes' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            <ChefHat size={24} className="mb-1" />
            <span className="text-[10px] font-bold uppercase tracking-wide">Recipes</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('shopping')}
            className={`flex flex-col items-center p-2 rounded-xl transition-all ${activeTab === 'shopping' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            <div className="relative">
              <ShoppingCart size={24} className="mb-1" />
              {shoppingList.length > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center border-2 border-white">
                  {shoppingList.length}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wide">Shop</span>
          </button>
        </div>
      )}
    </div>
  );
}
