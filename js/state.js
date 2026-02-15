// Central state management with pub/sub pattern

const state = {
  activeTab: 'recipes',
  selectedRecipe: null,
  shoppingList: [],
  sortMode: 'aisle',
  useMetric: false,
  selectedRecipes: {},
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
  
  // Save persistable state to localStorage
  const persistableState = {
    shoppingList: state.shoppingList,
    selectedRecipes: state.selectedRecipes,
    sortMode: state.sortMode,
    useMetric: state.useMetric
  };
  try {
    localStorage.setItem('recipebliss-state', JSON.stringify(persistableState));
  } catch (error) {
    console.warn('Failed to save state to localStorage:', error);
  }
  
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
  // Restore saved state from localStorage
  try {
    const savedState = localStorage.getItem('recipebliss-state');
    if (savedState) {
      const parsed = JSON.parse(savedState);
      // Only restore persistable state properties
      if (parsed.shoppingList) state.shoppingList = parsed.shoppingList;
      if (parsed.selectedRecipes) state.selectedRecipes = parsed.selectedRecipes;
      if (parsed.sortMode) state.sortMode = parsed.sortMode;
      if (typeof parsed.useMetric === 'boolean') state.useMetric = parsed.useMetric;
    }
  } catch (error) {
    console.warn('Failed to restore state from localStorage:', error);
  }
  
  state.recipes = recipes;
  notifyListeners();
}
