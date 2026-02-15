// Central state management with pub/sub pattern

const state = {
  activeTab: 'recipes',
  selectedRecipe: null,
  shoppingList: [],
  sortMode: 'aisle',
  useMetric: false,
  selectedRecipes: {},
  installPrompt: null,
  recipeViewMode: 'overview',
  currentStepIndex: 0,
  recipes: []
};

const listeners = [];

/**
 * Get current state
 * @returns {Object} - Current state object
 */
export function getState() {
  return state;
}

/**
 * Update state and notify listeners
 * @param {Object} updates - Partial state updates
 */
export function setState(updates) {
  Object.assign(state, updates);
  notifyListeners();
}

/**
 * Subscribe to state changes
 * @param {Function} listener - Callback function
 * @returns {Function} - Unsubscribe function
 */
export function subscribe(listener) {
  listeners.push(listener);
  return () => {
    const index = listeners.indexOf(listener);
    if (index > -1) listeners.splice(index, 1);
  };
}

/**
 * Notify all listeners of state change
 */
function notifyListeners() {
  listeners.forEach(listener => listener(state));
}

/**
 * Initialize state with recipes
 * @param {Array} recipes - Array of recipe objects
 */
export function initState(recipes) {
  state.recipes = recipes;
  notifyListeners();
}
