// Main application entry point
import { loadAllRecipes } from './data/recipeLoader.js';
import { getState, setState, subscribe, initState } from './state.js';
import { renderRecipesGrid, renderSettingsPage } from './views/grid.js';
import { renderRecipeDetail } from './views/detail.js';
import { renderShoppingList } from './views/shopping.js';
import { renderAddRecipeView } from './views/add.js';
import { initDB, getAllUserRecipes, saveRecipe } from './db.js';
import { createIcon } from './components/ui.js';
import { escapeHtml } from './utils/helpers.js';
import { decodeBasket, decodeRecipe, clearUrlParams } from './utils/sharing.js';

/**
 * Initialize the application
 */
async function init() {
  try {
    // Load recipes
    // Initialize DB and load user recipes
    await initDB();
    const userRecipes = await getAllUserRecipes();

    // Load default recipes
    const defaultRecipes = await loadAllRecipes();

    // Merge recipes
    const allRecipes = [...defaultRecipes, ...userRecipes];

    const urlParams = initState(allRecipes);

    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('./sw.js');
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }

    // Subscribe to state changes
    subscribe(render);

    // Handle URL parameters
    if (urlParams.recipe) {
      // Auto-open recipe from URL
      const recipeId = parseInt(urlParams.recipe);
      const recipe = allRecipes.find(r => r.id === recipeId);
      if (recipe) {
        setState({
          selectedRecipe: recipe,
          recipeViewMode: 'overview',
          currentStepIndex: 0
        });
      }
      clearUrlParams();
    } else if (urlParams.basket) {
      // Show basket import modal
      showBasketImportModal(urlParams.basket);
      clearUrlParams();
    } else if (urlParams.sharedRecipe) {
      // Show recipe import modal
      showRecipeImportModal(urlParams.sharedRecipe);
      clearUrlParams();
    }

    // Initial render
    render();

    // Render bottom navigation
    renderBottomNav();

  } catch (error) {
    console.error('Failed to initialize app:', error);
    document.getElementById('app').innerHTML = `
      <div class="error-state">
        <h2>Failed to load recipes</h2>
        <p>Please refresh the page to try again.</p>
      </div>
    `;
  }
}

/**
 * Main render function - routes to appropriate view
 */
function render() {
  const state = getState();

  if (state.showSettings) {
    renderSettingsPage();
    hideBottomNav();
  } else if (state.selectedRecipe) {
    renderRecipeDetail();
    hideBottomNav();
  } else if (state.activeTab === 'recipes' || state.activeTab === 'favorites') {
    renderRecipesGrid();
    showBottomNav();
  } else if (state.activeTab === 'add') {
    renderAddRecipeView();
    showBottomNav();
  } else if (state.activeTab === 'settings') {
    renderSettingsPage();
    showBottomNav();
  } else {
    renderShoppingList();
    showBottomNav();
  }
}

/**
 * Render bottom navigation tabs
 */
function renderBottomNav() {
  const nav = document.createElement('div');
  nav.id = 'bottom-nav';
  nav.className = 'bottom-nav';

  // Recipes tab
  const recipesTab = createTab({
    id: 'recipes',
    icon: 'ChefHat',
    label: 'Recipes'
  });
  nav.appendChild(recipesTab);

  // Favorites tab
  const favoritesTab = createTab({
    id: 'favorites',
    icon: 'Heart',
    label: 'Favorites'
  });
  nav.appendChild(favoritesTab);

  // Add Recipe tab
  const addTab = createTab({
    id: 'add',
    icon: 'Plus',
    label: 'Add'
  });
  nav.appendChild(addTab);

  // Shopping tab
  const shoppingTab = createTab({
    id: 'shopping',
    icon: 'ShoppingCart',
    label: 'Shop',
    showBadge: true
  });
  nav.appendChild(shoppingTab);

  // Settings tab
  const settingsTab = createTab({
    id: 'settings',
    icon: 'Settings',
    label: 'Settings'
  });
  nav.appendChild(settingsTab);

  document.body.appendChild(nav);
}

/**
 * Create navigation tab
 */
function createTab({ id, icon, label, showBadge = false }) {
  const state = getState();
  const tab = document.createElement('button');
  tab.className = `nav-tab ${state.activeTab === id ? 'active' : ''}`;
  tab.onclick = () => setState({ activeTab: id });

  const iconContainer = document.createElement('div');
  iconContainer.className = 'nav-tab-icon-container';

  iconContainer.appendChild(createIcon(icon, 24));

  // Always create badge element when showBadge is true
  if (showBadge) {
    const badge = document.createElement('span');
    badge.className = 'nav-badge';
    if (state.shoppingList.length > 0) {
      badge.classList.add('visible');
      badge.textContent = state.shoppingList.length;
    }
    iconContainer.appendChild(badge);
  }

  tab.appendChild(iconContainer);

  const labelEl = document.createElement('span');
  labelEl.className = 'nav-tab-label';
  labelEl.textContent = label;
  tab.appendChild(labelEl);

  return tab;
}

/**
 * Update bottom navigation state
 */
function updateBottomNav() {
  const state = getState();
  const nav = document.getElementById('bottom-nav');
  if (!nav) return;

  // Update active state
  nav.querySelectorAll('.nav-tab').forEach((tab, index) => {
    // 0: Recipes, 1: Favorites, 2: Add, 3: Shop, 4: Settings
    let tabId;
    if (index === 0) tabId = 'recipes';
    else if (index === 1) tabId = 'favorites';
    else if (index === 2) tabId = 'add';
    else if (index === 3) tabId = 'shopping';
    else tabId = 'settings';

    if (tabId === state.activeTab) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });

  // Update shopping badge
  const badge = nav.querySelector('.nav-badge');
  if (badge) {
    if (state.shoppingList.length > 0) {
      badge.textContent = state.shoppingList.length;
      badge.classList.add('visible');
    } else {
      badge.classList.remove('visible');
    }
  }
}

