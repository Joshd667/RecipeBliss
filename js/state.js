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
  recipes: [],
  filters: {
    difficulty: [],
    cookingStyle: [],
    tags: [],
    minRating: 0,
    timeRange: [0, 180],
    calorieRange: [0, 1000],
    categories: []
  },
  showFilterPanel: false,
  showSettings: false,
  searchQuery: '',
  darkModePreference: 'system', // 'light' | 'dark' | 'system'
  favorites: [], // Array of recipe IDs
  ratings: {}, // Map of recipe ID -> rating (1-5)
  comments: {} // Map of recipe ID -> array of { text, date, rating }
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
  savePersistableState();
  if ('darkModePreference' in updates) {
    applyDarkMode();
  }
  notifyListeners();
}

/**
 * Update state without triggering listeners (for internal optimizations)
 * @param {Object} updates - Partial state updates
 */
export function setStateQuiet(updates) {
  Object.assign(state, updates);
  savePersistableState();
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
 * Apply dark mode based on preference
 */
export function applyDarkMode() {
  const pref = state.darkModePreference;
  let shouldBeDark = false;
  if (pref === 'dark') {
    shouldBeDark = true;
  } else if (pref === 'system') {
    shouldBeDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  document.body.classList.toggle('dark-mode', shouldBeDark);
}

/**
 * Save persistable state to localStorage
 */
function savePersistableState() {
  const persistableState = {
    shoppingList: state.shoppingList,
    selectedRecipes: state.selectedRecipes,
    sortMode: state.sortMode,
    useMetric: state.useMetric,
    darkModePreference: state.darkModePreference,
    favorites: state.favorites,
    ratings: state.ratings,
    comments: state.comments
  };
  try {
    localStorage.setItem('recipebliss-state', JSON.stringify(persistableState));
  } catch (error) {
    console.warn('Failed to save state to localStorage:', error);
  }
}

/**
 * Initialize state with recipes and handle URL parameters
 * @param {Array} recipes - Array of recipe objects
 * @returns {Object} - Object with urlParams if any were found
 */
export function initState(recipes) {
  // Restore saved state from localStorage
  try {
    const savedState = localStorage.getItem('recipebliss-state');
    if (savedState) {
      const parsed = JSON.parse(savedState);
      if (parsed.shoppingList) state.shoppingList = parsed.shoppingList;
      if (parsed.selectedRecipes) state.selectedRecipes = parsed.selectedRecipes;
      if (parsed.sortMode) state.sortMode = parsed.sortMode;
      if (typeof parsed.useMetric === 'boolean') state.useMetric = parsed.useMetric;
      if (parsed.darkModePreference) state.darkModePreference = parsed.darkModePreference;
      if (parsed.favorites) state.favorites = parsed.favorites;
      if (parsed.ratings) state.ratings = parsed.ratings;
      if (parsed.comments) state.comments = parsed.comments;
    }
  } catch (error) {
    console.warn('Failed to restore state from localStorage:', error);
  }

  // Apply dark mode from saved preference
  applyDarkMode();

  // Listen for system theme changes when preference is 'system'
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (state.darkModePreference === 'system') {
        applyDarkMode();
      }
    });
  }

  state.recipes = recipes;

  // Check for URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const recipeParam = urlParams.get('recipe');
  const basketParam = urlParams.get('basket');
  const sharedRecipeParam = urlParams.get('shared_recipe');

  const result = {};
  if (recipeParam) result.recipe = recipeParam;
  if (basketParam) result.basket = basketParam;
  if (sharedRecipeParam) result.sharedRecipe = sharedRecipeParam;

  notifyListeners();

  return result;
}
