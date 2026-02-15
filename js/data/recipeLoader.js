// Recipe data loader

const RECIPE_FILES = [
  'creamy-chicken-rice-casserole.json',
  'smoked-chorizo-beef-chilli.json',
  'vegetarian-pastel-azteca.json',
  'nasu-buta-miso-yaki.json',
  'pulled-tamarind-chicken.json',
  'bahian-coconut-lime-fish.json',
  'perfect-fluffy-rice.json',
  'zesty-chilli-lime-dressing.json',
  'house-blend-fajita-seasoning.json'
];

/**
 * Load all recipe JSON files
 * @returns {Promise<Array>} - Array of recipe objects
 */
export async function loadAllRecipes() {
  try {
    const promises = RECIPE_FILES.map(filename =>
      fetch(`recipes/${filename}`).then(res => res.json())
    );
    const recipes = await Promise.all(promises);
    return recipes;
  } catch (error) {
    console.error('Error loading recipes:', error);
    return [];
  }
}