/**
 * Show bottom navigation
 */
function showBottomNav() {
  const nav = document.getElementById('bottom-nav');
  if (nav) {
    nav.style.display = 'flex';
    updateBottomNav();
  }
}

/**
 * Hide bottom navigation
 */
function hideBottomNav() {
  const nav = document.getElementById('bottom-nav');
  if (nav) nav.style.display = 'none';
}

/**
 * Show basket import modal
 * @param {string} encodedBasket - Encoded basket data from URL
 */
async function showBasketImportModal(encodedBasket) {
  const decodedData = await decodeBasket(encodedBasket);

  if (!decodedData) {
    alert('Invalid basket link. Please check the URL and try again.');
    return;
  }

  // Create modal overlay
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content basket-import-modal">
      <div class="modal-header">
        <h2>Import Shopping List</h2>
        <button class="modal-close-btn">${createIcon('X', 24).outerHTML}</button>
      </div>
      <div class="modal-body">
        <p class="import-message">
          ${createIcon('ShoppingCart', 20).outerHTML}
          <span>A shared shopping list with ${decodedData.items.length} items has been found.</span>
        </p>
        <p class="import-subtitle">What would you like to do?</p>
      </div>
      <div class="modal-actions import-actions">
        <button class="btn btn-outline import-btn" data-action="add">
          ${createIcon('Plus', 18).outerHTML}
          <span>Add to Current</span>
        </button>
        <button class="btn btn-primary import-btn" data-action="replace">
          ${createIcon('Download', 18).outerHTML}
          <span>Replace Basket</span>
        </button>
        <button class="btn btn-secondary import-btn" data-action="ignore">
          <span>Ignore</span>
        </button>
      </div>
    </div>
  `;

  // Add event listeners
  const closeBtn = modal.querySelector('.modal-close-btn');
  closeBtn.onclick = () => document.body.removeChild(modal);

  const importBtns = modal.querySelectorAll('.import-btn');
  importBtns.forEach(btn => {
    btn.onclick = () => {
      const action = btn.getAttribute('data-action');
      handleBasketImport(action, decodedData);
      document.body.removeChild(modal);
    };
  });

  // Close on overlay click
  modal.onclick = (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  };

  document.body.appendChild(modal);
}

/**
 * Handle basket import action
 * @param {string} action - 'add', 'replace', or 'ignore'
 * @param {Object} decodedData - Decoded basket data
 */
function handleBasketImport(action, decodedData) {
  const state = getState();

  if (action === 'add') {
    // Add to current basket
    setState({
      shoppingList: [...state.shoppingList, ...decodedData.items],
      activeTab: 'shopping'
    });
  } else if (action === 'replace') {
    // Replace current basket
    setState({
      shoppingList: decodedData.items,
      selectedRecipes: decodedData.selectedRecipes,
      useMetric: decodedData.useMetric,
      activeTab: 'shopping'
    });
  }
  // If 'ignore', do nothing
}

/**
 * Show recipe import modal
 */
async function showRecipeImportModal(encodedString) {
  const recipe = await decodeRecipe(encodedString);

  if (!recipe) {
    alert('Invalid recipe link. The link might be broken or expired.');
    return;
  }

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content basket-import-modal">
      <div class="modal-header">
        <h2>Import Shared Recipe</h2>
        <button class="modal-close-btn">${createIcon('X', 24).outerHTML}</button>
      </div>
      <div class="modal-body">
        <p class="import-message">
          ${createIcon('ChefHat', 20).outerHTML}
          <span>Recipe found: <strong>${escapeHtml(recipe.title)}</strong></span>
        </p>
        <p class="import-subtitle">Would you like to add this recipe to your collection?</p>
      </div>
      <div class="modal-actions import-actions">
        <button class="btn btn-primary import-btn" data-action="add">
          ${createIcon('Download', 18).outerHTML}
          <span>Add to My Recipes</span>
        </button>
        <button class="btn btn-outline import-btn" data-action="view">
          ${createIcon('Eye', 18).outerHTML}
          <span>View Only</span>
        </button>
        <button class="btn btn-secondary import-btn" data-action="ignore">
          <span>Ignore</span>
        </button>
      </div>
    </div>
  `;

  // Add event listeners
  const closeBtn = modal.querySelector('.modal-close-btn');
  closeBtn.onclick = () => document.body.removeChild(modal);

  const importBtns = modal.querySelectorAll('.import-btn');
  importBtns.forEach(btn => {
    btn.onclick = async () => {
      const action = btn.getAttribute('data-action');
      document.body.removeChild(modal);

      if (action === 'add') {
        try {
          // Save and open
          const id = await saveRecipe(recipe);
          recipe.id = id;
          const state = getState();
          setState({
            recipes: [...state.recipes, recipe],
            selectedRecipe: recipe
          });
        } catch (e) {
          console.error(e);
          alert('Failed to save recipe');
        }
      } else if (action === 'view') {
        // Just open
        setState({ selectedRecipe: recipe });
      }
    };
  });

  // Close on overlay click
  modal.onclick = (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  };

  document.body.appendChild(modal);
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
