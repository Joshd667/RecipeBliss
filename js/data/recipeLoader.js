// Recipe data loader

/**
 * Load all recipe JSON files
 * @returns {Promise<Array>} - Array of recipe objects
 */
export async function loadAllRecipes() {
  try {
    // Fetch the recipe index manifest
    const indexResponse = await fetch('recipes/index.json');
    const recipeFiles = await indexResponse.json();
    
    // Fetch all recipe JSON files
    const promises = recipeFiles.map(filename =>
      fetch(`recipes/${filename}`).then(res => res.json())
    );
    const recipes = await Promise.all(promises);
    return recipes;
  } catch (error) {
    console.error('Error loading recipes:', error);
    return [];
  }
}
