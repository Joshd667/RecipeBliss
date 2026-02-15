// Filter utility functions

/**
 * Extract all unique tags from recipe collection
 * @param {Array} recipes - Array of recipe objects
 * @returns {Array} - Sorted array of unique tags
 */
export function getAllUniqueTags(recipes) {
  const tagSet = new Set();
  recipes.forEach(recipe => {
    if (recipe.tags && Array.isArray(recipe.tags)) {
      recipe.tags.forEach(tag => tagSet.add(tag));
    }
  });
  return Array.from(tagSet).sort();
}

/**
 * Calculate total time in minutes from recipe
 * @param {Object} recipe - Recipe object with prepTime and cookTime
 * @returns {number} - Total time in minutes, or null if no time data available
 */
export function calculateTotalTime(recipe) {
  const parseTime = (timeStr) => {
    if (!timeStr) return 0;
    const match = timeStr.match(/(\d+)\s*min/i);
    return match ? parseInt(match[1]) : 0;
  };
  
  const prepMins = parseTime(recipe.prepTime);
  const cookMins = parseTime(recipe.cookTime);
  const total = prepMins + cookMins;
  
  // Return null if no time data available
  return total > 0 ? total : null;
}

/**
 * Filter recipes based on active filters
 * @param {Array} recipes - Array of recipe objects
 * @param {Object} filters - Filter criteria object
 * @returns {Array} - Filtered array of recipes
 */
export function filterRecipes(recipes, filters) {
  return recipes.filter(recipe => {
    // Difficulty filter
    if (filters.difficulty && filters.difficulty.length > 0) {
      if (!filters.difficulty.includes(recipe.difficulty)) {
        return false;
      }
    }
    
    // Cooking style filter
    if (filters.cookingStyle && filters.cookingStyle.length > 0) {
      if (!filters.cookingStyle.includes(recipe.cookingStyle)) {
        return false;
      }
    }
    
    // Tags filter (recipe must have at least one of the selected tags)
    if (filters.tags && filters.tags.length > 0) {
      if (!recipe.tags || !recipe.tags.some(tag => filters.tags.includes(tag))) {
        return false;
      }
    }
    
    // Time range filter (skip recipes without time data)
    if (filters.timeRange) {
      const totalTime = calculateTotalTime(recipe);
      if (totalTime !== null && (totalTime < filters.timeRange[0] || totalTime > filters.timeRange[1])) {
        return false;
      }
    }
    
    // Calorie range filter
    if (filters.calorieRange && recipe.calories) {
      if (recipe.calories < filters.calorieRange[0] || recipe.calories > filters.calorieRange[1]) {
        return false;
      }
    }
    
    // Category filter
    if (filters.categories && filters.categories.length > 0) {
      if (!filters.categories.includes(recipe.category)) {
        return false;
      }
    }
    
    return true;
  });
}

/**
 * Get count of active filters
 * @param {Object} filters - Filter criteria object
 * @returns {number} - Count of active filters
 */
export function getActiveFilterCount(filters) {
  let count = 0;
  
  if (filters.difficulty && filters.difficulty.length > 0) count++;
  if (filters.cookingStyle && filters.cookingStyle.length > 0) count++;
  if (filters.tags && filters.tags.length > 0) count++;
  if (filters.categories && filters.categories.length > 0) count++;
  
  // Check if time range is not default (0-180)
  if (filters.timeRange && (filters.timeRange[0] > 0 || filters.timeRange[1] < 180)) count++;
  
  // Check if calorie range is not default (0-1000)
  if (filters.calorieRange && (filters.calorieRange[0] > 0 || filters.calorieRange[1] < 1000)) count++;
  
  return count;
}
