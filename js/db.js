// IndexedDB management using Dexie.js
const db = new Dexie('RecipeBlissDB');

// Define schema
db.version(1).stores({
    recipes: '++id, title, category' // Primary key and indexed properties
});

/**
 * Initialize database
 */
export async function initDB() {
    try {
        await db.open();
        console.log('RecipeBlissDB initialized');
    } catch (error) {
        console.error('Failed to open database:', error);
    }
}

/**
 * Get all user-created recipes
 * @returns {Promise<Array>} Array of recipe objects
 */
export async function getAllUserRecipes() {
    try {
        return await db.recipes.toArray();
    } catch (error) {
        console.error('Failed to get recipes:', error);
        return [];
    }
}

/**
 * Add or update a recipe
 * @param {Object} recipe - Recipe object
 * @returns {Promise<number>} Recipe ID
 */
export async function saveRecipe(recipe) {
    try {
        // Ensure recipe has an ID (use timestamp if new)
        if (!recipe.id) {
            recipe.id = Date.now();
        }

        // Add metadata
        if (!recipe.createdAt) {
            recipe.createdAt = new Date().toISOString();
        }
        recipe.updatedAt = new Date().toISOString();

        // Mark as user-created
        recipe.isUserCreated = true;

        await db.recipes.put(recipe);
        return recipe.id;
    } catch (error) {
        console.error('Failed to save recipe:', error);
        throw error;
    }
}

/**
 * Delete a recipe
 * @param {number} id - Recipe ID
 */
export async function deleteRecipe(id) {
    try {
        await db.recipes.delete(id);
    } catch (error) {
        console.error('Failed to delete recipe:', error);
        throw error;
    }
}
