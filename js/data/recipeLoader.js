// Recipe data loader

/**
 * Load all recipe JSON files
 * @returns {Promise<Array>} - Array of recipe objects
 */
export async function loadAllRecipes() {
  try {
    // Fetch the recipe index manifest
    const indexResponse = await fetch('recipes/index.json');
    if (!indexResponse.ok) {
      throw new Error(`Failed to load recipe index: ${indexResponse.status}`);
    }
    const recipeFiles = await indexResponse.json();
    
    if (!Array.isArray(recipeFiles)) {
      throw new Error('Recipe index must be an array of filenames');
    }
    
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
